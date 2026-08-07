# Client registry

Each directory contains non-secret desired and deployed state for one
storefront. Raw credentials remain in ignored local files and deployment
secret stores; they must never be committed or imported by browser code.

## Add a client

1. Copy an existing `tenant.json` into `backend/clients/<client-id>/tenant.json`.
2. Run `npm run client:validate` from `backend`.
3. Create `.client-secrets/<client-id>.env` at the repository root:

```dotenv
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

4. Run the clean baseline in the empty Supabase project's SQL Editor.
5. Configure SMTP and notification recipients in the Supabase-backed admin settings.
6. Run `npm run client:provision -- --client <client-id>` from `backend`.
7. Attach and verify the custom domain in Vercel.

Asset cleanup in GitHub Actions reads a repository secret named
`CLIENT_SUPABASE_CREDENTIALS`. Store a JSON object keyed by client ID:

```json
{"client-id":{"serviceRoleKey":"..."}}
```

The `.client-secrets` directory is ignored by Git. Delete a client's local file
after Vercel has stored the values if you do not need it for later rotation.

Use `--adopt <existing-project-name>` when bringing an existing Vercel project
under management. Use `npm run fleet:status` to query the latest production
deployment for every registered client.

## Debug a client locally

Pull a tracked project's production configuration into an ignored local file:

```text
cd backend
npm run client:env:pull -- --client ve-gear
```

Then run the shared frontend with that client's configuration:

```text
cd frontend/website
npm run dev:client -- ve-gear
```

This creates `frontend/website/.env.ve-gear`. It contains secrets and must stay
local. Run the pull command again after rotating or changing Vercel variables.
