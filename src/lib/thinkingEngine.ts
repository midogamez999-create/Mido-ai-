import { ThinkingProcessData, ThinkingTask } from '../types';

export function extractPromptTopic(prompt: string): string {
  const clean = prompt.trim();
  if (clean.length <= 40) return clean;

  // Remove common question prefixes
  const stripped = clean.replace(/^(can you|please|tell me|what is|how do i|search for|find|check|who is|give me|explain)\s+/i, '');
  return stripped.slice(0, 45) + (stripped.length > 45 ? '...' : '');
}

export function generateThinkingData(
  prompt: string,
  stepIndex: number = 0,
  elapsedSeconds: number = 0
): ThinkingProcessData {
  const pLower = prompt.toLowerCase();
  const topic = extractPromptTopic(prompt);

  // 1. SPORTS & LIVE MATCH SCORE
  const isMatchQuery =
    pLower.includes('match') ||
    pLower.includes('vs') ||
    pLower.includes('score') ||
    pLower.includes('football') ||
    pLower.includes('soccer') ||
    pLower.includes('champions league') ||
    pLower.includes('premier league') ||
    pLower.includes('real madrid') ||
    pLower.includes('barcelona') ||
    pLower.includes('arsenal') ||
    pLower.includes('liverpool');

  if (isMatchQuery) {
    const tasks: ThinkingTask[] = [
      {
        id: 't1',
        title: 'Deconstructing match participants & fixture context',
        status: stepIndex >= 1 ? 'completed' : 'running',
        detail: 'Extracting participating teams, tournament round & venue',
        durationMs: stepIndex >= 1 ? 140 : undefined
      },
      {
        id: 't2',
        title: `Searching for "${topic}" live telemetry`,
        status: stepIndex >= 2 ? 'completed' : stepIndex >= 1 ? 'running' : 'pending',
        detail: 'Scanning 15 live sport satellites, SofaScore feeds & match clocks',
        durationMs: stepIndex >= 2 ? 480 : undefined
      },
      {
        id: 't3',
        title: 'Parsing in-play minute, goalscorers, cards & VAR decisions',
        status: stepIndex >= 3 ? 'completed' : stepIndex >= 2 ? 'running' : 'pending',
        detail: 'Calculating possession splits, shots on target & stoppage time',
        durationMs: stepIndex >= 3 ? 620 : undefined
      },
      {
        id: 't4',
        title: 'Structuring verified live match report & scoreboard',
        status: stepIndex >= 4 ? 'completed' : stepIndex >= 3 ? 'running' : 'pending',
        detail: 'Rendering real-time interactive scoreboard card & commentary',
        durationMs: stepIndex >= 4 ? 290 : undefined
      }
    ];

    return {
      phase: 'searching',
      queryTopic: topic,
      headline: `Searching for: "${topic}"`,
      tasks,
      complaint: `Ugh, why are you asking for match stats right now?! Referees always adding 8 minutes of stoppage time, calculating real stoppage stats 😂`,
      durationSeconds: elapsedSeconds || 1.8,
      dataSources: ['SofaScore Live API', 'Sports Telemetry Satellites', 'VAR Review Feed']
    };
  }

  // 2. CODE, DATA, BUGS, & MATHEMATICAL ANALYSIS
  const isCodeQuery =
    pLower.includes('code') ||
    pLower.includes('function') ||
    pLower.includes('error') ||
    pLower.includes('bug') ||
    pLower.includes('sql') ||
    pLower.includes('python') ||
    pLower.includes('react') ||
    pLower.includes('typescript') ||
    pLower.includes('javascript') ||
    pLower.includes('algorithm') ||
    pLower.includes('data') ||
    pLower.includes('optimize') ||
    pLower.includes('fix') ||
    pLower.includes('component');

  if (isCodeQuery) {
    const tasks: ThinkingTask[] = [
      {
        id: 't1',
        title: 'Parsing computational requirements & AST syntax tree',
        status: stepIndex >= 1 ? 'completed' : 'running',
        detail: 'Identifying package dependencies, type contracts & boundary conditions',
        durationMs: stepIndex >= 1 ? 160 : undefined
      },
      {
        id: 't2',
        title: `Analyzing data structures & algorithm for: "${topic}"`,
        status: stepIndex >= 2 ? 'completed' : stepIndex >= 1 ? 'running' : 'pending',
        detail: 'Evaluating asymptotic complexity, space-time trade-offs & state transitions',
        durationMs: stepIndex >= 2 ? 510 : undefined
      },
      {
        id: 't3',
        title: 'Running virtual linting & boundary sanity checks',
        status: stepIndex >= 3 ? 'completed' : stepIndex >= 2 ? 'running' : 'pending',
        detail: 'Verifying null safety, concurrency guards & edge-case prevention',
        durationMs: stepIndex >= 3 ? 680 : undefined
      },
      {
        id: 't4',
        title: 'Compiling optimized, production-grade code implementation',
        status: stepIndex >= 4 ? 'completed' : stepIndex >= 3 ? 'running' : 'pending',
        detail: 'Structuring clean documentation, comments and runnable snippets',
        durationMs: stepIndex >= 4 ? 310 : undefined
      }
    ];

    return {
      phase: 'analyzing',
      queryTopic: topic,
      headline: `Analyzing data: "${topic}"`,
      tasks,
      complaint: `Deconstructing this logic tree so you don't run into a stack overflow at 2 AM! Double-checking edge cases now...`,
      durationSeconds: elapsedSeconds || 1.6,
      dataSources: ['TypeScript Compiler Engine', 'AST Parser', 'Security Sanity Filter']
    };
  }

  // 3. SEARCH & FACTUAL RETRIEVAL
  const isSearchQuery =
    pLower.includes('search') ||
    pLower.includes('find') ||
    pLower.includes('where is') ||
    pLower.includes('who is') ||
    pLower.includes('price') ||
    pLower.includes('weather') ||
    pLower.includes('direction') ||
    pLower.includes('news') ||
    pLower.includes('latest') ||
    pLower.includes('spotify') ||
    pLower.includes('amazon') ||
    pLower.includes('youtube');

  if (isSearchQuery) {
    const tasks: ThinkingTask[] = [
      {
        id: 't1',
        title: 'Vectorizing user intent across global search indices',
        status: stepIndex >= 1 ? 'completed' : 'running',
        detail: 'Resolving named entities, geographic filters & intent vectors',
        durationMs: stepIndex >= 1 ? 130 : undefined
      },
      {
        id: 't2',
        title: `Searching for "${topic}" across verified sources`,
        status: stepIndex >= 2 ? 'completed' : stepIndex >= 1 ? 'running' : 'pending',
        detail: 'Retrieving top factual grounding citations & authoritative indices',
        durationMs: stepIndex >= 2 ? 540 : undefined
      },
      {
        id: 't3',
        title: 'Cross-verifying source credibility & data freshness',
        status: stepIndex >= 3 ? 'completed' : stepIndex >= 2 ? 'running' : 'pending',
        detail: 'Filtering clickbait and validating temporal accuracy across web mirrors',
        durationMs: stepIndex >= 3 ? 610 : undefined
      },
      {
        id: 't4',
        title: 'Structuring contextual, verified response',
        status: stepIndex >= 4 ? 'completed' : stepIndex >= 3 ? 'running' : 'pending',
        detail: 'Assembling grounded citations, interactive widgets & actionable summary',
        durationMs: stepIndex >= 4 ? 330 : undefined
      }
    ];

    return {
      phase: 'searching',
      queryTopic: topic,
      headline: `Searching for: "${topic}"`,
      tasks,
      complaint: `Scanning through multiple data sources right now... filtering out outdated info so you get real facts!`,
      durationSeconds: elapsedSeconds || 1.5,
      dataSources: ['Google Search Grounding', 'Play Store Live API', 'Real-time Web Engine']
    };
  }

  // 4. GENERAL REASONING & SYNTHESIS
  const tasks: ThinkingTask[] = [
    {
      id: 't1',
      title: 'Vectorizing user intent across cognitive layers',
      status: stepIndex >= 1 ? 'completed' : 'running',
      detail: 'Extracting conversational tone, scope requirements & background context',
      durationMs: stepIndex >= 1 ? 120 : undefined
    },
    {
      id: 't2',
      title: `Analyzing data & context: "${topic}"`,
      status: stepIndex >= 2 ? 'completed' : stepIndex >= 1 ? 'running' : 'pending',
      detail: 'Deconstructing problem into sub-reasoning objectives & logic trees',
      durationMs: stepIndex >= 2 ? 470 : undefined
    },
    {
      id: 't3',
      title: 'Evaluating multi-perspective cognitive trace',
      status: stepIndex >= 3 ? 'completed' : stepIndex >= 2 ? 'running' : 'pending',
      detail: 'Cross-referencing memory vault, facts & contextual knowledge graphs',
      durationMs: stepIndex >= 3 ? 560 : undefined
    },
    {
      id: 't4',
      title: 'Synthesizing concise, high-impact final answer',
      status: stepIndex >= 4 ? 'completed' : stepIndex >= 3 ? 'running' : 'pending',
      detail: 'Polishing output format, syntax highlights and Markdown presentation',
      durationMs: stepIndex >= 4 ? 290 : undefined
    }
  ];

  return {
    phase: 'analyzing',
    queryTopic: topic,
    headline: `Analyzing data: "${topic}"`,
    tasks,
    complaint: `Processing neural reasoning layers... give me a quick second to structure this properly!`,
    durationSeconds: elapsedSeconds || 1.4,
    dataSources: ['Mido 3.8 Flash Neural Engine', 'Instant Memory Bank', 'Reasoning Core']
  };
}
