import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { 
  Search, 
  Upload, 
  BookOpen, 
  Brain, 
  Users, 
  Award, 
  ChevronRight,
  GraduationCap,
  Microscope,
  Calculator,
  Globe,
  Palette,
  Code,
  Star,
  Clock,
  User,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function App() {
  const [userPreferences, setUserPreferences] = useState(null)
  const [showAgeSelection, setShowAgeSelection] = useState(false)
  const [selectedAge, setSelectedAge] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [currentView, setCurrentView] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [syllabusFile, setSyllabusFile] = useState(null)
  
  // AI Features State
  const [textInput, setTextInput] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [flashcards, setFlashcards] = useState([])
  const [quiz, setQuiz] = useState(null)
  const [currentFlashcard, setCurrentFlashcard] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if user preferences are already saved
    const savedPreferences = localStorage.getItem('studyverse-preferences')
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences))
    } else {
      setShowAgeSelection(true)
    }
  }, [])

  const ageGroups = [
    { id: 'preschool', label: 'Preschool (2-5)', description: 'Fun learning with colors and shapes', color: 'bg-pink-100 text-pink-800' },
    { id: 'elementary', label: 'Elementary (6-10)', description: 'Building foundation skills', color: 'bg-blue-100 text-blue-800' },
    { id: 'middle', label: 'Middle School (11-14)', description: 'Exploring new subjects', color: 'bg-green-100 text-green-800' },
    { id: 'high', label: 'High School (15-18)', description: 'Preparing for the future', color: 'bg-purple-100 text-purple-800' }
  ]

  const handleAgeSelection = (ageId) => {
    setSelectedAge(ageId)
    setShowConfirmation(true)
  }

  const confirmSelection = () => {
    const preferences = {
      ageGroup: selectedAge,
      confirmedAt: new Date().toISOString()
    }
    localStorage.setItem('studyverse-preferences', JSON.stringify(preferences))
    setUserPreferences(preferences)
    setShowAgeSelection(false)
    setShowConfirmation(false)
  }

  // AI API Functions
  const analyzeText = async () => {
    if (!textInput.trim()) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/analyze-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textInput,
          age_group: userPreferences?.ageGroup || 'middle'
        })
      })
      
      if (!response.ok) {
        throw new Error('Analysis failed')
      }
      
      const result = await response.json()
      setAnalysisResult(result)
    } catch (err) {
      setError('Failed to analyze text. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateFlashcards = async () => {
    if (!textInput.trim()) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textInput,
          age_group: userPreferences?.ageGroup || 'middle',
          count: 5
        })
      })
      
      if (!response.ok) {
        throw new Error('Flashcard generation failed')
      }
      
      const result = await response.json()
      setFlashcards(result.flashcards)
      setCurrentFlashcard(0)
      setShowAnswer(false)
    } catch (err) {
      setError('Failed to generate flashcards. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateQuiz = async () => {
    if (!textInput.trim()) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textInput,
          age_group: userPreferences?.ageGroup || 'middle',
          count: 3
        })
      })
      
      if (!response.ok) {
        throw new Error('Quiz generation failed')
      }
      
      const result = await response.json()
      setQuiz(result)
    } catch (err) {
      setError('Failed to generate quiz. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Age-appropriate content
  const getAgeContent = () => {
    const ageGroup = userPreferences?.ageGroup || 'middle'
    
    const content = {
      preschool: {
        heroTitle: "Welcome to StudyVerse! 🌟",
        heroDescription: "A magical place where learning is fun and colorful!",
        subjects: [
          { name: "Letters & Words", icon: BookOpen, description: "Learn your ABCs!", color: "bg-pink-100 text-pink-600" },
          { name: "Numbers & Counting", icon: Calculator, description: "Count and play with numbers!", color: "bg-blue-100 text-blue-600" },
          { name: "Colors & Shapes", icon: Palette, description: "Discover beautiful colors!", color: "bg-green-100 text-green-600" },
          { name: "Stories & Songs", icon: Star, description: "Listen to amazing stories!", color: "bg-yellow-100 text-yellow-600" }
        ]
      },
      elementary: {
        heroTitle: "Discover Amazing Things in StudyVerse! 🚀",
        heroDescription: "Your personal learning adventure starts here with fun subjects and cool activities!",
        subjects: [
          { name: "Reading Adventures", icon: BookOpen, description: "Explore exciting stories and improve reading!", color: "bg-blue-100 text-blue-600" },
          { name: "Math Magic", icon: Calculator, description: "Make math fun with games and puzzles!", color: "bg-green-100 text-green-600" },
          { name: "Science Experiments", icon: Microscope, description: "Discover how the world works!", color: "bg-purple-100 text-purple-600" },
          { name: "Creative Writing", icon: Palette, description: "Tell your own amazing stories!", color: "bg-orange-100 text-orange-600" }
        ]
      },
      middle: {
        heroTitle: "Level Up Your Learning in StudyVerse 🎮",
        heroDescription: "Master new skills, explore advanced topics, and prepare for high school with AI-powered learning tools.",
        subjects: [
          { name: "Advanced Mathematics", icon: Calculator, description: "Algebra, geometry, and problem-solving strategies", color: "bg-blue-100 text-blue-600" },
          { name: "Science & Technology", icon: Microscope, description: "Physics, chemistry, biology, and coding basics", color: "bg-green-100 text-green-600" },
          { name: "Literature & Writing", icon: BookOpen, description: "Critical reading, essay writing, and analysis", color: "bg-purple-100 text-purple-600" },
          { name: "World Studies", icon: Globe, description: "History, geography, and cultural understanding", color: "bg-teal-100 text-teal-600" }
        ]
      },
      high: {
        heroTitle: "Master Your Future with StudyVerse 🎓",
        heroDescription: "Advanced learning tools, college preparation, and career-focused education powered by AI.",
        subjects: [
          { name: "Advanced Placement", icon: GraduationCap, description: "AP courses and college-level content", color: "bg-indigo-100 text-indigo-600" },
          { name: "STEM Excellence", icon: Code, description: "Advanced math, science, and programming", color: "bg-blue-100 text-blue-600" },
          { name: "College Prep", icon: Award, description: "SAT/ACT prep and application guidance", color: "bg-green-100 text-green-600" },
          { name: "Career Readiness", icon: Users, description: "Professional skills and industry knowledge", color: "bg-purple-100 text-purple-600" }
        ]
      }
    }
    
    return content[ageGroup] || content.middle
  }

  const content = getAgeContent()

  // Age Selection Screen
  if (showAgeSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-teal-600 mb-2">Welcome to StudyVerse! 🌟</CardTitle>
            <CardDescription className="text-lg">
              Let's personalize your learning experience. How old are you?
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showConfirmation ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ageGroups.map((group) => (
                  <Card 
                    key={group.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${selectedAge === group.id ? 'ring-2 ring-teal-500' : ''}`}
                    onClick={() => handleAgeSelection(group.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <Badge className={`${group.color} mb-3`}>{group.label}</Badge>
                      <p className="text-gray-600">{group.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Important Notice</h3>
                  <p className="text-gray-700">
                    You selected: <strong>{ageGroups.find(g => g.id === selectedAge)?.label}</strong>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    This will customize your entire StudyVerse experience and cannot be changed later.
                  </p>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                    Go Back
                  </Button>
                  <Button onClick={confirmSelection} className="bg-teal-600 hover:bg-teal-700">
                    Confirm Selection
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-teal-600 mr-3" />
              <span className="text-2xl font-bold text-gray-900">StudyVerse</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => setCurrentView('home')}
                className={`text-gray-700 hover:text-teal-600 px-3 py-2 text-sm font-medium ${currentView === 'home' ? 'text-teal-600 border-b-2 border-teal-600' : ''}`}
              >
                Learn
              </button>
              <button 
                onClick={() => setCurrentView('subjects')}
                className={`text-gray-700 hover:text-teal-600 px-3 py-2 text-sm font-medium ${currentView === 'subjects' ? 'text-teal-600 border-b-2 border-teal-600' : ''}`}
              >
                Subjects
              </button>
              <button 
                onClick={() => setCurrentView('tools')}
                className={`text-gray-700 hover:text-teal-600 px-3 py-2 text-sm font-medium ${currentView === 'tools' ? 'text-teal-600 border-b-2 border-teal-600' : ''}`}
              >
                AI Tools
              </button>
              <button 
                onClick={() => setCurrentView('syllabus')}
                className={`text-gray-700 hover:text-teal-600 px-3 py-2 text-sm font-medium ${currentView === 'syllabus' ? 'text-teal-600 border-b-2 border-teal-600' : ''}`}
              >
                My Syllabus
              </button>
            </nav>

            {/* Search and Profile */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="What do you want to learn?"
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {currentView === 'home' && (
          <>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    StudyVerse
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                    AI-Powered Learning That Grows With You
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        type="text"
                        placeholder="Search our courses and content..."
                        className="pl-10 h-12 text-gray-900"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button 
                      size="lg" 
                      className="bg-orange-500 hover:bg-orange-600 h-12 px-8"
                      onClick={() => setCurrentView('tools')}
                    >
                      Start Learning
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Subjects */}
            <section className="py-16 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Subjects</h2>
                  <p className="text-lg text-gray-600">Choose from our age-appropriate learning paths</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {content?.subjects.map((subject, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 rounded-lg ${subject.color} flex items-center justify-center mb-4`}>
                          <subject.icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{subject.name}</h3>
                        <p className="text-gray-600 text-sm mb-4">{subject.description}</p>
                        <div className="flex items-center text-teal-600 text-sm font-medium">
                          Explore <ChevronRight className="h-4 w-4 ml-1" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">AI-Powered Learning Tools</h2>
                  <p className="text-lg text-gray-600">Personalized education that adapts to your learning style</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <Brain className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                      <h3 className="font-semibold text-lg mb-2">Smart Text Analysis</h3>
                      <p className="text-gray-600">AI analyzes any text to determine reading level and create personalized recommendations</p>
                    </CardContent>
                  </Card>
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <BookOpen className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                      <h3 className="font-semibold text-lg mb-2">Magic Flashcards</h3>
                      <p className="text-gray-600">Automatically generate flashcards from any content with hints and explanations</p>
                    </CardContent>
                  </Card>
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <Award className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                      <h3 className="font-semibold text-lg mb-2">Interactive Quizzes</h3>
                      <p className="text-gray-600">Test your knowledge with AI-generated quizzes tailored to your age and skill level</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          </>
        )}

        {currentView === 'tools' && (
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">AI Learning Tools</h2>
                <p className="text-lg text-gray-600">Paste any text and let AI create personalized learning materials</p>
              </div>

              {/* Text Input */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Enter Your Text</CardTitle>
                  <CardDescription>Paste any text you want to study - articles, textbook chapters, notes, etc.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Paste your text here..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="min-h-32 mb-4"
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={analyzeText} 
                      disabled={loading || !textInput.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
                      Analyze Text
                    </Button>
                    <Button 
                      onClick={generateFlashcards} 
                      disabled={loading || !textInput.trim()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BookOpen className="h-4 w-4 mr-2" />}
                      Make Flashcards
                    </Button>
                    <Button 
                      onClick={generateQuiz} 
                      disabled={loading || !textInput.trim()}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Award className="h-4 w-4 mr-2" />}
                      Create Quiz
                    </Button>
                  </div>
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                      {error}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Analysis Results */}
              {analysisResult && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      Text Analysis Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Reading Level</h4>
                        <Badge className="bg-blue-100 text-blue-800">{analysisResult.reading_level}</Badge>
                        <h4 className="font-semibold mt-4 mb-2">Complexity Score</h4>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-teal-600 h-2 rounded-full" 
                              style={{width: `${analysisResult.complexity_score * 10}%`}}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{analysisResult.complexity_score}/10</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Key Topics</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {analysisResult.key_topics?.map((topic, index) => (
                            <Badge key={index} variant="outline">{topic}</Badge>
                          ))}
                        </div>
                        <h4 className="font-semibold mb-2">Reading Time</h4>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {analysisResult.estimated_reading_time} minutes
                        </div>
                      </div>
                    </div>
                    {analysisResult.recommendations && (
                      <div className="mt-6">
                        <h4 className="font-semibold mb-2">Recommendations</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {analysisResult.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Flashcards */}
              {flashcards.length > 0 && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 text-green-600 mr-2" />
                      Study Flashcards ({currentFlashcard + 1} of {flashcards.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-lg text-center min-h-48 flex flex-col justify-center">
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-4">
                          {showAnswer ? 'Answer:' : 'Question:'}
                        </h3>
                        <p className="text-lg">
                          {showAnswer ? flashcards[currentFlashcard]?.answer : flashcards[currentFlashcard]?.question}
                        </p>
                        {showAnswer && flashcards[currentFlashcard]?.hint && (
                          <p className="text-sm text-gray-600 mt-3">
                            💡 Hint: {flashcards[currentFlashcard].hint}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-3 justify-center">
                        <Button 
                          onClick={() => setShowAnswer(!showAnswer)}
                          variant="outline"
                        >
                          {showAnswer ? 'Show Question' : 'Show Answer'}
                        </Button>
                        {currentFlashcard > 0 && (
                          <Button 
                            onClick={() => {
                              setCurrentFlashcard(currentFlashcard - 1)
                              setShowAnswer(false)
                            }}
                            variant="outline"
                          >
                            Previous
                          </Button>
                        )}
                        {currentFlashcard < flashcards.length - 1 && (
                          <Button 
                            onClick={() => {
                              setCurrentFlashcard(currentFlashcard + 1)
                              setShowAnswer(false)
                            }}
                          >
                            Next Card
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quiz */}
              {quiz && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 text-purple-600 mr-2" />
                      Interactive Quiz
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {quiz.questions?.map((question, qIndex) => (
                        <div key={qIndex} className="p-6 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold mb-4">Question {qIndex + 1}: {question.question}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {question.options?.map((option, oIndex) => (
                              <Button
                                key={oIndex}
                                variant="outline"
                                className="text-left justify-start h-auto p-3"
                              >
                                {String.fromCharCode(65 + oIndex)}. {option}
                              </Button>
                            ))}
                          </div>
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-800">
                              <strong>Answer:</strong> {String.fromCharCode(65 + question.correct_answer)}. {question.options[question.correct_answer]}
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        )}

        {currentView === 'syllabus' && (
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Syllabus</h2>
                <p className="text-lg text-gray-600">Get personalized lessons based on your school curriculum</p>
              </div>
              
              <Card>
                <CardContent className="p-8">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Upload Syllabus Document</h3>
                    <p className="text-gray-600 mb-4">Drag and drop your syllabus file or click to browse</p>
                    <Button className="bg-teal-600 hover:bg-teal-700">
                      Choose File
                    </Button>
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Coming Soon: Advanced Features</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• AI-powered syllabus analysis</li>
                      <li>• Custom lesson plan generation</li>
                      <li>• Progress tracking aligned with curriculum</li>
                      <li>• Personalized study schedules</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {currentView === 'subjects' && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">All Subjects</h2>
                <p className="text-lg text-gray-600">Comprehensive learning across all academic areas</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content?.subjects.map((subject, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className={`w-16 h-16 rounded-lg ${subject.color} flex items-center justify-center mb-4`}>
                        <subject.icon className="h-8 w-8" />
                      </div>
                      <h3 className="font-semibold text-xl mb-2">{subject.name}</h3>
                      <p className="text-gray-600 mb-4">{subject.description}</p>
                      <Button className="w-full">
                        Start Learning
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <GraduationCap className="h-8 w-8 text-teal-400 mr-3" />
              <span className="text-2xl font-bold">StudyVerse</span>
            </div>
            <p className="text-gray-400 mb-4">
              Personalized AI-powered learning for every age
            </p>
            <p className="text-sm text-gray-500">
              © 2024 StudyVerse. Built with ❤️ for learners everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

