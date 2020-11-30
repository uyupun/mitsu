module.exports = {
  testMatch: ['**/tests/*.spec.js'],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'tests/coverage',
  forceExit: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
}
