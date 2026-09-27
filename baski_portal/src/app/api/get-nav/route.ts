import { NextResponse } from "next/server";
import { prisma } from "@/prisma/db";

export async function GET() {
  try {
    const links = await prisma.dynamicNav.findMany();

    const sidebar = links.filter((l) => l.category !== "Hızlı Erişim");
    const quickLinks = links.filter((l) => l.category === "Hızlı Erişim");

    return NextResponse.json({ sidebar, quickLinks });
  } catch (error) {
    return NextResponse.json({ sidebar: [], quickLinks: [] });
  }
}
