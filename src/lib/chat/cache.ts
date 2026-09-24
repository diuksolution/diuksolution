import {
  cacheDel,
  cacheDelPrefix,
  cacheGet,
  cacheIncr,
  remember,
} from "@/lib/cache/store";

const INBOX_TTL_MS = 8_000;
const MESSAGES_TTL_MS = 6_000;
const UNREAD_TTL_MS = 8_000;

function revKey(businessId: string) {
  return `chat:rev:${businessId}`;
}

function convRevKey(conversationId: string) {
  return `chat:crev:${conversationId}`;
}

function inboxKey(businessId: string, variant: string) {
  return `chat:inbox:${businessId}:${variant}`;
}

function unreadKey(businessId: string) {
  return `chat:unread:${businessId}`;
}

function messagesKey(businessId: string, conversationId: string) {
  return `chat:msgs:${businessId}:${conversationId}`;
}

export async function getChatRevision(businessId: string) {
  return (await cacheGet<number>(revKey(businessId))) ?? 0;
}

export async function getConversationRevision(conversationId: string) {
  return (await cacheGet<number>(convRevKey(conversationId))) ?? 0;
}

export async function invalidateChatCache(
  businessId: string,
  conversationId?: string | null,
) {
  await cacheIncr(revKey(businessId));
  await cacheDelPrefix(`chat:inbox:${businessId}:`);
  await cacheDel(unreadKey(businessId));

  if (conversationId) {
    await cacheIncr(convRevKey(conversationId));
    await cacheDel(messagesKey(businessId, conversationId));
  } else {
    await cacheDelPrefix(`chat:msgs:${businessId}:`);
  }
}

export async function rememberInbox<T>(
  businessId: string,
  variant: string,
  loader: () => Promise<T>,
) {
  return remember(inboxKey(businessId, variant), INBOX_TTL_MS, loader);
}

export async function rememberMessages<T>(
  businessId: string,
  conversationId: string,
  loader: () => Promise<T>,
) {
  return remember(
    messagesKey(businessId, conversationId),
    MESSAGES_TTL_MS,
    loader,
  );
}

export async function rememberUnread(
  businessId: string,
  loader: () => Promise<number>,
) {
  return remember(unreadKey(businessId), UNREAD_TTL_MS, loader);
}
