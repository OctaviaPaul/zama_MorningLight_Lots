export interface FortuneContent {
  number: number;
  dos: string[];
  donts: string[];
  inspiration: string;
  category: string;
}

export interface FortuneRecord {
  drawId: string;
  user: string;
  timestamp: number;
  handle: string;
  fortuneNumber: number | null;
  status: "cooling" | "ready" | "decrypted";
  cooldownEndTime: number;
  decryptedAt: number | null;
  fortuneContent?: FortuneContent;
}

export type FortunesData = Record<string, FortuneContent>;

