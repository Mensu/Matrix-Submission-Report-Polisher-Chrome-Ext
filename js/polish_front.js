function httpRequest(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('get', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) return callback(false, this.response);
  }
  xhr.onerror = function() { return callback(true); }
  xhr.send();
}

/** 
 * Create an element of tagName type, optionally add classes and append Nodes to the newly created element
 * @param {string} tagName
 * @param {(string | string[] )} [classList] - a class or an array of classes
 * @param {(string | Node[] | string[] )} [appendedChildren] - a string or an array of string or an array of Nodes
 * @return {Node} the created element
 * independent
 */
function createElementWith(tagName, classList, appendedChildren) {
  var newElement = document.createElement(tagName);
  if (classList === undefined) return newElement;
  if (typeof(classList) === 'string') classList = new Array(classList);
  classList.forEach(function(oneClass, index, self) {
    newElement.classList.add(oneClass);
  });
  if (appendedChildren === undefined) return newElement;
  if (Object.prototype.toString.apply(appendedChildren) != '[object Array]'
    || typeof(appendedChildren) === 'string') appendedChildren = new Array(appendedChildren);
  appendedChildren.forEach(function(oneChild, index, self) {
    if (typeof(oneChild) === 'string') oneChild = document.createTextNode(oneChild);
    newElement.appendChild(oneChild);
  });
  return newElement;
}

/** 
 * formatting rules:
 * if the number has less than three digits, '0's are prefixed for the number's string to have three digits
 * else the number is stringified as normal
 * @param {number} linenum
 * @return {string} the formatted string of line number
 * independent
 */
function toLinenumString(linenum) {
  var digitNum = String(linenum).length;
  digitNum = (digitNum < 4) ? 3 : digitNum;
  return ('00' + linenum).slice(-digitNum);
}

/** 
 * get a pre decorated with the line numbers using the text provided
 * @param {string} text
 * @return {Node} the created pre
 * dependent of 
 *   {function} createElementWith
 *   {function} toLinenumString
 */
function getLinenumPreWithText(text) {
  var lineCnt = text.split('\n').length;
  var retPre = createElementWith('pre', ['plain-text-wrapper', 'line-numbers-wrapper'], text + (text.endsWith('\n') ? '\n' : ''));
  var linenumRows = createElementWith('span', 'line-numbers-rows');
  var oneRow = null;
  for (var linenum = 1; linenum != lineCnt + 1; ++linenum) {
    oneRow = createElementWith('div', 'line-numbers-one-row', toLinenumString(linenum));
    linenumRows.appendChild(oneRow);
  }
  retPre.appendChild(linenumRows);
  return retPre;
}

/** 
 * get a pre using the text provided
 * @param {string} text
 * @return {Node} the created pre
 * dependent of 
 *   {function} createElementWith
 */
function getPreWithText(text) {
  return createElementWith('pre', 'plain-text-wrapper', text + (text.endsWith('\n') ? '\n' : ''));
}

/** 
 * get a pre decorated with two columns of line numbers using the diffResult provided
 * @param {Object[]} diffResult - a resulted array of JsDiff.diffLines(oldString, newString)
 * @return {Node} the created pre
 * dependent of
 *   {function} createElementWith
 *   {function} toLinenumString
 */
function getDiffPre(diffResult) {
  var formatASCII = function(acsii) {
    return ('0' + acsii.toString(16)).slice(-2);
  };
  var generateBinary = function() {
    diffResult.forEach(function(oneDiff, index, self) {
      oneDiff['binary'] = oneDiff.value.split('\n').map(function(oneLine, index1, self1) {
        var binary = '';
        for (var i = 0; i < oneLine.length; ++i) binary += formatASCII(oneLine.charCodeAt(i)) + ((i == oneLine.length - 1) ? '' : ' ');
        return binary + (index1 == self1.length - 1 ? '' : ((oneLine.length) ? ' 0a' : '0a'));
      }).join('\n');
    });
  };
  generateBinary();

  var diffPre = createElementWith('pre', ['plain-text-wrapper', 'line-numbers-wrapper', 'diffPre'],
    createElementWith('span', 'diffPre-leading-newline', '\n'));
  var linenumRowsLeft = createElementWith('span', 'line-numbers-rows');
  var linenumRowsRight = createElementWith('span', ['line-numbers-rows', 'line-numbers-rows-right']);
  
  var oneDiffContentPre = null, oneDiffContentSpan = null, oneLeftRow = null, oneRightRow = null;
  var leftLinenumStr = null, rightLinenumStr = null, bgcolorClass = null;
  var stdLinenum = 1, yourLinenum = 1;

  var linenumRowConfig = {
    "stdLinenum": (function() { return toLinenumString(stdLinenum++); }),
    "yourLinenum": (function() { return toLinenumString(yourLinenum++); }),
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

  var diffResLen = diffResult.length;
  var lastDiffEndsWithNewLine = diffResult[diffResLen - 1].value.endsWith('\n');
  var appendNewLineForOneDiff = function(index) {
    diffResult[index].value += '\n', diffResult[index].binary += '\n', ++diffResult[index].count;
  };

    // modify diffResult in order to highlight the new lines at the end
    // by appending additional '\n' at the end of oneDiffs
  var modifyDiffResult = function() {
    if (diffResLen == 1) {
        if (lastDiffEndsWithNewLine) appendNewLineForOneDiff(diffResLen - 1);
    } else {
        var secondLastDiffEndsWithNewLine = diffResult[diffResLen - 2].value.endsWith('\n');
        if (diffResult[diffResLen - 2].added === undefined
          && diffResult[diffResLen - 2].removed === undefined) {
        // ... [common] [added] or ... [common] [removed]
          // in this case [common] must end with a '\n'
            diffResult[diffResLen] = {
              "count": 1,
              "value": '\n',
              "binary": '\n'
            };
                // the last [added] or [removed] does not end with a '\n'
            if (!lastDiffEndsWithNewLine) {  // to result: ... [common] [added] [removed (content: '\n' from [common])]
                                                     // or ... [common] [removed] [added (content: '\n' from [common])]
                diffResult[diffResLen]['added'] = diffResult[diffResLen - 1].removed;
                diffResult[diffResLen]['removed'] = diffResult[diffResLen - 1].added;
            }
              // else resulting: ... [common] [added] [common (content: '\n' from both)]
              //             or: ... [common] [removed] [common (content: '\n' from both)]
            ++diffResLen;
        } else if (lastDiffEndsWithNewLine
                && diffResult[diffResLen - 1].added === undefined
                && diffResult[diffResLen - 1].removed === undefined) {
              // ... [added] [common] or ... [removed] [common]
              // and [common] ends with a '\n'
            appendNewLineForOneDiff(diffResLen - 1);
            
            // ... [removed] [added]
              // both end with a '\n'
        } else if (secondLastDiffEndsWithNewLine && lastDiffEndsWithNewLine) {
            diffResult[diffResLen] = {  // to result: ... [removed] [added] [common (content: '\n' from both)]
              "count": 1,
              "value": '\n',
              'binary': '\n'
            };
            ++diffResLen;
        } else if (secondLastDiffEndsWithNewLine) {
              // [removed] with a '\n' => ... [removed + '\n'] [added]
            appendNewLineForOneDiff(diffResLen - 2);
        } else if (lastDiffEndsWithNewLine) {
              // [added] with a '\n' => ... [removed] [added + '\n']
            appendNewLineForOneDiff(diffResLen - 1);
        }
    }
  };
  modifyDiffResult();
  
  linenumRowsLeft.appendChild(createElementWith('div', 'line-numbers-one-row-std-heading', linenumRowConfig.stdHeading()));
  linenumRowsRight.appendChild(createElementWith('div', 'line-numbers-one-row-your-heading', linenumRowConfig.yourHeading()));

  diffResult.forEach(function(oneDiff, index, self) {
    oneDiffContentPre = createElementWith('pre', 'one-diff-wrapper');
    oneDiffContentSpan = createElementWith('span', 'one-diff-content');

    leftLinenumStr = null, rightLinenumStr = null, bgcolorClass = null;
      // assign values to leftLinenumStr, rightLinenumStr, bgcolorClass;
    var assignConfig = function() {
      for (typeName in diffTypeConfig) {
        if (oneDiff[typeName]) {  // for added or removed
          leftLinenumStr = diffTypeConfig[typeName].leftLinenumStr;
          rightLinenumStr = diffTypeConfig[typeName].rightLinenumStr;
          bgcolorClass = diffTypeConfig[typeName].bgcolorClass;
          break;
        }
      }
      if (leftLinenumStr === null) {  // for common
        leftLinenumStr = diffTypeConfig.common.leftLinenumStr;
        rightLinenumStr = diffTypeConfig.common.rightLinenumStr;
        bgcolorClass = diffTypeConfig.common.bgcolorClass;
      }
    };
    assignConfig();
    oneDiffContentSpan.classList.add(bgcolorClass), oneDiffContentPre.classList.add(bgcolorClass);

      // main work: pushing texts and linenums to diffPre
    var oneDiffConfig = {
      "textArray": [oneDiff.value.split('\n'), oneDiff.binary.split('\n')],
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
    for (var i = 0; i != (oneDiff.count || 1); ++i) {  // i: the i th line of oneDiff
      for (var j = 0; j != 2; ++j) {  // j = 0: text, j = 1: binary
        oneDiffContentSpan.appendChild(createElementWith('span', oneDiffConfig.textRowClass[j], oneDiffConfig.textArray[j][i]));
        oneLeftRow = createElementWith('div', oneDiffConfig.linenumRowClassList[j], oneDiffConfig.linenumRowContents[j][0]());
        oneRightRow = createElementWith('div', oneDiffConfig.linenumRowClassList[j], oneDiffConfig.linenumRowContents[j][1]());
        oneLeftRow.classList.add(bgcolorClass), oneRightRow.classList.add(bgcolorClass);
        linenumRowsLeft.appendChild(oneLeftRow), linenumRowsRight.appendChild(oneRightRow);
        oneDiffContentSpan.appendChild(createElementWith('span', oneDiffConfig.textRowNewLineClass[j], '\n'));
      }
    }
    oneDiffContentPre.appendChild(oneDiffContentSpan);
    diffPre.appendChild(oneDiffContentPre);
  });
  diffPre.appendChild(linenumRowsLeft), diffPre.appendChild(linenumRowsRight);
  return diffPre;
}

function getPolishedReport(reportObject, configs) {
  var showCR = (configs.showCR === undefined) ? false : Boolean(configs.showCR);
  var maxStdCaseNum = (configs.maxStdCaseNum === undefined) ? 5 : configs.maxStdCaseNum;
  var maxRanCaseNum = (configs.maxRanCaseNum === undefined) ? 2 : configs.maxRanCaseNum;
  var maxMemCaseNum = (configs.maxMemCaseNum === undefined) ? 2 : configs.maxMemCaseNum;

  var hideButtonTemplate = createElementWith('input', 'hide-button');
  hideButtonTemplate.type = 'button';
  hideButtonTemplate.buttonText = {
    "show": 'show',
    "hide": 'hide'
  };
  hideButtonTemplate.value = hideButtonTemplate.buttonText.hide;
  var seeBinaryCheckbox = createElementWith('input', 'see-binary-span-checkbox');
  seeBinaryCheckbox.type = 'checkbox';
  var seeBinaryCheckboxLabel = createElementWith('label', 'see-binary-span-checkbox-label', 'see binary');
  var seeBinaryCheckboxSpanTemplate = createElementWith('span', 'see-binary-span', [seeBinaryCheckbox, seeBinaryCheckboxLabel]);
  var toHideButton = function() {
    if (this.elementIsHiding) {
      this.elementToHide.classList.remove('hiding');
      this.elementIsHiding = false, this.value = this.buttonText.hide;
    } else {
      this.elementToHide.classList.add('hiding');
      this.elementIsHiding = true, this.value = this.buttonText.show;
    }
  };
  var createHideButton = function(elementToHide) {
    var hideButton = hideButtonTemplate.cloneNode(true);
    hideButton.elementIsHiding = false;
    hideButton.buttonText = JSON.parse(JSON.stringify(hideButtonTemplate.buttonText));
    hideButton.elementToHide = elementToHide;
    hideButton.addEventListener('click', toHideButton, false);
    return hideButton;
  };
  var createBinaryVisibilityStyle = function(diffId) {
    return createElementWith('style', 'binaryVisibilityStyle',
      '#' + diffId + ' .line-numbers-rows .line-numbers-one-row-binary {display: none;}' + '#' + diffId + ' .one-diff-content .one-diff-content-one-row-binary {display: none;}');
  }
  var toSeeBinary = function() {
    var parent = this.parentNode.parentNode, diffId = this.parentNode.nextSibling.id, binaryVisibilityStyle = parent.querySelector('.binaryVisibilityStyle');
    if (binaryVisibilityStyle) parent.removeChild(binaryVisibilityStyle);
    else parent.insertBefore(createBinaryVisibilityStyle(diffId), parent.childNodes[0]);
  };
  var createSeeBinarySpan = function(checkboxId) {
    var seeBinarySpan = seeBinaryCheckboxSpanTemplate.cloneNode(true);
    var seeBinaryCheckbox = seeBinarySpan.querySelector('input');
    seeBinarySpan.querySelector('label').htmlFor = seeBinaryCheckbox.id = 'seeBinaryCheckbox' + checkboxId;
    seeBinaryCheckbox.addEventListener('change', toSeeBinary, false);
    return seeBinarySpan;
  };

  var report = createElementWith('div', ['report-success', 'polished-report-success']);
  var submitTimeText = reportObject.submitTime ? '(submitted at ' + reportObject.submitTime + ')' : '';
  if (reportObject.msg !== null) {
    report.appendChild(createElementWith('pre', 'success', reportObject.msg + '    ' + submitTimeText));
    return report;
  } else {
    report.appendChild(createElementWith('pre', 'success', 'Your Grade: ' + reportObject.grade + '    ' + submitTimeText));
  }
  
  var resultCode2Result = {
    "CR": 'Correct',
    "WA": 'Wrong Answer',
    "IE": 'Internal Error',
    "TL": 'Time Limit Exceeded',
    "ML": 'Memory Limit Exceeded',
    "RE": 'Runtime Error'
  };
  var crCaseIndex = 1;
  var diffIndex = 1;

  var compileCheckDetail = function(phaseInfo) {
    var detail = getPreWithText(phaseInfo.report);
    detail.classList.add('error-content');
    return detail;
  };
  var staticCheckDetail = function(phaseInfo) {
    var violations = phaseInfo.report;
    var detail = document.createDocumentFragment();
    for (var i in violations) {
      var oneViolation = getPreWithText(violations[i]);
      oneViolation.classList.add('violations');
      detail.appendChild(oneViolation);
    }
    return detail;
  }
  var testsDetail = function(phaseInfo, std) {
    var cases = phaseInfo.report;
    var detail = document.createDocumentFragment();
    var index = 1;
    var maxCaseNum = std ? maxStdCaseNum : maxRanCaseNum;
    var getSummary = function(caseInfo) {
      var summary = createElementWith('div', 'tests-check-summary');
      summary.appendChild(createElementWith('pre', 'index', 'Test [' + index + ']'));
      summary.appendChild(createElementWith('pre', 'memoryused', 'Memory Used: ' + caseInfo.memoryused + 'KB'));
      summary.appendChild(createElementWith('pre', 'timeused', 'Time Used: ' + caseInfo.timeused + 'ms'));
      summary.appendChild(createElementWith('pre', 'result-code', 'Result: ' + resultCode2Result[caseInfo.resultCode]));
      return summary;
    };
    var breakFromInner = false;
    for (var cr = 0; cr < showCR * 1 + 1; ++cr) {
      for (var i in cases) {
        if ((cases[i].resultCode == 'CR') ^ cr) continue;
        var caseOuterWrapper = createElementWith('div', 'case-outer-wrapper');
        if (cr) caseOuterWrapper.id = 'cr-case' + crCaseIndex++;
        var caseInnerWrapper = createElementWith('div', 'case-inner-wrapper');
        caseInnerWrapper.appendChild(getSummary(cases[i]));
        var inoutTests = null;
        if (cr) {
          inoutTests = [
            {
              "label": 'Standard Input',
              "content": (function(caseIndex) { return getLinenumPreWithText(cases[caseIndex]['input']); })
            },
            {
              "label": 'Standard Answer Output',
              "content": (function(caseIndex) { return getLinenumPreWithText(cases[caseIndex]['yourOutput']); })
            }
          ];
        } else {
          inoutTests = [
            {
              "label": 'Standard Input',
              "content": (function(caseIndex) { return getLinenumPreWithText(cases[caseIndex]['input']); })
            },
            {
              "label": 'Standard Answer Output',
              "content": (function(caseIndex) { return getLinenumPreWithText(cases[caseIndex]['stdOutput']); })
            },
            {
              "label": 'Your Output',
              "content": (function(caseIndex) { return getLinenumPreWithText(cases[caseIndex]['yourOutput']); })
            }
          ];
        }
        for (var j in inoutTests) {
          caseInnerWrapper.appendChild(createElementWith('pre', 'label', inoutTests[j].label));
          var content = inoutTests[j].content(i);
          caseInnerWrapper.appendChild(createHideButton(content));
          caseInnerWrapper.appendChild(createElementWith('pre', 'error-content', content));
        }
        if (!cr && cases[i].diff) {
           caseInnerWrapper.appendChild(createElementWith('pre', 'label', 'Difference'));
           var diffPre = getDiffPre(cases[i]['diff']);
           caseInnerWrapper.appendChild(createBinaryVisibilityStyle('diffId' + diffIndex));
           caseInnerWrapper.appendChild(createHideButton(diffPre));
           caseInnerWrapper.appendChild(createSeeBinarySpan(diffIndex));
           var errorContent = createElementWith('pre', 'error-content', diffPre);
           errorContent.id = 'diffId' + diffIndex;
           ++diffIndex;
           caseInnerWrapper.appendChild(errorContent);
        }
        caseOuterWrapper.appendChild(caseInnerWrapper), detail.appendChild(caseOuterWrapper);
        if (index == maxCaseNum) {
          breakFromInner = true;
          break;
        }
        ++index;
      }
      if (breakFromInner && index == maxCaseNum) break;
    }
    return detail;
  }
  var memoryCheckDetail = function(phaseInfo) {
    var cases = phaseInfo.report;
    var detail = document.createDocumentFragment();
    var index = 1;
    var maxCaseNum = maxMemCaseNum;
    var getSummary = function(caseInfo) {
      var summary = createElementWith('div', 'tests-check-summary');
      summary.appendChild(createElementWith('pre', 'index', 'Test [' + index + ']'));
      if (caseInfo.error) {
        summary.appendChild(createElementWith('pre', 'not-executing-check', 'Error:' + caseInfo.error));
      }
      return summary;
    };
    var breakFromInner = false;
    for (var cr = 0; cr < showCR * 1 + 1; ++cr) {
      for (var i in cases) {
        if ((cases[i]['memory errors'].length == 0 && cases[i].error === null) ^ cr) continue;
        var caseOuterWrapper = createElementWith('div', 'case-outer-wrapper');
        if (cr) caseOuterWrapper.id = 'cr-case' + index;
        var caseInnerWrapper = createElementWith('div', 'case-inner-wrapper');
        caseInnerWrapper.appendChild(getSummary(cases[i]));
        if (cases[i].error) continue;
        var inoutTests = null;
        if (cr) {
          inoutTests = [
            {
              "label": 'Standard Input',
              "content": (function(caseIndex) { return getLinenumPreWithText(cases[caseIndex]['input']); })
            }
          ];
        } else {
          inoutTests = [
            {
              "label": 'Standard Input',
              "content": (function(caseIndex) { return getLinenumPreWithText(cases[caseIndex]['input']); })
            },
            {
              "label": 'Memory Errors',
              "content": (function(caseIndex) {
                var errors = cases[caseIndex]['memory errors'];
                var ret = createElementWith('div');
                for (var errorIndex in errors) {
                  var errorDiv = createElementWith('div', 'one-error', createElementWith('pre', 'index', 'Error [' + (parseInt(errorIndex) + 1) + ']'));
                  errorDiv.appendChild(getPreWithText(errors[errorIndex]));
                  ret.appendChild(errorDiv);
                }
                return ret;
              })
            }
          ];
        }
        for (var j in inoutTests) {
          caseInnerWrapper.appendChild(createElementWith('pre', 'label', inoutTests[j].label));
          var content = inoutTests[j].content(i);
          caseInnerWrapper.appendChild(createHideButton(content));
          if (j) content.classList.add('error-content');
          caseInnerWrapper.appendChild(content);
        }
        caseOuterWrapper.appendChild(caseInnerWrapper), detail.appendChild(caseOuterWrapper);
        if (index == maxCaseNum) {
          breakFromInner = true;
          break;
        }
        ++index;
      }
      if (breakFromInner && index == maxCaseNum) break;
    }
    return detail;
  }
  var standardTestsDetail = function(phaseInfo) { return testsDetail(phaseInfo, true); };
  var randomTestsDetail = function(phaseInfo) { return testsDetail(phaseInfo, false); };
  var phases = [{
                  "id": 'compile check',
                  "getDetail": compileCheckDetail,
                  "canShowCR": false
                },
                {
                  "id": 'static check',
                  "getDetail": staticCheckDetail,
                  "canShowCR": false
                },
                {
                  "id": 'standard tests',
                  "getDetail": standardTestsDetail,
                  "canShowCR": true
                },
                {
                  "id": 'random tests',
                  "getDetail": randomTestsDetail,
                  "canShowCR": true
                },
                {
                  "id": 'memory check',
                  "getDetail": memoryCheckDetail,
                  "canShowCR": true
                }];

  for (var i in phases) {
    if (reportObject[phases[i].id] === null) continue;
    var reportSection = createElementWith('div', [phases[i].id.replace(/ /g, '-'), 'report-section'], createElementWith('div', 'score-to-be-replaced'));
    var testContent = createElementWith('div', 'test-content');
    var detail = null;
    if (reportObject[phases[i].id].error) detail = createElementWith('div', 'not-executing-check', reportObject[phases[i].id].error);
    else if (reportObject[phases[i].id].pass) {
      detail = createElementWith('pre', 'full-score', "Good Job! You've got full scores in this section.");
      if (showCR && phases[i].canShowCR) detail.appendChild(phases[i].getDetail(reportObject[phases[i].id]));
    } else detail = phases[i].getDetail(reportObject[phases[i].id]);
    var reportDetail = createElementWith('div', 'report-detail', detail);
    testContent.appendChild(reportDetail), reportSection.appendChild(testContent), report.appendChild(reportSection);
  }
  return report;
}

chrome.runtime.onMessage.addListener(function(body, sender, callback) {
  if (body.signal == 'start') {
    var toWait = (body.wait === undefined) ? true : body.wait;
    var gradeTab = document.querySelector('.submit + .grade');
    var old = gradeTab.querySelector('.polished-report-success');
    if (old) gradeTab.removeChild(old);
    old = gradeTab.querySelector('.switch-button');
    if (old) gradeTab.removeChild(old);
    setTimeout(function() {
      var reportObject = body.reportObject;
      var oldReport = gradeTab.querySelector('.report-success');
      var newReport = getPolishedReport(reportObject, {
        "showCR": body.configs.showCR,
        "maxStdCaseNum": body.configs.maxStdCaseNum,
        "maxRanCaseNum": body.configs.maxRanCaseNum,
        "maxMemCaseNum": body.configs.maxMemCaseNum
      });

      var phases = [{'id': 'compile check'},
                    {'id': 'static check'},
                    {'id': 'standard tests'},
                    {'id': 'random tests'},
                    {'id': 'memory check'}];
      for (var i in phases) {
        if (reportObject[phases[i].id] === null) continue;
        var replacer = oldReport.querySelector('.' + phases[i].id.replace(/ /g, '-').replace(/-tests/, '-tests-check') + ' .score').cloneNode(true);
        var parent = newReport.querySelector('.' + phases[i].id.replace(/ /g, '-'));
        parent.replaceChild(replacer, parent.querySelector(' .score-to-be-replaced'));
      }

      var switchBtn = createElementWith('input', 'switch-button');
      switchBtn.type = 'button';
      switchBtn.buttonText = {
        "show": 'show polished report',
        "hide": 'show original report'
      };
      switchBtn.value = switchBtn.buttonText.hide;
      switchBtn.elementIsHiding = false;
      switchBtn.elementToHideByDefault = oldReport;
      switchBtn.elementToShowByDefault = newReport;
      switchBtn.addEventListener('click', function() {
        if (this.elementIsHiding) {
          this.elementToShowByDefault.classList.remove('hiding');
          this.elementToHideByDefault.classList.add('hiding');
          this.elementIsHiding = false, this.value = this.buttonText.hide;
        } else {
          this.elementToShowByDefault.classList.add('hiding');
          this.elementToHideByDefault.classList.remove('hiding');
          this.elementIsHiding = true, this.value = this.buttonText.show;
        }
      }, false);
      gradeTab.insertBefore(switchBtn, oldReport);
      oldReport.classList.add('hiding');

      gradeTab.appendChild(newReport);
      if (!body.configs.autoPolish) switchBtn.click();
    }, 500 * toWait + 1);
  }
  return callback('front has got the reportObject and attached it to the grade tab!');
});
