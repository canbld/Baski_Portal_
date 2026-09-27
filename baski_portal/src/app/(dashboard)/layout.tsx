import { DashboardLayout } from "@/src/components/layout/DashboardLayout";
import { cookies } from "next/headers";

export const metadata = {
  title: {
    default: "BASKİ Portal",
    template: "%s | BASKİ Portal",
  },
  description: "BASKİ Bilgi İşlem Personel Portalı",
  icons: {
    icon: "/favicon.png",
  },
};

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("user_role")?.value || "";
  return <DashboardLayout userRole={userRole}>{children}</DashboardLayout>;
}
