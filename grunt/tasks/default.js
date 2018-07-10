module.exports = (grunt) => {
    grunt.registerTask('default', [
        'clean',
        'copy',
        'eslint',
        // 'copy',
        'less',
        'webpack'
    ]);
};
