import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    //Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    //Get request body
    const body = await request.json()
    const { carId, userId, startDate, endDate, totalPrice } = body

    //Validate required fields
    if (!carId || !userId || !startDate || !endDate || !totalPrice) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    //check if car is available for the selected dates
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        carId,
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(startDate) } },
              { endDate: { gte: new Date(startDate) } },
            ],
          },
          {
            AND: [
              { startDate: { lte: new Date(endDate) } },
              { endDate: { gte: new Date(endDate) } },
            ],
          },
        ],
      },
    })

    if (existingReservation) {
      return new NextResponse('Car is not available for selected dates', {
        status: 400,
      })
    }

    //Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        carId,
        userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalPrice,
        status: 'PENDING',
      },
    })

    return NextResponse.json(reservation)
  } catch (error) {
    console.error('Reservation error:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
