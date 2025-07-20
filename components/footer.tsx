"use client";

import { useState, useEffect } from "react";
import { Github, Heart } from "lucide-react";

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      date: string;
    };
  };
  html_url: string;
}

export default function Footer() {
  const [latestCommit, setLatestCommit] = useState<GitHubCommit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestCommit = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/repos/AvelDev/EasyFood/commits?per_page=1"
        );
        if (response.ok) {
          const commits = await response.json();
          if (commits.length > 0) {
            setLatestCommit(commits[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch latest commit:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestCommit();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="text-slate-400 text-sm">
            © {currentYear} EasyFood. Wszystkie prawa zastrzeżone.
          </div>

          {/* Latest Commit */}
          <div className="flex items-center gap-4 text-sm">
            {loading ? (
              <div className="text-slate-400 animate-pulse">Ładowanie...</div>
            ) : latestCommit ? (
              <a
                href={latestCommit.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-2 hover:underline"
                title={`Commit: ${latestCommit.commit.message.split("\n")[0]}`}
              >
                <Github className="w-4 h-4" />
                <span className="hidden sm:inline">Ostatni commit:</span>
                <span>{formatDate(latestCommit.commit.author.date)}</span>
              </a>
            ) : (
              <div className="text-slate-500 text-xs">
                Brak informacji o commit
              </div>
            )}
          </div>

          {/* GitHub Link and Open Source */}
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/AvelDev/EasyFood"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-2 hover:underline"
              title="Zobacz kod źródłowy na GitHub"
            >
              <Github className="w-5 h-5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <div className="flex items-center gap-1 text-slate-400">
              <span className="text-sm">Open Source</span>
              <Heart className="w-4 h-4 text-red-500" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
