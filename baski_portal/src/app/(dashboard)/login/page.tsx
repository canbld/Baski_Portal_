import { LoginForm } from "@/src/components/LoginForm";

export const metadata = {
  title: "Giriş | BASKİ Portal Yönetim",

  description: "BASKİ Portal Düzenleme Merkezi Yetkili Girişi",
};

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <LoginForm />
    </div>
  );
}
