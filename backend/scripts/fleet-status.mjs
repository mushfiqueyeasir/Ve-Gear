import {
  loadAllClients,
  parseJsonOutput,
  runVercel,
  validateClient,
} from "./client-registry.mjs";

runVercel(["whoami"], { capture: true });

for (const { manifest, manifestPath } of loadAllClients()) {
  const errors = validateClient(manifest);
  if (errors.length) {
    console.log(`${manifest.id ?? manifestPath}: INVALID (${errors.join("; ")})`);
    continue;
  }

  try {
    const response = parseJsonOutput(
      runVercel([
        "list",
        manifest.vercel.projectName,
        "--environment",
        "production",
        "--limit",
        "1",
        "--json",
      ], { capture: true }),
    );
    const deployments = Array.isArray(response) ? response : response.deployments ?? [];
    const latest = deployments[0];
    if (!latest) {
      console.log(`${manifest.id}: no production deployment`);
      continue;
    }
    console.log(
      `${manifest.id}: ${latest.state ?? latest.status ?? "UNKNOWN"} ${latest.url ?? ""} ${latest.meta?.githubCommitSha ?? ""}`.trim(),
    );
  } catch (error) {
    console.log(`${manifest.id}: ERROR (${error.message})`);
  }
}
