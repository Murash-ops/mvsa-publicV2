/**
 * The venue's own photographs, chosen by MVSA from the full shoot.
 *
 * Every file is WebP, longest edge 2400px. The width and height here are the
 * files' real pixel dimensions, read back from the converted images rather
 * than from the originals: the camera stored these rotated, with the upright
 * orientation only in EXIF, so the originals report their sides the wrong way
 * round. next/image uses these numbers to reserve space before a photograph
 * arrives, so a wrong pair means a visibly distorted frame.
 *
 * Every photograph listed here is portrait. There is no wide photograph of the arena, which is why
 * the hero is built as a split layout rather than a letterbox banner.
 */

export type Photo = { src: string; w: number; h: number };
export type GalleryPhoto = Photo & { shape: 'landscape' | 'portrait' | 'square' };

export const gallery: GalleryPhoto[] = [
  { src: "/images/gallery/shot-01.webp", w: 1350, h: 2400, shape: "portrait" },
  { src: "/images/gallery/shot-02.webp", w: 1350, h: 2400, shape: "portrait" },
  { src: "/images/gallery/shot-03.webp", w: 1350, h: 2400, shape: "portrait" },
  { src: "/images/gallery/shot-04.webp", w: 1350, h: 2400, shape: "portrait" },
  { src: "/images/gallery/shot-05.webp", w: 1350, h: 2400, shape: "portrait" },
  { src: "/images/gallery/shot-06.webp", w: 1350, h: 2400, shape: "portrait" },
  { src: "/images/gallery/shot-07.webp", w: 1350, h: 2400, shape: "portrait" },
  { src: "/images/gallery/shot-08.webp", w: 960, h: 1280, shape: "portrait" },
  { src: "/images/gallery/shot-09.webp", w: 1200, h: 1600, shape: "portrait" },
  { src: "/images/gallery/shot-10.webp", w: 1200, h: 1600, shape: "portrait" },
  { src: "/images/gallery/shot-11.webp", w: 900, h: 1600, shape: "portrait" },
  { src: "/images/gallery/shot-12.webp", w: 960, h: 1280, shape: "portrait" },
  { src: "/images/gallery/shot-13.webp", w: 900, h: 1600, shape: "portrait" },
  { src: "/images/gallery/shot-14.webp", w: 900, h: 1600, shape: "portrait" },
  { src: "/images/gallery/shot-16.webp", w: 960, h: 1280, shape: "portrait" },
  { src: "/images/gallery/shot-17.webp", w: 960, h: 1280, shape: "portrait" },
  { src: "/images/gallery/shot-18.webp", w: 960, h: 1280, shape: "portrait" },
  { src: "/images/gallery/shot-19.webp", w: 960, h: 1280, shape: "portrait" },
  { src: "/images/gallery/shot-20.webp", w: 960, h: 1280, shape: "portrait" },
  { src: "/images/gallery/shot-21.webp", w: 900, h: 1600, shape: "portrait" },
  { src: "/images/gallery/shot-22.webp", w: 1200, h: 1600, shape: "portrait" },
  { src: "/images/gallery/shot-23.webp", w: 1350, h: 2400, shape: "portrait" },
];

/**
 * The photographs worth showing, in the order they should appear.
 *
 * No child appears on this website. Every frame of the shoot with a player in
 * it is a child at an academy session, and a parent has not agreed to their
 * face being on a public page, so those frames are out - all of them, not the
 * closest-cropped ones. That rules out the liveliest pictures and leaves the
 * building, so this list works for variety instead: wide, then close, then
 * detail, so it does not read as one picture printed twelve times.
 *
 * The frames numbered 24 to 35 are not listed here at all, so nothing on the
 * site can reach them by accident. If consent is gathered later, add them back
 * one by one, deliberately.
 */
const FEATURED = [
  'shot-03', // the pitch end to end, goals in frame
  'shot-02', // the stand and the bench, sky behind
  'shot-16', // the turf at pitch level, the white line running out
  'shot-13', // the pitch from the far line
  'shot-08', // the turf itself, close
  'shot-07', // the benches and the cage, tree line behind
  'shot-18', // the line and the turf, close
  'shot-12', // the far side, open to the sky
  'shot-22', // the goalmouth and the centre circle
  'shot-04', // the length of the pitch, floodlights above
  'shot-21', // the bench under the cage, daylight
] as const;

const byName = (name: string) => gallery.find((p) => p.src.includes(name + '.'));

/** The curated set. Anything missing from disk is dropped rather than broken. */
export const featured: GalleryPhoto[] = FEATURED
  .map(byName)
  .filter((p): p is GalleryPhoto => Boolean(p));

/**
 * The opening photograph: the pitch, goals in frame.
 *
 * Every frame of the arena is portrait, taken on a phone held upright, so a
 * hero has to be a band cut out of the middle of one. This is a
 * full-resolution frame whose lower band holds the goals, the centre circle
 * and the length of the turf, which is what the band ends up showing.
 *
 * `objectPosition` holds that band. A browser centring the crop itself would
 * show the roof and the back wall instead.
 */
export const heroPhoto: GalleryPhoto & { objectPosition: string } = {
  ...(gallery.find((p) => p.src.includes('shot-04.')) ?? gallery[0]),
  objectPosition: 'center 62%',
};
