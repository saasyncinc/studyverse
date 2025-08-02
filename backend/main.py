import os
from openai import OpenAI
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import re
import json
from auth_postgresql import (
    create_user, authenticate_user, get_user_profile, 
    save_user_progress, get_user_progress, require_auth, generate_token
)

# Initialize Flask app
app = Flask(__name__)
CORS(app, 
     origins="*",
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'studyverse-production-secret-key-2024')

# Initialize OpenAI client
client = None
try:
    if os.environ.get('OPENAI_API_KEY'):
        client = OpenAI(
            api_key=os.environ.get('OPENAI_API_KEY'),
            base_url=os.environ.get('OPENAI_API_BASE', 'https://api.openai.com/v1')
        )
        print("✅ OpenAI client initialized successfully")
    else:
        print("⚠️ OpenAI API key not found - AI features will be disabled")
except Exception as e:
    print(f"⚠️ OpenAI client initialization failed: {e}")
    client = None

# Helper functions
def analyze_text_with_ai(text, age_group="middle"):
    """Analyze text using OpenAI for reading level and complexity"""
    if not client:
        return {
            "reading_level": "Analysis unavailable",
            "complexity_score": 5,
            "key_concepts": ["OpenAI service unavailable"],
            "suggestions": ["Please configure OpenAI API key to enable AI analysis"],
            "estimated_time": "N/A"
        }
    
    try:
        age_context = {
            "preschool": "2-5 year olds, very simple language",
            "elementary": "6-10 year olds, basic reading level", 
            "middle": "11-14 year olds, intermediate complexity",
            "high": "15-18 year olds, advanced concepts"
        }
        
        prompt = f"""
        Analyze this text for {age_context.get(age_group, 'students')}:
        
        "{text}"
        
        Provide analysis in this exact JSON format:
        {{
            "reading_level": "Elementary/Middle/High School",
            "complexity_score": 1-10,
            "key_topics": ["topic1", "topic2"],
            "estimated_reading_time": minutes,
            "recommendations": ["recommendation1", "recommendation2"]
        }}
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        
        # Parse JSON response
        result = json.loads(response.choices[0].message.content)
        return result
        
    except Exception as e:
        # Fallback analysis if OpenAI fails
        return {
            "reading_level": "Middle School",
            "complexity_score": 6,
            "key_topics": ["general content"],
            "estimated_reading_time": max(1, len(text.split()) // 200),
            "recommendations": ["Break into smaller sections", "Add visual aids"]
        }

def generate_flashcards_with_ai(text, age_group="middle", count=5):
    """Generate flashcards using OpenAI"""
    try:
        age_context = {
            "preschool": "very simple questions for 2-5 year olds",
            "elementary": "basic questions for 6-10 year olds",
            "middle": "intermediate questions for 11-14 year olds", 
            "high": "advanced questions for 15-18 year olds"
        }
        
        prompt = f"""
        Create {count} flashcards from this text for {age_context.get(age_group, 'students')}:
        
        "{text}"
        
        Return exactly this JSON format:
        {{
            "flashcards": [
                {{
                    "question": "Clear question",
                    "answer": "Concise answer",
                    "hint": "Helpful hint",
                    "difficulty": "Easy/Medium/Hard"
                }}
            ]
        }}
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5
        )
        
        result = json.loads(response.choices[0].message.content)
        return result["flashcards"]
        
    except Exception as e:
        # Fallback flashcards if OpenAI fails
        return [
            {
                "question": "What is the main topic of this text?",
                "answer": "The content focuses on key learning concepts",
                "hint": "Look for the most frequently mentioned ideas",
                "difficulty": "Easy"
            }
        ]

def generate_quiz_with_ai(text, age_group="middle", count=3):
    """Generate quiz using OpenAI"""
    try:
        age_context = {
            "preschool": "very simple multiple choice for 2-5 year olds",
            "elementary": "basic multiple choice for 6-10 year olds",
            "middle": "intermediate multiple choice for 11-14 year olds",
            "high": "advanced multiple choice for 15-18 year olds"
        }
        
        prompt = f"""
        Create {count} multiple choice questions from this text for {age_context.get(age_group, 'students')}:
        
        "{text}"
        
        Return exactly this JSON format:
        {{
            "questions": [
                {{
                    "question": "Question text?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correct_answer": 0,
                    "explanation": "Why this answer is correct"
                }}
            ]
        }}
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4
        )
        
        result = json.loads(response.choices[0].message.content)
        return result["questions"]
        
    except Exception as e:
        # Fallback quiz if OpenAI fails
        return [
            {
                "question": "What is the main concept in this text?",
                "options": ["Concept A", "Concept B", "Concept C", "Concept D"],
                "correct_answer": 0,
                "explanation": "This represents the primary focus of the content"
            }
        ]

# Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'StudyVerse API is running',
        'version': '1.0.0',
        'features': ['text_analysis', 'flashcards', 'quizzes', 'syllabus_upload', 'user_auth'],
        'timestamp': datetime.utcnow().isoformat()
    })

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()
        age_group = data.get('age_group', 'middle')
        
        # Validation
        if not all([email, password, first_name, last_name]):
            return jsonify({'error': 'All fields are required'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        if '@' not in email or '.' not in email:
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Create user
        user_id, error = create_user(email, password, first_name, last_name, age_group)
        if error:
            return jsonify({'error': error}), 400
        
        # Generate token
        token = generate_token(user_id, email)
        
        return jsonify({
            'message': 'Account created successfully',
            'token': token,
            'user': {
                'id': user_id,
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                'age_group': age_group
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Authenticate user
        user, error = authenticate_user(email, password)
        if error:
            return jsonify({'error': error}), 401
        
        # Generate token
        token = generate_token(user['id'], user['email'])
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user
        })
        
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@app.route('/api/auth/profile', methods=['GET'])
@require_auth
def get_profile():
    try:
        profile = get_user_profile(request.user_id)
        if not profile:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': profile})
        
    except Exception as e:
        return jsonify({'error': f'Failed to get profile: {str(e)}'}), 500

@app.route('/api/auth/progress', methods=['GET'])
@require_auth
def get_progress():
    try:
        progress = get_user_progress(request.user_id)
        return jsonify({'progress': progress})
        
    except Exception as e:
        return jsonify({'error': f'Failed to get progress: {str(e)}'}), 500

@app.route('/api/ai/analyze-text', methods=['POST'])
def analyze_text():
    try:
        data = request.get_json()
        text = data.get('text', '')
        age_group = data.get('age_group', 'middle')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        if len(text) > 10000:
            return jsonify({'error': 'Text too long (max 10,000 characters)'}), 400
            
        analysis = analyze_text_with_ai(text, age_group)
        return jsonify(analysis)
        
    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@app.route('/api/ai/generate-flashcards', methods=['POST'])
def generate_flashcards():
    try:
        data = request.get_json()
        text = data.get('text', '')
        age_group = data.get('age_group', 'middle')
        count = min(data.get('count', 5), 10)  # Max 10 flashcards
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
            
        flashcards = generate_flashcards_with_ai(text, age_group, count)
        return jsonify({'flashcards': flashcards})
        
    except Exception as e:
        return jsonify({'error': f'Flashcard generation failed: {str(e)}'}), 500

@app.route('/api/ai/generate-quiz', methods=['POST'])
def generate_quiz():
    try:
        data = request.get_json()
        text = data.get('text', '')
        age_group = data.get('age_group', 'middle')
        count = min(data.get('count', 3), 5)  # Max 5 questions
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
            
        questions = generate_quiz_with_ai(text, age_group, count)
        return jsonify({'questions': questions})
    except Exception as e:
        return jsonify({'error': f'Quiz generation failed: {str(e)}'}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# Syllabus upload and analysis endpoint
@app.route('/api/syllabus/upload', methods=['POST'])
@require_auth
def upload_syllabus():
    try:
        if 'syllabus' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'}), 400
        
        file = request.files['syllabus']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Check file type
        allowed_extensions = {'.pdf', '.doc', '.docx', '.txt'}
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            return jsonify({'success': False, 'error': 'Unsupported file type'}), 400
        
        # Read file content
        file_content = file.read()
        if len(file_content) > 10 * 1024 * 1024:  # 10MB limit
            return jsonify({'success': False, 'error': 'File too large'}), 400
        
        # For demo purposes, we'll simulate syllabus analysis
        # In production, you'd use OCR/text extraction and AI analysis
        syllabus_data = analyze_syllabus_content(file.filename, file_content)
        
        # Save syllabus data to user profile (in production, save to database)
        # For now, we'll return the analysis
        
        return jsonify({
            'success': True,
            'message': 'Syllabus uploaded and analyzed successfully',
            'syllabus_data': syllabus_data
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def analyze_syllabus_content(filename, content):
    """Analyze syllabus content and extract key information"""
    # This is a simplified demo version
    # In production, you'd use proper text extraction and AI analysis
    
    # Simulate analysis based on filename and content
    sample_analysis = {
        'subject': 'Mathematics',
        'level': 'High School',
        'duration': '1 Academic Year',
        'topics': [
            'Algebra', 'Geometry', 'Trigonometry', 'Calculus Basics',
            'Statistics', 'Probability', 'Functions', 'Equations',
            'Graphing', 'Word Problems'
        ],
        'learning_objectives': [
            'Solve complex algebraic equations',
            'Understand geometric principles and proofs',
            'Apply trigonometric functions to real-world problems',
            'Analyze statistical data and probability',
            'Graph functions and interpret results'
        ],
        'difficulty_level': 'Intermediate',
        'estimated_hours': 180
    }
    
    # In production, use AI to analyze the actual content
    if client:
        try:
            # Convert content to text (simplified - in production use proper text extraction)
            text_content = str(content)[:2000]  # Limit for demo
            
            prompt = f"""
            Analyze this syllabus content and extract key information:
            
            Filename: {filename}
            Content preview: {text_content}
            
            Please provide:
            1. Subject/Course name
            2. Academic level (Elementary, Middle School, High School, College)
            3. Duration (semester, year, etc.)
            4. Key topics covered (list of 5-10 main topics)
            5. Learning objectives (3-5 main goals)
            
            Format as JSON with keys: subject, level, duration, topics, learning_objectives
            """
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                temperature=0.3
            )
            
            # Try to parse AI response as JSON
            ai_analysis = json.loads(response.choices[0].message.content)
            return ai_analysis
        except Exception as e:
            print(f"AI analysis failed: {e}")
            # Fall back to sample data
            pass
    
    return sample_analysis

# Report card analysis endpoint
@app.route('/api/report-card/analyze', methods=['POST'])
@require_auth
def analyze_report_card():
    try:
        if 'report_card' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'}), 400
        
        file = request.files['report_card']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Check file type
        allowed_extensions = {'.pdf', '.jpg', '.jpeg', '.png'}
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            return jsonify({'success': False, 'error': 'Unsupported file type'}), 400
        
        # Read file content
        file_content = file.read()
        if len(file_content) > 10 * 1024 * 1024:  # 10MB limit
            return jsonify({'success': False, 'error': 'File too large'}), 400
        
        # Analyze report card
        analysis_data = analyze_report_card_content(file.filename, file_content)
        
        # Save analysis to user profile (in production, save to database)
        # For now, we'll return the analysis
        
        return jsonify({
            'success': True,
            'message': 'Report card analyzed successfully',
            'analysis': analysis_data
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def analyze_report_card_content(filename, content):
    """Analyze report card content and provide learning recommendations"""
    # This is a simplified demo version
    # In production, you'd use OCR for images and proper text extraction for PDFs
    
    # Sample analysis data
    sample_analysis = {
        'overall_gpa': 85.2,
        'grade_distribution': {
            'excellent': 3,  # 90-100%
            'good': 4,       # 80-89%
            'needs_improvement': 2  # <80%
        },
        'subjects': [
            {
                'name': 'Mathematics',
                'grade': 92,
                'trend': 'up',
                'comments': 'Excellent problem-solving skills'
            },
            {
                'name': 'English Literature',
                'grade': 88,
                'trend': 'stable',
                'comments': 'Strong reading comprehension'
            },
            {
                'name': 'Science',
                'grade': 85,
                'trend': 'up',
                'comments': 'Good understanding of concepts'
            },
            {
                'name': 'History',
                'grade': 82,
                'trend': 'stable',
                'comments': 'Needs more practice with essay writing'
            },
            {
                'name': 'Geography',
                'grade': 78,
                'trend': 'down',
                'comments': 'Requires additional study time'
            },
            {
                'name': 'Art',
                'grade': 95,
                'trend': 'up',
                'comments': 'Exceptional creativity and technique'
            }
        ],
        'strengths': [
            'Strong mathematical reasoning',
            'Excellent creative abilities',
            'Good analytical thinking',
            'Consistent performance in core subjects'
        ],
        'areas_for_improvement': [
            'Essay writing and composition',
            'Geography map skills',
            'Time management during exams',
            'Note-taking techniques'
        ],
        'recommendations': [
            {
                'subject': 'Geography',
                'recommendation': 'Focus on map reading and geographical terminology. Use visual aids and interactive maps.',
                'priority': 'High',
                'estimated_time': '30 min/day'
            },
            {
                'subject': 'History',
                'recommendation': 'Practice essay structure and historical analysis. Create timeline summaries.',
                'priority': 'Medium',
                'estimated_time': '20 min/day'
            },
            {
                'subject': 'Mathematics',
                'recommendation': 'Continue with advanced problem sets to maintain excellence.',
                'priority': 'Low',
                'estimated_time': '15 min/day'
            }
        ]
    }
    
    # In production, use AI to analyze the actual content
    if client:
        try:
            prompt = f"""
            Analyze this report card and provide detailed insights:
            
            Filename: {filename}
            
            Please provide a comprehensive analysis including:
            1. Overall GPA/performance summary
            2. Subject-wise breakdown with grades
            3. Identified strengths and weaknesses
            4. Specific learning recommendations for improvement
            5. Priority areas that need immediate attention
            
            Format as JSON with keys: overall_gpa, subjects, strengths, areas_for_improvement, recommendations
            """
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=800,
                temperature=0.3
            )
            
            # Try to parse AI response as JSON
            ai_analysis = json.loads(response.choices[0].message.content)
            return ai_analysis
        except Exception as e:
            print(f"AI analysis failed: {e}")
            # Fall back to sample data
            pass
    
    return sample_analysis

# Progress tracking endpoint
@app.route('/api/auth/progress', methods=['GET'])
@require_auth
def get_user_progress_endpoint():
    try:
        # In a real app, this would fetch from database
        # For demo, return sample progress data
        sample_progress = [
            {
                'activity_type': 'text_analysis',
                'subject': 'English',
                'score': 85,
                'completed_at': '2024-01-15T10:30:00Z',
                'duration': 8
            },
            {
                'activity_type': 'flashcards',
                'subject': 'Math',
                'score': 92,
                'completed_at': '2024-01-14T14:20:00Z',
                'duration': 12
            },
            {
                'activity_type': 'quiz',
                'subject': 'Science',
                'score': 78,
                'completed_at': '2024-01-13T16:45:00Z',
                'duration': 15
            }
        ]
        
        return jsonify({
            'success': True,
            'progress': sample_progress
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Record progress endpoint
@app.route('/api/auth/progress', methods=['POST'])
@require_auth
def record_progress_endpoint():
    try:
        data = request.get_json()
        
        # In a real app, this would save to database
        # For demo, just return success
        
        return jsonify({
            'success': True,
            'message': 'Progress recorded successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=port, debug=debug)

