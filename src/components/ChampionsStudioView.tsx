import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Shield,
  Users,
  Play,
  Plus,
  Zap,
  Sparkles,
  Calendar,
  Settings,
  Search,
  Award,
  Activity,
  RotateCcw,
  FileText,
  ChevronRight,
  Star,
  CheckCircle2,
  Trash2,
  Edit3,
  Globe,
  Flame,
  BarChart3,
  Dices,
  DollarSign,
  TrendingUp,
  UserPlus,
  Tv,
  CloudRain,
  Sun,
  CloudSnow,
  Radio,
  Sliders,
  PlayCircle,
  PauseCircle,
  FastForward,
  Flag,
  Save,
  Grid,
  List,
  Layers,
  RefreshCw,
} from 'lucide-react';

export interface Player {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  rating: number; // 1-99
  age: number;
  country: string;
  marketValue: number; // in $M
  potential: number;
  goalsScored?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  badge: string; // Emoji flag or crest
  badgeColor: string;
  kitColor: string;
  secondaryKitColor: string;
  rating: number; // 1-99 overall
  attackRating: number;
  midfieldRating: number;
  defenseRating: number;
  stadiumName: string;
  stadiumCapacity: number;
  managerName: string;
  country: string;
  league: string;
  budget: number; // in $M
  chemistry: number; // 1-100
  morale: number; // 1-100
  players: Player[];
  groupLetter?: string; // 'A', 'B', 'C', etc.
}

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'assist' | 'yellow' | 'red' | 'sub' | 'var' | 'penalty' | 'injury';
  teamId: string;
  teamName: string;
  playerName: string;
  secondaryPlayerName?: string;
  text: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number | null;
  awayScore: number | null;
  played: boolean;
  roundName: string;
  groupLetter?: string;
  stage: 'group' | 'knockout' | 'league';
  events: MatchEvent[];
  stats?: {
    possession: [number, number];
    shots: [number, number];
    shotsOnTarget: [number, number];
    xG: [number, number];
    corners: [number, number];
    fouls: [number, number];
    yellowCards: [number, number];
    redCards: [number, number];
  };
}

export interface TeamStanding {
  team: Team;
  mp: number; // Matches Played
  w: number;  // Wins
  d: number;  // Draws
  l: number;  // Losses
  gf: number; // Goals For
  ga: number; // Goals Against
  gd: number; // Goal Difference
  pts: number;// Points
  yc: number; // Yellow Cards
  rc: number; // Red Cards
  form: ('W' | 'D' | 'L')[];
}

export interface TournamentRules {
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
  numberOfGroups: number; // 2, 4, 8, 16
  teamsQualifyingPerGroup: number; // 1, 2, 3
}

export interface Tournament {
  id: string;
  name: string;
  type: 'global_men' | 'global_women' | 'custom';
  format: 'groups_only' | 'knockout_only' | 'league_only' | 'hybrid_all' | 'hybrid_groups_knockout';
  teams: Team[];
  matches: Match[];
  standings: Record<string, TeamStanding>; // teamId -> standing
  currentRound: number;
  status: 'draft' | 'ongoing' | 'completed';
  winner?: Team;
  rules: TournamentRules;
  createdAt: string;
}

// Global World Preset National Teams & Clubs Database (35+ Countries + Top Clubs)
export const WORLD_DATABASE_TEAMS: Team[] = [
  // National Teams (Men)
  {
    id: 'arg',
    name: 'Argentina',
    shortName: 'ARG',
    badge: '🇦🇷',
    badgeColor: '#38BDF8',
    kitColor: '#7DD3FC',
    secondaryKitColor: '#1E293B',
    rating: 94,
    attackRating: 94,
    midfieldRating: 93,
    defenseRating: 92,
    stadiumName: 'Estadio Monumental',
    stadiumCapacity: 84567,
    managerName: 'Lionel Scaloni',
    country: 'Argentina',
    league: 'National (CONMEBOL)',
    budget: 150,
    chemistry: 98,
    morale: 96,
    players: [
      { id: 'p-arg-1', name: 'Lionel Messi', position: 'FWD', rating: 92, age: 38, country: 'Argentina', marketValue: 35, potential: 92 },
      { id: 'p-arg-2', name: 'Lautaro Martínez', position: 'FWD', rating: 89, age: 27, country: 'Argentina', marketValue: 110, potential: 91 },
      { id: 'p-arg-3', name: 'Alexis Mac Allister', position: 'MID', rating: 87, age: 26, country: 'Argentina', marketValue: 75, potential: 90 },
      { id: 'p-arg-4', name: 'Emiliano Martínez', position: 'GK', rating: 88, age: 32, country: 'Argentina', marketValue: 30, potential: 88 },
    ],
  },
  {
    id: 'fra',
    name: 'France',
    shortName: 'FRA',
    badge: '🇫🇷',
    badgeColor: '#1D4ED8',
    kitColor: '#1E40AF',
    secondaryKitColor: '#FFFFFF',
    rating: 95,
    attackRating: 96,
    midfieldRating: 94,
    defenseRating: 93,
    stadiumName: 'Stade de France',
    stadiumCapacity: 80698,
    managerName: 'Didier Deschamps',
    country: 'France',
    league: 'National (UEFA)',
    budget: 180,
    chemistry: 93,
    morale: 92,
    players: [
      { id: 'p-fra-1', name: 'Kylian Mbappé', position: 'FWD', rating: 93, age: 26, country: 'France', marketValue: 180, potential: 96 },
      { id: 'p-fra-2', name: 'Antoine Griezmann', position: 'MID', rating: 88, age: 34, country: 'France', marketValue: 30, potential: 88 },
      { id: 'p-fra-3', name: 'Aurélien Tchouaméni', position: 'MID', rating: 87, age: 25, country: 'France', marketValue: 90, potential: 92 },
      { id: 'p-fra-4', name: 'Mike Maignan', position: 'GK', rating: 87, age: 30, country: 'France', marketValue: 40, potential: 88 },
    ],
  },
  {
    id: 'bra',
    name: 'Brazil',
    shortName: 'BRA',
    badge: '🇧🇷',
    badgeColor: '#EAB308',
    kitColor: '#FACC15',
    secondaryKitColor: '#16A34A',
    rating: 93,
    attackRating: 95,
    midfieldRating: 91,
    defenseRating: 91,
    stadiumName: 'Maracanã',
    stadiumCapacity: 78838,
    managerName: 'Dorival Júnior',
    country: 'Brazil',
    league: 'National (CONMEBOL)',
    budget: 160,
    chemistry: 91,
    morale: 90,
    players: [
      { id: 'p-bra-1', name: 'Vinícius Júnior', position: 'FWD', rating: 91, age: 24, country: 'Brazil', marketValue: 170, potential: 94 },
      { id: 'p-bra-2', name: 'Rodrygo', position: 'FWD', rating: 88, age: 24, country: 'Brazil', marketValue: 110, potential: 92 },
      { id: 'p-bra-3', name: 'Bruno Guimarães', position: 'MID', rating: 87, age: 27, country: 'Brazil', marketValue: 85, potential: 89 },
      { id: 'p-bra-4', name: 'Alisson Becker', position: 'GK', rating: 89, age: 32, country: 'Brazil', marketValue: 35, potential: 89 },
    ],
  },
  {
    id: 'eng',
    name: 'England',
    shortName: 'ENG',
    badge: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    badgeColor: '#EF4444',
    kitColor: '#FFFFFF',
    secondaryKitColor: '#1E3A8A',
    rating: 93,
    attackRating: 94,
    midfieldRating: 93,
    defenseRating: 91,
    stadiumName: 'Wembley Stadium',
    stadiumCapacity: 90000,
    managerName: 'Thomas Tuchel',
    country: 'England',
    league: 'National (UEFA)',
    budget: 175,
    chemistry: 91,
    morale: 90,
    players: [
      { id: 'p-eng-1', name: 'Harry Kane', position: 'FWD', rating: 91, age: 31, country: 'England', marketValue: 100, potential: 91 },
      { id: 'p-eng-2', name: 'Jude Bellingham', position: 'MID', rating: 90, age: 22, country: 'England', marketValue: 160, potential: 95 },
      { id: 'p-eng-3', name: 'Bukayo Saka', position: 'FWD', rating: 89, age: 23, country: 'England', marketValue: 140, potential: 93 },
      { id: 'p-eng-4', name: 'Jordan Pickford', position: 'GK', rating: 84, age: 31, country: 'England', marketValue: 22, potential: 84 },
    ],
  },
  {
    id: 'esp',
    name: 'Spain',
    shortName: 'ESP',
    badge: '🇪🇸',
    badgeColor: '#DC2626',
    kitColor: '#B91C1C',
    secondaryKitColor: '#FACC15',
    rating: 94,
    attackRating: 93,
    midfieldRating: 96,
    defenseRating: 92,
    stadiumName: 'Santiago Bernabéu',
    stadiumCapacity: 85000,
    managerName: 'Luis de la Fuente',
    country: 'Spain',
    league: 'National (UEFA)',
    budget: 170,
    chemistry: 96,
    morale: 95,
    players: [
      { id: 'p-esp-1', name: 'Lamine Yamal', position: 'FWD', rating: 90, age: 18, country: 'Spain', marketValue: 150, potential: 98 },
      { id: 'p-esp-2', name: 'Rodri', position: 'MID', rating: 91, age: 29, country: 'Spain', marketValue: 130, potential: 92 },
      { id: 'p-esp-3', name: 'Pedri', position: 'MID', rating: 88, age: 22, country: 'Spain', marketValue: 100, potential: 93 },
      { id: 'p-esp-4', name: 'Unai Simón', position: 'GK', rating: 86, age: 28, country: 'Spain', marketValue: 30, potential: 87 },
    ],
  },
  {
    id: 'ger',
    name: 'Germany',
    shortName: 'GER',
    badge: '🇩🇪',
    badgeColor: '#000000',
    kitColor: '#FFFFFF',
    secondaryKitColor: '#000000',
    rating: 91,
    attackRating: 91,
    midfieldRating: 92,
    defenseRating: 90,
    stadiumName: 'Signal Iduna Park',
    stadiumCapacity: 81365,
    managerName: 'Julian Nagelsmann',
    country: 'Germany',
    league: 'National (UEFA)',
    budget: 165,
    chemistry: 90,
    morale: 89,
    players: [
      { id: 'p-ger-1', name: 'Jamal Musiala', position: 'MID', rating: 89, age: 22, country: 'Germany', marketValue: 130, potential: 95 },
      { id: 'p-ger-2', name: 'Florian Wirtz', position: 'MID', rating: 89, age: 22, country: 'Germany', marketValue: 130, potential: 95 },
      { id: 'p-ger-3', name: 'Kai Havertz', position: 'FWD', rating: 85, age: 26, country: 'Germany', marketValue: 70, potential: 88 },
      { id: 'p-ger-4', name: 'Manuel Neuer', position: 'GK', rating: 86, age: 39, country: 'Germany', marketValue: 15, potential: 86 },
    ],
  },
  {
    id: 'por',
    name: 'Portugal',
    shortName: 'POR',
    badge: '🇵🇹',
    badgeColor: '#15803D',
    kitColor: '#DC2626',
    secondaryKitColor: '#15803D',
    rating: 91,
    attackRating: 92,
    midfieldRating: 91,
    defenseRating: 89,
    stadiumName: 'Estádio da Luz',
    stadiumCapacity: 64642,
    managerName: 'Roberto Martínez',
    country: 'Portugal',
    league: 'National (UEFA)',
    budget: 155,
    chemistry: 89,
    morale: 88,
    players: [
      { id: 'p-por-1', name: 'Cristiano Ronaldo', position: 'FWD', rating: 88, age: 40, country: 'Portugal', marketValue: 15, potential: 88 },
      { id: 'p-por-2', name: 'Bruno Fernandes', position: 'MID', rating: 88, age: 30, country: 'Portugal', marketValue: 70, potential: 88 },
      { id: 'p-por-3', name: 'Rafael Leão', position: 'FWD', rating: 86, age: 26, country: 'Portugal', marketValue: 75, potential: 89 },
      { id: 'p-por-4', name: 'Diogo Costa', position: 'GK', rating: 86, age: 25, country: 'Portugal', marketValue: 45, potential: 89 },
    ],
  },
  {
    id: 'ned',
    name: 'Netherlands',
    shortName: 'NED',
    badge: '🇳🇱',
    badgeColor: '#F97316',
    kitColor: '#EA580C',
    secondaryKitColor: '#1E3A8A',
    rating: 89,
    attackRating: 88,
    midfieldRating: 89,
    defenseRating: 92,
    stadiumName: 'Johan Cruyff Arena',
    stadiumCapacity: 55885,
    managerName: 'Ronald Koeman',
    country: 'Netherlands',
    league: 'National (UEFA)',
    budget: 145,
    chemistry: 88,
    morale: 87,
    players: [
      { id: 'p-ned-1', name: 'Virgil van Dijk', position: 'DEF', rating: 89, age: 34, country: 'Netherlands', marketValue: 30, potential: 89 },
      { id: 'p-ned-2', name: 'Cody Gakpo', position: 'FWD', rating: 85, age: 26, country: 'Netherlands', marketValue: 55, potential: 88 },
      { id: 'p-ned-3', name: 'Frenkie de Jong', position: 'MID', rating: 87, age: 28, country: 'Netherlands', marketValue: 70, potential: 89 },
      { id: 'p-ned-4', name: 'Bart Verbruggen', position: 'GK', rating: 83, age: 22, country: 'Netherlands', marketValue: 25, potential: 88 },
    ],
  },
  {
    id: 'ita',
    name: 'Italy',
    shortName: 'ITA',
    badge: '🇮🇹',
    badgeColor: '#2563EB',
    kitColor: '#1D4ED8',
    secondaryKitColor: '#FFFFFF',
    rating: 89,
    attackRating: 87,
    midfieldRating: 90,
    defenseRating: 91,
    stadiumName: 'Stadio Olimpico',
    stadiumCapacity: 70634,
    managerName: 'Luciano Spalletti',
    country: 'Italy',
    league: 'National (UEFA)',
    budget: 150,
    chemistry: 89,
    morale: 88,
    players: [
      { id: 'p-ita-1', name: 'Nicolò Barella', position: 'MID', rating: 87, age: 28, country: 'Italy', marketValue: 80, potential: 89 },
      { id: 'p-ita-2', name: 'Federico Dimarco', position: 'DEF', rating: 86, age: 27, country: 'Italy', marketValue: 50, potential: 88 },
      { id: 'p-ita-3', name: 'Mateo Retegui', position: 'FWD', rating: 83, age: 26, country: 'Italy', marketValue: 35, potential: 86 },
      { id: 'p-ita-4', name: 'Gianluigi Donnarumma', position: 'GK', rating: 88, age: 26, country: 'Italy', marketValue: 50, potential: 91 },
    ],
  },
  {
    id: 'mar',
    name: 'Morocco',
    shortName: 'MAR',
    badge: '🇲🇦',
    badgeColor: '#DC2626',
    kitColor: '#B91C1C',
    secondaryKitColor: '#15803D',
    rating: 88,
    attackRating: 87,
    midfieldRating: 88,
    defenseRating: 89,
    stadiumName: 'Stade Ibn Batouta',
    stadiumCapacity: 65000,
    managerName: 'Walid Regragui',
    country: 'Morocco',
    league: 'National (CAF)',
    budget: 120,
    chemistry: 95,
    morale: 94,
    players: [
      { id: 'p-mar-1', name: 'Achraf Hakimi', position: 'DEF', rating: 88, age: 26, country: 'Morocco', marketValue: 60, potential: 90 },
      { id: 'p-mar-2', name: 'Brahim Díaz', position: 'MID', rating: 84, age: 25, country: 'Morocco', marketValue: 40, potential: 88 },
      { id: 'p-mar-3', name: 'Youssef En-Nesyri', position: 'FWD', rating: 83, age: 28, country: 'Morocco', marketValue: 25, potential: 84 },
      { id: 'p-mar-4', name: 'Yassine Bounou', position: 'GK', rating: 85, age: 34, country: 'Morocco', marketValue: 12, potential: 85 },
    ],
  },
  {
    id: 'jpn',
    name: 'Japan',
    shortName: 'JPN',
    badge: '🇯🇵',
    badgeColor: '#1E3A8A',
    kitColor: '#1D4ED8',
    secondaryKitColor: '#FFFFFF',
    rating: 86,
    attackRating: 86,
    midfieldRating: 87,
    defenseRating: 85,
    stadiumName: 'Saitama Stadium',
    stadiumCapacity: 63700,
    managerName: 'Hajime Moriyasu',
    country: 'Japan',
    league: 'National (AFC)',
    budget: 110,
    chemistry: 94,
    morale: 93,
    players: [
      { id: 'p-jpn-1', name: 'Takefusa Kubo', position: 'FWD', rating: 84, age: 24, country: 'Japan', marketValue: 50, potential: 89 },
      { id: 'p-jpn-2', name: 'Kaoru Mitoma', position: 'FWD', rating: 83, age: 28, country: 'Japan', marketValue: 45, potential: 85 },
      { id: 'p-jpn-3', name: 'Wataru Endo', position: 'MID', rating: 82, age: 32, country: 'Japan', marketValue: 15, potential: 82 },
      { id: 'p-jpn-4', name: 'Zion Suzuki', position: 'GK', rating: 79, age: 22, country: 'Japan', marketValue: 10, potential: 85 },
    ],
  },
  {
    id: 'egy',
    name: 'Egypt',
    shortName: 'EGY',
    badge: '🇪🇬',
    badgeColor: '#DC2626',
    kitColor: '#B91C1C',
    secondaryKitColor: '#000000',
    rating: 86,
    attackRating: 89,
    midfieldRating: 84,
    defenseRating: 83,
    stadiumName: 'Cairo International Stadium',
    stadiumCapacity: 75000,
    managerName: 'Hossam Hassan',
    country: 'Egypt',
    league: 'National (CAF)',
    budget: 100,
    chemistry: 93,
    morale: 91,
    players: [
      { id: 'p-egy-1', name: 'Mohamed Salah', position: 'FWD', rating: 90, age: 33, country: 'Egypt', marketValue: 55, potential: 90 },
      { id: 'p-egy-2', name: 'Omar Marmoush', position: 'FWD', rating: 85, age: 26, country: 'Egypt', marketValue: 50, potential: 89 },
      { id: 'p-egy-3', name: 'Mostafa Mohamed', position: 'FWD', rating: 80, age: 27, country: 'Egypt', marketValue: 20, potential: 82 },
      { id: 'p-egy-4', name: 'Mohamed El Shenawy', position: 'GK', rating: 81, age: 36, country: 'Egypt', marketValue: 5, potential: 81 },
    ],
  },
  {
    id: 'sen',
    name: 'Senegal',
    shortName: 'SEN',
    badge: '🇸🇳',
    badgeColor: '#16A34A',
    kitColor: '#15803D',
    secondaryKitColor: '#FACC15',
    rating: 86,
    attackRating: 86,
    midfieldRating: 86,
    defenseRating: 87,
    stadiumName: 'Stade Abdoulaye Wade',
    stadiumCapacity: 50000,
    managerName: 'Pape Thiaw',
    country: 'Senegal',
    league: 'National (CAF)',
    budget: 105,
    chemistry: 92,
    morale: 90,
    players: [
      { id: 'p-sen-1', name: 'Sadio Mané', position: 'FWD', rating: 86, age: 33, country: 'Senegal', marketValue: 20, potential: 86 },
      { id: 'p-sen-2', name: 'Nicolas Jackson', position: 'FWD', rating: 83, age: 24, country: 'Senegal', marketValue: 45, potential: 88 },
      { id: 'p-sen-3', name: 'Kalidou Koulibaly', position: 'DEF', rating: 84, age: 34, country: 'Senegal', marketValue: 12, potential: 84 },
      { id: 'p-sen-4', name: 'Édouard Mendy', position: 'GK', rating: 83, age: 33, country: 'Senegal', marketValue: 10, potential: 83 },
    ],
  },
  {
    id: 'usa',
    name: 'USA National XI',
    shortName: 'USA',
    badge: '🇺🇸',
    badgeColor: '#2563EB',
    kitColor: '#FFFFFF',
    secondaryKitColor: '#1E3A8A',
    rating: 85,
    attackRating: 86,
    midfieldRating: 85,
    defenseRating: 84,
    stadiumName: 'MetLife Stadium',
    stadiumCapacity: 82500,
    managerName: 'Mauricio Pochettino',
    country: 'USA',
    league: 'National (CONCACAF)',
    budget: 130,
    chemistry: 91,
    morale: 90,
    players: [
      { id: 'p-usa-1', name: 'Christian Pulisic', position: 'FWD', rating: 85, age: 26, country: 'USA', marketValue: 45, potential: 87 },
      { id: 'p-usa-2', name: 'Weston McKennie', position: 'MID', rating: 82, age: 26, country: 'USA', marketValue: 30, potential: 84 },
      { id: 'p-usa-3', name: 'Folarin Balogun', position: 'FWD', rating: 81, age: 24, country: 'USA', marketValue: 30, potential: 85 },
      { id: 'p-usa-4', name: 'Matt Turner', position: 'GK', rating: 80, age: 31, country: 'USA', marketValue: 10, potential: 80 },
    ],
  },
  {
    id: 'mex',
    name: 'Mexico',
    shortName: 'MEX',
    badge: '🇲🇽',
    badgeColor: '#16A34A',
    kitColor: '#15803D',
    secondaryKitColor: '#FFFFFF',
    rating: 84,
    attackRating: 84,
    midfieldRating: 84,
    defenseRating: 83,
    stadiumName: 'Estadio Azteca',
    stadiumCapacity: 87523,
    managerName: 'Javier Aguirre',
    country: 'Mexico',
    league: 'National (CONCACAF)',
    budget: 115,
    chemistry: 90,
    morale: 89,
    players: [
      { id: 'p-mex-1', name: 'Santiago Giménez', position: 'FWD', rating: 83, age: 24, country: 'Mexico', marketValue: 40, potential: 87 },
      { id: 'p-mex-2', name: 'Edson Álvarez', position: 'MID', rating: 82, age: 27, country: 'Mexico', marketValue: 35, potential: 84 },
      { id: 'p-mex-3', name: 'Guillermo Ochoa', position: 'GK', rating: 79, age: 40, country: 'Mexico', marketValue: 3, potential: 79 },
    ],
  },

  // Top World Clubs
  {
    id: 'rma',
    name: 'Real Madrid',
    shortName: 'RMA',
    badge: '👑',
    badgeColor: '#EAB308',
    kitColor: '#FFFFFF',
    secondaryKitColor: '#1E1B4B',
    rating: 95,
    attackRating: 96,
    midfieldRating: 95,
    defenseRating: 93,
    stadiumName: 'Santiago Bernabéu',
    stadiumCapacity: 85000,
    managerName: 'Carlo Ancelotti',
    country: 'Spain',
    league: 'La Liga',
    budget: 380,
    chemistry: 96,
    morale: 95,
    players: [
      { id: 'p-rma-1', name: 'Kylian Mbappé', position: 'FWD', rating: 93, age: 26, country: 'France', marketValue: 180, potential: 96 },
      { id: 'p-rma-2', name: 'Vinícius Júnior', position: 'FWD', rating: 92, age: 24, country: 'Brazil', marketValue: 170, potential: 95 },
      { id: 'p-rma-3', name: 'Jude Bellingham', position: 'MID', rating: 90, age: 22, country: 'England', marketValue: 160, potential: 95 },
      { id: 'p-rma-4', name: 'Thibaut Courtois', position: 'GK', rating: 89, age: 33, country: 'Belgium', marketValue: 45, potential: 89 },
    ],
  },
  {
    id: 'mci',
    name: 'Manchester City',
    shortName: 'MCI',
    badge: '⚡',
    badgeColor: '#38BDF8',
    kitColor: '#60A5FA',
    secondaryKitColor: '#0F172A',
    rating: 94,
    attackRating: 95,
    midfieldRating: 95,
    defenseRating: 92,
    stadiumName: 'Etihad Stadium',
    stadiumCapacity: 53400,
    managerName: 'Pep Guardiola',
    country: 'England',
    league: 'Premier League',
    budget: 400,
    chemistry: 95,
    morale: 92,
    players: [
      { id: 'p-mci-1', name: 'Erling Haaland', position: 'FWD', rating: 92, age: 25, country: 'Norway', marketValue: 180, potential: 95 },
      { id: 'p-mci-2', name: 'Kevin De Bruyne', position: 'MID', rating: 90, age: 34, country: 'Belgium', marketValue: 50, potential: 90 },
      { id: 'p-mci-3', name: 'Rodri', position: 'MID', rating: 91, age: 29, country: 'Spain', marketValue: 130, potential: 92 },
      { id: 'p-mci-4', name: 'Ederson', position: 'GK', rating: 87, age: 31, country: 'Brazil', marketValue: 35, potential: 87 },
    ],
  },
  {
    id: 'bar',
    name: 'FC Barcelona',
    shortName: 'BAR',
    badge: '🔴',
    badgeColor: '#EF4444',
    kitColor: '#991B1B',
    secondaryKitColor: '#1E3A8A',
    rating: 92,
    attackRating: 93,
    midfieldRating: 92,
    defenseRating: 89,
    stadiumName: 'Camp Nou',
    stadiumCapacity: 99354,
    managerName: 'Hansi Flick',
    country: 'Spain',
    league: 'La Liga',
    budget: 220,
    chemistry: 91,
    morale: 92,
    players: [
      { id: 'p-bar-1', name: 'Lamine Yamal', position: 'FWD', rating: 90, age: 18, country: 'Spain', marketValue: 150, potential: 98 },
      { id: 'p-bar-2', name: 'Robert Lewandowski', position: 'FWD', rating: 88, age: 36, country: 'Poland', marketValue: 25, potential: 88 },
      { id: 'p-bar-3', name: 'Pedri', position: 'MID', rating: 88, age: 22, country: 'Spain', marketValue: 100, potential: 93 },
      { id: 'p-bar-4', name: 'Marc-André ter Stegen', position: 'GK', rating: 87, age: 33, country: 'Germany', marketValue: 30, potential: 87 },
    ],
  },
  {
    id: 'bay',
    name: 'Bayern Munich',
    shortName: 'BAY',
    badge: '🛡️',
    badgeColor: '#DC2626',
    kitColor: '#B91C1C',
    secondaryKitColor: '#FFFFFF',
    rating: 92,
    attackRating: 93,
    midfieldRating: 92,
    defenseRating: 90,
    stadiumName: 'Allianz Arena',
    stadiumCapacity: 75000,
    managerName: 'Vincent Kompany',
    country: 'Germany',
    league: 'Bundesliga',
    budget: 290,
    chemistry: 92,
    morale: 91,
    players: [
      { id: 'p-bay-1', name: 'Harry Kane', position: 'FWD', rating: 91, age: 31, country: 'England', marketValue: 100, potential: 91 },
      { id: 'p-bay-2', name: 'Jamal Musiala', position: 'MID', rating: 89, age: 22, country: 'Germany', marketValue: 130, potential: 95 },
      { id: 'p-bay-3', name: 'Manuel Neuer', position: 'GK', rating: 86, age: 39, country: 'Germany', marketValue: 15, potential: 86 },
    ],
  },
  {
    id: 'psg',
    name: 'Paris Saint-Germain',
    shortName: 'PSG',
    badge: '🗼',
    badgeColor: '#2563EB',
    kitColor: '#1E3A8A',
    secondaryKitColor: '#DC2626',
    rating: 90,
    attackRating: 90,
    midfieldRating: 90,
    defenseRating: 89,
    stadiumName: 'Parc des Princes',
    stadiumCapacity: 47929,
    managerName: 'Luis Enrique',
    country: 'France',
    league: 'Ligue 1',
    budget: 340,
    chemistry: 88,
    morale: 89,
    players: [
      { id: 'p-psg-1', name: 'Ousmane Dembélé', position: 'FWD', rating: 87, age: 28, country: 'France', marketValue: 70, potential: 88 },
      { id: 'p-psg-2', name: 'Vitinha', position: 'MID', rating: 86, age: 25, country: 'Portugal', marketValue: 60, potential: 90 },
      { id: 'p-psg-3', name: 'Gianluigi Donnarumma', position: 'GK', rating: 88, age: 26, country: 'Italy', marketValue: 50, potential: 91 },
    ],
  },
  {
    id: 'liv',
    name: 'Liverpool FC',
    shortName: 'LIV',
    badge: '🔴',
    badgeColor: '#EF4444',
    kitColor: '#DC2626',
    secondaryKitColor: '#16A34A',
    rating: 93,
    attackRating: 94,
    midfieldRating: 92,
    defenseRating: 92,
    stadiumName: 'Anfield',
    stadiumCapacity: 61276,
    managerName: 'Arne Slot',
    country: 'England',
    league: 'Premier League',
    budget: 260,
    chemistry: 94,
    morale: 95,
    players: [
      { id: 'p-liv-1', name: 'Mohamed Salah', position: 'FWD', rating: 90, age: 33, country: 'Egypt', marketValue: 55, potential: 90 },
      { id: 'p-liv-2', name: 'Virgil van Dijk', position: 'DEF', rating: 89, age: 34, country: 'Netherlands', marketValue: 30, potential: 89 },
      { id: 'p-liv-3', name: 'Alexis Mac Allister', position: 'MID', rating: 87, age: 26, country: 'Argentina', marketValue: 75, potential: 90 },
      { id: 'p-liv-4', name: 'Alisson Becker', position: 'GK', rating: 89, age: 32, country: 'Brazil', marketValue: 35, potential: 89 },
    ],
  },
  {
    id: 'ars',
    name: 'Arsenal FC',
    shortName: 'ARS',
    badge: '🔴',
    badgeColor: '#DC2626',
    kitColor: '#B91C1C',
    secondaryKitColor: '#FFFFFF',
    rating: 92,
    attackRating: 91,
    midfieldRating: 93,
    defenseRating: 93,
    stadiumName: 'Emirates Stadium',
    stadiumCapacity: 60704,
    managerName: 'Mikel Arteta',
    country: 'England',
    league: 'Premier League',
    budget: 250,
    chemistry: 95,
    morale: 94,
    players: [
      { id: 'p-ars-1', name: 'Bukayo Saka', position: 'FWD', rating: 89, age: 23, country: 'England', marketValue: 140, potential: 93 },
      { id: 'p-ars-2', name: 'Martin Ødegaard', position: 'MID', rating: 89, age: 26, country: 'Norway', marketValue: 110, potential: 91 },
      { id: 'p-ars-3', name: 'William Saliba', position: 'DEF', rating: 88, age: 24, country: 'France', marketValue: 90, potential: 93 },
      { id: 'p-ars-4', name: 'David Raya', position: 'GK', rating: 86, age: 29, country: 'Spain', marketValue: 35, potential: 87 },
    ],
  },
];

export const ChampionsStudioView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tournaments' | 'create_tournament' | 'teams' | 'standings' | 'simulator' | 'career'>('tournaments');
  
  // Custom Teams State
  const [customTeams, setCustomTeams] = useState<Team[]>(() => {
    try {
      const saved = localStorage.getItem('champions_studio_teams');
      return saved ? JSON.parse(saved) : WORLD_DATABASE_TEAMS;
    } catch {
      return WORLD_DATABASE_TEAMS;
    }
  });

  // Tournaments State
  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    try {
      const saved = localStorage.getItem('champions_studio_tournaments');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(() => {
    return tournaments.length > 0 ? tournaments[0].id : null;
  });

  const activeTournament = tournaments.find(t => t.id === activeTournamentId) || tournaments[0] || null;

  // Tournament Rules & Creator Engine State
  const [newTourneyName, setNewTourneyName] = useState('World Cup Champions 2026');
  const [newTourneyFormat, setNewTourneyFormat] = useState<'groups_only' | 'knockout_only' | 'league_only' | 'hybrid_all' | 'hybrid_groups_knockout'>('hybrid_groups_knockout');
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(WORLD_DATABASE_TEAMS.map(t => t.id));
  
  // Advanced Winner-Style Rules Settings
  const [rulePointsForWin, setRulePointsForWin] = useState<number>(3);
  const [rulePointsForDraw, setRulePointsForDraw] = useState<number>(1);
  const [rulePointsForLoss, setRulePointsForLoss] = useState<number>(0);
  const [ruleNumGroups, setRuleNumGroups] = useState<number>(4);
  const [ruleQualifyPerGroup, setRuleQualifyPerGroup] = useState<number>(2);

  // Standings View Mode (Table vs Groups)
  const [standingsViewMode, setStandingsViewMode] = useState<'groups' | 'all'>('groups');

  // Manual Score Edit State for Fixture Modal
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editHomeScoreInput, setEditHomeScoreInput] = useState<number>(0);
  const [editAwayScoreInput, setEditAwayScoreInput] = useState<number>(0);

  // Custom Team Form State
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamShort, setNewTeamShort] = useState('');
  const [newTeamBadge, setNewTeamBadge] = useState('🛡️');
  const [newTeamColor, setNewTeamColor] = useState('#3B82F6');
  const [newTeamStadium, setNewTeamStadium] = useState('Champions Arena');

  // Match Simulation Modal/Live view state
  const [simulatingMatch, setSimulatingMatch] = useState<Match | null>(null);
  const [weatherCondition, setWeatherCondition] = useState<'sun' | 'rain' | 'snow'>('sun');

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('champions_studio_teams', JSON.stringify(customTeams));
    } catch (e) {
      console.error(e);
    }
  }, [customTeams]);

  useEffect(() => {
    try {
      localStorage.setItem('champions_studio_tournaments', JSON.stringify(tournaments));
    } catch (e) {
      console.error(e);
    }
  }, [tournaments]);

  // Handle Team Creation
  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const short = (newTeamShort || newTeamName.slice(0, 3)).toUpperCase();
    const created: Team = {
      id: 'team-' + Date.now(),
      name: newTeamName.trim(),
      shortName: short,
      badge: newTeamBadge,
      badgeColor: newTeamColor,
      kitColor: newTeamColor,
      secondaryKitColor: '#FFFFFF',
      rating: Math.floor(Math.random() * 15) + 80,
      attackRating: Math.floor(Math.random() * 15) + 82,
      midfieldRating: Math.floor(Math.random() * 15) + 80,
      defenseRating: Math.floor(Math.random() * 15) + 78,
      stadiumName: newTeamStadium || `${newTeamName} Arena`,
      stadiumCapacity: 50000 + Math.floor(Math.random() * 40000),
      managerName: 'Head Manager',
      country: 'Global',
      league: 'Custom League',
      budget: 150,
      chemistry: 90,
      morale: 90,
      players: [
        { id: `p-${Date.now()}-1`, name: `${newTeamName} Ace`, position: 'FWD', rating: 88, age: 24, country: 'Global', marketValue: 80, potential: 92 },
        { id: `p-${Date.now()}-2`, name: `${newTeamName} Playmaker`, position: 'MID', rating: 86, age: 25, country: 'Global', marketValue: 60, potential: 89 },
        { id: `p-${Date.now()}-3`, name: `${newTeamName} Defender`, position: 'DEF', rating: 84, age: 26, country: 'Global', marketValue: 40, potential: 87 },
        { id: `p-${Date.now()}-4`, name: `${newTeamName} Goalie`, position: 'GK', rating: 85, age: 28, country: 'Global', marketValue: 35, potential: 86 },
      ],
    };

    setCustomTeams(prev => [created, ...prev]);
    setSelectedTeamIds(prev => [...prev, created.id]);
    setNewTeamName('');
    setNewTeamShort('');
    alert(`✅ Team "${created.name}" created successfully!`);
  };

  // Helper: Create Fixtures, Groups & Standings for a Tournament
  const buildTournamentMatches = (teams: Team[], format: Tournament['format'], numGroups: number): { matches: Match[]; assignedTeams: Team[] } => {
    const matches: Match[] = [];
    const assignedTeams: Team[] = [];

    if (teams.length < 2) return { matches, assignedTeams };

    // Group letters A, B, C, D, E, F, G, H
    const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    // Assign groups to teams evenly
    teams.forEach((team, index) => {
      const gLetter = groupLetters[index % numGroups] || `Group ${Math.floor(index / 4) + 1}`;
      assignedTeams.push({
        ...team,
        groupLetter: gLetter,
      });
    });

    let matchIdCount = 1;

    if (format === 'groups_only' || format === 'hybrid_groups_knockout' || format === 'hybrid_all') {
      // Create intra-group matches for each group
      for (let g = 0; g < numGroups; g++) {
        const letter = groupLetters[g];
        const groupTeams = assignedTeams.filter(t => t.groupLetter === letter);

        for (let i = 0; i < groupTeams.length; i++) {
          for (let j = i + 1; j < groupTeams.length; j++) {
            matches.push({
              id: `m-${Date.now()}-${matchIdCount++}`,
              homeTeam: groupTeams[i],
              awayTeam: groupTeams[j],
              homeScore: null,
              awayScore: null,
              played: false,
              roundName: `Group ${letter} - Matchday ${matchIdCount}`,
              groupLetter: letter,
              stage: 'group',
              events: [],
            });
          }
        }
      }
    } else {
      // Round Robin League
      for (let i = 0; i < assignedTeams.length; i++) {
        for (let j = i + 1; j < assignedTeams.length; j++) {
          matches.push({
            id: `m-${Date.now()}-${matchIdCount++}`,
            homeTeam: assignedTeams[i],
            awayTeam: assignedTeams[j],
            homeScore: null,
            awayScore: null,
            played: false,
            roundName: `League Matchday ${matchIdCount}`,
            stage: 'league',
            events: [],
          });
        }
      }
    }

    return { matches, assignedTeams };
  };

  const buildInitialStandings = (teams: Team[]): Record<string, TeamStanding> => {
    const standings: Record<string, TeamStanding> = {};
    teams.forEach(team => {
      standings[team.id] = {
        team,
        mp: 0,
        w: 0,
        d: 0,
        l: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        pts: 0,
        yc: 0,
        rc: 0,
        form: [],
      };
    });
    return standings;
  };

  // Handle Preset Global Tournament Select
  const handleSelectGlobalTournament = (presetId: string) => {
    let count = 16;
    let name = '🏆 FIFA World Cup (Men)';

    if (presetId.includes('women')) {
      name = '🏆 FIFA World Cup (Women)';
    } else if (presetId.includes('champions')) {
      name = '⭐ UEFA Champions League';
    } else if (presetId.includes('premier')) {
      name = '🦁 Premier League Champions';
      count = 10;
    }

    const tourneyTeams = customTeams.slice(0, count);
    const { matches, assignedTeams } = buildTournamentMatches(tourneyTeams, 'hybrid_groups_knockout', 4);
    const standings = buildInitialStandings(assignedTeams);

    const created: Tournament = {
      id: 'tourney-' + Date.now(),
      name,
      type: presetId.includes('women') ? 'global_women' : 'global_men',
      format: 'hybrid_groups_knockout',
      teams: assignedTeams,
      matches,
      standings,
      currentRound: 1,
      status: 'ongoing',
      rules: {
        pointsForWin: rulePointsForWin,
        pointsForDraw: rulePointsForDraw,
        pointsForLoss: rulePointsForLoss,
        numberOfGroups: 4,
        teamsQualifyingPerGroup: 2,
      },
      createdAt: new Date().toLocaleDateString(),
    };

    setTournaments(prev => [created, ...prev]);
    setActiveTournamentId(created.id);
    setActiveTab('standings');
  };

  // Handle Custom Tournament Creation with Custom Winner Rules
  const handleCreateCustomTournament = () => {
    if (selectedTeamIds.length < 2) {
      alert('⚠️ Please select at least 2 teams for your tournament!');
      return;
    }

    const selectedTeams = customTeams.filter(t => selectedTeamIds.includes(t.id));
    const { matches, assignedTeams } = buildTournamentMatches(selectedTeams, newTourneyFormat, ruleNumGroups);
    const standings = buildInitialStandings(assignedTeams);

    const created: Tournament = {
      id: 'tourney-' + Date.now(),
      name: newTourneyName || 'Winner Champions Tournament',
      type: 'custom',
      format: newTourneyFormat,
      teams: assignedTeams,
      matches,
      standings,
      currentRound: 1,
      status: 'ongoing',
      rules: {
        pointsForWin: rulePointsForWin,
        pointsForDraw: rulePointsForDraw,
        pointsForLoss: rulePointsForLoss,
        numberOfGroups: ruleNumGroups,
        teamsQualifyingPerGroup: ruleQualifyPerGroup,
      },
      createdAt: new Date().toLocaleDateString(),
    };

    setTournaments(prev => [created, ...prev]);
    setActiveTournamentId(created.id);
    setActiveTab('standings');
  };

  // Simulate a Single Match (or Re-Randomize result!)
  const simulateSingleMatch = (match: Match): Match => {
    const homeRating = match.homeTeam.rating + 3; // Home advantage
    const awayRating = match.awayTeam.rating;

    let homeGoals = 0;
    let awayGoals = 0;
    const events: MatchEvent[] = [];

    // Simulate 90 minutes in ticks
    for (let minute = 5; minute <= 90; minute += Math.floor(Math.random() * 12) + 5) {
      const isHomeEvent = Math.random() * (homeRating + awayRating) < homeRating;
      const actingTeam = isHomeEvent ? match.homeTeam : match.awayTeam;
      const eventRoll = Math.random();

      if (eventRoll < 0.32) {
        // Goal scored
        if (isHomeEvent) homeGoals++;
        else awayGoals++;

        const scorer = actingTeam.players[Math.floor(Math.random() * actingTeam.players.length)]?.name || `${actingTeam.name} Forward`;
        const assist = actingTeam.players.find(p => p.name !== scorer)?.name;

        events.push({
          minute,
          type: 'goal',
          teamId: actingTeam.id,
          teamName: actingTeam.name,
          playerName: scorer,
          secondaryPlayerName: assist,
          text: `⚽ GOAL! ${scorer} scores for ${actingTeam.name}!${assist ? ` (Assist: ${assist})` : ''}`,
        });
      } else if (eventRoll < 0.48) {
        // Yellow Card
        const player = actingTeam.players[Math.floor(Math.random() * actingTeam.players.length)]?.name || `${actingTeam.name} Player`;
        events.push({
          minute,
          type: 'yellow',
          teamId: actingTeam.id,
          teamName: actingTeam.name,
          playerName: player,
          text: `🟨 Yellow Card issued to ${player}.`,
        });
      }
    }

    const homeXG = Number((homeGoals * 0.75 + Math.random() * 1.2).toFixed(2));
    const awayXG = Number((awayGoals * 0.75 + Math.random() * 1.1).toFixed(2));
    const homePoss = Math.floor(45 + Math.random() * 18);

    return {
      ...match,
      homeScore: homeGoals,
      awayScore: awayGoals,
      played: true,
      events,
      stats: {
        possession: [homePoss, 100 - homePoss],
        shots: [homeGoals + Math.floor(Math.random() * 8 + 3), awayGoals + Math.floor(Math.random() * 7 + 2)],
        shotsOnTarget: [homeGoals + Math.floor(Math.random() * 4), awayGoals + Math.floor(Math.random() * 3)],
        xG: [homeXG, awayXG],
        corners: [Math.floor(Math.random() * 7 + 2), Math.floor(Math.random() * 6 + 1)],
        fouls: [Math.floor(Math.random() * 10 + 4), Math.floor(Math.random() * 10 + 4)],
        yellowCards: [events.filter(e => e.teamId === match.homeTeam.id && e.type === 'yellow').length, events.filter(e => e.teamId === match.awayTeam.id && e.type === 'yellow').length],
        redCards: [events.filter(e => e.teamId === match.homeTeam.id && e.type === 'red').length, events.filter(e => e.teamId === match.awayTeam.id && e.type === 'red').length],
      },
    };
  };

  // Recalculate Standings from scratch based on all played matches & custom points rules
  const recalculateAllStandings = (tourney: Tournament, matches: Match[]): Tournament => {
    const updatedStandings = buildInitialStandings(tourney.teams);
    const ptsWin = tourney.rules?.pointsForWin ?? 3;
    const ptsDraw = tourney.rules?.pointsForDraw ?? 1;
    const ptsLoss = tourney.rules?.pointsForLoss ?? 0;

    matches.forEach(m => {
      if (!m.played || m.homeScore === null || m.awayScore === null) return;

      const homeId = m.homeTeam.id;
      const awayId = m.awayTeam.id;

      if (!updatedStandings[homeId]) updatedStandings[homeId] = buildInitialStandings([m.homeTeam])[homeId];
      if (!updatedStandings[awayId]) updatedStandings[awayId] = buildInitialStandings([m.awayTeam])[awayId];

      const hStd = updatedStandings[homeId];
      const aStd = updatedStandings[awayId];

      hStd.mp += 1;
      aStd.mp += 1;

      hStd.gf += m.homeScore;
      hStd.ga += m.awayScore;
      hStd.gd = hStd.gf - hStd.ga;

      aStd.gf += m.awayScore;
      aStd.ga += m.homeScore;
      aStd.gd = aStd.gf - aStd.ga;

      const hYC = m.events.filter(e => e.teamId === homeId && e.type === 'yellow').length;
      const aYC = m.events.filter(e => e.teamId === awayId && e.type === 'yellow').length;
      hStd.yc += hYC;
      aStd.yc += aYC;

      if (m.homeScore > m.awayScore) {
        hStd.w += 1;
        hStd.pts += ptsWin;
        hStd.form.unshift('W');
        aStd.l += 1;
        aStd.pts += ptsLoss;
        aStd.form.unshift('L');
      } else if (m.homeScore < m.awayScore) {
        aStd.w += 1;
        aStd.pts += ptsWin;
        aStd.form.unshift('W');
        hStd.l += 1;
        hStd.pts += ptsLoss;
        hStd.form.unshift('L');
      } else {
        hStd.d += 1;
        hStd.pts += ptsDraw;
        hStd.form.unshift('D');
        aStd.d += 1;
        aStd.pts += ptsDraw;
        aStd.form.unshift('D');
      }

      hStd.form = hStd.form.slice(0, 5);
      aStd.form = aStd.form.slice(0, 5);
    });

    const allPlayed = matches.every(m => m.played);
    let winner: Team | undefined = tourney.winner;

    if (allPlayed) {
      const sorted = Object.values(updatedStandings).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
      winner = sorted[0]?.team;
    }

    return {
      ...tourney,
      matches,
      standings: updatedStandings,
      status: allPlayed ? 'completed' : 'ongoing',
      winner,
    };
  };

  // Re-Randomize / Re-Simulate a Match
  const handleReRandomizeMatch = (match: Match) => {
    if (!activeTournament) return;
    const randomized = simulateSingleMatch(match);
    const updatedMatches = activeTournament.matches.map(m => m.id === randomized.id ? randomized : m);
    const updatedTourney = recalculateAllStandings(activeTournament, updatedMatches);

    setTournaments(prev => prev.map(t => t.id === updatedTourney.id ? updatedTourney : t));
    if (simulatingMatch?.id === match.id) setSimulatingMatch(randomized);
  };

  // Manual Score Edit Handler
  const handleSaveManualScore = () => {
    if (!activeTournament || !editingMatch) return;

    const updatedMatch: Match = {
      ...editingMatch,
      homeScore: editHomeScoreInput,
      awayScore: editAwayScoreInput,
      played: true,
    };

    const updatedMatches = activeTournament.matches.map(m => m.id === updatedMatch.id ? updatedMatch : m);
    const updatedTourney = recalculateAllStandings(activeTournament, updatedMatches);

    setTournaments(prev => prev.map(t => t.id === updatedTourney.id ? updatedTourney : t));
    setEditingMatch(null);
  };

  // Sim Next Unplayed Match
  const handleSimNextMatch = () => {
    if (!activeTournament) return;
    const nextMatch = activeTournament.matches.find(m => !m.played);
    if (!nextMatch) {
      alert('🎉 All matches in this tournament have already been played!');
      return;
    }

    const simulated = simulateSingleMatch(nextMatch);
    const updatedMatches = activeTournament.matches.map(m => m.id === simulated.id ? simulated : m);
    const updatedTourney = recalculateAllStandings(activeTournament, updatedMatches);

    setTournaments(prev => prev.map(t => t.id === updatedTourney.id ? updatedTourney : t));
    setSimulatingMatch(simulated);
  };

  // Sim Entire Tournament
  const handleSimEntireTournament = () => {
    if (!activeTournament) return;
    const simulatedList = activeTournament.matches.map(m => simulateSingleMatch(m));
    const updatedTourney = recalculateAllStandings(activeTournament, simulatedList);

    setTournaments(prev => prev.map(t => t.id === updatedTourney.id ? updatedTourney : t));
    alert(`🏆 Tournament Simulation Complete! Winner: ${updatedTourney.winner?.name || 'TBD'} ${updatedTourney.winner?.badge || ''}`);
  };

  // Delete Tournament Save
  const handleDeleteTournament = (id: string) => {
    setTournaments(prev => prev.filter(t => t.id !== id));
    if (activeTournamentId === id) {
      setActiveTournamentId(tournaments.find(t => t.id !== id)?.id || null);
    }
  };

  // Group Standings Mapping (Group A, B, C, D...)
  const getGroupStandings = () => {
    if (!activeTournament) return {};
    const groups: Record<string, TeamStanding[]> = {};

    Object.values(activeTournament.standings).forEach(std => {
      const gLetter = std.team.groupLetter || 'A';
      if (!groups[gLetter]) groups[gLetter] = [];
      groups[gLetter].push(std);
    });

    // Sort teams inside each group by points -> GD -> GF -> Fairplay (YC)
    Object.keys(groups).forEach(g => {
      groups[g].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.yc - b.yc);
    });

    return groups;
  };

  const groupStandingsMap = getGroupStandings();
  const currentStandingsList = activeTournament ? Object.values(activeTournament.standings).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.yc - b.yc) : [];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 md:p-8 space-y-6">
      {/* Studio Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 md:p-8 border border-emerald-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
                <Trophy className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white italic">CHAMPIONS STUDIO</h1>
                  <span className="text-[10px] bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    WINNER PRO ENGINE
                  </span>
                </div>
                <p className="text-xs md:text-sm text-emerald-200/80">
                  Global Football Tournament Maker • Re-Randomize Results • Custom Group &amp; Points Rules
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Simulator Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('create_tournament')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Tournament</span>
            </button>
            <button
              onClick={handleSimNextMatch}
              disabled={!activeTournament}
              className="px-4 py-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 text-indigo-400" />
              <span>Sim Next Match</span>
            </button>
            <button
              onClick={handleSimEntireTournament}
              disabled={!activeTournament}
              className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Sim All Matches</span>
            </button>
          </div>
        </div>

        {/* Studio Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-t border-white/10 pt-4">
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'tournaments' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Select Global Tournament</span>
          </button>
          <button
            onClick={() => setActiveTab('create_tournament')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'create_tournament' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Tournament</span>
          </button>
          <button
            onClick={() => setActiveTab('standings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'standings' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Groups, Standings &amp; Fixtures</span>
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'teams' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>World Countries &amp; Clubs</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'simulator' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Live Match Simulator &amp; Re-Roll</span>
          </button>
          <button
            onClick={() => setActiveTab('career')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'career' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Career Mode &amp; Club Manager</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Global Tournaments Preset Hub */}
      {activeTab === 'tournaments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              <span>Select Global Tournament (Men &amp; Women)</span>
            </h2>
            <span className="text-xs text-slate-400">Instant setup for World Cups &amp; Leagues</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'world-cup-men-2026', name: '🏆 FIFA World Cup (Men)', gender: 'Men', teamsCount: 16, formatDesc: 'Group Stage (4 Groups of 4) ➔ Knockout Stage ➔ Final', icon: '🌍' },
              { id: 'world-cup-women-2027', name: '🏆 FIFA World Cup (Women)', gender: 'Women', teamsCount: 16, formatDesc: 'Group Stage ➔ Quarter Finals ➔ Semi Finals ➔ World Final', icon: '👑' },
              { id: 'champions-league-2026', name: '⭐ UEFA Champions League', gender: 'Men', teamsCount: 16, formatDesc: 'Elite European Clubs Group Stage & Knockout Finals', icon: '⭐' },
              { id: 'premier-league-sim', name: '🦁 Premier League Champions', gender: 'Men', teamsCount: 10, formatDesc: 'Full Round Robin League Format (Points, Goals, GD)', icon: '🦁' },
            ].map((preset) => (
              <div
                key={preset.id}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{preset.icon}</span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                      {preset.gender} • {preset.teamsCount} Teams
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                    {preset.name}
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">{preset.formatDesc}</p>
                </div>

                <button
                  onClick={() => handleSelectGlobalTournament(preset.id)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Launch {preset.name}</span>
                </button>
              </div>
            ))}
          </div>

          {/* User's Active Tournaments Section */}
          <div className="pt-6 border-t border-white/10">
            <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
              <span>Your Active Tournaments &amp; Saves ({tournaments.length})</span>
              <button
                onClick={() => setActiveTab('create_tournament')}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Custom Tournament</span>
              </button>
            </h3>

            {tournaments.length === 0 ? (
              <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10 text-slate-400">
                <Trophy className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <p className="text-sm font-semibold">No active tournament saves found yet.</p>
                <p className="text-xs text-slate-500 mt-1">Select a global tournament above or create your custom tournament!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tournaments.map((t) => (
                  <div
                    key={t.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      activeTournamentId === t.id
                        ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <span>🏆 {t.name}</span>
                        {t.status === 'completed' && (
                          <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md font-black">WINNER: {t.winner?.name}</span>
                        )}
                      </h4>
                      <button
                        onClick={() => handleDeleteTournament(t.id)}
                        className="text-slate-500 hover:text-red-400 p-1"
                        title="Delete Save"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1 mb-4">
                      <div>Teams: {t.teams.length} | Matches Played: {t.matches.filter(m => m.played).length} / {t.matches.length}</div>
                      <div>Rules: Win={t.rules?.pointsForWin ?? 3} pts, Draw={t.rules?.pointsForDraw ?? 1} pts, Loss={t.rules?.pointsForLoss ?? 0} pts</div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTournamentId(t.id);
                        setActiveTab('standings');
                      }}
                      className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2"
                    >
                      <span>Open Standings &amp; Fixtures</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Winner App Style Tournament Creator & Settings */}
      {activeTab === 'create_tournament' && (
        <div className="max-w-4xl mx-auto space-y-6 bg-white/5 p-6 md:p-8 rounded-3xl border border-white/10">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Winner-Style Tournament Creator &amp; Custom Rules</h2>
              <p className="text-xs text-slate-400">Configure groups, points rules, qualifying teams, and choose participating nations!</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Title & Format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Tournament Name</label>
                <input
                  type="text"
                  value={newTourneyName}
                  onChange={(e) => setNewTourneyName(e.target.value)}
                  placeholder="e.g. FIFA World Cup 2026"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Tournament Format</label>
                <select
                  value={newTourneyFormat}
                  onChange={(e) => setNewTourneyFormat(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-emerald-500 outline-none"
                >
                  <option value="hybrid_groups_knockout">Group Stage ➔ Knockout Stage (World Cup Style)</option>
                  <option value="league_only">Full Round-Robin League (Points Table)</option>
                  <option value="groups_only">Groups Only (No Knockout)</option>
                  <option value="knockout_only">Pure Knockout Tournament (Direct Elimination)</option>
                </select>
              </div>
            </div>

            {/* Winner-Style Custom Points & Group Engine Settings */}
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                <span>Group &amp; Point Rules Settings (Winner System)</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Points for Win</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={rulePointsForWin}
                    onChange={(e) => setRulePointsForWin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-bold focus:border-emerald-500 text-center"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Points for Draw</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={rulePointsForDraw}
                    onChange={(e) => setRulePointsForDraw(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-bold focus:border-emerald-500 text-center"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Points for Loss</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={rulePointsForLoss}
                    onChange={(e) => setRulePointsForLoss(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-bold focus:border-emerald-500 text-center"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Number of Groups</label>
                  <select
                    value={ruleNumGroups}
                    onChange={(e) => setRuleNumGroups(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-bold focus:border-emerald-500"
                  >
                    <option value={2}>2 Groups</option>
                    <option value={4}>4 Groups (Standard)</option>
                    <option value={8}>8 Groups (World Cup)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Qualify Per Group</label>
                  <select
                    value={ruleQualifyPerGroup}
                    onChange={(e) => setRuleQualifyPerGroup(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-bold focus:border-emerald-500"
                  >
                    <option value={1}>Top 1 Team</option>
                    <option value={2}>Top 2 Teams (Standard)</option>
                    <option value={3}>Top 3 Teams</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Select Teams with Quick Action Buttons */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Select Participating Teams ({selectedTeamIds.length} / {customTeams.length})
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTeamIds(customTeams.map(t => t.id))}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold text-emerald-400"
                  >
                    Select All ({customTeams.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTeamIds(customTeams.slice(0, 16).map(t => t.id))}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold text-amber-400"
                  >
                    Select Top 16 World Nations
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTeamIds([])}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold text-red-400"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto p-3 bg-slate-900 rounded-xl border border-white/10">
                {customTeams.map((team) => {
                  const isSelected = selectedTeamIds.includes(team.id);
                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedTeamIds(prev => prev.filter(id => id !== team.id));
                        } else {
                          setSelectedTeamIds(prev => [...prev, team.id]);
                        }
                      }}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500/60 text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xl">{team.badge}</span>
                      <div className="truncate flex-1 min-w-0">
                        <div className="text-xs font-bold truncate text-white">{team.name}</div>
                        <div className="text-[9px] text-slate-400">OVR {team.rating} • {team.league}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleCreateCustomTournament}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all"
            >
              <Trophy className="w-5 h-5 fill-slate-950" />
              <span>Generate Tournament &amp; Fixtures</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Dynamic Groups & Standings View (Points, Goals, YC, RC + Manual Score Editing + Re-Randomize!) */}
      {activeTab === 'standings' && (
        <div className="space-y-6">
          {activeTournament ? (
            <>
              {/* Tournament Title & Control Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/5 p-5 rounded-2xl border border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏆</span>
                    <h2 className="text-xl font-black text-white">{activeTournament.name}</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Rules: Win={activeTournament.rules?.pointsForWin ?? 3} pts | Draw={activeTournament.rules?.pointsForDraw ?? 1} pts | Loss={activeTournament.rules?.pointsForLoss ?? 0} pts
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Standings View Mode Toggle */}
                  <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-white/10">
                    <button
                      onClick={() => setStandingsViewMode('groups')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        standingsViewMode === 'groups' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span>Groups View</span>
                    </button>
                    <button
                      onClick={() => setStandingsViewMode('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        standingsViewMode === 'all' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>All Table</span>
                    </button>
                  </div>

                  <button
                    onClick={handleSimNextMatch}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Sim Match</span>
                  </button>
                  <button
                    onClick={handleSimEntireTournament}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>Sim All</span>
                  </button>
                </div>
              </div>

              {/* View 1: Winner App Style Group Cards (Group A, Group B, Group C...) */}
              {standingsViewMode === 'groups' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Object.keys(groupStandingsMap).map((gLetter) => (
                    <div key={gLetter} className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                      <div className="px-5 py-3.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
                        <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-emerald-400" />
                          <span>GROUP {gLetter} STANDINGS</span>
                        </h3>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">
                          Top {activeTournament.rules?.teamsQualifyingPerGroup ?? 2} Qualify
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-white/5 text-slate-400 uppercase text-[9px] font-bold">
                            <tr>
                              <th className="py-2.5 px-4">Team</th>
                              <th className="py-2.5 px-2 text-center">MP</th>
                              <th className="py-2.5 px-2 text-center">W</th>
                              <th className="py-2.5 px-2 text-center">D</th>
                              <th className="py-2.5 px-2 text-center">L</th>
                              <th className="py-2.5 px-2 text-center">GF</th>
                              <th className="py-2.5 px-2 text-center">GA</th>
                              <th className="py-2.5 px-2 text-center">GD</th>
                              <th className="py-2.5 px-3 text-center text-emerald-400 font-black">PTS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {groupStandingsMap[gLetter].map((std, idx) => {
                              const isQualifying = idx < (activeTournament.rules?.teamsQualifyingPerGroup ?? 2);
                              return (
                                <tr key={std.team.id} className={isQualifying ? 'bg-emerald-500/10' : ''}>
                                  <td className="py-3 px-4 flex items-center gap-2.5 font-bold text-white">
                                    <span className="text-slate-500 text-[10px] w-4">{idx + 1}</span>
                                    <span className="text-base">{std.team.badge}</span>
                                    <span className="truncate max-w-[120px]">{std.team.name}</span>
                                    {isQualifying && <span className="text-[9px] bg-emerald-500/30 text-emerald-300 font-black px-1.5 py-0.5 rounded">Q</span>}
                                  </td>
                                  <td className="py-3 px-2 text-center text-slate-300">{std.mp}</td>
                                  <td className="py-3 px-2 text-center text-emerald-400 font-bold">{std.w}</td>
                                  <td className="py-3 px-2 text-center text-amber-400">{std.d}</td>
                                  <td className="py-3 px-2 text-center text-red-400">{std.l}</td>
                                  <td className="py-3 px-2 text-center text-slate-300">{std.gf}</td>
                                  <td className="py-3 px-2 text-center text-slate-300">{std.ga}</td>
                                  <td className={`py-3 px-2 text-center font-bold ${std.gd > 0 ? 'text-emerald-400' : std.gd < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                    {std.gd > 0 ? `+${std.gd}` : std.gd}
                                  </td>
                                  <td className="py-3 px-3 text-center font-black text-sm text-emerald-400">{std.pts}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* View 2: All Combined League Table */}
              {standingsViewMode === 'all' && (
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                  <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-400" />
                      <span>OVERALL LEAGUE STANDINGS</span>
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="py-3 px-4">Pos</th>
                          <th className="py-3 px-4">Club / Nation</th>
                          <th className="py-3 px-2 text-center">MP</th>
                          <th className="py-3 px-2 text-center">W</th>
                          <th className="py-3 px-2 text-center">D</th>
                          <th className="py-3 px-2 text-center">L</th>
                          <th className="py-3 px-2 text-center">GF</th>
                          <th className="py-3 px-2 text-center">GA</th>
                          <th className="py-3 px-2 text-center">GD</th>
                          <th className="py-3 px-2 text-center text-amber-400">🟨 Card</th>
                          <th className="py-3 px-4 text-center font-black text-emerald-400">PTS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {currentStandingsList.map((std, idx) => (
                          <tr key={std.team.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4 font-black text-slate-400 text-xs">{idx + 1}</td>
                            <td className="py-3 px-4 flex items-center gap-3 font-bold text-white">
                              <span className="text-xl">{std.team.badge}</span>
                              <div>
                                <div>{std.team.name}</div>
                                <div className="text-[9px] text-slate-500 font-normal">OVR {std.team.rating}</div>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center font-semibold text-slate-300">{std.mp}</td>
                            <td className="py-3 px-2 text-center font-bold text-emerald-400">{std.w}</td>
                            <td className="py-3 px-2 text-center font-semibold text-amber-400">{std.d}</td>
                            <td className="py-3 px-2 text-center font-semibold text-red-400">{std.l}</td>
                            <td className="py-3 px-2 text-center text-slate-300">{std.gf}</td>
                            <td className="py-3 px-2 text-center text-slate-300">{std.ga}</td>
                            <td className={`py-3 px-2 text-center font-bold ${std.gd > 0 ? 'text-emerald-400' : std.gd < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                              {std.gd > 0 ? `+${std.gd}` : std.gd}
                            </td>
                            <td className="py-3 px-2 text-center text-amber-400">{std.yc}</td>
                            <td className="py-3 px-4 text-center font-black text-emerald-400 text-sm">{std.pts}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tournament Match Fixtures List with Re-Randomize & Manual Score Inputs */}
              <div className="bg-white/5 rounded-2xl border border-white/10 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>Tournament Matches &amp; Fixtures ({activeTournament.matches.length})</span>
                  </h3>
                  <span className="text-xs text-slate-400">Click 🎲 Re-Randomize or ✏️ Edit Score to change results</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  {activeTournament.matches.map((m) => (
                    <div
                      key={m.id}
                      className="bg-slate-900/80 p-3.5 rounded-xl border border-white/10 flex items-center justify-between gap-3 hover:border-emerald-500/40 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                          {m.roundName}
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                          <span className="truncate flex items-center gap-1.5">
                            <span>{m.homeTeam.badge}</span>
                            <span className="truncate">{m.homeTeam.name}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-950 font-mono text-emerald-400">
                            {m.played ? `${m.homeScore} - ${m.awayScore}` : 'VS'}
                          </span>
                          <span className="truncate flex items-center gap-1.5">
                            <span className="truncate">{m.awayTeam.name}</span>
                            <span>{m.awayTeam.badge}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Re-Randomize Button */}
                        <button
                          onClick={() => handleReRandomizeMatch(m)}
                          className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold"
                          title="Re-Randomize Match Result"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        {/* Manual Edit Score Button */}
                        <button
                          onClick={() => {
                            setEditingMatch(m);
                            setEditHomeScoreInput(m.homeScore ?? 0);
                            setEditAwayScoreInput(m.awayScore ?? 0);
                          }}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold"
                          title="Manual Score Override"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-white/5 rounded-3xl border border-white/10 text-slate-400">
              <Trophy className="w-16 h-16 mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-white">No Active Tournament Loaded</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">Select a global tournament or build your own custom competition.</p>
              <button
                onClick={() => setActiveTab('tournaments')}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs"
              >
                Go to Global Tournaments
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual Score Edit Modal */}
      {editingMatch && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 p-6 rounded-3xl max-w-md w-full space-y-5 shadow-2xl">
            <h3 className="text-base font-bold text-white text-center flex items-center justify-center gap-2">
              <Edit3 className="w-5 h-5 text-emerald-400" />
              <span>Manual Score Override</span>
            </h3>

            <div className="flex items-center justify-around bg-slate-950 p-4 rounded-2xl border border-white/10 text-center">
              <div className="space-y-1">
                <div className="text-2xl">{editingMatch.homeTeam.badge}</div>
                <div className="text-xs font-bold text-white">{editingMatch.homeTeam.name}</div>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={editHomeScoreInput}
                  onChange={(e) => setEditHomeScoreInput(Number(e.target.value))}
                  className="w-16 py-2 text-center bg-slate-900 border border-emerald-500 rounded-xl text-emerald-400 font-bold text-lg outline-none"
                />
              </div>

              <div className="text-sm font-black text-slate-500">VS</div>

              <div className="space-y-1">
                <div className="text-2xl">{editingMatch.awayTeam.badge}</div>
                <div className="text-xs font-bold text-white">{editingMatch.awayTeam.name}</div>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={editAwayScoreInput}
                  onChange={(e) => setEditAwayScoreInput(Number(e.target.value))}
                  className="w-16 py-2 text-center bg-slate-900 border border-emerald-500 rounded-xl text-emerald-400 font-bold text-lg outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditingMatch(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveManualScore}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-slate-950 flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Score</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Teams & Custom Player Creator */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Team Form */}
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Create Custom Team</span>
              </h3>

              <form onSubmit={handleCreateTeam} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Team Name</label>
                  <input
                    type="text"
                    required
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g. Cairo Warriors FC"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Short Code</label>
                    <input
                      type="text"
                      maxLength={3}
                      value={newTeamShort}
                      onChange={(e) => setNewTeamShort(e.target.value)}
                      placeholder="CWC"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white outline-none uppercase focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Flag / Badge Emoji</label>
                    <input
                      type="text"
                      value={newTeamBadge}
                      onChange={(e) => setNewTeamBadge(e.target.value)}
                      placeholder="🦅"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white outline-none focus:border-emerald-500 text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Stadium Name</label>
                  <input
                    type="text"
                    value={newTeamStadium}
                    onChange={(e) => setNewTeamStadium(e.target.value)}
                    placeholder="Grand Arena"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
                >
                  + Add Team to Database
                </button>
              </form>
            </div>

            {/* World Database Teams List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center justify-between">
                <span>World Countries &amp; Clubs Database ({customTeams.length})</span>
                <span className="text-xs text-slate-400">All Teams Ready for Tournament Engine</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
                {customTeams.map((team) => (
                  <div key={team.id} className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{team.badge}</span>
                        <div>
                          <div className="font-bold text-sm text-white">{team.name}</div>
                          <div className="text-[10px] text-slate-400">{team.stadiumName} • {team.league}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-emerald-400">OVR {team.rating}</div>
                        <div className="text-[9px] text-slate-400">ATT {team.attackRating} | MID {team.midfieldRating}</div>
                      </div>
                    </div>

                    <div className="text-[10px] bg-slate-900/60 p-2.5 rounded-xl space-y-1 text-slate-300">
                      <div className="font-bold text-slate-400 uppercase text-[9px]">Star Roster ({team.players.length})</div>
                      {team.players.map(p => (
                        <div key={p.id} className="flex items-center justify-between">
                          <span>{p.name} ({p.position})</span>
                          <span className="font-bold text-emerald-400">{p.rating} OVR</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Live Match Simulator & Re-Roll View */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-6 md:p-8 rounded-3xl border border-emerald-500/40 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-emerald-400" />
                <span>Live Football Commentary &amp; Match Center</span>
              </h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWeatherCondition(weatherCondition === 'sun' ? 'rain' : weatherCondition === 'rain' ? 'snow' : 'sun')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5"
                >
                  {weatherCondition === 'sun' ? <Sun className="w-4 h-4 text-amber-400" /> : weatherCondition === 'rain' ? <CloudRain className="w-4 h-4 text-blue-400" /> : <CloudSnow className="w-4 h-4 text-slate-200" />}
                  <span className="capitalize">{weatherCondition} Pitch</span>
                </button>
              </div>
            </div>

            {simulatingMatch ? (
              <div className="space-y-6">
                {/* Scoreboard Banner */}
                <div className="bg-slate-900/80 p-6 rounded-2xl border border-white/10 flex items-center justify-around text-center">
                  <div className="space-y-2">
                    <span className="text-4xl">{simulatingMatch.homeTeam.badge}</span>
                    <div className="font-black text-sm text-white">{simulatingMatch.homeTeam.name}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-3xl font-black font-mono text-emerald-400 tracking-wider">
                      {simulatingMatch.homeScore} - {simulatingMatch.awayScore}
                    </div>
                    <div className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full uppercase">
                      FT • Full Time
                    </div>
                    <button
                      onClick={() => handleReRandomizeMatch(simulatingMatch)}
                      className="mt-2 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1 mx-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Re-Randomize Match Result</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <span className="text-4xl">{simulatingMatch.awayTeam.badge}</span>
                    <div className="font-black text-sm text-white">{simulatingMatch.awayTeam.name}</div>
                  </div>
                </div>

                {/* Match Stats Comparison */}
                {simulatingMatch.stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/5 p-4 rounded-xl text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Possession</div>
                      <div className="font-black text-white">{simulatingMatch.stats.possession[0]}% - {simulatingMatch.stats.possession[1]}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">xG (Expected Goals)</div>
                      <div className="font-black text-emerald-400">{simulatingMatch.stats.xG[0]} - {simulatingMatch.stats.xG[1]}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Shots on Target</div>
                      <div className="font-black text-white">{simulatingMatch.stats.shotsOnTarget[0]} - {simulatingMatch.stats.shotsOnTarget[1]}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Yellow / Red Cards</div>
                      <div className="font-black text-amber-400">{simulatingMatch.stats.yellowCards[0]}/{simulatingMatch.stats.redCards[0]} - {simulatingMatch.stats.yellowCards[1]}/{simulatingMatch.stats.redCards[1]}</div>
                    </div>
                  </div>
                )}

                {/* Live Minute-by-Minute Commentary */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Match Commentary &amp; Key Events Timeline</span>
                  </h3>

                  <div className="bg-slate-900/60 p-4 rounded-xl border border-white/10 max-h-72 overflow-y-auto space-y-2.5">
                    {simulatingMatch.events.length > 0 ? (
                      simulatingMatch.events.map((evt, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-white/5 text-xs">
                          <span className="font-mono font-bold text-emerald-400 min-w-[32px]">{evt.minute}'</span>
                          <span className="text-slate-200">{evt.text}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-4">Defensive tactics in play! No major incidents reported yet.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-white/10">
                <Play className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
                <p className="text-sm font-semibold text-white">No match actively loaded in simulator.</p>
                <p className="text-xs text-slate-400 mt-1">Click "Sim Next Match" or select a played fixture from the Standings tab to inspect!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: Career Mode & Club Management */}
      {activeTab === 'career' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Club Manager Status</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-2.5 bg-slate-900 rounded-xl">
                  <span className="text-slate-400">Manager Name</span>
                  <span className="font-bold text-white">Mido Gamez</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-900 rounded-xl">
                  <span className="text-slate-400">Tactical Formation</span>
                  <span className="font-bold text-emerald-400">4-3-3 Attacking</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-900 rounded-xl">
                  <span className="text-slate-400">Team Chemistry</span>
                  <span className="font-bold text-amber-400">96 / 100</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-900 rounded-xl">
                  <span className="text-slate-400">Transfer Budget</span>
                  <span className="font-bold text-emerald-400">$240.0M</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center justify-between">
                <span>Hall of Fame &amp; Records</span>
                <span className="text-xs text-slate-400">Top Performers</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/60 rounded-2xl border border-amber-500/20">
                  <div className="text-xs text-amber-400 font-bold mb-1 flex items-center gap-1.5">
                    <span>👟 Golden Boot (Top Scorer)</span>
                  </div>
                  <div className="font-black text-base text-white">Kylian Mbappé</div>
                  <div className="text-xs text-slate-400">14 Goals in 6 Matches</div>
                </div>

                <div className="p-4 bg-slate-900/60 rounded-2xl border border-emerald-500/20">
                  <div className="text-xs text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                    <span>🧤 Golden Glove (Clean Sheets)</span>
                  </div>
                  <div className="font-black text-base text-white">Thibaut Courtois</div>
                  <div className="text-xs text-slate-400">5 Clean Sheets</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
