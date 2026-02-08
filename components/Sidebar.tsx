'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Library, Plus, Heart, Music, LogIn, LogOut, Upload, User } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { getSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchUsername()
    }
  }, [user])

  const fetchUsername = async () => {
    if (!user) return
    
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    if (data?.username) {
      setUsername(data.username)
    } else {
      // Если профиля нет, используем email
      setUsername(user.email?.split('@')[0] || null)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navItems = [
    { icon: Home, label: 'Главная', href: '/' },
    { icon: Search, label: 'Поиск', href: '/search' },
    { icon: Library, label: 'Моя библиотека', href: '/library' },
  ]

  return (
    <aside className="w-64 bg-black flex flex-col h-full">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
          <Music className="w-8 h-8 text-primary" />
          <span>MusicStream</span>
        </Link>
      </div>

      <nav className="flex-1 px-3">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-dark-100 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-dark-100'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="font-semibold">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        {user && (
          <>
            <div className="border-t border-gray-800 my-4" />
            <ul className="space-y-2">
              <li>
                <Link
                  href={username ? `/profile/${username}` : '/settings'}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                    pathname.startsWith('/profile') || pathname === '/settings'
                      ? 'bg-dark-100 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-dark-100'
                  }`}
                >
                  <User className="w-6 h-6" />
                  <span className="font-semibold">Профиль</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/upload"
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                    pathname === '/upload'
                      ? 'bg-dark-100 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-dark-100'
                  }`}
                >
                  <Upload className="w-6 h-6" />
                  <span className="font-semibold">Загрузить</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/playlists"
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                    pathname === '/playlists'
                      ? 'bg-dark-100 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-dark-100'
                  }`}
                >
                  <Plus className="w-6 h-6" />
                  <span className="font-semibold">Плейлисты</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/liked"
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                    pathname === '/liked'
                      ? 'bg-dark-100 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-dark-100'
                  }`}
                >
                  <Heart className="w-6 h-6" />
                  <span className="font-semibold">Любимое</span>
                </Link>
              </li>
            </ul>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-800">
        {user ? (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-dark-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Выйти</span>
          </button>
        ) : (
          <Link
            href="/auth"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-primary text-white hover:bg-green-600 transition-colors justify-center font-semibold"
          >
            <LogIn className="w-5 h-5" />
            <span>Войти</span>
          </Link>
        )}
      </div>
    </aside>
  )
}
