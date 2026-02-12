import { prisma } from "../prisma";

type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
};

/* =========================
 * ① Token refresh
 * ========================= */
export async function refreshGoogleAccessToken(accountId: string) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account?.refreshToken) {
    throw new Error("No refresh_token");
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    grant_type: "refresh_token",
    refresh_token: account.refreshToken,
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error("Failed to refresh access token");
  }

  const data: GoogleTokenResponse = await res.json();

  const newExpiresAt =
    Math.floor(Date.now() / 1000) + data.expires_in;

  await prisma.account.update({
    where: { id: account.id },
    data: {
      accessToken: data.access_token,
      expiresAt: newExpiresAt,
      ...(data.refresh_token && {
        refreshToken: data.refresh_token,
      }),
    },
  });

  return data.access_token;
}

/* =========================
 * ②③ 有効な token を返す
 * ========================= */
export async function getValidGoogleAccessToken(userId: string) {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "google",
    },
  });

  if (!account) {
    throw new Error("Google account not found");
  }

  const now = Math.floor(Date.now() / 1000);

  if (account.expiresAt > now + 60) {
    return account.accessToken;
  }

  return await refreshGoogleAccessToken(account.id);
}
