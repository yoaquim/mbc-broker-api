import { parseCommand } from '../src/command-parser'

describe('parseCommand', () => {
    it('should parse a valid command with one argument', () => {
        const input = 'SUBSCRIBE TSLA'
        const result = parseCommand(input)
        expect(result).toEqual({type: 'SUBSCRIBE', args: ['TSLA']})
    })

    it('should parse a valid command with multiple arguments and extra spaces', () => {
        const input = '  buy   10  TSLA  '
        const result = parseCommand(input)
        expect(result).toEqual({type: 'BUY', args: ['10', 'TSLA']})
    })

    it('should only uppercase the command type and leave args intact', () => {
        const input = 'sell 5 meta'
        const result = parseCommand(input)
        expect(result).toEqual({type: 'SELL', args: ['5', 'meta']})
    })

    it('should handle an empty string', () => {
        const input = ''
        const result = parseCommand(input)
        // Note: because "".trim() is "" and "".split(/\s+/) returns [""] we get { type: "", args: [] }
        expect(result).toEqual({type: '', args: []})
    })

    it('should handle a string with only whitespace', () => {
        const input = '    '
        const result = parseCommand(input)
        expect(result).toEqual({type: '', args: []})
    })
})
