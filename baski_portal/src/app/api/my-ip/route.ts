import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  let ip = forwarded?.split(",")[0] ?? realIp ?? "Bilinmiyor";

  if (ip === "::1") ip = "127.0.0.1";
  ip = ip.replace(/^::ffff:/, "");

  return NextResponse.json({ ip });
}
