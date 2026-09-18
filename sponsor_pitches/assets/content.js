(function () {
  "use strict";

  const deepFreeze = (value) => {
    Object.values(value).forEach((child) => {
      if (child && typeof child === "object" && !Object.isFrozen(child)) deepFreeze(child);
    });
    return Object.freeze(value);
  };

  const content = deepFreeze({
    headline: "Build the collective that builds the future of science.",
    event: {
      name: "ScienceClaw",
      targetParticipants: 150,
      duration: "3 days",
      teamSize: "2–5",
      challengeAreas: 4,
      dates: "Oct 30 – Nov 1, 2026",
      venue: "MIT Media Lab",
      contact: "fw2@mit.edu",
      url: "https://scienceclaw.dev",
    },
    tiers: [
      { key: "supporter", name: "Supporter", amount: "$5K", representatives: 2, summary: "Visibility, two passes, mentors, and showcase access." },
      { key: "builder", name: "Builder", amount: "$15K", representatives: 4, summary: "Adds a workshop, toolkit placement, demo table, and opt-in directory." },
      { key: "platform", name: "Platform", amount: "$30K", representatives: 6, summary: "Adds a challenge, judging, prominent branding, and curated introductions." },
      { key: "presenting", name: "Presenting", amount: "$50K", representatives: 8, summary: "Adds premier attribution, stage time, private preview, and an outcomes report." },
    ],
    benefitRows: [
      { label: "Representative passes", supporter: "2", builder: "4", platform: "6", presenting: "8" },
      { label: "Technical mentors", supporter: "●", builder: "●", platform: "●", presenting: "●" },
      { label: "Website and sponsor acknowledgment", supporter: "●", builder: "●", platform: "Prominent", presenting: "Premier" },
      { label: "Workshop or technical session", supporter: "—", builder: "30 min", platform: "45 min", presenting: "60 min" },
      { label: "Participant toolkit and demo table", supporter: "—", builder: "●", platform: "●", presenting: "●" },
      { label: "Opt-in project and talent directory", supporter: "—", builder: "Post-event", platform: "Post-event", presenting: "Post-event" },
      { label: "Sponsor challenge and prize", supporter: "—", builder: "—", platform: "●", presenting: "●" },
      { label: "Judging seat and curated introductions", supporter: "—", builder: "—", platform: "●", presenting: "●" },
      { label: "Opening remarks and private demo preview", supporter: "—", builder: "—", platform: "—", presenting: "●" },
      { label: "Tailored outcomes report", supporter: "—", builder: "—", platform: "—", presenting: "●" },
    ],
    capabilityPartner: {
      label: "Capability Partner · In kind",
      terms: "Compute, APIs, models, datasets, robots, sensors, fabrication, or laboratory access. Recognition is based on usable event value and support—not list price.",
    },
    guardrails: {
      judging: "Sponsorship supports access and participation—not guaranteed outcomes or favorable judging.",
      privacy: "Participant information is shared only with explicit consent.",
    },
  });

  const guardrails = `${content.guardrails.judging} ${content.guardrails.privacy}`;

  const sharedText = {
    "[data-shared-event-dates]": content.event.dates,
    "[data-shared-event-venue]": content.event.venue,
    "[data-shared-event-summary]": `${content.event.dates} · ${content.event.venue}`,
    "[data-shared-duration]": content.event.duration,
    "[data-shared-team-size]": content.event.teamSize,
    "[data-shared-challenge-areas]": String(content.event.challengeAreas),
    "[data-shared-capability-label]": content.capabilityPartner.label,
    "[data-shared-capability-terms]": content.capabilityPartner.terms,
    "[data-shared-guardrails]": guardrails,
  };

  Object.entries(sharedText).forEach(([selector, value]) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.textContent = value;
    });
  });

  document.querySelectorAll("[data-shared-benefits-matrix]").forEach((tableBody) => {
    tableBody.replaceChildren(...content.benefitRows.map((row) => {
      const tableRow = document.createElement("tr");
      const heading = document.createElement("th");
      heading.scope = "row";
      heading.textContent = row.label;
      tableRow.append(heading);
      content.tiers.forEach((tier) => {
        const cell = document.createElement("td");
        cell.textContent = row[tier.key];
        tableRow.append(cell);
      });
      return tableRow;
    }));
  });

  window.SCIENCECLAW_SPONSOR_CONTENT = content;

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
    const summary = element.querySelector("p");
    if (name) name.textContent = tier.name;
    if (amount) amount.textContent = tier.amount;
    if (summary) summary.textContent = tier.summary;
  });
})();
