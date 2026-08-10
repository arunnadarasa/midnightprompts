#!/usr/bin/env bun
// Generate public/llms-full.txt, public/llms-core.txt, and per-combo prompt files.
// Run with:  bun run scripts/build-llms-full.mjs

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { SITE_HEADER, GUIDES } from "../src/data/llms-content.ts";
import { ALL_IDEAS, THEMES } from "../src/data/ideas.ts";
import { buildVariant, OS_LABELS } from "../src/lib/mega-prompt-variants.ts";

const OUT = "public";
mkdirSync(OUT, { recursive: true });

const NETWORKS = ["preview", "preprod", "undeployed", "undeployed-fly", "mainnet"];
const OSES = ["macos", "windows", "linux"];
const NET_LABEL = {
  preview: "Preview",
  preprod: "Preproduction",
  undeployed: "Undeployed (Local)",
  "undeployed-fly": "Undeployed (Fly.io)",
  "undeployed-mobile": "Undeployed (Mobile · Android)",
  mainnet: "Mainnet",
};


const themesById = Object.fromEntries(THEMES.map((t) => [t.slug, t]));

function coreDoc() {
  const toc = GUIDES.map((g, i) => `  ${i + 1}. ${g.title}`).join("\n");
  const body = GUIDES.map(
    (g) => `\n\n===============================================================\n## ${g.title}\n===============================================================\n\n${g.body}`,
  ).join("");
  return `${SITE_HEADER}\n\nContents (core guides):\n${toc}\n${body}\n`;
}

function promptsDoc(filterNet, filterOs) {
  const isMobile = filterNet === "undeployed-mobile";
  const lines = [];
  lines.push(`# Mega-prompts — ${NET_LABEL[filterNet]}${isMobile ? "" : ` · ${OS_LABELS[filterOs]}`}\n`);
  lines.push(`Generated ${new Date().toISOString()} from midnightprompts.lovable.app`);
  if (isMobile) {
    lines.push(
      `EXPERIMENTAL · Android only. Native Kotlin + Jetpack Compose scaffolds built on the Kuira Android SDK (https://kuiralabs.github.io/kuira-sdk-android/). Host-OS independent.`,
    );
  }
  lines.push(`${ALL_IDEAS.length} ideas. Each prompt is a self-contained brief for Lovable.\n`);
  for (const idea of ALL_IDEAS) {
    const theme = themesById[idea.theme];
    if (!theme) continue;
    lines.push(`\n\n===============================================================`);
    lines.push(`## ${idea.id} — ${idea.title}`);
    lines.push(`Theme: ${theme.name} · Sub-discipline: ${idea.subDiscipline}`);
    lines.push(`===============================================================\n`);
    lines.push(buildVariant(idea, theme, filterNet, filterOs));
  }
  return lines.join("\n");
}

const VARIANTS_PER_IDEA = NETWORKS.length * OSES.length + 1; // + 1 mobile (OS-independent)

// Streaming writer — the all-variants bundle is multi-GB, so never build it as one string.
async function writeFullStreaming(name) {
  const path = join(OUT, name);
  const stream = createWriteStream(path, { encoding: "utf8" });
  let size = 0;
  const put = (chunk) => {
    size += Buffer.byteLength(chunk, "utf8");
    if (!stream.write(chunk)) return once(stream, "drain");
    return null;
  };
  const emit = async (chunk) => {
    const wait = put(chunk);
    if (wait) await wait;
  };

  await emit(coreDoc());
  await emit(`\n\n===============================================================\n# Mega-prompts (all ${VARIANTS_PER_IDEA} variants per idea)\n===============================================================\n`);
  await emit(`${ALL_IDEAS.length} ideas × (${NETWORKS.length} networks × 3 OSes + 1 Android/mobile) = ${ALL_IDEAS.length * VARIANTS_PER_IDEA} variants.\n`);

  for (const idea of ALL_IDEAS) {
    const theme = themesById[idea.theme];
    if (!theme) continue;
    await emit(
      `\n\n===============================================================\n## ${idea.id} — ${idea.title}\nTheme: ${theme.name} · Sub-discipline: ${idea.subDiscipline}\n===============================================================\n`,
    );
    for (const net of NETWORKS) {
      for (const os of OSES) {
        await emit(`\n\n### ${NET_LABEL[net]} · ${OS_LABELS[os]}\n\n`);
        await emit(buildVariant(idea, theme, net, os));
      }
    }
    await emit(`\n\n### ${NET_LABEL["undeployed-mobile"]}\n\n`);
    await emit(buildVariant(idea, theme, "undeployed-mobile", "macos"));
  }

  stream.end();
  await once(stream, "finish");
  console.log(`  ${name.padEnd(38)} ${(size / 1024 / 1024).toFixed(2)} MB`);
  return size;
}


function write(name, content) {
  const path = join(OUT, name);
  writeFileSync(path, content, "utf8");
  const size = Buffer.byteLength(content, "utf8");
  console.log(`  ${name.padEnd(38)} ${(size / 1024 / 1024).toFixed(2)} MB`);
  return size;
}

console.log("Building LLM bundles …");
const sizes = {};
sizes.core = write("llms-core.txt", coreDoc());

for (const net of NETWORKS) {
  for (const os of OSES) {
    const name = `llms-prompts-${net}-${os}.txt`;
    sizes[`${net}-${os}`] = write(name, promptsDoc(net, os));
  }
}

sizes["undeployed-mobile"] = write("llms-prompts-undeployed-mobile.txt", promptsDoc("undeployed-mobile", "macos"));

// The all-variants bundle is ~2 GB and OOMs the generator; build it only on demand
// (BUILD_FULL=1) on a big machine. The published llms-full.txt asset pointer is kept as-is.
if (process.env.BUILD_FULL === "1") sizes.full = write("llms-full.txt", fullDoc());

const meta = {
  generatedAt: new Date().toISOString(),
  ideaCount: ALL_IDEAS.length,
  networks: [...NETWORKS, "undeployed-mobile"],
  oses: OSES,
  variantCount: ALL_IDEAS.length * VARIANTS_PER_IDEA,
  sizes,
};
writeFileSync(join(OUT, "llms-full.meta.json"), JSON.stringify(meta, null, 2));
console.log("\nWrote public/llms-full.meta.json");

console.log(`Total ideas: ${meta.ideaCount}, total variants: ${meta.variantCount}`);
