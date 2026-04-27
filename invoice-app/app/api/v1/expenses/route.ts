export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: session.user.id },
      orderBy: { expenseDate: 'desc' },
    })

    const totalThisMonth = expenses
      .filter(e => e.expenseDate >= new Date(new Date().getFullYear(), new Date().getMonth(), 1))
      .reduce((acc, e) => acc + Number(e.amount), 0)

    const categories = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
      return acc
    }, {} as Record<string, number>)

    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]

    return NextResponse.json({
      expenses,
      stats: {
        totalThisMonth,
        topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
        totalCount: expenses.length
      }
    })
  } catch (error) {
    console.error("Expenses fetch error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { amount, description, category, expenseDate, currency } = body

    const expense = await prisma.expense.create({
      data: {
        amount: Number(amount),
        description,
        category: category.toUpperCase(),
        expenseDate: new Date(expenseDate),
        currency: currency || "USD",
        userId: session.user.id
      }
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error("Expense creation error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
