import { createLogger, format, transports } from 'winston'

const baseFormat = format.combine(
    format.timestamp({format: 'HH:mm:ss'}),
    format.printf(info => {
        const clientStr = info.client ? `[CLIENT ${info.client}] : ` : ''
        return `[${info.level.toUpperCase()}] ${info.timestamp} | ${clientStr}${info.message}`
    })
)

export const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: baseFormat,
    transports: [new transports.Console()],
})

export function getClientLogger(clientId: string) {
    return logger.child({client: clientId})
}
