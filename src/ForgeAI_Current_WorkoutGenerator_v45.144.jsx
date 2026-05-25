import React, { useState, useEffect } from 'react';
import {
  Activity,
  ArrowLeft,
  Award,
  BarChart3,
  Bell,
  Brain,
  Calendar as CalendarIcon,
  Camera,
  CheckCircle2,
  ChevronRight,
  ChefHat,
  ClipboardList,
  Clock,
  Coffee,
  Crown,
  Download,
  Dumbbell,
  FileJson,
  Filter,
  Flame,
  Gauge,
  Heart,
  Info,
  Layers,
  Leaf,
  LockKeyhole,
  MessageCircle,
  MoreHorizontal,
  NotebookText,
  Palette,
  Pencil,
  Pin,
  PlayCircle,
  Repeat,
  Salad,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  ShoppingBag,
  SlidersHorizontal,
  Soup,
  Sparkles,
  Target,
  TestTube,
  Timer,
  TrendingUp,
  Trophy,
  Trash2,
  User,
  UserCircle,
  Upload,
  Utensils,
  Waves,
  X,
  Zap
} from 'lucide-react';
import { buildForgeCoachContext, generateGeminiResponse } from './lib/gemini';
import {
  createFallbackMovementProfile,
  getMovementProfileByName,
  getMovementProfileBySlug,
  slugifyExerciseName
} from './data/exerciseMovementDatabase';

export default function WorkoutGenerator() {
  const [authUser, setAuthUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem('forgeai_auth_user');
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
      return null;
    }
  });
  const [settings, setSettings] = useState({
    goal: 'build-muscle',
    experience: 'intermediate',
    equipment: 'full-gym',
    focus: 'chest-back',
    duration: '45m',
    workoutStyle: 'paired',
    conditioningType: 'cardio'
  });
  
  const [workout, setWorkout] = useState(null);
  const [showWorkout, setShowWorkout] = useState(false);
  const [selectedBodyweightSubtype, setSelectedBodyweightSubtype] = useState('home_workout');
  const [bodyweightWorkoutSubtype, setBodyweightWorkoutSubtype] = useState(null);
  const [showTempoInfo, setShowTempoInfo] = useState(null);
  const [showExerciseDemo, setShowExerciseDemo] = useState(null);
  const [activeMovementContext, setActiveMovementContext] = useState(null);
  const [expandedMuscleProfile, setExpandedMuscleProfile] = useState(null);
  const [isWorkoutSessionActive, setIsWorkoutSessionActive] = useState(false);
  const [isWorkoutSessionViewActive, setIsWorkoutSessionViewActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [setLogs, setSetLogs] = useState({});
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(null);
  const [showFinishSummary, setShowFinishSummary] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [activeTab, setActiveTab] = useState('workout');
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [activeSessionSummary, setActiveSessionSummary] = useState(null);
  const [selectedLogEntry, setSelectedLogEntry] = useState(null);
  const [commentLogEntry, setCommentLogEntry] = useState(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [shareCardEntry, setShareCardEntry] = useState(null);
  const [logFilter, setLogFilter] = useState('all');
  const [logFiltersOpen, setLogFiltersOpen] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [logSort, setLogSort] = useState('newest');
  const [logViewMode, setLogViewMode] = useState('detailed');
  const [showLogManagement, setShowLogManagement] = useState(false);
  const [logManagementConfirm, setLogManagementConfirm] = useState(null);
  const [logActionMessage, setLogActionMessage] = useState('');
  const [activeLogMenuId, setActiveLogMenuId] = useState(null);
  const [selectedLogForAction, setSelectedLogForAction] = useState(null);
  const [showEditTitleModal, setShowEditTitleModal] = useState(false);
  const [editedLogTitle, setEditedLogTitle] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userProgress, setUserProgress] = useState(null);
  const [showXpBoostModal, setShowXpBoostModal] = useState(false);
  const [rankAchievementModal, setRankAchievementModal] = useState(null);
  const [dailyClaimCelebration, setDailyClaimCelebration] = useState(null);
  const [ambassadorState, setAmbassadorState] = useState(null);
  const [appliedCreatorCode, setAppliedCreatorCode] = useState('');
  const [ambassadorMessage, setAmbassadorMessage] = useState('');
  const [ambassadorDemoOpen, setAmbassadorDemoOpen] = useState(false);
  const [showSettingsScreen, setShowSettingsScreen] = useState(false);
  const [settingsPlaceholder, setSettingsPlaceholder] = useState(null);
  const [userSettings, setUserSettings] = useState({
    units: 'kg',
    currentWeight: 85,
    targetWeight: 92,
    weightUnit: 'kg',
    reduceAnimations: false,
    dailyClaimReminder: true,
    workoutReminder: false,
    coachingTone: 'Scientific'
  });
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('Ask ForgeAI Coach for a training adjustment, weakness fix, or progression idea. Your response will appear here.');
  const [aiMode, setAiMode] = useState('demo');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [mealPhoto, setMealPhoto] = useState(null);
  const [mealPhotoPreview, setMealPhotoPreview] = useState('');
  const [mealAnalysisLoading, setMealAnalysisLoading] = useState(false);
  const [mealAnalysisResult, setMealAnalysisResult] = useState(null);
  const [mealAnalysisError, setMealAnalysisError] = useState('');
  const [proStep, setProStep] = useState(1);
  const [proConfig, setProConfig] = useState({
    sport: null,
    schedule: null,
    durationWeeks: null,
    overloadCurve: null,
    goals: {
      squat: { current: '', target: null },
      bench: { current: '', target: null },
      deadlift: { current: '', target: null }
    }
  });
  const [proGeneratedProgram, setProGeneratedProgram] = useState(null);
  const [proUnlocked, setProUnlocked] = useState(false);
  const [showProGenerator, setShowProGenerator] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [activeAIModule, setActiveAIModule] = useState('coach');
  const [nutritionFavorites, setNutritionFavorites] = useState([]);
  const [nutritionCategory, setNutritionCategory] = useState(null);
  const [nutritionSearch, setNutritionSearch] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showNutritionUnlock, setShowNutritionUnlock] = useState(false);
  const [showLoadIntelligence, setShowLoadIntelligence] = useState(false);
  const [rmProfiles, setRmProfiles] = useState({});
  const [oneRepMaxes, setOneRepMaxes] = useState({});
  const [rmCalculator, setRmCalculator] = useState({
    exerciseName: 'Back Squat',
    customExerciseName: '',
    weight: '',
    reps: '',
    unit: 'kg',
    formula: 'Epley'
  });

  useEffect(() => {
    if (!isWorkoutSessionActive || !sessionStartTime) return undefined;

    const updateElapsed = () => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - sessionStartTime) / 1000)));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [isWorkoutSessionActive, sessionStartTime]);

  useEffect(() => {
    setWorkoutLogs(loadWorkoutLogs());
    setUserProgress(loadUserProgress());
    setUserSettings(loadUserSettings());
    setNutritionFavorites(loadNutritionFavorites());
    setRmProfiles(loadRMProfiles());
    setOneRepMaxes(loadUserOneRepMaxes());
    setAmbassadorState(loadAmbassadorState());
    setAppliedCreatorCode(loadAppliedCreatorCode());
    if (typeof window !== 'undefined') {
      const savedLogViewMode = window.localStorage.getItem('forgeai_log_view_mode');
      if (['detailed', 'compact'].includes(savedLogViewMode)) setLogViewMode(savedLogViewMode);
    }
  }, []);

  useEffect(() => () => {
    if (mealPhotoPreview) URL.revokeObjectURL(mealPhotoPreview);
  }, [mealPhotoPreview]);

  useEffect(() => {
    if (!aiMenuOpen || typeof document === 'undefined') return undefined;

    const closeMenuFromOutsideTap = (event) => {
      const target = event.target;
      if (target?.closest?.('[data-ai-mini-menu="true"]') || target?.closest?.('[data-ai-nav-button="true"]')) return;
      setAiMenuOpen(false);
    };

    document.addEventListener('pointerdown', closeMenuFromOutsideTap, true);
    return () => document.removeEventListener('pointerdown', closeMenuFromOutsideTap, true);
  }, [aiMenuOpen]);

  useEffect(() => {
    if (showTempoInfo === null || typeof document === 'undefined') return undefined;

    const closeTempoOnEscape = (event) => {
      if (event.key === 'Escape') setShowTempoInfo(null);
    };

    document.addEventListener('keydown', closeTempoOnEscape);
    return () => document.removeEventListener('keydown', closeTempoOnEscape);
  }, [showTempoInfo]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const syncMovementRoute = () => {
      const movementMatch = window.location.hash.match(/^#\/movement\/([^?]+)/);
      if (!movementMatch) {
        setActiveMovementContext(null);
        return;
      }

      const slug = slugifyExerciseName(decodeURIComponent(movementMatch[1]));
      const profile = getMovementProfileBySlug(slug);
      setActiveMovementContext(current => (
        current?.slug === slug
          ? current
          : {
              slug,
              exerciseName: profile?.displayName || slug.replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()),
              goal: settings.goal,
              tempo: null,
              source: 'route'
            }
      ));
    };

    syncMovementRoute();
    window.addEventListener('hashchange', syncMovementRoute);
    return () => window.removeEventListener('hashchange', syncMovementRoute);
  }, []);

  // Plyometric exercises for Power workouts (always first, max 1 per workout)
  const plyometricExercises = [
    'Box Jumps',
    'Depth to Box Jumps',
    'Stiff-Leg Depth Jump',
    'Pogo Jumps',
    'Seated Box Jumps',
    'Hurdles Jumps',
    'Hurdle Jump to Box',
    'Squat Jumps',
    'Medicine Ball Slam',
    'Medicine Ball Chest Pass'
  ];

  // Build Muscle Tempos - randomly assigned regardless of set/rep scheme
  const buildMuscleTempos = ['4010', '3010', '20X0', '5010', '31X0', '3210'];
  const getRandomBuildMuscleTempo = () => buildMuscleTempos[Math.floor(Math.random() * buildMuscleTempos.length)];
  
  const buildMuscleTempoExplanations = {
    '4010': 'Hypertrophy (Eccentric focused)',
    '3010': 'Heavy Hypertrophy (Concentric focused)',
    '20X0': 'Heavy Hypertrophy (Concentric focused)',
    '5010': 'Hypertrophy (Eccentric focused)',
    '31X0': 'Paused contraction (Concentric focused)',
    '3210': 'Paused contraction (Isometric focused)',
    '1010': 'Controlled tempo (DB Lunges specific)'
  };

  // Build Muscle Set/Rep Schemes
  // Tempo guide: 4010/5010 = Eccentric/hypertrophy, 30X0 = Strength+power, 20X0 = Pure explosiveness
  const buildMuscleSchemes = {
    'classic-hypertrophy': {
      name: 'Classic Hypertrophy',
      setsReps: '3-5 × 8-12',
      tempo: 'random',
      rest: '60-90 sec',
      type: 'secondary',
      description: 'Standard hypertrophy range, great for all exercises'
    },
    'heavy-hypertrophy': {
      name: 'Heavy Hypertrophy',
      setsReps: '4-6 × 5-8',
      tempo: 'random',
      rest: '90-120 sec',
      type: 'secondary',
      description: 'Heavier loading for strength-focused muscle building'
    },
    'dropsets': {
      name: 'Dropsets (4×8-12)',
      setsReps: '4 × 8-12 (drop)',
      tempo: 'random',
      rest: '60 sec',
      type: 'main',
      description: 'Increase weight each set and lower reps',
      example: 'Set 1: 130×12, Set 2: 135×11, Set 3: 140×10, Set 4: 145×8'
    },
    'gvt': {
      name: 'German Volume Training',
      setsReps: '10 × 10',
      tempo: 'random',
      rest: '75 sec',
      type: 'main',
      description: '100 total reps per exercise - extreme volume',
      example: 'A1. Incline DB Press 10×10, A2. Chin-Up 10×10'
    },
    'gvt-advanced': {
      name: 'Advanced GVT',
      setsReps: '10 × 5',
      tempo: '5010',
      rest: '75 sec',
      type: 'main',
      description: 'Heavier variation of GVT for advanced lifters',
      advancedOnly: true
    },
    'post-exhaustion': {
      name: 'Post Exhaustion Method',
      setsReps: '4×4-6 + 4×6-8',
      tempo: 'random',
      rest: '10s / 180s',
      type: 'main',
      description: 'Compound exercise followed immediately by isolation',
      example: 'A1. Close-Grip Chin-up 4×4-6 (rest 10s), A2. Incline Curl 4×6-8 (rest 180s)'
    },
    'wave-loading': {
      name: 'Wave Loading',
      setsReps: '3 × 10/8/6',
      tempo: 'random',
      rest: '90 sec',
      type: 'main',
      description: 'Progressive overload within the session',
      example: 'Set 1: 10 reps, increase weight for Set 2: 8 reps, increase weight again for Set 3: 6 reps'
    },
    'wave-pump': {
      name: 'Wave + Pump',
      setsReps: '4 × 10/8/6/15',
      tempo: 'random',
      rest: '90 sec',
      type: 'main',
      description: 'Wave loading followed by high-rep pump set',
      example: 'Set 1: 10 reps, Set 2: 8 reps (heavier), Set 3: 6 reps (heaviest), Set 4: 15 reps (light pump)'
    },
    'eight-by-eight': {
      name: '8×8',
      setsReps: '8 × 8',
      tempo: 'random',
      rest: '60-90 sec',
      type: 'main',
      description: 'High volume, great for muscle hypertrophy, endurance, and work capacity'
    },
    'cluster-hypertrophy': {
      name: '5 to 8 Method',
      setsReps: '2-3 × 5+(1+1+1)',
      tempo: 'random',
      rest: '10-15s between singles',
      type: 'main',
      description: 'Perform 5 reps, rest 10-15s, then 3 singles with 10-15s rest between',
      example: '5 reps → rest 15s → 1 rep → rest 15s → 1 rep → rest 15s → 1 rep'
    }
  };

  // Strength Set/Rep Schemes
  // Tempo guide: 
  // 4010 = Pure strength (Eccentric focus)
  // 30X0 = Strength + power (Explosive concentric)
  // 20X0 = Strength speed (Concentric)
  // 32X1 = Pause + explosive concentric (Isometric paused)
  // 43X0 = Contraction to explosion (Isometric paused)
  
  const strengthTempos = ['4010', '30X0', '20X0', '32X1', '43X0'];
  const getRandomStrengthTempo = () => strengthTempos[Math.floor(Math.random() * strengthTempos.length)];
  
  const tempoExplanations = {
    '4010': 'Pure strength (Eccentric focus)',
    '30X0': 'Strength + power (Explosive concentric)',
    '20X0': 'Strength speed (Concentric)',
    '32X1': 'Pause + explosive concentric (Isometric paused)',
    '43X0': 'Contraction to explosion (Isometric paused)',
    '1010': 'Controlled tempo (DB Lunges specific)'
  };
  
  const strengthSchemes = {
    // Secondary exercise schemes
    'basic-assistance': {
      name: 'Basic Assistance Work',
      setsReps: '3-5 × 5-8',
      tempo: 'random',
      rest: '90-120 sec',
      type: 'secondary',
      description: 'Supporting work to build strength foundation'
    },
    // Main exercise schemes
    'one-six-method': {
      name: 'The 1-6 Method',
      setsReps: '6 × (1,6,1,6,1,6)',
      tempo: 'random',
      rest: '120 sec',
      type: 'main',
      description: 'Alternate heavy singles with sets of 6 to tap into high-threshold motor units',
      example: 'A1. Back Squat (1,6,1,6,1,6) - perform one heavy single, then lighter set of 6, and repeat'
    },
    'five-four-three-two-one': {
      name: '5,4,3,2,1 Method',
      setsReps: '5 × (5,4,3,2,1)',
      tempo: 'random',
      rest: '180 sec',
      type: 'main',
      description: 'Perform 5 reps, next set add weight perform 4 reps, add weight perform 3 reps, add weight perform 2 reps, add weight perform 1 rep',
      example: 'Set 1: 100kg × 5 → Set 2: 105kg × 4 → Set 3: 110kg × 3 → Set 4: 115kg × 2 → Set 5: 120kg × 1'
    },
    'cluster-strength': {
      name: 'Cluster Training',
      setsReps: '3-5 × (5×1)',
      tempo: 'random',
      rest: '10s between reps, 120s between sets',
      type: 'main',
      description: '5 singles per cluster with short intra-set rest for maximal strength',
      example: 'A1. Close-Grip Bench Press, 3-5 clusters (5×1), rest 10s between reps'
    },
    'basic-strength': {
      name: 'Basic Strength',
      setsReps: '3-5 × 3-5',
      tempo: 'random',
      rest: '180 sec',
      type: 'main',
      description: 'Classic strength building with heavy loads and low reps'
    },
    'five-by-five': {
      name: '5×5 Strength',
      setsReps: '5 × 5',
      tempo: 'random',
      rest: '180 sec',
      type: 'main',
      description: 'Classic 5×5 protocol for building raw strength'
    },
    'six-by-three': {
      name: '6×3 Heavy',
      setsReps: '6 × 3',
      tempo: 'random',
      rest: '180-240 sec',
      type: 'main',
      description: 'Heavy triples for maximal strength development'
    },
    'wave-531': {
      name: 'Wave Loading 5/3/1',
      setsReps: '2-3 × 5/3/1',
      tempo: 'random',
      rest: '180 sec',
      type: 'main',
      description: 'Perform 5 reps, increase weight → 3 reps, increase weight → 1 rep. Start next wave with +2.5-5kg',
      example: 'Wave 1: 100kg×5, 105kg×3, 110kg×1 → Wave 2: 102.5kg×5, 107.5kg×3, 112.5kg×1'
    },
    'wave-321': {
      name: 'Wave Loading 3/2/1',
      setsReps: '2-3 × 3/2/1',
      tempo: 'random',
      rest: '180-240 sec',
      type: 'main',
      description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg',
      example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1'
    }
  };

  // Power Set/Rep Schemes (for athletic performance/power goal)
  const powerSchemes = {
    'explosive-power': {
      name: 'Explosive Power',
      setsReps: '4-6 × 3-5',
      tempo: '20X0',
      rest: '120-180 sec',
      type: 'main',
      description: 'Fast, explosive movements for maximum power output'
    },
    'power-assistance': {
      name: 'Power Assistance',
      setsReps: '3-4 × 6-8',
      tempo: '30X0',
      rest: '90-120 sec',
      type: 'secondary',
      description: 'Supporting work for power development'
    }
  };

  // Exercise-specific sets/reps for Power workouts (Legs + Full Body + others)
  const powerExerciseSchemes = {
    // Power A (Plyometric)
    'Box Jumps': [
      { setsReps: '3 × 3', tempo: 'X0X3', rest: '60-90 sec' }
    ],
    'Depth to Box Jumps': [
      { setsReps: '3 × 3', tempo: 'X0X3', rest: '60-90 sec' }
    ],
    'Stiff-Leg Depth Jump': [
      { setsReps: '3 × 3', tempo: 'X0X3', rest: '60-90 sec' }
    ],
    'Pogo Jumps': [
      { setsReps: '3 × 10', tempo: 'X0X0', rest: '60-90 sec' }
    ],
    'Seated Box Jumps': [
      { setsReps: '3 × 3', tempo: 'X0X3', rest: '60-90 sec' }
    ],
    'Hurdle Jump to Box': [
      { setsReps: '3 × 3', tempo: 'X0X3', rest: '60-90 sec' }
    ],
    'Overhead Medicine Ball Slam': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '60-90 sec' }
    ],
    'Medicine Ball Slam': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '60-90 sec' }
    ],
    'Medicine Ball Chest Pass': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '60-90 sec' }
    ],
    // Power B (Main Power Lift)
    'Power Clean': [
      { setsReps: '3 × 3', tempo: 'X0X1', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '2 × 3/2/1', tempo: 'X0X1', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' }
    ],
    'Power Clean from Hang': [
      { setsReps: '3 × 3', tempo: 'X0X1', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '2 × 3/2/1', tempo: 'X0X1', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' }
    ],
    'Power Clean + Front Squat (1+1)': [
      { setsReps: '3-5 × (1+1)', tempo: 'X0X0 + X0X0', rest: '120-180 sec', scheme: 'Complex Power' }
    ],
    'Power Clean from Block': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '2 × 3/2/1', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' }
    ],
    'Halting Pull + Power Clean (1+1)': [
      { setsReps: '3-5 × (1+1)', tempo: '1010 + X0X1', rest: '120-180 sec', scheme: 'Complex Power' }
    ],
    'Power Snatch': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '2 × 3/2/1', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' }
    ],
    'Power Snatch from Hang': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '2 × 3/2/1', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' }
    ],
    'Power Snatch from Block': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '2 × 3/2/1', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' }
    ],
    'Snatch High Pull from Hang': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '3 × 3-5', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' }
    ],
    'Snatch High Pull from Blocks': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '3-5 × 3-5', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' }
    ],
    'Squat Jumps': [
      { setsReps: '3 × 3-6', tempo: 'X0X0', rest: '90-120 sec', scheme: 'Explosive Power' }
    ],
    'Sled Sprints': [
      { setsReps: '3-5 × 10-20m', tempo: '—', rest: '90-120 sec', scheme: 'Explosive Power' }
    ],
    'Power Clean + Overhead Press': [
      { setsReps: '3-5 × (1+2)', tempo: 'X0X0 + X0X0', rest: '120-180 sec', scheme: 'Complex Power' }
    ],
    'Trap Bar Jumps': [
      { setsReps: '3 × 3-6', tempo: 'X0X0', rest: '90-120 sec', scheme: 'Explosive Power' }
    ],
    // Power C (Speed-Strength)
    'Dumbbell Speed Bench': [
      { setsReps: '3-5 × 8', tempo: 'X0X0', rest: '90-120 sec', scheme: 'Speed-Strength' }
    ],
    'Explosive Close Grip Bench Press': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '4 × 4', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '3-5 × 3-5', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' }
    ],
    'Explosive Close Grip Chin-Ups': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '4 × 4', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '3-5 × 3-5', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' }
    ],
    'Plyometric Push-Ups': [
      { setsReps: '3-5 × 5-8', tempo: 'X0X0', rest: '90-120 sec', scheme: 'Speed-Strength' }
    ],
    'Sled Push': [
      { setsReps: '3-5 × 10-20m', tempo: '—', rest: '90-120 sec', scheme: 'Speed-Strength' }
    ],
    'Clean Pull': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '2 × 3/2/1', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' }
    ],
    'Stiff-Leg Deadlift (Concentric)': [
      { setsReps: '3-5 × 2', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '3 × 3', tempo: '20X0', rest: '120-180 sec', scheme: 'Speed-Strength' }
    ],
    'Landmine Press (Explosive)': [
      { setsReps: '3-5 × 5-8', tempo: 'X0X0', rest: '90-120 sec', scheme: 'Speed-Strength' }
    ],
    'Halting Pull + Clean Pull (2+1)': [
      { setsReps: '3-5 × (2+1)', tempo: '1010 + X0X0', rest: '120-180 sec', scheme: 'Complex Speed-Strength' }
    ],
    'Clean Pull from Block': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '5 × (5,4,3,2,1)', tempo: 'X0X0', rest: '120-180 sec', scheme: '5,4,3,2,1 Method', description: 'Perform 5 reps, next set add weight perform 4 reps, add weight perform 3 reps, etc.', example: 'Set 1: 100kg × 5 → Set 2: 105kg × 4 → Set 3: 110kg × 3 → Set 4: 115kg × 2 → Set 5: 120kg × 1' }
    ],
    'Pin Front Squat': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '3-5 × 3-5', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' }
    ],
    'Front Squat': [
      { setsReps: '3 × 3', tempo: '20X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '6 × 3', tempo: '31X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '2 × 3/2/1', tempo: '32X1', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' },
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' }
    ],
    'Front Squat (1+1)': [
      { setsReps: '3-5 × (1+1)', tempo: '43X0 + 20X0', rest: '120-180 sec', scheme: 'Complex Speed-Strength' }
    ],
    'Back Squat + Front Squat (1+1)': [
      { setsReps: '3-5 × (1+1)', tempo: '43X0 + 20X0', rest: '120-180 sec', scheme: 'Complex Speed-Strength' }
    ],
    'Front Squat Heel Elevated': [
      { setsReps: '3 × 3', tempo: '20X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '6 × 3', tempo: '31X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '2 × 3/2/1', tempo: '32X1', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' },
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' }
    ],
    'Back Squat': [
      { setsReps: '3 × 3', tempo: '20X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '5 × 3', tempo: '31X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '2 × 3/2/1', tempo: '32X1', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' },
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' }
    ],
    'Pin Back Squat': [
      { setsReps: '3 × 3', tempo: '20X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '3-5 × 3-5', tempo: '31X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '2 × 3/2/1', tempo: '32X1', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' },
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' }
    ],
    'Back Squat Heel Elevated': [
      { setsReps: '3 × 3', tempo: '20X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '5 × 3', tempo: '31X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '2 × 3/2/1', tempo: '32X1', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' },
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' }
    ],
    'Snatch Pull': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '2 × 3/2/1', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' }
    ],
    'Snatch Pull from Blocks': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '2 × 3/2/1', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' }
    ],
    'Trap Bar Deadlift': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '5 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' },
      { setsReps: '2 × 3/2/1', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Wave Loading', description: 'Perform 3 reps, increase weight → 2 reps, increase weight → 1 rep. Start next wave with +2.5-5kg', example: 'Wave 1: 110kg×3, 115kg×2, 120kg×1 → Wave 2: 112.5kg×3, 117.5kg×2, 122.5kg×1' },
      { setsReps: '3-5 × 3-5', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' }
    ],
    // Power D (Posterior Accessory)
    'Back Extensions (Dumbbells)': [
      { setsReps: '3 × 10', tempo: '3010', rest: '60-90 sec', scheme: 'Posterior Chain' },
      { setsReps: '3 × 8-12', tempo: '3010', rest: '60-90 sec', scheme: 'Posterior Chain' }
    ],
    'Back Extensions (Plate)': [
      { setsReps: '3 × 10', tempo: '3010', rest: '60-90 sec', scheme: 'Posterior Chain' },
      { setsReps: '3 × 8-12', tempo: '3010', rest: '60-90 sec', scheme: 'Posterior Chain' }
    ],
    'Back Extensions Snatch Grip': [
      { setsReps: '3 × 10', tempo: '3010', rest: '60-90 sec', scheme: 'Posterior Chain' },
      { setsReps: '3 × 8-12', tempo: '3010', rest: '60-90 sec', scheme: 'Posterior Chain' }
    ],
    'Good Morning': [
      { setsReps: '3 × 10', tempo: '3010', rest: '60-90 sec', scheme: 'Posterior Chain' },
      { setsReps: '3 × 5-8', tempo: '3010', rest: '60-90 sec', scheme: 'Posterior Chain' }
    ],
    'Reverse Hyperextensions': [
      { setsReps: '3 × 8-12', tempo: '1010', rest: '60-90 sec', scheme: 'Posterior Chain' },
      { setsReps: '3 × 15', tempo: '1010', rest: '60-90 sec', scheme: 'Posterior Chain' }
    ],
    'Seated Good Mornings': [
      { setsReps: '3 × 10', tempo: '3010', rest: '60-90 sec', scheme: 'Posterior Chain' },
      { setsReps: '3 × 8-12', tempo: '3010', rest: '60-90 sec', scheme: 'Posterior Chain' },
      { setsReps: '3 × 5-8', tempo: '3010', rest: '60-90 sec', scheme: 'Posterior Chain' }
    ],
    // Upper Body Power exercises
    'Explosive Pull-Ups': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '4 × 4', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '3-5 × 3-5', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' }
    ],
    'Band-Resisted Push-Ups': [
      { setsReps: '3-5 × 5-8', tempo: 'X0X0', rest: '90-120 sec', scheme: 'Speed-Strength' }
    ],
    'Explosive Bench Press': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '4 × 4', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '3-5 × 3-5', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' }
    ],
    'Explosive Trap Bar Push-Ups': [
      { setsReps: '3-5 × 5-8', tempo: 'X0X0', rest: '90-120 sec', scheme: 'Speed-Strength' }
    ],
    'Snatch-Grip Trap Pull': [
      { setsReps: '3-5 × 5', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Speed-Strength' }
    ],
    'Concept2 Rower Sprints': [
      { setsReps: '3 × 50-80m', tempo: '—', rest: '90-120 sec', scheme: 'Explosive Power' }
    ],
    'Kettlebell Clean & Press': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '4 × 4', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '3-5 × 3-5', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' }
    ],
    // Core / Upper Body Accessory
    'Russian Twists': [
      { setsReps: '3 × 10', tempo: '1010', rest: '60-90 sec', scheme: 'Core Accessory' }
    ],
    'Hanging Knee Raise': [
      { setsReps: '3 × 10', tempo: '2010', rest: '60-90 sec', scheme: 'Core Accessory' }
    ],
    'Hanging Leg Raise': [
      { setsReps: '3 × 5-8', tempo: '2010', rest: '60-90 sec', scheme: 'Core Accessory' }
    ],
    'Single-Arm Dumbbell Row': [
      { setsReps: '3-5 × 5-8', tempo: 'X0X0', rest: '90-120 sec', scheme: 'Speed-Strength' }
    ],
    'TRX Face Pull': [
      { setsReps: '3 × 8-12', tempo: 'X0X0', rest: '60-90 sec', scheme: 'Speed-Strength' }
    ],
    // Arms Power exercises
    'Explosive Barbell Curl': [
      { setsReps: '3 × 3', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '4 × 4', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '3-5 × 3-5', tempo: 'X0X0', rest: '120-180 sec', scheme: 'Explosive Power' },
      { setsReps: '5 × (5,4,3,2,1)', tempo: 'X0X0', rest: '120-180 sec', scheme: '5,4,3,2,1 Method', description: 'Perform 5 reps, next set add weight perform 4 reps, add weight perform 3 reps, etc.', example: 'Set 1: 100kg × 5 → Set 2: 105kg × 4 → Set 3: 110kg × 3 → Set 4: 115kg × 2 → Set 5: 120kg × 1' }
    ],
    'DB Clean & Press': [
      { setsReps: '3-5 × 8', tempo: 'X0X0', rest: '90-120 sec', scheme: 'Explosive Power' }
    ],
    // Rotation / Prehab Accessory
    'Seated Dumbbell External Rotation': [
      { setsReps: '3 × 8', tempo: '3010', rest: '60-90 sec', scheme: 'Rotator Cuff', description: 'Supporting work for main power movements' }
    ],
    'External Rotation (Cable/Band)': [
      { setsReps: '3 × 8-12', tempo: '3010', rest: '60-90 sec', scheme: 'Rotator Cuff', description: 'Supporting work for main power movements' }
    ],
    'Internal Rotation (Cable/Band)': [
      { setsReps: '3 × 8-12', tempo: '3010', rest: '60-90 sec', scheme: 'Rotator Cuff', description: 'Supporting work for main power movements' }
    ]
  };

  // Muscle data for each exercise
  const muscleData = {
    // CHEST EXERCISES
    'Bench Press': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Rotator Cuff, Rhomboids, Core' },
    'Push-ups': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Core, Glutes, Serratus Anterior' },
    'Neutral Grip Trapbar Push-ups': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Core, Serratus Anterior, Scapular Stabilizers, Forearms' },
    'Decline Push-up': { primary: 'Lower Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Core, Serratus Anterior, Glutes' },
    'Weighted Push-up': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Core, Upper Back, Glutes' },
    'Plank': { primary: 'Rectus Abdominis, Transverse Abdominis', secondary: 'Obliques, Glutes', stabilizers: 'Shoulders, Serratus Anterior, Hip Flexors' },
    'Side Plank': { primary: 'Obliques, Transverse Abdominis', secondary: 'Gluteus Medius, Quadratus Lumborum', stabilizers: 'Shoulders, Serratus Anterior' },
    'Reverse Crunch': { primary: 'Rectus Abdominis', secondary: 'Hip Flexors, Obliques', stabilizers: 'Transverse Abdominis, Lower Back' },
    'Bicycle Crunch': { primary: 'Obliques, Rectus Abdominis', secondary: 'Hip Flexors', stabilizers: 'Transverse Abdominis' },
    'Dead Bug': { primary: 'Transverse Abdominis, Rectus Abdominis', secondary: 'Hip Flexors', stabilizers: 'Lower Back, Diaphragm' },
    'Bird Dog': { primary: 'Erector Spinae, Glutes', secondary: 'Transverse Abdominis, Hamstrings', stabilizers: 'Shoulders, Obliques' },
    'Mountain Climbers': { primary: 'Hip Flexors, Rectus Abdominis', secondary: 'Quadriceps, Shoulders', stabilizers: 'Transverse Abdominis, Glutes' },
    'Superman': { primary: 'Erector Spinae, Glutes', secondary: 'Hamstrings, Rear Deltoids', stabilizers: 'Core, Scapular Stabilizers' },
    'Superman Hold': { primary: 'Erector Spinae, Glutes', secondary: 'Hamstrings, Rear Deltoids', stabilizers: 'Core, Scapular Stabilizers' },
    'Reverse Snow Angel': { primary: 'Rear Deltoids, Lower Trapezius', secondary: 'Rhomboids, Erector Spinae', stabilizers: 'Core, Glutes' },
    'Y-T-W Raise': { primary: 'Lower Trapezius, Rear Deltoids', secondary: 'Rhomboids, Middle Trapezius, External Rotators', stabilizers: 'Core, Rotator Cuff' },
    'Front Lever': { primary: 'Latissimus Dorsi, Core', secondary: 'Rear Deltoids, Teres Major', stabilizers: 'Scapular Stabilizers, Glutes' },
    'Front Lever Row': { primary: 'Latissimus Dorsi, Rhomboids', secondary: 'Rear Deltoids, Biceps', stabilizers: 'Core, Scapular Stabilizers' },
    'Chest Press': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Scapular Stabilizers, Core' },
    'Incline Dumbbell Press': { primary: 'Upper Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Rotator Cuff, Core, Upper Back' },
    'Cable Flies': { primary: 'Pectoralis Major', secondary: 'Anterior Deltoids', stabilizers: 'Core, Serratus Anterior, Biceps' },
    'Dumbbell Chest Fly': { primary: 'Pectoralis Major', secondary: 'Anterior Deltoids', stabilizers: 'Biceps, Rotator Cuff, Upper Back' },
    'Incline Dumbbell Fly': { primary: 'Upper Pectoralis Major', secondary: 'Anterior Deltoids', stabilizers: 'Biceps, Rotator Cuff, Upper Back' },
    'Plate-Loaded Chest Press': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Scapular Stabilizers, Core' },
    'Seated Chest Fly': { primary: 'Pectoralis Major', secondary: 'Anterior Deltoids', stabilizers: 'Biceps, Scapular Stabilizers' },
    'Chest Dips': { primary: 'Lower Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Core, Lats, Rhomboids, Serratus Anterior' },
    
    // BACK EXERCISES
    'Pull-ups': { primary: 'Latissimus Dorsi', secondary: 'Biceps, Rhomboids, Trapezius', stabilizers: 'Core, Forearm Flexors, Rotator Cuff' },
    'Pull-ups Neutral Grip': { primary: 'Latissimus Dorsi', secondary: 'Biceps, Rhomboids, Trapezius', stabilizers: 'Core, Forearm Flexors, Rotator Cuff' },
    'Lat Pulldown': { primary: 'Latissimus Dorsi', secondary: 'Biceps, Rhomboids, Teres Major, Rear Deltoids', stabilizers: 'Rotator Cuff, Core' },
    'Barbell Row': { primary: 'Latissimus Dorsi', secondary: 'Rhomboids, Trapezius, Rear Deltoids, Biceps', stabilizers: 'Core, Hamstrings, Spinal Erectors' },
    'T-Bar Row': { primary: 'Latissimus Dorsi', secondary: 'Rhomboids, Trapezius, Rear Deltoids, Biceps', stabilizers: 'Core, Spinal Erectors, Glutes' },
    'Pendlay Row': { primary: 'Latissimus Dorsi', secondary: 'Rhomboids, Trapezius, Rear Deltoids, Biceps', stabilizers: 'Core, Spinal Erectors, Glutes' },
    'Chest-Supported Row': { primary: 'Rhomboids', secondary: 'Middle Trapezius, Lats, Rear Deltoids, Biceps', stabilizers: 'Forearms' },
    'One-Arm Dumbbell Row': { primary: 'Latissimus Dorsi', secondary: 'Rhomboids, Trapezius, Rear Deltoids, Biceps', stabilizers: 'Core, Rotator Cuff' },
    'Inverted Row': { primary: 'Rhomboids', secondary: 'Lats, Middle Trapezius, Rear Deltoids, Biceps', stabilizers: 'Core, Glutes' },
    'Cable Row': { primary: 'Latissimus Dorsi', secondary: 'Rhomboids, Trapezius, Rear Deltoids, Biceps', stabilizers: 'Core, Rotator Cuff' },
    'Face Pulls': { primary: 'Rear Deltoids', secondary: 'Rhomboids, Middle Trapezius, External Rotators', stabilizers: 'Core, Rotator Cuff' },
    'Trap Pulls': { primary: 'Trapezius', secondary: 'Rear Deltoids, Rhomboids', stabilizers: 'Core, Erector Spinae' },
    'Rear Delt Flys': { primary: 'Rear Deltoids', secondary: 'Rhomboids, Middle Trapezius', stabilizers: 'Core, Rotator Cuff' },
    'Band Pull-Aparts': { primary: 'Rear Deltoids', secondary: 'Rhomboids, Middle Trapezius, External Rotators', stabilizers: 'Core' },
    'Y-T-W Raises': { primary: 'Lower Trapezius', secondary: 'Rhomboids, Middle Trapezius, External Rotators', stabilizers: 'Core, Rotator Cuff' },
    
    // SHOULDER EXERCISES
    'Barbell Overhead Press': { primary: 'Anterior Deltoid', secondary: 'Lateral Deltoid, Triceps Brachii, Upper Pectoralis Major', stabilizers: 'Core, Upper Trapezius, Rotator Cuff, Gluteus Maximus' },
    'Dumbbell Shoulder Press': { primary: 'Anterior Deltoid', secondary: 'Lateral Deltoid, Triceps Brachii, Upper Pectoralis Major', stabilizers: 'Core, Rotator Cuff, Upper Trapezius' },
    'Landmine Press': { primary: 'Anterior Deltoid', secondary: 'Upper Pectoralis Major, Triceps Brachii, Lateral Deltoid', stabilizers: 'Core, Obliques, Rotator Cuff, Serratus Anterior' },
    'Behind-the-Neck Overhead Press (Seated)': { primary: 'Anterior Deltoid', secondary: 'Lateral Deltoid, Triceps Brachii, Upper Trapezius', stabilizers: 'Rotator Cuff, Core, Rhomboids' },
    'Behind-the-Neck Overhead Press (Standing)': { primary: 'Anterior Deltoid', secondary: 'Lateral Deltoid, Triceps Brachii, Upper Trapezius', stabilizers: 'Core, Gluteus Maximus, Rotator Cuff' },
    'Behind-the-Neck Snatch-Grip Press': { primary: 'Lateral Deltoid', secondary: 'Anterior Deltoid, Triceps Brachii, Upper Trapezius', stabilizers: 'Rotator Cuff, Core, Rhomboids, Serratus Anterior' },
    'Poliquin Raise': { primary: 'Lateral Deltoid', secondary: 'Anterior Deltoid, Upper Trapezius', stabilizers: 'Rotator Cuff, Core' },
    'External Rotation (Cable/Band)': { primary: 'Rotator Cuff', secondary: 'Posterior Deltoid', stabilizers: 'Scapular Stabilizers, Core' },
    'External Rotation Dumbbell (Seated)': { primary: 'Rotator Cuff', secondary: 'Posterior Deltoid', stabilizers: 'Scapular Stabilizers, Core' },
    'Bent-Over Dumbbell Rear Delt Raise': { primary: 'Posterior Deltoid', secondary: 'Rhomboids, Middle Trapezius', stabilizers: 'Core, Lower Back, Rotator Cuff' },
    'Arnold Press': { primary: 'Anterior Deltoid', secondary: 'Lateral Deltoid, Triceps Brachii, Upper Pectoralis Major', stabilizers: 'Core, Rotator Cuff, Upper Trapezius' },
    'Chest-Supported Rear Delt Raise': { primary: 'Posterior Deltoid', secondary: 'Rhomboids, Middle Trapezius', stabilizers: 'Rotator Cuff' },
    'Internal Rotation (Cable/Band)': { primary: 'Rotator Cuff', secondary: 'Pectoralis Major, Latissimus Dorsi', stabilizers: 'Scapular Stabilizers, Core' },
    'Leaning Lateral Raise': { primary: 'Lateral Deltoid', secondary: 'Anterior Deltoid, Upper Trapezius', stabilizers: 'Core, Rotator Cuff' },
    
    // LEG EXERCISES - SQUATS
    'Back Squat': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Erector Spinae, Core, Upper Back, Calves' },
    'Back Squat Heel Elevated': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Erector Spinae, Core, Upper Back, Calves' },
    'Low Bar Back Squat': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Erector Spinae, Core, Upper Back, Calves' },
    'Box Back Squat': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Erector Spinae, Core, Upper Back, Calves' },
    'Pin Back Squat': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Erector Spinae, Core, Upper Back, Calves' },
    'Eccentric Back Squat': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Erector Spinae, Core, Upper Back, Calves' },
    'Front Squat': { primary: 'Quadriceps', secondary: 'Gluteus Maximus, Adductors', stabilizers: 'Core, Upper Back, Erector Spinae' },
    'Front Squat Heel Elevated': { primary: 'Quadriceps', secondary: 'Gluteus Maximus, Adductors', stabilizers: 'Core, Upper Back, Erector Spinae' },
    'Box Front Squat': { primary: 'Quadriceps', secondary: 'Gluteus Maximus, Adductors', stabilizers: 'Core, Upper Back, Erector Spinae' },
    'Pin Front Squat': { primary: 'Quadriceps', secondary: 'Gluteus Maximus, Adductors', stabilizers: 'Core, Upper Back, Erector Spinae' },
    'Eccentric Front Squat': { primary: 'Quadriceps', secondary: 'Gluteus Maximus, Adductors', stabilizers: 'Core, Upper Back, Erector Spinae' },
    'Bulgarian Squat w Dumbbells': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core, Calves' },
    'Bulgarian Squat w Kettlebells': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core, Calves' },
    'Bulgarian Back Squat': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core, Calves' },
    'Bulgarian Front Squat': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core, Calves' },
    'Dumbbell Lunges': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core, Calves' },
    'Goblet Squat': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core, Upper Back, Calves' },
    'Belt Squat': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core, Calves' },
    'Leg Press': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core' },
    'Leg Extension': { primary: 'Quadriceps', secondary: '', stabilizers: 'Core' },
    'Sled Push': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Calves', stabilizers: 'Core, Upper Back' },
    'Box Jump': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Calves', stabilizers: 'Core' },
    'Barbell Jumps': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Calves', stabilizers: 'Core, Upper Back' },
    
    // LEG EXERCISES - DEADLIFTS
    'Deadlift': { primary: 'Gluteus Maximus, Hamstrings', secondary: 'Erector Spinae, Adductors', stabilizers: 'Core, Traps, Lats, Forearm Flexors' },
    'Trap Bar Deadlift': { primary: 'Gluteus Maximus, Hamstrings, Quadriceps', secondary: 'Erector Spinae, Adductors', stabilizers: 'Core, Traps, Lats, Forearm Flexors' },
    'Romanian Deadlift': { primary: 'Hamstrings, Gluteus Maximus', secondary: 'Erector Spinae, Adductors', stabilizers: 'Core, Lats, Forearms' },
    'Single Leg RDL': { primary: 'Hamstrings, Gluteus Maximus', secondary: 'Erector Spinae, Adductors', stabilizers: 'Core, Lats, Forearms' },
    'Dumbbell Hip Thrust': { primary: 'Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core, Erector Spinae' },
    'Glute Bridge': { primary: 'Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core' },
    'Kettlebell Swing': { primary: 'Gluteus Maximus, Hamstrings', secondary: 'Erector Spinae, Lats', stabilizers: 'Core, Grip' },
    'Snatch Grip Romanian DL': { primary: 'Hamstrings, Gluteus Maximus', secondary: 'Erector Spinae, Adductors', stabilizers: 'Core, Lats, Forearms' },
    'Snatch Grip Deficit RDL': { primary: 'Hamstrings, Gluteus Maximus', secondary: 'Erector Spinae, Adductors', stabilizers: 'Core, Lats, Forearms' },
    'Snatch Pull': { primary: 'Gluteus Maximus, Quadriceps', secondary: 'Hamstrings, Traps, Erector Spinae', stabilizers: 'Core, Lats, Rhomboids' },
    'Rack Pull DL': { primary: 'Gluteus Maximus, Quadriceps', secondary: 'Hamstrings, Traps, Erector Spinae', stabilizers: 'Core, Lats, Rhomboids' },
    'Rack Pull Clean Pull': { primary: 'Gluteus Maximus, Quadriceps', secondary: 'Hamstrings, Traps, Erector Spinae', stabilizers: 'Core, Lats, Rhomboids' },
    'Rack Pull Snatch Pull': { primary: 'Gluteus Maximus, Quadriceps', secondary: 'Hamstrings, Traps, Erector Spinae', stabilizers: 'Core, Lats, Rhomboids' },
    'Lying Leg Curl': { primary: 'Hamstrings', secondary: 'Glutes', stabilizers: 'Core, Calves' },
    'Nordic Curl': { primary: 'Hamstrings', secondary: 'Glutes', stabilizers: 'Core, Calves' },
    'Glute Ham Raise': { primary: 'Hamstrings', secondary: 'Glutes', stabilizers: 'Core, Calves' },
    'Back Extensions': { primary: 'Erector Spinae', secondary: 'Glutes, Hamstrings', stabilizers: 'Core, Upper Back' },
    'Back Extensions (Dumbbells)': { primary: 'Erector Spinae', secondary: 'Glutes, Hamstrings', stabilizers: 'Core, Upper Back' },
    'Back Extensions (Plate)': { primary: 'Erector Spinae', secondary: 'Glutes, Hamstrings', stabilizers: 'Core, Upper Back' },
    'Back Extensions Snatch Grip': { primary: 'Erector Spinae', secondary: 'Glutes, Hamstrings', stabilizers: 'Core, Upper Back' },
    'Single Leg Back Extensions': { primary: 'Erector Spinae', secondary: 'Glutes, Hamstrings', stabilizers: 'Core, Upper Back' },
    'Good Morning': { primary: 'Erector Spinae', secondary: 'Glutes, Hamstrings', stabilizers: 'Core, Upper Back' },
    'Seated Good Mornings': { primary: 'Erector Spinae', secondary: 'Glutes, Hamstrings', stabilizers: 'Core, Upper Back' },
    'Russian Twists': { primary: 'Obliques, Rectus Abdominis', secondary: 'Hip Flexors, Erector Spinae', stabilizers: 'Core, Transverse Abdominis' },
    'Hanging Knee Raise': { primary: 'Rectus Abdominis, Hip Flexors', secondary: 'Obliques', stabilizers: 'Forearms, Latissimus Dorsi, Core' },
    'Hanging Leg Raise': { primary: 'Rectus Abdominis, Hip Flexors', secondary: 'Obliques, Adductors', stabilizers: 'Forearms, Latissimus Dorsi, Core' },
    'Single-Arm Dumbbell Row': { primary: 'Latissimus Dorsi', secondary: 'Rhomboids, Trapezius, Rear Deltoids, Biceps', stabilizers: 'Core, Rotator Cuff, Obliques' },
    'TRX Face Pull': { primary: 'Rear Deltoids', secondary: 'Rhomboids, Middle Trapezius, External Rotators', stabilizers: 'Core, Rotator Cuff, Biceps' },
    'Reverse Hyperextensions': { primary: 'Erector Spinae', secondary: 'Glutes, Hamstrings', stabilizers: 'Core, Upper Back' },
    'Calf Raises': { primary: 'Gastrocnemius, Soleus', secondary: 'Tibialis Posterior', stabilizers: 'Core, Ankle Stabilizers' },
    
    // ARM EXERCISES
    'Chin Up': { primary: 'Biceps Brachii, Lats', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Scapular Stabilizers' },
    'Close Grip Chin Up': { primary: 'Biceps Brachii, Lats', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Scapular Stabilizers' },
    'Incline Dumbbell Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Barbell Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Dumbbell Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Hammer Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Anatoly Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Preacher Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Zottman Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Concentration Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Drag Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Supinated Close Grip Lat Pulldown': { primary: 'Biceps Brachii, Lats', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Scapular Stabilizers' },
    'Cable Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Single-Arm Cable Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'High Cable Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Machine Preacher Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Machine Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Close-Grip Bench Press': { primary: 'Triceps Brachii', secondary: 'Chest, Anterior Deltoids', stabilizers: 'Core, Upper Back' },
    'Close-Grip Bench Press': { primary: 'Triceps Brachii', secondary: 'Chest, Anterior Deltoids', stabilizers: 'Core, Upper Back' },
    'Weighted V Dips': { primary: 'Triceps Brachii', secondary: 'Chest, Anterior Deltoids', stabilizers: 'Core, Upper Back' },
    'Skull Crushers EZ-Bar': { primary: 'Triceps Brachii', secondary: 'Anterior Deltoids', stabilizers: 'Core, Shoulders' },
    'Skull Crushers DB': { primary: 'Triceps Brachii', secondary: 'Anterior Deltoids', stabilizers: 'Core, Shoulders' },
    'Dumbbell Kickbacks': { primary: 'Triceps Brachii', secondary: 'Anterior Deltoids', stabilizers: 'Core, Shoulders' },
    'Cable Triceps Pushdown': { primary: 'Triceps Brachii', secondary: 'Anterior Deltoids', stabilizers: 'Core, Shoulders' },
    'Diamond Push-Ups': { primary: 'Triceps Brachii', secondary: 'Anterior Deltoids', stabilizers: 'Core, Shoulders' },
    'Low Incline Dumbbell Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    'Overhead Rope Extension': { primary: 'Triceps Brachii', secondary: 'Anterior Deltoids', stabilizers: 'Core, Shoulders' },
    'Scott EZ Bar Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis', stabilizers: 'Core, Forearms' },
    
    // FOREARM/GRIP
    'Wrist Curl': { primary: 'Forearm Flexors', secondary: 'Brachioradialis', stabilizers: 'Wrist Stabilizers' },
    'Reverse Wrist Curl': { primary: 'Forearm Extensors', secondary: 'Brachioradialis', stabilizers: 'Wrist Stabilizers' },
    'Reverse Curl': { primary: 'Forearm Extensors', secondary: 'Brachioradialis', stabilizers: 'Wrist Stabilizers' },
    'Plate Pinch Holds': { primary: 'Forearm Flexors', secondary: 'Brachioradialis', stabilizers: 'Wrist Stabilizers' },
    'DB Pinch Holds': { primary: 'Forearm Flexors', secondary: 'Brachioradialis', stabilizers: 'Wrist Stabilizers' },
    'FatGrip Curls': { primary: 'Forearm Flexors', secondary: 'Brachioradialis', stabilizers: 'Wrist Stabilizers' },
    'Gripper Machine': { primary: 'Forearm Flexors', secondary: 'Brachioradialis', stabilizers: 'Wrist Stabilizers' },
    'Grippers': { primary: 'Forearm Flexors', secondary: 'Brachioradialis', stabilizers: 'Wrist Stabilizers' },
    
    // POWER EXERCISES
    'Power Clean': { primary: 'Quadriceps, Gluteus Maximus, Trapezius', secondary: 'Hamstrings, Deltoids, Upper Back', stabilizers: 'Core, Erector Spinae, Forearms' },
    'Power Clean from Hang': { primary: 'Hamstrings, Gluteus Maximus, Trapezius', secondary: 'Quadriceps, Deltoids, Upper Back', stabilizers: 'Core, Erector Spinae, Forearms' },
    'Power Clean + Front Squat (1+1)': { primary: 'Quadriceps, Gluteus Maximus, Trapezius', secondary: 'Hamstrings, Deltoids, Upper Back', stabilizers: 'Core, Erector Spinae, Forearms' },
    'Power Clean from Block': { primary: 'Quadriceps, Gluteus Maximus, Trapezius', secondary: 'Hamstrings, Deltoids, Upper Back', stabilizers: 'Core, Erector Spinae, Forearms' },
    'Halting Pull + Power Clean (1+1)': { primary: 'Hamstrings, Gluteus Maximus, Trapezius', secondary: 'Quadriceps, Erector Spinae, Upper Back', stabilizers: 'Core, Forearms, Deltoids' },
    'Clean Pull': { primary: 'Hamstrings, Gluteus Maximus, Trapezius', secondary: 'Quadriceps, Erector Spinae', stabilizers: 'Core, Forearms, Upper Back' },
    'Clean Pull from Hang': { primary: 'Hamstrings, Gluteus Maximus, Trapezius', secondary: 'Erector Spinae, Quadriceps', stabilizers: 'Core, Forearms, Upper Back' },
    'Halting Pull + Clean Pull (2+1)': { primary: 'Hamstrings, Gluteus Maximus, Trapezius', secondary: 'Quadriceps, Erector Spinae', stabilizers: 'Core, Forearms, Upper Back' },
    'Clean Pull from Block': { primary: 'Hamstrings, Gluteus Maximus, Trapezius', secondary: 'Quadriceps, Erector Spinae', stabilizers: 'Core, Forearms, Upper Back' },
    'Stiff-Leg Deadlift (Concentric)': { primary: 'Hamstrings, Gluteus Maximus', secondary: 'Erector Spinae, Adductors', stabilizers: 'Core, Lats, Forearms' },
    'Power Snatch': { primary: 'Quadriceps, Gluteus Maximus, Deltoids, Trapezius', secondary: 'Hamstrings, Triceps, Upper Back', stabilizers: 'Core, Erector Spinae, Forearms, Rotator Cuff' },
    'Power Snatch from Hang': { primary: 'Hamstrings, Gluteus Maximus, Deltoids, Trapezius', secondary: 'Quadriceps, Triceps, Upper Back', stabilizers: 'Core, Erector Spinae, Forearms, Rotator Cuff' },
    'Power Snatch from Block': { primary: 'Quadriceps, Gluteus Maximus, Deltoids, Trapezius', secondary: 'Hamstrings, Triceps, Upper Back', stabilizers: 'Core, Erector Spinae, Forearms, Rotator Cuff' },
    'Snatch High Pull from Hang': { primary: 'Hamstrings, Trapezius, Deltoids', secondary: 'Gluteus Maximus, Upper Back', stabilizers: 'Core, Forearms, Erector Spinae' },
    'Snatch High Pull from Blocks': { primary: 'Hamstrings, Trapezius, Deltoids', secondary: 'Gluteus Maximus, Upper Back', stabilizers: 'Core, Forearms, Erector Spinae' },
    'Snatch Pull': { primary: 'Hamstrings, Gluteus Maximus, Trapezius', secondary: 'Quadriceps, Erector Spinae', stabilizers: 'Core, Forearms, Upper Back' },
    'Snatch Pull from Blocks': { primary: 'Hamstrings, Gluteus Maximus, Trapezius', secondary: 'Quadriceps, Erector Spinae', stabilizers: 'Core, Forearms, Upper Back' },
    'Pin Front Squat': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core, Erector Spinae, Upper Back' },
    'VMO Front Squat': { primary: 'Vastus Medialis Oblique (VMO), Quadriceps', secondary: 'Gluteus Maximus, Hamstrings', stabilizers: 'Core, Erector Spinae, Upper Back' },
    'Back Squat + Front Squat (1+1)': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core, Erector Spinae, Upper Back' },
    'Front Squat (1+1)': { primary: 'Quadriceps', secondary: 'Gluteus Maximus, Adductors', stabilizers: 'Core, Upper Back, Erector Spinae' },
    'Pin Back Squat': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core, Erector Spinae, Upper Back' },
    'Squat Jumps': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Calves', stabilizers: 'Core, Hip Stabilizers' },
    'VMO Back Squat': { primary: 'Vastus Medialis Oblique (VMO), Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Adductors', stabilizers: 'Core, Erector Spinae, Upper Back' },
    'Box Jumps': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Calves', stabilizers: 'Core, Hip Stabilizers, Ankle Stabilizers' },
    'Depth to Box Jumps': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Calves', stabilizers: 'Core, Hip Stabilizers, Ankle Stabilizers' },
    'Stiff-Leg Depth Jump': { primary: 'Calves, Quadriceps', secondary: 'Hamstrings, Gluteus Maximus', stabilizers: 'Ankle Stabilizers, Core' },
    'Pogo Jumps': { primary: 'Calves, Quadriceps', secondary: 'Hamstrings', stabilizers: 'Ankle Stabilizers, Core' },
    'Seated Box Jumps': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Calves', stabilizers: 'Core, Hip Stabilizers' },
    'Hurdles Jumps': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Calves, Hip Flexors', stabilizers: 'Core, Hip Stabilizers, Ankle Stabilizers' },
    'Hurdle Jump to Box': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Calves, Hip Flexors', stabilizers: 'Core, Hip Stabilizers, Ankle Stabilizers' },
    'Sled Sprints': { primary: 'Quadriceps, Gluteus Maximus, Hamstrings', secondary: 'Calves, Hip Flexors', stabilizers: 'Core, Erector Spinae' },
    'Medicine Ball Slam': { primary: 'Pectoralis Major, Deltoids, Latissimus Dorsi', secondary: 'Triceps, Core, Serratus Anterior', stabilizers: 'Rotator Cuff, Obliques, Erector Spinae' },
    'Overhead Medicine Ball Slam': { primary: 'Deltoids, Latissimus Dorsi, Core', secondary: 'Triceps, Serratus Anterior, Erector Spinae', stabilizers: 'Rotator Cuff, Obliques, Gluteus Maximus' },
    'Plyometric Push-Ups': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Core, Serratus Anterior, Rotator Cuff' },
    'Speed Bench Press': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Rotator Cuff, Core, Scapular Stabilizers' },
    'Barbell High Pull': { primary: 'Trapezius, Deltoids', secondary: 'Rhomboids, Biceps', stabilizers: 'Core, Erector Spinae, Forearms' },
    'Medicine Ball Chest Pass': { primary: 'Pectoralis Major, Deltoids', secondary: 'Triceps, Serratus Anterior', stabilizers: 'Core, Rotator Cuff' },
    'Explosive Pull-Ups': { primary: 'Latissimus Dorsi', secondary: 'Biceps, Rhomboids, Trapezius', stabilizers: 'Core, Forearms, Rear Deltoids' },
    'SPEED CLOSE GRIP BENCH': { primary: 'Triceps, Pectoralis Major', secondary: 'Anterior Deltoids', stabilizers: 'Rotator Cuff, Core, Scapular Stabilizers' },
    'Landmine Press (Explosive)': { primary: 'Anterior Deltoids, Pectoralis Major', secondary: 'Triceps, Core', stabilizers: 'Obliques, Serratus Anterior, Rotator Cuff' },
    'Explosive Close Grip Chin-Ups': { primary: 'Latissimus Dorsi, Biceps', secondary: 'Rhomboids, Trapezius', stabilizers: 'Core, Forearms, Rear Deltoids' },
    'Dumbbell Speed Bench': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Rotator Cuff, Core, Scapular Stabilizers' },
    'Kettlebell Clean & Press': { primary: 'Deltoids, Quadriceps, Gluteus Maximus', secondary: 'Trapezius, Triceps, Hamstrings', stabilizers: 'Core, Forearms, Erector Spinae, Rotator Cuff' },
    'Trap Bar Jumps': { primary: 'Quadriceps, Gluteus Maximus', secondary: 'Hamstrings, Calves, Trapezius', stabilizers: 'Core, Erector Spinae, Forearms' },
    'Power Clean + Overhead Press': { primary: 'Quadriceps, Gluteus Maximus, Deltoids, Trapezius', secondary: 'Hamstrings, Triceps, Upper Back', stabilizers: 'Core, Erector Spinae, Forearms, Rotator Cuff' },
    'Explosive Close Grip Bench Press': { primary: 'Triceps, Pectoralis Major', secondary: 'Anterior Deltoids', stabilizers: 'Rotator Cuff, Core, Scapular Stabilizers' },
    'Band-Resisted Push-Ups': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Core, Serratus Anterior, Glutes' },
    'Explosive Bench Press': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Rotator Cuff, Core, Scapular Stabilizers' },
    'Explosive Trap Bar Push-Ups': { primary: 'Pectoralis Major', secondary: 'Triceps, Anterior Deltoids', stabilizers: 'Core, Serratus Anterior, Scapular Stabilizers, Forearms' },
    'Snatch-Grip Trap Pull': { primary: 'Trapezius, Deltoids, Upper Back', secondary: 'Rhomboids, Biceps, Erector Spinae', stabilizers: 'Core, Forearms, Rotator Cuff' },
    'Concept2 Rower Sprints': { primary: 'Quadriceps, Latissimus Dorsi, Gluteus Maximus', secondary: 'Hamstrings, Biceps, Erector Spinae, Deltoids', stabilizers: 'Core, Forearms, Calves' },
    'Explosive Barbell Curl': { primary: 'Biceps Brachii', secondary: 'Brachialis, Brachioradialis, Anterior Deltoids', stabilizers: 'Core, Forearms' },
    'DB Clean & Press': { primary: 'Deltoids, Quadriceps, Gluteus Maximus', secondary: 'Trapezius, Triceps, Hamstrings', stabilizers: 'Core, Forearms, Erector Spinae, Rotator Cuff' },
    'Seated Dumbbell External Rotation': { primary: 'Rotator Cuff', secondary: 'Posterior Deltoid', stabilizers: 'Scapular Stabilizers, Core' }
  };

  // Exercise Database with main/secondary classification
  const exerciseDatabase = {
    'build-muscle': {
      'full-gym': {
        'chest-back': {
          chest: {
            main: ['Bench Press', 'Chest Press', 'Incline Dumbbell Press', 'Plate-Loaded Chest Press'],
            secondary: ['Push-ups', 'Neutral Grip Trapbar Push-ups', 'Decline Push-up', 'Weighted Push-up', 'Cable Flies', 'Dumbbell Chest Fly', 'Incline Dumbbell Fly', 'Seated Chest Fly', 'Chest Dips']
          },
          back: {
            main: ['Pull-ups', 'Pull-ups Neutral Grip', 'Lat Pulldown', 'T-Bar Row', 'Pendlay Row', 'Trap Pulls'],
            secondary: ['Barbell Row', 'Chest-Supported Row', 'One-Arm Dumbbell Row', 'Inverted Row', 'Cable Row', 'Face Pulls', 'Rear Delt Flys', 'Band Pull-Aparts', 'Y-T-W Raises']
          }
        },
        'legs': {
          quads: {
            main: ['Back Squat', 'Back Squat Heel Elevated', 'Low Bar Back Squat', 'Box Back Squat', 'Pin Back Squat', 'Eccentric Back Squat', 'Front Squat', 'Front Squat Heel Elevated', 'Box Front Squat', 'Pin Front Squat', 'Eccentric Front Squat', 'Belt Squat', 'Sled Push'],
            secondary: ['Bulgarian Squat w Dumbbells', 'Bulgarian Squat w Kettlebells', 'Bulgarian Back Squat', 'Bulgarian Front Squat', 'Dumbbell Lunges', 'Leg Press', 'Leg Extension', 'Calf Raises']
          },
          hamstrings: {
            main: ['Deadlift', 'Trap Bar Deadlift', 'Snatch Grip Romanian DL', 'Snatch Grip Deficit RDL', 'Snatch Pull', 'Rack Pull DL', 'Rack Pull Clean Pull', 'Rack Pull Snatch Pull', 'Lying Leg Curl', 'Nordic Curl', 'Glute Ham Raise'],
            secondary: ['Romanian Deadlift', 'Single Leg RDL', 'Back Extensions', 'Back Extensions Snatch Grip', 'Single Leg Back Extensions', 'Good Morning', 'Reverse Hyperextensions']
          }
        },
        'arms': {
          biceps: {
            main: ['Chin Up', 'Close Grip Chin Up', 'Incline Dumbbell Curl', 'Barbell Curl', 'Preacher Curl', 'Supinated Close Grip Lat Pulldown', 'Machine Preacher Curl'],
            secondary: ['Dumbbell Curl', 'Hammer Curl', 'Anatoly Curl', 'Zottman Curl', 'Concentration Curl', 'Drag Curl', 'Cable Curl', 'Single-Arm Cable Curl', 'High Cable Curl', 'Machine Curl', 'Low Incline Dumbbell Curl']
          },
          triceps: {
            main: ['Close-Grip Bench Press', 'Weighted V Dips'],
            secondary: ['Skull Crushers EZ-Bar', 'Skull Crushers DB', 'Dumbbell Kickbacks', 'Cable Triceps Pushdown', 'Diamond Push-Ups', 'Overhead Rope Extension']
          },
          shoulders: {
            main: ['Barbell Overhead Press', 'Landmine Press', 'Behind-the-Neck Overhead Press (Seated)', 'Behind-the-Neck Overhead Press (Standing)', 'Behind-the-Neck Snatch-Grip Press'],
            secondary: ['Dumbbell Shoulder Press', 'Arnold Press', 'Poliquin Raise', 'Leaning Lateral Raise', 'Bent-Over Dumbbell Rear Delt Raise', 'Chest-Supported Rear Delt Raise', 'External Rotation (Cable/Band)', 'External Rotation Dumbbell (Seated)', 'Internal Rotation (Cable/Band)']
          }
        },
        'full-body': {
          main: ['Back Squat', 'Deadlift', 'Bench Press', 'Pull-ups', 'Front Squat', 'Barbell Overhead Press'],
          secondary: ['Romanian Deadlift', 'Bulgarian Squat w Dumbbells', 'One-Arm Dumbbell Row', 'Barbell Row', 'Push-ups', 'Leg Press', 'Dumbbell Shoulder Press']
        },
        'upper-body': {
          main: ['Bench Press', 'Pull-ups', 'Lat Pulldown', 'Barbell Overhead Press'],
          secondary: ['Incline Dumbbell Press', 'Cable Flies', 'One-Arm Dumbbell Row', 'Barbell Row', 'Face Pulls', 'Cable Row', 'Chest Dips', 'Dumbbell Shoulder Press', 'Arnold Press', 'Leaning Lateral Raise']
        }
      },
      'barbells-only': {
        'chest-back': {
          chest: { main: ['Bench Press'], secondary: ['Close-Grip Bench Press'] },
          back: { main: ['Barbell Row', 'Pendlay Row', 'T-Bar Row', 'Trap Pulls'], secondary: ['Inverted Row'] }
        },
        'legs': {
          quads: { main: ['Back Squat', 'Back Squat Heel Elevated', 'Low Bar Back Squat', 'Box Back Squat', 'Pin Back Squat', 'Eccentric Back Squat', 'Front Squat', 'Front Squat Heel Elevated', 'Box Front Squat', 'Pin Front Squat', 'Eccentric Front Squat'], secondary: ['Bulgarian Back Squat', 'Bulgarian Front Squat', 'Dumbbell Lunges', 'Calf Raises'] },
          hamstrings: { main: ['Deadlift', 'Snatch Pull', 'Rack Pull DL', 'Rack Pull Clean Pull', 'Rack Pull Snatch Pull'], secondary: ['Romanian Deadlift', 'Snatch Grip Romanian DL', 'Snatch Grip Deficit RDL', 'Good Morning', 'Back Extensions', 'Back Extensions Snatch Grip'] }
        },
        'arms': {
          biceps: { main: ['Barbell Curl', 'Preacher Curl'], secondary: ['Drag Curl', 'Reverse Curl'] },
          triceps: { main: ['Close-Grip Bench Press'], secondary: ['Skull Crushers EZ-Bar'] },
          shoulders: { main: ['Barbell Overhead Press', 'Behind-the-Neck Overhead Press (Seated)', 'Behind-the-Neck Overhead Press (Standing)', 'Behind-the-Neck Snatch-Grip Press'], secondary: [] }
        },
        'full-body': { main: ['Back Squat', 'Deadlift', 'Bench Press', 'Front Squat', 'Barbell Overhead Press'], secondary: ['Romanian Deadlift', 'Barbell Row', 'Dumbbell Lunges'] },
        'upper-body': { main: ['Bench Press', 'Barbell Row', 'Barbell Overhead Press'], secondary: ['Pendlay Row', 'Close-Grip Bench Press'] }
      },
      'dumbbells-only': {
        'chest-back': {
          chest: { main: ['Incline Dumbbell Press', 'Chest Press', 'Plate-Loaded Chest Press'], secondary: ['Dumbbell Chest Fly', 'Incline Dumbbell Fly'] },
          back: { main: ['T-Bar Row'], secondary: ['One-Arm Dumbbell Row', 'Chest-Supported Row', 'Rear Delt Flys'] }
        },
        'legs': {
          quads: { main: ['Bulgarian Squat w Dumbbells', 'Bulgarian Squat w Kettlebells'], secondary: ['Dumbbell Lunges', 'Goblet Squat', 'Calf Raises'] },
          hamstrings: { main: ['Romanian Deadlift', 'Single Leg RDL'], secondary: ['Dumbbell Hip Thrust', 'Glute Bridge', 'Kettlebell Swing'] }
        },
        'arms': {
          biceps: { main: ['Incline Dumbbell Curl', 'Preacher Curl', 'Machine Preacher Curl'], secondary: ['Dumbbell Curl', 'Hammer Curl', 'Anatoly Curl', 'Zottman Curl', 'Concentration Curl', 'DB Pinch Holds'] },
          triceps: { main: ['Skull Crushers DB'], secondary: ['Dumbbell Kickbacks', 'Diamond Push-Ups'] },
          shoulders: { main: ['Dumbbell Shoulder Press', 'Arnold Press'], secondary: ['Poliquin Raise', 'Leaning Lateral Raise', 'Bent-Over Dumbbell Rear Delt Raise', 'External Rotation Dumbbell (Seated)'] }
        },
        'full-body': { main: ['Romanian Deadlift', 'Incline Dumbbell Press', 'Dumbbell Shoulder Press'], secondary: ['Bulgarian Squat w Dumbbells', 'One-Arm Dumbbell Row', 'Dumbbell Lunges'] },
        'upper-body': { main: ['Incline Dumbbell Press', 'Dumbbell Shoulder Press'], secondary: ['Dumbbell Chest Fly', 'One-Arm Dumbbell Row', 'Rear Delt Flys', 'Arnold Press', 'Leaning Lateral Raise'] }
      },
      'no-equipment': {
        'full-body': ['Push-ups', 'Bodyweight Squat', 'Pike Push-up', 'Lunge', 'Plank', 'Burpee', 'Mountain Climbers', 'Jump Squat'],
        'upper-body': ['Push-ups', 'Pike Push-up', 'Diamond Push-up', 'Decline Push-up', 'Plank', 'Superman', 'Tricep Dips', 'Wide Push-up'],
        'chest-back': ['Push-ups', 'Wide Push-up', 'Diamond Push-up', 'Pike Push-up', 'Superman', 'Plank Row', 'Pseudo Planche Push-up', 'Back Extensions'],
        'legs': ['Bodyweight Squat', 'Lunge', 'Bulgarian Split Squat', 'Jump Squat', 'Single Leg Deadlift', 'Glute Bridge', 'Wall Sit', 'Calf Raises'],
        'arms': ['Diamond Push-up', 'Tricep Dips', 'Pike Push-up', 'Decline Push-up', 'Plank Up-Down', 'Close-Grip Push-up', 'Bodyweight Curl', 'Arm Circles']
      }
    },
    'strength': {
      'full-gym': {
        'chest-back': {
          chest: { main: ['Bench Press', 'Chest Press', 'Incline Dumbbell Press', 'Plate-Loaded Chest Press'], secondary: ['Weighted Push-up', 'Chest Dips'] },
          back: { main: ['Pull-ups', 'Pull-ups Neutral Grip', 'Lat Pulldown', 'T-Bar Row', 'Pendlay Row', 'Trap Pulls'], secondary: ['One-Arm Dumbbell Row', 'Barbell Row', 'Chest-Supported Row', 'Cable Row'] }
        },
        'legs': {
          quads: { main: ['Back Squat', 'Back Squat Heel Elevated', 'Low Bar Back Squat', 'Box Back Squat', 'Pin Back Squat', 'Front Squat', 'Front Squat Heel Elevated', 'Box Front Squat', 'Pin Front Squat', 'Belt Squat', 'Sled Push'], secondary: ['Bulgarian Squat w Dumbbells', 'Leg Press', 'Leg Extension', 'Dumbbell Lunges', 'Calf Raises'] },
          hamstrings: { main: ['Deadlift', 'Trap Bar Deadlift', 'Rack Pull DL', 'Lying Leg Curl', 'Nordic Curl'], secondary: ['Romanian Deadlift', 'Single Leg RDL', 'Back Extensions'] }
        },
        'arms': {
          biceps: { main: ['Chin Up', 'Close Grip Chin Up', 'Barbell Curl', 'Supinated Close Grip Lat Pulldown'], secondary: ['Dumbbell Curl', 'Hammer Curl', 'Preacher Curl', 'Scott EZ Bar Curl'] },
          triceps: { main: ['Close-Grip Bench Press', 'Weighted V Dips'], secondary: ['Skull Crushers EZ-Bar', 'Cable Triceps Pushdown'] },
          shoulders: { main: ['Barbell Overhead Press', 'Behind-the-Neck Overhead Press (Seated)', 'Behind-the-Neck Overhead Press (Standing)', 'Behind-the-Neck Snatch-Grip Press'], secondary: ['Dumbbell Shoulder Press', 'Landmine Press', 'Arnold Press'] }
        },
        'full-body': { main: ['Back Squat', 'Deadlift', 'Bench Press', 'Pull-ups', 'Front Squat', 'Barbell Overhead Press'], secondary: ['Romanian Deadlift', 'One-Arm Dumbbell Row', 'Barbell Row', 'Dumbbell Lunges'] },
        'upper-body': { main: ['Bench Press', 'Pull-ups', 'Lat Pulldown', 'Barbell Overhead Press'], secondary: ['One-Arm Dumbbell Row', 'Barbell Row', 'Chest Dips', 'Face Pulls', 'Dumbbell Shoulder Press'] }
      },
      'barbells-only': {
        'chest-back': { chest: { main: ['Bench Press'], secondary: ['Close-Grip Bench Press'] }, back: { main: ['Barbell Row', 'Pendlay Row', 'T-Bar Row', 'Trap Pulls'], secondary: [] } },
        'legs': { quads: { main: ['Back Squat', 'Low Bar Back Squat', 'Box Back Squat', 'Front Squat'], secondary: ['Bulgarian Back Squat', 'Bulgarian Front Squat', 'Dumbbell Lunges', 'Calf Raises'] }, hamstrings: { main: ['Deadlift', 'Rack Pull DL'], secondary: ['Romanian Deadlift', 'Good Morning'] } },
        'arms': { biceps: { main: ['Barbell Curl'], secondary: ['Reverse Curl'] }, triceps: { main: ['Close-Grip Bench Press'], secondary: ['Skull Crushers EZ-Bar'] }, shoulders: { main: ['Barbell Overhead Press', 'Behind-the-Neck Overhead Press (Seated)', 'Behind-the-Neck Overhead Press (Standing)', 'Behind-the-Neck Snatch-Grip Press'], secondary: [] } },
        'full-body': { main: ['Back Squat', 'Deadlift', 'Bench Press', 'Front Squat', 'Barbell Overhead Press'], secondary: ['Romanian Deadlift', 'Barbell Row', 'Dumbbell Lunges'] },
        'upper-body': { main: ['Bench Press', 'Barbell Row', 'Barbell Overhead Press'], secondary: ['Pendlay Row', 'Close-Grip Bench Press'] }
      },
      'dumbbells-only': {
        'chest-back': { chest: { main: ['Incline Dumbbell Press', 'Chest Press'], secondary: ['Chest Dips'] }, back: { main: ['T-Bar Row'], secondary: ['One-Arm Dumbbell Row', 'Chest-Supported Row'] } },
        'legs': { quads: { main: ['Bulgarian Squat w Dumbbells'], secondary: ['Dumbbell Lunges', 'Goblet Squat', 'Calf Raises'] }, hamstrings: { main: ['Romanian Deadlift'], secondary: ['Single Leg RDL', 'Dumbbell Hip Thrust'] } },
        'arms': { biceps: { main: ['Incline Dumbbell Curl'], secondary: ['Dumbbell Curl', 'Hammer Curl'] }, triceps: { main: ['Skull Crushers DB'], secondary: ['Dumbbell Kickbacks'] }, shoulders: { main: ['Dumbbell Shoulder Press', 'Arnold Press'], secondary: ['Poliquin Raise', 'Leaning Lateral Raise'] } },
        'full-body': { main: ['Romanian Deadlift', 'Incline Dumbbell Press', 'Dumbbell Shoulder Press'], secondary: ['Bulgarian Squat w Dumbbells', 'One-Arm Dumbbell Row'] },
        'upper-body': { main: ['Incline Dumbbell Press', 'Dumbbell Shoulder Press'], secondary: ['One-Arm Dumbbell Row', 'Chest Dips', 'Arnold Press'] }
      },
      'no-equipment': {
        'full-body': ['Pistol Squat', 'Pseudo Planche Push-up', 'One-Arm Push-up', 'Bulgarian Split Squat', 'Handstand Push-up', 'Dragon Flag', 'Archer Push-up', 'Shrimp Squat'],
        'upper-body': ['One-Arm Push-up', 'Planche Lean', 'Archer Push-up', 'Handstand Hold', 'L-Sit', 'Front Lever', 'Typewriter Push-up', 'Pseudo Planche'],
        'chest-back': ['One-Arm Push-up', 'Pseudo Planche', 'Archer Push-up', 'Front Lever', 'Back Lever', 'Superman Hold', 'Planche Lean', 'Explosive Push-up'],
        'legs': ['Pistol Squat', 'Bulgarian Split Squat', 'Single Leg RDL', 'Shrimp Squat', 'Deep Step-up', 'Sissy Squat', 'Jump Squat'],
        'arms': ['Typewriter Pull-up', 'Diamond Push-up', 'Tricep Extension', 'L-Sit', 'Plank Up-Down', 'Decline Push-up', 'Narrow Push-up', 'Dips']
      }
    },
    'fat-loss': {
      'full-gym': {
        'chest-back': { 
          plyometric: ['Overhead Medicine Ball Slam'],
          mainPowerLift: ['Dumbbell Speed Bench', 'Explosive Close Grip Chin-Ups', 'Plyometric Push-Ups', 'Explosive Pull-Ups', 'Band-Resisted Push-Ups', 'Explosive Bench Press', 'Explosive Trap Bar Push-Ups', 'Snatch-Grip Trap Pull', 'Concept2 Rower Sprints'],
          speedStrength: ['Dumbbell Speed Bench', 'Explosive Close Grip Bench Press', 'Explosive Close Grip Chin-Ups', 'Plyometric Push-Ups', 'Explosive Pull-Ups', 'Band-Resisted Push-Ups', 'Explosive Bench Press', 'Explosive Trap Bar Push-Ups', 'Snatch-Grip Trap Pull', 'Single-Arm Dumbbell Row', 'TRX Face Pull'],
          posteriorAccessory: ['Back Extensions (Dumbbells)', 'Back Extensions (Plate)', 'Back Extensions Snatch Grip', 'Seated Good Mornings', 'Reverse Hyperextensions']
        },
        'legs': { 
          plyometric: ['Box Jumps', 'Depth to Box Jumps', 'Stiff-Leg Depth Jump', 'Pogo Jumps', 'Seated Box Jumps', 'Hurdle Jump to Box'],
          mainPowerLift: ['Power Clean from Hang', 'Power Clean + Front Squat (1+1)', 'Power Clean from Block', 'Halting Pull + Power Clean (1+1)', 'Power Snatch', 'Power Snatch from Hang', 'Power Snatch from Block', 'Snatch High Pull from Hang', 'Snatch High Pull from Blocks', 'Squat Jumps', 'Sled Sprints'],
          speedStrength: ['Clean Pull', 'Stiff-Leg Deadlift (Concentric)', 'Halting Pull + Clean Pull (2+1)', 'Clean Pull from Block', 'Trap Bar Deadlift', 'Sled Push', 'Pin Front Squat', 'Front Squat', 'Front Squat (1+1)', 'Back Squat + Front Squat (1+1)', 'Front Squat Heel Elevated', 'Back Squat', 'Pin Back Squat', 'Back Squat Heel Elevated', 'Snatch Pull', 'Snatch Pull from Blocks'],
          posteriorAccessory: ['Back Extensions (Dumbbells)', 'Back Extensions (Plate)', 'Back Extensions Snatch Grip', 'Good Morning', 'Reverse Hyperextensions']
        },
        'arms': { 
          plyometric: ['Overhead Medicine Ball Slam'],
          mainPowerLift: ['Explosive Close Grip Bench Press', 'Landmine Press (Explosive)', 'Explosive Close Grip Chin-Ups', 'Explosive Pull-Ups', 'Explosive Barbell Curl', 'Kettlebell Clean & Press', 'DB Clean & Press'],
          speedStrength: ['Explosive Close Grip Bench Press', 'Landmine Press (Explosive)', 'Explosive Close Grip Chin-Ups', 'Explosive Pull-Ups', 'Explosive Barbell Curl', 'Kettlebell Clean & Press', 'DB Clean & Press'],
          posteriorAccessory: ['Seated Dumbbell External Rotation', 'External Rotation (Cable/Band)', 'Internal Rotation (Cable/Band)']
        },
        'full-body': { 
          plyometric: ['Box Jumps', 'Depth to Box Jumps', 'Stiff-Leg Depth Jump', 'Pogo Jumps', 'Seated Box Jumps', 'Overhead Medicine Ball Slam'],
          mainPowerLift: ['Power Clean', 'Power Clean from Hang', 'Power Clean + Front Squat (1+1)', 'Power Clean from Block', 'Halting Pull + Power Clean (1+1)', 'Power Snatch', 'Power Snatch from Hang', 'Power Snatch from Block', 'Snatch High Pull from Hang', 'Snatch High Pull from Blocks', 'Squat Jumps', 'Sled Sprints', 'Power Clean + Overhead Press', 'Trap Bar Jumps'],
          speedStrength: ['Dumbbell Speed Bench', 'Explosive Close Grip Bench Press', 'Explosive Close Grip Chin-Ups', 'Plyometric Push-Ups', 'Sled Push', 'Clean Pull', 'Stiff-Leg Deadlift (Concentric)', 'Landmine Press (Explosive)', 'Halting Pull + Clean Pull (2+1)', 'Clean Pull from Block', 'Pin Front Squat', 'Front Squat', 'Front Squat (1+1)', 'Back Squat + Front Squat (1+1)', 'Front Squat Heel Elevated', 'Back Squat', 'Pin Back Squat', 'Back Squat Heel Elevated', 'Snatch Pull', 'Snatch Pull from Blocks', 'Trap Bar Deadlift'],
          posteriorAccessory: ['Back Extensions (Dumbbells)', 'Back Extensions (Plate)', 'Back Extensions Snatch Grip', 'Good Morning', 'Reverse Hyperextensions', 'Seated Good Mornings']
        },
        'upper-body': { 
          plyometric: ['Overhead Medicine Ball Slam'],
          mainPowerLift: ['Dumbbell Speed Bench', 'Explosive Close Grip Bench Press', 'Explosive Close Grip Chin-Ups', 'Plyometric Push-Ups', 'Landmine Press (Explosive)', 'Explosive Pull-Ups', 'Band-Resisted Push-Ups', 'Explosive Bench Press', 'Explosive Trap Bar Push-Ups', 'Snatch-Grip Trap Pull', 'Concept2 Rower Sprints'],
          speedStrength: ['Dumbbell Speed Bench', 'Explosive Close Grip Bench Press', 'Explosive Close Grip Chin-Ups', 'Plyometric Push-Ups', 'Landmine Press (Explosive)', 'Explosive Pull-Ups', 'Band-Resisted Push-Ups', 'Explosive Bench Press', 'Explosive Trap Bar Push-Ups', 'Snatch-Grip Trap Pull', 'Kettlebell Clean & Press'],
          posteriorAccessory: ['Russian Twists', 'Hanging Knee Raise', 'Hanging Leg Raise', 'Seated Good Mornings']
        }
      },
      'barbells-only': {
        'chest-back': { 
          plyometric: ['Overhead Medicine Ball Slam'],
          mainPowerLift: ['Explosive Close Grip Bench Press', 'Plyometric Push-Ups', 'Explosive Pull-Ups', 'Band-Resisted Push-Ups', 'Explosive Bench Press', 'Snatch-Grip Trap Pull'],
          speedStrength: ['Explosive Close Grip Bench Press', 'Plyometric Push-Ups', 'Explosive Pull-Ups', 'Band-Resisted Push-Ups', 'Explosive Bench Press', 'Snatch-Grip Trap Pull'],
          posteriorAccessory: ['Back Extensions (Plate)', 'Back Extensions Snatch Grip', 'Seated Good Mornings', 'Reverse Hyperextensions']
        },
        'legs': { 
          plyometric: ['Box Jumps', 'Depth to Box Jumps', 'Stiff-Leg Depth Jump', 'Pogo Jumps', 'Seated Box Jumps', 'Hurdle Jump to Box'],
          mainPowerLift: ['Power Clean from Hang', 'Power Clean + Front Squat (1+1)', 'Power Clean from Block', 'Halting Pull + Power Clean (1+1)', 'Power Snatch', 'Power Snatch from Hang', 'Power Snatch from Block', 'Snatch High Pull from Hang', 'Snatch High Pull from Blocks', 'Squat Jumps'],
          speedStrength: ['Clean Pull', 'Stiff-Leg Deadlift (Concentric)', 'Halting Pull + Clean Pull (2+1)', 'Clean Pull from Block', 'Pin Front Squat', 'Front Squat', 'Front Squat (1+1)', 'Back Squat + Front Squat (1+1)', 'Front Squat Heel Elevated', 'Back Squat', 'Pin Back Squat', 'Back Squat Heel Elevated', 'Snatch Pull', 'Snatch Pull from Blocks'],
          posteriorAccessory: ['Back Extensions (Plate)', 'Back Extensions Snatch Grip', 'Good Morning', 'Reverse Hyperextensions']
        },
        'arms': { 
          plyometric: ['Overhead Medicine Ball Slam'],
          mainPowerLift: ['Explosive Close Grip Bench Press', 'Landmine Press (Explosive)', 'Explosive Barbell Curl'],
          speedStrength: ['Explosive Close Grip Bench Press', 'Landmine Press (Explosive)', 'Explosive Barbell Curl'],
          posteriorAccessory: ['External Rotation (Cable/Band)', 'Internal Rotation (Cable/Band)']
        },
        'full-body': { 
          plyometric: ['Box Jumps', 'Depth to Box Jumps', 'Stiff-Leg Depth Jump', 'Pogo Jumps', 'Seated Box Jumps', 'Hurdle Jump to Box'],
          mainPowerLift: ['Power Clean', 'Power Clean from Hang', 'Power Clean + Front Squat (1+1)', 'Power Clean from Block', 'Halting Pull + Power Clean (1+1)', 'Power Snatch', 'Power Snatch from Hang', 'Power Snatch from Block', 'Snatch High Pull from Hang', 'Snatch High Pull from Blocks', 'Squat Jumps', 'Power Clean + Overhead Press'],
          speedStrength: ['Explosive Close Grip Bench Press', 'Sled Push', 'Clean Pull', 'Stiff-Leg Deadlift (Concentric)', 'Halting Pull + Clean Pull (2+1)', 'Clean Pull from Block', 'Pin Front Squat', 'Front Squat', 'Front Squat (1+1)', 'Back Squat + Front Squat (1+1)', 'Front Squat Heel Elevated', 'Back Squat', 'Pin Back Squat', 'Back Squat Heel Elevated', 'Snatch Pull', 'Snatch Pull from Blocks'],
          posteriorAccessory: ['Back Extensions (Plate)', 'Back Extensions Snatch Grip', 'Good Morning', 'Reverse Hyperextensions', 'Seated Good Mornings']
        },
        'upper-body': { 
          plyometric: ['Overhead Medicine Ball Slam'],
          mainPowerLift: ['Explosive Close Grip Bench Press', 'Plyometric Push-Ups', 'Explosive Pull-Ups', 'Band-Resisted Push-Ups', 'Explosive Bench Press', 'Snatch-Grip Trap Pull'],
          speedStrength: ['Explosive Close Grip Bench Press', 'Plyometric Push-Ups', 'Explosive Pull-Ups', 'Band-Resisted Push-Ups', 'Explosive Bench Press', 'Snatch-Grip Trap Pull'],
          posteriorAccessory: ['Russian Twists', 'Hanging Knee Raise', 'Hanging Leg Raise', 'Seated Good Mornings']
        }
      },
      'dumbbells-only': {
        'chest-back': { 
          plyometric: ['Overhead Medicine Ball Slam'],
          mainPowerLift: ['Dumbbell Speed Bench', 'Plyometric Push-Ups', 'Band-Resisted Push-Ups', 'Single-Arm Dumbbell Row'],
          speedStrength: ['Dumbbell Speed Bench', 'Plyometric Push-Ups', 'Band-Resisted Push-Ups', 'Single-Arm Dumbbell Row', 'TRX Face Pull'],
          posteriorAccessory: ['Single Leg RDL', 'Dumbbell Hip Thrust', 'Glute Bridge']
        },
        'legs': { 
          plyometric: ['Box Jumps', 'Depth to Box Jumps', 'Stiff-Leg Depth Jump', 'Pogo Jumps', 'Seated Box Jumps', 'Hurdle Jump to Box'],
          mainPowerLift: ['Squat Jumps'],
          speedStrength: ['Kettlebell Swing', 'DB Clean & Press'],
          posteriorAccessory: ['Single Leg RDL', 'Dumbbell Hip Thrust', 'Glute Bridge']
        },
        'arms': { 
          plyometric: ['Overhead Medicine Ball Slam'],
          mainPowerLift: ['Kettlebell Clean & Press', 'DB Clean & Press', 'Dumbbell Speed Bench'],
          speedStrength: ['Kettlebell Clean & Press', 'DB Clean & Press', 'Dumbbell Speed Bench'],
          posteriorAccessory: ['Seated Dumbbell External Rotation']
        },
        'full-body': { 
          plyometric: ['Box Jumps', 'Depth to Box Jumps', 'Stiff-Leg Depth Jump', 'Pogo Jumps', 'Seated Box Jumps', 'Overhead Medicine Ball Slam'],
          mainPowerLift: ['Squat Jumps', 'Kettlebell Clean & Press', 'DB Clean & Press'],
          speedStrength: ['Dumbbell Speed Bench', 'Plyometric Push-Ups', 'Kettlebell Clean & Press', 'DB Clean & Press'],
          posteriorAccessory: ['Single Leg RDL', 'Dumbbell Hip Thrust', 'Glute Bridge', 'Kettlebell Swing']
        },
        'upper-body': { 
          plyometric: ['Overhead Medicine Ball Slam'],
          mainPowerLift: ['Dumbbell Speed Bench', 'Plyometric Push-Ups', 'Band-Resisted Push-Ups', 'Kettlebell Clean & Press', 'DB Clean & Press'],
          speedStrength: ['Dumbbell Speed Bench', 'Plyometric Push-Ups', 'Band-Resisted Push-Ups', 'Kettlebell Clean & Press', 'DB Clean & Press'],
          posteriorAccessory: ['Russian Twists', 'Hanging Knee Raise', 'Hanging Leg Raise', 'Seated Good Mornings']
        }
      },
      'no-equipment': {
        'full-body': ['Plyometric Push-Ups', 'Box Jumps', 'Squat Jumps', 'Depth to Box Jumps', 'Stiff-Leg Depth Jump', 'Pogo Jumps', 'Seated Box Jumps', 'Hurdles Jumps'],
        'upper-body': ['Plyometric Push-Ups'],
        'chest-back': ['Plyometric Push-Ups'],
        'legs': ['Box Jumps', 'Squat Jumps', 'Depth to Box Jumps', 'Stiff-Leg Depth Jump', 'Pogo Jumps', 'Seated Box Jumps', 'Hurdles Jumps'],
        'arms': ['Plyometric Push-Ups']
      }
    },
    'v02-max': {
      // Zone 2 Cardio — steady state
      'cardio': [
        { name: 'Cycling (Stationary)', protocol: '20–40 min continuous' },
        { name: 'Rowing (Easy Pace)', protocol: '20–40 min continuous' },
        { name: 'Stair Climber (Slow–Moderate)', protocol: '20–40 min continuous' },
        { name: 'Jump Rope (Steady)', protocol: '2–3 min steady jump / 1 min rest — 6–10 rounds' },
        { name: 'Jogging — Continuous', protocol: '20–60 min continuous' },
        { name: 'Jogging — Intervals', protocol: '3 min steady state / 1 min walk — 6–10 sets' },
        { name: 'Treadmill Walking (Incline)', protocol: '20–45 min continuous' }
      ],
      // VO2 Max — high-intensity protocols
      'vo2max': [
        {
          name: '5 On / 25 Off Sprint Repeat Training',
          description: 'A high-intensity sprint repeat protocol designed to improve alactic power output and sprint efficiency while developing speed endurance, repeat sprint ability, and efficient recovery under increasing fatigue.',
          howTo: 'Perform 5 seconds all-out sprint (preferably on a Stationary Bike, Assault/Echo Bike, or Concept2 Rower.  Possible also on Track/Outdoor run, Treadmill, or Sled Pushes). Then take 25 seconds active recovery (easy pedaling, light walk, slow jog). Repeat continuously for 20–30 total sprints depending on training level.',
          sprint: '5 sec all-out',
          recovery: '25 sec active',
          rounds: '20–30 sprints',
          benefits: 'Enhances speed endurance and sprint repeatability. Improves cardiovascular efficiency and VO2 max. Boosts calorie burn after training and helps reduce body fat.',
          whoFor: 'Athletes developing repeat sprint ability and game-speed conditioning. Individuals seeking high-intensity conditioning and fat loss in less time. General population with a solid fitness base focused on performance and cardiovascular health.'
        },
        {
          name: '5s On / 55s Off Sprint Repeat Training',
          description: 'A high-intensity sprint repeat protocol designed to improve alactic power output and sprint efficiency while enhancing speed endurance, repeated-sprint capacity, and fast recovery with low fatigue cost.',
          howTo: 'Perform 5 seconds all-out sprint (preferably on a Stationary Bike, Assault/Echo Bike, or Concept2 Rower.  Possible also on Track/Outdoor run, Treadmill, or Sled Pushes). Then take 55 seconds active recovery (easy pedaling, light walk, slow jog). Repeat continuously for 20–30 total sprints depending on training level.',
          sprint: '5 sec all-out',
          recovery: '55 sec active',
          rounds: '20–30 sprints',
          benefits: 'Improves speed and peak power. Improves speed endurance and sprint repeat efficiency. Supports cardiovascular health with minimal fatigue cost.',
          whoFor: 'Athletes focused on speed, power, and explosiveness. Individuals seeking efficient conditioning with low fatigue. General population focused on longevity and cardiovascular health.'
        },
        {
          name: 'Short & Sweet — 3 × 20s Sprints',
          description: 'A minimal, high-intensity sprint session designed to rapidly stimulate VO₂ max, improve cardiovascular efficiency, and build short-burst power.',
          howTo: 'Perform 20 sec all-out sprint (preferably on a Stationary Bike or Assault/Echo Bike.  Possible also on Track/Outdoor run, Treadmill, or Concept2 Rower). Then take 2 minutes active recovery (easy pedaling, light walk, slow jog). Repeat for a total of 3 sprints.',
          sprint: '20 sec all-out',
          recovery: '2 min active',
          rounds: '3 sprints',
          benefits: 'Improves VO₂ max. Increases anaerobic power. Enhances heart efficiency. Time-efficient conditioning boost. Supports longevity and cardiovascular health.',
          whoFor: 'Busy individuals needing fast conditioning. Athletes maintaining sprint capacity. Anyone wanting a powerful cardiovascular stimulus in minimal time.'
        },
        {
          name: '30-20-10 Training',
          description: 'This protocol blends low, moderate, and high intensities within short repeated cycles to simultaneously develop cardiovascular health, VO₂ max, and short-burst power.',
          howTo: 'Perform 30 sec easy jog → 20 sec moderate run → 10 sec hard sprint (preferably on Track/Outdoor run or Treadmill.  Possible also on Stationary Bike, Assault/Echo Bike, or Concept2 Rower). Repeat this sequence continuously for 5 minutes, then take 2 min active recovery. Complete 4 total segments (20 minutes of work).',
          sprint: '30s easy / 20s moderate / 10s hard',
          recovery: '2 min between segments',
          rounds: '4 segments × 5 min',
          benefits: 'Improves VO₂ max. Lowers blood pressure and improves health markers. Time-efficient cardiovascular improvements.',
          whoFor: 'People who are generally active and want to improve cardiovascular health and longevity. Individuals looking to improve VO₂ max and heart efficiency. Athletes building conditioning base and short-burst power.'
        },
        {
          name: 'Wingate Protocol — 4–6 × 30s All-Out Sprints',
          description: 'This protocol maximizes anaerobic power and glycolytic capacity through repeated 30-second all-out efforts. Wingate pushes peak power output and lactate tolerance to their limits.',
          howTo: 'Perform 30 sec ALL-OUT sprint → 4 min full recovery (preferably on a Stationary Bike or Assault/Echo Bike.  Possible also on Track Sprint, Sled Push, or Concept2 Rower). Repeat for 4–6 total rounds.',
          sprint: '30 sec ALL-OUT',
          recovery: '4 min full rest',
          rounds: '4–6 rounds',
          benefits: 'Increases power. Increases VO₂ max. Supports fat loss.',
          whoFor: 'Team sport athletes. Track & Field and Hybrid athletes. Advanced general population focused on general fitness. ⚠️ Not ideal for beginners without a conditioning base.'
        },
        {
          name: '8 On / 12 Off Sprint Intervals',
          description: 'This protocol elevates oxygen demand through repeated short surges, allowing heart rate and oxygen consumption to progressively rise toward VO₂ max levels.',
          howTo: 'Perform 8 sec hard sprint → 12 sec easy pedaling (preferably on a Stationary Bike or Assault/Echo Bike.  Possible also on Track Sprint, Sled Push, or Concept2 Rower). Continue this cycle continuously for 20 minutes. Maintain powerful but repeatable effort — not a single all-out burst.',
          sprint: '8 sec hard sprint',
          recovery: '12 sec easy',
          rounds: '20 min continuous',
          benefits: 'Increases VO₂ max. Improves heart efficiency (stroke volume). Enhances repeat sprint endurance. Enhances cardiovascular health.',
          whoFor: 'Track & Field and combat sport athletes. Hybrid athletes. Off-season conditioning blocks. General population focused on longevity and cardiovascular health.'
        },
        {
          name: '8s On / 52s Off Sprint Repeat Training',
          description: 'A high-intensity sprint repeat protocol designed to improve alactic power endurance, enhance fast-twitch mitochondrial density and biogenesis, and increase cardiovascular efficiency while keeping recovery cost low.',
          howTo: 'Perform 8 sec all-out sprint (preferably on a Stationary Bike or Assault/Echo Bike.  Possible also on Concept2 Rower). Then take 52 seconds active recovery (easy pedaling, light walk, slow jog). Repeat continuously for 20 total sprints.',
          sprint: '8 sec all-out',
          recovery: '52 sec active',
          rounds: '20 sprints',
          benefits: 'Increases VO₂ max. Improves sprint repeatability. Improves heart efficiency (stroke volume). Supports cardiovascular health.',
          whoFor: 'Athletes building conditioning base and short-burst power. Individuals seeking efficient fat loss. General population focused on longevity and cardiovascular health.'
        },
        {
          name: '100m Tempo Runs / Rows',
          description: 'A controlled tempo protocol designed to improve cardiovascular efficiency, enhance oxygen delivery, support fat loss, build endurance, and accelerate recovery.',
          howTo: 'Perform 100 meters at controlled tempo (≈70–80% effort) preferably on a Track/Outdoor run, Treadmill, or Concept2 Rower.  Possible also on Stationary Bike or Assault/Echo Bike. Then take 60 seconds easy recovery (walk, light jog, or easy rowing). Repeat for 10–20 total reps depending on training level.',
          sprint: '100m at 70–80% effort',
          recovery: '60 sec easy',
          rounds: '10–20 reps',
          benefits: 'Improves aerobic endurance and overall stamina. Enhances recovery between efforts. Helps regulate blood pressure.',
          whoFor: 'Athletes building work capacity and aerobic durability. Individuals seeking efficient conditioning with lower intensity. General population aiming to improve endurance, heart health, and fat loss.'
        }
      ]
    }
  };

  // ─── Exercise-specific tempo pools ───────────────────────────────────────
  // Each key maps to an array of valid tempos; app picks one randomly.
  // '-' entries from the spreadsheet are omitted (no tempo assigned).
  const buildMuscleExerciseTempos = {
    // CHEST
    'Bench Press':                          ['4010','30X0','20X0'],
    'Chest Press':                          ['4010','30X0','20X0'],
    'Incline Dumbbell Press':               ['4010','30X0','20X0'],
    'Plate-Loaded Chest Press':             ['4010','30X0','20X0'],
    'Push-ups':                             ['4010','30X0','20X0'],
    'Neutral Grip Trapbar Push-ups':        ['4010','30X0','20X0'],
    'Decline Push-up':                      ['4010','30X0','20X0'],
    'Weighted Push-up':                     ['4010','30X0','20X0'],
    'Plank':                                ['—'],
    'Side Plank':                           ['—'],
    'Reverse Crunch':                       ['2010','3010'],
    'Bicycle Crunch':                       ['1010','2010'],
    'Dead Bug':                             ['2010','3010'],
    'Bird Dog':                             ['2010','3010'],
    'Mountain Climbers':                    ['1010'],
    'Superman':                             ['2010','3010'],
    'Superman Hold':                        ['-'],
    'Reverse Snow Angel':                   ['2010','3010'],
    'Y-T-W Raise':                          ['2010','3010'],
    'Front Lever':                          ['-'],
    'Front Lever Row':                      ['-'],
    'Cable Flies':                          ['3010'],
    'Dumbbell Chest Fly':                   ['4010','30X0','20X0'],
    'Incline Dumbbell Fly':                 ['4010','30X0','20X0'],
    'Seated Chest Fly':                     ['4010','30X0','20X0'],
    'Chest Dips':                           ['30X0','20X0'],
    // BACK
    'Pull-ups':                             ['4010','30X0','20X0'],
    'Pull-ups Neutral Grip':                ['4010','30X0','20X0'],
    'Lat Pulldown':                         ['4010','30X0','20X0'],
    'T-Bar Row':                            ['4010','3010','2010'],
    'Pendlay Row':                          ['X0X0'],
    'Trap Pulls':                           ['X0X0'],
    'Barbell Row':                          ['3010','2010'],
    'Chest-Supported Row':                  ['4010','3010','2010'],
    'One-Arm Dumbbell Row':                 ['4010','30X0','20X0'],
    'Inverted Row':                         ['4010','30X0','20X0'],
    'Cable Row':                            ['4010','3010','2010'],
    // QUADS
    'Back Squat':                           ['4010','3010','2010'],
    'Back Squat Heel Elevated':             ['4010','3010','2010'],
    'Low Bar Back Squat':                   ['3010','2010','2110'],
    'Box Back Squat':                       ['30X0','20X0'],
    'Pin Back Squat':                       ['30X0','20X0'],
    'Eccentric Back Squat':                 ['(10)0X0'],
    'Front Squat':                          ['4010','3010','2010'],
    'Front Squat Heel Elevated':            ['4010','30X0','20X0','32X0'],
    'Box Front Squat':                      ['3010','2010','2110'],
    'Pin Front Squat':                      ['X0X0','30X0','20X0'],
    'Eccentric Front Squat':                ['(10)0X0'],
    'Belt Squat':                           ['X0X0','30X0','20X0'],
    'Bulgarian Squat w Dumbbells':          ['4010','3010','2010'],
    'Bulgarian Squat w Kettlebells':        ['4010','3010','2010'],
    'Bulgarian Back Squat':                 ['30X0','20X0'],
    'Bulgarian Front Squat':               ['30X0','20X0'],
    'Dumbbell Lunges':                      ['1010'],
    'Goblet Squat':                         ['4010','3010','2010'],
    'Leg Press':                            ['4010','3010','2010'],
    'Leg Extension':                        ['4010','3010','2010'],
    'Calf Raises':                          ['4010','3010','2010'],
    // HAMSTRINGS
    'Deadlift':                             ['10X0','20X0'],
    'Trap Bar Deadlift':                    ['10X0','20X0'],
    'Snatch Grip Romanian DL':              ['4010','3010','2010'],
    'Snatch Grip Deficit RDL':              ['4010','3010','2010'],
    'Snatch Pull':                          ['10X0'],
    'Rack Pull DL':                         ['10X0'],
    'Rack Pull Clean Pull':                 ['10X0'],
    'Rack Pull Snatch Pull':                ['10X0'],
    'Lying Leg Curl':                       ['4010','3010','2010'],
    'Nordic Curl':                          ['4010','3010','2010'],
    'Glute Ham Raise':                      ['4010','3010','2010'],
    'Romanian Deadlift':                    ['4010'],
    'Single Leg RDL':                       ['4010','3010'],
    'Dumbbell Hip Thrust':                  ['3010','2010'],
    'Glute Bridge':                         ['3010','2010'],
    'Kettlebell Swing':                     ['10X0','X0X0'],
    'Back Extensions':                      ['4010','3010'],
    'Back Extensions Snatch Grip':          ['4010','3010'],
    'Single Leg Back Extensions':           ['4010','3010'],
    'Good Morning':                         ['4010','3010'],
    'Reverse Hyperextensions':              ['1010'],
    // BICEPS
    'Chin Up':                              ['4010','3010','2010'],
    'Close Grip Chin Up':                   ['4010','3010','2010'],
    'Incline Dumbbell Curl':                ['4010','3010','2010'],
    'Barbell Curl':                         ['4010','3010','2010'],
    'Preacher Curl':                        ['4010','3010','2010'],
    'Supinated Close Grip Lat Pulldown':    ['4010','3010','2010'],
    'Machine Preacher Curl':                ['4010','3010','2010'],
    'Dumbbell Curl':                        ['2010','1010'],
    'Hammer Curl':                          ['2010','1010'],
    'Anatoly Curl':                         ['1010'],
    'Zottman Curl':                         ['4010','3010'],
    'Concentration Curl':                   ['4010','3010','2010'],
    'Drag Curl':                            ['4010','3010','2010'],
    'Cable Curl':                           ['4010','3010','2010'],
    'Single-Arm Cable Curl':                ['4010','3010','2010'],
    'High Cable Curl':                      ['4010','3010','2010'],
    // TRICEPS
    'Close-Grip Bench Press':               ['4010','3010','2010'],
    'Weighted V Dips':                      ['3010','2010'],
    'Skull Crushers EZ-Bar':                ['4010','3010','2010'],
    'Skull Crushers DB':                    ['4010','3010','2010'],
    'Dumbbell Kickbacks':                   ['4010','3010','2010'],
    'Cable Triceps Pushdown':               ['4010','3010','2010'],
    'Diamond Push-Ups':                     ['4010','3010','2010'],
    // SHOULDERS
    'Barbell Overhead Press':               ['3010','2010'],
    'Landmine Press':                       ['3010','4010','2010'],
    'Behind-the-Neck Overhead Press (Seated)':   ['3010','4010','2010'],
    'Behind-the-Neck Overhead Press (Standing)': ['3010','4010','2010'],
    'Behind-the-Neck Snatch-Grip Press':    ['3010','2010'],
    'Dumbbell Shoulder Press':              ['3010','4010','2010'],
    'Arnold Press':                         ['3010','2010'],
    'Leaning Lateral Raise':                ['2010'],
    'Bent-Over Dumbbell Rear Delt Raise':   ['2010'],
    'Chest-Supported Rear Delt Raise':      ['2010'],
    'External Rotation (Cable/Band)':       ['3010','4010','2010'],
    'External Rotation Dumbbell (Seated)':  ['3010','4010','2010'],
    'Internal Rotation (Cable/Band)':       ['3010','4010','2010'],
  };

  const strengthExerciseTempos = {
    // CHEST
    'Bench Press':                          ['4010','30X0','20X0','X0X0','32X1'],
    'Chest Press':                          ['4010','30X0','20X0'],
    'Incline Dumbbell Press':               ['4010','30X0','20X0','31X0'],
    'Plate-Loaded Chest Press':             ['4010','30X0','20X0'],
    'Push-ups':                             ['4010','30X0','20X0','31X1','X0X0'],
    'Neutral Grip Trapbar Push-ups':        ['4010','30X0','20X0','31X1','X0X0'],
    'Decline Push-up':                      ['4010','30X0','20X0','31X1','X0X0'],
    'Weighted Push-up':                     ['4010','30X0','20X0','31X1','X0X0'],
    'Plank':                                ['—'],
    'Side Plank':                           ['—'],
    'Reverse Crunch':                       ['2010','3010'],
    'Bicycle Crunch':                       ['1010','2010'],
    'Dead Bug':                             ['2010','3010'],
    'Bird Dog':                             ['2010','3010'],
    'Mountain Climbers':                    ['1010'],
    'Superman':                             ['2010','3010'],
    'Superman Hold':                        ['-'],
    'Reverse Snow Angel':                   ['2010','3010'],
    'Y-T-W Raise':                          ['2010','3010'],
    'Front Lever':                          ['-'],
    'Front Lever Row':                      ['-'],
    'Cable Flies':                          ['3010'],
    'Dumbbell Chest Fly':                   ['4010','30X0','20X0','31X1'],
    'Incline Dumbbell Fly':                 ['4010','30X0','20X0','31X1'],
    'Seated Chest Fly':                     ['4010','30X0','20X0','31X1'],
    'Chest Dips':                           ['30X0','20X0'],
    // BACK
    'Pull-ups':                             ['4010','30X0','20X0','X0X0','30X2'],
    'Pull-ups Neutral Grip':                ['4010','30X0','20X0','X0X0','30X2'],
    'Lat Pulldown':                         ['4010','30X0','20X0'],
    'T-Bar Row':                            ['4010','3010','2010'],
    'Pendlay Row':                          ['X0X0'],
    'Trap Pulls':                           ['X0X0'],
    'Barbell Row':                          ['3010','2010'],
    'Chest-Supported Row':                  ['4010','3010','2010'],
    'One-Arm Dumbbell Row':                 ['4010','30X0','20X0'],
    'Inverted Row':                         ['4010','30X0','20X0'],
    'Cable Row':                            ['4010','3010','2010'],
    // QUADS
    'Back Squat':                           ['4010','30X0','20X0','X0X0','32X1'],
    'Back Squat Heel Elevated':             ['4010','30X0','20X0','X0X0','32X1'],
    'Low Bar Back Squat':                   ['30X0','20X0','21X0'],
    'Box Back Squat':                       ['30X0','20X0'],
    'Pin Back Squat':                       ['30X0','20X0','X0X0'],
    'Eccentric Back Squat':                 ['(10)0X0'],
    'Front Squat':                          ['4010','30X0','20X0','X0X0','32X1'],
    'Front Squat Heel Elevated':            ['4010','30X0','20X0','X0X0','32X1'],
    'Box Front Squat':                      ['30X0','20X0'],
    'Pin Front Squat':                      ['30X0','20X0','X0X0'],
    'Eccentric Front Squat':                ['(10)0X0'],
    'Belt Squat':                           ['X0X0','30X0','20X0'],
    'Bulgarian Squat w Dumbbells':          ['4010','3010','2010'],
    'Bulgarian Squat w Kettlebells':        ['4010','3010','2010'],
    'Bulgarian Back Squat':                 ['30X0','20X0'],
    'Bulgarian Front Squat':               ['30X0','20X0'],
    'Dumbbell Lunges':                      ['1010'],
    'Goblet Squat':                         ['4010','3010','2010'],
    'Leg Press':                            ['4010','3010','2010'],
    'Leg Extension':                        ['4010','3010','2010'],
    'Calf Raises':                          ['4010','30X0','20X0'],
    // HAMSTRINGS
    'Deadlift':                             ['10X0','20X0'],
    'Trap Bar Deadlift':                    ['10X0','20X0','X0X0'],
    'Snatch Grip Romanian DL':              ['4010','3010','2010'],
    'Snatch Grip Deficit RDL':              ['4010','3010','2010'],
    'Snatch Pull':                          ['10X0'],
    'Rack Pull DL':                         ['10X0'],
    'Rack Pull Clean Pull':                 ['10X0'],
    'Rack Pull Snatch Pull':                ['10X0'],
    'Lying Leg Curl':                       ['4010','3010','20X0'],
    'Nordic Curl':                          ['4010','3010','20X0'],
    'Glute Ham Raise':                      ['4010','3010','20X0'],
    'Romanian Deadlift':                    ['4010'],
    'Single Leg RDL':                       ['4010','3010'],
    'Dumbbell Hip Thrust':                  ['3010','2010'],
    'Glute Bridge':                         ['3010','2010'],
    'Kettlebell Swing':                     ['10X0','X0X0'],
    'Back Extensions':                      ['4010','3010'],
    'Back Extensions Snatch Grip':          ['4010','3010'],
    'Single Leg Back Extensions':           ['4010','3010'],
    'Good Morning':                         ['4010','3010'],
    'Reverse Hyperextensions':              ['1010'],
    // BICEPS
    'Chin Up':                              ['4010','3010','20X0','20X2'],
    'Close Grip Chin Up':                   ['4010','3010','20X0','20X2'],
    'Incline Dumbbell Curl':                ['4010','3010','2010'],
    'Barbell Curl':                         ['4010','3010','20X0'],
    'Preacher Curl':                        ['4010','3010','20X0'],
    'Supinated Close Grip Lat Pulldown':    ['4010','3010','20X0'],
    'Machine Preacher Curl':                ['4010','3010','20X0'],
    'Dumbbell Curl':                        ['2010','1010'],
    'Hammer Curl':                          ['2010','1010'],
    'Anatoly Curl':                         ['1010'],
    'Zottman Curl':                         ['4010','3010'],
    'Concentration Curl':                   ['4010','3010','2010'],
    'Drag Curl':                            ['4010','3010','2010'],
    'Cable Curl':                           ['4010','3010','2010'],
    'Single-Arm Cable Curl':                ['4010','3010','2010'],
    'High Cable Curl':                      ['4010','3010','2010'],
    'Reverse Curl':                         ['4010','3010'],
    'Scott EZ Bar Curl':                    ['4010','3010'],
    // TRICEPS
    'Close-Grip Bench Press':               ['4010','3010','20X0'],
    'Weighted V Dips':                      ['3010','2010'],
    'Skull Crushers EZ-Bar':                ['4010','3010','2010'],
    'Skull Crushers DB':                    ['4010','3010','2010'],
    'Dumbbell Kickbacks':                   ['4010','3010','2010'],
    'Cable Triceps Pushdown':               ['4010','3010','2010'],
    'Diamond Push-Ups':                     ['4010','3010','2010'],
    // SHOULDERS
    'Barbell Overhead Press':               ['3010','20X0','X0X0'],
    'Landmine Press':                       ['3010','4010','2010'],
    'Behind-the-Neck Overhead Press (Seated)':   ['3010','4010','2010'],
    'Behind-the-Neck Overhead Press (Standing)': ['3010','4010','2010'],
    'Behind-the-Neck Snatch-Grip Press':    ['3010','2010'],
    'Dumbbell Shoulder Press':              ['3010','4010','2010'],
    'Arnold Press':                         ['3010','2010'],
    'Leaning Lateral Raise':                ['2010'],
    'Bent-Over Dumbbell Rear Delt Raise':   ['2010'],
    'Chest-Supported Rear Delt Raise':      ['2010'],
    'External Rotation (Cable/Band)':       ['3010','4010','2010'],
    'External Rotation Dumbbell (Seated)':  ['3010','4010','2010'],
    'Internal Rotation (Cable/Band)':       ['3010','4010','2010'],
  };

  // Helper: pick a random tempo for a given exercise + goal
  const getExerciseTempo = (name, goal) => {
    const pool = goal === 'strength'
      ? (strengthExerciseTempos[name] || null)
      : (buildMuscleExerciseTempos[name] || null);
    if (pool && pool.length > 0) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
    // Fallback to global random tempo pools if exercise not in lookup
    return goal === 'strength' ? getRandomStrengthTempo() : getRandomBuildMuscleTempo();
  };
  // ─────────────────────────────────────────────────────────────────────────

  // Get a single random scheme for ALL main exercises in Build Muscle
  const getMainSchemeForBuildMuscle = (experience) => {
    const mainSchemeKeys = ['classic-hypertrophy', 'heavy-hypertrophy', 'dropsets', 'gvt', 'post-exhaustion', 'wave-loading', 'wave-pump', 'eight-by-eight', 'cluster-hypertrophy'];
    
    if (experience === 'advanced') {
      // Add advanced-only schemes
      mainSchemeKeys.push('gvt-advanced');
    }
    
    const schemeKey = mainSchemeKeys[Math.floor(Math.random() * mainSchemeKeys.length)];
    return buildMuscleSchemes[schemeKey];
  };

  // Get random secondary scheme for Build Muscle
  const getSecondarySchemeForBuildMuscle = () => {
    const secondarySchemeKeys = ['classic-hypertrophy', 'heavy-hypertrophy'];
    const schemeKey = secondarySchemeKeys[Math.floor(Math.random() * secondarySchemeKeys.length)];
    return buildMuscleSchemes[schemeKey];
  };

  // Get a single random scheme for ALL main exercises in Strength
  const getMainSchemeForStrength = () => {
    const mainSchemeKeys = ['one-six-method', 'five-four-three-two-one', 'cluster-strength', 'basic-strength', 'five-by-five', 'six-by-three', 'wave-531', 'wave-321'];
    const schemeKey = mainSchemeKeys[Math.floor(Math.random() * mainSchemeKeys.length)];
    return strengthSchemes[schemeKey];
  };

  // Get secondary scheme for Strength
  const getSecondarySchemeForStrength = () => {
    return strengthSchemes['basic-assistance'];
  };

  // Get main scheme for Power
  const getMainSchemeForPower = () => {
    return powerSchemes['explosive-power'];
  };

  // Get secondary scheme for Power
  const getSecondarySchemeForPower = () => {
    return powerSchemes['power-assistance'];
  };

  const getSuggestedExerciseLevelFit = (name = '') => {
    const exerciseName = String(name).toLowerCase();

    if (exerciseName === 'bench press') {
      return ['beginner', 'intermediate', 'advanced'];
    }

    if (exerciseName === 'one-arm dumbbell row' || exerciseName === 'single-arm dumbbell row' || exerciseName === 'single arm dumbbell row') {
      return ['beginner', 'intermediate', 'advanced'];
    }

    if (/snatch|clean & jerk|jerk balance|tall snatch|tall clean|overhead squat|depth|one-arm|one arm|planche|front lever|back lever|dragon flag|pistol|shrimp|nordic|eccentric|behind-the-neck|sissy|typewriter|handstand push|flying sprint|wicket|block start|hurdle|halting pull/.test(exerciseName)) {
      return ['advanced'];
    }

    if (/back squat|front squat|low bar|box back squat|pin squat|pin back squat|pin front squat|bench press|deadlift|trap bar|trap pull|romanian|barbell row|pendlay|t-bar|overhead press|landmine|weighted|close-grip|pull-up|chin up|good morning|bulgarian|rack pull|power clean|power snatch|clean pull|snatch pull|sled sprint|sled push|plyometric|explosive|speed bench|jump squat|broad jump|split squat jump|hip thrust|push press|push jerk|farmer carry/.test(exerciseName)) {
      return ['intermediate', 'advanced'];
    }

    return ['beginner', 'intermediate', 'advanced'];
  };

  const isExerciseAllowedForExperience = (name, experience = settings.experience) => {
    return getSuggestedExerciseLevelFit(name).includes(experience);
  };

  const filterExerciseListForExperience = (list, experience = settings.experience) => {
    if (!Array.isArray(list)) return [];
    return list.filter(item => isExerciseAllowedForExperience(item?.name || item, experience));
  };

  const filterExercisePoolForExperience = (pool, experience = settings.experience) => {
    if (Array.isArray(pool)) return filterExerciseListForExperience(pool, experience);
    if (!pool || typeof pool !== 'object') return pool;
    return Object.entries(pool).reduce((filtered, [key, value]) => {
      filtered[key] = filterExercisePoolForExperience(value, experience);
      return filtered;
    }, {});
  };

  // Bodyweight training architecture.
  // Future upgrades: weighted calisthenics, backpack loading, skill progressions,
  // mobility integration, pull-up bar availability toggles, advanced isometric
  // progressions, bodyweight-only programs, and bodyweight strength standards.
  const bodyweightExercisePools = {
    beginner: {
      push: ['Incline Push-up', 'Push-up', 'Wide Push-up', 'Knee Push-up', 'Pike Push-up', 'Bench Dip', 'Close-Grip Push-up'],
      pull: ['Superman', 'Superman Hold', 'Reverse Snow Angel', 'Y-T-W Raise', 'Table Row', 'Doorframe Row', 'Band Row'],
      legs: ['Bodyweight Squat', 'Reverse Lunge', 'Walking Lunge', 'Step-Up', 'Glute Bridge', 'Wall Sit', 'Calf Raise'],
      core: ['Dead Bug', 'Bird Dog', 'Plank', 'Side Plank', 'Hollow Hold', 'Reverse Crunch', 'Bicycle Crunch', 'Mountain Climbers']
    },
    intermediate: {
      push: ['Decline Push-up', 'Diamond Push-up', 'Archer Push-up', 'Pseudo Planche Push-up', 'Dip', 'Chair Dip'],
      pull: ['Inverted Row', 'Chin-up', 'Pull-up', 'Scapular Pull-up', 'Neutral Grip Pull-up'],
      legs: ['Bulgarian Split Squat', 'Cossack Squat', 'Shrimp Squat', 'Single-Leg Glute Bridge', 'Hamstring Walkout', 'Jump Squat'],
      core: ['Hollow Rock', 'V-Up', 'Plank Shoulder Tap', 'Reverse Crunch', 'Flutter Kick', 'Bear Crawl', 'Hanging Knee Raise', 'L-Sit Tuck']
    },
    advanced: {
      push: ['One-Arm Push-up', 'Handstand Push-up', 'Plyometric Push-up', 'Typewriter Push-up', 'Planche Lean', 'Archer Dip'],
      pull: ['Typewriter Pull-up', 'Front Lever Row', 'Archer Pull-up', 'Explosive Pull-up', 'Muscle-Up Progression'],
      legs: ['Pistol Squat', 'Bulgarian Split Squat', 'Sissy Squat', 'Skater Jump', 'Depth Jump'],
      core: ['Dragon Flag', 'L-Sit', 'Hanging Leg Raise', 'Toes-to-Bar', 'Front Lever']
    }
  };

  const isBodyweightEquipment = (equipment = settings.equipment) => (
    equipment === 'no-equipment' || equipment === 'minimal-equipment'
  );

  const selectBodyweightSubtype = ({ experience = settings.experience, goal = settings.goal, focus = settings.focus } = {}) => {
    let calisthenicsScore = 0;
    let homeScore = 0;

    if (experience === 'advanced') calisthenicsScore += 4;
    if (experience === 'intermediate') calisthenicsScore += 2;
    if (experience === 'beginner') homeScore += 4;

    if (goal === 'strength') calisthenicsScore += 3;
    if (goal === 'fat-loss') calisthenicsScore += 2;
    if (goal === 'build-muscle') homeScore += experience === 'advanced' ? 1 : 3;

    if (['upper-body', 'chest-back', 'arms'].includes(focus)) calisthenicsScore += 2;
    if (['full-body', 'legs'].includes(focus)) homeScore += 2;
    if (focus === 'legs' && experience === 'advanced' && goal !== 'build-muscle') calisthenicsScore += 1;

    return calisthenicsScore > homeScore ? 'calisthenics' : 'home_workout';
  };

  const getBodyweightSubtypeMeta = (subtype) => (
    subtype === 'calisthenics'
      ? {
          eyebrow: 'Calisthenics',
          title: 'Pull-up and bodyweight strength focused',
          description: 'Skill-oriented bodyweight performance with pulling strength, leverage difficulty, and athletic control.'
        }
      : {
          eyebrow: 'Home Workout',
          title: 'Minimal setup bodyweight training',
          description: 'Efficient home-friendly training built around push-ups, unilateral legs, core control, and compact-space work.'
        }
  );

  const getActiveBodyweightSubtype = ({ experience = settings.experience } = {}) => (
    experience === 'beginner' ? 'home_workout' : selectedBodyweightSubtype
  );

  const normalizeBodyweightExerciseName = (name = '') => {
    const normalized = String(name).trim();
    const aliases = {
      'Push-ups': 'Push-up',
      'Pushups': 'Push-up',
      'Pull-ups': 'Pull-up',
      'Pullups': 'Pull-up',
      'Diamond Push-Ups': 'Diamond Push-up',
      'Plyometric Push-Ups': 'Plyometric Push-up',
      'Explosive Push-Ups': 'Plyometric Push-up',
      'Tricep Dips': 'Bench Dip',
      'Dips': 'Bench Dip',
      'Calf Raises': 'Calf Raise',
      'Lunge': 'Reverse Lunge',
      'Plank Row': 'Plank Shoulder Tap',
      'Pseudo Planche': 'Pseudo Planche Push-up',
      'Handstand Hold': 'Handstand Push-up',
      'Back Lever': 'Front Lever',
      'Bodyweight Curl': 'Doorframe Row',
      'Tricep Extension': 'Close-Grip Push-up',
      'Narrow Push-up': 'Close-Grip Push-up',
      'Deep Step-up': 'Step-Up',
      'Single Leg Deadlift': 'Single-Leg Glute Bridge',
      'Single Leg RDL': 'Single-Leg Glute Bridge',
      'Prone Y-T-W Raise': 'Y-T-W Raise',
      'Y-T-W Raises': 'Y-T-W Raise'
    };
    return aliases[normalized] || normalized;
  };

  const isNoEquipmentSafeBodyweightExercise = (name = '') => {
    const exerciseName = String(name).toLowerCase();
    return !/ring|trx/.test(exerciseName);
  };

  const getBodyweightExperienceStack = (experience = settings.experience) => {
    if (experience === 'advanced') return ['advanced', 'intermediate', 'beginner'];
    if (experience === 'intermediate') return ['intermediate', 'beginner'];
    return ['beginner'];
  };

  const scoreBodyweightExerciseForGoal = (name = '', goal = settings.goal, subtype = 'home_workout') => {
    const exerciseName = String(name).toLowerCase();
    let score = 0;
    const homeCorePriority = /plank|side plank|reverse crunch|bicycle crunch|dead bug|bird dog|mountain climbers/.test(exerciseName);

    if (/ring|trx/.test(exerciseName)) return -100;

    if (subtype === 'calisthenics') {
      if (/pull-up|chin-up|handstand|archer|front lever|hanging|dragon flag|pistol|dip|typewriter|muscle-up|planche|toes-to-bar|l-sit|explosive/.test(exerciseName)) score += 8;
      if (/superman|reverse snow|bird dog|knee push-up|incline|wall sit|calf raise|band row|chair|bench/.test(exerciseName)) score -= 3;
    } else {
      if (/push-up|pike|bulgarian|glute bridge|wall sit|towel row|superman|reverse snow|y-t-w|hollow|plank|close-grip|reverse crunch|bicycle|dead bug|bird dog|mountain climbers|flutter|chair|bench|step-up|lunge/.test(exerciseName)) score += 8;
      if (homeCorePriority) score += 7;
      if (/muscle-up|front lever|typewriter|one-arm|handstand|dragon flag|toes-to-bar|hanging|pistol|archer pull-up/.test(exerciseName)) score -= 4;
    }

    if (goal === 'build-muscle') {
      if (/split squat|cossack|single-leg|diamond|decline|close-grip|wide|lunge|glute bridge|hamstring|hollow|v-up|archer|pseudo/.test(exerciseName)) score += 4;
      if (/hold|wall sit|plank|slow|planche lean/.test(exerciseName)) score += 2;
      if (/plyometric|depth jump|skater jump|explosive|muscle-up/.test(exerciseName)) score -= 2;
    } else if (goal === 'strength') {
      if (/one-arm|handstand|pistol|nordic|dragon|front lever|archer|typewriter|planche|l-sit|dip|pull-up|chin-up|shrimp|sissy/.test(exerciseName)) score += 5;
      if (/hold|wall sit|hollow/.test(exerciseName)) score += 2;
      if (/mountain climbers|bear crawl/.test(exerciseName)) score -= 2;
    } else if (goal === 'fat-loss') {
      if (/plyometric|jump|explosive|skater|mountain climbers|bear crawl|push-up|squat|pull-up|dip/.test(exerciseName)) score += 5;
      if (/hold|dead bug|bird dog/.test(exerciseName)) score -= 1;
    }

    return score;
  };

  const getBodyweightCategoryPool = (category, experience = settings.experience, equipment = settings.equipment, goal = settings.goal, subtype = 'home_workout') => {
    const levelNames = getBodyweightExperienceStack(experience);
    const seen = new Set();
    const candidates = [];

    levelNames.forEach((levelName, levelIndex) => {
      const pool = bodyweightExercisePools[levelName]?.[category] || [];
      pool.forEach((exerciseName) => {
        const normalizedName = normalizeBodyweightExerciseName(exerciseName);
        const key = normalizedName.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        candidates.push({
          name: normalizedName,
          score: scoreBodyweightExerciseForGoal(normalizedName, goal, subtype) - levelIndex
        });
      });
    });

    const filtered = candidates
      .filter((item) => equipment !== 'no-equipment' || isNoEquipmentSafeBodyweightExercise(item.name))
      .sort((a, b) => b.score - a.score || Math.random() - 0.5)
      .map((item) => item.name);

    return filtered;
  };

  const isBodyweightCoreExercise = (name = '') => {
    const exerciseName = String(name).toLowerCase();
    return /dead bug|bird dog|plank|side plank|hollow|mountain climber|crunch|bicycle|flutter|v-up|bear crawl|dragon flag|l-sit|leg raise|toes-to-bar|front lever hold/.test(exerciseName);
  };

  const pickBodyweightExercise = (category, poolsByCategory, usedNames) => {
    const pool = poolsByCategory[category] || [];
    const available = pool.filter((exerciseName) => !usedNames.has(exerciseName.toLowerCase()));
    const chosen = available[0] || pool.find((exerciseName) => !usedNames.has(exerciseName.toLowerCase()));
    if (!chosen) return null;
    usedNames.add(chosen.toLowerCase());
    return chosen;
  };

  const shuffleBodyweightPool = (pool = []) => [...pool].sort(() => Math.random() - 0.5);

  const getHomeWorkoutFullBodyCorePool = (corePool = []) => {
    const corePriority = [
      'Reverse Crunch',
      'Bicycle Crunch',
      'Dead Bug',
      'Bird Dog',
      'Mountain Climbers',
      'Plank',
      'Side Plank',
      'Hollow Hold'
    ];
    const available = new Set(corePool.map((name) => name.toLowerCase()));
    const priorityPool = corePriority.filter((name) => available.has(name.toLowerCase()));
    const remainingPool = corePool.filter((name) => !corePriority.some((priorityName) => priorityName.toLowerCase() === name.toLowerCase()));
    return [...shuffleBodyweightPool(priorityPool), ...shuffleBodyweightPool(remainingPool)];
  };

  const getHomeWorkoutFullBodyPullPool = (pullPool = []) => {
    const pullPriority = [
      'Y-T-W Raise',
      'Reverse Snow Angel',
      'Superman',
      'Superman Hold'
    ];
    const available = new Set(pullPool.map((name) => name.toLowerCase()));
    const priorityPool = pullPriority.filter((name) => available.has(name.toLowerCase()));
    const remainingPool = pullPool.filter((name) => !pullPriority.some((priorityName) => priorityName.toLowerCase() === name.toLowerCase()));
    return [...shuffleBodyweightPool(priorityPool), ...shuffleBodyweightPool(remainingPool)];
  };

  const getCalisthenicsLegPool = (legPool = []) => {
    const legPriority = [
      'Bulgarian Split Squat',
      'Pistol Squat',
      'Sissy Squat',
      'Skater Jump',
      'Depth Jump',
      'Shrimp Squat',
      'Cossack Squat'
    ];
    const available = new Set(legPool.map((name) => name.toLowerCase()));
    const priorityPool = legPriority.filter((name) => available.has(name.toLowerCase()));
    const remainingPool = legPool.filter((name) => !legPriority.some((priorityName) => priorityName.toLowerCase() === name.toLowerCase()));
    return [...shuffleBodyweightPool(priorityPool), ...shuffleBodyweightPool(remainingPool)];
  };

  const getBodyweightFocusPools = (focus = settings.focus, experience = settings.experience, equipment = settings.equipment, goal = settings.goal, subtype = 'home_workout') => {
    const poolsByCategory = {
      push: getBodyweightCategoryPool('push', experience, equipment, goal, subtype),
      pull: getBodyweightCategoryPool('pull', experience, equipment, goal, subtype),
      legs: getBodyweightCategoryPool('legs', experience, equipment, goal, subtype),
      core: getBodyweightCategoryPool('core', experience, equipment, goal, subtype)
    };

    if (subtype === 'home_workout' && focus === 'full-body') {
      poolsByCategory.pull = getHomeWorkoutFullBodyPullPool(poolsByCategory.pull);
      poolsByCategory.core = getHomeWorkoutFullBodyCorePool(poolsByCategory.core);
    }

    if (subtype === 'calisthenics' && (focus === 'full-body' || focus === 'legs')) {
      poolsByCategory.legs = getCalisthenicsLegPool(poolsByCategory.legs);
    }

    const fullBodyPattern = subtype === 'home_workout'
      ? ['legs', 'push', 'pull', 'core', 'core']
      : ['legs', 'push', 'pull', 'core', 'legs'];

    const focusPatterns = {
      'chest-back': ['push', 'pull', 'push', 'pull', 'core'],
      legs: ['legs', 'legs', 'legs', 'legs', 'core'],
      'full-body': fullBodyPattern,
      'upper-body': ['push', 'pull', 'push', 'pull', 'core'],
      arms: ['push', 'pull', 'push', 'pull', 'core']
    };

    const pattern = focusPatterns[focus] || focusPatterns['full-body'];
    const usedNames = new Set();
    const selected = pattern
      .map((category) => pickBodyweightExercise(category, poolsByCategory, usedNames))
      .filter(Boolean);

    if (selected.length < 4) {
      ['push', 'pull', 'legs', 'core'].forEach((category) => {
        if (selected.length >= 5) return;
        const fallback = pickBodyweightExercise(category, poolsByCategory, usedNames);
        if (fallback) selected.push(fallback);
      });
    }

    return selected;
  };

  const resetWorkoutSession = () => {
    setIsWorkoutSessionActive(false);
    setIsWorkoutSessionViewActive(false);
    setSessionStartTime(null);
    setElapsedSeconds(0);
    setSetLogs({});
    setActiveExerciseIndex(null);
    setShowFinishSummary(false);
    setShowAddExerciseModal(false);
  };

  const generateWorkout = () => {
    let exercises;
    
    // Conditioning: skip all validation, generate directly
    if (settings.goal === 'v02-max') {
      const conditioningList = settings.conditioningType === 'vo2max' ? 'vo2max' : 'cardio';
      const conditioningExercises = filterExerciseListForExperience(exerciseDatabase['v02-max'][conditioningList]);
      const chosen = conditioningExercises[Math.floor(Math.random() * conditioningExercises.length)];
      if (!chosen) {
        alert('No exercises found for this experience level. Please try a higher experience level or different settings.');
        return;
      }
      
      resetWorkoutSession();
      setBodyweightWorkoutSubtype(null);
      setWorkout([{
        label: 'A',
        name: chosen.name,
        setsReps: chosen.protocol || '',
        tempo: '—',
        rest: '—',
        schemeName: settings.conditioningType === 'vo2max' ? 'VO2 Max Training' : 'Zone 2 Cardio',
        schemeDescription: settings.conditioningType === 'vo2max' ? (chosen.description || '') : 'Low-intensity steady-state — maintain conversational pace, heart rate 60–70% of max',
        isMain: false,
        isConditioning: true,
        isVo2Max: settings.conditioningType === 'vo2max',
        vo2Protocol: settings.conditioningType === 'vo2max' ? chosen : null
      }]);
      setShowWorkout(true);
    window.scrollTo(0, 0);
      return;
    }
    
    const usesBodyweightSystem = isBodyweightEquipment(settings.equipment);
    const generatedBodyweightSubtype = usesBodyweightSystem
      ? getActiveBodyweightSubtype({ experience: settings.experience })
      : null;

    if (usesBodyweightSystem) {
      exercises = getBodyweightFocusPools(settings.focus, settings.experience, settings.equipment, settings.goal, generatedBodyweightSubtype);
      if (!exercises || exercises.length === 0) {
        alert('No exercises found for this experience level. Please try a higher experience level or different settings.');
        return;
      }
    } else {
      const focusData = filterExercisePoolForExperience(exerciseDatabase[settings.goal]?.[settings.equipment]?.[settings.focus]);
      if (!focusData) {
        alert('No exercises found for this combination. Please try different settings.');
        return;
      }
    }
    
    const numPairs = 3;
    const numStraight = 4;
    
    // Get ONE main scheme for the entire workout based on goal
    let mainScheme = null;
    if (settings.goal === 'build-muscle') {
      mainScheme = getMainSchemeForBuildMuscle(settings.experience);
    } else if (settings.goal === 'strength') {
      mainScheme = usesBodyweightSystem ? strengthSchemes['basic-strength'] : getMainSchemeForStrength();
    } else if (settings.goal === 'fat-loss') {
      mainScheme = getMainSchemeForPower();
    }
    
    const pairs = [];
    const usedExerciseNames = new Set();
    const normalizeExerciseName = (name = '') => String(name).trim().toLowerCase();
    const getExerciseConflictKey = (name = '') => {
      const normalized = normalizeExerciseName(name);
      if (['barbell row', 'one-arm dumbbell row', 'single-arm dumbbell row', 'single arm dumbbell row'].includes(normalized)) {
        return 'horizontal-row-primary';
      }
      return normalized;
    };
    
    // Helper function to create exercise object
    const createExercise = (label, name, isMain) => {
      if (!name) return null;
      const normalizedName = getExerciseConflictKey(name);
      if (usedExerciseNames.has(normalizedName)) return null;
      usedExerciseNames.add(normalizedName);
      // Special handling for Dumbbell Lunges and Reverse Hyper - always use 1010 tempo
      const uses1010Tempo = name === 'Dumbbell Lunges' || name === 'Reverse Hyperextensions';
      // Special handling for Reverse Hyper - always use Classic Hypertrophy scheme
      const isReverseHyper = name === 'Reverse Hyperextensions';
      
      if (settings.goal === 'build-muscle') {
        if (isMain) {
          // Use Classic Hypertrophy for Reverse Hyper, otherwise use mainScheme
          const scheme = isReverseHyper ? buildMuscleSchemes['classic-hypertrophy'] : mainScheme;
          return {
            label,
            name,
            setsReps: scheme.setsReps,
            tempo: getExerciseTempo(name, 'build-muscle'),
            rest: scheme.rest,
            schemeName: scheme.name,
            schemeDescription: scheme.description,
            schemeExample: scheme.example,
            isMain: true
          };
        } else {
          const scheme = isReverseHyper ? buildMuscleSchemes['classic-hypertrophy'] : getSecondarySchemeForBuildMuscle();
          return {
            label,
            name,
            setsReps: scheme.setsReps,
            tempo: getExerciseTempo(name, 'build-muscle'),
            rest: scheme.rest,
            schemeName: scheme.name,
            schemeDescription: scheme.description,
            isMain: false
          };
        }
      } else if (settings.goal === 'strength') {
        if (isMain) {
          return {
            label,
            name,
            setsReps: mainScheme.setsReps,
            tempo: getExerciseTempo(name, 'strength'),
            rest: mainScheme.rest,
            schemeName: mainScheme.name,
            schemeDescription: mainScheme.description,
            schemeExample: mainScheme.example,
            isMain: true
          };
        } else {
          const scheme = getSecondarySchemeForStrength();
          return {
            label,
            name,
            setsReps: scheme.setsReps,
            tempo: getExerciseTempo(name, 'strength'),
            rest: scheme.rest,
            schemeName: scheme.name,
            schemeDescription: scheme.description,
            isMain: false
          };
        }
      } else if (settings.goal === 'fat-loss') {
        // Power goal (labeled as "Power" in UI but uses 'fat-loss' internally)
        
        // Check if this exercise has a specific scheme in powerExerciseSchemes
        const exerciseSpecificSchemes = powerExerciseSchemes[name] || null;
        
        if (exerciseSpecificSchemes) {
          // Pick a random variation from the exercise's scheme list
          const chosen = exerciseSpecificSchemes[Math.floor(Math.random() * exerciseSpecificSchemes.length)];
          const isPlyoExercise = plyometricExercises.includes(name);
          return {
            label,
            name,
            setsReps: chosen.setsReps,
            tempo: chosen.tempo,
            rest: chosen.rest,
            schemeName: chosen.scheme || (isPlyoExercise ? 'Velocity Focused' : 'Power'),
            schemeDescription: chosen.description || (isPlyoExercise ? 'Explosive movement — max intent, full recovery between sets' : (chosen.scheme || '')),
            schemeExample: chosen.example,
            isMain: isMain,
            isPlyometric: isPlyoExercise
          };
        }
        
        // Check if this is a plyometric/medicine ball exercise — always gets fixed 3×3
        const isPlyometric = plyometricExercises.includes(name);
        
        if (isPlyometric) {
          return {
            label,
            name,
            setsReps: '3 × 3',
            tempo: '10X0',
            rest: '60-90 sec',
            schemeName: 'Velocity Focused',
            schemeDescription: 'Explosive movement — max intent, full recovery between sets',
            isMain: false,
            isPlyometric: true
          };
        } else if (isMain) {
          const powerMainScheme = getMainSchemeForPower();
          return {
            label,
            name,
            setsReps: powerMainScheme.setsReps,
            tempo: uses1010Tempo ? '1010' : powerMainScheme.tempo,
            rest: powerMainScheme.rest,
            schemeName: powerMainScheme.name,
            schemeDescription: powerMainScheme.description,
            schemeExample: powerMainScheme.example,
            isMain: true
          };
        } else {
          const scheme = getSecondarySchemeForPower();
          return {
            label,
            name,
            setsReps: scheme.setsReps,
            tempo: uses1010Tempo ? '1010' : scheme.tempo,
            rest: scheme.rest,
            schemeName: scheme.name,
            schemeDescription: scheme.description,
            isMain: false
          };
        }
      } else {
        // Other goals (v02-max) use standard schemes
        let sets, reps, tempo, rest;
        sets = 5;
        reps = '12-15';
        tempo = uses1010Tempo ? '1010' : '10X0';
        rest = '45 sec';
        return {
          label,
          name,
          setsReps: `${sets} × ${reps}`,
          tempo,
          rest,
          isMain
        };
      }
    };

    const getPostExhaustionMuscleFamily = (name = '') => {
      const exerciseName = String(name).toLowerCase();

      if (/diamond|tricep|close-grip|close grip|skull crusher|kickback|pushdown|rope extension/.test(exerciseName)) return 'triceps';
      if (/curl|biceps|chin up|chin-up/.test(exerciseName)) return 'biceps';
      if (/overhead|shoulder|pike|lateral|delt|rotation|arm circle|arnold|landmine press/.test(exerciseName)) return 'shoulders';
      if (/bench|chest press|push-up|push up|fly|flies|chest dip|dip/.test(exerciseName)) return 'chest';
      if (/squat|lunge|leg press|leg extension|calf|step-up|wall sit|sled|jump/.test(exerciseName)) return 'quads';
      if (/deadlift|rdl|romanian|hamstring|leg curl|glute|hip thrust|bridge|nordic|good morning|back extension|reverse hyper/.test(exerciseName)) return 'posterior';
      if (/pull-up|pull up|pulldown|row|lat|trap pull|face pull|rear delt|superman|band pull|y-t-w/.test(exerciseName)) return 'back';

      const primaryMuscles = String(muscleData[name]?.primary || '').toLowerCase();
      if (/pectoralis/.test(primaryMuscles)) return 'chest';
      if (/biceps/.test(primaryMuscles)) return 'biceps';
      if (/triceps/.test(primaryMuscles)) return 'triceps';
      if (/deltoid|rotator cuff/.test(primaryMuscles)) return 'shoulders';
      if (/quadriceps|calves/.test(primaryMuscles)) return 'quads';
      if (/hamstrings|gluteus|erector spinae/.test(primaryMuscles)) return 'posterior';
      if (/latissimus|rhomboid|trapezius/.test(primaryMuscles)) return 'back';
      return null;
    };

    const getPostExhaustionGroups = (focusPool) => {
      if (Array.isArray(focusPool)) {
        const grouped = focusPool.reduce((families, exerciseName) => {
          const family = getPostExhaustionMuscleFamily(exerciseName);
          if (!family) return families;
          if (!families[family]) families[family] = [];
          families[family].push(exerciseName);
          return families;
        }, {});

        return Object.entries(grouped)
          .filter(([, group]) => group.length > 1)
          .map(([key, group]) => ({ key, main: group, secondary: group }));
      }

      if (Array.isArray(focusPool?.main) && Array.isArray(focusPool?.secondary)) {
        return focusPool.main
          .map((mainExercise) => {
            const family = getPostExhaustionMuscleFamily(mainExercise);
            return {
              key: family || mainExercise,
              main: [mainExercise],
              secondary: focusPool.secondary.filter((secondaryExercise) => (
                family && getPostExhaustionMuscleFamily(secondaryExercise) === family
              ))
            };
          })
          .filter((group) => group.secondary.length > 0);
      }

      return Object.entries(focusPool || {})
        .filter(([, group]) => Array.isArray(group?.main) && Array.isArray(group?.secondary))
        .map(([key, group]) => ({ key, main: group.main, secondary: group.secondary }))
        .filter((group) => group.main.length > 0 && group.secondary.length > 0);
    };

    const choosePostExhaustionPartner = (pool = [], mainExercise = '') => {
      const available = pool.filter((exerciseName) => normalizeExerciseName(exerciseName) !== normalizeExerciseName(mainExercise));
      const isolationFirst = available.filter((exerciseName) => (
        /fly|flies|curl|extension|raise|rotation|pushdown|leg extension|leg curl|calf|cable/.test(String(exerciseName).toLowerCase())
      ));
      const chosenPool = isolationFirst.length > 0 ? isolationFirst : available;
      return chosenPool[Math.floor(Math.random() * chosenPool.length)] || null;
    };

    const buildPostExhaustionPair = () => {
      const focusPool = usesBodyweightSystem
        ? exercises
        : filterExercisePoolForExperience(exerciseDatabase[settings.goal][settings.equipment][settings.focus]);
      const postExhaustionGroups = getPostExhaustionGroups(focusPool);
      const eligibleGroups = postExhaustionGroups.filter((group) => group.main.length > 0 && group.secondary.length > 0);
      if (eligibleGroups.length === 0) return false;

      const mainGroup = eligibleGroups[Math.floor(Math.random() * eligibleGroups.length)];
      const mainExercise = mainGroup.main[Math.floor(Math.random() * mainGroup.main.length)];
      const partnerExercise = choosePostExhaustionPartner(mainGroup.secondary, mainExercise);
      if (!mainExercise || !partnerExercise) return false;

      // Post-exhaustion is a same-muscle superset even when the user picked straight sets.
      pairs.push(createExercise('A1', mainExercise, true));
      pairs.push(createExercise('A2', partnerExercise, true));

      const fillerSource = usesBodyweightSystem
        ? exercises
        : postExhaustionGroups.flatMap((group) => [...group.main, ...group.secondary]);
      const fillerPool = [...new Set(fillerSource)]
        .filter((exerciseName) => (
          normalizeExerciseName(exerciseName) !== normalizeExerciseName(mainExercise)
          && normalizeExerciseName(exerciseName) !== normalizeExerciseName(partnerExercise)
        ));
      if (!usesBodyweightSystem) {
        fillerPool.sort(() => Math.random() - 0.5);
      }

      if (settings.workoutStyle === 'paired') {
        for (let i = 0; i < 4 && i < fillerPool.length; i += 2) {
          const pairLetter = String.fromCharCode(66 + Math.floor(i / 2));
          pairs.push(createExercise(`${pairLetter}1`, fillerPool[i], false));
          if (fillerPool[i + 1]) pairs.push(createExercise(`${pairLetter}2`, fillerPool[i + 1], false));
        }
      } else {
        for (let i = 0; i < 3 && i < fillerPool.length; i++) {
          const letter = String.fromCharCode(66 + i);
          pairs.push(createExercise(letter, fillerPool[i], false));
        }
      }

      return true;
    };
    
    const usesForcedPostExhaustionPair = (
      settings.goal === 'build-muscle'
      && mainScheme?.name === buildMuscleSchemes['post-exhaustion'].name
      && buildPostExhaustionPair()
    );

    if (usesForcedPostExhaustionPair) {
      // The main same-muscle pair is already assembled above.
    } else if (usesBodyweightSystem) {
      const orderedBodyweightExercises = [...exercises];
      
      if (settings.workoutStyle === 'paired') {
        for (let i = 0; i < 6 && i < orderedBodyweightExercises.length; i += 2) {
          const pairLetter = String.fromCharCode(65 + Math.floor(i / 2));
          const isMainPair = i === 0;
          if (orderedBodyweightExercises[i]) pairs.push(createExercise(`${pairLetter}1`, orderedBodyweightExercises[i], isMainPair));
          if (orderedBodyweightExercises[i + 1]) pairs.push(createExercise(`${pairLetter}2`, orderedBodyweightExercises[i + 1], isMainPair));
        }
      } else {
        for (let i = 0; i < numStraight && i < orderedBodyweightExercises.length; i++) {
          const letter = String.fromCharCode(65 + i);
          pairs.push(createExercise(letter, orderedBodyweightExercises[i], i === 0));
        }
      }
    } else {
      const focusData = filterExercisePoolForExperience(exerciseDatabase[settings.goal][settings.equipment][settings.focus]);
      
      if (settings.workoutStyle === 'paired') {
        if (settings.focus === 'chest-back') {
          // Power + Chest&Back uses 3-tier A/B/C structure
          if (settings.goal === 'fat-loss' && focusData.plyometric) {
            const plyoList = [...focusData.plyometric];
            const mainPowerList = [...focusData.mainPowerLift];
            const speedStrengthList = [...focusData.speedStrength];
            
            // A = Plyometric (3×3)
            if (plyoList.length > 0) {
              const plyoEx = plyoList[Math.floor(Math.random() * plyoList.length)];
              pairs.push(createExercise('A', plyoEx, false));
            }
            
            // B = Main Power Lift (gets MAIN power scheme)
            let chosenMainEx = null;
            if (mainPowerList.length > 0) {
              chosenMainEx = mainPowerList[Math.floor(Math.random() * mainPowerList.length)];
              pairs.push(createExercise('B', chosenMainEx, true));
            }
            
            // C = Speed-Strength Lift (gets secondary power scheme) — avoid same exercise as B
            if (speedStrengthList.length > 0) {
              const filteredSpeed = chosenMainEx ? speedStrengthList.filter(ex => ex !== chosenMainEx) : speedStrengthList;
              const speedPool = filteredSpeed.length > 0 ? filteredSpeed : speedStrengthList;
              const speedEx = speedPool[Math.floor(Math.random() * speedPool.length)];
              pairs.push(createExercise('C', speedEx, false));
            }
            
            // D = Posterior Chain Accessory (gets secondary power scheme)
            const posteriorList = focusData.posteriorAccessory ? [...focusData.posteriorAccessory] : [];
            if (posteriorList.length > 0) {
              const postEx = posteriorList[Math.floor(Math.random() * posteriorList.length)];
              pairs.push(createExercise('D', postEx, false));
            }
          } else {
            // Non-Power workouts: Regular chest/back paired logic
            const chestMain = [...focusData.chest.main];
            const chestSecondary = [...focusData.chest.secondary];
            const backMain = [...focusData.back.main];
            const backSecondary = [...focusData.back.secondary];
            
            for (let i = 0; i < numPairs; i++) {
              const pairLetter = String.fromCharCode(65 + i);
              const isMainPair = i === 0;
              
              if (isMainPair) {
                const chestEx = chestMain[Math.floor(Math.random() * chestMain.length)];
                const backEx = backMain[Math.floor(Math.random() * backMain.length)];
                pairs.push(createExercise(`${pairLetter}1`, chestEx, true));
                pairs.push(createExercise(`${pairLetter}2`, backEx, true));
              } else {
                const chestEx = chestSecondary.length > 0 ? chestSecondary[Math.floor(Math.random() * chestSecondary.length)] : chestMain[Math.floor(Math.random() * chestMain.length)];
                const backEx = backSecondary.length > 0 ? backSecondary[Math.floor(Math.random() * backSecondary.length)] : backMain[Math.floor(Math.random() * backMain.length)];
                pairs.push(createExercise(`${pairLetter}1`, chestEx, false));
                pairs.push(createExercise(`${pairLetter}2`, backEx, false));
              }
            }
          }
        } else if (settings.focus === 'legs') {
          // Power + Legs uses special 3-tier A/B/C structure (regardless of paired/straight setting)
          if (settings.goal === 'fat-loss' && focusData.plyometric) {
            const plyoList = [...focusData.plyometric];
            const mainPowerList = [...focusData.mainPowerLift];
            const speedStrengthList = [...focusData.speedStrength];
            
            // A = Plyometric (3×3)
            if (plyoList.length > 0) {
              const plyoEx = plyoList[Math.floor(Math.random() * plyoList.length)];
              pairs.push(createExercise('A', plyoEx, false));
            }
            
            // B = Main Power Lift (gets MAIN power scheme)
            if (mainPowerList.length > 0) {
              const mainEx = mainPowerList[Math.floor(Math.random() * mainPowerList.length)];
              pairs.push(createExercise('B', mainEx, true));
            }
            
            // C = Speed-Strength Lift (gets secondary power scheme)
            if (speedStrengthList.length > 0) {
              const speedEx = speedStrengthList[Math.floor(Math.random() * speedStrengthList.length)];
              pairs.push(createExercise('C', speedEx, false));
            }
            
            // D = Posterior Chain Accessory (gets secondary power scheme)
            const posteriorList = focusData.posteriorAccessory ? [...focusData.posteriorAccessory] : [];
            if (posteriorList.length > 0) {
              const postEx = posteriorList[Math.floor(Math.random() * posteriorList.length)];
              pairs.push(createExercise('D', postEx, false));
            }
          } else {
            // Non-Power workouts: Regular quads/hamstrings paired logic
            const quadsMain = [...focusData.quads.main];
            const quadsSecondary = [...focusData.quads.secondary];
            const hamstringsMain = [...focusData.hamstrings.main];
            const hamstringsSecondary = [...focusData.hamstrings.secondary];
            
            for (let i = 0; i < numPairs; i++) {
              const pairLetter = String.fromCharCode(65 + i);
              const isMainPair = i === 0;
              
              if (isMainPair) {
                const quadEx = quadsMain[Math.floor(Math.random() * quadsMain.length)];
                const hamEx = hamstringsMain[Math.floor(Math.random() * hamstringsMain.length)];
                pairs.push(createExercise(`${pairLetter}1`, quadEx, true));
                pairs.push(createExercise(`${pairLetter}2`, hamEx, true));
              } else {
                const quadEx = quadsSecondary.length > 0 ? quadsSecondary[Math.floor(Math.random() * quadsSecondary.length)] : quadsMain[Math.floor(Math.random() * quadsMain.length)];
                const hamEx = hamstringsSecondary.length > 0 ? hamstringsSecondary[Math.floor(Math.random() * hamstringsSecondary.length)] : hamstringsMain[Math.floor(Math.random() * hamstringsMain.length)];
                pairs.push(createExercise(`${pairLetter}1`, quadEx, false));
                pairs.push(createExercise(`${pairLetter}2`, hamEx, false));
              }
            }
          }
        } else if (settings.focus === 'arms') {
          // Power + Arms uses 3-tier A/B/C/D structure
          if (settings.goal === 'fat-loss' && focusData.plyometric) {
            const plyoList = [...focusData.plyometric];
            const mainPowerList = [...focusData.mainPowerLift];
            const speedStrengthList = [...focusData.speedStrength];
            
            // A = Plyometric (3×3)
            if (plyoList.length > 0) {
              const plyoEx = plyoList[Math.floor(Math.random() * plyoList.length)];
              pairs.push(createExercise('A', plyoEx, false));
            }
            
            // B = Main Power Lift (gets MAIN power scheme)
            let chosenMainEx = null;
            if (mainPowerList.length > 0) {
              chosenMainEx = mainPowerList[Math.floor(Math.random() * mainPowerList.length)];
              pairs.push(createExercise('B', chosenMainEx, true));
            }
            
            // C = Speed-Strength Lift — avoid same exercise as B
            if (speedStrengthList.length > 0) {
              const filteredSpeed = chosenMainEx ? speedStrengthList.filter(ex => ex !== chosenMainEx) : speedStrengthList;
              const speedPool = filteredSpeed.length > 0 ? filteredSpeed : speedStrengthList;
              const speedEx = speedPool[Math.floor(Math.random() * speedPool.length)];
              pairs.push(createExercise('C', speedEx, false));
            }
            
            // D = Rotator Cuff Accessory
            const posteriorList = focusData.posteriorAccessory ? [...focusData.posteriorAccessory] : [];
            if (posteriorList.length > 0) {
              const postEx = posteriorList[Math.floor(Math.random() * posteriorList.length)];
              pairs.push(createExercise('D', postEx, false));
            }
          } else {
          // Non-Power workouts: Regular biceps/triceps/shoulders paired logic
          const bicepsMain = [...focusData.biceps.main];
          const bicepsSecondary = [...focusData.biceps.secondary];
          const tricepsMain = [...focusData.triceps.main];
          const tricepsSecondary = [...focusData.triceps.secondary];
          const shouldersMain = focusData.shoulders ? [...focusData.shoulders.main] : [];
          const shouldersSecondary = focusData.shoulders ? [...focusData.shoulders.secondary] : [];
          
          // Randomly choose between two workout structures
          const workoutOption = Math.random() < 0.5 ? 1 : 2;
          
          if (workoutOption === 1) {
            // Option 1: A1 Biceps Main + A2 Triceps Main, B1 Shoulders Main (secondary scheme) + B2 Biceps Secondary, C1/C2 Secondary
            for (let i = 0; i < numPairs; i++) {
              const pairLetter = String.fromCharCode(65 + i);
              
              if (i === 0) {
                const biEx = bicepsMain.length > 0 ? bicepsMain[Math.floor(Math.random() * bicepsMain.length)] : bicepsSecondary[Math.floor(Math.random() * bicepsSecondary.length)];
                const triEx = tricepsMain.length > 0 ? tricepsMain[Math.floor(Math.random() * tricepsMain.length)] : tricepsSecondary[Math.floor(Math.random() * tricepsSecondary.length)];
                pairs.push(createExercise(`${pairLetter}1`, biEx, true));
                pairs.push(createExercise(`${pairLetter}2`, triEx, true));
              } else if (i === 1 && shouldersMain.length > 0) {
                const shoulderEx = shouldersMain[Math.floor(Math.random() * shouldersMain.length)];
                const biEx = bicepsSecondary.length > 0 ? bicepsSecondary[Math.floor(Math.random() * bicepsSecondary.length)] : bicepsMain[Math.floor(Math.random() * bicepsMain.length)];
                pairs.push(createExercise(`${pairLetter}1`, shoulderEx, false));
                pairs.push(createExercise(`${pairLetter}2`, biEx, false));
              } else {
                const biEx = bicepsSecondary.length > 0 ? bicepsSecondary[Math.floor(Math.random() * bicepsSecondary.length)] : bicepsMain[Math.floor(Math.random() * bicepsMain.length)];
                const triEx = tricepsSecondary.length > 0 ? tricepsSecondary[Math.floor(Math.random() * tricepsSecondary.length)] : tricepsMain[Math.floor(Math.random() * tricepsMain.length)];
                pairs.push(createExercise(`${pairLetter}1`, biEx, false));
                pairs.push(createExercise(`${pairLetter}2`, triEx, false));
              }
            }
          } else {
            // Option 2: A1 Shoulder Main + A2 Biceps Main, B1 Triceps (secondary scheme) + B2 Biceps Secondary, C1/C2 Secondary
            for (let i = 0; i < numPairs; i++) {
              const pairLetter = String.fromCharCode(65 + i);
              
              if (i === 0 && shouldersMain.length > 0) {
                const shoulderEx = shouldersMain[Math.floor(Math.random() * shouldersMain.length)];
                const biEx = bicepsMain.length > 0 ? bicepsMain[Math.floor(Math.random() * bicepsMain.length)] : bicepsSecondary[Math.floor(Math.random() * bicepsSecondary.length)];
                pairs.push(createExercise(`${pairLetter}1`, shoulderEx, true));
                pairs.push(createExercise(`${pairLetter}2`, biEx, true));
              } else if (i === 1) {
                const triEx = tricepsMain.length > 0 ? tricepsMain[Math.floor(Math.random() * tricepsMain.length)] : tricepsSecondary[Math.floor(Math.random() * tricepsSecondary.length)];
                const biEx = bicepsSecondary.length > 0 ? bicepsSecondary[Math.floor(Math.random() * bicepsSecondary.length)] : bicepsMain[Math.floor(Math.random() * bicepsMain.length)];
                pairs.push(createExercise(`${pairLetter}1`, triEx, false));
                pairs.push(createExercise(`${pairLetter}2`, biEx, false));
              } else {
                const triEx = tricepsSecondary.length > 0 ? tricepsSecondary[Math.floor(Math.random() * tricepsSecondary.length)] : tricepsMain[Math.floor(Math.random() * tricepsMain.length)];
                const shoulderEx = shouldersSecondary.length > 0 ? shouldersSecondary[Math.floor(Math.random() * shouldersSecondary.length)] : (tricepsSecondary.length > 0 ? tricepsSecondary[Math.floor(Math.random() * tricepsSecondary.length)] : bicepsSecondary[Math.floor(Math.random() * bicepsSecondary.length)]);
                pairs.push(createExercise(`${pairLetter}1`, triEx, false));
                pairs.push(createExercise(`${pairLetter}2`, shoulderEx, false));
              }
            }
          }
          }
        } else {
          // Power + Full Body / Upper Body with 3-tier structure
          if (settings.goal === 'fat-loss' && focusData.plyometric) {
            const plyoList = [...focusData.plyometric];
            const mainPowerList = [...focusData.mainPowerLift];
            const speedStrengthList = [...focusData.speedStrength];
            
            // A = Plyometric (3×3)
            if (plyoList.length > 0) {
              const plyoEx = plyoList[Math.floor(Math.random() * plyoList.length)];
              pairs.push(createExercise('A', plyoEx, false));
            }
            
            // B = Main Power Lift (gets MAIN power scheme)
            let chosenMainEx = null;
            if (mainPowerList.length > 0) {
              chosenMainEx = mainPowerList[Math.floor(Math.random() * mainPowerList.length)];
              pairs.push(createExercise('B', chosenMainEx, true));
            }
            
            // C = Speed-Strength Lift (gets secondary power scheme) — avoid same exercise as B
            if (speedStrengthList.length > 0) {
              const filteredSpeed = chosenMainEx ? speedStrengthList.filter(ex => ex !== chosenMainEx) : speedStrengthList;
              const speedPool = filteredSpeed.length > 0 ? filteredSpeed : speedStrengthList;
              const speedEx = speedPool[Math.floor(Math.random() * speedPool.length)];
              pairs.push(createExercise('C', speedEx, false));
            }
            
            // D = Posterior Chain Accessory (gets secondary power scheme)
            const posteriorList = focusData.posteriorAccessory ? [...focusData.posteriorAccessory] : [];
            if (posteriorList.length > 0) {
              const postEx = posteriorList[Math.floor(Math.random() * posteriorList.length)];
              pairs.push(createExercise('D', postEx, false));
            }
          } else {
          const main = [...focusData.main];
          const secondary = [...focusData.secondary];
          
          // For Power workouts (upper-body etc.): Plyometric is standalone A, main programming starts at B
          if (settings.goal === 'fat-loss') {
            const nonPlyoMain = main.filter(ex => !plyometricExercises.includes(ex));
            const nonPlyoSecondary = secondary.filter(ex => !plyometricExercises.includes(ex));
            
            // A = Standalone plyometric exercise (3×3, not main)
            if (plyoExercises.length > 0) {
              const plyoEx = plyoExercises[Math.floor(Math.random() * plyoExercises.length)];
              pairs.push(createExercise('A', plyoEx, false));
            }
            
            const shuffledMain = nonPlyoMain.sort(() => Math.random() - 0.5);
            const shuffledSecondary = nonPlyoSecondary.sort(() => Math.random() - 0.5);
            
            // B1/B2 = First MAIN pair (gets main power scheme)
            // C1/C2, D1/D2 = Secondary pairs
            let mainIndex = 0;
            let secIndex = 0;
            
            for (let pairNum = 0; pairNum < numPairs; pairNum++) {
              const pairLetter = String.fromCharCode(66 + pairNum); // Start at B
              const isMainPair = pairNum === 0;
              
              // Pick first exercise of pair
              let ex1 = null;
              if (mainIndex < shuffledMain.length) {
                ex1 = shuffledMain[mainIndex];
                mainIndex++;
              } else if (secIndex < shuffledSecondary.length) {
                ex1 = shuffledSecondary[secIndex];
                secIndex++;
              }
              
              // Pick second exercise of pair
              let ex2 = null;
              if (mainIndex < shuffledMain.length) {
                ex2 = shuffledMain[mainIndex];
                mainIndex++;
              } else if (secIndex < shuffledSecondary.length) {
                ex2 = shuffledSecondary[secIndex];
                secIndex++;
              }
              
              if (ex1) pairs.push(createExercise(`${pairLetter}1`, ex1, isMainPair));
              if (ex2) pairs.push(createExercise(`${pairLetter}2`, ex2, isMainPair));
            }
          } else {
            // Non-Power workouts: Regular logic
            const shuffledMain = main.sort(() => Math.random() - 0.5);
            const shuffledSecondary = secondary.sort(() => Math.random() - 0.5);
            
            // First pair (A) uses main exercises
            if (shuffledMain.length >= 2) {
              pairs.push(createExercise('A1', shuffledMain[0], true));
              pairs.push(createExercise('A2', shuffledMain[1], true));
            } else if (shuffledMain.length === 1) {
              pairs.push(createExercise('A1', shuffledMain[0], true));
              if (shuffledSecondary.length > 0) {
                pairs.push(createExercise('A2', shuffledSecondary[0], true));
              }
            }
            
            // Remaining pairs (B, C) use secondary exercises
            let secondaryIndex = shuffledMain.length < 2 ? 1 : 0;
            for (let pairNum = 1; pairNum < numPairs; pairNum++) {
              const pairLetter = String.fromCharCode(65 + pairNum);
              if (secondaryIndex < shuffledSecondary.length) {
                pairs.push(createExercise(`${pairLetter}1`, shuffledSecondary[secondaryIndex], false));
                secondaryIndex++;
              }
              if (secondaryIndex < shuffledSecondary.length) {
                pairs.push(createExercise(`${pairLetter}2`, shuffledSecondary[secondaryIndex], false));
                secondaryIndex++;
              }
            }
          }
          }
        }
      } else {
        // Straight sets
        
        // Power + Legs/Full-Body/Upper-Body/Chest-Back uses the 3-tier A/B/C structure regardless of paired/straight
        if (settings.goal === 'fat-loss' && (settings.focus === 'legs' || settings.focus === 'full-body' || settings.focus === 'upper-body' || settings.focus === 'chest-back' || settings.focus === 'arms') && focusData.plyometric) {
          const plyoList = [...focusData.plyometric];
          const mainPowerList = [...focusData.mainPowerLift];
          const speedStrengthList = [...focusData.speedStrength];
          
          // A = Plyometric (3×3)
          if (plyoList.length > 0) {
            const plyoEx = plyoList[Math.floor(Math.random() * plyoList.length)];
            pairs.push(createExercise('A', plyoEx, false));
          }
          
          // B = Main Power Lift (gets MAIN power scheme)
          let chosenMainEx = null;
          if (mainPowerList.length > 0) {
            chosenMainEx = mainPowerList[Math.floor(Math.random() * mainPowerList.length)];
            pairs.push(createExercise('B', chosenMainEx, true));
          }
          
          // C = Speed-Strength Lift (gets secondary power scheme) — avoid same exercise as B
          if (speedStrengthList.length > 0) {
            const filteredSpeed = chosenMainEx ? speedStrengthList.filter(ex => ex !== chosenMainEx) : speedStrengthList;
            const speedPool = filteredSpeed.length > 0 ? filteredSpeed : speedStrengthList;
            const speedEx = speedPool[Math.floor(Math.random() * speedPool.length)];
            pairs.push(createExercise('C', speedEx, false));
          }
          
          // D = Posterior Chain Accessory (gets secondary power scheme)
          const posteriorList = focusData.posteriorAccessory ? [...focusData.posteriorAccessory] : [];
          if (posteriorList.length > 0) {
            const postEx = posteriorList[Math.floor(Math.random() * posteriorList.length)];
            pairs.push(createExercise('D', postEx, false));
          }
        } else if (settings.focus === 'chest-back' || settings.focus === 'legs' || settings.focus === 'arms') {
          let mainExercises = [];
          let secondaryExercises = [];
          
          if (settings.focus === 'chest-back') {
            if (focusData.chest) {
              mainExercises = [...focusData.chest.main, ...focusData.back.main];
              secondaryExercises = [...focusData.chest.secondary, ...focusData.back.secondary];
            }
          } else if (settings.focus === 'legs') {
            if (focusData.quads) {
              mainExercises = [...focusData.quads.main, ...focusData.hamstrings.main];
              secondaryExercises = [...focusData.quads.secondary, ...focusData.hamstrings.secondary];
            }
          } else if (settings.focus === 'arms') {
            if (focusData.biceps) {
              mainExercises = [...focusData.biceps.main, ...focusData.triceps.main];
              secondaryExercises = [...focusData.biceps.secondary, ...focusData.triceps.secondary];
              if (focusData.shoulders) {
                mainExercises = [...mainExercises, ...focusData.shoulders.main];
                secondaryExercises = [...secondaryExercises, ...focusData.shoulders.secondary];
              }
            }
          }
          
          // For Power workouts: Plyometric is standalone A, main programming starts at B
          if (settings.goal === 'fat-loss') {
            const plyoExercises = [...mainExercises, ...secondaryExercises].filter(ex => plyometricExercises.includes(ex));
            const nonPlyoMain = mainExercises.filter(ex => !plyometricExercises.includes(ex));
            const nonPlyoSecondary = secondaryExercises.filter(ex => !plyometricExercises.includes(ex));
            
            // A = Standalone plyometric exercise (3×3, not main)
            if (plyoExercises.length > 0) {
              const plyoEx = plyoExercises[Math.floor(Math.random() * plyoExercises.length)];
              pairs.push(createExercise('A', plyoEx, false));
            }
            
            const shuffledMain = nonPlyoMain.sort(() => Math.random() - 0.5);
            const shuffledSecondary = nonPlyoSecondary.sort(() => Math.random() - 0.5);
            
            // B = First MAIN exercise (gets main power scheme)
            // C, D = Secondary exercises
            let letterIndex = 1; // Start at B (66 = 'B')
            if (shuffledMain.length > 0) {
              const letter = String.fromCharCode(65 + letterIndex);
              pairs.push(createExercise(letter, shuffledMain[0], true));
              letterIndex++;
            }
            
            // Add more main if available
            for (let i = 1; i < shuffledMain.length && letterIndex < 4; i++) {
              const letter = String.fromCharCode(65 + letterIndex);
              pairs.push(createExercise(letter, shuffledMain[i], false));
              letterIndex++;
            }
            
            // Add secondary exercises
            for (let i = 0; i < shuffledSecondary.length && letterIndex < 5; i++) {
              const letter = String.fromCharCode(65 + letterIndex);
              pairs.push(createExercise(letter, shuffledSecondary[i], false));
              letterIndex++;
            }
          } else {
            // Non-Power workouts: Regular logic
            const shuffledMain = mainExercises.sort(() => Math.random() - 0.5);
            const shuffledSecondary = secondaryExercises.sort(() => Math.random() - 0.5);
            
            if (shuffledMain.length > 0) {
              pairs.push(createExercise('A', shuffledMain[0], true));
            }
            
            let letterIndex = 1;
            for (let i = 0; i < 3 && i < shuffledSecondary.length; i++) {
              const letter = String.fromCharCode(65 + letterIndex);
              pairs.push(createExercise(letter, shuffledSecondary[i], false));
              letterIndex++;
            }
          }
        } else {
          const main = [...focusData.main];
          const secondary = [...focusData.secondary];
          
          // For Power workouts: Plyometric is standalone A, main programming starts at B
          if (settings.goal === 'fat-loss') {
            const plyoExercises = [...main, ...secondary].filter(ex => plyometricExercises.includes(ex));
            const nonPlyoMain = main.filter(ex => !plyometricExercises.includes(ex));
            const nonPlyoSecondary = secondary.filter(ex => !plyometricExercises.includes(ex));
            
            // A = Standalone plyometric exercise (3×3, not main)
            if (plyoExercises.length > 0) {
              const plyoEx = plyoExercises[Math.floor(Math.random() * plyoExercises.length)];
              pairs.push(createExercise('A', plyoEx, false));
            }
            
            const shuffledMain = nonPlyoMain.sort(() => Math.random() - 0.5);
            const shuffledSecondary = nonPlyoSecondary.sort(() => Math.random() - 0.5);
            
            // B = First MAIN exercise (gets main power scheme)
            // C, D = Secondary exercises
            let letterIndex = 1; // Start at B
            if (shuffledMain.length > 0) {
              const letter = String.fromCharCode(65 + letterIndex);
              pairs.push(createExercise(letter, shuffledMain[0], true));
              letterIndex++;
            }
            
            // Add more main if available
            for (let i = 1; i < shuffledMain.length && letterIndex < 4; i++) {
              const letter = String.fromCharCode(65 + letterIndex);
              pairs.push(createExercise(letter, shuffledMain[i], false));
              letterIndex++;
            }
            
            // Add secondary exercises
            for (let i = 0; i < shuffledSecondary.length && letterIndex < 5; i++) {
              const letter = String.fromCharCode(65 + letterIndex);
              pairs.push(createExercise(letter, shuffledSecondary[i], false));
              letterIndex++;
            }
          } else {
            // Non-Power workouts: Regular logic
            const shuffledMain = main.sort(() => Math.random() - 0.5);
            const shuffledSecondary = secondary.sort(() => Math.random() - 0.5);
            
            if (shuffledMain.length > 0) {
              pairs.push(createExercise('A', shuffledMain[0], true));
            }
            
            let letterIndex = 1;
            for (let i = 0; i < 3 && i < shuffledSecondary.length; i++) {
              const letter = String.fromCharCode(65 + letterIndex);
              pairs.push(createExercise(letter, shuffledSecondary[i], false));
              letterIndex++;
            }
          }
        }
      }
    }

    if (usesBodyweightSystem && settings.focus === 'full-body') {
      let corePool = getBodyweightCategoryPool('core', settings.experience, settings.equipment, settings.goal, generatedBodyweightSubtype);
      if (generatedBodyweightSubtype === 'home_workout') {
        corePool = getHomeWorkoutFullBodyCorePool(corePool);
      }
      const targetCoreCount = generatedBodyweightSubtype === 'home_workout' ? 2 : 1;
      const existingCoreCount = pairs.filter((exercise) => isBodyweightCoreExercise(exercise?.name)).length;
      for (let i = existingCoreCount; i < targetCoreCount; i++) {
        const coreExercise = corePool.find((exerciseName) => !usedExerciseNames.has(normalizeExerciseName(exerciseName))) || corePool[0];
        if (!coreExercise) break;
        const currentExerciseCount = pairs.filter((exercise) => exercise?.name).length;
        const coreLabel = settings.workoutStyle === 'paired'
          ? `${String.fromCharCode(65 + Math.floor(currentExerciseCount / 2))}${(currentExerciseCount % 2) + 1}`
          : String.fromCharCode(65 + currentExerciseCount);
        pairs.push(createExercise(coreLabel, coreExercise, false));
      }
    }
    
    const applyExerciseSpecificPrescription = (exercise) => {
      const exerciseName = String(exercise?.name || '').toLowerCase();
      const timedCoreByLevel = {
        beginner: '3-5 x 20-30s',
        intermediate: '3-5 x 30s',
        advanced: '3-5 x 60s'
      };
      const coreOverrides = {
        plank: {
          setsReps: timedCoreByLevel[settings.experience] || timedCoreByLevel.beginner,
          tempo: '-',
          rest: exercise.rest || '45-60 sec',
          schemeName: 'Timed Core Hold',
          schemeDescription: 'Brace hard and maintain a clean neutral position for the full hold.'
        },
        'side plank': {
          setsReps: timedCoreByLevel[settings.experience] || timedCoreByLevel.beginner,
          tempo: '-',
          rest: exercise.rest || '45-60 sec',
          schemeName: 'Timed Core Hold',
          schemeDescription: 'Hold a stacked side-body position with steady oblique tension.'
        },
        'reverse crunch': {
          setsReps: '3-4 x 12-20',
          tempo: '-',
          rest: exercise.rest || '45-60 sec',
          schemeName: 'Core Control',
          schemeDescription: 'Curl the pelvis with control instead of swinging the legs.'
        },
        'bicycle crunch': {
          setsReps: '2-4 x 20-40 total reps',
          tempo: '-',
          rest: exercise.rest || '45-60 sec',
          schemeName: 'Rotational Core',
          schemeDescription: 'Rotate with control and keep steady trunk tension across every rep.'
        },
        'dead bug': {
          setsReps: '2-4 x 6-12 / side',
          tempo: 'Slow controlled',
          rest: exercise.rest || '45-60 sec',
          schemeName: 'Core Control',
          schemeDescription: 'Move slowly while keeping the ribs down and lower back controlled.'
        },
        'bird dog': {
          setsReps: '2-4 x 6-12 / side',
          tempo: 'Slow controlled',
          rest: exercise.rest || '45-60 sec',
          schemeName: 'Core Stability',
          schemeDescription: 'Reach long without rotating through the hips or ribcage.'
        },
        'mountain climbers': {
          setsReps: '3-4 x 20-40',
          tempo: '-',
          rest: exercise.rest || '45-60 sec',
          schemeName: 'Core Conditioning',
          schemeDescription: 'Drive the knees while keeping plank position and shoulder control.'
        },
        'front lever': {
          setsReps: '4-6 x 8-15 sec',
          tempo: '-',
          rest: exercise.rest || '90-120 sec',
          schemeName: 'Skill Strength Hold',
          schemeDescription: 'Hold a clean hollow-body line with active lats and locked-in scapular control.'
        },
        'front lever row': {
          setsReps: '4-5 x 4-8s',
          tempo: '-',
          rest: exercise.rest || '90-120 sec',
          schemeName: 'Skill Strength Pull',
          schemeDescription: 'Pull from a rigid lever position while keeping the hips high and trunk braced.'
        }
      };
      const coreOverride = coreOverrides[exerciseName];
      if (coreOverride) {
        return {
          ...exercise,
          ...coreOverride,
          schemeExample: undefined
        };
      }
      if (String(exercise?.name || '').toLowerCase() !== 'wall sit') return exercise;
      return {
        ...exercise,
        setsReps: '3-5 × 30-60s',
        tempo: '—',
        rest: exercise.rest || '60-90 sec',
        schemeName: 'Timed Isometric Hold',
        schemeDescription: 'Hold position for time with steady full-body tension and controlled breathing.',
        schemeExample: undefined
      };
    };

    const validPairs = pairs.filter(exercise => exercise?.name).map(applyExerciseSpecificPrescription);
    if (validPairs.length === 0) {
      alert('No exercises found for this experience level. Please try a higher experience level or different settings.');
      return;
    }
    
    resetWorkoutSession();
    setBodyweightWorkoutSubtype(generatedBodyweightSubtype);
    setWorkout(validPairs);
    setShowWorkout(true);
    window.scrollTo(0, 0);
  };

  // Get exercise-specific tempo phase descriptions
  const getTempoPhases = (exerciseName) => {
    const name = exerciseName.toLowerCase();
    // Squat variations — eccentric first (lowering down)
    if (name.includes('squat') || name.includes('lunge') || name.includes('bulgarian') || name.includes('leg press') || name.includes('step up') || name.includes('belt squat')) {
      return { concentricFirst: false, eccentric: '— lowering into the squat', bottom: '— at the bottom of the squat', concentric: '— standing back up', top: '— at the top, standing' };
    }
    // Deadlift / RDL — CONCENTRIC FIRST (pulling from floor)
    if (name.includes('deadlift') || name.includes('rdl') || name.includes('romanian') || name.includes('trap bar dead')) {
      return { concentricFirst: true, concentric: '— pulling the bar up from the floor', top: '— at lockout, standing tall', eccentric: '— lowering the bar back down', bottom: '— bar back at starting position' };
    }
    // Good morning / Back extensions / Reverse hyper — eccentric first
    if (name.includes('good morning') || name.includes('back extension') || name.includes('reverse hyper') || name.includes('snatch grip deficit')) {
      return { concentricFirst: false, eccentric: '— lowering the torso down', bottom: '— at the bottom stretch', concentric: '— raising the torso back up', top: '— at the top, torso upright' };
    }
    // Bench / Press (horizontal push) — eccentric first
    if (name.includes('bench') || name.includes('chest press') || name.includes('dumbbell press') || (name.includes('incline') && name.includes('press')) || name.includes('plate-loaded')) {
      return { concentricFirst: false, eccentric: '— lowering the bar to your chest', bottom: '— bar on chest / stretched position', concentric: '— pressing the bar up', top: '— at lockout, arms extended' };
    }
    // Push-ups — eccentric first
    if (name.includes('push-up') || name.includes('push up')) {
      return { concentricFirst: false, eccentric: '— lowering your body down', bottom: '— chest near the floor', concentric: '— pushing back up', top: '— at the top, arms extended' };
    }
    // Pull-ups / Chin-ups — CONCENTRIC FIRST (pulling up)
    if (name.includes('pull-up') || name.includes('chin up') || name.includes('chin-up')) {
      return { concentricFirst: true, concentric: '— pulling yourself up', top: '— at the top, chin over bar', eccentric: '— lowering yourself down', bottom: '— at the bottom, arms fully extended' };
    }
    // Lat pulldown — CONCENTRIC FIRST (pulling down)
    if (name.includes('pulldown') || name.includes('lat pull')) {
      return { concentricFirst: true, concentric: '— pulling the bar down to chest', top: '— bar at chest, lats squeezed', eccentric: '— letting the bar back up', bottom: '— arms fully extended overhead' };
    }
    // Rows — CONCENTRIC FIRST (pulling toward you)
    if (name.includes('row') || name.includes('face pull') || name.includes('pull-apart')) {
      return { concentricFirst: true, concentric: '— pulling the weight toward you', top: '— at peak contraction, squeezed', eccentric: '— lowering the weight away', bottom: '— arms extended, stretched position' };
    }
    // Curls — CONCENTRIC FIRST (curling up)
    if (name.includes('curl') || name.includes('bicep')) {
      return { concentricFirst: true, concentric: '— curling the weight up', top: '— at the top, biceps squeezed', eccentric: '— lowering the weight down', bottom: '— arms fully extended' };
    }
    // Triceps pushdown — CONCENTRIC FIRST
    if (name.includes('pushdown') || name.includes('cable tricep')) {
      return { concentricFirst: true, concentric: '— pushing the weight down', top: '— at full extension, triceps squeezed', eccentric: '— letting the weight back up', bottom: '— at the stretched position' };
    }
    // Triceps (other) — eccentric first
    if (name.includes('tricep') || name.includes('skull crush') || name.includes('kickback') || name.includes('dip') || name.includes('close-grip bench')) {
      return { concentricFirst: false, eccentric: '— lowering / extending the weight', bottom: '— at the stretched position', concentric: '— pressing / extending up', top: '— at lockout, triceps squeezed' };
    }
    // Overhead press — eccentric first
    if (name.includes('overhead') || name.includes('shoulder press') || name.includes('landmine press') || name.includes('clean & press')) {
      return { concentricFirst: false, eccentric: '— lowering the weight down', bottom: '— at shoulder level', concentric: '— pressing overhead', top: '— at lockout, arms overhead' };
    }
    // Olympic lifts / Cleans / Snatches / Pulls — CONCENTRIC FIRST
    if (name.includes('clean') || name.includes('snatch') || name.includes('halting pull') || name.includes('high pull')) {
      return { concentricFirst: true, concentric: '— pulling / catching the bar explosively', top: '— at the catch / finish position', eccentric: '— lowering the bar back down', bottom: '— bar at starting position' };
    }
    // Leg curl / Nordic — eccentric first
    if (name.includes('leg curl') || name.includes('nordic') || name.includes('glute ham')) {
      return { concentricFirst: false, eccentric: '— lowering (extending the legs)', bottom: '— legs extended / stretched', concentric: '— curling the weight up', top: '— at peak contraction' };
    }
    // Leg extension — CONCENTRIC FIRST
    if (name.includes('leg extension')) {
      return { concentricFirst: true, concentric: '— extending the legs up', top: '— at full extension, quads squeezed', eccentric: '— lowering the weight down', bottom: '— legs bent at the bottom' };
    }
    // Cable flies — eccentric first
    if (name.includes('fly') || name.includes('flies')) {
      return { concentricFirst: false, eccentric: '— opening arms / stretching', bottom: '— arms wide, chest stretched', concentric: '— bringing arms together', top: '— arms together, chest squeezed' };
    }
    // Default — eccentric first
    return { concentricFirst: false, eccentric: '— lowering phase', bottom: '— at the bottom position', concentric: '— lifting phase', top: '— at the top position' };
  };

  // Exercise Video Lookup — Google Drive file IDs
  // To add a video: upload to Google Drive → Share → Anyone with link → copy the file ID from the URL
  // URL format: https://drive.google.com/file/d/FILE_ID/view → just paste the FILE_ID below
  const exerciseVideos = {
    'Back Squat': '15WzZz9LNEw7mFWWS9DDKgyTYBRae9GzE',
    'Bench Press': '17H4W3kk67PHeHX_Zz8i-NLpQToXtoxtP',
    'Incline Dumbbell Press': '1vePfh35M7faomESNzSZ2OQGu6LMUAWoo',
    'Incline Dumbell Press': '1vePfh35M7faomESNzSZ2OQGu6LMUAWoo',
    'Barbell Curl': '1zpGTxdJZZmP8M79NQHZpHxNBKy3BSohQ',
    // 'Deadlift': 'YOUR_GOOGLE_DRIVE_FILE_ID_HERE',
    // Add more exercises as needed...
  };

  // Convert Google Drive file ID to embeddable video URL
  const getVideoUrl = (exerciseName) => {
    const fileId = exerciseVideos[exerciseName];
    if (!fileId) return null;
    return `https://drive.google.com/file/d/${fileId}/preview`;
  };

  // Animated Stick Figure Exercise Demo Component
  const ExerciseDemo = ({ exerciseName, onClose }) => {
    const [frame, setFrame] = useState(0);
    const [videoError, setVideoError] = useState(false);
    const totalFrames = 60;
    const videoUrl = getVideoUrl(exerciseName);
    const hasVideo = videoUrl && !videoError;
    
    useEffect(() => {
      if (!hasVideo) {
        const interval = setInterval(() => {
          setFrame(f => (f + 1) % totalFrames);
        }, 50);
        return () => clearInterval(interval);
      }
    }, [hasVideo]);
    
    // Progress cycles 0→1→0 for smooth back-and-forth
    const cycle = Math.abs((frame / (totalFrames / 2)) - 1);
    // progress: 0 = start position, 1 = end position
    const progress = cycle;
    
    const getExerciseAnimation = (name) => {
      const n = name.toLowerCase();
      
      // SQUAT PATTERN (standing → deep squat)
      if (n.includes('squat') || n.includes('lunge') || n.includes('bulgarian') || n.includes('leg press') || n.includes('belt squat')) {
        const kneeAngle = progress * 70;
        const hipDrop = progress * 45;
        const torsoLean = progress * 15;
        return {
          category: 'Squat Pattern',
          cues: ['Feet shoulder-width apart', 'Brace core, chest up', 'Push knees out over toes', 'Hips below parallel'],
          render: (
            <svg viewBox="0 0 200 260" className="w-full h-full">
              {/* Bar on back */}
              <line x1={70} y1={65 + hipDrop * 0.3 - torsoLean} x2={130} y2={65 + hipDrop * 0.3 - torsoLean} stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
              {/* Head */}
              <circle cx={100} cy={45 + hipDrop * 0.3} r={12} fill="none" stroke="white" strokeWidth="2.5" />
              {/* Torso */}
              <line x1={100} y1={57 + hipDrop * 0.3} x2={100 - torsoLean * 0.3} y2={120 + hipDrop * 0.5} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Upper arms (holding bar) */}
              <line x1={100} y1={70 + hipDrop * 0.3} x2={75} y2={65 + hipDrop * 0.3 - torsoLean} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={100} y1={70 + hipDrop * 0.3} x2={125} y2={65 + hipDrop * 0.3 - torsoLean} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Left leg */}
              <line x1={100 - torsoLean * 0.3} y1={120 + hipDrop * 0.5} x2={80 - progress * 10} y2={150 + hipDrop * 0.2} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={80 - progress * 10} y1={150 + hipDrop * 0.2} x2={75 - progress * 5} y2={210} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Right leg */}
              <line x1={100 - torsoLean * 0.3} y1={120 + hipDrop * 0.5} x2={120 + progress * 10} y2={150 + hipDrop * 0.2} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={120 + progress * 10} y1={150 + hipDrop * 0.2} x2={125 + progress * 5} y2={210} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Feet */}
              <line x1={70 - progress * 5} y1={210} x2={85 - progress * 5} y2={210} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={120 + progress * 5} y1={210} x2={135 + progress * 5} y2={210} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Floor */}
              <line x1={30} y1={212} x2={170} y2={212} stroke="#3f3f46" strokeWidth="1" />
            </svg>
          )
        };
      }
      
      // BENCH PRESS PATTERN (arms extended → bar to chest)
      if (n.includes('bench') || n.includes('chest press') || n.includes('dumbbell press') || (n.includes('incline') && n.includes('press')) || n.includes('plate-loaded')) {
        const armBend = progress * 50;
        const barDrop = progress * 35;
        return {
          category: 'Horizontal Press',
          cues: ['Retract shoulder blades', 'Feet flat on floor', 'Lower bar to mid-chest', 'Drive feet and press'],
          render: (
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Bench */}
              <rect x={50} y={130} width={100} height={8} rx={3} fill="#3f3f46" />
              <rect x={60} y={138} width={5} height={25} fill="#3f3f46" />
              <rect x={135} y={138} width={5} height={25} fill="#3f3f46" />
              {/* Body on bench */}
              <circle cx={125} cy={115} r={10} fill="none" stroke="white" strokeWidth="2.5" />
              <line x1={115} y1={120} x2={65} y2={128} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Legs */}
              <line x1={65} y1={128} x2={55} y2={150} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={55} y1={150} x2={50} y2={163} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Arms */}
              <line x1={105} y1={122} x2={105 - armBend * 0.2} y2={90 + barDrop} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={90} y1={125} x2={90 - armBend * 0.15} y2={90 + barDrop} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Bar */}
              <line x1={65} y1={88 + barDrop} x2={135} y2={88 + barDrop} stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
              {/* Floor */}
              <line x1={30} y1={164} x2={170} y2={164} stroke="#3f3f46" strokeWidth="1" />
            </svg>
          )
        };
      }
      
      // PUSH-UP PATTERN
      if (n.includes('push-up') || n.includes('push up') || n.includes('diamond')) {
        const bodyDrop = progress * 25;
        const armBend = progress * 30;
        return {
          category: 'Push Pattern',
          cues: ['Hands shoulder-width apart', 'Body in straight line', 'Core braced throughout', 'Chest touches floor'],
          render: (
            <svg viewBox="0 0 200 180" className="w-full h-full">
              {/* Head */}
              <circle cx={155} cy={75 + bodyDrop * 0.6} r={9} fill="none" stroke="white" strokeWidth="2.5" />
              {/* Torso (plank position) */}
              <line x1={148} y1={82 + bodyDrop * 0.6} x2={55} y2={90 + bodyDrop * 0.2} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Arms */}
              <line x1={140} y1={85 + bodyDrop * 0.5} x2={140} y2={115 + armBend * 0.1} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={140} y1={115 + armBend * 0.1} x2={140} y2={140} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Legs */}
              <line x1={55} y1={90 + bodyDrop * 0.2} x2={30} y2={95 + bodyDrop * 0.1} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Feet */}
              <circle cx={28} cy={95 + bodyDrop * 0.1} r={3} fill="white" />
              {/* Hands on ground */}
              <circle cx={140} cy={140} r={3} fill="#f97316" />
              {/* Floor */}
              <line x1={15} y1={142} x2={185} y2={142} stroke="#3f3f46" strokeWidth="1" />
            </svg>
          )
        };
      }
      
      // DEADLIFT PATTERN (bent over → standing)
      if (n.includes('deadlift') || n.includes('rdl') || n.includes('romanian') || n.includes('trap bar dead')) {
        const standUp = progress;
        const hipAngle = 60 - standUp * 55;
        const torsoAngle = hipAngle * 0.9;
        return {
          category: 'Hip Hinge',
          cues: ['Hinge at hips, flat back', 'Bar close to body', 'Drive through heels', 'Squeeze glutes at top'],
          render: (
            <svg viewBox="0 0 200 240" className="w-full h-full">
              {/* Head */}
              <circle cx={100 + torsoAngle * 0.6} cy={50 + (1 - standUp) * 40} r={11} fill="none" stroke="white" strokeWidth="2.5" />
              {/* Torso */}
              <line x1={100 + torsoAngle * 0.4} y1={60 + (1 - standUp) * 38} x2={100} y2={120 + (1 - standUp) * 10} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Arms hanging with bar */}
              <line x1={100 + torsoAngle * 0.5} y1={75 + (1 - standUp) * 30} x2={95 + torsoAngle * 0.2} y2={130 + (1 - standUp) * 40} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={100 + torsoAngle * 0.5} y1={75 + (1 - standUp) * 30} x2={105 + torsoAngle * 0.2} y2={130 + (1 - standUp) * 40} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Bar */}
              <line x1={70} y1={132 + (1 - standUp) * 42} x2={130} y2={132 + (1 - standUp) * 42} stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
              {/* Legs */}
              <line x1={100} y1={120 + (1 - standUp) * 10} x2={85} y2={160 + (1 - standUp) * 5} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={85} y1={160 + (1 - standUp) * 5} x2={80} y2={200} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={100} y1={120 + (1 - standUp) * 10} x2={115} y2={160 + (1 - standUp) * 5} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={115} y1={160 + (1 - standUp) * 5} x2={120} y2={200} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Feet */}
              <line x1={72} y1={200} x2={88} y2={200} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={112} y1={200} x2={128} y2={200} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Floor */}
              <line x1={30} y1={202} x2={170} y2={202} stroke="#3f3f46" strokeWidth="1" />
            </svg>
          )
        };
      }
      
      // PULL-UP / CHIN-UP PATTERN
      if (n.includes('pull-up') || n.includes('chin up') || n.includes('chin-up') || n.includes('pulldown') || n.includes('lat pull')) {
        const pullUp = progress;
        const armBend = pullUp * 55;
        const bodyRise = pullUp * 50;
        return {
          category: 'Vertical Pull',
          cues: ['Full grip on bar', 'Initiate with lats', 'Drive elbows down', 'Chin over bar at top'],
          render: (
            <svg viewBox="0 0 200 260" className="w-full h-full">
              {/* Bar */}
              <line x1={50} y1={30} x2={150} y2={30} stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
              {/* Hands */}
              <circle cx={80} cy={30} r={4} fill="white" />
              <circle cx={120} cy={30} r={4} fill="white" />
              {/* Arms */}
              <line x1={80} y1={30} x2={85 + armBend * 0.1} y2={55 + (1 - pullUp) * 15 - bodyRise} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={120} y1={30} x2={115 - armBend * 0.1} y2={55 + (1 - pullUp) * 15 - bodyRise} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Head */}
              <circle cx={100} cy={60 + (1 - pullUp) * 15 - bodyRise} r={11} fill="none" stroke="white" strokeWidth="2.5" />
              {/* Torso */}
              <line x1={100} y1={72 + (1 - pullUp) * 15 - bodyRise} x2={100} y2={135 + (1 - pullUp) * 15 - bodyRise} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Legs */}
              <line x1={100} y1={135 + (1 - pullUp) * 15 - bodyRise} x2={88} y2={185 + (1 - pullUp) * 15 - bodyRise} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={100} y1={135 + (1 - pullUp) * 15 - bodyRise} x2={112} y2={185 + (1 - pullUp) * 15 - bodyRise} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Feet */}
              <circle cx={88} cy={188 + (1 - pullUp) * 15 - bodyRise} r={3} fill="white" />
              <circle cx={112} cy={188 + (1 - pullUp) * 15 - bodyRise} r={3} fill="white" />
            </svg>
          )
        };
      }
      
      // ROW PATTERN
      if (n.includes('row') || n.includes('face pull') || n.includes('pull-apart')) {
        const pullBack = progress;
        return {
          category: 'Horizontal Pull',
          cues: ['Hinge forward ~45°', 'Retract shoulder blades', 'Pull to lower chest', 'Squeeze at the top'],
          render: (
            <svg viewBox="0 0 200 220" className="w-full h-full">
              {/* Head */}
              <circle cx={130} cy={55} r={10} fill="none" stroke="white" strokeWidth="2.5" />
              {/* Torso (bent over) */}
              <line x1={125} y1={64} x2={95} y2={115} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Arms pulling */}
              <line x1={118} y1={80} x2={115 - pullBack * 20} y2={100 + pullBack * 5} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={115 - pullBack * 20} y1={100 + pullBack * 5} x2={110 - pullBack * 30} y2={120 - pullBack * 20} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Bar */}
              <line x1={100 - pullBack * 30} y1={118 - pullBack * 18} x2={120 - pullBack * 30} y2={122 - pullBack * 20} stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
              {/* Legs */}
              <line x1={95} y1={115} x2={80} y2={155} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={80} y1={155} x2={78} y2={195} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={95} y1={115} x2={110} y2={155} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={110} y1={155} x2={112} y2={195} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Feet */}
              <line x1={70} y1={195} x2={86} y2={195} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={104} y1={195} x2={120} y2={195} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Floor */}
              <line x1={30} y1={197} x2={170} y2={197} stroke="#3f3f46" strokeWidth="1" />
            </svg>
          )
        };
      }
      
      // CURL PATTERN
      if (n.includes('curl') || n.includes('bicep')) {
        const curlUp = progress;
        const forearmAngle = curlUp * 130;
        return {
          category: 'Elbow Flexion',
          cues: ['Elbows pinned to sides', 'Control the negative', 'Squeeze at the top', 'Full extension at bottom'],
          render: (
            <svg viewBox="0 0 200 240" className="w-full h-full">
              {/* Head */}
              <circle cx={100} cy={35} r={11} fill="none" stroke="white" strokeWidth="2.5" />
              {/* Torso */}
              <line x1={100} y1={47} x2={100} y2={120} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Upper arms */}
              <line x1={100} y1={60} x2={75} y2={105} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={100} y1={60} x2={125} y2={105} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Forearms with curl */}
              <line x1={75} y1={105} x2={75 - Math.cos(forearmAngle * Math.PI / 180) * 40} y2={105 - Math.sin(forearmAngle * Math.PI / 180) * 40 + 40} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={125} y1={105} x2={125 + Math.cos(forearmAngle * Math.PI / 180) * 40} y2={105 - Math.sin(forearmAngle * Math.PI / 180) * 40 + 40} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Dumbbells */}
              <rect x={75 - Math.cos(forearmAngle * Math.PI / 180) * 40 - 5} y={105 - Math.sin(forearmAngle * Math.PI / 180) * 40 + 37} width={10} height={6} rx={2} fill="#f97316" />
              <rect x={125 + Math.cos(forearmAngle * Math.PI / 180) * 40 - 5} y={105 - Math.sin(forearmAngle * Math.PI / 180) * 40 + 37} width={10} height={6} rx={2} fill="#f97316" />
              {/* Legs */}
              <line x1={100} y1={120} x2={88} y2={175} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={88} y1={175} x2={85} y2={210} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={100} y1={120} x2={112} y2={175} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={112} y1={175} x2={115} y2={210} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Floor */}
              <line x1={30} y1={212} x2={170} y2={212} stroke="#3f3f46" strokeWidth="1" />
            </svg>
          )
        };
      }
      
      // DIPS PATTERN
      if (n.includes('dip')) {
        const dipDown = progress;
        const bodyDrop = dipDown * 35;
        return {
          category: 'Vertical Press',
          cues: ['Slight forward lean', 'Lower until upper arms parallel', 'Drive up through palms', 'Lock out at top'],
          render: (
            <svg viewBox="0 0 200 260" className="w-full h-full">
              {/* Parallel bars */}
              <line x1={60} y1={70} x2={60} y2={200} stroke="#3f3f46" strokeWidth="3" />
              <line x1={140} y1={70} x2={140} y2={200} stroke="#3f3f46" strokeWidth="3" />
              <line x1={50} y1={70} x2={70} y2={70} stroke="#3f3f46" strokeWidth="4" strokeLinecap="round" />
              <line x1={130} y1={70} x2={150} y2={70} stroke="#3f3f46" strokeWidth="4" strokeLinecap="round" />
              {/* Head */}
              <circle cx={100} cy={40 + bodyDrop} r={11} fill="none" stroke="white" strokeWidth="2.5" />
              {/* Arms on bars */}
              <line x1={100} y1={55 + bodyDrop} x2={65} y2={70} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={100} y1={55 + bodyDrop} x2={135} y2={70} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Hands */}
              <circle cx={65} cy={70} r={3} fill="#f97316" />
              <circle cx={135} cy={70} r={3} fill="#f97316" />
              {/* Torso */}
              <line x1={100} y1={55 + bodyDrop} x2={100} y2={120 + bodyDrop} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Legs */}
              <line x1={100} y1={120 + bodyDrop} x2={95} y2={170 + bodyDrop * 0.5} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={100} y1={120 + bodyDrop} x2={105} y2={170 + bodyDrop * 0.5} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx={95} cy={173 + bodyDrop * 0.5} r={3} fill="white" />
              <circle cx={105} cy={173 + bodyDrop * 0.5} r={3} fill="white" />
            </svg>
          )
        };
      }
      
      // DEFAULT — standing figure with generic movement
      const bob = progress * 15;
      return {
        category: 'Exercise',
        cues: ['Maintain proper form', 'Control the movement', 'Breathe steadily', 'Full range of motion'],
        render: (
          <svg viewBox="0 0 200 240" className="w-full h-full">
            <circle cx={100} cy={40 + bob * 0.3} r={11} fill="none" stroke="white" strokeWidth="2.5" />
            <line x1={100} y1={52 + bob * 0.3} x2={100} y2={120 + bob * 0.3} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={100} y1={70 + bob * 0.3} x2={70 - bob * 0.5} y2={100 + bob * 0.5} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={100} y1={70 + bob * 0.3} x2={130 + bob * 0.5} y2={100 + bob * 0.5} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={100} y1={120 + bob * 0.3} x2={85} y2={180} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={100} y1={120 + bob * 0.3} x2={115} y2={180} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={78} y1={180} x2={92} y2={180} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={108} y1={180} x2={122} y2={180} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={30} y1={182} x2={170} y2={182} stroke="#3f3f46" strokeWidth="1" />
          </svg>
        )
      };
    };
    
    const anim = getExerciseAnimation(exerciseName);
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-700">
            <div>
              <div className="text-white font-bold text-lg">{exerciseName}</div>
              <div className="text-orange-400 text-sm">{anim.category}</div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white flex items-center justify-center text-lg transition-colors">×</button>
          </div>
          {/* Animation / Video area */}
          {hasVideo ? (
            <div className="bg-zinc-800/50 flex justify-center">
              <iframe
                src={videoUrl}
                allow="autoplay"
                allowFullScreen
                onError={() => setVideoError(true)}
                className="w-full border-0"
                style={{ height: '300px' }}
              />
            </div>
          ) : (
          <div className="p-6 flex justify-center bg-zinc-800/50" style={{ height: '260px' }}>
            <div style={{ width: '200px', height: '240px' }}>
              {anim.render}
            </div>
          </div>
          )}
          {/* Form cues */}
          <div className="p-4 space-y-2">
            <div className="text-orange-400 font-semibold text-sm mb-2">Form Cues</div>
            {anim.cues.map((cue, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="text-orange-400 mt-0.5">•</span>
                <span>{cue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const OptionButton = ({ isSelected, onClick, title, subtitle }) => (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={`w-full rounded-3xl p-4 text-left transition-all ${
        isSelected
          ? 'scale-[1.01] border border-orange-200/50 bg-orange-300/[0.12] text-white shadow-[0_18px_70px_rgba(249,115,22,0.22)]'
          : 'border border-white/10 bg-white/[0.035] text-zinc-300 hover:-translate-y-1 hover:bg-white/[0.06]'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-bold text-lg tracking-tight">{title}</div>
          {subtitle && <div className="text-sm opacity-80 mt-1">{subtitle}</div>}
        </div>
        {isSelected && <CheckCircle2 className="h-5 w-5 text-orange-200" />}
      </div>
    </button>
  );

  const Logo = () => (
    <div className="relative grid h-12 w-12 place-items-center rounded-[1.35rem] bg-white/[0.05] shadow-[0_18px_70px_rgba(245,158,11,0.18)] ring-1 ring-white/12 backdrop-blur-xl">
      <div className="absolute inset-0 rounded-[1.35rem] bg-gradient-to-br from-amber-200 via-orange-300 to-orange-500 opacity-95" />
      <div className="absolute inset-[1px] rounded-[1.25rem] bg-gradient-to-br from-white/30 via-transparent to-black/20" />
      <Flame className="relative h-6 w-6 text-zinc-950" />
    </div>
  );

  const label = {
    goal: {
      'build-muscle': 'Build Muscle',
      strength: 'Strength',
      'fat-loss': 'Power',
      'v02-max': 'Conditioning'
    },
    experience: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' },
    equipment: {
      'full-gym': 'Full Gym',
      'barbells-only': 'Barbells Only',
      'dumbbells-only': 'Dumbbells / Kettlebells',
      'minimal-equipment': 'Minimal Equipment',
      'no-equipment': 'Bodyweight'
    },
    focus: {
      'full-body': 'Full Body',
      'upper-body': 'Upper Body',
      legs: 'Legs',
      'chest-back': 'Chest & Back',
      arms: 'Arms'
    },
    workoutStyle: { paired: 'Paired', straight: 'Straight Sets' },
    conditioningType: { cardio: 'Zone 2 Cardio', vo2max: 'VO2 Max Intervals' }
  };

  const goalOptions = [
    { value: 'build-muscle', title: 'Build Muscle', subtitle: 'Muscle growth focused, controlled high volume', icon: Layers },
    { value: 'strength', title: 'Strength', subtitle: 'Heavy loading, low reps, neural output', icon: Trophy },
    { value: 'fat-loss', title: 'Power', subtitle: 'Explosive lifts, speed, sport performance', icon: Zap },
    { value: 'v02-max', title: 'Conditioning', subtitle: 'Aerobic base or VO2 max intervals', icon: Waves }
  ];

  const conditioningOptions = [
    { value: 'cardio', title: 'Zone 2 Cardio', subtitle: 'Steady aerobic capacity', icon: Activity },
    { value: 'vo2max', title: 'VO2 Max', subtitle: 'High-intensity interval protocol', icon: Gauge }
  ];

  const experienceOptions = [
    { value: 'beginner', title: 'Beginner', subtitle: '0-1 years training', icon: User },
    { value: 'intermediate', title: 'Intermediate', subtitle: '1-3 years training', icon: BarChart3 },
    { value: 'advanced', title: 'Advanced', subtitle: '3+ years training', icon: Trophy }
  ];

  const equipmentOptions = [
    { value: 'full-gym', title: 'Full Gym', subtitle: 'Machines, barbells, dumbbells', icon: Dumbbell },
    { value: 'barbells-only', title: 'Barbells Only', subtitle: 'Racks, plates, straight bars', icon: Activity },
    { value: 'dumbbells-only', title: 'DB / KB Only', subtitle: 'Portable load, high versatility', icon: Dumbbell },
    { value: 'no-equipment', title: 'Bodyweight', subtitle: 'Calisthenics & home training', icon: Zap }
  ];

  const bodyweightSubtypeOptions = [
    { value: 'home_workout', title: 'Home Workout', subtitle: 'Minimal setup bodyweight training', icon: Activity },
    { value: 'calisthenics', title: 'Calisthenics', subtitle: 'Pull-up and bodyweight strength focused', icon: Zap }
  ];

  const focusOptions = [
    { value: 'full-body', title: 'Full Body' },
    { value: 'upper-body', title: 'Upper Body' },
    { value: 'legs', title: 'Legs' },
    { value: 'chest-back', title: 'Chest & Back' },
    { value: 'arms', title: 'Arms' }
  ];

  const styleOptions = [
    { value: 'paired', title: 'Paired Workout', subtitle: 'Alternating muscle groups for efficient performance and time-optimized training', icon: Repeat },
    { value: 'straight', title: 'Straight Sets', subtitle: 'One exercise at a time with focused output', icon: Target }
  ];

  const goalLabel = label.goal[settings.goal];
  const intensityLabel = settings.goal === 'v02-max'
    ? (settings.conditioningType === 'vo2max' ? 'Very High' : 'Moderate')
    : settings.goal === 'strength'
      ? 'High'
      : settings.goal === 'fat-loss'
        ? 'Explosive'
        : settings.experience === 'advanced'
          ? 'High Volume'
          : 'Balanced';
  const volumeEstimate = settings.goal === 'v02-max'
    ? (settings.conditioningType === 'vo2max' ? 'Interval biased' : 'Aerobic biased')
    : settings.duration === '20m'
      ? 'Compact'
      : settings.duration === '60m'
        ? 'Expansive'
        : 'Balanced';

  const profileItems = [
    { label: 'Goal', value: goalLabel, icon: Target },
    {
      label: settings.goal === 'v02-max' ? 'Protocol' : 'Experience',
      value: settings.goal === 'v02-max' ? label.conditioningType[settings.conditioningType] : label.experience[settings.experience],
      icon: settings.goal === 'v02-max' ? Activity : User
    },
    { label: 'Duration', value: settings.goal === 'v02-max' ? 'Protocol led' : settings.duration, icon: Clock },
    {
      label: settings.goal === 'v02-max' ? 'System' : 'Equipment',
      value: settings.goal === 'v02-max' ? 'Engine / Bike / Rower' : label.equipment[settings.equipment],
      icon: Dumbbell
    },
    { label: 'Intensity', value: intensityLabel, icon: Gauge },
    { label: 'Volume', value: workout ? `${workout.length} blocks` : volumeEstimate, icon: BarChart3 }
  ];

  const parseSetCount = (exercise) => {
    const prescription = String(exercise?.setsReps || exercise?.vo2Protocol?.rounds || '').replace(/Ã—/g, 'x').replace(/×/g, 'x');
    const beforeMultiplier = prescription.match(/(\d+)(?:\s*-\s*\d+)?\s*x/i);
    if (beforeMultiplier) return Math.max(1, parseInt(beforeMultiplier[1], 10));

    const rounds = prescription.match(/(\d+)\s*(?:rounds|sets)/i);
    if (rounds) return Math.max(1, parseInt(rounds[1], 10));

    return 3;
  };

  const parseDefaultReps = (exercise) => {
    const prescription = String(exercise?.setsReps || '').replace(/Ã—/g, 'x').replace(/×/g, 'x');
    const afterMultiplier = prescription.split(/x/i)[1];
    if (!afterMultiplier) return '';

    const reps = afterMultiplier.match(/(\d+)/);
    return reps ? reps[1] : '';
  };

  const formatDuration = (seconds) => {
    const total = Math.max(0, Math.floor(seconds || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return 'Recent session';

    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const calculateSessionStats = (logs) => {
    const allSets = Object.values(logs || {}).flat();
    const completed = allSets.filter(set => set.completed);
    const volume = completed.reduce((total, set) => {
      const weight = parseFloat(set.weight);
      const reps = parseInt(set.reps, 10);
      if (Number.isNaN(weight) || Number.isNaN(reps)) return total;
      return total + weight * reps;
    }, 0);
    const completedExercises = Object.values(logs || {}).filter(sets => sets.some(set => set.completed)).length;

    return {
      volume,
      completedSets: completed.length,
      completedExercises
    };
  };

  const getLogDuration = (entry) => entry?.durationSeconds ?? entry?.duration ?? 0;
  const getLogVolume = (entry) => entry?.totalVolumeKg ?? entry?.volume ?? 0;
  const getLogTitle = (entry) => entry?.title || entry?.name || 'ForgeAI Session';
  const getLogCreatedAt = (entry) => entry?.createdAt || entry?.date || new Date().toISOString();
  const getLogRecords = (entry) => entry?.records || [];
  const normalizeWorkoutLogEntry = (entry = {}) => ({
    ...entry,
    pinned: !!entry.pinned,
    liked: !!entry.liked,
    comments: Array.isArray(entry.comments) ? entry.comments : []
  });

  const loadWorkoutLogs = () => {
    if (typeof window === 'undefined') return [];

    try {
      const raw = window.localStorage.getItem('forgeai_workout_logs');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.map(normalizeWorkoutLogEntry) : [];
    } catch (error) {
      return [];
    }
  };

  const saveWorkoutLogs = (logs) => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem('forgeai_workout_logs', JSON.stringify((logs || []).map(normalizeWorkoutLogEntry)));
    } catch (error) {
      setLogActionMessage('Workout saved in this session, but local storage was unavailable.');
    }
  };

  const persistWorkoutLogs = (updatedLogs) => {
    saveWorkoutLogs(updatedLogs);
  };

  const rankTiers = [
    { name: 'Bronze', xp: 0, color: 'from-orange-500/22 to-amber-700/8 text-orange-200 border-orange-300/18' },
    { name: 'Silver', xp: 1000, color: 'from-zinc-200/18 to-slate-400/8 text-zinc-100 border-zinc-200/18' },
    { name: 'Gold', xp: 2500, color: 'from-amber-200/24 to-yellow-500/8 text-amber-100 border-amber-200/22' },
    { name: 'Platinum', xp: 5000, color: 'from-sky-200/18 to-cyan-400/8 text-sky-100 border-sky-200/20' },
    { name: 'Emerald', xp: 8500, color: 'from-emerald-300/20 to-green-500/8 text-emerald-100 border-emerald-200/20' },
    { name: 'Diamond', xp: 13000, color: 'from-cyan-200/22 to-blue-500/8 text-cyan-100 border-cyan-200/22' },
    { name: 'Master', xp: 20000, color: 'from-violet-300/22 to-purple-600/8 text-violet-100 border-violet-200/22' },
    { name: 'Grandmaster', xp: 30000, color: 'from-rose-300/22 to-pink-600/8 text-rose-100 border-rose-200/22' },
    { name: 'Challenger', xp: 50000, color: 'from-white/24 to-amber-300/10 text-white border-amber-100/26' }
  ];

  const rankThemes = {
    Bronze: {
      border: 'border-orange-300/24',
      glow: 'shadow-[0_24px_90px_rgba(180,83,9,0.16)]',
      background: 'bg-[radial-gradient(circle_at_50%_0%,rgba(251,146,60,0.18),transparent_48%),linear-gradient(145deg,rgba(146,64,14,0.24),rgba(255,255,255,0.024))]',
      icon: 'border-orange-200/22 bg-gradient-to-br from-orange-200/20 via-amber-700/16 to-black/20 text-orange-100',
      accent: 'from-orange-200 via-amber-500 to-orange-800',
      text: 'text-orange-100',
      aura: 'bg-orange-500/18'
    },
    Silver: {
      border: 'border-zinc-100/22',
      glow: 'shadow-[0_24px_90px_rgba(226,232,240,0.12)]',
      background: 'bg-[radial-gradient(circle_at_50%_0%,rgba(244,244,245,0.16),transparent_48%),linear-gradient(145deg,rgba(244,244,245,0.13),rgba(63,63,70,0.055))]',
      icon: 'border-zinc-100/24 bg-gradient-to-br from-white/24 via-zinc-300/12 to-zinc-900/18 text-zinc-100',
      accent: 'from-white via-zinc-300 to-zinc-500',
      text: 'text-zinc-100',
      aura: 'bg-zinc-200/14'
    },
    Gold: {
      border: 'border-amber-200/30',
      glow: 'shadow-[0_26px_100px_rgba(245,158,11,0.20)]',
      background: 'bg-[radial-gradient(circle_at_50%_0%,rgba(253,224,71,0.20),transparent_50%),linear-gradient(145deg,rgba(245,158,11,0.18),rgba(255,255,255,0.03))]',
      icon: 'border-amber-100/30 bg-gradient-to-br from-amber-100/30 via-amber-400/18 to-orange-800/16 text-amber-100',
      accent: 'from-amber-100 via-yellow-400 to-orange-500',
      text: 'text-amber-100',
      aura: 'bg-amber-300/20'
    },
    Platinum: {
      border: 'border-sky-100/24',
      glow: 'shadow-[0_26px_100px_rgba(125,211,252,0.14)]',
      background: 'bg-[radial-gradient(circle_at_50%_0%,rgba(186,230,253,0.18),transparent_48%),linear-gradient(145deg,rgba(226,232,240,0.12),rgba(14,165,233,0.055))]',
      icon: 'border-sky-100/26 bg-gradient-to-br from-white/26 via-sky-200/14 to-cyan-900/14 text-sky-100',
      accent: 'from-white via-sky-200 to-cyan-400',
      text: 'text-sky-100',
      aura: 'bg-sky-300/16'
    },
    Emerald: {
      border: 'border-emerald-200/26',
      glow: 'shadow-[0_26px_100px_rgba(16,185,129,0.16)]',
      background: 'bg-[radial-gradient(circle_at_50%_0%,rgba(110,231,183,0.18),transparent_48%),linear-gradient(145deg,rgba(16,185,129,0.14),rgba(255,255,255,0.026))]',
      icon: 'border-emerald-100/26 bg-gradient-to-br from-emerald-100/24 via-emerald-400/14 to-green-950/18 text-emerald-100',
      accent: 'from-emerald-100 via-emerald-400 to-green-600',
      text: 'text-emerald-100',
      aura: 'bg-emerald-300/17'
    },
    Diamond: {
      border: 'border-cyan-100/30',
      glow: 'shadow-[0_28px_110px_rgba(34,211,238,0.18)]',
      background: 'bg-[radial-gradient(circle_at_50%_0%,rgba(165,243,252,0.22),transparent_50%),linear-gradient(145deg,rgba(103,232,249,0.13),rgba(255,255,255,0.045))]',
      icon: 'border-cyan-100/30 bg-gradient-to-br from-white/30 via-cyan-200/16 to-blue-950/16 text-cyan-100',
      accent: 'from-white via-cyan-200 to-blue-300',
      text: 'text-cyan-100',
      aura: 'bg-cyan-300/18'
    },
    Master: {
      border: 'border-violet-200/28',
      glow: 'shadow-[0_28px_110px_rgba(139,92,246,0.18)]',
      background: 'bg-[radial-gradient(circle_at_50%_0%,rgba(196,181,253,0.20),transparent_48%),linear-gradient(145deg,rgba(139,92,246,0.14),rgba(255,255,255,0.03))]',
      icon: 'border-violet-100/28 bg-gradient-to-br from-violet-100/24 via-violet-400/14 to-purple-950/18 text-violet-100',
      accent: 'from-violet-100 via-violet-400 to-purple-600',
      text: 'text-violet-100',
      aura: 'bg-violet-300/18'
    },
    Grandmaster: {
      border: 'border-rose-200/30',
      glow: 'shadow-[0_30px_120px_rgba(244,63,94,0.18)]',
      background: 'bg-[radial-gradient(circle_at_50%_0%,rgba(253,164,175,0.20),transparent_48%),linear-gradient(145deg,rgba(244,63,94,0.14),rgba(255,255,255,0.03))]',
      icon: 'border-rose-100/30 bg-gradient-to-br from-rose-100/24 via-rose-400/15 to-pink-950/18 text-rose-100',
      accent: 'from-rose-100 via-rose-400 to-pink-600',
      text: 'text-rose-100',
      aura: 'bg-rose-300/18'
    },
    Challenger: {
      border: 'border-amber-100/36',
      glow: 'shadow-[0_34px_150px_rgba(253,230,138,0.24),0_0_90px_rgba(255,255,255,0.08)]',
      background: 'bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.20),transparent_34%),radial-gradient(circle_at_50%_20%,rgba(253,230,138,0.24),transparent_55%),linear-gradient(145deg,rgba(245,158,11,0.15),rgba(255,255,255,0.055))]',
      icon: 'border-amber-100/40 bg-gradient-to-br from-white/32 via-amber-100/22 to-orange-700/16 text-amber-50',
      accent: 'from-white via-amber-100 to-orange-300',
      text: 'text-amber-50',
      aura: 'bg-amber-100/24'
    }
  };

  const getRankTheme = (rankName = 'Bronze') => rankThemes[rankName] || rankThemes.Bronze;

  const calculateLevel = (xp = 0) => Math.floor(Math.max(0, Number(xp) || 0) / 500) + 1;

  const getRankByXp = (xp = 0) => (
    [...rankTiers].reverse().find(tier => (Number(xp) || 0) >= tier.xp) || rankTiers[0]
  );

  const calculateRank = (levelOrXp = 0) => getRankByXp(levelOrXp > 100 ? levelOrXp : Math.max(0, (levelOrXp - 1) * 500)).name;

  const createBaseUserProgress = (overrides = {}) => {
    const xp = Number(overrides.xp) || 0;
    const level = calculateLevel(xp);
    return {
      xp,
      level,
      forgePoints: Number(overrides.forgePoints) || 0,
      dailyClaimStreak: Number(overrides.dailyClaimStreak) || 0,
      totalDailyClaims: Number(overrides.totalDailyClaims) || 0,
      lastDailyClaimDate: overrides.lastDailyClaimDate || null,
      lastDailyClaimAt: overrides.lastDailyClaimAt || null,
      workoutXpDates: overrides.workoutXpDates || {},
      awardedActions: overrides.awardedActions || {},
      activeProBlockWeeks: Number(overrides.activeProBlockWeeks) || 0,
      aiSubscriptionActive: !!overrides.aiSubscriptionActive,
      completedProBlocks: Number(overrides.completedProBlocks) || 0,
      lastRankAchievementShown: overrides.lastRankAchievementShown || 'Bronze',
      xpHistory: Array.isArray(overrides.xpHistory) ? overrides.xpHistory.slice(0, 20) : [],
      rank: getRankByXp(xp).name
    };
  };

  const normalizeUserProgress = (progress = {}) => {
    const normalized = createBaseUserProgress(progress);
    return {
      ...normalized,
      level: calculateLevel(normalized.xp),
      rank: getRankByXp(normalized.xp).name
    };
  };

  const loadUserProgress = () => {
    if (typeof window === 'undefined') return createBaseUserProgress();

    try {
      const raw = window.localStorage.getItem('forgeai_user_progress');
      return normalizeUserProgress(raw ? JSON.parse(raw) : {});
    } catch (error) {
      return createBaseUserProgress();
    }
  };

  const saveUserProgress = (progress) => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem('forgeai_user_progress', JSON.stringify(normalizeUserProgress(progress)));
    } catch (error) {
      setLogActionMessage('Progress saved in this session, but local storage was unavailable.');
    }
  };

  const loadRewardsState = () => {
    if (typeof window === 'undefined') return {};

    try {
      const raw = window.localStorage.getItem('forgeai_rewards_state');
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      return {};
    }
  };

  const saveRewardsState = (state) => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem('forgeai_rewards_state', JSON.stringify(state || {}));
    } catch (error) {
      setLogActionMessage('Reward state saved in this session, but local storage was unavailable.');
    }
  };

  const ambassadorTierRewards = {
    Bronze: { discount: 5, revenueShare: 0, perks: ['Creator code unlocked'] },
    Silver: { discount: 7, revenueShare: 0, perks: ['Stronger follower offer'] },
    Gold: { discount: 10, revenueShare: 0, perks: ['10% creator offer'] },
    Platinum: { discount: 12, revenueShare: 0, perks: ['Ambassador badge unlocked'] },
    Emerald: { discount: 15, revenueShare: 0, perks: ['Priority creator status'] },
    Diamond: { discount: 15, revenueShare: 5, perks: ['Revenue share eligibility unlocked'] },
    Master: { discount: 20, revenueShare: 7.5, perks: ['Higher creator share'] },
    Grandmaster: { discount: 25, revenueShare: 10, perks: ['Early creator access'] },
    Challenger: { discount: 30, revenueShare: 15, perks: ['Founder Athlete status'] }
  };

  const createBaseAmbassadorState = (overrides = {}) => ({
    creatorCode: String(overrides.creatorCode || '').trim().toUpperCase(),
    referrals: Math.max(0, Number(overrides.referrals) || 0),
    conversions: Math.max(0, Number(overrides.conversions) || 0),
    estimatedRevenue: Math.max(0, Number(overrides.estimatedRevenue) || 0),
    discountUses: Math.max(0, Number(overrides.discountUses) || 0),
    socialShares: Math.max(0, Number(overrides.socialShares) || 0),
    referredUserIds: Array.isArray(overrides.referredUserIds) ? [...new Set(overrides.referredUserIds.map(String))] : [],
    referredPurchaseIds: Array.isArray(overrides.referredPurchaseIds) ? [...new Set(overrides.referredPurchaseIds.map(String))] : [],
    createdAt: overrides.createdAt || null,
    revenueShareEligible: !!overrides.revenueShareEligible
  });

  const normalizeAmbassadorState = (value = {}) => createBaseAmbassadorState(value && typeof value === 'object' ? value : {});

  // MVP only: creator codes and referral stats live in localStorage for UI testing.
  // Production later: generate codes and referral attribution server-side, validate discounts at checkout,
  // calculate revenue share from verified purchases, and add legal/tax/payout plus RevenueCat/Google Play setup.
  // Referral XP must be backend verified before production: prevent self-referrals, duplicate signup rewards,
  // duplicate purchase rewards, device farming, and unverified checkout attribution.
  const loadAmbassadorState = () => {
    if (typeof window === 'undefined') return createBaseAmbassadorState();

    try {
      const raw = window.localStorage.getItem('forgeai_ambassador_state');
      return normalizeAmbassadorState(raw ? JSON.parse(raw) : {});
    } catch (error) {
      return createBaseAmbassadorState();
    }
  };

  const saveAmbassadorState = (nextState) => {
    const normalized = normalizeAmbassadorState(nextState);
    setAmbassadorState(normalized);
    if (typeof window === 'undefined') return normalized;

    try {
      window.localStorage.setItem('forgeai_ambassador_state', JSON.stringify(normalized));
    } catch (error) {
      setAmbassadorMessage('Creator data stays in this session because local storage is unavailable.');
    }
    return normalized;
  };

  const loadAppliedCreatorCode = () => {
    if (typeof window === 'undefined') return '';

    try {
      return String(window.localStorage.getItem('forgeai_applied_creator_code') || '').trim().toUpperCase();
    } catch (error) {
      return '';
    }
  };

  const saveAppliedCreatorCode = (code) => {
    const normalized = String(code || '').trim().toUpperCase();
    setAppliedCreatorCode(normalized);
    if (typeof window === 'undefined') return normalized;

    try {
      window.localStorage.setItem('forgeai_applied_creator_code', normalized);
    } catch (error) {
      setAmbassadorMessage('Code saved for this session because local storage is unavailable.');
    }
    return normalized;
  };

  const getAmbassadorTier = (rankName = 'Bronze') => ({
    rank: rankName,
    ...(ambassadorTierRewards[rankName] || ambassadorTierRewards.Bronze)
  });

  const getNextAmbassadorTier = (rankName = 'Bronze') => {
    const currentIndex = Math.max(0, rankTiers.findIndex(tier => tier.name === rankName));
    const nextRank = rankTiers[Math.min(rankTiers.length - 1, currentIndex + 1)]?.name || rankName;
    return getAmbassadorTier(nextRank);
  };

  const updateAmbassadorState = (updater) => {
    const base = normalizeAmbassadorState(ambassadorState || loadAmbassadorState());
    const next = typeof updater === 'function' ? updater(base) : { ...base, ...updater };
    return saveAmbassadorState(next);
  };

  const createCreatorCode = (name = authUser?.name) => {
    const tokens = String(name || '')
      .toUpperCase()
      .replace(/[^A-Z ]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const firstName = (tokens[0] || '').slice(0, 8);
    const initials = tokens.map(token => token[0]).join('').slice(0, 4);
    const suffix = String(Math.floor(Math.random() * 90) + 10);
    if (firstName.length >= 3) return `${firstName}${suffix}`;
    if (initials.length >= 2) return `${initials}${suffix}`;
    return `FORGE${String(Math.floor(Math.random() * 9000) + 1000)}`;
  };

  const defaultUserSettings = {
    units: 'kg',
    currentWeight: 85,
    targetWeight: 92,
    weightUnit: 'kg',
    reduceAnimations: false,
    dailyClaimReminder: true,
    workoutReminder: false,
    coachingTone: 'Scientific'
  };

  const normalizeWeightInput = (value, fallback) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) return fallback;
    return Number(numeric.toFixed(1));
  };

  // Local settings are temporary for the prototype; later they should sync to the user's backend account.
  const normalizeUserSettings = (value = {}) => {
    const source = value && typeof value === 'object' ? value : {};
    return {
      ...defaultUserSettings,
      ...source,
      units: source?.units === 'lbs' ? 'lbs' : 'kg',
      weightUnit: source?.weightUnit === 'lbs' ? 'lbs' : 'kg',
      currentWeight: normalizeWeightInput(source?.currentWeight, defaultUserSettings.currentWeight),
      targetWeight: normalizeWeightInput(source?.targetWeight, defaultUserSettings.targetWeight),
      coachingTone: ['Tactical', 'Scientific', 'Motivational', 'Minimalist'].includes(source?.coachingTone) ? source.coachingTone : 'Scientific',
      reduceAnimations: !!source?.reduceAnimations,
      dailyClaimReminder: source?.dailyClaimReminder !== false,
      workoutReminder: !!source?.workoutReminder
    };
  };

  const loadUserSettings = () => {
    if (typeof window === 'undefined') return defaultUserSettings;

    try {
      const raw = window.localStorage.getItem('forgeai_user_settings');
      return normalizeUserSettings(raw ? JSON.parse(raw) : {});
    } catch (error) {
      return defaultUserSettings;
    }
  };

  const saveUserSettings = (nextSettings) => {
    const normalized = normalizeUserSettings(nextSettings);
    setUserSettings(normalized);

    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('forgeai_user_settings', JSON.stringify(normalized));
    } catch (error) {
      setLogActionMessage('Settings saved in this session, but local storage was unavailable.');
    }
  };

  const saveAuthUser = (user) => {
    setAuthUser(user);
    if (typeof window === 'undefined') return;

    try {
      if (user) {
        window.localStorage.setItem('forgeai_auth_user', JSON.stringify(user));
      } else {
        window.localStorage.removeItem('forgeai_auth_user');
      }
    } catch (error) {
      setLogActionMessage('Auth state changed in this session, but local storage was unavailable.');
    }
  };

  const handleMockGoogleSignIn = () => {
    // Temporary MVP auth: replace this with Supabase Auth Google provider when backend auth is connected.
    const mockUser = {
      id: `google_demo_${Date.now()}`,
      name: 'Martin Jancar',
      email: 'martin@example.com',
      provider: 'google',
      createdAt: new Date().toISOString()
    };

    saveAuthUser(mockUser);

    // Local initialization is temporary; later user progress, settings, and logs should sync to a backend user account.
    const nextProgress = loadUserProgress();
    const nextSettings = loadUserSettings();
    setUserProgress(nextProgress);
    setUserSettings(nextSettings);
    if (typeof window !== 'undefined') {
      try {
        if (!window.localStorage.getItem('forgeai_user_progress')) {
          window.localStorage.setItem('forgeai_user_progress', JSON.stringify(nextProgress));
        }
        if (!window.localStorage.getItem('forgeai_user_settings')) {
          window.localStorage.setItem('forgeai_user_settings', JSON.stringify(nextSettings));
        }
      } catch (error) {
        setLogActionMessage('Profile created for this session, but local storage was unavailable.');
      }
    }
  };

  const handleSignOut = () => {
    saveAuthUser(null);
    setShowSettingsScreen(false);
    setSettingsPlaceholder(null);
    setActiveTab('workout');
    setAiMenuOpen(false);
    setActiveAIModule('coach');
    // Sign out only clears the local auth user. Workout logs, XP, settings, and PRO data remain until explicit data controls are added.
  };

  const updateUserSetting = (key, value) => {
    saveUserSettings({ ...userSettings, [key]: value });
  };

  const convertWeightValue = (value, fromUnit, toUnit) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return value;
    if (fromUnit === toUnit) return Number(numeric.toFixed(1));
    const converted = fromUnit === 'kg' ? numeric * 2.20462 : numeric / 2.20462;
    return Number(converted.toFixed(1));
  };

  const updateWeightUnit = (nextUnit) => {
    const unit = nextUnit === 'lbs' ? 'lbs' : 'kg';
    const currentUnit = userSettings.weightUnit === 'lbs' ? 'lbs' : 'kg';
    if (unit === currentUnit) return;

    saveUserSettings({
      ...userSettings,
      weightUnit: unit,
      currentWeight: convertWeightValue(userSettings.currentWeight, currentUnit, unit),
      targetWeight: convertWeightValue(userSettings.targetWeight, currentUnit, unit)
    });
  };

  const updateWeightGoalValue = (key, value) => {
    const numeric = Number(value);
    saveUserSettings({
      ...userSettings,
      [key]: Number.isFinite(numeric) && numeric >= 0 ? Number(numeric.toFixed(1)) : 0
    });
  };

  const getWeightGoalDirection = (sourceSettings = userSettings) => {
    const current = Number(sourceSettings?.currentWeight) || 0;
    const target = Number(sourceSettings?.targetWeight) || 0;
    if (target > current) return 'gain';
    if (target < current) return 'lose';
    return 'maintain';
  };

  const rmExerciseOptions = [
    'Back Squat',
    'Bench Press',
    'Deadlift',
    'Front Squat',
    'Overhead Press',
    'Pull-Up',
    'Barbell Row',
    'Hip Thrust',
    'Power Clean',
    'Custom'
  ];

  const loadPercentages = [50, 60, 65, 70, 75, 80, 85, 90, 95];

  const loadUsageLabel = (percent) => {
    if (percent <= 60) return 'Technique / warm-up';
    if (percent <= 70) return 'Speed / volume';
    if (percent <= 80) return 'Strength volume';
    if (percent <= 90) return 'Heavy strength';
    return 'Near-max';
  };

  const normalizeExerciseName = (name = '') => String(name).toLowerCase().replace(/[^a-z0-9]/g, '');

  const estimateOneRepMax = (weight, reps, formula = 'Epley') => {
    const w = Number(weight);
    const r = Number(reps);
    if (!Number.isFinite(w) || !Number.isFinite(r) || w <= 0 || r <= 0) return 0;
    if (formula === 'Brzycki') return w / (1.0278 - 0.0278 * r);
    return w * (1 + r / 30);
  };

  const roundLoad = (value, unit = 'kg') => {
    const increment = unit === 'lbs' ? 5 : 2.5;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return Math.round(numeric / increment) * increment;
  };

  const calculateLoadFromPercent = (oneRM, percent, unit = 'kg') => roundLoad((Number(oneRM) || 0) * (Number(percent) || 0) / 100, unit);

  const calculateLoadRange = (oneRM, minPercent, maxPercent, unit = 'kg') => ({
    min: calculateLoadFromPercent(oneRM, minPercent, unit),
    max: calculateLoadFromPercent(oneRM, maxPercent, unit)
  });

  const parseIntensityPercent = (text = '') => {
    const normalized = String(text).replace(/@/g, '').replace(/–/g, '-').trim();
    const range = normalized.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*%/);
    if (range) return { min: Number(range[1]), max: Number(range[2]), label: `${range[1]}-${range[2]}%` };
    const single = normalized.match(/(\d+(?:\.\d+)?)\s*%/);
    if (single) return { min: Number(single[1]), max: Number(single[1]), label: `${single[1]}%` };
    return null;
  };

  // RM profiles are local-only for now; later they should sync to a backend user account and update over time from logged workouts.
  // Intensity brackets will later connect directly to the Workout and PRO engines for smarter load prescriptions.
  const loadRMProfiles = () => {
    if (typeof window === 'undefined') return {};

    try {
      const raw = window.localStorage.getItem('forgeai_rm_profiles');
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
      return {};
    }
  };

  const saveRMProfiles = (profiles) => {
    const next = profiles && typeof profiles === 'object' && !Array.isArray(profiles) ? profiles : {};
    setRmProfiles(next);
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem('forgeai_rm_profiles', JSON.stringify(next));
    } catch (error) {
      setLogActionMessage('Load profile saved in this session, but local storage was unavailable.');
    }
  };

  // Simple one-rep-max map for post-generation workout guidance. Later this should sync with the user account and logged PR updates.
  const loadUserOneRepMaxes = () => {
    if (typeof window === 'undefined') return {};

    try {
      const raw = window.localStorage.getItem('forgeai_user_one_rep_maxes');
      const parsed = raw ? JSON.parse(raw) : {};
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
      return Object.entries(parsed).reduce((maxes, [exerciseName, max]) => {
        const numeric = Number(max);
        if (exerciseName && Number.isFinite(numeric) && numeric > 0) maxes[exerciseName] = numeric;
        return maxes;
      }, {});
    } catch (error) {
      return {};
    }
  };

  const saveUserOneRepMaxes = (maxes) => {
    const next = maxes && typeof maxes === 'object' && !Array.isArray(maxes) ? maxes : {};
    setOneRepMaxes(next);
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem('forgeai_user_one_rep_maxes', JSON.stringify(next));
    } catch (error) {
      setLogActionMessage('One-rep max saved in this session, but local storage was unavailable.');
    }
  };

  const getSavedRM = (exerciseName) => {
    if (!exerciseName) return null;
    if (rmProfiles[exerciseName]) return rmProfiles[exerciseName];
    const wanted = normalizeExerciseName(exerciseName);
    const match = Object.entries(rmProfiles).find(([name]) => normalizeExerciseName(name) === wanted);
    return match?.[1] || null;
  };

  const saveRMProfile = (exerciseName, profile) => {
    const name = String(exerciseName || '').trim();
    if (!name) return;
    saveRMProfiles({
      ...rmProfiles,
      [name]: {
        estimated1RM: Number(profile.estimated1RM) || 0,
        unit: profile.unit === 'lbs' ? 'lbs' : 'kg',
        sourceWeight: Number(profile.sourceWeight) || 0,
        sourceReps: Number(profile.sourceReps) || 0,
        formula: profile.formula || 'Epley',
        updatedAt: new Date().toISOString()
      }
    });
    saveUserOneRepMaxes({
      ...oneRepMaxes,
      [name]: Number(profile.estimated1RM) || 0
    });
    setLogActionMessage(`${name} load profile saved.`);
  };

  const getSavedOneRepMax = (exerciseName) => {
    if (!exerciseName) return null;
    const direct = oneRepMaxes[exerciseName];
    const wanted = normalizeExerciseName(exerciseName);
    const mapped = direct || Object.entries(oneRepMaxes).find(([name]) => normalizeExerciseName(name) === wanted)?.[1];
    const profile = getSavedRM(exerciseName);
    const estimated1RM = Number(mapped || profile?.estimated1RM);
    if (!Number.isFinite(estimated1RM) || estimated1RM <= 0) return null;
    return {
      estimated1RM,
      unit: profile?.unit === 'lbs' ? 'lbs' : (userSettings.units === 'lbs' ? 'lbs' : 'kg')
    };
  };

  const goalDefaultIntensity = {
    strength: 80,
    'build-muscle': 70,
    'fat-loss': 70
  };

  const normalizePrescription = (prescription = '') => String(prescription)
    .replace(/Ã—/g, 'x')
    .replace(/×/g, 'x')
    .replace(/–/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

  const getMidpoint = (min, max = min) => {
    const low = Number(min);
    const high = Number(max);
    if (!Number.isFinite(low) || !Number.isFinite(high)) return 0;
    return (low + high) / 2;
  };

  const parseRepToken = (token = '') => {
    const match = String(token).match(/(\d+)(?:\s*-\s*(\d+))?/);
    if (!match) return null;
    const min = Number(match[1]);
    const max = Number(match[2] || match[1]);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
    return { min, max, value: getMidpoint(min, max) };
  };

  const parseRepPrescription = (exercise) => {
    const prescription = normalizePrescription(exercise?.setsReps || exercise?.vo2Protocol?.rounds || '');
    if (!prescription || exercise?.isConditioning) return { clear: false, prescription, totalReps: 0, targets: [] };
    if (/\b(?:sec|seconds?|mins?|minutes?|continuous|sprints?|hard|easy|tempo runs?|meters?)\b/i.test(prescription)) {
      return { clear: false, prescription, totalReps: 0, targets: [] };
    }

    const multiplier = prescription.match(/(\d+)(?:\s*-\s*(\d+))?\s*x/i);
    const afterMultiplier = multiplier ? prescription.slice(multiplier.index + multiplier[0].length).trim() : '';
    if (!multiplier || !afterMultiplier || /^\d+(?:\s*-\s*\d+)?\s*m\b/i.test(afterMultiplier)) {
      return { clear: false, prescription, totalReps: 0, targets: [] };
    }

    const setCount = getMidpoint(multiplier[1], multiplier[2] || multiplier[1]);
    const repSection = afterMultiplier.replace(/\b\d+(?:\s*-\s*\d+)?\s*x\s*/gi, '');
    const numericSection = repSection
      .replace(/\([^0-9)]*\)/g, '')
      .match(/^[\s(]*[\d\s,+/()\-]+/)?.[0] || '';
    const tokens = numericSection.match(/\d+(?:\s*-\s*\d+)?/g) || [];
    const targets = tokens.map(parseRepToken).filter(Boolean);
    if (targets.length === 0) return { clear: false, prescription, totalReps: 0, targets: [] };

    const isSequence = /[,+/]/.test(numericSection) || /^\s*\(/.test(afterMultiplier);
    const setRepeatFactor = isSequence && !multiplier[2] && Math.round(setCount) === targets.length ? 1 : setCount;
    const totalReps = targets.reduce((total, target) => total + target.value, 0) * setRepeatFactor;

    return {
      clear: true,
      prescription,
      totalReps: Math.max(1, totalReps),
      targets,
      setCount,
      setRepeatFactor
    };
  };

  const getStrengthIntensityForReps = (target) => {
    if (target.min <= 1 && target.max <= 1) return { min: 90, max: 92 };
    if (target.max <= 2) return { min: 88, max: 92 };
    if (target.min <= 3 && target.max >= 5) return { min: 80, max: 88 };
    if (target.max <= 3) return { min: 85, max: 85 };
    if (target.max <= 5) return { min: 75, max: 82 };
    if (target.max <= 8) return { min: 72, max: 80 };
    return { min: 65, max: 75 };
  };

  const getBuildMuscleIntensityForReps = (target) => {
    if (target.min >= 10 && target.max >= 15) return { min: 60, max: 70 };
    if (target.min >= 8 && target.max >= 12) return { min: 65, max: 75 };
    if (target.min >= 5 && target.max <= 8) return { min: 72, max: 82 };
    if (target.value <= 6) return { min: 74, max: 82 };
    if (target.value >= 13) return { min: 60, max: 68 };
    return { min: 68, max: 75 };
  };

  const getPowerIntensityForReps = (target) => {
    if (target.max <= 3) return { min: 65, max: 75 };
    if (target.max <= 5) return { min: 60, max: 70 };
    if (target.max <= 8) return { min: 50, max: 65 };
    return { min: 50, max: 60 };
  };

  const getGoalIntensityForReps = (goal, target) => {
    if (goal === 'strength') return getStrengthIntensityForReps(target);
    if (goal === 'fat-loss') return getPowerIntensityForReps(target);
    return getBuildMuscleIntensityForReps(target);
  };

  const getIntensityClassification = (goal, intensity = 0) => {
    const value = Number(intensity) || goalDefaultIntensity[goal] || 70;
    if (goal === 'strength') {
      if (value >= 89) return 'Max Neural';
      if (value >= 83) return 'Heavy Strength';
      return 'Dynamic Strength';
    }
    if (goal === 'fat-loss') {
      if (value >= 70) return 'Heavy Power';
      if (value >= 60) return 'Explosive Output';
      return 'Velocity Focus';
    }
    if (value >= 76) return 'High Tension';
    if (value >= 68) return 'Standard Hypertrophy';
    return 'Recovery Volume';
  };

  const getGoalIntensityTarget = (goal) => {
    if (goal === 'strength') return 'Target average: around 80% 1RM';
    if (goal === 'fat-loss') return 'Target average: around 70% 1RM';
    return 'Target average: around 70% 1RM';
  };

  const isPowerIntentExercise = (exercise) => {
    const name = String(exercise?.name || '').toLowerCase();
    return settings.goal === 'fat-loss' && (
      exercise?.isPlyometric
      || plyometricExercises.includes(exercise?.name)
      || settings.equipment === 'no-equipment'
      || /bodyweight|sprint|jump|plyometric|medicine ball|pogo|hurdle/.test(name)
    );
  };

  const getExerciseIntensityGuidance = (exercise) => {
    if (!exercise || exercise.isConditioning || settings.goal === 'v02-max') return null;
    if (isBodyweightEquipment(settings.equipment)) return null;
    if (isPowerIntentExercise(exercise)) {
      return {
        mode: 'intent',
        title: 'Power Output',
        headline: 'Bodyweight / Max Intent',
        percentLabel: null,
        classification: 'Velocity Focus',
        averagePercent: null,
        totalReps: 0,
        profile: null,
        loadText: null
      };
    }

    const parsed = parseRepPrescription(exercise);
    const fallbackPercent = goalDefaultIntensity[settings.goal] || 70;
    const ranges = parsed.clear
      ? parsed.targets.map((target) => ({ target, range: getGoalIntensityForReps(settings.goal, target) }))
      : [{ target: { value: 1 }, range: { min: fallbackPercent, max: fallbackPercent } }];
    const minPercent = Math.min(...ranges.map(({ range }) => range.min));
    const maxPercent = Math.max(...ranges.map(({ range }) => range.max));
    const weighted = ranges.reduce((totals, { target, range }) => {
      const reps = Math.max(1, Number(target.value) || 1);
      const percent = getMidpoint(range.min, range.max);
      return {
        reps: totals.reps + reps,
        intensity: totals.intensity + reps * percent
      };
    }, { reps: 0, intensity: 0 });
    const averagePercent = weighted.reps ? weighted.intensity / weighted.reps : fallbackPercent;
    const profile = getSavedOneRepMax(exercise.name);
    const percentLabel = minPercent === maxPercent ? `${Math.round(minPercent)}% 1RM` : `${Math.round(minPercent)}-${Math.round(maxPercent)}% 1RM`;
    const loadRange = profile ? calculateLoadRange(profile.estimated1RM, minPercent, maxPercent, profile.unit) : null;
    const loadText = loadRange
      ? minPercent === maxPercent
        ? `${loadRange.min}${profile.unit}`
        : `${loadRange.min}-${loadRange.max}${profile.unit}`
      : null;

    return {
      mode: 'percent',
      title: profile ? 'Load Guidance' : settings.goal === 'fat-loss' ? 'Power Output' : 'Intensity',
      headline: loadText || percentLabel,
      percentLabel,
      classification: getIntensityClassification(settings.goal, averagePercent),
      averagePercent,
      totalReps: parsed.clear ? parsed.totalReps : 1,
      profile,
      loadText,
      parsed
    };
  };

  const getSessionIntensityGuidance = (generatedWorkout = []) => {
    const weighted = (generatedWorkout || []).reduce((totals, exercise) => {
      const guidance = getExerciseIntensityGuidance(exercise);
      if (!guidance || guidance.mode !== 'percent' || !Number.isFinite(guidance.averagePercent)) return totals;
      const reps = Math.max(1, Number(guidance.totalReps) || 1);
      return {
        reps: totals.reps + reps,
        intensity: totals.intensity + reps * guidance.averagePercent
      };
    }, { reps: 0, intensity: 0 });

    if (!weighted.reps) return null;
    const averagePercent = weighted.intensity / weighted.reps;
    return {
      averagePercent,
      displayPercent: `${Math.round(averagePercent)}%`,
      classification: getIntensityClassification(settings.goal, averagePercent),
      target: getGoalIntensityTarget(settings.goal)
    };
  };

  const getRecommendedLoadText = (exerciseName, intensityText) => {
    const intensity = parseIntensityPercent(intensityText);
    const profile = getSavedRM(exerciseName);
    if (!intensity || !profile?.estimated1RM) return null;
    if (intensity.min !== intensity.max) {
      const range = calculateLoadRange(profile.estimated1RM, intensity.min, intensity.max, profile.unit);
      return `${range.min}-${range.max}${profile.unit}`;
    }
    return `${calculateLoadFromPercent(profile.estimated1RM, intensity.min, profile.unit)}${profile.unit}`;
  };

  const openLoadIntelligence = (exerciseName = null) => {
    const nextExercise = exerciseName && rmExerciseOptions.includes(exerciseName) ? exerciseName : exerciseName ? 'Custom' : rmCalculator.exerciseName;
    setRmCalculator(current => ({
      ...current,
      exerciseName: nextExercise,
      customExerciseName: nextExercise === 'Custom' && exerciseName ? exerciseName : current.customExerciseName
    }));
    setShowLoadIntelligence(true);
  };

  const loadNutritionFavorites = () => {
    if (typeof window === 'undefined') return [];

    try {
      const raw = window.localStorage.getItem('forgeai_nutrition_favorites');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  const saveNutritionFavorites = (favorites) => {
    const next = Array.isArray(favorites) ? favorites : [];
    setNutritionFavorites(next);
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem('forgeai_nutrition_favorites', JSON.stringify(next));
    } catch (error) {
      setLogActionMessage('Nutrition favorites saved in this session, but local storage was unavailable.');
    }
  };

  const toggleNutritionFavorite = (recipeId) => {
    saveNutritionFavorites(
      nutritionFavorites.includes(recipeId)
        ? nutritionFavorites.filter(id => id !== recipeId)
        : [...nutritionFavorites, recipeId]
    );
  };

  const getLocalDateKey = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const dailyClaimCooldownMs = 5 * 60 * 1000;

  const canClaimDaily = (progress = userProgress) => {
    const current = progress || createBaseUserProgress();
    if (!current.lastDailyClaimAt) return true;
    const lastClaim = new Date(current.lastDailyClaimAt).getTime();
    if (Number.isNaN(lastClaim)) return true;
    return Date.now() - lastClaim >= dailyClaimCooldownMs;
  };

  const getNextClaimLabel = (progress = userProgress) => {
    const current = progress || createBaseUserProgress();
    if (!current.lastDailyClaimAt) return 'Available now';
    const lastClaim = new Date(current.lastDailyClaimAt).getTime();
    if (Number.isNaN(lastClaim)) return 'Available now';
    const remainingMs = Math.max(0, dailyClaimCooldownMs - (Date.now() - lastClaim));
    if (remainingMs <= 0) return 'Available now';
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.ceil((remainingMs % 60000) / 1000);
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  const getDailyStreakAfterClaim = (progress = userProgress) => {
    const current = progress || createBaseUserProgress();
    const today = getLocalDateKey();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = getLocalDateKey(yesterday);

    if (current.lastDailyClaimDate === today) return current.dailyClaimStreak || 0;
    if (current.lastDailyClaimDate === yesterdayKey) return (current.dailyClaimStreak || 0) + 1;
    return 1;
  };

  const getXpMultiplier = (progress = userProgress) => {
    const current = normalizeUserProgress(progress || createBaseUserProgress());
    const proBonus = current.activeProBlockWeeks >= 12
      ? 0.25
      : current.activeProBlockWeeks >= 8
        ? 0.15
        : current.activeProBlockWeeks >= 6
          ? 0.10
          : current.activeProBlockWeeks >= 4
            ? 0.05
            : 0;
    const aiBonus = current.aiSubscriptionActive ? 0.10 : 0;
    return Math.min(1.35, Number((1 + proBonus + aiBonus).toFixed(2)));
  };

  const getMultiplierLabel = (progress = userProgress) => {
    const current = normalizeUserProgress(progress || createBaseUserProgress());
    const parts = [];
    if (current.activeProBlockWeeks) parts.push(`${current.activeProBlockWeeks} Week PRO`);
    if (current.aiSubscriptionActive) parts.push('AI Coach');
    return parts.length ? parts.join(' + ') : 'Free';
  };

  const awardProgress = ({ xp = 0, forgePoints = 0, reason = 'ForgeAI progress', actionId, applyMultiplier = true, eventType = 'progress', updates = {} }) => {
    const id = actionId || `${reason}-${Date.now()}`;
    setUserProgress(current => {
      const base = normalizeUserProgress(current || loadUserProgress());
      if (base.awardedActions?.[id]) return base;

      const multiplier = applyMultiplier && xp > 0 ? getXpMultiplier(base) : 1;
      const awardedXp = Math.round((Number(xp) || 0) * multiplier);
      const awardedForgePoints = 0;
      const next = normalizeUserProgress({
        ...base,
        ...updates,
        xp: base.xp + awardedXp,
        forgePoints: base.forgePoints,
        awardedActions: {
          ...base.awardedActions,
          [id]: {
            reason,
            xp: awardedXp,
            forgePoints: awardedForgePoints,
            multiplier,
            awardedAt: new Date().toISOString()
          }
        },
        xpHistory: [
          {
            id,
            type: eventType,
            amountXP: awardedXp,
            amountForgePoints: awardedForgePoints,
            multiplier,
            label: reason,
            createdAt: new Date().toISOString()
          },
          ...(base.xpHistory || [])
        ].slice(0, 20)
      });
      saveUserProgress(next);
      return next;
    });
  };

  const addXP = (amount, reason, actionId) => {
    awardProgress({ xp: amount, reason, actionId: actionId || `${reason}-xp` });
  };

  const addForgePoints = (amount, reason, actionId) => {
    awardProgress({ xp: 0, reason, actionId: actionId || `${reason}-xp-only` });
  };

  const claimDailyReward = () => {
    const base = normalizeUserProgress(userProgress || loadUserProgress());
    if (!canClaimDaily(base)) return;

    const today = getLocalDateKey();
    const claimedAt = new Date().toISOString();
    const newStreak = getDailyStreakAfterClaim(base);
    const multiplier = getXpMultiplier(base);
    const claimXp = Math.round(50 * multiplier);
    const claimForgePoints = 0;
    const actionId = `daily-claim-${Date.now()}`;
    const next = normalizeUserProgress({
      ...base,
      xp: base.xp + claimXp,
      forgePoints: base.forgePoints,
      dailyClaimStreak: newStreak,
      totalDailyClaims: (base.totalDailyClaims || 0) + 1,
      lastDailyClaimDate: today,
      lastDailyClaimAt: claimedAt,
      awardedActions: {
        ...base.awardedActions,
        [actionId]: {
          reason: 'Daily Forge Claim',
          xp: claimXp,
          forgePoints: claimForgePoints,
          multiplier,
          awardedAt: claimedAt
        }
      },
      xpHistory: [
        {
          id: actionId,
          type: 'daily_claim',
          amountXP: claimXp,
          amountForgePoints: claimForgePoints,
          multiplier,
          label: 'Daily Claim',
          createdAt: claimedAt
        },
        ...(base.xpHistory || [])
      ].slice(0, 20)
    });
    const claimRankStatus = getRankStatus(next, workoutLogs);
    saveUserProgress(next);
    setUserProgress(next);
    setDailyClaimCelebration({
      xp: claimXp,
      forgePoints: claimForgePoints,
      multiplier,
      multiplierLabel: getMultiplierLabel(base),
      totalXp: next.xp,
      rank: claimRankStatus.achievedTier.name,
      targetRank: claimRankStatus.targetTier?.name || claimRankStatus.achievedTier.name,
      progressPercent: claimRankStatus.progressPercent,
      xpToNext: claimRankStatus.xpToNext
    });
  };

  const canEarnWorkoutXpToday = (progress = userProgress) => {
    const current = normalizeUserProgress(progress || createBaseUserProgress());
    return !current.workoutXpDates?.[getLocalDateKey()];
  };

  const getWorkoutRewardPreview = (progress = userProgress) => {
    const current = normalizeUserProgress(progress || createBaseUserProgress());
    const eligible = canEarnWorkoutXpToday(current);
    const multiplier = getXpMultiplier(current);
    return {
      eligible,
      multiplier,
      xp: eligible ? Math.round(120 * multiplier) : 0,
      forgePoints: 0,
      label: getMultiplierLabel(current)
    };
  };

  const awardWorkoutCompletionReward = (entryId) => {
    const today = getLocalDateKey();
    const reward = getWorkoutRewardPreview(userProgress);
    if (!reward.eligible) return;

    awardProgress({
      xp: 120,
      forgePoints: 0,
      reason: 'Workout Completed',
      actionId: `workout-xp-${today}`,
      eventType: 'workout_completed',
      updates: {
        workoutXpDates: {
          ...(normalizeUserProgress(userProgress || loadUserProgress()).workoutXpDates || {}),
          [today]: entryId || true
        }
      }
    });
  };

  const getProPurchaseReward = (weeks = 0, progress = userProgress) => {
    const xpByWeeks = { 4: 300, 6: 450, 8: 650, 12: 900 };
    const multiplier = getXpMultiplier(progress);
    return {
      baseXp: xpByWeeks[weeks] || 300,
      xp: Math.round((xpByWeeks[weeks] || 300) * multiplier),
      forgePoints: 0,
      multiplier
    };
  };

  const awardProPurchaseReward = (weeks, actionId) => {
    const base = normalizeUserProgress(userProgress || loadUserProgress());
    const reward = getProPurchaseReward(weeks, base);
    awardProgress({
      xp: reward.baseXp,
      forgePoints: 0,
      reason: `PRO ${weeks} Week Block`,
      actionId,
      eventType: 'pro_unlock',
      updates: {
        activeProBlockWeeks: Math.max(base.activeProBlockWeeks || 0, Number(weeks) || 0),
        completedProBlocks: base.completedProBlocks || 0
      }
    });
    setLogActionMessage(`PRO XP earned: +${reward.xp} XP. ${weeks} Week PRO multiplier active.`);
  };

  const activateAiCoachDemo = () => {
    const base = normalizeUserProgress(userProgress || loadUserProgress());
    if (base.aiSubscriptionActive) return;
    awardProgress({
      xp: 0,
      forgePoints: 0,
      reason: 'AI Coach Multiplier Activated',
      actionId: 'ai-coach-demo-activated',
      applyMultiplier: false,
      eventType: 'ai_subscription',
      updates: { aiSubscriptionActive: true }
    });
  };

  const getRankMilestones = (tierName, progress = userProgress, logs = workoutLogs) => {
    const current = normalizeUserProgress(progress || createBaseUserProgress());
    const workouts = (logs || []).length;
    const hasAnyPro = (current.activeProBlockWeeks || 0) >= 4;
    const hasLongPro = (current.activeProBlockWeeks || 0) >= 8;
    const checks = {
      Bronze: [],
      Silver: [
        { label: '1,000 XP', met: current.xp >= 1000 },
        { label: 'Complete 3 workouts', met: workouts >= 3 }
      ],
      Gold: [
        { label: '2,500 XP', met: current.xp >= 2500 },
        { label: 'Complete 10 workouts', met: workouts >= 10 },
        { label: 'Claim daily XP 5 times', met: (current.totalDailyClaims || 0) >= 5 }
      ],
      Platinum: [
        { label: '5,000 XP', met: current.xp >= 5000 },
        { label: 'Complete 25 workouts', met: workouts >= 25 },
        { label: 'Own any PRO block', met: hasAnyPro }
      ],
      Emerald: [
        { label: '8,500 XP', met: current.xp >= 8500 },
        { label: 'Complete 50 workouts', met: workouts >= 50 },
        { label: 'Own 8 Week or 12 Week PRO block', met: hasLongPro }
      ],
      Diamond: [
        { label: '13,000 XP', met: current.xp >= 13000 },
        { label: 'Complete 100 workouts', met: workouts >= 100 },
        { label: 'AI Coach subscription active', met: !!current.aiSubscriptionActive }
      ],
      Master: [
        { label: '20,000 XP', met: current.xp >= 20000 },
        { label: 'Complete 150 workouts', met: workouts >= 150 },
        { label: 'Complete 1 PRO block', met: (current.completedProBlocks || 0) >= 1 }
      ],
      Grandmaster: [
        { label: '30,000 XP', met: current.xp >= 30000 },
        { label: 'Complete 250 workouts', met: workouts >= 250 },
        { label: 'Complete 3 PRO blocks', met: (current.completedProBlocks || 0) >= 3 }
      ],
      Challenger: [
        { label: '50,000 XP', met: current.xp >= 50000 },
        { label: 'Complete 500 workouts', met: workouts >= 500 },
        { label: 'Complete 5 PRO blocks', met: (current.completedProBlocks || 0) >= 5 },
        { label: 'AI Coach subscription active', met: !!current.aiSubscriptionActive }
      ]
    };
    return checks[tierName] || [];
  };

  const getRankStatus = (progress = userProgress, logs = workoutLogs) => {
    const current = normalizeUserProgress(progress || createBaseUserProgress());
    const xpEligibleTier = getRankByXp(current.xp);
    const achievedTier = rankTiers.reduce((best, tier) => {
      const milestones = getRankMilestones(tier.name, current, logs);
      const achieved = current.xp >= tier.xp && milestones.every(item => item.met);
      return achieved && tier.xp >= best.xp ? tier : best;
    }, rankTiers[0]);
    const achievedIndex = rankTiers.findIndex(tier => tier.name === achievedTier.name);
    const xpEligibleIndex = rankTiers.findIndex(tier => tier.name === xpEligibleTier.name);
    const nextTier = rankTiers[Math.min(rankTiers.length - 1, achievedIndex + 1)];
    const pendingTier = xpEligibleIndex > achievedIndex ? xpEligibleTier : null;
    const targetTier = pendingTier || nextTier;
    const previousThreshold = achievedTier.xp;
    const nextThreshold = targetTier?.xp ?? rankTiers[rankTiers.length - 1].xp;
    const progressPercent = nextThreshold === previousThreshold
      ? 100
      : Math.min(100, Math.max(0, ((current.xp - previousThreshold) / (nextThreshold - previousThreshold)) * 100));

    return {
      achievedTier,
      xpEligibleTier,
      nextTier,
      pendingTier,
      targetTier,
      progressPercent,
      xpToNext: Math.max(0, (targetTier?.xp || current.xp) - current.xp),
      missingMilestones: getRankMilestones((pendingTier || nextTier)?.name, current, logs).filter(item => !item.met)
    };
  };

  const getTierRewards = (tierName = 'Bronze') => {
    const rewards = {
      Bronze: ['No discount yet'],
      Silver: ['5% PRO discount'],
      Gold: ['10% PRO discount'],
      Platinum: ['15% PRO discount', '5 AI credits'],
      Emerald: ['20% PRO discount', '10 AI credits'],
      Diamond: ['25% PRO discount', '20 AI credits'],
      Master: ['30% PRO discount', 'Exclusive PRO badge'],
      Grandmaster: ['40% PRO discount', 'Early access features'],
      Challenger: ['50% PRO discount', 'Airdrop eligibility badge', 'Founder athlete status']
    };
    return rewards[tierName] || rewards.Bronze;
  };

  useEffect(() => {
    if (!userProgress) return;

    const progress = normalizeUserProgress(userProgress);
    const status = getRankStatus(progress, workoutLogs);
    const achievedTier = status.achievedTier;
    const achievedIndex = rankTiers.findIndex(tier => tier.name === achievedTier.name);
    const shownIndex = rankTiers.findIndex(tier => tier.name === (progress.lastRankAchievementShown || 'Bronze'));

    if (achievedIndex <= 0 || achievedIndex <= shownIndex) return;

    setRankAchievementModal(achievedTier);
    setUserProgress(current => {
      const base = normalizeUserProgress(current || loadUserProgress());
      const next = {
        ...base,
        lastRankAchievementShown: achievedTier.name
      };
      saveUserProgress(next);
      return next;
    });
  }, [
    userProgress?.xp,
    userProgress?.lastRankAchievementShown,
    userProgress?.totalDailyClaims,
    userProgress?.activeProBlockWeeks,
    userProgress?.aiSubscriptionActive,
    userProgress?.completedProBlocks,
    workoutLogs.length
  ]);

  const getWeeklySessions = (logs = workoutLogs) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    return (logs || []).filter(log => new Date(getLogCreatedAt(log)) >= start).length;
  };

  const getLifetimeVolume = (logs = workoutLogs) => (
    (logs || []).reduce((total, log) => total + (Number(getLogVolume(log)) || 0), 0)
  );

  const getUnlockedBadges = (logs = workoutLogs, progress = userProgress) => {
    const current = progress || createBaseUserProgress();
    const prCount = (logs || []).reduce((total, log) => total + getLogRecords(log).length, 0);
    const lifetimeVolume = getLifetimeVolume(logs);
    return {
      firstWorkout: (logs || []).length >= 1,
      sevenDayStreak: (current.dailyClaimStreak || 0) >= 7,
      tenWorkouts: (logs || []).length >= 10,
      volumeBuilder: lifetimeVolume >= 10000,
      prHunter: prCount > 0,
      proAthlete: !!proUnlocked || !!proGeneratedProgram
    };
  };

  const getDynamicPersonalRecords = (logs = workoutLogs) => {
    const bestByExercise = new Map();
    (logs || []).forEach(log => {
      getBestLifts(log).forEach(lift => {
        if (lift.weight <= 0) return;
        const previous = bestByExercise.get(lift.exerciseName);
        if (!previous || lift.estimatedOneRepMax > previous.estimatedOneRepMax || lift.weight > previous.weight) {
          bestByExercise.set(lift.exerciseName, lift);
        }
      });
    });

    const dynamicRecords = [...bestByExercise.values()]
      .sort((a, b) => b.estimatedOneRepMax - a.estimatedOneRepMax)
      .slice(0, 3)
      .map(lift => `${lift.exerciseName} ${lift.weight} kg x ${lift.reps}`);

    return dynamicRecords.length ? dynamicRecords : ['Bench Press 120 kg', 'Back Squat 165 kg', 'Deadlift 205 kg'];
  };

  const calculateWorkoutRecords = (newEntry, previousLogs = []) => {
    const previousVolumeMax = Math.max(0, ...previousLogs.map(log => Number(getLogVolume(log)) || 0));
    const previousSetsMax = Math.max(0, ...previousLogs.map(log => Number(log.completedSets) || 0));
    const records = [];

    if ((Number(newEntry.totalVolumeKg) || 0) > previousVolumeMax) {
      records.push({
        type: 'volume_pr',
        label: 'Volume PR',
        value: `${Number.isInteger(newEntry.totalVolumeKg) ? newEntry.totalVolumeKg : Number(newEntry.totalVolumeKg.toFixed(1))} kg`
      });
    }

    if ((Number(newEntry.completedSets) || 0) > previousSetsMax) {
      records.push({
        type: 'sets_pr',
        label: 'Set PR',
        value: `${newEntry.completedSets} sets`
      });
    }

    return records;
  };

  const createWorkoutTitle = () => {
    const currentGoal = label.goal[settings.goal] || 'ForgeAI';
    const currentFocus = label.focus[settings.focus] || 'Full Body';

    if (settings.goal === 'v02-max') {
      return settings.conditioningType === 'vo2max' ? 'Conditioning / VO2 Max' : 'Conditioning / Zone 2';
    }

    if (settings.goal === 'strength' && settings.focus === 'chest-back') return 'Upper Strength / Chest & Back';
    if (settings.goal === 'strength') return `Strength / ${currentFocus}`;
    if (settings.goal === 'build-muscle') return `Build Muscle / ${currentFocus}`;
    if (settings.goal === 'fat-loss') return `Power Session / ${currentFocus}`;

    return `${currentGoal} / ${currentFocus}`;
  };

  const getExercisePreview = (entry, limit = 4) => {
    const source = Array.isArray(entry?.exercises) && entry.exercises.length
      ? entry.exercises
      : Array.isArray(entry?.sourceWorkout)
        ? entry.sourceWorkout
        : [];

    return source.slice(0, limit).map((exercise, index) => {
      const completedSets = exercise.completedSets || [];
      const bestWeight = completedSets.reduce((best, set) => {
        const weight = parseFloat(set.weight);
        return Number.isNaN(weight) ? best : Math.max(best, weight);
      }, 0);
      const completedReps = completedSets.map(set => set.reps).filter(Boolean);
      const completedSummary = completedSets.length
        ? `${completedSets.length} x ${completedReps[0] || 'tracked'}`
        : '';

      return {
        label: exercise.label || String.fromCharCode(65 + index),
        name: exercise.name || 'Exercise',
        setsReps: exercise.setsReps || completedSummary || 'Tracked work',
        bestWeight: bestWeight > 0 ? `${bestWeight} kg` : ''
      };
    });
  };

  const parseLogNumber = (value) => {
    const parsed = parseFloat(String(value ?? '').replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const isCompoundLift = (name = '') => (
    /(squat|bench|deadlift|press|pull-?up|row|clean|snatch|lunge)/i.test(name)
  );

  const formatBestLiftValue = (lift) => {
    if (!lift) return 'Tracked';
    if (lift.weight > 0 && lift.reps > 0) return `${lift.weight}kg × ${lift.reps}`;
    if (lift.reps > 0) return `${lift.reps} reps`;
    if (lift.setVolume > 0) return `${lift.setVolume} kg`;
    return 'Completed';
  };

  const getBestLifts = (entry) => {
    const source = Array.isArray(entry?.exercises) && entry.exercises.length
      ? entry.exercises
      : Array.isArray(entry?.sourceWorkout)
        ? entry.sourceWorkout
        : [];

    const completedCandidates = source.flatMap((exercise, exerciseIndex) => {
      const completedSets = (exercise.completedSets || []).filter(set => set?.completed !== false);
      return completedSets.map((set, setIndex) => {
        const weight = parseLogNumber(set.weight);
        const reps = Math.max(0, parseInt(set.reps, 10) || 0);
        const estimatedOneRepMax = weight > 0 && reps > 0 ? weight * (1 + reps / 30) : 0;
        const setVolume = weight * reps;
        const exerciseName = exercise.name || 'Exercise';

        return {
          exerciseName,
          weight,
          reps,
          estimatedOneRepMax,
          setVolume,
          isPR: !!set.isPR,
          label: exercise.label || String.fromCharCode(65 + exerciseIndex),
          setNumber: set.setNumber || setIndex + 1,
          compoundBonus: isCompoundLift(exerciseName) ? 1 : 0
        };
      });
    });

    const weightedCandidates = completedCandidates.filter(lift => lift.weight > 0 && lift.reps > 0);
    const fallbackCandidates = completedCandidates.filter(lift => lift.reps > 0 || lift.weight > 0);
    const pool = weightedCandidates.length ? weightedCandidates : fallbackCandidates;

    const sorted = [...pool].sort((a, b) => (
      Number(b.isPR) - Number(a.isPR)
      || ((b.estimatedOneRepMax + b.compoundBonus * 2) - (a.estimatedOneRepMax + a.compoundBonus * 2))
      || b.weight - a.weight
      || b.setVolume - a.setVolume
      || b.reps - a.reps
      || b.compoundBonus - a.compoundBonus
    ));

    const uniqueByExercise = [];
    const seenExercises = new Set();
    sorted.forEach((lift) => {
      const key = lift.exerciseName.toLowerCase();
      if (!seenExercises.has(key) && uniqueByExercise.length < 3) {
        seenExercises.add(key);
        uniqueByExercise.push(lift);
      }
    });

    if (uniqueByExercise.length < 3) {
      sorted.forEach((lift) => {
        const duplicateKey = `${lift.exerciseName}-${lift.setNumber}-${lift.weight}-${lift.reps}`;
        const alreadyUsed = uniqueByExercise.some(used => `${used.exerciseName}-${used.setNumber}-${used.weight}-${used.reps}` === duplicateKey);
        if (!alreadyUsed && uniqueByExercise.length < 3) uniqueByExercise.push(lift);
      });
    }

    if (!uniqueByExercise.length && source.length) {
      return source.slice(0, 3).map((exercise, index) => ({
        exerciseName: exercise.name || 'Exercise',
        weight: 0,
        reps: parseDefaultReps(exercise) ? parseInt(parseDefaultReps(exercise), 10) : 0,
        estimatedOneRepMax: 0,
        setVolume: 0,
        isPR: false,
        label: exercise.label || String.fromCharCode(65 + index)
      }));
    }

    return uniqueByExercise.slice(0, 3).map(({ compoundBonus, ...lift }) => lift);
  };

  const createShareSummary = (entry) => {
    const volume = getLogVolume(entry);
    const formattedVolume = Number.isInteger(volume) ? volume : Number(volume.toFixed(1));
    const records = getLogRecords(entry);
    const bestLifts = getBestLifts(entry);
    const exercises = getExercisePreview(entry, 6).map(exercise => `${exercise.label} ${exercise.name}`).join(', ');

    return [
      'ForgeAI Workout',
      getLogTitle(entry),
      bestLifts.length ? `Best Lifts: ${bestLifts.map(lift => `${lift.exerciseName} ${formatBestLiftValue(lift)}`).join(', ')}` : '',
      `Duration: ${formatDuration(getLogDuration(entry))}`,
      `Volume: ${formattedVolume} kg`,
      `Sets: ${entry.completedSets || 0}`,
      records.length ? `Records: ${records.map(record => `${record.label} ${record.value}`).join(', ')}` : 'Records: None',
      exercises ? `Exercises: ${exercises}` : '',
      'Built with ForgeAI'
    ].filter(Boolean).join('\n');
  };

  const createWorkoutSummary = (entry) => createShareSummary(entry);

  const createWorkoutLogEntry = (previousLogs = []) => {
    const stats = calculateSessionStats(setLogs);
    const createdAt = new Date().toISOString();
    const exercises = (workout || []).map((exercise, exerciseIndex) => {
      const logs = setLogs[exerciseIndex] || [];
      const completedSets = logs.filter(set => set.completed).map(set => {
        const weight = parseFloat(set.weight);
        const reps = parseInt(set.reps, 10);
        const volume = Number.isNaN(weight) || Number.isNaN(reps) ? 0 : weight * reps;

        return {
          setNumber: set.setNumber,
          weight: set.weight,
          reps: set.reps,
          completed: true,
          volumeKg: volume
        };
      });

      return {
        label: exercise.label || String.fromCharCode(65 + exerciseIndex),
        name: exercise.name,
        setsReps: exercise.setsReps,
        tempo: exercise.tempo,
        rest: exercise.rest,
        completedSets,
        totalVolumeKg: completedSets.reduce((total, set) => total + (Number(set.volumeKg) || 0), 0)
      };
    });

    const entry = {
      id: `forgeai-${Date.now()}`,
      createdAt,
      title: createWorkoutTitle(),
      goal: label.goal[settings.goal] || settings.goal,
      focus: settings.goal === 'v02-max' ? label.conditioningType[settings.conditioningType] : label.focus[settings.focus],
      experience: label.experience[settings.experience],
      durationSeconds: elapsedSeconds,
      totalVolumeKg: stats.volume,
      completedSets: stats.completedSets,
      completedExercises: stats.completedExercises,
      records: [],
      exercises,
      notes: 'Saved from ForgeAI workout session.',
      liked: false,
      comments: [],
      sourceWorkout: workout || []
    };

    return {
      ...entry,
      records: calculateWorkoutRecords(entry, previousLogs)
    };
  };

  const createInitialSetLogs = (generatedWorkout) => (
    (generatedWorkout || []).reduce((logs, exercise, exerciseIndex) => {
      const setCount = parseSetCount(exercise);
      const defaultReps = parseDefaultReps(exercise);
      logs[exerciseIndex] = Array.from({ length: setCount }, (_, setIndex) => ({
        setNumber: setIndex + 1,
        weight: '',
        reps: defaultReps,
        completed: false
      }));
      return logs;
    }, {})
  );

  const startWorkoutSession = () => {
    if (!workout?.length) return;

    if (isWorkoutSessionActive) {
      setActiveExerciseIndex(null);
      setShowFinishSummary(false);
      setShowAddExerciseModal(false);
      setIsWorkoutSessionViewActive(true);
      return;
    }

    setSetLogs(createInitialSetLogs(workout));
    setElapsedSeconds(0);
    setSessionStartTime(Date.now());
    setActiveExerciseIndex(null);
    setShowFinishSummary(false);
    setShowAddExerciseModal(false);
    setIsWorkoutSessionActive(true);
    setIsWorkoutSessionViewActive(true);
  };

  const updateSetLog = (exerciseIndex, setIndex, updates) => {
    setSetLogs(current => ({
      ...current,
      [exerciseIndex]: (current[exerciseIndex] || []).map((set, index) => (
        index === setIndex ? { ...set, ...updates } : set
      ))
    }));
  };

  const normalizeSetInputValue = (value, allowDecimal = false) => {
    const cleaned = String(value ?? '').replace(',', '.');
    return allowDecimal
      ? cleaned.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
      : cleaned.replace(/[^\d]/g, '');
  };

  const finishWorkoutSession = () => {
    setSessionStartTime(null);
    setShowFinishSummary(true);
  };

  const endWorkoutSession = () => {
    setIsWorkoutSessionActive(false);
    setIsWorkoutSessionViewActive(false);
    setSessionStartTime(null);
    setElapsedSeconds(0);
    setSetLogs({});
    setActiveExerciseIndex(null);
    setShowFinishSummary(false);
    setShowAddExerciseModal(false);
  };

  const finishAndSaveWorkoutSession = () => {
    const stats = calculateSessionStats(setLogs);
    if (stats.completedSets === 0) return;

    setWorkoutLogs(currentLogs => {
      const nextEntry = createWorkoutLogEntry(currentLogs);
      const nextLogs = [nextEntry, ...currentLogs];
      saveWorkoutLogs(nextLogs);
      awardWorkoutCompletionReward(nextEntry.id);
      setActiveSessionSummary(nextEntry);
      setSelectedLogEntry(null);
      setActiveTab('log');
      return nextLogs;
    });

    endWorkoutSession();
  };

  const IconBubble = ({ icon: Icon, tone = 'orange' }) => {
    const tones = {
      orange: 'from-amber-200/20 to-orange-400/8 text-amber-100 ring-amber-200/18',
      blue: 'from-sky-300/14 to-cyan-300/6 text-sky-100 ring-sky-200/14',
      green: 'from-emerald-300/14 to-lime-300/6 text-emerald-100 ring-emerald-200/14',
      quiet: 'from-white/8 to-white/[0.02] text-zinc-300 ring-white/10'
    };
    return (
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${tones[tone]} ring-1 backdrop-blur-xl`}>
        <Icon className="h-5 w-5" />
      </div>
    );
  };

  const PremiumCard = ({ children, className = '', delay = 0, variant = 'primary', id }) => {
    const variants = {
      hero: 'border-amber-100/14 bg-[linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-6 shadow-[0_38px_160px_rgba(0,0,0,0.46),0_0_120px_rgba(245,158,11,0.10)] md:p-8',
      primary: 'border-white/10 bg-white/[0.038] p-6 shadow-[0_28px_110px_rgba(0,0,0,0.32)] md:p-8',
      workout: 'border-white/[0.085] bg-[linear-gradient(145deg,rgba(255,255,255,0.044),rgba(255,255,255,0.018))] p-6 shadow-[0_22px_90px_rgba(0,0,0,0.30)] md:p-8',
      secondary: 'border-white/[0.075] bg-white/[0.026] p-5 shadow-[0_16px_60px_rgba(0,0,0,0.20)] md:p-6',
      flat: 'border-white/[0.07] bg-black/18 p-5 shadow-none md:p-6'
    };

    return (
      <section
        id={id}
        className={`premium-card rounded-[2rem] border backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-white/16 ${variants[variant]} ${className}`}
        style={{ '--delay': `${delay}ms` }}
      >
        {children}
      </section>
    );
  };

  const SectionHeader = ({ icon: Icon, eyebrow, title, subtitle }) => (
    <div className="mb-5 flex items-start gap-3 md:mb-7 md:gap-4">
      <IconBubble icon={Icon} tone="quiet" />
      <div>
        {eyebrow && <div className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-amber-100/55">{eyebrow}</div>}
        <h2 className="text-xl font-semibold tracking-[-0.035em] text-white md:text-[2rem]">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-400 md:mt-3 md:text-[0.95rem] md:leading-7">{subtitle}</p>}
      </div>
    </div>
  );

  const ChoiceCard = ({ isSelected, onClick, title, subtitle, icon: Icon = Target }) => (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={`group relative flex min-h-[142px] w-full overflow-hidden rounded-2xl p-3 text-left transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:min-h-[150px] md:min-h-[178px] md:rounded-[1.7rem] md:p-6 ${
        isSelected
          ? 'scale-[1.01] border border-amber-100/45 bg-amber-200/[0.085] shadow-[0_16px_56px_rgba(245,158,11,0.14),inset_0_1px_0_rgba(255,255,255,0.12)] md:scale-[1.012] md:shadow-[0_20px_80px_rgba(245,158,11,0.16),inset_0_1px_0_rgba(255,255,255,0.12)]'
          : 'border border-white/[0.075] bg-white/[0.026] hover:-translate-y-1 hover:border-white/16 hover:bg-white/[0.048]'
      }`}
    >
      <span className={`absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(251,191,36,0.16),transparent_42%)] transition ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}`} />
      {isSelected && <span className="selected-glow absolute inset-px rounded-[1rem] border border-amber-100/18 md:rounded-[1.65rem]" />}
      <span className="relative flex h-full w-full flex-col justify-between gap-3 md:gap-4">
        <span className="flex items-start justify-between gap-2">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ring-1 backdrop-blur-xl md:h-11 md:w-11 md:rounded-2xl ${isSelected ? 'from-amber-200/20 to-orange-400/8 text-amber-100 ring-amber-200/18' : 'from-white/8 to-white/[0.02] text-zinc-300 ring-white/10'}`}>
            <Icon className="h-4 w-4 md:h-5 md:w-5" />
          </span>
          {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0 text-orange-200 md:h-5 md:w-5" aria-hidden="true" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-base font-semibold leading-tight tracking-[-0.025em] text-white md:text-[1.05rem]">
            {title}
          </span>
          {subtitle && <span className="mt-1.5 block overflow-hidden text-xs leading-5 text-zinc-400 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] md:mt-2 md:text-sm md:leading-6">{subtitle}</span>}
          <span className="mt-3 block text-[0.58rem] font-medium uppercase tracking-[0.18em] text-zinc-500 md:mt-4 md:text-[0.65rem] md:tracking-[0.2em]">{isSelected ? 'Selected' : 'Choose'}</span>
        </span>
      </span>
    </button>
  );

  const ChipButton = ({ isSelected, onClick, children }) => (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={`w-full rounded-full px-3 py-3 text-xs font-semibold transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black md:px-5 md:text-sm ${
        isSelected
          ? 'bg-amber-100 text-zinc-950 shadow-[0_14px_42px_rgba(245,158,11,0.16)]'
          : 'border border-white/[0.08] bg-white/[0.028] text-zinc-300 hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.06]'
      }`}
    >
      {children}
    </button>
  );

  const MetricTile = ({ icon: Icon, label: metricLabel, value, tone = 'orange', quiet = false }) => (
    <div className={`${quiet ? 'rounded-2xl border-white/[0.065] bg-white/[0.018] p-4' : 'rounded-[1.55rem] border-white/[0.08] bg-black/22 p-5'} border backdrop-blur-xl`}>
      <div className="mb-4 flex items-center gap-3">
        <IconBubble icon={Icon} tone={tone} />
        <div className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">{metricLabel}</div>
      </div>
      <div className={`${quiet ? 'text-base' : 'text-xl'} font-semibold tracking-[-0.03em] text-white`}>{value}</div>
    </div>
  );

  const Background = () => (
    <>
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[#050506]" />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-22rem] h-[48rem] w-[82rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.20),rgba(217,119,6,0.075)_36%,transparent_72%)] blur-3xl" />
        <div className="absolute bottom-[-26rem] left-[-18rem] h-[52rem] w-[52rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12),transparent_68%)] blur-3xl" />
        <div className="absolute bottom-[-22rem] right-[-14rem] h-[46rem] w-[46rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.10),transparent_68%)] blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045),transparent_65%)] blur-2xl" />
        <div
          className="absolute inset-0 opacity-[0.045] mix-blend-screen"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.45) 1px, transparent 0)',
            backgroundSize: '18px 18px'
          }}
        />
      </div>
    </>
  );

  const SignupScreen = () => (
    <div className="relative min-h-screen overflow-hidden bg-black px-5 py-6 text-white antialiased">
      <Background />
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col justify-between">
        <div className="pt-4">
          <div className="flex items-center gap-3">
            {Logo()}
            <div>
              <div className="text-lg font-semibold tracking-[-0.035em] text-white">ForgeAI</div>
              <div className="text-[0.66rem] font-black uppercase tracking-[0.26em] text-amber-100/58">Performance Studio</div>
            </div>
          </div>
        </div>

        <section className="relative my-8 overflow-hidden rounded-[2.4rem] border border-amber-100/12 bg-[linear-gradient(145deg,rgba(251,191,36,0.085),rgba(255,255,255,0.028))] p-6 shadow-[0_34px_150px_rgba(245,158,11,0.14)] backdrop-blur-2xl">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-300/18 blur-3xl" />
          <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(253,230,138,0.16),transparent_44%)]" />
          <div className="relative">
            <div className="mb-8 grid h-20 w-20 place-items-center rounded-[1.75rem] border border-amber-100/18 bg-gradient-to-br from-amber-200/22 via-orange-300/12 to-black/20 text-amber-100 shadow-[0_20px_90px_rgba(245,158,11,0.20)]">
              <Brain className="h-9 w-9" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/24 px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-amber-100/70">
              <Sparkles className="h-3.5 w-3.5" />
              Adaptive athlete system
            </div>
            <h1 className="mt-6 text-6xl font-black leading-[0.86] tracking-[-0.075em] text-white">
              Forge Your Performance
            </h1>
            <p className="mt-6 text-base font-semibold leading-7 text-zinc-300/88">
              Adaptive workouts, intelligent progression, and performance tracking built around you.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-2">
              {[
                ['AI', 'Training'],
                ['XP', 'Progress'],
                ['PRO', 'Systems']
              ].map(([value, itemLabel]) => (
                <div key={value} className="rounded-[1.25rem] border border-white/[0.06] bg-black/22 px-3 py-4 text-center">
                  <div className="text-lg font-black tracking-[-0.04em] text-white">{value}</div>
                  <div className="mt-1 text-[0.56rem] font-black uppercase tracking-[0.14em] text-zinc-500">{itemLabel}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="space-y-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleMockGoogleSignIn}
            className="group flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-amber-200 via-orange-300 to-orange-400 px-6 py-5 text-base font-black text-zinc-950 shadow-[0_22px_90px_rgba(245,158,11,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_110px_rgba(245,158,11,0.36)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-100 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-sm font-black text-zinc-950">G</span>
            Continue with Google
            <ChevronRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
          </button>
          <p className="mx-auto max-w-xs text-center text-xs font-semibold leading-5 text-zinc-500">
            By continuing, you agree to ForgeAI Terms and Privacy Policy.
          </p>
          <p className="text-center text-[0.62rem] font-bold uppercase tracking-[0.18em] text-zinc-700">
            Demo Google login. Supabase Auth ready later.
          </p>
        </div>
      </div>
    </div>
  );

  const StatChip = ({ label: chipLabel, value, className = '' }) => (
    <div className={`rounded-full border border-white/10 bg-black/30 px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl ${className}`}>
      <div className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">{chipLabel}</div>
      <div className="mt-0.5 text-sm font-semibold tracking-[-0.02em] text-white">{value}</div>
    </div>
  );

  const SignatureOrb = () => (
    <div className="signature-orb relative mx-auto aspect-square w-full max-w-[28rem]">
      <div className="absolute inset-6 rounded-full bg-[radial-gradient(circle_at_50%_42%,rgba(253,230,138,0.32),rgba(251,146,60,0.13)_32%,rgba(255,255,255,0.035)_56%,transparent_72%)] blur-xl" />
      <div className="absolute inset-10 rounded-full border border-amber-100/15 bg-white/[0.025] shadow-[inset_0_0_80px_rgba(245,158,11,0.08),0_30px_120px_rgba(0,0,0,0.36)] backdrop-blur-2xl" />
      <div className="orb-ring absolute inset-14 rounded-full border border-amber-100/25" />
      <div className="orb-ring-slow absolute inset-24 rounded-full border border-white/10" />
      <div className="absolute left-1/2 top-1/2 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/12 bg-zinc-950/72 shadow-[0_0_70px_rgba(245,158,11,0.20)] backdrop-blur-2xl">
        <div className="text-center">
          <Brain className="mx-auto mb-2 h-8 w-8 text-amber-100" />
          <div className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-zinc-500">Session AI</div>
          <div className="mt-1 text-2xl font-black tracking-[-0.05em] text-white">94</div>
        </div>
      </div>
      <StatChip label="Adaptive" value={goalLabel} className="absolute left-0 top-14" />
      <StatChip label="Readiness" value={intensityLabel} className="absolute right-0 top-28" />
      <StatChip label="Volume" value={volumeEstimate} className="absolute bottom-16 left-8" />
      <StatChip label="Tempo" value="Smart" className="absolute bottom-6 right-10" />
    </div>
  );

  const Hero = () => (
    <header className="grid gap-12 py-12 md:py-20 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:py-28">
      <div>
        <div className="mb-8 flex items-center gap-3">
          {Logo()}
          <div>
            <div className="text-lg font-semibold tracking-[-0.035em] text-white">ForgeAI</div>
            <div className="text-[0.66rem] font-medium uppercase tracking-[0.26em] text-amber-100/58">Performance Studio</div>
          </div>
        </div>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-100/12 bg-white/[0.035] px-4 py-2 text-sm text-zinc-300 shadow-[0_16px_60px_rgba(0,0,0,0.20)] backdrop-blur-xl">
          <Sparkles className="h-4 w-4 text-amber-100" />
          Adaptive training intelligence
        </div>
        <h1 className="max-w-5xl text-6xl font-black leading-[0.88] tracking-[-0.075em] text-white md:text-8xl xl:text-[6.8rem]">
          Train With Precision
        </h1>
        <div className="mt-6 h-px w-28 bg-gradient-to-r from-amber-200 via-orange-300 to-transparent" />
        <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-300/88 md:text-xl">
          Configure your goal, equipment, time, and training level. ForgeAI builds a personalized session with smart volume, tempo, rest, and exercise sequencing.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href="#preferences"
            className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-amber-200 via-orange-300 to-orange-400 px-7 py-4 text-base font-black text-zinc-950 shadow-[0_20px_80px_rgba(245,158,11,0.24)] transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_28px_100px_rgba(245,158,11,0.31)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-100 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Get Started
            <ChevronRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
      {SignatureOrb()}
    </header>
  );

  const TrainingInsights = ({ compact = false }) => (
    <PremiumCard className={compact ? '' : 'mt-12'} delay={compact ? 0 : 120} variant="secondary">
      <SectionHeader
        icon={Brain}
        eyebrow="Training Intelligence"
        title="Session Intelligence"
        subtitle={compact ? null : 'A compact readout of the current prescription before the workout is forged.'}
      />
      <div className={`${compact ? 'space-y-3' : 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3'}`}>
        {profileItems.map(({ label: itemLabel, value, icon }, index) => (
          <MetricTile
            key={itemLabel}
            label={itemLabel}
            value={value}
            icon={icon}
            tone={index % 3 === 1 ? 'blue' : index % 3 === 2 ? 'green' : 'orange'}
            quiet={compact}
          />
        ))}
      </div>
    </PremiumCard>
  );

  const SessionIntensitySummary = ({ exercises }) => {
    const sessionIntensity = getSessionIntensityGuidance(exercises);
    if (!sessionIntensity) return null;

    return (
      <PremiumCard variant="flat" className="!p-4 sm:!p-5">
        <div className="flex items-center gap-3">
          <IconBubble icon={Gauge} />
          <div className="min-w-0 flex-1">
            <div className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-amber-100/58">Session Intensity</div>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-4xl font-black tracking-[-0.065em] text-white">{sessionIntensity.displayPercent}</span>
              <span className="text-sm font-black text-amber-100">{sessionIntensity.classification}</span>
            </div>
            <div className="mt-1 text-xs font-bold leading-5 text-zinc-500">{sessionIntensity.target}</div>
          </div>
        </div>
      </PremiumCard>
    );
  };

  const Preferences = () => (
    <div id="preferences" className="space-y-5 pb-6 md:space-y-10 md:pb-0">
      <PremiumCard className="!p-4 sm:!p-5 md:!p-8" delay={60} variant="primary">
        <SectionHeader icon={Target} eyebrow="Step 01" title="Choose Your Training Goal" subtitle="Each goal keeps the same generation engine underneath, tuned for a different adaptation." />
        <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
          {goalOptions.map(option => (
            <ChoiceCard key={option.value} {...option} isSelected={settings.goal === option.value} onClick={() => setSettings({ ...settings, goal: option.value })} />
          ))}
        </div>
      </PremiumCard>

      {settings.goal === 'v02-max' ? (
        <PremiumCard className="!p-4 sm:!p-5 md:!p-8" delay={120} variant="primary">
          <SectionHeader icon={Activity} eyebrow="Step 02" title="Conditioning Mode" subtitle="Choose steady aerobic development or high-intensity interval work." />
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {conditioningOptions.map(option => (
              <ChoiceCard key={option.value} {...option} isSelected={settings.conditioningType === option.value} onClick={() => setSettings({ ...settings, conditioningType: option.value })} />
            ))}
          </div>
        </PremiumCard>
      ) : (
        <PremiumCard className="!p-4 sm:!p-5 md:!p-8" delay={120} variant="primary">
          <SectionHeader icon={User} eyebrow="Step 02" title="Experience Level" subtitle="Training age adjusts complexity, intensity, and advanced loading methods." />
          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            {experienceOptions.map(option => (
              <ChoiceCard
                key={option.value}
                {...option}
                isSelected={settings.experience === option.value}
                onClick={() => {
                  setSettings({ ...settings, experience: option.value });
                  if (option.value === 'beginner' && isBodyweightEquipment(settings.equipment)) {
                    setSelectedBodyweightSubtype('home_workout');
                  }
                }}
              />
            ))}
          </div>
        </PremiumCard>
      )}

      {settings.goal !== 'v02-max' && (
        <>
          <PremiumCard className="!p-4 sm:!p-5 md:!p-8" delay={180} variant="primary">
            <SectionHeader icon={Dumbbell} eyebrow="Step 03" title="Equipment Access" subtitle="Select the tools available today. The session stays inside those constraints." />
            <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
              {equipmentOptions.map(option => (
                <ChoiceCard
                  key={option.value}
                  {...option}
                  isSelected={settings.equipment === option.value}
                  onClick={() => {
                    setSettings({ ...settings, equipment: option.value });
                    if (option.value === 'no-equipment') {
                      setSelectedBodyweightSubtype(settings.experience === 'beginner' ? 'home_workout' : selectedBodyweightSubtype || 'home_workout');
                    }
                  }}
                />
              ))}
            </div>
            {settings.equipment === 'no-equipment' && settings.experience !== 'beginner' && (
              <div className="mt-5 rounded-[1.65rem] border border-white/[0.07] bg-black/20 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-amber-100/58">Bodyweight Mode</div>
                    <div className="mt-1 text-sm font-bold text-white">Choose how this session should feel.</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {bodyweightSubtypeOptions.map(option => (
                    <ChoiceCard
                      key={option.value}
                      {...option}
                      isSelected={selectedBodyweightSubtype === option.value}
                      onClick={() => setSelectedBodyweightSubtype(option.value)}
                    />
                  ))}
                </div>
              </div>
            )}
          </PremiumCard>

          <PremiumCard className="!p-4 sm:!p-5 md:!p-6" delay={240} variant="secondary">
            <SectionHeader icon={Activity} eyebrow="Step 04" title="Workout Focus" subtitle="Choose between full-body training or targeted muscle groups." />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-5">
              {focusOptions.map(option => (
                <ChipButton key={option.value} isSelected={settings.focus === option.value} onClick={() => setSettings({ ...settings, focus: option.value })}>
                  {option.title}
                </ChipButton>
              ))}
            </div>
          </PremiumCard>

          <div className="grid gap-5 md:gap-8 lg:grid-cols-[1fr_0.82fr]">
            <PremiumCard className="!p-4 sm:!p-5 md:!p-8" delay={300} variant="primary">
              <SectionHeader icon={Repeat} eyebrow="Step 05" title="Workout Style" subtitle="Choose between paired supersets or focused straight sets." />
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {styleOptions.map(option => (
                  <ChoiceCard key={option.value} {...option} isSelected={settings.workoutStyle === option.value} onClick={() => setSettings({ ...settings, workoutStyle: option.value })} />
                ))}
              </div>
            </PremiumCard>

            <PremiumCard className="!p-4 sm:!p-5 md:!p-6" delay={360} variant="secondary">
              <SectionHeader icon={Clock} eyebrow="Step 06" title="Time Available" subtitle="The workout adapts volume and structure to fit your available training time." />
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {['20m', '30m', '45m', '60m'].map(duration => (
                  <ChipButton key={duration} isSelected={settings.duration === duration} onClick={() => setSettings({ ...settings, duration })}>
                    {duration}
                  </ChipButton>
                ))}
              </div>
            </PremiumCard>
          </div>
        </>
      )}

      <PremiumCard className="overflow-hidden" delay={420} variant="hero">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/70">Ready when you are</div>
            <h2 className="text-3xl font-black tracking-[-0.055em] text-white md:text-5xl">Generate your elite session.</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-400">
              You will get structured exercise order, sets, reps, tempo, rest, and muscle targeting in a premium training card system.
            </p>
          </div>
          <button
            type="button"
            onClick={generateWorkout}
            className="group inline-flex min-h-16 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-amber-200 via-orange-300 to-orange-400 px-8 py-5 text-lg font-black text-zinc-950 shadow-[0_20px_80px_rgba(245,158,11,0.24)] transition duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:shadow-[0_26px_110px_rgba(245,158,11,0.32)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-100 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Generate Elite Workout
            <ChevronRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </button>
        </div>
      </PremiumCard>
    </div>
  );

  const TempoPopover = ({ exercise, idx }) => {
    if (showTempoInfo !== idx) return null;
    const hasTempo = exercise.tempo && exercise.tempo !== '---' && exercise.tempo !== 'random';
    const phases = hasTempo ? getTempoPhases(exercise.name) : null;
    const t = exercise.tempo || '';
    const digit = (value, fallback) => value === 'X' ? 'Explosive' : value ? `${value}s` : fallback;
    const d1 = digit(t[0], 'N/A');
    const d2 = t[1] === '0' ? 'No pause' : digit(t[1], 'N/A pause');
    const d3 = digit(t[2], 'N/A');
    const d4 = t[3] === '0' ? 'No pause' : digit(t[3], 'N/A pause');

    return (
      <div
        className="fixed inset-0 z-[90] bg-black/72 md:grid md:place-items-center"
        onPointerDown={() => setShowTempoInfo(null)}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Tempo explanation for ${exercise.name}`}
          onPointerDown={(event) => event.stopPropagation()}
          className="fixed left-1/2 top-1/2 isolate w-[min(91vw,24.5rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.45rem] border border-white/[0.12] bg-[#050507] text-[0.78rem] shadow-[0_30px_120px_rgba(0,0,0,0.82)] md:w-[min(92vw,27rem)] md:rounded-3xl md:text-sm"
        >
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_0%,rgba(245,158,11,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01))]" />
          <div>
            <div className="flex items-center gap-3 border-b border-white/[0.07] bg-[#050507]/98 px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.45)] md:px-5">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-amber-100/18 bg-amber-100/[0.08] text-amber-100 md:h-9 md:w-9 md:rounded-2xl">
                <Timer className="h-4 w-4" />
              </div>
              <div>
                <div className="font-bold text-white">What is Tempo?</div>
                <div className="text-xs text-zinc-500">Rep speed and positional control</div>
              </div>
            </div>
            <div className="px-4 py-3 md:px-5">
            <p className="mb-3 leading-5 text-zinc-300 md:leading-6">A 4-digit code defining rep speed in seconds. X means as fast as possible.</p>
            <div className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-amber-100/70 md:text-[0.68rem]">Reading the 4 digits:</div>
            <div className="space-y-1.5 text-zinc-300">
              <div><span className="font-semibold text-white">1st</span> Eccentric lowering phase.</div>
              <div><span className="font-semibold text-white">2nd</span> Pause in the stretched position.</div>
              <div><span className="font-semibold text-white">3rd</span> Concentric lifting phase.</div>
              <div><span className="font-semibold text-white">4th</span> Pause at lockout.</div>
            </div>
            {hasTempo && phases && (
              <div className="mt-3 rounded-2xl border border-orange-300/18 bg-orange-300/[0.075] p-3">
                <div className="mb-2 font-semibold text-orange-100">{exercise.name} / {exercise.tempo}</div>
                {phases.concentricFirst && (
                  <div className="mb-2 text-[0.72rem] font-semibold text-yellow-200 md:text-xs">This movement begins with the concentric phase.</div>
                )}
                <div className="space-y-1 text-[0.72rem] leading-4 text-zinc-300 md:text-xs md:leading-5">
                  <div><span className="font-semibold text-white">1st ({d1})</span> {phases.eccentric}</div>
                  <div><span className="font-semibold text-white">2nd ({d2})</span> {phases.bottom}</div>
                  <div><span className="font-semibold text-white">3rd ({d3})</span> {phases.concentric}</div>
                  <div><span className="font-semibold text-white">4th ({d4})</span> {phases.top}</div>
                </div>
              </div>
            )}
            <p className="mt-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3 leading-5 text-zinc-300 md:leading-6">
              Controlling tempo increases time under tension, enhances muscular tension and irradiation, improves the mind-muscle connection, and drives specific training adaptations.
            </p>
            </div>
          </div>
          <div className="border-t border-white/[0.07] bg-[#050507] px-4 py-3 md:px-5">
            <button
              type="button"
              onClick={() => setShowTempoInfo(null)}
              className="w-full rounded-full bg-white px-4 py-2.5 text-sm font-bold text-black transition hover:bg-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-200 md:py-3"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getMovementGoalKey = (goal = settings.goal) => {
    if (goal === 'build-muscle') return 'buildMuscle';
    if (goal === 'strength') return 'strength';
    if (goal === 'fat-loss' || goal === 'power') return 'power';
    return 'buildMuscle';
  };

  const getMovementGoalLabel = (goal = settings.goal) => {
    const goalKey = getMovementGoalKey(goal);
    if (goalKey === 'strength') return 'Strength';
    if (goalKey === 'power') return 'Power';
    return 'Build Muscle';
  };

  const openMovementPage = (exercise, overrides = {}) => {
    const exerciseName = typeof exercise === 'string' ? exercise : exercise?.name;
    const profile = getMovementProfileByName(exerciseName);
    const slug = profile?.slug || slugifyExerciseName(exerciseName) || 'movement';
    const previousHash = typeof window !== 'undefined' ? (window.location.hash || '#preferences') : '#preferences';
    setShowExerciseDemo(null);
    setActiveMovementContext({
      slug,
      exerciseName: profile?.displayName || exerciseName || 'Exercise',
      goal: overrides.goal || settings.goal,
      tempo: overrides.tempo ?? exercise?.tempo ?? null,
      setsReps: overrides.setsReps ?? exercise?.setsReps ?? null,
      rest: overrides.rest ?? exercise?.rest ?? null,
      source: overrides.source || 'workout',
      previousHash
    });

    if (typeof window !== 'undefined' && window.location.hash !== `#/movement/${slug}`) {
      window.location.hash = `/movement/${slug}`;
    }
  };

  const closeMovementPage = () => {
    if (typeof window === 'undefined') {
      setActiveMovementContext(null);
      return;
    }

    const fallbackHash = activeMovementContext?.previousHash && activeMovementContext.previousHash !== window.location.hash
      ? activeMovementContext.previousHash
      : '#preferences';
    if (window.location.hash.startsWith('#/movement/')) {
      window.location.hash = fallbackHash.replace(/^#/, '');
    } else {
      setActiveMovementContext(null);
    }
  };

  const parseTempo = (tempo) => {
    const digits = String(tempo || '')
      .toUpperCase()
      .match(/[0-9X]/g);

    if (!digits || digits.length < 4) return [];

    const phaseValue = (digit, label) => {
      if (digit === 'X') return label === 'Concentric' ? 'Explosive drive' : 'Explosive intent';
      if (digit === '0') return label.includes('Pause') || label.includes('Lockout') ? 'No pause' : 'Immediate';
      return `${digit}s ${label.toLowerCase()}`;
    };

    return [
      { label: 'Eccentric', value: phaseValue(digits[0], 'Eccentric'), digit: digits[0], detail: 'Lowering control' },
      { label: 'Bottom Pause', value: phaseValue(digits[1], 'Bottom Pause'), digit: digits[1], detail: 'Stretched position' },
      { label: 'Concentric', value: phaseValue(digits[2], 'Concentric'), digit: digits[2], detail: 'Drive phase' },
      { label: 'Lockout', value: phaseValue(digits[3], 'Lockout'), digit: digits[3], detail: 'Top control' }
    ];
  };

  const ExerciseCard = ({ exercise, idx }) => {
    const muscles = muscleData[exercise.name] || { primary: '', secondary: '', stabilizers: '' };
    const muscleProfileKey = `${exercise.label}-${exercise.name}-${idx}`;
    const isMuscleProfileOpen = expandedMuscleProfile === muscleProfileKey;
    const badge = exercise.isConditioning
      ? (exercise.isVo2Max ? 'VO2 Max' : 'Zone 2')
      : exercise.isMain
        ? 'Main Lift'
        : exercise.schemeName || 'Accessory';
    const category = exercise.isConditioning ? 'Conditioning' : muscles.primary || 'Strength';
    const intensityGuidance = getExerciseIntensityGuidance(exercise);
    const ExerciseMetricTile = ({ icon: Icon, label: metricLabel, value, tone = 'orange', infoButton = null }) => {
      const toneClasses = {
        orange: 'from-amber-200/16 to-orange-400/[0.05] text-amber-100 ring-amber-200/14',
        blue: 'from-sky-300/14 to-cyan-300/[0.04] text-sky-100 ring-sky-200/14',
        green: 'from-emerald-300/14 to-lime-300/[0.04] text-emerald-100 ring-emerald-200/14'
      };

      return (
        <div className="min-w-0 rounded-2xl border border-white/[0.08] bg-black/22 p-3 backdrop-blur-xl md:rounded-[1.55rem] md:p-5">
          <div className="mb-2 flex items-center justify-between gap-1.5 md:mb-4 md:gap-3">
            <div className="flex min-w-0 items-center gap-1.5 md:gap-3">
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br ring-1 md:h-11 md:w-11 md:rounded-2xl ${toneClasses[tone]}`}>
                <Icon className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="truncate text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-zinc-500 md:text-[0.66rem] md:tracking-[0.2em]">{metricLabel}</div>
            </div>
            {infoButton}
          </div>
          <div className="break-words text-[0.95rem] font-semibold leading-tight tracking-[-0.03em] text-white sm:text-lg md:text-xl">{value}</div>
        </div>
      );
    };

    return (
      <article
        className="workout-card group relative overflow-hidden rounded-[1.7rem] border border-white/[0.085] bg-[linear-gradient(145deg,rgba(255,255,255,0.046),rgba(255,255,255,0.018))] p-4 shadow-[0_22px_90px_rgba(0,0,0,0.30)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-white/14 hover:bg-white/[0.048] md:rounded-[2.1rem] md:p-8"
        style={{ '--delay': `${idx * 70}ms` }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(245,158,11,0.09),transparent_34%)] opacity-80" />
        <div className="relative mb-5 md:mb-8">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2 md:mb-5">
              <span className="rounded-full border border-amber-100/18 bg-amber-200/[0.075] px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-amber-100">{exercise.label}</span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-zinc-400">{badge}</span>
              <span className="rounded-full border border-white/[0.08] bg-black/20 px-3 py-1 text-xs font-medium text-zinc-400">{category}</span>
            </div>
            <h3 className="max-w-3xl text-3xl font-black leading-[0.95] tracking-[-0.055em] text-white md:text-5xl">{exercise.name}</h3>
          </div>
          {!exercise.isConditioning && (
            <button
              type="button"
              onClick={() => openMovementPage(exercise)}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.035] px-5 py-3 text-base font-bold text-zinc-100 shadow-[0_14px_50px_rgba(0,0,0,0.20)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/14 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black md:mt-6 md:min-h-14"
              title="Open movement coaching"
            >
              <PlayCircle className="h-5 w-5 text-amber-100" />
              Form
            </button>
          )}
        </div>

        {exercise.schemeName && (
          <div className="relative mb-4 rounded-[1.35rem] border border-white/[0.07] bg-black/18 p-4 md:mb-6 md:rounded-[1.6rem] md:p-5">
            <div className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-amber-100/65">{exercise.schemeName}</div>
            {exercise.schemeDescription && <div className="text-sm leading-6 text-zinc-400">{exercise.schemeDescription}</div>}
            {exercise.schemeExample && (
              <div className="mt-3 rounded-[1.15rem] border border-white/[0.06] bg-white/[0.025] p-3 text-sm text-zinc-400 md:mt-4 md:rounded-[1.25rem] md:p-4">
                <div className="mb-2 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-zinc-500">Example prescription</div>
                <div className="leading-6">{exercise.schemeExample}</div>
              </div>
            )}
          </div>
        )}

        {exercise.isConditioning ? (
          exercise.vo2Protocol ? (
            <div className="relative space-y-5">
              <div className="rounded-[1.65rem] border border-amber-100/16 bg-amber-200/[0.055] p-5">
                <div className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-amber-100">Protocol</div>
                <div className="text-sm leading-6 text-zinc-200">{exercise.vo2Protocol.howTo}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                <ExerciseMetricTile icon={Zap} label="Sprint" value={exercise.vo2Protocol.sprint} />
                <ExerciseMetricTile icon={Timer} label="Recover" value={exercise.vo2Protocol.recovery} tone="blue" />
                <ExerciseMetricTile icon={Repeat} label="Rounds" value={exercise.vo2Protocol.rounds} tone="green" />
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <details className="rounded-[1.5rem] border border-white/[0.07] bg-black/18 p-5 text-sm text-zinc-300">
                  <summary className="cursor-pointer font-bold text-emerald-200">Benefits</summary>
                  <div className="mt-3 space-y-2 leading-6">
                    {exercise.vo2Protocol.benefits.split('. ').filter(Boolean).map((benefit, i) => (
                      <div key={i}>{benefit.replace(/\.$/, '')}</div>
                    ))}
                  </div>
                </details>
                <details className="rounded-[1.5rem] border border-white/[0.07] bg-black/18 p-5 text-sm text-zinc-300">
                  <summary className="cursor-pointer font-bold text-sky-200">Who it fits</summary>
                  <div className="mt-3 space-y-2 leading-6">
                    {exercise.vo2Protocol.whoFor.split('. ').filter(Boolean).map((who, i) => (
                      <div key={i}>{who.replace(/\.$/, '')}</div>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          ) : (
            <MetricTile icon={Activity} label="Protocol" value={exercise.setsReps} tone="green" />
          )
        ) : (
          <>
            <div className="relative grid grid-cols-3 gap-2 md:gap-4">
              <ExerciseMetricTile icon={Layers} label="Sets x Reps" value={exercise.setsReps} />
              <div className="relative">
                <ExerciseMetricTile
                  icon={Timer}
                  label="Tempo"
                  value={exercise.tempo}
                  tone="blue"
                  infoButton={(
                    <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowTempoInfo(showTempoInfo === idx ? null : idx); }}
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04] text-zinc-300 transition hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 md:h-8 md:w-8"
                    aria-label={`Explain tempo for ${exercise.name}`}
                  >
                    <Info className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </button>
                  )}
                />
                <TempoPopover exercise={exercise} idx={idx} />
              </div>
              <ExerciseMetricTile icon={Clock} label="Rest" value={exercise.rest} tone="green" />
            </div>

            {intensityGuidance && (
              intensityGuidance.mode === 'intent' ? (
                <div className="relative mt-3 flex items-center justify-between gap-3 rounded-[1.25rem] border border-emerald-100/[0.09] bg-emerald-100/[0.035] px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-emerald-100/62">{intensityGuidance.title}</div>
                    <div className="mt-1 text-base font-black tracking-[-0.03em] text-white">{intensityGuidance.headline}</div>
                  </div>
                  <Zap className="h-5 w-5 shrink-0 text-emerald-100" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openLoadIntelligence(exercise.name)}
                  className="relative mt-3 flex w-full items-center justify-between gap-3 rounded-[1.25rem] border border-amber-100/[0.09] bg-amber-100/[0.04] px-4 py-3 text-left transition hover:border-amber-100/18 hover:bg-amber-100/[0.065] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                >
                  <div className="min-w-0">
                    <div className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-amber-100/62">{intensityGuidance.title}</div>
                    <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="text-base font-black tracking-[-0.03em] text-white">{intensityGuidance.headline}</span>
                      {intensityGuidance.loadText && <span className="text-xs font-bold text-amber-100/72">{intensityGuidance.percentLabel}</span>}
                    </div>
                    {!intensityGuidance.profile && (
                      <div className="mt-1 text-xs font-bold text-zinc-500">Add 1RM for load guidance</div>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-amber-100" />
                </button>
              )
            )}

            {muscles.primary && (
              <div className="relative mt-5">
                <button
                  type="button"
                  onClick={() => setExpandedMuscleProfile(isMuscleProfileOpen ? null : muscleProfileKey)}
                  aria-expanded={isMuscleProfileOpen}
                  className="flex w-full items-center justify-between gap-3 rounded-[1.35rem] border border-white/[0.065] bg-black/14 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-zinc-300 transition hover:border-white/14 hover:bg-white/[0.035] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black md:px-5"
                >
                  <span>Muscle profile</span>
                  <ChevronRight className={`h-4 w-4 text-amber-100 transition ${isMuscleProfileOpen ? 'rotate-90' : ''}`} />
                </button>
                {isMuscleProfileOpen && (
                  <div className="mt-3 rounded-[1.45rem] border border-white/[0.065] bg-black/14 p-4 text-xs text-zinc-300 md:p-5 md:text-sm">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
                      <div className="min-w-0"><span className="block text-[0.58rem] uppercase tracking-[0.12em] text-orange-200/70 md:text-xs md:tracking-[0.14em]">Primary</span><span className="mt-1 block break-words leading-5 md:leading-6">{muscles.primary}</span></div>
                      {muscles.secondary && <div className="min-w-0"><span className="block text-[0.58rem] uppercase tracking-[0.12em] text-sky-200/70 md:text-xs md:tracking-[0.14em]">Secondary</span><span className="mt-1 block break-words leading-5 md:leading-6">{muscles.secondary}</span></div>}
                      {muscles.stabilizers && <div className="min-w-0"><span className="block text-[0.58rem] uppercase tracking-[0.12em] text-emerald-200/70 md:text-xs md:tracking-[0.14em]">Stabilizers</span><span className="mt-1 block break-words leading-5 md:leading-6">{muscles.stabilizers}</span></div>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </article>
    );
  };

  const SessionStatsCard = ({ stats }) => {
    const formattedVolume = Number.isInteger(stats.volume) ? stats.volume : Number(stats.volume.toFixed(1));

    return (
      <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.035] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[1.4rem] bg-black/24 p-4">
            <div className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">Duration</div>
            <div className="text-xl font-black tracking-[-0.04em] text-white">{formatDuration(elapsedSeconds)}</div>
          </div>
          <div className="rounded-[1.4rem] bg-black/24 p-4">
            <div className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">Volume</div>
            <div className="text-xl font-black tracking-[-0.04em] text-white">{formattedVolume} kg</div>
          </div>
          <div className="rounded-[1.4rem] bg-black/24 p-4">
            <div className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">Sets</div>
            <div className="text-xl font-black tracking-[-0.04em] text-white">{stats.completedSets}</div>
          </div>
        </div>
      </div>
    );
  };

  const SessionExerciseRow = ({ exercise, index }) => {
    const logs = setLogs[index] || [];
    const completed = logs.filter(set => set.completed).length;
    const total = logs.length || parseSetCount(exercise);

    return (
      <button
        type="button"
        onClick={() => setActiveExerciseIndex(index)}
        className="group flex w-full items-center gap-4 rounded-[1.75rem] border border-white/[0.075] bg-white/[0.03] p-4 text-left transition hover:-translate-y-0.5 hover:border-white/14 hover:bg-white/[0.052] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[1.35rem] border border-amber-100/12 bg-gradient-to-br from-amber-200/[0.13] to-white/[0.025]">
          <Dumbbell className="h-6 w-6 text-amber-100" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-xs font-black uppercase tracking-[0.16em] text-amber-100/70">{exercise.label || index + 1}</span>
            <span className="truncate text-lg font-bold tracking-[-0.035em] text-white">{exercise.name}</span>
          </div>
          <div className="mt-1 text-sm text-zinc-500">{completed}/{total} done</div>
        </div>
        <div className="text-2xl leading-none text-zinc-500 transition group-hover:text-zinc-300" aria-hidden="true">...</div>
      </button>
    );
  };

  const ExerciseSetDetail = () => {
    const exercise = workout?.[activeExerciseIndex];
    if (!exercise) return null;

    const logs = setLogs[activeExerciseIndex] || [];
    const completed = logs.filter(set => set.completed).length;
    const intensityGuidance = getExerciseIntensityGuidance(exercise);
    const updateWeight = (setIndex, value) => updateSetLog(activeExerciseIndex, setIndex, { weight: normalizeSetInputValue(value, true) });
    const updateReps = (setIndex, value) => updateSetLog(activeExerciseIndex, setIndex, { reps: normalizeSetInputValue(value, false) });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setActiveExerciseIndex(null)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-zinc-200 transition hover:bg-white/[0.065] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            aria-label="Back to exercise list"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-sm font-semibold text-zinc-400">{completed}/{logs.length} done</div>
        </div>

        <div>
          <div className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-amber-100/58">Exercise</div>
          <h2 className="text-4xl font-black leading-none tracking-[-0.06em] text-white md:text-5xl">{exercise.name}</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile icon={Layers} label="Sets x Reps" value={exercise.setsReps || 'Protocol'} quiet />
          <MetricTile icon={Timer} label="Tempo" value={exercise.tempo || 'Open'} tone="blue" quiet />
          <MetricTile icon={Clock} label="Rest" value={exercise.rest || 'As needed'} tone="green" quiet />
        </div>

        {intensityGuidance && (
          intensityGuidance.mode === 'intent' ? (
            <div className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-emerald-100/[0.1] bg-emerald-100/[0.04] px-4 py-4 shadow-[0_18px_58px_rgba(16,185,129,0.08)]">
              <div className="min-w-0">
                <div className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-emerald-100/62">{intensityGuidance.title}</div>
                <div className="mt-1 text-lg font-black tracking-[-0.035em] text-white">{intensityGuidance.headline}</div>
              </div>
              <Zap className="h-5 w-5 shrink-0 text-emerald-100" />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openLoadIntelligence(exercise.name)}
              className="flex w-full items-center justify-between gap-3 rounded-[1.5rem] border border-amber-100/[0.1] bg-amber-100/[0.045] px-4 py-4 text-left shadow-[0_18px_58px_rgba(245,158,11,0.08)] transition hover:border-amber-100/18 hover:bg-amber-100/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              <div className="min-w-0">
                <div className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-amber-100/62">{intensityGuidance.title}</div>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-lg font-black tracking-[-0.035em] text-white">{intensityGuidance.headline}</span>
                  {intensityGuidance.loadText && <span className="text-xs font-bold text-amber-100/72">{intensityGuidance.percentLabel}</span>}
                </div>
                {!intensityGuidance.profile && (
                  <div className="mt-1 text-xs font-bold text-zinc-500">Add 1RM for load guidance</div>
                )}
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-amber-100" />
            </button>
          )
        )}

        <div className="space-y-3">
          {logs.map((set, setIndex) => (
            <div
              key={set.setNumber}
              className={`grid gap-3 rounded-[1.5rem] border p-4 transition sm:grid-cols-[auto_1fr_1fr_auto] sm:items-center ${
                set.completed
                  ? 'border-amber-100/24 bg-amber-200/[0.07]'
                  : 'border-white/[0.075] bg-white/[0.03]'
              }`}
            >
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-400">Set {set.setNumber}</div>
              <label className="block">
                <span className="sr-only">Weight for set {set.setNumber}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  enterKeyHint="next"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  name={`weight-${activeExerciseIndex}-${set.setNumber}`}
                  defaultValue={set.weight || ''}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => event.stopPropagation()}
                  onInput={(event) => updateWeight(setIndex, event.currentTarget.value)}
                  onChange={(event) => updateWeight(setIndex, event.target.value)}
                  placeholder="Weight"
                  className="forge-session-input w-full touch-manipulation rounded-2xl border border-white/[0.08] bg-zinc-950/85 px-4 py-3 text-base font-semibold text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-100/40 focus:ring-2 focus:ring-amber-100/20"
                  aria-label={`Weight in kilograms for set ${set.setNumber}`}
                />
              </label>
              <label className="block">
                <span className="sr-only">Reps for set {set.setNumber}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  enterKeyHint="done"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  name={`reps-${activeExerciseIndex}-${set.setNumber}`}
                  defaultValue={set.reps || ''}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => event.stopPropagation()}
                  onInput={(event) => updateReps(setIndex, event.currentTarget.value)}
                  onChange={(event) => updateReps(setIndex, event.target.value)}
                  placeholder="Reps"
                  className="forge-session-input w-full touch-manipulation rounded-2xl border border-white/[0.08] bg-zinc-950/85 px-4 py-3 text-base font-semibold text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-100/40 focus:ring-2 focus:ring-amber-100/20"
                  aria-label={`Reps for set ${set.setNumber}`}
                />
              </label>
              <button
                type="button"
                aria-pressed={set.completed}
                onClick={() => updateSetLog(activeExerciseIndex, setIndex, { completed: !set.completed })}
                className={`rounded-full px-5 py-3 text-sm font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                  set.completed
                    ? 'bg-amber-100 text-zinc-950 shadow-[0_12px_42px_rgba(245,158,11,0.18)]'
                    : 'border border-white/[0.08] bg-white/[0.035] text-zinc-300 hover:bg-white/[0.065]'
                }`}
              >
                {set.completed ? 'Done' : 'Mark Done'}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const FinishSummaryModal = ({ stats }) => {
    const formattedVolume = Number.isInteger(stats.volume) ? stats.volume : Number(stats.volume.toFixed(1));
    const rewardPreview = getWorkoutRewardPreview(userProgress);

    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/72 p-4 backdrop-blur-xl">
        <div className="w-full max-w-md rounded-[2rem] border border-white/[0.1] bg-zinc-950/94 p-6 shadow-[0_34px_140px_rgba(0,0,0,0.62)]">
          <div className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-amber-100/58">Session Complete</div>
          <h2 className="text-4xl font-black tracking-[-0.06em] text-white">Workout Summary</h2>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <MetricTile icon={Timer} label="Duration" value={formatDuration(elapsedSeconds)} quiet />
            <MetricTile icon={BarChart3} label="Volume" value={`${formattedVolume} kg`} quiet />
            <MetricTile icon={CheckCircle2} label="Sets" value={stats.completedSets} tone="green" quiet />
            <MetricTile icon={Dumbbell} label="Exercises" value={stats.completedExercises} tone="blue" quiet />
          </div>
          <div className="mt-4 rounded-[1.5rem] border border-amber-100/12 bg-amber-100/[0.055] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-amber-100/60">Completion Reward</div>
              <div className="rounded-full border border-amber-100/14 bg-black/20 px-3 py-1 text-xs font-black text-amber-100">x{rewardPreview.multiplier.toFixed(2)}</div>
            </div>
            {rewardPreview.eligible ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-3">
                  <div className="text-lg font-black text-white">+{rewardPreview.xp}</div>
                  <div className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-zinc-500">XP Earned</div>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-3">
                  <div className="text-sm font-black text-white">{rewardPreview.label}</div>
                  <div className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-zinc-500">Multiplier</div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3 text-sm font-bold text-zinc-300">
                Workout XP already earned today
              </div>
            )}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setShowFinishSummary(false)}
              className="rounded-full border border-white/[0.08] bg-white/[0.035] px-5 py-3 font-bold text-zinc-200 transition hover:bg-white/[0.065] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              Back to Workout
            </button>
            <button
              type="button"
              onClick={finishAndSaveWorkoutSession}
              className="rounded-full bg-amber-100 px-5 py-3 font-black text-zinc-950 shadow-[0_14px_48px_rgba(245,158,11,0.20)] transition hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              Finish & Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AddExerciseModal = () => (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-xl">
      <div className="w-full max-w-sm rounded-[2rem] border border-white/[0.1] bg-zinc-950/94 p-6 text-center shadow-[0_34px_140px_rgba(0,0,0,0.62)]">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-zinc-950">
          <Dumbbell className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-black tracking-[-0.055em] text-white">Add Exercises</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">Exercise library coming soon.</p>
        <button
          type="button"
          onClick={() => setShowAddExerciseModal(false)}
          className="mt-6 w-full rounded-full bg-white px-5 py-3 font-black text-zinc-950 transition hover:bg-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
        >
          Close
        </button>
      </div>
    </div>
  );

  const WorkoutSessionView = () => {
    const stats = calculateSessionStats(setLogs);
    const canFinish = stats.completedSets > 0;

    return (
      <div className="relative min-h-screen touch-pan-y overflow-x-hidden text-white antialiased">
        <Background />
        <style>{`
          .forge-session-input {
            color-scheme: dark;
            color: #ffffff !important;
            -webkit-text-fill-color: #ffffff !important;
            caret-color: #fbbf24;
            background-color: rgba(9, 9, 11, 0.88) !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
          }
          .forge-session-input::placeholder {
            color: rgba(113,113,122,0.88) !important;
            -webkit-text-fill-color: rgba(113,113,122,0.88) !important;
          }
          .forge-session-input:-webkit-autofill,
          .forge-session-input:-webkit-autofill:hover,
          .forge-session-input:-webkit-autofill:focus {
            -webkit-text-fill-color: #ffffff !important;
            -webkit-box-shadow: 0 0 0 1000px rgba(9, 9, 11, 0.96) inset !important;
            box-shadow: 0 0 0 1000px rgba(9, 9, 11, 0.96) inset !important;
            caret-color: #fbbf24;
          }
        `}</style>
        <main className="mx-auto flex min-h-screen w-full max-w-4xl touch-pan-y flex-col px-4 py-5 sm:px-6 lg:px-8">
          <header className="mb-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveExerciseIndex(null);
                setIsWorkoutSessionViewActive(false);
              }}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-zinc-200 transition hover:bg-white/[0.065] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              aria-label="Return to generated workout"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-sky-300/[0.12] text-sky-100 ring-1 ring-sky-200/12">
                <Timer className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">Workout Session</div>
                <div className="text-lg font-black tracking-[-0.035em] text-white">{formatDuration(elapsedSeconds)}</div>
              </div>
            </div>
            <button
              type="button"
              disabled={!canFinish}
              onClick={finishWorkoutSession}
              className={`rounded-full px-5 py-3 text-sm font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                canFinish
                  ? 'bg-amber-100 text-zinc-950 shadow-[0_14px_48px_rgba(245,158,11,0.18)] hover:bg-amber-200'
                  : 'cursor-not-allowed border border-white/[0.06] bg-white/[0.025] text-zinc-600'
              }`}
            >
              Finish
            </button>
          </header>

          {SessionStatsCard({ stats })}

          <section className="mt-6 flex-1">
            {activeExerciseIndex === null ? (
              <div className="space-y-3">
                {(workout || []).map((exercise, index) => (
                  <React.Fragment key={`${exercise.label}-${exercise.name}-session-${index}`}>
                    {SessionExerciseRow({ exercise, index })}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              ExerciseSetDetail()
            )}
          </section>

          {activeExerciseIndex === null && (
            <button
              type="button"
              onClick={() => setShowAddExerciseModal(true)}
              className="mt-6 w-full rounded-full border border-white/[0.08] bg-white/[0.04] px-6 py-5 text-base font-black text-white shadow-[0_20px_80px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Add Exercises
            </button>
          )}
        </main>

        {showFinishSummary && FinishSummaryModal({ stats })}
        {showAddExerciseModal && AddExerciseModal()}
      </div>
    );
  };

  const BottomNav = () => {
    const tabs = [
      { id: 'workout', label: 'Workout', icon: Dumbbell },
      { id: 'log', label: 'Log', icon: NotebookText },
      { id: 'ai', label: 'AI', icon: Brain, special: true },
      { id: 'pro', label: 'PRO', icon: Crown },
      { id: 'you', label: 'You', icon: UserCircle }
    ];

    return (
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-xl px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="grid grid-cols-5 items-end rounded-[2rem] border border-white/[0.08] bg-black/72 px-2 py-2 shadow-[0_-18px_80px_rgba(0,0,0,0.46)] backdrop-blur-2xl">
          {tabs.map(({ id, label: tabLabel, icon: Icon, special }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                data-ai-nav-button={id === 'ai' ? 'true' : undefined}
                aria-label={`Open ${tabLabel} tab`}
                aria-pressed={active}
                aria-current={active ? 'page' : undefined}
                onClick={() => {
                  if (id === 'ai') {
                    setActiveTab('ai');
                    setActiveAIModule('coach');
                    setAiMenuOpen(true);
                    return;
                  }
                  setAiMenuOpen(false);
                  setActiveTab(id);
                }}
                className={`group flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${
                  special
                    ? '-mt-7'
                    : active
                      ? 'text-white'
                      : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                <span className={`${special ? 'grid h-14 w-14 place-items-center rounded-full border border-amber-100/20 bg-gradient-to-br from-amber-200 via-orange-300 to-orange-400 text-zinc-950 shadow-[0_14px_58px_rgba(245,158,11,0.28)]' : `grid h-8 w-8 place-items-center rounded-xl ${active ? 'bg-amber-100/12 text-amber-100 shadow-[0_0_32px_rgba(245,158,11,0.16)]' : 'text-zinc-500'}`}`}>
                  <Icon className={special ? 'h-6 w-6' : 'h-5 w-5'} />
                </span>
                <span className={`${special ? active ? 'text-amber-100' : 'text-zinc-400' : ''}`}>{tabLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  };

  const openAIModule = (module) => {
    setActiveAIModule(module);
    setActiveTab('ai');
    setAiMenuOpen(false);
    if (module !== 'nutrition') {
      setNutritionCategory(null);
      setSelectedRecipe(null);
    }
  };

  const AIRadialMenu = () => {
    if (!aiMenuOpen) return null;

    const radialButton = ({ label: buttonLabel, icon: Icon, className, onClick, tone = 'amber', compact = false }) => (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        className={`absolute grid animate-[premiumFadeUp_.28s_cubic-bezier(.2,.8,.2,1)_both] place-items-center rounded-full border backdrop-blur-2xl transition duration-300 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${className} ${
          tone === 'green'
            ? 'border-emerald-300/25 bg-[radial-gradient(circle_at_50%_18%,rgba(110,231,183,0.20),rgba(9,9,11,0.82)_58%)] text-emerald-100 shadow-[0_18px_70px_rgba(16,185,129,0.22)]'
            : tone === 'muted'
              ? 'border-white/[0.08] bg-zinc-950/86 text-zinc-300 shadow-[0_18px_70px_rgba(0,0,0,0.38)]'
              : 'border-amber-300/25 bg-[radial-gradient(circle_at_50%_18%,rgba(252,211,77,0.22),rgba(9,9,11,0.82)_58%)] text-amber-100 shadow-[0_18px_80px_rgba(245,158,11,0.26)]'
        }`}
        aria-label={buttonLabel}
      >
        <Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
        {!compact && <span className="mt-1 text-[0.54rem] font-black uppercase tracking-[0.12em]">{buttonLabel}</span>}
      </button>
    );

    return (
      <>
        <div
          data-ai-mini-menu="true"
          className="pointer-events-none fixed left-1/2 bottom-[calc(env(safe-area-inset-bottom)+92px)] z-50 h-[120px] w-[220px] -translate-x-1/2"
        >
          <div className="absolute left-1/2 bottom-0 h-24 w-24 -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="absolute left-[52px] top-[59px] h-px w-[67px] rotate-[31deg] bg-gradient-to-r from-transparent via-emerald-100/18 to-transparent" />
          <div className="absolute right-[52px] top-[59px] h-px w-[67px] -rotate-[31deg] bg-gradient-to-r from-transparent via-amber-100/18 to-transparent" />
          <div className="absolute left-1/2 top-[102px] h-[20px] w-px -translate-x-1/2 bg-gradient-to-b from-amber-100/24 to-transparent" />
          {radialButton({
            label: 'Nutrition',
            icon: Utensils,
            tone: 'green',
            className: 'pointer-events-auto left-0 top-0 h-[4.5rem] w-[4.5rem]',
            onClick: () => openAIModule('nutrition')
          })}
          {radialButton({
            label: 'Store',
            icon: ShoppingBag,
            className: 'pointer-events-auto right-0 top-0 h-[4.5rem] w-[4.5rem]',
            onClick: () => openAIModule('store')
          })}
        </div>
      </>
    );
  };

  const ScreenHeader = ({ eyebrow, title, subtitle, icon: Icon }) => (
    <div className="mb-7 flex items-start justify-between gap-4">
      <div>
        {eyebrow && <div className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-amber-100/55">{eyebrow}</div>}
        <h1 className="text-4xl font-black leading-none tracking-[-0.06em] text-white">{title}</h1>
        {subtitle && <p className="mt-3 text-sm leading-6 text-zinc-400">{subtitle}</p>}
      </div>
      {Icon && <IconBubble icon={Icon} />}
    </div>
  );

  const LogTab = () => {
    const selectedEntry = selectedLogEntry
      ? workoutLogs.find(log => log.id === selectedLogEntry.id) || selectedLogEntry
      : null;

    const updateLogEntry = (entryId, updater) => {
      setWorkoutLogs(currentLogs => {
        const nextLogs = currentLogs.map(log => (
          log.id === entryId ? normalizeWorkoutLogEntry(updater(normalizeWorkoutLogEntry(log))) : normalizeWorkoutLogEntry(log)
        ));
        persistWorkoutLogs(nextLogs);
        const updatedSelected = nextLogs.find(log => log.id === selectedLogEntry?.id);
        if (updatedSelected) setSelectedLogEntry(updatedSelected);
        const updatedComment = nextLogs.find(log => log.id === commentLogEntry?.id);
        if (updatedComment) setCommentLogEntry(updatedComment);
        const updatedShare = nextLogs.find(log => log.id === shareCardEntry?.id);
        if (updatedShare) setShareCardEntry(updatedShare);
        return nextLogs;
      });
    };

    const openLogActions = (entry) => {
      const normalized = normalizeWorkoutLogEntry(entry);
      setSelectedLogForAction(normalized);
      setActiveLogMenuId(normalized.id);
    };

    const closeLogActions = () => {
      setActiveLogMenuId(null);
      setSelectedLogForAction(null);
    };

    const togglePinWorkout = (entryId) => {
      const targetLog = workoutLogs.find(log => log.id === entryId);
      updateLogEntry(entryId, log => ({ ...log, pinned: !log.pinned }));
      setLogActionMessage(targetLog?.pinned ? 'Workout unpinned.' : 'Workout pinned.');
      closeLogActions();
    };

    const updateWorkoutTitle = (entryId, title) => {
      const cleanTitle = title.trim();
      if (!cleanTitle) return false;
      updateLogEntry(entryId, log => ({ ...log, title: cleanTitle }));
      setEditedLogTitle('');
      setShowEditTitleModal(false);
      closeLogActions();
      setLogActionMessage('Workout title updated.');
      return true;
    };

    const deleteWorkoutLog = (entryId) => {
      // Future backend version should recalculate XP/rank effects or mark deleted logs as archived.
      setWorkoutLogs(currentLogs => {
        const nextLogs = currentLogs.filter(log => log.id !== entryId).map(normalizeWorkoutLogEntry);
        persistWorkoutLogs(nextLogs);
        return nextLogs;
      });
      if (selectedLogEntry?.id === entryId) setSelectedLogEntry(null);
      if (commentLogEntry?.id === entryId) setCommentLogEntry(null);
      if (shareCardEntry?.id === entryId) setShareCardEntry(null);
      setShowDeleteConfirm(false);
      closeLogActions();
      setLogActionMessage('Workout deleted.');
    };

    const copyToClipboard = async (text, successMessage = 'Copied.') => {
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          setLogActionMessage(successMessage);
          return true;
        }
        setLogActionMessage('Clipboard unavailable. Open the export preview and copy manually.');
        return false;
      } catch (error) {
        setLogActionMessage('Clipboard unavailable. Open the export preview and copy manually.');
        return false;
      }
    };

    const exportWorkoutJSON = async (entry) => {
      if (!entry) return;
      await copyToClipboard(JSON.stringify(normalizeWorkoutLogEntry(entry), null, 2), 'Workout JSON copied.');
    };

    const downloadWorkoutJSON = (entry) => {
      if (!entry || typeof window === 'undefined' || typeof document === 'undefined') {
        setLogActionMessage('Download unavailable in this browser.');
        return;
      }

      try {
        const datePart = getLogCreatedAt(entry).slice(0, 10) || 'session';
        const blob = new Blob([JSON.stringify(normalizeWorkoutLogEntry(entry), null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `forgeai-workout-${datePart}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setLogActionMessage('Workout JSON download started.');
      } catch (error) {
        setLogActionMessage('Download unavailable in this browser.');
      }
    };

    const selectedActionEntry = selectedLogForAction
      ? workoutLogs.find(log => log.id === selectedLogForAction.id) || selectedLogForAction
      : null;

    const toggleLogLike = (entryId) => {
      const targetLog = workoutLogs.find(log => log.id === entryId);
      if (targetLog && !targetLog.liked) {
        awardProgress({
          xp: 10,
          reason: 'Liked workout',
          actionId: `liked-workout-${entryId}`,
          applyMultiplier: false,
          eventType: 'like'
        });
      }

      updateLogEntry(entryId, log => ({
        ...log,
        liked: !log.liked,
        comments: log.comments || []
      }));
    };

    const shareLogEntry = async (entry) => {
      const text = createShareSummary(entry);
      try {
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({ title: getLogTitle(entry), text });
          setLogActionMessage('Workout summary shared.');
        } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          setLogActionMessage('Workout summary copied.');
        } else {
          setLogActionMessage('Share summary ready.');
        }
        awardProgress({
          xp: 25,
          forgePoints: 0,
          reason: 'Workout Shared',
          actionId: `shared-workout-${entry.id}`,
          eventType: 'share'
        });
      } catch (error) {
        setLogActionMessage('Share cancelled.');
      }
    };

    const openShareCard = (entry) => {
      setShareCardEntry(entry);
    };

    const repeatLogEntry = (entry) => {
      if (Array.isArray(entry.sourceWorkout) && entry.sourceWorkout.length) {
        setWorkout(entry.sourceWorkout);
        setShowWorkout(true);
        setSelectedLogEntry(null);
        setActiveTab('workout');
        window.scrollTo(0, 0);
        return;
      }

      setLogActionMessage('Repeat coming soon.');
    };

    const setPersistentLogViewMode = (mode) => {
      const nextMode = mode === 'compact' ? 'compact' : 'detailed';
      setLogViewMode(nextMode);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('forgeai_log_view_mode', nextMode);
        } catch (error) {
          setLogActionMessage('View mode saved in this session, but local storage was unavailable.');
        }
      }
    };

    const getRecordCount = (entry) => getLogRecords(entry).length;
    const entryHasPr = (entry) => getRecordCount(entry) > 0 || getBestLifts(entry).some(lift => lift.isPR);
    const getLogSearchText = (entry) => {
      const exercises = (entry.exercises || entry.sourceWorkout || []).map(exercise => exercise.name || '').join(' ');
      const records = getLogRecords(entry).map(record => `${record.label} ${record.value}`).join(' ');
      const bestLifts = getBestLifts(entry).map(lift => `${lift.exerciseName} ${formatBestLiftValue(lift)}`).join(' ');
      return [
        getLogTitle(entry),
        entry.goal,
        entry.focus,
        entry.experience,
        records,
        bestLifts,
        exercises
      ].filter(Boolean).join(' ').toLowerCase();
    };

    const matchesLogFilter = (entry, filterId = logFilter) => {
      const text = getLogSearchText(entry);
      if (filterId === 'liked') return !!entry.liked;
      if (filterId === 'pinned') return !!entry.pinned;
      if (filterId === 'prs') return entryHasPr(entry);
      if (filterId === 'strength') return text.includes('strength');
      if (filterId === 'build-muscle') return text.includes('build muscle') || text.includes('build-muscle') || text.includes('hypertrophy');
      if (filterId === 'power') return text.includes('power');
      if (filterId === 'conditioning') return text.includes('conditioning') || text.includes('cardio') || text.includes('vo2') || text.includes('zone 2');
      return true;
    };

    const getFilteredLogCount = (filterId) => workoutLogs.map(normalizeWorkoutLogEntry).filter(log => matchesLogFilter(log, filterId)).length;

    const createAllLogsSummary = (logs = []) => {
      if (!logs.length) return 'ForgeAI Training Log\nNo workouts found.';
      return [
        'ForgeAI Training Log',
        `Visible workouts: ${logs.length}`,
        '',
        ...logs.map((log, index) => [
          `${index + 1}. ${getLogTitle(log)}`,
          `Date: ${formatDateTime(getLogCreatedAt(log))}`,
          `Duration: ${formatDuration(getLogDuration(log))}`,
          `Volume: ${getLogVolume(log)} kg`,
          `Sets: ${log.completedSets || 0}`,
          `Records: ${getLogRecords(log).map(record => record.label).join(', ') || 'None'}`,
          `Exercises: ${(log.exercises || log.sourceWorkout || []).map(exercise => exercise.name).filter(Boolean).join(', ')}`
        ].join('\n'))
      ].join('\n\n');
    };

    const downloadAllLogsJSON = (logs = []) => {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        setLogActionMessage('Download unavailable in this browser.');
        return;
      }
      try {
        const blob = new Blob([JSON.stringify(logs.map(normalizeWorkoutLogEntry), null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'forgeai-training-log.json';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setLogActionMessage('Training log JSON download started.');
      } catch (error) {
        setLogActionMessage('Download unavailable in this browser.');
      }
    };

    const clearLikedWorkouts = () => {
      setWorkoutLogs(currentLogs => {
        const nextLogs = currentLogs.map(log => normalizeWorkoutLogEntry({ ...log, liked: false }));
        persistWorkoutLogs(nextLogs);
        return nextLogs;
      });
      setLogManagementConfirm(null);
      setShowLogManagement(false);
      setLogActionMessage('Liked flags cleared.');
    };

    const clearPinnedWorkouts = () => {
      setWorkoutLogs(currentLogs => {
        const nextLogs = currentLogs.map(log => normalizeWorkoutLogEntry({ ...log, pinned: false }));
        persistWorkoutLogs(nextLogs);
        return nextLogs;
      });
      setLogManagementConfirm(null);
      setShowLogManagement(false);
      setLogActionMessage('Pinned flags cleared.');
    };

    const deleteAllWorkoutLogs = () => {
      // Future backend version should recalculate XP/rank effects or mark deleted logs as archived.
      setWorkoutLogs([]);
      persistWorkoutLogs([]);
      setSelectedLogEntry(null);
      setCommentLogEntry(null);
      setShareCardEntry(null);
      setLogManagementConfirm(null);
      setShowLogManagement(false);
      setLogActionMessage('All workout logs deleted.');
    };

    const addLogComment = (entryId, text) => {
      const commentText = text.trim();
      if (!commentText) return;

      updateLogEntry(entryId, log => ({
        ...log,
        liked: !!log.liked,
        comments: [
          ...(log.comments || []),
          { id: `comment-${Date.now()}`, text: commentText, createdAt: new Date().toISOString() }
        ]
      }));
    };

    const deleteLogComment = (entryId, commentId) => {
      updateLogEntry(entryId, log => ({
        ...log,
        liked: !!log.liked,
        comments: (log.comments || []).filter(comment => comment.id !== commentId)
      }));
      setLogActionMessage('Comment deleted.');
    };

    const saveComment = () => {
      if (!commentLogEntry) return;
      const text = commentDraft.trim();
      if (!text) {
        setCommentLogEntry(null);
        setCommentDraft('');
        return;
      }

      addLogComment(commentLogEntry.id, text);
      setCommentLogEntry(null);
      setCommentDraft('');
      setLogActionMessage('Comment saved.');
    };

    const LogDetailView = ({ entry }) => {
      const volume = getLogVolume(entry);
      const formattedVolume = Number.isInteger(volume) ? volume : Number(volume.toFixed(1));
      const records = getLogRecords(entry);
      const bestLifts = getBestLifts(entry);

      return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/82 p-4 pb-28 text-white backdrop-blur-2xl">
          <div className="mx-auto max-w-xl">
            <div className="sticky top-0 z-10 -mx-4 mb-5 bg-black/70 px-4 py-4 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedLogEntry(null)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-zinc-200 transition hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                  aria-label="Close workout log detail"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="text-right">
                  <div className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-amber-100/55">Workout Detail</div>
                  <div className="text-sm font-semibold text-zinc-400">{formatDateTime(getLogCreatedAt(entry))}</div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <PremiumCard variant="hero">
                <div className="text-[0.66rem] font-black uppercase tracking-[0.22em] text-amber-100/58">Completed Session</div>
                <h2 className="mt-3 text-4xl font-black leading-none tracking-[-0.06em] text-white">{getLogTitle(entry)}</h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {[entry.goal, entry.focus, entry.experience].filter(Boolean).map(chip => (
                    <span key={chip} className="rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 text-xs font-bold text-zinc-300">{chip}</span>
                  ))}
                </div>
              </PremiumCard>

              <div className="grid grid-cols-2 gap-3">
                <MetricTile icon={Timer} label="Duration" value={formatDuration(getLogDuration(entry))} quiet />
                <MetricTile icon={BarChart3} label="Volume" value={`${formattedVolume} kg`} quiet />
                <MetricTile icon={CheckCircle2} label="Sets" value={entry.completedSets || 0} tone="green" quiet />
                <MetricTile icon={Award} label="Records" value={records.length || 0} tone="blue" quiet />
              </div>

              {bestLifts.length > 0 && (
                <PremiumCard variant="secondary" className="!p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-amber-100/58">Best Lifts</div>
                    <Trophy className="h-4 w-4 text-amber-100/70" />
                  </div>
                  <div className="grid gap-2">
                    {bestLifts.map((lift, index) => (
                      <div key={`${lift.exerciseName}-${lift.setNumber || index}`} className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.028] px-3 py-3">
                        <div className="min-w-0">
                          <div className="text-xl font-black tracking-[-0.045em] text-white">{formatBestLiftValue(lift)}</div>
                          <div className="mt-0.5 truncate text-xs font-semibold text-zinc-500">{lift.label ? `${lift.label} / ` : ''}{lift.exerciseName}</div>
                        </div>
                        {lift.isPR && (
                          <span className="rounded-full border border-amber-100/14 bg-amber-100/[0.08] px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.16em] text-amber-100">PR</span>
                        )}
                      </div>
                    ))}
                  </div>
                </PremiumCard>
              )}

              {records.length > 0 && (
                <PremiumCard variant="secondary">
                  <SectionHeader icon={Award} eyebrow="Records" title="Session PRs" subtitle={null} />
                  <div className="space-y-2">
                    {records.map(record => (
                      <div key={record.type} className="flex items-center justify-between rounded-2xl border border-amber-100/10 bg-amber-100/[0.045] px-4 py-3">
                        <span className="text-sm font-black text-amber-100">{record.label}</span>
                        <span className="text-sm font-semibold text-zinc-200">{record.value}</span>
                      </div>
                    ))}
                  </div>
                </PremiumCard>
              )}

              <div className="space-y-3">
                {(entry.exercises || []).map((exercise, index) => (
                  <PremiumCard key={`${entry.id}-${exercise.name}-${index}`} variant="flat" className="!p-4">
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-amber-100/14 bg-amber-100/[0.08] text-xs font-black text-amber-100">
                        {exercise.label || index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-black tracking-[-0.04em] text-white">{exercise.name}</h3>
                        <div className="mt-1 text-xs font-semibold text-zinc-500">{exercise.setsReps || 'Tracked work'} / {exercise.tempo || 'Open tempo'} / {exercise.rest || 'Open rest'}</div>
                        <div className="mt-3 space-y-2">
                          {(exercise.completedSets || []).length ? exercise.completedSets.map(set => (
                            <div key={set.setNumber} className="grid grid-cols-4 gap-2 rounded-2xl border border-white/[0.055] bg-white/[0.03] px-3 py-2 text-xs">
                              <div className="font-black text-zinc-300">Set {set.setNumber}</div>
                              <div className="text-zinc-400">{set.weight || 0} kg</div>
                              <div className="text-zinc-400">{set.reps || 0} reps</div>
                              <div className="text-right font-bold text-amber-100">{Number(set.volumeKg || 0)} kg</div>
                            </div>
                          )) : (
                            <div className="rounded-2xl border border-white/[0.055] bg-white/[0.03] px-3 py-2 text-xs font-semibold text-zinc-500">No completed sets tracked.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </PremiumCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    };

    const LogActionSheet = () => {
      if (!selectedActionEntry || activeLogMenuId !== selectedActionEntry.id) return null;
      const pinned = !!selectedActionEntry.pinned;

      const actionRows = [
        {
          icon: Pin,
          title: pinned ? 'Unpin Workout' : 'Pin Workout',
          subtitle: pinned ? 'Remove this workout from the top of your log.' : 'Keep this workout above the rest.',
          onClick: () => togglePinWorkout(selectedActionEntry.id)
        },
        {
          icon: Pencil,
          title: 'Edit Title',
          subtitle: 'Rename this saved session.',
          onClick: () => {
            setEditedLogTitle(getLogTitle(selectedActionEntry));
            setShowEditTitleModal(true);
            setActiveLogMenuId(null);
          }
        },
        {
          icon: Download,
          title: 'Export',
          subtitle: 'Copy summary or export JSON.',
          onClick: () => {
            setShowExportModal(true);
            setActiveLogMenuId(null);
          }
        },
        {
          icon: Trash2,
          title: 'Delete Workout',
          subtitle: 'Remove this workout from your log.',
          destructive: true,
          onClick: () => {
            setShowDeleteConfirm(true);
            setActiveLogMenuId(null);
          }
        }
      ];

      return (
        <div className="fixed inset-0 z-50 flex items-end bg-black/62 p-3 backdrop-blur-xl" onClick={closeLogActions}>
          <div
            className="w-full rounded-t-[2.2rem] border border-white/[0.08] bg-zinc-950/96 p-5 shadow-[0_-28px_120px_rgba(0,0,0,0.62)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/15" />
            <div className="mb-5">
              <div className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-amber-100/58">Workout Options</div>
              <h2 className="mt-2 truncate text-2xl font-black tracking-[-0.055em] text-white">{getLogTitle(selectedActionEntry)}</h2>
            </div>
            <div className="space-y-2">
              {actionRows.map(({ icon: Icon, title, subtitle, destructive, onClick }) => (
                <button
                  key={title}
                  type="button"
                  onClick={onClick}
                  className={`flex w-full items-center gap-3 rounded-[1.35rem] border px-4 py-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${
                    destructive
                      ? 'border-rose-300/12 bg-rose-400/[0.055] text-rose-100 hover:bg-rose-400/[0.09]'
                      : 'border-white/[0.06] bg-white/[0.03] text-zinc-200 hover:border-amber-100/16 hover:bg-amber-100/[0.055]'
                  }`}
                >
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border ${destructive ? 'border-rose-200/14 bg-rose-300/[0.08] text-rose-100' : 'border-amber-100/12 bg-amber-100/[0.07] text-amber-100'}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black">{title}</span>
                    <span className="mt-1 block text-xs font-semibold leading-5 text-zinc-500">{subtitle}</span>
                  </span>
                  <ChevronRight className={`h-4 w-4 ${destructive ? 'text-rose-200/50' : 'text-zinc-600'}`} />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={closeLogActions}
              className="mt-4 w-full rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-3 text-sm font-black text-zinc-300 transition hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    };

    const EditTitleModal = () => {
      if (!selectedActionEntry || !showEditTitleModal) return null;
      const canSave = editedLogTitle.trim().length > 0;

      return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/72 p-4 backdrop-blur-xl" onClick={() => setShowEditTitleModal(false)}>
          <div
            className="w-full max-w-sm rounded-[2rem] border border-white/[0.1] bg-zinc-950/94 p-6 shadow-[0_34px_140px_rgba(0,0,0,0.62)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 text-[0.66rem] font-black uppercase tracking-[0.22em] text-amber-100/58">Edit Workout</div>
            <h2 className="text-3xl font-black tracking-[-0.055em] text-white">Edit Title</h2>
            <input
              autoFocus
              value={editedLogTitle}
              onChange={(event) => setEditedLogTitle(event.target.value)}
              maxLength={80}
              placeholder="Workout title"
              className="mt-5 w-full rounded-2xl border border-white/[0.08] bg-zinc-950/90 px-4 py-3 text-base font-semibold text-white caret-amber-200 outline-none transition placeholder:text-zinc-600 focus:border-amber-100/40 focus:ring-2 focus:ring-amber-100/20"
              style={{ color: '#fff', backgroundColor: 'rgba(9, 9, 11, 0.92)', WebkitTextFillColor: '#fff' }}
              aria-label="Workout title"
            />
            {!canSave && <div className="mt-2 text-xs font-semibold text-rose-200">Title cannot be empty.</div>}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowEditTitleModal(false);
                  closeLogActions();
                }}
                className="rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-3 font-bold text-zinc-300 transition hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canSave}
                onClick={() => updateWorkoutTitle(selectedActionEntry.id, editedLogTitle)}
                className="rounded-full bg-amber-100 px-5 py-3 font-black text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      );
    };

    const ExportModal = () => {
      if (!selectedActionEntry || !showExportModal) return null;
      const jsonText = JSON.stringify(normalizeWorkoutLogEntry(selectedActionEntry), null, 2);

      return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/72 p-4 backdrop-blur-xl" onClick={() => setShowExportModal(false)}>
          <div
            className="w-full max-w-sm rounded-[2rem] border border-white/[0.1] bg-zinc-950/94 p-6 shadow-[0_34px_140px_rgba(0,0,0,0.62)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 text-[0.66rem] font-black uppercase tracking-[0.22em] text-amber-100/58">Export</div>
            <h2 className="truncate text-3xl font-black tracking-[-0.055em] text-white">{getLogTitle(selectedActionEntry)}</h2>
            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => copyToClipboard(createWorkoutSummary(selectedActionEntry), 'Workout summary copied.')}
                className="flex w-full items-center gap-3 rounded-[1.35rem] border border-white/[0.06] bg-white/[0.03] px-4 py-4 text-left transition hover:bg-amber-100/[0.055] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              >
                <Share2 className="h-5 w-5 text-amber-100" />
                <span className="font-black text-white">Copy Summary</span>
              </button>
              <button
                type="button"
                onClick={() => exportWorkoutJSON(selectedActionEntry)}
                className="flex w-full items-center gap-3 rounded-[1.35rem] border border-white/[0.06] bg-white/[0.03] px-4 py-4 text-left transition hover:bg-amber-100/[0.055] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              >
                <FileJson className="h-5 w-5 text-amber-100" />
                <span className="font-black text-white">Export JSON</span>
              </button>
              <button
                type="button"
                onClick={() => downloadWorkoutJSON(selectedActionEntry)}
                className="flex w-full items-center gap-3 rounded-[1.35rem] border border-white/[0.06] bg-white/[0.03] px-4 py-4 text-left transition hover:bg-amber-100/[0.055] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              >
                <Download className="h-5 w-5 text-amber-100" />
                <span className="font-black text-white">Download JSON</span>
              </button>
            </div>
            <textarea
              readOnly
              value={jsonText}
              className="mt-4 max-h-36 w-full resize-none rounded-2xl border border-white/[0.06] bg-black/30 px-3 py-3 text-xs font-mono leading-5 text-zinc-400 outline-none"
              aria-label="Workout JSON preview"
            />
            <button
              type="button"
              onClick={() => {
                setShowExportModal(false);
                closeLogActions();
              }}
              className="mt-4 w-full rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-3 text-sm font-black text-zinc-300 transition hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              Close
            </button>
          </div>
        </div>
      );
    };

    const DeleteConfirmModal = () => {
      if (!selectedActionEntry || !showDeleteConfirm) return null;

      return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/72 p-4 backdrop-blur-xl" onClick={() => setShowDeleteConfirm(false)}>
          <div
            className="w-full max-w-sm rounded-[2rem] border border-rose-300/14 bg-zinc-950/94 p-6 shadow-[0_34px_140px_rgba(0,0,0,0.62)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-rose-200/14 bg-rose-300/[0.08] text-rose-100">
              <Trash2 className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-black tracking-[-0.055em] text-white">Delete Workout?</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">This workout will be removed from your training log. This cannot be undone.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  closeLogActions();
                }}
                className="rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-3 font-bold text-zinc-300 transition hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteWorkoutLog(selectedActionEntry.id)}
                className="rounded-full bg-rose-300 px-5 py-3 font-black text-zinc-950 transition hover:bg-rose-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
              >
                Delete Workout
              </button>
            </div>
          </div>
        </div>
      );
    };

    const LogManagementSheet = () => {
      if (!showLogManagement) return null;
      const sortOptions = [
        ['newest', 'Newest'],
        ['oldest', 'Oldest'],
        ['highestVolume', 'Highest Volume'],
        ['mostPRs', 'Most PRs']
      ];
      const viewOptions = [
        ['detailed', 'Detailed'],
        ['compact', 'Compact']
      ];
      const managementRows = [
        { icon: Heart, title: 'Clear Liked Workouts', subtitle: 'Remove heart flags only.', onClick: () => setLogManagementConfirm('clearLiked') },
        { icon: Pin, title: 'Clear Pinned Workouts', subtitle: 'Remove pin flags only.', onClick: () => setLogManagementConfirm('clearPinned') },
        { icon: Trash2, title: 'Delete All Logs', subtitle: 'Remove every saved workout.', destructive: true, onClick: () => setLogManagementConfirm('deleteAll') }
      ];

      return (
        <div className="fixed inset-0 z-50 flex items-end bg-black/62 p-3 backdrop-blur-xl" onClick={() => setShowLogManagement(false)}>
          <div
            className="max-h-[88vh] w-full overflow-y-auto rounded-t-[2.2rem] border border-white/[0.08] bg-zinc-950/96 p-5 shadow-[0_-28px_120px_rgba(0,0,0,0.62)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/15" />
            <div className="mb-5">
              <div className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-amber-100/58">Log Options</div>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.055em] text-white">Log Options</h2>
            </div>

            <div className="space-y-5">
              <div>
                <div className="mb-2 text-[0.6rem] font-black uppercase tracking-[0.2em] text-zinc-500">Sort By</div>
                <div className="grid grid-cols-2 gap-2">
                  {sortOptions.map(([id, title]) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={logSort === id}
                      onClick={() => setLogSort(id)}
                      className={`rounded-2xl border px-3 py-3 text-sm font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${logSort === id ? 'border-amber-100/30 bg-amber-100 text-zinc-950' : 'border-white/[0.06] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]'}`}
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-[0.6rem] font-black uppercase tracking-[0.2em] text-zinc-500">View</div>
                <div className="grid grid-cols-2 gap-2">
                  {viewOptions.map(([id, title]) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={logViewMode === id}
                      onClick={() => setPersistentLogViewMode(id)}
                      className={`rounded-2xl border px-3 py-3 text-sm font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${logViewMode === id ? 'border-amber-100/30 bg-amber-100 text-zinc-950' : 'border-white/[0.06] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]'}`}
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-[0.6rem] font-black uppercase tracking-[0.2em] text-zinc-500">Export</div>
                <div className="space-y-2">
                  {[
                    { icon: Share2, title: 'Copy Log Summary', onClick: () => copyToClipboard(createAllLogsSummary(displayedLogs), 'Training log summary copied.') },
                    { icon: FileJson, title: 'Export All JSON', onClick: () => copyToClipboard(JSON.stringify(displayedLogs.map(normalizeWorkoutLogEntry), null, 2), 'Training log JSON copied.') },
                    { icon: Download, title: 'Download All JSON', onClick: () => downloadAllLogsJSON(displayedLogs) }
                  ].map(({ icon: Icon, title, onClick }) => (
                    <button
                      key={title}
                      type="button"
                      onClick={onClick}
                      className="flex w-full items-center gap-3 rounded-[1.25rem] border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-left transition hover:bg-amber-100/[0.055] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                    >
                      <Icon className="h-5 w-5 text-amber-100" />
                      <span className="font-black text-white">{title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-[0.6rem] font-black uppercase tracking-[0.2em] text-zinc-500">Manage</div>
                <div className="space-y-2">
                  {managementRows.map(({ icon: Icon, title, subtitle, destructive, onClick }) => (
                    <button
                      key={title}
                      type="button"
                      onClick={onClick}
                      className={`flex w-full items-center gap-3 rounded-[1.25rem] border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${destructive ? 'border-rose-300/12 bg-rose-400/[0.055] text-rose-100 hover:bg-rose-400/[0.09]' : 'border-white/[0.06] bg-white/[0.03] text-zinc-200 hover:bg-white/[0.06]'}`}
                    >
                      <Icon className={`h-5 w-5 ${destructive ? 'text-rose-100' : 'text-amber-100'}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black">{title}</span>
                        <span className="mt-1 block text-xs font-semibold text-zinc-500">{subtitle}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowLogManagement(false)}
              className="mt-5 w-full rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-3 text-sm font-black text-zinc-300 transition hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              Close
            </button>
          </div>
        </div>
      );
    };

    const LogManagementConfirmModal = () => {
      if (!logManagementConfirm) return null;
      const copy = {
        clearLiked: {
          title: 'Clear Liked Workouts?',
          text: 'This removes liked states from your workouts. It will not delete workouts.',
          action: clearLikedWorkouts,
          button: 'Clear Liked'
        },
        clearPinned: {
          title: 'Clear Pinned Workouts?',
          text: 'This removes pinned states from your workouts. It will not delete workouts.',
          action: clearPinnedWorkouts,
          button: 'Clear Pinned'
        },
        deleteAll: {
          title: 'Delete All Logs?',
          text: 'Every saved workout will be removed from your training log. This cannot be undone.',
          action: deleteAllWorkoutLogs,
          button: 'Delete All Logs',
          destructive: true
        }
      }[logManagementConfirm];

      return (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/72 p-4 backdrop-blur-xl" onClick={() => setLogManagementConfirm(null)}>
          <div
            className={`w-full max-w-sm rounded-[2rem] border p-6 shadow-[0_34px_140px_rgba(0,0,0,0.62)] ${copy.destructive ? 'border-rose-300/14 bg-zinc-950/94' : 'border-white/[0.1] bg-zinc-950/94'}`}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-3xl font-black tracking-[-0.055em] text-white">{copy.title}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{copy.text}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLogManagementConfirm(null)}
                className="rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-3 font-bold text-zinc-300 transition hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={copy.action}
                className={`rounded-full px-5 py-3 font-black text-zinc-950 transition focus:outline-none focus-visible:ring-2 ${copy.destructive ? 'bg-rose-300 hover:bg-rose-200 focus-visible:ring-rose-200' : 'bg-amber-100 hover:bg-amber-200 focus-visible:ring-amber-200'}`}
              >
                {copy.button}
              </button>
            </div>
          </div>
        </div>
      );
    };

    const CommentModal = () => (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/72 p-4 backdrop-blur-xl">
        <div className="w-full max-w-sm rounded-[2rem] border border-white/[0.1] bg-zinc-950/94 p-6 shadow-[0_34px_140px_rgba(0,0,0,0.62)]">
          <div className="mb-2 text-[0.66rem] font-black uppercase tracking-[0.22em] text-amber-100/58">Comment</div>
          <h2 className="text-3xl font-black tracking-[-0.055em] text-white">{getLogTitle(commentLogEntry)}</h2>
          {(commentLogEntry?.comments || []).length > 0 && (
            <div className="mt-5 max-h-36 space-y-2 overflow-y-auto rounded-2xl border border-white/[0.06] bg-black/20 p-3">
              {(commentLogEntry.comments || []).map(comment => (
                <div key={comment.id} className="flex items-start gap-3 rounded-xl bg-white/[0.035] px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="break-words text-sm font-semibold leading-5 text-zinc-200">{comment.text}</div>
                    <div className="mt-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-zinc-600">{formatDateTime(comment.createdAt)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteLogComment(commentLogEntry.id, comment.id)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-black/20 text-zinc-500 transition hover:border-rose-200/20 hover:bg-rose-200/[0.08] hover:text-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                    aria-label="Delete comment"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <textarea
            value={commentDraft}
            onChange={(event) => setCommentDraft(event.target.value)}
            maxLength={220}
            rows={4}
            placeholder="Add a quick note..."
            className="mt-5 w-full resize-none rounded-2xl border border-white/[0.08] bg-zinc-950/90 px-4 py-3 text-sm font-semibold text-zinc-50 caret-amber-200 outline-none transition placeholder:text-zinc-600 selection:bg-amber-200/25 selection:text-white focus:border-amber-100/40 focus:ring-2 focus:ring-amber-100/20"
            style={{ color: '#fafafa', backgroundColor: 'rgba(9, 9, 11, 0.9)', WebkitTextFillColor: '#fafafa' }}
            aria-label="Workout comment"
          />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setCommentLogEntry(null);
                setCommentDraft('');
              }}
              className="rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-3 font-bold text-zinc-300 transition hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveComment}
              className="rounded-full bg-amber-100 px-5 py-3 font-black text-zinc-950 transition hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );

    const ShareCardModal = () => {
      if (!shareCardEntry) return null;

      const volume = getLogVolume(shareCardEntry);
      const formattedVolume = Number.isInteger(volume) ? volume : Number(volume.toFixed(1));
      const records = getLogRecords(shareCardEntry);
      const preview = getExercisePreview(shareCardEntry, 5);
      const bestLifts = getBestLifts(shareCardEntry);

      return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/78 p-4 pb-28 backdrop-blur-2xl">
          <div className="mx-auto flex min-h-full max-w-sm flex-col justify-center">
            <div className="rounded-[2.2rem] border border-white/[0.1] bg-zinc-950/96 p-5 shadow-[0_34px_140px_rgba(0,0,0,0.62)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-amber-100/58">Share Card</div>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.055em] text-white">Screenshot for Instagram Story</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShareCardEntry(null)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04] text-zinc-300 transition hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                  aria-label="Close share card"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative overflow-hidden rounded-[2rem] border border-amber-100/14 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.20),transparent_48%),linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-5">
                <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-amber-300/20 blur-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    {Logo()}
                    <div>
                      <div className="text-base font-semibold tracking-[-0.035em] text-white">ForgeAI</div>
                      <div className="text-[0.58rem] font-bold uppercase tracking-[0.22em] text-amber-100/60">Training Log</div>
                    </div>
                  </div>
                  <h3 className="mt-8 text-4xl font-black leading-none tracking-[-0.065em] text-white">{getLogTitle(shareCardEntry)}</h3>
                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-amber-100/62">Best Lifts</div>
                      <div className="h-px flex-1 bg-gradient-to-r from-amber-100/24 to-transparent ml-3" />
                    </div>
                    <div className="space-y-3">
                      {(bestLifts.length ? bestLifts : preview.slice(0, 3).map(exercise => ({
                        exerciseName: exercise.name,
                        weight: 0,
                        reps: 0,
                        setVolume: 0,
                        estimatedOneRepMax: 0,
                        isPR: false,
                        label: exercise.label
                      }))).map((lift, index) => (
                        <div key={`${lift.exerciseName}-${lift.setNumber || index}`} className="rounded-[1.35rem] border border-white/[0.07] bg-black/24 px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-3xl font-black leading-none tracking-[-0.055em] text-white">{formatBestLiftValue(lift)}</div>
                              <div className="mt-1 text-sm font-bold text-zinc-300">{lift.exerciseName}</div>
                            </div>
                            <div className="rounded-full border border-amber-100/12 bg-amber-100/[0.07] px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.14em] text-amber-100">
                              {lift.isPR ? 'PR' : lift.label || `#${index + 1}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    {[
                      ['Volume', `${formattedVolume} kg`],
                      ['Sets', shareCardEntry.completedSets || 0],
                      ['Duration', formatDuration(getLogDuration(shareCardEntry))],
                      ['Records', records.length || 0]
                    ].map(([labelText, value]) => (
                      <div key={labelText} className="rounded-2xl border border-white/[0.07] bg-black/22 px-3 py-3">
                        <div className="text-lg font-black text-white">{value}</div>
                        <div className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.16em] text-zinc-500">{labelText}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 border-t border-white/[0.07] pt-4 text-center">
                    {ambassadorState?.creatorCode && (
                      <div className="mb-2 rounded-full border border-amber-100/[0.08] bg-amber-100/[0.045] px-3 py-2 text-[0.58rem] font-black uppercase tracking-[0.18em] text-amber-100/72">
                        Use code {ambassadorState.creatorCode} for ForgeAI rewards.
                      </div>
                    )}
                    <div className="text-[0.6rem] font-black uppercase tracking-[0.24em] text-amber-100/50">
                      ForgeAI Training Log
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <button
                  type="button"
                  onClick={() => shareLogEntry(shareCardEntry)}
                  className="rounded-full bg-amber-100 px-5 py-3 text-sm font-black text-zinc-950 transition hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                >
                  Share Summary
                </button>
                <p className="text-center text-xs leading-5 text-zinc-500">Screenshot this card to share to Instagram Story.</p>
              </div>
            </div>
          </div>
        </div>
      );
    };

    const sortLogsForDisplay = (logs = []) => [...logs]
      .map(normalizeWorkoutLogEntry)
      .sort((a, b) => {
        if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
        if (logSort === 'oldest') return new Date(getLogCreatedAt(a)).getTime() - new Date(getLogCreatedAt(b)).getTime();
        if (logSort === 'highestVolume') return getLogVolume(b) - getLogVolume(a);
        if (logSort === 'mostPRs') return getRecordCount(b) - getRecordCount(a);
        return new Date(getLogCreatedAt(b)).getTime() - new Date(getLogCreatedAt(a)).getTime();
      });

    const normalizedLogs = workoutLogs.map(normalizeWorkoutLogEntry);
    const searchNeedle = logSearch.trim().toLowerCase();
    const filteredLogs = normalizedLogs.filter(log => matchesLogFilter(log) && (!searchNeedle || getLogSearchText(log).includes(searchNeedle)));
    const displayedLogs = sortLogsForDisplay(filteredLogs);
    const logFilters = [
      ['all', 'All'],
      ['liked', 'Liked'],
      ['pinned', 'Pinned'],
      ['prs', 'PRs'],
      ['strength', 'Strength'],
      ['build-muscle', 'Build Muscle'],
      ['power', 'Power'],
      ['conditioning', 'Conditioning']
    ];

    return (
      <div className="space-y-4">
        <section className="relative overflow-hidden rounded-[1.7rem] border border-white/[0.055] bg-[radial-gradient(circle_at_78%_0%,rgba(245,158,11,0.12),transparent_38%),linear-gradient(145deg,rgba(255,255,255,0.038),rgba(255,255,255,0.01))] px-5 pb-5 pt-6 shadow-[0_18px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute -right-24 -top-28 h-56 w-56 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="relative">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-2 text-[0.66rem] font-black uppercase tracking-[0.28em] text-amber-100/48">Training Log</div>
                <h1 className="text-[2.8rem] font-black leading-[0.9] tracking-[-0.072em] text-white sm:text-5xl">Your Workouts</h1>
                <p className="mt-4 max-w-[18rem] text-base font-semibold leading-[1.42] text-zinc-400">A premium record of sessions, volume, sets, and progress.</p>
              </div>
              <div className="flex shrink-0 items-start gap-2.5">
                <button
                  type="button"
                  onClick={() => setLogFiltersOpen(open => !open)}
                  aria-expanded={logFiltersOpen}
                  className={`grid h-14 w-14 place-items-center rounded-[1.25rem] border text-amber-100 shadow-[0_14px_48px_rgba(0,0,0,0.22)] backdrop-blur-2xl transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 sm:h-16 sm:w-16 ${
                    logFiltersOpen
                      ? 'border-amber-100/24 bg-amber-100/[0.10] shadow-[0_18px_70px_rgba(245,158,11,0.13)]'
                      : 'border-white/[0.08] bg-white/[0.035] hover:bg-white/[0.06]'
                  }`}
                  aria-label="Open log filters"
                >
                  <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogManagement(true)}
                  className="grid h-14 w-14 place-items-center rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-300 shadow-[0_14px_48px_rgba(0,0,0,0.22)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 sm:h-16 sm:w-16"
                  aria-label="Training log options"
                >
                  <MoreHorizontal className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1 rounded-full border border-white/[0.07] bg-black/24 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              {[
                ['all', 'All'],
                ['liked', 'Liked']
              ].map(([id, text]) => {
                const active = logFilter === id;
                const count = getFilteredLogCount(id);
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setLogFilter(id)}
                    className={`min-h-12 rounded-full px-4 text-sm font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 sm:min-h-14 sm:text-base ${
                      active
                        ? 'bg-amber-100 text-zinc-950 shadow-[0_18px_58px_rgba(245,158,11,0.24)]'
                        : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300'
                    }`}
                  >
                    {text} <span className={active ? 'text-zinc-700' : 'text-zinc-600'}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {logActionMessage && (
          <div className="rounded-2xl border border-amber-100/12 bg-amber-100/[0.055] px-4 py-3 text-sm font-semibold text-amber-100">
            {logActionMessage}
          </div>
        )}

        {(logFiltersOpen || logSearch || !['all', 'liked'].includes(logFilter)) && (
          <div className="rounded-[1.65rem] border border-white/[0.07] bg-white/[0.028] p-3 backdrop-blur-2xl">
            <label className="flex items-center gap-3 rounded-[1.25rem] border border-white/[0.06] bg-black/26 px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-zinc-500" />
              <input
                value={logSearch}
                onChange={(event) => setLogSearch(event.target.value)}
                placeholder="Search workouts, exercises, PRs..."
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white caret-amber-200 outline-none placeholder:text-zinc-600"
                aria-label="Search workout logs"
              />
            </label>
            <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {logFilters.map(([id, text]) => {
                const active = logFilter === id;
                const count = getFilteredLogCount(id);
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setLogFilter(id)}
                    className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${
                      active
                        ? 'border-amber-100/30 bg-amber-100 text-zinc-950 shadow-[0_12px_40px_rgba(245,158,11,0.18)]'
                        : 'border-white/[0.06] bg-white/[0.035] text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200'
                    }`}
                  >
                    {text} <span className={active ? 'text-zinc-700' : 'text-zinc-600'}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isWorkoutSessionActive && (
          <PremiumCard variant="hero" className="!p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[0.66rem] font-black uppercase tracking-[0.22em] text-amber-100/60">Workout In Progress</div>
                <div className="mt-2 text-xl font-black tracking-[-0.04em] text-white">{createWorkoutTitle()}</div>
                <div className="mt-1 text-sm text-zinc-400">{formatDuration(elapsedSeconds)} / {calculateSessionStats(setLogs).completedSets} sets tracked</div>
              </div>
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveExerciseIndex(null);
                    setIsWorkoutSessionViewActive(true);
                    setActiveTab('workout');
                  }}
                  className="rounded-full bg-amber-100 px-4 py-2 text-xs font-black text-zinc-950 transition hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                >
                  Resume
                </button>
                <button
                  type="button"
                  onClick={endWorkoutSession}
                  className="rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-black text-zinc-400 transition hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                >
                  Discard
                </button>
              </div>
            </div>
          </PremiumCard>
        )}

        {!workoutLogs.length ? (
          <PremiumCard variant="secondary" className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.4rem] border border-amber-100/14 bg-amber-100/[0.08] text-amber-100">
              <ClipboardList className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.055em] text-white">No completed workouts yet</h2>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-zinc-400">Finish a workout to build your training history.</p>
            <button
              type="button"
              onClick={() => setActiveTab('workout')}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-amber-100 px-6 py-3 text-sm font-black text-zinc-950 transition hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              Start Workout
              <ChevronRight className="h-4 w-4" />
            </button>
          </PremiumCard>
        ) : !displayedLogs.length ? (
          <PremiumCard variant="secondary" className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.4rem] border border-rose-200/14 bg-rose-200/[0.08] text-rose-100">
              <Search className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.055em] text-white">{searchNeedle ? 'No matching workouts' : 'No workouts found'}</h2>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-zinc-400">{searchNeedle ? 'Search by exercise, title, or PR.' : logFilter === 'liked' ? 'Tap the heart on a workout to save it here.' : 'Try another filter or finish a workout.'}</p>
          </PremiumCard>
        ) : displayedLogs.map(log => {
          const volume = getLogVolume(log);
          const formattedVolume = Number.isInteger(volume) ? volume : Number(volume.toFixed(1));
          const records = getLogRecords(log);
          const exercises = log.exercises || [];
          const comments = log.comments || [];
          const preview = getExercisePreview(log, 4);
          const bestLifts = getBestLifts(log);
          if (logViewMode === 'compact') {
            const topLift = bestLifts[0];
            return (
              <div
                key={log.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedLogEntry(log)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedLogEntry(log);
                  }
                }}
                className="block w-full cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <PremiumCard variant="flat" className="!p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-100 text-sm font-black text-zinc-950">MJ</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-2">
                            {log.pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-amber-100" />}
                            <h3 className="truncate text-base font-black tracking-[-0.035em] text-white">{getLogTitle(log)}</h3>
                          </div>
                          <div className="mt-1 text-xs font-semibold text-zinc-500">{formatDateTime(getLogCreatedAt(log))}</div>
                        </div>
                        <button
                          type="button"
                          aria-label={`Open workout options for ${getLogTitle(log)}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            openLogActions(log);
                          }}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/[0.06] bg-white/[0.035] text-zinc-500 transition hover:bg-white/[0.07] hover:text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {[
                          ['Time', formatDuration(getLogDuration(log))],
                          ['Volume', `${formattedVolume}kg`],
                          ['PRs', records.length || 0],
                          ['Sets', log.completedSets || 0]
                        ].map(([labelText, value]) => (
                          <div key={labelText} className="rounded-xl border border-white/[0.055] bg-white/[0.025] px-2 py-2 text-center">
                            <div className="text-xs font-black text-white">{value}</div>
                            <div className="mt-0.5 text-[0.5rem] font-black uppercase tracking-[0.12em] text-zinc-600">{labelText}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 rounded-2xl border border-amber-100/[0.08] bg-amber-100/[0.035] px-3 py-2 text-xs font-bold text-zinc-300">
                        {topLift ? `Best lift: ${topLift.exerciseName} - ${formatBestLiftValue(topLift)}` : 'Best lift: add weighted sets to track'}
                      </div>
                    </div>
                  </div>
                </PremiumCard>
              </div>
            );
          }
          return (
            <div
              key={log.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedLogEntry(log)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSelectedLogEntry(log);
                }
              }}
              className="block w-full cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <PremiumCard variant="workout" className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-zinc-950 font-black">MJ</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-lg font-black tracking-[-0.04em] text-white">{getLogTitle(log)}</div>
                    <div className="text-sm text-zinc-500">{formatDateTime(getLogCreatedAt(log))}</div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Open workout options for ${getLogTitle(log)}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      openLogActions(log);
                    }}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/[0.06] bg-white/[0.035] text-zinc-500 transition hover:bg-white/[0.07] hover:text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {log.pinned && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100/16 bg-amber-100/[0.08] px-3 py-1.5 text-[0.68rem] font-black text-amber-100">
                      <Pin className="h-3.5 w-3.5" />
                      Pinned
                    </span>
                  )}
                  {[log.goal, log.focus, log.experience].filter(Boolean).map(chip => (
                    <span key={chip} className="rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 text-[0.68rem] font-bold text-zinc-300">{chip}</span>
                  ))}
                </div>

                <div className="rounded-[1.5rem] border border-amber-100/12 bg-amber-100/[0.055] p-4">
                  <div className="text-sm font-bold text-amber-100">{records.length ? `${records[0].label} unlocked` : 'Achievement unlocked'}</div>
                  <div className="mt-1 text-sm text-zinc-400">Completed {log.completedExercises || 0} exercises with {log.completedSets || 0} tracked sets.</div>
                </div>

                {bestLifts.length > 0 && (
                  <div className="rounded-[1.35rem] border border-white/[0.065] bg-white/[0.026] p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-[0.58rem] font-black uppercase tracking-[0.2em] text-amber-100/58">Best Lifts</div>
                      <Trophy className="h-3.5 w-3.5 text-amber-100/60" />
                    </div>
                    <div className="space-y-1.5">
                      {bestLifts.map((lift, index) => (
                        <div key={`${log.id}-best-${lift.exerciseName}-${lift.setNumber || index}`} className="flex items-center justify-between gap-3 text-sm">
                          <span className="min-w-0 truncate font-semibold text-zinc-400">{lift.exerciseName}</span>
                          <span className="shrink-0 font-black tracking-[-0.02em] text-white">{formatBestLiftValue(lift)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {preview.map((exercise, index) => (
                    <div key={`${log.id}-${exercise.name}-${index}`} className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.065] bg-black/20 px-3 py-2">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-amber-100/12 bg-amber-100/[0.07] text-[0.62rem] font-black text-amber-100">{exercise.label}</div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-black tracking-[-0.025em] text-white">{exercise.name}</div>
                        <div className="truncate text-[0.68rem] font-semibold text-zinc-500">{exercise.setsReps}{exercise.bestWeight ? ` / best ${exercise.bestWeight}` : ''}</div>
                      </div>
                    </div>
                  ))}
                  {exercises.length > 4 && (
                    <div className="rounded-2xl border border-white/[0.07] bg-black/20 px-3 py-2 text-xs font-black text-zinc-400">+{exercises.length - 4} more</div>
                  )}
                </div>

                {comments.length > 0 && (
                  <div className="rounded-[1.25rem] border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                    <div className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-zinc-600">Latest Comment</div>
                    <div className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-zinc-300">{comments[comments.length - 1].text}</div>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-white/[0.07] pt-4 text-sm font-semibold text-zinc-400">
                  <button
                    type="button"
                    aria-label={log.liked ? `Unlike ${getLogTitle(log)}` : `Like ${getLogTitle(log)}`}
                    aria-pressed={!!log.liked}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleLogLike(log.id);
                    }}
                    className={`inline-flex items-center gap-2 transition hover:text-white ${log.liked ? 'text-rose-200 drop-shadow-[0_0_12px_rgba(251,113,133,0.20)]' : ''}`}
                  >
                    <Heart className={`h-4 w-4 ${log.liked ? 'fill-current' : ''}`} />{log.liked ? 'Liked' : 'Like'}
                  </button>
                  <button
                    type="button"
                    aria-label={`Comment on ${getLogTitle(log)}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setCommentLogEntry(log);
                      setCommentDraft('');
                    }}
                    className="inline-flex items-center gap-2 hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4" />{comments.length ? `${comments.length} Comment${comments.length > 1 ? 's' : ''}` : 'Comment'}
                  </button>
                  <button
                    type="button"
                    aria-label={`Share ${getLogTitle(log)}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      openShareCard(log);
                    }}
                    className="inline-flex items-center gap-2 hover:text-white"
                  >
                    <Share2 className="h-4 w-4" />Share
                  </button>
                  <button
                    type="button"
                    aria-label={`Repeat ${getLogTitle(log)}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      repeatLogEntry(log);
                    }}
                    className="inline-flex items-center gap-2 hover:text-white"
                  >
                    <Repeat className="h-4 w-4" />Repeat
                  </button>
                </div>
              </PremiumCard>
            </div>
          );
        })}

        {selectedEntry && LogDetailView({ entry: selectedEntry })}
        {LogActionSheet()}
        {LogManagementSheet()}
        {LogManagementConfirmModal()}
        {EditTitleModal()}
        {ExportModal()}
        {DeleteConfirmModal()}
        {commentLogEntry && CommentModal()}
        {shareCardEntry && ShareCardModal()}
      </div>
    );
  };

  const nutritionRecipes = [
    { id: 'greek-yogurt-berries', title: 'Greek Yogurt with Berries', category: ['Breakfast', 'Snack', 'High Protein'], kcal: 334, protein: 28, carbs: 36, fats: 8, fiber: 7, duration: '5 min', difficulty: 'Easy', image: 'from-violet-500/30 via-rose-400/20 to-zinc-950', ingredients: ['250g Greek yogurt', '120g mixed berries', '20g granola', '10g honey'], preparationSteps: ['Add Greek yogurt to a chilled bowl.', 'Top with berries and granola.', 'Finish with honey and serve cold.'], tags: ['high protein', 'quick', 'recovery'], locked: false, performanceGoal: 'High-protein recovery meal ideal after hypertrophy sessions.', featured: true },
    { id: 'egg-avocado-toast', title: 'Egg & Avocado Performance Toast', category: ['Breakfast', 'Muscle Gain'], kcal: 512, protein: 31, carbs: 42, fats: 24, fiber: 9, duration: '12 min', difficulty: 'Easy', image: 'from-emerald-400/26 via-amber-300/18 to-zinc-950', ingredients: ['2 slices sourdough', '3 eggs', '1/2 avocado', 'Lime, salt, chili flakes'], preparationSteps: ['Toast sourdough until crisp.', 'Scramble or poach eggs.', 'Mash avocado with lime and seasoning.', 'Layer avocado and eggs on toast.'], tags: ['strength', 'healthy fats'], locked: false, performanceGoal: 'Balanced breakfast with protein and fats for longer training days.', featured: true },
    { id: 'protein-oats', title: 'Cinnamon Protein Oats', category: ['Breakfast', 'High Protein', 'Muscle Gain'], kcal: 468, protein: 36, carbs: 58, fats: 10, fiber: 8, duration: '8 min', difficulty: 'Easy', image: 'from-amber-300/28 via-orange-300/14 to-zinc-950', ingredients: ['70g oats', '1 scoop whey', '200ml milk', 'Cinnamon', 'Banana slices'], preparationSteps: ['Cook oats with milk until creamy.', 'Remove from heat and stir in whey.', 'Top with banana and cinnamon.'], tags: ['pre workout', 'muscle gain'], locked: false, performanceGoal: 'Carb-forward fuel for demanding lower-body sessions.', featured: false },
    { id: 'chicken-rice-bowl', title: 'Chicken Rice Power Bowl', category: ['Lunch', 'Post Workout', 'High Protein'], kcal: 642, protein: 48, carbs: 72, fats: 16, fiber: 6, duration: '25 min', difficulty: 'Medium', image: 'from-orange-300/24 via-emerald-300/16 to-zinc-950', ingredients: ['180g chicken breast', '220g cooked rice', 'Mixed greens', 'Yogurt herb sauce'], preparationSteps: ['Season and grill chicken.', 'Warm rice and greens.', 'Slice chicken and assemble bowl.', 'Drizzle with yogurt herb sauce.'], tags: ['post workout', 'lean protein'], locked: false, performanceGoal: 'High-protein glycogen refill after strength or hypertrophy training.', featured: true },
    { id: 'salmon-quinoa', title: 'Salmon Quinoa Recovery Plate', category: ['Lunch', 'Dinner', 'Recovery Meals'], kcal: 718, protein: 46, carbs: 54, fats: 34, fiber: 8, duration: '28 min', difficulty: 'Medium', image: 'from-sky-400/24 via-rose-300/18 to-zinc-950', ingredients: ['180g salmon', '180g cooked quinoa', 'Asparagus', 'Lemon', 'Olive oil'], preparationSteps: ['Bake salmon with lemon and olive oil.', 'Steam asparagus.', 'Serve over warm quinoa.'], tags: ['omega 3', 'recovery'], locked: true, performanceGoal: 'Recovery-focused meal with omega-3 fats and complete protein.', featured: true },
    { id: 'turkey-wrap', title: 'Turkey Crunch Wrap', category: ['Lunch', 'Low Calories', 'Fat Loss'], kcal: 398, protein: 34, carbs: 38, fats: 12, fiber: 6, duration: '10 min', difficulty: 'Easy', image: 'from-lime-300/20 via-zinc-700/20 to-zinc-950', ingredients: ['Wholegrain wrap', '140g turkey breast', 'Lettuce', 'Tomato', 'Mustard yogurt sauce'], preparationSteps: ['Warm wrap briefly.', 'Layer turkey and vegetables.', 'Add sauce and roll tightly.'], tags: ['fat loss', 'portable'], locked: false, performanceGoal: 'Lean, portable meal for high-compliance nutrition days.', featured: false },
    { id: 'beef-sweet-potato', title: 'Lean Beef & Sweet Potato', category: ['Dinner', 'Muscle Gain'], kcal: 690, protein: 52, carbs: 62, fats: 24, fiber: 9, duration: '35 min', difficulty: 'Medium', image: 'from-red-500/22 via-orange-300/18 to-zinc-950', ingredients: ['180g lean beef', '300g sweet potato', 'Broccoli', 'Garlic', 'Paprika'], preparationSteps: ['Roast sweet potato wedges.', 'Sear lean beef with garlic.', 'Steam broccoli and plate together.'], tags: ['iron', 'strength'], locked: false, performanceGoal: 'Dense strength meal for athletes pushing volume.', featured: false },
    { id: 'tofu-noodle-bowl', title: 'Tofu Noodle Recovery Bowl', category: ['Dinner', 'Recovery Meals'], kcal: 582, protein: 32, carbs: 74, fats: 18, fiber: 10, duration: '22 min', difficulty: 'Medium', image: 'from-emerald-300/20 via-sky-300/16 to-zinc-950', ingredients: ['180g tofu', 'Rice noodles', 'Edamame', 'Carrots', 'Soy ginger sauce'], preparationSteps: ['Crisp tofu in a hot pan.', 'Cook noodles and vegetables.', 'Toss with soy ginger sauce.'], tags: ['plant protein', 'recovery'], locked: true, performanceGoal: 'Plant-based recovery meal with carbs and moderate protein.', featured: false },
    { id: 'shrimp-tacos', title: 'Shrimp Protein Tacos', category: ['Dinner', 'Low Calories', 'High Protein'], kcal: 455, protein: 41, carbs: 46, fats: 11, fiber: 7, duration: '18 min', difficulty: 'Easy', image: 'from-cyan-300/22 via-amber-300/14 to-zinc-950', ingredients: ['180g shrimp', '3 corn tortillas', 'Cabbage slaw', 'Lime crema'], preparationSteps: ['Season and sear shrimp.', 'Warm tortillas.', 'Fill with slaw, shrimp, and crema.'], tags: ['lean', 'quick dinner'], locked: false, performanceGoal: 'High protein dinner that stays light for fat loss phases.', featured: false },
    { id: 'cottage-cheese-bowl', title: 'Cottage Cheese Power Bowl', category: ['Snack', 'High Protein', 'Low Calories'], kcal: 286, protein: 32, carbs: 22, fats: 6, fiber: 4, duration: '4 min', difficulty: 'Easy', image: 'from-blue-300/20 via-white/10 to-zinc-950', ingredients: ['250g cottage cheese', 'Cucumber', 'Cherry tomatoes', 'Everything seasoning'], preparationSteps: ['Add cottage cheese to bowl.', 'Top with vegetables and seasoning.', 'Serve cold.'], tags: ['low calorie', 'protein'], locked: false, performanceGoal: 'Protein-dense snack for appetite control.', featured: false },
    { id: 'banana-whey-smoothie', title: 'Banana Whey Smoothie', category: ['Post Workout', 'Snack', 'Muscle Gain'], kcal: 438, protein: 35, carbs: 62, fats: 6, fiber: 5, duration: '3 min', difficulty: 'Easy', image: 'from-yellow-300/28 via-orange-300/14 to-zinc-950', ingredients: ['1 banana', '1 scoop whey', '300ml milk', 'Ice', 'Pinch sea salt'], preparationSteps: ['Add all ingredients to blender.', 'Blend until smooth.', 'Drink within 30 minutes post workout.'], tags: ['fast', 'post workout'], locked: false, performanceGoal: 'Fast carbs and protein for quick post-session recovery.', featured: true },
    { id: 'tuna-potato-salad', title: 'Tuna Potato Athlete Salad', category: ['Lunch', 'Fat Loss', 'Recovery Meals'], kcal: 506, protein: 43, carbs: 55, fats: 12, fiber: 7, duration: '20 min', difficulty: 'Easy', image: 'from-slate-300/18 via-emerald-300/16 to-zinc-950', ingredients: ['1 can tuna', '250g potatoes', 'Green beans', 'Greek yogurt dressing'], preparationSteps: ['Boil potatoes until tender.', 'Mix tuna and vegetables.', 'Fold through yogurt dressing.'], tags: ['lean', 'satiety'], locked: true, performanceGoal: 'Filling high-protein meal for controlled calorie phases.', featured: false },
    { id: 'protein-pancakes', title: 'Protein Pancakes', category: ['Breakfast', 'Muscle Gain'], kcal: 546, protein: 42, carbs: 64, fats: 12, fiber: 7, duration: '15 min', difficulty: 'Medium', image: 'from-amber-200/25 via-rose-200/14 to-zinc-950', ingredients: ['2 eggs', '60g oats', '1 scoop whey', '100g berries', 'Greek yogurt'], preparationSteps: ['Blend eggs, oats, and whey.', 'Cook small pancakes on medium heat.', 'Serve with yogurt and berries.'], tags: ['weekend', 'high protein'], locked: false, performanceGoal: 'Higher calorie breakfast for muscle gain blocks.', featured: false },
    { id: 'chili-turkey', title: 'Turkey Chili Prep', category: ['Dinner', 'High Protein', 'Fat Loss'], kcal: 522, protein: 49, carbs: 48, fats: 14, fiber: 13, duration: '40 min', difficulty: 'Medium', image: 'from-red-400/24 via-amber-300/14 to-zinc-950', ingredients: ['200g lean turkey', 'Beans', 'Tomatoes', 'Peppers', 'Chili spices'], preparationSteps: ['Brown turkey in a pot.', 'Add beans, tomatoes, and spices.', 'Simmer until thick.'], tags: ['meal prep', 'high fiber'], locked: false, performanceGoal: 'Meal prep staple for lean mass and fat loss phases.', featured: false },
    { id: 'recovery-ramen', title: 'Recovery Chicken Ramen', category: ['Dinner', 'Recovery Meals', 'Post Workout'], kcal: 734, protein: 50, carbs: 88, fats: 18, fiber: 6, duration: '30 min', difficulty: 'Medium', image: 'from-orange-300/20 via-sky-300/14 to-zinc-950', ingredients: ['Chicken thigh', 'Ramen noodles', 'Egg', 'Mushrooms', 'Bone broth'], preparationSteps: ['Simmer broth with mushrooms.', 'Cook noodles and chicken.', 'Top with egg and scallions.'], tags: ['high carb', 'recovery'], locked: true, performanceGoal: 'High-carb recovery meal after long or high-volume sessions.', featured: false },
    { id: 'apple-peanut-stack', title: 'Apple Peanut Protein Stack', category: ['Snack', 'Fat Loss'], kcal: 244, protein: 18, carbs: 28, fats: 8, fiber: 6, duration: '4 min', difficulty: 'Easy', image: 'from-red-300/20 via-amber-300/14 to-zinc-950', ingredients: ['Apple slices', '20g peanut butter', '150g skyr', 'Cinnamon'], preparationSteps: ['Slice apple.', 'Serve with skyr and peanut butter.', 'Dust with cinnamon.'], tags: ['snack', 'satiety'], locked: false, performanceGoal: 'Small balanced snack for hunger management.', featured: false },
    { id: 'steak-eggs', title: 'Steak & Eggs Strength Plate', category: ['Breakfast', 'Muscle Gain', 'High Protein'], kcal: 710, protein: 62, carbs: 22, fats: 40, fiber: 4, duration: '20 min', difficulty: 'Medium', image: 'from-red-500/24 via-amber-200/16 to-zinc-950', ingredients: ['180g sirloin', '3 eggs', 'Spinach', 'Sourdough slice'], preparationSteps: ['Sear steak and rest.', 'Cook eggs to preference.', 'Serve with spinach and sourdough.'], tags: ['strength', 'high protein'], locked: true, performanceGoal: 'Protein-heavy meal for strength-focused athletes.', featured: false },
    { id: 'cod-rice-greens', title: 'Cod Rice & Greens', category: ['Dinner', 'Low Calories', 'Fat Loss'], kcal: 428, protein: 44, carbs: 45, fats: 6, fiber: 7, duration: '24 min', difficulty: 'Easy', image: 'from-cyan-200/22 via-emerald-300/14 to-zinc-950', ingredients: ['200g cod', '160g cooked rice', 'Green vegetables', 'Lemon herb seasoning'], preparationSteps: ['Bake cod with herbs.', 'Steam greens.', 'Plate with rice and lemon.'], tags: ['lean', 'low fat'], locked: false, performanceGoal: 'Lean dinner that supports body composition goals.', featured: false },
    { id: 'lentil-bolognese', title: 'Lentil Performance Bolognese', category: ['Dinner', 'Recovery Meals'], kcal: 610, protein: 34, carbs: 92, fats: 10, fiber: 18, duration: '35 min', difficulty: 'Medium', image: 'from-orange-400/20 via-emerald-300/14 to-zinc-950', ingredients: ['Red lentils', 'Wholewheat pasta', 'Tomato passata', 'Carrots', 'Parmesan'], preparationSteps: ['Simmer lentils in tomato sauce.', 'Cook pasta al dente.', 'Combine and finish with parmesan.'], tags: ['plant-forward', 'fiber'], locked: true, performanceGoal: 'Carb and fiber-rich recovery meal for endurance or volume days.', featured: false },
    { id: 'casein-cherry-bowl', title: 'Casein Cherry Sleep Bowl', category: ['Snack', 'Recovery Meals'], kcal: 318, protein: 32, carbs: 30, fats: 6, fiber: 5, duration: '5 min', difficulty: 'Easy', image: 'from-purple-400/22 via-rose-300/16 to-zinc-950', ingredients: ['Casein protein', 'Greek yogurt', 'Frozen cherries', 'Dark chocolate shavings'], preparationSteps: ['Mix casein into yogurt.', 'Top with cherries.', 'Add chocolate shavings.'], tags: ['night snack', 'recovery'], locked: false, performanceGoal: 'Slow-digesting protein option before sleep.', featured: false }
  ];

  const NutritionModule = () => {
    const categories = [
      { id: 'Breakfast', icon: Coffee, tone: 'from-amber-300/20 to-orange-400/8' },
      { id: 'Lunch', icon: Salad, tone: 'from-emerald-300/18 to-lime-400/8' },
      { id: 'Post Workout', icon: Zap, tone: 'from-sky-300/18 to-amber-300/8' },
      { id: 'Dinner', icon: Soup, tone: 'from-violet-300/18 to-orange-400/8' },
      { id: 'Snack', icon: AppleIconFallback, tone: 'from-rose-300/18 to-amber-300/8' },
      { id: 'High Protein', icon: Dumbbell, tone: 'from-blue-300/18 to-amber-300/8' },
      { id: 'Fat Loss', icon: Flame, tone: 'from-orange-300/18 to-rose-400/8' },
      { id: 'Muscle Gain', icon: Trophy, tone: 'from-amber-300/20 to-zinc-700/12' },
      { id: 'Low Calories', icon: Leaf, tone: 'from-lime-300/18 to-emerald-400/8' },
      { id: 'Recovery Meals', icon: Waves, tone: 'from-cyan-300/18 to-blue-400/8' }
    ];
    const query = nutritionSearch.trim().toLowerCase();
    const favoriteRecipes = nutritionRecipes.filter(recipe => nutritionFavorites.includes(recipe.id));
    const feedRecipes = nutritionRecipes.filter(recipe => (
      (!nutritionCategory || recipe.category.includes(nutritionCategory))
      && (!query || [recipe.title, recipe.performanceGoal, ...(recipe.tags || [])].join(' ').toLowerCase().includes(query))
    ));

    const FoodImage = ({ recipe, large = false }) => (
      <div className={`relative overflow-hidden ${large ? 'h-72 rounded-b-[2rem]' : 'aspect-[1.18] rounded-[1.45rem]'} bg-gradient-to-br ${recipe.image}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.20),transparent_24%),radial-gradient(circle_at_70%_70%,rgba(245,158,11,0.16),transparent_28%)]" />
        <div className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/24 text-center shadow-[0_22px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl">
          <Utensils className="h-9 w-9 text-amber-100" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
      </div>
    );

    const openRecipe = (recipe) => {
      if (recipe.locked) {
        setShowNutritionUnlock(true);
        return;
      }
      setSelectedRecipe(recipe);
    };

    const RecipeCard = ({ recipe }) => {
      const favorite = nutritionFavorites.includes(recipe.id);
      return (
        <button
          type="button"
          onClick={() => openRecipe(recipe)}
          className="group relative rounded-[1.65rem] border border-white/[0.065] bg-white/[0.028] p-2 text-left shadow-[0_18px_60px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:bg-white/[0.045] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
        >
          <div className={recipe.locked ? 'blur-[1.5px]' : ''}>
            <FoodImage recipe={recipe} />
          </div>
          {recipe.locked && (
            <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/62 px-3 py-1.5 text-[0.58rem] font-black uppercase tracking-[0.14em] text-amber-100 backdrop-blur-xl">
              <LockKeyhole className="mr-1 inline h-3 w-3" /> Locked
            </div>
          )}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              toggleNutritionFavorite(recipe.id);
            }}
            className={`absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border backdrop-blur-xl transition ${favorite ? 'border-rose-200/20 bg-rose-300/[0.16] text-rose-100' : 'border-white/10 bg-black/38 text-zinc-300'}`}
            aria-label={favorite ? `Unfavorite ${recipe.title}` : `Favorite ${recipe.title}`}
          >
            <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
          </button>
          <div className="px-2 pb-3 pt-3">
            <h3 className="line-clamp-2 min-h-[2.45rem] text-sm font-black leading-5 tracking-[-0.035em] text-white">{recipe.title}</h3>
            <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
              <div className="rounded-xl bg-black/22 px-1 py-2"><div className="text-xs font-black text-white">{recipe.kcal}</div><div className="text-[0.5rem] font-bold uppercase tracking-[0.12em] text-zinc-600">kcal</div></div>
              <div className="rounded-xl bg-black/22 px-1 py-2"><div className="text-xs font-black text-white">{recipe.duration}</div><div className="text-[0.5rem] font-bold uppercase tracking-[0.12em] text-zinc-600">time</div></div>
              <div className="rounded-xl bg-black/22 px-1 py-2"><div className="text-xs font-black text-white">{recipe.protein}g</div><div className="text-[0.5rem] font-bold uppercase tracking-[0.12em] text-zinc-600">protein</div></div>
            </div>
          </div>
        </button>
      );
    };

    const RecipeDetail = ({ recipe }) => (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black text-white">
        <div className="mx-auto min-h-screen max-w-xl pb-28">
          <div className="relative">
            <FoodImage recipe={recipe} large />
            <div className="absolute left-4 top-5 flex gap-2">
              <button type="button" onClick={() => setSelectedRecipe(null)} className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200" aria-label="Back to nutrition"><ArrowLeft className="h-5 w-5" /></button>
            </div>
            <button type="button" onClick={() => toggleNutritionFavorite(recipe.id)} className="absolute right-4 top-5 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-black/50 text-rose-100 backdrop-blur-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200" aria-label="Favorite recipe"><Heart className={`h-5 w-5 ${nutritionFavorites.includes(recipe.id) ? 'fill-current' : ''}`} /></button>
          </div>
          <div className="-mt-8 relative space-y-5 px-4">
            <PremiumCard variant="hero">
              <div className="flex flex-wrap gap-2">{recipe.tags.map(tag => <span key={tag} className="rounded-full border border-amber-100/12 bg-amber-100/[0.06] px-3 py-1 text-[0.6rem] font-black uppercase tracking-[0.14em] text-amber-100">{tag}</span>)}</div>
              <h1 className="mt-4 text-4xl font-black leading-none tracking-[-0.06em] text-white">{recipe.title}</h1>
              <div className="mt-5 grid grid-cols-4 gap-2">
                {[['kcal', recipe.kcal], ['Time', recipe.duration], ['Protein', `${recipe.protein}g`], ['Level', recipe.difficulty]].map(([itemLabel, value]) => (
                  <div key={itemLabel} className="rounded-2xl border border-white/[0.06] bg-black/24 px-2 py-3 text-center">
                    <div className="text-sm font-black text-white">{value}</div>
                    <div className="mt-1 text-[0.52rem] font-bold uppercase tracking-[0.12em] text-zinc-600">{itemLabel}</div>
                  </div>
                ))}
              </div>
            </PremiumCard>
            <PremiumCard variant="secondary">
              <SectionHeader icon={ChefHat} eyebrow="Ingredients" title="Build The Plate" subtitle={null} />
              <div className="space-y-2">{recipe.ingredients.map(item => <div key={item} className="rounded-2xl border border-white/[0.055] bg-black/18 px-4 py-3 text-sm font-semibold text-zinc-300">{item}</div>)}</div>
            </PremiumCard>
            <PremiumCard variant="secondary">
              <SectionHeader icon={ClipboardList} eyebrow="Preparation" title="Steps" subtitle={null} />
              <div className="space-y-3">{recipe.preparationSteps.map((step, index) => <div key={step} className="flex gap-3 rounded-2xl border border-white/[0.055] bg-black/18 p-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber-100 text-xs font-black text-zinc-950">{index + 1}</span><span className="text-sm leading-6 text-zinc-300">{step}</span></div>)}</div>
            </PremiumCard>
            <PremiumCard variant="secondary">
              <SectionHeader icon={Activity} eyebrow="Performance Notes" title="Why It Works" subtitle={recipe.performanceGoal} />
              <div className="grid grid-cols-4 gap-2">
                {[['Protein', `${recipe.protein}g`], ['Carbs', `${recipe.carbs}g`], ['Fats', `${recipe.fats}g`], ['Fiber', `${recipe.fiber}g`]].map(([itemLabel, value]) => <div key={itemLabel} className="rounded-2xl border border-white/[0.055] bg-black/18 p-3 text-center"><div className="text-base font-black text-white">{value}</div><div className="mt-1 text-[0.52rem] font-bold uppercase tracking-[0.12em] text-zinc-600">{itemLabel}</div></div>)}
              </div>
            </PremiumCard>
          </div>
        </div>
      </div>
    );

    if (selectedRecipe) return <RecipeDetail recipe={selectedRecipe} />;

    return (
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <ScreenHeader eyebrow="ForgeAI Fuel" title="Nutrition" subtitle="AI-supported performance nutrition." icon={Utensils} />
          {nutritionCategory && <button type="button" onClick={() => setNutritionCategory(null)} className="mt-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-xs font-black text-zinc-300">All</button>}
        </div>
        <div className="flex gap-2 rounded-[1.5rem] border border-white/[0.08] bg-black/24 p-2">
          <Search className="ml-2 mt-3 h-5 w-5 shrink-0 text-zinc-600" />
          <input value={nutritionSearch} onChange={(event) => setNutritionSearch(event.target.value)} placeholder="Search meals, goals, macros..." className="min-w-0 flex-1 bg-transparent px-2 text-sm font-semibold text-white outline-none placeholder:text-zinc-600" aria-label="Search nutrition recipes" />
          <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04] text-zinc-300" aria-label="Filter nutrition recipes"><Filter className="h-5 w-5" /></button>
        </div>
        {!nutritionCategory && favoriteRecipes.length > 0 && (
          <PremiumCard variant="secondary" className="!p-4">
            <SectionHeader icon={Heart} eyebrow="Saved" title="Favorite Recipes" subtitle={null} />
            <div className="flex gap-3 overflow-x-auto pb-1">{favoriteRecipes.slice(0, 6).map(recipe => <button key={recipe.id} type="button" onClick={() => openRecipe(recipe)} className="min-w-40 rounded-[1.35rem] border border-white/[0.065] bg-white/[0.03] p-2 text-left"><FoodImage recipe={recipe} /><div className="mt-2 line-clamp-2 text-xs font-black text-white">{recipe.title}</div></button>)}</div>
          </PremiumCard>
        )}
        {!nutritionCategory && !query ? (
          <div className="grid grid-cols-2 gap-3">
            {categories.map(({ id, icon: Icon, tone }) => (
              <button key={id} type="button" onClick={() => setNutritionCategory(id)} className={`min-h-32 rounded-[1.65rem] border border-white/[0.065] bg-gradient-to-br ${tone} p-4 text-left shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200`}>
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/[0.08] bg-black/24 text-amber-100"><Icon className="h-5 w-5" /></div>
                <div className="mt-4 text-lg font-black tracking-[-0.045em] text-white">{id}</div>
                <div className="mt-1 text-xs font-semibold text-zinc-500">{nutritionRecipes.filter(recipe => recipe.category.includes(id)).length} recipes</div>
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-amber-100/58">Recipe Feed</div>
                <h2 className="mt-1 text-3xl font-black tracking-[-0.055em] text-white">{nutritionCategory || 'Search Results'}</h2>
              </div>
              <span className="text-xs font-bold text-zinc-600">{feedRecipes.length} meals</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {feedRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
            </div>
          </>
        )}
        {showNutritionUnlock && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/72 p-4 backdrop-blur-xl">
            <div className="w-full max-w-sm rounded-[2rem] border border-amber-100/14 bg-zinc-950/95 p-6 text-center shadow-[0_34px_140px_rgba(0,0,0,0.62)]">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-100 text-zinc-950"><LockKeyhole className="h-7 w-7" /></div>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.055em] text-white">Nutrition PRO</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">Premium recipe systems and performance meal plans unlock soon.</p>
              <button type="button" onClick={() => setShowNutritionUnlock(false)} className="mt-6 w-full rounded-full bg-amber-100 px-5 py-3 text-sm font-black text-zinc-950">Close</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const AppleIconFallback = Leaf;

  const StoreModule = () => (
    <div className="space-y-5">
      <PremiumCard variant="hero" className="relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-300/16 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-amber-200 via-orange-300 to-orange-400 text-zinc-950 shadow-[0_18px_70px_rgba(245,158,11,0.24)]"><ShoppingBag className="h-8 w-8" /></div>
          <div>
            <div className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-amber-100/60">ForgeAI Store</div>
            <h1 className="mt-1 text-4xl font-black tracking-[-0.06em] text-white">Coming Soon</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Performance tools curated for serious training.</p>
          </div>
        </div>
      </PremiumCard>
      <div className="grid grid-cols-2 gap-3">
        {[
          ['Supplements', Activity],
          ['Equipment', Dumbbell],
          ['Apparel', Crown],
          ['Recovery Tools', Waves]
        ].map(([title, Icon]) => (
          <PremiumCard key={title} variant="secondary" className="!p-4">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-amber-100/12 bg-amber-100/[0.07] text-amber-100"><Icon className="h-5 w-5" /></div>
            <div className="mt-4 text-lg font-black tracking-[-0.045em] text-white">{title}</div>
            <div className="mt-1 text-xs font-semibold text-zinc-500">Coming Soon</div>
          </PremiumCard>
        ))}
      </div>
    </div>
  );

  const AITab = () => {
    if (activeAIModule === 'nutrition') return <NutritionModule />;
    if (activeAIModule === 'store') return <StoreModule />;

    const promptChips = ['Build me a push day', 'Fix my weak chest', 'Analyze my workout', 'Make this harder', 'Deload this week'];
    const promptLimit = 700;
    const outputLimit = 2200;
    const settingLabels = {
      goal: label.goal[settings.goal],
      experience: label.experience[settings.experience],
      equipment: label.equipment[settings.equipment],
      focus: label.focus[settings.focus],
      duration: settings.duration,
      workoutStyle: label.workoutStyle[settings.workoutStyle],
      conditioningType: label.conditioningType[settings.conditioningType]
    };

    const buildDemoCoachResponse = (prompt) => {
      const lowerPrompt = prompt.toLowerCase();
      const exerciseCount = workout?.exercises?.length || 0;
      const firstMain = workout?.exercises?.[0]?.name || 'your main lift';
      const secondMove = workout?.exercises?.[1]?.name || 'your secondary movement';
      const contextLine = `Context: ${settingLabels.goal}, ${settingLabels.experience}, ${settingLabels.focus}, ${settingLabels.duration}, ${settingLabels.equipment}.`;
      let plan = `Start with ${firstMain} as the quality anchor, keep 1-2 reps in reserve on early sets, and use ${secondMove} to build volume without rushing the tempo.`;

      if (lowerPrompt.includes('push')) {
        plan = 'Run an upper push emphasis: heavy press first, incline or machine press second, then lateral delts and triceps. Keep chest work controlled and stop accessory sets when joint position or rep speed drops.';
      } else if (lowerPrompt.includes('weak chest') || lowerPrompt.includes('chest')) {
        plan = 'Bias chest by using a slight incline, a 2-3 second eccentric, and a hard pause near the stretched position. Add one back-off set after the main press instead of adding random extra exercises.';
      } else if (lowerPrompt.includes('harder')) {
        plan = 'Make it harder by adding one top set at the same reps, then one controlled back-off set at 90% of that load. Keep main-lift rest intact and increase density only on accessories.';
      } else if (lowerPrompt.includes('deload')) {
        plan = 'Deload by cutting working sets by 35-45%, keeping technique crisp, and holding intensity around 60-70%. Leave the gym feeling better than when you arrived.';
      } else if (lowerPrompt.includes('analyze')) {
        plan = exerciseCount
          ? `This session has ${exerciseCount} movements. The structure is strongest if ${firstMain} gets the most neurological focus, then accessories stay clean and repeatable.`
          : 'Generate a workout first and I can analyze exercise order, volume, intensity, and weak-link coverage more specifically.';
      }

      return [
        'ForgeAI Coach · Demo AI',
        contextLine,
        '',
        plan,
        '',
        'Prescription: keep main work at RPE 7-8, rest long enough to repeat quality, and progress only when the final set still looks technically identical to the first.'
      ].join('\n').slice(0, outputLimit);
    };

    const buildDemoMealAnalysis = () => {
      const weightDirection = getWeightGoalDirection(userSettings);
      const goalText = settingLabels.goal || 'training';
      const phaseInsight = weightDirection === 'gain'
        ? 'This meal can support a lean-gain phase if portions are paired with enough total daily protein.'
        : weightDirection === 'lose'
          ? 'This meal is useful during a body-composition phase if oils, sauces, and extras are controlled.'
          : 'This meal fits a maintenance phase when paired with consistent daily protein and fiber.';

      return {
        estimatedMealName: goalText === 'Conditioning' ? 'Performance Rice Bowl' : 'High-Protein Training Bowl',
        caloriesEstimate: { low: 420, high: 560 },
        macros: { proteinGrams: 36, carbsGrams: 58, fatGrams: 14 },
        confidence: 'medium',
        detectedFoods: ['lean protein', 'rice or grains', 'vegetables', 'light sauce'],
        insights: [
          'Strong protein base for recovery and muscle protein synthesis.',
          'Carb content fits pre-workout or post-workout fueling.',
          phaseInsight
        ],
        suggestions: [
          weightDirection === 'gain' ? 'Add olive oil, avocado, or an extra carb serving if calories are too low.' : 'Keep sauces measured if the goal is fat loss or tighter calorie control.',
          'Add fruit or vegetables if this is your main meal of the day.'
        ]
      };
    };

    const handleMealPhotoChange = (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        setMealAnalysisError('Please upload an image file.');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setMealAnalysisError('Image is too large. Please upload a photo under 8 MB.');
        return;
      }

      if (mealPhotoPreview) URL.revokeObjectURL(mealPhotoPreview);
      setMealPhoto(file);
      setMealPhotoPreview(URL.createObjectURL(file));
      setMealAnalysisResult(null);
      setMealAnalysisError('');
      event.target.value = '';
    };

    const removeMealPhoto = () => {
      if (mealPhotoPreview) URL.revokeObjectURL(mealPhotoPreview);
      setMealPhoto(null);
      setMealPhotoPreview('');
      setMealAnalysisResult(null);
      setMealAnalysisError('');
    };

    const analyzeMealPhoto = async () => {
      if (!mealPhoto || mealAnalysisLoading) return;
      setMealAnalysisLoading(true);
      setMealAnalysisError('');

      const demoResult = buildDemoMealAnalysis();
      const recentWorkoutContext = Array.isArray(workout)
        ? workout.slice(0, 8).map(exercise => ({
          name: exercise.name,
          setsReps: exercise.setsReps,
          tempo: exercise.tempo,
          rest: exercise.rest,
          intensity: exercise.intensity || exercise.schemeName
        }))
        : null;

      try {
        const formData = new FormData();
        formData.append('image', mealPhoto);
        formData.append('userSettings', JSON.stringify(userSettings));
        formData.append('currentWeight', String(userSettings.currentWeight || ''));
        formData.append('targetWeight', String(userSettings.targetWeight || ''));
        formData.append('trainingGoal', settingLabels.goal || '');
        formData.append('recentWorkoutContext', JSON.stringify(recentWorkoutContext));
        formData.append('demoResult', JSON.stringify(demoResult));

        const response = await fetch('/api/meal-analyze', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error('Meal analysis request failed');
        const data = await response.json();
        setMealAnalysisResult(data.analysis || demoResult);
        if (data.mode === 'demo') setMealAnalysisError(data.error || 'Demo analysis used. Live meal analysis is not connected yet.');
      } catch (error) {
        setMealAnalysisResult(demoResult);
        setMealAnalysisError('Live meal analysis unavailable. Demo nutrition estimate shown.');
      } finally {
        setMealAnalysisLoading(false);
      }
    };

    const sendPrompt = async (prompt = aiPrompt) => {
      const cleanPrompt = prompt.trim().slice(0, promptLimit);
      if (!cleanPrompt || aiLoading) return;
      setAiPrompt('');
      setAiLoading(true);
      setAiError('');

      const demoResponse = buildDemoCoachResponse(cleanPrompt);
      const context = buildForgeCoachContext({
        prompt: cleanPrompt,
        settings: {
          ...settings,
          labels: settingLabels
        },
        generatedWorkout: workout,
        workoutLogs,
        userProgress,
        activeProgram: proGeneratedProgram || proConfig
      });

      try {
        console.log('[ForgeAI AI] request start', {
          prompt: cleanPrompt,
          settings: context.settings,
          generatedWorkout: context.generatedWorkout,
          workoutLogs: context.workoutLogs,
          userProgress: context.userProgress
        });
        const answer = await generateGeminiResponse({ ...context, demoResponse });
        console.log('[ForgeAI AI] response received', answer);
        setAiResponse(String(answer || demoResponse).slice(0, outputLimit));
        setAiMode('live');
      } catch (error) {
        console.error('[ForgeAI AI] error', error);
        setAiMode('demo');
        setAiResponse(String(error?.fallbackAnswer || demoResponse).slice(0, outputLimit));
        setAiError(error?.message || 'Live AI unavailable. Demo AI answered with local workout context.');
      } finally {
        setAiLoading(false);
      }
    };

    return (
      <div className="space-y-5">
        <PremiumCard variant="hero">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-amber-200 via-orange-300 to-orange-400 text-zinc-950 shadow-[0_18px_70px_rgba(245,158,11,0.24)]">
              <Brain className="h-8 w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-amber-100/60">Central Coach</div>
              <h1 className="mt-1 text-4xl font-black tracking-[-0.06em] text-white">ForgeAI Coach</h1>
              <p className="mt-2 text-sm leading-6 text-zinc-400">Ask for programming, progression, recovery, or workout analysis.</p>
            </div>
            <span className={`shrink-0 rounded-full border px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em] ${aiMode === 'live' ? 'border-emerald-300/25 bg-emerald-300/[0.08] text-emerald-200' : 'border-amber-200/25 bg-amber-200/[0.08] text-amber-100'}`}>
              {aiMode === 'live' ? 'Live AI' : 'Demo AI'}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-600">
            <Sparkles className="h-3.5 w-3.5 text-amber-100/55" />
            {aiMode === 'live' ? 'Powered by Gemini 2.5 Flash' : 'Gemini-ready demo fallback'}
          </div>
        </PremiumCard>
        <section className="premium-card space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.038] p-6 shadow-[0_28px_110px_rgba(0,0,0,0.32)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-white/16 md:p-8">
          <div className="flex flex-wrap gap-2">
            {promptChips.map(chip => (
              <button key={chip} type="button" onClick={() => sendPrompt(chip)} className="rounded-full border border-white/[0.08] bg-white/[0.035] px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.065] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200">
                {chip}
              </button>
            ))}
          </div>
          <div className="flex gap-2 rounded-[1.5rem] border border-white/[0.08] bg-black/22 p-2">
            <input
              value={aiPrompt}
              onChange={(event) => setAiPrompt(event.target.value)}
              maxLength={promptLimit}
              placeholder="Ask ForgeAI Coach..."
              aria-label="Ask ForgeAI Coach"
              className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-white outline-none placeholder:text-zinc-600"
            />
            <button type="button" onClick={() => sendPrompt()} disabled={aiLoading || !aiPrompt.trim()} className="grid h-11 w-11 place-items-center rounded-full bg-amber-100 text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-45 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200" aria-label="Send prompt to ForgeAI Coach">
              {aiLoading ? <Repeat className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
          <div className="flex items-center justify-between text-[0.66rem] font-bold uppercase tracking-[0.16em] text-zinc-600">
            <span>{aiPrompt.length}/{promptLimit}</span>
            <span>{aiMode === 'live' ? 'Gemini backend' : 'Local demo fallback'}</span>
          </div>
        </section>

        <PremiumCard variant="secondary">
          <SectionHeader icon={Sparkles} eyebrow="Coach Response" title="Live Insight" subtitle={aiMode === 'live' ? 'Powered by Gemini' : null} />
          {aiError && <div className="mb-4 rounded-2xl border border-amber-200/15 bg-amber-200/[0.06] px-4 py-3 text-xs font-semibold leading-5 text-amber-100/85">{aiError}</div>}
          <p className="whitespace-pre-line break-words text-sm leading-7 text-zinc-300">{aiLoading ? 'ForgeAI Coach is analyzing your training context...' : aiResponse}</p>
        </PremiumCard>

        <PremiumCard variant="secondary" className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-emerald-200/16 bg-emerald-300/[0.08] text-emerald-100">
              <Camera className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-emerald-100/62">Meal Photo Analysis</div>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-white">Meal Photo Analysis</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">Upload a meal photo to estimate calories, macros, and nutrition quality.</p>
            </div>
          </div>

          <input
            id="meal-photo-upload"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleMealPhotoChange}
            className="sr-only"
            aria-label="Upload meal photo"
          />

          {!mealPhotoPreview ? (
            <label
              htmlFor="meal-photo-upload"
              className="group flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-white/[0.12] bg-black/22 p-5 text-center transition hover:border-emerald-200/24 hover:bg-emerald-200/[0.035] focus-within:ring-2 focus-within:ring-amber-200"
            >
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-emerald-200/16 bg-emerald-300/[0.08] text-emerald-100 transition group-hover:scale-105">
                <Upload className="h-6 w-6" />
              </div>
              <div className="mt-4 text-sm font-black text-white">Upload Meal Photo</div>
              <div className="mt-1 text-xs font-semibold text-zinc-500">Camera or gallery. Images only.</div>
            </label>
          ) : (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-black/24">
                <img src={mealPhotoPreview} alt="Uploaded meal preview" className="h-56 w-full object-cover" />
                <button
                  type="button"
                  onClick={removeMealPhoto}
                  className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border border-white/[0.12] bg-black/62 text-white backdrop-blur-xl transition hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                  aria-label="Remove meal photo"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <label
                  htmlFor="meal-photo-upload"
                  className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-3 text-sm font-black text-zinc-200 transition hover:bg-white/[0.07] focus-within:ring-2 focus-within:ring-amber-200"
                >
                  Change Photo
                </label>
                <button
                  type="button"
                  onClick={analyzeMealPhoto}
                  disabled={mealAnalysisLoading}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-200 via-orange-300 to-orange-400 px-5 py-3 text-sm font-black text-zinc-950 shadow-[0_16px_54px_rgba(245,158,11,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                >
                  {mealAnalysisLoading ? <Repeat className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Analyze Meal
                </button>
              </div>
            </div>
          )}

          {mealAnalysisError && (
            <div className="rounded-2xl border border-amber-200/15 bg-amber-200/[0.06] px-4 py-3 text-xs font-semibold leading-5 text-amber-100/85">
              {mealAnalysisError}
            </div>
          )}

          {mealAnalysisResult && (
            <div className="space-y-4 rounded-[1.65rem] border border-white/[0.07] bg-black/22 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[0.58rem] font-black uppercase tracking-[0.2em] text-emerald-100/62">Estimated Meal</div>
                  <h3 className="mt-1 text-3xl font-black tracking-[-0.06em] text-white">{mealAnalysisResult.estimatedMealName}</h3>
                  <div className="mt-2 text-sm font-bold text-amber-100">
                    {mealAnalysisResult.caloriesEstimate?.low}-{mealAnalysisResult.caloriesEstimate?.high} kcal
                  </div>
                </div>
                <span className="rounded-full border border-emerald-200/18 bg-emerald-300/[0.08] px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.16em] text-emerald-100">
                  {mealAnalysisResult.confidence || 'medium'} confidence
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  ['Protein', `${mealAnalysisResult.macros?.proteinGrams || 0}g`],
                  ['Carbs', `${mealAnalysisResult.macros?.carbsGrams || 0}g`],
                  ['Fat', `${mealAnalysisResult.macros?.fatGrams || 0}g`]
                ].map(([macroLabel, value]) => (
                  <div key={macroLabel} className="rounded-2xl border border-white/[0.055] bg-white/[0.03] px-3 py-3 text-center">
                    <div className="text-lg font-black text-white">{value}</div>
                    <div className="mt-1 text-[0.52rem] font-black uppercase tracking-[0.14em] text-zinc-600">{macroLabel}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {(mealAnalysisResult.detectedFoods || []).map(food => (
                  <span key={food} className="rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 text-xs font-bold text-zinc-300">{food}</span>
                ))}
              </div>

              <div className="grid gap-3">
                <div>
                  <div className="mb-2 text-[0.58rem] font-black uppercase tracking-[0.2em] text-amber-100/58">Insights</div>
                  <div className="space-y-2">
                    {(mealAnalysisResult.insights || []).map(insight => (
                      <div key={insight} className="rounded-2xl border border-white/[0.055] bg-white/[0.025] px-3 py-2 text-sm leading-6 text-zinc-300">{insight}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-[0.58rem] font-black uppercase tracking-[0.2em] text-emerald-100/58">Suggestions</div>
                  <div className="space-y-2">
                    {(mealAnalysisResult.suggestions || []).map(suggestion => (
                      <div key={suggestion} className="rounded-2xl border border-emerald-200/[0.08] bg-emerald-300/[0.035] px-3 py-2 text-sm leading-6 text-zinc-300">{suggestion}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs font-semibold leading-5 text-zinc-600">Estimates from photos can be inaccurate. Use this as guidance, not medical advice.</p>
          {/* Future: connect to a real vision model, save meals to a nutrition log, use weight goals for calorie surplus/deficit guidance, and add results to AI Coach memory. */}
        </PremiumCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <MetricTile icon={Gauge} label="Readiness" value="Moderate / Green" />
          <MetricTile icon={Zap} label="Suggestion" value="Add 1 back-off set" tone="green" />
        </div>
      </div>
    );
  };

  const ProTab = () => {
    const proSports = [
      { id: 'bodybuilding', label: 'Bodybuilding', desc: 'Hypertrophy-focused periodization with volume waves.', icon: Layers },
      { id: 'powerlifting', label: 'Powerlifting', desc: 'Peaking programs for squat, bench and deadlift.', icon: Trophy },
      { id: 'weightlifting', label: 'Weightlifting', desc: 'Olympic lift periodization for snatch and clean + jerk.', icon: Zap },
      { id: 'trackField', label: 'Track & Field', desc: 'Sprint and jump performance with CNS management.', icon: Gauge },
      { id: 'generalFitness', label: 'General Fitness', desc: 'Balanced strength, muscle and conditioning.', icon: Activity },
      { id: 'fatLoss', label: 'Fat Loss', desc: 'Metabolic resistance training with deficit-friendly volume.', icon: Flame }
    ];

    const proSchedules = [
      { id: '3', label: '3 Days', days: ['Mon', 'Wed', 'Fri'] },
      { id: '4', label: '4 Days', days: ['Mon', 'Tue', 'Thu', 'Fri'] },
      { id: '5', label: '5 Days', days: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat'] },
      { id: '6', label: '6 Days', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }
    ];

    const proDurations = [
      { weeks: 4, label: '4 Weeks', desc: 'Short focused block' },
      { weeks: 6, label: '6 Weeks', desc: 'Compact progression block' },
      { weeks: 8, label: '8 Weeks', desc: 'Balanced full cycle' },
      { weeks: 12, label: '12 Weeks', desc: 'Complete periodized macrocycle' }
    ];

    const proCurves = [
      { id: 'linear', label: 'Linear Loading', desc: 'Linear increase each week, deload every 4th week.', bars: [32, 48, 64, 38, 72, 86] },
      { id: 'step', label: 'Step Loading', desc: 'Two weeks hold, then a bigger jump on week 3.', bars: [40, 40, 62, 62, 82, 82] },
      { id: 'variable', label: 'Variable Loading', desc: 'Wave undulation with heavy, light and medium rotation.', bars: [72, 44, 60, 78, 50, 68] }
    ];

    const proStepLabels = ['Sport', 'Schedule', 'Duration', 'Curve', 'Goals', 'Summary'];
    const selectedSport = proSports.find(sport => sport.id === proConfig.sport);
    const selectedSchedule = proSchedules.find(schedule => schedule.id === proConfig.schedule);
    const selectedCurve = proCurves.find(curve => curve.id === proConfig.overloadCurve);

    const getProPhases = (weeks = proConfig.durationWeeks) => {
      if (weeks === 4) return ['Accumulation', 'Intensification', 'Deload'];
      if (weeks === 6) return ['GPP', 'Hypertrophy', 'Strength', 'Deload'];
      if (weeks === 8) return ['GPP', 'Hypertrophy', 'Strength', 'Peaking', 'Deload'];
      return ['GPP', 'Hypertrophy', 'Strength', 'Intensification', 'Peaking', 'Deload'];
    };

    const getPhaseForWeek = (week, weeks) => {
      if (weeks === 4) {
        if (week <= 2) return 'Accumulation';
        if (week === 3) return 'Intensification';
        return 'Deload';
      }
      if (weeks === 6) {
        if (week === 1) return 'GPP';
        if (week <= 3) return 'Hypertrophy';
        if (week <= 5) return 'Strength';
        return 'Deload';
      }
      if (weeks === 8) {
        if (week === 1) return 'GPP';
        if (week <= 3) return 'Hypertrophy';
        if (week <= 5) return 'Strength';
        if (week <= 7) return 'Peaking';
        return 'Deload';
      }
      if (week <= 2) return 'GPP';
      if (week <= 4) return 'Hypertrophy';
      if (week <= 7) return 'Strength';
      if (week <= 9) return 'Intensification';
      if (week <= 11) return 'Peaking';
      return 'Deload';
    };

    const getProjectionPercent = () => {
      const weeks = proConfig.durationWeeks || 4;
      let projection = weeks === 4 ? 2.5 : weeks === 6 ? 4 : weeks === 8 ? 5 : 7.5;
      if (proConfig.overloadCurve === 'step') projection += 0.5;
      if (proConfig.overloadCurve === 'variable') projection -= 0.5;
      if (['bodybuilding', 'generalFitness', 'fatLoss'].includes(proConfig.sport)) projection *= 0.72;
      if (['weightlifting', 'trackField'].includes(proConfig.sport)) projection *= 0.84;
      return Math.max(1, Number(projection.toFixed(1)));
    };

    const getProTargets = () => {
      const projection = getProjectionPercent();
      return Object.entries(proConfig.goals).reduce((targets, [key, value]) => {
        const current = Number(value.current) || 0;
        targets[key] = {
          current,
          target: current ? Math.round(current * (1 + projection / 100) * 2) / 2 : 0,
          projection
        };
        return targets;
      }, {});
    };

    const getWeekIntensity = (week, weeks, curve, phase) => {
      if (phase === 'Deload') return 62;
      if (curve === 'step') return Math.min(91, 68 + Math.floor((week - 1) / 2) * 6 + (week % 4 === 0 ? -6 : 0));
      if (curve === 'variable') {
        const wave = [76, 68, 72, 64];
        return Math.min(91, wave[(week - 1) % wave.length] + Math.floor(week / 4) * 4);
      }
      return Math.min(92, 68 + (week - 1) * 3 + (week % 4 === 0 ? -7 : 0));
    };

    const getDayFocus = (sport, dayIndex) => {
      const map = {
        powerlifting: ['Squat', 'Bench', 'Deadlift', 'Upper / Accessories', 'Squat Volume', 'Bench Volume'],
        bodybuilding: ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Arms / Delts'],
        weightlifting: ['Snatch', 'Clean & Jerk', 'Squat', 'Pulls', 'Technique', 'Power'],
        trackField: ['Acceleration', 'Max Velocity', 'Plyometrics', 'Strength', 'Tempo Runs', 'Mobility'],
        generalFitness: ['Full Body A', 'Conditioning', 'Full Body B', 'Upper', 'Lower', 'Zone 2'],
        fatLoss: ['Metabolic A', 'Intervals', 'Metabolic B', 'Upper Circuit', 'Lower Circuit', 'Zone 2']
      };
      return (map[sport] || map.generalFitness)[dayIndex % (map[sport] || map.generalFitness).length];
    };

    const schemeForPhase = (phase, main = false) => {
      if (phase === 'Deload') return main ? { setsReps: '3 x 5', tempo: '3010', rest: '90s' } : { setsReps: '2 x 10', tempo: '3010', rest: '60s' };
      if (phase === 'GPP') return main ? { setsReps: '4 x 10', tempo: '3010', rest: '90s' } : { setsReps: '3 x 12-15', tempo: '3010', rest: '60s' };
      if (phase === 'Hypertrophy' || phase === 'Accumulation') return main ? { setsReps: '4 x 8-10', tempo: '3010', rest: '90s' } : { setsReps: '3 x 10-12', tempo: '3010', rest: '60s' };
      if (phase === 'Strength' || phase === 'Intensification') return main ? { setsReps: '5 x 4-6', tempo: '20X0', rest: '150s' } : { setsReps: '3 x 6-8', tempo: '3010', rest: '90s' };
      return main ? { setsReps: '4 x 3-5', tempo: '20X0', rest: '180s' } : { setsReps: '3 x 8-10', tempo: '3010', rest: '75s' };
    };

    const getProgramExercises = (sport, focus, phase, intensity) => {
      const S = (main = false) => schemeForPhase(phase, main);
      const mainIntensity = `${intensity}%`;
      const secondaryIntensity = `${Math.max(50, intensity - 8)}%`;
      const rowsByFocus = {
        Squat: ['Back Squat', 'Pause Squat', 'Dumbbell Row', 'Leg Press', 'Pull-ups'],
        Bench: ['Bench Press', 'Incline Dumbbell Press', 'Chest Supported Row', 'Triceps Pushdown', 'Lateral Raise'],
        Deadlift: ['Deadlift', 'Romanian Deadlift', 'Front Squat', 'Hamstring Curl', 'Plank'],
        'Upper / Accessories': ['Overhead Press', 'Pull-up', 'Close-Grip Bench', 'Cable Row', 'Face Pull'],
        'Squat Volume': ['Pin Squat', 'Bulgarian Split Squat', 'Seated Row', 'Leg Extension', 'Hanging Knee Raise'],
        'Bench Volume': ['Paused Bench Press', 'Dumbbell Bench Press', 'Lat Pulldown', 'Skull Crusher', 'Rear Delt Fly'],
        Push: ['Incline Press', 'Machine Chest Press', 'Seated Shoulder Press', 'Cable Fly', 'Rope Pressdown'],
        Pull: ['Weighted Pull-up', 'Chest Supported Row', 'Lat Pulldown', 'Rear Delt Fly', 'Hammer Curl'],
        Legs: ['Hack Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Curl', 'Standing Calf Raise'],
        Upper: ['Bench Press', 'Barbell Row', 'Overhead Press', 'Pull-up', 'Cable Lateral Raise'],
        Lower: ['Front Squat', 'Hip Thrust', 'Walking Lunge', 'Hamstring Curl', 'Calf Raise'],
        'Arms / Delts': ['Close-Grip Bench', 'EZ-Bar Curl', 'Cable Lateral Raise', 'Overhead Extension', 'Preacher Curl'],
        Snatch: ['Snatch', 'Snatch Pull', 'Overhead Squat', 'Back Extension', 'Hollow Hold'],
        'Clean & Jerk': ['Clean & Jerk', 'Clean Pull', 'Front Squat', 'Push Press', 'Tall Clean'],
        Pulls: ['Clean Pull', 'Snatch High Pull', 'Romanian Deadlift', 'Back Squat', 'Pallof Press'],
        Technique: ['Power Snatch', 'Power Clean', 'Jerk Balance', 'Tall Snatch', 'Front Rack Mobility'],
        Power: ['Power Clean', 'Push Jerk', 'Jump Squat', 'Box Jump', 'Med Ball Slam'],
        Acceleration: ['Block Start', 'Sled Sprint', 'Bounds', 'Trap Bar Deadlift', 'Core Brace'],
        'Max Velocity': ['Flying Sprint', 'Wicket Runs', 'A-Skip', 'Nordic Curl', 'Hip Flexor March'],
        Plyometrics: ['Depth Jump', 'Pogo Jump', 'Broad Jump', 'Split Squat Jump', 'Med Ball Throw'],
        Strength: ['Back Squat', 'Romanian Deadlift', 'Bench Press', 'Row', 'Copenhagen Plank'],
        'Tempo Runs': ['Tempo Run Intervals', 'Step-up', 'Push-up', 'Band Row', 'Dead Bug'],
        Mobility: ['Tempo Bike', 'Cossack Squat', 'Thoracic Rotation', 'Hip Airplane', 'Breathing Drill'],
        'Full Body A': ['Goblet Squat', 'Bench Press', 'Cable Row', 'Romanian Deadlift', 'Farmer Carry'],
        Conditioning: ['Bike Intervals', 'Kettlebell Swing', 'Push-up', 'Sled Push', 'Side Plank'],
        'Full Body B': ['Trap Bar Deadlift', 'Incline Press', 'Lat Pulldown', 'Split Squat', 'Cable Chop'],
        Zone2: ['Incline Walk', 'Goblet Squat', 'TRX Row', 'Step-up', 'Breathing Reset'],
        'Metabolic A': ['Kettlebell Swing', 'Goblet Squat', 'Push Press', 'Renegade Row', 'Bike Sprint'],
        Intervals: ['Rower Sprint', 'Walking Lunge', 'Push-up', 'Battle Rope', 'Plank'],
        'Metabolic B': ['Sled Push', 'Dumbbell Thruster', 'Pull-down', 'Step-up', 'Dead Bug'],
        'Upper Circuit': ['Incline Push-up', 'Cable Row', 'Lateral Raise', 'Rope Pressdown', 'Hammer Curl'],
        'Lower Circuit': ['Leg Press', 'Hip Thrust', 'Hamstring Curl', 'Walking Lunge', 'Calf Raise']
      };
      const names = rowsByFocus[focus] || rowsByFocus['Full Body A'];
      return names.map((name, index) => {
        const main = index === 0;
        const scheme = S(main);
        return {
          label: String.fromCharCode(65 + index),
          name,
          setsReps: scheme.setsReps,
          intensity: main ? mainIntensity : secondaryIntensity,
          tempo: scheme.tempo,
          rest: scheme.rest,
          main
        };
      });
    };

    const generateProProgram = () => {
      const weeks = proConfig.durationWeeks || 4;
      const schedule = selectedSchedule || proSchedules[0];
      const programWeeks = Array.from({ length: weeks }, (_, index) => {
        const weekNumber = index + 1;
        const phase = getPhaseForWeek(weekNumber, weeks);
        const intensity = getWeekIntensity(weekNumber, weeks, proConfig.overloadCurve, phase);
        return {
          weekNumber,
          phase,
          intensity,
          isDeload: phase === 'Deload' || intensity <= 64,
          days: schedule.days.map((day, dayIndex) => {
            const focus = getDayFocus(proConfig.sport, dayIndex);
            return {
              day,
              focus,
              intensity,
              exercises: getProgramExercises(proConfig.sport, focus, phase, intensity)
            };
          })
        };
      });

      const generated = {
        sport: selectedSport?.label || 'ForgeAI Pro',
        schedule,
        durationWeeks: weeks,
        overload: selectedCurve?.label || 'Progressive Loading',
        totalSessions: schedule.days.length * weeks,
        targets: getProTargets(),
        phases: getProPhases(weeks),
        weeks: programWeeks
      };

      setProGeneratedProgram(generated);
      setExpandedWeek(1);
      setExpandedDay('1-0');
      setProStep(8);
    };

    const resetProFlow = () => {
      setProStep(1);
      setProGeneratedProgram(null);
      setExpandedWeek(null);
      setExpandedDay(null);
      setProConfig({
        sport: null,
        schedule: null,
        durationWeeks: null,
        overloadCurve: null,
        goals: {
          squat: { current: '', target: null },
          bench: { current: '', target: null },
          deadlift: { current: '', target: null }
        }
      });
    };

    const canContinue = () => {
      if (proStep === 1) return !!proConfig.sport;
      if (proStep === 2) return !!proConfig.schedule;
      if (proStep === 3) return !!proConfig.durationWeeks;
      if (proStep === 4) return !!proConfig.overloadCurve;
      if (proStep === 5) return Object.values(proConfig.goals).every(goal => Number(goal.current) > 0);
      return true;
    };

    const nextProStep = () => {
      if (!canContinue()) return;
      if (proStep === 6) {
        if (proUnlocked) generateProProgram();
        else setProStep(7);
        return;
      }
      setProStep(step => Math.min(step + 1, 6));
    };

    const previousProStep = () => {
      if (proStep === 7) setProStep(6);
      else setProStep(step => Math.max(1, step - 1));
    };

    const updateGoalCurrent = (key, value) => {
      const cleanedValue = String(value || '').replace(/[^\d.]/g, '');
      setProConfig(config => ({
        ...config,
        goals: {
          ...config.goals,
          [key]: { ...config.goals[key], current: cleanedValue }
        }
      }));
    };

    const OptionCard = ({ selected, icon: Icon, title, subtitle, onClick, children }) => (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={`group min-h-[148px] rounded-[1.65rem] border p-4 text-left transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${
          selected
            ? 'selected-glow border-amber-200/45 bg-amber-200/[0.08] shadow-[0_24px_70px_rgba(245,158,11,0.13)]'
            : 'border-white/[0.08] bg-white/[0.035] hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.06]'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className={`grid h-11 w-11 place-items-center rounded-2xl border ${selected ? 'border-amber-200/35 bg-amber-200/[0.14] text-amber-100' : 'border-white/[0.08] bg-black/20 text-zinc-400'}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className={`grid h-6 w-6 place-items-center rounded-full border text-[0.65rem] ${selected ? 'border-amber-200/50 bg-amber-100 text-zinc-950' : 'border-white/[0.08] text-zinc-600'}`}>
            {selected ? '✓' : ''}
          </div>
        </div>
        <div className="mt-5 text-lg font-black tracking-[-0.045em] text-white">{title}</div>
        <p className="mt-2 text-xs leading-5 text-zinc-400">{subtitle}</p>
        {children}
      </button>
    );

    const ProStepper = () => (
      <div className="overflow-hidden rounded-[1.45rem] border border-white/[0.07] bg-black/25 p-3 backdrop-blur">
        <div className="grid grid-cols-6 gap-2">
          {proStepLabels.map((label, index) => {
            const stepNumber = index + 1;
            const complete = proStep > stepNumber;
            const current = proStep === stepNumber;
            return (
              <div key={label} className="min-w-0 text-center">
                <div className={`mx-auto grid h-8 w-8 place-items-center rounded-full border text-xs font-black transition ${
                  complete ? 'border-emerald-300/40 bg-emerald-300/15 text-emerald-200' :
                  current ? 'border-amber-200/50 bg-amber-100 text-zinc-950 shadow-[0_0_30px_rgba(245,158,11,0.28)]' :
                  'border-white/[0.08] bg-white/[0.03] text-zinc-600'
                }`}>
                  {complete ? '✓' : stepNumber}
                </div>
                <div className={`mt-2 truncate text-[0.58rem] font-bold uppercase tracking-[0.14em] ${current ? 'text-amber-100' : 'text-zinc-600'}`}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>
    );

    const ProStickyActions = ({ primary = 'Next', onPrimary = nextProStep, disabled = !canContinue(), showBack = proStep > 1 }) => (
      <div className="sticky bottom-28 z-20 mt-6 rounded-[1.7rem] border border-white/[0.08] bg-zinc-950/82 p-2 shadow-[0_-18px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="grid grid-cols-[0.8fr_1.2fr] gap-2">
          <button
            type="button"
            onClick={previousProStep}
            disabled={!showBack}
            className="rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-4 text-sm font-black text-zinc-300 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-35 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onPrimary}
            disabled={disabled}
            className="rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 px-5 py-4 text-sm font-black text-zinc-950 shadow-[0_18px_60px_rgba(245,158,11,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
          >
            {primary}
          </button>
        </div>
      </div>
    );

    const ProGoalTargets = () => {
      const targets = getProTargets();
      const labels = { squat: 'Back Squat 1RM', bench: 'Bench Press 1RM', deadlift: 'Deadlift 1RM' };
      return (
        <div className="space-y-4">
          {Object.entries(labels).map(([key, label]) => {
            const hasCurrentMax = Number(targets[key].current) > 0;
            return (
            <section
              key={key}
              className="premium-card space-y-4 rounded-[2rem] border border-white/[0.075] bg-white/[0.026] p-5 shadow-[0_16px_60px_rgba(0,0,0,0.20)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-white/16 md:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</div>
                  <div className="mt-2 flex items-end gap-3">
                    <span className="text-3xl font-black tracking-[-0.06em] text-white">{hasCurrentMax ? `${targets[key].current} kg` : '-- kg'}</span>
                    <ChevronRight className="mb-2 h-5 w-5 text-zinc-600" />
                    <span className="text-3xl font-black tracking-[-0.06em] text-emerald-200">{hasCurrentMax ? `${targets[key].target} kg` : '-- kg'}</span>
                  </div>
                </div>
                <div className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-1 text-xs font-black text-emerald-200">+{targets[key].projection}%</div>
              </div>
              <label className="block">
                <span className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-zinc-500">Current max</span>
                <input
                  type="text"
                  inputMode="decimal"
                  min="0"
                  placeholder="Enter kg"
                  value={proConfig.goals[key].current}
                  onChange={(event) => updateGoalCurrent(key, event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-base font-bold text-white caret-amber-200 outline-none transition placeholder:text-zinc-600 focus:border-amber-200/50 focus:ring-2 focus:ring-amber-200/20"
                  aria-label={`${label} current max`}
                  autoComplete="off"
                />
              </label>
            </section>
            );
          })}
        </div>
      );
    };

    const ProSummary = () => {
      const phases = getProPhases();
      const totalSessions = (selectedSchedule?.days.length || 0) * (proConfig.durationWeeks || 0);
      const rows = [
        ['Sport', selectedSport?.label, Dumbbell],
        ['Schedule', selectedSchedule?.days.join(' / '), Clock],
        ['Duration', `${proConfig.durationWeeks} Weeks`, CalendarIcon],
        ['Overload', selectedCurve?.label, BarChart3],
        ['Total Sessions', `${totalSessions} workouts`, ClipboardList],
        ['Phases', phases.join(' → '), Layers]
      ];
      return (
        <div className="space-y-4">
          <PremiumCard variant="hero">
            <div className="text-[0.64rem] font-bold uppercase tracking-[0.24em] text-amber-100/60">Program Summary</div>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.065em] text-white">{selectedSport?.label} Block</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">ForgeAI will generate a phase-based program with sport-specific days, progression logic, and goal targets.</p>
          </PremiumCard>
          <div className="space-y-3">
            {rows.map(([label, value, Icon]) => (
              <div key={label} className="flex items-center gap-4 rounded-[1.35rem] border border-white/[0.07] bg-white/[0.035] p-4">
                <IconBubble icon={Icon} />
                <div className="min-w-0 flex-1">
                  <div className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-zinc-500">{label}</div>
                  <div className="mt-1 truncate text-sm font-bold text-white">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };

    const ProPaywall = () => {
      const totalSessions = (selectedSchedule?.days.length || 0) * (proConfig.durationWeeks || 0);
      const features = ['Phase-based periodization', 'Progressive overload logic', 'Sport-specific exercise selection', 'Tempo & rest prescriptions per phase', 'Auto-calculated deload weeks', 'Realistic goal projections', 'Weekly structured workouts'];
      const proReward = getProPurchaseReward(proConfig.durationWeeks || 4, userProgress);
      return (
        <div className="space-y-5">
          <PremiumCard variant="hero" className="relative overflow-hidden">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-300/15 blur-3xl" />
            <div className="relative">
              <div className="inline-flex rounded-full border border-amber-100/20 bg-amber-100/[0.08] px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.22em] text-amber-100">PRO Program</div>
              <h2 className="mt-5 text-4xl font-black tracking-[-0.065em] text-white">ForgeAI PRO Program</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">Your fully periodized {proConfig.durationWeeks} Weeks {selectedSport?.label} program with {totalSessions} sessions is ready to generate.</p>
              <div className="mt-6 space-y-3">
                {features.map(feature => (
                  <div key={feature} className="flex items-center gap-3 text-sm font-semibold text-zinc-200">
                    <CheckCircle2 className="h-5 w-5 text-emerald-200" />
                    {feature}
                  </div>
                ))}
              </div>
              <div className="mt-7 rounded-[1.4rem] border border-white/[0.08] bg-black/28 p-5">
                <div className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-zinc-500">One-time unlock</div>
                <div className="mt-2 text-5xl font-black tracking-[-0.07em] text-white">€14.99</div>
              </div>
              <div className="mt-4 rounded-[1.4rem] border border-amber-100/12 bg-amber-100/[0.055] p-4">
                <div className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-amber-100/60">PRO XP Reward</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-3">
                    <div className="text-lg font-black text-white">+{proReward.xp}</div>
                    <div className="text-[0.55rem] font-bold uppercase tracking-[0.14em] text-zinc-500">XP</div>
                  </div>
                  <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-3">
                    <div className="text-lg font-black text-white">x{proReward.multiplier.toFixed(2)}</div>
                    <div className="text-[0.55rem] font-bold uppercase tracking-[0.14em] text-zinc-500">Multiplier</div>
                  </div>
                </div>
              </div>
            </div>
          </PremiumCard>
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => {
                const weeks = proConfig.durationWeeks || 4;
                const actionId = `pro-unlock-${Date.now()}-${weeks}`;
                setProUnlocked(true);
                awardProPurchaseReward(weeks, actionId);
                generateProProgram();
              }}
              className="rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 px-6 py-4 text-sm font-black text-zinc-950 shadow-[0_18px_70px_rgba(245,158,11,0.28)] transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              Unlock & Generate Program
            </button>
            <button
              type="button"
              onClick={() => setProStep(6)}
              className="rounded-full border border-white/[0.08] bg-white/[0.04] px-6 py-4 text-sm font-black text-zinc-300 transition hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    };

    const phaseTone = (phase) => {
      if (phase === 'Deload') return 'border-sky-300/20 bg-sky-300/[0.08] text-sky-200';
      if (phase === 'Peaking') return 'border-amber-200/25 bg-amber-200/[0.08] text-amber-100';
      if (phase === 'Strength' || phase === 'Intensification') return 'border-orange-300/20 bg-orange-300/[0.08] text-orange-100';
      if (phase === 'Hypertrophy' || phase === 'Accumulation') return 'border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-200';
      return 'border-violet-300/20 bg-violet-300/[0.08] text-violet-200';
    };

    const createProSessionWorkout = (day, weekNumber) => (
      (day?.exercises || []).map((exercise, index) => ({
        label: exercise.label || String.fromCharCode(65 + index),
        name: exercise.name,
        category: exercise.main ? 'Main Lift' : day.focus,
        muscle: day.focus,
        setsReps: exercise.setsReps,
        tempo: exercise.tempo,
        rest: exercise.rest,
        intensity: exercise.intensity,
        schemeName: `${proGeneratedProgram?.sport || 'PRO'} Week ${weekNumber}`,
        description: `${day.day} - ${day.focus}${exercise.intensity ? ` at ${exercise.intensity}` : ''}`,
        proSession: {
          weekNumber,
          day: day.day,
          focus: day.focus,
          sport: proGeneratedProgram?.sport,
          durationWeeks: proGeneratedProgram?.durationWeeks
        }
      }))
    );

    const startProDayWorkout = (day, weekNumber) => {
      const proSessionWorkout = createProSessionWorkout(day, weekNumber);
      if (!proSessionWorkout.length) return;

      setWorkout(proSessionWorkout);
      setShowWorkout(true);
      setSetLogs(createInitialSetLogs(proSessionWorkout));
      setElapsedSeconds(0);
      setSessionStartTime(Date.now());
      setActiveExerciseIndex(null);
      setShowFinishSummary(false);
      setShowAddExerciseModal(false);
      setIsWorkoutSessionActive(true);
      setIsWorkoutSessionViewActive(true);
    };

    const ProgramExerciseRow = ({ exercise }) => {
      const recommendedLoad = getRecommendedLoadText(exercise.name, exercise.intensity);
      const savedRM = getSavedRM(exercise.name);
      return (
        <div className="rounded-[1.2rem] border border-white/[0.06] bg-black/22 p-3">
          <div className="flex items-start gap-3">
            <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-black ${exercise.main ? 'border-amber-200/45 bg-amber-100 text-zinc-950' : 'border-white/[0.08] bg-white/[0.04] text-zinc-300'}`}>{exercise.label}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-base font-black tracking-[-0.035em] text-white">{exercise.name}</h4>
                {exercise.main && <span className="rounded-full border border-amber-200/20 bg-amber-200/[0.08] px-2 py-0.5 text-[0.58rem] font-black uppercase tracking-[0.16em] text-amber-100">Main</span>}
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                {[
                  ['Sets', exercise.setsReps],
                  ['Load', exercise.intensity],
                  ['Tempo', exercise.tempo],
                  ['Rest', exercise.rest]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/[0.05] bg-white/[0.035] px-2 py-2">
                    <div className="text-[0.52rem] font-bold uppercase tracking-[0.16em] text-zinc-600">{label}</div>
                    <div className="mt-1 text-xs font-black text-zinc-100">{value}</div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => openLoadIntelligence(exercise.name)}
                className="mt-3 w-full rounded-2xl border border-amber-100/[0.08] bg-amber-100/[0.04] px-3 py-2 text-left text-xs font-bold text-zinc-300 transition hover:border-amber-100/18 hover:bg-amber-100/[0.065] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              >
                {recommendedLoad
                  ? `Recommended load: ${recommendedLoad}`
                  : savedRM
                    ? `Saved 1RM: ${savedRM.estimated1RM}${savedRM.unit}`
                    : 'Add 1RM to calculate load'}
              </button>
            </div>
          </div>
        </div>
      );
    };

    const ProgramDayCard = ({ day, weekNumber, dayIndex }) => {
      const id = `${weekNumber}-${dayIndex}`;
      const open = expandedDay === id;
      return (
        <div className="rounded-[1.45rem] border border-white/[0.07] bg-white/[0.035]">
          <button
            type="button"
            onClick={() => setExpandedDay(open ? null : id)}
            className="flex w-full items-center justify-between gap-3 p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            aria-expanded={open}
          >
            <div>
              <div className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-zinc-500">{day.day}</div>
              <div className="mt-1 text-lg font-black tracking-[-0.04em] text-white">{day.focus}</div>
            </div>
            <ChevronRight className={`h-5 w-5 text-zinc-500 transition ${open ? 'rotate-90' : ''}`} />
          </button>
          {open && (
            <div className="space-y-3 border-t border-white/[0.06] p-3">
              {day.exercises.map(exercise => <ProgramExerciseRow key={`${day.day}-${exercise.label}`} exercise={exercise} />)}
              <button
                type="button"
                onClick={() => startProDayWorkout(day, weekNumber)}
                className="group mt-2 inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 px-5 py-4 text-sm font-black text-zinc-950 shadow-[0_18px_70px_rgba(245,158,11,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_90px_rgba(245,158,11,0.30)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Start Workout
                <Timer className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      );
    };

    const ProgramWeekCard = ({ week }) => {
      const open = expandedWeek === week.weekNumber;
      return (
        <PremiumCard variant="secondary" className="p-0">
          <button
            type="button"
            onClick={() => setExpandedWeek(open ? null : week.weekNumber)}
            className="flex w-full items-center justify-between gap-4 p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            aria-expanded={open}
          >
            <div className="flex items-center gap-4">
              <div className={`grid h-12 w-12 place-items-center rounded-2xl border text-sm font-black ${phaseTone(week.phase)}`}>W{week.weekNumber}</div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-black tracking-[-0.045em] text-white">{week.phase}</h3>
                  {week.isDeload && <span className="rounded-full border border-sky-300/20 bg-sky-300/[0.08] px-2 py-0.5 text-[0.58rem] font-black uppercase tracking-[0.16em] text-sky-200">Deload</span>}
                </div>
                <p className="mt-1 text-xs font-semibold text-zinc-500">{week.days.length} sessions</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black tracking-[-0.05em] text-amber-100">{week.intensity}%</div>
              <div className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-zinc-600">Intensity</div>
            </div>
          </button>
          {open && (
            <div className="space-y-3 border-t border-white/[0.06] p-4">
              {week.days.map((day, dayIndex) => (
                <ProgramDayCard key={`${week.weekNumber}-${day.day}`} day={day} weekNumber={week.weekNumber} dayIndex={dayIndex} />
              ))}
            </div>
          )}
        </PremiumCard>
      );
    };

    const ProGeneratedProgram = () => {
      if (!proGeneratedProgram) return null;
      const targetLabels = { squat: 'Back Squat', bench: 'Bench Press', deadlift: 'Deadlift' };
      return (
        <div className="space-y-5">
          <PremiumCard variant="hero" className="relative overflow-hidden">
            <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-amber-300/12 blur-3xl" />
            <div className="relative">
              <div className="inline-flex rounded-full border border-amber-100/20 bg-amber-100/[0.08] px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.22em] text-amber-100">ForgeAI PRO</div>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.065em] text-white">{proGeneratedProgram.sport} — {proGeneratedProgram.durationWeeks} Weeks</h1>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-zinc-300">
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">{proGeneratedProgram.schedule.days.join(' / ')}</span>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">{proGeneratedProgram.overload}</span>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">{proGeneratedProgram.totalSessions} sessions</span>
              </div>
            </div>
          </PremiumCard>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(proGeneratedProgram.targets).map(([key, target]) => (
              <div key={key} className="rounded-[1.35rem] border border-white/[0.07] bg-white/[0.035] p-3 text-center">
                <div className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-zinc-600">{targetLabels[key]}</div>
                <div className="mt-2 text-lg font-black tracking-[-0.04em] text-emerald-200">{target.target} kg</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {proGeneratedProgram.phases.map(phase => (
              <span key={phase} className={`rounded-full border px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.16em] ${phaseTone(phase)}`}>{phase}</span>
            ))}
          </div>
          <div className="space-y-4">
            {proGeneratedProgram.weeks.map(week => <ProgramWeekCard key={week.weekNumber} week={week} />)}
          </div>
          <button
            type="button"
            onClick={resetProFlow}
            className="w-full rounded-full border border-white/[0.08] bg-white/[0.04] px-6 py-4 text-sm font-black text-white transition hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
          >
            Create New Program
          </button>
        </div>
      );
    };

    const ProLanding = () => {
      const valueCards = [
        {
          title: 'Adaptive Progression',
          desc: 'Smart overload curves that evolve across training blocks.',
          icon: TrendingUp
        },
        {
          title: 'Periodized Programs',
          desc: '4-12 week structured programs built around your sport and goals.',
          icon: CalendarIcon
        },
        {
          title: 'Recovery Intelligence',
          desc: 'Smarter deloads and intensity management.',
          icon: Heart
        },
        {
          title: 'Performance Analytics',
          desc: 'Track volume, intensity, and progression trends.',
          icon: BarChart3
        },
        {
          title: 'AI Coaching',
          desc: 'Intelligent recommendations for adjustments and weak points.',
          icon: Brain
        }
      ];

      const unlockItems = [
        '4-12 week periodized programs',
        'Sport-specific program templates',
        'Progressive overload curves',
        'Realistic goal projections',
        'Auto-calculated deload weeks',
        'Weekly structured sessions',
        'Advanced training analytics',
        'AI-assisted coaching recommendations'
      ];

      const startProGenerator = () => {
        setShowProGenerator(true);
      };

      const scrollToUnlock = () => {
        if (typeof document === 'undefined') return;
        document.getElementById('pro-unlock-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };

      const ProProductOrb = () => (
        <div className="relative mx-auto mt-8 aspect-square w-full max-w-[19rem] sm:mt-0">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(253,230,138,0.24),rgba(251,146,60,0.10)_34%,rgba(255,255,255,0.025)_58%,transparent_72%)] blur-xl" />
          <div className="absolute inset-8 rounded-full border border-amber-100/12 bg-white/[0.022] shadow-[inset_0_0_70px_rgba(245,158,11,0.07),0_28px_100px_rgba(0,0,0,0.34)] backdrop-blur-2xl" />
          <div className="orb-ring absolute inset-12 rounded-full border border-amber-100/20" />
          <div className="orb-ring-slow absolute inset-20 rounded-full border border-white/[0.08]" />
          <div className="absolute left-1/2 top-1/2 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-zinc-950/78 shadow-[0_0_70px_rgba(245,158,11,0.16)] backdrop-blur-2xl">
            <div className="text-center">
              <Crown className="mx-auto mb-2 h-7 w-7 text-amber-100" />
              <div className="text-[0.58rem] font-black uppercase tracking-[0.24em] text-zinc-500">PRO System</div>
              <div className="mt-1 text-2xl font-black tracking-[-0.06em] text-white">12w</div>
            </div>
          </div>
          <StatChip label="Program" value="Periodized" className="absolute left-0 top-10 scale-90" />
          <StatChip label="Deload" value="Adaptive" className="absolute bottom-7 right-0 scale-90" />
        </div>
      );

      return (
        <div className="space-y-5 pb-4">
          <PremiumCard variant="hero" className="relative overflow-hidden !p-5 sm:!p-7">
            <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-amber-300/18 blur-3xl" />
            <div className="absolute left-8 top-14 h-28 w-28 rounded-full bg-orange-500/10 blur-3xl" />
            <div className="relative grid gap-3 lg:grid-cols-[1.03fr_0.97fr] lg:items-center">
              <div>
                <div className="mb-7 flex items-center gap-3">
                  {Logo()}
                  <div>
                    <div className="text-base font-semibold tracking-[-0.035em] text-white">ForgeAI</div>
                    <div className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-amber-100/58">PRO Programming</div>
                  </div>
                </div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-100/12 bg-white/[0.035] px-4 py-2 text-xs font-semibold text-zinc-300 shadow-[0_16px_60px_rgba(0,0,0,0.20)] backdrop-blur-xl">
                  <Sparkles className="h-4 w-4 text-amber-100" />
                  Advanced training intelligence
                </div>
                <h1 className="text-5xl font-black leading-[0.9] tracking-[-0.075em] text-white sm:text-6xl">
                  ForgeAI PRO
                </h1>
                <div className="mt-5 h-px w-24 bg-gradient-to-r from-amber-200 via-orange-300 to-transparent" />
                <p className="mt-5 max-w-md text-base font-semibold leading-7 text-zinc-300">
                  Adaptive programming engineered for progression across complete training blocks.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  {[
                    ['Block Length', 'Up to 12w'],
                    ['Deloads', 'Adaptive']
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/[0.07] bg-black/24 px-3 py-3">
                      <div className="text-lg font-black tracking-[-0.04em] text-white">{value}</div>
                      <div className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.16em] text-zinc-500">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-[1.35rem] border border-white/[0.065] bg-black/20 p-3">
                  <div className="mb-2 text-[0.58rem] font-black uppercase tracking-[0.18em] text-amber-100/55">Built For</div>
                  <div className="flex flex-wrap gap-2">
                    {['Bodybuilding', 'Powerlifting', 'Track & Field', 'General Fitness', 'Fat Loss'].map(sport => (
                      <span key={sport} className="rounded-full border border-white/[0.07] bg-white/[0.032] px-3 py-1.5 text-[0.68rem] font-bold text-zinc-300">
                        {sport}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_0.86fr]">
                  <button
                    type="button"
                    onClick={startProGenerator}
                    className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 px-6 py-4 text-sm font-black text-zinc-950 shadow-[0_18px_70px_rgba(245,158,11,0.28)] transition hover:-translate-y-0.5 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    Get Started
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={scrollToUnlock}
                    className="inline-flex w-full items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] px-6 py-4 text-sm font-black text-zinc-200 transition hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                  >
                    View What's Included
                  </button>
                </div>
              </div>
              {ProProductOrb()}
            </div>
          </PremiumCard>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {valueCards.map(({ title, desc, icon: Icon }, index) => (
              <div
                key={title}
                className={`rounded-[1.55rem] border p-4 backdrop-blur-xl transition hover:-translate-y-0.5 ${
                  index === 0
                    ? 'border-amber-100/14 bg-amber-100/[0.055] shadow-[0_20px_70px_rgba(245,158,11,0.10)]'
                    : 'border-white/[0.075] bg-white/[0.032]'
                }`}
              >
                <div className={`grid h-10 w-10 place-items-center rounded-2xl border ${index === 0 ? 'border-amber-100/20 bg-amber-100/[0.10] text-amber-100' : 'border-white/[0.08] bg-black/24 text-zinc-300'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-black tracking-[-0.045em] text-white">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-zinc-400">{desc}</p>
              </div>
            ))}
          </section>

          <PremiumCard id="pro-unlock-section" variant="primary" className="relative overflow-hidden">
            <div className="absolute -right-24 bottom-0 h-48 w-48 rounded-full bg-amber-300/10 blur-3xl" />
            <div className="relative">
              <SectionHeader icon={Crown} eyebrow="What You Unlock" title="ForgeAI PRO" subtitle="Structured training intelligence for serious progression." />
              <div className="mt-5 grid gap-3">
                {unlockItems.map(item => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-black/18 px-4 py-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-200" />
                    <span className="text-sm font-semibold leading-5 text-zinc-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </PremiumCard>

          <PremiumCard variant="secondary" className="relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.13),transparent_48%)]" />
            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-amber-100/70">Locked Preview</div>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.06em] text-white">Program Architecture</h2>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-100/16 bg-amber-100/[0.08] text-amber-100">
                  <LockKeyhole className="h-5 w-5" />
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-black/24 p-4">
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-transparent via-black/10 to-black/55 backdrop-blur-[1.5px]" />
                <div className="relative space-y-4 blur-[0.4px]">
                  <div className="flex flex-wrap gap-2">
                    {['GPP', 'Hypertrophy', 'Strength', 'Peaking', 'Deload'].map(phase => (
                      <span key={phase} className={`rounded-full border px-3 py-1.5 text-[0.58rem] font-black uppercase tracking-[0.14em] ${phaseTone(phase)}`}>{phase}</span>
                    ))}
                  </div>
                  <div className="rounded-[1.35rem] border border-white/[0.07] bg-white/[0.035] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-zinc-500">Week 1</div>
                        <div className="mt-1 text-xl font-black tracking-[-0.045em] text-white">Accumulation</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black tracking-[-0.05em] text-amber-100">72%</div>
                        <div className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-zinc-600">Intensity</div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        ['Volume', '+12%'],
                        ['Sessions', '4'],
                        ['Target', '+5kg']
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-white/[0.06] bg-black/20 px-2 py-3 text-center">
                          <div className="text-sm font-black text-white">{value}</div>
                          <div className="mt-1 text-[0.52rem] font-bold uppercase tracking-[0.14em] text-zinc-600">{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-x-5 bottom-5 z-20 flex items-center justify-center rounded-full border border-amber-100/18 bg-zinc-950/82 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-amber-100 shadow-[0_18px_60px_rgba(0,0,0,0.38)] backdrop-blur-xl">
                  PRO Preview
                </div>
              </div>
            </div>
          </PremiumCard>

          <button
            type="button"
            onClick={startProGenerator}
            className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 px-6 py-4 text-sm font-black text-zinc-950 shadow-[0_18px_70px_rgba(245,158,11,0.24)] transition hover:-translate-y-0.5 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Get Started
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      );
    };

    const renderStep = () => {
      if (proStep === 1) {
        return (
          <>
            <ScreenHeader eyebrow="ForgeAI Pro" title="Choose Your Sport" subtitle="Select the performance system your periodized block should optimize for." icon={Crown} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {proSports.map(sport => (
                <OptionCard
                  key={sport.id}
                  selected={proConfig.sport === sport.id}
                  icon={sport.icon}
                  title={sport.label}
                  subtitle={sport.desc}
                  onClick={() => setProConfig(config => ({ ...config, sport: sport.id }))}
                />
              ))}
            </div>
            <ProStickyActions showBack={false} />
          </>
        );
      }
      if (proStep === 2) {
        return (
          <>
            <ScreenHeader eyebrow="Weekly Schedule" title="Training Rhythm" subtitle="Choose the weekly structure ForgeAI should build around." icon={Clock} />
            <div className="space-y-3">
              {proSchedules.map(schedule => (
                <button
                  key={schedule.id}
                  type="button"
                  onClick={() => setProConfig(config => ({ ...config, schedule: schedule.id }))}
                  aria-pressed={proConfig.schedule === schedule.id}
                  className={`w-full rounded-[1.55rem] border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${proConfig.schedule === schedule.id ? 'selected-glow border-amber-200/45 bg-amber-200/[0.08]' : 'border-white/[0.08] bg-white/[0.035] hover:bg-white/[0.06]'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-black tracking-[-0.045em] text-white">{schedule.label}</div>
                    <div className="text-xs font-bold text-zinc-500">{schedule.days.length} sessions/week</div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {schedule.days.map(day => <span key={day} className="rounded-full border border-white/[0.08] bg-black/24 px-3 py-1.5 text-xs font-bold text-zinc-300">{day}</span>)}
                  </div>
                </button>
              ))}
            </div>
            <ProStickyActions />
          </>
        );
      }
      if (proStep === 3) {
        return (
          <>
            <ScreenHeader eyebrow="Program Duration" title="Pick The Block Length" subtitle="Short blocks move fast. Longer cycles create more room for phases." icon={CalendarIcon} />
            <div className="grid grid-cols-2 gap-3">
              {proDurations.map(duration => (
                <button
                  key={duration.weeks}
                  type="button"
                  onClick={() => setProConfig(config => ({ ...config, durationWeeks: duration.weeks }))}
                  aria-pressed={proConfig.durationWeeks === duration.weeks}
                  className={`rounded-[1.55rem] border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${proConfig.durationWeeks === duration.weeks ? 'selected-glow border-amber-200/45 bg-amber-200/[0.08]' : 'border-white/[0.08] bg-white/[0.035] hover:bg-white/[0.06]'}`}
                >
                  <div className="text-3xl font-black tracking-[-0.06em] text-white">{duration.weeks}</div>
                  <div className="mt-1 text-sm font-black uppercase tracking-[0.16em] text-amber-100/70">Weeks</div>
                  <p className="mt-4 text-xs leading-5 text-zinc-400">{duration.desc}</p>
                </button>
              ))}
            </div>
            <ProStickyActions />
          </>
        );
      }
      if (proStep === 4) {
        return (
          <>
            <ScreenHeader eyebrow="Progressive Overload" title="Choose The Curve" subtitle="ForgeAI will use this loading model to organize intensity across the block." icon={BarChart3} />
            <div className="space-y-3">
              {proCurves.map(curve => (
                <button
                  key={curve.id}
                  type="button"
                  onClick={() => setProConfig(config => ({ ...config, overloadCurve: curve.id }))}
                  aria-pressed={proConfig.overloadCurve === curve.id}
                  className={`w-full rounded-[1.55rem] border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${proConfig.overloadCurve === curve.id ? 'selected-glow border-amber-200/45 bg-amber-200/[0.08]' : 'border-white/[0.08] bg-white/[0.035] hover:bg-white/[0.06]'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-black tracking-[-0.04em] text-white">{curve.label}</div>
                      <p className="mt-2 text-xs leading-5 text-zinc-400">{curve.desc}</p>
                    </div>
                    <div className="flex h-14 items-end gap-1 rounded-2xl border border-white/[0.06] bg-black/22 px-3 py-2">
                      {curve.bars.map((height, index) => <span key={index} className="w-2 rounded-full bg-gradient-to-t from-amber-500/70 to-amber-100" style={{ height: `${height}%` }} />)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <ProStickyActions />
          </>
        );
      }
      if (proStep === 5) {
        return (
          <>
            <ScreenHeader eyebrow="Goal Targets" title="Realistic Projections" subtitle="Edit your current maxes. ForgeAI recalculates targets from sport, duration and overload." icon={Target} />
            {ProGoalTargets()}
            <ProStickyActions />
          </>
        );
      }
      if (proStep === 6) {
        return (
          <>
            <ProSummary />
            <ProStickyActions primary="Generate My Program" />
          </>
        );
      }
      if (proStep === 7) return <ProPaywall />;
      return <ProGeneratedProgram />;
    };

    if (!showProGenerator) return <ProLanding />;

    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => setShowProGenerator(false)}
          className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-zinc-300 transition hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to PRO Overview
        </button>
        {proStep <= 6 && <ProStepper />}
        {renderStep()}
      </div>
    );
  };

  const SettingsRow = ({
    icon: Icon = Settings,
    title,
    subtitle,
    value,
    type = 'link',
    checked = false,
    onClick,
    onToggle,
    options = [],
    selectedValue,
    onSelect
  }) => (
    <div className="rounded-[1.25rem] border border-white/[0.055] bg-black/18 p-1.5">
      <button
        type="button"
        onClick={type === 'toggle' ? onToggle : onClick}
        aria-pressed={type === 'toggle' ? checked : undefined}
        className="flex w-full items-center gap-3 rounded-[1.05rem] px-3 py-3 text-left transition hover:bg-white/[0.035] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/[0.06] bg-white/[0.035] text-amber-100">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black tracking-[-0.02em] text-white">{title}</span>
          {subtitle && <span className="mt-1 block text-xs font-semibold leading-5 text-zinc-500">{subtitle}</span>}
        </span>
        {value && type !== 'toggle' && <span className="shrink-0 text-xs font-bold text-zinc-500">{value}</span>}
        {type === 'toggle' ? (
          <span className={`relative h-7 w-12 shrink-0 rounded-full border transition ${checked ? 'border-amber-200/30 bg-amber-200/22' : 'border-white/[0.08] bg-white/[0.045]'}`}>
            <span className={`absolute top-1 h-5 w-5 rounded-full transition ${checked ? 'left-6 bg-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.28)]' : 'left-1 bg-zinc-500'}`} />
          </span>
        ) : type === 'select' ? null : (
          <ChevronRight className="h-4 w-4 shrink-0 text-zinc-600" />
        )}
      </button>
      {type === 'select' && (
        <div className="grid grid-cols-2 gap-2 px-2 pb-2 pt-1">
          {options.map(option => {
            const label = typeof option === 'string' ? option : option.label;
            const optionValue = typeof option === 'string' ? option : option.value;
            const selected = selectedValue === optionValue;
            return (
              <button
                key={optionValue}
                type="button"
                onClick={() => onSelect?.(optionValue)}
                aria-pressed={selected}
                className={`rounded-2xl border px-3 py-2 text-xs font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${
                  selected
                    ? 'border-amber-200/30 bg-amber-200/[0.12] text-amber-100 shadow-[0_10px_34px_rgba(245,158,11,0.10)]'
                    : 'border-white/[0.055] bg-black/18 text-zinc-500 hover:bg-white/[0.035] hover:text-zinc-300'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const SettingsSection = ({ eyebrow, children }) => (
    <PremiumCard variant="flat" className="space-y-2">
      <div className="px-1 text-[0.6rem] font-black uppercase tracking-[0.22em] text-amber-100/55">{eyebrow}</div>
      {children}
    </PremiumCard>
  );

  const LoadIntelligenceModal = () => {
    const selectedExerciseName = rmCalculator.exerciseName === 'Custom'
      ? rmCalculator.customExerciseName.trim()
      : rmCalculator.exerciseName;
    const repsValue = Number(rmCalculator.reps) || 0;
    const epleyEstimate = estimateOneRepMax(rmCalculator.weight, rmCalculator.reps, 'Epley');
    const brzyckiEstimate = estimateOneRepMax(rmCalculator.weight, rmCalculator.reps, 'Brzycki');
    const activeEstimate = estimateOneRepMax(rmCalculator.weight, rmCalculator.reps, rmCalculator.formula);
    const roundedOneRM = roundLoad(activeEstimate, rmCalculator.unit);
    const canSaveProfile = selectedExerciseName && Number(rmCalculator.weight) > 0 && repsValue > 0;
    const updateCalculator = (key, value) => setRmCalculator(current => ({ ...current, [key]: value }));
    const updateCalculatorUnit = (nextUnit) => {
      const unit = nextUnit === 'lbs' ? 'lbs' : 'kg';
      setRmCalculator(current => {
        if (current.unit === unit) return current;
        return {
          ...current,
          unit,
          weight: current.weight === '' ? '' : convertWeightValue(current.weight, current.unit, unit)
        };
      });
    };
    const handleSaveProfile = () => {
      if (!canSaveProfile) return;
      saveRMProfile(selectedExerciseName, {
        estimated1RM: roundedOneRM,
        unit: rmCalculator.unit,
        sourceWeight: Number(rmCalculator.weight),
        sourceReps: repsValue,
        formula: rmCalculator.formula
      });
    };

    return (
      <div className="fixed inset-0 z-[70] overflow-y-auto bg-black text-white">
        <Background />
        <div className="relative mx-auto min-h-screen w-full max-w-xl px-4 pb-10 pt-6 sm:px-6">
          <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-white/[0.06] bg-black/72 px-4 pb-4 pt-2 backdrop-blur-2xl sm:-mx-6 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLoadIntelligence(false)}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/[0.08] bg-white/[0.045] text-zinc-200 transition hover:bg-white/[0.075] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                aria-label="Close Load Intelligence"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-4xl font-black tracking-[-0.06em] text-white">Load Intelligence</h1>
                <p className="mt-1 text-sm font-semibold text-zinc-500">Estimate 1RM and training percentages.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <section className="premium-card rounded-[2rem] border border-amber-100/12 bg-[linear-gradient(145deg,rgba(251,191,36,0.075),rgba(255,255,255,0.025))] p-5 shadow-[0_30px_110px_rgba(245,158,11,0.10)] backdrop-blur-2xl">
              <div className="flex items-start gap-3">
                <IconBubble icon={Gauge} />
                <div>
                  <div className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-amber-100/62">RM Calculator</div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">Load guidance is an estimate. Adjust based on readiness and technique.</p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/[0.07] bg-white/[0.03] p-5 backdrop-blur-2xl">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-500">Exercise</span>
                  <select
                    value={rmCalculator.exerciseName}
                    onChange={(event) => updateCalculator('exerciseName', event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-zinc-950 px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-amber-200/50 focus:ring-2 focus:ring-amber-200/20"
                    aria-label="Exercise selector"
                  >
                    {rmExerciseOptions.map(option => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>

                {rmCalculator.exerciseName === 'Custom' && (
                  <label className="block">
                    <span className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-500">Custom Exercise</span>
                    <input
                      type="text"
                      value={rmCalculator.customExerciseName}
                      onChange={(event) => updateCalculator('customExerciseName', event.target.value)}
                      placeholder="Exercise name"
                      className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-sm font-bold text-white caret-amber-200 outline-none transition placeholder:text-zinc-600 focus:border-amber-200/50 focus:ring-2 focus:ring-amber-200/20"
                      aria-label="Custom exercise name"
                    />
                  </label>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-500">Weight Lifted</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step={rmCalculator.unit === 'kg' ? '2.5' : '5'}
                      value={rmCalculator.weight}
                      onChange={(event) => updateCalculator('weight', event.target.value)}
                      placeholder="120"
                      className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-lg font-black text-white caret-amber-200 outline-none transition placeholder:text-zinc-700 focus:border-amber-200/50 focus:ring-2 focus:ring-amber-200/20"
                      aria-label="Weight lifted"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-500">Reps</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      max="20"
                      step="1"
                      value={rmCalculator.reps}
                      onChange={(event) => updateCalculator('reps', event.target.value)}
                      placeholder="5"
                      className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-lg font-black text-white caret-amber-200 outline-none transition placeholder:text-zinc-700 focus:border-amber-200/50 focus:ring-2 focus:ring-amber-200/20"
                      aria-label="Reps performed"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[1.25rem] border border-white/[0.06] bg-black/22 p-2">
                    <div className="mb-2 px-2 text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Unit</div>
                    <div className="grid grid-cols-2 gap-1">
                      {['kg', 'lbs'].map(unit => (
                        <button
                          key={unit}
                          type="button"
                          onClick={() => updateCalculatorUnit(unit)}
                          aria-pressed={rmCalculator.unit === unit}
                          className={`rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${rmCalculator.unit === unit ? 'bg-amber-100 text-zinc-950' : 'text-zinc-500 hover:bg-white/[0.045] hover:text-zinc-200'}`}
                        >
                          {unit}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/[0.06] bg-black/22 p-2">
                    <div className="mb-2 px-2 text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">Formula</div>
                    <div className="grid grid-cols-2 gap-1">
                      {['Epley', 'Brzycki'].map(formula => (
                        <button
                          key={formula}
                          type="button"
                          onClick={() => updateCalculator('formula', formula)}
                          aria-pressed={rmCalculator.formula === formula}
                          className={`rounded-full px-3 py-2 text-xs font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${rmCalculator.formula === formula ? 'bg-amber-100 text-zinc-950' : 'text-zinc-500 hover:bg-white/[0.045] hover:text-zinc-200'}`}
                        >
                          {formula}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {repsValue > 10 && (
                  <div className="rounded-2xl border border-amber-100/12 bg-amber-100/[0.055] p-3 text-xs font-semibold leading-5 text-amber-100/85">
                    Higher-rep estimates are less precise. Use 1-8 reps for best accuracy.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/[0.07] bg-white/[0.03] p-5 backdrop-blur-2xl">
              <div className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-zinc-500">Estimated 1RM</div>
              <div className="mt-2 flex items-end justify-between gap-3">
                <div>
                  <div className="text-5xl font-black tracking-[-0.07em] text-white">{roundedOneRM ? `${roundedOneRM}${rmCalculator.unit}` : '--'}</div>
                  <div className="mt-2 text-xs font-bold text-zinc-500">Displayed with {rmCalculator.formula}. Epley: {epleyEstimate ? `${roundLoad(epleyEstimate, rmCalculator.unit)}${rmCalculator.unit}` : '--'} / Brzycki: {brzyckiEstimate ? `${roundLoad(brzyckiEstimate, rmCalculator.unit)}${rmCalculator.unit}` : '--'}</div>
                </div>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={!canSaveProfile}
                  className="rounded-full bg-gradient-to-r from-amber-200 via-orange-300 to-orange-400 px-4 py-3 text-xs font-black text-zinc-950 shadow-[0_18px_60px_rgba(245,158,11,0.22)] transition disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                >
                  Save Load Profile
                </button>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/[0.07] bg-white/[0.03] p-5 backdrop-blur-2xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-zinc-500">Training Loads</div>
                  <h2 className="mt-1 text-xl font-black tracking-[-0.04em] text-white">Percentage table</h2>
                </div>
                <BarChart3 className="h-5 w-5 text-amber-100" />
              </div>
              <div className="space-y-2">
                {loadPercentages.map(percent => (
                  <div key={percent} className="grid grid-cols-[3.5rem_5rem_1fr] items-center gap-3 rounded-2xl border border-white/[0.055] bg-black/22 px-3 py-3">
                    <div className="text-sm font-black text-amber-100">{percent}%</div>
                    <div className="text-sm font-black text-white">{roundedOneRM ? `${calculateLoadFromPercent(roundedOneRM, percent, rmCalculator.unit)}${rmCalculator.unit}` : '--'}</div>
                    <div className="text-xs font-semibold text-zinc-500">{loadUsageLabel(percent)}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  };

  const SettingsScreen = () => {
    const openPlaceholder = (title) => setSettingsPlaceholder(title);
    const weightDirection = getWeightGoalDirection(userSettings);
    const weightDifference = Number(((Number(userSettings.targetWeight) || 0) - (Number(userSettings.currentWeight) || 0)).toFixed(1));
    const weightDifferenceText = weightDirection === 'gain'
      ? `+${Math.abs(weightDifference)} ${userSettings.weightUnit} target`
      : weightDirection === 'lose'
        ? `-${Math.abs(weightDifference)} ${userSettings.weightUnit} target`
        : 'Maintain current bodyweight';
    const weightPhaseLabel = weightDirection === 'gain'
      ? 'Lean gain phase'
      : weightDirection === 'lose'
        ? 'Body composition phase'
        : 'Maintenance phase';
    const adjustWeightGoal = (key, amount) => {
      updateWeightGoalValue(key, Math.max(0, (Number(userSettings[key]) || 0) + amount));
    };
    const currentLabels = {
      goal: label.goal[settings.goal],
      experience: label.experience[settings.experience],
      equipment: label.equipment[settings.equipment],
      focus: label.focus[settings.focus],
      duration: settings.duration,
      workoutStyle: label.workoutStyle[settings.workoutStyle],
      conditioningType: label.conditioningType[settings.conditioningType]
    };
    const sectionRows = [
      {
        eyebrow: 'Account',
        rows: [
          { icon: User, title: 'Edit Profile', subtitle: 'Name, bio and training identity.' },
          { icon: UserCircle, title: 'Avatar', subtitle: 'Profile initials and image.' },
          { icon: User, title: 'Username', value: authUser?.name || 'Martin Jancar' },
          { icon: MessageCircle, title: 'Email', value: authUser?.email || 'Not connected' },
          { icon: Crown, title: 'Subscription Status', value: 'PRO Member' }
        ]
      },
      {
        eyebrow: 'Training Preferences',
        rows: [
          { icon: Target, title: 'Primary Goal', value: currentLabels.goal },
          { icon: User, title: 'Experience Level', value: currentLabels.experience },
          { icon: Clock, title: 'Preferred Session Duration', value: currentLabels.duration },
          { icon: Layers, title: 'Preferred Split', value: currentLabels.focus }
        ]
      },
      {
        eyebrow: 'Units & Equipment',
        rows: [
          { icon: Dumbbell, title: 'Training Location', value: currentLabels.equipment },
          { icon: SlidersHorizontal, title: 'Available Equipment', subtitle: 'Barbells, machines, cables and accessories.' },
          { icon: Activity, title: 'Wearables Integration', subtitle: 'Future native and PWA connection.' }
        ]
      },
      {
        eyebrow: 'AI Coach',
        rows: [
          { icon: Flame, title: 'Motivation Level', value: 'Balanced' },
          { icon: Brain, title: 'Technical Depth', value: 'Advanced' },
          { icon: Waves, title: 'Recovery Sensitivity', value: 'Moderate' },
          { icon: TrendingUp, title: 'Auto Progression', subtitle: 'Future adaptive progression control.' }
        ]
      },
      {
        eyebrow: 'Notifications',
        rows: [
          { icon: Bell, title: 'Recovery Reminder', subtitle: 'Native permission required in a future update.' },
          { icon: Flame, title: 'Streak Reminder' },
          { icon: Trophy, title: 'PR Alerts' },
          { icon: Crown, title: 'PRO Program Alerts' }
        ]
      },
      {
        eyebrow: 'Forge Rewards',
        rows: [
          { icon: Zap, title: 'XP History', subtitle: 'Recent reward events and claim history.' },
          { icon: TrendingUp, title: 'Rank Progression', subtitle: 'Milestones required for each tier.' },
          { icon: Award, title: 'Rewards Claimed' },
          { icon: Share2, title: 'ForgeAI Ambassador', subtitle: 'Creator codes, referral stats and rank-based creator rewards.' },
          { icon: Sparkles, title: 'Airdrop Eligibility', subtitle: 'Future eligibility placeholder only.' }
        ]
      },
      {
        eyebrow: 'Appearance',
        rows: [
          { icon: Palette, title: 'Theme', value: 'Cinematic Dark' },
          { icon: Flame, title: 'Accent Color', value: 'Forge Gold' },
          { icon: Layers, title: 'Card Density', value: 'Premium' },
          { icon: Activity, title: 'Motion Effects', value: userSettings.reduceAnimations ? 'Reduced' : 'Premium' }
        ]
      },
      {
        eyebrow: 'Privacy & Data',
        rows: [
          { icon: Shield, title: 'Export Data', subtitle: 'Download local workout and progress data.' },
          { icon: Info, title: 'Local Storage Status', subtitle: 'Prototype data currently stays on this device.' },
          { icon: Activity, title: 'Analytics Permissions', value: 'Off' },
          { icon: LockKeyhole, title: 'Delete Account', subtitle: 'Backend account deletion will be added later.' }
        ]
      },
      {
        eyebrow: 'About ForgeAI',
        rows: [
          { icon: Info, title: 'App Version', value: 'v45.117' },
          { icon: TrendingUp, title: 'Roadmap' },
          { icon: MessageCircle, title: 'Community' },
          { icon: ClipboardList, title: 'Terms' },
          { icon: Shield, title: 'Privacy Policy' },
          { icon: Send, title: 'Contact' }
        ]
      },
      {
        eyebrow: 'ForgeAI Labs',
        rows: [
          { icon: TestTube, title: 'Adaptive Recovery AI Beta' },
          { icon: Brain, title: 'Voice Coach Beta' },
          { icon: Gauge, title: 'Auto Progression v2' },
          { icon: Sparkles, title: 'Experimental Program Builder' }
        ]
      }
    ];

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black text-white">
        <Background />
        <div className="relative mx-auto min-h-screen w-full max-w-xl px-4 pb-12 pt-6 sm:px-6">
          <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-white/[0.06] bg-black/70 px-4 pb-4 pt-2 backdrop-blur-2xl sm:-mx-6 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSettingsScreen(false)}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/[0.08] bg-white/[0.045] text-zinc-200 transition hover:bg-white/[0.075] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                aria-label="Back to profile"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-4xl font-black tracking-[-0.06em] text-white">Settings</h1>
                <p className="mt-1 text-sm font-semibold text-zinc-500">Athlete control center</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {sectionRows.map(section => (
              section.eyebrow === 'Training Preferences' ? (
                <section key={section.eyebrow} className="premium-card space-y-2 rounded-[2rem] border border-white/[0.055] bg-black/18 p-5 shadow-none backdrop-blur-2xl md:p-6">
                  <div className="px-1 text-[0.6rem] font-black uppercase tracking-[0.22em] text-amber-100/55">{section.eyebrow}</div>
                  {section.rows.map(row => (
                    <SettingsRow
                      key={`${section.eyebrow}-${row.title}`}
                      {...row}
                      onClick={() => openPlaceholder(row.title)}
                    />
                  ))}
                  <SettingsRow
                    icon={Gauge}
                    title="Load Intelligence"
                    subtitle="Estimate your 1RM and training loads."
                    onClick={() => openLoadIntelligence()}
                  />
                  <div className="rounded-[1.55rem] border border-white/[0.06] bg-white/[0.028] p-4 shadow-[0_18px_70px_rgba(0,0,0,0.18)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-amber-100/62">Weight Goal System</div>
                        <h3 className="mt-1 text-lg font-black tracking-[-0.04em] text-white">Weight Goals</h3>
                        <p className="mt-1 text-xs leading-5 text-zinc-500">Used for adaptive nutrition and workout recommendations.</p>
                      </div>
                      <div className="flex rounded-full border border-white/[0.07] bg-black/28 p-1">
                        {['kg', 'lbs'].map(unit => (
                          <button
                            key={unit}
                            type="button"
                            onClick={() => updateWeightUnit(unit)}
                            aria-pressed={userSettings.weightUnit === unit}
                            className={`rounded-full px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.14em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${
                              userSettings.weightUnit === unit ? 'bg-amber-100 text-zinc-950 shadow-[0_10px_30px_rgba(245,158,11,0.18)]' : 'text-zinc-500 hover:text-zinc-200'
                            }`}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {[
                        ['currentWeight', 'Current Weight'],
                        ['targetWeight', 'Target Weight']
                      ].map(([key, title]) => (
                        <label key={key} className="rounded-[1.25rem] border border-white/[0.055] bg-black/24 p-3">
                          <span className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-zinc-500">{title}</span>
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => adjustWeightGoal(key, -0.5)}
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/[0.07] bg-white/[0.035] text-base font-black text-zinc-300 transition hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                              aria-label={`Decrease ${title.toLowerCase()}`}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              inputMode="decimal"
                              min="0"
                              step="0.1"
                              value={userSettings[key]}
                              onChange={(event) => updateWeightGoalValue(key, event.target.value)}
                              className="min-w-0 flex-1 bg-transparent text-center text-2xl font-black tracking-[-0.05em] text-white caret-amber-200 outline-none placeholder:text-zinc-700"
                              aria-label={title}
                            />
                            <button
                              type="button"
                              onClick={() => adjustWeightGoal(key, 0.5)}
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/[0.07] bg-white/[0.035] text-base font-black text-zinc-300 transition hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                              aria-label={`Increase ${title.toLowerCase()}`}
                            >
                              +
                            </button>
                          </div>
                          <div className="mt-1 text-center text-[0.62rem] font-black uppercase tracking-[0.14em] text-zinc-600">{userSettings.weightUnit}</div>
                        </label>
                      ))}
                    </div>

                    <div className="mt-4 rounded-[1.25rem] border border-amber-100/[0.08] bg-amber-100/[0.04] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-amber-100/58">{weightPhaseLabel}</div>
                          <div className="mt-1 text-sm font-black text-white">{weightDifferenceText}</div>
                        </div>
                        <div className="rounded-full border border-amber-100/16 bg-black/24 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-amber-100">
                          {weightDirection}
                        </div>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                        <div
                          className={`h-full rounded-full ${weightDirection === 'lose' ? 'bg-gradient-to-r from-emerald-300 to-lime-200' : weightDirection === 'gain' ? 'bg-gradient-to-r from-amber-300 to-orange-400' : 'bg-gradient-to-r from-zinc-400 to-white'}`}
                          style={{ width: weightDirection === 'maintain' ? '50%' : '72%' }}
                        />
                      </div>
                      {/* Future backend/AI integration: weight goals can influence calorie targets, protein targets, meal recommendations, workout volume, conditioning emphasis, recovery guidance, body composition phase, and AI coaching responses. */}
                    </div>
                  </div>
                </section>
              ) : (
              <SettingsSection key={section.eyebrow} eyebrow={section.eyebrow}>
                {section.eyebrow === 'Units & Equipment' && (
                  <SettingsRow
                    icon={Dumbbell}
                    title="Units"
                    subtitle="Choose how weights appear across ForgeAI."
                    type="select"
                    options={[{ label: 'KG', value: 'kg' }, { label: 'LBS', value: 'lbs' }]}
                    selectedValue={userSettings.units}
                    onSelect={(value) => updateUserSetting('units', value)}
                  />
                )}
                {section.eyebrow === 'AI Coach' && (
                  <SettingsRow
                    icon={Brain}
                    title="Coaching Tone"
                    subtitle="Controls the style used by future AI Coach responses."
                    type="select"
                    options={['Tactical', 'Scientific', 'Motivational', 'Minimalist']}
                    selectedValue={userSettings.coachingTone}
                    onSelect={(value) => updateUserSetting('coachingTone', value)}
                  />
                )}
                {section.eyebrow === 'Notifications' && (
                  <>
                    <SettingsRow
                      icon={Bell}
                      title="Daily Claim Reminder"
                      subtitle="Notifications require native/PWA permissions later."
                      type="toggle"
                      checked={userSettings.dailyClaimReminder}
                      onToggle={() => updateUserSetting('dailyClaimReminder', !userSettings.dailyClaimReminder)}
                    />
                    <SettingsRow
                      icon={Clock}
                      title="Workout Reminder"
                      subtitle="A future reminder for planned training days."
                      type="toggle"
                      checked={userSettings.workoutReminder}
                      onToggle={() => updateUserSetting('workoutReminder', !userSettings.workoutReminder)}
                    />
                  </>
                )}
                {section.eyebrow === 'Appearance' && (
                  <SettingsRow
                    icon={Gauge}
                    title="Reduce Animations"
                    subtitle="Keeps motion calmer across the app."
                    type="toggle"
                    checked={userSettings.reduceAnimations}
                    onToggle={() => updateUserSetting('reduceAnimations', !userSettings.reduceAnimations)}
                  />
                )}
                {section.rows.map(row => (
                  <SettingsRow
                    key={`${section.eyebrow}-${row.title}`}
                    {...row}
                    onClick={() => openPlaceholder(row.title)}
                  />
                ))}
                {section.eyebrow === 'Account' && (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="mt-2 flex w-full items-center gap-3 rounded-[1.25rem] border border-red-300/12 bg-red-500/[0.045] p-4 text-left transition hover:bg-red-500/[0.075] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-red-200/12 bg-black/24 text-red-200">
                      <ArrowLeft className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-black tracking-[-0.02em] text-red-100">Sign Out</span>
                      <span className="mt-1 block text-xs font-semibold leading-5 text-red-100/48">Returns to signup. Logs and progress stay on this device.</span>
                    </span>
                  </button>
                )}
              </SettingsSection>
              )
            ))}
          </div>
        </div>

        {settingsPlaceholder && (
          <div className="fixed inset-0 z-[60] grid place-items-center bg-black/72 p-4 backdrop-blur-xl">
            <div className="w-full max-w-sm rounded-[2rem] border border-white/[0.08] bg-zinc-950/95 p-6 shadow-[0_34px_140px_rgba(0,0,0,0.62)]">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-amber-100/58">Setting</div>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.055em] text-white">{settingsPlaceholder}</h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">This setting will be configurable in a future update.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsPlaceholder(null)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04] text-zinc-300 transition hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                  aria-label="Close setting details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setSettingsPlaceholder(null)}
                className="w-full rounded-full bg-amber-100 px-5 py-3 text-sm font-black text-zinc-950 transition hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const YouTab = () => {
    const progress = normalizeUserProgress(userProgress || createBaseUserProgress());
    const rankStatus = getRankStatus(progress, workoutLogs);
    const currentTier = rankStatus.achievedTier;
    const targetTier = rankStatus.targetTier || currentTier;
    const pendingPromotion = !!rankStatus.pendingTier;
    const multiplier = getXpMultiplier(progress);
    const multiplierLabel = getMultiplierLabel(progress);
    const weeklySessions = getWeeklySessions(workoutLogs);
    const lifetimeVolume = getLifetimeVolume(workoutLogs);
    const prCount = workoutLogs.reduce((total, log) => total + getLogRecords(log).length, 0);
    const claimedToday = !canClaimDaily(progress);
    const claimXp = Math.round(50 * multiplier);
    const records = getDynamicPersonalRecords(workoutLogs);
    const unlockedRewards = getTierRewards(currentTier.name);
    const nextRewards = getTierRewards(targetTier.name);
    const currentRankTheme = getRankTheme(currentTier.name);
    const creatorProfile = normalizeAmbassadorState(ambassadorState || createBaseAmbassadorState());
    const ambassadorTier = getAmbassadorTier(currentTier.name);
    const nextAmbassadorTier = getNextAmbassadorTier(currentTier.name);
    const creatorRevenueEligible = ambassadorTier.revenueShare > 0;
    const ambassadorRankIndex = Math.max(0, rankTiers.findIndex(tier => tier.name === currentTier.name));
    const ambassadorPath = rankTiers
      .slice(ambassadorRankIndex, Math.min(rankTiers.length, Math.max(ambassadorRankIndex + 4, 6)))
      .map(tier => tier.name);
    const referralProXpByWeeks = { 4: 300, 6: 400, 8: 500, 12: 700 };
    const referralSignupXp = 50;

    const achievementCards = rankTiers.slice(1).map(tier => ({
      ...tier,
      theme: getRankTheme(tier.name),
      current: currentTier.name === tier.name,
      requirements: getRankMilestones(tier.name, progress, workoutLogs),
      achieved: rankTiers.findIndex(item => item.name === currentTier.name) >= rankTiers.findIndex(item => item.name === tier.name)
    }));

    const copyCreatorCode = async () => {
      if (!creatorProfile.creatorCode) return;

      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(creatorProfile.creatorCode);
          setAmbassadorMessage('Creator code copied.');
          return;
        }
        setAmbassadorMessage(`Creator code: ${creatorProfile.creatorCode}`);
      } catch (error) {
        setAmbassadorMessage(`Creator code: ${creatorProfile.creatorCode}`);
      }
    };

    const generateCreatorCode = () => {
      if (creatorProfile.creatorCode) return;

      const nextCode = createCreatorCode(authUser?.name);
      updateAmbassadorState(current => ({
        ...current,
        creatorCode: nextCode,
        createdAt: current.createdAt || new Date().toISOString(),
        revenueShareEligible: creatorRevenueEligible
      }));
      setAmbassadorMessage(`${nextCode} is ready to share. No XP is awarded for generating a code.`);
    };

    const shareCreatorCode = async () => {
      if (!creatorProfile.creatorCode) return;

      const shareText = `Train with ForgeAI. Use my code ${creatorProfile.creatorCode} for ${ambassadorTier.discount}% off PRO, AI Coach, and Store unlocks.`;
      try {
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({ title: 'ForgeAI Creator Code', text: shareText });
          setAmbassadorMessage('Creator code shared.');
        } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(shareText);
          setAmbassadorMessage('Creator code copied.');
        } else {
          setAmbassadorMessage(shareText);
        }
        updateAmbassadorState(current => ({ ...current, socialShares: current.socialShares + 1 }));
      } catch (error) {
        setAmbassadorMessage('Share cancelled.');
      }
    };

    const simulateAmbassadorReferral = () => {
      const demoUserId = `demo-user-${Date.now()}`;
      updateAmbassadorState(current => {
        if (current.referredUserIds.includes(demoUserId)) return current;
        return {
          ...current,
          referrals: current.referrals + 1,
          referredUserIds: [...current.referredUserIds, demoUserId]
        };
      });
      awardProgress({
        xp: referralSignupXp,
        forgePoints: 0,
        reason: 'Referral Signup',
        actionId: `referral-signup-${demoUserId}`,
        applyMultiplier: false,
        eventType: 'referral_signup'
      });
      setAmbassadorMessage(`Referral Signup +${referralSignupXp} XP`);
    };

    const simulateAmbassadorConversion = (weeks = 8) => {
      const blockWeeks = [4, 6, 8, 12].includes(Number(weeks)) ? Number(weeks) : 8;
      const demoUserId = `demo-pro-user-${Date.now()}`;
      const demoPurchaseId = `demo-pro-purchase-${blockWeeks}-${Date.now()}`;
      const purchaseXp = referralProXpByWeeks[blockWeeks] || 500;
      const estimatedSaleByWeeks = { 4: 14.99, 6: 19.99, 8: 24.99, 12: 34.99 };
      updateAmbassadorState(current => ({
        ...current,
        referredUserIds: current.referredUserIds.includes(demoUserId)
          ? current.referredUserIds
          : [...current.referredUserIds, demoUserId],
        referredPurchaseIds: current.referredPurchaseIds.includes(demoPurchaseId)
          ? current.referredPurchaseIds
          : [...current.referredPurchaseIds, demoPurchaseId],
        referrals: Math.max(current.referrals, current.conversions + 1),
        conversions: current.conversions + 1,
        discountUses: current.discountUses + 1,
        estimatedRevenue: Number((current.estimatedRevenue + (estimatedSaleByWeeks[blockWeeks] || 24.99)).toFixed(2))
      }));
      awardProgress({
        xp: purchaseXp,
        forgePoints: 0,
        reason: `Referral ${blockWeeks} Week PRO Purchase`,
        actionId: `referral-pro-purchase-${demoPurchaseId}`,
        applyMultiplier: false,
        eventType: 'referral_pro_purchase'
      });
      setAmbassadorMessage(`Referral ${blockWeeks} Week PRO Purchase +${purchaseXp} XP`);
    };

    const applyCreatorCode = () => {
      const normalized = String(appliedCreatorCode || '').trim().toUpperCase();
      if (!normalized) {
        setAmbassadorMessage('Enter a creator code first.');
        return;
      }

      saveAppliedCreatorCode(normalized);
      setAmbassadorMessage('Code applied. Discount will activate at checkout when payments are enabled.');
    };

    const DailyClaimCelebrationModal = () => {
      if (!dailyClaimCelebration) return null;
      const celebration = dailyClaimCelebration;

      return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/76 p-4 backdrop-blur-xl">
          <div className="relative w-full max-w-sm overflow-hidden rounded-[2.2rem] border border-amber-100/16 bg-zinc-950/95 p-6 text-center shadow-[0_34px_150px_rgba(245,158,11,0.18)]">
            <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-amber-300/20 blur-3xl" />
            <div className="absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-orange-400/14 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(251,191,36,0.18),transparent_38%)]" />
            <div className="pointer-events-none absolute left-8 top-10 h-1.5 w-1.5 rounded-full bg-amber-100 shadow-[0_0_22px_rgba(253,230,138,0.8)]" />
            <div className="pointer-events-none absolute right-10 top-24 h-1 w-1 rounded-full bg-orange-200 shadow-[0_0_18px_rgba(251,146,60,0.7)]" />
            <div className="pointer-events-none absolute bottom-20 left-12 h-1 w-1 rounded-full bg-amber-200/80 shadow-[0_0_16px_rgba(251,191,36,0.7)]" />

            <div className="relative">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-amber-100/24 bg-gradient-to-br from-amber-200 via-orange-300 to-orange-400 text-zinc-950 shadow-[0_18px_80px_rgba(245,158,11,0.35)]">
                <Zap className="h-9 w-9" />
              </div>
              <div className="mt-5 text-[0.62rem] font-black uppercase tracking-[0.24em] text-amber-100/62">Daily Forge Claim complete.</div>
              <h2 className="mt-2 text-4xl font-black tracking-[-0.06em] text-white">XP Claimed</h2>
              <div className="mt-5 text-6xl font-black leading-none tracking-[-0.075em] text-amber-100 drop-shadow-[0_0_28px_rgba(245,158,11,0.22)]">
                +{celebration.xp} XP
              </div>
              {celebration.forgePoints > 0 && (
                <div className="mt-2 text-sm font-black text-zinc-300">+{celebration.forgePoints} Forge Points</div>
              )}
              <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-zinc-400">Momentum secured. Keep stacking progress.</p>

              <div className="mt-6 grid grid-cols-2 gap-2 text-left">
                <div className="rounded-2xl border border-white/[0.07] bg-black/24 p-4">
                  <div className="text-lg font-black text-white">x{celebration.multiplier.toFixed(2)}</div>
                  <div className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.16em] text-zinc-500">Active Multiplier</div>
                  <div className="mt-1 truncate text-xs font-semibold text-amber-100/70">{celebration.multiplierLabel}</div>
                </div>
                <div className="rounded-2xl border border-white/[0.07] bg-black/24 p-4">
                  <div className="text-lg font-black text-white">{celebration.totalXp} XP</div>
                  <div className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.16em] text-zinc-500">New Total</div>
                  <div className="mt-1 truncate text-xs font-semibold text-amber-100/70">{celebration.rank}</div>
                </div>
              </div>

              <div className="mt-4 rounded-[1.4rem] border border-white/[0.07] bg-black/24 p-4 text-left">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Progress to {celebration.targetRank}</div>
                  <div className="text-xs font-black text-amber-100">{Math.round(celebration.progressPercent)}%</div>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-200 via-orange-300 to-orange-400 shadow-[0_0_24px_rgba(245,158,11,0.34)]"
                    style={{ width: `${celebration.progressPercent}%` }}
                  />
                </div>
                <div className="mt-2 text-xs font-semibold text-zinc-500">{celebration.xpToNext} XP to next rank</div>
              </div>

              <button
                type="button"
                onClick={() => setDailyClaimCelebration(null)}
                className="mt-6 w-full rounded-full bg-amber-100 px-5 py-4 text-sm font-black text-zinc-950 shadow-[0_16px_54px_rgba(245,158,11,0.24)] transition hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      );
    };

    const formatVolume = (value) => {
      const rounded = Math.round(value || 0);
      return rounded >= 1000 ? `${Math.round(rounded / 100) / 10}k kg` : `${rounded} kg`;
    };

    return (
      <div className="space-y-5">
        <PremiumCard variant="hero" className="relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-300/16 blur-3xl" />
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSettingsScreen(true)}
              className="absolute right-0 top-0 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/[0.08] bg-white/[0.045] text-zinc-200 shadow-[0_14px_46px_rgba(0,0,0,0.24)] backdrop-blur-xl transition hover:bg-white/[0.075] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              aria-label="Open Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            <div className="flex items-start gap-4">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-[1.7rem] bg-gradient-to-br from-amber-200 via-orange-300 to-orange-400 text-2xl font-black text-zinc-950 shadow-[0_18px_70px_rgba(245,158,11,0.25)]">MJ</div>
              <div className="min-w-0 flex-1 pr-12">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-amber-100/16 bg-amber-100/[0.08] px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em] text-amber-100">PRO MEMBER</span>
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em] text-zinc-400">Strength Specialist</span>
                </div>
                <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-white">Martin Jancar</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-zinc-400">
                  <span>Level {progress.level}</span>
                  <span className="text-zinc-700">/</span>
                  <span>Forge Rank: <span className="text-amber-100">{currentTier.name}</span></span>
                </div>
              </div>
            </div>
            <div className={`prestige-rank-card relative mt-6 overflow-hidden rounded-[1.65rem] border p-4 transition duration-300 ${currentRankTheme.border} ${currentRankTheme.background} ${currentRankTheme.glow}`}>
              <div className={`prestige-aura pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full ${currentRankTheme.aura} blur-3xl`} />
              <div className="prestige-shimmer pointer-events-none absolute inset-0 opacity-55 [background-image:linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.08)_42%,transparent_64%)]" />
              <div className="relative mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-[1.1rem] border ${currentRankTheme.icon}`}>
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[0.58rem] font-black uppercase tracking-[0.2em] text-white/55">Forge Rank</div>
                      <div className={`mt-1 text-2xl font-black tracking-[-0.055em] min-[390px]:text-3xl ${currentRankTheme.text}`}>{pendingPromotion ? `${rankStatus.pendingTier.name} Pending` : currentTier.name}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm font-bold text-white/72">{progress.xp} XP / {targetTier.xp} XP</div>
                </div>
                <button
                  type="button"
                  disabled={claimedToday}
                  onClick={claimDailyReward}
                  className={`group w-full shrink-0 rounded-[1.35rem] px-7 py-4 text-base font-black leading-tight transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 sm:w-[46%] sm:min-w-[9rem] sm:max-w-[11.5rem] ${
                    claimedToday
                      ? 'border border-white/15 bg-black/28 text-zinc-400'
                      : 'bg-gradient-to-r from-amber-200 via-orange-300 to-orange-400 text-zinc-950 shadow-[0_16px_54px_rgba(245,158,11,0.30)] hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(245,158,11,0.38)]'
                  }`}
                >
                  <span className="block">{claimedToday ? getNextClaimLabel(progress) : 'Claim XP'}</span>
                  {!claimedToday && <span className="mt-1 block text-xl font-black tracking-[-0.04em] opacity-95">+{claimXp} XP</span>}
                </button>
              </div>
              <div className="relative h-3 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${currentRankTheme.accent} shadow-[0_0_24px_rgba(245,158,11,0.26)]`}
                  style={{ width: `${rankStatus.progressPercent}%` }}
                />
              </div>
              <div className="relative mt-3 flex items-center justify-between gap-3">
                <div className="text-xs font-bold text-white/72">Next rank: {targetTier.name}</div>
                <button
                  type="button"
                  onClick={() => setShowXpBoostModal(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/22 px-3 py-1.5 text-[0.68rem] font-black text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                >
                  <Gauge className="h-3.5 w-3.5 text-amber-100" />
                  XP Boost x{multiplier.toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        </PremiumCard>

        <div className="grid grid-cols-2 gap-3">
          <MetricTile icon={Flame} label="Streak" value={`${progress.dailyClaimStreak || 0}d`} />
          <MetricTile icon={Dumbbell} label="This Week" value={`${weeklySessions} sessions`} tone="blue" />
          <MetricTile icon={CalendarIcon} label="Lifetime" value={`${workoutLogs.length} sessions`} tone="green" />
          <MetricTile icon={BarChart3} label="Volume" value={formatVolume(lifetimeVolume)} tone="blue" />
          <MetricTile icon={Trophy} label="PRs" value={prCount} tone="green" />
          <MetricTile icon={Zap} label="Daily Claims" value={progress.totalDailyClaims || 0} />
        </div>

        <PremiumCard variant="secondary">
          <SectionHeader icon={TrendingUp} eyebrow="Promotion Requirements" title={pendingPromotion ? `${rankStatus.pendingTier.name} Pending Promotion` : `Next: ${targetTier.name}`} subtitle="Rank discounts unlock only when XP and milestones are both complete." />
          <div className="space-y-2">
            {getRankMilestones(targetTier.name, progress, workoutLogs).length ? getRankMilestones(targetTier.name, progress, workoutLogs).map(item => (
              <div key={item.label} className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${item.met ? 'border-emerald-200/12 bg-emerald-200/[0.045]' : 'border-white/[0.06] bg-black/18'}`}>
                <span className="text-sm font-bold text-zinc-200">{item.label}</span>
                <span className={`text-xs font-black uppercase tracking-[0.16em] ${item.met ? 'text-emerald-200' : 'text-zinc-600'}`}>{item.met ? 'Done' : 'Needed'}</span>
              </div>
            )) : (
              <div className="rounded-2xl border border-white/[0.06] bg-black/18 px-4 py-3 text-sm font-bold text-zinc-400">You are at the base rank. Build XP and completed workouts to move up.</div>
            )}
          </div>
        </PremiumCard>

        <PremiumCard variant="secondary">
          <SectionHeader icon={Zap} eyebrow="Unlocked Rewards" title={currentTier.name} subtitle="Discounts unlock from fully achieved rank tiers, not XP alone." />
          <div className="grid gap-2">
            {unlockedRewards.map(reward => (
              <div key={reward} className="flex items-center gap-3 rounded-2xl border border-amber-100/12 bg-amber-100/[0.045] px-4 py-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-100" />
                <span className="text-sm font-bold text-zinc-200">{reward}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[1.35rem] border border-white/[0.06] bg-black/20 p-4">
            <div className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-zinc-600">Next Tier Rewards</div>
            <div className="mt-2 text-sm font-bold text-zinc-300">{targetTier.name}: {nextRewards.join(' / ')}</div>
          </div>
        </PremiumCard>

        <PremiumCard variant="secondary">
          <SectionHeader icon={Award} eyebrow="Achievements" title="Rank Badges" subtitle="Badges unlock only when XP and required milestones are both complete." />
          <div className="grid grid-cols-2 gap-3">
            {achievementCards.map(card => {
              const completed = card.requirements.filter(item => item.met).length;
              const total = card.requirements.length || 1;
              const theme = card.theme;
              const xpRequirement = card.requirements.find(item => item.label.includes('XP'))?.label || `${card.xp.toLocaleString()} XP`;
              const milestonePreview = card.requirements
                .filter(item => !item.label.includes('XP'))
                .slice(0, 2)
                .map(item => item.label.replace('Complete ', '').replace('Claim daily XP ', 'Claim '))
                .join(' + ');
              return (
                <div
                  key={card.name}
                  className={`prestige-rank-card relative overflow-hidden rounded-[1.55rem] border p-4 text-center transition duration-300 ${
                    card.achieved
                      ? `${theme.border} ${theme.background} ${theme.glow}`
                      : 'border-white/[0.055] bg-white/[0.018] opacity-70 grayscale-[0.22]'
                  } ${card.current ? 'scale-[1.025] ring-1 ring-amber-100/18' : ''}`}
                >
                  <div className={`prestige-aura pointer-events-none absolute left-1/2 top-0 h-28 w-28 -translate-x-1/2 rounded-full ${theme.aura} blur-3xl ${card.achieved ? 'opacity-100' : 'opacity-20'}`} />
                  {card.achieved && <div className="prestige-shimmer pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.08)_42%,transparent_64%)]" />}
                  <div className="relative">
                    <div className={`mx-auto grid h-16 w-16 place-items-center rounded-[1.35rem] border ${card.achieved ? theme.icon : 'border-white/[0.06] bg-black/24 text-zinc-600'}`}>
                      {card.achieved ? <Trophy className="h-6 w-6" /> : <LockKeyhole className="h-6 w-6" />}
                    </div>
                    <div className={`mx-auto mt-3 h-0.5 w-12 rounded-full bg-gradient-to-r ${theme.accent} ${card.achieved ? 'opacity-90' : 'opacity-20'}`} />
                    <div className={`mt-3 text-lg font-black tracking-[-0.045em] ${card.achieved ? theme.text : 'text-zinc-500'}`}>{card.name}</div>
                    <div className="mt-1 text-[0.62rem] font-black uppercase tracking-[0.16em] text-zinc-500">{card.current ? 'Current' : card.achieved ? 'Unlocked' : `${completed}/${total} complete`}</div>
                    <div className="mt-3 rounded-2xl border border-white/[0.055] bg-black/24 px-3 py-2">
                      <div className={`text-xs font-black ${card.achieved ? theme.text : 'text-zinc-500'}`}>{xpRequirement}</div>
                      <div className="mt-1 line-clamp-2 text-[0.66rem] font-semibold leading-4 text-zinc-500">{milestonePreview || 'Base tier'}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </PremiumCard>

        <PremiumCard variant="secondary">
          <SectionHeader icon={Award} eyebrow="Records" title="Personal Records" subtitle={null} />
          <div className="space-y-3 text-sm">
            {records.map(record => (
              <div key={record} className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                <span className="font-semibold text-white">{record}</span>
                <ChevronRight className="h-4 w-4 text-zinc-500" />
              </div>
            ))}
          </div>
        </PremiumCard>

        <PremiumCard variant="secondary" className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-amber-300/12 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-orange-500/[0.08] blur-3xl" />
          <div className="relative">
            <SectionHeader
              icon={Share2}
              eyebrow="ForgeAI Ambassador"
              title="Followers Save. Creators Grow."
              subtitle="Share your creator code and unlock rank-based rewards."
            />

            <div className="rounded-[1.65rem] border border-amber-100/[0.09] bg-[radial-gradient(circle_at_18%_12%,rgba(253,230,138,0.16),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.052),rgba(255,255,255,0.016))] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[0.58rem] font-black uppercase tracking-[0.22em] text-amber-100/62">Creator Code</div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">Share your code. Grow the movement. Unlock creator rewards through performance and rank.</p>
                </div>
                {creatorProfile.creatorCode && (
                  <span className="rounded-full border border-white/[0.08] bg-black/24 px-3 py-1 text-[0.56rem] font-black uppercase tracking-[0.16em] text-zinc-400">
                    Active
                  </span>
                )}
              </div>

              {creatorProfile.creatorCode ? (
                <>
                  <div className="mt-4 rounded-[1.35rem] border border-amber-100/[0.12] bg-black/28 p-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
                    <div className="text-3xl font-black tracking-[0.12em] text-amber-100">{creatorProfile.creatorCode}</div>
                    <div className="mt-2 text-[0.58rem] font-black uppercase tracking-[0.18em] text-zinc-500">Creator network access</div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={copyCreatorCode}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.045] px-4 py-3 text-sm font-black text-white transition hover:bg-white/[0.075] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                    >
                      <ClipboardList className="h-4 w-4 text-amber-100" />
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={shareCreatorCode}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-100 px-4 py-3 text-sm font-black text-zinc-950 shadow-[0_16px_54px_rgba(245,158,11,0.18)] transition hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={generateCreatorCode}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-200 via-orange-300 to-orange-400 px-5 py-4 text-sm font-black text-zinc-950 shadow-[0_18px_62px_rgba(245,158,11,0.24)] transition hover:-translate-y-0.5 hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Creator Code
                </button>
              )}
            </div>

            <div className="mt-3 rounded-[1.45rem] border border-white/[0.06] bg-black/20 p-4">
              <div className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-amber-100/58">Follower Benefit</div>
              <div className="mt-2 text-lg font-black tracking-[-0.04em] text-white">{ambassadorTier.discount}% off eligible ForgeAI unlocks</div>
              <p className="mt-2 text-sm leading-6 text-zinc-400">Followers using your code receive your current ambassador-tier discount on PRO, AI Coach, and Store purchases.</p>
              <p className="mt-2 rounded-2xl border border-amber-100/[0.1] bg-amber-100/[0.045] px-3 py-2 text-xs font-bold leading-5 text-amber-100/86">
                Referral XP is earned only when someone signs up with your code or purchases PRO.
              </p>
              <p className="mt-2 text-xs leading-5 text-zinc-600">Prototype offer only. Checkout attribution and purchase validation arrive with payments.</p>
              {/* Later integrate creator codes with RevenueCat / Google Play / backend purchase attribution. */}
            </div>

            <div className="mt-3 rounded-[1.55rem] border border-white/[0.06] bg-white/[0.025] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-zinc-500">Your Ambassador Tier</div>
                  <div className={`mt-2 text-2xl font-black tracking-[-0.05em] ${currentRankTheme.text}`}>{currentTier.name}</div>
                </div>
                <div className={`rounded-[1.15rem] border px-3 py-2 text-right ${creatorRevenueEligible ? 'border-emerald-200/16 bg-emerald-200/[0.06]' : 'border-white/[0.07] bg-black/22'}`}>
                  <div className="text-[0.54rem] font-black uppercase tracking-[0.18em] text-zinc-500">Revenue Share</div>
                  <div className={`mt-1 text-sm font-black ${creatorRevenueEligible ? 'text-emerald-100' : 'text-zinc-300'}`}>{creatorRevenueEligible ? 'Eligible' : 'Locked'}</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-white/[0.055] bg-black/24 p-3">
                  <div className="text-lg font-black text-white">{ambassadorTier.discount}%</div>
                  <div className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.16em] text-zinc-500">Follower Discount</div>
                </div>
                <div className="rounded-2xl border border-white/[0.055] bg-black/24 p-3">
                  <div className="text-lg font-black text-white">{creatorRevenueEligible ? `${ambassadorTier.revenueShare}%` : 'Diamond'}</div>
                  <div className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.16em] text-zinc-500">{creatorRevenueEligible ? 'Suggested Share' : 'Unlock Share At'}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {ambassadorPath.map((rankName, index) => (
                  <React.Fragment key={rankName}>
                    <span className={`rounded-full border px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.14em] ${rankName === currentTier.name ? `${getRankTheme(rankName).border} ${getRankTheme(rankName).text} bg-white/[0.04]` : 'border-white/[0.06] bg-black/20 text-zinc-500'}`}>
                      {rankName}
                    </span>
                    {index < ambassadorPath.length - 1 && <ChevronRight className="h-3 w-3 text-zinc-700" />}
                  </React.Fragment>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-zinc-500">
                {creatorRevenueEligible
                  ? `Backend verification and payout setup are still required before ${ambassadorTier.revenueShare}% creator share can be paid.`
                  : `${nextAmbassadorTier.rank} preview: ${nextAmbassadorTier.discount}% follower discount${nextAmbassadorTier.revenueShare ? ` and ${nextAmbassadorTier.revenueShare}% suggested share` : ''}. Revenue share unlocks at Diamond.`}
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                ['Signups XP', `+${referralSignupXp} XP`],
                ['PRO Purchase XP', '+300-700 XP'],
                ['Revenue Share', creatorRevenueEligible ? `${ambassadorTier.revenueShare}%` : 'Diamond'],
                ['XP Farming', 'Protected']
              ].map(([title, value]) => (
                <div key={title} className="rounded-2xl border border-amber-100/[0.075] bg-amber-100/[0.035] p-3">
                  <div className="truncate text-base font-black tracking-[-0.03em] text-white">{value}</div>
                  <div className="mt-1 text-[0.54rem] font-bold uppercase tracking-[0.16em] text-zinc-500">{title}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                ['Signups', creatorProfile.referrals],
                ['PRO Purchases', creatorProfile.conversions],
                ['Discount Uses', creatorProfile.discountUses],
                ['Estimated Sales', `€${creatorProfile.estimatedRevenue.toFixed(0)}`],
                ['Social Shares', creatorProfile.socialShares],
                ['Reward Tier', currentTier.name]
              ].map(([title, value]) => (
                <div key={title} className="rounded-2xl border border-white/[0.055] bg-black/20 p-3">
                  <div className="truncate text-base font-black tracking-[-0.03em] text-white">{value}</div>
                  <div className="mt-1 text-[0.54rem] font-bold uppercase tracking-[0.16em] text-zinc-500">{title}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-[1.45rem] border border-white/[0.06] bg-black/20 p-4">
              <div className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-zinc-500">Have a Creator Code?</div>
              <div className="mt-3 flex gap-2">
                <input
                  value={appliedCreatorCode}
                  onChange={(event) => setAppliedCreatorCode(event.target.value.toUpperCase())}
                  maxLength={18}
                  placeholder="ENTER CODE"
                  className="min-w-0 flex-1 rounded-full border border-white/[0.08] bg-zinc-950/80 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white caret-amber-200 outline-none transition placeholder:text-zinc-700 focus:border-amber-100/30 focus:ring-2 focus:ring-amber-100/16"
                  aria-label="Creator code"
                />
                <button
                  type="button"
                  onClick={applyCreatorCode}
                  className="rounded-full border border-white/[0.08] bg-white/[0.05] px-4 py-3 text-sm font-black text-white transition hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                >
                  Apply
                </button>
              </div>
              <p className="mt-2 text-xs leading-5 text-zinc-600">Code discounts activate at checkout when payments are enabled.</p>
            </div>

            {ambassadorMessage && (
              <div className="mt-3 rounded-2xl border border-amber-100/[0.12] bg-amber-100/[0.055] px-4 py-3 text-sm font-bold text-amber-100">
                {ambassadorMessage}
              </div>
            )}
          </div>
        </PremiumCard>

        {DailyClaimCelebrationModal()}

        {showXpBoostModal && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/72 p-4 backdrop-blur-xl">
            <div className="w-full max-w-sm rounded-[2rem] border border-white/[0.1] bg-zinc-950/94 p-6 shadow-[0_34px_140px_rgba(0,0,0,0.62)]">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-amber-100/58">XP Boost</div>
                  <h2 className="mt-2 text-4xl font-black tracking-[-0.06em] text-white">x{multiplier.toFixed(2)}</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{multiplierLabel} active</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowXpBoostModal(false)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04] text-zinc-300 transition hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                  aria-label="Close XP boost details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-white/[0.06] bg-black/24 p-4">
                  <div className="text-sm font-black text-white">{progress.activeProBlockWeeks ? `${progress.activeProBlockWeeks} Week PRO` : 'No PRO block'}</div>
                  <div className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.16em] text-zinc-500">PRO Status</div>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-black/24 p-4">
                  <div className="text-sm font-black text-white">{progress.aiSubscriptionActive ? 'Active' : 'Inactive'}</div>
                  <div className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.16em] text-zinc-500">AI Coach</div>
                </div>
              </div>
              <div className="mt-4 rounded-[1.4rem] border border-amber-100/12 bg-amber-100/[0.055] p-4">
                <div className="text-sm font-bold text-amber-100">Multiplier sources</div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  PRO blocks and AI Coach can increase XP rewards. Daily claims refresh every 5 minutes while testing.
                </p>
              </div>
              <button
                type="button"
                disabled={progress.aiSubscriptionActive}
                onClick={activateAiCoachDemo}
                className={`mt-5 w-full rounded-full px-5 py-3 text-sm font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${
                  progress.aiSubscriptionActive
                    ? 'border border-white/[0.07] bg-white/[0.035] text-zinc-600'
                    : 'bg-amber-100 text-zinc-950 shadow-[0_14px_44px_rgba(245,158,11,0.18)] hover:bg-amber-200'
                }`}
              >
                {progress.aiSubscriptionActive ? 'AI Coach Active' : 'Activate AI Coach Demo'}
              </button>
            </div>
          </div>
        )}

        {rankAchievementModal && (() => {
          const modalTheme = getRankTheme(rankAchievementModal.name);
          return (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/72 p-4 backdrop-blur-xl">
              <div className={`prestige-rank-card relative w-full max-w-sm overflow-hidden rounded-[2rem] border p-6 ${modalTheme.border} ${modalTheme.background} ${modalTheme.glow}`}>
                <div className={`prestige-aura pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full ${modalTheme.aura} blur-3xl`} />
                <div className="prestige-shimmer pointer-events-none absolute inset-0 opacity-45 [background-image:linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.09)_42%,transparent_64%)]" />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <div className={`grid h-16 w-16 place-items-center rounded-[1.35rem] border ${modalTheme.icon}`}>
                      <Trophy className="h-7 w-7" />
                    </div>
                    <div className="mt-4 text-[0.62rem] font-black uppercase tracking-[0.22em] text-white/60">Rank Achievement</div>
                    <h2 className={`mt-2 text-4xl font-black tracking-[-0.06em] ${modalTheme.text}`}>{rankAchievementModal.name}</h2>
                    <p className="mt-3 text-sm leading-6 text-zinc-200/80">XP and milestones are aligned. New rank unlocked.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRankAchievementModal(null)}
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/20 text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                    aria-label="Close rank achievement"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="relative mt-5 space-y-2">
                  {getRankMilestones(rankAchievementModal.name, progress, workoutLogs).map(item => (
                    <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/22 px-4 py-3">
                      <span className="text-sm font-bold text-white">{item.label}</span>
                      <CheckCircle2 className="h-5 w-5 text-emerald-200" />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setRankAchievementModal(null)}
                  className={`relative mt-5 w-full rounded-full bg-gradient-to-r ${modalTheme.accent} px-5 py-3 text-sm font-black text-zinc-950 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200`}
                >
                  Continue
                </button>
              </div>
            </div>
          );
        })()}

      </div>
    );
  };

  const MovementVideoHero = ({ profile, goalKey }) => {
    const [videoReady, setVideoReady] = useState(false);
    const [videoFailed, setVideoFailed] = useState(false);
    const videoVariant = goalKey === 'buildMuscle' ? 'hypertrophy' : goalKey;
    const videoSrc = profile.videoAssets?.[videoVariant] || profile.videoAssets?.default;
    const isDrivePreview = /drive\.google\.com\/file\/d\/.+\/preview/.test(String(videoSrc || ''));

    useEffect(() => {
      setVideoReady(false);
      setVideoFailed(false);
    }, [videoSrc]);

    return (
      <section className="relative overflow-hidden rounded-[2.15rem] border border-amber-100/[0.12] bg-black shadow-[0_32px_140px_rgba(0,0,0,0.48)]">
        <div className="relative aspect-[9/13] min-h-[27rem] overflow-hidden bg-[radial-gradient(circle_at_50%_18%,rgba(251,191,36,0.24),transparent_34%),linear-gradient(160deg,rgba(255,255,255,0.08),rgba(9,9,11,0.95)_60%)]">
          {/* Future movement media: host athlete demos in CDN/cloud storage, add creator video variants, and keep goal-specific files addressable from the database. */}
          {videoSrc && isDrivePreview && !videoFailed && (
            <iframe
              key={videoSrc}
              src={videoSrc}
              allow="autoplay; fullscreen"
              allowFullScreen
              onLoad={() => setVideoReady(true)}
              className="absolute inset-0 h-full w-full border-0 opacity-90 transition duration-700"
              title={`${profile.displayName} movement video`}
            />
          )}
          {videoSrc && !isDrivePreview && !videoFailed && (
            <video
              key={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              onLoadedData={() => setVideoReady(true)}
              onError={() => setVideoFailed(true)}
              className={`absolute inset-0 h-full w-full object-cover transition duration-700 ${videoReady ? 'opacity-80' : 'opacity-0'}`}
            >
              <source src={videoSrc} type="video/mp4" onError={() => setVideoFailed(true)} />
            </video>
          )}
          <div className={`absolute inset-0 transition duration-700 ${(videoReady || isDrivePreview) ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
            <div className="absolute left-1/2 top-[13%] h-56 w-56 -translate-x-1/2 rounded-full border border-amber-100/[0.16] bg-amber-200/[0.065] blur-[1px]" />
            <div className="absolute left-1/2 top-[20%] h-40 w-40 -translate-x-1/2 rounded-full border border-white/[0.08]" />
            <div className="absolute inset-x-8 bottom-10 rounded-[1.8rem] border border-white/[0.08] bg-black/38 p-5 backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-[1.1rem] border border-amber-100/[0.14] bg-amber-100/[0.085] text-amber-100 shadow-[0_16px_56px_rgba(245,158,11,0.16)]">
                  <PlayCircle className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[0.58rem] font-black uppercase tracking-[0.24em] text-amber-100/62">Cinematic Demo</div>
                  <div className="mt-1 text-base font-black tracking-[-0.03em] text-white">{profile.displayName}</div>
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold leading-6 text-zinc-300/82">
                {videoFailed ? 'Video slot ready. Local athlete demo footage can drop into the movement library later.' : 'Goal-specific movement video architecture is ready for local or CDN exercise footage.'}
              </p>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/28" />
          <div className="absolute left-4 top-4 rounded-full border border-white/[0.09] bg-black/40 px-3 py-2 text-[0.58rem] font-black uppercase tracking-[0.2em] text-zinc-200 backdrop-blur-xl">
            {goalKey === 'strength' ? 'Strength Variant' : goalKey === 'power' ? 'Power Variant' : 'Hypertrophy Variant'}
          </div>
        </div>
      </section>
    );
  };

  const MovementCueList = ({ title, cues = [], tone = 'amber' }) => {
    const toneClasses = {
      amber: 'border-amber-100/[0.11] bg-amber-100/[0.045] text-amber-100',
      blue: 'border-sky-100/[0.1] bg-sky-100/[0.04] text-sky-100',
      green: 'border-emerald-100/[0.1] bg-emerald-100/[0.04] text-emerald-100',
      quiet: 'border-white/[0.065] bg-black/18 text-zinc-200'
    };

    return (
      <div className={`rounded-[1.45rem] border p-4 ${toneClasses[tone] || toneClasses.quiet}`}>
        <div className="text-[0.58rem] font-black uppercase tracking-[0.22em] opacity-70">{title}</div>
        <div className="mt-3 space-y-2">
          {(cues || []).map(cue => (
            <div key={cue} className="flex gap-2.5 text-sm font-semibold leading-5 text-zinc-200">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-80" />
              <span>{cue}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const MovementPage = ({ context, onBack }) => {
    const knownProfile = getMovementProfileBySlug(context?.slug) || getMovementProfileByName(context?.exerciseName);
    const profile = knownProfile || createFallbackMovementProfile(context?.exerciseName || 'Exercise');
    const goalKey = getMovementGoalKey(context?.goal);
    const tempoSteps = parseTempo(context?.tempo);
    const [cueIndex, setCueIndex] = useState(0);

    useEffect(() => {
      if (!profile.coachingCues?.length || profile.coachingCues.length === 1) return undefined;
      const interval = setInterval(() => setCueIndex(index => (index + 1) % profile.coachingCues.length), 3600);
      return () => clearInterval(interval);
    }, [profile.slug, profile.coachingCues]);

    const goalIntent = profile.goalIntent?.[goalKey] || profile.goalIntent?.buildMuscle;

    return (
      <div className="relative min-h-screen touch-pan-y overflow-x-hidden bg-black text-white antialiased">
        <Background />
        <main className="relative mx-auto w-full max-w-xl touch-pan-y px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
          <header className="sticky top-0 z-20 -mx-4 mb-4 border-b border-white/[0.055] bg-black/72 px-4 pb-4 pt-2 backdrop-blur-2xl sm:-mx-6 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.045] px-4 text-sm font-black text-zinc-100 transition hover:bg-white/[0.075] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                aria-label="Back to workout"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="flex items-center gap-2 rounded-full border border-amber-100/[0.1] bg-amber-100/[0.055] px-3 py-2 text-[0.58rem] font-black uppercase tracking-[0.2em] text-amber-100">
                <Brain className="h-3.5 w-3.5" />
                Movement
              </div>
            </div>
          </header>

          <div className="space-y-4">
            <MovementVideoHero profile={profile} goalKey={goalKey} />

            <PremiumCard variant="hero" className="!p-5 md:!p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-amber-100/[0.14] bg-amber-100/[0.07] px-3 py-1 text-[0.58rem] font-black uppercase tracking-[0.18em] text-amber-100">{profile.movementPattern}</span>
                <span className="rounded-full border border-white/[0.07] bg-black/22 px-3 py-1 text-[0.58rem] font-black uppercase tracking-[0.18em] text-zinc-400">{profile.difficulty}</span>
                <span className="rounded-full border border-white/[0.07] bg-black/22 px-3 py-1 text-[0.58rem] font-black uppercase tracking-[0.18em] text-zinc-400">{getMovementGoalLabel(context?.goal)}</span>
              </div>
              <h1 className="mt-4 text-5xl font-black leading-[0.9] tracking-[-0.075em] text-white">{profile.displayName}</h1>
              {!knownProfile && <p className="mt-3 text-sm font-bold text-amber-100/82">Movement profile coming soon. ForgeAI is showing the reusable coaching fallback for this exercise.</p>}
              <div className="mt-5 grid grid-cols-2 gap-2">
                {[
                  ['Pattern', profile.movementPattern],
                  ['Equipment', (profile.equipment || []).join(', ') || 'Varies'],
                  ['Main Muscle', profile.primaryMuscles?.[0] || 'Profile pending'],
                  ['Category', profile.category]
                ].map(([itemLabel, value]) => (
                  <div key={itemLabel} className="rounded-2xl border border-white/[0.06] bg-black/22 p-3">
                    <div className="text-[0.54rem] font-black uppercase tracking-[0.18em] text-zinc-600">{itemLabel}</div>
                    <div className="mt-2 text-sm font-black leading-5 tracking-[-0.02em] text-zinc-100">{value}</div>
                  </div>
                ))}
              </div>
            </PremiumCard>

            <PremiumCard variant="secondary" className="!p-4 sm:!p-5">
              <div className="flex items-start gap-3">
                <IconBubble icon={Target} />
                <div className="min-w-0">
                  <div className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-amber-100/58">Performance Intent</div>
                  <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-white">{getMovementGoalLabel(context?.goal)} execution</h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-zinc-300">{goalIntent}</p>
                </div>
              </div>
              {(context?.setsReps || context?.rest) && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {context.setsReps && <div className="rounded-2xl border border-white/[0.06] bg-black/22 p-3"><div className="text-[0.54rem] font-black uppercase tracking-[0.18em] text-zinc-600">Prescription</div><div className="mt-2 text-sm font-black text-white">{context.setsReps}</div></div>}
                  {context.rest && <div className="rounded-2xl border border-white/[0.06] bg-black/22 p-3"><div className="text-[0.54rem] font-black uppercase tracking-[0.18em] text-zinc-600">Rest</div><div className="mt-2 text-sm font-black text-white">{context.rest}</div></div>}
                </div>
              )}
            </PremiumCard>

            <PremiumCard variant="secondary" className="!p-4 sm:!p-5">
              <SectionHeader icon={Timer} eyebrow="Tempo Intelligence" title={context?.tempo ? context.tempo : 'Tempo from workout'} subtitle={profile.tempoGuide} />
              {tempoSteps.length ? (
                <div className="grid grid-cols-2 gap-2">
                  {tempoSteps.map(step => (
                    <div key={step.label} className="rounded-[1.3rem] border border-white/[0.065] bg-black/22 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-xl border border-amber-100/[0.12] bg-amber-100/[0.07] text-sm font-black text-amber-100">{step.digit}</span>
                        <span className="text-[0.52rem] font-black uppercase tracking-[0.16em] text-zinc-600">{step.detail}</span>
                      </div>
                      <div className="mt-3 text-[0.6rem] font-black uppercase tracking-[0.18em] text-zinc-500">{step.label}</div>
                      <div className="mt-1 text-sm font-black leading-5 text-white">{step.value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.35rem] border border-white/[0.06] bg-black/22 p-4 text-sm font-semibold leading-6 text-zinc-400">
                  Add or open this movement from a programmed workout to see a four-phase tempo breakdown here.
                </div>
              )}
            </PremiumCard>

            <PremiumCard variant="workout" className="!p-4 sm:!p-5">
              <SectionHeader icon={Brain} eyebrow="Execution Coaching" title="Rep by rep control" subtitle="Short cues designed to scan between sets." />
              <div className="grid gap-2">
                <MovementCueList title="Setup" cues={profile.setupCues} />
                <MovementCueList title="Descent" cues={profile.executionCues?.descent} tone="blue" />
                <MovementCueList title={profile.movementPattern.toLowerCase().includes('press') ? 'Press / Ascent' : 'Ascent / Drive'} cues={profile.executionCues?.ascent} tone="green" />
                <MovementCueList title="Breathing" cues={profile.breathingCues} tone="quiet" />
              </div>
            </PremiumCard>

            <PremiumCard variant="hero" className="relative overflow-hidden !p-4 sm:!p-5">
              <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-amber-300/16 blur-3xl" />
              <div className="relative flex items-start gap-3">
                <IconBubble icon={Sparkles} />
                <div className="min-w-0">
                  <div className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-amber-100/62">AI Coaching Cue</div>
                  <div className="mt-3 min-h-14 text-3xl font-black leading-tight tracking-[-0.055em] text-white transition">
                    {profile.coachingCues?.[cueIndex] || 'Move with intent.'}
                  </div>
                </div>
              </div>
            </PremiumCard>

            <PremiumCard variant="secondary" className="!p-4 sm:!p-5">
              <SectionHeader icon={X} eyebrow="Common Errors" title="Protect the pattern" subtitle="Fast checks before quality slips." />
              <div className="space-y-2">
                {(profile.commonMistakes || []).map(mistake => (
                  <div key={mistake} className="flex items-start gap-3 rounded-[1.25rem] border border-rose-200/[0.085] bg-rose-200/[0.035] px-4 py-3">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-200" />
                    <span className="text-sm font-bold leading-5 text-zinc-200">{mistake}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-[1.35rem] border border-amber-100/[0.08] bg-amber-100/[0.035] p-4">
                <div className="text-[0.58rem] font-black uppercase tracking-[0.2em] text-amber-100/58">Safety Signal</div>
                <div className="mt-2 space-y-2 text-sm font-semibold leading-5 text-zinc-300">
                  {(profile.safetyTips || []).map(tip => <div key={tip}>{tip}</div>)}
                </div>
              </div>
            </PremiumCard>

            <PremiumCard variant="secondary" className="!p-4 sm:!p-5">
              <SectionHeader icon={Activity} eyebrow="Muscle Profile" title="Target the work" subtitle="Anatomy overlays can layer on top of this system later." />
              <div className="grid gap-2">
                {[
                  ['Primary', profile.primaryMuscles, 'text-amber-100'],
                  ['Secondary', profile.secondaryMuscles, 'text-sky-100'],
                  ['Stabilizers', profile.stabilizers, 'text-emerald-100']
                ].map(([group, muscles, color]) => (
                  <div key={group} className="rounded-[1.3rem] border border-white/[0.06] bg-black/22 p-4">
                    <div className={`text-[0.58rem] font-black uppercase tracking-[0.2em] ${color}`}>{group}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(muscles || []).length ? muscles.map(muscle => (
                        <span key={muscle} className="rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 text-xs font-black text-zinc-200">{muscle}</span>
                      )) : <span className="text-sm font-semibold text-zinc-500">Profile pending.</span>}
                    </div>
                  </div>
                ))}
              </div>
            </PremiumCard>

            <PremiumCard variant="secondary" className="!p-4 sm:!p-5">
              <SectionHeader icon={Gauge} eyebrow="Athlete Layer" title="Skill notes" subtitle="Simple adjustments for the current training age." />
              <div className="grid gap-2 sm:grid-cols-2">
                <MovementCueList title="Beginner" cues={profile.beginnerTips} tone="green" />
                <MovementCueList title="Advanced" cues={profile.advancedTips} tone="amber" />
              </div>
              {/* Future movement intelligence: add camera correction, tempo tracking, velocity feedback, rep counting, wearable context, and exercise scoring here. */}
            </PremiumCard>

            <PremiumCard variant="secondary" className="!p-4 sm:!p-5">
              <SectionHeader icon={Repeat} eyebrow="Alternatives" title="Alternative Movements" subtitle="Keep the training intent when equipment or joints need a different option." />
              {(profile.alternatives || []).length ? (
                <div className="grid gap-2">
                  {profile.alternatives.map(alternative => (
                    <button
                      key={alternative}
                      type="button"
                      onClick={() => openMovementPage(alternative, { goal: context?.goal, tempo: context?.tempo, source: 'alternative' })}
                      className="flex w-full items-center justify-between gap-3 rounded-[1.3rem] border border-white/[0.07] bg-black/22 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-amber-100/[0.16] hover:bg-white/[0.045] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                    >
                      <span>
                        <span className="block text-base font-black tracking-[-0.03em] text-white">{alternative}</span>
                        <span className="mt-1 block text-xs font-semibold text-zinc-500">Open movement page</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.35rem] border border-white/[0.06] bg-black/22 p-4 text-sm font-semibold text-zinc-500">Alternative profile coming soon.</div>
              )}
            </PremiumCard>
          </div>
        </main>
      </div>
    );
  };

  const PremiumShell = () => {
    if (!authUser) return SignupScreen();
    if (activeMovementContext) return <MovementPage context={activeMovementContext} onBack={closeMovementPage} />;
    if (isWorkoutSessionActive && isWorkoutSessionViewActive) return WorkoutSessionView();

    return (
    <div className="relative min-h-screen touch-pan-y overflow-x-hidden text-white antialiased">
      <Background />
      <style>{`
        html,
        body,
        #root {
          min-height: 100%;
          overflow-x: hidden;
          overflow-y: auto;
          touch-action: pan-y;
          overscroll-behavior-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        body {
          position: static;
        }
        .tempo-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(251, 191, 36, 0.35) rgba(255, 255, 255, 0.06);
        }
        .tempo-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .tempo-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.04);
          border-radius: 999px;
        }
        .tempo-scroll::-webkit-scrollbar-thumb {
          background: rgba(251, 191, 36, 0.38);
          border-radius: 999px;
        }
        @keyframes premiumFadeUp {
          from { opacity: 0; transform: translateY(18px) scale(.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes orbRotate {
          to { transform: rotate(360deg); }
        }
        @keyframes orbPulse {
          0%, 100% { opacity: .62; transform: scale(.985); }
          50% { opacity: 1; transform: scale(1.015); }
        }
        @keyframes prestigePulse {
          0%, 100% { opacity: .58; transform: scale(.98); }
          50% { opacity: .9; transform: scale(1.02); }
        }
        @keyframes prestigeShimmer {
          0% { transform: translateX(-125%); opacity: 0; }
          38%, 62% { opacity: .34; }
          100% { transform: translateX(125%); opacity: 0; }
        }
        .premium-reveal {
          opacity: 0;
          animation: premiumFadeUp .72s cubic-bezier(.2,.8,.2,1) forwards;
          animation-delay: var(--delay, 0ms);
        }
        .workout-card {
          opacity: 0;
          animation: premiumFadeUp .62s cubic-bezier(.2,.8,.2,1) forwards;
          animation-delay: var(--delay, 0ms);
        }
        .orb-ring {
          animation: orbRotate 18s linear infinite, orbPulse 5s ease-in-out infinite;
          border-style: dashed;
        }
        .orb-ring-slow {
          animation: orbRotate 30s linear infinite reverse;
          border-style: dashed;
        }
        .selected-glow {
          box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 0 44px rgba(245,158,11,.10);
        }
        .prestige-rank-card::before {
          content: "";
          position: absolute;
          inset: -1px;
          pointer-events: none;
          border-radius: inherit;
          opacity: .2;
          background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,.15) 44%, transparent 65%);
        }
        .prestige-shimmer {
          animation: prestigeShimmer 7s ease-in-out infinite;
        }
        .prestige-aura {
          animation: prestigePulse 5.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .premium-reveal,
          .workout-card,
          .orb-ring,
          .orb-ring-slow,
          .prestige-shimmer,
          .prestige-aura {
            opacity: 1;
            animation: none;
            transform: none;
          }
        }
      `}</style>

      <main className={`relative mx-auto w-full touch-pan-y px-4 pb-36 sm:px-6 lg:px-8 ${activeTab === 'workout' ? 'max-w-7xl' : 'max-w-xl'}`}>
        {activeTab === 'workout' ? (!showWorkout ? (
          <>
            {Hero()}
            {Preferences()}
            {TrainingInsights({})}
          </>
        ) : (
          <div className="py-10 md:py-16">
            <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                {Logo()}
                <div>
                  <div className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-amber-100/58">ForgeAI</div>
                  <h1 className="text-5xl font-black leading-none tracking-[-0.065em] text-white md:text-7xl">Elite Session</h1>
                  <p className="mt-2 text-base leading-7 text-zinc-400">Your personalized workout session is ready.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWorkout(false)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.085] bg-white/[0.035] px-5 py-3 text-sm font-bold text-zinc-200 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/[0.065] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Preferences
              </button>
            </div>

            {workout && (
              <div className="space-y-8">
                <section className="space-y-5">
                  <div className="mb-2">
                    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-amber-100/58">Generated Workout</div>
                    {bodyweightWorkoutSubtype && (
                      <div className="mt-3 inline-flex max-w-full flex-col rounded-[1.35rem] border border-amber-100/[0.10] bg-amber-100/[0.045] px-4 py-3 shadow-[0_18px_70px_rgba(245,158,11,0.08)] backdrop-blur-xl sm:px-5">
                        <span className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-amber-100/70">{getBodyweightSubtypeMeta(bodyweightWorkoutSubtype).eyebrow}</span>
                        <span className="mt-1 text-sm font-black tracking-[-0.02em] text-white sm:text-base">{getBodyweightSubtypeMeta(bodyweightWorkoutSubtype).title}</span>
                      </div>
                    )}
                  </div>
                  {workout.map((exercise, idx) => (
                    <React.Fragment key={`${exercise.label}-${exercise.name}-${idx}`}>
                      {ExerciseCard({ exercise, idx })}
                    </React.Fragment>
                  ))}
                  <button
                    type="button"
                    onClick={startWorkoutSession}
                    className="group mt-3 inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-amber-200 via-orange-300 to-orange-400 px-8 py-5 text-lg font-black text-zinc-950 shadow-[0_20px_80px_rgba(245,158,11,0.24)] transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_26px_110px_rgba(245,158,11,0.32)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-100 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    {isWorkoutSessionActive ? 'Resume Workout' : 'Start Workout'}
                    <Timer className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={generateWorkout}
                    className="group inline-flex w-full items-center justify-center gap-3 rounded-full border border-white/[0.085] bg-white/[0.035] px-8 py-5 text-lg font-black text-white shadow-[0_18px_70px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:bg-white/[0.065] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-100 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    Generate New Workout
                    <ChevronRight className="h-5 w-5 transition group-hover:translate-x-1" />
                  </button>
                </section>

                <PremiumCard delay={80} variant="flat">
                  <SectionHeader icon={Sparkles} eyebrow="Training Insights" title="Training Insights" subtitle="Train with purpose, control every tempo, and let programmed rest maintain output quality." />
                  <div className="space-y-3 text-sm leading-6 text-zinc-300">
                    <p>Prioritize clean execution over chasing load. Every session is structured around your selected goal, available time, and recovery demand.</p>
                    <p>Use tempo guidance for movement control, and open muscle profiles to improve body-muscle connection during each set.</p>
                  </div>
                </PremiumCard>

                <SessionIntensitySummary exercises={workout} />

                <PremiumCard variant="secondary" className="!p-4 sm:!p-5">
                  <button
                    type="button"
                    onClick={() => openLoadIntelligence()}
                    className="group flex w-full items-center justify-between gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <IconBubble icon={Gauge} />
                      <div>
                        <div className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-amber-100/58">Load Intelligence</div>
                        <h3 className="mt-1 text-base font-black tracking-[-0.035em] text-white sm:text-lg">Estimate your 1RM and training loads.</h3>
                        <p className="mt-1 text-xs font-semibold leading-5 text-zinc-500">Use this after seeing the workout prescription to calculate smarter working loads.</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-zinc-500 transition group-hover:translate-x-0.5 group-hover:text-amber-100" />
                  </button>
                </PremiumCard>

                {TrainingInsights({ compact: true })}
              </div>
            )}
          </div>
        )) : (
          <div className="py-10 md:py-14">
            {activeTab === 'log' && LogTab()}
            {activeTab === 'ai' && AITab()}
            {activeTab === 'pro' && ProTab()}
            {activeTab === 'you' && YouTab()}
          </div>
        )}
      </main>

      {BottomNav()}
      {AIRadialMenu()}

      {showSettingsScreen && SettingsScreen()}
      {showLoadIntelligence && LoadIntelligenceModal()}

      {showExerciseDemo && (
        <ExerciseDemo exerciseName={showExerciseDemo} onClose={() => setShowExerciseDemo(null)} />
      )}
    </div>
    );
  };

  const LegacyApp = () => (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {!showWorkout ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <Logo />
                <h1 className="text-4xl md:text-5xl font-bold">ForgeAI</h1>
              </div>
              <p className="text-zinc-400 text-lg">Configure your parameters. The AI will construct your optimal session.</p>
            </div>

            {/* Select Your Goal */}
            <div className="bg-zinc-900 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold">Select Your Goal</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <OptionButton
                  isSelected={settings.goal === 'build-muscle'}
                  onClick={() => setSettings({...settings, goal: 'build-muscle'})}
                  title="Build Muscle"
                  subtitle="Hypertrophy focus"
                />
                <OptionButton
                  isSelected={settings.goal === 'strength'}
                  onClick={() => setSettings({...settings, goal: 'strength'})}
                  title="Strength"
                  subtitle="Heavy weights, low reps"
                />
                <OptionButton
                  isSelected={settings.goal === 'fat-loss'}
                  onClick={() => setSettings({...settings, goal: 'fat-loss'})}
                  title="Power"
                  subtitle="Sport performance, explosive main lifts"
                />
                <OptionButton
                  isSelected={settings.goal === 'v02-max'}
                  onClick={() => setSettings({...settings, goal: 'v02-max'})}
                  title="Conditioning"
                  subtitle="V02 max, aerobic conditioning"
                />
              </div>
            </div>

            {/* Experience Level or Conditioning Type */}
            {settings.goal === 'v02-max' ? (
            <div className="bg-zinc-900 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold">Conditioning Type</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <OptionButton
                  isSelected={settings.conditioningType === 'cardio'}
                  onClick={() => setSettings({...settings, conditioningType: 'cardio'})}
                  title="Cardio"
                  subtitle="Zone 2, steady state"
                />
                <OptionButton
                  isSelected={settings.conditioningType === 'vo2max'}
                  onClick={() => setSettings({...settings, conditioningType: 'vo2max'})}
                  title="VO2 Max"
                  subtitle="High-intensity intervals"
                />
              </div>
            </div>
            ) : (
            <div className="bg-zinc-900 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold">Experience Level</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <OptionButton
                  isSelected={settings.experience === 'beginner'}
                  onClick={() => setSettings({...settings, experience: 'beginner'})}
                  title="Beginner"
                  subtitle="0-1 years exp"
                />
                <OptionButton
                  isSelected={settings.experience === 'intermediate'}
                  onClick={() => setSettings({...settings, experience: 'intermediate'})}
                  title="Intermediate"
                  subtitle="1-3 years exp"
                />
                <OptionButton
                  isSelected={settings.experience === 'advanced'}
                  onClick={() => setSettings({...settings, experience: 'advanced'})}
                  title="Advanced"
                  subtitle="3+ years exp"
                />
              </div>
            </div>
            )}

            {/* Equipment Access — hidden for Conditioning */}
            {settings.goal !== 'v02-max' && (
            <div className="bg-zinc-900 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Dumbbell className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold">Equipment Access</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <OptionButton
                  isSelected={settings.equipment === 'full-gym'}
                  onClick={() => setSettings({...settings, equipment: 'full-gym'})}
                  title="Full Gym"
                  subtitle="Machines, Barbells, Dumbbells"
                />
                <OptionButton
                  isSelected={settings.equipment === 'barbells-only'}
                  onClick={() => setSettings({...settings, equipment: 'barbells-only'})}
                  title="Barbells Only"
                  subtitle="Racks and plates required"
                />
                <OptionButton
                  isSelected={settings.equipment === 'dumbbells-only'}
                  onClick={() => setSettings({...settings, equipment: 'dumbbells-only'})}
                  title="Dumbbell/Kettlebells Only"
                  subtitle="Portable weights only"
                />
                <OptionButton
                  isSelected={settings.equipment === 'no-equipment'}
                  onClick={() => setSettings({...settings, equipment: 'no-equipment'})}
                  title="Bodyweight"
                  subtitle="Calisthenics & home training"
                />
              </div>
            </div>
            )}

            {/* Session Focus — hidden for Conditioning */}
            {settings.goal !== 'v02-max' && (
            <div className="bg-zinc-900 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold">Workout Focus</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <OptionButton
                  isSelected={settings.focus === 'full-body'}
                  onClick={() => setSettings({...settings, focus: 'full-body'})}
                  title="Full Body"
                />
                <OptionButton
                  isSelected={settings.focus === 'upper-body'}
                  onClick={() => setSettings({...settings, focus: 'upper-body'})}
                  title="Upper Body (Chest, Back, Shoulders)"
                />
                <OptionButton
                  isSelected={settings.focus === 'legs'}
                  onClick={() => setSettings({...settings, focus: 'legs'})}
                  title="Legs"
                />
                <OptionButton
                  isSelected={settings.focus === 'chest-back'}
                  onClick={() => setSettings({...settings, focus: 'chest-back'})}
                  title="Chest & Back"
                />
                <OptionButton
                  isSelected={settings.focus === 'arms'}
                  onClick={() => setSettings({...settings, focus: 'arms'})}
                  title="Arms"
                />
              </div>
            </div>
            )}

            {/* Workout Style — hidden for Conditioning */}
            {settings.goal !== 'v02-max' && (
            <div className="bg-zinc-900 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold">Workout Style</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <OptionButton
                  isSelected={settings.workoutStyle === 'paired'}
                  onClick={() => setSettings({...settings, workoutStyle: 'paired'})}
                  title="Paired Workout"
                  subtitle="Alternating muscle groups for efficient performance"
                />
                <OptionButton
                  isSelected={settings.workoutStyle === 'straight'}
                  onClick={() => setSettings({...settings, workoutStyle: 'straight'})}
                  title="Straight Sets"
                  subtitle="One exercise at a time with focused output"
                />
              </div>
            </div>
            )}

            {/* Duration — hidden for Conditioning */}
            {settings.goal !== 'v02-max' && (
            <div className="bg-zinc-900 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold">Time available</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['20m', '30m', '45m', '60m'].map(duration => (
                  <OptionButton
                    key={duration}
                    isSelected={settings.duration === duration}
                    onClick={() => setSettings({...settings, duration})}
                    title={duration}
                  />
                ))}
              </div>
            </div>
            )}

            {/* Forge Workout Button */}
            <button
              onClick={generateWorkout}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-5 rounded-xl font-bold text-xl hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              FORGE WORKOUT
              <span className="text-2xl">›</span>
            </button>
          </>
        ) : (
          <>
            {/* Workout Page */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Logo />
                  <h1 className="text-4xl md:text-5xl font-bold">ForgeAI</h1>
                </div>
                <button
                  onClick={() => setShowWorkout(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  ← Back
                </button>
              </div>
              <p className="text-zinc-400 text-lg">Your personalized workout session</p>
            </div>

            {/* Workout Results */}
            {workout && (
              <div className="bg-zinc-900 rounded-2xl p-6 md:p-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2">Your Workout</h2>
                  <div className="flex flex-wrap gap-3 text-sm text-zinc-400">
                    <span className="bg-zinc-800 px-3 py-1 rounded-lg">
                      Goal: {settings.goal === 'v02-max' ? 'Conditioning' : settings.goal === 'fat-loss' ? 'Power' : settings.goal.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                    <span className="bg-zinc-800 px-3 py-1 rounded-lg">
                      {settings.goal === 'v02-max' ? (settings.conditioningType === 'vo2max' ? 'VO2 Max' : 'Steady State Cardio') : (settings.experience.charAt(0).toUpperCase() + settings.experience.slice(1))}
                    </span>
                    {settings.goal !== 'v02-max' && (
                    <span className="bg-zinc-800 px-3 py-1 rounded-lg">
                      Time available: {settings.duration}
                    </span>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  {workout.map((exercise, idx) => {
                    const muscles = muscleData[exercise.name] || { primary: '', secondary: '', stabilizers: '' };
                    return (
                      <div key={idx} className="bg-zinc-800 rounded-lg p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <span className="font-bold text-orange-500 text-xl">{exercise.label}.</span>{' '}
                            <span className="font-semibold text-white text-xl">{exercise.name}</span>
                            {exercise.isMain && (
                              <span className="ml-2 px-2 py-0.5 bg-orange-600 text-white text-xs rounded-full">MAIN</span>
                            )}
                            {exercise.isConditioning && !exercise.isVo2Max && (
                              <span className="ml-2 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">ZONE 2</span>
                            )}
                            {exercise.isVo2Max && (
                              <span className="ml-2 px-2 py-0.5 bg-orange-600 text-white text-xs rounded-full">MAIN</span>
                            )}
                          </div>
                          {!exercise.isConditioning && (
                            <button
                              onClick={() => setShowExerciseDemo(exercise.name)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-400 hover:text-white transition-colors text-xs"
                              title="View exercise demo"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                              </svg>
                              Form
                            </button>
                          )}
                        </div>
                        
                        {/* Scheme Name - V2 Style */}
                        {exercise.schemeName && (
                          <div className="mb-3 p-2 bg-zinc-700/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-orange-400 font-semibold text-sm">{exercise.schemeName}</span>
                              {exercise.schemeDescription && !exercise.vo2Protocol && (
                                <span className="text-zinc-400 text-xs">- {exercise.schemeDescription}</span>
                              )}
                            </div>
                            {exercise.vo2Protocol && exercise.schemeDescription && (
                              <div className="mt-1 text-zinc-300 text-xs leading-relaxed">{exercise.schemeDescription}</div>
                            )}
                            {exercise.schemeExample && (
                              <div className="mt-1 text-xs text-zinc-500 italic">
                                Example: {exercise.schemeExample}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {exercise.isConditioning ? (
                          exercise.vo2Protocol ? (
                            <div className="space-y-4 text-sm">
                              <div className="p-4 bg-orange-900/20 border border-orange-700/30 rounded-lg">
                                <div className="text-orange-400 font-bold mb-2 text-base">How To</div>
                                <div className="text-white leading-relaxed text-sm">{exercise.vo2Protocol.howTo}</div>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="bg-zinc-700/50 rounded-lg p-3 text-center">
                                  <div className="text-zinc-400 mb-1">Sprint</div>
                                  <div className="text-white font-bold text-base">{exercise.vo2Protocol.sprint}</div>
                                </div>
                                <div className="bg-zinc-700/50 rounded-lg p-3 text-center">
                                  <div className="text-zinc-400 mb-1">Rest</div>
                                  <div className="text-white font-bold text-base">{exercise.vo2Protocol.recovery}</div>
                                </div>
                                <div className="bg-zinc-700/50 rounded-lg p-3 text-center">
                                  <div className="text-zinc-400 mb-1">Sets</div>
                                  <div className="text-white font-bold text-base">{exercise.vo2Protocol.rounds}</div>
                                </div>
                              </div>
                              <div className="bg-zinc-700/50 rounded-lg p-3">
                                <div className="text-green-400 font-semibold mb-2">Benefits</div>
                                <div className="text-zinc-300 leading-relaxed">
                                  {exercise.vo2Protocol.benefits.split('. ').filter(b => b.trim()).map((benefit, i) => (
                                    <div key={i} className="flex gap-2 mb-1">
                                      <span className="text-green-400">-</span>
                                      <span>{benefit.replace(/\.$/, '')}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="bg-zinc-700/50 rounded-lg p-3">
                                <div className="text-purple-400 font-semibold mb-2">Who's It For</div>
                                <div className="text-zinc-300 leading-relaxed">
                                  {exercise.vo2Protocol.whoFor.split('. ').filter(w => w.trim()).map((who, i) => (
                                    <div key={i} className="flex gap-2 mb-1">
                                      <span className="text-purple-400">-</span>
                                      <span>{who.replace(/\.$/, '')}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                          <div className="text-sm mb-3">
                            <div className="text-zinc-400 mb-1">Protocol</div>
                            <div className="text-white font-semibold text-lg">{exercise.setsReps}</div>
                          </div>
                          )
                        ) : (
                        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                          <div>
                            <div className="text-zinc-400 mb-1">Sets × Reps</div>
                            <div className="text-white font-semibold">{exercise.setsReps}</div>
                          </div>
                          <div className="relative">
                            <div className="text-zinc-400 mb-1 flex items-center gap-1">
                              Tempo
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowTempoInfo(showTempoInfo === idx ? null : idx); }}
                                className="w-4 h-4 rounded-full bg-zinc-600 text-zinc-300 text-xs flex items-center justify-center hover:bg-zinc-500 transition-colors"
                              >?</button>
                            </div>
                            {showTempoInfo === idx && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowTempoInfo(null)} />
                                <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-zinc-900 border border-zinc-600 rounded-lg p-4 shadow-xl text-xs">
                                  <div className="font-bold text-white text-sm mb-2">What is Tempo?</div>
                                  <p className="text-zinc-300 mb-2">A 4-digit code defining the speed of each phase of a rep measured in seconds.</p>
                                  <div className="font-semibold text-orange-400 mb-1">Reading the 4 digits:</div>
                                  <div className="space-y-1 mb-3 text-zinc-300">
                                    <div><span className="text-white font-semibold">1st</span> — Eccentric (lowering). Seconds to lower the weight.</div>
                                    <div><span className="text-white font-semibold">2nd</span> — Pause at the bottom (stretched position).</div>
                                    <div><span className="text-white font-semibold">3rd</span> — Concentric (lifting). "X" = as fast as possible.</div>
                                    <div><span className="text-white font-semibold">4th</span> — Pause at the top (lockout).</div>
                                  </div>
                                  {exercise.tempo && exercise.tempo !== '—' && exercise.tempo !== 'random' && (() => {
                                    const t = exercise.tempo;
                                    const phases = getTempoPhases(exercise.name);
                                    const cf = phases.concentricFirst;
                                    const d1 = t[0] === 'X' ? 'Explosive' : t[0] + 's';
                                    const d2 = t[1] === '0' ? 'No pause' : t[1] + 's pause';
                                    const d3 = t[2] === 'X' ? 'Explosive' : t[2] + 's';
                                    const d4 = t[3] === '0' ? 'No pause' : t[3] + 's pause';
                                    return (
                                      <div className="p-2 bg-orange-900/20 border border-orange-700/30 rounded-lg mb-2">
                                        <div className="font-semibold text-orange-400 mb-1">{exercise.name} — {exercise.tempo}</div>
                                        {cf && (
                                          <div className="text-yellow-400 text-xs mb-1.5">⚡ This exercise starts with the concentric (3rd digit) — you lift first, then lower.</div>
                                        )}
                                        <div className="space-y-0.5 text-zinc-300">
                                          {cf ? (
                                            <>
                                              <div className="opacity-50"><span className="text-white font-semibold">1st ({d1})</span> {phases.eccentric}</div>
                                              <div className="opacity-50"><span className="text-white font-semibold">2nd ({d2})</span> {phases.bottom}</div>
                                              <div className="border-l-2 border-yellow-400 pl-1.5"><span className="text-white font-semibold">3rd ({d3})</span> {phases.concentric} <span className="text-yellow-400">← START HERE</span></div>
                                              <div className="border-l-2 border-yellow-400 pl-1.5"><span className="text-white font-semibold">4th ({d4})</span> {phases.top}</div>
                                              <div className="border-l-2 border-yellow-400 pl-1.5"><span className="text-white font-semibold">1st ({d1})</span> {phases.eccentric}</div>
                                              <div className="border-l-2 border-yellow-400 pl-1.5"><span className="text-white font-semibold">2nd ({d2})</span> {phases.bottom}</div>
                                            </>
                                          ) : (
                                            <>
                                              <div><span className="text-white font-semibold">1st ({d1})</span> {phases.eccentric}</div>
                                              <div><span className="text-white font-semibold">2nd ({d2})</span> {phases.bottom}</div>
                                              <div><span className="text-white font-semibold">3rd ({d3})</span> {phases.concentric}</div>
                                              <div><span className="text-white font-semibold">4th ({d4})</span> {phases.top}</div>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                  <p className="text-zinc-400 italic">Controlling tempo increases time under tension, enhances muscular tension and irradiation, improves the mind–muscle connection, and drives specific training adaptations.</p>
                                </div>
                              </>
                            )}
                            <div className="text-white font-semibold">{exercise.tempo}</div>
                          </div>
                          <div>
                            <div className="text-zinc-400 mb-1">Rest</div>
                            <div className="text-white font-semibold">{exercise.rest}</div>
                          </div>
                        </div>
                        )}
                        {!exercise.isConditioning && muscles.primary && (
                          <div className="border-t border-zinc-700 pt-3 space-y-2">
                            <div className="text-xs">
                              <span className="text-orange-400 font-semibold">Primary:</span>{' '}
                              <span className="text-zinc-300">{muscles.primary}</span>
                            </div>
                            {muscles.secondary && (
                              <div className="text-xs">
                                <span className="text-purple-400 font-semibold">Secondary:</span>{' '}
                                <span className="text-zinc-300">{muscles.secondary}</span>
                              </div>
                            )}
                            {muscles.stabilizers && (
                              <div className="text-xs">
                                <span className="text-blue-400 font-semibold">Stabilizers:</span>{' '}
                                <span className="text-zinc-300">{muscles.stabilizers}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Generate New Workout Button */}
                <button
                  onClick={generateWorkout}
                  className="w-full mt-6 bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-lg"
                >
                  🔄 Generate New Workout
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {/* Exercise Demo Modal */}
      {showExerciseDemo && (
        <ExerciseDemo exerciseName={showExerciseDemo} onClose={() => setShowExerciseDemo(null)} />
      )}
    </div>
  );

  void LegacyApp;
  return PremiumShell();
}
