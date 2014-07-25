module.exports = function (grunt) {
  var excision = require('./lib/excision')(grunt);

  grunt.registerMultiTask('excision', 'Extract parts from one file into another.', task);

  function task(env) {
    env = env || excision;

    var options = this.options();

    if (grunt.util.kindOf(options.ranges) !== 'object') {
      throw new Error('Option "ranges" must be an object');
    }

    this.files.forEach(function (filePair) {
      var dest = filePair.dest,
          results = '',
          errors = [],
          lang;

      filePair.src.forEach(function (src) {
        var contents = grunt.file.read(src),
            range = options.ranges[src];

        results += env.process(contents, range);
      });

      if (options.validate) {
        lang = options.validate.lang;

        // Validate JS by default
        if (!lang) {
          lang = 'JS';
        }

        errors = env.validate(results, lang.toUpperCase());

        if (errors.length && !options.validate.tolerant) {
          return;
        }
      }

      grunt.file.write(dest, results);
      env.log('done', { dest: dest });
    });
  }

  return task;
};
