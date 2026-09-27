// app/(dashboard)/yetki-yonetimi/page.tsx
import YetkiClientPage from "./YetkiClientPage";
import { getRehberList } from "@/lib/baski-api";

export const metadata = {
  title: "Yetki Yönetimi",
  description: "BASKİ - Yetki Yönetimi",
};

export default async function YetkiYonetimi({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const query = params?.q || "";
  const itemsPerPage = 10;

  const tumVeri = (await getRehberList()) ?? [];

  const filtered = tumVeri.filter((k) =>
    query
      ? k.adSoyad.toLowerCase().includes(query.toLowerCase()) ||
        k.birim.toLowerCase().includes(query.toLowerCase())
      : true,
  );

  const start = (page - 1) * itemsPerPage;
  const pageData = filtered.slice(start, start + itemsPerPage);

  return (
    <YetkiClientPage
      data={pageData}
      totalCount={filtered.length}
      currentPage={page}
      query={query}
    />
  );
}
