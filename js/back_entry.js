var componentsPath = './components/';

var httpRequest = require(componentsPath + 'httpRequest.js');
var MatrixObject = require(componentsPath + 'MatrixObject.js');
var toReportObject = require(componentsPath + 'toReportObject.js');
var toSubmitAt = require(componentsPath + 'toSubmitAt.js');
var matrix = new MatrixObject('https://vmatrix.org.cn');

var ReportObjSent = false;

function sendReportObjectToFront(err, body, otherInfo) {
  var reportObject = toReportObject(body);
  reportObject.submitTime = otherInfo.submitTime;

  // console.log(reportObject);

  chrome.tabs.sendMessage(otherInfo.tabId, {
    "signal": 'start',
    "wait": otherInfo.wait,
    "reportObject": reportObject,
    "problemInfo": {
      "problemId": otherInfo.problemId,
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
    ReportObjSent = true;
    console.log(response);
  });
}
chrome.webRequest.onCompleted.addListener(function(details) {
  if (details.tabId == -1) return;
  ReportObjSent = false;
  if (/courses\/(\d*)\/assignments\/(\d{1,})\/submissions\/(\d{1,})$/.test(details.url) || /courses\/(\d*)\/assignments\/(\d{1,})\/submissions\/last\/feedback$/.test(details.url));
  else return;
  var courseId = RegExp['$1'], problemId = RegExp['$2'], submissionId = RegExp['$3'];
  matrix.getSubmissionsInfo({
      "courseId": courseId,
      "problemId": problemId
    }, {
      "tabId": details.tabId,
      "courseId": courseId,
      "problemId": problemId,
      "submissionId": submissionId
    }, function(err, body, otherInfo) {
        body = JSON.parse(body);
        if (body.data.length) {
          var isRequiringLatest = !body.data.some(function(oneSubmission, index, self) {
            if (otherInfo.submissionId == oneSubmission.sub_ca_id) {
              otherInfo['submitTime'] = toSubmitAt(oneSubmission.submit_at, true);
              return true;
            } else {
              return false;
            }
          });
          if (isRequiringLatest) {
            otherInfo['submitTime'] = toSubmitAt(body.data[0].submit_at, true);
          }
        }
        
        if (isNaN(parseInt(otherInfo.submissionId))) {
            matrix.getProblemInfo({
              "courseId": otherInfo.courseId,
              "problemId": otherInfo.problemId
            }, otherInfo, function(err, body, otherInfo) {
              body = JSON.parse(body);
              var config = body.data.ca.config;
              otherInfo['limits'] = config.limits;
              otherInfo['grading'] = config.grading;

              // console.log(otherInfo);

              matrix.getLatestReport({
                "courseId": otherInfo.courseId,
                "problemId": otherInfo.problemId
              }, otherInfo, sendReportObjectToFront);
          });
        } else {
            matrix.getSubmission({
              "courseId": otherInfo.courseId,
              "problemId": otherInfo.problemId,
              "submissionId": otherInfo.submissionId
            }, otherInfo, sendReportObjectToFront);
        }
      });


}, {
  "urls": [
    matrix.rootUrl + '/api/courses/*/assignments/*'
  ]
});



