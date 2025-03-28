import { Execution, MatchingEngine, MatchingEngineType, Order } from '@/types'
import { FifoMatchingEngine } from '@/matching-engines/fifo-matching-engine'

const ENGINES: Record<MatchingEngineType, MatchingEngine> = {
    FIFO: new FifoMatchingEngine(),
}

export function processOrder(order: Order, engineType: MatchingEngineType = 'FIFO'): Execution[] {
    const engine = ENGINES[engineType]
    return engine.process(order)
}
