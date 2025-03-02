import { TransmissionType } from '@prisma/client'

export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  USER = 'USER',
}

// Plain search params type for URL queries
export type SearchParamsType = {
  make?: string
  model?: string
  minPrice?: string
  maxPrice?: string
  transmission?: TransmissionType
  year?: string
  page?: string | number
  limit?: string | number
}

// Promise-like type for page props
export type PageSearchParamsType = SearchParamsType & Promise<SearchParamsType>
