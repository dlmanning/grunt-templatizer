/*
 * grunt-templatizer
 * https://github.com/dlmanning/grunt-templatizer
 *
 * Copyright (c) 2013 David Manning
 * Licensed under the MIT license.
 */

var jade     = require('jade')
  , uglifyjs = require('uglify-js')
  , path     = require('path')
  , fs       = require('fs');

'use strict';

function beautify(code) {
    return uglifyjs.parse(code).print_to_string({beautify: true, indent_level: 2});
}

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('templatizer', 'Templatize!', function () {
    var templateFileList = []
      , filePathArray = []
      , folders = []
      , templates = []
      , isWindows = process.platform === 'win32'
      , pathSep = path.sep || (isWindows ? '\\' : '/')
      , pathDepth = 0
      , numberOfFiles = 0
      , placesToLook = [
          __dirname + '/../../jade/runtime.min.js',
          __dirname + '/../node_modules/jade/runtime.min.js',
          __dirname + '/jaderuntime.min.js'
        ]
      , jadeRuntime = grunt.file.read(grunt.util._.find(placesToLook, fs.existsSync))
      , outputFile = this.files[0].dest
      , output = [
          '(function () {',
          'var root = this, exports = {};',
          '',
          '// The jade runtime:',
          'var ' + jadeRuntime,
          ''
        ].join('\n');

    if(this.filesSrc.length === 0) {
      grunt.warn("No template files in src path!");
    }

    this.files.forEach(function (file) {
      var fileList = file.src;
      templateFileList = fileList.filter(function (f) {
        return (grunt.file.exists(f) && path.extname(f) === '.jade');
      });
    });

    numberOfFiles = templateFileList.length;

    // How far down does the folder depth go?
    templateFileList.forEach( function (filepath) {
      filepath.split('/').forEach( function (element, index) {
        if (pathDepth <= index) {
          filePathArray.push([]);
          pathDepth += 1;
        }
      });
    });

    // Populate a [pathDepth x numberOfFiles] array
    templateFileList.forEach( function (filepath) {
      var pathDepthFilled = 0;
      filepath.split('/').forEach( function (element, index) {
        filePathArray[index].push(element);
        pathDepthFilled += 1;
      });
      while (pathDepthFilled < pathDepth) {
        filePathArray[pathDepthFilled].push('');
        pathDepthFilled += 1;
      }
    });

    var directoriesAreAllTheSame = true;
    var uniqueDirectoryLevel = 0;

    // Figure out at what level folder names start branching
    for(var i = 1; directoriesAreAllTheSame && i < pathDepth; i++) {
      directoriesAreAllTheSame = false;
      filePathArray[i].forEach( function (element, index, arr) {
        if (index !== numberOfFiles - 1) {
          directoriesAreAllTheSame = (arr[index] === arr[index + 1]);
        }
      });
      uniqueDirectoryLevel = i;
    }

    // populate folders[] and templates[] with appropriate names
    for(var i = 0; i < numberOfFiles; i++) {
      folderObjectName = '';
      for (var j = uniqueDirectoryLevel; j + 1 < pathDepth && filePathArray[j + 1][i] !== ''; j++)
        folderObjectName += '.' + filePathArray[j][i] ;
      templates.push('exports' + folderObjectName + '.' + path.basename(filePathArray[j][i], '.jade'));
      // are we dealing with the filename now?
      if (uniqueDirectoryLevel + 1 < pathDepth && filePathArray[uniqueDirectoryLevel + 1][i] !== '')
        folders.push(folderObjectName.slice(1));
    }

    folders = grunt.util._.uniq(folders);

    folders = grunt.util._.sortBy(folders, function (folder) {
      var arr = folder.split('.');
      return arr.length;
    });

    output += '\n// create our folder objects';
    folders.forEach(function (folder) {
      output += '\nexports.' + folder + ' = {};';
    });
    output += '\n';

    templateFileList.forEach(function (file, index) {
      var compiledTemplate = beautify(jade.compile(grunt.file.read(file), {client: true, pretty: false, filename: file, compileDebug: false}).toString());
      output += [
        '',
        '// ' + file + ' compiled template',
        templates[index] + ' = ' + compiledTemplate + ';',
        ''
      ].join('\n');
    });

    output += [
        '\n',
        '// attach to window or export with commonJS',
        'if (typeof module !== "undefined") {',
        '    module.exports = exports;',
        '} else if (typeof define === "function" && define.amd) {',
        '    define(exports);',
        '} else {',
        '    root.templatizer = exports;',
        '}',
        '',
        '})();'
    ].join('\n');

    grunt.file.write(outputFile, output);

    grunt.log.writeln('File "' + outputFile + '" created.');

  });
};
