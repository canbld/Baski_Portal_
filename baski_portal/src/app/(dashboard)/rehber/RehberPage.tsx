"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Search,
  Phone,
  Mail,
  Building2,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Personel } from "@/lib/baski-api";

interface RehberPageProps {
  data: Personel[];
  totalCount: number;
  currentPage: number;
}

export default function RehberPage({
  data = [],
  totalCount = 0,
  currentPage = 1,
  query = "",
}: RehberPageProps & { query: string }) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState(query);
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  useEffect(() => {
    if (debouncedSearch !== query) {
      router.push(`/rehber?q=${debouncedSearch}&page=1`);
    }
  }, [debouncedSearch, router, query]);

  const handlePageChange = (newPage: number) => {
    router.push(`/rehber?q=${searchTerm}&page=${newPage}`);
  };

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(indexOfFirstItem + itemsPerPage, totalCount);

  return (
    <div className="p-4 md:p-6 space-y-6 w-full max-w-450 mx-auto">
      <Card className="shadow-sm border-none bg-background/50 overflow-hidden">
        <CardHeader className="border-b px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Phone className="size-5" />
              <CardTitle className="text-lg font-bold tracking-tight">
                Telefon Rehberi
              </CardTitle>
            </div>

            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="İsim, birim veya dahili ara..."
                className="w-full pl-10 h-10 border-gray-300 focus-visible:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Masaüstü Görünümü */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[25%] font-bold pl-6 text-foreground">
                    Ad Soyad
                  </TableHead>
                  <TableHead className="w-[40%] font-bold text-foreground">
                    Birim
                  </TableHead>
                  <TableHead className="w-[15%] font-bold text-center text-foreground">
                    Dahili
                  </TableHead>
                  <TableHead className="w-[20%] font-bold text-foreground">
                    E-Posta
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((kisi: any) => (
                  <TableRow
                    key={kisi.id}
                    className="hover:bg-muted/60 border-b last:border-0"
                  >
                    <TableCell className="font-semibold py-4 pl-6">
                      {kisi.adSoyad}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Building2 className="size-4 shrink-0" />
                        <span className="truncate">{kisi.birim}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="bg-muted px-3 py-1 rounded-full text-xs font-bold border border-primary/10">
                        {kisi.dahili}
                      </span>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`mailto:${kisi.eposta}`}
                        className="flex items-center gap-2 hover:text-primary transition-colors text-sm truncate"
                      >
                        <Mail className="size-3.5" />
                        {kisi.eposta}
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobil Görünümü */}
          <div className="md:hidden divide-y divide-border">
            {data.length > 0 ? (
              data.map((kisi: any) => (
                <div
                  key={kisi.id}
                  className="p-4 space-y-3 hover:bg-muted/10 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-bold text-sm text-foreground flex items-center gap-2">
                      <User className="size-3.5 text-primary" />
                      {kisi.adSoyad}
                    </div>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[11px] font-bold border border-primary/20">
                      {kisi.dahili}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-[12px]">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="size-3.5 shrink-0" />
                      <span className="line-clamp-1">{kisi.birim}</span>
                    </div>
                    <a
                      href={`mailto:${kisi.eposta}`}
                      className="flex items-center gap-2 text-muted-foreground active:text-primary"
                    >
                      <Mail className="size-3.5 shrink-0" />
                      <span className="truncate">{kisi.eposta}</span>
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-muted-foreground italic text-sm">
                Kayıt bulunamadı.
              </div>
            )}
          </div>
        </CardContent>
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t bg-muted/5 gap-4">
            <div className="text-xs text-muted-foreground font-medium order-2 sm:order-1">
              Toplam <strong>{totalCount}</strong> kayıttan
              <strong>
                {" "}
                {indexOfFirstItem + 1}-{indexOfLastItem}
              </strong>{" "}
              arası gösteriliyor.
            </div>

            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="icon"
                className="size-8 cursor-pointer"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 cursor-pointer"
                onClick={() => handlePageChange(currentPage - 1)}
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
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 cursor-pointer"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
