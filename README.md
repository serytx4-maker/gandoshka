# Music Streaming App 🎵

Полноценный музыкальный стриминг-сервис в стиле Spotify/SoundCloud, построенный на современном стеке технологий.

## 🚀 Технологии

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Backend, Auth, Storage)
- **Zustand** (State Management)
- **Lucide React** (Icons)

## ✨ Функционал

### Авторизация
- Вход через Google (OAuth)
- Email/Password регистрация
- Защищенные маршруты

### Управление контентом
- Загрузка аудиофайлов (MP3, WAV)
- Загрузка обложек (JPG, PNG)
- Создание альбомов
- Текстовый редактор для лирики

### Музыкальный плеер
- Persistent плеер внизу экрана
- Play/Pause, Next/Previous
- Прогресс-бар с перемоткой
- Регулировка громкости
- Отображение обложки и информации о треке

### Библиотека и плейлисты
- Моя библиотека (треки и альбомы)
- Создание пользовательских плейлистов
- Добавление/удаление треков из плейлистов
- Любимые треки

### Поиск
- Поиск по трекам и альбомам
- Поиск по названию и исполнителю

## 📦 Установка

1. Клонируйте репозиторий
2. Установите зависимости:

```bash
npm install
```

3. Создайте проект в [Supabase](https://supabase.com)

4. Создайте необходимые таблицы в Supabase:

```sql
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

-- Включите Row Level Security (RLS)
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
CREATE POLICY "Users can create albums" ON albums FOR INSERT WITH CHECK (auth.uid() = artist_id);
CREATE POLICY "Users can create playlists" ON playlists FOR INSERT WITH CHECK (auth.uid() = user_id);

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
```

5. Создайте Storage buckets в Supabase:
   - `audio` (для аудиофайлов)
   - `covers` (для обложек)

Настройте публичный доступ для обоих buckets.

6. Настройте Google OAuth в Supabase:
   - Перейдите в Authentication > Providers
   - Включите Google Provider
   - Добавьте Client ID и Client Secret из Google Cloud Console

7. Создайте файл `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

8. Запустите проект:

```bash
npm run dev
```

## 🚀 Деплой на Vercel

1. Загрузите проект на GitHub
2. Импортируйте проект в [Vercel](https://vercel.com)
3. Добавьте переменные окружения (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
4. Деплой!

## 📱 Структура проекта

```
├── app/
│   ├── auth/          # Страницы авторизации
│   ├── library/       # Библиотека пользователя
│   ├── upload/        # Загрузка треков
│   ├── search/        # Поиск
│   ├── playlists/     # Плейлисты
│   ├── liked/         # Любимые треки
│   ├── album/[id]/    # Страница альбома
│   └── playlist/[id]/ # Страница плейлиста
├── components/        # React компоненты
├── lib/              # Утилиты и типы
└── public/           # Статические файлы
```

## 🎨 Дизайн

Приложение использует темную тему в стиле Spotify с акцентным зеленым цветом (#1DB954).

## 📝 Лицензия

MIT
