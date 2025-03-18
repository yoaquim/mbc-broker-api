import { getSubscribedClients, getSubscribedTickers } from './subscription-manager'

interface TickerData {
    timestamp: number;
    quantity: number;
    symbol: string;
    price: number;
}

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
            const message = JSON.stringify(data)
            clients.forEach((client) => {
                if (client.readyState === client.OPEN) {
                    client.send(message)
                }
            })
        })
    }, interval)
}
