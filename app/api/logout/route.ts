import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const store = await cookies();

  store.delete("access_token");
  store.delete("refresh_token");
  store.delete("user_id");

  // ✅ 絶対URLで redirect
  return NextResponse.redirect(new URL("/", req.url));
}

