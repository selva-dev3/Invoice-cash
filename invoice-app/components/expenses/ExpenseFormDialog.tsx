"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Edit } from "lucide-react"
import { useCreateExpense, useUpdateExpense } from "@/hooks/use-api"

const formSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  expenseDate: z.string().min(1, "Date is required"),
  currency: z.string().min(1),
})

const CATEGORIES = [
  "TRAVEL",
  "FOOD",
  "RENT",
  "UTILITIES",
  "MARKETING",
  "SOFTWARE",
  "SALARY",
  "OTHER",
]

interface ExpenseFormDialogProps {
  mode?: "create" | "edit"
  expense?: any
  trigger?: React.ReactNode
}

export function ExpenseFormDialog({ mode = "create", expense, trigger }: ExpenseFormDialogProps) {
  const [open, setOpen] = useState(false)
  const createMutation = useCreateExpense()
  const updateMutation = useUpdateExpense()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      description: "",
      category: "OTHER",
      expenseDate: new Date().toISOString().split('T')[0],
      currency: "USD",
    },
  })

  // Update form values when expense changes (for edit mode)
  useEffect(() => {
    if (mode === "edit" && expense) {
      form.reset({
        amount: expense.amount.toString(),
        description: expense.description,
        category: expense.category,
        expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0],
        currency: expense.currency,
      })
    }
  }, [mode, expense, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (mode === "create") {
      createMutation.mutate(values, {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      })
    } else {
      updateMutation.mutate({ id: expense.id, data: values }, {
        onSuccess: () => {
          setOpen(false)
        },
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-brand-primary hover:bg-brand-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Record Expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Record New Expense" : "Edit Expense"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="0.00" type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expenseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="What was this for?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-brand-primary hover:bg-brand-primary/90"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending 
                ? "Saving..." 
                : mode === "create" ? "Save Expense" : "Update Expense"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
