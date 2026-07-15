(() => {
  const content = document.querySelector(".docs-content");
  if (!content) return;

  function updateOverflow(region, element) {
    const overflowing = element.scrollWidth > element.clientWidth + 1;
    const atEnd = element.scrollLeft + element.clientWidth >= element.scrollWidth - 2;
    region.classList.toggle("has-overflow", overflowing);
    region.classList.toggle("is-scrolled-end", !overflowing || atEnd);
  }

  function wrapScrollable(element, className) {
    const region = document.createElement("div");
    region.className = `docs-scroll-region ${className}`;
    element.before(region);
    region.append(element);
    const update = () => updateOverflow(region, element);
    element.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    requestAnimationFrame(update);
    return region;
  }

  for (const pre of content.querySelectorAll("pre")) {
    const region = wrapScrollable(pre, "docs-code-block");
    const button = document.createElement("button");
    button.className = "docs-copy-button";
    button.type = "button";
    button.textContent = "Copy";
    button.setAttribute("aria-label", "Copy code to clipboard");
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(pre.textContent);
        button.textContent = "Copied";
        button.setAttribute("aria-label", "Code copied to clipboard");
        window.setTimeout(() => {
          button.textContent = "Copy";
          button.setAttribute("aria-label", "Copy code to clipboard");
        }, 1400);
      } catch {
        button.textContent = "Select code";
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(pre);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });
    region.prepend(button);
  }

  for (const table of content.querySelectorAll("table")) {
    wrapScrollable(table, "docs-table-region");
  }
})();
