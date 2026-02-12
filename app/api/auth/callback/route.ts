import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Missing code" },
        { status: 400 }
      );
    }

    /* =========================
     * ① トークン取得
     * ========================= */
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const token = await tokenRes.json();

    if (!token.access_token) {
      console.error("token error", token);
      return NextResponse.json(
        { error: "Failed to get access token" },
        { status: 401 }
      );
    }

    /* =========================
     * ② Google ユーザー情報取得
     * ========================= */
    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      }
    );

    const profile = await profileRes.json();

    if (!profile.id || !profile.email) {
      return NextResponse.json(
        { error: "Invalid profile" },
        { status: 400 }
      );
    }

    /* =========================
     * ③ User upsert
     * ========================= */
    const user = await prisma.user.upsert({
      where: { email: profile.email },
      update: {
        name: profile.name,
        avatarUrl: profile.picture,
      },
      create: {
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.picture,
        settings: {
          create: {
            observationLocation: [["東京都", "新宿"]],
            followMedia: [],
            showWeather: true,
            showCalendar: true,
            showNews: true,
          },
        },
      },
    });

    /* =========================
     * ④ Account upsert（最重要）
     * ========================= */
    await prisma.account.upsert({
      where: {
        account_provider_user_unique: {
          provider: "google",
          providerUserId: profile.id,
        },
      },
      update: {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresAt: token.expires_in,
        scope: token.scope,
      },
      create: {
        provider: "google",
        providerUserId: profile.id,
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresAt: token.expires_in,
        scope: token.scope,
        userId: user.id,
      },
    });


    /* =========================
     * ⑤ Cookie 保存
     * ========================= */
    const response = NextResponse.redirect(new URL("/", req.url));

    response.cookies.set("user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;

  } catch (err) {
    console.error("auth callback error", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
