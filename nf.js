#!/usr/bin/env node
// Copyright 2013 Timothy J Fontaine <tjfontaine@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE


var fs = require('fs')
var stream = require('stream');
var util = require('util');
var vm = require('vm');

var LS = require('lstream');

if (!stream.Transform)
  stream = require('readable-stream');


function EachLine(script) {
  if (!(this instanceof EachLine))
    return new EachLine(opts);

  opts = opts || {};
  opts.objectMode = true;

  this._script = opts.script;
  this._sandbox = opts.sandbox;

  stream.Transform.call(this, opts);
}
util.inherits(EachLine, stream.Transform);


EachLine.prototype._transform = function(chunk, encoding, done) {
  this._sandbox.__line = chunk;
  this.push(this._script.runInNewContext(this._sandbox) + '\n');
  done();
};


process.argv.shift();
process.argv.shift();


var script = process.argv.pop();
var scriptFile = 'stdin';
var print = false;
var each = false;
var evaluate = false;


process.argv.forEach(function (a) {
  if (!/^-/.test(a)) throw new Error("invalid argument " + a);
  a.split('').forEach(function (b) {
    if (!b || b === '-') return;

    switch (b) {
      case 'e':
        evaluate = true;
        break;
      case 'p':
        each = true;
        print = true;
        break;
      case 'n':
        each = true;
        break;
      default:
        console.error('unknown command option:', b);
        break;
    }
  });
});


if (!evaluate) {
  scriptFile = script;
  script = fs.readFileSync(scriptFile);
}


var opts = {
  script: vm.createScript(script, scriptFile),
  sandbox: util._extend({
    __line: undefined,
    require: require,
    __state: {},
  }, global),
};


if (each) {
  var dest = process.stdin.pipe(new LS()).pipe(new EachLine(opts));

  if (print)
    dest.pipe(process.stdout);
} else {
  opts.script.runInNewContext(opts.sandbox);
}
