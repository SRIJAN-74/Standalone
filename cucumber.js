module.exports = {
  default: [
    '--require-module ts-node/register --require src/tests/steps/test.ts',
    '--require src/tests/steps/**/*.ts',
    '--require src/tests/support/**/*.ts',
    '--format progress',
    '--format json:reports/cucumber.json',
    '--require src/tests/steps/test.ts'
  ].join(' ')
};