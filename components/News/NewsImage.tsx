"use client";

import { useEffect, useState } from "react";

type Props = {
  src?: string;
  alt?: string;
  zen: boolean;
};

export default function NewsImage({ src, alt, zen }: Props) {
  const fallback = "/news.jpg";

  // 初期値で fallback を入れる（ここ重要）
  const [imgSrc, setImgSrc] = useState(fallback);

  useEffect(() => {
    if (!src) return; // setStateしない

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImgSrc(src);
    };

    img.onerror = () => {
      setImgSrc(fallback);
    };
  }, [src]);

  if(zen){
    return (
      <img
                  src={imgSrc}
                  alt={alt ?? "news image"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover", // アスペクト比を維持しつつエリア全体を埋める
                    border: "none",
                    display: "block",
                  }}
                />
    )
  }

  return (
    <img
      src={imgSrc}
      alt={alt ?? "news image"}
      style={{
        width: "360px",
        height: "180px",
        objectFit: "cover",
        borderRadius: "29px 29px 0 0",
      }}
    />
  );
}
