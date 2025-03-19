import WebSocket, { Server as WebSocketServer } from 'ws'
import http from 'http'
import express from 'express'
import { parseCommand } from './command-parser'
import { handleBuy, handleSell, handleSubscribe, handleUnsubscribe } from './command-handlers'

export function setupWebSocketServer(app: express.Application, port: number): { wss: WebSocketServer, server: http.Server } {
    const server = http.createServer(app)
    const wss = new WebSocketServer({server})

    wss.on('connection', (ws) => {
        console.log('New client connected')

        ws.on('message', (data: WebSocket.Data) => {
            const message = data.toString()
            console.log('Received message:', message)
            const command = parseCommand(message)

            if (!command) {
                ws.send('Error: Invalid command')
                return
            }

            switch (command.type) {
                case 'SUBSCRIBE':
                    handleSubscribe(command.args, ws)
                    break
                case 'UNSUBSCRIBE':
                    handleUnsubscribe(command.args, ws)
                    break
                case 'BUY':
                    handleBuy(command.args, ws)
                    break
                case 'SELL':
                    handleSell(command.args, ws)
                    break
                default:
                    ws.send(`Error: Unknown command ${command.type}`)
            }
        })

        ws.on('close', () => console.log('Client disconnected'))
    })

    server.listen(port, () => console.log(`Server is listening on port ${port}`))

    return {wss, server}
}
