import { create } from 'zustand'
import { Track } from './types'

interface PlayerState {
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  queue: Track[]
  currentIndex: number
  setCurrentTrack: (track: Track) => void
  setIsPlaying: (isPlaying: boolean) => void
  setVolume: (volume: number) => void
  setQueue: (queue: Track[], startIndex?: number) => void
  playNext: () => void
  playPrevious: () => void
  togglePlay: () => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 0.7,
  queue: [],
  currentIndex: 0,
  
  setCurrentTrack: (track) => set({ currentTrack: track, isPlaying: true }),
  
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  setVolume: (volume) => set({ volume }),
  
  setQueue: (queue, startIndex = 0) => set({ 
    queue, 
    currentIndex: startIndex,
    currentTrack: queue[startIndex] || null,
    isPlaying: true 
  }),
  
  playNext: () => {
    const { queue, currentIndex } = get()
    if (currentIndex < queue.length - 1) {
      const newIndex = currentIndex + 1
      set({ 
        currentIndex: newIndex, 
        currentTrack: queue[newIndex],
        isPlaying: true 
      })
    }
  },
  
  playPrevious: () => {
    const { queue, currentIndex } = get()
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      set({ 
        currentIndex: newIndex, 
        currentTrack: queue[newIndex],
        isPlaying: true 
      })
    }
  },
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
}))
