type CacheEntry = {
  value: unknown;
  exp: number;
};

type CacheBackend = {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlMs: number): Promise<void>;
  del(...keys: string[]): Promise<void>;
  delPrefix(prefix: string): Promise<void>;
  incr(key: string): Promise<number>;
};

const memory = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

function read(key: string) {
  const row = memory.get(key);
  if (!row) {
    return null;
  }
  if (row.exp > 0 && row.exp < Date.now()) {
    memory.delete(key);
    return null;
  }
  return row;
}

const memoryBackend: CacheBackend = {
  async get<T>(key: string) {
    const row = read(key);
    return row ? (row.value as T) : null;
  },
  async set<T>(key: string, value: T, ttlMs: number) {
    memory.set(key, {
      value,
      exp: ttlMs > 0 ? Date.now() + ttlMs : 0,
    });
  },
  async del(...keys: string[]) {
    for (const key of keys) {
      memory.delete(key);
    }
  },
  async delPrefix(prefix: string) {
    for (const key of memory.keys()) {
      if (key.startsWith(prefix)) {
        memory.delete(key);
      }
    }
  },
  async incr(key: string) {
    const current = (await this.get<number>(key)) ?? 0;
    const next = current + 1;
    memory.set(key, { value: next, exp: 0 });
    return next;
  },
};

let backendPromise: Promise<CacheBackend> | null = null;

function restCredentials() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    process.env.KV_REST_API_URL?.trim() ||
    null;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
    process.env.KV_REST_API_TOKEN?.trim() ||
    null;
  return url && token ? { url, token } : null;
}

async function loadUpstashBackend(): Promise<CacheBackend | null> {
  const creds = restCredentials();
  if (!creds) {
    return null;
  }

  const { Redis } = await import("@upstash/redis");
  const redis = new Redis(creds);

  return {
    async get<T>(key: string) {
      const value = await redis.get<T>(key);
      return value ?? null;
    },
    async set<T>(key: string, value: T, ttlMs: number) {
      if (ttlMs > 0) {
        await redis.set(key, value, { px: ttlMs });
      } else {
        await redis.set(key, value);
      }
    },
    async del(...keys: string[]) {
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    },
    async delPrefix(prefix: string) {
      const keys = await redis.keys(`${prefix}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    },
    async incr(key: string) {
      return redis.incr(key);
    },
  };
}

async function loadBackend(): Promise<CacheBackend> {
  try {
    const upstash = await loadUpstashBackend();
    if (upstash) {
      return upstash;
    }
  } catch (error) {
    console.warn("[cache] Upstash Redis unavailable; trying REDIS_URL", error);
  }

  const url = process.env.REDIS_URL?.trim();
  if (!url) {
    return memoryBackend;
  }

  try {
    const mod = await import("ioredis");
    const Redis = mod.default;
    const redis = new Redis(url, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });

    return {
      async get<T>(key: string) {
        const raw = await redis.get(key);
        return raw ? (JSON.parse(raw) as T) : null;
      },
      async set<T>(key: string, value: T, ttlMs: number) {
        const payload = JSON.stringify(value);
        if (ttlMs > 0) {
          await redis.set(
            key,
            payload,
            "EX",
            Math.max(1, Math.ceil(ttlMs / 1000)),
          );
        } else {
          await redis.set(key, payload);
        }
      },
      async del(...keys: string[]) {
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      },
      async delPrefix(prefix: string) {
        const keys = await redis.keys(`${prefix}*`);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      },
      async incr(key: string) {
        return redis.incr(key);
      },
    };
  } catch (error) {
    console.warn(
      "[cache] REDIS_URL set but Redis is unavailable; using in-memory cache",
      error,
    );
    return memoryBackend;
  }
}

function backend() {
  backendPromise ??= loadBackend();
  return backendPromise;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  return (await backend()).get<T>(key);
}

export async function cacheSet<T>(key: string, value: T, ttlMs: number) {
  return (await backend()).set(key, value, ttlMs);
}

export async function cacheDel(...keys: string[]) {
  return (await backend()).del(...keys);
}

export async function cacheDelPrefix(prefix: string) {
  return (await backend()).delPrefix(prefix);
}

export async function cacheIncr(key: string) {
  return (await backend()).incr(key);
}

/** Redis-style GET-or-load. Concurrent callers share one loader. */
export async function remember<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
): Promise<T> {
  const hit = await cacheGet<T>(key);
  if (hit !== null && hit !== undefined) {
    return hit;
  }

  const existing = inflight.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const pending = loader()
    .then(async (value) => {
      await cacheSet(key, value, ttlMs);
      return value;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, pending);
  return pending;
}
