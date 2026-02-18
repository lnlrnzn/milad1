"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  FileText,
  Store,
  MessageSquare,
  Users,
  Bot,
  Settings,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Immobilien", icon: Building2 },
  { href: "/documents", label: "Dokumente", icon: FileText },
  { href: "/marketplace", label: "Marktplatz", icon: Store },
  { href: "/messages", label: "Nachrichten", icon: MessageSquare },
  { href: "/contacts", label: "Kontakte", icon: Users },
  { href: "/assistant", label: "KI-Assistent", icon: Bot },
  { href: "/settings", label: "Einstellungen", icon: Settings },
]

function NavContent({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/")
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

      {isAdmin && (
        <>
          <div className="my-2 border-t border-sidebar-border" />
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <span>Admin-Bereich</span>
          </Link>
        </>
      )}
    </nav>
  )
}

export function Sidebar({ isAdmin }: { isAdmin?: boolean }) {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="font-heading text-xl font-bold text-sidebar-primary">
          SDIA
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col">
        <NavContent isAdmin={isAdmin} />
      </div>
    </aside>
  )
}

export function MobileSidebar({
  open,
  onOpenChange,
  isAdmin,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  isAdmin?: boolean
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 bg-sidebar p-0 border-sidebar-border">
        <SheetHeader className="flex h-16 items-center px-6 border-b border-sidebar-border">
          <SheetTitle className="font-heading text-xl font-bold text-sidebar-primary">
            SDIA
          </SheetTitle>
        </SheetHeader>
        <div role="presentation" onClick={() => onOpenChange(false)}>
          <NavContent isAdmin={isAdmin} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
