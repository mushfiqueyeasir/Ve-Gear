import { readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parseEnv } from "node:util";
import {
  loadClient,
  parseArguments,
  parseEnvFile,
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
const secrets = parseEnvFile(
  join(repositoryRoot, ".client-secrets", `${manifest.id}.env`),
);
const environment = {
  SUPABASE_URL: pulled.SUPABASE_URL,
  SUPABASE_ANON_KEY: secrets.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: secrets.SUPABASE_SERVICE_ROLE_KEY,
  SITE_URL: pulled.SITE_URL,
};
for (const [name, value] of Object.entries(environment)) {
  if (!value) throw new Error(`Missing required variable ${name}`);
}

const lines = Object.entries(environment).map(
  ([name, value]) => `${name}=${JSON.stringify(value)}`,
);
lines.push('SECURITY_ENABLED="true"');
writeFileSync(absoluteOutputPath, `${lines.join("\n")}\n`);

console.log(`Pulled ${manifest.id} environment to ${outputPath}.`);
