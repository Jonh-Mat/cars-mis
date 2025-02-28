import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { ReservationStatus } from '@prisma/client'

interface Params {
  promise: Promise<any>
  reservationId: string
  then: (onfulfilled?: ((value: any) => any) | undefined) => Promise<any>
  catch: (onrejected?: ((reason: any) => any) | undefined) => Promise<any>
  finally: (onfinally?: (() => void) | undefined) => Promise<any>
  [Symbol.toStringTag]: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
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

    try {
      if (status === ReservationStatus.CONFIRMED) {
        await prisma.car.update({
          where: { id: updatedReservation.carId },
          data: { isAvailable: false },
        })
      } else if (
        [ReservationStatus.CANCELLED, ReservationStatus.COMPLETED].includes(
          status
        )
      ) {
        await prisma.car.update({
          where: { id: updatedReservation.carId },
          data: { isAvailable: true },
        })
      }
    } catch (carUpdateError) {
      console.error('Failed to update car availability:', carUpdateError)
    }

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
