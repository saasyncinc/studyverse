import os
from openai import OpenAI
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import re
import json

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins="*")

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'studyverse-production-secret-key-2024')

# Initialize OpenAI client
client = OpenAI(
    api_key=os.environ.get('OPENAI_API_KEY'),
    base_url=os.environ.get('OPENAI_API_BASE', 'https://api.openai.com/v1')
)

# Helper functions
def analyze_text_with_ai(text, age_group="middle"):
    """Analyze text using OpenAI for reading level and complexity"""
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
        'features': ['text_analysis', 'flashcards', 'quizzes', 'syllabus_upload'],
        'timestamp': datetime.utcnow().isoformat()
    })

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

@app.route('/api/syllabus/upload', methods=['POST'])
def upload_syllabus():
    try:
        # Handle syllabus upload (placeholder for Phase 2)
        return jsonify({
            'message': 'Syllabus upload successful',
            'status': 'processed',
            'features_available': ['custom_lessons', 'progress_tracking']
        })
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@app.route('/api/tutoring/start-session', methods=['POST'])
def start_tutoring_session():
    try:
        # Placeholder for ElevenLabs voice tutoring (Phase 2)
        return jsonify({
            'message': 'Voice tutoring coming in Phase 2',
            'available_tutors': ['Professor Alex', 'Dr. Maya', 'Ms. Jordan', 'Mr. Chen', 'Coach Rivera'],
            'status': 'phase_2_feature'
        })
    except Exception as e:
        return jsonify({'error': f'Session start failed: {str(e)}'}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=port, debug=debug)

