"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  BookOpen, 
  Layers, 
  Mic, 
  PenTool, 
  Languages, 
  LogOut, 
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import type { Dictionary } from "@/i18n/types";
import type { Locale } from "@/i18n/locales";
import { Session } from "next-auth";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface SidebarProps {
  dictionary: Dictionary;
  locale: Locale;
  session: Session | null;
}

export function Sidebar({ dictionary, locale, session }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      href: `/${locale}`,
      icon: Home,
      label: dictionary.navHome,
      exact: true
    },
    {
      href: `/${locale}/2000-palavras`,
      icon: BookOpen,
      label: dictionary.nav2000Words,
      exact: false
    },
    {
      href: `/${locale}/meus-flashcards`,
      icon: Layers,
      label: dictionary.navFlashcards,
      exact: false
    },
    {
      href: `/${locale}/shadowing`,
      icon: Mic,
      label: dictionary.navShadowing,
      exact: false
    },
    {
      href: `/${locale}/ditado`,
      icon: PenTool,
      label: dictionary.navDictation,
      exact: false
    },
    {
      href: `/${locale}/traducao-reversa`,
      icon: Languages,
      label: dictionary.navReverseTranslation,
      exact: false
    }
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside 
      className={`
        relative flex flex-col h-screen bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full p-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-sm z-50"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Logo Area */}
      <div className={`flex items-center h-16 px-4 ${isCollapsed ? "justify-center" : "justify-start"}`}>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xl">E</span>
        </div>
        {!isCollapsed && (
          <span className="ml-3 font-bold text-lg text-zinc-900 dark:text-zinc-50 whitespace-nowrap overflow-hidden">
            {dictionary.title}
          </span>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-6 space-y-2 px-3 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex items-center px-3 py-3 rounded-xl transition-all duration-200 group
                ${active 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100"
                }
                ${isCollapsed ? "justify-center" : ""}
              `}
            >
              <item.icon 
                size={20} 
                className={`shrink-0 ${active ? "text-white" : ""}`} 
              />
              
              {!isCollapsed && (
                <span className="ml-3 font-medium whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section (User & Settings) */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
        {/* Language Switcher */}
        <div className={`flex ${isCollapsed ? "justify-center" : "justify-between"} items-center`}>
           {!isCollapsed && <span className="text-xs font-medium text-zinc-500 uppercase">{dictionary.languageLabel}</span>}
           <LanguageSwitcher currentLocale={locale} isCollapsed={isCollapsed} />
        </div>

        {session ? (
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50`}>
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <User size={16} />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                  {session.user?.name || "User"}
                </p>
                <p className="text-xs text-zinc-500 truncate">
                  {session.user?.email}
                </p>
              </div>
            )}
            {!isCollapsed && (
              <button 
                onClick={() => signOut()}
                className="text-zinc-400 hover:text-red-500 transition-colors"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        ) : (
          <Link
            href={`/${locale}/login`}
            className={`
              flex items-center justify-center w-full py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity
              ${isCollapsed ? "px-0" : "px-4"}
            `}
          >
            <User size={18} />
            {!isCollapsed && <span className="ml-2 text-sm font-medium">{dictionary.loginTitle}</span>}
          </Link>
        )}
      </div>
    </aside>
  );
}
