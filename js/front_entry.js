var componentsPath = './components/';
var polisher = require(componentsPath + 'polisher.js');
var createPolishedReportDiv = polisher.getPolishedReportDiv;
var customElements = require(componentsPath + 'elements/customElements.js');
document.body.appendChild(require(componentsPath + 'elements/backToTop.js'));

  // get the reportObject from the back,
  // use it to create polished report div and attach it to the page
chrome.runtime.onMessage.addListener(function(body, sender, callback) {
try {
  if (body.signal == 'start') {
    var reportObject = body.reportObject;
    var reportWrapper = document.querySelector('.course-assignment-report-content-wrapper')
    if (reportWrapper === null){
      return callback("front couldn't find the grade Tab.");
    }
    if (body.problemInfo) {
      reportWrapper['problemInfo'] = body.problemInfo;
    }
      // get div components
    var oldPolishedReport = reportWrapper.querySelector('.polished-report-success'),
        oldSwitchBtn = reportWrapper.querySelector('.switch-btn'),
        originalReport = reportWrapper.querySelector('.report-success:not(.polished-report-success)'),
        polishedReport = createPolishedReportDiv(reportObject, {
            "showCR": body.configs.showCR,
            "maxStdCaseNum": body.configs.maxStdCaseNum,
            "maxRanCaseNum": body.configs.maxRanCaseNum,
            "maxMemCaseNum": body.configs.maxMemCaseNum,
            "limits": reportWrapper.problemInfo.limits,
            "totalPoints": reportWrapper.problemInfo.totalPoints,
          }),
        switchBtn = customElements.createSwitchBtn(polishedReport, originalReport, {
            "show": 'show polished report',
            "hide": 'show original report'
          });

      // insert newly created div and perform initialization
    reportWrapper.insertBefore(switchBtn, originalReport);
    reportWrapper.appendChild(polishedReport);
    if (polishedReport.sideNav) {
      polishedReport.sideNav.init(polishedReport.endSelector, 'ui-view.ng-scope');
    }
    
      // rid the wrapper of the old divs
    if (oldPolishedReport) {
      if (oldPolishedReport.sideNav) oldPolishedReport.sideNav.remove();
      reportWrapper.removeChild(oldPolishedReport);
    }
    if (oldSwitchBtn) reportWrapper.removeChild(oldSwitchBtn);

      // auto polish
    if (!body.configs.autoPolish) switchBtn.click();
    
    return callback('front has got the reportObject and attached the polished report to the grade tab!');
  }
} catch (e) {
  callback('the following error occurred at front:\n\n' + e.stack);
  throw e;
}
});

