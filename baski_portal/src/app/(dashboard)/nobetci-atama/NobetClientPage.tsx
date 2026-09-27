"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { handleLogout } from "@/lib/auth-helpers";
import { dutyOptions } from "@/src/constants/navigation";
import { GlobalModal } from "@/src/components/GlobalModal";
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
  Calendar,
  Building2,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Loader2,
  CalendarCheck,
  LogOut,
  Trash2,
  Briefcase,
} from "lucide-react";

export default function NobetClientPage({
  data = [],
  totalCount = 0,
  currentPage = 1,
  query = "",
  userRole,
}: any) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(query);
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  // Form State'leri
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [shiftDate, setShiftDate] = useState("");

  const [duty, setDuty] = useState("Tüm İşlemler");
  // Saatler state yapısı
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");

  const [loading, setLoading] = useState(false);
  const [savedShifts, setSavedShifts] = useState<any[]>([]);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info" | "confirm";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const closeModal = () =>
    setModalConfig((prev) => ({ ...prev, isOpen: false }));

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const hh = hour.toString().padStart(2, "0");
        const mm = min.toString().padStart(2, "0");
        options.push(`${hh}:${mm}`);
      }
    }
    options.push("23:59");
    return options;
  };
  const timeOptions = generateTimeOptions();

  const fetchShifts = async () => {
    try {
      const res = await fetch("/api/admin/shifts?panel=true");
      if (res.ok) {
        const list = await res.json();
        setSavedShifts(list);
      }
    } catch (e) {
      console.error("Nöbet listesi yüklenemedi.");
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  useEffect(() => {
    if (debouncedSearch !== query) {
      router.push(`/nobetci-atama?q=${debouncedSearch}&page=1`);
    }
  }, [debouncedSearch, router, query]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      router.push(`/nobetci-atama?q=${searchTerm}&page=${newPage}`);
    }
  };

  // NÖBET SİLME
  const executeCancelShift = async (id: number) => {
    closeModal();
    try {
      const res = await fetch(`/api/admin/shifts?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setModalConfig({
          isOpen: true,
          title: "Başarılı",
          message: "Nöbet planı başarıyla iptal edildi.",
          type: "success",
        });
        fetchShifts();
      } else {
        setModalConfig({
          isOpen: true,
          title: "Hata",
          message: "Nöbet silinirken bir hata oluştu.",
          type: "error",
        });
      }
    } catch (e) {
      setModalConfig({
        isOpen: true,
        title: "Bağlantı Hatası",
        message: "Sunucu ile bağlantı kurulamadı.",
        type: "error",
      });
    }
  };

  const handleCancelShift = async (id: number, staffName: string) => {
    setModalConfig({
      isOpen: true,
      title: "Nöbet İptal Onayı",
      message: `⚠️ ${staffName} isimli personelin bu nöbetini iptal etmek istediğinize emin misiniz?`,
      type: "confirm",
      onConfirm: () => executeCancelShift(id),
    });
  };
  // NÖBETİ VERİ TABANINA KAYDETME
  const handleSaveShift = async () => {
    if (!selectedStaff || !shiftDate || !startTime || !endTime) {
      setModalConfig({
        isOpen: true,
        title: "Eksik Bilgi",
        message: "Lütfen tarih ve saat alanlarını eksiksiz doldurun.",
        type: "warning",
      });
      return;
    }

    const selectedDate = new Date(shiftDate);
    const today = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setModalConfig({
        isOpen: true,
        title: "Hatalı Tarih Seçimi",
        message:
          "⚠️ Geçmiş bir tarihe nöbet ataması gerçekleştiremezsiniz. Lütfen bugünü veya gelecek bir tarihi seçin.",
        type: "error",
      });
      return;
    }

    const combinedShiftTime = `${startTime} - ${endTime}`;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: selectedStaff.id,
          staffName: selectedStaff.title || selectedStaff.adSoyad,
          staffPhone:
            selectedStaff.cellPhoneNumber ||
            selectedStaff.extensionNumber ||
            selectedStaff.dahili ||
            "-",
          unitId: selectedStaff.unitId || "100",
          unitName: selectedStaff.birim,
          shiftDate,
          shiftTime: combinedShiftTime,
          duty,
        }),
      });

      if (res.ok) {
        setModalConfig({
          isOpen: true,
          title: "İşlem Başarılı",
          message: `🎉 ${selectedStaff.adSoyad} için nöbet başarıyla yazıldı!`,
          type: "success",
        });
        setSelectedStaff(null);
        setShiftDate("");
        fetchShifts();
      } else {
        setModalConfig({
          isOpen: true,
          title: "Kayıt Hatası",
          message: "Nöbet kaydedilirken bir hata oluştu.",
          type: "error",
        });
      }
    } catch (e) {
      setModalConfig({
        isOpen: true,
        title: "Bağlantı Hatası",
        message: "Sunucu ile bağlantı kurulamadı.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(indexOfFirstItem + itemsPerPage, totalCount);

  return (
    <div className="space-y-8 w-full">
      <GlobalModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
      />
      {/* NÖBET ATAMA FORMU PANELİ */}
      {selectedStaff && (
        <Card className="border border-primary/20 bg-primary/5 shadow-md animate-in slide-in-from-top duration-200">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Calendar className="size-4 text-primary" />
              {selectedStaff.adSoyad} İçin Nöbet Planla
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-4 pb-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-semibold">
                Nöbet Tarihi
              </span>
              <Input
                type="date"
                className="w-48 bg-background"
                min={getTodayDateString()}
                value={shiftDate}
                onChange={(e) => setShiftDate(e.target.value)}
              />
            </div>

            {/* BAŞLANGIÇ SAAT SEÇİCİSİ */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-semibold">
                Başlangıç Saati
              </span>
              <select
                className="p-2 h-10 rounded-md border bg-background text-sm font-medium w-36"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              >
                {timeOptions.map((time) => (
                  <option key={`start-${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* BİTİŞ SAAT SEÇİCİSİ */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-semibold">
                Bitiş Saati
              </span>
              <select
                className="p-2 h-10 rounded-md border bg-background text-sm font-medium w-36"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              >
                {timeOptions.map((time) => (
                  <option key={`end-${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* NÖBET GÖREVİ DROPDOWN SEÇİCİSİ */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-semibold">
                Nöbet Görevi
              </span>
              <select
                className="p-2 h-10 rounded-md border bg-background text-sm font-semibold w-64 focus:ring-1 focus:ring-primary"
                value={duty}
                onChange={(e) => setDuty(e.target.value)}
              >
                {dutyOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSaveShift}
                disabled={loading}
                className="h-10 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="animate-spin size-4 mr-1" />
                ) : (
                  <CalendarCheck className="size-4 mr-1" />
                )}
                Nöbeti Sisteme İşle
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedStaff(null)}
                className="h-10 cursor-pointer"
              >
                İptal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* SOL - YETKİLİ OLUNAN PERSONEL LİSTESİ */}
        <Card className="lg:col-span-2 shadow-sm border-none bg-background/50 overflow-hidden">
          <CardHeader className="border-b py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <User className="size-5" />
                <CardTitle className="text-lg font-bold tracking-tight">
                  {userRole === "SUPER_ADMIN"
                    ? "Tüm Kurum Personelleri"
                    : "Birim Personelleriniz"}
                </CardTitle>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Personel ara..."
                  className="w-full pl-10 h-10 border-gray-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-bold pl-6">Ad Soyad</TableHead>
                  <TableHead className="font-bold">Birim</TableHead>
                  <TableHead className="font-bold text-center">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((kisi: any) => (
                  <TableRow
                    key={kisi.id}
                    className="hover:bg-muted/60 border-b last:border-0"
                  >
                    <TableCell className="font-semibold py-4 pl-6 text-sm">
                      {kisi.title || kisi.adSoyad}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 shrink-0" />
                        <span className="max-w-[200px]">{kisi.birim}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 font-bold border-primary/20 hover:bg-primary hover:text-primary-foreground cursor-pointer"
                        onClick={() => {
                          setSelectedStaff(kisi);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        Nöbet Yaz
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t bg-muted/5">
                <span className="text-xs text-muted-foreground">
                  Toplam {totalCount} personelden {indexOfFirstItem + 1}-
                  {indexOfLastItem} arası
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7 cursor-pointer"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7 cursor-pointer"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="size-3.5" />
                  </Button>
                  <span className="text-xs font-bold px-2">
                    {currentPage}/{totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7 cursor-pointer"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7 cursor-pointer"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col py-6 gap-2">
          <div className="flex items-center justify-end">
            <Button
              onClick={() => handleLogout(router, setModalConfig)}
              variant="outline"
              className="h-11 px-5 text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive rounded-lg group transition-all duration-300 cursor-pointer"
            >
              <LogOut className="size-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold text-sm tracking-tight">
                GÜVENLİ ÇIKIŞ
              </span>
            </Button>
          </div>

          {/* SAĞ - YAZILMIŞ / GELECEK NÖBETLER PANOSU */}
          <Card className="shadow-sm border-none bg-background/50 overflow-hidden">
            <CardHeader className="border-b bg-muted/20 py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Clock className="size-5 text-primary" />
                Planlanan Nöbetler
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[550px] overflow-y-auto divide-y">
              {savedShifts.length > 0 ? (
                savedShifts.map((shift: any) => (
                  <div
                    key={shift.id}
                    className="p-4 space-y-1 hover:bg-muted/20 transition-colors flex items-center justify-between gap-2 group"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="font-bold text-sm text-foreground">
                        {shift.staffName}
                      </p>
                      <p className="text-sm text-muted-foreground font-medium truncate">
                        {shift.unitName}
                      </p>
                      {shift.duty && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold pt-0.5">
                          <Briefcase className="size-3" />
                          <span>{shift.duty}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1 text-sm text-primary font-bold">
                        <span>
                          📅{" "}
                          {new Date(shift.shiftDate).toLocaleDateString(
                            "tr-TR",
                          )}
                        </span>
                        <span className="bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                          ⏱️ {shift.shiftTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground opacity-60 pt-1">
                        Yazan: {shift.createdBy}
                      </p>
                    </div>

                    {/* MANUEL İPTAL BUTONU */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
                      onClick={() =>
                        handleCancelShift(shift.id, shift.staffName)
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground italic">
                  Henüz planlanmış bir nöbet yok.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
