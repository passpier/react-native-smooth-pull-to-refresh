module.exports = {
  preset: "react-native",
  transform: {
    "^.+\\.js$": "<rootDir>/node_modules/react-native/jest/preprocessor.js",
    "^.+\\.tsx?$": "ts-jest",
  },
  setupFiles: ["./src/__tests__/test-helper/setupTests.ts"],
  setupTestFrameworkScriptFile: "<rootDir>/src/__tests__/test-helper/setupTestFrameworkScript.ts",
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  snapshotSerializers: ["enzyme-to-json/serializer"],
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node",
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "dist",
    "/src/__tests__/test-helper"
  ],
};
