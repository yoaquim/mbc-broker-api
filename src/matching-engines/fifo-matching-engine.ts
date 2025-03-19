import { MatchingEngine, Order, Execution } from '@/types'
import { sendMessage } from '@/utils/messenger'

function getPriceForExecution(ticker: string): number {
    // Not sure what to implement here for price
    // so just returning random float to have data to act on

    // Future iterations can implement pricing logic here based
    // on ticker (which it's why it's being passed in as a param)
    return parseFloat((Math.random() * 1000).toFixed(2))
}

export class FifoMatchingEngine implements MatchingEngine {
    private BUY_ORDERS: Map<string, Order[]> = new Map()
    private SELL_ORDERS: Map<string, Order[]> = new Map()

    private fulfillOrder({ticker, order, list, executions}: {
        ticker: string, order: Order, list: Order[], executions: Execution[]
    }) {
        // Operate on the first opposing order for the ticker, and
        // process as long as the target order has quantity remaining
        // or there are no more opposing orders
        while (order.quantity > 0 && list.length > 0) {
            const opposingOrder: Order = list[0]
            const quantity = Math.min(order.quantity, opposingOrder.quantity)
            const price = getPriceForExecution(ticker)
            const buyOrderId: string = order.type === 'BUY' ? order.id : opposingOrder.id
            const sellOrderId: string = order.type === 'SELL' ? order.id : opposingOrder.id

            const execution: Execution = {
                ticker,
                price,
                quantity,
                buyOrderId,
                sellOrderId,
                timestamp: Date.now(),
            }
            executions.push(execution)

            // Reduce the quantity of each order
            order.quantity -= quantity
            opposingOrder.quantity -= quantity

            // Notify the clients of the execution
            sendMessage(order.client, {
                type: 'execution',
                orderType: order.type,
                ticker,
                price,
                quantity,
                remainingQuantity: order.quantity
            })
            sendMessage(opposingOrder.client, {
                type: 'execution',
                orderType: order.type,
                ticker,
                price,
                quantity,
                remainingQuantity: opposingOrder.quantity
            })

            // If the opposing order is completely filled, remove it;
            // This makes it so that the next order is picked up on
            // the next loop
            if (opposingOrder.quantity === 0) {
                list.shift()
            }
        }

        // If the target order isn't fully matched,
        // save any remaining quantity as a pending order
        if (order.quantity > 0) {
            const pendingOrders: Map<string, Order[]> = order.type === 'BUY' ? this.BUY_ORDERS : this.SELL_ORDERS
            const currentOrders = pendingOrders.get(ticker) || []
            currentOrders.push(order)
            pendingOrders.set(ticker, currentOrders)
        }
    }

    process(order: Order): Execution[] {
        const executions: Execution[] = []
        const ticker = order.ticker.toUpperCase()
        const opposingOrders: Map<string, Order[]> = order.type === 'BUY' ? this.SELL_ORDERS : this.BUY_ORDERS
        const list = opposingOrders.get(ticker) || []
        this.fulfillOrder({ticker, order, list, executions})
        return executions
    }
}
