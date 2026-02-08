'use client'

import { use, useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { Track, Album } from '@/lib/types'
import TrackCard from '@/components/TrackCard'
import AlbumCard from '@/components/AlbumCard'
import { Music, Settings } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  username: string
  display_name: string
  bio?: string
  avatar_url?: string
  banner_url?: string
}

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'tracks' | 'albums'>('tracks')

  const isOwnProfile = user && profile && user.id === profile.id

  useEffect(() => {
    fetchProfile()
  }, [username])

  const fetchProfile = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (profileData) {
        setProfile(profileData)

        const { data: tracksData } = await supabase
          .from('tracks')
          .select('*')
          .eq('artist_id', profileData.id)
          .order('created_at', { ascending: false })

        const { data: albumsData } = await supabase
          .from('albums')
          .select('*')
          .eq('artist_id', profileData.id)
          .order('created_at', { ascending: false })

        if (tracksData) setTracks(tracksData)
        if (albumsData) setAlbums(albumsData)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
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

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <p className="text-xl text-gray-400 mb-4">Профиль не найден</p>
        {user && (
          <Link
            href="/settings"
            className="inline-block px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-green-600 transition"
          >
            Создать свой профиль
          </Link>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Banner */}
      <div className="relative h-64 bg-gradient-to-b from-purple-900 to-dark-300">
        {profile.banner_url ? (
          <Image
            src={profile.banner_url}
            alt="Banner"
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900 to-dark-300" />
        )}
      </div>

      {/* Profile Info */}
      <div className="px-8 -mt-20 relative">
        <div className="flex items-end gap-6 mb-6">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.display_name}
              width={160}
              height={160}
              className="rounded-full border-4 border-dark-300"
            />
          ) : (
            <div className="w-40 h-40 rounded-full bg-dark-100 border-4 border-dark-300 flex items-center justify-center">
              <Music className="w-16 h-16 text-gray-600" />
            </div>
          )}
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-5xl font-bold">{profile.display_name}</h1>
              {isOwnProfile && (
                <Link
                  href="/settings"
                  className="p-2 bg-dark-100 rounded-full hover:bg-dark-200 transition"
                >
                  <Settings className="w-5 h-5" />
                </Link>
              )}
            </div>
            <p className="text-gray-400 mb-2">@{profile.username}</p>
            {profile.bio && <p className="text-gray-300 max-w-2xl">{profile.bio}</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-8 text-sm">
          <div>
            <span className="font-bold text-white">{tracks.length}</span>
            <span className="text-gray-400 ml-1">треков</span>
          </div>
          <div>
            <span className="font-bold text-white">{albums.length}</span>
            <span className="text-gray-400 ml-1">альбомов</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('tracks')}
            className={`px-4 py-3 font-semibold transition border-b-2 ${
              activeTab === 'tracks'
                ? 'border-primary text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Треки
          </button>
          <button
            onClick={() => setActiveTab('albums')}
            className={`px-4 py-3 font-semibold transition border-b-2 ${
              activeTab === 'albums'
                ? 'border-primary text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Альбомы
          </button>
        </div>

        {/* Content */}
        {activeTab === 'tracks' && (
          <>
            {tracks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
                {tracks.map((track) => (
                  <TrackCard key={track.id} track={track} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Music className="w-20 h-20 mx-auto mb-4 text-gray-600" />
                <p className="text-xl text-gray-400">Нет треков</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'albums' && (
          <>
            {albums.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 pb-8">
                {albums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Music className="w-20 h-20 mx-auto mb-4 text-gray-600" />
                <p className="text-xl text-gray-400">Нет альбомов</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
