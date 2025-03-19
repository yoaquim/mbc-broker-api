import { getSubscribedClients, getSubscribedTickers } from '@/managers/subscription-manager'
import { sendMessage } from '@/utils/messenger'
import { TickerData } from '@/types'

function generateRandomTickerData(ticker: string): TickerData {
    return {
        timestamp: Date.now(),
        quantity: Math.floor(Math.random() * 100) + 1,
        symbol: ticker,
        price: parseFloat((Math.random() * 1000).toFixed(2)),
    }
}

export function startTickerSimulator(interval: number = 1000): void {
    setInterval(() => {
        const tickers = getSubscribedTickers()
        tickers.forEach((ticker) => {
            const data = generateRandomTickerData(ticker)
            const clients = getSubscribedClients(ticker)
            clients.forEach((client) => {
                if (client.ws.readyState === client.ws.OPEN) {
                    sendMessage(client, {type: 'ticker', ...data})
                }
            })
        })
    }, interval)
}
