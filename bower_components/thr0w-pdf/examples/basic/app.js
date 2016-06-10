(function() {
  'use strict';
  var thr0w = window.thr0w;
  document.addEventListener('DOMContentLoaded', ready);
  function ready() {
    var frameEl = document.getElementById('my_frame');
    var contentEl = document.getElementById('my_content');
    // CONFIGURED FOR LOCAL DEVELOPMENT; CHANGE HOSTNAME AS REQUIRED
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
      // LOAD PDF
      var pdf = new thr0w.pdf.Pdf(
        grid,
        contentEl, // FIXED SIZE CONTAINER TO HOLD PDF
        'example.pdf' // URL TO PDF
      );
      // READY EVENT TRIGGERED WHEN PDF IS LOADED
      pdf.addEventListener('ready', pdfReady);
      function pdfReady() {
        var numPages = pdf.getNumPages();
        var buttonPrevEl = document.getElementById('my_content__button--prev');
        var buttonNextEl = document.getElementById('my_content__button--next');
        // PAGE_OPEN EVENT TRIGGERED WHEN PDF OPENS A NEW PAGE
        pdf.addEventListener('page_open', updateButtons);
        // CREATING BUTTONS FOR CHANGING PDF PAGES
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
    function messageCallback() {}
  }
})();
