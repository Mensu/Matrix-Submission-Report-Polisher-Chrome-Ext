(function () {
  var body = document.body;
  var backToTopOuterHTML = "\
<div id=\"backtotop\">\
  <div class=\"backtotop-btn\">\
    <div class=\"arrow-upward\"></div>\
    <div class=\"vertical-stick\"></div>\
  </div>\
</div>";
  body.lastElementChild.outerHTML += backToTopOuterHTML;
  backToTop = document.getElementById("backtotop");
  backToTop.addEventListener('click', function () {
    var documentBody = document.body;
    var distanceFromTop = documentBody.scrollTop;
    var pace = (distanceFromTop > 1250) ? 100 : distanceFromTop / 12.5;
    window.requestAnimationFrame((function () {
      var calculatedScrollTop = parseInt(documentBody.scrollTop) - pace;
      documentBody.scrollTop = ((calculatedScrollTop < 0) ? 0 : calculatedScrollTop);
      if (parseInt(documentBody.scrollTop) > 0) window.requestAnimationFrame(arguments.callee);
    }));
  }, false);
})();
