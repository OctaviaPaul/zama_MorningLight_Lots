"use client";

import type { FortuneContent } from "../types/fortune";

interface FortuneCardProps {
  fortune: FortuneContent;
  date: string;
  onShare?: () => void;
  onViewHistory?: () => void;
}

export default function FortuneCard({ fortune, date, onShare, onViewHistory }: FortuneCardProps) {
  return (
    <div className="card max-w-2xl mx-auto animate-reveal relative overflow-hidden border-2 border-amber-200/50 dark:border-amber-800/50">
      {/* Decorative corner elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-transparent rounded-bl-full"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-400/10 to-transparent rounded-tr-full"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gradient-to-r from-amber-200 to-orange-200 dark:from-amber-800 dark:to-orange-800">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg glow-amber">
              <span className="text-3xl animate-pulse-slow">🎴</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold gradient-text">Fortune #{fortune.number}</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 font-medium">📅 {date}</p>
            </div>
          </div>
          <span className="badge bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-800 dark:text-purple-200 border-2 border-purple-200 dark:border-purple-800 text-sm font-bold px-4 py-2">
            {fortune.category}
          </span>
        </div>

        <div className="space-y-6">
          {/* Do's */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-xl border-l-4 border-green-500 shadow-md">
            <h4 className="flex items-center space-x-2 font-bold text-green-700 dark:text-green-400 mb-3 text-lg">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Do's</span>
            </h4>
            <ul className="space-y-2 ml-10">
              {fortune.dos.map((item, idx) => (
                <li key={idx} className="text-stone-700 dark:text-stone-300 flex items-start space-x-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts */}
          <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 p-5 rounded-xl border-l-4 border-red-500 shadow-md">
            <h4 className="flex items-center space-x-2 font-bold text-red-700 dark:text-red-400 mb-3 text-lg">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Don'ts</span>
            </h4>
            <ul className="space-y-2 ml-10">
              {fortune.donts.map((item, idx) => (
                <li key={idx} className="text-stone-700 dark:text-stone-300 flex items-start space-x-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Inspiration */}
          <div className="relative bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 dark:from-amber-900/30 dark:via-orange-900/30 dark:to-amber-900/30 p-6 rounded-xl border-2 border-amber-300 dark:border-amber-700 shadow-lg glow-amber">
            <div className="absolute top-3 left-3 text-4xl text-amber-500/20 dark:text-amber-400/20">"</div>
            <div className="absolute bottom-3 right-3 text-4xl text-amber-500/20 dark:text-amber-400/20 rotate-180">"</div>
            <p className="text-lg font-semibold italic text-stone-800 dark:text-stone-200 text-center relative z-10">
              {fortune.inspiration}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center space-x-4 mt-8 pt-6 border-t-2 border-gradient-to-r from-amber-200 to-orange-200 dark:from-amber-800 dark:to-orange-800">
          {onShare && (
            <button onClick={onShare} className="btn-outline">
              <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Card
            </button>
          )}
          {onViewHistory && (
            <button onClick={onViewHistory} className="btn-secondary">
              <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View in History
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

