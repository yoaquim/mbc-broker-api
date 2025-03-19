import { v4 as uuidv4 } from 'uuid'
import { sendMessage } from './utils/messenger'
import { Client } from './client-manager'
import { subscribeClient, unsubscribeClient } from './subscription-manager'
import { Order, OrderType, processOrder } from './order-matching'

function executeCommand(type: OrderType, client: Client, commandArgs: string[]) {
    if (commandArgs.length < 2) {
        sendMessage(client, {type: 'error', message: `${type} requires quantity and ticker.`})
        return
    }

    const quantity = parseInt(commandArgs[0], 10)
    const ticker = commandArgs[1].toUpperCase()

    if (isNaN(quantity)) {
        sendMessage(client, {type: 'error', message: 'Quantity must be a number.'})
        return
    }

    if (quantity < 1) {
        sendMessage(client, {type: 'error', message: 'Quantity must be 1 or greater.'})
        return
    }

    const order: Order = {
        id: uuidv4(),
        client,
        type,
        ticker,
        quantity,
        timestamp: Date.now(),
    }

    sendMessage(client, {type: 'order_ack', orderType: type, ticker, quantity})
    processOrder(order)
}


export function handleSubscribe(args: string[], client: Client): void {
    if (args.length < 1) {
        sendMessage(client, {type: 'error', message: 'Subscribe requires a ticker.'})
        return
    }
    const ticker = args[0].toUpperCase()
    subscribeClient(ticker, client)
    sendMessage(client, {type: 'subscribe_ack', ticker})
}

export function handleUnsubscribe(args: string[], client: Client): void {
    if (args.length < 1) {
        sendMessage(client, {type: 'error', message: 'Unsubscribe requires a ticker.'})
        return
    }
    const ticker = args[0].toUpperCase()
    unsubscribeClient(ticker, client)
    sendMessage(client, {type: 'unsubscribe_ack', ticker})
}

export function handleBuy(args: string[], client: Client): void {
    executeCommand('BUY', client, args)
}

export function handleSell(args: string[], client: Client): void {
    executeCommand('SELL', client, args)
}
