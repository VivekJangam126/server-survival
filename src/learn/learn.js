// ===============================
// Learn Page Logic
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const conceptList = document.getElementById("concept-list");
  const contentContainer = document.getElementById("concept-content");

  if (!conceptList || !contentContainer) {
    console.error("Learn page elements not found");
    return;
  }

  // Render a concept
  function renderConcept(key) {
    const concept = LEARN_CONCEPTS[key];

    if (!concept) {
      console.error(`Concept not found: ${key}`);
      return;
    }

    // Build sections HTML
    const sectionsHTML = concept.sections
      .map(
        (section) => `
          <div class="glass-panel p-4">
            <h4 class="font-semibold mb-2">${section.title}</h4>
            <p class="text-sm text-gray-400">${section.text}</p>
          </div>
        `
      )
      .join("");

    // Render main content
    contentContainer.innerHTML = `
      <!-- Header -->
      <div class="glass-panel p-5">
        <h2 class="text-xl font-bold">${concept.title}</h2>
        <p class="text-gray-400 text-sm mt-1">
          ${concept.description}
        </p>
      </div>

      <!-- Video -->
      <div class="glass-panel p-5">
        ${concept.video}
      </div>

      <!-- Explanation Sections -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${sectionsHTML}
      </div>

      <!-- CTA -->
      <div class="glass-panel p-4 flex justify-center">
        <a href="play.html" class="quick-action-btn px-8 py-3 rounded-lg">
          Try This in Play Mode →
        </a>
      </div>
    `;
  }

  // Handle sidebar click
  function handleConceptClick(event) {
    const item = event.target.closest("[data-key]");
    if (!item) return;

    const key = item.dataset.key;

    // Update active state
    document
      .querySelectorAll("#concept-list .service-btn")
      .forEach((btn) => btn.classList.remove("active"));

    item.classList.add("active");

    // Render content
    renderConcept(key);
  }

  // Attach click listener
  conceptList.addEventListener("click", handleConceptClick);

  // Load default concept (first one)
  const defaultItem = conceptList.querySelector("[data-key]");
  if (defaultItem) {
    defaultItem.classList.add("active");
    renderConcept(defaultItem.dataset.key);
  }
});
