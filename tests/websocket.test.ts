import express from 'express'
import http from 'http'
import WebSocket from 'ws'
import { setupWebSocketServer } from '@/websocket'

describe('WebSocket Server', () => {
    let app: express.Application
    let wss: WebSocket.Server
    let server: http.Server
    let port: number

    beforeAll((done) => {
        app = express()
        const result = setupWebSocketServer(app, 0)
        wss = result.wss
        server = result.server
        setTimeout(done, 200)
        server.on('listening', () => {
            port = (server.address() as any).port
            console.log(`Server is listening on port ${port}`)
            done()
        })
    })

    afterAll((done) => {
        wss.close(() => server.close(done))
    })

    it('should route a SUBSCRIBE command and return a confirmation', (done) => {
        const client = new WebSocket(`ws://localhost:${port}`)

        client.on('open', () => {
            client.send('SUBSCRIBE TSLA')
        })

        client.on('message', (data) => {
            const msg = JSON.parse(data.toString())
            expect(msg).toMatchObject({type: 'subscribe_ack', ticker: 'TSLA'})
            client.close()
            done()
        })

        client.on('error', (err) => {
            done(err)
        })
    })

    it('should respond with an error for an unknown command', (done) => {
        const client = new WebSocket(`ws://localhost:${port}`)

        client.on('open', () => {
            client.send('FOO BAR')
        })

        client.on('message', (data) => {
            const msg = JSON.parse(data.toString())
            expect(msg).toMatchObject({type: 'error', message: 'Unknown command FOO'})
            client.close()
            done()
        })

        client.on('error', (err) => {
            done(err)
        })
    })
})
