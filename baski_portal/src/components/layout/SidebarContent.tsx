import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/src/components/ui/button";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { adminManagementItems } from "@/src/constants/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  navCategories,
  SidebarContentProps,
  externalLinks,
} from "@/src/constants/navigation";

import { Menu, Star, SquareMenu, Search, SignpostBig } from "lucide-react";

import {
  navItemsMenu,
  navCategories as staticCategories,
} from "@/src/constants/navigation";
import { DynamicIcon } from "@/src/components/DynamicIcon";

export function SidebarContent({
  className,
  collapsed,
  onToggle,
  userRole,
}: SidebarContentProps & { onToggle?: () => void; userRole?: string }) {
  const [dynamicSidebar, setDynamicSidebar] = useState<any[]>([]);
  useEffect(() => {
    const fetchSidebarLinks = async () => {
      try {
        const res = await fetch("/api/get-nav");
        const data = await res.json();
        setDynamicSidebar(data.sidebar || []);
      } catch (e) {
        console.error("Sidebar dinamik verileri çekilemedi");
      }
    };
    fetchSidebarLinks();

    window.addEventListener("nav-updated", fetchSidebarLinks);

    return () => {
      window.removeEventListener("nav-updated", fetchSidebarLinks);
    };
  }, []);

  const mergedCategories = staticCategories.map((category) => {
    const dynamicItems = dynamicSidebar.filter(
      (d: any) => d.category === category.title && !d.subGroup,
    );

    const updatedSubGroups = category.subGroups?.map((sub) => {
      const dynamicSubItems = dynamicSidebar.filter(
        (d: any) => d.subGroup === sub.title,
      );
      return {
        ...sub,
        items: [...sub.items, ...dynamicSubItems],
      };
    });

    return {
      ...category,
      items: category.items ? [...category.items, ...dynamicItems] : undefined,
      subGroups: updatedSubGroups,
    };
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [closedItems, setClosedItems] = useState<string[]>(
    navCategories.map((c) => c.title),
  );
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("baski_favorites");
      if (saved) return JSON.parse(saved);
    }
    return [
      "BaskiWEB Yönetim Paneli",
      "FLEXWATER",
      "BASKİ PERAŞ",
      "Coğrafi Bilgi Sistemi",
      "SCADA",
      "Faaliyet Takip",
      "Stok Takip",
      "PDKS",
    ];
  });
  const allItems = mergedCategories.flatMap((cat) => {
    const directItems = cat.items || [];
    const subGroupItems = cat.subGroups?.flatMap((sub) => sub.items) || [];
    return [...directItems, ...subGroupItems];
  });

  const favoriteItems = allItems.filter((item) => {
    const isFavorite = favorites.includes(item.label);
    const matchesSearch = searchQuery
      ? item.label.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return isFavorite && matchesSearch;
  });

  const toggleFavorite = (label: string) => {
    setFavorites((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  };

  const filteredCategories = mergedCategories
    .map((category) => {
      if (category.items) {
        const filteredItems = category.items.filter((item) => {
          const matchesSearch = item.label
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
          const notFavorite = !favorites.includes(item.label);
          return matchesSearch && notFavorite;
        });
        if (filteredItems.length > 0) {
          return { ...category, items: filteredItems, subGroups: undefined };
        }
        return null;
      }
      if (category.subGroups) {
        const filteredSubGroups = category.subGroups
          .map((sub) => ({
            ...sub,
            items: sub.items.filter((item) => {
              const matchesSearch = item.label
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
              const notFavorite = !favorites.includes(item.label);
              return matchesSearch && notFavorite;
            }),
          }))
          .filter((sub) => sub.items.length > 0);
        if (filteredSubGroups.length > 0) {
          return {
            ...category,
            items: undefined,
            subGroups: filteredSubGroups,
          };
        }
        return null;
      }
      return null;
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  const openItems =
    searchQuery.trim() !== ""
      ? [
          ...navCategories
            .filter((category) => {
              const items =
                category.items ||
                category.subGroups?.flatMap((s) => s.items) ||
                [];
              return items.some(
                (item) =>
                  !favorites.includes(item.label) &&
                  item.label.toLowerCase().includes(searchQuery.toLowerCase()),
              );
            })
            .map((c) => c.title),
          ...(allItems.some(
            (item) =>
              favorites.includes(item.label) &&
              item.label.toLowerCase().includes(searchQuery.toLowerCase()),
          )
            ? ["favorites"]
            : []),
        ]
      : ["favorites", ...navCategories.map((c) => c.title)].filter(
          (item) => !closedItems.includes(item),
        );

  useEffect(() => {
    localStorage.setItem("baski_favorites", JSON.stringify(favorites));
  }, [favorites]);

  if (!mounted) {
    return <div className={cn("h-full w-full bg-background", className)} />;
  }
  const visibleAdminItems = adminManagementItems.filter((item) =>
    item.allowedRoles.includes(userRole || ""),
  );
  return (
    <div className={cn("flex h-full w-full flex-col", className)}>
      <div
        className={cn(
          "flex h-14 items-center shrink-0 border-b border-border transition-all duration-300 ",
          collapsed ? "justify-end pr-4" : "px-3 justify-between",
        )}
      >
        {!collapsed && (
          <Link
            href="/"
            className="flex items-center gap-1 overflow-hidden shrink-0 pl-1"
          >
            <div className="size-10 rounded shrink-0 flex items-center justify-center text-white relative">
              <Image
                src="/img/baski_logo_v3.png"
                alt="BASKİ Logo"
                sizes="40px"
                fill
                className="object-contain p-1"
              />
            </div>
            <span className="text-base font-semibold tracking-tight whitespace-nowrap">
              BASKİPortal
            </span>
          </Link>
        )}

        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="shrink-0 cursor-pointer"
          >
            <Menu className="size-5 " />
          </Button>
        )}
      </div>

      {/*---------- NAVİGASYON ALANI ----------*/}
      <ScrollArea className="flex-1 min-h-0">
        {/*----- MENÜ -----*/}
        <div className="min-h-fit">
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="flex items-center gap-2 px-4 pt-5 pb-2">
                  <SquareMenu className="size-5 text-muted-foreground" />
                  <h3 className="text-muted-foreground text-sm font-bold uppercase tracking-tight">
                    Menü
                  </h3>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <nav
            className={cn(
              "flex flex-col gap-2 py-2 pb-4 max-md:px-2 max-md:pr-3 overflow-hidden",
              collapsed ? "px-3" : "pl-3.75 pr-6",
            )}
          >
            {navItemsMenu.map((item) => (
              <Button
                key={item.label}
                variant="outline"
                className={cn(
                  "h-11 transition-all duration-300 hover:shadow-md ",
                  "hover:bg-accent hover:text-accent-foreground dark:hover:bg-slate-800/80",
                  collapsed ? "shadow-none" : "shadow-md",
                )}
                asChild
              >
                <Link
                  href={item.href}
                  target={(item as any).target}
                  className={cn(
                    "flex items-center w-full overflow-hidden ",
                    collapsed ? "justify-start gap-0" : "justify-start gap-3",
                  )}
                >
                  <div className="flex items-center justify-center w-4 shrink-0">
                    <item.icon className="size-5 shrink-0" strokeWidth={1.75} />
                  </div>
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                        animate={{ opacity: 1, width: "auto", marginLeft: 0 }}
                        exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="truncate whitespace-nowrap font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </Button>
            ))}
            {visibleAdminItems.map((item) => (
              <Button
                key={item.label}
                variant="outline"
                className={cn(
                  "h-11 transition-all duration-300 hover:shadow-md border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground",
                  collapsed ? "shadow-none" : "shadow-md",
                )}
                asChild
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center w-full overflow-hidden",
                    collapsed ? "justify-start gap-0" : "justify-start gap-3",
                  )}
                >
                  <div className="flex items-center justify-center w-4 shrink-0">
                    <item.icon className="size-5 shrink-0" strokeWidth={1.75} />
                  </div>
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="truncate whitespace-nowrap font-bold"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </Button>
            ))}
          </nav>

          {!collapsed && (
            <div className="px-4 pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-2 size-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Uygulama ara..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-400 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}

          {/*----- AKORDİYON ALANI -----*/}
          <AnimatePresence mode="wait">
            {collapsed ? (
              <motion.div
                key="collapsed-view"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex flex-col gap-4 py-6 px-2 w-full"
              >
                <div className="pl-4.5">
                  <Star className="size-5 text-yellow-500 fill-yellow-500" />
                </div>

                <div className="flex flex-col gap-3 w-full items-start pl-[9px]">
                  {favoriteItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-10 shadow-none shrink-0 hover:shadow-md transition-shadow"
                        asChild
                      >
                        <Link
                          href={item.href}
                          rel={
                            (item as any).target === "_blank"
                              ? "noopener noreferrer"
                              : undefined
                          }
                        >
                          <item.icon className="size-5 text-primary/80 group-hover:text-primary transition-transform" />
                          <span className="sr-only">{item.label}</span>
                        </Link>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="expanded-view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
              >
                <Accordion
                  type="multiple"
                  value={openItems}
                  onValueChange={(newOpenItems) => {
                    const allPossible = [
                      "favorites",
                      ...navCategories.map((c) => c.title),
                    ];
                    setClosedItems(
                      allPossible.filter(
                        (item) => !newOpenItems.includes(item),
                      ),
                    );
                  }}
                  className="px-2 pb-6"
                >
                  {/* FAVORİLER SEKMESİ */}
                  {favoriteItems.length > 0 && (
                    <AccordionItem value="favorites" className="border-none">
                      {!collapsed && (
                        <>
                          <AccordionTrigger className="hover:no-underline py-3 px-2 cursor-pointer ">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold uppercase tracking-tight">
                              <Star className="size-5 text-yellow-500 fill-yellow-500" />
                              FAVORİLER
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-2 pl-2 pr-4 space-y-2 max-md:p-2">
                            {favoriteItems.map((item) => (
                              <div key={item.label}>
                                <div className="flex items-center w-full h-10 rounded-md border border-input bg-background px-3 text-[13px] shadow-sm hover:shadow-md transition-all duration-300 hover:bg-accent hover:text-accent-foreground">
                                  <div className="flex items-center w-full truncate">
                                    <Link
                                      href={item.href}
                                      className="flex items-center gap-3 flex-1"
                                      target={(item as any).target}
                                      rel={
                                        (item as any).target === "_blank"
                                          ? "noopener noreferrer"
                                          : undefined
                                      }
                                    >
                                      <div className="w-6 flex justify-center">
                                        {typeof item.icon === "string" ? (
                                          <DynamicIcon
                                            name={item.icon}
                                            className="size-5 text-primary/80"
                                          />
                                        ) : (
                                          <item.icon className="size-5 text-primary/80" />
                                        )}
                                      </div>
                                      <span className="font-medium">
                                        {item.label}
                                      </span>
                                    </Link>
                                    <button
                                      type="button"
                                      className="cursor-pointer bg-transparent border-0 p-0"
                                      onClick={() => toggleFavorite(item.label)}
                                    >
                                      <Star
                                        className={cn(
                                          "size-4 cursor-pointer",
                                          favorites.includes(item.label)
                                            ? "text-yellow-500 fill-yellow-500"
                                            : "text-gray-300",
                                        )}
                                      />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </AccordionContent>
                        </>
                      )}
                    </AccordionItem>
                  )}

                  {/* DİĞER KATEGORİLER */}
                  {!collapsed &&
                    filteredCategories.map((category) => (
                      <AccordionItem
                        key={category.title}
                        value={category.title}
                        className="border-none"
                      >
                        <AccordionTrigger className="hover:no-underline py-3 px-2 cursor-pointer whitespace-nowrap ">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold uppercase tracking-tight ">
                            <category.icon className="size-5" />
                            {category.title}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-2 pr-2 space-y-2 max-md:p-0 max-md:m-0">
                          {category.subGroups ? (
                            category.subGroups.map((sub) => (
                              <div key={sub.title}>
                                <p className="pl-2 text-[13px] font-bold text-muted-foreground/80 uppercase mb-2 tracking-tight ">
                                  {sub.title}
                                </p>
                                <div className="grid gap-1.5 pl-2 pr-2">
                                  {sub.items.map((item) => (
                                    <div key={item.label}>
                                      <div className="flex items-center w-full h-10 rounded-md border border-input bg-background px-3 text-[13px] shadow-sm hover:shadow-md transition-all duration-300 hover:bg-accent hover:text-accent-foreground">
                                        <div className="flex items-center w-full truncate">
                                          <Link
                                            href={item.href}
                                            className="flex items-center gap-3 w-full "
                                            target={(item as any).target}
                                            rel={
                                              (item as any).target === "_blank"
                                                ? "noopener noreferrer"
                                                : undefined
                                            }
                                          >
                                            <div className="w-6 flex justify-center">
                                              {typeof item.icon === "string" ? (
                                                <DynamicIcon
                                                  name={item.icon}
                                                  className="size-5 shrink-0"
                                                />
                                              ) : (
                                                <item.icon className="size-5 shrink-0" />
                                              )}
                                            </div>
                                            <span className="truncate flex-1 font-medium">
                                              {item.label}
                                            </span>
                                          </Link>
                                          <button
                                            type="button"
                                            className="cursor-pointer bg-transparent border-0 p-0"
                                            onClick={() =>
                                              toggleFavorite(item.label)
                                            }
                                          >
                                            <Star
                                              className={cn(
                                                "size-4 cursor-pointer z-50",
                                                favorites.includes(item.label)
                                                  ? "text-yellow-500 fill-yellow-500"
                                                  : "text-gray-300",
                                              )}
                                            />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="grid gap-1.5 pl-2 pr-2 ">
                              {category.items?.map(
                                (item) =>
                                  !favorites.includes(item.label) && (
                                    <div key={item.label}>
                                      <div className="flex items-center w-full h-10 rounded-md border border-input bg-background px-3 text-[13px] shadow-sm hover:shadow-md transition-all duration-300 hover:bg-accent hover:text-accent-foreground">
                                        <div className="flex items-center w-full truncate">
                                          <Link
                                            href={item.href}
                                            className="flex items-center gap-3 flex-1"
                                            target={(item as any).target}
                                            rel={
                                              (item as any).target === "_blank"
                                                ? "noopener noreferrer"
                                                : undefined
                                            }
                                          >
                                            <div className="w-6 flex justify-center">
                                              {typeof item.icon === "string" ? (
                                                <DynamicIcon
                                                  name={item.icon}
                                                  className="size-5 shrink-0"
                                                />
                                              ) : (
                                                <item.icon className="size-5 shrink-0" />
                                              )}
                                            </div>
                                            <span className="truncate flex-1  font-medium">
                                              {item.label}
                                            </span>
                                          </Link>
                                          <button
                                            type="button"
                                            className="cursor-pointer bg-transparent border-0 p-0"
                                            onClick={() =>
                                              toggleFavorite(item.label)
                                            }
                                          >
                                            <Star
                                              className={cn(
                                                "size-4 cursor-pointer z-50",
                                                favorites.includes(item.label)
                                                  ? "text-yellow-500 fill-yellow-500"
                                                  : "text-gray-300",
                                              )}
                                            />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ),
                              )}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              </motion.div>
            )}
          </AnimatePresence>
          {/* WEB SİTELERİ ALANI */}
          {!collapsed && (
            <div className="flex flex-col justify-center items-start p-4 ">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold  tracking-tight">
                <SignpostBig className="size-5" />
                WEB SİTELERİ
              </div>
              <div className="flex flex-col gap-3 pt-3 pr-2">
                {externalLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center leading-tight w-full h-12 rounded-md border border-input bg-background px-1 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-accent hover:text-accent-foreground"
                  >
                    {/* Logo Konteynırı */}
                    <div className="size-8 rounded shrink-0 relative">
                      <Image
                        src={link.logo}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-contain p-1"
                      />
                    </div>

                    {/* Yazı Alanı */}
                    <span className="text-sm font-medium leading-[1.3] text-foreground tracking-tight">
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
