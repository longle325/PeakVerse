import { create } from "zustand";
import { persist } from "zustand/middleware";
import { appStorage } from "@/lib/storage";
import type {
  ChallengeResult,
  ChatMessage,
  UserProfile,
  Grade,
} from "@/types";
import {
  POINTS_PER_MATCH,
} from "@/lib/scoring";
import { DEFAULT_TRACK_ID, type MusicTrack } from "@/data/music";

export interface MusicSettings {
  enabled: boolean;
  trackId: MusicTrack["id"];
  volume: number;
}

interface AppState {
  profile: UserProfile | null;
  points: number;
  streak: number;
  matches: string[];
  skipped: string[];
  completed: Record<string, ChallengeResult>;
  chats: Record<string, ChatMessage[]>;
  music: MusicSettings;

  setProfile: (username: string, grade: Grade, userId?: string) => void;
  setUserId: (userId: string) => void;
  matchCharacter: (id: string) => void;
  setMatches: (ids: string[]) => void;
  removeMatch: (id: string) => void;
  skipCharacter: (id: string) => void;
  resetSkipped: () => void;
  appendChat: (id: string, message: ChatMessage) => void;
  setChat: (id: string, messages: ChatMessage[]) => void;
  saveChallenge: (id: string, result: ChallengeResult) => void;
  retryChallenge: (id: string) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setMusicTrack: (trackId: MusicTrack["id"]) => void;
  setMusicVolume: (volume: number) => void;
  resetAll: () => void;
}

const initial = {
  profile: null as UserProfile | null,
  points: 0,
  streak: 1,
  matches: [] as string[],
  skipped: [] as string[],
  completed: {} as Record<string, ChallengeResult>,
  chats: {} as Record<string, ChatMessage[]>,
  music: {
    enabled: false,
    trackId: DEFAULT_TRACK_ID,
    volume: 0.2,
  } as MusicSettings,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initial,

      setProfile: (username, grade, userId) =>
        set((state) => ({
          profile: {
            username,
            grade,
            userId: userId ?? state.profile?.userId,
          },
        })),

      setUserId: (userId) =>
        set((state) =>
          state.profile
            ? { profile: { ...state.profile, userId } }
            : state,
        ),

      matchCharacter: (id) =>
        set((state) =>
          state.matches.includes(id)
            ? state
            : {
                matches: [...state.matches, id],
                points: state.points + POINTS_PER_MATCH,
              },
        ),

      // Replace local matches wholesale with the authoritative list from
      // the backend. Used by RequireProfile to reconcile after auth so
      // zombie entries from the mock-mode era can never linger.
      setMatches: (ids) =>
        set(() => ({ matches: Array.from(new Set(ids)) })),

      // Drop a single match — used by Chat when a stream returns 403,
      // which means the FE thought the user had matched but the backend
      // doesn't agree. Healing locally lets the route's match guard
      // render the LockedView on the next render.
      removeMatch: (id) =>
        set((state) => ({
          matches: state.matches.filter((m) => m !== id),
        })),

      skipCharacter: (id) =>
        set((state) =>
          state.skipped.includes(id)
            ? state
            : { skipped: [...state.skipped, id] },
        ),

      resetSkipped: () => set({ skipped: [] }),

      appendChat: (id, message) =>
        set((state) => ({
          chats: {
            ...state.chats,
            [id]: [...(state.chats[id] || []), message],
          },
        })),

      setChat: (id, messages) =>
        set((state) => ({
          chats: { ...state.chats, [id]: messages },
        })),

      saveChallenge: (id, result) =>
        set((state) => ({
          completed: { ...state.completed, [id]: result },
          points: state.points + result.awarded,
        })),

      retryChallenge: (id) =>
        set((state) => {
          const previous = state.completed[id];
          if (!previous) return state;
          const next = { ...state.completed };
          delete next[id];
          return {
            completed: next,
            points: Math.max(0, state.points - previous.awarded),
          };
        }),

      setMusicEnabled: (enabled) =>
        set((state) => ({ music: { ...state.music, enabled } })),

      setMusicTrack: (trackId) =>
        set((state) => ({ music: { ...state.music, trackId } })),

      setMusicVolume: (volume) =>
        set((state) => ({
          music: {
            ...state.music,
            volume: Math.max(0, Math.min(1, volume)),
          },
        })),

      resetAll: () => set({ ...initial }),
    }),
    {
      name: "litmatch-state",
      storage: appStorage,
    },
  ),
);
