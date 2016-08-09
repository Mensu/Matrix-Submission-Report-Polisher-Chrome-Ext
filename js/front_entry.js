var componentsPath = './components/';
var polisher = require(componentsPath + 'Polisher.js');
var customElements = require(componentsPath + 'CustomElements.js');
// var report = polisher.getReport();
// var reportObject = report.reportObject;
// var outputDiv = report.outputDiv;
var backToTop = require(componentsPath + 'backToTop.js');
// chrome.runtime.sendMessage(reportObject, function(response) {
//   if (outputDiv) {
//     var parent = outputDiv.parentNode.parentNode;
//     var newOutputDiv = polisher.genOutputDiv(response.body), oldOutputDiv = parent.children[0];
//     var switchBtn = customElements.createSwitchBtn(newOutputDiv, oldOutputDiv, {
//       "show": 'show polished report',
//       "hide": 'show original report'
//     });
//     parent.insertBefore(switchBtn, oldOutputDiv);
//     parent.insertBefore(newOutputDiv, oldOutputDiv);
//     newOutputDiv.sideNav.getInitialized(newOutputDiv.endSelector);
//   }
// });


// function httpRequest(url, callback) {
//   var xhr = new XMLHttpRequest();
//   xhr.open('get', url, true);
//   xhr.onreadystatechange = function() {
//     if (xhr.readyState == 4) return callback(false, this.response);
//   }
//   xhr.onerror = function() { return callback(true); }
//   xhr.send();
// }



var getPolishedReport = polisher.getPolishedReportDiv;

// var matrixRootUrl = document.baseURI.replace(/\/$/, '');
// function sendRequestToGetSubmission() {
//   return httpRequest(matrixRootUrl + '/one-submission?submissionId=' + this.submissionId, function(err, response) {});
// }

// function updateSubmissionsTab(submissionsTab, submissionsId) {
//   if (submissionsTab === null || !submissionsId) return;
//   var submissionRows = submissionsTab.querySelector('table tbody').childNodes;
//   var index = 0;
//   for (var i in submissionRows) {
//     if (submissionRows[i].nodeName == 'TR') {
//       submissionRows[i]['submissionId'] = submissionsId[index++];
//       submissionRows[i].removeEventListener("click", sendRequestToGetSubmission, false);
//       submissionRows[i].addEventListener("click", sendRequestToGetSubmission, false);
//     }
//   }
// }

chrome.runtime.onMessage.addListener(function(body, sender, callback) {
try {
  if (body.signal == 'start') {
    var toWait = (body.wait === undefined) ? true : body.wait;
    // setTimeout(function() {
    var reportObject = body.reportObject;
    var gradeTab = document.querySelector('.matrix-content[ng-show*="grade"] .matrix-content-wrapper')
    if (gradeTab === null) return callback("front couldn't find the grade Tab.");
    var oldPolished = gradeTab.querySelector('.polished-report-success'), oldSwitch = gradeTab.querySelector('.switch-btn');
    var oldReport = gradeTab.querySelector('.report-success:not(.polished-report-success)');
    if (body.problemInfo.limits) gradeTab['problemInfo'] = body.problemInfo;

    // var submissionsTab = document.querySelector('.grade + .submissions');
    // if (body.submissionsId) {
    //     updateSubmissionsTab(submissionsTab, body.submissionsId);
    //     if (body.problemInfo.problemId)
    //       
    // } else {
    //     if (gradeTab.problemInfo) {
    //         httpRequest(matrixRootUrl + '/problem-submissions?position=' + 0 + '&problemId=' + gradeTab.problemInfo.problemId + '&userId=' + gradeTab.problemInfo.userId, function(err, body) {
    //             body = JSON.parse(body);
    //             if (body.data) {
    //                 var submissionsId = body.data.map(function(oneSubmission, index, self) {
    //                   return oneSubmission.id;
    //                 });
    //                 updateSubmissionsTab(submissionsTab, submissionsId);
    //             }
    //         });
    //     }
    // }

    var newReport = getPolishedReport(reportObject, {
      "showCR": body.configs.showCR,
      "maxStdCaseNum": body.configs.maxStdCaseNum,
      "maxRanCaseNum": body.configs.maxRanCaseNum,
      "maxMemCaseNum": body.configs.maxMemCaseNum,
      "limits": gradeTab.problemInfo.limits,
      "totalPoints": gradeTab.problemInfo.totalPoints,
    });

    var switchBtn = customElements.createSwitchBtn(newReport, oldReport, {
      "show": 'show polished report',
      "hide": 'show original report'
    });
    gradeTab.insertBefore(switchBtn, oldReport);
    // gradeTab.insertBefore(newReport, oldReport);
    gradeTab.appendChild(newReport);
    if (newReport.sideNav) newReport.sideNav.getInitialized(newReport.endSelector, 'ui-view.ng-scope');

    // gradeTab.insertBefore(switchBtn, oldReport);
    // oldReport.classList.add('hiding');

    
    if (oldPolished) {
      if (oldPolished.sideNav) {
        oldPolished.sideNav.remove();
      }
      gradeTab.removeChild(oldPolished);
    }
    if (oldSwitch) gradeTab.removeChild(oldSwitch);
    if (!body.configs.autoPolish) switchBtn.click();
    
    return callback('front has got the reportObject and attached the polished report to the grade tab!');
    // }, 500 * toWait + 1);
  }
} catch (e) {
  callback('the following error occurred at front:\n\n' + e.stack);
  throw e;
}
});

