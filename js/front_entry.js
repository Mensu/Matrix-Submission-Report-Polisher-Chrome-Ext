var componentsPath = './components/';
var polisher = require(componentsPath + 'polisher.js');
var FilesCmp = require(componentsPath + 'FilesCmp.js');
var createPolishedReportDiv = polisher.getPolishedReportDiv;
var customElements = require(componentsPath + 'elements/customElements.js');
var StudentAnswerArea = require(componentsPath + 'elements/StudentAnswerArea.js');
document.body.appendChild(require(componentsPath + 'elements/backToTop.js'));

  // get the reportObject from the back,
  // use it to create polished report div and attach it to the page
chrome.runtime.onMessage.addListener(function(body, sender, callback) {
try {
  if (body.signal == 'start') {
    var reportObject = body.reportObject;
    var reportWrapper = document.querySelector('.course-assignment-report-content-wrapper');
    var matrixSecondBar = document.querySelector('#matrix-second-bar ul');
    if (reportWrapper === null) {
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
    
    var sideNav = polishedReport.sideNav;
    if (sideNav) {
      sideNav.init(polishedReport.endSelector, 'ui-view.ng-scope');
      var gradeNavTab = matrixSecondBar.querySelector('li[ng-click*="grade"]');
      gradeNavTab['sideNav'] = sideNav;
      if (!gradeNavTab.sideNavFixListenerAdded) {
        gradeNavTab.addEventListener('click', function() {
          this.sideNav.fix();
        }, false);
        gradeNavTab['sideNavFixListenerAdded'] = true;
      }
        
    }
    
      // rid the wrapper of the old divs
    if (oldPolishedReport) {
      if (oldPolishedReport.sideNav) oldPolishedReport.sideNav.remove();
      reportWrapper.removeChild(oldPolishedReport);
    }
    if (oldSwitchBtn) reportWrapper.removeChild(oldSwitchBtn);

      // auto polish
    if (!body.configs.autoPolish) switchBtn.click();
    
      // files comparison
    if (body.submissionsList && body.submissionsList.length > 1) {
      var tabsContentWrapper = document.querySelector('.course-assignment-programming-wrapper');
      var element = tabsContentWrapper.querySelector('#files-cmp-tab');
      if (element) {
        if (body.problemInfo) {
          element.filesCmpTab.updateChoicesTable(body.submissionsList);
        }
      } else {
        var filesCmpTab = new FilesCmp.FilesCmpTab(body.submissionsList);
        var element = filesCmpTab.tab;
        element.id = 'files-cmp-tab';
        tabsContentWrapper.appendChild(element);

        matrixSecondBar.appendChild(FilesCmp.createSecondBarLi('Files Comparison', element));
      }

    }
    return callback('front has got the reportObject and attached the polished report to the grade tab!');
  } else if (body.signal == 'libReport') {
    var reportObject = body.reportObject;
    var reportWrapper = document.querySelector('.modal-overlay .modal-data.ERROR');
    if (reportWrapper === null) {
      return callback("front couldn't find the library report container.");
    }
    if (body.problemInfo) {
      reportWrapper['problemInfo'] = body.problemInfo;
    }
      // get div components
    var originalReport = reportWrapper.querySelector('matrix-report'),
        polishedReport = createPolishedReportDiv(reportObject, {
            "showCR": body.configs.showCR,
            "maxStdCaseNum": body.configs.maxStdCaseNum,
            "maxRanCaseNum": body.configs.maxRanCaseNum,
            "maxMemCaseNum": body.configs.maxMemCaseNum,
            "noValidationLogin": body.configs.noValidationLogin,
            "limits": reportWrapper.problemInfo.limits,
            "totalPoints": reportWrapper.problemInfo.totalPoints,
          });

      // insert newly created div and perform initialization
    reportWrapper.insertBefore(polishedReport, originalReport);
    reportWrapper.removeChild(originalReport);
    var sideNav = polishedReport.sideNav;
    if (sideNav) {
      polishedReport.removeChild(sideNav.getNode());
    }
    
    return callback('front has got the reportObject and attached the polished report to lib!');
  } else if (body.signal == 'noValidationLogin') {
    (function removeLoginValidation() {
      var originalLogin = document.querySelector('input[value="Log in"]');
      if (!originalLogin) return setTimeout(removeLoginValidation, 1000);
      var noValidationLogin = document.createElement('input');
      var usernameInput = document.querySelector('#username');
      var passwordInput = document.querySelector('#password');
      if (usernameInput.value.length) {
        passwordInput.focus();
      } else {
        usernameInput.focus();
      }
      noValidationLogin.type = 'button';
      noValidationLogin.value = 'Log in';
      noValidationLogin.classList.add('no-validation-login');
      var form = originalLogin.parentNode;
      form.insertBefore(noValidationLogin, originalLogin);
      form.removeChild(originalLogin);
      form.addEventListener('keydown', function(event) {
        if (event.key == 'Enter') noValidationLogin.click();
      });
      noValidationLogin.addEventListener('click', function() {
        document.activeElement.blur();
        var username = usernameInput.value;
        chrome.runtime.sendMessage({
          "signal": 'loginWithoutValidation',
          "param": {
            "username": usernameInput.value,
            "password": passwordInput.value
          }
        }, function(response) {
          var status = response.status;
          if (status == 'OK') {
            window.location.replace(window.location.origin + '/#/' + response.data.username);
          } else {
            var text = '登录失败：';
            var textMap = {
              "USER_NOT_FOUND": '查无此人。请仔细核对用户名',
              "WRONG_PASSWORD": '密码不对。请仔细核对您的密码并再试一次',
              "IP_INVALID": '您当前的IP被禁止登陆。请去指定的平台进行登陆'
            }
            if (textMap[status] === undefined) {
              text += '发生了插件没想到的错误。\n\n代码：' + status + '\n信息：' + response.msg;
            } else {
              text += textMap[status];
            }
            matrixAlert = polisher.createMatrixAlert(text);
            document.querySelector('#matrix-main').appendChild(matrixAlert);
            var okButton = matrixAlert.button;
            okButton.tabIndex = -1;
            okButton.focus();
            okButton.addEventListener('keydown', clickOk, false);
            function clickOk(event) {
              if (event.key != 'Enter') return;
              if (status == 'USER_NOT_FOUND') {
                usernameInput.focus(), usernameInput.select();
              } else if (status == 'WRONG_PASSWORD') {
                passwordInput.focus(), passwordInput.select();              
              }
              okButton.tabIndex = undefined;
              okButton.click();
            }
          }
        });
      }, false);
      return callback('front has removed validation for login!');
    })();
  } else if (body.signal == 'startStudentSubmission') {
    var reportObject = body.reportObject;
    var reportWrapper = document.querySelector('.report-container');
    var matrixSecondBar = document.querySelector('.choice-tab ul');
    if (reportWrapper === null) {
      return callback("front couldn't find the grade Tab.");
    }
    if (body.problemInfo) {
      reportWrapper['problemInfo'] = body.problemInfo;
    }
    var selectedStudentId = matrixSecondBar.querySelector('li.choice-tab-active').title;
    
      // get div components
    var oldPolishedReport = reportWrapper.querySelector('.polished-report-success[title="' + selectedStudentId + '"]'),
        oldSwitchBtn = reportWrapper.querySelector('.switch-btn:not(.hidden)'),
        otherStudentReport = reportWrapper.querySelector('.polished-report-success:not(.hidden)'),
        gradeWrapper = reportWrapper.parentNode.parentNode.querySelector('.grade-wrapper');
        originalReport = reportWrapper.querySelector('#matrixui-programming-report');

    var polishedReport = createPolishedReportDiv(reportObject, {
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

    var studentAnswerArea = document.querySelector('.answer-wrapper.clang-formatted');
    var formattedCodes = null;
    var studentAnswerAreaObj = null;
    if (reportObject['google style']) {
      formattedCodes = reportObject['google style'].formatted;
    }
    if (studentAnswerArea) {
      if (!formattedCodes) {
        formattedCodes = {
          "Server Error.c": 'Google Style Server Error'
        }
      }
      studentAnswerAreaObj = studentAnswerArea.studentAnswerAreaObj;
      studentAnswerAreaObj.update(formattedCodes);
    } else if (formattedCodes) {
      var supportedFiles = {};
      reportWrapper.problemInfo.supportedFiles.forEach(function(one) {
        supportedFiles[one.name] = formattedCodes[one.name];
        formattedCodes[one.name] = undefined;
      });
      studentAnswerAreaObj = new StudentAnswerArea(formattedCodes, supportedFiles, 'cpp');
      studentAnswerArea = studentAnswerAreaObj.getNode();
      gradeWrapper.parentNode.insertBefore(studentAnswerArea, gradeWrapper);
    }

    polishedReport['studentAnswerAreaObj'] = studentAnswerAreaObj;
    polishedReport['formattedCodes'] = formattedCodes;

    gradeWrapper.classList.add('hidden');
    switchBtn['gradeWrapper'] = gradeWrapper;
    switchBtn.addEventListener('click', showOrginalGrade, false);

      // insert newly created div and perform initialization
    reportWrapper.insertBefore(switchBtn, reportWrapper.firstChild);

    polishedReport['title'] = selectedStudentId;
    polishedReport['switchBtn'] = switchBtn;
    reportWrapper.insertBefore(polishedReport, reportWrapper.querySelector('div'));
    
    var sideNav = polishedReport.sideNav;
    if (sideNav) {
      sideNav.init(polishedReport.endSelector, 'ui-view.ng-scope');
    }
    
      // rid the wrapper of the old divs
    if (oldPolishedReport) {
      if (oldPolishedReport.sideNav) oldPolishedReport.sideNav.remove();
      reportWrapper.removeChild(oldPolishedReport);
    }
    if (otherStudentReport) {
      otherStudentReport.classList.add('hidden');
    }
    if (oldSwitchBtn) {
      oldSwitchBtn.classList.add('hidden');
    }

      // auto polish
    if (!body.configs.autoPolish) switchBtn.click();
    
      // files comparison
    if (body.submissionsList && body.submissionsList.length) {
      var tabsContentWrapper = document.querySelector('.submission-container');
      var element = tabsContentWrapper.querySelector('#files-cmp-tab');
      if (element) {
        if (body.submissionsList[0].sub_ca_id != element.latestSubmissionId) {
          element.filesCmpTab.updateChoicesTable(body.submissionsList);
          element['latestSubmissionId'] = body.submissionsList[0].sub_ca_id;
          element.fileCmpTab.fix();
        }
        
      } else {
        var filesCmpTab = new FilesCmp.FilesCmpTab(body.submissionsList);
        var element = filesCmpTab.tab;
        element.id = 'files-cmp-tab';
        element['latestSubmissionId'] = body.submissionsList[0].sub_ca_id;
        tabsContentWrapper.appendChild(element);

        var fileCmpTab = FilesCmp.createSecondBarLi('Files Comparison', element, true);
        element['fileCmpTab'] = fileCmpTab;
        matrixSecondBar.appendChild(fileCmpTab);

        var originalFix = fileCmpTab.fix;
        fileCmpTab['originalFix'] = originalFix;
        fileCmpTab.fix = addListenersForTabs;
        fileCmpTab.fix();
      }

    }
    return callback('front has got the reportObject and attached the polished report to the grade tab!');
  }
} catch (e) {
  callback('the following error occurred at front:\n\n' + e.stack);
  throw e;
}
});

function showOrginalGrade() {
  var button = this;
  if (button.elementIsHidden) {
    button.gradeWrapper.classList.remove('hidden');
  } else {
    button.gradeWrapper.classList.add('hidden');
  }
}
function clickConnectedTab() {
  this.connectedTab.click();
}
function afterClose(event) {
  event.stopPropagation();
  var curLi = this.parentNode;
  var oldReport = curLi.hideElement.parentNode.querySelector('.polished-report-success[title*="' + curLi.title + '"]');
  if (oldReport) {
    oldReport.classList.add('hidden');
    oldReport.switchBtn.classList.add('hidden');
  }

  var liList = curLi.parentUl.querySelectorAll('li');
  if (liList.length == 2 && ~liList[1].className.indexOf('files-cmp-li')) {
    liList[0].click();
  } else {
    setTimeout(function() {
      var selectedTab = curLi.parentUl.querySelector('.choice-tab-active');
      if (selectedTab) selectedTab.click();
      else if (curLi.prevLi.isSameNode(liList[0])) curLi.nextLi.click();
      else curLi.prevLi.click();
    }, 500);
  }

}
function switchReport() {
  var username = this.title;
  if (!username) return;
  var wrapper = this.hideElement.parentNode;
  var newReport = wrapper.querySelector('.polished-report-success[title="' + username + '"]');
  var oldReport = wrapper.querySelector('.polished-report-success:not(.hidden)');
  var oldSwitchBtn = wrapper.querySelector('.switch-btn:not(.hidden):not(.files-cmp-switch-btn)');
  if (newReport) {
    if (oldReport == null || !newReport.isSameNode(oldReport)) {
      if (oldSwitchBtn) {
        oldSwitchBtn.classList.add('hidden');
      }
      if (oldReport) {
        oldReport.classList.add('hidden');
      }
      
      newReport.switchBtn.classList.remove('hidden');
      newReport.switchBtn.click(), newReport.switchBtn.click();

      var newReportParent = newReport.parentNode;
      var insertPoint = newReportParent.querySelector('.switch-btn:last-of-type');
      if (insertPoint) insertPoint = insertPoint.nextElementSibling;
      if (null === insertPoint) insertPoint = newReportParent.firstChild;
      newReportParent.insertBefore(newReport, insertPoint);
      this.parentUl.querySelector('.files-cmp-li').fix();
    }
    newReport.sideNav.fix();
    newReport.studentAnswerAreaObj.update(newReport.formattedCodes);
  }
}
function addListenersForTabs() {
  this.originalFix();
  var liList = this.parentNode.querySelectorAll('li');
  var allBlockLiList = document.querySelectorAll('#all-block .tab-list li');
  for (var i = 0, length = liList.length; i != length; ++i) {
    var oneLi = liList[i];
    var oneAllBlockLi = allBlockLiList[i];
    oneLi['prevLi'] = liList[i - 1];
    oneLi['nextLi'] = liList[i + 1];
    oneLi.removeEventListener('click', switchReport, false);
    oneLi.addEventListener('click', switchReport, false);
    if (allBlockLiList[i]) {
      oneAllBlockLi['connectedTab'] = liList[i + 1];
      oneAllBlockLi.removeEventListener('click', clickConnectedTab, false);
      oneAllBlockLi.addEventListener('click', clickConnectedTab, false);
    }

    var close = oneLi.querySelector('i');
    if (close) {
      close.removeEventListener('click', afterClose, false);
      close.addEventListener('click', afterClose, false);
    }
  }
}