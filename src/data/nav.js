/* The navigation hierarchy, in one place.
 *
 * Desktop panels and the mobile menu both render from this, so the two can
 * never drift. Every item carries a one-line note, the pattern amplemarket.com
 * uses under its own menus: a label alone makes someone guess.
 *
 * Top level stays at four, as it was, by grouping the roles and the company
 * pages behind "Why Paperhint" rather than adding items.
 */

export const MENUS = [
  /* Product is a plain link, not a menu: the page is now one page — banner,
     intro, then the features — so a dropdown offering four ways into it was
     offering choices that no longer exist. Its old anchors (#copilot, #desk,
     #office, #classroom) died with the group sections and were pointing at
     nothing. A menu with no `sections` renders as a link. */
  {
    label: 'Product',
    href: '/product',
  },
  {
    label: 'Why Paperhint',
    href: '/teachers',
    sections: [
      {
        title: 'Who it’s for',
        items: [
          ['Teachers', '/teachers', 'Walk into every class prepared'],
          ['Schools', '/schools', 'The office stops keying things in'],
        ],
      },
      {
        title: 'Us',
        items: [
          ['About', '/about', 'Why we built this'],
          ['Privacy', '/privacy', 'What we collect, plainly'],
        ],
      },
    ],
  },
];

/* the flat items that sit beside the menus */
export const FLAT = [
  ['Pricing', '/pricing'],
  ['Contact', '/contact'],
];
