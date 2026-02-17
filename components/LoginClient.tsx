export default function LoginClient() {
  return (
    <main >
      <div style={{ backgroundImage: "linear-gradient(0deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.4) 99%)", display: "flex", alignItems: "center", marginBottom: "280px", padding: "0 30px" }}>
        <img src={"/Gemini_Generated_Image_frlcdrfrlcdrfrlc (1) (1).png"} alt={"logo"} style={{ height: "60px", margin: "20px 0"}}  />
      </div>
      <div style={{textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center"}}>
        <div>
            <h1 style={{ fontSize: "40px", fontWeight: "bold", textAlign: "center" }}>ようこそ</h1>
            <p style={{ margin: "15px 0 45px", fontSize: "15px", textAlign: "center" }}>利用するにはGoogleでログインしてください</p>
            <a href="/api/auth" style={{ padding: "13px", fontSize: "20px", border: "1px solid", borderRadius: "24px", backgroundColor: "#1e90ff", color: "#ffffff", fontWeight: "bold" }}>ログイン</a>
        </div>
      </div>
    </main>
  );
}
