import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Eye, EyeOff, BookOpen, Brain, Users, Trophy } from 'lucide-react';

const LoginPage = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                StudyVerse
              </h1>
            </div>
            <p className="text-xl text-gray-600 font-medium">
              AI-Powered Learning That Grows With You
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">AI-Powered</h3>
              <p className="text-sm text-gray-600">Personalized learning with advanced AI technology</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Age-Adaptive</h3>
              <p className="text-sm text-gray-600">Interface that adapts to every learner's age</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Progress Tracking</h3>
              <p className="text-sm text-gray-600">Monitor your learning journey and achievements</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-800">All Subjects</h3>
              <p className="text-sm text-gray-600">Mathematics, Science, Literature, and more</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center space-y-2">
              <div className="lg:hidden flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  StudyVerse
                </h1>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Welcome Back</CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to continue your learning journey
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-medium"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">New to StudyVerse?</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={onSwitchToSignup}
                  className="w-full h-12 border-2 border-gray-200 hover:border-teal-300 hover:bg-teal-50"
                >
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

