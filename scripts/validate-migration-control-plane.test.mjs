import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validateControlPlane } from "./validate-migration-control-plane.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function createFixture() {
  const fixtureRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "opciones-migration-control-plane-"),
  );
  const manifest = JSON.parse(
    fs.readFileSync(
      path.join(repositoryRoot, "migration", "manifest.json"),
      "utf8",
    ),
  );

  for (const artifact of manifest.requiredArtifacts) {
    const source = path.join(repositoryRoot, artifact.path);
    const destination = path.join(fixtureRoot, artifact.path);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }
  return fixtureRoot;
}

function withFixture(run) {
  const fixtureRoot = createFixture();
  try {
    run(fixtureRoot);
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

test("the committed migration control plane is valid", () => {
  const result = validateControlPlane({ root: repositoryRoot });
  assert.deepEqual(result.errors, []);
  assert.equal(result.phaseCount, 7);
});

test("a missing manifest artifact fails validation", () => {
  withFixture((root) => {
    fs.rmSync(path.join(root, "migration", "QUALITY_GATES.md"));
    const result = validateControlPlane({ root });
    assert.ok(
      result.errors.some((error) =>
        error.includes("Missing required artifact: migration/QUALITY_GATES.md"),
      ),
    );
  });
});

test("missing required frontmatter fails validation", () => {
  withFixture((root) => {
    const phasePath = path.join(
      root,
      "migration",
      "phases",
      "P00-control-plane-and-baseline.md",
    );
    const text = fs
      .readFileSync(phasePath, "utf8")
      .replace("id: P00", "id:");
    fs.writeFileSync(phasePath, text);
    const result = validateControlPlane({ root });
    assert.ok(
      result.errors.some((error) =>
        error.includes('Missing required frontmatter "id"'),
      ),
    );
  });
});

test("phase identity frontmatter must match the manifest", () => {
  withFixture((root) => {
    const phasePath = path.join(
      root,
      "migration",
      "phases",
      "P00-control-plane-and-baseline.md",
    );
    const text = fs
      .readFileSync(phasePath, "utf8")
      .replace("id: P00", "id: NOT-P00")
      .replace(
        "epic: https://github.com/GonzaloSecades/opciones-byma/issues/1",
        "epic: https://github.com/GonzaloSecades/opciones-byma/issues/9",
      );
    fs.writeFileSync(phasePath, text);
    const result = validateControlPlane({ root });
    assert.ok(
      result.errors.some((error) =>
        error.includes("Phase P00 frontmatter id does not match manifest"),
      ),
    );
    assert.ok(
      result.errors.some((error) =>
        error.includes("Phase P00 frontmatter epic does not match manifest"),
      ),
    );
  });
});

test("a broken internal link fails validation", () => {
  withFixture((root) => {
    const indexPath = path.join(root, "migration", "INDEX.md");
    fs.appendFileSync(indexPath, "\n[Broken](missing-artifact.md)\n");
    const result = validateControlPlane({ root });
    assert.ok(
      result.errors.some((error) => error.includes("Broken internal link")),
    );
  });
});

test("an unresolved placeholder outside templates fails validation", () => {
  withFixture((root) => {
    const decisionsPath = path.join(root, "migration", "decisions", "README.md");
    fs.appendFileSync(decisionsPath, `\n${"TO" + "DO"} decide this later.\n`);
    const result = validateControlPlane({ root });
    assert.ok(
      result.errors.some((error) => error.includes("Unresolved placeholder")),
    );
  });
});

test("an unresolved placeholder in required YAML fails validation", () => {
  withFixture((root) => {
    const metadataPath = path.join(
      root,
      ".agents",
      "skills",
      "opciones-migration-control-plane",
      "agents",
      "openai.yaml",
    );
    fs.appendFileSync(
      metadataPath,
      `\n# ${"TO" + "DO"} replace this metadata.\n`,
    );
    const result = validateControlPlane({ root });
    assert.ok(
      result.errors.some(
        (error) =>
          error.includes("Unresolved placeholder") &&
          error.includes("openai.yaml"),
      ),
    );
  });
});
