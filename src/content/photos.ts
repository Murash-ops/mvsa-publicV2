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
 * Note the shape counts: of the venue's photographs, 34 are portrait and
 * 1 is not. There is no wide photograph of the arena, which is why
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
  { src: "/images/gallery/shot-15.webp", w: 1600, h: 1600, shape: "square" },
  { src: "/images/gallery/shot-16.webp", w: 960, h: 1280, shape: "portrait" },
  { src: "/images/gallery/shot-17.webp", w: 960, h: 1280, shape: "portrait" },
  { src: "/images/gallery/shot-18.webp", w: 960, h: 1280, shape: "portrait" },
  { src: "/images/gallery/shot-19.webp", w: 960, h: 1280, shape: "portrait" },
  { src: "/images/gallery/shot-20.webp", w: 960, h: 1280, shape: "portrait" },
  { src: "/images/gallery/shot-21.webp", w: 900, h: 1600, shape: "portrait" },
  { src: "/images/gallery/shot-22.webp", w: 1200, h: 1600, shape: "portrait" },
  { src: "/images/gallery/shot-23.webp", w: 1350, h: 2400, shape: "portrait" },
  { src: "/images/gallery/shot-24.webp", w: 1350, h: 2400, shape: "portrait" },
  { src: "/images/gallery/shot-25.webp", w: 1350, h: 2400, shape: "portrait" },
  { src: "/images/gallery/shot-26.webp", w: 1350, h: 2400, shape: "portrait" },
  { src: "/images/gallery/shot-27.webp", w: 1350, h: 2400, shape: "portrait" },
  { src: "/images/gallery/shot-28.webp", w: 1350, h: 2400, shape: "portrait" },
  { src: "/images/gallery/shot-29.webp", w: 1350, h: 2400, shape: "portrait" },
  { src: "/images/gallery/shot-30.webp", w: 1350, h: 2400, shape: "portrait" },
  { src: "/images/gallery/shot-31.webp", w: 1350, h: 2400, shape: "portrait" },
  { src: "/images/gallery/shot-32.webp", w: 1350, h: 2400, shape: "portrait" },
  { src: "/images/gallery/shot-33.webp", w: 1350, h: 2400, shape: "portrait" },
  { src: "/images/gallery/shot-34.webp", w: 1350, h: 2400, shape: "portrait" },
  { src: "/images/gallery/shot-35.webp", w: 900, h: 1600, shape: "portrait" },
];

/** The opening photograph. Index 0, so swapping it is a one-line change. */
export const heroPhoto: GalleryPhoto = gallery[0];

/** The painted lockup from the arena's own signage. Artwork, not a photograph. */
export const brandLockup: Photo = { src: "/images/brand/lockup.webp", w: 1600, h: 1043 };
