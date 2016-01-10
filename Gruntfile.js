module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'src/css/osb-film-tv-guide.css': 'src/scss/osb-film-tv-guide.scss'
                }
            }
        },
        watch: {
            scripts: {
                files: ['src/scss/**/*.scss'],
                tasks: ['sass'],
                options: {
                    spawn: false
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-serve');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('default', ['serve']);
    grunt.registerTask('css', ['sass']);

};