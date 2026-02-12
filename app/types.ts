export type NewsItem = {
  title: string;
  description: string;
  link: string;
  image_url?: string;
  source_name: string;
  source_domain: string;
  source_icon?: string
};

// 型定義（Weather.tsxから共通で使えるようにエクスポートしておくと便利）
export type ForecastsItem = {
  date: string;
  dateLabel: string;
  telop: string;
  detail: { weather: string; wind: string; wave: string; };
  temperature: {
    min: { celsius: string };
    max: { celsius: string };
  };
  image: { url: string; alt: string; };
  // 降水確率の型を追加
  chanceOfRain: {
    T00_06: string;
    T06_12: string;
    T12_18: string;
    T18_24: string;
  };
};

export type KansokuID = {
  [kenName: string]: {
    [cityName: string]: string;
  };
};

export type CalendarListItem = {
  id?: string;
  summary?: string;
};


export type Event = {
  date: string;        // yyyy-mm-dd
  title: string;
  startTime?: string; // "10:00"
  endTime?: string;   // "11:00"
  range?: {
    start: string;    // yyyy-mm-dd
    end: string;      // yyyy-mm-dd
  };
};

export type CalendarApiEvent = {
  summary?: string;
  start: { date?: string; dateTime?: string };
  end: { date?: string; dateTime?: string };
};


export type Holidays = Record<string, string>;



export type ObservationLocation = [string, string]; // ["東京", "新宿"]

export type LocationMaster = {
  pref: string;
  areas: string[];
};

export type FollowMediaItem = {
  name: string;
  domain: string;
  icon: string;
};

export type UserSettings = {
  showWeather: boolean;
  showCalendar: boolean;
  showNews: boolean;
  observationLocation: ObservationLocation[];
  followMedia: FollowMediaItem[];
};

