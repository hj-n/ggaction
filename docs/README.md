# Documentation development

The public site is generated from this directory with the same pinned Jekyll
runtime used by continuous integration.

Install JavaScript and Ruby dependencies once:

```bash
npm ci
bundle install
npx playwright install chromium
```

Run the complete documentation pipeline:

```bash
npm run docs:verify
```

The command regenerates exact TypeScript signatures, chart images and
thumbnails, and the LLM bundle before checking Markdown contracts. It then
builds `_site`, verifies rendered links and assets, and exercises search,
navigation, keyboard behavior, and responsive containment in Chromium.

For a build without browser verification, run `npm run docs:build` followed by
`npm run test:docs:built`.
