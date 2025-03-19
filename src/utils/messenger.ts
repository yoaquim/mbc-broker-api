import { getClientLogger } from './logger'
import { Client } from '../client-manager'
import { OrderType } from '../order-matching'

export interface BaseMessagePayload {
    type: string
}

export interface SubscribeAckMessagePayload extends BaseMessagePayload {
    type: 'subscribe_ack';
    ticker: string
}

export interface UnsubscribeAckMessagePayload extends BaseMessagePayload {
    type: 'unsubscribe_ack';
    ticker: string
}

export interface OrderAckMessagePayload extends BaseMessagePayload {
    type: 'order_ack';
    orderType: OrderType;
    ticker: string;
    quantity: number
}

export interface ExecutionMessagePayload extends BaseMessagePayload {
    type: 'execution';
    orderType: OrderType;
    ticker: string;
    quantity: number;
    price: number
}

export interface ErrorMessagePayload extends BaseMessagePayload {
    type: 'error';
    message: string
}

export interface TickerMessagePayload extends BaseMessagePayload {
    type: 'ticker';
    symbol: string;
    price: number;
    quantity: number
}

export type MessagePayload =
    | SubscribeAckMessagePayload
    | UnsubscribeAckMessagePayload
    | OrderAckMessagePayload
    | ExecutionMessagePayload
    | ErrorMessagePayload
    | TickerMessagePayload

export type OutgoingMessage = MessagePayload & {
    timestamp: number;
    client: string;
}

export function sendMessage(client: Client, payload: MessagePayload): void {
    const message = JSON.stringify({...payload, timestamp: Date.now(), client: client.id})
    const clientLogger = getClientLogger(client.id)
    clientLogger.info(`SENDING MESSAGE → ${payload.type.toUpperCase()} | ${message}`)
    if (client.ws.readyState === client.ws.OPEN) client.ws.send(message)
    else clientLogger.warn(`Message send skipped: connection not OPEN`)
}
