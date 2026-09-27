"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  AlertTriangle,
  Search,
  Building,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Phone,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/lib/utils";
import { dinamikBirimler } from "@/src/constants/navigation";

export default function NobetciPersonelPage({
  initialShifts = [],
}: {
  initialShifts: any[];
}) {
  const [selectedBirim, setSelectedBirim] = useState(dinamikBirimler[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const hasNobetci = (birimAd: string) => {
    const temizBirimAd = birimAd
      .toLocaleLowerCase("tr-TR")
      .replace("dairesi başkanlığı", "")
      .trim();

    return initialShifts.some((s) => {
      const dbBirim = s.unitName.toLocaleLowerCase("tr-TR").trim();
      if (
        temizBirimAd.includes("işleri") ||
        temizBirimAd.includes("başkanlığı")
      ) {
        return dbBirim.includes(temizBirimAd);
      }
      return dbBirim === birimAd.toLocaleLowerCase("tr-TR").trim();
    });
  };

  const filteredPersonel = initialShifts.filter((p) => {
    const dbBirim = p.unitName.toLocaleLowerCase("tr-TR").trim();
    const secilenBirimAd = selectedBirim.ad.toLocaleLowerCase("tr-TR");
    const temizSecilenBirim = secilenBirimAd
      .replace("dairesi başkanlığı", "")
      .trim();

    let birimMatch = selectedBirim.id === "ALL";
    if (!birimMatch) {
      if (secilenBirimAd.includes("dairesi başkanlığı")) {
        birimMatch = dbBirim.includes(temizSecilenBirim);
      } else {
        birimMatch = dbBirim === secilenBirimAd.trim();
      }
    }

    const searchMatch =
      p.staffName
        .toLocaleLowerCase("tr-TR")
        .includes(searchTerm.toLocaleLowerCase("tr-TR")) ||
      (p.duty &&
        p.duty
          .toLocaleLowerCase("tr-TR")
          .includes(searchTerm.toLocaleLowerCase("tr-TR"))) ||
      p.shiftTime
        .toLocaleLowerCase("tr-TR")
        .includes(searchTerm.toLocaleLowerCase("tr-TR"));

    return birimMatch && searchMatch;
  });

  const totalPages = Math.ceil(filteredPersonel.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPersonel.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBirim]);

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      <div className="flex items-center gap-2 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Nöbetçi Personel Sistemi
        </h1>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        {/* SOL: BİRİMLER LİSTESİ */}
        <Card className="col-span-12 lg:col-span-4 flex flex-col shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b py-4 max-md:py-0">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building className="size-5" /> Kurum Birimleri
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-1 custom-scrollbar">
            <div className="divide-y max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
              {dinamikBirimler.map((birim) => {
                const showWarning = birim.id !== "ALL" && !hasNobetci(birim.ad);

                return (
                  <button
                    key={birim.id}
                    onClick={() => setSelectedBirim(birim)}
                    className={cn(
                      "w-full text-left px-4 py-3 text-sm transition-all flex items-center justify-between group cursor-pointer",
                      selectedBirim.id === birim.id
                        ? "bg-primary/10 text-primary font-bold border-l-4 border-primary"
                        : "hover:bg-muted/50 border-l-4 border-transparent",
                    )}
                  >
                    <span className="truncate pr-2">{birim.ad}</span>
                    {showWarning && (
                      <AlertTriangle className="size-4 text-amber-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* SAĞ: GÜNCEL NÖBETÇİ PERSONEL TABLOSU */}
        <Card className="col-span-12 lg:col-span-8 flex flex-col shadow-md overflow-hidden">
          <CardHeader className="border-b bg-muted/10 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight max-md:text-xs">
                <Users className="size-5 text-primary" />
                {selectedBirim.ad} Güncel Kadrosu
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Nöbetçi veya görev ara..."
                  className="pl-9 h-9 text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 overflow-auto">
            {selectedBirim.id !== "ALL" && !hasNobetci(selectedBirim.ad) ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
                <AlertTriangle className="size-12 text-amber-500/50" />
                <p className="font-medium text-sm px-6 text-center">
                  Bu birim için henüz aktif veya ileri tarihli bir nöbetçi
                  personel planlanmamıştır.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="font-bold">Ad Soyad</TableHead>
                    <TableHead className="font-bold">
                      Bağlı Olduğu Birim
                    </TableHead>
                    <TableHead className="font-bold">Nöbet Görevi</TableHead>{" "}
                    <TableHead className="font-bold text-center">
                      Telefon No
                    </TableHead>{" "}
                    <TableHead className="font-bold text-center">
                      Zaman / Saat
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/20 border-b">
                      <TableCell className="font-bold uppercase text-xs whitespace-nowrap">
                        {p.staffName}
                      </TableCell>
                      <TableCell
                        className="text-xs opacity-80 max-w-[150px]"
                        title={p.unitName}
                      >
                        {p.unitName}
                      </TableCell>

                      <TableCell className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {p.duty || "Genel Nöbetçi"}
                      </TableCell>

                      <TableCell className="text-xs font-mono text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 opacity-70">
                          <Phone className="size-3 text-primary" />
                          <span>
                            {p.staffPhone && p.staffPhone !== "-"
                              ? p.staffPhone
                              : "Telefon Yok"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs">
                        <div className="flex flex-col gap-1 items-center justify-center">
                          <span className="font-bold text-sm opacity-70">
                            📅{" "}
                            {new Date(p.shiftDate).toLocaleDateString("tr-TR")}
                          </span>
                          <div className="flex items-center justify-center gap-1 bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded text-sm font-bold">
                            <Clock className="size-3" />
                            {p.shiftTime}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPersonel.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-10 text-muted-foreground italic text-sm"
                      >
                        Aradığınız kriterlere uygun aktif nöbetçi bulunamadı.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>

          {/* SAYFALAMA KONTROLLERİ */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t bg-muted/5">
              <div className="text-xs text-muted-foreground font-medium">
                Toplam <strong>{filteredPersonel.length}</strong> kayıttan
                <strong>
                  {" "}
                  {indexOfFirstItem + 1}-
                  {Math.min(indexOfLastItem, filteredPersonel.length)}
                </strong>{" "}
                arası gösteriliyor.
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 cursor-pointer"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 cursor-pointer"
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  <span className="text-xs font-bold">{currentPage}</span>
                  <span className="text-xs text-muted-foreground">/</span>
                  <span className="text-xs text-muted-foreground">
                    {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 cursor-pointer"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 cursor-pointer"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
