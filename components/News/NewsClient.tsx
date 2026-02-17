"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { NewsItem } from "../../app/types";
import { FollowMediaItem } from "@/app/types";

type Props = {
  wallpaperUrl: [string, string, string, string];
  newsTop: NewsItem[];
  newsLocal: NewsItem[];
  followDomainsList?: NewsItem[];
};

const MAX_FOLLOW = 5;

export default function NewsClient({ wallpaperUrl, newsTop, newsLocal, followDomainsList }: Props) {
  const [followMedia, setFollowMedia] = useState<FollowMediaItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  /* 初期フォロー状態取得 */
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setFollowMedia(data.followMedia ?? []);
      });
  }, []);

  /* フォロー済みドメイン一覧 */
  const followedDomains = useMemo(
    () => new Set(followMedia.map((m) => m.domain)),
    [followMedia]
  );

  /* フォロー上限判定 */
  const isLimitReached = followMedia.length >= MAX_FOLLOW;

  /* フォロー処理 */
  const follow = async (item: FollowMediaItem) => {
    if (followedDomains.has(item.domain)) return;
    if (isLimitReached) return;

    const next = [...followMedia, item];

    /* 即UI反映（楽観更新） */
    setFollowMedia(next);

    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        followMedia: next,
      }),
    });

    /* 失敗時は元に戻す */
    if (!res.ok) {
      setFollowMedia(followMedia);
    }

    setSaving(false);
  };




  //ーーーーーーーーーーーーーーーー
  //　　ニューススライドショー
  //ーーーーーーーーーーーーーーーー

  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const slideInterval = 5000; // スライド切り替え時間（ミリ秒）: ここで時間を調整できます

  // --- 3. アニメーション機能の制御 ---
  function resetTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }

  useEffect(() => {
    resetTimeout(); // 前回のタイマーをリセット

    if (!newsLocal || newsLocal.length <= 1) return; // 記事が1つ以下の場合はスライドしない

    // 一定時間後に次のスライドへインデックスを進める
    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === newsLocal.slice(0, 4).length - 1 ? 0 : prevIndex + 1
      );
    }, slideInterval);

    // クリーンアップ関数
    return () => {
      resetTimeout();
    };
  }, [currentIndex, newsLocal.slice(0, 4).length]); // currentIndexが変わるたびにタイマーを再設定


  // データがない場合の表示
  if (!newsLocal || newsLocal.length === 0) {
    return null; // または適切なプレースホルダーを表示
  }




  return (
    <div style={{ display: "flex", flexWrap: "wrap", color: "black" }}>

      {/*ーーーーーーーーーーーーーーーー
            トップニュースセクション 
      ーーーーーーーーーーーーーーーー*/}

      <div style={{ width: "695px", padding: "15px", height: "380px", margin: "15px 8px", border: "1px solid #808080", borderRadius: "30px", boxShadow: "0 1px 6px rgba(0,0,0,0.1)" }}>
        <h1 style={{ margin: "6px", fontSize: "22px" }}>トップニュース</h1>
        <div style={{ margin: "10px 0", display: "flex", alignItems: "center"}}>
          <div style={{ width: "387px", marginRight: "16px" }}>
            {newsTop.slice(0, 8).map((news) => {
              const isThisHovered = hoveredIndex === news.link;
              return (
                <div key={news.link + "TOP"} style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
                  <a href={news.link}>
                    <div style={{ margin: "4px 0", display: "flex", alignItems: "center" }}>
                      <img
                          src={news.source_icon ?? "/favicon.ico"}
                          alt="?"
                          style={{
                            marginRight: "5px",
                            width: "20px",
                            height: "20px",
                          }}
                        />
                      <h2 style={{ textDecoration: isThisHovered ? 'underline' : 'none' }} onMouseEnter={() => setHoveredIndex(news.link)} onMouseLeave={() => setHoveredIndex(null)}>{news.title.length > 22
                          ? news.title.slice(0, 21) + "..."
                          : news.title}
                      </h2>
                    </div>
                  </a>
                </div>
              )
            })}
          </div>
          <div style={{ width: "260px", margin: "0 0 0 auto", filter: isHovered ? "brightness(0.85)" : "none", backgroundColor: isHovered ? "#f8f8f8ff" : "transparent" }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <a href={wallpaperUrl[3]} target="_blank" rel="noopener noreferrer">
              <img src={wallpaperUrl[0]} alt={wallpaperUrl[1]} style={{ width: "260px" }} />
              <p style={{ marginTop: "13px", fontSize: "16px" }}>{wallpaperUrl[1]}</p>
              <p style={{ marginTop: "35px", fontSize: "14px", color: "#666", whiteSpace:"pre-wrap" }}>{wallpaperUrl[2]?.replace("(", "\n(")}</p>
            </a>
          </div>
        </div>

      </div>

      {/*ーーーーーーーーーーーーーーーー
            スライドショーセクション 
      ーーーーーーーーーーーーーーーー*/}

      <div
      style={{
        width: "695px",
        height: "380px",
        margin: "15px 8px",
        border: "1px solid #808080",
        borderRadius: "30px",
        overflow: "hidden", // 重要: はみ出たスライドを隠す
        position: "relative", // 重要: 子要素の絶対配置の基準点となる
        backgroundColor: "#000", // 画像ロード前の背景色
        boxShadow: "0 1px 6px rgba(0,0,0,0.1)"
      }}
    >
      {/* スライドを横に並べて動かすトラック部分 */}
      <div
        style={{
          display: "flex",
          height: "100%",
          width: `${newsTop.length * 100}%`, // 全スライドを横並びにした幅
          // 現在のインデックスに応じて横にスライドさせる
          // 例: 2番目のスライド(index 1)を表示する場合、全幅の(1/記事数)だけ左にずらす
          transform: `translateX(-${(currentIndex * 100) / newsTop.length}%)`,
          // 滑らかなアニメーションの設定
          transition: "transform 0.7s cubic-bezier(0.25, 0.8, 0.25, 1)",
        }}
      >
        {newsLocal.slice(0, 4).map((news, index) => {
          const isThisHovered = hoveredIndex === news.link;
          // 個々のスライドアイテム
          return (
            <div
              key={news.link + "_SLIDE_" + index}
              style={{
                // 親トラックの幅に対する相対的な幅を設定（実質的にウィジェット枠の100%になる）
                width: `${100 / newsTop.length}%`,
                height: "100%",
                position: "relative", // テキストオーバーレイの基準
                flexShrink: 0, // 幅が縮まないように固定
              }}
            >
            <a
              href={news.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
            >
              {/* --- 1. 画像をウィジェットいっぱいに広げて表示 --- */}
              {news.image_url ? (
                
                <img
                  src={`/api/image?url=${encodeURIComponent(news.image_url ?? "")}`}
                  alt={news.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover", // アスペクト比を維持しつつエリア全体を埋める
                    border: "none",
                    display: "block",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
                    filter: isThisHovered ? "brightness(0.8)" : "none"
                  }}
                  onMouseEnter={() => setHoveredIndex(news.link)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              ) : (
                // 画像がない場合のダミー表示
                 <div style={{width: "100%", height: "100%", backgroundColor: "#333"}} />
              )}

              {/* --- 2. メディアアイコン、タイトルを画像の上に重ねて下側に表示 --- */}
              <div
                style={{
                  position: "absolute", // 画像の上に重ねる
                  bottom: "0",          // 下揃え
                  left: "0",
                  width: "100%",
                  // 文字を読みやすくするためのグラデーション背景（下から上へ暗→透明）
                  background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0) 100%)",
                  padding: "30px 20px 20px", // テキスト周囲の余白
                  boxSizing: "border-box",
                  color: "#fff", // テキストカラーは白
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                {/* メディア情報ヘッダー */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                  {news.source_icon && (
                    <img
                      src={news.source_icon ?? "/favicon.ico"}
                      alt="?"
                      style={{
                        marginRight: "10px",
                        width: "28px",  // 元より少し大きくして視認性向上
                        height: "28px",
                        borderRadius: "50%", // 丸くする
                        backgroundColor: "rgba(255,255,255,0.9)", // 透明アイコンの背景確保
                        padding: "1px",
                        border: "1px solid rgba(0,0,0,0.1)"
                      }}
                    />
                  )}
                  <p style={{ fontSize: "16px" }}>{news.source_name}</p>
                </div>

                {/* 記事タイトル */}
                <h2
                  style={{
                    margin: 0,
                    fontSize: "24px", // 大きく目立たせる
                    fontWeight: "bold",
                    lineHeight: "1.3",
                    // 視認性を高めるテキストシャドウ
                    textShadow: "0px 1px 3px rgba(0,0,0,0.8)",
                    // 長すぎるタイトルを3行で省略表示する設定
                    display: "-webkit-box",
                    WebkitLineClamp: "3",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {news.title}
                </h2>
              </div>
            </a>
          </div>
        )})}
      </div>
      
      {/* おまけ：現在のスライド位置を示すドットインジケーター（右下） */}
      <div style={{ position: 'absolute', bottom: '15px', right: '20px', display: 'flex', gap: '6px', zIndex: 4 }}>
        {newsLocal.slice(0, 4).map((_, index) => (
            <div key={index} style={{
                width: '8px', height: '8px', borderRadius: '50%',
                // 現在のインデックスだけ白く、他は半透明
                backgroundColor: index === currentIndex ? '#fff' : 'rgba(255,255,255,0.3)',
                transition: 'background-color 0.3s',
                boxShadow: "0px 1px 2px rgba(0,0,0,0.3)"
            }} />
        ))}
      </div>

    </div>



      {/*ーーーーーーーーーーーーーーーー
            残りのローカルニュース 
      ーーーーーーーーーーーーーーーー*/}

      {newsLocal.slice(4).map((news) => {
        const domain = new URL(news.link).hostname;
        const isFollowed = followedDomains.has(domain);
        const disabled = isFollowed || isLimitReached || saving;
        const isThisHovered = hoveredIndex === news.link;

        return (
          <div
            key={news.link}
            style={{
              margin: "15px 8px",
              width: "339.5px",
              height: "380px",
              border: "0.1px solid #808080",
              borderRadius: "30px",
              position: "relative",
              boxShadow: isThisHovered ? "0 2px 10px rgba(0,0,0,0.2)" : "0 1px 6px rgba(0,0,0,0.1)",
            }}
            onMouseEnter={() => setHoveredIndex(news.link)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <a href={news.link}>
              <img
                src={`/api/image?url=${encodeURIComponent(news.image_url ?? "")}`}
                alt={news.title}
                style={{
                  width: "360px",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "29px 29px 0 0",
                }}
              />
              <div style={{ margin: "15px 18px 0" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={news.source_icon ?? "/favicon.ico"}
                    alt="?"
                    style={{
                      marginRight: "5px",
                      width: "23px",
                      height: "23px",
                    }}
                  />
                  <p style={{ fontSize: "16px" }}>{news.source_name}</p>
                </div>

                <h2
                  style={{
                    marginTop: "5px",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  {news.title.length > 35
                    ? news.title.slice(0, 34) + "..."
                    : news.title}
                </h2>
              </div>
            </a>

            {/* フォローボタン */}
            <button
              disabled={disabled}
              onClick={() =>
                follow({
                  name: news.source_name,
                  domain,
                  icon: news.source_icon ?? "",
                })
              }
              style={{
                position: "absolute",
                bottom: "14px",
                right: "16px",
                padding: "6px 12px",
                borderRadius: "16px",
                border: "none",
                cursor: disabled ? "not-allowed" : "pointer",
                backgroundColor: isFollowed
                  ? "#aaa"
                  : isLimitReached
                  ? "#ddd"
                  : "#0070f3",
                color: isFollowed || isLimitReached ? "#555" : "#fff",
                fontSize: "13px",
              }}
            >
              {isFollowed
                ? "フォロー中"
                : isLimitReached
                ? "上限に達しました"
                : "フォロー"}
            </button>
          </div>
        );
      })}
      


      {/*ーーーーーーーーーーーーーーーー
            お気に入りのニュース
      ーーーーーーーーーーーーーーーー*/}

      {followDomainsList?.map((news, index) => {
  // 50%の確率で「フルサイズ形式(isFullSize)」にする
  const isFullSize = index % 2 === 0 && index % 5 === 0;

  if (isFullSize) {
    // --- パターンA: 画像背景のフルサイズ形式 ---
    return (
      <div
        key={news.link + "follow"}
        style={{
          margin: "15px 8px",
          width: "695px", // カード形式と幅を合わせる場合
          height: "380px", // カード形式と高さを合わせる場合
          border: "1px solid #808080",
          borderRadius: "30px",
          position: "relative",
          overflow: "hidden", // 画像のはみ出しを防ぐ
          flexShrink: 0,
        }}
      >
        <a
          href={news.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
        >
          {news.image_url ? (
            <img
              src={`/api/image?url=${encodeURIComponent(news.image_url ?? "")}`}
              alt={news.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", backgroundColor: "#333" }} />
          )}

          {/* テキストオーバーレイ */}
          <div
            style={{
              position: "absolute",
              bottom: "0",
              left: "0",
              width: "100%",
              background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0) 100%)",
              padding: "30px 20px 20px",
              boxSizing: "border-box",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
              <img
                src={news.source_icon ?? "/favicon.ico"}
                alt="?"
                style={{
                  marginRight: "10px",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  padding: "1px",
                }}
              />
              <p style={{ fontSize: "16px", margin: 0 }}>{news.source_name}</p>
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: "20px", // 339px幅に合わせて少し調整
                fontWeight: "bold",
                lineHeight: "1.3",
                textShadow: "0px 1px 3px rgba(0,0,0,0.8)",
                display: "-webkit-box",
                WebkitLineClamp: "3",
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {news.title}
            </h2>
          </div>
        </a>
      </div>
    );
  } else {
    // --- パターンB: 元々のカード形式 ---
    return (
      <div
        key={news.link + "follow"}
        style={{
          margin: "15px 8px",
          width: "339.5px",
          height: "380px",
          border: "1px solid #808080",
          borderRadius: "30px",
          position: "relative",
          overflow: "hidden", // 角丸を画像にも適用させるため
        }}
      >
        <a href={news.link} style={{ textDecoration: 'none', color: 'inherit' }}>
          <img
            src={`/api/image?url=${encodeURIComponent(news.image_url ?? "")}`}
            alt={news.title}
            style={{
              width: "100%", // 親の幅いっぱいに
              height: "180px",
              objectFit: "cover",
            }}
          />
          <div style={{ margin: "15px 18px 0" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={news.source_icon ?? "/favicon.ico"}
                alt="?"
                style={{
                  marginRight: "5px",
                  width: "23px",
                  height: "23px",
                }}
              />
              <p style={{ fontSize: "16px", margin: 0, color: "black" }}>{news.source_name}</p>
            </div>
            <h2
              style={{
                marginTop: "5px",
                fontSize: "18px",
                fontWeight: "bold",
                color: "black",
              }}
            >
              {news.title.length > 35
                ? news.title.slice(0, 34) + "..."
                : news.title}
            </h2>
          </div>
        </a>
      </div>
    );
  }
})}
    </div>
  );
}
