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

/* Did they actually ask to be taken somewhere? Only then will the server add
   a link the model left out. Anything less explicit is the model's call —
   the founder's rule is that navigation is offered, never shoved. */
const NAV_INTENT = /\b(where (can|do|should) i|is there a (page|section)|which page|take me|show me the page|read (more|about)|link to|see the (page|full)|full page|more details on the site)\b/i;

/* question → the page it is plainly about, in the order a specific match
   should beat a general one */
const TOPICS = [
  /* prefixes, not whole words: \bteacher\b never matches "teachers" */
  [/\bcopilot/i, '/product#copilot'],
  [/\bteach(er|ing)/i, '/teachers'],
  [/\b(school office|admin|allot|principal|office)/i, '/schools'],
  [/\b(pric|cost|licen)/i, '/pricing'],
  [/\b(privacy|gdpr)/i, '/privacy'],
  [/\b(demo|contact)/i, '/contact'],
  [/\b(about us|founder|why you built)/i, '/about'],
  [/\b(mark|evaluat|answer sheet|question paper|note|homework)/i, '/product#desk'],
  [/\b(attendance|register|migration|portal)/i, '/product#office'],
  [/\b(product|feature|everything|all of it)/i, '/product'],
];

const LABELS = {
  '/product#copilot': 'The copilot', '/teachers': "A teacher's week", '/schools': 'In the school office',
  '/pricing': 'How a licence works',
  '/privacy': 'What we collect', '/contact': 'Book a demo', '/about': 'Why we built it',
  '/product#desk': "At the teacher's desk", '/product#office': 'In the school office', '/product': 'The whole product',
};

export function askedToNavigate(question) { return NAV_INTENT.test(String(question || '')); }

export function pageFor(question) {
  const q = String(question || '');
  for (const [re, path] of TOPICS) {
    if (re.test(q) && isKnownPath(path)) return { href: path, label: LABELS[path] || 'Open the page' };
  }
  return null;
}
