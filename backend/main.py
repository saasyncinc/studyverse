import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

app = Flask(__name__)

# CORS configuration for production
CORS(app, origins=[
    "https://dyslexia-frontend.onrender.com",
    "http://localhost:5173",  # For local development
    "http://localhost:3000",  # Alternative local port
])

# Database configuration
database_url = os.environ.get('DATABASE_URL')
if database_url and database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url or 'sqlite:///local.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

db = SQLAlchemy(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    age_group = db.Column(db.String(20), nullable=False)
    gender_preference = db.Column(db.String(20), nullable=False)
    theme_preference = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
class TextAnalysis(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    text_content = db.Column(db.Text, nullable=False)
    reading_level = db.Column(db.String(20), nullable=True)
    difficulty_score = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Flashcard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    hint = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Routes
@app.route('/health')
def health_check():
    return jsonify({
        "message": "StudyVerse - Age-Adaptive Learning Platform API",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    })

@app.route('/api/analyze-text', methods=['POST'])
def analyze_text():
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        # Simple text analysis (replace with actual AI analysis)
        word_count = len(text.split())
        char_count = len(text)
        sentence_count = len([s for s in text.split('.') if s.strip()])
        
        # Estimate reading level based on word and sentence complexity
        avg_words_per_sentence = word_count / max(sentence_count, 1)
        
        if avg_words_per_sentence < 10:
            reading_level = "Elementary"
            difficulty = "Easy"
        elif avg_words_per_sentence < 15:
            reading_level = "Middle School"
            difficulty = "Medium"
        else:
            reading_level = "High School"
            difficulty = "Hard"
        
        # Save analysis to database
        analysis = TextAnalysis(
            text_content=text[:500],  # Store first 500 chars
            reading_level=reading_level,
            difficulty_score=avg_words_per_sentence
        )
        db.session.add(analysis)
        db.session.commit()
        
        return jsonify({
            "reading_level": reading_level,
            "difficulty": difficulty,
            "word_count": word_count,
            "sentence_count": sentence_count,
            "estimated_reading_time": f"{max(1, word_count // 200)} minutes",
            "tips": [
                f"This text is at a {reading_level.lower()} level",
                f"Contains {word_count} words in {sentence_count} sentences",
                "Great job analyzing this text!"
            ]
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-flashcards', methods=['POST'])
def generate_flashcards():
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        # Simple flashcard generation (replace with actual AI generation)
        sentences = [s.strip() for s in text.split('.') if s.strip() and len(s.strip()) > 20]
        
        flashcards = []
        for i, sentence in enumerate(sentences[:5]):  # Limit to 5 cards
            card = {
                "id": i,
                "question": f"What does this sentence mean: \"{sentence}?\"",
                "answer": f"This sentence explains: {sentence}",
                "hint": "Think about the main idea of the sentence."
            }
            flashcards.append(card)
            
            # Save to database
            flashcard_db = Flashcard(
                question=card["question"],
                answer=card["answer"],
                hint=card["hint"]
            )
            db.session.add(flashcard_db)
        
        db.session.commit()
        
        return jsonify({
            "flashcards": flashcards,
            "count": len(flashcards),
            "message": f"Generated {len(flashcards)} flashcards successfully!"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/save-preferences', methods=['POST'])
def save_preferences():
    try:
        data = request.get_json()
        
        user = User(
            age_group=data.get('age'),
            gender_preference=data.get('gender'),
            theme_preference=data.get('theme')
        )
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            "message": "Preferences saved successfully!",
            "user_id": user.id
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats')
def get_stats():
    try:
        user_count = User.query.count()
        analysis_count = TextAnalysis.query.count()
        flashcard_count = Flashcard.query.count()
        
        return jsonify({
            "total_users": user_count,
            "texts_analyzed": analysis_count,
            "flashcards_created": flashcard_count,
            "platform_status": "active"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=port, debug=debug)

