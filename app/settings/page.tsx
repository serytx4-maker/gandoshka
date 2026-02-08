'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Upload, Loader2, User } from 'lucide-react'
import Image from 'next/image'

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    bio: '',
    avatar_url: '',
    banner_url: '',
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setFormData({
          username: data.username || '',
          display_name: data.display_name || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          banner_url: data.banner_url || '',
        })
      } else {
        // Профиль не найден, установим дефолтные значения
        setFormData({
          username: user.email?.split('@')[0] || '',
          display_name: user.email?.split('@')[0] || '',
          bio: '',
          avatar_url: '',
          banner_url: '',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Установим дефолтные значения при ошибке
      setFormData({
        username: user.email?.split('@')[0] || '',
        display_name: user.email?.split('@')[0] || '',
        bio: '',
        avatar_url: '',
        banner_url: '',
      })
    }
  }

  const uploadFile = async (file: File, bucket: string, type: 'avatar' | 'banner') => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user!.id}_${type}.${fileExt}`
    const filePath = `${user!.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      let avatarUrl = formData.avatar_url
      let bannerUrl = formData.banner_url

      // Upload avatar
      if (avatarFile) {
        setUploading(true)
        avatarUrl = await uploadFile(avatarFile, 'covers', 'avatar')
      }

      // Upload banner
      if (bannerFile) {
        setUploading(true)
        bannerUrl = await uploadFile(bannerFile, 'covers', 'banner')
      }

      setUploading(false)

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: formData.username,
          display_name: formData.display_name,
          bio: formData.bio,
          avatar_url: avatarUrl,
          banner_url: bannerUrl,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast.success('Профиль обновлен!')
      
      // Перенаправляем на страницу профиля
      setTimeout(() => {
        router.push(`/profile/${formData.username}`)
      }, 500)
    } catch (error: any) {
      console.error('Update error:', error)
      toast.error(error.message || 'Ошибка при обновлении')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  if (!user) return null

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Настройки профиля</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div>
          <label className="block text-sm font-medium mb-2">Аватар</label>
          <div className="flex items-center gap-4">
            {formData.avatar_url || avatarFile ? (
              <Image
                src={avatarFile ? URL.createObjectURL(avatarFile) : formData.avatar_url}
                alt="Avatar"
                width={100}
                height={100}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-25 h-25 rounded-full bg-dark-100 flex items-center justify-center">
                <User className="w-12 h-12 text-gray-600" />
              </div>
            )}
            <div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="px-4 py-2 bg-dark-100 rounded-lg cursor-pointer hover:bg-dark-200 transition inline-block"
              >
                Выбрать файл
              </label>
              <p className="text-sm text-gray-500 mt-2">JPG, PNG (макс. 2MB)</p>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div>
          <label className="block text-sm font-medium mb-2">Баннер</label>
          <div className="space-y-2">
            {formData.banner_url || bannerFile ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden">
                <Image
                  src={bannerFile ? URL.createObjectURL(bannerFile) : formData.banner_url}
                  alt="Banner"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-40 bg-dark-100 rounded-lg flex items-center justify-center">
                <Upload className="w-12 h-12 text-gray-600" />
              </div>
            )}
            <div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                className="hidden"
                id="banner-upload"
              />
              <label
                htmlFor="banner-upload"
                className="px-4 py-2 bg-dark-100 rounded-lg cursor-pointer hover:bg-dark-200 transition inline-block"
              >
                Выбрать файл
              </label>
              <p className="text-sm text-gray-500 mt-2">JPG, PNG (макс. 5MB, рекомендуется 1500x500)</p>
            </div>
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Имя пользователя <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
            className="w-full px-4 py-3 bg-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="username"
            required
            pattern="[a-z0-9_]+"
            minLength={3}
            maxLength={20}
          />
          <p className="text-sm text-gray-500 mt-1">Только латиница, цифры и подчеркивание</p>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Отображаемое имя <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            className="w-full px-4 py-3 bg-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ваше имя"
            required
            maxLength={50}
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium mb-2">О себе</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-4 py-3 bg-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
            placeholder="Расскажите о себе..."
            maxLength={200}
          />
          <p className="text-sm text-gray-500 mt-1">{formData.bio.length}/200</p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full py-4 bg-primary text-white rounded-full font-semibold hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading || uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {uploading ? 'Загрузка файлов...' : 'Сохранение...'}
            </>
          ) : (
            'Сохранить изменения'
          )}
        </button>
      </form>
    </div>
  )
}
