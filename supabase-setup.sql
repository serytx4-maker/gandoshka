-- Создание таблиц для музыкального стриминг-сервиса

-- Таблица треков
CREATE TABLE tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist_id UUID NOT NULL,
  artist_name TEXT NOT NULL,
  album_id UUID,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  lyrics TEXT,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица альбомов
CREATE TABLE albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist_id UUID NOT NULL,
  artist_name TEXT NOT NULL,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица плейлистов
CREATE TABLE playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID NOT NULL,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Связь плейлистов и треков
CREATE TABLE playlist_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Любимые треки
CREATE TABLE liked_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

-- Включение Row Level Security (RLS)
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE liked_tracks ENABLE ROW LEVEL SECURITY;

-- Политики для публичного чтения
CREATE POLICY "Tracks are viewable by everyone" ON tracks FOR SELECT USING (true);
CREATE POLICY "Albums are viewable by everyone" ON albums FOR SELECT USING (true);

-- Политики для создания (только авторизованные пользователи)
CREATE POLICY "Users can create tracks" ON tracks FOR INSERT WITH CHECK (auth.uid() = artist_id);
CREATE POLICY "Users can update their tracks" ON tracks FOR UPDATE USING (auth.uid() = artist_id);
CREATE POLICY "Users can delete their tracks" ON tracks FOR DELETE USING (auth.uid() = artist_id);

CREATE POLICY "Users can create albums" ON albums FOR INSERT WITH CHECK (auth.uid() = artist_id);
CREATE POLICY "Users can update their albums" ON albums FOR UPDATE USING (auth.uid() = artist_id);
CREATE POLICY "Users can delete their albums" ON albums FOR DELETE USING (auth.uid() = artist_id);

CREATE POLICY "Users can create playlists" ON playlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their playlists" ON playlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their playlists" ON playlists FOR DELETE USING (auth.uid() = user_id);

-- Политики для плейлистов
CREATE POLICY "Playlists are viewable by owner" ON playlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Playlist tracks are viewable by playlist owner" ON playlist_tracks FOR SELECT USING (
  EXISTS (SELECT 1 FROM playlists WHERE playlists.id = playlist_tracks.playlist_id AND playlists.user_id = auth.uid())
);
CREATE POLICY "Users can add tracks to their playlists" ON playlist_tracks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM playlists WHERE playlists.id = playlist_tracks.playlist_id AND playlists.user_id = auth.uid())
);
CREATE POLICY "Users can remove tracks from their playlists" ON playlist_tracks FOR DELETE USING (
  EXISTS (SELECT 1 FROM playlists WHERE playlists.id = playlist_tracks.playlist_id AND playlists.user_id = auth.uid())
);

-- Политики для любимых треков
CREATE POLICY "Users can view their liked tracks" ON liked_tracks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can like tracks" ON liked_tracks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike tracks" ON liked_tracks FOR DELETE USING (auth.uid() = user_id);

-- Индексы для оптимизации запросов
CREATE INDEX idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX idx_tracks_album_id ON tracks(album_id);
CREATE INDEX idx_albums_artist_id ON albums(artist_id);
CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE INDEX idx_playlist_tracks_track_id ON playlist_tracks(track_id);
CREATE INDEX idx_liked_tracks_user_id ON liked_tracks(user_id);
CREATE INDEX idx_liked_tracks_track_id ON liked_tracks(track_id);
