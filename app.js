(function() {
  'use strict';
  var TRANSFORM = true;
  var INTERVAL = 15 * 1000;
  var MOVEMENT = 100;
  var MASTER = 0;
  var RIGHT = 12;
  var LEFT = 40;
  var DOWN = 1;
  var thr0w = window.thr0w;
  document.addEventListener('DOMContentLoaded', ready);
  function ready() {
    var blockedSync;
    var pdf;
    var channel;
    var transformed = false;
    var transformRight = true;
    var blockedLeft = false;
    var blockedRight = false;
    var frameEl = document.getElementById('my_frame');
    var contentEl = document.getElementById('my_content');
    var carouselEl = document.getElementById('my_content__carousel');
    var feedbackLeftEl = document.getElementById('my_content__feedback--left');
    var feedbackRightEl = document
      .getElementById('my_content__feedback--right');
    // thr0w.setBase('http://localhost'); // DEV
    thr0w.setBase('http://192.168.1.2'); // PROD
    thr0w.addAdminTools(frameEl,
      connectCallback, messageCallback);
    function connectCallback() {
      var grid = new thr0w.FlexGrid(
        frameEl,
        contentEl,
        [[1, 0]],
        [
          {
            width: 1080,
            height: 1920,
            spacing: 100
          }
        ]
      );
      var transformSync = new thr0w.Sync(
        grid,
        'transform',
        transformMessage,
        transformReceive
      );
      channel = thr0w.getChannel();
      blockedSync = new thr0w.Sync(
        grid,
        'blocked',
        blockedMessage,
        blockedReceive
      );
      pdf = new thr0w.pdf.Pdf(
        grid,
        carouselEl,
        'onward_tv.pdf'
      );
      function transformMessage() {
        return {
          transformed: transformed,
          transformRight: transformRight
        };
      }
      function transformReceive(data) {
        transformed = data.transformed;
        transformRight = data.transformRight;
        transform();
      }
      function blockedMessage() {
        return {
          blockedLeft: blockedLeft,
          blockedRight: blockedRight
        };
      }
      function blockedReceive(data) {
        blockedLeft = data.blockedLeft;
        blockedRight = data.blockedRight;
        updateFeedback();
      }
      pdf.addEventListener('ready', pdfReady);
      function pdfReady() {
        var numPages = pdf.getNumPages();
        var buttonPrevEl = document.getElementById('my_content__button--prev');
        var buttonNextEl = document.getElementById('my_content__button--next');
        pdf.addEventListener('page_open', updateButtons);
        pdf.addEventListener('page_open', cancelTransition);
        buttonPrevEl.addEventListener('click', handleButtonPrevClick);
        buttonNextEl.addEventListener('click', handleButtonNextClick);
        if (numPages > 1) {
          buttonNextEl.style.display = 'block';
        }
        if (TRANSFORM && channel === MASTER) {
          pulse();
          window.setInterval(pulse, INTERVAL);
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
        function cancelTransition() {
          carouselEl.style.transform =
            window.getComputedStyle(carouselEl).transform;
        }
      }
      function pulse() {
        transformed = !transformed;
        if (!transformed) {
          transformRight = !transformRight;
        }
        transform();
        transformSync.update();
        transformSync.idle();
      }
      function transform() {
        if (!transformed) {
          carouselEl.style.transform = 'scale(1) translateZ(0px)';
        } else {
          if (transformRight) {
            carouselEl.style.transform = 'scale(1.2) translate(' +
              MOVEMENT + 'px, ' +
              MOVEMENT + 'px) ' +
              'translateZ(0px)';
          } else {
            carouselEl.style.transform = 'scale(1.2) translate(-' +
              MOVEMENT + 'px, -' +
              MOVEMENT + 'px) ' +
              'translateZ(0px)';
          }
        }
      }
    }
    function messageCallback(data) {
      if (!data.message.pin) {
        return;
      }
      if (channel !== MASTER) {
        return;
      }
      var value = data.message.value;
      switch (data.message.pin) {
        case RIGHT:
          if (value === DOWN) {
            if (!blockedLeft && !blockedRight) {
              blockedRight = true;
              updateFeedback();
              pdf.openNextPage();
            }
          } else {
            blockedRight = false;
            updateFeedback();
          }
          break;
        case LEFT:
          if (value === DOWN) {
            if (!blockedLeft && !blockedRight) {
              blockedLeft = true;
              updateFeedback();
              pdf.openPrevPage();
            }
          } else {
            blockedLeft = false;
            updateFeedback();
          }
          break;
        default:
      }
      blockedSync.update();
      blockedSync.idle();
    }
    function updateFeedback() {
      if (blockedLeft) {
        feedbackLeftEl.style.display = 'block';
      } else {
        feedbackLeftEl.style.display = 'none';
      }
      if (blockedRight) {
        feedbackRightEl.style.display = 'block';
      } else {
        feedbackRightEl.style.display = 'none';
      }
    }
  }
})();
