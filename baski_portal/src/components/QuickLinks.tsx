"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { quickLinks as staticLinks } from "@/src/constants/navigation";
import { DynamicIcon } from "@/src/components/DynamicIcon";

export function QuickLinks() {
  const [dynamicLinks, setDynamicLinks] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/get-nav")
      .then((r) => r.json())
      .then((data) => setDynamicLinks(data.quickLinks || []));
  }, []);

  const linkClassName =
    "group flex flex-col items-center justify-center p-4 rounded-xl border border-[#009DDE]/30 bg-card shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer text-center space-y-3 text-nowrap max-md:text-wrap hover:bg-[#006FB9]/5 hover:border-[#006FB9] dark:hover:bg-[#006FB9]/20 dark:border-[#009DDE]/20";
  return (
    <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3">
      {staticLinks.map((link: any) => {
        const isExternal = link.target === "_blank";

        if (isExternal) {
          return (
            <a
              key={link.title}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              <div
                className={cn(
                  "p-3 rounded-lg text-white shadow-sm group-hover:scale-110 transition-transform duration-500",
                  link.color,
                )}
              >
                <link.icon className="size-6 max-md:size-3" />
              </div>
              <span className="text-muted-foreground font-medium tracking-tight max-md:text-[12px] group-hover:text-foreground transition-colors duration-500">
                {link.title}
              </span>
            </a>
          );
        }

        return (
          <Link key={link.title} href={link.href} className={linkClassName}>
            <div
              className={cn(
                "p-3 rounded-lg text-white shadow-sm group-hover:scale-110 transition-transform duration-500",
                link.color,
              )}
            >
              <link.icon className="size-6 max-md:size-3" />
            </div>
            <span className="text-muted-foreground font-medium tracking-tight max-md:text-[12px] group-hover:text-foreground transition-colors duration-500">
              {link.title}
            </span>
          </Link>
        );
      })}

      {dynamicLinks.map((link: any) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          <div
            className={cn(
              "p-3 rounded-lg text-white shadow-sm group-hover:scale-110 transition-transform duration-500",
              link.color || "bg-blue-600",
            )}
          >
            <DynamicIcon name={link.icon} className="size-6 max-md:size-4" />
          </div>
          <span className="text-muted-foreground font-medium tracking-tight max-md:text-[12px] group-hover:text-foreground transition-colors duration-500">
            {link.label}
          </span>
        </a>
      ))}
    </div>
  );
}
