'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clipboard, FileText, Link2, X, Zap } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  directImageUrl: string;
  selectedTheme: string;
}

export function ResultDialog({ isOpen, onClose, directImageUrl, selectedTheme }: ResultDialogProps) {
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(`![OpenReadme](${directImageUrl})`);
    toast.success("Copied to clipboard");
  };

  const getThemeName = (theme: string) => {
    switch (theme) {
      case 'bento':
        return 'Bento Classic';
      case 'minimal':
        return 'Minimal';
      default:
        return 'Bento Classic';
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl overflow-hidden border-gray-700 shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl">
        <AlertDialogHeader className="relative pb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10"></div>
          <AlertDialogTitle className="relative mb-2 text-3xl font-bold text-white">
            🎉 Your {getThemeName(selectedTheme)} Image is Ready!
          </AlertDialogTitle>
          <p className="relative text-gray-300">
            Copy this code into your GitHub README.md file
          </p>
          <Button
            variant="ghost"
            className="absolute top-0 right-0 text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </AlertDialogHeader>

        {/* Auto-Update Info */}
        <div className="p-4 mb-6 border bg-gradient-to-r from-green-500/10 to-teal-500/10 border-green-500/20 rounded-xl">
          <div className="flex items-center gap-3 text-green-400">
            <Zap className="flex-shrink-0 w-5 h-5" />
            <div>
              <p className="font-medium">✨ Zero Setup Required!</p>
              <p className="mt-1 text-sm text-green-300/80">
                This image automatically updates every 5 minutes with your latest GitHub stats
              </p>
            </div>
          </div>
        </div>

        {/* README Code Section */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2 text-white">
            <Link2 className="w-5 h-5" />
            <h3 className="text-lg font-semibold">README Markdown Code</h3>
          </div>
          <div className="relative">
            <Input
              value={`![OpenReadme](${directImageUrl})`}
              readOnly
              className="pr-16 font-mono text-sm text-white bg-gray-800 border-gray-600"
            />
            <Button
              onClick={copyToClipboard}
              className="absolute h-8 px-3 bg-teal-600 top-1 right-1 hover:bg-teal-700"
            >
              <Clipboard className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Paste this anywhere in your README.md file</span>
            <span className="px-2 py-1 text-xs bg-gray-700 rounded">Theme: {getThemeName(selectedTheme)}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <Link
            href="/guide"
            className="inline-flex items-center gap-2 text-sm text-teal-400 transition-colors hover:text-teal-300"
          >
            <FileText className="w-4 h-4" />
            View Setup Guide
          </Link>

          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            Close
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
