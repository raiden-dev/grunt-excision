module.exports = function (grunt) {
  'use strict';

  var excision = require('./lib/excision').init(grunt);

  grunt.registerMultiTask('excision', 'Extract parts from one file into another.', function () {
    var options = this.options();

    if (!options.ranges) {
      options.ranges = {};
    }

    this.files.forEach(function (filePair) {
      var dest = filePair.dest,
          results = '',
          errors = [];

      filePair.src.forEach(function (src) {
        var contents = grunt.file.read(src),
            range = options.ranges[src];

        results += excision.process(contents, range);
      });

      if (options.validate) {
        errors = excision.validate(results, options.validate.lang);

        if (errors.length && !options.validate.tolerant) {
          return;
        }
      }

      grunt.file.write(dest, results);
      excision.log('done', { dest: dest });
    });
  });

};
