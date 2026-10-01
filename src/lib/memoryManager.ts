import { PermanentMemoryItem } from '../types';

export const MEMORY_STORAGE_KEY = 'mido_permanent_memory_vault_v1';
export const SECRET_STORAGE_KEY = 'mido_2026_memory_vault_v1';

export const DEFAULT_MEMORIES: PermanentMemoryItem[] = [
  {
    id: 'mem_identity_mido',
    fact: "User's nickname is Mido Gamez (addressed as Mido).",
    category: 'identity',
    timestamp: 'Permanent Seed',
    source: 'auto',
  },
  {
    id: 'mem_core_assistant',
    fact: "Mido AI is the user's elite personal AI assistant with 200-IQ reasoning, supercharged coding, football knowledge, and unbreakable photographic memory.",
    category: 'facts',
    timestamp: 'Permanent Seed',
    source: 'auto',
  },
  {
    id: 'mem_football_club',
    fact: "User is a passionate supporter of Real Madrid and top-tier global football.",
    category: 'preference',
    timestamp: 'Permanent Seed',
    source: 'auto',
  },
];

export function loadPermanentMemories(userNickname = 'Mido'): PermanentMemoryItem[] {
  try {
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // Check if secret test place had memories
    const secretRaw = localStorage.getItem(SECRET_STORAGE_KEY);
    if (secretRaw) {
      const secretParsed = JSON.parse(secretRaw);
      if (Array.isArray(secretParsed) && secretParsed.length > 0) {
        return secretParsed.map((item: any) => ({
          id: item.id || `mem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          fact: item.fact || String(item),
          category: item.category || 'facts',
          timestamp: item.timestamp || 'Synced from Lab 2026',
          source: item.source || 'auto',
        }));
      }
    }
  } catch (e) {
    console.warn('Failed to parse permanent memories:', e);
  }

  return DEFAULT_MEMORIES.map((m) =>
    m.id === 'mem_identity_mido' ? { ...m, fact: `User's nickname is ${userNickname}.` } : m
  );
}

export function savePermanentMemories(memories: PermanentMemoryItem[]) {
  try {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memories));
    // Also sync to secret storage so Lab 2026 shares this enhanced memory
    localStorage.setItem(SECRET_STORAGE_KEY, JSON.stringify(memories));
  } catch (e) {
    console.warn('Failed to save permanent memories:', e);
  }
}

/**
 * Intelligent regex and heuristic pattern matcher to extract personal facts,
 * preferences, projects, and secrets from user conversational input.
 */
export function extractFactsFromPrompt(prompt: string): { fact: string; category: PermanentMemoryItem['category'] }[] {
  const trimmed = prompt.trim();
  if (!trimmed || trimmed.length < 5) return [];

  const results: { fact: string; category: PermanentMemoryItem['category'] }[] = [];

  // 1. Direct "remember that / remember:"
  const directRememberMatch = /(?:remember that|remember:|don't forget that|never forget that|keep in mind that|take note that)\s+([^.!?]+)/i.exec(trimmed);
  if (directRememberMatch && directRememberMatch[1]) {
    results.push({
      fact: directRememberMatch[1].trim(),
      category: 'custom',
    });
  }

  // 2. Name / Identity
  const nameMatch = /(?:my name is|call me|i am called|my full name is)\s+([a-zA-Z0-9\s]+?)(?:[.!,]|$)/i.exec(trimmed);
  if (nameMatch && nameMatch[1]) {
    results.push({
      fact: `User's name is ${nameMatch[1].trim()}`,
      category: 'identity',
    });
  }

  // 3. Location / Living
  const liveMatch = /(?:i live in|i am from|i'm based in|i stay in)\s+([a-zA-Z0-9\s,]+?)(?:[.!,]|$)/i.exec(trimmed);
  if (liveMatch && liveMatch[1]) {
    results.push({
      fact: `User lives in / is based in ${liveMatch[1].trim()}`,
      category: 'identity',
    });
  }

  // 4. Profession / Role
  const jobMatch = /(?:i work as a|i work as an|my job is|i am a software|i am a developer|i am a designer|i study)\s+([a-zA-Z0-9\s]+?)(?:[.!,]|$)/i.exec(trimmed);
  if (jobMatch && jobMatch[1]) {
    results.push({
      fact: `User role/profession: ${jobMatch[0].replace(/^(?:my job is|i am a|i am an|i work as a|i work as an)\s*/i, '').trim()}`,
      category: 'identity',
    });
  }

  // 5. Favorites (player, team, club, food, music, movie, language, game)
  const favMatch = /(?:my favorite|my fav)\s+([a-zA-Z0-9\s]+?)\s+is\s+([^.!,]+)/i.exec(trimmed);
  if (favMatch && favMatch[1] && favMatch[2]) {
    results.push({
      fact: `User's favorite ${favMatch[1].trim()} is ${favMatch[2].trim()}`,
      category: 'preference',
    });
  }

  // 6. Loves / Prefers
  const loveMatch = /(?:i really love|i love|i prefer|i adore)\s+([^.!,]+)/i.exec(trimmed);
  if (loveMatch && loveMatch[1] && !trimmed.toLowerCase().includes('favorite')) {
    results.push({
      fact: `User prefers/loves: ${loveMatch[1].trim()}`,
      category: 'preference',
    });
  }

  // 7. Dislikes / Hates
  const hateMatch = /(?:i hate|i dislike|i can't stand|i don't like)\s+([^.!,]+)/i.exec(trimmed);
  if (hateMatch && hateMatch[1]) {
    results.push({
      fact: `User dislikes: ${hateMatch[1].trim()}`,
      category: 'preference',
    });
  }

  // 8. Projects & Code
  const projectMatch = /(?:i am building|i'm building|my project is|i am developing|working on an app called|working on)\s+([^.!,]+)/i.exec(trimmed);
  if (projectMatch && projectMatch[1]) {
    results.push({
      fact: `User project: ${projectMatch[1].trim()}`,
      category: 'projects',
    });
  }

  // 9. Secrets & Codes
  const secretMatch = /(?:my secret is|secret code is|the secret pass is|confidential code is)\s+([^.!?]+)/i.exec(trimmed);
  if (secretMatch && secretMatch[1]) {
    results.push({
      fact: `Secret: ${secretMatch[1].trim()}`,
      category: 'secret',
    });
  }

  // 10. Ownership (pet, car, setup)
  const ownMatch = /(?:i have a|i own a|i have an)\s+([a-zA-Z0-9\s]+?)(?:named|called)\s+([^.!,]+)/i.exec(trimmed);
  if (ownMatch && ownMatch[1] && ownMatch[2]) {
    results.push({
      fact: `User has a ${ownMatch[1].trim()} named ${ownMatch[2].trim()}`,
      category: 'identity',
    });
  }

  return results;
}
