var httpRequest = require('./lib/httpRequest.js');
/** 
 * @constructor
 * MatrixObject
 * @param {string|Object} newConfigs - Matrix's root url(string) or config object that looks like this:
 * {
 *   "rootUrl": Matrix's root url
 * }
 * 
 * dependent of 
 *   {function} httpRequest
 */
function MatrixObject(configs) {
  this.configs = ['rootUrl'];
  for (var i = 0; i != this.configs.length; ++i) {
    var oneConfig = this.configs[i];
    this[oneConfig] = null;
  }
    // wrap to config object
  if (typeof(configs) == 'string') {
    configs = {"rootUrl": configs};
  }
  this.configsSetter(configs);
  if (!this.rootUrl.endsWith('/')) {
    this.rootUrl += '/';
  }
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
   * @param {Object} param - object that looks like this
   *   {
   *     "courseId": the course's id,
   *     "problemId": the assignment's id,
   *     "submissionId": the submission's id,
   *   }
   * @param {*} otherInfo - any other information that will send to callback function
   * @param {function(boolean, string, *):void} callback - function that looks like this
   *      @param {boolean} error
   *      @param {string} response - the response when no error occurred, or undefined otherwise
   *      @param {*} otherInfo - any other information from user
   *   function(error, response, otherInfo) {
   *
   *   }
   * dependent of 
   *   {function} httpRequest
   */
  "getSubmission": function(param, otherInfo, callback) {
    httpRequest('get', this.rootUrl + 'api/courses/' + param.courseId + '/assignments/' + param.problemId + '/submissions/' + param.submissionId, null, function(err, body) {
      return callback(err, body, otherInfo);
    });
  },

  /** 
   * get the latest report by courseId and problemId
   * @param {Object} param - object that looks like this
   *   {
   *     "courseId": the course's id,
   *     "problemId": the assignment's id
   *   }
   * @param {*} otherInfo - any other information that will send to callback function
   * @param {function(boolean, string, *):void} callback - function that looks like this
   *      @param {boolean} error
   *      @param {string} response - the response when no error occurred, or undefined otherwise
   *      @param {*} otherInfo - any other information from user
   *   function(error, response, otherInfo) {
   *
   *   }
   * dependent of 
   *   {function} httpRequest
   */
  "getLatestReport": function(param, otherInfo, callback) {
    httpRequest('get', this.rootUrl + 'api/courses/' + param.courseId + '/assignments/' + param.problemId + '/submissions/last/feedback', null, function(err, body) {
      return callback(err, body, otherInfo);
    });
  },

  /** 
   * get the latest submission by courseId and problemId
   * @param {Object} param - object that looks like this
   *   {
   *     "courseId": the course's id,
   *     "problemId": the assignment's id
   *   }
   * @param {*} otherInfo - any other information that will send to callback function
   * @param {function(boolean, string, *):void} callback - function that looks like this
   *      @param {boolean} error
   *      @param {string} response - the response when no error occurred, or undefined otherwise
   *      @param {*} otherInfo - any other information from user
   *   function(error, response, otherInfo) {
   *
   *   }
   * dependent of 
   *   {function} httpRequest
   */
  "getLatestSubmission": function(problemId, userId, otherInfo, callback) {
    httpRequest('get', this.rootUrl + 'api/courses/' + param.courseId + '/assignments/' + param.problemId + '/submissions/last', null, function(err, body) {
      return callback(err, body, otherInfo);
    });
  },

  /** 
   * get one problem's information by courseId and problemId
   * @param {Object} param - object that looks like this
   *   {
   *     "courseId": the course's id,
   *     "problemId": the assignment's id
   *   }
   * @param {*} otherInfo - any other information that will send to callback function
   * @param {function(boolean, string, *):void} callback - function that looks like this
   *      @param {boolean} error
   *      @param {string} response - the response when no error occurred, or undefined otherwise
   *      @param {*} otherInfo - any other information from user
   *   function(error, response, otherInfo) {
   *
   *   }
   * dependent of 
   *   {function} httpRequest
   */
  "getProblemInfo": function(param, otherInfo, callback) {
    httpRequest('get', this.rootUrl + 'api/courses/' + param.courseId + '/assignments/' + param.problemId, null, function(err, body) {
      return callback(err, body, otherInfo);
    });
  },

  /** 
   * get submissions list of a problem by courseId and problemId
   * @param {Object} param - object that looks like this
   *   {
   *     "courseId": the course's id,
   *     "problemId": the assignment's id
   *   }
   * @param {*} otherInfo - any other information that will send to callback function
   * @param {function(boolean, string, *):void} callback - function that looks like this
   *      @param {boolean} error
   *      @param {string} response - the response when no error occurred, or undefined otherwise
   *      @param {*} otherInfo - any other information from user
   *   function(error, response, otherInfo) {
   *
   *   }
   * dependent of 
   *   {function} httpRequest
   */
  "getSubmissionsList": function(param, otherInfo, callback) {
    httpRequest('get', this.rootUrl + 'api/courses/' + param.courseId + '/assignments/' + param.problemId + '/submissions', null, function(err, body) {
      return callback(err, body, otherInfo);
    });
  },

  /** 
   * log in by username and password
   * @param {Object} param - object that looks like this
   *   {
   *     "username": username,
   *     "passowrd": password
   *   }
   * @param {*} otherInfo - any other information that will send to callback function
   * @param {function(boolean, string, *):void} callback - function that looks like this
   *      @param {boolean} error
   *      @param {string} response - the response when no error occurred, or undefined otherwise
   *      @param {*} otherInfo - any other information from user
   *   function(error, response, otherInfo) {
   *
   *   }
   * dependent of 
   *   {function} httpRequest
   */
  "login": function(param, otherInfo, callback) {
    httpRequest('post', this.rootUrl + 'api/users/login', param, function(err, body) {
      return callback(err, body, otherInfo);
    });
  },

  /** 
   * get courses list of currect user
   * @param {Object} param - object that looks like this
   *   {}
   * @param {*} otherInfo - any other information that will send to callback function
   * @param {function(boolean, string, *):void} callback - function that looks like this
   *      @param {boolean} error
   *      @param {string} response - the response when no error occurred, or undefined otherwise
   *      @param {*} otherInfo - any other information from user
   *   function(error, response, otherInfo) {
   *
   *   }
   * dependent of 
   *   {function} httpRequest
   */
  "getCoursesList": function(param, otherInfo, callback) {
    httpRequest('get', this.rootUrl + 'api/courses', null, function(err, body) {
      return callback(err, body, otherInfo);
    });
  },

  /** 
   * get one course by courseId
   * @param {Object} param - object that looks like this
   *   {
   *     "courseId": the course's id
   *   }
   * @param {*} otherInfo - any other information that will send to callback function
   * @param {function(boolean, string, *):void} callback - function that looks like this
   *      @param {boolean} error
   *      @param {string} response - the response when no error occurred, or undefined otherwise
   *      @param {*} otherInfo - any other information from user
   *   function(error, response, otherInfo) {
   *
   *   }
   * dependent of 
   *   {function} httpRequest
   */
  "getCourseInfo": function(param, otherInfo, callback) {
    httpRequest('get', this.rootUrl + 'api/courses/' + param.courseId, null, function(err, body) {
      return callback(err, body, otherInfo);
    });
  },

  /** 
   * get problems list by courseId
   * @param {Object} param - object that looks like this
   *   {
   *     "courseId": the course's id
   *   }
   * @param {*} otherInfo - any other information that will send to callback function
   * @param {function(boolean, string, *):void} callback - function that looks like this
   *      @param {boolean} error
   *      @param {string} response - the response when no error occurred, or undefined otherwise
   *      @param {*} otherInfo - any other information from user
   *   function(error, response, otherInfo) {
   *
   *   }
   * dependent of 
   *   {function} httpRequest
   */
  "getProblemsList": function(param, otherInfo, callback) {
    httpRequest('get', this.rootUrl + 'api/courses/' + param.courseId + '/assignments', null, function(err, body) {
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
