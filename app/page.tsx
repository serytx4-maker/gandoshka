'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { Track, Album } from '@/lib/types'
import TrackCard from '@/components/TrackCard'
import AlbumCard from '@/components/AlbumCard'
import { Music } from 'lucide-react'

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const { data: tracksData } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12)

      const { data: albumsData } = await supabase
        .from('albums')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6)

      if (tracksData) setTracks(tracksData)
      if (albumsData) setAlbums(albumsData)
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Music className="w-12 h-12 animate-pulse text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Главная</h1>

      {albums.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Новые альбомы</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {tracks.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Последние треки</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </section>
      )}

      {tracks.length === 0 && albums.length === 0 && (
        <div className="text-center py-20">
          <Music className="w-20 h-20 mx-auto mb-4 text-gray-600" />
          <p className="text-xl text-gray-400">Контент пока не загружен</p>
          <p className="text-gray-500 mt-2">Загрузите свои первые треки!</p>
        </div>
      )}
    </div>
  )
}
