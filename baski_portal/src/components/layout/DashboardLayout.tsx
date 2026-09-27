"use client";
import { useState, useEffect } from "react";
import {
  Menu,
  Network,
  Coins,
  Computer,
  Maximize,
  Minimize,
  BookOpenText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarContent } from "@/src/components/layout/SidebarContent";
import { Button } from "@/src/components/ui/button";
import { ModeToggle } from "@/src/components/mode-toggle";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";

export function DashboardLayout({
  children,
  userRole,
}: {
  children: React.ReactNode;
  userRole?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [ipAddress, setIpAddress] = useState("Yükleniyor...");
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await fetch("/api/my-ip");
        const data = await response.json();
        setIpAddress(data.ip);
      } catch {
        setIpAddress("Alınamadı");
      }
    };
    fetchIp();
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const handleChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-muted/20 flex">
      <aside
        className={cn(
          "hidden border-r bg-background transition-all duration-300 ease-in-out md:flex flex-col sticky top-0 h-screen shrink-0 overflow-hidden",
          collapsed ? "w-18" : "w-72",
        )}
      >
        <SidebarContent
          userRole={userRole}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </aside>

      {/* Ana İçerik Alanı */}
      <div className="flex flex-col min-h-screen overflow-hidden w-full">
        <header className="sticky top-0 z-20 flex h-14 items-center border-b border-border bg-background/95 px-4 backdrop-blur">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden mr-2">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-65 p-0 "
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <SheetTitle className="sr-only">Navigasyon Menüsü</SheetTitle>
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="flex flex-1 items-center justify-between overflow-x-auto">
            {/* Sol taraf */}
            <div className="flex justify-center items-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 gap-2 cursor-pointer max-md:hidden"
                onClick={toggleFullscreen}
              >
                {fullscreen ? (
                  <Minimize className="size-5" />
                ) : (
                  <Maximize className="size-5" />
                )}
                {fullscreen ? "Tam ekrandan çık" : "Tam ekran"}
              </Button>

              <div className="flex justify-center items-center gap-1.5 ">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 gap-2 cursor-default select-all"
                >
                  <Computer className="size-5" />
                  IP Adresiniz : {ipAddress}
                </Button>
              </div>
            </div>

            {/* Sağ taraf */}
            <div className="flex justify-center items-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 gap-2 cursor-pointer"
                asChild
              >
                <a
                  href="/files/teskilatsemasi_2025kasimgkonaylanan.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Network className="size-5" />
                  Organizasyon Şeması
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 gap-2 cursor-pointer"
                asChild
              >
                <a
                  href="/files/tasarruf_tedbirleri_yonergesi.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Coins className="size-5" />
                  Tasarruf Tedbirleri Yönergesi
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 gap-2 cursor-pointer"
                asChild
              >
                <a
                  href="/files/20247_cumhurbaskanligi_genelgesi.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <BookOpenText className="size-5" />
                  2024/17 Sayılı Cumhurbaşkanlığı Genelgesi
                </a>
              </Button>
              <ModeToggle />
            </div>
          </div>
        </header>

        {/* Sayfa İçeriği */}
        <main className="flex-1 flex flex-col bg-background min-w-0 min-h-0 ">
          {children}
        </main>
      </div>
    </div>
  );
}
