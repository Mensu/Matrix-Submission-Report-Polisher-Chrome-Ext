chrome.webRequest.onCompleted.addListener(function(details) {
  if (details.tabId == -1) return;
  chrome.pageAction.show(details.tabId);
  setInterval(function() {
    chrome.tabs.query({}, function(tabArray) {
      var tabId = details.tabId;
      tabArray.forEach(function(oneTab, index, self) {
        if (oneTab.id == tabId) {
          return httpRequest('https://eden.sysu.edu.cn:8000/app-angular/courses/exams/home/views/home.client.view.html', function(err) {
            chrome.pageAction.setIcon({
              "tabId": tabId,
              "path": {
                "19": './img/' + ((err) ? 'offline.png' : 'online.png'),
                "38": './img/' + ((err) ? 'offline.png' : 'online.png')
              }
            });
            chrome.pageAction.setTitle({
              "tabId": tabId,
              "title": (err) ? 'disconnected to Matrix' : 'connected to Matrix'
            });
          });
        }
      });
    });
  }, 5000);
}, {
  "urls": [
    'https://eden.sysu.edu.cn/app-angular/login-register/views/login-register.client.view.html'
  ]
});
