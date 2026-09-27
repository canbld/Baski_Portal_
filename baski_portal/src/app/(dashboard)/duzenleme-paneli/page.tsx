"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { GlobalModal } from "@/src/components/GlobalModal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { DynamicIcon } from "@/src/components/DynamicIcon";
import { navCategories } from "@/src/constants/navigation";
import { handleLogout } from "@/lib/auth-helpers";
import {
  Loader2,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  LogOut,
  Link2,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function DuzenlemePaneli() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [iconName, setIconName] = useState("HelpCircle");
  const [loading, setLoading] = useState(false);
  const [mainCategory, setMainCategory] = useState("Hızlı Erişim");
  const [selectedSubGroup, setSelectedSubGroup] = useState("");
  const [modal, setModal] = useState<{
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
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
    setDeleteTarget(null); // İptal edilirse hedefi sıfırla
  };
  const handleMainCategoryChange = (val: string) => {
    setMainCategory(val);
    setSelectedSubGroup("");
  };

  const [dynamicLinks, setDynamicLinks] = useState<{
    sidebar: any[];
    quickLinks: any[];
  }>({ sidebar: [], quickLinks: [] });

  const fetchLinks = async () => {
    try {
      const res = await fetch("/api/get-nav");
      const data = await res.json();
      setDynamicLinks(data);
    } catch (e) {
      console.error("Veri çekilemedi");
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const suggestIcon = async () => {
    if (!label || label.trim().length === 0) {
      setIconName("HelpCircle");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/generate-icon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      const data = await res.json();
      setIconName(data.iconName);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!label || !label.trim() || !href)
      return setModal({
        isOpen: true,
        title: "Eksik Alan",
        message: "Başlık ve Link alanlarını doldurun!",
        type: "warning",
      });
    if (mainCategory === "GELİŞTİRME VE ARŞİV" && !selectedSubGroup) {
      return setModal({
        isOpen: true,
        title: "Alt Grup Seçimi Zorunlu",
        message: "Lütfen bu ana kategori için bir alt grup seçin!",
        type: "warning",
      });
    }

    setLoading(true);
    try {
      const hasSubGroups = navCategories.find(
        (c) => c.title === mainCategory,
      )?.subGroups;

      const res = await fetch("/api/save-nav", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          href: href.trim(),
          icon: iconName,
          category: mainCategory,
          subGroup: hasSubGroups ? selectedSubGroup : "",
        }),
      });

      if (res.ok) {
        await fetchLinks();
        router.refresh();
        window.dispatchEvent(new Event("nav-updated"));
        setLabel("");
        setHref("");
        setSelectedSubGroup("");
        setIconName("HelpCircle");

        setModal({
          isOpen: true,
          title: "İşlem Başarılı",
          message: "Yeni bağlantı portala başarıyla eklendi!",
          type: "success",
        });
      }
    } catch (err) {
      setModal({
        isOpen: true,
        title: "Bir hata oluştu",
        message: "Bağlantı eklenemedi. Lütfen tekrar deneyin.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (targetLabel?: string) => {
    if (targetLabel && typeof targetLabel === "string") {
      setDeleteTarget(targetLabel);
      setModal({
        isOpen: true,
        title: "Bağlantıyı Sil",
        message: `"${targetLabel}" bağlantısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
        type: "confirm",
      });
      return;
    }

    if (!deleteTarget) return;

    setModal((prev) => ({ ...prev, isOpen: false })); // Modalı kapat
    setLoading(true);

    try {
      const res = await fetch("/api/delete-nav", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: deleteTarget }),
      });

      if (res.ok) {
        await fetchLinks();
        router.refresh();
        window.dispatchEvent(new Event("nav-updated"));

        setModal({
          isOpen: true,
          title: "Bağlantı Kaldırıldı",
          message: `"${deleteTarget}" bağlantısı portaldan başarıyla silindi.`,
          type: "success",
        });
      } else {
        setModal({
          isOpen: true,
          title: "İşlem Başarısız",
          message: "Silme işlemi sunucu tarafında gerçekleştirilemedi.",
          type: "error",
        });
      }
    } catch (e) {
      setModal({
        isOpen: true,
        title: "Sistemsel Hata",
        message: "Bağlantı silinirken teknik bir sorun oluştu.",
        type: "error",
      });
    } finally {
      setLoading(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden p-6 space-y-6">
      {/* ÜST BANNER / BAŞLIK */}
      <div className="flex items-center justify-between border-b pb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dinamik Menü Yönetimi
          </h1>
          <p className="text-sm text-muted-foreground">
            Portal üzerindeki bağlantıları, kategorileri ve ikonları anlık
            olarak yönetin.
          </p>
        </div>

        <Button
          onClick={() => handleLogout(router, setModal)}
          variant="outline"
          className="h-11 px-5 text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive rounded-lg group transition-all duration-300 cursor-pointer shadow-sm"
        >
          <LogOut className="size-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm tracking-tight">
            GÜVENLİ ÇIKIŞ
          </span>
        </Button>
      </div>

      {/* ANA DÜZEN IZGARASI */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0">
        {/* SOL TARAF: FORM VE ALTINDA ÖNİZLEME (2 Sütun Kaplar) */}
        <div className="lg:col-span-2 flex flex-col space-y-4 min-h-0">
          {/* FORM PANELİ */}
          <Card className="shadow-md shrink-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Link2 className="size-5 text-primary" /> Yeni Bağlantı Tanımla
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                    Hedef Bölge
                  </label>
                  <select
                    className="w-full p-2.5 rounded-md border border-input bg-background text-sm focus:ring-1 focus:ring-primary"
                    value={mainCategory}
                    onChange={(e) => handleMainCategoryChange(e.target.value)}
                  >
                    <option value="Hızlı Erişim">Hızlı Erişim</option>
                    {navCategories.map((cat) => (
                      <option key={cat.title} value={cat.title}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
                </div>

                {navCategories.find((c) => c.title === mainCategory)
                  ?.subGroups && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                      Alt Grup
                    </label>
                    <select
                      className="w-full p-2.5 rounded-md border border-input bg-background text-sm focus:ring-1 focus:ring-primary"
                      value={selectedSubGroup}
                      onChange={(e) => setSelectedSubGroup(e.target.value)}
                    >
                      <option value="">Seçiniz...</option>
                      {navCategories
                        .find((c) => c.title === mainCategory)
                        ?.subGroups?.map((sub) => (
                          <option key={sub.title} value={sub.title}>
                            {sub.title}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                    Bağlantı Başlığı
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="Örn: Arıza Takip"
                      className="h-10"
                    />
                    <Button
                      onClick={suggestIcon}
                      disabled={loading}
                      variant="outline"
                      size="icon"
                      title="Yapay Zeka İkon Öner"
                      className="cursor-pointer h-10 w-10 shrink-0 border-amber-200 bg-amber-50/30 hover:bg-amber-50"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin size-4" />
                      ) : (
                        <Sparkles className="size-4 text-amber-500 fill-amber-500/20" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                    URL / Link Adresi
                  </label>
                  <Input
                    value={href}
                    onChange={(e) => setHref(e.target.value)}
                    placeholder="https://..."
                    className="h-10"
                  />
                </div>
              </div>

              <Button
                onClick={handleSave}
                className="w-full h-11 cursor-pointer font-bold mt-2 shadow-sm transition-all text-sm"
                disabled={loading}
              >
                <Plus className="mr-2 size-4" strokeWidth={2.5} /> Portala
                Güvenli Ekle
              </Button>
            </CardContent>
          </Card>

          {/* ÖNİZLEME (Formun Altında) */}
          <Card className="bg-muted/10 flex-1 flex flex-col items-center justify-center p-6 border-dashed border-2 min-h-[140px]">
            <span className="text-[10px] font-bold tracking-widest opacity-50 uppercase text-center mb-3">
              Sol Menü ve Arayüz Önizlemesi
            </span>
            <div className="w-full max-w-[260px] p-3 bg-background border rounded-lg shadow-md flex items-center justify-between gap-3 border-primary/20 hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center gap-3 truncate">
                <div className="p-2.5 bg-primary/10 rounded-md text-primary shrink-0">
                  <DynamicIcon name={iconName} size={20} />
                </div>
                <span className="font-semibold text-sm truncate">
                  {label || "Uygulama Adı"}
                </span>
              </div>
              <Star className="size-4 text-gray-300 shrink-0 mr-1" />
            </div>
          </Card>
        </div>

        {/* SAĞ TARAF: MEVCUT LİSTE VE SCROLL ÖZELLİĞİ (3 Sütun Kaplar) */}
        <Card className="lg:col-span-3 flex flex-col shadow-md min-h-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4 shrink-0">
            <div>
              <CardTitle className="text-xl">
                Mevcut Dinamik Bağlantılar
              </CardTitle>
              <CardDescription>
                Veritabanında kayıtlı aktif bağlantı listesi.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchLinks}
              className="cursor-pointer h-9 w-9 text-muted-foreground hover:text-foreground"
              title="Listeyi Yenile"
            >
              <RefreshCw className="size-4" />
            </Button>
          </CardHeader>

          {/* İÇ SCROLL ALANI */}
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left border-b sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-4 font-bold uppercase text-[11px] tracking-wider opacity-60">
                      İkon / İsim
                    </th>
                    <th className="p-4 font-bold uppercase text-[11px] tracking-wider opacity-60">
                      Kategori / Grup
                    </th>
                    <th className="p-4 font-bold uppercase text-[11px] tracking-wider opacity-60 text-right pr-6">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[...dynamicLinks.sidebar, ...dynamicLinks.quickLinks].map(
                    (link, i) => (
                      <tr
                        key={i}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        <td className="p-4 flex items-center gap-3">
                          <div className="p-1.5 bg-secondary/40 rounded text-primary/70">
                            <DynamicIcon name={link.icon} size={16} />
                          </div>
                          <span className="font-medium truncate max-w-[180px]">
                            {link.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-[10px] bg-secondary px-2.5 py-1 rounded-full uppercase font-bold text-secondary-foreground tracking-tight">
                            {link.category || "Hızlı Erişim"}
                          </span>
                          {link.subGroup && (
                            <span className="ml-1.5 text-[11px] text-muted-foreground font-medium">
                              / {link.subGroup}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-foreground"
                              asChild
                            >
                              <a
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="size-4" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(link.label)}
                              className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                  {[...dynamicLinks.sidebar, ...dynamicLinks.quickLinks]
                    .length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-8 text-center text-muted-foreground font-medium"
                      >
                        Henüz bir bağlantı eklenmemiş.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </Card>
      </div>
      <GlobalModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
      />
    </div>
  );
}
