#!/usr/bin/env python3
"""
FootballService - Complete Football Data & Live Scores Integration for Mido AI.
Powered by football-data.org API v4.

Features:
- Live Matches, Fixtures, Results, Standings, Top Scorers across major leagues (PL, PD, SA, BL1, FL1, CL).
- Memory caching with configurable TTL to reduce API token usage and prevent 429 rate limits.
- Robust error handling, rate limiting detection, exponential backoff, and structured JSON output.
- Comprehensive logging.
"""

import os
import sys
import json
import time
import logging
import argparse
from typing import Dict, Any, Optional, List
import urllib.request
import urllib.error

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] FootballService: %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("FootballService")

DEFAULT_API_KEY = os.environ.get("FOOTBALL_DATA_API_KEY", "3e97d8ffaa504d8ab69a2afd4bec58ce")
BASE_URL = "https://api.football-data.org/v4"

# Supported Competitions
SUPPORTED_LEAGUES = {
    "PL": "Premier League (England)",
    "PD": "La Liga (Spain)",
    "SA": "Serie A (Italy)",
    "BL1": "Bundesliga (Germany)",
    "FL1": "Ligue 1 (France)",
    "CL": "UEFA Champions League",
    "EC": "European Championship",
    "WC": "FIFA World Cup"
}


class FootballService:
    """Production-grade Football Data Service class for fetching live football metrics."""

    def __init__(self, api_key: Optional[str] = None, cache_ttl: int = 180):
        self.api_key = api_key or os.environ.get("FOOTBALL_DATA_API_KEY", DEFAULT_API_KEY)
        self.cache_ttl = cache_ttl
        self._cache: Dict[str, Dict[str, Any]] = {}
        if not self.api_key:
            logger.warning("No FOOTBALL_DATA_API_KEY provided. API calls may fail with 401.")

    def _get_headers(self) -> Dict[str, str]:
        return {
            "X-Auth-Token": self.api_key,
            "User-Agent": "MidoAI-FootballService/1.0",
            "Accept": "application/json"
        }

    def _fetch_from_api(self, endpoint: str, params: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """Internal helper to request API data with caching and 429 rate limit backoff."""
        # Check cache
        cache_key = f"{endpoint}?{json.dumps(params or {}, sort_keys=True)}"
        now = time.time()

        if cache_key in self._cache:
            entry = self._cache[cache_key]
            if now - entry["timestamp"] < self.cache_ttl:
                logger.info(f"Returning cached data for key: {cache_key}")
                return {"success": True, "cached": True, "data": entry["data"]}

        url = f"{BASE_URL}/{endpoint}"
        if params:
            query_str = urllib.parse.urlencode({k: v for k, v in params.items() if v is not None})
            if query_str:
                url += f"?{query_str}"

        logger.info(f"Fetching from API: {url}")
        req = urllib.request.Request(url, headers=self._get_headers())

        retries = 2
        backoff = 2

        for attempt in range(retries + 1):
            try:
                with urllib.request.urlopen(req, timeout=10) as response:
                    raw_data = response.read().decode("utf-8")
                    data = json.loads(raw_data)
                    
                    # Store in cache
                    self._cache[cache_key] = {
                        "timestamp": now,
                        "data": data
                    }
                    return {"success": True, "cached": False, "data": data}

            except urllib.error.HTTPError as e:
                err_msg = e.read().decode("utf-8") if e.fp else str(e)
                if e.code == 429:
                    logger.warning(f"Rate limited (429) by football-data.org API on attempt {attempt+1}. Backing off {backoff}s...")
                    if attempt < retries:
                        time.sleep(backoff)
                        backoff *= 2
                        continue
                logger.error(f"HTTPError {e.code} for {url}: {err_msg}")
                return {"success": False, "error": f"HTTP {e.code}: {e.reason}", "details": err_msg}

            except Exception as e:
                logger.error(f"Request failed for {url}: {e}")
                return {"success": False, "error": str(e)}

        return {"success": False, "error": "Max retries exceeded"}

    def get_live_matches(self) -> Dict[str, Any]:
        """Fetch all currently live or paused football matches worldwide."""
        logger.info("Fetching live matches...")
        result = self._fetch_from_api("matches", {"status": "IN_PLAY,PAUSED"})
        if not result["success"]:
            # Fallback to TODAY matches if no active IN_PLAY matches
            result = self._fetch_from_api("matches", {})

        if result["success"]:
            matches = result["data"].get("matches", [])
            live_list = []
            for m in matches:
                live_list.append({
                    "id": m.get("id"),
                    "competition": m.get("competition", {}).get("name"),
                    "competitionCode": m.get("competition", {}).get("code"),
                    "homeTeam": m.get("homeTeam", {}).get("name"),
                    "homeTeamCrest": m.get("homeTeam", {}).get("crest"),
                    "awayTeam": m.get("awayTeam", {}).get("name"),
                    "awayTeamCrest": m.get("awayTeam", {}).get("crest"),
                    "score": {
                        "home": m.get("score", {}).get("fullTime", {}).get("home") if m.get("score", {}).get("fullTime", {}).get("home") is not None else m.get("score", {}).get("halfTime", {}).get("home", 0),
                        "away": m.get("score", {}).get("fullTime", {}).get("away") if m.get("score", {}).get("fullTime", {}).get("away") is not None else m.get("score", {}).get("halfTime", {}).get("away", 0)
                    },
                    "status": m.get("status"),
                    "minute": m.get("minute", "LIVE"),
                    "utcDate": m.get("utcDate")
                })
            return {"success": True, "count": len(live_list), "matches": live_list, "raw": result["data"]}
        return result

    def get_fixtures(self, competition_code: str = "PL", limit: int = 10) -> Dict[str, Any]:
        """Fetch upcoming scheduled fixtures for a specific competition."""
        logger.info(f"Fetching fixtures for league: {competition_code}")
        endpoint = f"competitions/{competition_code}/matches"
        result = self._fetch_from_api(endpoint, {"status": "SCHEDULED"})

        if result["success"]:
            matches = result["data"].get("matches", [])[:limit]
            fixtures_list = []
            for m in matches:
                fixtures_list.append({
                    "id": m.get("id"),
                    "competition": m.get("competition", {}).get("name"),
                    "homeTeam": m.get("homeTeam", {}).get("name"),
                    "homeTeamCrest": m.get("homeTeam", {}).get("crest"),
                    "awayTeam": m.get("awayTeam", {}).get("name"),
                    "awayTeamCrest": m.get("awayTeam", {}).get("crest"),
                    "utcDate": m.get("utcDate"),
                    "matchday": m.get("matchday"),
                    "status": m.get("status")
                })
            return {"success": True, "competition": competition_code, "count": len(fixtures_list), "fixtures": fixtures_list}
        return result

    def get_results(self, competition_code: str = "PL", limit: int = 10) -> Dict[str, Any]:
        """Fetch completed match results for a competition."""
        logger.info(f"Fetching finished results for league: {competition_code}")
        endpoint = f"competitions/{competition_code}/matches"
        result = self._fetch_from_api(endpoint, {"status": "FINISHED"})

        if result["success"]:
            matches = result["data"].get("matches", [])
            # Get latest finished matches
            matches.sort(key=lambda x: x.get("utcDate", ""), reverse=True)
            results_list = []
            for m in matches[:limit]:
                results_list.append({
                    "id": m.get("id"),
                    "competition": m.get("competition", {}).get("name"),
                    "homeTeam": m.get("homeTeam", {}).get("name"),
                    "homeTeamCrest": m.get("homeTeam", {}).get("crest"),
                    "awayTeam": m.get("awayTeam", {}).get("name"),
                    "awayTeamCrest": m.get("awayTeam", {}).get("crest"),
                    "score": {
                        "home": m.get("score", {}).get("fullTime", {}).get("home"),
                        "away": m.get("score", {}).get("fullTime", {}).get("away")
                    },
                    "utcDate": m.get("utcDate"),
                    "matchday": m.get("matchday")
                })
            return {"success": True, "competition": competition_code, "count": len(results_list), "results": results_list}
        return result

    def get_standings(self, competition_code: str = "PL") -> Dict[str, Any]:
        """Fetch current league table standings for a competition."""
        logger.info(f"Fetching standings for league: {competition_code}")
        endpoint = f"competitions/{competition_code}/standings"
        result = self._fetch_from_api(endpoint)

        if result["success"]:
            standings_data = result["data"].get("standings", [])
            table = []
            if standings_data:
                # Total standings table
                main_table = standings_data[0].get("table", [])
                for row in main_table:
                    table.append({
                        "position": row.get("position"),
                        "team": row.get("team", {}).get("name"),
                        "crest": row.get("team", {}).get("crest"),
                        "played": row.get("playedGames"),
                        "won": row.get("won"),
                        "draw": row.get("draw"),
                        "lost": row.get("lost"),
                        "points": row.get("points"),
                        "goalsFor": row.get("goalsFor"),
                        "goalsAgainst": row.get("goalsAgainst"),
                        "goalDifference": row.get("goalDifference")
                    })
            return {
                "success": True,
                "competition": result["data"].get("competition", {}).get("name", competition_code),
                "season": result["data"].get("season", {}).get("startDate"),
                "table": table
            }
        return result

    def get_top_scorers(self, competition_code: str = "PL", limit: int = 10) -> Dict[str, Any]:
        """Fetch top goal scorers for a competition."""
        logger.info(f"Fetching top scorers for league: {competition_code}")
        endpoint = f"competitions/{competition_code}/scorers"
        result = self._fetch_from_api(endpoint, {"limit": str(limit)})

        if result["success"]:
            scorers_data = result["data"].get("scorers", [])
            scorers_list = []
            for item in scorers_data[:limit]:
                player = item.get("player", {})
                team = item.get("team", {})
                scorers_list.append({
                    "id": player.get("id"),
                    "name": player.get("name"),
                    "team": team.get("name"),
                    "teamCrest": team.get("crest"),
                    "goals": item.get("goals"),
                    "assists": item.get("assists", 0),
                    "penalties": item.get("penalties", 0),
                    "playedMatches": item.get("playedMatches")
                })
            return {
                "success": True,
                "competition": result["data"].get("competition", {}).get("name", competition_code),
                "count": len(scorers_list),
                "scorers": scorers_list
            }
        return result


def main():
    parser = argparse.ArgumentParser(description="Mido AI Football Service CLI")
    parser.add_argument("--action", choices=["live", "fixtures", "results", "standings", "scorers"], default="live")
    parser.add_argument("--league", default="PL", help="League code e.g. PL, PD, SA, BL1, FL1, CL")
    parser.add_argument("--limit", type=int, default=10)
    args = parser.parse_args()

    service = FootballService()
    if args.action == "live":
        res = service.get_live_matches()
    elif args.action == "fixtures":
        res = service.get_fixtures(args.league, args.limit)
    elif args.action == "results":
        res = service.get_results(args.league, args.limit)
    elif args.action == "standings":
        res = service.get_standings(args.league)
    elif args.action == "scorers":
        res = service.get_top_scorers(args.league, args.limit)
    else:
        res = {"error": "Invalid action"}

    print(json.dumps(res, indent=2))


if __name__ == "__main__":
    main()
