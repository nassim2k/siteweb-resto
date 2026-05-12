'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ImageUploadProps {
  bucket?: string
  folder?: string
  value?: string | null
  onChange: (url: string) => void
  onRemove?: () => void
}

export default function ImageUpload({
  bucket = 'restaurant-images',
  folder = 'public',
  value,
  onChange,
  onRemove,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    setPreview(publicUrl)
    onChange(publicUrl)
    setUploading(false)
  }

  const handleRemove = () => {
    setPreview(null)
    onRemove?.()
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {preview ? (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-gray-200">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-40 rounded-lg border-2 border-dashed border-gray-300 hover:border-[var(--primary)] flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[var(--primary)] transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 size={24} className="animate-spin" />
              <span className="text-sm">Upload en cours...</span>
            </>
          ) : (
            <>
              <Upload size={24} />
              <span className="text-sm">Cliquez pour uploader</span>
              <span className="text-xs">PNG, JPG, WEBP</span>
            </>
          )}
        </button>
      )}
      {value && !preview && (
        <p className="text-xs text-gray-400 break-all">{value}</p>
      )}
    </div>
  )
}
