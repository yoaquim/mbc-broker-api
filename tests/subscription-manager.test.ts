import type { WebSocket } from 'ws'
import { Client } from '@/types'

describe('Subscription Manager', () => {
    let subscribeClient: (ticker: string, client: Client) => void
    let unsubscribeClient: (ticker: string, client: Client) => void
    let getSubscribedClients: (ticker: string) => Set<Client>
    let getSubscribedTickers: () => string[]
    let removeClient: (client: Client) => void

    let ws1: WebSocket
    let ws2: WebSocket
    let client1: Client
    let client2: Client

    beforeEach(async () => {
        // Reset the module cache so that each test gets a fresh copy of subscriptionManager.
        jest.resetModules()
        const subscriptionManager = await import('@/managers/subscription-manager')
        subscribeClient = subscriptionManager.subscribeClient
        unsubscribeClient = subscriptionManager.unsubscribeClient
        getSubscribedClients = subscriptionManager.getSubscribedClients
        getSubscribedTickers = subscriptionManager.getSubscribedTickers
        removeClient = subscriptionManager.removeClient

        ws1 = {send: jest.fn()} as unknown as WebSocket
        ws2 = {send: jest.fn()} as unknown as WebSocket
        client1 = {ws: ws1, id: '111'}
        client2 = {ws: ws2, id: '222'}
    })

    it('should subscribe a client to a ticker', () => {
        subscribeClient('tsla', client1)
        const clients = getSubscribedClients('TSLA')
        expect(clients.has(client1)).toBe(true)
        const tickers = getSubscribedTickers()
        expect(tickers).toContain('TSLA')
    })

    it('should unsubscribe a client from a ticker', () => {
        subscribeClient('tsla', client1)
        unsubscribeClient('TSLA', client1)
        const clients = getSubscribedClients('TSLA')
        expect(clients.has(client1)).toBe(false)
        const tickers = getSubscribedTickers()
        expect(tickers).not.toContain('TSLA')
    })

    it('should handle multiple clients for the same ticker', () => {
        subscribeClient('tsla', client1)
        subscribeClient('tsla', client2)
        let clients = getSubscribedClients('TSLA')
        expect(clients.size).toBe(2)
        unsubscribeClient('TSLA', client1)
        clients = getSubscribedClients('TSLA')
        expect(clients.size).toBe(1)
        expect(clients.has(client1)).toBe(false)
        expect(clients.has(client2)).toBe(true)
    })

    it('should remove a client from all tickers', () => {
        subscribeClient('tsla', client1)
        subscribeClient('aapl', client1)
        removeClient(client1)
        const tslaClients = getSubscribedClients('TSLA')
        const aaplClients = getSubscribedClients('AAPL')
        expect(tslaClients.has(client1)).toBe(false)
        expect(aaplClients.has(client1)).toBe(false)
        const tickers = getSubscribedTickers()
        expect(tickers).not.toContain('TSLA')
        expect(tickers).not.toContain('AAPL')
    })
})
