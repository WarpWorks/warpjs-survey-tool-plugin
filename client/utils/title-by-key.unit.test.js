const moduleToTest = require('./title-by-key');

const { TITLES } = require('../constants');

describe('client/utils/title-by-key.unit.test.js', () => {
  it('exports a function with 1 param', () => {
    expect(moduleToTest).to.be.a('function').and.to.have.lengthOf(1);
  });

  it('returns default MM title when isMM but no label', () => {
    expect(moduleToTest('mm')).to.equal(TITLES.MM);
  });

  it('returns default IPT title when !isMM and no label', () => {
    expect(moduleToTest('ipt')).to.equal(TITLES.IPT);
  });

  it('returns label if defined', () => {
    [
      'mm: foo',
      'ipt: foo',
    ].forEach((key) => {
      expect(moduleToTest(key)).to.equal('foo');
    });
  });

  it('returns default IPT title for any other key', () => {
    expect(moduleToTest('foo')).to.equal(TITLES.IPT);
  });

});
