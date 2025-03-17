export interface Command {
    type: string;
    args: string[];
}

export function parseCommand(message: string): Command | null {
    const tokens = message.trim().split(/\s+/)
    if (tokens.length === 0) return null

    const type = tokens[0].toUpperCase()
    const args = tokens.slice(1)
    return {type, args}
}
