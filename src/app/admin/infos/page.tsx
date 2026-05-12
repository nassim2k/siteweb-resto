'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Theme } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { MapPin, Phone, Mail, Clock, Link as LinkIcon } from 'lucide-react'

export default function AdminInfos() {
  const supabase = createClient()
  const { toast } = useToast()
  const [theme, setTheme] = useState<Theme | null>(null)
  const [form, setForm] = useState({
    address: '',
    phone: '',
    contact_email: '',
    hours: '',
    location_url: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('themes').select('*').single().then(({ data }) => {
      if (data) {
        setTheme(data)
        setForm({
          address: data.address || '',
          phone: data.phone || '',
          contact_email: data.contact_email || '',
          hours: data.hours || '',
          location_url: data.location_url || '',
        })
      }
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('themes').update({
      address: form.address || null,
      phone: form.phone || null,
      contact_email: form.contact_email || null,
      hours: form.hours || null,
      location_url: form.location_url || null,
    }).eq('id', theme?.id)
    if (error) {
      toast("Erreur : les colonnes n'existent pas encore dans la base", 'error')
    } else {
      toast('Informations sauvegardées')
    }
    setSaving(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Informations de l'établissement</h1>
      <p className="text-sm text-gray-500 mb-6">Ces informations seront affichées sur la page d'accueil.</p>

      <div className="bg-white rounded-2xl p-8 shadow-sm max-w-2xl">
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b">
            <MapPin size={20} className="text-[var(--primary)]" />
            <span className="font-bold">Adresse</span>
          </div>
          <Input
            label="Adresse"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder="122 Rue du Restaurant, 75000 Paris"
          />

          <div className="flex items-center gap-3 pb-4 border-b">
            <Phone size={20} className="text-[var(--primary)]" />
            <span className="font-bold">Téléphone</span>
          </div>
          <Input
            label="Numéro de téléphone"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="01 23 45 67 89"
          />

          <div className="flex items-center gap-3 pb-4 border-b">
            <Mail size={20} className="text-[var(--primary)]" />
            <span className="font-bold">Email</span>
          </div>
          <Input
            label="Email de contact"
            value={form.contact_email}
            onChange={e => setForm({ ...form, contact_email: e.target.value })}
            placeholder="contact@restaurant.fr"
          />

          <div className="flex items-center gap-3 pb-4 border-b">
            <Clock size={20} className="text-[var(--primary)]" />
            <span className="font-bold">Horaires</span>
          </div>
          <Input
            label="Horaires d'ouverture"
            value={form.hours}
            onChange={e => setForm({ ...form, hours: e.target.value })}
            placeholder="Lun-Sam : 12h-14h · 19h-22h"
          />

          <div className="flex items-center gap-3 pb-4 border-b">
            <LinkIcon size={20} className="text-[var(--primary)]" />
            <span className="font-bold">Localisation (Google Maps)</span>
          </div>
          <Input
            label="URL Google Maps"
            value={form.location_url}
            onChange={e => setForm({ ...form, location_url: e.target.value })}
            placeholder="https://maps.google.com/?q=..."
          />

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>
    </div>
  )
}
