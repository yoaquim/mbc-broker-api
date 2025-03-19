import { Command } from '@/types'

export function parseCommand(message: string): Command | null {
    const tokens = message.trim().split(/\s+/)
    const type = tokens[0].toUpperCase()
    const args = tokens.slice(1)
    return {type, args}
}
