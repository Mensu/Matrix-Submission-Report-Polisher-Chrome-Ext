var genDiffInfo = require('./genDiffInfo.js');

function genReportObj(body) {
  var reportObject = {
    "msg": null,
    "grade": null,
    "compile check": null,
    "static check": null,
    "standard tests": null,
    "random tests": null,
    "memory check": null,
  };

  body = JSON.parse(body);
  if (body.err) {
    reportObject.msg = 'Error: ' + body.msg;
    reportObject.grade = 0;
    console.log('body:');
    console.log(body);
    return reportObject;
  }

  var data = body.data;

  if (body.status == 'SUBMISSION_NOT_FOUND') {
      reportObject.msg = 'no submissions yet';
      reportObject.grade = null;
      console.log('body:');
      console.log(body);
      return reportObject;
  }
  if (data === undefined || data === null) {
    reportObject.msg = 'Error: body.data is empty';
    reportObject.grade = 0;
    console.log('body:');
    console.log(body);
    return reportObject;
  }
  
  if (data.grade == -1 || data.grade === null) {
    // reportObject.msg = 'grading';
    reportObject.grade = 'being judged';
    console.log('body.data (submission being judged)');
    console.log(body.data);
    // return reportObject;
  }
  if (data.report === null) {
    reportObject.msg = 'report is empty';
    reportObject.grade = 0;
    console.log('body.data');
    console.log(body.data);
    return reportObject;
  }
  var report = data.report;
  if (report.error) {
    reportObject.msg = 'Error: ' + report.error;
    reportObject.grade = 0;
    console.log('report');
    console.log(report);
    return reportObject;
  }

  /** 
   * @param {string | undefined} str - the string to be wrapped
   * @param {string | undefined} append - append itself, if defined, after str
   * @return {string}
   * 
   * private but independent
   */
  function wrap(str, append) {
    return ((typeof(str) != 'undefined') ? (str + ((typeof(append) != 'undefined') ? append : '')) : 'missing');
  };

  function refactorTests(phaseName, info) {
    var curPhase = reportObject[phaseName];
    curPhase['error'] = null;
    curPhase['report'] = [];
    var failedCaseNum = 0;
    for (var i in info) {
      var oneCase = {};
      var oneTest = info[i];
      
      if ((oneTest.error || (oneTest.message && oneTest.message != 'Program finished running.'))) {
        var msg = (oneTest.error) ? oneTest.error : oneTest.message;
        oneCase['error'] = msg;
        oneCase['input'] = oneTest.stdin || 'No Input.';
        curPhase['report'].push(oneCase);
        ++failedCaseNum;
        continue;
      }
      oneCase['resultCode'] = oneTest.result;
      if (oneTest.result != 'CR') ++failedCaseNum;
      oneCase['memoryused'] = wrap(oneTest.memoryused);
      oneCase['timeused'] = wrap(oneTest.timeused);
      oneCase['input'] = oneTest.stdin || 'No Input.';
      oneCase['stdOutput'] = oneTest.standard_stdout || '';
      oneCase['yourOutput'] = oneTest.stdout || '';
      if (oneCase.stdOutput.length && oneCase.yourOutput.length) {
        genDiffInfo(oneCase);
      } else {
        oneCase['diff'] = null;
      }
      if (oneCase['stdOutput'].length == 0) oneCase['stdOutput'] = 'No Output.';
      if (oneCase['yourOutput'].length == 0) oneCase['yourOutput'] = 'No Output.';
      curPhase['report'].push(oneCase);
    }
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
    for (var i in violation) {
      var oneViolation = violation[i];
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
    }
  }
  function refactorMemoryCheck(phaseName, info) {
    var curPhase = reportObject[phaseName];
    curPhase['report'] = [];
    curPhase['error'] = null;
    var pass = true;
    for (i in info) {
      var oneCase = {};
      var test = info[i], stdin = test.stdin;
      oneCase['error'] = null;
      oneCase['memory errors'] = [];
      if (test.error || test.message) {
        var msg = (test.error) ? test.error : test.message;
        oneCase['error'] = msg;
        oneCase['input'] = stdin || 'No Input.';
        curPhase['report'].push(oneCase);
        pass = false;
        continue;
      }
      oneCase['input'] = stdin || 'No Input.';
      var errors = test.valgrindoutput.error;
      if (!errors) {
        curPhase['report'].push(oneCase);
        continue;
      }
      else pass = false;

      if (typeof(errors.length) == 'undefined') errors = new Array(errors);
      for (j in errors) {
        var oneError = errors[j], behavior = oneError.what;
        var content = '';
        var auxwhat = oneError.auxwhat, stack = oneError.stack;
        
        if (!behavior) {
          if (oneError.kind == 'Leak_DefinitelyLost') {
            behavior = 'Memory leak';
            auxwhat = oneError.xwhat.text;
          } else if (oneError.kind == 'Leak_PossiblyLost') {
            behavior = 'Possible memory leak';
            auxwhat = oneError.xwhat.text;
          } else {
            content += 'Behavior: ' + wrap(behavior) + '\n';
            content += '\n' + oneError + '\n';
            continue;
          }
        }

        if (typeof(auxwhat) == 'string') auxwhat = new Array(auxwhat);
        content += 'Behavior: ' + wrap(behavior) + '\n';
        if (typeof(stack.length) == 'undefined') stack = new Array(stack);

        for (k in stack) {
          var frame = stack[k].frame;
          if (typeof(frame.length) == 'undefined') frame = new Array(frame);
          if (k == 0) content += '  ';
          else content += ' ' + auxwhat[k - 1] + ':\n  ';
          for (l in frame) {
            var funcInfo = frame[l];
            if (l != 0) content += 'by:';
            else content += 'at:';
            if (funcInfo.file && funcInfo.line) content += ' ' + funcInfo.file + ' Line ' + funcInfo.line + '\n  ' + '  ' + funcInfo.fn + '\n  ';
            else content += ' ' + (funcInfo.fn || 'some func') + ' precompiled in ' + funcInfo.obj + '\n  ';
          }
          content += '\n';
        }
        oneCase['memory errors'].push(content);
      }
      curPhase['report'].push(oneCase);
    }
    curPhase['pass'] = pass;
  }

  var toContinue = true;

  function refactorPhase(phase, func) {
    if (toContinue && report[phase] && report[phase][phase]) {
      toContinue = report[phase]['continue'];
      reportObject[phase] = {};
      reportObject[phase]['grade'] = report[phase].grade;
      return func(phase, report[phase][phase]);
    } else {
      return;
    }
  }
  var phases = [{'id': 'compile check',
                 'func': refactorCompileMsg},
                {'id': 'static check',
                'func': refactorStaticCheckMsg},
                {'id': 'standard tests',
                'func': refactorTests},
                {'id': 'random tests',
                'func': refactorTests},
                {'id': 'memory check',
                'func': refactorMemoryCheck}];
  reportObject.grade = data.grade;
  for (var i in phases) refactorPhase(phases[i].id, phases[i].func);
  return reportObject;
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
    exports['genReportObj'] = factory();
  else
    root['genReportObj'] = factory();
})(this, function factory() {
  return genReportObj;
});
