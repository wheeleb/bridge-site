(function () {
  "use strict";

  var dialog = document.getElementById("lightbox");
  if (!dialog) return;

  var image = document.getElementById("lightbox-image");
  var webp = document.getElementById("lightbox-webp");
  var caption = document.getElementById("lightbox-caption");
  var items = Array.prototype.slice.call(
    document.querySelectorAll(".gallery-item")
  );
  var index = 0;
  var lastFocus = null;

  function show(i) {
    if (!items.length) return;
    index = (i + items.length) % items.length;
    var item = items[index];
    var jpg = item.getAttribute("data-full-jpg");
    var webpSrc = item.getAttribute("data-full-webp");
    var alt = item.getAttribute("data-alt") || "";
    var title = item.getAttribute("data-caption") || "";

    if (webp) {
      webp.setAttribute("srcset", webpSrc || "");
    }
    image.setAttribute("src", jpg || "");
    image.setAttribute("alt", alt);
    caption.textContent = title;

    var next = items[(index + 1) % items.length];
    var prev = items[(index - 1 + items.length) % items.length];
    preload(next);
    preload(prev);
  }

  function preload(item) {
    if (!item) return;
    var src = item.getAttribute("data-full-jpg");
    if (!src) return;
    var im = new Image();
    im.src = src;
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    dialog.querySelector("[data-lightbox-close]").focus();
  }

  function close() {
    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
  }

  dialog.addEventListener("close", function () {
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  });

  items.forEach(function (item, i) {
    item.addEventListener("click", function () {
      open(i);
    });
  });

  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) close();
  });

  var closeBtn = dialog.querySelector("[data-lightbox-close]");
  var prevBtn = dialog.querySelector("[data-lightbox-prev]");
  var nextBtn = dialog.querySelector("[data-lightbox-next]");

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", function () {
    show(index - 1);
  });
  nextBtn.addEventListener("click", function () {
    show(index + 1);
  });

  dialog.addEventListener("keydown", function (event) {
    if (!dialog.open && !dialog.hasAttribute("open")) return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      show(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      show(0);
    } else if (event.key === "End") {
      event.preventDefault();
      show(items.length - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      trapFocus(event);
    }
  });

  function trapFocus(event) {
    var focusable = dialog.querySelectorAll(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
})();
