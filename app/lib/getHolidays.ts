import { Holidays } from "@/app/types";

export async function getHolidays(): Promise<Holidays> {
  const res = await fetch(
    "https://holidays-jp.github.io/api/v1/date.json",
    { cache: "force-cache" }
  );

  if (!res.ok) {
    console.error("HOLIDAY FETCH FAILED");
    return {};
  }

  return res.json();
}
