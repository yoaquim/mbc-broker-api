// src/index.ts
import express from 'express'
import { setupWebSocketServer } from './websocket'
import { startTickerSimulator } from './ticker-simulator'

const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('Welcome to the Broker API')
})

startTickerSimulator(1000)

setupWebSocketServer(app, Number(PORT))
