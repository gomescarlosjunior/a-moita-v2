import { HostexClient, Reservation } from './client'
import { auditLogger } from './config'
import { format, addDays, parseISO, isBefore, isAfter } from 'date-fns'

export interface MessageTemplate {
  id: string
  name: string
  subject?: string
  content: string
  trigger: MessageTrigger
  language: 'pt' | 'en' | 'es'
  active: boolean
  variables: string[]
  createdAt: string
  updatedAt: string
}

export interface MessageTrigger {
  type:
    | 'booking_confirmed'
    | 'check_in_reminder'
    | 'check_out_reminder'
    | 'post_stay'
    | 'cancellation'
    | 'manual'
  timing:
    | 'immediate'
    | 'hours_before'
    | 'days_before'
    | 'hours_after'
    | 'days_after'
  offset?: number // hours or days depending on timing
  conditions?: {
    channel?: string[]
    propertyId?: string[]
    guestType?: string[]
  }
}

export interface Message {
  id: string
  reservationId: string
  templateId: string
  recipient: {
    name: string
    email: string
    phone?: string
  }
  subject?: string
  content: string
  channel: 'email' | 'sms' | 'whatsapp' | 'in_app'
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  scheduledAt?: string
  sentAt?: string
  deliveredAt?: string
  readAt?: string
  error?: string
  createdAt: string
}

export interface AutomationRule {
  id: string
  name: string
  description: string
  active: boolean
  triggers: MessageTrigger[]
  templates: string[] // template IDs
  conditions: {
    propertyIds?: string[]
    channels?: string[]
    guestTypes?: string[]
    minStayDays?: number
    maxStayDays?: number
  }
  createdAt: string
  updatedAt: string
}

export class MessagingManager {
  private client: HostexClient
  private templates: Map<string, MessageTemplate> = new Map()
  private messages: Map<string, Message> = new Map()
  private automationRules: Map<string, AutomationRule> = new Map()
  private scheduledMessages: Map<string, NodeJS.Timeout> = new Map()

  constructor(client: HostexClient) {
    this.client = client
    this.initializeDefaultTemplates()
  }

  // Template Management
  async createTemplate(
    template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<MessageTemplate> {
    const newTemplate: MessageTemplate = {
      ...template,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.templates.set(newTemplate.id, newTemplate)

    auditLogger.log('CREATE_MESSAGE_TEMPLATE', {
      templateId: newTemplate.id,
      name: newTemplate.name,
      trigger: newTemplate.trigger,
    })

    return newTemplate
  }

  async updateTemplate(
    id: string,
    updates: Partial<MessageTemplate>
  ): Promise<MessageTemplate> {
    const template = this.templates.get(id)
    if (!template) {
      throw new Error(`Template ${id} not found`)
    }

    const updatedTemplate: MessageTemplate = {
      ...template,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    }

    this.templates.set(id, updatedTemplate)

    auditLogger.log('UPDATE_MESSAGE_TEMPLATE', {
      templateId: id,
      changes: Object.keys(updates),
    })

    return updatedTemplate
  }

  async deleteTemplate(id: string): Promise<void> {
    const template = this.templates.get(id)
    if (!template) {
      throw new Error(`Template ${id} not found`)
    }

    this.templates.delete(id)

    auditLogger.log('DELETE_MESSAGE_TEMPLATE', {
      templateId: id,
      name: template.name,
    })
  }

  getTemplates(): MessageTemplate[] {
    return Array.from(this.templates.values())
  }

  getTemplate(id: string): MessageTemplate | undefined {
    return this.templates.get(id)
  }

  // Message Processing
  async processReservationEvent(
    eventType: MessageTrigger['type'],
    reservation: Reservation
  ): Promise<Message[]> {
    try {
      auditLogger.log('PROCESS_RESERVATION_EVENT', {
        eventType,
        reservationId: reservation.id,
        propertyId: reservation.propertyId,
      })

      const applicableRules = this.getApplicableRules(eventType, reservation)
      const messages: Message[] = []

      for (const rule of applicableRules) {
        for (const templateId of rule.templates) {
          const template = this.templates.get(templateId)
          if (!template || !template.active) continue

          const message = await this.createMessageFromTemplate(
            template,
            reservation
          )
          messages.push(message)

          // Schedule or send immediately
          if (template.trigger.timing === 'immediate') {
            await this.sendMessage(message.id)
          } else {
            this.scheduleMessage(message.id, template.trigger, reservation)
          }
        }
      }

      auditLogger.log('PROCESS_RESERVATION_EVENT', {
        eventType,
        reservationId: reservation.id,
        messagesCreated: messages.length,
      })

      return messages
    } catch (error) {
      auditLogger.log('PROCESS_RESERVATION_EVENT', {
        eventType,
        reservationId: reservation.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  async sendMessage(messageId: string): Promise<void> {
    const message = this.messages.get(messageId)
    if (!message) {
      throw new Error(`Message ${messageId} not found`)
    }

    if (message.status !== 'pending') {
      throw new Error(`Message ${messageId} is not in pending status`)
    }

    try {
      auditLogger.log('SEND_MESSAGE', {
        messageId,
        reservationId: message.reservationId,
        channel: message.channel,
        recipient: message.recipient.email,
      })

      // Update message status
      message.status = 'sent'
      message.sentAt = new Date().toISOString()
      this.messages.set(messageId, message)

      // Send via Hostex API (this would be the actual implementation)
      const reservation = await this.client.getReservation(
        message.reservationId
      )
      await this.client.sendMessage(
        message.reservationId,
        message.content,
        message.templateId
      )

      // Simulate delivery confirmation after a delay
      setTimeout(() => {
        message.status = 'delivered'
        message.deliveredAt = new Date().toISOString()
        this.messages.set(messageId, message)
      }, 2000)

      auditLogger.log('SEND_MESSAGE', {
        messageId,
        status: 'sent',
        sentAt: message.sentAt,
      })
    } catch (error) {
      message.status = 'failed'
      message.error = error instanceof Error ? error.message : 'Unknown error'
      this.messages.set(messageId, message)

      auditLogger.log('SEND_MESSAGE', {
        messageId,
        status: 'failed',
        error: message.error,
      })

      throw error
    }
  }

  async sendManualMessage(
    reservationId: string,
    content: string,
    channel: Message['channel'] = 'email'
  ): Promise<Message> {
    try {
      const reservation = await this.client.getReservation(reservationId)

      const message: Message = {
        id: crypto.randomUUID(),
        reservationId,
        templateId: 'manual',
        recipient: {
          name: reservation.guestName,
          email: reservation.guestEmail,
          phone: reservation.guestPhone,
        },
        content,
        channel,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }

      this.messages.set(message.id, message)
      await this.sendMessage(message.id)

      auditLogger.log('SEND_MANUAL_MESSAGE', {
        messageId: message.id,
        reservationId,
        channel,
      })

      return message
    } catch (error) {
      auditLogger.log('SEND_MANUAL_MESSAGE', {
        reservationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  // Automation Rules
  async createAutomationRule(
    rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<AutomationRule> {
    const newRule: AutomationRule = {
      ...rule,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.automationRules.set(newRule.id, newRule)

    auditLogger.log('CREATE_AUTOMATION_RULE', {
      ruleId: newRule.id,
      name: newRule.name,
      triggers: newRule.triggers.map((t) => t.type),
    })

    return newRule
  }

  async updateAutomationRule(
    id: string,
    updates: Partial<AutomationRule>
  ): Promise<AutomationRule> {
    const rule = this.automationRules.get(id)
    if (!rule) {
      throw new Error(`Automation rule ${id} not found`)
    }

    const updatedRule: AutomationRule = {
      ...rule,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    }

    this.automationRules.set(id, updatedRule)

    auditLogger.log('UPDATE_AUTOMATION_RULE', {
      ruleId: id,
      changes: Object.keys(updates),
    })

    return updatedRule
  }

  getAutomationRules(): AutomationRule[] {
    return Array.from(this.automationRules.values())
  }

  // Helper Methods
  private async createMessageFromTemplate(
    template: MessageTemplate,
    reservation: Reservation
  ): Promise<Message> {
    const variables = this.extractTemplateVariables(reservation)
    const content = this.replaceVariables(template.content, variables)
    const subject = template.subject
      ? this.replaceVariables(template.subject, variables)
      : undefined

    const message: Message = {
      id: crypto.randomUUID(),
      reservationId: reservation.id,
      templateId: template.id,
      recipient: {
        name: reservation.guestName,
        email: reservation.guestEmail,
        phone: reservation.guestPhone,
      },
      subject,
      content,
      channel: 'email', // Default channel
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    this.messages.set(message.id, message)
    return message
  }

  private scheduleMessage(
    messageId: string,
    trigger: MessageTrigger,
    reservation: Reservation
  ): void {
    if (!trigger.offset) return

    let scheduledDate: Date
    const checkInDate = parseISO(reservation.checkIn)
    const checkOutDate = parseISO(reservation.checkOut)

    switch (trigger.timing) {
      case 'days_before':
        scheduledDate = addDays(checkInDate, -trigger.offset)
        break
      case 'hours_before':
        scheduledDate = new Date(
          checkInDate.getTime() - trigger.offset * 60 * 60 * 1000
        )
        break
      case 'days_after':
        scheduledDate = addDays(checkOutDate, trigger.offset)
        break
      case 'hours_after':
        scheduledDate = new Date(
          checkOutDate.getTime() + trigger.offset * 60 * 60 * 1000
        )
        break
      default:
        return
    }

    const delay = scheduledDate.getTime() - Date.now()
    if (delay > 0) {
      const timeout = setTimeout(async () => {
        try {
          await this.sendMessage(messageId)
          this.scheduledMessages.delete(messageId)
        } catch (error) {
          console.error(`Error sending scheduled message ${messageId}:`, error)
        }
      }, delay)

      this.scheduledMessages.set(messageId, timeout)

      // Update message with scheduled time
      const message = this.messages.get(messageId)
      if (message) {
        message.scheduledAt = scheduledDate.toISOString()
        this.messages.set(messageId, message)
      }
    }
  }

  private getApplicableRules(
    eventType: MessageTrigger['type'],
    reservation: Reservation
  ): AutomationRule[] {
    return Array.from(this.automationRules.values()).filter((rule) => {
      if (!rule.active) return false

      // Check if rule has matching trigger
      const hasTrigger = rule.triggers.some(
        (trigger) => trigger.type === eventType
      )
      if (!hasTrigger) return false

      // Check conditions
      const conditions = rule.conditions
      if (
        conditions.propertyIds &&
        !conditions.propertyIds.includes(reservation.propertyId)
      )
        return false
      if (
        conditions.channels &&
        !conditions.channels.includes(reservation.channel)
      )
        return false

      // Check stay duration
      const checkIn = parseISO(reservation.checkIn)
      const checkOut = parseISO(reservation.checkOut)
      const stayDays = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (conditions.minStayDays && stayDays < conditions.minStayDays)
        return false
      if (conditions.maxStayDays && stayDays > conditions.maxStayDays)
        return false

      return true
    })
  }

  private extractTemplateVariables(
    reservation: Reservation
  ): Record<string, string> {
    const checkIn = parseISO(reservation.checkIn)
    const checkOut = parseISO(reservation.checkOut)

    return {
      guestName: reservation.guestName,
      guestEmail: reservation.guestEmail,
      checkInDate: format(checkIn, 'dd/MM/yyyy'),
      checkOutDate: format(checkOut, 'dd/MM/yyyy'),
      checkInTime: '15:00', // Default check-in time
      checkOutTime: '11:00', // Default check-out time
      totalAmount: `R$ ${reservation.totalAmount.toFixed(2)}`,
      currency: reservation.currency,
      reservationId: reservation.id,
      channel: reservation.channel,
      guests: reservation.guests.toString(),
    }
  }

  private replaceVariables(
    content: string,
    variables: Record<string, string>
  ): string {
    let result = content
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      result = result.replace(regex, value)
    })
    return result
  }

  private initializeDefaultTemplates(): void {
    const defaultTemplates: Omit<
      MessageTemplate,
      'id' | 'createdAt' | 'updatedAt'
    >[] = [
      {
        name: 'Confirmação de Reserva',
        subject: 'Reserva Confirmada - A Moita',
        content: `Olá {{guestName}},

Sua reserva foi confirmada com sucesso!

Detalhes da Reserva:
- Check-in: {{checkInDate}} às {{checkInTime}}
- Check-out: {{checkOutDate}} às {{checkOutTime}}
- Hóspedes: {{guests}}
- Total: {{totalAmount}}

Estamos ansiosos para recebê-lo(a) na A Moita!

Atenciosamente,
Equipe A Moita`,
        trigger: {
          type: 'booking_confirmed',
          timing: 'immediate',
        },
        language: 'pt',
        active: true,
        variables: [
          'guestName',
          'checkInDate',
          'checkOutDate',
          'checkInTime',
          'checkOutTime',
          'guests',
          'totalAmount',
        ],
      },
      {
        name: 'Lembrete Check-in',
        subject: 'Lembrete: Check-in Amanhã - A Moita',
        content: `Olá {{guestName}},

Lembramos que seu check-in na A Moita é amanhã, {{checkInDate}} às {{checkInTime}}.

Estamos preparando tudo para sua chegada. Em caso de dúvidas, entre em contato conosco.

Até breve!
Equipe A Moita`,
        trigger: {
          type: 'check_in_reminder',
          timing: 'days_before',
          offset: 1,
        },
        language: 'pt',
        active: true,
        variables: ['guestName', 'checkInDate', 'checkInTime'],
      },
      {
        name: 'Lembrete Check-out',
        subject: 'Lembrete: Check-out Hoje - A Moita',
        content: `Olá {{guestName}},

Lembramos que seu check-out é hoje, {{checkOutDate}} às {{checkOutTime}}.

Esperamos que tenha aproveitado sua estadia na A Moita!

Atenciosamente,
Equipe A Moita`,
        trigger: {
          type: 'check_out_reminder',
          timing: 'hours_before',
          offset: 2,
        },
        language: 'pt',
        active: true,
        variables: ['guestName', 'checkOutDate', 'checkOutTime'],
      },
      {
        name: 'Agradecimento Pós-Estadia',
        subject: 'Obrigado pela Visita - A Moita',
        content: `Olá {{guestName}},

Obrigado por escolher a A Moita para sua estadia!

Esperamos que tenha tido uma experiência incrível conosco. Sua opinião é muito importante para nós.

Ficaremos felizes em recebê-lo(a) novamente em breve!

Com carinho,
Equipe A Moita`,
        trigger: {
          type: 'post_stay',
          timing: 'days_after',
          offset: 1,
        },
        language: 'pt',
        active: true,
        variables: ['guestName'],
      },
    ]

    defaultTemplates.forEach((template) => {
      this.createTemplate(template)
    })
  }

  // Public getters
  getMessages(reservationId?: string): Message[] {
    const allMessages = Array.from(this.messages.values())
    return reservationId
      ? allMessages.filter((m) => m.reservationId === reservationId)
      : allMessages
  }

  getMessage(id: string): Message | undefined {
    return this.messages.get(id)
  }

  getPendingMessages(): Message[] {
    return Array.from(this.messages.values()).filter(
      (m) => m.status === 'pending'
    )
  }

  getScheduledMessages(): Message[] {
    return Array.from(this.messages.values()).filter(
      (m) => m.scheduledAt && m.status === 'pending'
    )
  }

  cancelScheduledMessage(messageId: string): void {
    const timeout = this.scheduledMessages.get(messageId)
    if (timeout) {
      clearTimeout(timeout)
      this.scheduledMessages.delete(messageId)

      const message = this.messages.get(messageId)
      if (message) {
        message.status = 'failed'
        message.error = 'Cancelled by user'
        this.messages.set(messageId, message)
      }
    }
  }
}
