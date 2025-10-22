"use client";

import { useState, useEffect } from 'react';
import { getThemeOptions, type ThemeId } from '@/themes';
import { Label } from '@/components/ui/label';
import { ChevronDown, Palette } from 'lucide-react';

export default function ThemeSelector({ value, onChange }: { value: ThemeId; onChange: (v: ThemeId) => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const options = getThemeOptions();
  const items: { id: ThemeId; name: string }[] = options.map((o) => ({ id: o.id, name: o.name }));

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3 border border-secondary">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Palette className="w-4 h-4" />
        <Label htmlFor="theme-select" className="text-sm font-medium">Theme</Label>
      </div>
      <div className="relative">
        <select
          id="theme-select"
          className="appearance-none bg-background border border-border rounded-md px-3 py-2 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-[140px]"
          value={value}
          onChange={(e) => onChange(e.target.value as ThemeId)}
        >
          {items.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}
