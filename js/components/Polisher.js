var customElements = require('./CustomElements.js');
var createElementWith = customElements.createElementWith;
var createLinenumPreWithText = customElements.createLinenumPreWithText;
var createPreWithText = customElements.createPreWithText;
var createDiffPre = customElements.createDiffPre;
var createHideElementBtn = customElements.createHideElementBtn;
var createViewInHexSpan = customElements.createViewInHexSpan;
var createHexHidingStyle = customElements.createHexHidingStyle;
var $ = require('./jquery.js');
var SideNav = require('./SideNav.js');

var polisher = {

  "getPolishedReportDiv": function(reportObject, configs) {
    var showCR = (configs.showCR === undefined) ? false : Boolean(configs.showCR);
    var maxStdCaseNum = (configs.maxStdCaseNum === undefined) ? 5 : configs.maxStdCaseNum;
    var maxRanCaseNum = (configs.maxRanCaseNum === undefined) ? 2 : configs.maxRanCaseNum;
    var maxMemCaseNum = (configs.maxMemCaseNum === undefined) ? 2 : configs.maxMemCaseNum;
    var memoryLimit = (configs.limits.memory === undefined) ? null : configs.limits.memory + 'MB';
    var timeLimit = (configs.limits.time === undefined) ? null : configs.limits.time + 'ms';
    var totalPoints = configs.totalPoints;


    var report = createElementWith('div', ['report-success', 'polished-report-success']);
    var submitTimeText = reportObject.submitTime ? '(submitted at ' + reportObject.submitTime + ')' : '';
    if (reportObject.msg !== null) {
      report.appendChild(createElementWith('pre', 'success', reportObject.msg + '  ' + submitTimeText));
      return report;
    } else {
      report.appendChild(createElementWith('pre', 'success', 'Your Grade: ' + reportObject.grade + '  ' + submitTimeText));
    }
    var sideNav = new SideNav();
    var diffIndex = 1;
    var resultCodeToResult = {
      "CR": 'Correct',
      "WA": 'Wrong Answer',
      "IE": 'Internal Error',
      "TL": 'Time Limit Exceeded',
      "ML": 'Memory Limit Exceeded',
      "OL": 'Output Limit Exceeded',
      "RE": 'Runtime Error'
    };
    

    function compileCheckDetail(phaseInfo) {
      var detail = createPreWithText(phaseInfo.report);
      detail.classList.add('error-content');
      return detail;
    }
    function staticCheckDetail(phaseInfo) {
      var violations = phaseInfo.report;
      var detail = document.createDocumentFragment();
      for (var i in violations) {
        var oneViolation = createPreWithText(violations[i]);
        oneViolation.classList.add('violations');
        detail.appendChild(oneViolation);
      }
      return detail;
    }
    function testsDetail(phaseInfo, std) {
      var cases = phaseInfo.report;
      var detail = document.createDocumentFragment();
      var index = 1;
      var maxCaseNum = std ? maxStdCaseNum : maxRanCaseNum;
      if (phaseInfo.failedCaseNum) detail.appendChild(createElementWith('div', 'failed-cases-summary', phaseInfo.failedCaseNum + ' of the total of ' + cases.length + ' tests failed to pass.'));
      var getSummary = function(caseInfo) {
        var summary = createElementWith('div', 'tests-check-summary');
        summary.appendChild(createElementWith('pre', 'index', 'Test [' + index + ']'));
        if (caseInfo.error) {
          summary.appendChild(createElementWith('br'));
          summary.appendChild(createElementWith('pre', 'not-executing-check', 'Error: ' + caseInfo.error));
        } else {
          summary.appendChild(createElementWith('pre', 'result-code', 'Result: ' + resultCodeToResult[caseInfo.resultCode]));
          summary.appendChild(createElementWith('br'));
          summary.appendChild(createElementWith('pre', 'limit-use', 'Memory Used: ' + caseInfo.memoryused + 'KB / ' + memoryLimit + '\n\nTime Used: ' + caseInfo.timeused + 'ms / ' + timeLimit));
        }
        return summary;
      };
      var breakFromInner = false;
      for (var cr = 0; cr < showCR * 1 + 1; ++cr) {
        for (var i in cases) {
          if ((cases[i].resultCode == 'CR') ^ cr) continue;
          var caseOuterWrapper = createElementWith('div', 'case-outer-wrapper');
          var caseInnerWrapper = createElementWith('div', 'case-inner-wrapper');
          caseInnerWrapper.appendChild(getSummary(cases[i]));
          caseInnerWrapper.id = 'report-test-' + diffIndex;
          sideNav.add('Test [' + index + ']', caseInnerWrapper.id, 3);
          var inoutTests = [{
                "label": 'Standard Input',
                "id": 'input',
                "content": (function(caseIndex) { return createLinenumPreWithText(cases[caseIndex]['input']); })
              }
            ];
          if (cr) {
            inoutTests.push({
                "label": 'Standard Answer Output',
                "id": 'yourOutput',
                "content": (function(caseIndex) { return createLinenumPreWithText(cases[caseIndex]['yourOutput']); })
              }
            );
          } else {
            inoutTests.push({
                "label": 'Standard Answer Output',
                "id": 'stdOutput',
                "content": (function(caseIndex) { return createLinenumPreWithText(cases[caseIndex]['stdOutput']); })
              }, {
                "label": 'Your Output',
                "id": 'yourOutput',
                "content": (function(caseIndex) { return createLinenumPreWithText(cases[caseIndex]['yourOutput']); })
              }
            );
          }
          if (cases[i].error) {
              caseInnerWrapper.appendChild(createElementWith('pre', 'label', 'Standard Input'));
              var content = createLinenumPreWithText(cases[i].input);
              caseInnerWrapper.appendChild(createHideElementBtn(content));
              caseInnerWrapper.appendChild(createElementWith('pre', 'error-content', content));
          } else {
            inoutTests.forEach(function(one, index1, self) {
              caseInnerWrapper.appendChild(createElementWith('pre', 'label', one.label));
              var content = createLinenumPreWithText(cases[i][one.id]);
              caseInnerWrapper.appendChild(createHideElementBtn(content));
              content.id = caseInnerWrapper.id + '-' + one.label.replace(/ /g, '-');
              sideNav.add(one.label, content.id, 5);
              caseInnerWrapper.appendChild(createElementWith('pre', 'error-content', content));
            });
          }
          if (!cr && cases[i].diff) {
             caseInnerWrapper.appendChild(createElementWith('pre', 'label', 'Difference'));
             var diffPre = createDiffPre(cases[i].diff);
             caseInnerWrapper.appendChild(createHexHidingStyle('diffId' + diffIndex));
             caseInnerWrapper.appendChild(createHideElementBtn(diffPre));
             caseInnerWrapper.appendChild(createViewInHexSpan(diffIndex));
             var errorContent = createElementWith('pre', 'error-content', diffPre);
             errorContent.id = 'diffId' + diffIndex;
             sideNav.add('Difference', errorContent.id, 5);
             
             caseInnerWrapper.appendChild(errorContent);
          }
          caseOuterWrapper.appendChild(caseInnerWrapper), detail.appendChild(caseOuterWrapper);
          ++diffIndex;
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
    function memoryCheckDetail(phaseInfo) {
      var cases = phaseInfo.report;
      var detail = document.createDocumentFragment();
      var index = 1;
      var maxCaseNum = maxMemCaseNum;
      var getSummary = function(caseInfo) {
        var summary = createElementWith('div', 'tests-check-summary');
        summary.appendChild(createElementWith('pre', 'index', 'Test [' + index + ']'));
        if (caseInfo.error) {
          summary.appendChild(createElementWith('br'));
          summary.appendChild(createElementWith('pre', 'not-executing-check', 'Error:' + caseInfo.error));
        }
        return summary;
      };
      var breakFromInner = false;
      for (var cr = 0; cr < showCR * 1 + 1; ++cr) {
        for (var i in cases) {
          if ((cases[i]['memory errors'].length == 0 && cases[i].error === null) ^ cr) continue;
          var caseOuterWrapper = createElementWith('div', 'case-outer-wrapper');
          var caseInnerWrapper = createElementWith('div', 'case-inner-wrapper');
          caseInnerWrapper.appendChild(getSummary(cases[i]));
          caseInnerWrapper.id = 'report-test-' + diffIndex;
          sideNav.add('Test [' + index + ']', caseInnerWrapper.id, 3);
          var inoutTests = [{
                "label": 'Standard Input',
                "id": 'input',
                "content": (function(caseIndex) { return createLinenumPreWithText(cases[caseIndex]['input']); })
              }
            ];
          if (!cr) {
            inoutTests.push({
                "label": 'Memory Errors',
                "content": (function(caseIndex) {
                  var errors = cases[caseIndex]['memory errors'];
                  var ret = createElementWith('div');
                  for (var errorIndex in errors) {
                    var errorDiv = createElementWith('div', 'one-error', createElementWith('pre', 'index', 'Error [' + (parseInt(errorIndex) + 1) + ']'));
                    errorDiv.appendChild(createPreWithText(errors[errorIndex]));
                    ret.appendChild(errorDiv);
                  }
                  return ret;
                })
              }
            );
          }
          if (cases[i].error) {
            caseInnerWrapper.appendChild(createElementWith('pre', 'label', 'Standard Input'));
            var content = createLinenumPreWithText(cases[i].input);
            caseInnerWrapper.appendChild(createHideElementBtn(content));
            caseInnerWrapper.appendChild(createElementWith('pre', 'error-content', content));
          } else {
            inoutTests.forEach(function(one, index1, self) {
              caseInnerWrapper.appendChild(createElementWith('pre', 'label', one.label));
              var content = (one.label == 'Memory Errors' ? one.content(i) : createLinenumPreWithText(cases[i][one.id]));
              caseInnerWrapper.appendChild(createHideElementBtn(content));
              if (index1) content.classList.add('error-content');
              content.id = caseInnerWrapper.id + '-memory-check-report' + diffIndex++;
              sideNav.add(one.label, content.id, 5);
              caseInnerWrapper.appendChild(content);
            });
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
    function standardTestsDetail(phaseInfo) {
      return testsDetail(phaseInfo, true);
    }
    function randomTestsDetail(phaseInfo) {
      return testsDetail(phaseInfo, false);
    }
    function getScoreDiv(phaseId, phase, score, total, pass, url) {
      var nodesToBeAppended = [phase + " : You've got " + score + ' of the total of ' + total + ' points'];
      if (typeof(url) == 'string' && !pass) {
        var link = createElementWith('a', 'link', 'Why did it go wrong?');
        link.href = url, link.target = '_blank';
        nodesToBeAppended.push(link);
      }
      return createElementWith('div', [phaseId.replace(/ /g, '-').replace(/-tests/, '-tests-check') + '-score', 'score'], nodesToBeAppended);
    }
    var phases = [{
                    "id": 'compile check',
                    "getDetail": compileCheckDetail,
                    "description": 'Compile Check',
                    "canShowCR": false
                  },
                  {
                    "id": 'static check',
                    "getDetail": staticCheckDetail,
                    "description": 'Static Check',
                    "url": 'http://docs.oclint.org/en/stable/rules/index.html',
                    "canShowCR": false
                  },
                  {
                    "id": 'standard tests',
                    "getDetail": standardTestsDetail,
                    "description": 'Standard Tests',
                    "canShowCR": true
                  },
                  {
                    "id": 'random tests',
                    "getDetail": randomTestsDetail,
                    "description": 'Random Tests',
                    "canShowCR": true
                  },
                  {
                    "id": 'memory check',
                    "getDetail": memoryCheckDetail,
                    "description": 'Memory Check',
                    "url": 'http://valgrind.org/docs/manual/mc-manual.html',
                    "canShowCR": true
                  }];

    phases.forEach(function(onePhase, index, self) {
      if (reportObject[onePhase.id] === null) return;
      var reportSection = createElementWith('div', [onePhase.id.replace(/ /g, '-'), 'report-section'],
        getScoreDiv(onePhase.id, onePhase.description, reportObject[onePhase.id].grade, totalPoints[onePhase.id], reportObject[onePhase.id].pass, onePhase.url));
      reportSection.id = 'report-' + onePhase.id.replace(/ /g, '-');
      sideNav.add(onePhase.description, reportSection.id, 1);
      var testContent = createElementWith('div', 'test-content');
      var detail = null;
      if (reportObject[onePhase.id].error) detail = createElementWith('div', 'not-executing-check', reportObject[onePhase.id].error);
      else if (reportObject[onePhase.id].pass) {
        detail = createElementWith('pre', 'full-score', "Good Job! You've got full scores in this section.");
        if (showCR && onePhase.canShowCR) detail.appendChild(onePhase.getDetail(reportObject[onePhase.id]));
      } else detail = onePhase.getDetail(reportObject[onePhase.id]);
      var reportDetail = createElementWith('div', 'report-detail', detail);
      testContent.appendChild(reportDetail), reportSection.appendChild(testContent), report.appendChild(reportSection);
    });
    report['endSelector'] = '#' + report.lastElementChild.id;
    report.appendChild(sideNav.getNode());
    report.sideNav = sideNav;
    return report;
  },

  /** 
   * get the main submission output div
   * @param {ReportObject} reportObject - a submission report Object
   * @return {Node} the the main submission output div
   * dependent of
   *   {function} createElementWith
   *   {function} toLinenumString
   *   {function} createDiffPre
   */
  "genOutputDiv": function(reportObject) {
    var outputDiv = createElementWith('div', 'submission-output');
    var phaseDiv = null;
    if (reportObject.grade === null) {
      outputDiv.appendChild(document.createTextNode('No submission yet'));
      return outputDiv;
    }
    var sideNav = new SideNav();
    var seeBinaryCheckboxCnt = 1;
    
    var inoutputConfig = [{
        "title": 'Test Input',
        "id": 'input'
      }, {
        "title": 'Standard Answer Output',
        "id": 'stdOutput'
      }, {
        "title": 'Your Output',
        "id": 'yourOutput'
      }
    ];
    var forDefault = function(phaseDiv, phaseData) {
      var leadingText = phaseData.raw[0] + '\n';
      if (~leadingText.indexOf('=======')) leadingText = '';
      var phaseContent = createElementWith('pre', ['phase-content', 'phase-content-for-default'], leadingText);
      phaseData.raw[0] = '';
      var text = phaseData.raw.join('\n');
      if (text.match(/[\S]/)) phaseContent.appendChild(createPreWithText(text));
      phaseDiv.appendChild(phaseContent);
    };
    var forTest = function(phaseDiv, phaseData) {
      var phaseContent = createElementWith('pre', ['phase-content', 'phase-content-for-test'], phaseData.raw[0] + '\n');
      phaseData.cases.forEach(function(oneCase, index, self) {
        var testName = 'Test ' + (parseInt(index) + parseInt(1));
        var caseDiv = createElementWith('div', 'one-case', testName
          + ((oneCase.resultCode) ? ' Result Code: ' + oneCase.resultCode : ''));
        caseDiv.id = 'report-test-' + seeBinaryCheckboxCnt;
        sideNav.add(testName, caseDiv.id, 3);
        
        var inoutputDiv = null;
        var times = (oneCase.resultCode != "WA") ? 1 : 3;
        for (var i = 0; i != times; ++i) {  // i = 0: test input
                                            // i = 1: standard answer output
                                            // i = 2: your output
          var linenumPre = createLinenumPreWithText(oneCase[inoutputConfig[i].id]);
          inoutputDiv = createElementWith('div', 'one-case-input-output-wrapper',
            [inoutputConfig[i].title, createHideElementBtn(linenumPre), linenumPre]);
          inoutputDiv.id = caseDiv.id + '-' + inoutputConfig[i].title.replace(/ /g, '-');
          sideNav.add(inoutputConfig[i].title, inoutputDiv.id, 5);
          caseDiv.appendChild(inoutputDiv);
        }
          // get difference pre
        if (oneCase.resultCode == "WA") {
          var diffPre = createDiffPre(oneCase.diff);
          diffPre.classList.add('one-case-difference-content');
          inoutputDiv = createElementWith('div', 'one-case-diffence-wrapper',
            [ createHexHidingStyle('diffId' + seeBinaryCheckboxCnt),
              'Difference',
              createHideElementBtn(diffPre),
              createViewInHexSpan(seeBinaryCheckboxCnt),
              diffPre
            ]);
          inoutputDiv.id = 'diffId' + seeBinaryCheckboxCnt++;
          sideNav.add('Difference', inoutputDiv.id, 5);
          caseDiv.appendChild(inoutputDiv);

                   // get memory check report
        } else if (oneCase.report !== undefined) {
          var reportPre = createPreWithText(oneCase.report);
          inoutputDiv = createElementWith('div', 'memory-test-report-wrapper',
            ['Report', createHideElementBtn(reportPre), reportPre]);
          inoutputDiv.id = caseDiv.id + '-memory-check-report' + seeBinaryCheckboxCnt++;
          sideNav.add('Report', inoutputDiv.id, 5);
          caseDiv.appendChild(inoutputDiv);
        } else {
          ++seeBinaryCheckboxCnt;
        }
        return phaseContent.appendChild(caseDiv);
      });
      phaseDiv.appendChild(phaseContent);
    }

    var phases = [
      {
        "id": 'plagiarism',
        "name": "Check Plagiarism",
        "func": forDefault
      }, {
        "id": 'compile',
        "name": "Compilation",
        "func": forDefault
      }, {
        "id": 'style',
        "name": "Check Style",
        "func": forDefault
      }, {
        "id": 'standard',
        "name": "Standard Test",
        "func": forTest
      }, {
        "id": 'random',
        "name": "Random Test",
        "func": forTest
      }, {
        "id": 'memory',
        "name": "Memory Test",
        "func": forTest
      }, {
        "id": 'note',
        "name": "Notifications",
        "func": forDefault
      }
    ];
    outputDiv.appendChild(createElementWith('div', 'grade', 'Grade: ' + reportObject.grade));
    phases.forEach(function(onePhase, index, self) {
      if (reportObject[onePhase.id] !== null) {
        phaseDiv = createElementWith('div', 'one-phase', onePhase.name);
        phaseDiv.id = 'report-' + onePhase.name.replace(/ /g, '-');
        sideNav.add(onePhase.name, phaseDiv.id, 1);
        onePhase.func(phaseDiv, reportObject[onePhase.id]);
        outputDiv.appendChild(phaseDiv);
      }
    });
    outputDiv['endSelector'] = '#' + outputDiv.lastElementChild.id;
    outputDiv.appendChild(sideNav.getNode());
    outputDiv.sideNav = sideNav;
    return outputDiv;
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
    exports['polisher'] = factory();
  else
    root['polisher'] = factory();
})(this, function factory() {
  return polisher;
});

