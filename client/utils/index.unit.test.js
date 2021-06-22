const testHelpers = require('@quoin/node-test-helpers');

const moduleToTest = require('./index');

const { expect } = testHelpers;

describe('client/utils/index.unit.test.js', () => {
  const clone = { ...moduleToTest };

  after(() => {
    expect(clone).to.be.empty();
  });

  describe('classByKey', () => {
    after(() => {
      delete clone.classByKey;
    });

    it.skip('is tested in class-by-key.unit.test.js');
  });

  describe('isIPT', () => {
    after(() => {
      delete clone.isIPT;
    });

    it('exports isIPT as a function with 1 param', () => {
      expect(moduleToTest).to.have.property('isIPT');
      expect(moduleToTest.isIPT).to.be.a('function').and.to.have.lengthOf(1);
    });

    it('returns opposite of isMM()', () => {
      [
        'foo',
        'bar',
        'ipt',
        'mm',
        'ipt: foo',
        'mm: foo',
      ].forEach((key) => {
        expect(moduleToTest.isIPT(key)).to.not.equal(moduleToTest.isMM(key));
      });
    });
  });

  describe('isMM()', () => {
    after(() => {
      delete clone.isMM;
    });

    it.skip('is tested in is-mm.unit.test.js');
  });

  describe('titleByKey()', () => {
    after(() => {
      delete clone.titleByKey;
    });

    it.skip('is tested in title-by-key.unit.test.js');
  });

});
