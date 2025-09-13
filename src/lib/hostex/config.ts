import { HostexCredentials, HostexCredentialsSchema } from './client'

export interface HostexConfig {
  credentials: HostexCredentials
  webhookSecret?: string
  socketUrl: string
  retryAttempts: number
  retryDelay: number
  syncInterval: number
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigurationError'
  }
}

export function getHostexConfig(): HostexConfig {
  const requiredEnvVars = {
    HOSTEX_ACCESS_TOKEN: process.env.HOSTEX_ACCESS_TOKEN,
    HOSTEX_API_SECRET: process.env.HOSTEX_API_SECRET,
  }

  // Check for missing environment variables
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    throw new ConfigurationError(
      `Missing required environment variables: ${missingVars.join(', ')}`
    )
  }

  try {
    const credentials = HostexCredentialsSchema.parse({
      accessToken: process.env.HOSTEX_ACCESS_TOKEN!,
      apiSecret: process.env.HOSTEX_API_SECRET!,
      baseUrl: process.env.HOSTEX_BASE_URL || 'https://open-api.hostex.io',
    })

    return {
      credentials,
      webhookSecret: process.env.HOSTEX_WEBHOOK_SECRET || undefined,
      socketUrl: process.env.SOCKET_IO_URL || 'ws://localhost:3001',
      retryAttempts: parseInt(process.env.HOSTEX_RETRY_ATTEMPTS || '3'),
      retryDelay: parseInt(process.env.HOSTEX_RETRY_DELAY || '1000'),
      syncInterval: parseInt(process.env.HOSTEX_SYNC_INTERVAL || '300000'), // 5 minutes
    }
  } catch (error) {
    throw new ConfigurationError(
      `Invalid Hostex configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export function validateHostexConfig(): boolean {
  try {
    getHostexConfig()
    return true
  } catch {
    return false
  }
}

// Audit logging for security
export interface AuditLog {
  id: string
  timestamp: string
  action: string
  userId?: string
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export class AuditLogger {
  private logs: AuditLog[] = []

  log(
    action: string,
    details: Record<string, any>,
    userId?: string,
    request?: Request
  ): void {
    const auditLog: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action,
      userId,
      details: this.sanitizeDetails(details),
      ipAddress: this.getClientIP(request),
      userAgent: request?.headers.get('user-agent') || undefined,
    }

    this.logs.push(auditLog)
    console.log('[Audit]', auditLog)

    // In production, you would save this to a database
    // await this.saveToDatabase(auditLog)
  }

  private sanitizeDetails(details: Record<string, any>): Record<string, any> {
    const sanitized = { ...details }

    // Remove sensitive information
    const sensitiveKeys = [
      'password',
      'apiKey',
      'apiSecret',
      'token',
      'secret',
      'accessToken',
    ]
    sensitiveKeys.forEach((key) => {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]'
      }
    })

    return sanitized
  }

  private getClientIP(request?: Request): string | undefined {
    if (!request) return undefined

    return (
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      undefined
    )
  }

  getLogs(limit = 100): AuditLog[] {
    return this.logs.slice(-limit)
  }

  getLogsByAction(action: string, limit = 50): AuditLog[] {
    return this.logs.filter((log) => log.action === action).slice(-limit)
  }

  getLogsByUser(userId: string, limit = 50): AuditLog[] {
    return this.logs.filter((log) => log.userId === userId).slice(-limit)
  }
}

export const auditLogger = new AuditLogger()
