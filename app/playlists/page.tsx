'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { Playlist } from '@/lib/types'
import { Plus, Music, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'

export default function PlaylistsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    fetchPlaylists()
  }, [user])

  const fetchPlaylists = async () => {
    if (!user) return

    try {
      const { data } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setPlaylists(data)
    } catch (error) {
      console.error('Error fetching playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newPlaylistName.trim()) return

    try {
      const { error } = await supabase.from('playlists').insert({
        name: newPlaylistName,
        user_id: user.id,
      })

      if (error) throw error

      toast.success('Плейлист создан!')
      setNewPlaylistName('')
      setShowCreateModal(false)
      fetchPlaylists()
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при создании плейлиста')
    }
  }

  const handleDeletePlaylist = async (id: string) => {
    if (!confirm('Удалить этот плейлист?')) return

    try {
      const { error } = await supabase.from('playlists').delete().eq('id', id)

      if (error) throw error

      toast.success('Плейлист удален')
      fetchPlaylists()
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Мои плейлисты</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-green-600 transition"
        >
          <Plus className="w-5 h-5" />
          Создать плейлист
        </button>
      </div>

      {playlists.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-dark-100 p-4 rounded-lg hover:bg-dark-200 transition group relative"
            >
              <Link href={`/playlist/${playlist.id}`}>
                <div className="w-full aspect-square bg-dark-200 rounded flex items-center justify-center mb-4">
                  <Music className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="font-semibold truncate mb-1">{playlist.name}</h3>
                <p className="text-sm text-gray-400">Плейлист</p>
              </Link>
              <button
                onClick={() => handleDeletePlaylist(playlist.id)}
                className="absolute top-2 right-2 p-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Music className="w-20 h-20 mx-auto mb-4 text-gray-600" />
          <p className="text-xl text-gray-400">У вас пока нет плейлистов</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-green-600 transition"
          >
            Создать первый плейлист
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-100 rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Создать плейлист</h2>
            <form onSubmit={handleCreatePlaylist}>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Название плейлиста"
                className="w-full px-4 py-3 bg-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-6"
                autoFocus
                required
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewPlaylistName('')
                  }}
                  className="flex-1 py-3 bg-dark-200 rounded-full font-semibold hover:bg-dark-300 transition"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white rounded-full font-semibold hover:bg-green-600 transition"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
