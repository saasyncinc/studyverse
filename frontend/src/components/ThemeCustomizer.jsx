import React, { useState } from 'react';
import { useTheme } from './ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Palette, 
  Monitor, 
  Moon, 
  Gamepad2, 
  Trophy, 
  Leaf, 
  Waves,
  Check,
  Sparkles
} from 'lucide-react';

const ThemeCustomizer = () => {
  const { currentTheme, changeTheme, availableThemes } = useTheme();
  const [previewTheme, setPreviewTheme] = useState(null);

  const themeIcons = {
    default: Monitor,
    dark: Moon,
    gaming: Gamepad2,
    sports: Trophy,
    nature: Leaf,
    ocean: Waves
  };

  const handleThemePreview = (themeName) => {
    setPreviewTheme(themeName);
  };

  const handleThemeSelect = (themeName) => {
    changeTheme(themeName);
    setPreviewTheme(null);
  };

  const getPreviewClasses = (themeName) => {
    const theme = availableThemes[themeName];
    return {
      background: theme.colors.background.replace('bg-', ''),
      surface: theme.colors.surface.replace('bg-', ''),
      primary: theme.colors.primary.replace('bg-', ''),
      accent: theme.colors.accent.replace('bg-', ''),
      text: theme.colors.text.replace('text-', ''),
      gradient: theme.gradient
    };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Customization
          </CardTitle>
          <CardDescription>
            Personalize your StudyVerse experience with different themes and color schemes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(availableThemes).map(([themeName, theme]) => {
              const IconComponent = themeIcons[themeName] || Sparkles;
              const isActive = currentTheme === themeName;
              const classes = getPreviewClasses(themeName);
              
              return (
                <div
                  key={themeName}
                  className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    isActive 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleThemeSelect(themeName)}
                  onMouseEnter={() => handleThemePreview(themeName)}
                  onMouseLeave={() => setPreviewTheme(null)}
                >
                  {/* Theme Preview */}
                  <div className={`h-32 bg-gradient-to-r ${theme.gradient} relative`}>
                    <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                    <div className="absolute top-2 left-2">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    {isActive && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-white rounded-full p-1">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    )}
                    
                    {/* Mini UI Preview */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className={`bg-${classes.background} rounded p-2 shadow-sm`}>
                        <div className={`h-2 bg-${classes.primary} rounded mb-1`}></div>
                        <div className={`h-1 bg-${classes.surface} rounded w-3/4`}></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Theme Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{theme.name}</h3>
                      {isActive && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{theme.description}</p>
                    
                    {/* Color Palette Preview */}
                    <div className="flex gap-1">
                      <div className={`w-4 h-4 rounded-full bg-${classes.primary}`}></div>
                      <div className={`w-4 h-4 rounded-full bg-${classes.accent}`}></div>
                      <div className={`w-4 h-4 rounded-full bg-${classes.surface}`}></div>
                      <div className={`w-4 h-4 rounded-full bg-${classes.background} border`}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Theme Benefits</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Dark Mode:</strong> Reduces eye strain during long study sessions</li>
                  <li>• <strong>Gaming:</strong> Appeals to tech-savvy learners with modern aesthetics</li>
                  <li>• <strong>Sports:</strong> Energetic colors to motivate active learners</li>
                  <li>• <strong>Nature:</strong> Calming greens for focused concentration</li>
                  <li>• <strong>Ocean:</strong> Deep blues for a serene learning environment</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Age-Specific Theme Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended for Your Age Group</CardTitle>
          <CardDescription>
            Based on your age selection, these themes might work best for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Elementary (5-11 years)</h4>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">Default</Badge>
                <Badge variant="outline">Nature</Badge>
                <Badge variant="outline">Ocean</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Bright, friendly themes that encourage exploration and learning
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Middle & High School (12+ years)</h4>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">Dark</Badge>
                <Badge variant="outline">Gaming</Badge>
                <Badge variant="outline">Sports</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Modern, sophisticated themes that appeal to older students
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeCustomizer;

