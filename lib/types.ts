export interface Track {
  id: string
  title: string
  artist_id: string
  artist_name: string
  album_id?: string
  audio_url: string
  cover_url?: string
  lyrics?: string
  duration?: number
  created_at: string
}

export interface Album {
  id: string
  title: string
  artist_id: string
  artist_name: string
  cover_url?: string
  created_at: string
  tracks?: Track[]
}

export interface Playlist {
  id: string
  name: string
  user_id: string
  cover_url?: string
  created_at: string
  tracks?: Track[]
}

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}
