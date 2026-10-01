"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import {
  Home,
  Star,
  Folder,
  PanelLeft,
  Menu,
  X,
  MoreHorizontal,
} from "lucide-react";
import { itemTypes, collections, currentUser } from "@/lib/mock-data";
import { iconMap } from "./icon-map";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  const expanded = !collapsed && !isMobile;
  const showLabels = expanded || (isMobile && mobileOpen);
  const sidebarWidth = isMobile ? "w-[280px]" : collapsed ? "w-16" : "w-[248px]";

  const favoriteCollections = collections.filter((c) => c.isFavorite);
  const recentCollections = collections.filter((c) => !c.isFavorite).slice(0, 4);

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Mobile toggle */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-3.5 left-3 z-30 flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
        >
          <Menu className="size-[18px]" />
        </button>
      )}

      {/* Desktop toggle in top bar */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground md:flex"
        >
          <PanelLeft className="size-[18px]" />
        </button>
      )}

      {/* Backdrop for mobile */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${sidebarWidth} ${
          isMobile
            ? `fixed inset-y-0 left-0 z-40 transition-transform duration-200 ${
                mobileOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : "relative shrink-0 transition-[width] duration-200"
        } flex h-full flex-col overflow-hidden border-r border-border bg-[#0d0d0f]`}
      >
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center gap-2.5 px-4">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground font-mono text-xs font-semibold text-background">
            ds
          </div>
          {showLabels && (
            <span className="text-[15px] font-semibold tracking-tight">
              DevStash
            </span>
          )}
          {isMobile && mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="ml-auto flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Nav content */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto overflow-x-hidden px-2.5 pb-4 pt-2">
          {/* Dashboard & Favorites */}
          <div className="flex flex-col gap-0.5">
            <NavItem
              href="/dashboard"
              icon={<Home className="size-4" />}
              label="Dashboard"
              showLabels={showLabels}
              onClick={() => setMobileOpen(false)}
            />
            <NavItem
              href="/dashboard/favorites"
              icon={<Star className="size-4" />}
              label="Favorites"
              showLabels={showLabels}
              onClick={() => setMobileOpen(false)}
            />
          </div>

          {/* Types */}
          <div className="flex flex-col gap-0.5">
            {showLabels && (
              <div className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Types
              </div>
            )}
            {itemTypes.map((type) => {
              const Icon = iconMap[type.icon];
              return (
                <NavItem
                  key={type.id}
                  href={`/items/${type.slug}`}
                  icon={
                    Icon ? (
                      <Icon className="size-4" style={{ color: type.color }} />
                    ) : (
                      <span className="size-4" />
                    )
                  }
                  label={type.name}
                  count={type.itemCount}
                  showLabels={showLabels}
                  pro={type.pro}
                  onClick={() => setMobileOpen(false)}
                />
              );
            })}
          </div>

          {/* Collections */}
          <div className="flex flex-col gap-0.5">
            {showLabels && (
              <div className="flex items-center justify-between px-2.5 pb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Collections
                </span>
              </div>
            )}

            {showLabels && favoriteCollections.length > 0 && (
              <>
                {favoriteCollections.map((col) => (
                  <NavItem
                    key={col.id}
                    href={`/collections/${col.id}`}
                    icon={<Folder className="size-4 text-muted-foreground/60" />}
                    label={col.name}
                    count={col.itemCount}
                    showLabels={showLabels}
                    isFavorite
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
              </>
            )}

            {recentCollections.map((col) => (
              <NavItem
                key={col.id}
                href={`/collections/${col.id}`}
                icon={<Folder className="size-4 text-muted-foreground/60" />}
                label={col.name}
                count={col.itemCount}
                showLabels={showLabels}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </div>
        </div>

        {/* User area */}
        <div className="shrink-0 border-t border-border p-3">
          <div
            className={`flex items-center gap-2.5 ${
              showLabels ? "px-1" : "justify-center"
            }`}
          >
            <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
              {initials}
            </div>
            {showLabels && (
              <>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[13px] font-medium">
                    {currentUser.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground/60">
                    {currentUser.email}
                  </span>
                </div>
                <MoreHorizontal className="size-4 shrink-0 text-muted-foreground/60" />
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function NavItem({
  href,
  icon,
  label,
  count,
  showLabels,
  pro,
  isFavorite,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  showLabels: boolean;
  pro?: boolean;
  isFavorite?: boolean;
  onClick?: () => void;
}) {
  return (
    <NextLink
      href={href}
      onClick={onClick}
      title={label}
      className={`flex h-[34px] items-center gap-2.5 rounded-lg px-2.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground ${
        showLabels ? "" : "justify-center"
      }`}
    >
      <span className="flex shrink-0">{icon}</span>
      {showLabels && (
        <>
          <span className="flex-1 truncate text-[13.5px] font-medium">
            {label}
          </span>
          {pro && (
            <span className="rounded bg-purple-500/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-purple-300">
              PRO
            </span>
          )}
          {isFavorite && <Star className="size-3 fill-yellow-300 text-yellow-300" />}
          {count !== undefined && (
            <span className="font-mono text-xs text-muted-foreground/60">
              {count}
            </span>
          )}
        </>
      )}
    </NextLink>
  );
}
