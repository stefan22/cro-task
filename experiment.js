(function (global) {
  var SL = {

    init: function () {
      this.injectCss();
      if (this.isTargetPage()) this.applyAll();
      this.observeGrid();
    },

    isTargetPage: function () {
      return location.pathname.replace(/\/$/, '') === '/shop/phones';
    },

    applyAll: function () {
      var allTariffCards = this.getTariffCards();
      this.removeColours(allTariffCards);
      this.ratingsAndFiveG(allTariffCards);
      this.removeStarDivider(allTariffCards);
      this.replaceLearnMoreWithIcon(allTariffCards);
      this.replaceCompareButtonWithCheckbox(allTariffCards);
      this.removePromoBanners();
    },

    removePromoBanners: function () {
      var banners = document.querySelectorAll('[id^="_15gifts-launchpad"], [data-testid="tile-fragment"]');
      banners.forEach(function (banner) {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
      });
    },

    observeGrid: function () {
      var self = this;
      var timer = null;

      var observer = new MutationObserver(function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          if (self.isTargetPage()) self.applyAll();
        }, 150);
      });

      observer.observe(document.body, { childList: true, subtree: true });
    },

    injectCss: function () {
      var css = ''
          + '.vmo2cro-rating-row { display: flex; align-items: center; gap: 6px; }'
          + '.vmo2cro-stars { display: inline-flex; align-items: center; }'
          + '.vmo2cro-stars svg { width: 16px !important; height: 16px !important; stroke: #c7c7cc; }'
          + '.vmo2cro-star { font-size: 16px; line-height: 1; color: #c7c7cc; }'
          + '.vmo2cro-tight-top { padding-top: 4px !important; margin-top: 0 !important; }'
          + '.vmo2cro-tight-bottom { padding-bottom: 4px !important; margin-bottom: 0 !important; }'
          + '.vmo2cro-info-row { display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: center !important; }'
          + '.vmo2cro-hidden { display: none !important; }'
          + '.vmo2cro-compare-btn-hidden { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0,0,0,0) !important; white-space: nowrap !important; border: 0 !important; }'
          + '.vmo2cro-compare-wrap { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; gap: 8px; margin-top: 10px; font-size: 14px; cursor: pointer; user-select: none; }'
          + '.vmo2cro-compare-checkbox { position: absolute; opacity: 0; width: 18px; height: 18px; margin: 0; cursor: pointer; pointer-events: none; }'
          + '.vmo2cro-compare-box { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; min-width: 18px; border: 2px solid #6f7070; border-radius: 3px; background: #fff; box-sizing: border-box; }'
          + '[class*="product-card_card__"] { min-height: 515px !important; }'
          + '._block--height-auto_90isf_77 { height: fit-content; }'
          + '._type_rhfq_1:not(._type--color-inherit_rhfq_146) { padding: 0 10px; }'
          + '.vmo2cro-compare-box.vmo2cro-checked { background: #006400; border-color: #006400; }'
          + '.vmo2cro-compare-box.vmo2cro-checked::after { content: ""; width: 5px; height: 9px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg); margin-bottom: 2px; }';

      var style = document.createElement('style');
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);
    },

    getTariffCards: function () {
      // stable handles instead of fixed-depth hashed selector -
      var cardSelector = '[class*="product-card_card__"]';
      var tileSelector = '[data-testid="tile-fragment"]';
      var itemSelector = cardSelector + ', ' + tileSelector;

      var firstItem = document.querySelector(itemSelector);
      if (!firstItem) return [];

      // grid = nearest ancestor whose direct children are the card/tile items
      var grid = firstItem.parentElement;
      while (grid) {
        var directItems = Array.from(grid.children).filter(function (child) {
          return child.matches(itemSelector) || child.querySelector(itemSelector);
        });
        // reached the grid level wrapper, exit
        if (directItems.length > 1) break;
        grid = grid.parentElement;
      }

      if (!grid) return [];

      return Array.from(grid.children).filter(function (child) {
        return child.getAttribute('data-testid') !== 'tile-fragment';
      });
    },

    removeColours: function (allTariffCards) {
      allTariffCards.forEach(function (tcard) {
        var ele = tcard.children[0] && tcard.children[0].children[3];
        var eleLast = tcard.children[0] && tcard.children[0].children[2];

        var badge = null;
        if (ele && ele.classList && ele.classList.toString().indexOf('badge-colors-container') !== -1) {
          badge = ele;
        } else if (eleLast && eleLast.classList && eleLast.classList.toString().indexOf('badge-colors-container') !== -1) {
          badge = eleLast;
        }

        if (badge) {
          badge.parentNode.removeChild(badge);
        }
      });
    },

    ratingsAndFiveG: function (allTariffCards) {
      allTariffCards.forEach(function (tcard) {
        var bv = tcard.querySelector('[data-bv-show="inline_rating"]');
        var fiveG = tcard.querySelector('[class*="product-card_badges-container__"]');

        if (bv) {
          var offScreen = bv.querySelector('.bv-off-screen');
          var text = offScreen ? offScreen.textContent : '';
          var match = text.match(/([\d.]+)\s*out of 5/i);
          var currentRatingValue = match ? parseFloat(match[1]) : 0;

          if (currentRatingValue > 0) {
            bv.classList.add('vmo2cro-stars');
            var realSvgs = bv.querySelectorAll('svg');
            realSvgs.forEach(function (svg) {
              svg.removeAttribute('width');
              svg.removeAttribute('height');
              svg.style.setProperty('width', '16px', 'important');
              svg.style.setProperty('height', '16px', 'important');
              svg.style.setProperty('stroke', '#c7c7cc', 'important');
            });
          }
        }

        if (tcard.querySelector('.vmo2cro-rating-row')) return;

        // rating loads async - wait for it to finish loading
        // instead of treating it as "no rating" and deleting it.
        if (bv && bv.getAttribute('data-bv-ready') !== 'true') return;

        var ratingValue = bv ? currentRatingValue : 0;
        var ratingEl = bv;

        if (ratingValue === 0) {
          var stars = document.createElement('span');
          stars.className = 'vmo2cro-stars';
          for (var i = 0; i < 5; i++) {
            var star = document.createElement('span');
            star.className = 'vmo2cro-star';
            star.textContent = '☆';
            stars.appendChild(star);
          }

          if (bv && bv.parentNode) {
            bv.parentNode.insertBefore(stars, bv);
            bv.parentNode.removeChild(bv);
          } else {
            var heading = tcard.querySelector('h2, h3');
            if (heading && heading.parentNode) {
              heading.parentNode.insertBefore(stars, heading.nextSibling);
            }
          }

          ratingEl = stars;
        }

        if (fiveG) {
          var badgeText = fiveG.querySelector('[data-testid="badge-text"]') || fiveG.querySelector('p');
          if (badgeText) badgeText.textContent = '5G READY';
        }

        if (fiveG && ratingEl && ratingEl.parentNode) {
          var row = document.createElement('span');
          row.className = 'vmo2cro-rating-row';
          ratingEl.parentNode.insertBefore(row, ratingEl);
          row.appendChild(ratingEl);
          row.appendChild(fiveG);
        }
      });
    },

    removeStarDivider: function (allTariffCards) {
      allTariffCards.forEach(function (tcard) {
        var hr = tcard.querySelector('hr');
        if (!hr || !hr.parentNode) return;

        var dividerRow = hr.parentNode;
        var prevEl = dividerRow.previousElementSibling;
        var nextEl = dividerRow.nextElementSibling;

        dividerRow.parentNode.removeChild(dividerRow);

        if (prevEl) prevEl.classList.add('vmo2cro-tight-bottom');
        if (nextEl) nextEl.classList.add('vmo2cro-tight-top');
      });
    },

    replaceLearnMoreWithIcon: function (allTariffCards) {
      allTariffCards.forEach(function (tcard) {
        var label = tcard.querySelector('[data-testid="product-card-offers-trigger-label"]');
        if (label && label.parentNode) {
          label.parentNode.removeChild(label);
        }

        var trigger = tcard.querySelector('[data-testid="product-card-offers-trigger"]');
        if (trigger && trigger.parentNode && trigger.parentNode.parentNode) {
          trigger.parentNode.parentNode.classList.add('vmo2cro-info-row');
        }
      });
    },

    replaceCompareButtonWithCheckbox: function (allTariffCards) {
      allTariffCards.forEach(function (tcard) {
        var fieldset = tcard.querySelector('fieldset');
        if (!fieldset) return;

        if (fieldset.querySelector('.vmo2cro-compare-wrap')) return;

        var initialBtn = fieldset.querySelector('button');
        if (!initialBtn) return;

        // dom updates button when compare state changes
        // so check button to avoid stale reference
        function getCompareBtn() {
          return fieldset.querySelector('button');
        }

        function isPressed() {
          var btn = getCompareBtn();
          return !!btn && /remove from compare/i.test((btn.textContent || '').trim());
        }

        var wrap = document.createElement('span');
        wrap.className = 'vmo2cro-compare-wrap';

        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'vmo2cro-compare-checkbox';

        var box = document.createElement('span');
        box.className = 'vmo2cro-compare-box';

        function setPressedVisual(pressed) {
          checkbox.checked = pressed;
          box.classList.toggle('vmo2cro-checked', pressed);
        }

        setPressedVisual(isPressed());

        var text = document.createElement('span');
        text.textContent = 'Compare';

        wrap.appendChild(checkbox);
        wrap.appendChild(box);
        wrap.appendChild(text);

        wrap.addEventListener('click', function () {
          checkbox.checked = !checkbox.checked;
          box.classList.toggle('vmo2cro-checked', checkbox.checked);

          var btn = getCompareBtn();
          if (btn) btn.click();

          var settled = false;
          function settle() {
            if (settled) return;
            settled = true;
            watcher.disconnect();

            // site re-rendering removes injected js.
            // re-attached to currentFieldset
            var currentFieldset = tcard.querySelector('fieldset') || fieldset;
            if (!wrap.isConnected || !currentFieldset.contains(wrap)) {
              currentFieldset.appendChild(wrap);
            }

            var current = currentFieldset.querySelector('button');
            var pressed = !!current && /remove from compare/i.test((current.textContent || '').trim());
            setPressedVisual(pressed);
            if (current) current.classList.add('vmo2cro-compare-btn-hidden');
          }

          var watcher = new MutationObserver(function () {
            settle();
          });
          watcher.observe(fieldset.parentNode || fieldset, { childList: true, subtree: true, characterData: true });

          setTimeout(settle, 800);
        });

        initialBtn.classList.add('vmo2cro-compare-btn-hidden');
        fieldset.appendChild(wrap);
      });
    }

  };

  function start() {
    SL.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

})(window);
