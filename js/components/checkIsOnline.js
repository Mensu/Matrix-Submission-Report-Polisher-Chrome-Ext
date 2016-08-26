var httpRequest = require('./lib/httpRequest.js');

(function(factory) {
  if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = function(matrixObj) {
      factory(matrixObj);
      return matrixObj;
    };
  // } else if (typeof define === 'function' && define.amd) {
  //   // AMD. Register as an anonymous module.
  //   define([], factory);
  } else {
    // Browser globals
    factory(matrixObj);
  }
})(function(matrix) {
  /** 
   * checked whether a tab is visiting matrix
   * if true, show the extension icon
   * @param {Tab} oneTab
   * @return {boolean} whether the tab is visiting matrix
   * dependent of
   *   {MatrixObject} matrix
   */
  function isVisitingMatrix(oneTab) {
    if (oneTab.url.startsWith(matrix.rootUrl)) {
        // show icon
      chrome.pageAction.show(oneTab.id);
      return true;
    } else {
      return false;
    }
  }
  var intervalId = null;
  chrome.webRequest.onCompleted.addListener(function(details) {
      // return if the request is from the background
    if (details.tabId == -1) return;

      // show icon and register
    chrome.pageAction.show(details.tabId);

      // set interval to check whether we have internet access to Matrix
    if (intervalId === null) {
      intervalId = setInterval(function() {
            // send a request to Matrix every five seconds
          httpRequest('get', matrix.rootUrl + '/app-angular/course/self/views/list.client.view.html', null, function(err) {

              var img19 = './img/' + ((err) ? 'offline.png' : 'online.png');
              var img38 = './img/' + ((err) ? 'offline.png' : 'online.png');
              var newTitle = (err) ? 'disconnected to Matrix' : 'click to change settings';
                // visit each existing tab
              chrome.tabs.query({}, function(tabArray) {
                tabArray.forEach(function(oneTab) {
                  if (!isVisitingMatrix(oneTab)) return;
                    // if the tab has registered and is visiting Matrix
                    // change icons and title for every tab
                  chrome.pageAction.setIcon({
                    "tabId": oneTab.id,
                    "path": {
                      "19": img19,
                      "38": img38
                    }
                  });
                  chrome.pageAction.setTitle({
                    "tabId": oneTab.id,
                    "title": newTitle
                  });
                });
              });
          });
      }, 5000);
    }
  }, {
    "urls": [
      matrix.rootUrl + '*'
    ]
  });
});
