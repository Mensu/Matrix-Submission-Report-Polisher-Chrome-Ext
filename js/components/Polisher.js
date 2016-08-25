var customElements = require('./elements/customElements.js');
var createElementWith = customElements.createElementWith;
var createLinenumPreWithText = customElements.createLinenumPreWithText;
var createPreWithText = customElements.createPreWithText;
var createDiffPre = customElements.createDiffPre;
var createHideElementBtn = customElements.createHideElementBtn;
var createViewInHexSpan = customElements.createViewInHexSpan;
var SideNav = require('./elements/SideNav.js');

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
    var sectionsWrapper = createElementWith('div');
    sectionsWrapper.id = 'matrix-programming-report';
    report.appendChild(createElementWith('matrix-report', 'polished-ver', sectionsWrapper));
    var sideNav = new SideNav();
    var sectionId = 1;
    var resultText = {
      "CR": 'Correct',
      "WA": 'Wrong Answer',
      "IE": 'Internal Error',
      "TL": 'Time Limit Exceeded',
      "ML": 'Memory Limit Exceeded',
      "OL": 'Output Limit Exceeded',
      "RE": 'Runtime Error'
    };
    

    function compileCheckDetail(phaseInfo) {
      // var detail = createPreWithText(phaseInfo.report);
      // detail.classList.add('error-content');
      // return detail;

      var fragment = document.createDocumentFragment();
      if (!phaseInfo.pass) fragment.appendChild(createElementWith('pre', ['error-content', 'red-color'], 'Compilation failed'));
      var detail = createPreWithText(phaseInfo.report);
      detail.classList.add('error-content');
      fragment.appendChild(detail);
      return fragment;
    }
    function staticCheckDetail(phaseInfo) {
      var violations = phaseInfo.report;
      var fragment = document.createDocumentFragment();
      // var detail
      for (var i in violations) {
        var oneViolation = createPreWithText(violations[i]);
        oneViolation.classList.add('violations');
/* use detail */      fragment.appendChild(oneViolation);
      }
      return fragment;
    }
    function testsDetail(phaseInfo, std) {
      var cases = phaseInfo.report;
      var fragment = document.createDocumentFragment();
      // var detail
      var index = 1;
      var maxCaseNum = std ? maxStdCaseNum : maxRanCaseNum;
      if (phaseInfo.failedCaseNum) {
/* use detail */        fragment.appendChild(createElementWith('div', 'failed-cases-summary', phaseInfo.failedCaseNum + ' of the total of ' + cases.length + ' tests failed to pass.'));
      }
      var getSummary = function(caseInfo) {
        var summary = createElementWith('div', 'tests-check-summary');
        summary.appendChild(createElementWith('pre', 'index', 'Test [' + index + ']'));
        if (caseInfo.error) {
          summary.appendChild(createElementWith('br'));
          summary.appendChild(createElementWith('pre', 'not-executing-check', 'Error: ' + caseInfo.error));
        } else {
          summary.appendChild(createElementWith('pre', 'result-code', 'Result: ' + resultText[caseInfo.resultCode]));
          summary.appendChild(createElementWith('br'));
          summary.appendChild(createElementWith('pre', 'limit-use', [
              createElementWith('span', 'limit-text', '\nMemory Used: '),
              createElementWith('span', (caseInfo.resultCode == 'ML' ? ['limit-text', 'non-pass'] : 'limit-text'), caseInfo.memoryused + 'KB'),
              createElementWith('span', 'limit-text', ' / ' + memoryLimit),
              createElementWith('span', 'limit-text', '\nTime Used: '),
              createElementWith('span', (caseInfo.resultCode == 'TL' ? ['limit-text', 'non-pass'] : 'limit-text'), caseInfo.timeused + 'ms'),
              createElementWith('span', 'limit-text', ' / ' + timeLimit)
            ]));
        }
        return summary;
      };
      var breakFromInner = false;
      for (var cr = 0; cr < showCR * 1 + 1; ++cr) {
        for (var caseIndex = 0, oneCase = cases[caseIndex]; caseIndex < cases.length; ++caseIndex, oneCase = cases[caseIndex]) {
          if ((oneCase.resultCode == 'CR') ^ cr) continue;
          var caseOuterWrapper = createElementWith('div', 'case-outer-wrapper');
          var caseInnerWrapper = createElementWith('div', 'case-inner-wrapper');
          caseInnerWrapper.appendChild(getSummary(oneCase));
          caseInnerWrapper.id = 'report-std-random-test-' + sectionId;
          sideNav.add('Test ' + index + ' (' + resultText[oneCase.resultCode] + ')', caseInnerWrapper.id, 3);
          var inoutTests = [{
                "label": 'Standard Input',
                "id": 'input'
              }
            ];
          if (cr) {
            inoutTests.push({
                "label": 'Standard Answer Output',
                "id": 'yourOutput'
              }
            );
          } else {
            inoutTests.push({
                "label": 'Standard Answer Output',
                "id": 'stdOutput'
              }, {
                "label": 'Your Output',
                "id": 'yourOutput'
              }
            );
          }
          if (oneCase.error) {
              caseInnerWrapper.appendChild(createElementWith('pre', 'label', 'Standard Input'));
              var content = createLinenumPreWithText(oneCase.input);
              caseInnerWrapper.appendChild(createElementWith('pre', 'error-content', content));
          } else {
            inoutTests.forEach(function(oneSection) {
              var title = createElementWith('pre', 'label', oneSection.label);
              caseInnerWrapper.appendChild(title);
              title.id = caseInnerWrapper.id + '-' + oneSection.label.replace(/ /g, '-').toLowerCase();
              sideNav.add(oneSection.label, title.id, 5);

              var content = createLinenumPreWithText(oneCase[oneSection.id]);
              caseInnerWrapper.appendChild(createHideElementBtn(content));
              caseInnerWrapper.appendChild(createElementWith('pre', 'error-content', content));
            });
          }
          if (!cr && oneCase.diff) {
            var title = createElementWith('pre', 'label', 'Difference');
            caseInnerWrapper.appendChild(title);
            title.id = caseInnerWrapper.id + '-diff';
            sideNav.add('Difference', title.id, 5);

            var diffPre = createDiffPre(oneCase.diff);
            caseInnerWrapper.appendChild(createHideElementBtn(diffPre));
            caseInnerWrapper.appendChild(createViewInHexSpan(sectionId));
            caseInnerWrapper.classList.add('hideHex');
            var errorContent = createElementWith('pre', 'error-content', diffPre); 
            caseInnerWrapper.appendChild(errorContent);
          }
          caseOuterWrapper.appendChild(caseInnerWrapper), detail.appendChild(caseOuterWrapper);
          ++sectionId;
          if (index == maxCaseNum) {
            breakFromInner = true;
            break;
          }
          ++index;

        }
        if (breakFromInner && index == maxCaseNum) break;
      }
      return fragment;
    }
    function memoryCheckDetail(phaseInfo) {
      var cases = phaseInfo.report;
      var fragment = document.createDocumentFragment();
      // var detail
      var index = 1;
      var maxCaseNum = maxMemCaseNum;
      if (phaseInfo.failedCaseNum) {
/* use detail */        fragment.appendChild(createElementWith('div', 'failed-cases-summary', phaseInfo.failedCaseNum + ' of the total of ' + cases.length + ' tests failed to pass.'));
      }
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
        for (var caseIndex = 0, oneCase = cases[caseIndex]; caseIndex < cases.length; ++caseIndex, oneCase = cases[caseIndex]) {
          if ((oneCase['memory errors'].length == 0 && oneCase.error === null) ^ cr) continue;
          var caseOuterWrapper = createElementWith('div', 'case-outer-wrapper');
          var caseInnerWrapper = createElementWith('div', 'case-inner-wrapper');
          caseInnerWrapper.appendChild(getSummary(oneCase));
          caseInnerWrapper.id = 'memory-test-' + sectionId;
          sideNav.add('Test ' + index, caseInnerWrapper.id, 3);
          var inoutTests = [{
                "label": 'Standard Input',
                "id": 'input'
              }
            ];
          if (!cr) {
            inoutTests.push({
                "label": 'Memory Errors',
                "content": (function() {
                  var errors = oneCase['memory errors'];
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
          if (oneCase.error) {
            caseInnerWrapper.appendChild(createElementWith('pre', 'label', 'Standard Input'));
            var content = createLinenumPreWithText(oneCase.input);
            caseInnerWrapper.appendChild(createHideElementBtn(content));
            caseInnerWrapper.appendChild(createElementWith('pre', 'error-content', content));
          } else {
            inoutTests.forEach(function(oneSection, sectionIndex) {
              var title = createElementWith('pre', 'label', oneSection.label);
              caseInnerWrapper.appendChild(title);
              title.id = caseInnerWrapper.id + '-' + oneSection.label.replace(/ /g, '-').toLowerCase();
              sideNav.add(oneSection.label, title.id, 5);

              var content = (oneSection.label == 'Memory Errors' ? oneSection.content() : createLinenumPreWithText(oneCase[oneSection.id]));
              caseInnerWrapper.appendChild(createHideElementBtn(content));
              if (sectionIndex) content.classList.add('error-content');
              caseInnerWrapper.appendChild(content);
            });
          }
          caseOuterWrapper.appendChild(caseInnerWrapper), detail.appendChild(caseOuterWrapper);
          ++sectionId;
          if (index == maxCaseNum) {
            breakFromInner = true;
            break;
          }
          ++index;
        }
        if (breakFromInner && index == maxCaseNum) break;
      }
      return fragment;
    }
    function googleTestsDetail(phaseInfo) {
      var fragment = document.createDocumentFragment();
      if (!phaseInfo.pass) fragment.appendChild(createElementWith('pre', ['error-content', 'red-color'], 'Google Test failed'));
      var detail = createElementWith('div', 'error-detail');
      var cases = phaseInfo.report;
      for (var cr = 0; cr < showCR * 1 + 1; ++cr) {
        for (var index = 0; index != cases.length; ++index) {
          var oneCase = cases[index];
          if ((oneCase.pass) ^ cr) continue;
          var caseWrapper = createElementWith('div', 'google-test-case-wrapper');
          caseWrapper.appendChild(createElementWith('pre', 'index', 'Test [' + (index + 1) + ']'));
          caseWrapper.id = 'google-test-' + (index + 1);
          sideNav.add('Test ' + (index + 1), caseWrapper.id, 3);
          var itemsWrapper = createElementWith('div', 'google-tests-items');
          for (var cr2 = 0; cr2 < 2; ++cr2) {
            for (var name in oneCase.info) {
              var oneItem = oneCase.info[name];
              if (oneItem.pass ^ cr2) continue;
              var content = createElementWith('pre', 'google-tests-one-item', name + ' (' + (oneItem.pass ? totalPoints['google tests detail'][name] + ', pass' : '0, failed') + ')\n    ' + oneItem.description);
              itemsWrapper.appendChild(content);
            }
          }
          caseWrapper.appendChild(itemsWrapper), detail.appendChild(caseWrapper);
        }
      }
        
      fragment.appendChild(detail);
      return fragment;
    }
    function standardTestsDetail(phaseInfo) {
      return testsDetail(phaseInfo, true);
    }
    function randomTestsDetail(phaseInfo) {
      return testsDetail(phaseInfo, false);
    }
    
    /** 
     * get a div 
     * @param {ReportObject} reportObject - a submission report Object
     * @return {Node} the the main submission output div
     * dependent of
     *   {function} createElementWith
     *   {function} toLinenumString
     *   {function} createDiffPre
     */
    function getScoreDiv(phase, score, total, pass) {
      var nodesToBeAppended = [
        createElementWith('span', 'score-text', phase.description + " : You've got "),
        createElementWith('span', (score == total ? 'score-text' : ['score-text', 'non-pass']), String(score)),
        createElementWith('span', 'score-text', ' of the total of ' + total + ' points')
      ];
      if (typeof(phase.url) == 'string' && !pass) {
        var link = createElementWith('a', 'link', 'Why did it go wrong?');
        link.href = phase.url, link.target = '_blank';
        nodesToBeAppended.push(link);
      }
      return createElementWith('div', [phase.id.replace(/ /g, '-').replace(/-tests/, '-tests-check') + '-score', 'score'], nodesToBeAppended);
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
                  },
                  {
                    "id": 'google tests',
                    "getDetail": googleTestsDetail,
                    "description": 'Google tests',
                    "canShowCR": true
                  }];

    phases.forEach(function(onePhase) {
      if (reportObject[onePhase.id] === null) return;
      var pass = reportObject[onePhase.id].pass
          grade = reportObject[onePhase.id].grade;
      var reportSection = createElementWith('div', [onePhase.id.replace(/ /g, '-'), 'report-section'],
        getScoreDiv(onePhase, grade, totalPoints[onePhase.id], pass));

      var scoreTextOnNav = null;
      if (pass) {
        scoreTextOnNav = ' (' + grade + ')';
      } else {
        scoreTextOnNav = ' (' + grade + '/' + totalPoints[onePhase.id] + ')';
      }
      reportSection.id = 'report-' + onePhase.id.replace(/ /g, '-');
      sideNav.add(onePhase.description + scoreTextOnNav, reportSection.id, 1, (pass ? undefined : 'non-pass'));
      
      var testContent = createElementWith('div', 'test-content');
      var detail = null;
      if (reportObject[onePhase.id].error) {
          detail = createElementWith('div', 'not-executing-check', reportObject[onePhase.id].error);
      } else if (reportObject[onePhase.id].pass) {
          detail = createElementWith('pre', 'full-score', "Good Job! You've got full scores in this section.");
          if (showCR && onePhase.canShowCR) {
              detail.appendChild(onePhase.getDetail(reportObject[onePhase.id]));
          }
      } else {
          detail = onePhase.getDetail(reportObject[onePhase.id]);
      }
      var reportDetail = createElementWith('div', 'report-detail', detail);
      testContent.appendChild(reportDetail), reportSection.appendChild(testContent), sectionsWrapper.appendChild(reportSection);
    });
    report['endSelector'] = '#' + sectionsWrapper.lastElementChild.id;
    report['sideNav'] = sideNav;
    report.appendChild(sideNav.getNode());
    return report;
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

