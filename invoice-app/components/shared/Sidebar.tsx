"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CreditCard, 
  Receipt, 
  TrendingUp, 
  Settings,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"
import { motion } from "framer-motion"
import { ThemeToggle } from "./ThemeToggle"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "Invoices",
    icon: FileText,
    href: "/invoices",
  },
  {
    label: "Clients",
    icon: Users,
    href: "/clients",
  },
  {
    label: "Payments",
    icon: CreditCard,
    href: "/payments",
  },
  {
    label: "Expenses",
    icon: Receipt,
    href: "/expenses",
  },
  {
    label: "Reports",
    icon: TrendingUp,
    href: "/reports",
  },
  {
    label: "Cash Flow",
    icon: TrendingUp,
    href: "/cashflow",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-card border-r shadow-sm">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold text-lg"
          >
            I
          </motion.div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            Invoice<span className="text-brand-primary">Flow</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 px-4 space-y-1">
        {routes.map((route) => {
          const isActive = pathname === route.href || (route.href !== "/" && pathname.startsWith(route.href))
          
          return (
            <motion.div
              key={route.href}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={route.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group",
                  isActive
                    ? "text-brand-primary"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-brand-primary/10 rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <route.icon className={cn(
                  "h-5 w-5",
                  isActive ? "text-brand-primary" : "text-slate-500 group-hover:text-slate-900"
                )} />
                {route.label}
              </Link>
            </motion.div>
          )
        })}
      </div>

      <div className="p-4 border-t flex items-center justify-between gap-4">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 flex-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
        <ThemeToggle />
      </div>
    </div>
  )
}
