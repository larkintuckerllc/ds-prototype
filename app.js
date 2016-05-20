(function() {
  'use strict';
  var MASTER = 0;
  var RIGHT = 12;
  var LEFT = 40;
  var DOWN = 1;
  var thr0w = window.thr0w;
  document.addEventListener('DOMContentLoaded', ready);
  function ready() {
    var sync;
    var pdf;
    var channel;
    var blockedLeft = false;
    var blockedRight = false;
    var frameEl = document.getElementById('my_frame');
    var contentEl = document.getElementById('my_content');
    var feedbackLeftEl = document.getElementById('feedback--left');
    var feedbackRightEl = document.getElementById('feedback--right');
    // thr0w.setBase('http://localhost'); // DEV
    thr0w.setBase('http://192.168.1.2'); // PROD
    thr0w.addAdminTools(frameEl,
      connectCallback, messageCallback);
    function connectCallback() {
      channel = thr0w.getChannel();
      var grid = new thr0w.FlexGrid(
        frameEl,
        contentEl,
        [
          [0],
          [1]
        ],
        [
          {
            width: 1920,
            height: 1080,
            margin: 100
          },
          {
            width: 1920,
            height: 1080
          },
        ]
      );
      sync = new thr0w.Sync(
        grid,
        'feedback',
        message,
        receive
      );
      pdf = new thr0w.pdf.Pdf(
        grid,
        contentEl,
        'example.pdf'
      );
      pdf.addEventListener('ready', pdfReady);
      function message() {
        return {
          blockedLeft: blockedLeft,
          blockedRight: blockedRight
        };
      }
      function receive(data) {
        if (data.blockedLeft) {
          feedbackLeftEl.style.display = 'block';
        } else {
          feedbackLeftEl.style.display = 'none';
        }
        if (data.blockedRight) {
          feedbackRightEl.style.display = 'block';
        } else {
          feedbackRightEl.style.display = 'none';
        }
      }
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
      if (channel !== MASTER) {
        return;
      }
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
      sync.update();
      sync.idle();
    }
  }
})();
