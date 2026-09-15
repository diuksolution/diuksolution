import { createHash } from "node:crypto";

function trimEnv(name: string) {
  return process.env[name]?.trim() || null;
}

export function getMidtransConfig() {
  const serverKey = trimEnv("MIDTRANS_SERVER_KEY");
  if (!serverKey) {
    return null;
  }

  const isProduction =
    (trimEnv("MIDTRANS_IS_PRODUCTION") || "false").toLowerCase() === "true";

  return {
    serverKey,
    clientKey: trimEnv("MIDTRANS_CLIENT_KEY"),
    isProduction,
    snapBaseUrl: isProduction
      ? "https://app.midtrans.com"
      : "https://app.sandbox.midtrans.com",
    apiBaseUrl: isProduction
      ? "https://api.midtrans.com"
      : "https://api.sandbox.midtrans.com",
  };
}

export function isMidtransConfigured() {
  return Boolean(getMidtransConfig());
}

function authHeader(serverKey: string) {
  return `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;
}

export type MidtransSnapResult = {
  token: string;
  redirectUrl: string;
};

export async function createMidtransSnapTransaction(input: {
  orderId: string;
  amount: number;
  customerName?: string | null;
  customerPhone?: string | null;
  itemName: string;
}) {
  const config = getMidtransConfig();
  if (!config) {
    throw new Error("Midtrans is not configured.");
  }

  const response = await fetch(`${config.snapBaseUrl}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      Authorization: authHeader(config.serverKey),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: input.orderId,
        gross_amount: input.amount,
      },
      item_details: [
        {
          id: "service",
          price: input.amount,
          quantity: 1,
          name: input.itemName.slice(0, 50),
        },
      ],
      customer_details: {
        first_name: (input.customerName || "Customer").slice(0, 50),
        phone: input.customerPhone
          ? `+${input.customerPhone.replace(/^\+/, "")}`
          : undefined,
      },
      enabled_payments: [
        "qris",
        "gopay",
        "shopeepay",
        "bca_va",
        "bni_va",
        "bri_va",
        "permata_va",
        "other_va",
      ],
    }),
  });

  const payload = (await response.json()) as {
    token?: string;
    redirect_url?: string;
    error_messages?: string[];
    status_message?: string;
  };

  if (!response.ok || !payload.token || !payload.redirect_url) {
    throw new Error(
      payload.error_messages?.join(", ") ||
        payload.status_message ||
        "Failed to create Midtrans Snap transaction.",
    );
  }

  return {
    token: payload.token,
    redirectUrl: payload.redirect_url,
  } satisfies MidtransSnapResult;
}

export type MidtransQrisResult = {
  transactionId: string;
  qrUrl: string | null;
  status: string;
};

export async function createMidtransQrisCharge(input: {
  orderId: string;
  amount: number;
  customerName?: string | null;
  customerPhone?: string | null;
  itemName: string;
}) {
  const config = getMidtransConfig();
  if (!config) {
    throw new Error("Midtrans is not configured.");
  }

  const response = await fetch(`${config.apiBaseUrl}/v2/charge`, {
    method: "POST",
    headers: {
      Authorization: authHeader(config.serverKey),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      payment_type: "qris",
      transaction_details: {
        order_id: input.orderId,
        gross_amount: input.amount,
      },
      item_details: [
        {
          id: "service",
          price: input.amount,
          quantity: 1,
          name: input.itemName.slice(0, 50),
        },
      ],
      customer_details: {
        first_name: (input.customerName || "Customer").slice(0, 50),
        phone: input.customerPhone
          ? `+${input.customerPhone.replace(/^\+/, "")}`
          : undefined,
      },
      qris: {
        acquirer: "gopay",
      },
    }),
  });

  const payload = (await response.json()) as {
    transaction_id?: string;
    transaction_status?: string;
    status_code?: string;
    status_message?: string;
    actions?: Array<{ name?: string; url?: string }>;
    qr_string?: string;
  };

  if (!response.ok || payload.status_code?.startsWith("4") || !payload.transaction_id) {
    throw new Error(
      payload.status_message || "Failed to create Midtrans QRIS charge.",
    );
  }

  const qrUrl =
    payload.actions?.find((action) =>
      (action.name || "").toLowerCase().includes("qr"),
    )?.url ||
    payload.actions?.[0]?.url ||
    null;

  return {
    transactionId: payload.transaction_id,
    qrUrl,
    status: payload.transaction_status || "pending",
  } satisfies MidtransQrisResult;
}

export function verifyMidtransSignature(input: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}) {
  const config = getMidtransConfig();
  if (!config) {
    return false;
  }

  const expected = createHash("sha512")
    .update(
      `${input.orderId}${input.statusCode}${input.grossAmount}${config.serverKey}`,
    )
    .digest("hex");
  return expected === input.signatureKey;
}
