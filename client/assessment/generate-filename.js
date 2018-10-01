module.exports = (assessment) => {
    const date = (new Date()).toISOString().replace(/T.*/, '');
    const name = (assessment.projectName || assessment.name || '').replace(/[^a-zA-z0-9_ ]/g, '');
    return `ipt-${name}-${date}.txt`.replace(/ /g, '_').toLowerCase();
};
