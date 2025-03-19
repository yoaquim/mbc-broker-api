import { WebSocket } from 'ws'
import { startTickerSimulator } from '@/ticker-simulator'
import { subscribeClient, removeClient } from '@/managers/subscription-manager'

jest.useFakeTimers()

describe('Ticker Simulator', () => {
    let ws: WebSocket & { send: jest.Mock; readyState: number; OPEN: number }

    beforeEach(() => {
        // Create a dummy WebSocket that is considered OPEN.
        ws = {
            send: jest.fn(),
            readyState: 1,
            OPEN: 1,
        } as unknown as WebSocket & { send: jest.Mock; readyState: number; OPEN: number }

        subscribeClient('TSLA', {ws, id: '111'})
    })

    afterEach(() => {
        jest.clearAllTimers()
        removeClient({ws, id: '111'})
    })

    it('should send ticker updates to subscribed clients', () => {
        startTickerSimulator(100)

        // Fast-forward time by 150ms to ensure at least one tick occurs.
        jest.advanceTimersByTime(150)

        expect(ws.send).toHaveBeenCalled()

        // Verify that the sent message is a valid JSON string with ticker data.
        const sentMessage = ws.send.mock.calls[0][0]
        const data = JSON.parse(sentMessage)
        expect(data).toHaveProperty('timestamp')
        expect(typeof data.timestamp).toBe('number')
        expect(data).toHaveProperty('quantity')
        expect(typeof data.quantity).toBe('number')
        expect(data).toHaveProperty('symbol', 'TSLA')
        expect(data).toHaveProperty('price')
        expect(typeof data.price).toBe('number')
    })

    it('should not send updates if the client is not OPEN', () => {
        ws.readyState = 0
        startTickerSimulator(100)
        jest.advanceTimersByTime(150)
        expect(ws.send).not.toHaveBeenCalled()
    })
})
