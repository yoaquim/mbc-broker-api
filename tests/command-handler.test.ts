jest.mock('../src/subscription-manager', () => ({
    subscribeClient: jest.fn(),
    unsubscribeClient: jest.fn()
}))

import { WebSocket } from 'ws'
import { handleSubscribe, handleUnsubscribe, handleBuy, handleSell } from '../src/command-handlers'
import { subscribeClient, unsubscribeClient } from '../src/subscription-manager'

describe('Command Handlers', () => {
    let ws: WebSocket & { send: jest.Mock }

    beforeEach(() => {
        ws = {send: jest.fn()} as unknown as WebSocket & { send: jest.Mock }
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('handleSubscribe', () => {
        it('should send error message if no ticker provided', () => {
            handleSubscribe([], ws)
            expect(ws.send).toHaveBeenCalledWith('Error: SUBSCRIBE requires a ticker.')
            expect(subscribeClient).not.toHaveBeenCalled()
        })

        it('should subscribe client when ticker is provided', () => {
            handleSubscribe(['tsla'], ws)
            expect(subscribeClient).toHaveBeenCalledWith('TSLA', ws)
            expect(ws.send).toHaveBeenCalledWith('Subscribed to TSLA')
        })
    })

    describe('handleUnsubscribe', () => {
        it('should send error message if no ticker provided', () => {
            handleUnsubscribe([], ws)
            expect(ws.send).toHaveBeenCalledWith('Error: UNSUBSCRIBE requires a ticker.')
            expect(unsubscribeClient).not.toHaveBeenCalled()
        })

        it('should unsubscribe client when ticker is provided', () => {
            handleUnsubscribe(['tsla'], ws)
            expect(unsubscribeClient).toHaveBeenCalledWith('TSLA', ws)
            expect(ws.send).toHaveBeenCalledWith('Unsubscribed from TSLA')
        })
    })

    describe('handleBuy', () => {
        it('should send error if insufficient arguments', () => {
            handleBuy(['10'], ws)
            expect(ws.send).toHaveBeenCalledWith('Error: BUY requires quantity and ticker.')
        })

        it('should send error if quantity is not a number', () => {
            handleBuy(['notANumber', 'tsla'], ws)
            expect(ws.send).toHaveBeenCalledWith('Error: Quantity must be a number.')
        })

        it('should process buy order with valid arguments', () => {
            handleBuy(['10', 'tsla'], ws)
            expect(ws.send).toHaveBeenCalledWith('Received BUY order for 10 of TSLA')
        })
    })

    describe('handleSell', () => {
        it('should send an error if insufficient arguments', () => {
            handleSell(['10'], ws)
            expect(ws.send).toHaveBeenCalledWith('Error: SELL requires quantity and ticker.')
        })

        it('should send error if quantity is not a number', () => {
            handleSell(['notANumber', 'tsla'], ws)
            expect(ws.send).toHaveBeenCalledWith('Error: Quantity must be a number.')
        })

        it('should process sell order with valid arguments', () => {
            handleSell(['10', 'tsla'], ws)
            expect(ws.send).toHaveBeenCalledWith('Received SELL order for 10 of TSLA')
        })
    })
})
