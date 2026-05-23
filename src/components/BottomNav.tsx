import {
  Dumbbell,
  GraduationCap,
  House,
  BookOpen,
  UserRound,
  type LucideIcon
} from "lucide-react";

import type { AppRoute } from "../types/navigation";

type NavItem = {
  route: AppRoute;
  label: string;
  href: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { route: "home", label: "首页", href: "#/home", icon: House },
  { route: "kana", label: "五十音", href: "#/kana", icon: BookOpen },
  { route: "lessons", label: "课程", href: "#/lessons", icon: GraduationCap },
  { route: "practice", label: "练习", href: "#/practice", icon: Dumbbell },
  { route: "profile", label: "我的", href: "#/profile", icon: UserRound }
];

type BottomNavProps = {
  activeRoute: AppRoute;
};

export const BottomNav = ({ activeRoute }: BottomNavProps) => {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-16px_36px_-28px_rgba(15,23,42,0.55)] backdrop-blur"
      aria-label="底部导航"
    >
      <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.route === activeRoute;

          return (
            <a
              key={item.route}
              href={item.href}
              className={`flex min-h-14 flex-col items-center justify-center rounded-lg px-1 text-xs font-medium transition active:scale-95 ${
                active
                  ? "bg-matcha-50 text-matcha-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={`mb-1 h-5 w-5 ${active ? "stroke-[2.5]" : ""}`}
                aria-hidden="true"
              />
              <span>{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
};
