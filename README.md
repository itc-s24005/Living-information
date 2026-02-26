# 生活情報アプリ
## 概要
メールの未読通知やカレンダー、天気、ニュースなどの生活情報を一括で取得・表示することができるアプリです
※作成にはChatGPTを使用しました  
  
[**アプリはこちら**](https://living-information-demo.vercel.app/)  
! 注意 !  
上記のリンクからアクセスできるサイトはあくまで"デモ用のサイト"です。実際のサイトだとグーグル認証とデータベースによるユーザー情報・設定情報の管理が必要なため、セキュリティの観点からグーグル認証・データベース管理なしで接続できるデモ用をご用意しました。　　
デモ用ではログイン機能がない他、グーグル認証・データベース管理がないため、未読通知・カレンダーの予定・天気情報の取得場所・ローカルニュースを取得する地域・フォローしたメディアは事前に用意した仮データを元に表示しています。フォローボタンと設定ページにつきましては、動作はしますが機能いたしませんのでご了承ください。なお、本番のページは[こちら](https://living-information.vercel.app/)です。
## 使用技術
* Next.js
* Supabase
* OAuth 2.0
* Prisma
* Recharts

## 使用API
[天気予報API](https://weather.tsukumijima.net/)  
天気予報を取得できる  
  
[Google Calendar API](https://developers.google.com/workspace/calendar/api/guides/overview?hl=ja)  
グーグルカレンダーの予定を取得できる  
  
[Gmail API](https://developers.google.com/workspace/gmail/api/guides?hl=ja)  
Gmailの未読件数などを取得できる  
  
[Holidays jp API](https://holidays-jp.github.io/)  
日本の祝日を取得できる  
  
[今日はなんの日API](https://www.whatistoday.cyou/index.cgi/)  
今日の記念日を取得できる  
  
[NEWSDATA.IO](https://newsdata.io/news-sources/japan-news-api)  
様々なニュース記事を取得できる  
  
[Bing API](https://37jotter.wordpress.com/2019/03/21/bing-wallpaper-flow/)  
Bingで使用される日替わりの背景画像を取得できる  
  
## 使用データベース  
[Supabase](https://supabase.com/)  
## 製作期間
約40日ほど
