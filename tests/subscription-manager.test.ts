import type { WebSocket } from 'ws'

describe('Subscription Manager', () => {
    let subscribeClient: (ticker: string, ws: WebSocket) => void
    let unsubscribeClient: (ticker: string, ws: WebSocket) => void
    let getSubscribedClients: (ticker: string) => Set<WebSocket>
    let getSubscribedTickers: () => string[]
    let removeClient: (ws: WebSocket) => void

    let ws1: WebSocket
    let ws2: WebSocket

    beforeEach(async () => {
        // Reset the module cache so that each test gets a fresh copy of subscriptionManager.
        jest.resetModules()
        const subscriptionManager = await import('../src/subscription-manager')
        subscribeClient = subscriptionManager.subscribeClient
        unsubscribeClient = subscriptionManager.unsubscribeClient
        getSubscribedClients = subscriptionManager.getSubscribedClients
        getSubscribedTickers = subscriptionManager.getSubscribedTickers
        removeClient = subscriptionManager.removeClient

        ws1 = {send: jest.fn()} as unknown as WebSocket
        ws2 = {send: jest.fn()} as unknown as WebSocket
    })

    it('should subscribe a client to a ticker', () => {
        subscribeClient('tsla', ws1)
        const clients = getSubscribedClients('TSLA')
        expect(clients.has(ws1)).toBe(true)
        const tickers = getSubscribedTickers()
        expect(tickers).toContain('TSLA')
    })

    it('should unsubscribe a client from a ticker', () => {
        subscribeClient('tsla', ws1)
        unsubscribeClient('TSLA', ws1)
        const clients = getSubscribedClients('TSLA')
        expect(clients.has(ws1)).toBe(false)
        const tickers = getSubscribedTickers()
        expect(tickers).not.toContain('TSLA')
    })

    it('should handle multiple clients for the same ticker', () => {
        subscribeClient('tsla', ws1)
        subscribeClient('tsla', ws2)
        let clients = getSubscribedClients('TSLA')
        expect(clients.size).toBe(2)
        unsubscribeClient('TSLA', ws1)
        clients = getSubscribedClients('TSLA')
        expect(clients.size).toBe(1)
        expect(clients.has(ws2)).toBe(true)
    })

    it('should remove a client from all tickers', () => {
        subscribeClient('tsla', ws1)
        subscribeClient('aapl', ws1)
        removeClient(ws1)
        const tslaClients = getSubscribedClients('TSLA')
        const aaplClients = getSubscribedClients('AAPL')
        expect(tslaClients.has(ws1)).toBe(false)
        expect(aaplClients.has(ws1)).toBe(false)
        const tickers = getSubscribedTickers()
        expect(tickers).not.toContain('TSLA')
        expect(tickers).not.toContain('AAPL')
    })
})
