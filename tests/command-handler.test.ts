import { Client } from '@/types'

jest.mock('@/managers/subscription-manager', () => ({
    subscribeClient: jest.fn(),
    unsubscribeClient: jest.fn()
}))

import { WebSocket } from 'ws'
import { handleSubscribe, handleUnsubscribe, handleBuy, handleSell } from '@/command-handlers'
import { subscribeClient, unsubscribeClient } from '@/managers/subscription-manager'

describe('Command Handlers', () => {
    let ws: WebSocket & { send: jest.Mock }
    let client: Client

    beforeEach(() => {
        ws = {send: jest.fn()} as unknown as WebSocket & { send: jest.Mock }
        client = {ws, id: '111'}
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('handleSubscribe', () => {
        it('should send error message if no ticker provided', () => {
            handleSubscribe([], client)
            const sent = JSON.parse(ws.send.mock.calls[0][0])
            expect(sent).toMatchObject({type: 'error', message: 'Subscribe requires a ticker.'})
            expect(subscribeClient).not.toHaveBeenCalled()
        })

        it('should subscribe client when ticker is provided', () => {
            handleSubscribe(['tsla'], client)
            expect(subscribeClient).toHaveBeenCalledWith('TSLA', client)
            const sent = JSON.parse(ws.send.mock.calls[0][0])
            expect(sent).toMatchObject({type: 'subscribe_ack', ticker: 'TSLA'})
        })
    })

    describe('handleUnsubscribe', () => {
        it('should send error message if no ticker provided', () => {
            handleUnsubscribe([], client)
            const sent = JSON.parse(ws.send.mock.calls[0][0])
            expect(sent).toMatchObject({type: 'error', message: 'Unsubscribe requires a ticker.'})
            expect(unsubscribeClient).not.toHaveBeenCalled()
        })

        it('should unsubscribe client when ticker is provided', () => {
            handleUnsubscribe(['tsla'], client)
            expect(unsubscribeClient).toHaveBeenCalledWith('TSLA', client)
            const sent = JSON.parse(ws.send.mock.calls[0][0])
            expect(sent).toMatchObject({type: 'unsubscribe_ack', ticker: 'TSLA'})
        })
    })

    describe('handleBuy', () => {
        it('should send error if insufficient arguments', () => {
            handleBuy(['10'], client)
            const sent = JSON.parse(ws.send.mock.calls[0][0])
            expect(sent).toMatchObject({type: 'error', message: 'BUY requires quantity and ticker.'})
        })

        it('should send error if quantity is not a number', () => {
            handleBuy(['notANumber', 'tsla'], client)
            const sent = JSON.parse(ws.send.mock.calls[0][0])
            expect(sent).toMatchObject({type: 'error', message: 'Quantity must be a number.'})
        })

        it('should send error if quantity is 0', () => {
            handleBuy(['0', 'tsla'], client)
            const sent = JSON.parse(ws.send.mock.calls[0][0])
            expect(sent).toMatchObject({type: 'error', message: 'Quantity must be 1 or greater.'})
        })

        it('should process buy order with valid arguments', () => {
            handleBuy(['10', 'tsla'], client)
            const sent = JSON.parse(ws.send.mock.calls[0][0])
            expect(sent).toMatchObject({type: 'order_ack', orderType: 'BUY', ticker: 'TSLA', quantity: 10})
        })
    })

    describe('handleSell', () => {
        it('should send an error if insufficient arguments', () => {
            handleSell(['10'], client)
            const sent = JSON.parse(ws.send.mock.calls[0][0])
            expect(sent).toMatchObject({type: 'error', message: 'SELL requires quantity and ticker.'})
        })

        it('should send error if quantity is not a number', () => {
            handleSell(['notANumber', 'tsla'], client)
            const sent = JSON.parse(ws.send.mock.calls[0][0])
            expect(sent).toMatchObject({type: 'error', message: 'Quantity must be a number.'})
        })

        it('should send error if quantity is 0', () => {
            handleSell(['0', 'tsla'], client)
            const sent = JSON.parse(ws.send.mock.calls[0][0])
            expect(sent).toMatchObject({type: 'error', message: 'Quantity must be 1 or greater.'})
        })

        it('should process sell order with valid arguments', () => {
            handleSell(['10', 'tsla'], client)
            const sent = JSON.parse(ws.send.mock.calls[0][0])
            expect(sent).toMatchObject({type: 'order_ack', orderType: 'SELL', ticker: 'TSLA', quantity: 10})
        })
    })
})
