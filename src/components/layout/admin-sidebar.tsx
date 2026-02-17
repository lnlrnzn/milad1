"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Building2,
  Store,
  MessageSquare,
  Bot,
  ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clients", label: "Kunden", icon: Users },
  { href: "/admin/properties", label: "Immobilien", icon: Building2 },
  { href: "/admin/marketplace", label: "Marktplatz", icon: Store },
  { href: "/admin/messages", label: "Nachrichten", icon: MessageSquare },
  { href: "/admin/assistant", label: "KI-Assistent", icon: Bot },
]

function NavContent() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminSidebar() {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <Link
          href="/admin"
          className="font-heading text-xl font-bold text-sidebar-primary"
        >
          SDIA Admin
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <NavContent />
      </div>
      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5 shrink-0" />
          <span>Zum Portal</span>
        </Link>
      </div>
    </aside>
  )
}

export function MobileAdminSidebar({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-64 bg-sidebar p-0 border-sidebar-border"
      >
        <SheetHeader className="flex h-16 items-center px-6 border-b border-sidebar-border">
          <SheetTitle className="font-heading text-xl font-bold text-sidebar-primary">
            SDIA Admin
          </SheetTitle>
        </SheetHeader>
        <div onClick={() => onOpenChange(false)}>
          <NavContent />
        </div>
        <div className="border-t border-sidebar-border p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5 shrink-0" />
            <span>Zum Portal</span>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}
