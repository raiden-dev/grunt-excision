module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-coveralls');

  grunt.initConfig({
    mochaTest: {
      spec: {
        options: {
          reporter: 'spec',
          require: 'blanket'
        },
        src: ['test/**/*.js']
      },
      coverage: {
        options: {
          reporter: 'html-cov',
          quiet: true,
          captureFile: 'coverage/coverage.html'
        },
        src: ['test/**/*.js']
      },
      lcov: {
        options: {
          reporter: 'mocha-lcov-reporter',
          quiet: true,
          captureFile: 'coverage/lcov.info'
        },
        src: ['test/**/*.js']
      }
    },
    coveralls: {
      options: {
        force: true
      },
      all: {
        src: 'coverage/lcov.info'
      }
    }
  });

  grunt.registerTask('test', 'mochaTest');
  grunt.registerTask('default', 'test');
  grunt.registerTask('ci', ['default', 'coveralls']);

};
