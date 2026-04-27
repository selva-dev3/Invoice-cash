"use client"

import { useExpense, useDeleteExpense } from "@/hooks/use-api"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  Trash, 
  Edit, 
  Calendar, 
  Tag, 
  DollarSign, 
  FileText,
  Loader2 
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"

export default function ExpenseDetailPage({ params }: { params: { id: string } }) {
  const { data: expense, isLoading, error } = useExpense(params.id)
  const deleteMutation = useDeleteExpense()
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  if (error || !expense) {
    return (
      <div className="flex h-[400px] items-center justify-center text-red-500 text-center space-y-4 flex-col">
        <p>Error loading expense details.</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  const handleDelete = () => {
    deleteMutation.mutate(expense.id, {
      onSuccess: () => {
        router.push("/expenses")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader 
            title="Expense Details" 
            description={`Viewing record ${expense.id.substring(0, 8)}`} 
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Amount</p>
              <p className="text-3xl font-bold text-brand-primary">
                {formatCurrency(Number(expense.amount), expense.currency)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Category</p>
                <div className="mt-1">
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                    {expense.category}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Date</p>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(expense.expenseDate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 leading-relaxed italic border-l-4 border-slate-200 pl-4 py-2 bg-slate-50 rounded-r-md">
              "{expense.description || 'No description provided.'}"
            </p>
            <div className="mt-8 pt-6 border-t space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reference ID</span>
                <span className="font-mono">{expense.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{formatDate(expense.updatedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
