'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { Track, Album } from '@/lib/types'
import TrackCard from '@/components/TrackCard'
import AlbumCard from '@/components/AlbumCard'
import { Music, Disc, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LibraryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [tracks, setTracks] = useState<Track[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'tracks' | 'albums'>('tracks')

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    fetchLibrary()
  }, [user])

  const fetchLibrary = async () => {
    if (!user) return

    try {
      const { data: tracksData } = await supabase
        .from('tracks')
        .select('*')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false })

      const { data: albumsData } = await supabase
        .from('albums')
        .select('*')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false })

      if (tracksData) setTracks(tracksData)
      if (albumsData) setAlbums(albumsData)
    } catch (error) {
      console.error('Error fetching library:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTrack = async (trackId: string, audioUrl: string, coverUrl?: string) => {
    if (!confirm('Удалить этот трек?')) return

    try {
      // Удаляем аудиофайл
      if (audioUrl) {
        const audioPath = audioUrl.split('/audio/')[1]
        if (audioPath) {
          await supabase.storage.from('audio').remove([audioPath])
        }
      }

      // Удаляем обложку если есть
      if (coverUrl) {
        const coverPath = coverUrl.split('/covers/')[1]
        if (coverPath) {
          await supabase.storage.from('covers').remove([coverPath])
        }
      }

      // Удаляем запись из БД
      const { error } = await supabase.from('tracks').delete().eq('id', trackId)

      if (error) throw error

      toast.success('Трек удален')
      fetchLibrary()
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при удалении')
    }
  }

  const handleDeleteAlbum = async (albumId: string, coverUrl?: string) => {
    if (!confirm('Удалить этот альбом? Треки останутся.')) return

    try {
      // Удаляем обложку если есть
      if (coverUrl) {
        const coverPath = coverUrl.split('/covers/')[1]
        if (coverPath) {
          await supabase.storage.from('covers').remove([coverPath])
        }
      }

      // Удаляем запись из БД
      const { error } = await supabase.from('albums').delete().eq('id', albumId)

      if (error) throw error

      toast.success('Альбом удален')
      fetchLibrary()
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при удалении')
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
      <h1 className="text-4xl font-bold mb-8">Моя библиотека</h1>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('tracks')}
          className={`px-6 py-2 rounded-full font-semibold transition ${
            activeTab === 'tracks'
              ? 'bg-primary text-white'
              : 'bg-dark-100 text-gray-400 hover:text-white'
          }`}
        >
          Треки ({tracks.length})
        </button>
        <button
          onClick={() => setActiveTab('albums')}
          className={`px-6 py-2 rounded-full font-semibold transition ${
            activeTab === 'albums'
              ? 'bg-primary text-white'
              : 'bg-dark-100 text-gray-400 hover:text-white'
          }`}
        >
          Альбомы ({albums.length})
        </button>
      </div>

      {activeTab === 'tracks' && (
        <>
          {tracks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tracks.map((track) => (
                <div key={track.id} className="relative group">
                  <TrackCard track={track} />
                  <button
                    onClick={() => handleDeleteTrack(track.id, track.audio_url, track.cover_url || undefined)}
                    className="absolute top-2 right-2 p-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600 z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Music className="w-20 h-20 mx-auto mb-4 text-gray-600" />
              <p className="text-xl text-gray-400">У вас пока нет треков</p>
              <button
                onClick={() => router.push('/upload')}
                className="mt-4 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-green-600 transition"
              >
                Загрузить первый трек
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === 'albums' && (
        <>
          {albums.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {albums.map((album) => (
                <div key={album.id} className="relative group">
                  <AlbumCard album={album} />
                  <button
                    onClick={() => handleDeleteAlbum(album.id, album.cover_url || undefined)}
                    className="absolute top-2 right-2 p-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600 z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Disc className="w-20 h-20 mx-auto mb-4 text-gray-600" />
              <p className="text-xl text-gray-400">У вас пока нет альбомов</p>
              <p className="text-gray-500 mt-2">
                Создайте альбом при загрузке трека
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
