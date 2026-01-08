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
- **Database/Hosting**: Firebase Hosting & Cloud Firestore
- **Authentication**: NextAuth.js (Firebase adapter / Firestore)
- **AI/LLM**: OpenAI GPT-4 for intelligent responses
- **Vector Storage**: Pinecone for tenant/property context
- **Communication**: Twilio (SMS + Voice), Resend (Email)
- **Workflow Orchestration**: n8n (optional)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase Project
- API keys for:
  - OpenAI
  - Twilio (for SMS/voice)
  - Resend (for email)
  - Pinecone (for vector storage)

### Installation

1. **Clone and install dependencies**

```bash
npm install
```

2. **Set up environment variables**

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required environment variables:
- `FIREBASE_PROJECT_ID`: Your Firebase Project ID
- `FIREBASE_CLIENT_EMAIL`: Your Firebase Service Account Email
- `FIREBASE_PRIVATE_KEY`: Your Firebase Private Key
- `OPENAI_API_KEY`: OpenAI API key
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`: Twilio credentials
- `RESEND_API_KEY`: Resend API key for email
- `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`: Pinecone credentials
- `NEXT_PUBLIC_APP_URL`: Your app URL (e.g., `http://localhost:3000`)

3. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Deployment

### Firebase Hosting (Recommended)

1. Authenticate with Firebase:
```bash
npx firebase login
```

2. Deploy:
```bash
npx firebase deploy
```

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
│   ├── services/
│   │   └── firebase-admin.ts    # Firebase Admin SDK initialization
│   └── utils/                   # Utility functions
├── firebase.json                # Firebase configuration
└── package.json
```

## License

MIT

## Support

For questions or issues, please open a GitHub issue or contact support.

---

Built with ❤️ using Next.js, OpenAI, and Twilio
