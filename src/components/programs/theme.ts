import type { ProgramTheme } from '@/content/programs';

/** Themes on a light ground (gold, paper, sage) use the light tokens. */
const LIGHT_THEMES: ReadonlySet<ProgramTheme> = new Set(['holiday', 'board', 'breath']);

export function isLightTheme(theme: ProgramTheme): boolean {
  return LIGHT_THEMES.has(theme);
}

/** The classes that put a block into a programme's theme. */
export function themeClass(theme: ProgramTheme): string {
  return `prog prog--${theme} ${isLightTheme(theme) ? 'theme-light' : 'theme-dark'}`;
}
