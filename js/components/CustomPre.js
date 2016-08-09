var createElementWith = require('./createElementWith.js');
function CustomPre() {}
CustomPre.prototype = {

  /** 
   * formatting rules:
   * if the number has less than three digits, '0's are prefixed for the number's string to have three digits
   * else the number is stringified as normal
   * @param {number} linenum
   * @return {string} the formatted string of line number
   * independent
   */
  "toLinenumString": function(linenum) {
    var digitNum = String(linenum).length;
    digitNum = (digitNum < 4) ? 3 : digitNum;
    return ('00' + linenum).slice(-digitNum);
  },

  /** 
   * create a pre decorated with the line numbers using the text provided
   * @param {string} text
   * @return {Node} the created pre
   * dependent of 
   *   {function} createElementWith
   *   {function} CustomPre.prototype.toLinenumString
   */
  "createLinenumPreWithText": function(text) {
    var lineCnt = text.split('\n').length;
    var newPre = createElementWith('pre', ['plain-text-wrapper', 'line-numbers-wrapper'], text + (text.endsWith('\n') ? '\n' : ''));
    var linenumRows = createElementWith('span', 'line-numbers-rows');
    var oneRow = null;
    for (var linenum = 1; linenum != lineCnt + 1; ++linenum) {
      oneRow = createElementWith('div', 'line-numbers-one-row', CustomPre.prototype.toLinenumString(linenum));
      linenumRows.appendChild(oneRow);
    }
    newPre.appendChild(linenumRows);
    return newPre;
  },

  /** 
   * create a pre using the text provided
   * @param {string} text
   * @return {Node} the created pre
   * dependent of 
   *   {function} createElementWith
   */
  "createPreWithText": function(text) {
    return createElementWith('pre', 'plain-text-wrapper', text + (text.endsWith('\n') ? '\n' : ''));
  },

  /** 
   * create a pre decorated with two columns of line numbers using the diffResult provided
   * @param {Object[]} diffResult
   * @return {Node} the created pre
   * dependent of
   *   {function} createElementWith
   *   {function} CustomPre.prototype.toLinenumString
   */
  "createDiffPre": function(diffResult) {
    var leadingNewLine = createElementWith('span', 'diffPre-leading-newline', '\n');
    var diffPre = createElementWith('pre', ['plain-text-wrapper', 'line-numbers-wrapper', 'diffPre'], leadingNewLine);
    var linenumRowsLeft = createElementWith('span', 'line-numbers-rows');
    var linenumRowsRight = createElementWith('span', ['line-numbers-rows', 'line-numbers-rows-right']);
    
    var oneDiffContentPre = null, oneDiffContentSpan = null, oneLeftRow = null, oneRightRow = null;
    var leftLinenumStr = null, rightLinenumStr = null, bgcolorClass = null;
    var stdLinenum = 1, yourLinenum = 1;

    var linenumRowConfig = {
      "stdLinenum": (function() { return CustomPre.prototype.toLinenumString(stdLinenum++); }),
      "yourLinenum": (function() { return CustomPre.prototype.toLinenumString(yourLinenum++); }),
      "stdHeading": (function() { return '  std'; }),
      "yourHeading": (function() { return 'your'; }),
      "added": (function() { return '    +'; }),
      "removed": (function() { return '    -'; }),
      "blank": (function() { return '     '; })
    };

    var diffTypeConfig = {
      "common": {
        "leftLinenumStr": linenumRowConfig.stdLinenum,
        "rightLinenumStr": linenumRowConfig.yourLinenum,
        "bgcolorClass": 'diff-common-bg'
      },
      "added": {
        "leftLinenumStr": linenumRowConfig.added,
        "rightLinenumStr": linenumRowConfig.yourLinenum,
        "bgcolorClass": 'diff-added-bg'
      },
      "removed": {
        "leftLinenumStr": linenumRowConfig.stdLinenum,
        "rightLinenumStr": linenumRowConfig.removed,
        "bgcolorClass": 'diff-removed-bg'
      }
    };
    
    linenumRowsLeft.appendChild(createElementWith('div', 'line-numbers-one-row-std-heading', linenumRowConfig.stdHeading()));
    linenumRowsRight.appendChild(createElementWith('div', 'line-numbers-one-row-your-heading', linenumRowConfig.yourHeading()));

    diffResult.forEach(function(oneDiff, index, self) {
      oneDiffContentPre = createElementWith('pre', 'one-diff-wrapper');
      oneDiffContentSpan = createElementWith('span', 'one-diff-content');

      leftLinenumStr = null, rightLinenumStr = null, bgcolorClass = null;
        // assign values to leftLinenumStr, rightLinenumStr, bgcolorClass;
      (function assignConfig() {
        for (typeName in diffTypeConfig) {
          if (oneDiff[typeName]) {
            leftLinenumStr = diffTypeConfig[typeName].leftLinenumStr;
            rightLinenumStr = diffTypeConfig[typeName].rightLinenumStr;
            bgcolorClass = diffTypeConfig[typeName].bgcolorClass;
            break;
          }
        }
      })();
      oneDiffContentSpan.classList.add(bgcolorClass), oneDiffContentPre.classList.add(bgcolorClass);
      function getOneDiffText(oneDiff, index, binary) {
        var value = binary ? 'binary' : 'value';
        var inlineDiff = binary ? 'inlineBinaryDiff' : 'inlineDiff';
        if (oneDiff.inlineDiff === undefined) {
          if (binary) return oneDiff[value][index].slice(0, -1);
          else return oneDiff[value][index];
        }
        var oneLineSpans = [], inlineDiffs = oneDiff[inlineDiff][index];
        for (var i in inlineDiffs) {
          var oneInlineDiff = inlineDiffs[i];
          if (0 == oneInlineDiff.value.length) continue;
          var inlineColor = oneInlineDiff.added ? 'inline-added-bg' : (oneInlineDiff.removed ? 'inline-removed-bg' : 'inline-common-bg');
          oneLineSpans.push(createElementWith('span', inlineColor, oneInlineDiff.value));
          if (binary && i != inlineDiffs.length - 1) oneLineSpans.push(createElementWith('span', 'inline-common-bg', ' '));
        }
        return oneLineSpans;
      }
        // main work: pushing texts and linenums to diffPre
      var oneDiffConfig = {
        "textRowClass": ['one-diff-content-one-row-text', 'one-diff-content-one-row-binary'],
        "textRowNewLineClass": [
          ['one-diff-content-newline'],
          ['one-diff-content-newline', 'one-diff-content-one-row-binary']
        ],
        "linenumRowClassList": [
          ['line-numbers-one-row'],
          ['line-numbers-one-row', 'line-numbers-one-row-binary']
        ],
        "linenumRowContents": [
          [ (function() { return leftLinenumStr(); }),
            (function() { return rightLinenumStr(); })
          ],
          [ linenumRowConfig.blank,
            linenumRowConfig.blank
          ]
        ]
      };
      for (var lineIndex = 0; lineIndex != oneDiff.value.length; ++lineIndex) {  // lineIndex: the n th line of oneDiff
        for (var i = 0; i != 2; ++i) {  // i = 0: text, i = 1: binary
          oneDiffContentSpan.appendChild(createElementWith('span', oneDiffConfig.textRowClass[i], getOneDiffText(oneDiff, lineIndex, i)));
          oneLeftRow = createElementWith('div', oneDiffConfig.linenumRowClassList[i], oneDiffConfig.linenumRowContents[i][0]());
          oneRightRow = createElementWith('div', oneDiffConfig.linenumRowClassList[i], oneDiffConfig.linenumRowContents[i][1]());
          oneLeftRow.classList.add(bgcolorClass), oneRightRow.classList.add(bgcolorClass);
          linenumRowsLeft.appendChild(oneLeftRow), linenumRowsRight.appendChild(oneRightRow);
          oneDiffContentSpan.appendChild(createElementWith('span', oneDiffConfig.textRowNewLineClass[i], '\n'));
        }
      }
      oneDiffContentPre.appendChild(oneDiffContentSpan);
      diffPre.appendChild(oneDiffContentPre);
    });
    diffPre.insertBefore(linenumRowsLeft, leadingNewLine), diffPre.insertBefore(linenumRowsRight, leadingNewLine);
    return diffPre;
  }
};
CustomPre.prototype.constructor = CustomPre;
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
    exports['CustomPre'] = factory();
  else
    root['CustomPre'] = factory();
})(this, function factory() {
  return new CustomPre();
});
