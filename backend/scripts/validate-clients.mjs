import { loadAllClients, validateClient } from "./client-registry.mjs";

let invalid = false;
for (const { manifest, manifestPath } of loadAllClients()) {
  const errors = validateClient(manifest);
  if (errors.length) {
    invalid = true;
    console.error(`${manifestPath}:`);
    for (const error of errors) console.error(`  - ${error}`);
  } else {
    console.log(`valid: ${manifest.id}`);
  }
}

if (invalid) process.exitCode = 1;
