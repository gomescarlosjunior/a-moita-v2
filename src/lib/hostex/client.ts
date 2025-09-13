import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { z } from 'zod'

// Hostex API Types
export const HostexCredentialsSchema = z.object({
  accessToken: z.string().min(1, 'Access Token é obrigatório'),
  apiSecret: z.string().optional(),
  baseUrl: z.string().url().default('https://open-api.hostex.io'),
})

export type HostexCredentials = z.infer<typeof HostexCredentialsSchema>

export const PropertySchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  type: z.enum(['apartment', 'house', 'villa', 'cabin', 'other']),
  bedrooms: z.number(),
  bathrooms: z.number(),
  maxGuests: z.number(),
  status: z.enum(['active', 'inactive', 'maintenance']),
  channels: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const ReservationSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  guestName: z.string(),
  guestEmail: z.string(),
  guestPhone: z.string().optional(),
  checkIn: z.string(),
  checkOut: z.string(),
  guests: z.number(),
  status: z.enum(['confirmed', 'pending', 'cancelled', 'completed']),
  channel: z.string(),
  totalAmount: z.number(),
  currency: z.string().default('BRL'),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const AvailabilitySchema = z.object({
  propertyId: z.string(),
  date: z.string(),
  available: z.boolean(),
  minStay: z.number().default(1),
  maxStay: z.number().optional(),
  price: z.number(),
  currency: z.string().default('BRL'),
})

export type Property = z.infer<typeof PropertySchema>
export type Reservation = z.infer<typeof ReservationSchema>
export type Availability = z.infer<typeof AvailabilitySchema>

export interface HostexApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export class HostexApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: string[]
  ) {
    super(message)
    this.name = 'HostexApiError'
  }
}

export class HostexClient {
  private client: AxiosInstance
  private credentials: HostexCredentials

  constructor(credentials: HostexCredentials) {
    this.credentials = HostexCredentialsSchema.parse(credentials)
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Hostex-Access-Token': this.credentials.accessToken,
    }
    if (this.credentials.apiSecret) {
      headers['X-API-Secret'] = this.credentials.apiSecret
    }

    this.client = axios.create({
      baseURL: this.credentials.baseUrl,
      timeout: 30000,
      headers,
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[Hostex API] ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('[Hostex API] Request error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`[Hostex API] Response ${response.status}`)
        return response
      },
      (error) => {
        const message = error.response?.data?.message || error.message
        const statusCode = error.response?.status
        const errors = error.response?.data?.errors

        console.error('[Hostex API] Error:', { message, statusCode, errors })
        
        throw new HostexApiError(message, statusCode, errors)
      }
    )
  }

  // Properties Management
  async getProperties(): Promise<Property[]> {
    const response = await this.client.get<HostexApiResponse<Property[]>>('/properties')
    return response.data.data
  }

  async getProperty(id: string): Promise<Property> {
    const response = await this.client.get<HostexApiResponse<Property>>(`/properties/${id}`)
    return response.data.data
  }

  async createProperty(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
    const response = await this.client.post<HostexApiResponse<Property>>('/properties', property)
    return response.data.data
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    const response = await this.client.put<HostexApiResponse<Property>>(`/properties/${id}`, updates)
    return response.data.data
  }

  // Reservations Management
  async getReservations(propertyId?: string): Promise<Reservation[]> {
    const params = propertyId ? { propertyId } : {}
    const response = await this.client.get<HostexApiResponse<Reservation[]>>('/reservations', { params })
    return response.data.data
  }

  async getReservation(id: string): Promise<Reservation> {
    const response = await this.client.get<HostexApiResponse<Reservation>>(`/reservations/${id}`)
    return response.data.data
  }

  async createReservation(reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Reservation> {
    const response = await this.client.post<HostexApiResponse<Reservation>>('/reservations', reservation)
    return response.data.data
  }

  async updateReservation(id: string, updates: Partial<Reservation>): Promise<Reservation> {
    const response = await this.client.put<HostexApiResponse<Reservation>>(`/reservations/${id}`, updates)
    return response.data.data
  }

  async cancelReservation(id: string, reason?: string): Promise<Reservation> {
    const response = await this.client.post<HostexApiResponse<Reservation>>(`/reservations/${id}/cancel`, { reason })
    return response.data.data
  }

  // Availability Management
  async getAvailability(propertyId: string, startDate: string, endDate: string): Promise<Availability[]> {
    const response = await this.client.get<HostexApiResponse<Availability[]>>('/availability', {
      params: { propertyId, startDate, endDate }
    })
    return response.data.data
  }

  async updateAvailability(propertyId: string, availability: Omit<Availability, 'propertyId'>[]): Promise<void> {
    await this.client.post('/availability', {
      propertyId,
      availability
    })
  }

  // Channel Management
  async getChannels(): Promise<{ id: string; name: string; type: string; status: string }[]> {
    const response = await this.client.get<HostexApiResponse<any[]>>('/channels')
    return response.data.data
  }

  async connectChannel(propertyId: string, channelId: string, credentials: Record<string, any>): Promise<void> {
    await this.client.post(`/properties/${propertyId}/channels/${channelId}/connect`, credentials)
  }

  async disconnectChannel(propertyId: string, channelId: string): Promise<void> {
    await this.client.post(`/properties/${propertyId}/channels/${channelId}/disconnect`)
  }

  // Messaging
  async sendMessage(reservationId: string, message: string, template?: string): Promise<void> {
    await this.client.post(`/reservations/${reservationId}/messages`, {
      message,
      template
    })
  }

  async getMessageTemplates(): Promise<{ id: string; name: string; content: string; trigger: string }[]> {
    const response = await this.client.get<HostexApiResponse<any[]>>('/message-templates')
    return response.data.data
  }

  // Sync Operations
  async syncProperty(propertyId: string): Promise<void> {
    await this.client.post(`/properties/${propertyId}/sync`)
  }

  async syncAllProperties(): Promise<void> {
    await this.client.post('/sync/all')
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health')
      return true
    } catch {
      return false
    }
  }
}
