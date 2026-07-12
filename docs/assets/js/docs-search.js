(() => {
  const input = document.querySelector("#docs-search-input");
  const results = document.querySelector("#docs-search-results");
  const source = document.querySelector("#docs-search-index");

  if (!input || !results || !source) return;

  let pages = [];
  try {
    pages = JSON.parse(source.textContent);
  } catch {
    input.disabled = true;
    input.placeholder = "Search unavailable";
    return;
  }

  function clearResults() {
    results.replaceChildren();
    results.hidden = true;
  }

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    if (query.length < 2) {
      clearResults();
      return;
    }

    const matches = pages
      .map(page => {
        const title = page.title.toLowerCase();
        const content = page.content.toLowerCase();
        const score = title === query
          ? 3
          : title.includes(query)
            ? 2
            : content.includes(query)
              ? 1
              : 0;
        return { ...page, score };
      })
      .filter(page => page.score > 0)
      .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
      .slice(0, 8);

    results.replaceChildren();
    if (matches.length === 0) {
      const empty = document.createElement("li");
      empty.className = "docs-search-empty";
      empty.textContent = "No matching pages";
      results.append(empty);
    } else {
      for (const match of matches) {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = match.url;
        link.textContent = match.title;
        item.append(link);
        results.append(item);
      }
    }
    results.hidden = false;
  });

  input.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      input.value = "";
      clearResults();
    }
  });

  document.addEventListener("click", event => {
    if (!event.target.closest(".docs-search")) clearResults();
  });
})();
