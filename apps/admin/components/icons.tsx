import { Activity, Bell, BookOpen, ChevronDown, FileText, Home, Menu, Moon, Search, Settings, Shield, Sun, Users, X } from "lucide-react";

export const icons = { Activity, Bell, BookOpen, ChevronDown, FileText, Home, Menu, Moon, Search, Settings, Shield, Sun, Users, X };
export type IconName = keyof typeof icons;

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const Component = icons[name];
  return <Component size={size} strokeWidth={1.8} aria-hidden="true" />;
}
