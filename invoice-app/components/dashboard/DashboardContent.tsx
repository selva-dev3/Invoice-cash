"use client"

import { 
  FileText, 
  Users, 
  CreditCard, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboardStats } from "@/hooks/use-api"
import { motion } from "framer-motion"
import { staggeredContainer, slideUpItem } from "@/components/shared/AnimatedPage"

export function DashboardContent() {
  const { data, isLoading, error } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center text-red-500">
        Error loading dashboard data.
      </div>
    )
  }

  const { stats, recentInvoices } = data

  return (
    <motion.div 
      className="space-y-8"
      variants={staggeredContainer}
      initial="initial"
      animate="animate"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={slideUpItem}>
          <StatCard 
            title="Outstanding" 
            value={formatCurrency(stats.totalOutstanding)} 
            icon={<FileText className="h-4 w-4 text-muted-foreground" />}
            description="Sum of all unpaid invoices"
          />
        </motion.div>
        <motion.div variants={slideUpItem}>
          <StatCard 
            title="Paid (This Month)" 
            value={formatCurrency(stats.totalPaidMonth)} 
            icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
            description="+12% from last month"
            trend="up"
          />
        </motion.div>
        <motion.div variants={slideUpItem}>
          <StatCard 
            title="Overdue" 
            value={stats.overdueCount.toString()} 
            icon={<AlertCircle className="h-4 w-4 text-red-500" />}
            description="Requires immediate attention"
            variant="danger"
          />
        </motion.div>
        <motion.div variants={slideUpItem}>
          <StatCard 
            title="Total Clients" 
            value={stats.totalClients.toString()} 
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            description="Active client base"
          />
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <motion.div variants={slideUpItem} className="col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Cash Flow Forecast (30 Days)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-slate-50 rounded-md border border-dashed">
                <TrendingUp className="mr-2 h-4 w-4" />
                Forecast visualization...
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={slideUpItem} className="col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices.map((invoice: any, i: number) => (
                  <motion.div 
                    key={invoice.id} 
                    className="flex items-center"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                  >
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{invoice.client.name}</p>
                      <p className="text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
                    </div>
                    <div className="ml-auto font-medium">
                      {formatCurrency(Number(invoice.total), invoice.currency)}
                    </div>
                  </motion.div>
                ))}
                {recentInvoices.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent invoices</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon, 
  description, 
  trend,
  variant 
}: { 
  title: string, 
  value: string, 
  icon: React.ReactNode, 
  description: string,
  trend?: 'up' | 'down',
  variant?: 'danger'
}) {
  return (
    <Card className="transition-all hover:shadow-md hover:-translate-y-1 duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${variant === 'danger' ? 'text-red-600' : ''}`}>{value}</div>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          {trend === 'up' && <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />}
          {trend === 'down' && <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />}
          {description}
        </div>
      </CardContent>
    </Card>
  )
}
