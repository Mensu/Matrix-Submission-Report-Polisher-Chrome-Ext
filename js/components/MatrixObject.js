const httpRequest = require('./lib/httpRequest.js');
const genDriver = require('./lib/genDriver.js');

/**
 * parse a string to JSON without throwing an error if failed
 * @param {String} str - string to be parsed
 *
 * @return {Boolean|Object} return JSON object if succeeded, or false if failed
 * independent
 */
function JSONParser(str) {
  let ret = null;
  try {
    ret = JSON.parse(str);
  } catch (e) {
    console.error(e);
    console.error('Error: Failed to parse the following string to JSON');
    console.error(str);
    return e;
  }
  return ret;
}

class MatrixObject {
  /**
   * @param {String|Object} newConfigs - Google Style server's root url (String) or config object that looks like this:
   * {
   *   rootUrl: Matrix's root url,
   *   googleStyleUrl: Google Style Server's root url
   * }
   *
   */
  constructor(newConfigs) {
    const self = this;
    self.configsNames = ['rootUrl', 'googleStyleUrl', 'patternUrl', 'localUrl'];
    for (const oneConfigName of self.configsNames) {
      self[oneConfigName] = null;
    }
    // wrap to config object
    if (typeof newConfigs === 'string') {
      newConfigs = { googleStyleUrl: newConfigs };
    }
    self.configsSetter(newConfigs);
  }

  configsSetter(newConfigs) {
    const self = this;
    for (const oneConfigName of self.configsNames) {
      if (Reflect.hasOwnProperty.call(newConfigs, oneConfigName)) {
        self[oneConfigName] = newConfigs[oneConfigName];
        if (oneConfigName.endsWith('Url') && !self[oneConfigName].endsWith('/')) {
          self[oneConfigName] += '/';
        }
      }
    }
  }

  /**
   * wrap an xhr request by trying parsing response data as JSON and catching possible errors
   * @param {String} method       methods
   * @param {String} resourceUrl  resource url to send request
   * @param {String} [rootUrl]    Matrix's root url
   * @param {Object} [param]      parameters
   *
   * @return {Object} response json
   */
  request(method, resourceUrl, rootUrl, param) {
    const self = this;
    if (!param) param = null;

    if (!rootUrl) {
      rootUrl = self.rootUrl;
    } else if (!rootUrl.endsWith('/')) {
      rootUrl += '/';
    }

    if (resourceUrl.startsWith('/')) {
      resourceUrl = resourceUrl.slice(0, -1);
    }

    return genDriver(function *() {
      const body = JSONParser(yield httpRequest(method, rootUrl + resourceUrl, param));
      if (body instanceof Error) throw body;
      return body;
    });
  }

  /**
   * test whether user has internet access to Matrix
   * @param  {String} rootUrl  Matrix's root url
   * @return {null}
   */
  testNetwork(rootUrl) {
    const self = this;
    return genDriver(function *() {
      yield httpRequest('get', `${rootUrl}/api/users/login`);
      return null;
    });
  }

  /**
   * get one submission by courseId, assignmentId and submissionId (sub_ca_id)
   * @param {Object} param - object that looks like this
   *   {
   *     courseId: the course's id,
   *     assignmentId: the assignment's id,
   *     submissionId: the submission's id,
   *   }
   * @param {String} [rootUrl]  Matrix's root url
   */
  getSubmission(param, rootUrl) {
    const self = this;
    const { courseId, assignmentId, submissionId } = param;
    return self.request(
      'get',
      `api/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}`,
      rootUrl
    );
  }

  /**
   * get the latest report by courseId and assignmentId
   * @param {Object} param - object that looks like this
   *   {
   *     courseId: the course's id,
   *     assignmentId: the assignment's id
   *   }
   * @param {String} [rootUrl]  Matrix's root url
   */
  getLatestReport(param, rootUrl) {
    const self = this;
    const { courseId, assignmentId } = param;
    return self.request(
      'get',
      `api/courses/${courseId}/assignments/${assignmentId}/submissions/last/feedback`,
      rootUrl
    );
  }

  /**
   * get the latest submission by courseId and assignmentId
   * @param {Object} param - object that looks like this
   *   {
   *     courseId: the course's id,
   *     assignmentId: the assignment's id
   *   }
   * @param {String} [rootUrl]  Matrix's root url
   */
  getLatestSubmission(param, rootUrl) {
    const self = this;
    const { courseId, assignmentId } = param;
    return self.request(
      'get',
      `api/courses/${courseId}/assignments/${assignmentId}/submissions/last`,
      rootUrl
    );
  }

  /**
   * get one problem's information by courseId and assignmentId
   * @param {Object} param - object that looks like this
   *   {
   *     courseId: the course's id,
   *     assignmentId: the assignment's id
   *   }
   * @param {String} [rootUrl]  Matrix's root url
   */
  getProblemInfo(param, rootUrl) {
    const self = this;
    const { courseId, assignmentId } = param;
    return self.request(
      'get',
      `api/courses/${courseId}/assignments/${assignmentId}`,
      rootUrl
    );
  }

  /**
   * get submissions list of a problem by courseId and assignmentId
   * @param {Object} param - object that looks like this
   *   {
   *     courseId: the course's id,
   *     assignmentId: the assignment's id,
   *
   *   }
   * @param {String} [rootUrl]  Matrix's root url
   */
  getSubmissionsList(param, rootUrl) {
    const self = this;
    const { courseId, assignmentId, userId } = param;
    let resourceUrl = `api/courses/${courseId}/assignments/${assignmentId}/submissions`;
    if (userId) {
      resourceUrl += `?user_id=${userId}`;
    }
    return self.request(
      'get',
      resourceUrl,
      rootUrl
    );
  }

  /**
   * log in by username and password
   * @param {Object} param - object that looks like this
   *   { username, password }
   * @param {String} [rootUrl]  Matrix's root url
   */
  login(param, rootUrl) {
    const self = this;
    const { username, password } = param;
    return self.request(
      'post',
      `api/users/login`,
      rootUrl,
      { username, password }
    );
  }

  /**
   * log out
   * @param {String} [rootUrl]  Matrix's root url
   */
  logout(rootUrl) {
    const self = this;
    return self.request(
      'get',
      `api/users/logout`,
      rootUrl
    );
  }

  /**
   * get courses list of currect user
   * @param {String} [rootUrl]  Matrix's root url
   */
  getCoursesList(rootUrl) {
    const self = this;
    return self.request(
      'get',
      `api/courses`,
      rootUrl
    );
  }

  /**
   * get one course by courseId
   * @param {Object} param - object that looks like this
   *   {
   *     courseId: the course's id
   *   }
   * @param {String} [rootUrl]  Matrix's root url
   */
  getCourseInfo(param, rootUrl) {
    const self = this;
    const { courseId } = param;
    return self.request(
      'get',
      `api/courses/${courseId}/description`,
      rootUrl
    );
  }

  /**
   * get problems list by courseId
   * @param {Object} param - object that looks like this
   *   {
   *     "courseId": the course's id
   *   }
   * @param {String} [rootUrl]  Matrix's root url
   */
  getProblemsList(param, rootUrl) {
    const self = this;
    const { courseId } = param;
    return self.request(
      'get',
      `api/courses/${courseId}/assignments`,
      rootUrl
    );
  }

  /**
   * get problem info from a library by libraryId and problemId
   * @param {Object} param - object that looks like this
   *   {
   *     libraryId: the library's id
   *     problemId: the problem's id
   *   }
   * @param {String} [rootUrl]  Matrix's root url
   */
  getLibraryProblemInfo(param, rootUrl) {
    const self = this;
    const { libraryId, problemId } = param;
    return self.request(
      'get',
      `api/libraries/${libraryId}/problems/${problemId}`,
      rootUrl
    );
  }

  /**
   * get Google Style Report from some server
   * @param {Object} param - object that looks like this
   *   {
   *     ...
   *   }
   */
  getGoogleStyleReport(param) {
    const self = this;
    return self.request(
      'post',
      `api/linters?linter=google-style`,
      self.googleStyleUrl,
      param
    );
  }
}

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
