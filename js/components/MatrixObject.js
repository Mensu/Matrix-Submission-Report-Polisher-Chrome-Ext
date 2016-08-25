var httpRequest = require('./lib/httpRequest.js');
/** 
 * MatrixObject
 * create a span that can toggle to view the text in hex
 * @param {string|object} newConfigs - Matrix's root url(string) or config object that looks like this:
 * {
 *   "rootUrl": Matrix's root url
 * }
 * 
 * dependent of 
 *   {function} httpRequest
 */
function MatrixObject(newConfigs) {
  this.configs = ['rootUrl'];
  for (var i = 0; i != this.configs.length; ++i) {
    var oneConfig = this.configs[i];
    this[oneConfig] = null;
  }
    // wrap to config object
  if (typeof(newConfigs) == 'string') {
    newConfigs = {"rootUrl": newConfigs};
  }
  this.configsSetter(newConfigs);
}
MatrixObject.prototype = {
  "constructor": MatrixObject,
  "configsSetter": function(newConfigs) {
    for (var i = 0; i != this.configs.length; ++i) {
      var oneConfig = this.configs[i];
      if (newConfigs[oneConfig] !== undefined) this[oneConfig] = newConfigs[oneConfig];
    }
  },
  /** 
   * get one submission by courseId, problemId and submissionId (sub_ca_id)
   * @param {object} param - object that looks like this
   *   {
   *     "courseId": the course's id,
   *     "problemId": the assignment's id,
   *     "submissionId": the submission's id,
   *   }
   * @param {anything} otherInfo - any other infomation that will send to callback function
   * @param {function} callback - function that looks like this
   *      @param {boolean} error
   *      @param {string} response - the response when no error occurred, or undefined otherwise
   *      @param {anything} otherInfo - any other infomation from user
   *   function(error, response, otherInfo) {
   *
   *   }
   * dependent of 
   *   {function} httpRequest
   */
  "getSubmission": function(param, otherInfo, callback) {
    httpRequest(this.rootUrl + '/api/courses/' + param.courseId + '/assignments/' + param.problemId + '/submissions/' + param.submissionId, function(err, body) {
      return callback(err, body, otherInfo);
    });
  },

  /** 
   * get the latest report by courseId and problemId
   * @param {object} param - object that looks like this
   *   {
   *     "courseId": the course's id,
   *     "problemId": the assignment's id
   *   }
   * @param {anything} otherInfo - any other infomation that will send to callback function
   * @param {function} callback - function that looks like this
   *      @param {boolean} error
   *      @param {string} response - the response when no error occurred, or undefined otherwise
   *      @param {anything} otherInfo - any other infomation from user
   *   function(error, response, otherInfo) {
   *
   *   }
   * dependent of 
   *   {function} httpRequest
   */
  "getLatestReport": function(param, otherInfo, callback) {
    httpRequest(this.rootUrl + '/api/courses/' + param.courseId + '/assignments/' + param.problemId + '/submissions/last/feedback', function(err, body) {
      return callback(err, body, otherInfo);
    });
  },

  /** 
   * get the latest submission by courseId and problemId
   * @param {object} param - object that looks like this
   *   {
   *     "courseId": the course's id,
   *     "problemId": the assignment's id
   *   }
   * @param {anything} otherInfo - any other infomation that will send to callback function
   * @param {function} callback - function that looks like this
   *      @param {boolean} error
   *      @param {string} response - the response when no error occurred, or undefined otherwise
   *      @param {anything} otherInfo - any other infomation from user
   *   function(error, response, otherInfo) {
   *
   *   }
   * dependent of 
   *   {function} httpRequest
   */
  "getLatestSubmission": function(problemId, userId, otherInfo, callback) {
    httpRequest(this.rootUrl + '/api/courses/' + param.courseId + '/assignments/' + param.problemId + '/submissions/last', function(err, body) {
      return callback(err, body, otherInfo);
    });
  },

  /** 
   * get one problem's information by courseId and problemId
   * @param {object} param - object that looks like this
   *   {
   *     "courseId": the course's id,
   *     "problemId": the assignment's id
   *   }
   * @param {anything} otherInfo - any other infomation that will send to callback function
   * @param {function} callback - function that looks like this
   *      @param {boolean} error
   *      @param {string} response - the response when no error occurred, or undefined otherwise
   *      @param {anything} otherInfo - any other infomation from user
   *   function(error, response, otherInfo) {
   *
   *   }
   * dependent of 
   *   {function} httpRequest
   */
  "getProblemInfo": function(param, otherInfo, callback) {
    httpRequest(this.rootUrl + '/api/courses/' + param.courseId + '/assignments/' + param.problemId, function(err, body) {
      return callback(err, body, otherInfo);
    });
  },

  /** 
   * get the all submissions' information of a problem by courseId and problemId
   * @param {object} param - object that looks like this
   *   {
   *     "courseId": the course's id,
   *     "problemId": the assignment's id
   *   }
   * @param {anything} otherInfo - any other infomation that will send to callback function
   * @param {function} callback - function that looks like this
   *      @param {boolean} error
   *      @param {string} response - the response when no error occurred, or undefined otherwise
   *      @param {anything} otherInfo - any other infomation from user
   *   function(error, response, otherInfo) {
   *
   *   }
   * dependent of 
   *   {function} httpRequest
   */
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
