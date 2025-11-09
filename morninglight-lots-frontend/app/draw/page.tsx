"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../hooks/useWallet";
import { useMorningLightLots } from "../../hooks/useMorningLightLots";
import FortuneCard from "../../components/FortuneCard";
import type { FortuneContent } from "../../types/fortune";

export default function DrawPage() {
  const router = useRouter();
  const { connected, account } = useWallet();
  const {
    contract,
    canDraw,
    todayDrawCount,
    remainingCooldown,
    fortuneCount,
    isDrawing,
    isDecrypting,
    error,
    drawFortune,
    decryptFortune,
    getCachedFortune,
  } = useMorningLightLots();

  const [drawState, setDrawState] = useState<"idle" | "drawing" | "cooling" | "ready" | "decrypted">("idle");
  const [lastDrawIndex, setLastDrawIndex] = useState<number | null>(null);
  const [fortuneContent, setFortuneContent] = useState<FortuneContent | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [cooldownCompleted, setCooldownCompleted] = useState(false); // 锁定标志
  const stateRestoredRef = useRef(false); // 标记状态是否已恢复

  useEffect(() => {
    if (!connected) {
      router.push("/");
    }
  }, [connected, router]);

  // 恢复状态：检查是否有待解密的签文
  useEffect(() => {
    if (!account || !getCachedFortune) return;
    
    // 检测合约地址变化，清除旧数据
    const storedContractAddress = localStorage.getItem('morninglight_contract_address');
    const currentContractAddress = contract?.target?.toString() || contract?.address?.toString();
    
    if (storedContractAddress && currentContractAddress && storedContractAddress !== currentContractAddress) {
      console.warn("🔄 Contract address changed! Clearing old data...");
      console.warn("  Old:", storedContractAddress);
      console.warn("  New:", currentContractAddress);
      
      // 清除与账户相关的缓存
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`fortune_${account}_`)) {
          localStorage.removeItem(key);
        }
      });
      
      localStorage.setItem('morninglight_contract_address', currentContractAddress);
      return; // 不恢复旧状态
    } else if (currentContractAddress && !storedContractAddress) {
      localStorage.setItem('morninglight_contract_address', currentContractAddress);
    }
    
    // 只在首次加载时恢复（lastDrawIndex 还是 null）
    if (fortuneCount > 0 && lastDrawIndex === null && drawState === "idle") {
      const lastIndex = fortuneCount - 1;
      
      // 首先检查缓存键是否存在
      const cacheKey = `fortune_${account}_${lastIndex}`;
      const cachedData = localStorage.getItem(cacheKey);
      console.log(`🔍 Checking cache for key: ${cacheKey}`);
      console.log(`📦 Cached data exists: ${!!cachedData}`);
      if (cachedData) {
        console.log(`📦 Cached data content:`, cachedData.substring(0, 100));
      }
      
      const cached = getCachedFortune(lastIndex);
      
      console.log(`🔄 Restoring state for index ${lastIndex}`);
      console.log(`   - cached: ${!!cached}`);
      console.log(`   - remainingCooldown: ${remainingCooldown}`);
      console.log(`   - drawState: ${drawState}`);
      
      if (cached) {
        // 已解密，恢复解密状态 - 这个优先级最高
        console.log("✅ Found cached fortune, restoring decrypted state");
        setLastDrawIndex(lastIndex);
        setFortuneContent(cached);
        setDrawState("decrypted");
        setCooldownCompleted(true); // 重要：锁定状态，防止被其他 effect 覆盖
        stateRestoredRef.current = true; // 标记已恢复
      } else if (remainingCooldown === 0) {
        // 冷却已结束，直接进入 ready 状态
        console.log("✅ No cache, cooldown complete, setting ready state");
        setLastDrawIndex(lastIndex);
        setDrawState("ready");
        setCooldownCompleted(true);
        stateRestoredRef.current = true; // 标记已恢复
      } else if (remainingCooldown > 0) {
        // 还在冷却中，恢复倒计时
        console.log(`⏳ No cache, restoring cooldown state with ${remainingCooldown}s remaining`);
        setLastDrawIndex(lastIndex);
        setCountdown(remainingCooldown);
        setDrawState("cooling");
        stateRestoredRef.current = true; // 标记已恢复
        // 不设置 cooldownCompleted，让倒计时继续
      } else {
        // remainingCooldown 还未获取（undefined），等待下次更新
        console.log("⏸️ Waiting for remainingCooldown from contract...");
        setLastDrawIndex(lastIndex);
      }
    }
  }, [fortuneCount, remainingCooldown, lastDrawIndex, account, getCachedFortune, drawState, contract]);

  useEffect(() => {
    // 如果状态已经恢复过，不要被轮询覆盖
    if (stateRestoredRef.current) {
      console.log("🔒 State already restored, ignoring remainingCooldown updates");
      return;
    }
    
    // 一旦冷却完成，不再受轮询影响
    if (cooldownCompleted) {
      console.log("⏸️ Cooldown completed, ignoring remainingCooldown updates");
      return;
    }
    
    // 保护 decrypted 状态，不要被轮询重置
    if (drawState === "decrypted") {
      console.log("✅ Already decrypted, ignoring remainingCooldown updates");
      return;
    }
    
    // 只在非 cooling 状态时才根据 remainingCooldown 更新
    // 避免在倒计时进行中被轮询重置
    if (remainingCooldown > 0 && drawState !== "cooling") {
      console.log(`🕐 Starting cooldown from contract: ${remainingCooldown}s, current state: ${drawState}`);
      setCountdown(remainingCooldown);
      setDrawState("cooling");
    } else if (drawState === "cooling" && remainingCooldown === 0) {
      // 合约确认冷却结束
      console.log("✅ Cooldown confirmed complete by contract");
      setDrawState("ready");
      setCooldownCompleted(true);
    }
  }, [remainingCooldown, drawState, cooldownCompleted]);

  useEffect(() => {
    console.log(`⏱️ Countdown effect: countdown=${countdown}, cooldownCompleted=${cooldownCompleted}, drawState=${drawState}`);
    
    if (countdown > 0 && !cooldownCompleted) {
      console.log(`⏰ Starting countdown timer from ${countdown}`);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          const next = prev - 1;
          console.log(`⏱️ Countdown tick: ${prev} -> ${next}`);
          if (next <= 0) {
            // 本地倒计时结束，锁定状态
            console.log("✅ Countdown complete, setting ready state");
            setDrawState("ready");
            setCooldownCompleted(true);
            return 0;
          }
          return next;
        });
      }, 1000);
      return () => {
        console.log("🛑 Clearing countdown timer");
        clearInterval(timer);
      };
    }
  }, [countdown, cooldownCompleted, drawState]);

  const handleDraw = async () => {
    try {
      setDrawState("drawing");
      setCooldownCompleted(false); // 重置锁定
      stateRestoredRef.current = false; // 重置恢复标记
      
      // 记录抽签前的数量，这就是新签文的索引
      const newFortuneIndex = fortuneCount;
      console.log("🎲 Drawing fortune, will be at index:", newFortuneIndex);
      
      const drawId = await drawFortune();
      
      // 设置新签文的索引
      setLastDrawIndex(newFortuneIndex);
      console.log("✅ Fortune drawn, index set to:", newFortuneIndex);
      
      setCountdown(5); // 改为 5 秒
      setDrawState("cooling");
    } catch (err) {
      console.error("Draw failed:", err);
      setDrawState("idle");
    }
  };

  const handleDecrypt = async () => {
    console.log("🔓 Decrypt button clicked");
    console.log("lastDrawIndex:", lastDrawIndex);
    console.log("fortuneCount:", fortuneCount);
    
    if (lastDrawIndex === null) {
      console.error("❌ lastDrawIndex is null");
      alert("Error: No fortune to decrypt. Please draw a fortune first.");
      return;
    }

    try {
      console.log("🔐 Starting decryption for index:", lastDrawIndex);
      const content = await decryptFortune(lastDrawIndex);
      console.log("✅ Decryption successful:", content);
      setFortuneContent(content);
      setDrawState("decrypted");
      setCooldownCompleted(false); // 重置锁定，准备下次抽签
    } catch (err: any) {
      console.error("❌ Decrypt failed:", err);
      alert(`Decryption failed: ${err.message}`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!connected) {
    return null; // Will redirect
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Status Card */}
        <div className="glass-card mb-8 p-6 border-2 border-amber-200/50 dark:border-amber-800/50 animate-fadeInUp">
          <h2 className="text-3xl font-bold mb-6 gradient-text flex items-center">
            <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Daily Fortune Draw
          </h2>
          
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border-2 border-purple-200 dark:border-purple-800 shadow-md">
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Today's Draws</p>
              <p className="text-3xl font-bold gradient-text-purple">{todayDrawCount} / 1</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border-2 border-amber-200 dark:border-amber-800 shadow-md">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">Total Fortunes</p>
              <p className="text-3xl font-bold gradient-text">{fortuneCount}</p>
            </div>
          </div>

          {todayDrawCount >= 1 && remainingCooldown === 0 && drawState !== "decrypted" && (
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-4 shadow-md animate-fadeInUp">
              <p className="text-amber-900 dark:text-amber-100 font-medium text-center">
                ✨ You've used your daily draw. Come back tomorrow at UTC 00:00!
              </p>
            </div>
          )}
        </div>

        {/* Drawing Area */}
        {drawState === "idle" && canDraw && (
          <div className="card text-center py-12 animate-fadeInUp border-2 border-amber-200/50 dark:border-amber-800/50">
            <div className="mb-8">
              <div className="text-9xl mb-6 animate-float filter drop-shadow-2xl">🎋</div>
              <h3 className="text-2xl font-bold mb-3 gradient-text">Ready to Draw Your Fortune?</h3>
              <p className="text-stone-600 dark:text-stone-400 text-lg">
                Click the button below to shake the fortune stick
              </p>
            </div>
            
            <button
              onClick={handleDraw}
              disabled={isDrawing}
              className="btn-primary text-xl px-10 py-4 mx-auto hover-glow-amber"
            >
              {isDrawing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white inline" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Drawing...
                </>
              ) : (
                <>
                  <span className="text-2xl mr-2">🎲</span>
                  Shake & Draw
                </>
              )}
            </button>
          </div>
        )}

        {drawState === "drawing" && (
          <div className="card text-center py-12 animate-fadeInUp border-2 border-amber-200/50 dark:border-amber-800/50 glow-amber">
            <div className="text-9xl mb-6 animate-shake filter drop-shadow-2xl">🎋</div>
            <h3 className="text-2xl font-bold mb-3 gradient-text">Drawing Your Fortune...</h3>
            <p className="text-stone-600 dark:text-stone-400 text-lg">
              ⛓️ Waiting for blockchain confirmation
            </p>
            <div className="mt-6 flex justify-center space-x-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}

        {drawState === "cooling" && (
          <div className="card text-center py-12 animate-fadeInUp border-2 border-blue-200/50 dark:border-blue-800/50">
            <div className="text-9xl mb-6 animate-pulse-slow filter drop-shadow-2xl">⏳</div>
            <h3 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Cooling Down</h3>
            <div className="mb-4 relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-xl opacity-50"></div>
              <p className="relative text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                {formatTime(countdown)}
              </p>
            </div>
            <p className="text-stone-600 dark:text-stone-400 text-lg">
              Please wait before decrypting your fortune
            </p>
          </div>
        )}

        {drawState === "ready" && (
          <div className="card text-center py-12 animate-fadeInUp border-2 border-green-200/50 dark:border-green-800/50 glow-amber">
            <div className="text-9xl mb-6 animate-pulse-slow filter drop-shadow-2xl">✨</div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Ready to Decrypt!</h3>
            <p className="text-stone-600 dark:text-stone-400 mb-8 text-lg">
              🔓 Your fortune is ready. Click below to reveal it.
            </p>
            
            <button
              onClick={handleDecrypt}
              disabled={isDecrypting}
              className="btn-primary text-xl px-10 py-4 mx-auto hover-glow-amber"
            >
              {isDecrypting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white inline" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Decrypting...
                </>
              ) : (
                <>
                  <span className="text-2xl mr-2">🔓</span>
                  Decrypt Now
                </>
              )}
            </button>
          </div>
        )}

        {drawState === "decrypted" && fortuneContent && (
          <div className="animate-fadeInUp">
            <FortuneCard
              fortune={fortuneContent}
              date={new Date().toLocaleDateString()}
              onViewHistory={() => router.push("/history/")}
            />
          </div>
        )}

        {error && (
          <div className="card bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 border-2 border-red-300 dark:border-red-700 mt-4 animate-fadeInUp shadow-lg">
            <p className="text-red-900 dark:text-red-100 font-medium">❌ {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

