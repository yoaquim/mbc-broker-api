import WebSocket, { Server as WebSocketServer } from 'ws'
import http from 'http'
import express from 'express'
import { logger, getClientLogger } from '@/utils/logger'
import { sendMessage } from '@/utils/messenger'
import { parseCommand } from '@/utils/command-parser'
import { handleBuy, handleSell, handleSubscribe, handleUnsubscribe } from '@/command-handlers'
import { addClient, removeClient } from '@/managers/client-manager'
import { Client } from '@/types'
import { unsubscribeAll } from '@/managers/subscription-manager'

export function setupWebSocketServer(app: express.Application, port: number): { wss: WebSocketServer, server: http.Server } {
    const server = http.createServer(app)
    const wss = new WebSocketServer({server})

    wss.on('connection', (ws) => {
        const client: Client = addClient(ws)
        const clientLogger = getClientLogger(client.id)
        clientLogger.info('Client connected')

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

        ws.on('close', () => {
            clientLogger.info('Client disconnected')
            removeClient(ws)
            unsubscribeAll(client)
        })

        ws.on('error', (err) => logger.error(`WebSocket error: ${err.message}`))
    })

    server.listen(port, () => logger.info(`SERVER STARTED ON PORT ${port}`))
    server.on('error', (err) => logger.error(`SERVER ERROR: ${err.message}`))

    return {wss, server}
}
