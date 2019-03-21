module.exports = {
    preset: 'ts-jest',
    testRegex: '.spec.ts$',
    testEnvironment: 'node',
    automock: false,
    setupFiles: [
        './setupJest.ts'
    ]
};