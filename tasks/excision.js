module.exports = function (grunt) {
  'use strict';

  grunt.registerMultiTask('excision', 'Extract lines from one file into another.', function () {
    var options = this.options();

    if (!options.lines) {
      options.lines = {};
    }

    this.files.forEach(function (filePair) {
      var dest = filePair.dest,
          results = '';

      filePair.src.forEach(function (src) {
        var contents = grunt.file.read(src),
            lines = contents.split('\n'),
            range = options.lines[src];

        if (grunt.util.kindOf(range) === 'array') {
          results += lines.slice(range[0] - 1, range[1])
            .join('\n');

          grunt.log.write('Extracting lines ');
          grunt.log.write(range[0] + '-' + range[1]);
          grunt.log.writeln(' from file ' + src);
        }
      });

      grunt.file.write(dest, results);

      grunt.log.write('File ');
      grunt.log.write(grunt.log.wordlist([dest]));
      grunt.log.writeln(' created.');
    });
  });

};
