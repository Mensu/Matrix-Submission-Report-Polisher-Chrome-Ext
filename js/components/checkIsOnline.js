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
  var intervalId = null;
  chrome.webRequest.onCompleted.addListener(function(details) {
    if (details.tabId == -1) return;
    chrome.pageAction.show(details.tabId);
    var httpRequest = require('./httpRequest.js');
    if (intervalId === null) {
      intervalId = setInterval(function() {
          chrome.tabs.query({}, function(tabArray) {
            var tabId = details.tabId;
            tabArray.some(function(oneTab, index, self) {
              if (oneTab.id == tabId) {
                httpRequest(matrix.rootUrl + '/app-angular/course/self/views/list.client.view.html', function(err) {
                  chrome.pageAction.setIcon({
                    "tabId": tabId,
                    "path": {
                      "19": './img/' + ((err) ? 'offline.png' : 'online.png'),
                      "38": './img/' + ((err) ? 'offline.png' : 'online.png')
                    }
                  });
                  chrome.pageAction.setTitle({
                    "tabId": tabId,
                    "title": (err) ? 'disconnected to Matrix' : 'click to change settings'
                  });
                });
                return true;
              } else {
                return false;
              }
            });
          });
      }, 5000);
    }
  }, {
    "urls": [
      matrix.rootUrl + '/*'
    ]
  });
});
