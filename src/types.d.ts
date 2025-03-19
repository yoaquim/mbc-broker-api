import WebSocket from 'ws'

export type OrderType = 'BUY' | 'SELL'
export type MatchingEngineType = 'FIFO'

export interface Command {
    type: string;
    args: string[];
}

export interface TickerData {
    timestamp: number;
    quantity: number;
    symbol: string;
    price: number;
}

export interface Client {
    id: string;
    ws: WebSocket;
}

export interface Order {
    id: string;
    client: Client;
    ticker: string;
    quantity: number;
    type: OrderType;
    timestamp: number;
}

export interface Execution {
    ticker: string;
    quantity: number;
    price: number;
    timestamp: number;
    buyOrderId: string;
    sellOrderId: string;
}

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
    remainingQuantity: number;
    price: number;
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

export interface MatchingEngine {
    process(order: Order): Execution[];
}
