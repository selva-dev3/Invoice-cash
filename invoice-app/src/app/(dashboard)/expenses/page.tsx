import { PageHeader } from "@/components/shared/PageHeader"
import { ExpensesContent } from "@/components/expenses/ExpensesContent"
import { ExpenseFormDialog } from "@/components/expenses/ExpenseFormDialog"

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Expenses" 
        description="Track your business spending and categorize your outflows"
        action={<ExpenseFormDialog />}
      />

      <ExpensesContent />
    </div>
  )
}
