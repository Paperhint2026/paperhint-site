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
  {
    label: 'Product',
    href: '/product',
    sections: [
      {
        title: 'Where the work happens',
        items: [
          ['At the teacher’s desk', '/product#desk', 'Marking, question papers, notes, homework'],
          ['In the school office', '/product#office', 'Allotments, attendance, the year itself'],
          ['Around the classroom', '/product#classroom', 'Records, results and the people at home'],
        ],
      },
    ],
    more: ['See the whole product', '/product'],
  },
  {
    label: 'Why Paperhint',
    href: '/teachers',
    sections: [
      {
        title: 'Who it’s for',
        items: [
          ['Teachers', '/teachers', 'The week, without the paperwork'],
          ['Schools', '/schools', 'The office stops keying things in'],
          ['Students', '/students', 'Your work, recorded properly'],
          ['Parents', '/parents', 'You hear it the day it happens'],
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
