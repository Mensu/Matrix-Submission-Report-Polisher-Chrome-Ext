function httpRequest(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('get', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) return callback(false, this.response);
  }
  xhr.onerror = function() { return callback(true); }
  xhr.send();
}

function MatrixObject(newConfigs) {
  this.configs = ['rootUrl', 'tabInfo'];
  for (var i in this.configs) {
    var oneConfig = this.configs[i];
    this[oneConfig] = null;
  }
  MatrixObject.prototype.configsSetter = function(newConfigs) {
    for (var i in this.configs) {
      var oneConfig = this.configs[i];
      if (newConfigs[oneConfig] !== undefined) this[oneConfig] = newConfigs[oneConfig];
    }
  };
  if (typeof(newConfigs) == 'string') newConfigs = {"rootUrl": newConfigs};
  this.configsSetter(newConfigs);
  MatrixObject.prototype.updateTabInfo = function(newTabInfo) {
    if (this.tabInfo === null) this.tabInfo = {};
    for (var tabId in newTabInfo) {
      if (this.tabInfo[tabId] === undefined) this.tabInfo[tabId] = {};
      for (var infoType in newTabInfo[tabId]) {
        this.tabInfo[tabId][infoType] = newTabInfo[tabId][infoType];
      }
    }
  };
  MatrixObject.prototype.getReportBySubmissionId = function(submissionId, otherInfo, callback) {
    httpRequest(this.rootUrl + '/one-submission?submissionId=' + submissionId, function(err, body) {
      return callback(err, body, otherInfo);
    });
  };
  MatrixObject.prototype.getLatestReportByProblemIdUserId = function(problemId, userId, otherInfo, callback) {
    httpRequest(this.rootUrl + '/last-submission-report?problemId=' + problemId + '&userId=' + userId, function(err, body) {
      return callback(err, body, otherInfo);
    });
  };
  MatrixObject.prototype.getProblemInfoByProblemId = function(problemId, otherInfo, callback) {
    httpRequest(this.rootUrl + '/one-problem?problemId=' + problemId, function(err, body) {
      return callback(err, body, otherInfo);
    });
  };
  MatrixObject.prototype.getSubmissionsInfoByStartPosProblemIdUserId = function(startPos, problemId, userId, otherInfo, callback) {
    httpRequest(this.rootUrl + '/problem-submissions?position=' + startPos + '&problemId=' + problemId + '&userId=' + userId, function(err, body) {
      return callback(err, body, otherInfo);
    });
  };
  return this;
}

function toSubmitAt(str, toReadable) {
  var date = new Date();
  var prefixZero = function(str) {
    return (String(str).length - 1) ? String(str) : '0' + str;
  }
  var to000Z = function() {
    date.setFullYear(str.substring(0, 4)), date.setMonth(parseInt(str.substring(5, 7)) - 1), date.setDate(str.substring(8, 10)), date.setHours(str.substring(11, 13)), date.setMinutes(str.substring(14, 16)), date.setSeconds(str.substring(17, 19));
    return date.getUTCFullYear() + '-' + prefixZero(parseInt(date.getUTCMonth()) + 1) + '-' + prefixZero(date.getUTCDate()) + 'T' + prefixZero(date.getUTCHours()) + ':' + prefixZero(date.getUTCMinutes()) + ':' + prefixZero(date.getUTCSeconds()) + '.000Z';
  };
  var toNormal = function() {
    date.setUTCFullYear(str.substring(0, 4)), date.setUTCMonth(parseInt(str.substring(5, 7)) - 1), date.setUTCDate(str.substring(8, 10)), date.setUTCHours(str.substring(11, 13)), date.setUTCMinutes(str.substring(14, 16)), date.setUTCSeconds(str.substring(17, 19));
    return date.getFullYear() + '-' + prefixZero(parseInt(date.getMonth()) + 1) + '-' + prefixZero(date.getDate()) + ' ' + prefixZero(date.getHours()) + ':' + prefixZero(date.getMinutes()) + ':' + prefixZero(date.getSeconds());
  }
  if (~str.indexOf('.000Z')) {
      if (toReadable || toReadable === undefined) return toNormal();
      else return str;
  } else {
      if (toReadable) return str;
      else return to000Z();
  }
  // if (toReadable === undefined) {
  //   if (~str.indexOf('.000Z')) {
  //     return toNormal();
  //   } else {
  //     return to000Z();
  //   }
  // } else if (toReadable) {
  //   if (~str.indexOf('.000Z')) {
  //     return toNormal();
  //   } else {
  //     return str;
  //   }
  // } else {
  //   if (~str.indexOf('.000Z')) {
  //     return str;
  //   } else {
  //     return to000Z();  
  //   }
  // }
}

function toReportObject(body) {
  var reportObject = {
    "msg": null,
    "grade": null,
    "submitTime": null,
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
    console.log('body');
    console.log(body);
    return reportObject;
  }

  var data = body.data;
  if (Object.prototype.toString.apply(data) == '[object Array]') {
      if (data.length == 0) {
          reportObject.msg = 'no submissions yet';
          reportObject.grade = null;
          console.log('body');
          console.log(body);
          return reportObject;
      } else {
          data = data[0];
      }
  }
  if (data === undefined) {
    reportObject.msg = 'Error: body.data is empty';
    reportObject.grade = 0;
    console.log('body');
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
  if (data.submitAt) reportObject.submitTime = toSubmitAt(data.submitAt, true);
  if (data.report === null) {
    reportObject.msg = 'report is empty';
    reportObject.grade = 0;
    console.log('body.data');
    console.log(body.data);
    return reportObject;
  }
  var report = null;
  try {
    var report = JSON.parse(data.report);
  } catch(e) {
    reportObject.msg = 'report is incomplete';
    reportObject.grade = 0;
    console.log('data.report');
    console.log(data.report);
    return reportObject;
  }
  if (report.error){
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
  var wrap = function(str, append) {
    return ((typeof(str) != 'undefined') ? (str + ((typeof(append) != 'undefined') ? append : '')) : 'missing');
  };
  var refactorTests = function(phaseName, info) {
    var curPhase = reportObject[phaseName];
    curPhase['error'] = null;
    curPhase['report'] = [];
    var pass = true;
    for (i in info) {
      var oneCase = {};
      var oneTest = info[i];
      oneCase['memoryused'] = wrap(oneTest.memoryused);
      oneCase['timeused'] = wrap(oneTest.timeused);
      oneCase['resultCode'] = oneTest.result;
      if (pass && oneTest.result != 'CR') pass = false;
      oneCase['input'] = oneTest.stdin;
      oneCase['stdOutput'] = oneTest.standard_stdout || "";
      oneCase['yourOutput'] = oneTest.stdout;
      if (oneCase.stdOutput.length && oneCase.yourOutput.length) {
        oneCase['diff'] = JsDiff.diffLines(oneCase.stdOutput, oneCase.yourOutput);
      } else {
        oneCase['diff'] = null;
      }
      if (oneCase['stdOutput'].length == 0) oneCase['stdOutput'] = 'No Output.';
      if (oneCase['yourOutput'].length == 0) oneCase['yourOutput'] = 'No Output.';
      curPhase['report'].push(oneCase);
    }
    curPhase['pass'] = pass;
  }
  var refactorCompileMsg = function(phaseName, info) {
    var curPhase = reportObject[phaseName];
    curPhase['report'] = info;
    curPhase['error'] = null;
    if (info == 'pass') curPhase['pass'] = true;
    else curPhase['pass'] = false;
  };
  var refactorStaticCheckMsg = function(phaseName, info) {
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
    for (i in violation) {
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
  };
  var refactorMemoryCheck = function(phaseName, info) {
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
        oneCase['input'] = wrap(stdin);
        curPhase['report'].push(oneCase);
        pass = false;
        continue;
      }
      oneCase['input'] = wrap(stdin);
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
  };
  var toContinue = true;
  var refactorPhase = function(phase, func) {
    if (toContinue && report[phase] && report[phase][phase]) {
      toContinue = report[phase]['continue'];
      reportObject[phase] = {};
      reportObject[phase]['grade'] = report[phase].grade;
      return func(phase, report[phase][phase]);
    } else {
      return;
    }
  };
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
var matrix = new MatrixObject('https://eden.sysu.edu.cn:8000');


function updateUserId(details) {
  if (details.tabId == -1) return;
  var newTabInfo = {};
  var userIdIndex =  details.url.indexOf('&userId=') + 1;
  newTabInfo[details.tabId] = {
    "examId": details.url.substring(details.url.indexOf('examId=') + 7, userIdIndex - 1),
    "userId": details.url.substring(userIdIndex + 7)
  };
  matrix.updateTabInfo(newTabInfo);
}

chrome.webRequest.onCompleted.addListener(updateUserId, {
  "urls": [
    matrix.rootUrl + '/exam-problems?examId=*&userId=*'
  ]
});

var sent = false;

function sendReportObjectToFront(err, body, otherInfo) {
  var reportObject = toReportObject(body);
  if (otherInfo.submitAt && reportObject.submitTime === null)
    reportObject.submitTime = toSubmitAt(otherInfo.submitAt, true);
  chrome.tabs.sendMessage(otherInfo.tabId, {
    "signal":'start',
    "wait": otherInfo.wait,
    "reportObject": reportObject,
    "submissionsId": otherInfo.submissionsId,
    "problemInfo": {
      "problemId": otherInfo.problemId,
      "userId": otherInfo.userId,
      "limits": otherInfo.limits,
      "totalPoints": otherInfo.grading
    },
    "configs": {
      "showCR": localStorage.showCR,
      "autoPolish": localStorage.autoPolish,
      "maxStdCaseNum": localStorage.maxStdCaseNum,
      "maxRanCaseNum": localStorage.maxRanCaseNum,
      "maxMemCaseNum": localStorage.maxMemCaseNum
    }
  }, function(response) {
    sent = true;
    console.log(response);
  });
}
chrome.webRequest.onCompleted.addListener(function(details) {
  if (details.tabId == -1) return;
  sent = false;
  var problemId = details.url.substring(details.url.indexOf('problemId=') + 10), userId = matrix.tabInfo[details.tabId].userId;
  matrix.getProblemInfoByProblemId(problemId, {"tabId": details.tabId, "wait": true, "problemId": problemId, "userId": userId}, function(err, body, otherInfo) {
    body = JSON.parse(body);
    var data = body.data, config = null;
    try {
      config = JSON.parse(data.config);
    } catch (e) {
      config = {};
    }
    otherInfo['limits'] = config.limits;
    otherInfo['grading'] = config.grading;
    matrix.getSubmissionsInfoByStartPosProblemIdUserId(0, otherInfo.problemId, otherInfo.userId, otherInfo, function(err, body, otherInfo) {
      body = JSON.parse(body);
      if (body.data) {
        if (body.data[0]) otherInfo['submitAt'] = body.data[0].submitAt;
        otherInfo['submissionsId'] = body.data.map(function(oneSubmission, index, self) {
          return oneSubmission.id;
        });
      }
      matrix.getLatestReportByProblemIdUserId(otherInfo.problemId, otherInfo.userId, otherInfo, sendReportObjectToFront);
    });
  });

}, {
  "urls": [
    matrix.rootUrl + '/one-problem?problemId=*'
  ]
});

chrome.webRequest.onCompleted.addListener(function(details) {
  if (details.tabId == -1 || !sent) return;
  matrix.getReportBySubmissionId(details.url.substring(details.url.indexOf('submissionId=') + 13),
    {"tabId": details.tabId, "wait": false}, sendReportObjectToFront);
}, {
  "urls": [
    matrix.rootUrl + '/one-submission?submissionId=*'
  ]
});
