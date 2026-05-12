'use client'

import { useEffect, useState } from 'react'
import { Shield, ShieldOff, Trash2, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { TableRowSkeleton } from '@/components/ui/Skeleton'

export default function AdminComptes() {
  const supabase = createClient()
  const { toast } = useToast()
  const [profiles, setProfiles] = useState<Profile[] | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', is_admin: false })
  const [loading, setLoading] = useState(false)

  async function fetchProfiles() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (data) setProfiles(data)
  }

  useEffect(() => { fetchProfiles() }, [])

  const toggleAdmin = async (profile: Profile) => {
    const { error } = await supabase.from('profiles').update({ is_admin: !profile.is_admin }).eq('id', profile.id)
    if (!error) { fetchProfiles(); toast(profile.is_admin ? 'Rétrogradé client' : 'Promu admin') }
  }

  const deleteProfile = async (id: string) => {
    if (!confirm('Supprimer définitivement ce compte ?')) return
    await supabase.from('profiles').delete().eq('id', id)
    await supabase.auth.admin.deleteUser(id)
    toast('Compte supprimé')
    fetchProfiles()
  }

  const createAccount = async () => {
    setLoading(true)
    const { data, error } = await supabase.auth.admin.createUser({ email: form.email, password: form.password, email_confirm: true })
    if (error) { toast(error.message, 'error'); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').update({ is_admin: form.is_admin }).eq('id', data.user.id)
    }
    setModalOpen(false); setLoading(false); fetchProfiles(); toast('Compte créé')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des comptes</h1>
        <Button onClick={() => { setForm({ email: '', password: '', is_admin: false }); setModalOpen(true) }}><Plus size={18} /> Compte</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-sm font-bold text-gray-600">
          <div className="col-span-5">Email</div>
          <div className="col-span-2">Rôle</div>
          <div className="col-span-3">Créé le</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        {!profiles ? (
          Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
        ) : profiles.length === 0 ? (
          <p className="text-center py-8 text-gray-400">Aucun compte</p>
        ) : profiles.map(p => (
          <div key={p.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-t items-center hover:bg-gray-50">
            <div className="col-span-5 font-medium truncate">{p.email}</div>
            <div className="col-span-2">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${p.is_admin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                {p.is_admin ? 'Admin' : 'Client'}
              </span>
            </div>
            <div className="col-span-3 text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString('fr-FR')}</div>
            <div className="col-span-2 flex justify-end gap-1">
              <button onClick={() => toggleAdmin(p)} className={`p-2 rounded-lg hover:bg-gray-100 ${p.is_admin ? 'text-purple-600' : 'text-gray-400'}`} title={p.is_admin ? 'Rétrograder' : 'Promouvoir admin'}>
                {p.is_admin ? <Shield size={16} /> : <ShieldOff size={16} />}
              </button>
              <button onClick={() => deleteProfile(p.id)} className="p-2 rounded-lg hover:bg-gray-100 text-red-400" title="Supprimer"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nouveau compte">
        <div className="space-y-4">
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemple.com" />
          <Input label="Mot de passe" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_admin} onChange={e => setForm({ ...form, is_admin: e.target.checked })} className="w-4 h-4" />
            <span className="text-sm font-medium">Administrateur</span>
          </label>
          <Button onClick={createAccount} disabled={loading || !form.email || !form.password} className="w-full">{loading ? 'Création...' : 'Créer le compte'}</Button>
        </div>
      </Modal>
    </div>
  )
}
