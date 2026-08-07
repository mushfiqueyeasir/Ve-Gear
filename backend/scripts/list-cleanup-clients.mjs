import {
  loadAllClients,
  parseArguments,
  validateClient,
} from "./client-registry.mjs";

const args = parseArguments();
const requested = typeof args.client === "string" ? args.client : "all";
const clients = loadAllClients();
const errors = [];

for (const { manifest, manifestPath } of clients) {
  for (const error of validateClient(manifest)) {
    errors.push(`${manifestPath}: ${error}`);
  }
}

if (errors.length) {
  throw new Error(`Invalid client registry:\n- ${errors.join("\n- ")}`);
}

const activeIds = clients
  .map(({ manifest }) => manifest)
  .filter((manifest) => manifest.status === "active")
  .map((manifest) => manifest.id)
  .sort();

if (requested !== "all") {
  if (!activeIds.includes(requested)) {
    throw new Error(`Active cleanup client not found: ${requested}`);
  }
  process.stdout.write(JSON.stringify([requested]));
} else {
  process.stdout.write(JSON.stringify(activeIds));
}
