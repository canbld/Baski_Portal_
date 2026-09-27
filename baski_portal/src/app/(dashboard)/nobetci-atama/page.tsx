import { getRehberList } from "@/lib/baski-api";
import NobetClientPage from "./NobetClientPage";
import { cookies } from "next/headers";

export const metadata = {
  title: "Nöbetçi Atama Paneli",
};

export default async function NobetciAtamaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const query = params?.q || "";
  const itemsPerPage = 10;

  const cookieStore = await cookies();
  const userRole = cookieStore.get("user_role")?.value || "UNIT_MANAGER";
  const userUnitName = cookieStore.get("user_unit_name")?.value || "";

  const tumPersonel = await getRehberList();

  let yetkiliPersonelHavuzu = tumPersonel;

  if (userRole !== "SUPER_ADMIN") {
    yetkiliPersonelHavuzu = tumPersonel.filter(
      (p) => p.birim.toLowerCase().trim() === userUnitName.toLowerCase().trim(),
    );
  }

  const filtered = yetkiliPersonelHavuzu.filter((p) =>
    query
      ? p.adSoyad.toLowerCase().includes(query.toLowerCase()) ||
        p.birim.toLowerCase().includes(query.toLowerCase())
      : true,
  );

  const start = (page - 1) * itemsPerPage;
  const pageData = filtered.slice(start, start + itemsPerPage);

  return (
    <div className="p-6">
      <NobetClientPage
        data={pageData}
        totalCount={filtered.length}
        currentPage={page}
        query={query}
        userRole={userRole}
      />
    </div>
  );
}
