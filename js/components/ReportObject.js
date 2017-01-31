var CaseObject = require('./CaseObject.js');
/** 
 * ReportObject
 * refactored version of the original report object from Matrix
 * @param {string | object} body - object or stringified object representing report from Matrix
 * 
 * dependent of
 *   {function} genDiffInfo
 */
function ReportObject(body) {
  this.extendFrom(this.genReportObj(body));
}
ReportObject.prototype = {
  "constructor": ReportObject,
  "extendFrom": function(parent) {
    for (var name in parent) this[name] = parent[name];
  },
  /** 
   * refactor the original report object from Matrix
   * @param {string | Object} body - object or stringified object representing report from Matrix
   * @return {Object} refactored report object
   *
   * dependent of
   *   {function} genDiffInfo
   */
  "genReportObj": function(body) {
    var reportObject = {
      "msg": null,
      "grade": null,
      "submitTime": null,
      "compile check": null,
      "static check": null,
      "standard tests": null,
      "random tests": null,
      "memory check": null,
      "google tests": null,
      "google style": null
    };

    var data = body.data;
    if (body.err) {
      reportObject.msg = 'Error: ' + body.msg;
      reportObject.grade = -2;
      console.log('body (body.err):', body);

    } else if (body.status == 'SUBMISSION_NOT_FOUND') {
      reportObject.msg = 'No submissions yet';
      reportObject.grade = -2;
      console.log('body (no submissions yet):', body);
    } else if (body.status == 'NOT_AUTHORIZED') {
      reportObject.msg = 'Not logged in';
      reportObject.grade = -2;
      console.log('body (not logged in):', body);
      return null;
    } else if (data === null) {
      reportObject.msg = 'Not judged yet';
      reportObject.grade = -2;
      console.log('body (not judged yet):', body);

    } else if (data.grade == -1 || data.grade === null) {
      reportObject.grade = 'Under judging';
      console.log('body.data (submission under judging):', body.data);

    } else if (data.report === undefined || data.report === null) {
      reportObject.msg = 'Error: data.report is empty';
      reportObject.grade = -2;
      console.log('body.data (body.data is empty):', body.data);

    } else if (data.report.error) {
      reportObject.msg = 'Error: ' + data.report.error;
      reportObject.grade = -2;
      console.log('report (report.error):', data.report);
    }

    var report = null;
    if (-2 == reportObject.grade) {
      return reportObject;
    } else {
      report = data.report;
    }

    // reportObject.submitTime = data.submitTime;

    /** 
     * return a string 'missing' if str is undefined, or return str itself otherwise
     * @param {string | undefined} str - the string to be wrapped
     * @param {string} [append] - string to be appended after str
     * @return {string}
     * 
     * independent
     */
    function wrapWithMissing(str, append) {
      return (typeof(str) != 'undefined' ? (str + (typeof(append) != 'undefined' ? append : '') ) : 'missing');
    };

    /** 
     * return [obj] if the obj is not an array, or obj itself otherwise
     * @param {*} obj - the obj to be wrapped to an array
     * @return {[obj]}
     * 
     * independent
     */
    function toArray(obj) {
      return Object.prototype.toString.apply(obj) != '[object Array]' ? [obj] : obj;
    }

    /** 
     * refactor standard/random tests
     * @param {string} phaseName - the type of the tests (standard or random)
     * @param {Object} info - infomation of tests
     * @return {undefined}
     * 
     * private and dependent of 
     *     {Object} reportObject
     */
    function refactorTests(phaseName, info) {
      var curPhase = reportObject[phaseName];
      curPhase['error'] = null;
      curPhase['report'] = [];
      var failedCaseNum = 0;
      info.forEach(function(oneTest, i, self) {
        var oneCase = new CaseObject();
        if ((oneTest.error || (oneTest.message && oneTest.message != 'Program finished running.'))) {
          var msg = (oneTest.error) ? oneTest.error : oneTest.message;
          oneCase.extendFrom({
            "error": msg,
            "input": oneTest.stdin || 'No Input.'
          });
          curPhase['report'].push(oneCase);
          ++failedCaseNum;
          return;
        }
        if (oneTest.result != 'CR') ++failedCaseNum;
        oneCase.extendFrom({
          "resultCode": oneTest.result,
          "input": oneTest.stdin || 'No Input.',
          "stdOutput": oneTest.standard_stdout || '',
          "yourOutput": oneTest.stdout || '',
          "memoryused": wrapWithMissing(oneTest.memoryused),
          "timeused": wrapWithMissing(oneTest.timeused)
        });
        oneCase.genDiffInfo();
        if (oneCase.stdOutput.length == 0) oneCase.stdOutput = 'No Output.';
        if (oneCase.yourOutput.length == 0) oneCase.yourOutput = 'No Output.';
        curPhase['report'].push(oneCase);
      });
      curPhase['failedCaseNum'] = failedCaseNum;
      curPhase['pass'] = !failedCaseNum;
    }
    function refactorCompileMsg(phaseName, info) {
      var curPhase = reportObject[phaseName];
      curPhase['report'] = info;
      curPhase['error'] = null;
      if (info == 'pass') curPhase['pass'] = true;
      else curPhase['pass'] = false;
    }
    function refactorStaticCheckMsg(phaseName, info) {
      var curPhase = reportObject[phaseName];
      if (info == "static parse error") {
        curPhase['report'] = null;
        curPhase['error'] = info;
        curPhase['pass'] = false;
        return;
      }
      curPhase['error'] = null;
      curPhase['report'] = [];
      var violation = info.violation;
      if (violation.length == 0) {
        curPhase['pass'] = true;
        return;
      }
      curPhase['pass'] = false;
      
      violation.forEach(function(oneViolation, i, self) {
        
        var range = function(begin, end) {
          if (begin == end) return begin;
          else return begin + ' ~ ' + end;
        };
        var content = '';
        content += 'File: ' + oneViolation.path.substr(5) + '\n';
        content += 'Line: ' + range(oneViolation.startLine, oneViolation.endLine) + '\n';
        content += 'Column: ' + oneViolation.startColumn + ' ~ ' + oneViolation.endColumn + '\n';
        content += 'Rule: ' + oneViolation.rule + ' [priority=' + oneViolation.priority + ']\n';
        content += (oneViolation.message) ? 'Detail: ' + oneViolation.message + '\n' : '';
        curPhase['report'].push(content);
      });
    }
    function refactorMemoryCheck(phaseName, info) {
      var curPhase = reportObject[phaseName];
      curPhase['report'] = [];
      curPhase['error'] = null;
      var pass = true;
      var failedCaseNum = 0;
      info.forEach(function(test, i) {
        var oneCase = {};
        var stdin = test.stdin;
        oneCase['error'] = null;
        oneCase['memory errors'] = [];
        if (test.error || test.message) {
          var msg = (test.error) ? test.error : test.message;
          oneCase['error'] = msg;
          oneCase['input'] = stdin || 'No Input.';
          curPhase['report'].push(oneCase);
          ++failedCaseNum;
          return;
        }
        oneCase['input'] = stdin || 'No Input.';
        var errors = test.valgrindoutput.error;
        if (!errors) {
          curPhase['report'].push(oneCase);
          return;
        } else {
          ++failedCaseNum;
        }

        errors = toArray(errors);
        errors.forEach(function(oneError, j) {
          var behavior = oneError.what;
          var content = '';
          var auxwhat = oneError.auxwhat, stack = oneError.stack;
          
          if (!behavior) {
            if (oneError.kind == 'Leak_DefinitelyLost') {
              behavior = 'Memory leak -> ' + oneError.xwhat.text;
            } else if (oneError.kind == 'Leak_PossiblyLost') {
              behavior = 'Possible memory leak -> ' + oneError.xwhat.text;
            }
            if (oneError.xwhat) {
              auxwhat = oneError.xwhat.text;
            }
          }

          auxwhat = toArray(auxwhat);
          content += 'Behavior: ' + wrapWithMissing(behavior) + '\n';
          stack = toArray(stack);
          stack.forEach(function(frame, index) {
            frame = toArray(frame.frame);
            if (index == 0) content += '   ';
            else content += ' ' + wrapWithMissing(auxwhat[index - 1]) + ':\n   ';
            frame.forEach(function(funcInfo, funcIndex) {
              if (funcIndex) content += 'by:';
              else content += 'at:';
              if (funcInfo.file && funcInfo.line) content += ' ' + funcInfo.file + ' Line ' + funcInfo.line + '\n  ' + '  ' + funcInfo.fn + '\n   ';
              else content += ' ' + (funcInfo.fn || 'some func') + ' precompiled in ' + funcInfo.obj + '\n   ';
            });
            content += '\n';
          });
          oneCase['memory errors'].push(content);
        });
        curPhase['report'].push(oneCase);
      });
      curPhase['failedCaseNum'] = failedCaseNum;
      curPhase['pass'] = !failedCaseNum;
    }
    function refactorGoogleTests(phaseName, info) {
      var curPhase = reportObject[phaseName];
      curPhase['report'] = [];
      curPhase['error'] = null;

      var pass = true;
      var failedCaseNum = 0;
      info.forEach(function(oneTest, index, self) {
        oneTest = oneTest.gtest;
        var oneCase = {}, re = false;
        oneCase['grade'] = oneTest.grade;
        oneCase['info'] = oneTest.info;
        if (oneTest.failure && oneTest.failure.length == 1 && oneTest.failure[0].error == 'Run time error') {
          re = true;
          oneCase.info = {};
        }
        for (var name in oneCase.info) {
          var description = oneCase.info[name];
          oneCase.info[name] = {};
          oneCase.info[name]['pass'] = !re;
          oneCase.info[name]['description'] = description;
        }
        if (re) {
          oneCase.info['Error'] = {
            "pass": false,
            "description": oneTest.failure[0].error
          }
          ++failedCaseNum;
        } else if (oneTest.failure != null) {
          oneTest.failure.forEach(function(oneFailure) {
            for (var name in oneFailure) {
              oneCase.info[name]['pass'] = false;
            }
          });
          ++failedCaseNum;
        } else {
          
        }
        curPhase.report.push(oneCase);
      });
      // curPhase.report = JSON.stringify(curPhase.report);
      curPhase['failedCaseNum'] = failedCaseNum;
      curPhase['pass'] = !failedCaseNum;
    }
    var toContinue = true;

    function refactorPhase(phase, func) {
      if (toContinue && report && report[phase] && report[phase][phase]) {
        toContinue = report[phase]['continue'];
        reportObject[phase] = {};
        reportObject[phase]['grade'] = report[phase].grade;
        return func(phase, report[phase][phase]);
      } else {
        return;
      }
    }
    const phases = [{
      id: 'compile check',
      refactorFunc: refactorCompileMsg
    }, {
      id: 'static check',
      refactorFunc: refactorStaticCheckMsg
    }, {
      id: 'standard tests',
      refactorFunc: refactorTests
    }, {
      id: 'random tests',
      refactorFunc: refactorTests
    }, {
      id: 'memory check',
      refactorFunc: refactorMemoryCheck
    }, {
      id: 'google tests',
      refactorFunc: refactorGoogleTests
    }];
    if (reportObject.grade === null) reportObject.grade = data.grade;
    for (const { id, refactorFunc } of phases) refactorPhase(id, refactorFunc);
    return reportObject;
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
    exports['ReportObject'] = factory();
  else
    root['ReportObject'] = factory();
})(this, function factory() {
  return ReportObject;
});
