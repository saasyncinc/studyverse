import React, { useState, useEffect } from 'react';
import { Star, Zap, Brain, Target, Users, Trophy, BookOpen, Sparkles } from 'lucide-react';
import LearningInterface from './components/LearningInterface';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [userPreferences, setUserPreferences] = useState(null);
  const [currentStep, setCurrentStep] = useState('age');
  const [selectedAge, setSelectedAge] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    // Check if user preferences are already saved
    const savedPreferences = localStorage.getItem('studyverse-preferences');
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const ageGroups = [
    { id: 'preschool', label: '🧸 Preschool (2-5)', description: 'Big buttons, bright colors, simple words' },
    { id: 'elementary', label: '🎨 Elementary (6-10)', description: 'Colorful, fun, with achievements' },
    { id: 'middle', label: '🎮 Middle School (11-14)', description: 'Cool themes, gaming style' },
    { id: 'high', label: '🎓 High School (15-18)', description: 'Professional, clean, academic' }
  ];

  const genderPreferences = [
    { id: 'boy', label: '💙 Boy Style', description: 'Blues, cool colors, tech themes' },
    { id: 'girl', label: '💖 Girl Style', description: 'Pinks, warm colors, friendly themes' },
    { id: 'neutral', label: '💚 Neutral Style', description: 'Balanced colors, universal themes' }
  ];

  const themes = {
    preschool: [
      { id: 'animals', label: '🐻 Animals', description: 'Cute animal friends' },
      { id: 'colors', label: '🌈 Rainbow', description: 'Bright and colorful' },
      { id: 'toys', label: '🧸 Toys', description: 'Fun toy theme' }
    ],
    elementary: [
      { id: 'adventure', label: '🗺️ Adventure', description: 'Explore and discover' },
      { id: 'space', label: '🚀 Space', description: 'Rockets and stars' },
      { id: 'nature', label: '🌳 Nature', description: 'Plants and outdoors' }
    ],
    middle: [
      { id: 'gaming', label: '🎮 Gaming', description: 'Dark theme with neon accents' },
      { id: 'sports', label: '⚽ Sports', description: 'Athletic and energetic' },
      { id: 'tech', label: '💻 Tech', description: 'Modern and digital' }
    ],
    high: [
      { id: 'academic', label: '📚 Academic', description: 'Clean and professional' },
      { id: 'minimal', label: '⚪ Minimal', description: 'Simple and focused' },
      { id: 'dark', label: '🌙 Dark Mode', description: 'Easy on the eyes' }
    ]
  };

  const handleAgeSelect = (age) => {
    setSelectedAge(age);
    setCurrentStep('gender');
  };

  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
    setCurrentStep('theme');
  };

  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    const preferences = {
      age: selectedAge,
      gender: selectedGender,
      theme: selectedTheme,
      timestamp: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem('studyverse-preferences', JSON.stringify(preferences));

    // Save to backend
    try {
      await fetch(`${API_BASE_URL}/api/save-preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });
    } catch (error) {
      console.log('Could not save to backend:', error);
    }

    setUserPreferences(preferences);
    setShowConfirmation(false);
  };

  const handleBack = () => {
    if (showConfirmation) {
      setShowConfirmation(false);
      return;
    }
    
    if (currentStep === 'theme') {
      setCurrentStep('gender');
      setSelectedTheme('');
    } else if (currentStep === 'gender') {
      setCurrentStep('age');
      setSelectedGender('');
    }
  };

  // If user has preferences, show the learning interface
  if (userPreferences) {
    return <LearningInterface preferences={userPreferences} />;
  }

  // Floating stars background
  const FloatingStars = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <Star
          key={i}
          className={`absolute text-white/20 animate-float`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
            fontSize: `${12 + Math.random() * 8}px`
          }}
        />
      ))}
    </div>
  );

  // Confirmation dialog
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center p-4">
        <FloatingStars />
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative z-10">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Your Choices</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="mb-2"><strong>Age Group:</strong> {ageGroups.find(a => a.id === selectedAge)?.label}</p>
              <p className="mb-2"><strong>Style:</strong> {genderPreferences.find(g => g.id === selectedGender)?.label}</p>
              <p><strong>Theme:</strong> {themes[selectedAge]?.find(t => t.id === selectedTheme)?.label}</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 font-semibold">⚠️ Important Warning</p>
              <p className="text-yellow-700 text-sm mt-1">
                These preferences cannot be changed after confirmation. Choose carefully!
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                ← Go Back
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                ✓ Confirm & Lock
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center p-4">
      <FloatingStars />
      
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Brain className="text-purple-600 animate-bounce" size={40} />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              StudyVerse
            </h1>
            <Sparkles className="text-blue-600 animate-bounce" size={40} />
          </div>
          <p className="text-gray-600 text-lg">
            Personalized learning that adapts to your age and style
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep === 'age' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
            }`}>
              1
            </div>
            <div className="w-8 h-1 bg-gray-200 rounded">
              <div className={`h-full bg-blue-500 rounded transition-all duration-300 ${
                currentStep !== 'age' ? 'w-full' : 'w-0'
              }`}></div>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep === 'gender' ? 'bg-blue-500 text-white' : 
              currentStep === 'theme' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <div className="w-8 h-1 bg-gray-200 rounded">
              <div className={`h-full bg-blue-500 rounded transition-all duration-300 ${
                currentStep === 'theme' ? 'w-full' : 'w-0'
              }`}></div>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep === 'theme' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Age Selection */}
        {currentStep === 'age' && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              How old are you?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ageGroups.map((age) => (
                <button
                  key={age.id}
                  onClick={() => handleAgeSelect(age.id)}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
                >
                  <div className="text-xl font-semibold mb-2 group-hover:text-blue-600">
                    {age.label}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {age.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gender Preference Selection */}
        {currentStep === 'gender' && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              Choose your style preference
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {genderPreferences.map((gender) => (
                <button
                  key={gender.id}
                  onClick={() => handleGenderSelect(gender.id)}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-center group"
                >
                  <div className="text-xl font-semibold mb-2 group-hover:text-blue-600">
                    {gender.label}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {gender.description}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-center mt-6">
              <button
                onClick={handleBack}
                className="bg-gray-200 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Theme Selection */}
        {currentStep === 'theme' && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              Pick your favorite theme
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {themes[selectedAge]?.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme.id)}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-center group"
                >
                  <div className="text-xl font-semibold mb-2 group-hover:text-blue-600">
                    {theme.label}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {theme.description}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-center mt-6">
              <button
                onClick={handleBack}
                className="bg-gray-200 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

