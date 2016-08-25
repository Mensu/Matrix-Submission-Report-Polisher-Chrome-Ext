var componentsPath = './components/';

var MatrixObject = require(componentsPath + 'MatrixObject.js');
var ReportObject = require(componentsPath + 'ReportObject.js');
var toSubmitAt = require(componentsPath + 'lib/toSubmitAt.js');

var matrix = new MatrixObject('https://vmatrix.org.cn');
require(componentsPath + 'checkIsOnline.js')(matrix);


  // listen for '/api/courses/*/assignments/*/submissions/*' or '/api/courses/*/assignments/*/submissions/last/feedback' 


function sendReportObjToFront(err, body, otherInfo) {
  var reportObject = new ReportObject(body);
  reportObject.submitTime = otherInfo.submitTime;

  // console.log(reportObject);

  chrome.tabs.sendMessage(otherInfo.tabId, {
    "signal": 'start',
    "reportObject": reportObject,
    "problemInfo": otherInfo.problemInfo,
    "configs": {
      "showCR": localStorage.showCR,
      "autoPolish": localStorage.autoPolish,
      "maxStdCaseNum": localStorage.maxStdCaseNum,
      "maxRanCaseNum": localStorage.maxRanCaseNum,
      "maxMemCaseNum": localStorage.maxMemCaseNum
    }
  }, function(response) {
    console.log(response);
  });

}
  // listen for '/api/courses/*/assignments/*/submissions/*' or '/api/courses/*/assignments/*/submissions/last/feedback' 
chrome.webRequest.onCompleted.addListener(function(details) {
  var requiringLatest = false;
  if (details.tabId == -1
    || (!/courses\/(\d*)\/assignments\/(\d{1,})\/submissions\/(\d{1,})$/.test(details.url)
      && !(requiringLatest = /courses\/(\d*)\/assignments\/(\d{1,})\/submissions\/last\/feedback$/.test(details.url)) )) return;

  var courseId = RegExp['$1'], problemId = RegExp['$2'], submissionId = RegExp['$3'];
  var param = {
      "tabId": details.tabId,
      "courseId": courseId,
      "problemId": problemId,
      "submissionId": submissionId
    };
  matrix.getSubmissionsInfo(param, param, function(err, body, otherInfo) {
      body = JSON.parse(body);

        // get submission time
      if (body.data.length) {
          if (requiringLatest) {
              otherInfo['submitTime'] = toSubmitAt(body.data[0].submit_at, true);
          } else {
              body.data.some(function(oneSubmission, index, self) {
                  if (otherInfo.submissionId == oneSubmission.sub_ca_id) {
                    otherInfo['submitTime'] = toSubmitAt(oneSubmission.submit_at, true);
                    return true;
                  } else {
                    return false;
                  }
              });
          }
      }
      
      if (requiringLatest) {
          // get limits and total points of each section 
        matrix.getProblemInfo(otherInfo, otherInfo, function(err, body, otherInfo) {
          body = JSON.parse(body);
          var config = body.data.ca.config;
          otherInfo['problemInfo'] = config;
          otherInfo.problemInfo['totalPoints'] = config.grading;

          // console.log(otherInfo);

            // get and send the latest report to the front
          matrix.getLatestReport(otherInfo, otherInfo, sendReportObjToFront);
        });
      } else {
          // get and send the specific report to the front
        matrix.getSubmission(otherInfo, otherInfo, sendReportObjToFront);
      }
    });

}, {
  "urls": [
    matrix.rootUrl + '/api/courses/*/assignments/*/submissions/*'
  ]
});





