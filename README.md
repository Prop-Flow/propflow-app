# Propflow AI - Property Management Automation System

AI-powered property management system that automates tenant follow-ups, document collection, and compliance monitoring. Reduce landlord admin time from 15-20 hours/month to <2 hours.

## 🚀 Live Demo

[Live App](https://propflow-ai-483621.web.app/)
(Hosted on Firebase Hosting & Cloud Run)

## Features

- **AI Agent Communication**: Automated chat interactions using Google Vertex AI (Gemini 1.5)
- **Document Tracking**: Automatically detect missing compliance documents (W-9s, insurance certificates, leases)
- **Compliance Monitoring**: Track lease renewals and inspection deadlines with auto-alerts
- **Centralized Dashboard**: Single view of all properties, tenants, pending actions, and compliance status
- **Intelligent Escalation**: AI handles 5+ auto-follow-ups before escalating to human intervention

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Database/Hosting**: Firebase Hosting & Cloud Firestore
- **Authentication**: Firebase Authentication (with Next.js middleware)
- **AI/LLM**: Google Vertex AI (Gemini 1.5 Pro/Flash) for intelligent reasoning and parsing
- **Vector Storage**: Firebase Firestore (Vector Search) or Vertex AI Vector Search
- **Communication**: Custom Google Cloud Functions (Architecture ready)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase Project
- Google Cloud Project with Vertex AI API enabled

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

- `FIREBASE_PROJECT_ID`: Your Firebase Project ID
- `FIREBASE_CLIENT_EMAIL`: Your Firebase Service Account Email
- `FIREBASE_PRIVATE_KEY`: Your Firebase Private Key
- `NEXT_PUBLIC_GCP_PROJECT_ID`: Primary Google Cloud Project ID
- `VERTEX_AI_API_KEY`: Google Cloud API Key for Vertex AI (if using client-side fallback)
- `NEXT_PUBLIC_APP_URL`: Your app URL (e.g., `http://localhost:3000`)

1. **Run the development server**

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

1. Deploy:

```bash
npx firebase deploy
```

## Project Structure

```'
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
│   │   ├── agent-engine.ts      # Core AI agent logic (Vertex AI)
│   │   └── vertex.ts            # Google Gemini integration
│   ├── communication/
│   │   └── (Architecture ready for future Google Cloud Pub/Sub integration)
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

Built with ❤️ using Next.js and Google Vertex AI
