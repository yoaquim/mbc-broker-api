import WebSocket, { Server as WebSocketServer } from 'ws'
import http from 'http'
import express from 'express'
import { logger, getClientLogger } from './utils/logger'
import { sendMessage } from './utils/messenger'
import { parseCommand } from './utils/command-parser'
import { handleBuy, handleSell, handleSubscribe, handleUnsubscribe } from './command-handlers'
import { addClient, Client } from './client-manager'

export function setupWebSocketServer(app: express.Application, port: number): { wss: WebSocketServer, server: http.Server } {
    const server = http.createServer(app)
    const wss = new WebSocketServer({server})

    wss.on('connection', (ws) => {
        const client: Client = addClient(ws)
        const clientLogger = getClientLogger(client.id)
        clientLogger.info('Client connected')

        ws.on('close', () => logger.info(`[CLIENT - ${client.id}] | Client disconnected`))
        ws.on('error', (err) => logger.error(`[CLIENT - ${client.id}] | WebSocket error: ${err.message}.`))
        ws.on('message', (data: WebSocket.Data) => {
            const message = data.toString()
            clientLogger.info(`RECEIVED MESSAGE → ${message}`)

            const command = parseCommand(message)
            if (!command) {
                clientLogger.info(`Invalid command received: ${command}.`)
                sendMessage(client, {type: 'error', message: 'Invalid command'})
                return
            }

            switch (command.type) {
                case 'SUBSCRIBE':
                    handleSubscribe(command.args, client)
                    break
                case 'UNSUBSCRIBE':
                    handleUnsubscribe(command.args, client)
                    break
                case 'BUY':
                    handleBuy(command.args, client)
                    break
                case 'SELL':
                    handleSell(command.args, client)
                    break
                default:
                    clientLogger.info(`Unknown command: ${command.type}.`)
                    sendMessage(client, {type: 'error', message: `Unknown command ${command.type}`})
            }
        })

    })

    server.listen(port, () => logger.info(`SERVER STARTED ON PORT ${port}`))
    server.on('error', (err) => logger.error(`SERVER ERROR: ${err.message}`))

    return {wss, server}
}
