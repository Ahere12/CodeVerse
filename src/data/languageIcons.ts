/**
 * Official logos from Simple Icons (CC0 icon data; the logos remain their owners' trademarks
 * and are used only to identify each language). Languages without a published logo
 * (C#, PowerShell, Assembly, MATLAB, generic SQL) fall back to a text mark.
 * Named imports keep the bundle to just these icons.
 */
import {
  siC,
  siCplusplus,
  siCss,
  siDart,
  siGnubash,
  siGo,
  siHtml5,
  siJavascript,
  siKotlin,
  siLua,
  siMongodb,
  siMysql,
  siNextdotjs,
  siNodedotjs,
  siOpenjdk,
  siPhp,
  siPostgresql,
  siPython,
  siR,
  siReact,
  siRuby,
  siRust,
  siSolidity,
  siSwift,
  siTypescript,
  type SimpleIcon,
} from 'simple-icons';

export const LANGUAGE_ICONS: Record<string, SimpleIcon> = {
  html: siHtml5,
  css: siCss,
  javascript: siJavascript,
  typescript: siTypescript,
  react: siReact,
  nextjs: siNextdotjs,
  nodejs: siNodedotjs,
  python: siPython,
  java: siOpenjdk,
  c: siC,
  cpp: siCplusplus,
  go: siGo,
  rust: siRust,
  ruby: siRuby,
  php: siPhp,
  kotlin: siKotlin,
  swift: siSwift,
  dart: siDart,
  postgresql: siPostgresql,
  mysql: siMysql,
  mongodb: siMongodb,
  bash: siGnubash,
  lua: siLua,
  solidity: siSolidity,
  r: siR,
};

/** Relative luminance of a #rrggbb colour, 0 (black) – 1 (white). */
export function luminance(hex: string): number {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
