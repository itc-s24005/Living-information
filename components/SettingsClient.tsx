"use client";

import { useEffect, useState } from "react";
import { ObservationLocation, LocationMaster,  UserSettings } from "@/app/types";


const defaultSettings: UserSettings = {
  showWeather: true,
  showCalendar: true,
  showNews: true,
  observationLocation: [],
  followMedia: [],
};

export default function SettingsClient() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [locations, setLocations] = useState<LocationMaster[]>([]);
  const [saving, setSaving] = useState(false);

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
          // ★ ここが重要
          areas: Object.keys(areas as Record<string, string>),
        })
      );
      setLocations(list);
    });
}, []);

if (locations.length === 0) {
  return <div>loading...</div>;
}



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
  };

  return (
    <div style={{ maxWidth: 480 }}>
      {/* ON/OFF */}
      {(["showWeather", "showCalendar", "showNews"] as const).map((key) => (
        <label key={key} style={{ display: "block", marginBottom: 8 }}>
          <input
            type="checkbox"
            checked={settings[key]}
            onChange={(e) => update(key, e.target.checked)}
          />{" "}
          {key}
        </label>
      ))}

      {/* 観測地 */}
      <h3 style={{ marginTop: 16 }}>観測地</h3>

      {settings.observationLocation.map((loc, idx) => (
        <div key={idx} style={{ marginBottom: 8 }}>
          {/* 都道府県 */}
          <select
            value={loc[0]}
            onChange={(e) => {
              const pref = e.target.value;

              const firstArea =
                locations.find((l) => l.pref === pref)?.areas[0] ?? "";

              const next: ObservationLocation[] =
                settings.observationLocation.map((v, i) =>
                  i === idx
                    ? ([pref, firstArea] as ObservationLocation)
                    : v
                );

              update("observationLocation", next);
            }}
          >
            {locations.map((l) => (
              <option key={l.pref} value={l.pref}>
                {l.pref}
              </option>
            ))}
          </select>


          {/* 市区町村 */}
          <select
            value={loc[1]}
            onChange={(e) => {
              const next: ObservationLocation[] =
                settings.observationLocation.map((v, i) =>
                  i === idx
                    ? ([v[0], e.target.value] as ObservationLocation)
                    : v
                );

              update("observationLocation", next);
            }}
          >
            {/* <option value="">選択してください</option> */}
            {locations
              .find((l) => l.pref === loc[0])
              ?.areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
          </select>

        </div>
      ))}

      {/* フォローメディア */}
      <h3 style={{ marginTop: 16 }}>フォローメディア</h3>

      {settings.followMedia.map((m, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          {m.icon && (
            <img
              src={m.icon}
              alt={m.name}
              width={24}
              height={24}
              style={{ borderRadius: 4 }}
            />
          )}

          <span>{m.name}</span>

          <button
            style={{ marginLeft: "auto" }}
            onClick={() =>
              update(
                "followMedia",
                settings.followMedia.filter((_, idx) => idx !== i)
              )
            }
          >
            削除
          </button>
        </div>
      ))}

      <button onClick={save} disabled={saving} style={{ marginTop: 16 }}>
        保存
      </button>
    </div>
  );
}
