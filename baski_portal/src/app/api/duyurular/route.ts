import { NextResponse } from "next/server";
import { getDuyuruData } from "@/lib/get-duyurular";

export async function GET() {
  const duyurular = await getDuyuruData();
  return NextResponse.json(duyurular);
}
