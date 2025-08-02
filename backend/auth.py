"""
StudyVerse Authentication Module
Handles user registration, login, and session management
"""

import os
import jwt
import bcrypt
import sqlite3
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app

# Database setup
def init_db():
    """Initialize the user database"""
    conn = sqlite3.connect('studyverse_users.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            age_group TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            is_active BOOLEAN DEFAULT 1,
            profile_data TEXT DEFAULT '{}'
        )
    ''')
    
    # User progress table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            subject TEXT NOT NULL,
            activity_type TEXT NOT NULL,
            content TEXT,
            score INTEGER,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # User sessions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_token TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, password_hash):
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

def generate_token(user_id, email):
    """Generate JWT token for user authentication"""
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(days=7),  # Token expires in 7 days
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

def verify_token(token):
    """Verify JWT token and return user data"""
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def require_auth(f):
    """Decorator to require authentication for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        if token.startswith('Bearer '):
            token = token[7:]
        
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Add user info to request context
        request.user_id = payload['user_id']
        request.user_email = payload['email']
        
        return f(*args, **kwargs)
    return decorated_function

def create_user(email, password, first_name, last_name, age_group):
    """Create a new user account"""
    try:
        conn = sqlite3.connect('studyverse_users.db')
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if cursor.fetchone():
            conn.close()
            return None, "User already exists"
        
        # Hash password and create user
        password_hash = hash_password(password)
        cursor.execute('''
            INSERT INTO users (email, password_hash, first_name, last_name, age_group)
            VALUES (?, ?, ?, ?, ?)
        ''', (email, password_hash, first_name, last_name, age_group))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return user_id, None
    except Exception as e:
        return None, str(e)

def authenticate_user(email, password):
    """Authenticate user login"""
    try:
        conn = sqlite3.connect('studyverse_users.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, password_hash, first_name, last_name, age_group, is_active
            FROM users WHERE email = ?
        ''', (email,))
        
        user = cursor.fetchone()
        if not user:
            conn.close()
            return None, "Invalid email or password"
        
        user_id, password_hash, first_name, last_name, age_group, is_active = user
        
        if not is_active:
            conn.close()
            return None, "Account is deactivated"
        
        if not verify_password(password, password_hash):
            conn.close()
            return None, "Invalid email or password"
        
        # Update last login
        cursor.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', (user_id,))
        conn.commit()
        conn.close()
        
        return {
            'id': user_id,
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
            'age_group': age_group
        }, None
    except Exception as e:
        return None, str(e)

def get_user_profile(user_id):
    """Get user profile information"""
    try:
        conn = sqlite3.connect('studyverse_users.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT email, first_name, last_name, age_group, created_at, last_login, profile_data
            FROM users WHERE id = ? AND is_active = 1
        ''', (user_id,))
        
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return None
        
        return {
            'id': user_id,
            'email': user[0],
            'first_name': user[1],
            'last_name': user[2],
            'age_group': user[3],
            'created_at': user[4],
            'last_login': user[5],
            'profile_data': json.loads(user[6] or '{}')
        }
    except Exception as e:
        return None

def save_user_progress(user_id, subject, activity_type, content, score=None):
    """Save user learning progress"""
    try:
        conn = sqlite3.connect('studyverse_users.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO user_progress (user_id, subject, activity_type, content, score)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, subject, activity_type, content, score))
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        return False

def get_user_progress(user_id, limit=50):
    """Get user learning progress history"""
    try:
        conn = sqlite3.connect('studyverse_users.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT subject, activity_type, content, score, completed_at
            FROM user_progress 
            WHERE user_id = ?
            ORDER BY completed_at DESC
            LIMIT ?
        ''', (user_id, limit))
        
        progress = cursor.fetchall()
        conn.close()
        
        return [{
            'subject': row[0],
            'activity_type': row[1],
            'content': row[2],
            'score': row[3],
            'completed_at': row[4]
        } for row in progress]
    except Exception as e:
        return []

# Initialize database when module is imported
init_db()

