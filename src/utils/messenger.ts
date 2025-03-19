import { getClientLogger } from '@/utils/logger'
import { Client, MessagePayload } from '@/types'

export function sendMessage(client: Client, payload: MessagePayload): void {
    const message = JSON.stringify({...payload, timestamp: Date.now(), client: client.id})
    const clientLogger = getClientLogger(client.id)
    clientLogger.info(`SENDING MESSAGE → ${payload.type.toUpperCase()} | ${message}`)
    if (client.ws.readyState === client.ws.OPEN) client.ws.send(message)
    else clientLogger.warn(`Message send skipped: connection not OPEN`)
}
