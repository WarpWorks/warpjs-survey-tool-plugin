const moduleToTest = require('./is-mm');

describe('client/utils/is-mm.js', () => {
  it('exports a function with 1 param', () => {
  expect(moduleToTest).to.be.a('function').and.to.have.lengthOf(1);
  });

  it('returns true for key=mm', () => {
    expect(moduleToTest('mm')).to.be.true();
  });

  it('returns true for key starting with mm:', () => {
    expect(moduleToTest('mm: foo')).to.be.true();
  });

  it('returns false for key not mm', () => {
    [
      'ipt',
      'ipt:mm',
      'foo',
    ].forEach((key) => {
      expect(moduleToTest(key)).to.be.false();
    });
  });
});
