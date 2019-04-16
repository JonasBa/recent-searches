module.exports = {
  // "collectCoverage": true,
  "roots": [
    "<rootDir>/lib"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "setupFiles": [
    "./jest.setup.js",
    "jest-localstorage-mock"
  ],
  "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
}