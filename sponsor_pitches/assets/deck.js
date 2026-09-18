(function () {
  "use strict";

  const slides = Array.from(document.querySelectorAll(".slide"));
  if (!slides.length) return;

  const controls = document.createElement("nav");
  controls.className = "deck-controls";
  controls.setAttribute("aria-label", "Slide controls");
  controls.innerHTML = `
    <button type="button" class="deck-control deck-control--previous" aria-label="Previous slide">←</button>
    <span class="deck-status" aria-live="polite"></span>
    <span class="deck-progress" aria-hidden="true"><span></span></span>
    <button type="button" class="deck-control deck-control--next" aria-label="Next slide">→</button>
  `;
  document.body.append(controls);

  const previous = controls.querySelector(".deck-control--previous");
  const next = controls.querySelector(".deck-control--next");
  const status = controls.querySelector(".deck-status");
  const progress = controls.querySelector(".deck-progress span");
  let activeIndex = 0;

  const indexFromHash = () => {
    const match = window.location.hash.match(/^#slide-(\d+)$/);
    if (!match) return 0;
    return Math.min(Math.max(Number(match[1]) - 1, 0), slides.length - 1);
  };

  const sizeDeck = () => {
    const scale = Math.min(window.innerWidth / 1600, window.innerHeight / 900);
    document.documentElement.style.setProperty("--deck-scale", String(scale));
  };

  const showSlide = (index) => {
    activeIndex = Math.min(Math.max(index, 0), slides.length - 1);
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === activeIndex;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });
    const humanIndex = activeIndex + 1;
    status.textContent = `${String(humanIndex).padStart(2, "0")} / ${slides.length}`;
    progress.style.width = `${(humanIndex / slides.length) * 100}%`;
    previous.disabled = activeIndex === 0;
    next.disabled = activeIndex === slides.length - 1;
    history.replaceState(null, "", `#slide-${humanIndex}`);
  };

  previous.addEventListener("click", () => showSlide(activeIndex - 1));
  next.addEventListener("click", () => showSlide(activeIndex + 1));
  window.addEventListener("hashchange", () => showSlide(indexFromHash()));
  window.addEventListener("resize", sizeDeck);
  document.addEventListener("keydown", (event) => {
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (["ArrowRight", "PageDown", " "].includes(event.key)) {
      event.preventDefault();
      showSlide(activeIndex + 1);
    } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
      event.preventDefault();
      showSlide(activeIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      showSlide(0);
    } else if (event.key === "End") {
      event.preventDefault();
      showSlide(slides.length - 1);
    }
  });

  document.body.classList.add("is-presenting");
  sizeDeck();
  showSlide(indexFromHash());
})();
