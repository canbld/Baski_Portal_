import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("baski_session");
  cookieStore.delete("user_role");
  cookieStore.delete("user_name");
  cookieStore.delete("bridge_id");

  return NextResponse.json({ message: "Başarılı" }, { status: 200 });
}
