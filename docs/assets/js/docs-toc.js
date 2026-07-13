(() => {
  const content = document.querySelector(".docs-content");
  if (!content) return;

  const headings = [...content.querySelectorAll(":scope > h2, :scope > h3")]
    .filter(heading => heading.id);
  if (headings.length < 4) return;

  const navigation = document.createElement("nav");
  navigation.className = "docs-page-toc";
  navigation.setAttribute("aria-label", "On this page");

  const title = document.createElement("strong");
  title.textContent = "On this page";
  navigation.append(title);

  const list = document.createElement("ul");
  for (const heading of headings) {
    const item = document.createElement("li");
    if (heading.tagName === "H3") item.className = "is-nested";
    const link = document.createElement("a");
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    item.append(link);
    list.append(item);
  }
  navigation.append(list);

  const firstHeading = content.querySelector(":scope > h2");
  content.insertBefore(navigation, firstHeading);
})();
