"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { subeler } from "@/src/constants/navigation";
import { Mail, ChevronRight, Users } from "lucide-react";

export default function BilgiIslemPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedSube, setSelectedSube] = useState(0);

  return (
    <div className="flex flex-col md:flex-row h-dvh w-full bg-background overflow-hidden relative text-foreground">
      {/* SAĞ İÇERİK ALANI */}
      <main className="flex-1 h-full overflow-hidden flex flex-col p-4 bg-muted/10 box-border">
        <div className="flex flex-col h-full max-h-full max-w-[1600px] w-full mx-auto gap-4 overflow-hidden min-h-0">
          {/* ÜST BAŞLIK VE DAİRE BAŞKANI KARTI */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center bg-background p-4 rounded-xl border border-muted shadow-sm shrink-0">
            <div className="space-y-1 text-center lg:text-left lg:col-span-1">
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-primary">
                Bilgi İşlem Dairesi Başkanlığı
              </h1>
              <p className="text-xs text-muted-foreground font-semibold">
                Organizasyon Şeması ve Personel Listesi
              </p>
            </div>

            <div className="lg:col-span-2 flex justify-center lg:justify-end w-full">
              <div className="flex items-center gap-4 p-3 bg-primary/5 border border-primary/10 rounded-xl w-full max-w-md shadow-sm">
                <div className="p-2.5 bg-primary/10 text-primary rounded-lg hidden sm:block">
                  <Users className="size-5" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h2 className="text-base font-bold text-foreground truncate">
                    Dr. Uğur DOĞAN
                  </h2>
                  <p className="text-xs font-medium text-primary">
                    Bilgi İşlem Dairesi Başkanı
                  </p>
                  <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground italic truncate">
                    <Mail className="size-3 shrink-0" /> ugur.dogan@balsu.gov.tr
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ŞUBE VE PERSONEL ALANI*/}
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-5 gap-4 overflow-hidden max-h-full">
            {/* SOL PANEL: Şube Listesi */}
            <div className="md:col-span-2 flex flex-col space-y-2 overflow-y-auto pr-1 max-h-full min-h-0">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 shrink-0">
                Şube Müdürlükleri
              </span>
              {subeler.map((sube, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSube(index)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border text-left transition-all text-xs md:text-sm font-semibold shadow-sm w-full shrink-0",
                    selectedSube === index
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted border-muted text-foreground",
                  )}
                >
                  <span className="pr-2 line-clamp-2">{sube.baslik}</span>
                  <ChevronRight
                    className={cn(
                      "size-4 shrink-0 transition-transform",
                      selectedSube === index && "rotate-90 md:rotate-0",
                    )}
                  />
                </button>
              ))}
            </div>

            {/* SAĞ PANEL */}
            <div className="md:col-span-3 bg-background border border-muted rounded-xl p-4 flex flex-col overflow-hidden shadow-sm max-h-full min-h-0">
              <div className="border-b pb-2 mb-3 shrink-0">
                <h3 className="text-sm font-bold text-primary">
                  {subeler[selectedSube]?.baslik}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Aktif Personel Listesi
                </p>
              </div>

              {/* Personel Listesi Kaydırma Alanı */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0">
                {subeler[selectedSube]?.personeller.map((personel, pIndex) => (
                  <div
                    key={pIndex}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors border border-transparent hover:border-muted/50 text-[13px] shrink-0"
                  >
                    <div className="font-bold text-foreground">
                      {personel.ad}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-medium">{personel.unvan}</span>
                      <span className="bg-background border border-muted px-2 py-0.5 rounded text-[11px] font-mono shadow-sm">
                        Dahili: {personel.dahili}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MOBİL MENÜ OVERLAY */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
