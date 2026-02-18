"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ObservationLocation, LocationMaster, UserSettings } from "@/app/types";

// デフォルト値の設定
const defaultSettings: UserSettings = {
  showWeather: true,
  showCalendar: true,
  showNews: true,
  observationLocation: [],
  followMedia: [],
};

export default function SettingsClient() {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [locations, setLocations] = useState<LocationMaster[]>([]);
  const [saving, setSaving] = useState(false);

  /* 1. 初期データの取得 */
  useEffect(() => {
    // ユーザー設定の取得
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        // observationLocation の型を補正 (古いデータ形式への対策)
        const obs = Array.isArray(data.observationLocation?.[0])
          ? data.observationLocation
          : data.observationLocation
          ? [data.observationLocation]
          : [];

        setSettings({
          ...defaultSettings,
          ...data,
          observationLocation: obs,
        });
      })
      .catch((err) => console.error("設定の取得に失敗しました:", err));

    // 地域マスターデータの取得
    fetch("/list.json")
      .then((res) => res.json())
      .then((data) => {
        const list: LocationMaster[] = Object.entries(data).map(
          ([pref, areas]) => ({
            pref,
            areas: Object.keys(areas as Record<string, string>),
          })
        );
        setLocations(list);
      })
      .catch((err) => console.error("地域データの取得に失敗しました:", err));
  }, []);

  /* 2. 状態更新ハンドラー */
  const update = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  /* 3. 保存処理とページ遷移 */
  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        // サーバー側のデータを再検証し、トップページへ戻る
        router.refresh(); 
        router.push("/");
      } else {
        throw new Error("保存に失敗しました");
      }
    } catch (error) {
      console.error(error);
      alert("設定の保存中にエラーが発生しました。");
      setSaving(false);
    }
  };

  /* 共通スタイル定義 */
  const selectStyle: React.CSSProperties = {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    fontSize: "0.9rem",
    outline: "none",
  };

  if (locations.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "50px", color: "#666" }}>
        設定を読み込み中...
      </div>
    );
  }

  return (
    <main>
      <div style={{ backgroundImage: "linear-gradient(0deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.4) 99%)", display: "flex", alignItems: "center", padding: "0 30px" }}>
        <img src={"/Gemini_Generated_Image_frlcdrfrlcdrfrlc (1) (1).png"} alt={"logo"} style={{ height: "60px", margin: "20px 0"}}  />
      </div>
      <div style={{
        maxWidth: 520,
        margin: "10px auto",
        padding: "30px",
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        fontFamily: "'Inter', -apple-system, sans-serif",
        color: "#333"
      }}>
        <div style={{ marginBottom: "8px", padding: "5px", display: "flex", alignItems: "center", borderBottom: "2px solid #f0f0f0", }}>
          <img src={"/gear_9208286.png"} alt="設定アイコン" style={{ height: "23px", opacity: 0.6 }}/>
          <h2 style={{ marginLeft: "8px", fontSize: "20px", fontWeight: "bold" }}>
            表示設定
          </h2>
        </div>

        {/* --- セクション: 表示のON/OFF --- */}
        <div style={{ marginBottom: "32px" }}>
          {(["showWeather", "showCalendar", "showNews"] as const).map((key) => (
            <label key={key} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
              cursor: "pointer",
              borderBottom: "1px solid #f9f9f9"
            }}>
              <span style={{ fontSize: "1rem", fontWeight: 500 }}>
                {key === "showWeather" ? "天気を表示" : key === "showCalendar" ? "カレンダーを表示" : "ニュースを表示"}
              </span>
              
              <div style={{ position: "relative" }}>
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(e) => update(key, e.target.checked)}
                  style={{ display: "none" }}
                />
                {/* スイッチ背景 */}
                <div style={{
                  width: "48px",
                  height: "26px",
                  backgroundColor: settings[key] ? "#3983f3" : "#e0e0e0",
                  borderRadius: "13px",
                  transition: "background-color 0.25s ease",
                }} />
                {/* スイッチノブ */}
                <div style={{
                  position: "absolute",
                  top: "3px",
                  left: settings[key] ? "25px" : "3px",
                  width: "20px",
                  height: "20px",
                  backgroundColor: "#fff",
                  borderRadius: "50%",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                  transition: "left 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
                }} />
              </div>
            </label>
          ))}
        </div>

        {/* --- セクション: 観測地 --- */}
        <div style={{ marginBottom: "32px" }}>
          <h3 style={{ fontSize: "1.1rem", color: "#666", marginBottom: "16px", fontWeight: 600 }}>観測地の設定</h3>
          {settings.observationLocation.map((loc, idx) => (
            <div key={idx} style={{
              display: "flex",
              gap: "10px",
              marginBottom: "12px",
              padding: "16px",
              backgroundColor: "#f8faff",
              borderRadius: "12px",
              border: "1px solid #eef2ff"
            }}>
              {/* 都道府県選択 */}
              <select
                value={loc[0]}
                onChange={(e) => {
                  const pref = e.target.value;
                  const firstArea = locations.find((l) => l.pref === pref)?.areas[0] ?? "";
                  const next: ObservationLocation[] = settings.observationLocation.map((v, i) =>
                    i === idx ? ([pref, firstArea] as ObservationLocation) : v
                  );
                  update("observationLocation", next);
                }}
                style={selectStyle}
              >
                {locations.map((l) => (
                  <option key={l.pref} value={l.pref}>{l.pref}</option>
                ))}
              </select>

              {/* 市区町村選択 */}
              <select
                value={loc[1]}
                onChange={(e) => {
                  const next: ObservationLocation[] = settings.observationLocation.map((v, i) =>
                    i === idx ? ([v[0], e.target.value] as ObservationLocation) : v
                  );
                  update("observationLocation", next);
                }}
                style={selectStyle}
              >
                {locations.find((l) => l.pref === loc[0])?.areas.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* --- セクション: フォローメディア --- */}
        <div style={{ marginBottom: "32px" }}>
          <h3 style={{ fontSize: "1.1rem", color: "#666", marginBottom: "16px", fontWeight: 600 }}>フォローメディア</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {settings.followMedia.length > 0 ? (
              settings.followMedia.map((m, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 15px",
                  backgroundColor: "#fff",
                  border: "1px solid #eee",
                  borderRadius: "10px",
                }}>
                  {m.icon ? (
                    <img src={m.icon} alt={m.name} width={30} height={30} style={{ borderRadius: "50%" }} />
                  ) : (
                    <div style={{ width: 30, height: 30, backgroundColor: "#f0f0f0", borderRadius: "50%" }} />
                  )}
                  <span style={{ fontSize: "0.95rem", flex: 1, fontWeight: 500 }}>{m.name}</span>
                  <button
                    onClick={() => update("followMedia", settings.followMedia.filter((_, idx) => idx !== i))}
                    style={{
                      backgroundColor: "#fff0f0",
                      border: "none",
                      color: "#ff4d4f",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontWeight: 500
                    }}
                  >
                    解除
                  </button>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "0.9rem", color: "#999", textAlign: "center", padding: "10px" }}>
                フォローしているメディアはありません
              </p>
            )}
          </div>
        </div>

        {/* --- 保存ボタン --- */}
        <button
          onClick={save}
          disabled={saving}
          style={{
            width: "100%",
            padding: "16px",
            backgroundColor: saving ? "#a5c7f9" : "#3983f3",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "1.1rem",
            fontWeight: "bold",
            cursor: saving ? "not-allowed" : "pointer",
            boxShadow: "0 4px 14px rgba(57, 131, 243, 0.3)",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = "#2a72e5")}
          onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = "#3983f3")}
          onMouseDown={(e) => !saving && (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => !saving && (e.currentTarget.style.transform = "scale(1)")}
        >
          {saving ? "設定を保存中..." : "設定を保存して戻る"}
        </button>

        <button
          onClick={() => router.push("/")}
          style={{
            width: "100%",
            marginTop: "12px",
            padding: "10px",
            backgroundColor: "transparent",
            color: "#888",
            border: "none",
            fontSize: "0.9rem",
            cursor: "pointer",
            textDecoration: "underline"
          }}
        >
          保存せずに戻る
        </button>
      </div>
  </main>
  );
}