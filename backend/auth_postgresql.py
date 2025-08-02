"""
StudyVerse Authentication Module - PostgreSQL Version
Handles user registration, login, and session management with PostgreSQL
"""

import os
import jwt
import bcrypt
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
import json

# Database connection
def get_db_connection():
    """Get PostgreSQL database connection"""
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise Exception("DATABASE_URL environment variable not set")
    
    try:
        conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        raise

# Database setup
def init_db():
    """Initialize the user database tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                age_group VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE,
                profile_data JSONB DEFAULT '{}'
            )
        ''')
        
        # User progress table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_progress (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                subject VARCHAR(100) NOT NULL,
                activity_type VARCHAR(100) NOT NULL,
                content TEXT,
                score INTEGER,
                completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        ''')
        
        # User sessions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_sessions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                session_end TIMESTAMP,
                duration_minutes INTEGER,
                activities_completed INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        ''')
        
        # Syllabus uploads table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS syllabus_uploads (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                filename VARCHAR(255) NOT NULL,
                content TEXT,
                analysis JSONB,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        ''')
        
        # Report card analysis table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS report_cards (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                filename VARCHAR(255) NOT NULL,
                grades JSONB,
                analysis JSONB,
                recommendations JSONB,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        ''')
        
        conn.commit()
        print("✅ PostgreSQL database tables initialized successfully")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Database initialization error: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

def create_user(email, password, first_name, last_name, age_group):
    """Create a new user account"""
    try:
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO users (email, password_hash, first_name, last_name, age_group)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, email, first_name, last_name, age_group, created_at
        ''', (email, password_hash, first_name, last_name, age_group))
        
        user = cursor.fetchone()
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return dict(user) if user else None
        
    except psycopg2.IntegrityError:
        return None  # User already exists
    except Exception as e:
        print(f"Create user error: {e}")
        return None

def authenticate_user(email, password):
    """Authenticate user login"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, email, password_hash, first_name, last_name, age_group, is_active
            FROM users WHERE email = %s
        ''', (email,))
        
        user = cursor.fetchone()
        
        if user and user['is_active']:
            if bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                # Update last login
                cursor.execute('''
                    UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %s
                ''', (user['id'],))
                conn.commit()
                
                cursor.close()
                conn.close()
                
                # Remove password hash from returned data
                user_data = dict(user)
                del user_data['password_hash']
                return user_data
        
        cursor.close()
        conn.close()
        return None
        
    except Exception as e:
        print(f"Authentication error: {e}")
        return None

def get_user_profile(user_id):
    """Get user profile information"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, email, first_name, last_name, age_group, created_at, last_login, profile_data
            FROM users WHERE id = %s AND is_active = TRUE
        ''', (user_id,))
        
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        return dict(user) if user else None
        
    except Exception as e:
        print(f"Get user profile error: {e}")
        return None

def save_user_progress(user_id, subject, activity_type, content=None, score=None):
    """Save user learning progress"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO user_progress (user_id, subject, activity_type, content, score)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, completed_at
        ''', (user_id, subject, activity_type, content, score))
        
        result = cursor.fetchone()
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return dict(result) if result else None
        
    except Exception as e:
        print(f"Save progress error: {e}")
        return None

def get_user_progress(user_id):
    """Get user learning progress and statistics"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get progress statistics
        cursor.execute('''
            SELECT 
                COUNT(*) as total_sessions,
                COUNT(DISTINCT subject) as subjects_studied,
                AVG(score) as average_score,
                MAX(completed_at) as last_activity
            FROM user_progress 
            WHERE user_id = %s
        ''', (user_id,))
        
        stats = cursor.fetchone()
        
        # Get recent activities
        cursor.execute('''
            SELECT subject, activity_type, score, completed_at
            FROM user_progress 
            WHERE user_id = %s 
            ORDER BY completed_at DESC 
            LIMIT 10
        ''', (user_id,))
        
        recent_activities = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return {
            'stats': dict(stats) if stats else {},
            'recent_activities': [dict(activity) for activity in recent_activities]
        }
        
    except Exception as e:
        print(f"Get progress error: {e}")
        return {'stats': {}, 'recent_activities': []}

def generate_token(user_data):
    """Generate JWT token for user"""
    try:
        payload = {
            'user_id': user_data['id'],
            'email': user_data['email'],
            'exp': datetime.utcnow() + timedelta(days=7)  # Token expires in 7 days
        }
        
        secret_key = current_app.config['SECRET_KEY']
        token = jwt.encode(payload, secret_key, algorithm='HS256')
        return token
        
    except Exception as e:
        print(f"Token generation error: {e}")
        return None

def require_auth(f):
    """Decorator to require authentication for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            secret_key = current_app.config['SECRET_KEY']
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            
            # Get current user data
            user = get_user_profile(payload['user_id'])
            if not user:
                return jsonify({'error': 'Invalid token'}), 401
            
            # Add user to request context
            request.current_user = user
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            print(f"Auth decorator error: {e}")
            return jsonify({'error': 'Authentication failed'}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function

# Initialize database on module import
try:
    init_db()
except Exception as e:
    print(f"⚠️ Database initialization failed: {e}")
    print("Database will be initialized when first accessed")

