"use client";

import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function HaberlerSlider({ haberler }: { haberler: any[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="space-y-4 w-full">
      {/* ANA HABER ALANI */}
      <div className="relative group rounded-xl overflow-hidden border border-border shadow-sm aspect-17/10">
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full">
            {haberler.map((haber, index) => (
              <div
                className="relative flex-[0_0_100%] min-w-0 h-full group/item"
                key={index}
              >
                <a
                  href={haber.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block h-full w-full"
                >
                  <Image
                    src={haber.image || "/img/placeholder.png"}
                    alt={haber.title}
                    fill
                    className={cn(
                      "object-cover transition-transform duration-500 group-hover/item:scale-105",
                      "will-change-transform transform-gpu backface-hidden",
                    )}
                    priority={index === 0}
                    sizes="(max-width: 1536px) 100vw, 1200px"
                  />

                  {/* HOVER BİLGİ KATMANI */}
                  <div
                    className={cn(
                      "absolute inset-0 flex items-end transition-opacity duration-300",
                      // Masaüstü
                      "lg:bg-slate-900/70 lg:opacity-0 lg:group-hover/item:opacity-100 lg:p-6",
                      // Mobil
                      "max-lg:opacity-100 max-lg:p-0",
                    )}
                  >
                    <div
                      className={cn(
                        "w-full space-y-1 p-4",
                        // Mobil
                        "max-lg:bg-slate-900/75 max-lg:min-h-15 max-lg:flex max-lg:flex-col max-lg:justify-center max-lg:space-y-0",
                        // Masaüstün
                        "lg:space-y-2",
                      )}
                    >
                      <p className="text-sm font-bold text-blue-400 max-lg:text-[9px]">
                        {haber.date}
                      </p>
                      <h3 className="text-lg md:text-xl max-lg:text-[10px] font-semibold text-white leading-tight line-clamp-2">
                        {haber.title}
                      </h3>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* OKLAR */}
        <button
          onClick={scrollPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex z-10"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex z-10"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* ÖNİZLEME */}
      <div className="flex justify-center items-center gap-2 overflow-x-auto py-1 no-scrollbar">
        {haberler.map((haber, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={cn(
              "relative transition-all duration-300 rounded-md overflow-hidden border-2 shrink-0  cursor-pointer",
              selectedIndex === index
                ? "w-16 h-10 border-blue-500 scale-110 shadow-sm"
                : "w-12 h-8 border-transparent opacity-50 hover:opacity-100",
            )}
          >
            <Image
              src={haber.image || "/img/placeholder.png"}
              loading="eager"
              alt="thumb"
              fill
              className="object-cover"
              sizes="100px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
