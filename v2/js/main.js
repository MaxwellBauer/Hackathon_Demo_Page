/* ============================================================
   SWARM — main.js
   Nav state, scroll reveals, animated rubric bars.
   ============================================================ */

// Nav background on scroll + scene veil once past the hero
const nav = document.getElementById("nav");
const onScroll = () => {
  nav.classList.toggle("nav--scrolled", window.scrollY > 40);
  if (window.scrollY > window.innerHeight * 0.5) {
    document.body.setAttribute("data-scrolled", "");
  } else {
    document.body.removeAttribute("data-scrolled");
  }
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Reveal-on-scroll + rubric bars
const io = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("reveal--in");

      const bars = entry.target.querySelectorAll(".rubric__bar");
      bars.forEach((bar, i) => {
        const w = Number(bar.dataset.w || 0);
        // scale bar width relative to the max weight (30%) so
        // proportions read honestly
        setTimeout(() => {
          bar.style.width = `${(w / 30) * 100}%`;
        }, 250 + i * 120);
      });

      io.unobserve(entry.target);
    }
  },
  { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
);

document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Stagger sibling reveals slightly for a cascading feel
document
  .querySelectorAll(".card-grid, .tracks, .rubric")
  .forEach((group) => {
    [...group.querySelectorAll(".reveal")].forEach((el, i) => {
      el.style.transitionDelay = `${i * 90}ms`;
    });
  });
