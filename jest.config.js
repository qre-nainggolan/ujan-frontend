module.exports = {
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  testMatch: ["**/__test__/**/*.(test|spec).[jt]s?(x)"],
  // setupFilesAfterEnv: ["@testing-library/jest-dom"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  setupFiles: ["<rootDir>/src/setupTests/polyfill.ts"],
  transformIgnorePatterns: ["node_modules/(?!(axios)/)"],
  moduleNameMapper: {
    "^.*agent$": "<rootDir>/src/app/api/agent.ts",
    "\\.(css|scss|sass)$": "identity-obj-proxy",
    "\\.(svg|jpg|jpeg|png|gif)$": "<rootDir>/__mocks__/fileMock.js",
    "^@/app/api/agent$": "<rootDir>/__mocks__/agent.ts",
  },
  preset: "ts-jest",
  testEnvironment: "jsdom",
};
