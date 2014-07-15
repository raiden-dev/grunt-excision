# grunt-excision v1.0.0

> Extract parts from one file into another.


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
      ranges: {
        'bower_components/jquery/dist/jquery.js': {    // Src file path
          trim: { // nop
            '2.1.1': [ // nop
              'define(function () { var utils = {};',  // Append string
              'var ', ['14551', '14585'], ';',         // Decimal offset
              'var ', ['0x3e28', '0x3e86'], ';',       // Hexademical offset
              'var tmp = {', [396, 400], '};',         // Line numbers range
              'utils.trim = tmp.trim;'
            ]
          }
        },
        'bower_components/lodash/dist/lodash.js': {
          defer: [
            // Regexp match
            /function isFunction\([\s\S]*?return[\s\S]*?\}/,
            /function slice\([\s\S]*?return[\s\S]*?\}/,
            'utils.defer = ', /function defer\([\s\S]*?return.*[\r\n]+.*\}/, ';',
            'return utils; });'
          ]
        }
      }
    },
    files: {
      'out/utils.js': [
        'bower_components/jquery/dist/jquery.js',
        'bower_components/lodash/dist/lodash.js'
      ]
    }
  }
```


## Release History

 * 2014-07-15   v1.0.0   More flexible API; Hex/dec offsets; String appending; Regexp match; Refactoring
 * 2014-07-15   v0.2.0   Add extract bytes option
 * 2014-07-14   v0.1.0   Initial release
