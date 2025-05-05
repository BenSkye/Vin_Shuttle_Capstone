export interface Rating {
  _id: string
  tripId: string
  customerId: string
  rate: number
  feedback: string
  createdAt: string
  updatedAt: string
}

export interface RatingQuery {
  sortOrder?: 'asc' | 'desc'
  orderBy?: string
  skip?: number
  limit?: number
  serviceType?: string
  feedback?: string
  rate?: number
  driverId?: string
  customerId?: string
}
