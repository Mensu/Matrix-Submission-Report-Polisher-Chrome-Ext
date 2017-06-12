const MatrixObject = require('./components/MatrixObject.js');
const ReportObject = require('./components/ReportObject.js');
const toSubmitAt = require('./components/lib/toSubmitAt.js');
const genDriver = require('./components/lib/genDriver.js');
const pick = require('./components/lib/pick.js');
const setTimeoutAsync = require('./components/lib/setTimeoutAsync.js');
const FilesDiff = require('./components/FilesDiff.js');
const httpRequest = require('./components/lib/httpRequest.js');

const matrix = new MatrixObject({
  patternUrl: 'http://*.vmatrix.org.cn/',
  rootUrl: 'https://vmatrix.org.cn/',
  localUrl: 'http://localhost:3000/',
  googleStyleUrl: 'http://123.207.29.66:3001/',
});
require('./components/checkIsOnline.js')(matrix);


// listen for:
// /api/courses/*/assignments/*/submissions/*
// /api/courses/*/assignments/*/submissions/*?user_id=*
// /api/courses/*/assignments/*/submissions/last/feedback
chrome.webRequest.onCompleted.addListener(getDataToPolishCourseReport, {
  urls: [
    `${matrix.rootUrl}api/courses/*/assignments/*/submissions/*`,
    `${matrix.patternUrl}api/courses/*/assignments/*/submissions/*`,
    `${matrix.localUrl}api/courses/*/assignments/*/submissions/*`,
  ],
});

function getDataToPolishCourseReport(details) {
  return genDriver(function *() {
    const { matchRes, requiringLatest } = getMatchRes(details);
    if (!matchRes) return;

    const rootUrl = getRootUrl(details.url);
    const [, courseId, assignmentId, submissionId, userId] = matchRes;

    const param = {
      tabId: details.tabId,
      courseId,
      assignmentId,
      submissionId,
      userId,
    };

    const submissionList = yield getSubmissionsList(param);
    if (!submissionList) return;

    getSubmitTime(submissionList, param);

    const answers = yield getSubmission(param);
    if (!answers) return;

    if (answers.length) {
      const googleStyleConfig = (userId ? { getFormattedCodes: true } : undefined);
      yield getGoogleStyle(answers, googleStyleConfig, param);
    }

    const signal = (userId ? 'startStudentSubmission' : 'start')
    const response = yield sendReportObjToFront(param, signal);
    console.log(response);

    function getMatchRes(details) {
      if (details.tabId === -1 || details.method === 'POST') return {};
      const submissionMatch = /\/courses\/([0-9]{1,})(?:%20){0,}\/assignments\/([0-9]{1,})\/submissions\/([0-9]{1,})(?:\?user_id=([0-9]{1,})){0,1}$/.exec(details.url);
      const requiringLatest = /courses\/([0-9]{1,})\/assignments\/([0-9]{1,})\/submissions\/last\/feedback$/.exec(details.url);

      return { matchRes: (submissionMatch || requiringLatest), requiringLatest };
    }

    function getSubmissionsList(param) {
      return genDriver(function *() {
        let body = null;
        try {
          body = yield matrix.getSubmissionsList(param, rootUrl);
        } catch (e) {
          return console.error(`Error: Failed to get submissions list with parameters`, param), false;
        }
        if (body.status === 'BAD_REQUEST') {
          param.userId = body.paramData.user.user_id;
          try {
            body = yield matrix.getSubmissionsList(param, rootUrl);
          } catch (e) {
            return console.error(`Error: Failed to get submissions list with parameters`, param), false;
          }
        }
        param.submissionsList = body.data;
        return param.submissionsList;
      });
    }

    function getSubmitTime(submissionList, param) {
      if (submissionList === null || 0 === submissionList.length) {
        param.submitTime = null;
        return null;
      }

      // get submission time
      if (requiringLatest) {
        param.submitTime = toSubmitAt(submissionList[0].submit_at, true);
      } else {
        submissionList.some((oneSubmission) => {
          if (Number(param.submissionId) === oneSubmission.sub_ca_id) {
            param.submitTime = toSubmitAt(oneSubmission.submit_at, true);
            return true;
          }
          return false;
        });
      }

      return param.submitTime;
    }

    function getProblemInfo(param) {
      return genDriver(function *() {
        let body = null;
        try {
          body = yield matrix.getProblemInfo(param, rootUrl);
        } catch (e) {
          return console.error(`Error: Failed to get problem info list with parameters`, param), false;
        }

        let supportFiles = [];
        if (body) {
          const {
            config,
            config: { grading },
            files
          } = body.data;
          param.problemInfo = config;
          param.problemInfo.totalPoints = grading;

          supportFiles = files || [];
          supportFiles.forEach(oneSupportFile => (oneSupportFile.dontCheckStyle = true));
          param.problemInfo.supportFiles = supportFiles;
          // deprecated
          param.problemInfo.supportedFiles = param.problemInfo.supportFiles;

        } else {
          param.problemInfo = {
            limits: {},
            totalPoints: { 'google tests detail': {} }
          };
        }

        return param.problemInfo;

      });
    }

    function getSubmission(param) {
      return genDriver(function *() {
        let getSubmissionFunc = matrix.getSubmission;
        if (requiringLatest || param.userId) {
          const problemInfo = yield getProblemInfo(param);
          if (!problemInfo) return false;
          if (requiringLatest) {
            getSubmissionFunc = matrix.getLatestSubmission;
          }
        }

        let body = null;
        try {
          body = yield getSubmissionFunc.call(matrix, param, rootUrl);
        } catch (e) {
          return console.error('Error: Failed to get submission with parameters', param), false;
        }
        if (body.data === null) {
          return console.error('Error: submission body.data is empty'), false;
        }
        param.reportBody = body;
        if (!Reflect.hasOwnProperty.call(body.data, 'answers')) {
          return [];
        }
        const filesToMergeToAnswers = (param.userId ? param.problemInfo.supportFiles : []);
        const answers = [...body.data.answers, ...filesToMergeToAnswers];
        return answers;
      });
    }

    function getGoogleStyle(files, config, param) {
      return genDriver(function *() {
        let body = null;
        try {
          body = yield matrix.getGoogleStyleReport({ files, config });
        } catch (e) {
          console.error('Error occurs when fetching Google Style');
          return;
        }

        if (param.problemInfo) {
          param.problemInfo.totalPoints['google style'] = 0;
        }

        if (body && body.status == 'OK') {
          param['google style'] = body.data;
        } else {
          console.error('Google Style Server Error: ', body);
        }
      });
    }

  }).catch(e => console.error('Uncaught Error', e));

}

function getRootUrl(url) {
  let rootUrl = /^(?:\S){1,}:\/\/(?:\S){1,}?\//.exec(url);
  if (rootUrl) return rootUrl[0];
  return undefined;
}

function sendReportObjToFront(param, signal) {
  return genDriver(function *() {
    const reportObject = new ReportObject(param.reportBody);
    if (reportObject === null || param.submitTime === null) return;
    reportObject.submitTime = param.submitTime;
    reportObject['google style'] = param['google style'];

    console.log(reportObject);
    const jsonToSend = {
      signal,
      reportObject: reportObject,
      configs: pick(localStorage, 'showCR', 'autoPolish')
    };
    Object.assign(jsonToSend, pick(param, 'problemInfo', 'submissionsList'));
    return chrome.tabs.sendMessageAsync(param.tabId, jsonToSend);
  });
}

// listen for:
// /api/libraries/*/problems/*
chrome.webRequest.onCompleted.addListener(details => {
  return genDriver(function *() {
    const { matchRes } = getMatchRes(details);
    if (!matchRes) return;

    const rootUrl = getRootUrl(details.url);
    const libraryId = matchRes[1], problemId = matchRes[2];

    const param = {
      tabId: details.tabId,
      libraryId,
      problemId,
    };

    const body = yield getLibraryProblemInfoAndReport(param);
    if (!body) return;

    const response = yield sendReportObjToFront(param, 'libReport');
    console.log(response);

    function getMatchRes(details) {
      if (details.tabId === -1 || details.method === 'POST' || !localStorage.autoPolish) return {};
      const matchRes = /libraries\/([0-9]{1,})\/problems\/([0-9]{1,})$/.exec(details.url);
      return { matchRes };
    }

    function getLibraryProblemInfoAndReport(param) {
      return genDriver(function *() {
        let body = null;
        try {
          body = yield matrix.getLibraryProblemInfo(param, rootUrl);
        } catch (e) {
          return console.error('Error: Failed to get library problem info with parameters', param), false;
        }
        const {
          config,
          config: { grading },
          updated_at,
          report: { total_grade: grade }
        } = body.data.config;
        // libaray problem info
        param.problemInfo = config;
        param.problemInfo.totalPoints = grading;
        // time
        param.submitTime = toSubmitAt(updated_at, true);
        // report
        param.reportBody = body;
        body.data.grade = grade;
        return body;
      });
    }
  }).catch(e => console.error('Uncaught Error', e));

}, {
  urls: [
    `${matrix.rootUrl}api/libraries/*/problems/*`,
    `${matrix.patternUrl}api/libraries/*/problems/*`,
    `${matrix.localUrl}api/libraries/*/problems/*`,
  ]
});

// chrome.webRequest.onCompleted.addListener(details => {
//   return genDriver(function *() {
//     if (details.tabId === -1 || details.method === 'POST') return;
//     console.log('Real gap of 500 ms', yield setTimeoutAsync(500));
//     const signal = 'noValidationLogin';
//     const response = yield chrome.tabs.sendMessageAsync(details.tabId, { signal });
//     console.log(response);
//   }).catch(e => console.error('Uncaught Error', e));

// }, {
//   urls: [
//     `${matrix.rootUrl}api/users/login`,
//     `${matrix.patternUrl}api/users/login`,
//     `${matrix.localUrl}api/users/login`,
//   ],
// });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  return genDriver(function *() {
    switch (message.signal) {
      case 'filesDiff':
        return filesDiff();
      case 'loginWithoutValidation':
        return loginWithoutValidation();
      case 'shixun':
        return shixun();
      default:
        break;
    }
  }).catch(e => console.error('Uncaught Error', e)), true;

  function filesDiff() {
    return genDriver(function *() {
      const commonParam = pick(message, 'courseId', 'assignmentId');
      const oldParam = Object.assign({ submissionId: message.oldId }, commonParam);
      const newParam = Object.assign({ submissionId: message.newId }, commonParam);
      const requests = [matrix.getSubmission(oldParam, message.rootUrl), matrix.getSubmission(newParam, message.rootUrl)];
      let results = null;
      try {
        results = yield Promise.all(requests);
      } catch (e) {
        console.error(`Error: Failed to get submissions with parameters`, oldParam, newParam);
        return sendResponse({ status: 'BAD' });
      }
      if (results.some(({ status }) => status !== 'OK')) {
        return sendResponse({ status: 'BAD' });
      }
      const [{
        data: { answers: oldFiles },
      }, {
        data: { answers: newFiles },
      }] = results;
      const filesDiff = new FilesDiff(oldFiles, newFiles);
      return sendResponse({ status: 'OK', filesDiff });
    });
  }

  function loginWithoutValidation() {
    return genDriver(function *() {
      let body = null;
      try {
        body = yield matrix.login(message.param);
      } catch (e) {
        console.error('Error: Failed to login with parameters', message.param);
        return sendResponse({ data: { is_valid: false } });
      }
      if (sender.tab.incognito) {
        body.data.is_valid = false;
      }
      return sendResponse(body);
    });
  }

  function shixun() {
    return genDriver(function *() {
      const { studentId, asgnId } = message;
      const root = 'https://vmatrix.org.cn';
      const { data: members } = JSON.parse(yield httpRequest('get', `${root}/api/exams/106/members`));
      const user = members.find(({ student_id }) => student_id === String(studentId));
      if (!user) {
        const msg = `找不到学号为 ${studentId} 的学生`;
        console.log(msg);
        return sendResponse({ success: false, msg });
      }
      const { user_id } = user;
      const { data: subs } = JSON.parse(yield httpRequest('get', `${root}/api/exams/106/assignments/${asgnId}/submissions?user_id=${user_id}`));
      if (subs.length === 0) {
        const msg = `${studentId} 在 20170611 文件备份3 没有提交`;
        console.log(msg);
        return sendResponse({ success: false, msg });
      }
      const [{ sub_ea_id }] = subs;
      const downloadUrl = `${root}/api/courses/78/exams/106/assignments/${asgnId}/submissions/${sub_ea_id}/download`;
      console.log(downloadUrl);
      return sendResponse({ success: true, msg: downloadUrl });
    });
  }
});

chrome.tabs.sendMessageAsync = function(...args) {
  return new Promise(
    resolve => chrome.tabs.sendMessage.call(
      chrome.tabs,
      ...args,
      response => resolve(response)
    )
  );
}

chrome.webRequest.onCompleted.addListener(details => {
  return genDriver(function *() {
    const root = 'https://vmatrix.org.cn';
    let { data: asgns } = JSON.parse(yield httpRequest('get', `${root}/api/exams/106/assignments`));
    asgns = asgns.filter(({ type }) => type === 'Fileupload problem').map(({ ea_id, title }) => ({ ea_id, title }));
    return chrome.tabs.sendMessageAsync(details.tabId, {
      signal: 'shixun',
      asgns,
    });
  }).catch(e => console.error('Uncaught Error', e));

}, {
  urls: [
    `${matrix.rootUrl}api/courses/assignments?state=started&waitingForMyJudging=1`,
  ]
});
