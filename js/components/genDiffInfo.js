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
    if (index && self[index - 1].removed && self[index].added) {
      var removedLines = self[index - 1].value;
      var removedLinesBinary = self[index - 1].binary;
      var addedLines = self[index].value;
      var addedLinesBinary = self[index].binary;
      if (removedLines.length == addedLines.length) {
        self[index - 1]['inlineDiff'] = [], self[index]['inlineDiff'] = [];
        self[index - 1]['inlineBinaryDiff'] = [], self[index]['inlineBinaryDiff'] = [];
        for (var j in removedLines) {
          var inlineDiff = Diff.diffChars(removedLines[j], addedLines[j]);
          var inlineBinaryDiff = Diff.diffWords(removedLinesBinary[j], addedLinesBinary[j]);;
          var oneRemovedLine = [], oneAddedLine = [];
          for (var k in inlineDiff) {
            if (inlineDiff[k].added === undefined) oneRemovedLine.push(inlineDiff[k]);
            if (inlineDiff[k].removed === undefined) oneAddedLine.push(inlineDiff[k]);
          }
          self[index - 1].inlineDiff.push(oneRemovedLine), self[index].inlineDiff.push(oneAddedLine);
          oneRemovedLine = [], oneAddedLine = [];
          for (var k in inlineBinaryDiff) {
            if (inlineBinaryDiff[k].added === undefined) oneRemovedLine.push(inlineBinaryDiff[k]);
            if (inlineBinaryDiff[k].removed === undefined) oneAddedLine.push(inlineBinaryDiff[k]);
          }
          self[index - 1].inlineBinaryDiff.push(oneRemovedLine), self[index].inlineBinaryDiff.push(oneAddedLine);
        }
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
