#!/usr/bin/env bun
// Convert a Markdown file to a nicely styled PDF via Puppeteer.
// Usage: bun scripts/md-to-pdf.mjs <input.md> <output.pdf> [title]

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { marked } from "marked";
import puppeteer from "puppeteer";

const [inputArg, outputArg, titleArg] = process.argv.slice(2);
if (!inputArg || !outputArg) {
  console.error("Usage: bun scripts/md-to-pdf.mjs <input.md> <output.pdf> [title]");
  process.exit(1);
}

const inputPath = resolve(inputArg);
const outputPath = resolve(outputArg);
const title = titleArg ?? "Document";

const markdown = await readFile(inputPath, "utf8");
const bodyHtml = marked.parse(markdown);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  :root {
    --text: #1a1a1a;
    --muted: #555;
    --accent: #3d2fad;
    --border: #d4d4d8;
    --bg-soft: #f5f5f7;
    --code-bg: #f0f0f2;
  }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    color: var(--text);
    line-height: 1.55;
    font-size: 10.5pt;
    max-width: 7.5in;
    margin: 0 auto;
    padding: 0 0.2in;
  }
  h1 {
    font-size: 22pt;
    margin: 0 0 0.3em;
    border-bottom: 2px solid var(--accent);
    padding-bottom: 0.2em;
    color: var(--accent);
  }
  h2 {
    font-size: 15pt;
    margin: 1.6em 0 0.4em;
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.15em;
    page-break-after: avoid;
  }
  h3 {
    font-size: 12.5pt;
    margin: 1.2em 0 0.3em;
    color: #2d2d2d;
    page-break-after: avoid;
  }
  h4 {
    font-size: 11pt;
    margin: 0.8em 0 0.2em;
    color: #444;
  }
  p { margin: 0.4em 0 0.6em; }
  ul, ol { margin: 0.3em 0 0.7em 1.3em; padding: 0; }
  li { margin: 0.1em 0; }
  strong { color: #000; }
  em { color: var(--muted); }
  hr {
    border: none;
    border-top: 1px solid var(--border);
    margin: 1.5em 0;
  }
  a { color: var(--accent); text-decoration: none; }
  blockquote {
    border-left: 3px solid var(--accent);
    margin: 0.5em 0;
    padding: 0.1em 0.9em;
    color: var(--muted);
    background: var(--bg-soft);
    border-radius: 0 4px 4px 0;
  }
  blockquote p { margin: 0.3em 0; }
  code {
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    background: var(--code-bg);
    padding: 0.1em 0.4em;
    border-radius: 3px;
    font-size: 0.92em;
  }
  pre {
    background: var(--code-bg);
    padding: 0.7em 1em;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 9pt;
    line-height: 1.45;
  }
  pre code { background: transparent; padding: 0; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0.6em 0 0.9em;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid var(--border);
    padding: 0.45em 0.65em;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: var(--bg-soft);
    font-weight: 600;
  }
  tr { page-break-inside: avoid; }
  input[type="checkbox"] { margin-right: 0.4em; }
  @page { margin: 0.7in 0.6in; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle0" });
await page.pdf({
  path: outputPath,
  format: "Letter",
  margin: { top: "0.7in", bottom: "0.7in", left: "0.6in", right: "0.6in" },
  printBackground: true,
});
await browser.close();
console.log(`PDF saved to: ${outputPath}`);
