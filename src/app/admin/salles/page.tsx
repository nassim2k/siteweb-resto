'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Room } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import ImageUpload from '@/components/ui/ImageUpload'
import { useToast } from '@/components/ui/Toast'
import { CardSkeleton } from '@/components/ui/Skeleton'

export default function AdminSalles() {
  const supabase = createClient()
  const { toast } = useToast()
  const [rooms, setRooms] = useState<Room[] | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Room | null>(null)
  const [form, setForm] = useState({ name: '', description: '', image_url: '' })
  const [loading, setLoading] = useState(false)

  async function fetchRooms() {
    const { data } = await supabase.from('rooms').select('*').order('sort_order')
    if (data) setRooms(data)
  }

  useEffect(() => { fetchRooms() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', description: '', image_url: '' })
    setModalOpen(true)
  }

  const openEdit = (room: Room) => {
    setEditing(room)
    setForm({ name: room.name, description: room.description || '', image_url: room.image_url || '' })
    setModalOpen(true)
  }

  const handleSave = async () => {
    setLoading(true)
    if (editing) {
      await supabase.from('rooms').update(form).eq('id', editing.id)
      toast('Salle modifiée')
    } else {
      await supabase.from('rooms').insert(form)
      toast('Salle créée')
    }
    setModalOpen(false)
    setLoading(false)
    fetchRooms()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette salle ?')) return
    await supabase.from('rooms').delete().eq('id', id)
    toast('Salle supprimée')
    fetchRooms()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des salles</h1>
        <Button onClick={openCreate}><Plus size={18} /> Ajouter</Button>
      </div>

      <div className="grid gap-4">
        {!rooms ? (
          Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
        ) : rooms.length === 0 ? (
          <p className="text-gray-400 text-center py-12">Aucune salle</p>
        ) : rooms.map(room => (
          <div key={room.id} className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm">
            {room.image_url && <img src={room.image_url} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold truncate">{room.name}</h3>
              {room.description && <p className="text-sm text-gray-500 truncate">{room.description}</p>}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => openEdit(room)}><Pencil size={16} /></Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(room.id)}><Trash2 size={16} className="text-red-500" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier' : 'Nouvelle salle'}>
        <div className="space-y-4">
          <Input label="Nom" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
            <ImageUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} onRemove={() => setForm({ ...form, image_url: '' })} folder="rooms" />
          </div>
          <Button onClick={handleSave} disabled={loading || !form.name} className="w-full">{loading ? 'Sauvegarde...' : 'Sauvegarder'}</Button>
        </div>
      </Modal>
    </div>
  )
}
