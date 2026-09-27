import { NextResponse } from "next/server";
import { prisma } from "@/prisma/db";
import { cookies } from "next/headers";

// YENİ NÖBET EKLEME
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("baski_session")?.value;

    const creatorName =
      cookieStore.get("user_name")?.value || "Bilinmeyen Yetkili";

    if (!session) {
      return NextResponse.json(
        { message: "Oturum bulunamadı." },
        { status: 401 },
      );
    }

    const {
      staffId,
      staffName,
      staffPhone,
      unitId,
      unitName,
      shiftDate,
      shiftTime,
      duty,
    } = await req.json();
    // Gelen şube adını normalize et
    const cleanSubUnitName = unitName.trim().toUpperCase();

    // Veritabanında daha önce eşleştirilmiş mi kontrol et
    let mapping = await prisma.organizationMapping.findUnique({
      where: {
        subUnitName: cleanSubUnitName,
      },
    });

    // Yoksa otomatik tahmin et ve kaydet
    if (!mapping) {
      let estimatedParent = unitName;
      const lowerName = unitName.toLocaleLowerCase("tr-TR");

      if (
        lowerName.includes("yazılım") ||
        lowerName.includes("donanım") ||
        lowerName.includes("coğrafi") ||
        lowerName.includes("teknolojileri") ||
        lowerName.includes("scada")
      ) {
        estimatedParent = "Bilgi İşlem Dairesi Başkanlığı";
      } else if (
        lowerName.includes("emlak") ||
        lowerName.includes("kamulaştırma") ||
        lowerName.includes("evrak") ||
        lowerName.includes("destek") ||
        lowerName.includes("arşiv") ||
        lowerName.includes("dökümantasyon") ||
        lowerName.includes("koruma") ||
        lowerName.includes("güvenlik")
      ) {
        estimatedParent = "Destek Hizmetleri Dairesi Başkanlığı";
      } else if (
        lowerName.includes("atık su") ||
        lowerName.includes("arıtma")
      ) {
        estimatedParent = "Atık Su Arıtma Dairesi Başkanlığı";
      } else if (
        lowerName.includes("su arıtma") ||
        lowerName.includes("içme suyu") ||
        lowerName.includes("havza") ||
        lowerName.includes("su kalitesi")
      ) {
        estimatedParent = "Su Arıtma ve İşletme Dairesi Başkanlığı";
      } else if (
        lowerName.includes("1.bölge") ||
        lowerName.includes("1. bölge")
      ) {
        estimatedParent = "İşletmeler 1.Bölge Dairesi Başkanlığı";
      } else if (
        lowerName.includes("2.bölge") ||
        lowerName.includes("2. bölge")
      ) {
        estimatedParent = "İşletmeler 2.Bölge Dairesi Başkanlığı";
      } else if (
        lowerName.includes("3.bölge") ||
        lowerName.includes("3. bölge") ||
        lowerName.includes("güney marmara")
      ) {
        estimatedParent = "İşletmeler 3.Bölge Dairesi Başkanlığı";
      } else if (lowerName.includes("abone")) {
        estimatedParent = "Abone İşleri Dairesi Başkanlığı";
      } else if (
        lowerName.includes("su tesisleri") ||
        lowerName.includes("sulama")
      ) {
        estimatedParent = "Su Tesisleri Dairesi Başkanlığı";
      } else if (
        lowerName.includes("strateji") ||
        lowerName.includes("performans") ||
        lowerName.includes("basın")
      ) {
        estimatedParent = "Strateji Geliştirme Dairesi Başkanlığı";
      } else if (
        lowerName.includes("ticaret") ||
        lowerName.includes("ihale") ||
        lowerName.includes("satın alma") ||
        lowerName.includes("taşınır")
      ) {
        estimatedParent = "Ticaret İşleri Dairesi Başkanlığı";
      } else if (
        lowerName.includes("insan kaynakları") ||
        lowerName.includes("eğitim") ||
        lowerName.includes("sağlığı")
      ) {
        estimatedParent = "İnsan Kaynakları ve Eğitim Dairesi Başkanlığı";
      } else if (
        lowerName.includes("planlama") ||
        lowerName.includes("yatırım") ||
        lowerName.includes("keşif")
      ) {
        estimatedParent = "Planlama Yatırım ve İnşaat Dairesi Başkanlığı";
      } else if (lowerName.includes("proje")) {
        estimatedParent = "Projeler Dairesi Başkanlığı";
      } else if (
        lowerName.includes("elektrik") ||
        lowerName.includes("enerji") ||
        lowerName.includes("makine")
      ) {
        estimatedParent = "Elektrik Makine ve Malzeme İkmal Dairesi Başkanlığı";
      } else if (
        lowerName.includes("müşteri") ||
        lowerName.includes("iletişim")
      ) {
        estimatedParent =
          "Müşteri Hizmetleri ve Kurumsal İletişim Dairesi Başkanlığı";
      }

      mapping = await prisma.organizationMapping.create({
        data: {
          subUnitName: cleanSubUnitName,
          parentName: estimatedParent,
        },
      });
    }

    const finalUnitName = mapping.parentName;

    if (!staffId || !shiftDate || !shiftTime || !duty) {
      return NextResponse.json(
        { message: "Eksik bilgi gönderildi." },
        { status: 400 },
      );
    }

    const newShift = await prisma.shift.create({
      data: {
        staffId: String(staffId),
        staffName,
        staffPhone: staffPhone || "-",
        unitId: String(unitId),
        unitName: finalUnitName,
        shiftDate: new Date(shiftDate),
        shiftTime,
        duty,
        createdBy: creatorName,
      },
    });

    return NextResponse.json(
      { message: "Nöbet kaydedildi.", shift: newShift },
      { status: 200 },
    );
  } catch (error) {
    console.error("Nöbet kaydetme hatası:", error);
    return NextResponse.json(
      { message: "Nöbet kaydedilemedi." },
      { status: 500 },
    );
  }
}

// NÖBETLERİ LİSTELEME VE GEÇMİŞİ OTOMATİK SİLME
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const userRole = cookieStore.get("user_role")?.value || "UNIT_MANAGER";
    const userName = cookieStore.get("user_name")?.value || "";

    const { searchParams } = new URL(req.url);
    const isPanel = searchParams.get("panel") === "true";

    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);

    // Nöbet tarihi bugünden eski olan kayıtları temizle
    await prisma.shift.deleteMany({
      where: {
        shiftDate: {
          lt: bugun,
        },
      },
    });

    let whereClause: any = {};

    if (isPanel && userRole !== "SUPER_ADMIN") {
      whereClause.createdBy = userName;
    }
    const shifts = await prisma.shift.findMany({
      where: whereClause,
      orderBy: { shiftDate: "asc" },
    });
    return NextResponse.json(shifts);
  } catch (error) {
    console.error("Nöbet listesi hatası:", error);
    return NextResponse.json(
      { message: "Nöbetler çekilemedi." },
      { status: 500 },
    );
  }
}

// MANUEL NÖBET SİLME
export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("baski_session")?.value;

    const userRole = cookieStore.get("user_role")?.value || "UNIT_MANAGER";
    const userName = cookieStore.get("user_name")?.value || "";

    if (!session) {
      return NextResponse.json(
        { message: "Oturum bulunamadı." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Nöbet ID bulunamadı." },
        { status: 400 },
      );
    }

    const targetShift = await prisma.shift.findUnique({
      where: { id: Number(id) },
    });

    if (!targetShift) {
      return NextResponse.json(
        { message: "Nöbet kaydı bulunamadı." },
        { status: 404 },
      );
    }

    if (userRole !== "SUPER_ADMIN" && targetShift.createdBy !== userName) {
      return NextResponse.json(
        {
          message:
            "Bu nöbeti silmeye yetkiniz yok! Sadece kendi yazdığınız nöbetleri silebilirsiniz.",
        },
        { status: 403 },
      );
    }

    await prisma.shift.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(
      { message: "Nöbet başarıyla silindi." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Nöbet silme hatası:", error);
    return NextResponse.json({ message: "Nöbet silinemedi." }, { status: 500 });
  }
}
