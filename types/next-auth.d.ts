import { DefaultSession, DefaultUser } from 'next-auth'
import { Role } from '@/types'
import { NextPage } from 'next'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user?: {
      id: string
      role: Role
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: Role
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
  }
}

declare module 'next' {
  export interface PageProps {
    params: {
      carId: string
    }
    searchParams?: { [key: string]: string | string[] | undefined }
  }
}
