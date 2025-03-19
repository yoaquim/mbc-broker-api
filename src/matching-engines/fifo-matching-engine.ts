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

    process(order: Order): Execution[] {
        const executions: Execution[] = []
        const ticker = order.ticker.toUpperCase()

        if (order.type === 'BUY') {
            const sellList = this.SELL_ORDERS.get(ticker) || []

            // Operate on the first opposing order for the ticker, and
            // process as long as the target order has quantity remaining
            // or there are no more opposing orders
            while (order.quantity > 0 && sellList.length > 0) {
                const sellOrder: Order = sellList[0]
                const quantity = Math.min(order.quantity, sellOrder.quantity)
                const price = getPriceForExecution(ticker)

                const execution: Execution = {
                    ticker,
                    price,
                    quantity,
                    timestamp: Date.now(),
                    buyOrderId: order.id,
                    sellOrderId: sellOrder.id
                }
                executions.push(execution)

                // Reduce the quantity of each order
                order.quantity -= quantity
                sellOrder.quantity -= quantity

                // Notify the clients of the execution
                sendMessage(order.client, {
                    type: 'execution',
                    orderType: 'BUY',
                    ticker,
                    price,
                    quantity,
                    remainingQuantity: order.quantity
                })
                sendMessage(sellOrder.client, {
                    type: 'execution',
                    orderType: 'BUY',
                    ticker,
                    price,
                    quantity,
                    remainingQuantity: sellOrder.quantity
                })

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
                const currentBuys = this.BUY_ORDERS.get(ticker) || []
                currentBuys.push(order)
                this.BUY_ORDERS.set(ticker, currentBuys)
            }
        } else if (order.type === 'SELL') {
            // Same as BUY order-type processing, just for selling
            const buyList = this.BUY_ORDERS.get(ticker) || []

            while (order.quantity > 0 && buyList.length > 0) {
                const buyOrder = buyList[0]
                const quantity = Math.min(order.quantity, buyOrder.quantity)
                const price = getPriceForExecution(ticker)

                const execution: Execution = {
                    ticker,
                    price,
                    quantity,
                    timestamp: Date.now(),
                    buyOrderId: buyOrder.id,
                    sellOrderId: order.id
                }
                executions.push(execution)

                // Reduce the quantity of each order
                order.quantity -= quantity
                buyOrder.quantity -= quantity

                // Notify the clients of the execution
                sendMessage(order.client, {
                    type: 'execution',
                    orderType: 'SELL',
                    ticker,
                    price,
                    quantity,
                    remainingQuantity: order.quantity
                })
                sendMessage(buyOrder.client, {
                    type: 'execution',
                    orderType: 'SELL',
                    ticker,
                    price,
                    quantity,
                    remainingQuantity: buyOrder.quantity
                })

                // If the buy order is completely filled, remove it;
                // This makes it so that the next order is picked up on
                // the next loop
                if (buyOrder.quantity === 0) {
                    buyList.shift()
                }
            }

            if (order.quantity > 0) {
                const currentSells = this.SELL_ORDERS.get(ticker) || []
                currentSells.push(order)
                this.SELL_ORDERS.set(ticker, currentSells)
            }
        }

        return executions
    }
}
