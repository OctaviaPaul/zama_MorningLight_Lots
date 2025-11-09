"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../hooks/useWallet";
import { useMorningLightLots } from "../../hooks/useMorningLightLots";
import FortuneCard from "../../components/FortuneCard";
import type { FortuneRecord } from "../../types/fortune";

export default function HistoryPage() {
  const router = useRouter();
  const { connected } = useWallet();
  const { getFortuneRecords, decryptFortune, isDecrypting } = useMorningLightLots();

  const [records, setRecords] = useState<FortuneRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<FortuneRecord | null>(null);

  useEffect(() => {
    if (!connected) {
      router.push("/");
    }
  }, [connected, router]);

  useEffect(() => {
    async function loadRecords() {
      setLoading(true);
      const data = await getFortuneRecords();
      setRecords(data);
      setLoading(false);
    }

    if (connected) {
      loadRecords();
    }
  }, [connected, getFortuneRecords]);

  const handleDecrypt = async (record: FortuneRecord, index: number) => {
    try {
      const content = await decryptFortune(index);
      const updated = [...records];
      updated[index] = {
        ...updated[index],
        status: "decrypted",
        fortuneNumber: content.number,
        fortuneContent: content,
        decryptedAt: Date.now() / 1000,
      };
      setRecords(updated);
    } catch (err) {
      console.error("Failed to decrypt:", err);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "decrypted":
        return <span className="badge-success">Decrypted</span>;
      case "cooling":
        return <span className="badge-warning">Cooling Down</span>;
      case "ready":
        return <span className="badge-info">Ready to Decrypt</span>;
      default:
        return null;
    }
  };

  if (!connected) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 animate-fadeInUp">
          <h1 className="text-4xl font-bold gradient-text mb-3 flex items-center">
            <svg className="w-10 h-10 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Fortune History
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-lg">
            📜 View all your past fortune draws
          </p>
        </div>

        {loading ? (
          <div className="glass-card text-center py-16 animate-fadeInUp">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <svg className="relative animate-spin h-12 w-12 mx-auto text-amber-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="text-stone-600 dark:text-stone-400 text-lg font-medium">Loading history...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="glass-card text-center py-16 animate-fadeInUp border-2 border-amber-200/50 dark:border-amber-800/50">
            <div className="text-8xl mb-6 animate-float">📜</div>
            <h3 className="text-2xl font-bold mb-3 gradient-text">No fortunes drawn yet</h3>
            <p className="text-stone-600 dark:text-stone-400 mb-8 text-lg">
              Start your journey by drawing your first fortune!
            </p>
            <button
              onClick={() => router.push("/draw/")}
              className="btn-primary text-lg px-8 py-4 mx-auto hover-glow-amber"
            >
              <svg className="w-6 h-6 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Draw Your First Fortune
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record, idx) => (
              <div 
                key={record.drawId} 
                className="card-interactive animate-fadeInUp border-2 border-amber-200/30 dark:border-amber-800/30"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg text-4xl animate-pulse-slow">
                      {record.status === "decrypted" ? "✅" : "🎴"}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-xl gradient-text">
                          {record.fortuneNumber
                            ? `Fortune #${record.fortuneNumber}`
                            : `Draw #${record.drawId}`}
                        </h3>
                        {getStatusBadge(record.status)}
                      </div>
                      <p className="text-sm font-medium text-stone-600 dark:text-stone-400 mb-1">
                        📅 {formatDate(record.timestamp)}
                      </p>
                      {record.fortuneContent && (
                        <p className="text-sm text-stone-600 dark:text-stone-400 italic mt-2 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-lg inline-block">
                          "{record.fortuneContent.inspiration.slice(0, 60)}..."
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {record.status === "ready" && (
                      <button
                        onClick={() => handleDecrypt(record, idx)}
                        disabled={isDecrypting}
                        className="btn-secondary"
                      >
                        {isDecrypting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 inline" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Decrypting...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                            Decrypt
                          </>
                        )}
                      </button>
                    )}
                    {record.status === "decrypted" && record.fortuneContent && (
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="btn-outline"
                      >
                        <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedRecord && selectedRecord.fortuneContent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeInUp">
            <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="relative">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="absolute -top-2 -right-2 z-10 p-3 bg-gradient-to-br from-red-500 to-rose-500 text-white rounded-full hover:scale-110 transition-all duration-300 shadow-xl hover:shadow-2xl group"
                >
                  <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <FortuneCard
                  fortune={selectedRecord.fortuneContent}
                  date={formatDate(selectedRecord.timestamp)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

