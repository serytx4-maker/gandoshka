'use client'

import { Track } from '@/lib/types'
import { usePlayerStore } from '@/lib/store'
import { Play, Pause } from 'lucide-react'
import Image from 'next/image'

interface TrackCardProps {
  track: Track
}

export default function TrackCard({ track }: TrackCardProps) {
  const { currentTrack, isPlaying, setCurrentTrack, togglePlay } = usePlayerStore()
  const isCurrentTrack = currentTrack?.id === track.id

  const handlePlay = () => {
    if (isCurrentTrack) {
      togglePlay()
    } else {
      setCurrentTrack(track)
    }
  }

  return (
    <div className="bg-dark-100 p-4 rounded-lg hover:bg-dark-200 transition group cursor-pointer">
      <div className="relative mb-4">
        {track.cover_url ? (
          <Image
            src={track.cover_url}
            alt={track.title}
            width={200}
            height={200}
            className="w-full aspect-square object-cover rounded"
          />
        ) : (
          <div className="w-full aspect-square bg-dark-200 rounded flex items-center justify-center">
            <Play className="w-12 h-12 text-gray-600" />
          </div>
        )}
        <button
          onClick={handlePlay}
          className="absolute bottom-2 right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-105 shadow-lg"
        >
          {isCurrentTrack && isPlaying ? (
            <Pause className="w-6 h-6 text-black" />
          ) : (
            <Play className="w-6 h-6 text-black ml-0.5" />
          )}
        </button>
      </div>
      <h3 className="font-semibold truncate mb-1">{track.title}</h3>
      <p className="text-sm text-gray-400 truncate">{track.artist_name}</p>
    </div>
  )
}
