import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// ÇIKIS YAPMAK İÇİN KULLANILAN FONKSİYON
export async function handleLogout(
  router: AppRouterInstance,
  setModal: React.Dispatch<React.SetStateAction<any>>,
) {
  const performLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (res.ok) {
        router.refresh();
        router.push("/login");
      } else {
        setModal({
          isOpen: true,
          title: "İşlem Başarısız",
          message: "Çıkış başarısız oldu.",
          type: "error",
        });
      }
    } catch (e) {
      setModal({
        isOpen: true,
        title: "Sistemsel Hata",
        message: "Çıkış yapılırken bir hata oluştu.",
        type: "error",
      });
    }
  };

  setModal({
    isOpen: true,
    title: "Güvenli Çıkış",
    message: "Oturumu kapatmak istediğinize emin misiniz?",
    type: "confirm",
    onConfirm: performLogout,
  });
}
// KULLANICININ ROLÜNÜ KONTROL İÇİN KULLANILAN FONKSİYON
export function getClientUserRole(): string {
  if (typeof window === "undefined") return "";

  const roleCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("user_role="));

  return roleCookie ? roleCookie.split("=")[1] : "";
}
