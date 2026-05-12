'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Theme } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function AdminTheme() {
  const supabase = createClient()
  const [theme, setTheme] = useState<Theme | null>(null)
  const [form, setForm] = useState({
    primary_color: '#1e3a5f',
    secondary_color: '#f0c040',
    accent_color: '#e74c3c',
    site_name: 'Mon Restaurant',
    logo_url: '',
    background_image: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('themes').select('*').single().then(({ data }) => {
      if (data) {
        setTheme(data)
        setForm({
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          accent_color: data.accent_color,
          site_name: data.site_name,
          logo_url: data.logo_url || '',
          background_image: data.background_image || '',
        })
      }
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('themes').update({
      ...form,
      logo_url: form.logo_url || null,
      background_image: form.background_image || null,
    }).eq('id', theme?.id)
    setSaving(false)
  }

  const inputStyle = {
    width: 60,
    height: 40,
    borderRadius: 8,
    border: '2px solid #e5e7eb',
    cursor: 'pointer',
    padding: 2,
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Personnalisation du thème</h1>

      <div className="bg-white rounded-2xl p-8 shadow-sm max-w-2xl">
        <div className="space-y-6">
          {/* Couleurs */}
          <div>
            <h3 className="font-bold mb-4">Couleurs</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Couleur principale</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.primary_color}
                    onChange={e => setForm({ ...form, primary_color: e.target.value })}
                    style={inputStyle}
                  />
                  <span className="text-sm font-mono">{form.primary_color}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Couleur secondaire</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.secondary_color}
                    onChange={e => setForm({ ...form, secondary_color: e.target.value })}
                    style={inputStyle}
                  />
                  <span className="text-sm font-mono">{form.secondary_color}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Couleur d'accent</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.accent_color}
                    onChange={e => setForm({ ...form, accent_color: e.target.value })}
                    style={inputStyle}
                  />
                  <span className="text-sm font-mono">{form.accent_color}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Aperçu */}
          <div className="p-4 rounded-xl border" style={{ backgroundColor: form.primary_color + '15' }}>
            <p className="text-sm font-medium mb-2">Aperçu des couleurs :</p>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded" style={{ backgroundColor: form.primary_color }} />
              <div className="w-8 h-8 rounded" style={{ backgroundColor: form.secondary_color }} />
              <div className="w-8 h-8 rounded" style={{ backgroundColor: form.accent_color }} />
            </div>
          </div>

          {/* Informations */}
          <div>
            <h3 className="font-bold mb-4">Informations</h3>
            <Input
              label="Nom du site"
              value={form.site_name}
              onChange={e => setForm({ ...form, site_name: e.target.value })}
            />
          </div>

          {/* Images */}
          <div>
            <h3 className="font-bold mb-4">Images</h3>
            <div className="space-y-4">
              <Input
                label="URL du logo"
                value={form.logo_url}
                onChange={e => setForm({ ...form, logo_url: e.target.value })}
                placeholder="https://..."
              />
              {form.logo_url && (
                <img src={form.logo_url} alt="Logo preview" className="h-16 object-contain" />
              )}
              <Input
                label="URL de l'image de fond"
                value={form.background_image}
                onChange={e => setForm({ ...form, background_image: e.target.value })}
                placeholder="https://..."
              />
              {form.background_image && (
                <div className="h-32 rounded-lg overflow-hidden">
                  <img src={form.background_image} alt="Background preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Sauvegarde...' : 'Sauvegarder le thème'}
          </Button>
        </div>
      </div>
    </div>
  )
}
