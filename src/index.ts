import express from 'express'
import { setupWebSocketServer } from './websocket'

const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('Broker API')
})

setupWebSocketServer(app, Number(PORT))
