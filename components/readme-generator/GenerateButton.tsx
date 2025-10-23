'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Zap } from 'lucide-react';
import { TextShimmer } from '@/components/ui/text-shimmer';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { generateRandomString } from '@/utils/calculations';

interface GenerateButtonProps {
  name: string;
  githubURL: string;
  twitterURL: string;
  linkedinURL: string;
  imageUrl: string;
  portfolioUrl: string;
  selectedTheme: string;
  onGenerated: (url: string) => void;
}

export function GenerateButton({
  name,
  githubURL,
  twitterURL,
  linkedinURL,
  imageUrl,
  portfolioUrl,
  selectedTheme,
  onGenerated,
}: GenerateButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerateLink = async () => {
    setLoading(true);

    // Ensure name is not empty
    const displayName = name || githubURL || "Developer";
    const randomId = generateRandomString(5);

    // Use production URL or localhost for development
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://openreadme.vercel.app'
      : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    const directUrl = `${baseUrl}/api/openreadme?direct=true&theme=${selectedTheme}&n=${encodeURIComponent(
      displayName,
    )}&g=${encodeURIComponent(
      githubURL,
    )}&x=${encodeURIComponent(twitterURL)}&l=${encodeURIComponent(
      linkedinURL,
    )}&i=${encodeURIComponent(imageUrl)}&p=${encodeURIComponent(portfolioUrl)}&z=${encodeURIComponent(randomId)}`;

    try {
      // Test the direct URL by making a request to it
      const res = await fetch(directUrl, {
        method: 'GET',
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // If successful, trigger confetti and callback
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      onGenerated(directUrl);
    } catch (error) {
      console.error("Error generating direct image URL:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4 mb-8">
      <Button
        onClick={handleGenerateLink}
        size="lg"
        disabled={!githubURL || loading}
        className="px-8 py-6 text-lg font-semibold text-white transition-all duration-300 transform shadow-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-2xl hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5 mr-2" />
            Generate Auto-Updating Image
          </>
        )}
      </Button>

      {loading && (
        <TextShimmer className="text-sm tracking-wide text-muted-foreground">
          Creating your {selectedTheme} theme auto-updating image...
        </TextShimmer>
      )}

      {!githubURL && (
        <p className="text-sm text-gray-400">
          Enter your GitHub username to generate an image
        </p>
      )}
    </div>
  );
}
