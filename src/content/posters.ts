/**
 * The posters people can download from What's on and /posters.
 *
 * A poster goes up in two steps, so nothing unapproved reaches the site by
 * accident: put the approved file in public/posters/ (e.g.
 * public/posters/community-yoga.jpg), list its name here, and deploy. Then put
 * /posters/community-yoga.jpg in the `poster` column of that card's row in the
 * What's on sheet (or src/content/whats-on.json).
 *
 * A poster named in the sheet but not listed here is left off the card, so a
 * card never links to a missing file. A test keeps this list and the folder in
 * step.
 */
export const posterFiles: readonly string[] = [
  // Approved by Murash, 25 Nov 2026 (week of 30 Nov feed poster).
  'weekend-academy.jpg',
];
