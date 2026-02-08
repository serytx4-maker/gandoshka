'use client'

import { Album } from '@/lib/types'
import { Music } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface AlbumCardProps {
  album: Album
}

export default function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link
      href={`/album/${album.id}`}
      className="bg-dark-100 p-4 rounded-lg hover:bg-dark-200 transition group cursor-pointer"
    >
      <div className="relative mb-4">
        {album.cover_url ? (
          <Image
            src={album.cover_url}
            alt={album.title}
            width={200}
            height={200}
            className="w-full aspect-square object-cover rounded"
          />
        ) : (
          <div className="w-full aspect-square bg-dark-200 rounded flex items-center justify-center">
            <Music className="w-12 h-12 text-gray-600" />
          </div>
        )}
      </div>
      <h3 className="font-semibold truncate mb-1">{album.title}</h3>
      <p className="text-sm text-gray-400 truncate">{album.artist_name}</p>
    </Link>
  )
}
