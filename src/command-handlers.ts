import { WebSocket } from 'ws'
import { subscribeClient, unsubscribeClient } from './subscription-manager'

export function handleSubscribe(args: string[], ws: WebSocket): void {
    if (args.length < 1) {
        ws.send('Error: SUBSCRIBE requires a ticker.')
        return
    }
    const ticker = args[0].toUpperCase()
    subscribeClient(ticker, ws)
    ws.send(`Subscribed to ${ticker}`)
}

export function handleUnsubscribe(args: string[], ws: WebSocket): void {
    if (args.length < 1) {
        ws.send('Error: UNSUBSCRIBE requires a ticker.')
        return
    }
    const ticker = args[0].toUpperCase()
    unsubscribeClient(ticker, ws)
    ws.send(`Unsubscribed from ${ticker}`)
}

export function handleBuy(args: string[], ws: WebSocket): void {
    if (args.length < 2) {
        ws.send('Error: BUY requires quantity and ticker.')
        return
    }
    const quantity = parseInt(args[0], 10)
    const ticker = args[1].toUpperCase()
    if (isNaN(quantity)) {
        ws.send('Error: Quantity must be a number.')
        return
    }
    ws.send(`Received BUY order for ${quantity} of ${ticker}`)
    // TODO: Process the buy order
}

export function handleSell(args: string[], ws: WebSocket): void {
    if (args.length < 2) {
        ws.send('Error: SELL requires quantity and ticker.')
        return
    }
    const quantity = parseInt(args[0], 10)
    const ticker = args[1].toUpperCase()
    if (isNaN(quantity)) {
        ws.send('Error: Quantity must be a number.')
        return
    }
    ws.send(`Received SELL order for ${quantity} of ${ticker}`)
    // TODO: Process the sell order
}
