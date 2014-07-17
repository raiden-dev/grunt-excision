module.exports = function (grunt) {
  'use strict';

  var excision = require('./lib/excision').init(grunt);

  grunt.registerMultiTask('excision', 'Extract parts from one file into another.', function () {
    var options = this.options();

    if (!options.lines) {
      options.lines = {};
    }

    this.files.forEach(function (filePair) {
      var dest = filePair.dest,
          results = '';

      filePair.src.forEach(function (src) {
        var contents = grunt.file.read(src),
            range = options.ranges[src];

        results += excision.process(range, contents);
      });

      grunt.file.write(dest, results);
      excision.log('done', { dest: dest });
    });
  });

};
