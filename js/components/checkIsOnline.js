function httpRequest(url, callback) {
	var xhr = new XMLHttpRequest();
  xhr.open('get', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) return callback(true);
  }
  xhr.onerror = function() { return callback(false); }
  xhr.send();

}
// setInterval(function() {
//   return httpRequest('https://www.baidu.com', function(connected) {
//     chrome.browserAction.setIcon({
//       "path": {
//         "19": './img/' + ((connected) ? 'online.png' : 'offline.png'),
//         "38": './img/' + ((connected) ? 'online.png' : 'offline.png')
//         }
//     });
//   });
// }, 5000);
