import danceData from "./ideas/dance.json";
import musicData from "./ideas/music.json";
import visualArtData from "./ideas/visual-art.json";
import videoData from "./ideas/video.json";
import photographyData from "./ideas/photography.json";
import writingData from "./ideas/writing.json";
import filmAnimationData from "./ideas/film-animation.json";
import gamesData from "./ideas/games.json";
import theaterData from "./ideas/theater.json";
import fashionData from "./ideas/fashion.json";
import hooksData from "./ideas/hooks.json";

export type NetworkVariant = "preview" | "preprod" | "undeployed" | "undeployed-fly" | "mainnet";
export type Protocol = "a2a-ap2" | "ucp" | "x402";

export const PROTOCOL_LABELS: Record<Protocol, string> = {
  "a2a-ap2": "A2A + AP2",
  "ucp": "UCP",
  "x402": "x402 · mUSDC",
};

export type Idea = {
  id: string;
  theme: string;
  title: string;
  pitch: string;
  subDiscipline: string;
  quantumHook: string;
  quantumHookId: string;
  quantumTag: string;
  quantumRationale: string;
  tam: string;
  sam: string;
  som: string;
  /** Optional agentic-commerce overlay. Base prompts leave this undefined. */
  protocol?: Protocol;
};


export type Theme = {
  slug: string;
  name: string;
  emoji: string;
  audience: string;
  market_anchor: string;
};

export type Hook = {
  id: string;
  name: string;
  tag: string;
  kernel: string;
  ui: string;
};

type ThemeFile = { theme: Theme; ideas: Idea[] };

const files: ThemeFile[] = [
  danceData as ThemeFile,
  musicData as ThemeFile,
  visualArtData as ThemeFile,
  videoData as ThemeFile,
  photographyData as ThemeFile,
  writingData as ThemeFile,
  filmAnimationData as ThemeFile,
  gamesData as ThemeFile,
  theaterData as ThemeFile,
  fashionData as ThemeFile,
];

export const THEMES: Theme[] = files.map((f) => f.theme);
export const HOOKS: Hook[] = hooksData as Hook[];

export const ALL_IDEAS: Idea[] = files.flatMap((f) => f.ideas);

export const IDEAS_BY_THEME: Record<string, Idea[]> = Object.fromEntries(
  files.map((f) => [f.theme.slug, f.ideas]),
);

export const IDEAS_BY_PROTOCOL: Record<Protocol, Idea[]> = {
  "a2a-ap2": ALL_IDEAS.filter((i) => i.protocol === "a2a-ap2"),
  "ucp":     ALL_IDEAS.filter((i) => i.protocol === "ucp"),
  "x402":    ALL_IDEAS.filter((i) => i.protocol === "x402"),
};


const IDEA_INDEX: Record<string, Idea> = Object.fromEntries(
  ALL_IDEAS.map((i) => [i.id, i]),
);

export function getIdea(id: string): Idea | undefined {
  return IDEA_INDEX[id];
}

export function getTheme(slug: string): Theme | undefined {
  return THEMES.find((t) => t.slug === slug);
}

export function getHook(id: string): Hook | undefined {
  return HOOKS.find((h) => h.id === id);
}
