'use client';

import { useState, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { ChevronDown, Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeConfig } from '@/types/theme';

const themes: ThemeConfig[] = [
  {
    id: 'bento',
    name: 'Bento Classic',
    description: 'Beautiful bento-style grid layout with comprehensive stats'

  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple design focusing on essential stats'
  }
];

interface ThemeSelectorProps {
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
  className?: string;
}

export function ThemeSelector({ selectedTheme, onThemeChange, className }: ThemeSelectorProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("flex items-center gap-3 bg-secondary/50 rounded-lg p-3 border border-secondary animate-pulse", className)}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted-foreground/20" />
          <div className="w-12 h-4 rounded bg-muted-foreground/20" />
        </div>
        <div className="w-32 h-8 rounded-md bg-background/50" />
      </div>
    );
  }

  const currentTheme = themes.find(theme => theme.id === selectedTheme);

  const handleThemeSelect = (themeId: string) => {
    onThemeChange(themeId);
    setIsOpen(false);
  };

  return (
    <div className={cn("flex items-center gap-3 bg-secondary/50 rounded-lg p-3 border border-secondary transition-all duration-200 hover:bg-secondary/70 w-fit", className)}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Palette className="w-4 h-4 text-primary" />
        <Label className="text-sm font-medium whitespace-nowrap">
          Theme
        </Label>
      </div>

      <div className="relative flex-1 min-w-0" ref={dropdownRef}>
        <button
          type="button"
          className={cn(
            "w-fit bg-background border border-border rounded-md px-3 py-2 pr-8",
            "text-sm font-medium text-foreground text-left",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "transition-all duration-200 hover:border-primary/50",
            "min-w-[140px] flex items-center justify-between"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="truncate">
            {currentTheme?.name || 'Select Theme'}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 z-50 mt-1 overflow-auto bg-black border rounded-md shadow-lg top-full border-border max-h-60 w-fit">
            {themes.map((theme) => (
              <button
                key={theme.id}
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-sm text-left hover:bg-secondary/50 transition-colors duration-150",
                  "flex items-center justify-between",
                  selectedTheme === theme.id && "bg-primary/10 text-primary"
                )}
                onClick={() => handleThemeSelect(theme.id)}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{theme.name}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {theme.description}
                  </span>
                </div>
                {selectedTheme === theme.id && (
                  <Check className="flex-shrink-0 w-4 h-4 ml-2 text-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
