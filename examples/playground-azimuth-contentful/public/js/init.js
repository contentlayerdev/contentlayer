window.onNextjsAppDidMount = function() {
// Sticky header
var offsetY = 0;
var ticking = false;

window.addEventListener('scroll', function (e) {
  offsetY = window.scrollY;
  if (!ticking) {
    window.requestAnimationFrame(function () {
      handleHeader(offsetY);
      ticking = false;
    });
    ticking = true;
  }
});

function handleHeader(scrollPos) {
  if (scrollPos > 0) {
    document.body.classList.add('has--scrolled');
  } else {
    document.body.classList.remove('has--scrolled');
  }
}

};