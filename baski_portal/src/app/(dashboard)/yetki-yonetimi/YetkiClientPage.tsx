"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { handleLogout } from "@/lib/auth-helpers";
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
  ShieldAlert,
  Building2,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  Loader2,
  Trash2,
  Shield,
  LogOut,
} from "lucide-react";

export default function YetkiClientPage({
  data = [],
  totalCount = 0,
  currentPage = 1,
  query = "",
}: any) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(query);
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  // Yetki atama ve mevcut yetkililer için state'ler
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState("UNIT_MANAGER");
  const [authorizedUsersList, setAuthorizedUsersList] = useState<any[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);

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

  // Veritabanındaki mevcut yetkilileri çeken fonksiyon
  const fetchAuthorizedUsers = async () => {
    try {
      const res = await fetch("/api/admin/manage");
      if (res.ok) {
        const list = await res.json();
        setAuthorizedUsersList(list);
      }
    } catch (e) {
      console.error("Mevcut yetkililer yüklenemedi.");
    }
  };

  useEffect(() => {
    fetchAuthorizedUsers();
  }, []);

  useEffect(() => {
    if (debouncedSearch !== query) {
      router.push(`/yetki-yonetimi?q=${debouncedSearch}&page=1`);
    }
  }, [debouncedSearch, router, query]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      router.push(`/yetki-yonetimi?q=${searchTerm}&page=${newPage}`);
    }
  };

  // YETKİ EKLEME / GÜNCELLEME TALEBİ
  const handleGrantPermission = async () => {
    if (!selectedUser) return;
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/admin/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bridgeId: String(selectedUser.id),
          fullName: selectedUser.adSoyad,
          role: selectedRole,
          unitId: selectedUser.unitId || "100",
          unitName: selectedUser.birim,
        }),
      });

      if (res.ok) {
        setModalConfig({
          isOpen: true,
          title: "İşlem Başarılı",
          message: `🎉 ${selectedUser.adSoyad} başarıyla yetkilendirildi!`,
          type: "success",
        });
        setSelectedUser(null);
        fetchAuthorizedUsers();
        router.refresh();
      } else {
        const errData = await res.json();
        setModalConfig({
          isOpen: true,
          title: "Hata",
          message: errData.message || "Bir hata oluştu",
          type: "error",
        });
      }
    } catch (e) {
      setModalConfig({
        isOpen: true,
        title: "Sistemsel Hata",
        message: "Sistemsel bir hata meydana geldi.",
        type: "error",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // YETKİ KALDIRMA TALEBİ (DELETE)
  const executeRevokePermission = async (bridgeId: string) => {
    closeModal();
    try {
      const res = await fetch("/api/admin/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bridgeId: String(bridgeId),
          action: "DELETE",
        }),
      });

      if (res.ok) {
        setModalConfig({
          isOpen: true,
          title: "Başarılı",
          message: "Yetki başarıyla kaldırıldı.",
          type: "success",
        });
        fetchAuthorizedUsers();
        router.refresh();
      } else {
        setModalConfig({
          isOpen: true,
          title: "Başarısız",
          message: "Yetki kaldırılamadı.",
          type: "error",
        });
      }
    } catch (e) {
      setModalConfig({
        isOpen: true,
        title: "Hata",
        message: "İşlem sırasında bir hata oluştu.",
        type: "error",
      });
    }
  };

  const handleRevokePermission = async (bridgeId: string, name: string) => {
    const targetUser = authorizedUsersList.find((u) => u.bridgeId === bridgeId);

    const superAdminCount = authorizedUsersList.filter(
      (u) => u.role === "SUPER_ADMIN",
    ).length;

    if (targetUser?.role === "SUPER_ADMIN" && superAdminCount <= 1) {
      setModalConfig({
        isOpen: true,
        title: "Kritik Engel",
        message: "Son SUPER_ADMIN silinemez.",
        type: "warning",
      });
      return;
    }

    setModalConfig({
      isOpen: true,
      title: "Yetki Kaldırma Onayı",
      message: `⚠️ ${name} isimli personelin TÜM portal yöneticilik yetkisini kaldırmak istediğinize emin misiniz?`,
      type: "confirm",
      onConfirm: () => executeRevokePermission(bridgeId),
    });
  };

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(indexOfFirstItem + itemsPerPage, totalCount);

  return (
    <div className="p-4 md:p-6 space-y-8 w-full">
      <GlobalModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
      />
      {/* SEÇİLEN KULLANICI YETKİLENDİRME PANELİ */}
      {selectedUser && (
        <Card className="border border-primary/20 bg-primary/5 shadow-md animate-in fade-in-50 duration-200">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldAlert className="size-4 text-primary" />
              {selectedUser.adSoyad} İçin Rol Belirleyin
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4 pb-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-medium">
                Atanacak Rol
              </span>
              <select
                className="p-2 rounded-md border bg-background text-sm font-semibold"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="UNIT_MANAGER">
                  UNIT_MANAGER (Yerel Birim Sorumlusu)
                </option>
                <option value="SUPER_ADMIN">SUPER_ADMIN (Tam Yetkili)</option>
              </select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleGrantPermission}
                disabled={submitLoading}
                className="h-9 cursor-pointer"
              >
                {submitLoading ? (
                  <Loader2 className="animate-spin size-4 mr-1" />
                ) : (
                  <ShieldCheck className="size-4 mr-1" />
                )}
                Yetkiyi Kaydet
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedUser(null)}
                disabled={submitLoading}
                className="h-9 cursor-pointer"
              >
                İptal Et
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* TÜM KURUM PERSONELİ*/}
        <Card className="xl:col-span-2 shadow-sm border-none bg-background/50 overflow-hidden">
          <CardHeader className="border-b px-4 md:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <User className="size-5" />
                <CardTitle className="text-lg font-bold tracking-tight">
                  Kurum Personel Listesi
                </CardTitle>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="İsim veya birim ara..."
                  className="w-full pl-10 h-10 border-gray-300 focus-visible:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-bold pl-6 text-foreground">
                      Ad Soyad
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      Birim
                    </TableHead>
                    <TableHead className="font-bold text-center text-foreground">
                      İşlem
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((kisi: any) => (
                    <TableRow
                      key={kisi.id}
                      className="hover:bg-muted/60 border-b last:border-0"
                    >
                      <TableCell className="font-semibold py-4 pl-6 text-sm">
                        {kisi.adSoyad}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="size-4 shrink-0" />
                          <span className="max-w-[200px]">{kisi.birim}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 font-bold border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer"
                          onClick={() => {
                            setSelectedUser(kisi);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          Yetkilendir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>

          {/* PAGINATION PANELİ */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t bg-muted/5 gap-4">
              <div className="text-[11px] text-muted-foreground font-medium order-2 sm:order-1">
                <strong>{totalCount}</strong> kayıttan{" "}
                <strong>
                  {indexOfFirstItem + 1}-{indexOfLastItem}
                </strong>{" "}
                arası.
              </div>
              <div className="flex items-center gap-1 order-1 sm:order-2">
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
          {/* MEVCUT ADMİNLER PANOSU */}
          <Card className="shadow-sm border-none bg-background/50 overflow-hidden">
            <CardHeader className="border-b bg-primary/5 py-4 flex items-center justify-start">
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-primary" />
                <CardTitle className="text-lg font-bold tracking-tight">
                  Mevcut Yetkililer
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 max-h-[500px] overflow-y-auto divide-y">
              {authorizedUsersList.length > 0 ? (
                authorizedUsersList.map((admin: any) => (
                  <div
                    key={admin.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">
                        {admin.fullName}
                      </p>
                      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                        <span className="font-semibold text-primary text-sm uppercase tracking-wider">
                          {admin.role}
                        </span>
                        {admin.unitName && (
                          <span className="w-full text-left inline-block">
                            📍 {admin.unitName}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
                      onClick={() =>
                        handleRevokePermission(admin.bridgeId, admin.fullName)
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground italic">
                  Henüz yetkilendirilmiş kimse yok.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
