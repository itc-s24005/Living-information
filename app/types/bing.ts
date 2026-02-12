// types/bing.ts
export interface BingResponse {
  images: {
    url: string;
    copyright: string;
    copyrightlink: string;
    title: string;
  }[];
}

// データの取得関数
export async function getBingWallpaper() {
  const res = await fetch(
    "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=ja-JP",
    { next: { revalidate: 3600 } } // 1時間キャッシュ
  );
  const data: BingResponse = await res.json();
  // フルURLを構築
  return {
    url: `https://www.bing.com${data.images[0].url}`,
    title: data.images[0].title,
    copyright: data.images[0].copyright,
    copyrightlink: data.images[0].copyrightlink,
  };
}