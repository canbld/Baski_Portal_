import RehberPage from "./RehberPage";
import { getRehberList } from "@/lib/baski-api";

export const metadata = {
  title: "Rehber",
  description: "BASKİ - Telefon Rehberi",
};

export default async function Rehber({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const query = params?.q || "";
  const itemsPerPage = 10;

  const tumVeri = (await getRehberList()) ?? [];

  const filtered = tumVeri.filter((k) =>
    query
      ? k.adSoyad.toLowerCase().includes(query.toLowerCase()) ||
        k.birim.toLowerCase().includes(query.toLowerCase()) ||
        k.dahili.includes(query)
      : true,
  );

  const start = (page - 1) * itemsPerPage;
  const pageData = filtered.slice(start, start + itemsPerPage);

  return (
    <div className="p-6">
      <RehberPage
        data={pageData}
        totalCount={filtered.length}
        currentPage={page}
        query={query}
      />
    </div>
  );
}
