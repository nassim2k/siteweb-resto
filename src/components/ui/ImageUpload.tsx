'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  folder?: string
  value?: string | null
  onChange: (url: string) => void
  onRemove?: () => void
}

function compressImage(file: File, maxW = 1200): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > maxW) { height = height * maxW / width; width = maxW }
      canvas.width = width; canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('Compression failed')), 'image/jpeg', 0.8)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export default function ImageUpload({ folder = 'public', value, onChange, onRemove }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const compressed = await compressImage(file)
      const formData = new FormData()
      formData.append('file', compressed, file.name.replace(/\.[^.]+$/, '.jpg'))
      formData.append('folder', folder)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) { alert('Erreur: ' + (data.error || res.statusText)); setUploading(false); return }
      if (!data.url) { alert('Erreur: URL vide'); setUploading(false); return }

      setPreview(data.url)
      onChange(data.url)
    } catch (err) {
      alert('Erreur: ' + String(err))
    }
    setUploading(false)
  }

  const handleRemove = () => {
    setPreview(null); onRemove?.()
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {preview ? (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-gray-200">
          <img src={preview} alt="" className="w-full h-full object-cover" />
          <button type="button" onClick={handleRemove} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"><X size={14} /></button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="w-full h-40 rounded-lg border-2 border-dashed border-gray-300 hover:border-[var(--primary)] flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[var(--primary)] transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <><Loader2 size={24} className="animate-spin" /><span className="text-sm">Compression...</span></>
          ) : (
            <><Upload size={24} /><span className="text-sm">Cliquez pour uploader</span><span className="text-xs">PNG, JPG, WEBP</span></>
          )}
        </button>
      )}
      {value && !preview && <p className="text-xs text-gray-400 break-all">{value}</p>}
    </div>
  )
}
