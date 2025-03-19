import express from 'express'
import { setupWebSocketServer } from './websocket'
import { startTickerSimulator } from './ticker-simulator'

const app = express()
const PORT = process.env.PORT || 3000

app.get('/health', (req, res) => {
    res.status(200).json({status: 'OK'})
})

startTickerSimulator()
setupWebSocketServer(app, Number(PORT))
