import { createLogger, format, transports } from 'winston'

const customTimestamp = format((info) => {
    const date = new Date()
    const utcDate = new Date(date.toUTCString())
    const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0')
    const day = String(utcDate.getUTCDate()).padStart(2, '0')
    const year = utcDate.getUTCFullYear()
    const hours = String(utcDate.getUTCHours()).padStart(2, '0')
    const minutes = String(utcDate.getUTCMinutes()).padStart(2, '0')
    info.timestamp = `${month}-${day}-${year} ${hours}:${minutes}`
    return info
})

const baseFormat = format.combine(
    customTimestamp(),
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
