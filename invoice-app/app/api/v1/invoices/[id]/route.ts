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
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id, userId: session.user.id },
      include: {
        client: true,
        items: true,
        payments: {
          orderBy: { paidAt: 'desc' }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const totalPaid = invoice.payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((acc, p) => acc + Number(p.amount), 0)
    
    const balance = Number(invoice.total) - totalPaid

    return NextResponse.json({
      ...invoice,
      totalPaid,
      balance
    })
  } catch (error) {
    console.error("Invoice fetch error:", error)
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
    // Delete associated items and payments first (cascading cleanup)
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: params.id } })
    await prisma.payment.deleteMany({ where: { invoiceId: params.id } })
    
    await prisma.invoice.delete({
      where: { id: params.id, userId: session.user.id }
    })

    return NextResponse.json({ message: "Invoice deleted successfully" })
  } catch (error) {
    console.error("Invoice deletion error:", error)
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
    const { status, dueDate, notes } = body

    const invoice = await prisma.invoice.update({
      where: { id: params.id, userId: session.user.id },
      data: {
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        notes,
      }
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Invoice update error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
