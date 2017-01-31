var diff_match_patch = require('./lib/diff_match_patch.js');
var Diff = new diff_match_patch();
Diff.Diff_Timeout = 0;

function CaseObject() {
  this.extendFrom({
    "error": null,
    "msg": null,
    "resultCode": null,
    "input": null,
    "stdOutput": null,
    "yourOutput": null,
    "diff": null,
    "memoryused": null,
    "timeused": null
  });
}
CaseObject.prototype = {
  "constructor": CaseObject,
  "extendFrom": function(parent) {
    for (var name in parent) this[name] = parent[name];
  },
  /** 
   * modify a CaseObject by adding to it some diff information
   * @return {undefined}
   *
   * dependent of 
   *     {diff_match_patch} Diff
   */
  "genDiffInfo": function() {
    if (typeof(this.stdOutput) != 'string' // || 0 == this.stdOutput.length
      || typeof(this.yourOutput) != 'string'/* || 0 == this.yourOutput.length*/) {

        this['diff'] = null;
        return;
    }
    this['diff'] = Diff.diffLines(this.stdOutput, this.yourOutput);
    this.diff.forEach(function(oneDiff, index, self) {
      var isReversed = (index && index + 1 == self.length && self[index - 1].added && self[index].removed);
      if (isReversed) {
        var temp = self[index - 1];
        self[index - 1] = self[index];
        self[index] = temp;
      }
        // if the case is [removed] [added] and the two blocks contain the same number of lines
      if (index && self[index - 1].removed && self[index].added) {
        var removedLines = self[index - 1].value;
        var removedLinesBinary = self[index - 1].binary;
        var addedLines = self[index].value;
        var addedLinesBinary = self[index].binary;
        if (removedLines.length == addedLines.length) {
          self[index - 1]['inlineDiff'] = [], self[index]['inlineDiff'] = [];
          self[index - 1]['inlineBinaryDiff'] = [], self[index]['inlineBinaryDiff'] = [];
          
            // perform diff on every two corresponding lines (diff by char)
          removedLines.forEach(function(one, j) {
            var inlineDiff = Diff.diffChars(removedLines[j], addedLines[j]);
            var inlineBinaryDiff = Diff.diffWords(removedLinesBinary[j], addedLinesBinary[j]);

            var oneRemovedLine = [], oneAddedLine = [];
            inlineDiff.forEach(function(oneLine) {
              if (oneLine.added === undefined) oneRemovedLine.push(oneLine);
              if (oneLine.removed === undefined) oneAddedLine.push(oneLine);
            });
            self[index - 1].inlineDiff.push(oneRemovedLine), self[index].inlineDiff.push(oneAddedLine);

            oneRemovedLine = [], oneAddedLine = [];
            inlineBinaryDiff.forEach(function(oneLine) {
              if (oneLine.added === undefined) oneRemovedLine.push(oneLine);
              if (oneLine.removed === undefined) oneAddedLine.push(oneLine);
            });
            self[index - 1].inlineBinaryDiff.push(oneRemovedLine), self[index].inlineBinaryDiff.push(oneAddedLine);
          });
        }
      }
      // if (isReversed) {
      //   var temp = self[index - 1];
      //   self[index - 1] = self[index];
      //   self[index] = temp;
      // }
    });
  }

};

(function exportModuleUniversally(root, factory) {
  if (typeof(exports) === 'object' && typeof(module) === 'object')
    module.exports = factory();
  else if (typeof(define) === 'function' && define.amd)
    define(factory);
  /* amd  // module name: diff
    define([other dependent modules, ...], function(other dependent modules, ...)) {
      return exported object;
    });
    usage: require([required modules, ...], function(required modules, ...) {
      // codes using required modules
    });
  */
  else if (typeof(exports) === 'object')
    exports['CaseObject'] = factory();
  else
    root['CaseObject'] = factory();
})(this, function factory() {
  return CaseObject;
});
