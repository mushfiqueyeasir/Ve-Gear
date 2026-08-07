import { readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parseEnv } from "node:util";
import {
  loadClient,
  parseArguments,
  repositoryRoot,
  runVercel,
  validateClient,
  websiteDirectory,
} from "./client-registry.mjs";

const args = parseArguments();
if (typeof args.client !== "string") {
  throw new Error("Usage: npm run client:env:pull -- --client <id>");
}

const { manifest, manifestPath } = loadClient(args.client);
const errors = validateClient(manifest);
if (errors.length) {
  throw new Error(`Invalid ${manifestPath}:\n- ${errors.join("\n- ")}`);
}

runVercel(["whoami"], { capture: true });

const outputPath = relative(
  repositoryRoot,
  join(websiteDirectory, `.env.${manifest.id}`),
).replaceAll("\\", "/");

runVercel([
  "env",
  "pull",
  outputPath,
  "--environment",
  "production",
  "--project",
  manifest.vercel.projectName,
  "--yes",
]);

const absoluteOutputPath = join(websiteDirectory, `.env.${manifest.id}`);
const pulled = parseEnv(readFileSync(absoluteOutputPath, "utf8"));
const allowedNames = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
];
for (const name of allowedNames) {
  if (!pulled[name]) throw new Error(`Vercel did not return required variable ${name}`);
}

const lines = allowedNames.map((name) => `${name}=${JSON.stringify(pulled[name])}`);
lines.push('SECURITY_ENABLED="true"');
writeFileSync(absoluteOutputPath, `${lines.join("\n")}\n`);

console.log(`Pulled ${manifest.id} environment to ${outputPath}.`);
