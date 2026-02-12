import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";
import { FollowMediaItem } from "@/app/types";
import { getBingWallpaper } from "@/app/types/bing";
import NewsClient from "./NewsClient";

async function newsio({ text }: { text?: string } = {}, { category }: { category?: string } = {}, { domain }: { domain?: string } = {}) {
  const apiKey = process.env.NEWSDATA_API_KEY!;
  const url = `https://newsdata.io/api/1/news?apikey=${apiKey}${text}&country=jp&language=ja&removeduplicate=1${category}${domain}&excludedomain=jp.investing.com,topics.smt.docomo.ne.jp&excludefield=ai_summary,ai_org,ai_region,sentiment_stats,sentiment,ai_tag,creator,keywords,source_priority,source_id,video_url,content,source_url,pubdate,pubdatetz`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  return data.results || [];
}

export default async function NewsWidget() {
  const wallpaper = await getBingWallpaper();
  const wallpaperUrl = [wallpaper.url, wallpaper.title, wallpaper.copyright, wallpaper.copyrightlink] as [string, string, string, string];
  /* cookie から userId 取得 */
  const store = await cookies();
  const userId = store.get("user_id")?.value;

  /* settings 初期値 */
  let followDomains: string[] = [];
  let observationLocation: [string, string][] = [];

  if (userId) {
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
      select: {
        followMedia: true,
        observationLocation: true,
      },
    });

    if (settings) {
      /* followMedia → domain 配列に変換 */
      followDomains = (settings.followMedia as FollowMediaItem[] ?? []).map(
        (m) => m.domain
      );

      /* 観測地 */
      observationLocation =
        (settings.observationLocation as [string, string][]) ?? [];
    }
    
  }

  /* ニュース取得（例：観測地を使うことも可能） */
  const local: string = observationLocation[0]?.[0] ?? "東京";
  const newsTop = await newsio({ text: "" }, { category: "&category=top"}, { domain: "" });
  const newsLocal = await newsio({ text: `&qInTitle=${local}` }, { category: ""}, { domain: "" });
  //const news2 = await newsio({ text: "&q=アニメ" }, { category: ""},  { domain: "" });
  const y = await Promise.all(followDomains.map((d) => newsio({ text: "" }, { category: ""},  { domain: `&domainurl=${d}` })));
  const newsList = [...newsTop];
  const followDomainsList = y.flat();

  return (
    <div style={{ marginTop: "18px", clear: "both" }}>
      <h1 style={{ fontSize: "40px", color: "black" }}>最新ニュース</h1>

      <NewsClient 
        wallpaperUrl={wallpaperUrl}
        newsTop={newsTop}
        newsLocal={newsLocal}
        newsList={newsList}
        followDomainsList={followDomainsList}
      />
    </div>
  );
}
