import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const PLACEHOLDER_WORDS = [
  "TO" + "DO",
  "T" + "BD",
  "FIX" + "ME",
  "CHANGE" + "ME",
];
const PLACEHOLDER_PATTERN = new RegExp(
  `\\{\\{[^}\\r\\n]+\\}\\}|<${"T" + "BD"}>|(?:^|[^\\w])(${PLACEHOLDER_WORDS.join("|")})(?=$|[^\\w])`,
  "gim",
);
const MARKDOWN_LINK_PATTERN = /\[[^\]]*]\(([^)]+)\)/g;
const EXTERNAL_LINK_PATTERN = /^[a-z][a-z0-9+.-]*:/i;

function normalizeRelativePath(value) {
  return value.replaceAll("\\", "/");
}

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    return null;
  }

  const values = new Map();
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (field) {
      values.set(field[1], field[2].trim().replace(/^["']|["']$/g, ""));
    }
  }
  return values;
}

function markdownTargets(text, sourcePath) {
  const targets = [];
  for (const match of text.matchAll(MARKDOWN_LINK_PATTERN)) {
    let target = match[1].trim();
    if (target.startsWith("<") && target.endsWith(">")) {
      target = target.slice(1, -1);
    }
    if (!target || target.startsWith("#") || EXTERNAL_LINK_PATTERN.test(target)) {
      continue;
    }

    const withoutAnchor = target.split("#", 1)[0];
    if (!withoutAnchor) {
      continue;
    }

    try {
      target = decodeURIComponent(withoutAnchor);
    } catch {
      target = withoutAnchor;
    }
    targets.push(path.resolve(path.dirname(sourcePath), target));
  }
  return targets;
}

function readJson(filePath, errors) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`Cannot read manifest ${filePath}: ${error.message}`);
    return null;
  }
}

export function validateControlPlane(options = {}) {
  const root = path.resolve(options.root ?? process.cwd());
  const manifestRelativePath = normalizeRelativePath(
    options.manifestPath ?? "migration/manifest.json",
  );
  const manifestPath = path.resolve(root, manifestRelativePath);
  const errors = [];
  const manifest = readJson(manifestPath, errors);

  if (!manifest) {
    return { root, manifestPath, artifactCount: 0, errors };
  }
  if (manifest.schemaVersion !== 1) {
    errors.push(`Unsupported manifest schemaVersion: ${manifest.schemaVersion}`);
  }
  if (
    typeof manifest.repository !== "string" ||
    !/^[^/\s]+\/[^/\s]+$/.test(manifest.repository)
  ) {
    errors.push(`Manifest repository must use owner/name form: ${manifest.repository}`);
  }
  if (!Array.isArray(manifest.requiredArtifacts) || manifest.requiredArtifacts.length === 0) {
    errors.push("Manifest requiredArtifacts must be a non-empty array");
    return { root, manifestPath, artifactCount: 0, errors };
  }

  const seenPaths = new Set();
  const artifacts = new Map();
  for (const artifact of manifest.requiredArtifacts) {
    const relativePath = normalizeRelativePath(artifact.path ?? "");
    if (
      !relativePath ||
      path.isAbsolute(relativePath) ||
      relativePath.split("/").includes("..")
    ) {
      errors.push(`Manifest contains an invalid artifact path: ${artifact.path}`);
      continue;
    }
    if (seenPaths.has(relativePath)) {
      errors.push(`Manifest contains a duplicate artifact path: ${relativePath}`);
      continue;
    }
    seenPaths.add(relativePath);

    const absolutePath = path.resolve(root, relativePath);
    const artifactRecord = { ...artifact, relativePath, absolutePath };
    artifacts.set(relativePath, artifactRecord);
    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
      errors.push(`Missing required artifact: ${relativePath}`);
      continue;
    }

    const text = fs.readFileSync(absolutePath, "utf8");
    if (Array.isArray(artifact.requiredFrontmatter)) {
      const frontmatter = parseFrontmatter(text);
      artifactRecord.frontmatter = frontmatter;
      if (!frontmatter) {
        errors.push(`Missing YAML frontmatter: ${relativePath}`);
      } else {
        for (const key of artifact.requiredFrontmatter) {
          const value = frontmatter.get(key);
          if (!value || PLACEHOLDER_PATTERN.test(value)) {
            errors.push(`Missing required frontmatter "${key}": ${relativePath}`);
          }
          PLACEHOLDER_PATTERN.lastIndex = 0;
        }
      }
    }

    if (!artifact.allowPlaceholders) {
      const placeholder = PLACEHOLDER_PATTERN.exec(text);
      if (placeholder) {
        errors.push(
          `Unresolved placeholder "${placeholder[0].trim()}" in ${relativePath}`,
        );
      }
      PLACEHOLDER_PATTERN.lastIndex = 0;
    }

    if (relativePath.endsWith(".md") && artifact.validateLinks !== false) {
      for (const target of markdownTargets(text, absolutePath)) {
        if (!fs.existsSync(target)) {
          errors.push(
            `Broken internal link in ${relativePath}: ${path.relative(root, target)}`,
          );
        }
      }
    }
  }

  const phaseIds = new Set();
  if (!Array.isArray(manifest.phaseBriefs) || manifest.phaseBriefs.length === 0) {
    errors.push("Manifest phaseBriefs must be a non-empty array");
  } else {
    for (const phase of manifest.phaseBriefs) {
      if (!phase.id || phaseIds.has(phase.id)) {
        errors.push(`Manifest contains a missing or duplicate phase id: ${phase.id}`);
      }
      phaseIds.add(phase.id);
      const artifact = artifacts.get(normalizeRelativePath(phase.path ?? ""));
      if (!artifact || artifact.kind !== "phase") {
        errors.push(`Phase ${phase.id} does not reference a required phase artifact`);
        continue;
      }

      const briefId = artifact.frontmatter?.get("id");
      if (briefId !== phase.id) {
        errors.push(
          `Phase ${phase.id} frontmatter id does not match manifest: ${briefId}`,
        );
      }
      const expectedEpic = `https://github.com/${manifest.repository}/issues/${phase.epic}`;
      const briefEpic = artifact.frontmatter?.get("epic");
      if (briefEpic !== expectedEpic) {
        errors.push(
          `Phase ${phase.id} frontmatter epic does not match manifest: ${briefEpic}`,
        );
      }
    }
  }

  const indexRelativePath = normalizeRelativePath(manifest.index ?? "");
  const indexArtifact = artifacts.get(indexRelativePath);
  if (!indexArtifact || !fs.existsSync(indexArtifact.absolutePath)) {
    errors.push(`Manifest index is not a readable required artifact: ${indexRelativePath}`);
  } else {
    const indexText = fs.readFileSync(indexArtifact.absolutePath, "utf8");
    const linkedTargets = new Set(
      markdownTargets(indexText, indexArtifact.absolutePath).map((target) =>
        path.normalize(target),
      ),
    );
    for (const artifact of artifacts.values()) {
      if (
        artifact.indexRequired &&
        !linkedTargets.has(path.normalize(artifact.absolutePath))
      ) {
        errors.push(`Index does not link required artifact: ${artifact.relativePath}`);
      }
    }
  }

  return {
    root,
    manifestPath,
    artifactCount: artifacts.size,
    phaseCount: phaseIds.size,
    errors,
  };
}

function parseArguments(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--root") {
      options.root = argv[++index];
    } else if (argument === "--manifest") {
      options.manifestPath = argv[++index];
    } else if (argument === "--json") {
      options.json = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return options;
}

function runCli() {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
    return;
  }

  const result = validateControlPlane(options);
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.errors.length === 0) {
    console.log(
      `Migration control plane valid: ${result.artifactCount} artifacts, ${result.phaseCount} phases.`,
    );
  } else {
    console.error(`Migration control plane invalid (${result.errors.length} errors):`);
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
  }
  process.exitCode = result.errors.length === 0 ? 0 : 1;
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : "";
if (invokedPath === import.meta.url) {
  runCli();
}
