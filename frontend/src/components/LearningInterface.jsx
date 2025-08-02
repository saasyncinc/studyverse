import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Brain, 
  Target, 
  Star, 
  Zap, 
  BookOpen, 
  Trophy, 
  Users,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  Lightbulb
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function LearningInterface({ preferences }) {
  const [currentPage, setCurrentPage] = useState('home');
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);

  // Theme configurations based on age and preferences
  const getThemeConfig = () => {
    const { age, gender, theme } = preferences;
    
    if (age === 'preschool') {
      return {
        name: '🧸 Learning Playground',
        colors: {
          primary: 'from-pink-400 to-purple-500',
          secondary: 'from-yellow-400 to-orange-500',
          accent: 'bg-green-400',
          text: 'text-purple-800'
        },
        font: 'Comic Neue',
        buttonSize: 'text-xl py-4 px-8',
        cardStyle: 'rounded-3xl p-8 shadow-2xl'
      };
    } else if (age === 'elementary') {
      return {
        name: '🎨 Adventure Academy',
        colors: {
          primary: 'from-blue-400 to-purple-500',
          secondary: 'from-green-400 to-blue-500',
          accent: 'bg-yellow-400',
          text: 'text-blue-800'
        },
        font: 'Comic Neue',
        buttonSize: 'text-lg py-3 px-6',
        cardStyle: 'rounded-2xl p-6 shadow-xl'
      };
    } else if (age === 'middle') {
      if (theme === 'gaming') {
        return {
          name: '⚡ Power Learning Hub ⚡',
          colors: {
            primary: 'from-gray-900 to-blue-900',
            secondary: 'from-cyan-500 to-purple-600',
            accent: 'bg-cyan-400',
            text: 'text-cyan-300'
          },
          font: 'Lexend',
          buttonSize: 'text-base py-3 px-6',
          cardStyle: 'rounded-xl p-6 shadow-lg border border-cyan-500/30'
        };
      }
      return {
        name: '🎮 Learning Zone',
        colors: {
          primary: 'from-indigo-600 to-purple-600',
          secondary: 'from-blue-500 to-indigo-600',
          accent: 'bg-purple-500',
          text: 'text-indigo-800'
        },
        font: 'Lexend',
        buttonSize: 'text-base py-3 px-6',
        cardStyle: 'rounded-xl p-6 shadow-lg'
      };
    } else {
      return {
        name: '📚 Academic Hub',
        colors: {
          primary: 'from-gray-700 to-gray-900',
          secondary: 'from-blue-600 to-indigo-700',
          accent: 'bg-blue-600',
          text: 'text-gray-800'
        },
        font: 'Lexend',
        buttonSize: 'text-sm py-2 px-4',
        cardStyle: 'rounded-lg p-4 shadow-md'
      };
    }
  };

  const theme = getThemeConfig();

  const analyzeText = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      } else {
        // Fallback analysis if backend is not available
        const words = inputText.split(' ').length;
        const sentences = inputText.split('.').length;
        setAnalysis({
          reading_level: words > 50 ? 'Advanced' : 'Beginner',
          difficulty: words > 50 ? 'Hard' : 'Easy',
          word_count: words,
          sentence_count: sentences,
          estimated_reading_time: `${Math.max(1, Math.floor(words / 200))} minutes`,
          tips: ['Great job analyzing this text!', 'Keep practicing your reading skills!']
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      // Fallback analysis
      const words = inputText.split(' ').length;
      setAnalysis({
        reading_level: 'Unknown',
        difficulty: 'Medium',
        word_count: words,
        sentence_count: inputText.split('.').length,
        estimated_reading_time: `${Math.max(1, Math.floor(words / 200))} minutes`,
        tips: ['Text analysis complete!']
      });
    }
    setLoading(false);
  };

  const generateFlashcards = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setFlashcards(data.flashcards || []);
        setCurrentCard(0);
        setShowAnswer(false);
      } else {
        // Fallback flashcards
        const sentences = inputText.split('.').filter(s => s.trim().length > 10);
        const cards = sentences.slice(0, 3).map((sentence, i) => ({
          id: i,
          question: `What is the main idea of: "${sentence.trim()}"?`,
          answer: `This sentence explains: ${sentence.trim()}`,
          hint: 'Think about the key message in this sentence.'
        }));
        setFlashcards(cards);
        setCurrentCard(0);
        setShowAnswer(false);
      }
    } catch (error) {
      console.error('Flashcard generation error:', error);
      // Fallback flashcards
      setFlashcards([{
        id: 0,
        question: 'What did you learn from this text?',
        answer: 'You learned something new and improved your reading skills!',
        hint: 'Think about the main points you remember.'
      }]);
      setCurrentCard(0);
      setShowAnswer(false);
    }
    setLoading(false);
  };

  const nextCard = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setShowAnswer(false);
    }
  };

  // Floating elements for visual appeal
  const FloatingElements = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <Star
          key={i}
          className="absolute text-white/10 animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
            fontSize: `${8 + Math.random() * 6}px`
          }}
        />
      ))}
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.colors.primary} relative`} style={{ fontFamily: theme.font }}>
      <FloatingElements />
      
      {/* Header */}
      <header className="relative z-10 p-4 bg-black/10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Brain className="animate-bounce" />
            {theme.name}
          </h1>
          
          <nav className="flex gap-2">
            <button
              onClick={() => setCurrentPage('home')}
              className={`${theme.buttonSize} rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                currentPage === 'home' 
                  ? `bg-white ${theme.colors.text}` 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Home size={20} />
              Home
            </button>
            <button
              onClick={() => setCurrentPage('tools')}
              className={`${theme.buttonSize} rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                currentPage === 'tools' 
                  ? `bg-white ${theme.colors.text}` 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Target size={20} />
              Tools
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-4 max-w-6xl mx-auto">
        {currentPage === 'home' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className={`${theme.cardStyle} bg-white/95 backdrop-blur-sm text-center`}>
              <div className="text-6xl mb-4 animate-bounce">🦄</div>
              <h2 className={`text-3xl font-bold ${theme.colors.text} mb-4`}>
                Welcome to Your Learning Adventure!
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Ready to explore, learn, and have fun? Let's make reading magical!
              </p>
              <button
                onClick={() => setCurrentPage('tools')}
                className={`bg-gradient-to-r ${theme.colors.secondary} text-white ${theme.buttonSize} rounded-lg font-bold hover:scale-105 transition-transform duration-200 animate-glow`}
              >
                Start Learning! ✨
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`${theme.cardStyle} bg-white/90 backdrop-blur-sm text-center hover:scale-105 transition-transform duration-200`}>
                <Brain className={`mx-auto mb-4 ${theme.colors.text}`} size={48} />
                <h3 className={`text-xl font-bold ${theme.colors.text} mb-2`}>Text Analyzer</h3>
                <p className="text-gray-600">Understand your reading level and get helpful tips!</p>
              </div>
              
              <div className={`${theme.cardStyle} bg-white/90 backdrop-blur-sm text-center hover:scale-105 transition-transform duration-200`}>
                <BookOpen className={`mx-auto mb-4 ${theme.colors.text}`} size={48} />
                <h3 className={`text-xl font-bold ${theme.colors.text} mb-2`}>Study Cards</h3>
                <p className="text-gray-600">Turn any text into fun flashcards for better learning!</p>
              </div>
              
              <div className={`${theme.cardStyle} bg-white/90 backdrop-blur-sm text-center hover:scale-105 transition-transform duration-200`}>
                <Trophy className={`mx-auto mb-4 ${theme.colors.text}`} size={48} />
                <h3 className={`text-xl font-bold ${theme.colors.text} mb-2`}>Progress Tracking</h3>
                <p className="text-gray-600">See how much you've learned and celebrate your wins!</p>
              </div>
            </div>

            {/* Stats Section */}
            <div className={`${theme.cardStyle} bg-white/90 backdrop-blur-sm`}>
              <h3 className={`text-2xl font-bold ${theme.colors.text} mb-6 text-center`}>Your Learning Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${theme.colors.text}`}>0</div>
                  <div className="text-gray-600">Texts Analyzed</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${theme.colors.text}`}>0</div>
                  <div className="text-gray-600">Cards Created</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${theme.colors.text}`}>0</div>
                  <div className="text-gray-600">Learning Streak</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${theme.colors.text}`}>0</div>
                  <div className="text-gray-600">XP Points</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'tools' && (
          <div className="space-y-8">
            {/* Text Input Section */}
            <div className={`${theme.cardStyle} bg-white/95 backdrop-blur-sm`}>
              <h2 className={`text-2xl font-bold ${theme.colors.text} mb-6 text-center`}>
                📝 Text Analyzer & Flashcard Generator
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-lg font-semibold ${theme.colors.text} mb-2`}>
                    Paste your text here:
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type or paste any text you want to analyze and turn into flashcards..."
                    className="w-full h-32 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                    style={{ fontFamily: theme.font }}
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {inputText.length} characters
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={analyzeText}
                    disabled={!inputText.trim() || loading}
                    className={`flex-1 bg-gradient-to-r ${theme.colors.secondary} text-white ${theme.buttonSize} rounded-lg font-bold hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    <Brain size={20} />
                    {loading ? 'Analyzing...' : 'Analyze Text'}
                  </button>
                  
                  <button
                    onClick={generateFlashcards}
                    disabled={!inputText.trim() || loading}
                    className={`flex-1 bg-gradient-to-r ${theme.colors.primary} text-white ${theme.buttonSize} rounded-lg font-bold hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    <BookOpen size={20} />
                    {loading ? 'Creating...' : 'Make Flashcards'}
                  </button>
                </div>
              </div>
            </div>

            {/* Analysis Results */}
            {analysis && (
              <div className={`${theme.cardStyle} bg-white/95 backdrop-blur-sm`}>
                <h3 className={`text-xl font-bold ${theme.colors.text} mb-4 flex items-center gap-2`}>
                  <CheckCircle className="text-green-500" />
                  Analysis Results
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{analysis.reading_level}</div>
                    <div className="text-sm text-gray-600">Reading Level</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analysis.word_count}</div>
                    <div className="text-sm text-gray-600">Words</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{analysis.sentence_count}</div>
                    <div className="text-sm text-gray-600">Sentences</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{analysis.estimated_reading_time}</div>
                    <div className="text-sm text-gray-600">Reading Time</div>
                  </div>
                </div>
                
                {analysis.tips && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                      <Lightbulb size={16} />
                      Tips for You:
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {analysis.tips.map((tip, index) => (
                        <li key={index} className="text-yellow-700">{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Flashcards */}
            {flashcards.length > 0 && (
              <div className={`${theme.cardStyle} bg-white/95 backdrop-blur-sm`}>
                <h3 className={`text-xl font-bold ${theme.colors.text} mb-4 text-center`}>
                  🎴 Study Cards
                </h3>
                
                <div className="text-center mb-4">
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold">
                    Card {currentCard + 1} of {flashcards.length}
                  </span>
                </div>
                
                <div className="max-w-md mx-auto">
                  <div className={`${theme.cardStyle} bg-gradient-to-br ${theme.colors.secondary} text-white min-h-[200px] flex flex-col justify-center`}>
                    {!showAnswer ? (
                      <div className="text-center">
                        <div className="text-lg font-semibold mb-4">❓ Question</div>
                        <p className="text-lg mb-4">{flashcards[currentCard]?.question}</p>
                        <button
                          onClick={() => setShowAnswer(true)}
                          className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Show Answer
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-lg font-semibold mb-4">✅ Answer</div>
                        <p className="text-lg mb-4">{flashcards[currentCard]?.answer}</p>
                        {flashcards[currentCard]?.hint && (
                          <div className="bg-white/20 rounded-lg p-3 mb-4">
                            <div className="text-sm font-semibold mb-1">💡 Hint:</div>
                            <div className="text-sm">{flashcards[currentCard]?.hint}</div>
                          </div>
                        )}
                        <button
                          onClick={() => setShowAnswer(false)}
                          className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                        >
                          🔄 Show Question
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={prevCard}
                      disabled={currentCard === 0}
                      className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      <ArrowLeft size={16} />
                      Previous
                    </button>
                    
                    <div className="flex gap-1">
                      {flashcards.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentCard(index);
                            setShowAnswer(false);
                          }}
                          className={`w-8 h-8 rounded-full font-semibold text-sm transition-colors ${
                            index === currentCard
                              ? `${theme.colors.accent} text-white`
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={nextCard}
                      disabled={currentCard === flashcards.length - 1}
                      className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Next
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default LearningInterface;

