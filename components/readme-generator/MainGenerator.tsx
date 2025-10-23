'use client';

import { useState } from 'react';
import { Graph, StreakStats, UserStats } from '@/types';
import { ThemeSelector } from './ThemeSelector';
import { GenerateButton } from './GenerateButton';
import { ResultDialog } from './ResultDialog';
import BentoClassic from '@/components/theme/BentoClassic';

interface MainGeneratorProps {
  name: string;
  githubURL: string;
  twitterURL: string;
  linkedinURL: string;
  imageUrl: string;
  stats: UserStats | undefined;
  streak: StreakStats | undefined;
  graph: Graph[] | undefined;
  portfolioUrl: string;
}

export function MainGenerator({
  name,
  githubURL,
  twitterURL,
  linkedinURL,
  imageUrl,
  stats,
  streak,
  graph,
  portfolioUrl,
}: MainGeneratorProps) {
  const [selectedTheme, setSelectedTheme] = useState('bento');
  const [directImageUrl, setDirectImageUrl] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleGenerated = (url: string) => {
    setDirectImageUrl(url);
    setIsDialogOpen(true);
  };

  const renderThemePreview = () => {
    switch (selectedTheme) {
      case 'bento':
        return (
          <BentoClassic
            name={name}
            githubURL={githubURL}
            twitterURL={twitterURL}
            linkedinURL={linkedinURL}
            imageUrl={imageUrl}
            stats={stats}
            streak={streak}
            graph={graph}
            portfolioUrl={portfolioUrl}
          />
        );
      case 'minimal':
        return (
          <div className="w-full max-w-4xl p-8 mx-auto text-gray-900 bg-white rounded-2xl">
            <div className="mb-8 text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-300 rounded-full"></div>
              <h1 className="mb-2 text-3xl font-bold">{name || "Your Name"}</h1>
              <p className="text-xl text-gray-600">@{githubURL || "username"}</p>
            </div>
            <div className="grid grid-cols-4 gap-6">
              <div className="p-4 text-center bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{stats?.Commits || "0"}</div>
                <div className="text-sm text-gray-600">Commits</div>
              </div>
              <div className="p-4 text-center bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{stats?.["Star Earned"] || "0"}</div>
                <div className="text-sm text-gray-600">Stars</div>
              </div>
              <div className="p-4 text-center bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">{stats?.["Pull Requests"] || "0"}</div>
                <div className="text-sm text-gray-600">PRs</div>
              </div>
              <div className="p-4 text-center bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-orange-600">{streak?.currentStreak || "0"}</div>
                <div className="text-sm text-gray-600">Streak</div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Theme Selector */}
      <ThemeSelector
        selectedTheme={selectedTheme}
        onThemeChange={setSelectedTheme}
      />

      {/* Theme Preview */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Preview</h3>
        <div className="p-4 border border-gray-700 rounded-2xl bg-gray-900/50">
          {renderThemePreview()}
        </div>
      </div>

      {/* Generate Button */}
      <GenerateButton
        name={name}
        githubURL={githubURL}
        twitterURL={twitterURL}
        linkedinURL={linkedinURL}
        imageUrl={imageUrl}
        portfolioUrl={portfolioUrl}
        selectedTheme={selectedTheme}
        onGenerated={handleGenerated}
      />

      {/* Result Dialog */}
      <ResultDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        directImageUrl={directImageUrl}
        selectedTheme={selectedTheme}
      />
    </div>
  );
}
