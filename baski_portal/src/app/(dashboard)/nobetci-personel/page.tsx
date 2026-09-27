// app/(dashboard)/nobetci-personel/page.tsx
import NobetciPersonelPage from "./NobetciPersonelPage";

export const metadata = {
  title: "Nöbetçi Personel Listesi",
  description: "BASKİ Bünyesinde Aktif Görevli Nöbetçi Personeller",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  let DBShifts: any[] = [];
  try {
    const res = await fetch(`${baseUrl}/api/admin/shifts`, {
      cache: "no-store",
    });
    if (res.ok) {
      DBShifts = await res.json();
    }
  } catch (e) {
    console.error("Nöbetçiler sunucuda çekilirken hata oluştu:", e);
  }

  return <NobetciPersonelPage initialShifts={DBShifts} />;
}
