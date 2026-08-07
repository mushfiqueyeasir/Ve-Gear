# New Client Deployment

## Required Information

Provide the following for a production deployment:

```text
Store name:
Client ID: kebab-case, for example urban-rider
Primary domain: https://www.example.com
Domain aliases: https://example.com

Supabase project reference:
Supabase URL:
Supabase anon key:
Supabase service-role key:

Initial administrator name:
Initial administrator email:
```

The Supabase project must be empty. Domain DNS access is required when the
production domain is connected.

## Secret Handling

Never add Supabase keys to tracked files. Store them locally in:

```dotenv
# .client-secrets/<client-id>.env
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Add the service-role key to the `CLIENT_SUPABASE_CREDENTIALS` GitHub Actions
secret so automated cleanup can process the client.

## Automatically Configured

The deployment process creates or configures:

- `backend/clients/<client-id>/tenant.json`
- Vercel project `store-<client-id>`
- Production environment variables
- Database schema version `0016`
- Production deployment and domain attachment
- Automated asset cleanup registration

Every client receives the complete product feature set. Features are not
selected or tracked per tenant.

## Merchant Settings

After deployment, configure branding, contact details, shipping, SMTP, order
notification recipients, bKash credentials, analytics, and store content from
the administration panel. These values are not required to create the
deployment, but they are required before the store is launched to customers.
