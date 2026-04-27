export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const expense = await prisma.expense.findUnique({
      where: { id: params.id, userId: session.user.id }
    })

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error("Expense fetch error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await prisma.expense.delete({
      where: { id: params.id, userId: session.user.id }
    })

    return NextResponse.json({ message: "Expense deleted" })
  } catch (error) {
    console.error("Expense deletion error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { amount, description, category, expenseDate } = body

    const expense = await prisma.expense.update({
      where: { id: params.id, userId: session.user.id },
      data: {
        amount: amount ? Number(amount) : undefined,
        description,
        category: category ? category.toUpperCase() : undefined,
        expenseDate: expenseDate ? new Date(expenseDate) : undefined,
      }
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error("Expense update error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
