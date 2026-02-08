'use client'

import { use, useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { Album, Track } from '@/lib/types'
import { Music, Play } from 'lucide-react'
import { usePlayerStore } from '@/lib/store'
import Image from 'next/image'

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = getSupabaseClient()
  const { setQueue } = usePlayerStore()
  const [album, setAlbum] = useState<Album | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlbum()
  }, [id])

  const fetchAlbum = async () => {
    try {
      const { data: albumData } = await supabase
        .from('albums')
        .select('*')
        .eq('id', id)
        .single()

      if (albumData) {
        setAlbum(albumData)

        const { data: tracksData } = await supabase
          .from('tracks')
          .select('*')
          .eq('album_id', id)
          .order('created_at', { ascending: true })

        if (tracksData) setTracks(tracksData)
      }
    } catch (error) {
      console.error('Error fetching album:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      setQueue(tracks, 0)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Music className="w-12 h-12 animate-pulse text-primary" />
      </div>
    )
  }

  if (!album) {
    return (
      <div className="p-8">
        <p className="text-xl text-gray-400">Альбом не найден</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-end gap-6 mb-8">
        {album.cover_url ? (
          <Image
            src={album.cover_url}
            alt={album.title}
            width={192}
            height={192}
            className="rounded shadow-2xl"
          />
        ) : (
          <div className="w-48 h-48 bg-dark-100 rounded flex items-center justify-center">
            <Music className="w-20 h-20 text-gray-600" />
          </div>
        )}
        <div>
          <p className="text-sm font-semibold mb-2">АЛЬБОМ</p>
          <h1 className="text-5xl font-bold mb-4">{album.title}</h1>
          <p className="text-gray-400">
            {album.artist_name} • {tracks.length} треков
          </p>
        </div>
      </div>

      {tracks.length > 0 && (
        <button
          onClick={handlePlayAll}
          className="mb-8 px-8 py-3 bg-primary text-white rounded-full font-semibold hover:bg-green-600 transition flex items-center gap-2"
        >
          <Play className="w-5 h-5" />
          Воспроизвести
        </button>
      )}

      {tracks.length > 0 ? (
        <div className="space-y-2">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-dark-100 transition cursor-pointer"
              onClick={() => setQueue(tracks, index)}
            >
              <span className="text-gray-400 w-8 text-center">{index + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{track.title}</p>
                <p className="text-sm text-gray-400 truncate">{track.artist_name}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Music className="w-20 h-20 mx-auto mb-4 text-gray-600" />
          <p className="text-xl text-gray-400">В альбоме пока нет треков</p>
        </div>
      )}
    </div>
  )
}
