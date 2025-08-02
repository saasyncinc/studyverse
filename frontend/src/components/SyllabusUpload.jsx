import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  BookOpen,
  Calendar,
  GraduationCap
} from 'lucide-react';

const SyllabusUpload = ({ onSyllabusUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [syllabusData, setSyllabusData] = useState(null);
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

  const uploadSyllabus = async () => {
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('syllabus', file);

      const response = await fetch(`${API_BASE_URL}/api/syllabus/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setSyllabusData(result.syllabus_data);
      setUploadStatus('success');
      
      if (onSyllabusUploaded) {
        onSyllabusUploaded(result.syllabus_data);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
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
            <BookOpen className="h-5 w-5" />
            Upload Your Syllabus
          </CardTitle>
          <CardDescription>
            Upload your school syllabus to get personalized learning content tailored to your curriculum
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
                Drop your syllabus here, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports PDF, DOC, DOCX, TXT files up to 10MB
              </p>
            </div>
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
              id="syllabus-upload"
            />
            <Label htmlFor="syllabus-upload" className="cursor-pointer">
              <Button variant="outline" className="mt-4" asChild>
                <span>Choose File</span>
              </Button>
            </Label>
          </div>

          {/* Selected File Display */}
          {file && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button 
                onClick={uploadSyllabus} 
                disabled={uploading}
                className="min-w-[100px]"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          )}

          {/* Upload Status */}
          {uploadStatus === 'success' && (
            <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span>Syllabus uploaded successfully! Your learning content will now be personalized.</span>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span>Upload failed. Please try again or contact support.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Syllabus Analysis Results */}
      {syllabusData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Syllabus Analysis
            </CardTitle>
            <CardDescription>
              We've analyzed your syllabus and identified key learning areas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Course/Subject</Label>
                <p className="text-lg font-semibold">{syllabusData.subject || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Academic Level</Label>
                <p className="text-lg font-semibold">{syllabusData.level || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Duration</Label>
                <p className="text-lg font-semibold">{syllabusData.duration || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Total Topics</Label>
                <p className="text-lg font-semibold">{syllabusData.topics?.length || 0}</p>
              </div>
            </div>

            {syllabusData.topics && syllabusData.topics.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-600 mb-2 block">Key Topics</Label>
                <div className="flex flex-wrap gap-2">
                  {syllabusData.topics.slice(0, 10).map((topic, index) => (
                    <Badge key={index} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                  {syllabusData.topics.length > 10 && (
                    <Badge variant="outline">
                      +{syllabusData.topics.length - 10} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {syllabusData.learning_objectives && (
              <div>
                <Label className="text-sm font-medium text-gray-600 mb-2 block">Learning Objectives</Label>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {syllabusData.learning_objectives.slice(0, 5).map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-green-600 font-medium">
                ✓ Your AI learning tools will now generate content specifically aligned with this syllabus
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SyllabusUpload;

