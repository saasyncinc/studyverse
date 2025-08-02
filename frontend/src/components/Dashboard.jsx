import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Clock, 
  TrendingUp, 
  Calendar,
  Target,
  Star,
  Award,
  BarChart3
} from 'lucide-react';

const Dashboard = () => {
  const { user, getAuthHeaders } = useAuth();
  const [progress, setProgress] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalTime: 0,
    averageScore: 0,
    streak: 0
  });
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const fetchUserProgress = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/progress`, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(data.progress);
        calculateStats(data.progress);
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (progressData) => {
    if (!progressData.length) return;

    const totalSessions = progressData.length;
    const totalTime = progressData.reduce((sum, item) => sum + (item.duration || 5), 0); // Assume 5 min per session
    const scoresWithValues = progressData.filter(item => item.score !== null);
    const averageScore = scoresWithValues.length > 0 
      ? scoresWithValues.reduce((sum, item) => sum + item.score, 0) / scoresWithValues.length 
      : 0;

    // Calculate streak (consecutive days with activity)
    const today = new Date();
    let streak = 0;
    const uniqueDays = [...new Set(progressData.map(item => 
      new Date(item.completed_at).toDateString()
    ))].sort((a, b) => new Date(b) - new Date(a));

    for (let i = 0; i < uniqueDays.length; i++) {
      const dayDate = new Date(uniqueDays[i]);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (dayDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    setStats({
      totalSessions,
      totalTime,
      averageScore: Math.round(averageScore),
      streak
    });
  };

  const getActivityTypeIcon = (type) => {
    switch (type) {
      case 'text_analysis': return <Brain className="w-4 h-4" />;
      case 'flashcards': return <BookOpen className="w-4 h-4" />;
      case 'quiz': return <Trophy className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getActivityTypeColor = (type) => {
    switch (type) {
      case 'text_analysis': return 'bg-blue-100 text-blue-800';
      case 'flashcards': return 'bg-green-100 text-green-800';
      case 'quiz': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatActivityType = (type) => {
    switch (type) {
      case 'text_analysis': return 'Text Analysis';
      case 'flashcards': return 'Flashcards';
      case 'quiz': return 'Quiz';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.first_name}! 👋
        </h1>
        <p className="text-gray-600">
          Here's your learning progress and achievements
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Time</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTime}m</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Streak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.streak} days</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>
                Your latest learning sessions and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {progress.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start learning to see your progress here!
                  </p>
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    Start Learning
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {progress.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          {getActivityTypeIcon(item.activity_type)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">
                              {formatActivityType(item.activity_type)}
                            </h4>
                            <Badge className={getActivityTypeColor(item.activity_type)}>
                              {item.subject || 'General'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {new Date(item.completed_at).toLocaleDateString()} at{' '}
                            {new Date(item.completed_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                      {item.score !== null && (
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{item.score}%</p>
                          <p className="text-xs text-gray-500">Score</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Learning Goals & Achievements */}
        <div className="space-y-6">
          {/* Learning Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Learning Goals</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Weekly Study Time</span>
                  <span>{stats.totalTime}/300 min</span>
                </div>
                <Progress value={(stats.totalTime / 300) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Monthly Sessions</span>
                  <span>{stats.totalSessions}/20</span>
                </div>
                <Progress value={(stats.totalSessions / 20) * 100} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Study Streak</span>
                  <span>{stats.streak}/7 days</span>
                </div>
                <Progress value={(stats.streak / 7) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.totalSessions >= 1 && (
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">First Steps</p>
                      <p className="text-xs text-gray-600">Completed your first session</p>
                    </div>
                  </div>
                )}

                {stats.streak >= 3 && (
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Consistent Learner</p>
                      <p className="text-xs text-gray-600">3-day study streak</p>
                    </div>
                  </div>
                )}

                {stats.averageScore >= 80 && (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">High Achiever</p>
                      <p className="text-xs text-gray-600">80%+ average score</p>
                    </div>
                  </div>
                )}

                {stats.totalSessions === 0 && (
                  <div className="text-center py-4">
                    <Trophy className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Start learning to unlock achievements!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

