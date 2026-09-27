import { QuickLinks } from "@/src/components/QuickLinks";
import { Bell } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import * as cheerio from "cheerio";
import HaberlerSlider from "@/src/components/HaberlerSlider";
import { getDuyuruData } from "@/lib/get-duyurular";

export const revalidate = 14400;

interface Duyuru {
  title: string;
  link: string;
  date: string;
}

export const metadata = {
  title: "Ana Sayfa | BASKİ Portal",
  description: "BASKİ Bilgi İşlem Portalı - Güncel Haberler ve Duyurular",
};

async function getBaskiData() {
  const haberler: any[] = [];

  // HABERLERİ ÇEKEN KOD BLOĞU
  try {
    const newsRes = await fetch("https://www.balsu.gov.tr/haberler", {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const rawHtml = await newsRes.text();
    const $news = cheerio.load(rawHtml);

    $news("a[href]").each((i, el) => {
      const href = $news(el).attr("href") || "";
      const text = $news(el).text().trim();

      const dateMatch = text.match(/(\d{2}\.\d{2}\.\d{4})/);
      const isNewsLink =
        href.startsWith("//www.balsu.gov.tr/") &&
        !href.includes("haberler") &&
        href.split("/").length === 4;

      if (dateMatch && isNewsLink && haberler.length < 6) {
        const date = dateMatch[1];
        const title = text.replace(date, "").trim();
        const img =
          $news(el).find("img").attr("src") ||
          $news(el).find("img").attr("data-src");

        const cleanImg = img
          ? (img.startsWith("http") ? img : `https://www.balsu.gov.tr${img}`)
              .replace(/[?&]mode=resize/, "")
              .replace(/[?&]width=\d+/, "")
              .replace(/\?$/, "")
          : null;

        if (title.length > 5) {
          haberler.push({
            title,
            image: cleanImg,
            link: `https:${href}`,
            date,
          });
        }
      }
    });
  } catch (e) {
    console.error("Haberler çekilemedi:", e);
  }

  // DUYURULARI ÇEKEN KOD BLOĞU
  const duyuruVerisi = await getDuyuruData();
  const duyurular = duyuruVerisi.slice(0, 4);

  return { haberler, duyurular };
}

export default async function HomePage() {
  const { haberler, duyurular } = await getBaskiData();

  return (
    <div className="space-y-10 p-4 max-w-400 mx-auto">
      {/* Hızlı Erişim */}
      <section className="space-y-4">
        <h1 className="text-2xl text-muted-foreground font-bold tracking-tight px-1 max-md:text-[16px]">
          Hızlı Erişim
        </h1>
        <QuickLinks />
      </section>

      {/* Ana Bölüm */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SOL */}
        <section className="lg:col-span-6 flex flex-col p-5">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-bold flex items-center text-muted-foreground max-md:text-[16px]">
              Güncel Haberler
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="max-md:text-[12px] transition-all duration-300 hover:bg-accent hover:text-accent-foreground dark:hover:bg-slate-800/80"
              asChild
            >
              <a
                href="https://www.balsu.gov.tr/haberler"
                target="_blank"
                className="hover:border-[#009DDE]/50"
              >
                Tüm Haberler
              </a>
            </Button>
          </div>
          <div className="mt-8 flex-1">
            <HaberlerSlider haberler={haberler} />
          </div>
        </section>

        {/* SAĞ: Duyurular Liste */}
        <section className="lg:col-span-6 flex flex-col rounded-2xl border border-[#009DDE]/40 bg-[#006FB9]/3 dark:bg-[#006FB9]/10 p-5">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-bold flex items-center text-muted-foreground max-md:text-[16px]">
              Duyurular
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="text-xs md:text-sm transition-all duration-300 hover:bg-accent hover:text-accent-foreground dark:hover:bg-slate-800/80"
              asChild
            >
              <a
                href="https://www.balsu.gov.tr/duyurular"
                target="_blank"
                className="hover:border-[#009DDE]/50"
              >
                Tüm Duyurular
              </a>
            </Button>
          </div>

          {/* Duyurular map*/}
          <div className="mt-8 grid gap-3 flex-1">
            {duyurular.length > 0 ? (
              duyurular.map((duyuru: Duyuru, i: number) => (
                <a
                  key={i}
                  href={duyuru.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-[#006FB9] shadow-sm transition-all duration-300 group hover:bg-accent hover:text-accent-foreground dark:hover:bg-slate-800/80 h-23 max-lg:h-20"
                >
                  <div className="size-10 shrink-0 flex items-center justify-center bg-[#009DDE]/10 text-[#006FB9] rounded-full group-hover:bg-[#006FB9] group-hover:text-white transition-colors duration-500 dark:bg-[#006FB9]/20 dark:text-[#009DDE]">
                    <Bell className="size-4" />
                  </div>

                  <div className="flex flex-col flex-1 min-w-0 gap-2">
                    <span className="text-sm max-md:text-[11px] font-semibold text-muted-foreground group-hover:text-foreground line-clamp-2 transition-colors duration-500 leading-snug">
                      {duyuru.title}
                    </span>
                    <span className="text-xs max-md:text-[10px] font-bold text-muted-foreground/80 group-hover:text-foreground shrink-0 tracking-tight transition-colors duration-500">
                      {duyuru.date}
                    </span>
                  </div>
                </a>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-10 italic text-sm">
                Duyuru çekilemedi.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
