(function () {
  "use strict";

  const deepFreeze = (value) => {
    Object.values(value).forEach((child) => {
      if (child && typeof child === "object" && !Object.isFrozen(child)) deepFreeze(child);
    });
    return Object.freeze(value);
  };

  const content = deepFreeze({
    headline: "Build the swarm that builds the future of science.",
    event: {
      name: "ScienceSwarm",
      targetParticipants: 150,
      duration: "3 days",
      teamSize: "2–5",
      challengeAreas: 4,
      dates: "Oct 30 – Nov 1, 2026",
      venue: "MIT Media Lab",
      contact: "fw2@mit.edu",
      url: "https://swarmhack.ai",
    },
    tiers: [
      { key: "supporter", name: "Supporter", amount: "$5K", representatives: 2 },
      { key: "builder", name: "Builder", amount: "$15K", representatives: 4 },
      { key: "platform", name: "Platform", amount: "$30K", representatives: 6 },
      { key: "presenting", name: "Presenting", amount: "$50K", representatives: 8 },
    ],
  });

  window.SWARM_SPONSOR_CONTENT = content;

  document.querySelectorAll("[data-shared-headline]").forEach((element) => {
    element.textContent = content.headline;
  });
  document.querySelectorAll("[data-shared-target]").forEach((element) => {
    element.textContent = String(content.event.targetParticipants);
  });
  document.querySelectorAll("[data-shared-contact]").forEach((element) => {
    element.textContent = content.event.contact;
    if (element instanceof HTMLAnchorElement) element.href = `mailto:${content.event.contact}`;
  });
  document.querySelectorAll("[data-shared-url]").forEach((element) => {
    element.textContent = content.event.url.replace(/^https?:\/\//, "");
    if (element instanceof HTMLAnchorElement) element.href = content.event.url;
  });
  document.querySelectorAll("[data-tier]").forEach((element) => {
    const tier = content.tiers.find((candidate) => candidate.key === element.dataset.tier);
    if (!tier) return;
    const name = element.querySelector("span");
    const amount = element.querySelector("strong");
    if (name) name.textContent = tier.name;
    if (amount) amount.textContent = tier.amount;
  });
})();
