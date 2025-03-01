import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ReservationStatus } from '@prisma/client'

interface Params {
  promise: Promise<unknown>
  reservationId: string
  then: <TResult1 = unknown, TResult2 = never>(
    onfulfilled?: ((value: unknown) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) => Promise<TResult1 | TResult2>
  catch: <TResult = never>(
    onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null
  ) => Promise<unknown>
  finally: (onfinally?: (() => void) | null) => Promise<unknown>
  [Symbol.toStringTag]: string
}

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (!status || !Object.values(ReservationStatus).includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      )
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: params.reservationId },
      data: { status },
      include: {
        car: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedReservation,
      message: `Reservation status updated to ${status}`,
    })
  } catch (error) {
    console.error('Error in PATCH reservation:', error)
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to update reservation',
      },
      { status: 500 }
    )
  }
}
