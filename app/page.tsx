import { cookies } from "next/headers";
import { prisma } from "./lib/prisma";
import { getBingWallpaper } from "./types/bing";
import LoginClient from "@/components/LoginClient";
import CalendarClient from "@/components/Calendar/CalendarClient";
import GmailBadge from "@/components/GmailBadge";
import News from "@/components/News/NewsWidget";
import Weather from "@/components/Weather/WeatherWidget"
import Popover from "@/components/Popover/Popover";
import Link from "next/link"; // 追加
import SettingsClient from "@/components/SettingsClient";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const clockSize = 150; // URLのsizeパラメータに合わせる
  const wallpaper = await getBingWallpaper();

  const store = await cookies();
  const userId = store.get("user_id")?.value;

  if (!userId || (await prisma.user.findUnique({ where: { id: userId } })) === null) {
    return <LoginClient />
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { settings: true },
  });



  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const mmdd = mm + dd;

  const url2 = `https://api.whatistoday.cyou/v3/anniv/${mmdd}`;
  const res2 = await fetch(url2, { cache: "no-cache" });
  const data2 = await res2.json();

  const params = await searchParams;
  const isSettingsOpen = params.settings === "open";

  return (
    <main>
      <img
        src={wallpaper.url}
        alt={wallpaper.title}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
          objectFit: "cover",
          filter: "brightness(0.9)",
          WebkitMaskImage: 'linear-gradient(180deg, #ffffff, #ffffff90 80%, transparent)',
          maskImage: 'linear-gradient(180deg, #ffffff, #ffffff90 80%, transparent)'
        }}
      />
      <div style={{ backgroundImage: "linear-gradient(0deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.4) 99%)", display: "flex", alignItems: "center", marginBottom: "150px", padding: "0 30px" }}>
        <img src={"/Gemini_Generated_Image_frlcdrfrlcdrfrlc (1) (1).png"} alt={"logo"} style={{ height: "60px", margin: "20px 0"}} />
        <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "0 0 0 auto", }}>
          
          <Popover trigger={<img src={user?.avatarUrl ?? "https://via.placeholder.com/48"} alt={"icon"} style={{ marginRight: "30px", width: "40px", marginLeft: "10px", borderRadius: "50%", cursor: "pointer"}} />}>
            <div style={{ textAlign: "center", width: "300px" }}>
              <img src={user?.avatarUrl ?? "https://via.placeholder.com/48"} alt={"icon"} style={{ margin: "auto", width: "60px", borderRadius: "50%", cursor: "pointer"}} />
              <p style={{ margin: "8px 0 0", color: "black", fontSize: "25px" }}>{user?.name}</p>
              <p style={{ fontSize: "12px", color: "#666666" }}>{user?.email}</p>
              
              {/* hrefをクエリパラメータに変更し、Linkコンポーネントを使う */}
              <Link href="?settings=open" style={{ display: "block", margin: "12px 15px", padding: "10px", fontSize: "14px", backgroundColor: "#cfcfcfff", color: "black", textDecoration: "none", borderRadius: "40px" }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <img src={"/gear_9208286.png"} alt="設定" style={{ marginRight: "8px", height: "20px"}}/>
                  設定
                </div>
              </Link>

              <a href="/api/logout" style={{ display: "block", margin: "12px 15px", padding: "10px", fontSize: "14px", backgroundColor: "#cfcfcfff", color: "black", textDecoration: "none", borderRadius: "40px" }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <img src={"/logout_8669140.png"} alt="ログアウト" style={{ marginRight: "8px", height: "20px"}}/>
                  ログアウト
                </div>
              </a>
            </div>
          </Popover>
          <a href="https://accounts.google.com/ServiceLogin?hl=ja&service=mail" style={{ display: "flex", gap: 8, alignItems: "center", margin: "0 0 0 auto" }}>
            <img src={"https://illustcenter.com/wp-content/uploads/2022/06/mailicon01.png"} alt={"mail icon"} style={{ width: "54px", height: "40px", paddingRight: "-10px"}} />
            <GmailBadge />
          </a>
        </div>
      </div>


      <div style={{ marginBottom: "160px", display: "flex"}}>
        <div
        style={{
          width: "fit-content",
          margin: "15px 8px",
          padding: "10px",
          //backgroundColor: "rgb(250 250 250 / 0.3)", // 背景を薄く
          borderRadius: "30px", // 他のウィジェットと統一
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <iframe
          src="https://www.minagi.jp/apps/acl/?size=150"
          width={clockSize}
          height={clockSize}
          style={{
            backgroundColor: "rgb(250 250 250 / 0.22)", // 背景を薄く
            borderRadius: "180px", // 他のウィジェットと統一
            border: "none", // 枠線を消す
            //borderRadius: "20px",
          }}
          title="Analog Clock"
          scrolling="no"
        />
      </div>
      <div>
            <h1 style={{ marginBottom: "-15px", fontSize: "80px", fontWeight: "bold", color: "#fff", textShadow: "0 0 15px rgb(0 0 0 / 0.2)"}}>{mm}月{dd}日 </h1>
            <p style={{ fontSize: "30px", color: "#fff", textShadow: "0 0 25px rgb(0 0 0 / 0.2)" }}>{data2.anniv1}</p>
      </div>
    </div>




      <div style={{ padding: "170px 30px 50px"}}> 
        
        {user?.settings?.showWeather && (<Weather /> )}


        {user?.settings?.showCalendar && (<CalendarClient />)}


        {user?.settings?.showNews && (<News /> )}
      </div>
      {isSettingsOpen && <SettingsClient />}
    </main>
    
  );
}
