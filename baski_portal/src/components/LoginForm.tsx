"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { User, LockKeyholeIcon } from "lucide-react";
import Image from "next/image";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        setTimeout(() => {
          router.push("/duzenleme-paneli");
          router.refresh();
        }, 100);
      } else {
        const data = await res.json();
        setError(data.message || "Giriş başarısız.");
      }
    } catch (err) {
      setError("Sunucuya bağlanılamadı. Lütfen internetinizi kontrol edin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center gap-6 border border-border rounded-2xl p-8 bg-card shadow-lg shrink-0"
      style={{
        width: "100%",
        maxWidth: "450px",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {/* LOGO */}
      <div className="flex flex-col items-center space-y-3 w-full">
        <div className="size-10 rounded shrink-0 flex items-center justify-center relative">
          <Image
            src="/img/baski_logo_v3.png"
            alt="BASKİ Logo"
            fill
            className="object-contain"
          />
        </div>
        <div className="text-center">
          <h1 className="text-sm font-semibold text-foreground">
            Düzenleme Merkezi
          </h1>
          <p className="text-sm font-bold tracking-tight text-muted-foreground uppercase">
            Yetkili Giriş
          </p>
        </div>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 w-full min-w-0"
      >
        <div className="flex flex-col gap-4 w-full min-w-0">
          {/* USERNAME ROW */}
          <div className="flex items-center gap-2 w-full min-w-0">
            <div className="flex justify-center items-center p-2 shrink-0">
              <User className="size-6 text-neutral-500" />
            </div>
            <Input
              className="h-11 bg-backgorund focus:outline-none focus:ring-1 focus:ring-primary w-full min-w-0"
              placeholder="Kullanıcı adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="flex items-center gap-2 w-full min-w-0">
            <div className="flex justify-center items-center p-2 shrink-0">
              <LockKeyholeIcon className="size-6 text-neutral-500" />
            </div>
            <Input
              type="password"
              className="h-11 bg-background focus:outline-none focus:ring-1 focus:ring-primary w-full min-w-0"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        {error && (
          <div className="text-xs text-red-400 text-center font-medium">
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="outline"
          className="h-11 cursor-pointer w-full font-bold"
          disabled={isLoading}
        >
          {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>
      </form>

      {/* FOOTER */}
      <div className="text-center text-[11px] text-neutral-500 border-t border-border/50 pt-4 w-full">
        © 2026 Balıkesir Su ve Kanalizasyon İdaresi
      </div>
    </div>
  );
}
