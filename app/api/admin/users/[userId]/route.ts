import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

interface Params {
  promise: Promise<unknown>
  userId: string
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
    // Add cors headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    }

    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers }
      )
    }

    const body = await request.json()
    const { role } = body

    if (!role || !['USER', 'ADMIN'].includes(role)) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Invalid role' }),
        { status: 400, headers }
      )
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: params.userId,
      },
      data: {
        role: role as Role,
      },
    })

    return new NextResponse(
      JSON.stringify({
        success: true,
        user: updatedUser,
      }),
      { status: 200, headers }
    )
  } catch (error) {
    console.error('Error updating user:', error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Failed to update user',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
