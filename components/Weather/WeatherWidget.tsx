import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";
import WeatherClient from "@/components/Weather/WeatherClient";
import kansokuIDsData from "@/public/list.json";
import { ForecastsItem, KansokuID } from "@/app/types"; // さっき作った方をインポート

export default async function Weather() {
  const Idlist = kansokuIDsData as KansokuID;
  const store = await cookies();
  const userId = store.get("user_id")?.value;

  let pref = "東京都";
  let area = "東京";

  if (userId) {
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
      select: { observationLocation: true },
    });
    if (settings?.observationLocation && Array.isArray(settings.observationLocation) && settings.observationLocation.length > 0) {
      const [p, a] = settings.observationLocation[0] as [string, string];
      pref = p;
      area = a;
    }
  }

  const cityCode = Idlist[pref]?.[area];
  if (!cityCode) return <div>観測地が見つかりません</div>;

  const url = `https://weather.tsukumijima.net/api/forecast/city/${cityCode}`;
  const res = await fetch(url, { cache: "no-cache" });
  const data = await res.json();
  const forecastsList: ForecastsItem[] = data.forecasts || [];
  const text: string = data.description.text.replace(/　+/g, '').replace(/\n+/g, '').replace(/【/g, '\n【').trim() || "";

  // 背景画像の判定ロジック
  let imageUrl: string = "/1718.jpg";
  const now = forecastsList[0].telop;
  if (now.includes("晴")) imageUrl = "/1718.jpg";
  else if (now.includes("曇")) imageUrl = "/1456.jpg";
  else if (now.includes("雨")) imageUrl = "/113.jpg";
  else if (now.includes("雪")) imageUrl = "/14808.jpg";

  // クライアントコンポーネントにデータを丸投げ
  return (
    <WeatherClient 
      forecastsList={forecastsList}
      text={text}
      title={data.title} 
      imageUrl={imageUrl} 
    />
  );
}