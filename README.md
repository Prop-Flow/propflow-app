# Propflow AI - Property Management Automation System

AI-powered property management system that automates tenant follow-ups, document collection, and compliance monitoring. Reduce landlord admin time from 15-20 hours/month to <2 hours.

## Features

- **AI Agent Communication**: Automated multi-channel follow-ups (SMS, email, voice) using OpenAI GPT-4
- **Document Tracking**: Automatically detect missing compliance documents (W-9s, insurance certificates, leases)
- **Compliance Monitoring**: Track lease renewals and inspection deadlines with auto-alerts
- **Centralized Dashboard**: Single view of all properties, tenants, pending actions, and compliance status
- **Intelligent Escalation**: AI handles 5+ auto-follow-ups before escalating to human intervention

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Database**: PostgreSQL with Prisma ORM
- **AI/LLM**: OpenAI GPT-4 for intelligent responses
- **Vector Storage**: Pinecone for tenant/property context
- **Communication**: Twilio (SMS + Voice), Resend (Email)
- **Workflow Orchestration**: n8n (optional)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- API keys for:
  - OpenAI
  - Twilio (for SMS/voice)
  - Resend or SendGrid (for email)
  - Pinecone (for vector storage)

### Installation

1. **Clone and install dependencies**

```bash
npm install
```

1. **Set up environment variables**

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`: Twilio credentials
- `RESEND_API_KEY`: Resend API key for email
- `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`: Pinecone credentials
- `NEXT_PUBLIC_APP_URL`: Your app URL (e.g., `http://localhost:3000`)

1. **Set up the database**

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

1. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Usage

### Adding Properties and Tenants

1. Navigate to the dashboard at `http://localhost:3000`
2. Click "Add Property" to register a new property
3. Click "Add Tenant" to onboard a tenant (required documents will be auto-created based on property type)

### Triggering AI Workflows

**Via API:**

```bash
# Trigger document collection workflow
curl -X POST http://localhost:3000/api/workflows/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "workflowType": "document_collection",
    "tenantId": "tenant-id-here",
    "documentType": "w9"
  }'

# Trigger lease renewal follow-up
curl -X POST http://localhost:3000/api/workflows/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "workflowType": "tenant_followup",
    "tenantId": "tenant-id-here",
    "scenario": "lease_renewal"
  }'
```

### Twilio Webhook Setup

For SMS and voice responses to work, configure Twilio webhooks:

1. **SMS Webhook**: `https://your-domain.com/api/webhooks/twilio/sms`
2. **Voice Webhook**: `https://your-domain.com/api/webhooks/twilio/voice/gather`

Set these in your Twilio phone number configuration.

## Project Structure

```
propflow/
├── app/
│   ├── api/
│   │   ├── properties/          # Property CRUD endpoints
│   │   ├── tenants/             # Tenant CRUD endpoints
│   │   ├── workflows/           # Workflow trigger endpoints
│   │   └── webhooks/            # Twilio webhooks
│   ├── properties/              # Properties pages
│   ├── tenants/                 # Tenants pages
│   ├── compliance/              # Compliance dashboard
│   └── page.tsx                 # Main dashboard
├── lib/
│   ├── ai/
│   │   ├── agent-engine.ts      # Core AI agent logic
│   │   ├── prompts.ts           # AI prompt templates
│   │   └── vector-store.ts      # Pinecone integration
│   ├── communication/
│   │   ├── sms-service.ts       # Twilio SMS
│   │   ├── voice-service.ts     # Twilio Voice
│   │   ├── email-service.ts     # Resend email
│   │   └── channel-router.ts    # Multi-channel routing
│   ├── compliance/
│   │   ├── monitor.ts           # Compliance tracking
│   │   └── rules-engine.ts      # Compliance rules
│   ├── documents/
│   │   └── tracker.ts           # Document tracking
│   └── utils/                   # Utility functions
├── prisma/
│   └── schema.prisma            # Database schema
└── package.json
```

## API Endpoints

### Properties

- `GET /api/properties` - List all properties
- `POST /api/properties` - Create new property

### Tenants

- `GET /api/tenants` - List all tenants
- `GET /api/tenants?propertyId=xxx` - List tenants by property
- `POST /api/tenants` - Create new tenant

### Workflows

- `POST /api/workflows/trigger` - Trigger AI workflow

### Webhooks

- `POST /api/webhooks/twilio/sms` - Twilio SMS webhook
- `POST /api/webhooks/twilio/voice/gather` - Twilio voice IVR webhook

## n8n Integration (Optional)

For advanced workflow orchestration, you can use n8n:

1. Install n8n: `npx n8n`
2. Import workflow templates from `n8n-workflows/` directory
3. Configure webhook URLs in `.env`:
   - `N8N_TENANT_FOLLOWUP_WEBHOOK`
   - `N8N_DOCUMENT_COLLECTION_WEBHOOK`
   - `N8N_COMPLIANCE_CHECK_WEBHOOK`

## Compliance Rules

The system includes configurable compliance rules by property type:

**Residential:**

- Required documents: Lease, W-9, Renters Insurance
- Lease renewal window: 90 days before expiry

**Commercial:**

- Required documents: Lease, W-9, Liability Insurance, Business License
- Lease renewal window: 180 days before expiry
- Inspection frequency: Every 6 months

Edit `lib/compliance/rules-engine.ts` to customize rules.

## AI Agent Scenarios

The AI agent supports multiple communication scenarios:

1. **Lease Renewal**: Reminds tenants about upcoming lease expiration
2. **Document Collection**: Requests missing compliance documents
3. **Maintenance Follow-up**: Checks on maintenance issue status
4. **Escalation**: Summarizes situation for landlord review

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Deployment

### Google Cloud Run (Recommended)

1. Push code to GitHub
2. Connect repository to Google Cloud Build
3. Deploy to Cloud Run using `cloudbuild.yaml`

### Database

Use Google Cloud SQL (PostgreSQL):

- Provision a Cloud SQL instance
- Connect via Private IP or Cloud SQL Auth Proxy

## Cost Estimates

For 100 tenants with 5 follow-ups each per month:

- **Twilio SMS**: ~$5-10/month ($0.01/SMS)
- **Twilio Voice**: ~$10-20/month ($0.02/min)
- **OpenAI API**: ~$30-50/month ($0.01-0.03 per interaction)
- **Pinecone**: Free tier or ~$70/month for production
- **Total**: ~$50-150/month

## Roadmap

**Phase 1 (MVP - Current):**

- ✅ AI agent communication engine
- ✅ Multi-channel automation (SMS, email, voice)
- ✅ Document tracking
- ✅ Compliance monitoring
- ✅ Dashboard interface

**Phase 2 (Future):**

- Document OCR and parsing
- Integration with property management systems (Buildium, AppFolio)
- Advanced voice AI with natural conversation
- Mobile app
- Automated rent collection reminders
- Maintenance request automation

## License

MIT

## Support

For questions or issues, please open a GitHub issue or contact support.

---

Built with ❤️ using Next.js, OpenAI, and Twilio
