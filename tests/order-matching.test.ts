import WebSocket from 'ws'
import { processOrder, Order } from '../src/order-matching'

describe('Order Matching Module', () => {
    let buyerWs: WebSocket
    let sellerWs: WebSocket

    beforeEach(() => {
        jest.resetModules()

        buyerWs = ({
            send: jest.fn(),
            close: jest.fn(),
            OPEN: WebSocket.OPEN,
            readyState: WebSocket.OPEN,
        } as unknown) as WebSocket

        sellerWs = ({
            send: jest.fn(),
            OPEN: WebSocket.OPEN,
            close: jest.fn(),
            readyState: WebSocket.OPEN,
        } as unknown) as WebSocket
    })

    it('should match a BUY order with an existing SELL order and notify both parties', () => {
        // Process a SELL order first so it is stored
        const sellOrder: Order = {
            id: 'sell1',
            client: {ws: sellerWs, id: '111'},
            ticker: 'TSLA',
            quantity: 10,
            type: 'SELL',
            timestamp: Date.now(),
        }

        let executions = processOrder(sellOrder)
        expect(executions.length).toBe(0)
        expect((sellerWs.send as jest.Mock).mock.calls.length).toBe(0)

        // Process a BUY order that should partially match the SELL order
        const buyOrder: Order = {
            id: 'buy1',
            client: {ws: buyerWs, id: '111'},
            ticker: 'TSLA',
            quantity: 7,
            type: 'BUY',
            timestamp: Date.now(),
        }

        executions = processOrder(buyOrder)
        const execution = executions[0]
        expect(execution).not.toBeUndefined()
        expect(execution.ticker).toBe('TSLA')
        expect(execution.quantity).toBe(7)
        expect(execution.buyOrderId).toBe('buy1')
        expect(execution.sellOrderId).toBe('sell1')

        // Make sure notifications were sent and matched the expected message
        const buyerCalls = (buyerWs.send as jest.Mock).mock.calls
        const sellerCalls = (sellerWs.send as jest.Mock).mock.calls
        const buyerMsg = JSON.parse(buyerCalls[0][0])
        const sellerMsg = JSON.parse(sellerCalls[0][0])

        expect(buyerCalls.length).toBeGreaterThan(0)
        expect(sellerCalls.length).toBeGreaterThan(0)
        expect(buyerMsg).toMatchObject({
            type: 'execution',
            orderType: 'BUY',
            ticker: 'TSLA',
            quantity: 7,
        })
        expect(sellerMsg).toMatchObject({
            type: 'execution',
            orderType: 'BUY',
            ticker: 'TSLA',
            quantity: 7,
        })
    })

    it('should handle partial matching and leave unmatched quantity', () => {
        // Create a SELL order for AAPL with quantity 10
        const sellOrder: Order = {
            id: 'sell2',
            client: {ws: sellerWs, id: '111'},
            ticker: 'AAPL',
            quantity: 10,
            type: 'SELL',
            timestamp: Date.now(),
        }
        let executions = processOrder(sellOrder)
        expect(executions.length).toBe(0)

        // Process a BUY order for 4 shares, which should be a partial match
        const buyOrder1: Order = {
            id: 'buy2',
            client: {ws: buyerWs, id: '111'},
            ticker: 'AAPL',
            quantity: 4,
            type: 'BUY',
            timestamp: Date.now(),
        }
        executions = processOrder(buyOrder1)
        const buyerMsg1 = JSON.parse((buyerWs.send as jest.Mock).mock.calls[0][0])
        const sellerMsg1 = JSON.parse((sellerWs.send as jest.Mock).mock.calls[0][0])
        expect(executions.length).toBe(1)
        expect(executions[0].quantity).toBe(4)
        expect(buyerMsg1).toMatchObject({type: 'execution', orderType: 'BUY', ticker: 'AAPL', quantity: 4})
        expect(sellerMsg1).toMatchObject({type: 'execution', orderType: 'BUY', ticker: 'AAPL', quantity: 4})

        // Process another BUY order for 7 shares, which should yield a remainder of 6 quantity for the SELL order
        const buyOrder2: Order = {
            id: 'buy3',
            client: {ws: buyerWs, id: '111'},
            ticker: 'AAPL',
            quantity: 7,
            type: 'BUY',
            timestamp: Date.now(),
        }
        executions = processOrder(buyOrder2)
        const buyerMsg2 = JSON.parse((buyerWs.send as jest.Mock).mock.calls[1][0])
        const sellerMsg2 = JSON.parse((sellerWs.send as jest.Mock).mock.calls[1][0])
        expect(executions.length).toBe(1)
        expect(executions[0].quantity).toBe(6)
        expect(buyerMsg2).toMatchObject({type: 'execution', orderType: 'BUY', ticker: 'AAPL', quantity: 6})
        expect(sellerMsg2).toMatchObject({type: 'execution', orderType: 'BUY', ticker: 'AAPL', quantity: 6})
    })

    it('should not send notifications if the client connection is not open', () => {
        // Set the ready state for the WS clients to closed
        const buyerTemp: any = buyerWs
        const sellerTemp: any = sellerWs
        buyerTemp.readyState = 3 // CLOSED
        sellerTemp.readyState = 3 // CLOSED

        const sellOrder: Order = {
            id: 'sell3',
            client: {ws: sellerWs, id: '111'},
            ticker: 'NFLX',
            quantity: 8,
            type: 'SELL',
            timestamp: Date.now(),
        }
        let executions = processOrder(sellOrder)
        expect(executions.length).toBe(0)

        const buyOrder: Order = {
            id: 'buy4',
            client: {ws: buyerWs, id: '111'},
            ticker: 'NFLX',
            quantity: 5,
            type: 'BUY',
            timestamp: Date.now(),
        }
        executions = processOrder(buyOrder)
        expect(executions.length).toBe(1)

        // Since both connections are closed, no notifications should be sent
        expect((buyerWs.send as jest.Mock).mock.calls.length).toBe(0)
        expect((sellerWs.send as jest.Mock).mock.calls.length).toBe(0)
    })
})
