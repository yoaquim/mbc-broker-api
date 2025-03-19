/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    transform: {
        '^.+\.tsx?$': [ 'ts-jest', {} ],
    },
    testMatch: [ '**/tests/**/*.test.ts' ],
}