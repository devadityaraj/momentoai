# Momento AI

A modern AI-powered chat interface built with React, Next.js, Firebase, and Python AI model integration.

## Features

- 🔐 **Google Authentication** - Secure login with persistent sessions
- 🎨 **Modern UI** - Clean design with smooth CSS animations
- 🤖 **AI Integration** - Local Python AI model for intelligent responses
- ⚡ **Real-time Updates** - Firebase-powered live status tracking
- 🚦 **Rate Limiting** - 5 prompts per 12-hour period per user
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔄 **Queue System** - Efficient prompt processing with status updates

## Architecture

### Frontend (Next.js)
- React 19 with TypeScript
- Tailwind CSS for styling
- CSS transitions for smooth animations
- Firebase Web SDK for authentication and real-time data

### Backend (Python Script)
- Firebase Admin SDK for server-side operations
- Local AI model integration for responses
- Queue processing with rate limiting
- Runs locally on your laptop

### Database (Firebase Realtime Database)
\`\`\`
/
├── prompts/          # Queued user prompts
├── results/          # AI responses
├── promptcondition/  # Processing status
├── serverstatus/     # Worker health status
└── users/           # User data and rate limits
\`\`\`

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Firebase project with Realtime Database
- Local AI model setup

### 1. Clone and Install
\`\`\`bash
git clone <repository-url>
cd momento-ai
npm install
\`\`\`

### 2. Environment Setup
Copy `.env.example` to `.env.local` and configure:
\`\`\`bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (for Python backend)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
\`\`\`

### 3. Firebase Setup
\`\`\`bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init

# Deploy security rules
firebase deploy --only database
\`\`\`

### 4. Initialize Database
\`\`\`bash
cd scripts
npm install
npm run setup-firebase
\`\`\`

### 5. Start Development
\`\`\`bash
# Frontend
npm run dev

# Python Backend (in separate terminal)
cd python-backend
pip install -r requirements.txt
python momento_ai_processor.py
\`\`\`

## Deployment

### Frontend (Vercel)
\`\`\`bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
\`\`\`

### Python Backend
The Python script runs locally on your laptop. Set up your AI model and run:
\`\`\`bash
cd python-backend
python momento_ai_processor.py
\`\`\`

## Testing

### Unit Tests
\`\`\`bash
npm test
npm run test:watch
\`\`\`

### E2E Tests
\`\`\`bash
npm run test:e2e
npm run test:e2e:ui
\`\`\`

### Coverage
\`\`\`bash
npm test -- --coverage
\`\`\`

## Security Checklist

- ✅ Firebase security rules implemented
- ✅ Environment variables secured
- ✅ Rate limiting enforced server-side
- ✅ Input validation and sanitization
- ✅ HTTPS-only in production
- ✅ CSP headers configured
- ✅ No sensitive data in client-side code

## AI Model Integration

The Python backend connects to your local AI model. Update the `process_with_ai_model()` function in `python-backend/momento_ai_processor.py` to integrate with your specific AI model.

### Expected Integration:
\`\`\`python
def process_with_ai_model(prompt_text):
    # Your AI model integration here
    # Return the AI response as a string
    return "AI generated response"
\`\`\`

## Monitoring

### Health Checks
- Python script sends heartbeat every 30 seconds
- Server status displayed in UI
- Automatic failover handling

### Logging
- Structured logging in Python backend
- Error tracking and reporting
- Performance monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

Built with ❤️ using Next.js, Firebase, and Python AI
# momentoai
# momentoai
