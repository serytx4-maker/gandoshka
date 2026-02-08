import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Sidebar from '@/components/Sidebar'
import Player from '@/components/Player'
import AuthProvider from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: 'Music Streaming App',
  description: 'Стриминг музыки в стиле Spotify',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto pb-24">
              {children}
            </main>
          </div>
          <Player />
          <Toaster position="bottom-center" />
        </AuthProvider>
      </body>
    </html>
  )
}
