(function() {
  // jscs:disable
  /**
  * This module provides tools to manage PDFs.
  * @module thr0w-pdf
  */
  // jscs:enable
  'use strict';
  if (window.thr0w === undefined) {
    throw 400;
  }
  var LEFT = 0;
  var CENTER = 1;
  var RIGHT = 2;
  var PDFJS = window.PDFJS;
  var thr0w = window.thr0w;
  var service = {};
  PDFJS.disableStream = true;
  service.Pdf = Pdf;
  // jscs:disable
  /**
  * This object provides SVG management functionality.
  * @namespace thr0w
  * @class pdf
  * @static
  */
  // jscs:enable
  window.thr0w.pdf = service;
  // jscs:disable
  /**
  * This class is used to manage PDFs.
  * @namespace thr0w.pdf
  * @class Pdf
  * @constructor
  * @param grid {Object} The grid, {{#crossLink "thr0w.Grid"}}thr0w.Grid{{/crossLink}}, object.
  * @param containerEl {Object} The DOM object to contain the PDF.
  * @param url {String} The URL to the PDF.
  */
  // jscs:enable
  function Pdf(grid, containerEl, url) {
    if (!grid || typeof grid !== 'object') {
      throw 400;
    }
    if (!containerEl || typeof containerEl !== 'object') {
      throw 400;
    }
    if (!url || typeof url !== 'string') {
      throw 400;
    }
    var self = this;
    var containerId = containerEl.id;
    var containerWidth = containerEl.clientWidth;
    var containerHeight = containerEl.clientHeight;
    self.addEventListener = addEventListener;
    self.removeEventListener = removeEventListener;
    containerEl.classList.add('thr0w_pdf_carosel');
    PDFJS.getDocument(url)
      .then(handleGetDocument)
      .catch(handleGetDocumentError);
    // jscs:disable
    /**
    * This method is used to register listeners
    * @method addEventListener
    * @param type {String} Name of the event.
    * @param listener {Function} Listening function.
    */
    // jscs:enable
    function addEventListener(type, listener) {
      document.addEventListener(
        'thr0w_pdf_' + containerId + '_' + type,
        listener
      );
    }
    // jscs:disable
    /**
    * This method is used to deregister listeners
    * @method removeEventListener
    * @param type {String} Name of the event.
    * @param listener {Function} Listening function.
    */
    // jscs:enable
    function removeEventListener(type, listener) {
      document.removeEventListener(
        'thr0w_pdf_' + containerId + '_' + type,
        listener
      );
    }
    function handleGetDocument(pdf) {
      var numPages = pdf.numPages;
      var currPageNumber = 1;
      var sync = new thr0w.Sync(grid, 'thr0w_pdf_' + containerId,
        message, receive
      );
      self.getNumPages = getNumPages;
      self.getCurrPageNumber = getCurrPageNumber;
      self.openPage = openPage;
      self.openNextPage = openNextPage;
      self.openPrevPage = openPrevPage;
      self.destroy = destroy;
      openPageInPosition(1, CENTER);
      if (numPages > 1) {
        openPageInPosition(2, RIGHT);
      }
      // jscs:disable
      /**
      * PDF Ready
      *
      * @event ready
      */
      // jscs:enable
      document.dispatchEvent(new CustomEvent(
        'thr0w_pdf_' + containerId + '_' + 'ready', {}
      ));
      function message() {
        return {
          currPageNumber: currPageNumber
        };
      }
      function receive(data) {
        var newCurrPageNumber = data.currPageNumber;
        if (newCurrPageNumber === currPageNumber) {
          return;
        }
        if (newCurrPageNumber === currPageNumber + 1) {
          openNextPagePrivate();
        } else if (newCurrPageNumber === currPageNumber - 1) {
          openPrevPagePrivate();
        } else {
          openPagePrivate(newCurrPageNumber);
        }
      }
      // jscs:disable
      /**
      * This method returns the number of pages in PDF.
      * @method getNumPages
      * @return {Number} The number of pages.
      */
      // jscs:enable
      function getNumPages() {
        return numPages;
      }
      // jscs:disable
      /**
      * This method returns the current page of the PDF.
      * @method getCurrPageNumber
      * @return {Number} The current page number.
      */
      // jscs:enable
      function getCurrPageNumber() {
        return currPageNumber;
      }
      // jscs:disable
      /**
      * This method opens a page.
      * @method openPage
      * @param pageNumber {Number} The page number.
      */
      // jscs:enable
      function openPage(pageNumber) {
        if (pageNumber === undefined || typeof pageNumber !== 'number') {
          throw 400;
        }
        if (pageNumber < 1 || pageNumber > numPages) {
          throw 400;
        }
        if (pageNumber === currPageNumber) {
          return;
        }
        openPagePrivate(pageNumber);
        sync.update();
        sync.idle();
      }
      function openPagePrivate(pageNumber) {
        closePage(currPageNumber);
        if (currPageNumber > 1) {
          closePage(currPageNumber - 1);
        }
        if (currPageNumber < numPages) {
          closePage(currPageNumber + 1);
        }
        openPageInPosition(pageNumber, CENTER);
        if (pageNumber > 1) {
          openPageInPosition(pageNumber - 1, LEFT);
        }
        if (pageNumber < numPages) {
          openPageInPosition(pageNumber + 1, RIGHT);
        }
        currPageNumber = pageNumber;
      }
      // jscs:disable
      /**
      * This method opens the next page.
      * @method openNextPage
      */
      // jscs:enable
      function openNextPage() {
        openNextPagePrivate();
        sync.update();
        sync.idle();
      }
      function openNextPagePrivate() {
        var pageNumber = Math.min(numPages, currPageNumber + 1);
        if (pageNumber === currPageNumber) {
          return;
        }
        currPageNumber = pageNumber;
        document.getElementById('thr0w_pdf_carosel__page--' +
          containerId + '_' +
          (currPageNumber - 1)).style.transform =
          'translateX(-' + containerWidth + 'px) ' +
          'translateZ(0px)';
        document.getElementById('thr0w_pdf_carosel__page--' +
          containerId + '_' +
          currPageNumber).style.transform = 'translateZ(0px)';
        if (currPageNumber > 2) {
          closePage(currPageNumber - 2);
        }
        if (currPageNumber < numPages) {
          openPageInPosition(currPageNumber + 1, RIGHT);
        }
        // jscs:disable
        /**
        * Page Open
        *
        * @event page_open
        */
        // jscs:enable
        document.dispatchEvent(new CustomEvent(
          'thr0w_pdf_' + containerId + '_' + 'page_open', {}
        ));
      }
      // jscs:disable
      /**
      * This method opens the previous page.
      * @method openPrevPage
      */
      // jscs:enable
      function openPrevPage() {
        openPrevPagePrivate();
        sync.update();
        sync.idle();
      }
      function openPrevPagePrivate() {
        var pageNumber = Math.max(1, currPageNumber - 1);
        if (pageNumber === currPageNumber) {
          return;
        }
        currPageNumber = pageNumber;
        document.getElementById('thr0w_pdf_carosel__page--' +
          containerId + '_' +
          (currPageNumber + 1)).style.transform =
          'translateX(' + containerWidth + 'px) ' +
          'translateZ(0px)';
        document.getElementById('thr0w_pdf_carosel__page--' +
          containerId + '_' +
          currPageNumber).style.transform = 'translateZ(0px)';
        if (currPageNumber < numPages - 1) {
          closePage(currPageNumber + 2);
        }
        if (currPageNumber > 1) {
          openPageInPosition(currPageNumber - 1, LEFT);
        }
        document.dispatchEvent(new CustomEvent(
          'thr0w_pdf_' + containerId + '_' + 'page_open', {}
        ));
      }
      // jscs:disable
      /**
      * This method destroys the PDF
      * @method destroy
      */
      // jscs:enable
      function destroy() {
        closePage(currPageNumber);
        if (currPageNumber > 1) {
          closePage(currPageNumber - 1);
        }
        if (currPageNumber < numPages) {
          closePage(currPageNumber + 1);
        }
        sync.destroy();
        containerEl.classList.remove('thr0w_pdf_carosel');
      }
      function openPageInPosition(pageNumber, position) {
        var canvasEl = document.createElement('canvas');
        var context = canvasEl.getContext('2d');
        var pageEl = document.createElement('div');
        canvasEl.classList.add('thr0w_pdf_carosel__page__canvas');
        pageEl.appendChild(canvasEl);
        pageEl.id = 'thr0w_pdf_carosel__page--' + containerId +
          '_' + pageNumber;
        pageEl.style.width = containerWidth + 'px';
        pageEl.style.height = containerHeight + 'px';
        pageEl.classList.add('thr0w_pdf_carosel__page');
        switch (position) {
          case LEFT:
            pageEl.style.transform = 'translateX(-' + containerWidth + 'px) ' +
              'translateZ(0px)';
            containerEl.insertBefore(pageEl, containerEl.firstChild);
            break;
          case RIGHT:
            pageEl.style.transform = 'translateX(' + containerWidth + 'px) ' +
              'translateZ(0px)';
            containerEl.appendChild(pageEl);
            break;
          default:
            pageEl.style.transform = 'translateZ(0px)';
            containerEl.appendChild(pageEl);
        }
        pdf.getPage(pageNumber).then(handleGetPage);
        function handleGetPage(page) {
          var viewport = page.getViewport(1);
          var scaleX = containerWidth / viewport.width;
          var scaleY = containerHeight / viewport.height;
          var scale = Math.min(scaleX, scaleY);
          canvasEl.width = viewport.width * scale;
          canvasEl.height = viewport.height * scale;
          viewport = page.getViewport(scale);
          page.render({
            canvasContext: context,
            viewport: viewport
          });
        }
      }
      function closePage(pageNumber) {
        var pageEl = document
          .getElementById('thr0w_pdf_carosel__page--' +
            containerId + '_' + pageNumber);
        containerEl.removeChild(pageEl);
      }
    }
    function handleGetDocumentError() {
      throw 400;
    }
  }
})();
