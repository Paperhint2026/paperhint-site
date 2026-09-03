/* What the assistant can see of the website.
 *
 * Built from the same data the pages render — src/data/nav.js, product.js and
 * roles.js — so a section cannot be renamed on a page and left stale in the
 * assistant's head. Two exports: a compact map for the prompt, and a
 * validator, because a model asked for a path will eventually invent one and
 * a 404 offered by the assistant is worse than no link at all.
 */
import { PRODUCT } from '../src/data/product.js';
import { ROLES, ORDER } from '../src/data/roles.js';

/* Anchors that live on the home page. These are ids in the markup rather than
   generated data, so they are listed here and covered by a test. */
const HOME = [
  ['/#evaluation', 'Papers and evaluation, on the home page'],
  ['/#question-papers', 'Homework and assignments, on the home page'],
  ['/#teaching-notes', 'Teaching notes and the copilot, on the home page'],
  ['/#shared-library', 'The shared library, on the home page'],
  ['/#school-portal', 'Attendance and the school portal, on the home page'],
  ['/#capabilities', 'What each role gets, as tabs on the home page'],
];

const PAGES = [
  ['/', 'Home'],
  ['/product', 'The whole product, feature by feature'],
  ...PRODUCT.groups.map(g => ['/product#' + g.id, g.title + ' — ' + g.lead]),
  ...ORDER.map(k => ['/' + k, ROLES[k].nav + ' — ' + ROLES[k].sub]),
  ['/pricing', 'How a licence works'],
  ['/about', 'Why we built Paperhint'],
  ['/contact', 'Contact and booking a demo'],
  ['/privacy', 'What the site collects'],
  ...HOME,
];

export const PATHS = PAGES.map(([p]) => p);

/* Exactly one of the known paths. No prefix matching: "/product#anything"
   must be a section that exists, and a trailing slash or query is refused
   rather than guessed at. */
export function isKnownPath(p) {
  return PATHS.indexOf(String(p || '').trim()) > -1;
}

export function sitemapText() {
  return PAGES.map(([p, d]) => '  ' + p + '  — ' + String(d).replace(/\s+/g, ' ').slice(0, 96)).join('\n');
}
