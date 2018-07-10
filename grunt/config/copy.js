module.exports = {
    copy: {
        files: [{
            expand: true,
            flatten: false,
            dest: 'assets/images/',
            cwd: 'images',
            src: '**/*'
        }]
    }
};
