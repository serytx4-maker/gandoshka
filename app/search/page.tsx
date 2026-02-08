'use client'

import { useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { Track, Album } from '@/lib/types'
import TrackCard from '@/components/TrackCard'
import AlbumCard from '@/components/AlbumCard'
import { Search as SearchIcon } from 'lucide-react'

export default function SearchPage() {
  const supabase = getSupabaseClient()
  const [query, setQuery] = useState('')
  const [tracks, setTracks] = useState<Track[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery)
    if (!searchQuery.trim()) {
      setTracks([])
      setAlbums([])
      return
    }

    setLoading(true)

    try {
      const { data: tracksData } = await supabase
        .from('tracks')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,artist_name.ilike.%${searchQuery}%`)
        .limit(20)

      const { data: albumsData } = await supabase
        .from('albums')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,artist_name.ilike.%${searchQuery}%`)
        .limit(10)

      if (tracksData) setTracks(tracksData)
      if (albumsData) setAlbums(albumsData)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Что хотите послушать?"
            className="w-full pl-14 pr-4 py-4 bg-white text-black rounded-full text-lg focus:outline-none"
          />
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <SearchIcon className="w-12 h-12 animate-pulse text-primary mx-auto" />
        </div>
      )}

      {!loading && query && (
        <>
          {albums.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Альбомы</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {albums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </section>
          )}

          {tracks.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Треки</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tracks.map((track) => (
                  <TrackCard key={track.id} track={track} />
                ))}
              </div>
            </section>
          )}

          {tracks.length === 0 && albums.length === 0 && (
            <div className="text-center py-20">
              <SearchIcon className="w-20 h-20 mx-auto mb-4 text-gray-600" />
              <p className="text-xl text-gray-400">Ничего не найдено</p>
              <p className="text-gray-500 mt-2">Попробуйте другой запрос</p>
            </div>
          )}
        </>
      )}

      {!query && !loading && (
        <div className="text-center py-20">
          <SearchIcon className="w-20 h-20 mx-auto mb-4 text-gray-600" />
          <p className="text-xl text-gray-400">Начните поиск</p>
          <p className="text-gray-500 mt-2">Найдите свои любимые треки и альбомы</p>
        </div>
      )}
    </div>
  )
}
