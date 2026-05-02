"use client"

import { useExpenses, useDeleteExpense } from "@/hooks/use-api"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Receipt, 
  TrendingDown, 
  Layers, 
  Loader2, 
  MoreHorizontal, 
  Eye, 
  Trash, 
  Edit 
} from "lucide-react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { ExpenseFormDialog } from "./ExpenseFormDialog"
import Link from "next/link"

export function ExpensesContent() {
  const { data, isLoading, error } = useExpenses()
  const deleteMutation = useDeleteExpense()
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)

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
        Error loading expenses.
      </div>
    )
  }

  const { expenses, stats } = data

  const handleDelete = () => {
    if (expenseToDelete) {
      deleteMutation.mutate(expenseToDelete, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false)
          setExpenseToDelete(null)
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total (This Month)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalThisMonth)}</div>
            <p className="text-xs text-muted-foreground mt-1">Month-to-date spending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{stats.topCategory ? stats.topCategory.name : 'None'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.topCategory ? `${formatCurrency(stats.topCategory.amount)} spent` : 'No expenses recorded'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Total expenses tracked</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense: any) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{formatDate(expense.expenseDate)}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {expense.category}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">{expense.description}</TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(Number(expense.amount), expense.currency)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/expenses/${expense.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Link>
                        </DropdownMenuItem>
                        <div onClick={(e) => e.stopPropagation()}>
                          <ExpenseFormDialog 
                            mode="edit" 
                            expense={expense} 
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                            }
                          />
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600"
                          onClick={() => {
                            setExpenseToDelete(expense.id)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No expenses found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Expense"
        description="Are you sure you want to delete this expense record? This action cannot be undone."
        confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete"}
        variant="danger"
      />
    </div>
  )
}
