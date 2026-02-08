'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { Track } from '@/lib/types'
import { Heart, Music, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePlayerStore } from '@/lib/store'
import Image from 'next/image'

export default function LikedPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = getSupabaseClient()
  const { setQueue } = usePlayerStore()
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    fetchLikedTracks()
  }, [user])

  const fetchLikedTracks = async () => {
    if (!user) return

    try {
      const { data: likedData } = await supabase
        .from('liked_tracks')
        .select('track_id')
        .eq('user_id', user.id)

      if (likedData && likedData.length > 0) {
        const trackIds = likedData.map((item) => item.track_id)
        const { data: tracksData } = await supabase
          .from('tracks')
          .select('*')
          .in('id', trackIds)

        if (tracksData) setTracks(tracksData)
      }
    } catch (error) {
      console.error('Error fetching liked tracks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      setQueue(tracks, 0)
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Music className="w-12 h-12 animate-pulse text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-end gap-6 mb-8">
        <div className="w-48 h-48 bg-gradient-to-br from-purple-700 to-blue-500 rounded flex items-center justify-center">
          <Heart className="w-20 h-20 text-white" fill="white" />
        </div>
        <div>
          <p className="text-sm font-semibold mb-2">ПЛЕЙЛИСТ</p>
          <h1 className="text-5xl font-bold mb-4">Любимые треки</h1>
          <p className="text-gray-400">{tracks.length} треков</p>
        </div>
      </div>

      {tracks.length > 0 && (
        <button
          onClick={handlePlayAll}
          className="mb-8 px-8 py-3 bg-primary text-white rounded-full font-semibold hover:bg-green-600 transition flex items-center gap-2"
        >
          <Play className="w-5 h-5" />
          Воспроизвести все
        </button>
      )}

      {tracks.length > 0 ? (
        <div className="space-y-2">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-dark-100 transition"
            >
              <span className="text-gray-400 w-8 text-center">{index + 1}</span>
              {track.cover_url ? (
                <Image
                  src={track.cover_url}
                  alt={track.title}
                  width={48}
                  height={48}
                  className="rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-dark-200 rounded flex items-center justify-center">
                  <Music className="w-6 h-6 text-gray-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{track.title}</p>
                <p className="text-sm text-gray-400 truncate">{track.artist_name}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Heart className="w-20 h-20 mx-auto mb-4 text-gray-600" />
          <p className="text-xl text-gray-400">Нет любимых треков</p>
          <p className="text-gray-500 mt-2">Добавьте треки в избранное</p>
        </div>
      )}
    </div>
  )
}
