const polisher = require('./components/polisher.js');
const FilesCmp = require('./components/FilesCmp.js');
const customElements = require('./components/elements/customElements.js');
const StudentAnswerArea = require('./components/elements/StudentAnswerArea.js');
const genDriver = require('./components/lib/genDriver');
const setTimeoutAsync = require('./components/lib/setTimeoutAsync');
// document.body.appendChild(require('./components/elements/backToTop.js'));

const createPolishedReportDiv = polisher.getPolishedReportDiv;

// get the reportObject from the back,
// use it to create polished report div and attach it to the page
chrome.runtime.onMessage.addListener((body, sender, callback) => {
  try {
    switch (body.signal) {
      case 'start':
        return polishMainReport(body, sender, callback);
      case 'libReport':
        return polishLibReport(body, sender, callback);
      // case 'noValidationLogin':
      //   return removeValidationLogin(body, sender, callback);
      case 'startStudentSubmission':
        return polishStudentReport(body, sender, callback);
      case 'shixun':
        return shixun(body, sender, callback);
      default:
        break;
    }
  } catch (e) {
    callback(`the following error occurred at front:\n\n${e.stack}`);
    throw e;
  }
  return true;
});

function polishMainReport(body, sender, callback) {
  if (document.querySelector('.check-submission-container')) {
    return polishStudentReport(body, sender, callback);
  }
  const { reportObject } = body;
  const reportWrapper = document.querySelector('.matrix-report-container matrix-report');
  const matrixSecondBar = document.querySelector('assignment-program .tab-heading-container');
  if (reportWrapper === null) {
    return callback("front couldn't find the grade Tab.");
  }
  if (body.problemInfo) {
    reportWrapper['problemInfo'] = body.problemInfo;
  }
  // get div components
  const oldPolishedReport = reportWrapper.querySelector('.polished-report-success');
  const oldSwitchBtn = reportWrapper.querySelector('.switch-btn');
  const originalReport = reportWrapper.querySelector('#matrix-programming-report:not(.polished-ver)');
  const polishedReport = createPolishedReportDiv(reportObject, {
    "showCR": body.configs.showCR,
    "maxStdCaseNum": body.configs.maxStdCaseNum,
    "maxRanCaseNum": body.configs.maxRanCaseNum,
    "maxMemCaseNum": body.configs.maxMemCaseNum,
    "limits": reportWrapper.problemInfo.limits,
    "totalPoints": reportWrapper.problemInfo.totalPoints,
  });
  const switchBtn = customElements.createSwitchBtn(polishedReport, originalReport, {
    "show": 'show polished report',
    "hide": 'show original report'
  });

    // insert newly created div and perform initialization
  reportWrapper.insertBefore(switchBtn, originalReport);
  reportWrapper.appendChild(polishedReport);

  const { sideNav } = polishedReport;
  if (sideNav) {
    sideNav.init(polishedReport.endSelector, 'matrix-main .matrix-content ng-component');
    const gradeNavTab = matrixSecondBar.querySelector('tab-title:nth-of-type(3) .tab-title');
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
    const tabsContentWrapper = document.querySelector('assignment-program .tab-content-container');
    const element = tabsContentWrapper.querySelector('#files-cmp-tab');
    if (element) {
      if (body.problemInfo) {
        element.filesCmpTab.updateChoicesTable(body.submissionsList);
      }
    } else {
      const filesCmpTab = new FilesCmp.FilesCmpTab(body.submissionsList);
      const element = filesCmpTab.tab;
      element.id = 'files-cmp-tab';
      tabsContentWrapper.appendChild(element);

      matrixSecondBar.appendChild(FilesCmp.createSecondBarLi('Files Comparison', element));
    }
  }
  return callback('front has got the reportObject and attached the polished report to the grade tab!');
}

function polishLibReport(body, sender, callback) {
  const reportObject = body.reportObject;
  const reportWrapper = document.querySelector('.modal-overlay .modal-data.ERROR');
  if (reportWrapper === null) {
    return callback("front couldn't find the library report container.");
  }
  if (body.problemInfo) {
    reportWrapper['problemInfo'] = body.problemInfo;
  }
  // get div components
  const originalReport = reportWrapper.querySelector('#matrix-programming-report:not(.polished-ver)');
  const polishedReport = createPolishedReportDiv(reportObject, {
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
  const { sideNav } = polishedReport;
  if (sideNav) {
    polishedReport.removeChild(sideNav.getNode());
  }

  return callback('front has got the reportObject and attached the polished report to lib!');
}

function removeValidationLogin(body, sender, callback) {
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
    const form = originalLogin.parentNode;
    form.insertBefore(noValidationLogin, originalLogin);
    originalLogin.classList.add('hidden');
    form.removeChild(originalLogin);
    if (!form.noValidationLogin) {
      form.addEventListener('keydown', (event) => {
        if ((event.key || event.keyIdentifier) === 'Enter') this.noValidationLogin.click();
      }, false);
    }
    form['noValidationLogin'] = noValidationLogin;
    noValidationLogin.addEventListener('click', () => {
      document.activeElement.blur();
      const username = usernameInput.value;
      const param = {
        "username": usernameInput.value,
        "password": passwordInput.value
      };
      chrome.runtime.sendMessage({
        "signal": 'loginWithoutValidation',
        "param": param
      }, (body) => {
        const status = body.status;
        if (status === 'OK') {
          if (body.data && body.data.is_valid) {
            window.location.assign(window.location.origin + '/#!/' + body.data.username);
          } else {
            form.appendChild(originalLogin);
            originalLogin.click();
          }
        } else {
          let text = '登录失败：';
          const textMap = {
            "USER_NOT_FOUND": '查无此人。请仔细核对用户名',
            "WRONG_PASSWORD": '密码不对。请仔细核对您的密码并再试一次',
            "IP_INVALID": '您当前的IP被禁止登陆。请去指定的平台进行登陆'
          };
          if (textMap[status] === undefined) {
            text += '发生了插件没想到的错误。\n\n代码：' + status + '\n信息：' + body.msg;
          } else {
            text += textMap[status];
          }
          const matrixAlert = polisher.createMatrixAlert(text);
          document.querySelector('#matrix-main').appendChild(matrixAlert);
          const okButton = matrixAlert.button;
          okButton.tabIndex = -1;     // 使div能和input一样获得焦点
          okButton.focus();           // button获得焦点
          okButton.addEventListener('keydown', (event) => {
            if ((event.key || event.keyIdentifier) !== 'Enter') return;
            this.click();             // 触发下面的click事件，即clickOk函数
          }, false);
          okButton.addEventListener('click', clickOk, false);
          function clickOk(event) {
            // 根据错误信息，把焦点移动到适当的input并全选，方便用户修改
            if (status == 'USER_NOT_FOUND') {
              usernameInput.focus(), usernameInput.select();
            } else if (status == 'WRONG_PASSWORD') {
              passwordInput.focus(), passwordInput.select();
            }
            okButton.tabIndex = undefined;   // 还原
            okButton.closeMe();              // 移除Alert
          }
        }
      });
    }, false);
    return callback('front has removed validation for login!');
  }());
}

function shixun(body, sender, callback) {
  return genDriver(function *() {
    const { asgns } = body;
    let shixunQuery = document.querySelector('.shixun-query');
    if (shixunQuery) return;
    const studentIdInput = document.createElement('input');
    const asgnIdSelect = document.createElement('select');
    const queryBtn = document.createElement('input');
    queryBtn.type = 'button';
    queryBtn.value = '下载该学生提交';
    for (const { ea_id, title } of asgns) {
      const option = document.createElement('option');
      option.value = ea_id;
      option.textContent = title;
      asgnIdSelect.appendChild(option);
    }
    asgnIdSelect.selectedIndex = asgns.length - 1;
    shixunQuery = document.createElement('div');
    shixunQuery.classList.add('shixun-query');
    shixunQuery.appendChild(studentIdInput);
    shixunQuery.appendChild(asgnIdSelect);
    shixunQuery.appendChild(queryBtn);
    let home = null;
    while (home === null) {
      yield setTimeoutAsync(500);
      home = document.querySelector('#matrix-home');
    }
    home.insertBefore(shixunQuery, home.firstElementChild);
    queryBtn.addEventListener('click', () => {
      const { value } = studentIdInput;
      if (value.length === 0) return;
      chrome.runtime.sendMessage({
        signal: 'shixun',
        studentId: studentIdInput.value,
        asgnId: asgnIdSelect.value,
      }, ({ success, msg }) => {
        if (success === false) {
          window.alert(msg);
          return;
        }
        window.open(msg, '_blank');
      });
    });
    studentIdInput.addEventListener('keydown', (event) => {
      if ((event.key || event.keyIdentifier) === 'Enter') queryBtn.click();
    });
  });
}

function polishStudentReport(body, sender, callback) {
  return genDriver(function *() {
    const { reportObject } = body;
    const unmodifiedOriginalReport = document.querySelector('#matrix-programming-report:not(.polished-ver):not(.original-report)');
    const matrixSecondBar = document.querySelector('.tab-container ul');
    let reportsContainer = document.querySelector('.reports-container');
    if (unmodifiedOriginalReport === null) {
      if (document.querySelector('.original-report') === null) {
        return callback("front couldn't find #matrix-programming-report:not(.original-report):not(.polished-ver) or .original-report");
      }  // else: original report was modified. just go on
    } else {
      unmodifiedOriginalReport.classList.add('original-report');
      reportsContainer = document.createElement('div');
      unmodifiedOriginalReport.parentNode.insertBefore(reportsContainer, unmodifiedOriginalReport);
      reportsContainer.outerHTML = '<div class="reports-container"><div class="last-div"></div></div>';
      reportsContainer = unmodifiedOriginalReport.parentNode.querySelector('.reports-container');
      reportsContainer.insertBefore(unmodifiedOriginalReport, reportsContainer.firstChild);
    }

    if (body.problemInfo) {
      reportsContainer['problemInfo'] = body.problemInfo;
    }

    let choiceTab = null;
    while (!choiceTab) {
      yield setTimeoutAsync(1000);
      choiceTab = matrixSecondBar.querySelector('li.nav-item.active');
    }
    let selectedStudentId = choiceTab.title;
    if (selectedStudentId.length === 0) {
      [selectedStudentId] = /\S+/.exec(choiceTab.innerText) || [];
    }

    // get div components
    const oldPolishedReport = reportsContainer.querySelector(`.polished-report-success[title="${selectedStudentId}"]`);
    const oldSwitchBtn = reportsContainer.querySelector('.switch-btn:not(.hidden)');
    const otherStudentReport = reportsContainer.querySelector('.polished-report-success:not(.hidden)');
    const gradeWrapper = reportsContainer.parentNode.querySelector('#matrix-programming-report.original-report .report-section:first-child');
    const originalReport = reportsContainer.parentNode.querySelector('.original-report');

    const polishedReport = createPolishedReportDiv(reportObject, {
      "showCR": body.configs.showCR,
      "maxStdCaseNum": body.configs.maxStdCaseNum,
      "maxRanCaseNum": body.configs.maxRanCaseNum,
      "maxMemCaseNum": body.configs.maxMemCaseNum,
      "limits": reportsContainer.problemInfo.limits,
      "totalPoints": reportsContainer.problemInfo.totalPoints,
    });
    const switchBtn = customElements.createSwitchBtn(polishedReport, originalReport, {
      "show": 'show polished report',
      "hide": 'show original report'
    });

    let studentAnswerArea = document.querySelector('.answer-wrapper.clang-formatted');
    let formattedCodes = null;
    let studentAnswerAreaObj = null;
    if (reportObject['google style']) {
      formattedCodes = reportObject['google style'].formatted;
    }
    if (studentAnswerArea) {
      if (!formattedCodes) {
        formattedCodes = {
          "Server Error.c": 'Google Style Server Error',
        };
      }
      studentAnswerAreaObj = studentAnswerArea.studentAnswerAreaObj;
      studentAnswerAreaObj.update(formattedCodes);
    } else if (formattedCodes) {
      const supportFiles = {};
      reportsContainer.problemInfo.supportFiles.forEach((one) => {
        supportFiles[one.name] = formattedCodes[one.name];
        formattedCodes[one.name] = undefined;
      });
      studentAnswerAreaObj = new StudentAnswerArea(formattedCodes, supportFiles, 'cpp');
      studentAnswerArea = studentAnswerAreaObj.getNode();
      reportsContainer.parentNode.insertBefore(studentAnswerArea, reportsContainer);
    }

    polishedReport['studentAnswerAreaObj'] = studentAnswerAreaObj;
    polishedReport['formattedCodes'] = formattedCodes;

    gradeWrapper.classList.add('hidden');
    switchBtn['gradeWrapper'] = gradeWrapper;
    switchBtn.addEventListener('click', showOrginalGrade, false);

    // insert newly created div and perform initialization
    reportsContainer.insertBefore(switchBtn, reportsContainer.firstChild);

    polishedReport['title'] = selectedStudentId;
    polishedReport['switchBtn'] = switchBtn;
    reportsContainer.insertBefore(polishedReport, reportsContainer.querySelector('div'));

    const { sideNav } = polishedReport;
    if (sideNav) {
      sideNav.init(polishedReport.endSelector, 'matrix-main .matrix-content ng-component');
    }

    // rid the wrapper of the old divs
    if (oldPolishedReport) {
      if (oldPolishedReport.sideNav) oldPolishedReport.sideNav.remove();
      reportsContainer.removeChild(oldPolishedReport);
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
      let tabsContentWrapper = document.querySelector('.submission-container');
      if (tabsContentWrapper === null) {
        tabsContentWrapper = document.querySelector('.tab-content');
      }
      const element = tabsContentWrapper.querySelector('#files-cmp-tab');
      if (element) {
        if (body.submissionsList[0].sub_ca_id != element.latestSubmissionId) {
          element.filesCmpTab.updateChoicesTable(body.submissionsList);
          element['latestSubmissionId'] = body.submissionsList[0].sub_ca_id;
          element.fileCmpTab.fix();
        }
      } else {
        const filesCmpTab = new FilesCmp.FilesCmpTab(body.submissionsList, true);
        const element = filesCmpTab.tab;
        element.id = 'files-cmp-tab';
        element['latestSubmissionId'] = body.submissionsList[0].sub_ca_id;
        tabsContentWrapper.appendChild(element);

        const fileCmpTab = FilesCmp.createSecondBarLi('Files Comparison', element, true);
        element['fileCmpTab'] = fileCmpTab;
        matrixSecondBar.appendChild(fileCmpTab);

        const originalFix = fileCmpTab.fix;
        fileCmpTab['originalFix'] = originalFix;
        fileCmpTab.fix = addListenersForTabs;
        fileCmpTab.fix();
      }
    }
    return callback('front has got the reportObject and attached the polished report to the grade tab!');
  }), true;
}

function showOrginalGrade() {
  const button = this;
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
  const curLi = this.parentNode;
  const oldReport = curLi.hideElement.parentNode.querySelector(`.polished-report-success[title*="${curLi.title}"]`);
  if (oldReport) {
    oldReport.classList.add('hidden');
    oldReport.switchBtn.classList.add('hidden');
  }

  const liList = curLi.parentUl.querySelectorAll('li');
  if (liList.length === 2 && ~liList[1].className.indexOf('files-cmp-li')) {
    liList[0].click();
  } else {
    setTimeout(() => {
      const selectedTab = curLi.parentUl.querySelector('.choice-tab-active');
      if (selectedTab) selectedTab.click();
      else if (curLi.prevLi.isSameNode(liList[0])) curLi.nextLi.click();
      else curLi.prevLi.click();
    }, 500);
  }
}
function switchReport() {
  const username = this.title;
  if (!username) return;
  const wrapper = this.hideElement.parentNode;
  const newReport = wrapper.querySelector(`.polished-report-success[title="${username}"]`);
  const oldReport = wrapper.querySelector('.polished-report-success:not(.hidden)');
  const oldSwitchBtn = wrapper.querySelector('.switch-btn:not(.hidden):not(.files-cmp-switch-btn)');
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

      const newReportParent = newReport.parentNode;
      let insertPoint = newReportParent.querySelector('.switch-btn:last-of-type');
      if (insertPoint) insertPoint = insertPoint.nextElementSibling;
      if (insertPoint === null) insertPoint = newReportParent.firstChild;
      newReportParent.insertBefore(newReport, insertPoint);
      this.parentUl.querySelector('.files-cmp-li').fix();
    }
    newReport.sideNav.fix();
    newReport.studentAnswerAreaObj.update(newReport.formattedCodes);
  }
}
function addListenersForTabs() {
  this.originalFix();
  const liList = this.parentNode.querySelectorAll('li');
  const allBlockLiList = document.querySelectorAll('#all-block .tab-list li');
  for (let i = 0, length = liList.length; i !== length; ++i) {
    const oneLi = liList[i];
    const oneAllBlockLi = allBlockLiList[i];
    oneLi['prevLi'] = liList[i - 1];
    oneLi['nextLi'] = liList[i + 1];
    oneLi.removeEventListener('click', switchReport, false);
    oneLi.addEventListener('click', switchReport, false);
    if (allBlockLiList[i]) {
      oneAllBlockLi['connectedTab'] = liList[i + 1];
      oneAllBlockLi.removeEventListener('click', clickConnectedTab, false);
      oneAllBlockLi.addEventListener('click', clickConnectedTab, false);
    }

    const close = oneLi.querySelector('i');
    if (close) {
      close.removeEventListener('click', afterClose, false);
      close.addEventListener('click', afterClose, false);
    }
  }
}
