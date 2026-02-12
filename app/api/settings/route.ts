import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";
import { UserSettings } from "@/app/types";

/* =========================
 * GET：設定取得
 * ========================= */
export async function GET() {
  const store = await cookies();
  const userId = store.get("user_id")?.value;
  const settings = await prisma.userSettings.findUnique({
  where: { userId },
});

return NextResponse.json({
  showWeather: settings?.showWeather ?? true,
  showCalendar: settings?.showCalendar ?? true,
  showNews: settings?.showNews ?? true,
  observationLocation: settings?.observationLocation ?? [],
  followMedia: settings?.followMedia ?? [],
});

}

/* =========================
 * PUT：設定更新
 * ========================= */
export async function PUT(req: Request) {
  const store = await cookies();
  const userId = store.get("user_id")?.value;
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body: UserSettings = await req.json();

  const updated = await prisma.userSettings.update({
    where: { userId },
    data: {
      showWeather: body.showWeather,
      showCalendar: body.showCalendar,
      showNews: body.showNews,
      observationLocation: body.observationLocation,
      followMedia: body.followMedia,
    },
  });

  return NextResponse.json(updated);
}
