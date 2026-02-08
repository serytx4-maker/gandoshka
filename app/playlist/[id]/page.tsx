'use client'

import { use, useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { Track } from '@/lib/types'
import { Music, Play, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePlayerStore } from '@/lib/store'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const supabase = getSupabaseClient()
  const { setQueue } = usePlayerStore()
  const [playlist, setPlaylist] = useState<any>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    fetchPlaylist()
  }, [user, id])

  const fetchPlaylist = async () => {
    try {
      const { data: playlistData } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', id)
        .single()

      if (playlistData) {
        setPlaylist(playlistData)

        const { data: playlistTracks } = await supabase
          .from('playlist_tracks')
          .select('track_id')
          .eq('playlist_id', id)

        if (playlistTracks && playlistTracks.length > 0) {
          const trackIds = playlistTracks.map((pt) => pt.track_id)
          const { data: tracksData } = await supabase
            .from('tracks')
            .select('*')
            .in('id', trackIds)

          if (tracksData) setTracks(tracksData)
        }
      }
    } catch (error) {
      console.error('Error fetching playlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      setQueue(tracks, 0)
    }
  }

  const handleRemoveTrack = async (trackId: string) => {
    try {
      const { error } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('playlist_id', id)
        .eq('track_id', trackId)

      if (error) throw error

      toast.success('Трек удален из плейлиста')
      fetchPlaylist()
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при удалении')
    }
  }

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Music className="w-12 h-12 animate-pulse text-primary" />
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="p-8">
        <p className="text-xl text-gray-400">Плейлист не найден</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-end gap-6 mb-8">
        <div className="w-48 h-48 bg-dark-100 rounded flex items-center justify-center">
          <Music className="w-20 h-20 text-gray-600" />
        </div>
        <div>
          <p className="text-sm font-semibold mb-2">ПЛЕЙЛИСТ</p>
          <h1 className="text-5xl font-bold mb-4">{playlist.name}</h1>
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
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-dark-100 transition group"
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
              <button
                onClick={() => handleRemoveTrack(track.id)}
                className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Music className="w-20 h-20 mx-auto mb-4 text-gray-600" />
          <p className="text-xl text-gray-400">Плейлист пуст</p>
          <p className="text-gray-500 mt-2">Добавьте треки из библиотеки</p>
        </div>
      )}
    </div>
  )
}
