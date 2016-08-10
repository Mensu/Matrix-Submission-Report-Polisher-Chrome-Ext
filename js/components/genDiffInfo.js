var diff_match_patch = require('./diff_match_patch.js');
var Diff = new diff_match_patch();
Diff.Diff_Timeout = 0;
/** 
 * modify a Case object by adding to it some diff information
 * @param {Case} oneCase - a Case object containing property "stdOutput" end "yourOutput"
 * @return {undefined} no return value should be expected
 * independent
 */
function genDiffInfo(oneCase) {
  if (typeof(oneCase.stdOutput) != 'string' || typeof(oneCase.yourOutput) != 'string') return;
  oneCase['diff'] = Diff.diffLines(oneCase.stdOutput, oneCase.yourOutput);
  oneCase.diff.forEach(function(oneDiff, index, self) {
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
  });
}

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
    exports['genDiffInfo'] = factory();
  else
    root['genDiffInfo'] = factory();
})(this, function factory() {
  return genDiffInfo;
});
