"use client";

import { useEffect, useState } from "react";
import { ObservationLocation, LocationMaster, UserSettings } from "@/app/types";
import { useRouter } from "next/navigation"; // 追加

const defaultSettings: UserSettings = {
  showWeather: true,
  showCalendar: true,
  showNews: true,
  observationLocation: [],
  followMedia: [],
};

export default function SettingsClient() {
  const router = useRouter(); // 追加
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [locations, setLocations] = useState<LocationMaster[]>([]);
  const [saving, setSaving] = useState(false);

  // モーダルを閉じる関数（URLからクエリパラメータを消す）
  const close = () => {
    router.push("/"); 
  };

  /* 初期値取得 */
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        const obs =
          Array.isArray(data.observationLocation?.[0])
            ? data.observationLocation
            : data.observationLocation
            ? [data.observationLocation]
            : [];

        setSettings({
          ...defaultSettings,
          ...data,
          observationLocation: obs,
        });
      });

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
      });
  }, []);

  /* 共通更新 */
  const update = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
    setSaving(false);
    close(); // 保存後に閉じる
  };

  const selectStyle: React.CSSProperties = {
    flex: 1,
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    fontSize: "0.9rem"
  };

  // 読み込み中は空のモーダル枠だけ表示するか、nullを返す
  if (locations.length === 0) {
    return (
      <div style={overlayStyle}>
        <div style={modalContainerStyle}>
          <div style={{ padding: "40px", textAlign: "center" }}>読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle} onClick={close}> {/* 背景クリックで閉じる */}
      <div 
        style={modalContainerStyle} 
        onClick={(e) => e.stopPropagation()} // 中身クリックで閉じないようにする
      >
        {/* 閉じるボタン（右上） */}
        <button 
          onClick={close}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            border: "none",
            background: "none",
            fontSize: "20px",
            cursor: "pointer",
            color: "#999"
          }}
        >✕</button>

        <h2 style={{ fontSize: "1.25rem", marginBottom: "20px", borderBottom: "2px solid #f0f0f0", paddingBottom: "10px" }}>表示設定</h2>

        {/* ON/OFF (トグルスイッチ) */}
        <div style={{ marginBottom: "24px" }}>
          {(["showWeather", "showCalendar", "showNews"] as const).map((key) => (
            <label key={key} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 0",
              cursor: "pointer",
              borderBottom: "1px solid #f9f9f9"
            }}>
              <span style={{ fontSize: "0.95rem", fontWeight: 500 }}>{key}</span>
              <div style={{ position: "relative" }}>
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(e) => update(key, e.target.checked)}
                  style={{ display: "none" }}
                />
                <div style={{
                  width: "44px",
                  height: "24px",
                  backgroundColor: settings[key] ? "#3983f3ff" : "#e0e0e0",
                  borderRadius: "12px",
                  transition: "background-color 0.2s ease",
                }} />
                <div style={{
                  position: "absolute",
                  top: "2px",
                  left: settings[key] ? "22px" : "2px",
                  width: "20px",
                  height: "20px",
                  backgroundColor: "#fff",
                  borderRadius: "50%",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  transition: "left 0.2s ease",
                }} />
              </div>
            </label>
          ))}
        </div>

        {/* 観測地 */}
        <h3 style={{ fontSize: "1rem", color: "#666", marginBottom: "12px" }}>観測地</h3>
        <div style={{ maxHeight: "200px", overflowY: "auto" }}> {/* 観測地が多い場合を想定 */}
          {settings.observationLocation.map((loc, idx) => (
            <div key={idx} style={{
              display: "flex",
              gap: "8px",
              marginBottom: "12px",
              padding: "12px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px"
            }}>
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

        {/* フォローメディア */}
        <h3 style={{ fontSize: "1rem", color: "#666", marginTop: "24px", marginBottom: "12px" }}>フォローメディア</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {settings.followMedia.map((m, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "8px 12px",
              backgroundColor: "#fff",
              border: "1px solid #eee",
              borderRadius: "8px",
            }}>
              {m.icon ? (
                <img src={m.icon} alt={m.name} width={28} height={28} style={{ borderRadius: "6px" }} />
              ) : (
                <div style={{ width: 28, height: 28, backgroundColor: "#eee", borderRadius: "6px" }} />
              )}
              <span style={{ fontSize: "0.9rem", flex: 1 }}>{m.name}</span>
              <button
                onClick={() => update("followMedia", settings.followMedia.filter((_, idx) => idx !== i))}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#ff4d4f",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  padding: "4px 8px"
                }}
              >
                フォローを外す
              </button>
            </div>
          ))}
        </div>

        {/* 保存ボタン */}
        <button
          onClick={save}
          disabled={saving}
          style={{
            width: "100%",
            marginTop: "32px",
            padding: "12px",
            backgroundColor: saving ? "#ccc" : "#3983f3ff",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: saving ? "not-allowed" : "pointer",
            transition: "transform 0.1s"
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(2px)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          {saving ? "保存中..." : "設定を保存"}
        </button>
      </div>
    </div>
  );
}

// モーダル用の追加スタイル
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10000,
  backdropFilter: "blur(4px)" // 背景を少しぼかすと高級感が出ます
};

const modalContainerStyle: React.CSSProperties = {
  position: "relative",
  width: "90%",
  maxWidth: 480,
  maxHeight: "90vh",
  overflowY: "auto",
  padding: "24px",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
};