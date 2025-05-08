import { SortOrderOption } from '@/constants/sortOrderOption.enum'

export interface QueryOptions {
  limit?: number
  skip?: number
  orderBy?: string
  sortOrder?: SortOrderOption
}
