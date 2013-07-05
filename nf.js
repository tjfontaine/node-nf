#!/usr/bin/env node

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
