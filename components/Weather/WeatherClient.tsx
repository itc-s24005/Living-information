"use client";

import { useState } from "react";
import { ForecastsItem } from "@/app/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";



type Props = {
  forecastsList: ForecastsItem[];
  text: string
  title: string;
  imageUrl: string;
};

export default function WeatherClient({ forecastsList, text, title, imageUrl }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedFore = forecastsList[selectedIndex];


  // --- 降水確率データの変換ロジック ---
  // "60%" -> 60 (number) に変換し、グラフ用の配列を作る
  const chartData = [
    { time: "0-6時", probability: parseInt(selectedFore.chanceOfRain.T00_06) || 0 },
    { time: "6-12時", probability: parseInt(selectedFore.chanceOfRain.T06_12) || 0 },
    { time: "12-18時", probability: parseInt(selectedFore.chanceOfRain.T12_18) || 0 },
    { time: "18-24時", probability: parseInt(selectedFore.chanceOfRain.T18_24) || 0 },
  ];

  return (
    <>
      {/* --- メインウィジェット（クリックで開く） --- */}
      <div
        onClick={() => setIsOpen(true)}
        style={{
          minWidth: "1779px",
          margin: "25px 0 30px",
          padding: "22px 30px",
          borderRadius: "30px",
          position: "relative",
          overflow: "hidden",
          cursor: "pointer", // クリック可能であることを示す
          backgroundColor: "rgb(100 100 100 / 0.2)",
        }}
      >
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${imageUrl})`, backgroundSize: "cover",
          backgroundPosition: "center", filter: "brightness(0.8)", zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: "25px", color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
            {title}
          </p>
          <div style={{ display: "flex", gap: "20px", color: "Black" }}>
            <div style={{ 
                padding: "15px 18px", margin: "15px 18px", minWidth: "630px",
                backgroundColor: "rgba(255, 255, 255, 0.35)", borderRadius: "30px",
              }}>
                <h3 style={{ fontSize: "22px" }}>{forecastsList[0].dateLabel}</h3>
                <div style={{display: "flex"}}>
                  <div>
                    <div style={{ display: "flex" }}>
                      <img src={forecastsList[0].image.url} alt={forecastsList[0].image.alt} style={{ width: "85px", marginRight: "10px" }} />
                      <div>
                        <h2 style={{ marginBottom: "-5px", fontSize: "28px" }}>{forecastsList[0].telop}</h2>
                        <div style={{ display: "flex" }}>
                          <p style={{ margin: "5px 0", color: "red" }}>最高 {forecastsList[0].temperature.max?.celsius ?? "-"}℃</p>
                          <p style={{ margin: "5px 20px", color: "blue" }}>最低 {forecastsList[0].temperature.min?.celsius ?? "-"}℃</p>
                        </div>
                      </div>
                    </div>
                    <p style={{marginLeft: "10px"}}>{forecastsList[0].detail?.weather ?? "---"}</p>
                  </div>
                  <div style={{ marginLeft: "25px" }}>
                    
                    <p style={{ margin: "2px 0" }}>風: {forecastsList[0].detail.wind}</p>
                    <p style={{ margin: "2px 0" }}>波: {forecastsList[0].detail?.wave ?? "---"}</p>
                  </div>
                </div>
              </div>

            {forecastsList.slice(1).map((fore) => (
              <div key={fore.date} style={{
                padding: "15px 18px", margin: "15px 18px", width: "380px",
                backgroundColor: "rgba(255, 255, 255, 0.35)", borderRadius: "30px",
              }}>
                <h3 style={{ fontSize: "22px" }}>{fore.dateLabel}</h3>
                <div style={{ display: "flex" }}>
                  <img src={fore.image.url} alt={fore.image.alt} style={{ width: "85px", marginRight: "10px" }} />
                  <div>
                    <h2 style={{ marginBottom: "-5px", fontSize: "28px" }}>{fore.telop}</h2>
                    <div style={{ display: "flex" }}>
                      <p style={{ margin: "5px 0", color: "red" }}>最高 {fore.temperature.max?.celsius ?? "-"}℃</p>
                      <p style={{ margin: "5px 20px", color: "blue" }}>最低 {fore.temperature.min?.celsius ?? "-"}℃</p>
                    </div>
                  </div>
                </div>
                <p style={{marginLeft: "10px"}}>{forecastsList[0].detail?.weather ?? "---"}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "right", color: "#fff", textShadow: "0 0 10px rgb(0 0 0 / 0.5)" }}>クリックで詳細を表示</p>
        </div>
      </div>



      {/* --- ライトボックス (詳細表示) --- */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1000,
            display: "flex", justifyContent: "center", alignItems: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "950px", borderRadius: "30px",
              padding: "40px", position: "relative", overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
            }}
          >
            {/* ヘッダー背景 */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "100%",
              backgroundImage: `url(${imageUrl})`, backgroundSize: "cover",
              filter: "blur(4px) brightness(0.8)", zIndex: 0
            }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#fff", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "28px", margin: 0 }}>{title}</h2>
                <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: "28px", cursor: "pointer" }}>✕</button>
              </div>

              {/* 日付選択タブ */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "25px" }}>
                {forecastsList.map((fore, idx) => (
                  <button
                    key={fore.date}
                    onClick={() => setSelectedIndex(idx)}
                    style={{
                      padding: "8px 18px", borderRadius: "15px", border: "none",
                      backgroundColor: selectedIndex === idx ? "#007bff" : "rgba(255,255,255,0.2)",
                      color: selectedIndex === idx ? "#fff" : "#fff",
                      backdropFilter: "blur(10px)", cursor: "pointer", fontWeight: "bold",
                    }}
                  >
                    {fore.dateLabel}
                  </button>
                ))}
              </div>

              {/* メイン情報とグラフの2カラムレイアウト */}
              
              <div style={{ backgroundColor: "rgba(255, 255, 255, 0.8)", padding: "25px", borderRadius: "30px", color: "black" }}>

                <div style={{ marginBottom: "20px", display: "flex", gap: "40px" }}>
                {/* 左：天気基本情報 */}
                  <div style={{ width: "400px" }}>
                    <div style={{ textAlign: "center", marginBottom: "20px" }}>
                      <img src={selectedFore.image.url} alt={selectedFore.image.alt} style={{ width: "120px", height: "90px" }} />
                      <h3 style={{ fontSize: "33px", margin: "8px 0 0" }}>{selectedFore.telop}</h3>
                    </div>
                    <div style={{ padding: "10px 15px", backgroundColor: "#f0f4f8", borderRadius: "20px" }}>
                      <p style={{ margin: "5px 0" }}><strong>最高:</strong> <span style={{color:"red"}}>{selectedFore.temperature.max?.celsius ?? "-"}℃</span></p>
                      <p style={{ margin: "5px 0" }}><strong>最低:</strong> <span style={{color:"blue"}}>{selectedFore.temperature.min?.celsius ?? "-"}℃</span></p>
                      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "10px 0" }} />
                      <p style={{ fontSize: "14px", lineHeight: "1.5" }}>{selectedFore.detail.weather ?? "---"}</p>
                    </div>
                    <div style={{ padding: "5px", marginTop: "10px" }}>
                      <p style={{ margin: "5px 0" }}><strong>風:</strong> {selectedFore.detail.wind ?? "---"}</p>
                      <p style={{ margin: "5px 0" }}><strong>波:</strong> {selectedFore.detail.wave ?? "---"}</p>
                    </div>
                  </div>

                  {/* 右：降水確率グラフ */}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ marginBottom: "15px", color: "#444", fontSize: "18px", borderLeft: "4px solid #007bff", paddingLeft: "10px" }}>
                      時間別 降水確率 (%)
                    </h4>
                    <div style={{ width: "100%", height: "250px", backgroundColor: "#fafafa", borderRadius: "20px", padding: "20px 10px 10px 0" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: "#888", fontSize: 12}} />
                          <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: "#888", fontSize: 12}} unit="%" />
                          <Tooltip 
                            contentStyle={{borderRadius: "10px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)"}}
                            formatter={(value) => [`${value}%`, "降水確率"]}
                          />
                          <Line
                            type="monotone"
                            dataKey="probability"
                            stroke="#007bff"
                            strokeWidth={4}
                            dot={{ r: 6, fill: "#007bff", strokeWidth: 2, stroke: "#fff" }}
                            activeDot={{ r: 8 }}
                            animationDuration={1000}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                      {chartData.map(d => (
                        <div key={d.time} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "12px", color: "#999" }}>{d.time}</div>
                          <div style={{ fontWeight: "bold", color: "#333" }}>{d.probability}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {text.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}