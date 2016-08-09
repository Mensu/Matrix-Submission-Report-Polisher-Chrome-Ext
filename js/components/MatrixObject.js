var httpRequest = require('./httpRequest.js');
function MatrixObject(newConfigs) {
  this.configs = ['rootUrl', 'tabInfo'];
  for (var i in this.configs) {
    var oneConfig = this.configs[i];
    this[oneConfig] = null;
  }
  if (typeof(newConfigs) == 'string') {
    newConfigs = {"rootUrl": newConfigs};
  }
  this.configsSetter(newConfigs);
}
MatrixObject.prototype = {
  "constructor": MatrixObject,
  "configsSetter": function(newConfigs) {
    for (var i in this.configs) {
      var oneConfig = this.configs[i];
      if (newConfigs[oneConfig] !== undefined) this[oneConfig] = newConfigs[oneConfig];
    }
  },
  "updateTabInfo": function(newTabInfo) {
    if (this.tabInfo === null) this.tabInfo = {};
    for (var tabId in newTabInfo) {
      if (this.tabInfo[tabId] === undefined) this.tabInfo[tabId] = {};
      for (var infoType in newTabInfo[tabId]) {
        this.tabInfo[tabId][infoType] = newTabInfo[tabId][infoType];
      }
    }
  },
  "getSubmission": function(param, otherInfo, callback) {
    httpRequest(this.rootUrl + '/api/courses/' + param.courseId + '/assignments/' + param.problemId + '/submissions/' + param.submissionId, function(err, body) {
      return callback(err, body, otherInfo);
    });
  },
  "getLatestReport": function(param, otherInfo, callback) {
    httpRequest(this.rootUrl + '/api/courses/' + param.courseId + '/assignments/' + param.problemId + '/submissions/last/feedback', function(err, body) {
      return callback(err, body, otherInfo);
    });
  },
  "getLatestSubmission": function(problemId, userId, otherInfo, callback) {
    httpRequest(this.rootUrl + '/api/courses/' + param.courseId + '/assignments/' + param.problemId + '/submissions/last', function(err, body) {
      return callback(err, body, otherInfo);
    });
  },
  "getProblemInfo": function(param, otherInfo, callback) {
    httpRequest(this.rootUrl + '/api/courses/' + param.courseId + '/assignments/' + param.problemId, function(err, body) {
      return callback(err, body, otherInfo);
    });
  },
  "getSubmissionsInfo": function(param, otherInfo, callback) {
    httpRequest(this.rootUrl + '/api/courses/' + param.courseId + '/assignments/' + param.problemId + '/submissions', function(err, body) {
      return callback(err, body, otherInfo);
    });
  }
};

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
    exports['MatrixObject'] = factory();
  else
    root['MatrixObject'] = factory();
})(this, function factory() {
  return MatrixObject;
});
