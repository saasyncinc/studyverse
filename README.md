# 🌟 StudyVerse - AI-Powered Learning That Grows With You

StudyVerse is a revolutionary educational platform that adapts to each learner's age and provides personalized AI-powered learning tools.

## ✨ Key Features

### 🎯 Age-Adaptive Interface
- **Preschool (2-5)**: Colorful, playful interface with simple interactions
- **Elementary (6-10)**: Engaging design with achievement systems
- **Middle School (11-14)**: Modern, gaming-inspired interface
- **High School (15-18)**: Professional, college-prep focused design

### 🤖 AI-Powered Learning Tools
- **Smart Text Analysis**: Reading level assessment and recommendations
- **Magic Flashcards**: Auto-generated from any text with hints
- **Interactive Quizzes**: Personalized questions with explanations
- **Syllabus Integration**: Custom lessons based on school curriculum

### 🚀 Coming Soon (Phase 2)
- **Voice AI Tutoring**: Real-time conversations with subject-specific tutors
- **Report Card Analysis**: AI-powered academic performance insights
- **Advanced Progress Tracking**: Detailed learning analytics

## 🛠️ Technology Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Shadcn/UI** components
- **Lucide Icons**
- **Responsive design** for all devices

### Backend
- **Flask** web framework
- **OpenAI GPT-4** for AI features
- **CORS enabled** for cross-origin requests
- **Production-ready** with error handling

## 🚀 Quick Deployment to Render

### Prerequisites
- GitHub account
- Render account
- OpenAI API key

### Option 1: Automated Deployment (Recommended)
1. **Upload to GitHub**: Push this repository to GitHub
2. **Create Render Blueprint**: 
   - Go to Render Dashboard
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically create all services!
3. **Set Environment Variables**:
   - In the backend service, add: `OPENAI_API_KEY=your-key-here`
4. **Done!** Your StudyVerse will be live in 5-10 minutes

### Option 2: Manual Deployment

#### Backend Deployment
1. **Create Web Service** in Render
2. **Settings**:
   - Name: `studyverse-backend`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn main:app`
3. **Environment Variables**:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `FLASK_ENV`: `production`
   - `SECRET_KEY`: Any secure random string

#### Frontend Deployment
1. **Create Static Site** in Render
2. **Settings**:
   - Name: `studyverse-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
3. **Environment Variables**:
   - `VITE_API_URL`: Your backend URL (e.g., `https://studyverse-backend.onrender.com`)

## 🔧 Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
export OPENAI_API_KEY=your-key-here
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📊 API Endpoints

### Text Analysis
```
POST /api/ai/analyze-text
Body: {"text": "content", "age_group": "middle"}
```

### Flashcard Generation
```
POST /api/ai/generate-flashcards
Body: {"text": "content", "age_group": "middle", "count": 5}
```

### Quiz Generation
```
POST /api/ai/generate-quiz
Body: {"text": "content", "age_group": "middle", "count": 3}
```

### Health Check
```
GET /api/health
```

## 🎯 Age Groups

- **preschool**: Ages 2-5, very simple interface and content
- **elementary**: Ages 6-10, colorful and engaging design
- **middle**: Ages 11-14, modern gaming-inspired interface
- **high**: Ages 15-18, professional college-prep design

## 🔐 Environment Variables

### Required for Backend
- `OPENAI_API_KEY`: Your OpenAI API key for AI features

### Optional for Backend
- `FLASK_ENV`: Set to `production` for deployment
- `SECRET_KEY`: Secure random string for sessions
- `ELEVENLABS_API_KEY`: For Phase 2 voice tutoring

### Optional for Frontend
- `VITE_API_URL`: Backend API URL (auto-detected if not set)

## 💰 Cost Estimation

### Render Hosting
- **Free Tier**: $0/month (limited resources, good for testing)
- **Starter**: $7/month per service ($14 total for frontend + backend)
- **Standard**: $25/month per service (recommended for production)

### OpenAI API
- **Text Analysis**: ~$0.01-0.05 per request
- **Flashcard Generation**: ~$0.02-0.10 per request
- **Expected Monthly Cost**: $20-100 depending on usage

### Total Monthly Cost
- **Development**: $14/month (Render Starter + minimal OpenAI usage)
- **Production**: $50-150/month (Render Standard + moderate OpenAI usage)

## 🎪 Unique Selling Points

1. **First Age-Adaptive Learning Platform**: Interface changes based on user age
2. **AI-Powered Personalization**: Every tool adapts to the learner
3. **Syllabus Integration**: Custom lessons from school curriculum
4. **Professional Design**: Credible, modern interface that builds trust
5. **Scalable Architecture**: Ready for millions of users

## 📞 Support

For questions or issues:
- Check the deployment documentation
- Review the API endpoints
- Ensure all environment variables are set correctly

## 🌟 Future Roadmap

### Phase 2 (Next 3 months)
- ElevenLabs voice tutoring integration
- Report card analysis and insights
- Advanced progress tracking
- Parent/teacher dashboards

### Phase 3 (6 months)
- Mobile app development
- Offline learning capabilities
- Advanced analytics and reporting
- Enterprise features for schools

---

**StudyVerse: Where personalized learning meets cutting-edge AI technology!** 🚀

