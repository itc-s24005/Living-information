import { cookies } from "next/headers";
import { getValidGoogleAccessToken } from "@/app/lib/google/token";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    return Response.json({ unreadCount: 0 });
  }

  const accessToken = await getValidGoogleAccessToken(userId);

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await res.json();
  //console.log("gmail api response:", data);


  return Response.json({
    unreadCount: data.messages?.length ?? 0,
  });
}
