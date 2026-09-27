import { NextResponse } from "next/server";
import { prisma } from "@/prisma/db";

export async function POST(req: Request) {
  try {
    const { label } = await req.json();

    if (!label) {
      return NextResponse.json(
        { success: false, message: "Başlık belirtilmedi" },
        { status: 400 },
      );
    }

    await prisma.dynamicNav.delete({
      where: {
        label: label,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Silme işlemi sırasında hata oluştu:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
