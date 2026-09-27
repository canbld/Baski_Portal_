import { NextResponse } from "next/server";
import { prisma } from "@/prisma/db";

export async function POST(req: Request) {
  try {
    const { label, href, icon, category, subGroup } = await req.json();

    if (!label || !href || !icon || !category) {
      return NextResponse.json(
        { success: false, error: "Eksik veri gönderildi" },
        { status: 400 },
      );
    }

    const existingNav = await prisma.dynamicNav.findUnique({
      where: { label: label.trim() },
    });

    if (existingNav) {
      return NextResponse.json(
        { success: false, error: "Bu başlıkta bir bağlantı zaten mevcut!" },
        { status: 400 },
      );
    }

    // PostgreSQL'e güvenli kayıt
    await prisma.dynamicNav.create({
      data: {
        label: label.trim(),
        href: href.trim(),
        icon: icon,
        category: category,
        subGroup: subGroup || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Veritabanı kayıt hatası detayları:", error);
    return NextResponse.json(
      { success: false, error: "Veritabanı hatası" },
      { status: 500 },
    );
  }
}
