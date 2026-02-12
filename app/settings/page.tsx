import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import SettingsClient from "@/components/SettingsClient";

export default async function SettingsPage() {
  const store = await cookies();
  const userId = store.get("user_id")?.value; // ← ここ！

  if (!userId || (await prisma.user.findUnique({ where: { id: userId } })) === null) {
    redirect("/api/auth");
  }

  return <SettingsClient />;
}
