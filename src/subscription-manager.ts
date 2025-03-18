import { WebSocket } from 'ws'

const SUBSCRIPTIONS: Map<string, Set<WebSocket>> = new Map()

export function subscribeClient(ticker: string, ws: WebSocket): void {
    const key = ticker.toUpperCase()
    if (!SUBSCRIPTIONS.has(key)) {
        SUBSCRIPTIONS.set(key, new Set())
    }
    SUBSCRIPTIONS.get(key)?.add(ws)
}

export function unsubscribeClient(ticker: string, ws: WebSocket): void {
    const key = ticker.toUpperCase()
    if (SUBSCRIPTIONS.has(key)) {
        SUBSCRIPTIONS.get(key)?.delete(ws)
        if (SUBSCRIPTIONS.get(key)?.size === 0) {
            SUBSCRIPTIONS.delete(key)
        }
    }
}

export function getSubscribedClients(ticker: string): Set<WebSocket> {
    return SUBSCRIPTIONS.get(ticker.toUpperCase()) || new Set()
}

export function getSubscribedTickers(): string[] {
    return Array.from(SUBSCRIPTIONS.keys())
}

export function removeClient(ws: WebSocket): void {
    SUBSCRIPTIONS.forEach((clients, ticker) => {
        if (clients.has(ws)) {
            clients.delete(ws)
            if (clients.size === 0) {
                SUBSCRIPTIONS.delete(ticker)
            }
        }
    })
}
