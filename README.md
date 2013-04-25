# grunt-templatizer

> [`templatizer`](https://github.com/HenrikJoreteg/templatizer) is a lovely little utility by [Henrik Jorteg](https://github.com/henrikjoreteg) that takes a template directory structure and produces a module containing your precompiled Jade templates.

>`grunt-templatizer` is a [Grunt](http://gruntjs.com/) plugin that reimplements `templatizer`.


## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-templatizer --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-templatizer');
```

## The "templatizer" task

### Overview
In your project's Gruntfile, add a section named `templatizer` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  templatizer: {
    your_target: {
      // Target-specific file lists and/or options go here.
    }
  }
})
```

### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result would be `Testing, 1 2 3.`

```js
grunt.initConfig({
  templatizer: {
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
})
```

## Differences from `templatizer`
`templatizer` takes a specified template directory path and operates on the directory structure within that directory. `grunt-templatizer` takes the list of template files from the mask in your Gruntfile and and induces a directory structure based on the point at which the directory tree begins to branch. For example:

```shell
/templates/foo.jade
/templates/bar.jade
```

and

```shell
/templates/randomdir/foo.jade
/templates/randomdir/bar.jade
```

will both come out as

```js
exports.foo = function anonymous(locals) {
...
exports.bar = function anonymous(locals) {
...
```

in your compile template module.

Whereas

```shell
/templates/randomdir/foo.jade
/templates/bar.jade
```

will become

```js
exports.randomdir.foo = function anonymous(locals) {…
exports.bar = function anonymous(locals) {…
```

Also note that I've rewritten a significant portion of `templatizer.js` to adapt it for Grunt, so crashes and bugs are probably my fault.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

