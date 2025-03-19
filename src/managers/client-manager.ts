import { v4 as uuidv4 } from 'uuid'
import WebSocket from 'ws'
import { Client } from '@/types'

const CLIENTS = new Map<WebSocket, Client>()

export function addClient(ws: WebSocket): Client {
    const client: Client = {id: uuidv4(), ws}
    CLIENTS.set(ws, client)
    return client
}

export function removeClient(ws: WebSocket): void {
    CLIENTS.delete(ws)
}

export function getClient(ws: WebSocket): Client | undefined {
    return CLIENTS.get(ws)
}

export function getClientById(id: string): Client | undefined {
    for (const client of CLIENTS.values()) {
        if (client.id === id) return client
    }
    return undefined
}

export function getAllClients(): Client[] {
    return Array.from(CLIENTS.values())
}
