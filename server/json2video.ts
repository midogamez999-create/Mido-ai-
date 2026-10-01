// JSON2Video API v2 Integration Service
// Official API endpoint: https://api.json2video.com/v2/

export const DEFAULT_JSON2VIDEO_KEY = process.env.JSON2VIDEO_API_KEY || "IYFdCSvw7VgGpHq4GTRvXSQYSiJE9HUxTeLUHnTa";

export interface Json2VideoElement {
  type: 'image' | 'video' | 'text' | 'voice' | 'audio' | 'component' | 'audiogram' | 'html';
  src?: string;
  text?: string;
  style?: string;
  position?: 'center' | 'top' | 'bottom' | 'center-top' | 'center-bottom' | 'left' | 'right';
  duration?: number;
  start?: number;
  settings?: Record<string, any>;
  [key: string]: any;
}

export interface Json2VideoScene {
  duration: number;
  elements: Json2VideoElement[];
  transition?: {
    type?: string;
    duration?: number;
  };
  comment?: string;
}

export interface CreateJson2VideoOptions {
  prompt: string;
  isPromo?: boolean;
  promoDetails?: {
    brandName?: string;
    promoHeadline?: string;
    discountBadge?: string;
    ctaText?: string;
  };
  aspectRatio?: '16:9' | '9:16' | '1:1';
  resolution?: string;
  quality?: 'high' | 'medium' | 'draft';
  apiKey?: string;
  customScenes?: Json2VideoScene[];
  keyframes?: string[];
  narratorScript?: string;
}

/**
 * Generate high quality curated image/background assets based on prompt keywords
 */
function getPromptBackdrops(prompt: string, count: number = 3): string[] {
  const p = prompt.toLowerCase();
  
  if (p.includes('football') || p.includes('soccer') || p.includes('messi') || p.includes('ronaldo') || p.includes('stadium') || p.includes('goal')) {
    return [
      "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=1280&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1280&q=80",
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1280&q=80",
    ];
  }
  
  if (p.includes('cyberpunk') || p.includes('neon') || p.includes('future') || p.includes('sci-fi') || p.includes('robot') || p.includes('ai')) {
    return [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1280&q=80",
      "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1280&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1280&q=80",
    ];
  }

  if (p.includes('car') || p.includes('racing') || p.includes('drift') || p.includes('speed') || p.includes('vehicle')) {
    return [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1280&q=80",
      "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1280&q=80",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1280&q=80",
    ];
  }

  if (p.includes('nature') || p.includes('mountain') || p.includes('ocean') || p.includes('forest') || p.includes('landscape')) {
    return [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1280&q=80",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1280&q=80",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1280&q=80",
    ];
  }

  if (p.includes('promo') || p.includes('sale') || p.includes('discount') || p.includes('brand') || p.includes('shop') || p.includes('business')) {
    return [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1280&q=80",
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1280&q=80",
      "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1280&q=80",
    ];
  }

  // General cinematic defaults
  return [
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1280&q=80",
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1280&q=80",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1280&q=80",
  ];
}

/**
 * Submit Movie Render request to JSON2Video API v2
 */
export async function createJson2VideoMovie(options: CreateJson2VideoOptions): Promise<{
  success: boolean;
  project?: string;
  error?: string;
  response?: any;
}> {
  const apiKey = options.apiKey || DEFAULT_JSON2VIDEO_KEY;
  if (!apiKey) {
    return { success: false, error: "JSON2Video API key is missing." };
  }

  const {
    prompt,
    isPromo = false,
    promoDetails,
    aspectRatio = '16:9',
    quality = 'high',
    keyframes = [],
  } = options;

  // Determine resolution string for JSON2Video
  let resolutionString = "hd";
  if (aspectRatio === "9:16") {
    resolutionString = "instagram-story";
  } else if (options.resolution?.includes("1080") || options.resolution?.includes("FHD")) {
    resolutionString = "full-hd";
  } else if (aspectRatio === "1:1") {
    resolutionString = "square-hd";
  } else {
    resolutionString = "hd";
  }

  const backdrops = keyframes.length >= 3 ? keyframes : getPromptBackdrops(prompt, 3);

  let scenes: Json2VideoScene[] = [];

  if (options.customScenes && options.customScenes.length > 0) {
    scenes = options.customScenes;
  } else if (isPromo) {
    const brand = promoDetails?.brandName || "MIDO PROMO";
    const headline = promoDetails?.promoHeadline || prompt.slice(0, 45);
    const discount = promoDetails?.discountBadge || "EXCLUSIVE DEAL";
    const cta = promoDetails?.ctaText || "ORDER NOW & SAVE";

    const panDirections: Array<"top" | "bottom" | "left" | "right"> = ["top", "bottom", "left", "right"];
    scenes = [
      // Scene 1: Promo Hook with Dynamic Pan
      {
        duration: 3,
        elements: [
          {
            type: "image",
            src: backdrops[0],
            pan: "top",
          },
          {
            type: "text",
            text: brand.toUpperCase(),
            style: "001",
            position: "top",
          },
          {
            type: "text",
            text: headline,
            style: "002",
            position: "center",
          }
        ]
      },
      // Scene 2: Feature & Discount with Dynamic Pan
      {
        duration: 3,
        elements: [
          {
            type: "image",
            src: backdrops[1] || backdrops[0],
            pan: "bottom",
          },
          {
            type: "text",
            text: `🔥 ${discount}`,
            style: "003",
            position: "center-top",
          },
          {
            type: "text",
            text: "LIMITED TIME OFFER",
            style: "001",
            position: "center-bottom",
          }
        ]
      },
      // Scene 3: Strong Call To Action with Dynamic Pan
      {
        duration: 3,
        elements: [
          {
            type: "image",
            src: backdrops[2] || backdrops[0],
            pan: "left",
          },
          {
            type: "text",
            text: `⚡ ${cta}`,
            style: "001",
            position: "center",
          },
          {
            type: "text",
            text: `Powered by Mido AI Studio`,
            style: "002",
            position: "bottom",
          }
        ]
      }
    ];
  } else {
    // Cinematic Creative / General Storyboard Scenes with Motion Pan
    const cleanTitle = prompt.length > 35 ? prompt.slice(0, 35) + "..." : prompt;
    scenes = [
      {
        duration: 3,
        elements: [
          {
            type: "image",
            src: backdrops[0],
            pan: "top",
          },
          {
            type: "text",
            text: cleanTitle.toUpperCase(),
            style: "001",
            position: "center",
          }
        ]
      },
      {
        duration: 3,
        elements: [
          {
            type: "image",
            src: backdrops[1] || backdrops[0],
            pan: "bottom",
          },
          {
            type: "text",
            text: "MIDO AI CINEMATICS",
            style: "002",
            position: "center-bottom",
          }
        ]
      },
      {
        duration: 3,
        elements: [
          {
            type: "image",
            src: backdrops[2] || backdrops[0],
            pan: "right",
          },
          {
            type: "text",
            text: "4K ULTRA HD RENDER",
            style: "001",
            position: "center",
          }
        ]
      }
    ];
  }

  const payload = {
    resolution: resolutionString,
    quality: quality || "high",
    scenes,
  };

  try {
    const response = await fetch("https://api.json2video.com/v2/movies", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      console.warn("[JSON2Video] Movie creation failed:", data);
      return {
        success: false,
        error: data.message || "Failed to create JSON2Video project",
        response: data,
      };
    }

    return {
      success: true,
      project: data.project,
      response: data,
    };
  } catch (err: any) {
    console.error("[JSON2Video] Request error:", err);
    return {
      success: false,
      error: err.message || "Network error contacting JSON2Video API",
    };
  }
}

/**
 * Poll JSON2Video movie status and download URL
 */
export async function getJson2VideoMovieStatus(
  projectId: string,
  apiKey?: string
): Promise<{
  success: boolean;
  status: 'queued' | 'running' | 'done' | 'error' | 'not_found';
  url?: string;
  thumbnail?: string;
  duration?: number;
  error?: string;
  raw?: any;
}> {
  const activeKey = apiKey || DEFAULT_JSON2VIDEO_KEY;
  if (!activeKey) {
    return { success: false, status: 'error', error: "JSON2Video API key is missing." };
  }

  try {
    const response = await fetch(`https://api.json2video.com/v2/movies?project=${encodeURIComponent(projectId)}`, {
      method: "GET",
      headers: {
        "x-api-key": activeKey,
      },
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      return {
        success: false,
        status: 'error',
        error: data.message || "Failed to retrieve project status",
        raw: data,
      };
    }

    const movie = data.movie;
    if (!movie) {
      return {
        success: true,
        status: 'queued',
        raw: data,
      };
    }

    const status = movie.status || (movie.url ? 'done' : 'running');

    return {
      success: true,
      status: status === 'done' ? 'done' : status === 'error' ? 'error' : 'running',
      url: movie.url || undefined,
      thumbnail: movie.thumbnail || undefined,
      duration: movie.duration || undefined,
      error: movie.status === 'error' ? movie.message : undefined,
      raw: data,
    };
  } catch (err: any) {
    return {
      success: false,
      status: 'error',
      error: err.message || "Failed to poll JSON2Video API",
    };
  }
}
