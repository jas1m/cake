/* =============================================
   Intro / Love Letter Envelope — Click Handler
   Adds a class to <body> to trigger CSS reveal.
   Does NOT touch any existing functionality.
   ============================================= */
(function () {
  var envelope = document.getElementById('introEnvelope');
  if (!envelope) return;

  envelope.addEventListener('click', function () {
    if (document.body.classList.contains('intro-opened')) return;
    document.body.classList.add('intro-opened');

    // Remove the overlay from the DOM after all animations finish (~3s)
    var overlay = document.getElementById('introOverlay');
    if (overlay) {
      setTimeout(function () {
        overlay.remove();
      }, 3000);
    }
  });
})();
