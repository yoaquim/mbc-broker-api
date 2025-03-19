import { Client } from './client-manager'

const SUBSCRIPTIONS: Map<string, Set<Client>> = new Map()

export function subscribeClient(ticker: string, client: Client): void {
    const key = ticker.toUpperCase()
    if (!SUBSCRIPTIONS.has(key)) {
        SUBSCRIPTIONS.set(key, new Set())
    }
    SUBSCRIPTIONS.get(key)?.add(client)
}

export function unsubscribeClient(ticker: string, client: Client): void {
    const key = ticker.toUpperCase()
    if (SUBSCRIPTIONS.has(key)) {
        SUBSCRIPTIONS.get(key)?.delete(client)
        if (SUBSCRIPTIONS.get(key)?.size === 0) {
            SUBSCRIPTIONS.delete(key)
        }
    }
}

export function getSubscribedClients(ticker: string): Set<Client> {
    return SUBSCRIPTIONS.get(ticker.toUpperCase()) || new Set()
}

export function getSubscribedTickers(): string[] {
    return Array.from(SUBSCRIPTIONS.keys())
}

export function removeClient(client: Client): void {
    SUBSCRIPTIONS.forEach((clients, ticker) => {
        if (clients.has(client)) {
            clients.delete(client)
            if (clients.size === 0) {
                SUBSCRIPTIONS.delete(ticker)
            }
        }
    })
}
