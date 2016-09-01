var componentsPath = './components/';

var MatrixObject = require(componentsPath + 'MatrixObject.js');
var ReportObject = require(componentsPath + 'ReportObject.js');
var toSubmitAt = require(componentsPath + 'lib/toSubmitAt.js');
var FilesDiff = require(componentsPath + 'FilesDiff.js');

var matrix = new MatrixObject('https://vmatrix.org.cn');
require(componentsPath + 'checkIsOnline.js')(matrix);


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
  
  matrix.getSubmissionsList(param)
    .then(function(body) {
        param['submissionsList'] = body.data;
        if (body.data == null || 0 == body.data.length) {
          param['submitTime'] = null;
          return;
        }
        param['submitTime'] = undefined;
            // get submission time
        if (requiringLatest) {
            param['submitTime'] = toSubmitAt(body.data[0].submit_at, true);
        } else {
            body.data.some(function(oneSubmission, index, self) {
                if (param.submissionId == oneSubmission.sub_ca_id) {
                  param['submitTime'] = toSubmitAt(oneSubmission.submit_at, true);
                  return true;
                } else {
                  return false;
                }
            });
        }
    }, function(err) {
        console.log('Error: Failed to get submissions list');
        console.log('parameters: ', param);
    })
    .then(function() {
        function sendReportObjToFront(body) {
          var reportObject = new ReportObject(body);
          if (reportObject === null) return;
          reportObject.submitTime = param.submitTime;
          // console.log(reportObject);
          chrome.tabs.sendMessage(param.tabId, {
            "signal": 'start',
            "reportObject": reportObject,
            "problemInfo": param.problemInfo,
            "submissionsList": param.submissionsList,
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
        
        if (!requiringLatest) {
              // get and send the specific report to the front
            return matrix.getSubmission(param)
              .then(sendReportObjToFront, function(err) {
                  console.log('Error: Failed to get specific report. Stopped.');
              });
        }

          // get limits and total points of each section 
        matrix.getProblemInfo(param).then(function(body) {
              if (body.data == null) return Promise.reject();
              var config = body.data.ca.config;
              param['problemInfo'] = config;
              param.problemInfo['totalPoints'] = config.grading;
          }, function(err) {
              console.log('Error: Failed to get problem info');
              console.log('parameters: ', param);
              param['problemInfo'] = {
                "limits": {},
                "totalPoints": {"google tests detail": {}}
              };
          }).then(function() {
                // get and send the latest report to the front
              return matrix.getLatestReport(param)
                .then(sendReportObjToFront, function(err) {
                    console.log('Error: Failed to get latest report. Stopped.');
                });
          });
    });
    
    // function(err, body, otherInfo) {
    //   if (err) {
    //     console.log('Error: Failed to get submissions list');
    //     console.log('parameters: ', otherInfo);
    //   } else if (body.data.length) {
    //         // get submission time
    //       if (requiringLatest) {
    //           otherInfo['submitTime'] = toSubmitAt(body.data[0].submit_at, true);
    //       } else {
    //           body.data.some(function(oneSubmission, index, self) {
    //               if (otherInfo.submissionId == oneSubmission.sub_ca_id) {
    //                 otherInfo['submitTime'] = toSubmitAt(oneSubmission.submit_at, true);
    //                 return true;
    //               } else {
    //                 return false;
    //               }
    //           });
    //       }
    //   }

    //   if (requiringLatest) {
    //       // get limits and total points of each section 
    //     matrix.getProblemInfo(otherInfo, otherInfo, function(err, body, otherInfo) {
    //       if (err) {
    //         console.log('Error: Failed to get problem info');
    //         console.log('parameters: ', otherInfo);
    //         otherInfo['problemInfo'] = {
    //           "limits": {},
    //           "totalPoints": {"google tests detail": {}}
    //         };
    //       } else {
    //         var config = body.data.ca.config;
    //         otherInfo['problemInfo'] = config;
    //         otherInfo.problemInfo['totalPoints'] = config.grading;
    //       }

    //         // get and send the latest report to the front
    //       matrix.getLatestReport(otherInfo, otherInfo, sendReportObjToFront);
    //     });
    //   } else {
    //       // get and send the specific report to the front
    //     matrix.getSubmission(otherInfo, otherInfo, sendReportObjToFront);
    //   }
    // });

}, {
  "urls": [
    matrix.rootUrl + 'api/courses/*/assignments/*/submissions/*'
  ]
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.signal != 'filesDiff') return;
  var oldFiles = null;
  matrix.getSubmission({
    "courseId": message.courseId,
    "problemId": message.problemId,
    "submissionId": message.oldId
  }).then(function(body) {
      if (body.data == null) return Promise.reject();
      oldFiles = body.data.answers;
      return matrix.getSubmission({
        "courseId": message.courseId,
        "problemId": message.problemId,
        "submissionId": message.newId
      });
  }).then(function(body) {
      if (body.data == null) return Promise.reject();
      var filesDiff = new FilesDiff(oldFiles, body.data.answers);
      sendResponse({"status": 'OK', "filesDiff": filesDiff});
  }, function(err) {
      console.log('Error: Failed to get files to compare');
      console.log('parameters: ', message);
      sendResponse({"status": 'BAD'});
  });
  return true;
});



