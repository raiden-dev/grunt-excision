# grunt-excision v0.1.0

> Extract lines from one file into another.


## Getting Started

This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-contrib-copy --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-contrib-copy');
```

*This plugin was designed to work with Grunt 0.4.x. If you're still using grunt v0.3.x it's strongly recommended that [you upgrade](http://gruntjs.com/upgrading-from-0.3-to-0.4), but in case you can't please use [v0.3.2](https://github.com/gruntjs/grunt-contrib-copy/tree/grunt-0.3-stable).*


## Excision task

_Run this task with the `grunt excision` command._

### Usage Examples

```js
excision: {
  utils: {
    options: {
      lines: {
        'bower_components/lodash/dist/lodash.js': [4321, 4374],
        'bower_components/lodash/dist/lodash.underscore.js': [1007, 1050]
      },
      bytes: {
        'bower_components/lodash/dist/lodash.js': [1052, 1320],
        'bower_components/lodash/dist/lodash.underscore.js': [1853, 1998]
      }
    },
    files: {
      'out/utils.js': [
        'bower_components/lodash/dist/lodash.js',
        'bower_components/lodash/dist/lodash.underscore.js'
      ]
    }
  }
}
```


## Release History

 * 2014-07-14   v0.1.0   Initial release
