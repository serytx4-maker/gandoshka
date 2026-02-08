'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Upload, Music, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Album } from '@/lib/types'

export default function UploadPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [loading, setLoading] = useState(false)
  const [albums, setAlbums] = useState<Album[]>([])

  const [formData, setFormData] = useState({
    title: '',
    lyrics: '',
    albumId: '',
    newAlbumTitle: '',
  })

  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    fetchAlbums()
  }, [user])

  const fetchAlbums = async () => {
    if (!user) return
    const { data } = await supabase
      .from('albums')
      .select('*')
      .eq('artist_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setAlbums(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !audioFile) return

    setLoading(true)

    try {
      let albumId = formData.albumId

      // Create new album if needed
      if (formData.newAlbumTitle && !albumId) {
        let albumCoverUrl = null

        if (coverFile) {
          const coverExt = coverFile.name.split('.').pop()
          const coverPath = `${user.id}/${Date.now()}_album.${coverExt}`
          const { error: coverError } = await supabase.storage
            .from('covers')
            .upload(coverPath, coverFile)

          if (coverError) throw coverError

          const { data: { publicUrl } } = supabase.storage
            .from('covers')
            .getPublicUrl(coverPath)

          albumCoverUrl = publicUrl
        }

        const { data: albumData, error: albumError } = await supabase
          .from('albums')
          .insert({
            title: formData.newAlbumTitle,
            artist_id: user.id,
            artist_name: user.email?.split('@')[0] || 'Unknown',
            cover_url: albumCoverUrl,
          })
          .select()
          .single()

        if (albumError) throw albumError
        albumId = albumData.id
      }

      // Upload audio file
      const audioExt = audioFile.name.split('.').pop()
      const audioPath = `${user.id}/${Date.now()}.${audioExt}`
      const { error: audioError } = await supabase.storage
        .from('audio')
        .upload(audioPath, audioFile)

      if (audioError) throw audioError

      const { data: { publicUrl: audioUrl } } = supabase.storage
        .from('audio')
        .getPublicUrl(audioPath)

      // Upload cover if provided and no album
      let trackCoverUrl = null
      if (coverFile && !albumId) {
        const coverExt = coverFile.name.split('.').pop()
        const coverPath = `${user.id}/${Date.now()}.${coverExt}`
        const { error: coverError } = await supabase.storage
          .from('covers')
          .upload(coverPath, coverFile)

        if (coverError) throw coverError

        const { data: { publicUrl } } = supabase.storage
          .from('covers')
          .getPublicUrl(coverPath)

        trackCoverUrl = publicUrl
      }

      // Create track record
      const { error: trackError } = await supabase.from('tracks').insert({
        title: formData.title,
        artist_id: user.id,
        artist_name: user.email?.split('@')[0] || 'Unknown',
        album_id: albumId || null,
        audio_url: audioUrl,
        cover_url: trackCoverUrl,
        lyrics: formData.lyrics || null,
      })

      if (trackError) throw trackError

      toast.success('Трек успешно загружен!')
      router.push('/library')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Ошибка при загрузке')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Загрузить трек</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Audio File */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Аудиофайл <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-primary transition">
            <input
              type="file"
              accept="audio/mp3,audio/wav,audio/mpeg"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              className="hidden"
              id="audio-upload"
              required
            />
            <label htmlFor="audio-upload" className="cursor-pointer">
              <Music className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400">
                {audioFile ? audioFile.name : 'Нажмите для выбора аудиофайла'}
              </p>
              <p className="text-sm text-gray-500 mt-2">MP3, WAV (макс. 50MB)</p>
            </label>
          </div>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium mb-2">Обложка</label>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-primary transition">
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="hidden"
              id="cover-upload"
            />
            <label htmlFor="cover-upload" className="cursor-pointer">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400">
                {coverFile ? coverFile.name : 'Нажмите для выбора обложки'}
              </p>
              <p className="text-sm text-gray-500 mt-2">JPG, PNG (макс. 5MB)</p>
            </label>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Название трека <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 bg-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Введите название трека"
            required
          />
        </div>

        {/* Lyrics */}
        <div>
          <label className="block text-sm font-medium mb-2">Текст песни</label>
          <textarea
            value={formData.lyrics}
            onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
            className="w-full px-4 py-3 bg-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[200px]"
            placeholder="Введите текст песни..."
          />
        </div>

        {/* Album Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Альбом</label>
          <select
            value={formData.albumId}
            onChange={(e) => setFormData({ ...formData, albumId: e.target.value })}
            className="w-full px-4 py-3 bg-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Без альбома</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title}
              </option>
            ))}
          </select>
        </div>

        {/* New Album */}
        {!formData.albumId && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Или создать новый альбом
            </label>
            <input
              type="text"
              value={formData.newAlbumTitle}
              onChange={(e) => setFormData({ ...formData, newAlbumTitle: e.target.value })}
              className="w-full px-4 py-3 bg-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Название нового альбома"
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !audioFile}
          className="w-full py-4 bg-primary text-white rounded-full font-semibold hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Загрузка...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Загрузить трек
            </>
          )}
        </button>
      </form>
    </div>
  )
}
