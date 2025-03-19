import WebSocket from 'ws'

type OrderType = 'BUY' | 'SELL'

export interface Order {
    id: string;
    client: WebSocket;
    ticker: string;
    quantity: number;
    type: OrderType;
    timestamp: number;
}

export interface Execution {
    ticker: string;
    quantity: number;
    price: number;
    timestamp: number;
    buyOrderId: string;
    sellOrderId: string;
}

interface NotificationData {
    type: OrderType;
    ticker: string;
    quantity: number;
    price: number
}

const BUY_ORDERS: Map<string, Order[]> = new Map()
const SELL_ORDERS: Map<string, Order[]> = new Map()

function notifyClients(sourceClient: WebSocket, targetClient: WebSocket, data: NotificationData) {
    const {sourceAction, targetAction} = {
        BUY: {sourceAction: 'Bought', targetAction: 'Sold'},
        SELL: {sourceAction: 'Sold', targetAction: 'Bought'}
    }[data.type]

    if (sourceClient.readyState === sourceClient.OPEN) {
        sourceClient.send(`Execution: ${sourceAction} ${data.quantity} ${data.ticker} at ${data.price}`)
    }

    if (targetClient.readyState === targetClient.OPEN) {
        targetClient.send(`Execution: ${targetAction} ${data.quantity} ${data.ticker} at ${data.price}`)
    }
}

function getPriceForExecution(ticker: string): number {
    // Not sure what to implement here for price
    // so just returning random float to have data to act on

    // Future iterations can implement pricing logic here based
    // on ticker (which it's why it's being passed in as a param)
    return parseFloat((Math.random() * 1000).toFixed(2))
}

export function processOrder(order: Order): Execution[] {
    const executions: Execution[] = []
    const ticker = order.ticker.toUpperCase()

    if (order.type === 'BUY') {
        const sellList = SELL_ORDERS.get(ticker) || []

        // Operate on the first opposing order for the ticker, and
        // process as long as the target order has quantity remaining
        // or there are no more opposing orders
        while (order.quantity > 0 && sellList.length > 0) {
            const sellOrder: Order = sellList[0]
            const matchedQuantity = Math.min(order.quantity, sellOrder.quantity)
            const price = getPriceForExecution(ticker)

            const execution: Execution = {
                ticker,
                price,
                quantity: matchedQuantity,
                timestamp: Date.now(),
                buyOrderId: order.id,
                sellOrderId: sellOrder.id
            }
            executions.push(execution)

            // Notify the clients of the execution
            notifyClients(order.client, sellOrder.client, {
                type: 'BUY',
                ticker,
                price,
                quantity: matchedQuantity
            })

            // Reduce the quantity of each order
            order.quantity -= matchedQuantity
            sellOrder.quantity -= matchedQuantity

            // If the sell order is completely filled, remove it;
            // This makes it so that the next order is picked up on
            // the next loop
            if (sellOrder.quantity === 0) {
                sellList.shift()
            }
        }

        // If the target order isn't fully matched,
        // save any remaining quantity as a pending BUY order
        if (order.quantity > 0) {
            const currentBuys = BUY_ORDERS.get(ticker) || []
            currentBuys.push(order)
            BUY_ORDERS.set(ticker, currentBuys)
        }
    } else if (order.type === 'SELL') {
        // Same as BUY order-type processing, just for selling
        const buyList = BUY_ORDERS.get(ticker) || []

        while (order.quantity > 0 && buyList.length > 0) {
            const buyOrder = buyList[0]
            const matchedQuantity = Math.min(order.quantity, buyOrder.quantity)
            const price = getPriceForExecution(ticker)

            const execution: Execution = {
                ticker,
                price,
                quantity: matchedQuantity,
                timestamp: Date.now(),
                buyOrderId: buyOrder.id,
                sellOrderId: order.id
            }
            executions.push(execution)

            notifyClients(order.client, buyOrder.client, {
                type: 'SELL',
                ticker,
                price,
                quantity: matchedQuantity
            })

            order.quantity -= matchedQuantity
            buyOrder.quantity -= matchedQuantity

            if (buyOrder.quantity === 0) {
                buyList.shift()
            }
        }

        if (order.quantity > 0) {
            const currentSells = SELL_ORDERS.get(ticker) || []
            currentSells.push(order)
            SELL_ORDERS.set(ticker, currentSells)
        }
    }

    return executions
}
