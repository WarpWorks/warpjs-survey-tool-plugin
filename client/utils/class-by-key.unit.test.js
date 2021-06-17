const testHelpers = require('@quoin/node-test-helpers');

const moduleToTest = require('./class-by-key');

const { expect } = testHelpers;

describe('client/utils/class-by-key.unit.test.js', () => {
  it('exports a function with 1 param', () => {
    expect(moduleToTest).to.be.a('function').and.to.have.lengthOf(1);
  });

  it('returns mm if isMM', () => {
    [
      'mm',
      'mm: foo',
    ].forEach((key) => {
      expect(moduleToTest(key)).to.equals('mm');
    });
  });

  it('returns ipt if !isMM', () => {
    [
      'ipt',
      'ipt: foo',
      'foo',
    ].forEach((key) => {
      expect(moduleToTest(key)).to.equals('ipt');
    });
  });
});
