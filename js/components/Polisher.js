var customElements = require('./elements/customElements.js');
var createMatrixAlert = require('./createMatrixAlert.js');
var createElementWith = customElements.createElementWith;
var createLinenumPreWithText = customElements.createLinenumPreWithText;
var createPreWithText = customElements.createPreWithText;
var createDiffPre = customElements.createDiffPre;
var createHideElementBtn = customElements.createHideElementBtn;
var createViewInHexSpan = customElements.createViewInHexSpan;
var createStdYourDiffRadioGroup = customElements.createStdYourDiffRadioGroup;
var SideNav = require('./elements/SideNav.js');
var registerSelectAll = require('./registerSelectAll.js');
var polisher = {
  "getPolishedReportDiv": function(reportObject, configs) {
    var showCR = (configs.showCR === undefined) ? false : Boolean(configs.showCR);
    var maxStdCaseNum = (configs.maxStdCaseNum === undefined) ? 5 : configs.maxStdCaseNum;
    var maxRanCaseNum = (configs.maxRanCaseNum === undefined) ? 5 : configs.maxRanCaseNum;
    var maxMemCaseNum = (configs.maxMemCaseNum === undefined) ? 2 : configs.maxMemCaseNum;
    var memoryLimit = (configs.limits.memory === undefined) ? null : configs.limits.memory + 'MB';
    var timeLimit = (configs.limits.time === undefined) ? null : configs.limits.time + 'ms';
    var totalPoints = configs.totalPoints;

    function wrap(str) {
      return str === undefined ? '(missing)' : str;
    }
    var report = createElementWith('div', ['report-success', 'polished-report-success']);
    var submitTimeText = reportObject.submitTime === null ? '' : '(submitted at ' + wrap(reportObject.submitTime) + ')';
    var sectionsWrapper = createElementWith('div', 'polished-ver');
    sectionsWrapper.id = 'matrix-programming-report';
    report.appendChild(sectionsWrapper);
    var gradeSection = createElementWith('div', 'report-section');
    if (reportObject.msg !== null) {
      gradeSection.appendChild(createElementWith('div', 'score', reportObject.msg + '  ' + submitTimeText));
      sectionsWrapper.appendChild(gradeSection);
      return report;
    } else {
      gradeSection.appendChild(createElementWith('div', 'score', 'Grade: ' + reportObject.grade + '  ' + submitTimeText));
      sectionsWrapper.appendChild(gradeSection);
    }
    var sideNav = new SideNav();
    var sectionId = 1;
    var resultText = {
      "CR": 'Correct',
      "WA": 'Wrong Answer',
      "IE": 'Internal Error',
      "TL": 'Time Limit Exceeded',
      "ML": 'Memory Limit Exceeded',
      "OL": 'Output Limit Exceeded',
      "RE": 'Runtime Error',
      "null": 'Unexpected Error'
    };

    function compileCheckDetail(phaseInfo) {
      // var detail = createPreWithText(phaseInfo.report);
      // detail.classList.add('error-content');
      // return detail;

      var fragment = document.createDocumentFragment();
      if (!phaseInfo.pass) {
        fragment.appendChild(createElementWith('pre', ['error-content', 'red-color'], 'Compilation failed'));
      }
      var detail = createPreWithText(phaseInfo.report);
      detail.classList.add('error-content');
      fragment.appendChild(detail);
      return fragment;
    }
    function styleCheckDetail(phaseInfo, phaseName) {
      var violations = phaseInfo.report;
      var fragment = document.createDocumentFragment();
      if (!phaseInfo.pass) fragment.appendChild(createElementWith('pre', ['error-content', 'red-color'], 'Violations of ' + phaseName + ' detected'));
      var detail = createElementWith('div', 'violations');
      for (var i in violations) {
        var oneViolation = createPreWithText(violations[i]);
        oneViolation.classList.add('violations');
        detail.appendChild(oneViolation);
      }
      fragment.appendChild(createHideElementBtn(detail));
      fragment.appendChild(detail);
      return fragment;
    }
   
    function testsDetail(phaseInfo, std) {
      var cases = phaseInfo.report;
      var fragment = document.createDocumentFragment();
      var detail = document.createDocumentFragment();
      
      var index = 1;
      var maxCaseNum = std ? maxStdCaseNum : maxRanCaseNum;
      if (phaseInfo.failedCaseNum) {
        // failedMessage = phaseInfo.failedCaseNum + ' of the total of ' + cases.length + ' test' + (cases.length == 1 ? '' : 's');
        var failedMessage = 'Some tests failed to pass';
        detail.appendChild(createElementWith('pre', ['error-content', 'red-color'], failedMessage));
      }
      var getSummary = function(caseInfo) {
        var summary = createElementWith('div', 'tests-check-summary');
        summary.appendChild(createElementWith('pre', 'index', 'Test [' + index + ']'));
        if (caseInfo.error) {
          summary.appendChild(createElementWith('br'));
          summary.appendChild(createElementWith('pre', 'not-executing-check', 'Error: ' + caseInfo.error));
        } else {
          summary.appendChild(createElementWith('pre', (caseInfo.resultCode != 'CR' ? ['result-code', 'non-pass'] : 'result-code'), 'Result: ' + resultText[caseInfo.resultCode]));
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
          } else if (oneCase.resultCode != 'WA' && oneCase.stdOutput && oneCase.stdOutput.length) {
            inoutTests.push({
              "label": 'Standard Answer Output',
              "id": 'stdOutput'
            });
          }
          if (oneCase.error) {
              caseInnerWrapper.appendChild(createElementWith('pre', 'label', 'Standard Input'));
              var content = createLinenumPreWithText(oneCase.input);
              var inputPre = createElementWith('pre', 'error-content', content);
              registerSelectAll(inputPre, function(event) {
                return this.firstChild;
              });
              caseInnerWrapper.appendChild(inputPre);
          } else {
            inoutTests.forEach(function(oneSection) {
              var title = createElementWith('pre', 'label', oneSection.label);
              caseInnerWrapper.appendChild(title);
              title.id = caseInnerWrapper.id + '-' + oneSection.label.replace(/ /g, '-').toLowerCase();
              sideNav.add(oneSection.label, title.id, 5);

              var content = createLinenumPreWithText(oneCase[oneSection.id]);
              caseInnerWrapper.appendChild(createHideElementBtn(content));
              var contentPre = createElementWith('pre', 'error-content', content);
              if (oneSection.id == 'input') {
                registerSelectAll(contentPre, function(event) {
                  return this.firstChild;
                });
              }
              caseInnerWrapper.appendChild(contentPre);
            });
          }
          if (!cr && oneCase.diff) {
            var title = createElementWith('pre', 'label', 'Details');
            caseInnerWrapper.appendChild(title);
            title.id = caseInnerWrapper.id + '-diff';
            sideNav.add('Details', title.id, 5);

            var diffPre = createDiffPre(oneCase.diff);
            caseInnerWrapper.appendChild(createHideElementBtn(diffPre));
            var radioGroup = createStdYourDiffRadioGroup(sectionId, caseInnerWrapper);
            caseInnerWrapper.appendChild(radioGroup);
            radioGroup.querySelector('input').click();
            caseInnerWrapper.appendChild(createViewInHexSpan(sectionId, caseInnerWrapper));
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
      fragment.appendChild(detail);
      return fragment;
    }
    function memoryCheckDetail(phaseInfo) {
      var cases = phaseInfo.report;
      var fragment = document.createDocumentFragment();
      var detail = document.createDocumentFragment();
      var index = 1;
      var maxCaseNum = maxMemCaseNum;
      if (phaseInfo.failedCaseNum) {
        detail.appendChild(createElementWith('pre', ['error-content', 'red-color'], phaseInfo.failedCaseNum + ' of the total of ' + cases.length + ' test' + (cases.length == 1 ? '' : 's') + ' failed to pass'));
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
            registerSelectAll(content, function(event) {
              return this;
            });
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
              if (oneSection.id == 'input') {
                registerSelectAll(content, function(event) {
                  return this;
                });
              }
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
      fragment.appendChild(detail);
      return fragment;
    }
    function googleTestsDetail(phaseInfo) {
      var fragment = document.createDocumentFragment();
      if (!phaseInfo.pass) {
        fragment.appendChild(createElementWith('pre', ['error-content', 'red-color'], 'Failed to pass Google Test'));
      }
      var detail = createElementWith('div', 'error-detail');
      var cases = phaseInfo.report;
      for (var cr = 0; cr < showCR * 1 + 1; ++cr) {
        for (var index = 0; index != cases.length; ++index) {
          var oneCase = cases[index];
          if ((oneCase.pass) ^ cr) continue;
          var caseWrapper = createElementWith('div', 'google-test-case-wrapper');
          caseWrapper.appendChild(createElementWith('pre', 'index', 'Test [' + (index + 1) + ']'));
          caseWrapper.id = 'report-google-test-' + (index + 1);
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
    function googleStyleDetail(phaseInfo) {
      return styleCheckDetail(phaseInfo, 'Google Style');
    }
    function staticCheckDetail(phaseInfo) {
      return styleCheckDetail(phaseInfo, 'Oclint Rules');
    }
    function standardTestsDetail(phaseInfo) {
      return testsDetail(phaseInfo, true);
    }
    function randomTestsDetail(phaseInfo) {
      return testsDetail(phaseInfo, false);
    }
    
    function getScoreDiv(phase, score, total, pass) {
      var nodesToBeAppended = [
        createElementWith('span', 'score-text', phase.description + " : You've got "),
        createElementWith('span', (score >= total ? 'score-text' : ['score-text', 'non-pass']), String(score)),
        createElementWith('span', 'score-text', ' of the total of ' + total + ' point' + (total == 1 ? '' : 's'))
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
                    "id": 'google style',
                    "getDetail": googleStyleDetail,
                    "description": 'Google Style',
                    "url": 'https://google.github.io/styleguide/cppguide.html',
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
                    "description": 'Google Tests',
                    "canShowCR": true
                  }];

    phases.forEach(function(onePhase) {
      var reportObjCurPhase = reportObject[onePhase.id];
      if ( (onePhase.id != 'google style' && !totalPoints[onePhase.id])
        || (onePhase.id == 'google style' && !reportObjCurPhase)) return;

      if (reportObjCurPhase === null) {
        reportObjCurPhase = {
          "pass": false,
          "grade": 0,
          "error": "This part was not executed"
        }
      }
      var pass = reportObjCurPhase.pass
          grade = reportObjCurPhase.grade;
      var reportSection = createElementWith('div', [onePhase.id.replace(/ /g, '-'), 'report-section'],
        getScoreDiv(onePhase, grade, wrap(totalPoints[onePhase.id]), pass));

      var scoreTextOnNav = null;
      if (pass) {
        scoreTextOnNav = ' (' + grade + ')';
      } else {
        scoreTextOnNav = ' (' + grade + '/' + wrap(totalPoints[onePhase.id]) + ')';
      }
      reportSection.id = 'report-' + onePhase.id.replace(/ /g, '-');
      sideNav.add(onePhase.description + scoreTextOnNav, reportSection.id, 1, (pass ? undefined : 'non-pass'));
      
      var testContent = createElementWith('div', 'test-content');
      var detail = null;
      if (reportObjCurPhase.error) {
          detail = createElementWith('pre', 'not-executing-check', reportObjCurPhase.error);
      } else if (reportObjCurPhase.pass) {
          detail = createElementWith('pre', 'full-score', "Good Job! You've got full scores in this part.");
          if (showCR && onePhase.canShowCR) {
              detail.appendChild(onePhase.getDetail(reportObjCurPhase));
          }
      } else {
          detail = onePhase.getDetail(reportObjCurPhase);
      }
      var reportDetail = createElementWith('div', 'report-detail', detail);
      testContent.appendChild(reportDetail), reportSection.appendChild(testContent), sectionsWrapper.appendChild(reportSection);
    });
    if (sectionsWrapper.lastElementChild) report['endSelector'] = '#' + sectionsWrapper.lastElementChild.id;
    var fullGrade = 0;
    for (var item in totalPoints) {
      if (typeof(totalPoints[item]) == 'number') fullGrade += totalPoints[item];
    }
    sideNav.navTitle.textContent += ' (' + (isNaN(Number(reportObject.grade)) ? '0' : reportObject.grade) + '/' + fullGrade + ')';
    report['sideNav'] = sideNav;
    report.appendChild(sideNav.getNode());
    return report;
  },

  "getFilesCmpDiv": function(filesDiff, configs) {
    var report = createElementWith('div', ['report-success', 'polished-report-success']);
    var sectionsWrapper = createElementWith('div', 'polished-ver');
    sectionsWrapper.id = 'matrix-programming-report';
    report.appendChild(sectionsWrapper);
    var sideNav = new SideNav();
    
    filesDiff.files.forEach(function(oneCommonFile) {
      var suffix = '';
      if (oneCommonFile.diff && oneCommonFile.diff.length == 1 && oneCommonFile.diff[0].common == true) {
        suffix = ' (Same)';
      }
      var reportSection = createElementWith('div', ['compile-check', 'report-section'],
        createElementWith('div', ['compile-check-score', 'score'], oneCommonFile.name + suffix));
      var scoreTextOnNav = null;
      reportSection.id = 'files-cmp-report-' + oneCommonFile.name.replace(/ |\./g, '-');
      sideNav.add(oneCommonFile.name + suffix, reportSection.id, 1, (suffix.length ? undefined : 'non-pass'));

      var testContent = createElementWith('div', 'test-content');
      var detail = document.createDocumentFragment();
      var caseOuterWrapper = createElementWith('div', 'case-outer-wrapper');
      var caseInnerWrapper = createElementWith('div', 'case-inner-wrapper');
      var diffPre = createDiffPre(oneCommonFile.diff, configs);
      var hideBtn = createHideElementBtn(diffPre);
      caseInnerWrapper.appendChild(hideBtn);
      if (suffix.length) hideBtn.click();
      var radioGroup = createStdYourDiffRadioGroup(reportSection.id, caseInnerWrapper);
      caseInnerWrapper.appendChild(radioGroup);
      radioGroup.querySelector('input').click();
      radioGroup.querySelectorAll('.std-your-diff-radio-group-label')[1].textContent = configs.stdHeading;
      radioGroup.querySelectorAll('.std-your-diff-radio-group-label')[2].textContent = configs.yourHeading;
      caseInnerWrapper.appendChild(createViewInHexSpan('view-hex-span-' + oneCommonFile.name.replace(/ |\./g, '-'), caseInnerWrapper));
      caseInnerWrapper.classList.add('hideHex');
      var errorContent = createElementWith('pre', 'error-content', diffPre); 
      caseInnerWrapper.appendChild(errorContent);
      caseOuterWrapper.appendChild(caseInnerWrapper), detail.appendChild(caseOuterWrapper);
      var reportDetail = createElementWith('div', 'report-detail', detail);
      testContent.appendChild(reportDetail), reportSection.appendChild(testContent), sectionsWrapper.appendChild(reportSection);
    });

    if (sectionsWrapper.lastElementChild) report['endSelector'] = '#' + sectionsWrapper.lastElementChild.id;
    report['sideNav'] = sideNav;
    sideNav.navTitle.textContent = 'Files Comparison';
    report.appendChild(sideNav.getNode());
    return report;
  },

  "createMatrixAlert": createMatrixAlert


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

