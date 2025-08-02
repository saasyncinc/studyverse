import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Upload, 
  FileImage, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  TrendingDown,
  Target,
  BookOpen,
  Award,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

const ReportCardAnalysis = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadReportCard = async () => {
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('report_card', file);

      const response = await fetch(`${API_BASE_URL}/api/report-card/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalysisData(result.analysis);
      setUploadStatus('success');
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result.analysis);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    if (grade >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBadgeVariant = (grade) => {
    if (grade >= 90) return 'default';
    if (grade >= 80) return 'secondary';
    if (grade >= 70) return 'outline';
    return 'destructive';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Report Card Analysis
          </CardTitle>
          <CardDescription>
            Upload your report card to get AI-powered insights and personalized learning recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                Drop your report card here, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports PDF, JPG, PNG files up to 10MB
              </p>
            </div>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
              id="report-card-upload"
            />
            <Label htmlFor="report-card-upload" className="cursor-pointer">
              <Button variant="outline" className="mt-4" asChild>
                <span>Choose File</span>
              </Button>
            </Label>
          </div>

          {/* Selected File Display */}
          {file && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileImage className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button 
                onClick={uploadReportCard} 
                disabled={uploading}
                className="min-w-[100px]"
              >
                {uploading ? 'Analyzing...' : 'Analyze'}
              </Button>
            </div>
          )}

          {/* Upload Status */}
          {uploadStatus === 'success' && (
            <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span>Report card analyzed successfully! Check your personalized recommendations below.</span>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span>Analysis failed. Please try again or contact support.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisData && (
        <div className="space-y-6">
          {/* Overall Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Overall Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getGradeColor(analysisData.overall_gpa)}`}>
                    {analysisData.overall_gpa}%
                  </div>
                  <p className="text-sm text-gray-600">Overall GPA</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {analysisData.subjects?.length || 0}
                  </div>
                  <p className="text-sm text-gray-600">Subjects</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {analysisData.strengths?.length || 0}
                  </div>
                  <p className="text-sm text-gray-600">Strengths</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Performance Distribution</Label>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Excellent (90-100%)</span>
                    <span>{analysisData.grade_distribution?.excellent || 0} subjects</span>
                  </div>
                  <Progress value={(analysisData.grade_distribution?.excellent || 0) * 20} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Good (80-89%)</span>
                    <span>{analysisData.grade_distribution?.good || 0} subjects</span>
                  </div>
                  <Progress value={(analysisData.grade_distribution?.good || 0) * 20} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Needs Improvement (&lt;80%)</span>
                    <span>{analysisData.grade_distribution?.needs_improvement || 0} subjects</span>
                  </div>
                  <Progress value={(analysisData.grade_distribution?.needs_improvement || 0) * 20} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Subject Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisData.subjects?.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{subject.name}</h4>
                        <Badge variant={getGradeBadgeVariant(subject.grade)}>
                          {subject.grade}%
                        </Badge>
                        {subject.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {subject.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                      </div>
                      <Progress value={subject.grade} className="h-2 mb-2" />
                      {subject.comments && (
                        <p className="text-sm text-gray-600">{subject.comments}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strengths and Areas for Improvement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysisData.strengths?.map((strength, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysisData.areas_for_improvement?.map((area, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">{area}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Personalized Learning Recommendations
              </CardTitle>
              <CardDescription>
                Based on your report card analysis, here are AI-generated study suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisData.recommendations?.map((rec, index) => (
                  <div key={index} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                    <h4 className="font-medium text-blue-900 mb-2">{rec.subject}</h4>
                    <p className="text-sm text-blue-800 mb-2">{rec.recommendation}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {rec.priority} Priority
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {rec.estimated_time}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 font-medium">
                  💡 Your StudyVerse AI tools will now prioritize these areas in your learning sessions!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportCardAnalysis;

