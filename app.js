(function() {
  'use strict';
  var RIGHT = 40;
  var LEFT = 12;
  var DOWN = 1;
  var thr0w = window.thr0w;
  document.addEventListener('DOMContentLoaded', ready);
  function ready() {
    var pdf;
    var blockedLeft = false;
    var blockedRight = false;
    var frameEl = document.getElementById('my_frame');
    var contentEl = document.getElementById('my_content');
    var feedbackLeftEl = document.getElementById('feedback--left');
    var feedbackRightEl = document.getElementById('feedback--right');
    thr0w.setBase('http://localhost');
    thr0w.addAdminTools(frameEl,
      connectCallback, messageCallback);
    function connectCallback() {
      var grid = new thr0w.Grid(
        frameEl,
        contentEl,
        [
          [0, 1, 2]
        ]
      );
      pdf = new thr0w.pdf.Pdf(
        grid,
        contentEl,
        'example.pdf'
      );
      pdf.addEventListener('ready', pdfReady);
      function pdfReady() {
        var numPages = pdf.getNumPages();
        var buttonPrevEl = document.getElementById('my_content__button--prev');
        var buttonNextEl = document.getElementById('my_content__button--next');
        pdf.addEventListener('page_open', updateButtons);
        buttonPrevEl.addEventListener('click', handleButtonPrevClick);
        buttonNextEl.addEventListener('click', handleButtonNextClick);
        if (numPages > 1) {
          buttonNextEl.style.display = 'block';
        }
        function handleButtonPrevClick() {
          pdf.openPrevPage();
        }
        function handleButtonNextClick() {
          pdf.openNextPage();
        }
        function updateButtons() {
          var currPageNumber = pdf.getCurrPageNumber();
          if (currPageNumber === 1) {
            buttonPrevEl.style.display = 'none';
          }
          if (currPageNumber === 2) {
            buttonPrevEl.style.display = 'block';
          }
          if (currPageNumber === numPages - 1) {
            buttonNextEl.style.display = 'block';
          }
          if (currPageNumber === numPages) {
            buttonNextEl.style.display = 'none';
          }
        }
      }
    }
    function messageCallback(data) {
      var value = data.message.value;
      switch (data.message.pin) {
        case RIGHT:
          if (value === DOWN) {
            if (!blockedLeft && !blockedRight) {
              blockedRight = true;
              feedbackRightEl.style.display = 'block';
              pdf.openNextPage();
            }
          } else {
            blockedRight = false;
            feedbackRightEl.style.display = 'none';
          }
          break;
        case LEFT:
          if (value === DOWN) {
            if (!blockedLeft && !blockedRight) {
              blockedLeft = true;
              feedbackLeftEl.style.display = 'block';
              pdf.openPrevPage();
            }
          } else {
            blockedLeft = false;
            feedbackLeftEl.style.display = 'none';
          }
          break;
        default:
      }
    }
  }
})();
