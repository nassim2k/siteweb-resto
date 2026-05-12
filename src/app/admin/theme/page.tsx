'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Theme } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { UtensilsCrossed, Beef, Pizza, Coffee, Palette, Sparkles } from 'lucide-react'

const presets: Record<string, { label: string; icon: any; primary: string; secondary: string; accent: string; desc: string }> = {
  actuel: { label: 'Actuel', icon: Sparkles, primary: '#1e3a5f', secondary: '#f0c040', accent: '#e74c3c', desc: 'Thème par défaut' },
  gastronomie: { label: 'Gastronomie', icon: UtensilsCrossed, primary: '#0f1923', secondary: '#c8a45c', accent: '#6b1d2a', desc: 'Navy profond, or vieilli, bordeaux' },
  bistronomie: { label: 'Bistronomie', icon: Beef, primary: '#1a0a0a', secondary: '#b83227', accent: '#2d2d2d', desc: 'Noir rougeâtre, rouge profond, anthracite' },
  streetfood: { label: 'Streetfood', icon: Coffee, primary: '#2c1810', secondary: '#c4922a', accent: '#1a3c2a', desc: 'Brun foncé, or chaud, vert forêt' },
  pizza: { label: 'Pizza', icon: Pizza, primary: '#1a1f2e', secondary: '#c0392b', accent: '#e8d5b7', desc: 'Ardoise, rouge italien, crème' },
}

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
    hero_images: [] as string[],
  })
  const [saving, setSaving] = useState(false)
  const [activePreset, setActivePreset] = useState('personnalise')
  const [loadingBg, setLoadingBg] = useState<string | null>(null)

  const applyPreset = async (key: string, preset: typeof presets[string]) => {
    setActivePreset(key)
    setForm(f => ({ ...f, primary_color: preset.primary, secondary_color: preset.secondary, accent_color: preset.accent }))
    if (key !== 'actuel' && key !== 'personnalise') {
      setLoadingBg(key)
      try {
        const res = await fetch(`/api/theme-images?theme=${key}`)
        const data = await res.json()
        if (data.urls?.length) setForm(f => ({ ...f, background_image: data.urls[0], hero_images: data.urls }))
      } catch {}
      setLoadingBg(null)
    }
  }

  useEffect(() => {
    supabase.from('themes').select('*').single().then(({ data }) => {
      if (data) {
        setTheme(data)
        const colors = { primary_color: data.primary_color, secondary_color: data.secondary_color, accent_color: data.accent_color }
        setForm({ ...colors, site_name: data.site_name, logo_url: data.logo_url || '', background_image: data.background_image || '', hero_images: data.hero_images || [] })
        const match = Object.entries(presets).find(([, p]) => p.primary === colors.primary_color && p.secondary === colors.secondary_color && p.accent === colors.accent_color)
        setActivePreset(match?.[0] || 'personnalise')
      }
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('themes').update({
      ...form,
      logo_url: form.logo_url || null,
      background_image: form.background_image || null,
      hero_images: form.hero_images.length > 0 ? form.hero_images : undefined,
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

      {/* Sélecteur de thème */}
      <div className="bg-white rounded-2xl p-6 shadow-sm max-w-2xl mb-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Palette size={18} /> Thèmes prédéfinis</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(presets).map(([key, preset]) => {
            const Icon = preset.icon
            const isActive = activePreset === key
            return (
              <button key={key} onClick={() => applyPreset(key, preset)}
                className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                  isActive ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-gray-200 hover:border-gray-300'
                }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={18} className={isActive ? 'text-[var(--primary)]' : 'text-gray-500'} />
                  <span className={`font-bold text-sm ${isActive ? 'text-[var(--primary)]' : 'text-gray-800'}`}>{preset.label}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{preset.desc}</p>
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: preset.primary }} />
                  <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: preset.secondary }} />
                  <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: preset.accent }} />
                </div>
              </button>
            )
          })}
          <button onClick={() => setActivePreset('personnalise')}
            className={`relative p-4 rounded-xl border-2 text-left transition-all ${
              activePreset === 'personnalise' ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-dashed border-gray-300 hover:border-gray-400'
            }`}>
            <div className="flex items-center gap-2 mb-2">
              <Palette size={18} className={activePreset === 'personnalise' ? 'text-[var(--primary)]' : 'text-gray-500'} />
              <span className={`font-bold text-sm ${activePreset === 'personnalise' ? 'text-[var(--primary)]' : 'text-gray-800'}`}>Personnalisé</span>
            </div>
            <p className="text-xs text-gray-500">Choisissez vos couleurs librement</p>
          </button>
        </div>
      </div>

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
