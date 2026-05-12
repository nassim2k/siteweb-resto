'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Table, Room } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { CardSkeleton } from '@/components/ui/Skeleton'

export default function AdminTables() {
  const supabase = createClient()
  const { toast } = useToast()
  const [tables, setTables] = useState<Table[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Table | null>(null)
  const [form, setForm] = useState({ room_id: '', name: '', shape: 'circle', capacity: 4, pos_x: 100, pos_y: 100, width: 60, height: 60 })
  const [loading, setLoading] = useState(false)
  const [roomsLoading, setRoomsLoading] = useState(true)

  useEffect(() => {
    supabase.from('rooms').select('*').order('name').then(({ data }) => {
      if (data) setRooms(data)
      setRoomsLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!selectedRoom) return
    supabase.from('tables_resto').select('*').eq('room_id', selectedRoom).order('name').then(({ data }) => {
      if (data) setTables(data)
    })
  }, [selectedRoom])

  const openCreate = () => {
    setEditing(null)
    setForm({ room_id: selectedRoom, name: '', shape: 'circle', capacity: 4, pos_x: 100, pos_y: 100, width: 60, height: 60 })
    setModalOpen(true)
  }

  const openEdit = (table: Table) => {
    setEditing(table)
    setForm({ room_id: table.room_id, name: table.name, shape: table.shape, capacity: table.capacity, pos_x: table.pos_x, pos_y: table.pos_y, width: table.width, height: table.height })
    setModalOpen(true)
  }

  const handleSave = async () => {
    setLoading(true)
    if (editing) {
      await supabase.from('tables_resto').update(form).eq('id', editing.id)
      toast('Table modifiée')
    } else {
      await supabase.from('tables_resto').insert(form)
      toast('Table créée')
    }
    setModalOpen(false)
    setLoading(false)
    if (selectedRoom) {
      const { data } = await supabase.from('tables_resto').select('*').eq('room_id', selectedRoom).order('name')
      if (data) setTables(data)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette table ?')) return
    await supabase.from('tables_resto').delete().eq('id', id)
    toast('Table supprimée')
    if (selectedRoom) {
      const { data } = await supabase.from('tables_resto').select('*').eq('room_id', selectedRoom).order('name')
      if (data) setTables(data)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des tables</h1>
        {selectedRoom && <Button onClick={openCreate}><Plus size={18} /> Ajouter</Button>}
      </div>

      {roomsLoading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ minHeight: 400 }} />
        </div>
      ) : (
        <>
          <select className="w-full rounded-lg border border-gray-300 px-4 py-2.5 mb-6" value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}>
            <option value="">Sélectionnez une salle</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>

          {selectedRoom ? (
            <div className="bg-white rounded-2xl p-4 shadow-sm relative" style={{ minHeight: 400 }}>
              {tables.length === 0 ? (
                <p className="text-gray-400 text-center py-20">Aucune table dans cette salle</p>
              ) : (
                tables.map(table => (
                  <div key={table.id} className="absolute flex items-center justify-center cursor-pointer group" style={{
                    left: table.pos_x, top: table.pos_y,
                    width: table.shape === 'rectangle' ? table.width * 1.5 : table.width,
                    height: table.height,
                    borderRadius: table.shape === 'circle' ? '50%' : '8px',
                    backgroundColor: table.status === 'free' ? '#22C55E' : '#F97316',
                    color: 'white', fontSize: 11, fontWeight: 600,
                  }}>
                    <div className="text-center pointer-events-none">
                      <div>{table.name}</div>
                      <div>{table.capacity}p</div>
                    </div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex gap-1">
                      <button onClick={() => openEdit(table)} className="p-1 bg-white rounded shadow text-gray-600 hover:text-blue-500"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(table.id)} className="p-1 bg-white rounded shadow text-gray-600 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-20">Sélectionnez une salle pour gérer ses tables</p>
          )}
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier' : 'Nouvelle table'}>
        <div className="space-y-4">
          <Input label="Nom" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Forme</label>
            <select className="w-full rounded-lg border border-gray-300 px-4 py-2.5" value={form.shape} onChange={e => setForm({ ...form, shape: e.target.value })}>
              <option value="circle">Cercle</option>
              <option value="square">Carré</option>
              <option value="rectangle">Rectangle</option>
            </select>
          </div>
          <Input label="Capacité" type="number" min={1} value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Position X" type="number" value={form.pos_x} onChange={e => setForm({ ...form, pos_x: Number(e.target.value) })} />
            <Input label="Position Y" type="number" value={form.pos_y} onChange={e => setForm({ ...form, pos_y: Number(e.target.value) })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Largeur" type="number" value={form.width} onChange={e => setForm({ ...form, width: Number(e.target.value) })} />
            <Input label="Hauteur" type="number" value={form.height} onChange={e => setForm({ ...form, height: Number(e.target.value) })} />
          </div>
          <Button onClick={handleSave} disabled={loading || !form.name} className="w-full">{loading ? 'Sauvegarde...' : 'Sauvegarder'}</Button>
        </div>
      </Modal>
    </div>
  )
}
