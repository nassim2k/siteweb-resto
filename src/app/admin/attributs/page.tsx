'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AttributeDefinition, AttributeOption } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'

export default function AdminAttributs() {
  const supabase = createClient()
  const { toast } = useToast()
  const [definitions, setDefinitions] = useState<(AttributeDefinition & { options: AttributeOption[] })[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [defModal, setDefModal] = useState(false)
  const [editDef, setEditDef] = useState<AttributeDefinition | null>(null)
  const [defName, setDefName] = useState('')
  const [defType, setDefType] = useState<'select' | 'text'>('select')
  const [optModal, setOptModal] = useState(false)
  const [editOpt, setEditOpt] = useState<AttributeOption | null>(null)
  const [optForm, setOptForm] = useState({ attribute_id: '', value: '', price_modifier: 0 })
  const [loading, setLoading] = useState(false)

  async function fetchDefs() {
    const { data: defs } = await supabase.from('attribute_definitions').select('*').order('sort_order')
    if (!defs) return
    const defsWithOpts: typeof definitions = []
    for (const d of defs) {
      const { data: opts } = await supabase.from('attribute_options').select('*').eq('attribute_id', d.id).order('sort_order')
      defsWithOpts.push({ ...d, options: opts || [] })
    }
    setDefinitions(defsWithOpts)
  }

  useEffect(() => { fetchDefs() }, [])

  const openCreateDef = () => { setEditDef(null); setDefName(''); setDefType('select'); setDefModal(true) }
  const openEditDef = (d: AttributeDefinition) => { setEditDef(d); setDefName(d.name); setDefType(d.type); setDefModal(true) }

  const saveDef = async () => {
    setLoading(true)
    if (editDef) {
      await supabase.from('attribute_definitions').update({ name: defName, type: defType }).eq('id', editDef.id)
    } else {
      await supabase.from('attribute_definitions').insert({ name: defName, type: defType })
    }
    setDefModal(false); setLoading(false); fetchDefs(); toast(editDef ? 'Attribut modifié' : 'Attribut créé')
  }

  const deleteDef = async (id: string) => {
    if (!confirm('Supprimer cet attribut et toutes ses options ?')) return
    await supabase.from('attribute_definitions').delete().eq('id', id)
    fetchDefs(); toast('Attribut supprimé')
  }

  const openCreateOpt = (attrId: string) => {
    setEditOpt(null); setOptForm({ attribute_id: attrId, value: '', price_modifier: 0 }); setOptModal(true)
  }

  const openEditOpt = (o: AttributeOption) => {
    setEditOpt(o); setOptForm({ attribute_id: o.attribute_id, value: o.value, price_modifier: o.price_modifier }); setOptModal(true)
  }

  const saveOpt = async () => {
    setLoading(true)
    if (editOpt) {
      await supabase.from('attribute_options').update({ value: optForm.value, price_modifier: optForm.price_modifier }).eq('id', editOpt.id)
    } else {
      await supabase.from('attribute_options').insert(optForm)
    }
    setOptModal(false); setLoading(false); fetchDefs(); toast(editOpt ? 'Option modifiée' : 'Option créée')
  }

  const deleteOpt = async (id: string) => {
    await supabase.from('attribute_options').delete().eq('id', id)
    fetchDefs(); toast('Option supprimée')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Attributs produits</h1>
        <Button onClick={openCreateDef}><Plus size={18} /> Attribut</Button>
      </div>

      <div className="space-y-3">
        {definitions.map(def => (
          <div key={def.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpanded(expanded === def.id ? null : def.id)}>
              <div className="flex items-center gap-3">
                {def.type === 'select' ? (expanded === def.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />) : <div className="w-[18px]" />}
                <span className="font-bold">{def.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${def.type === 'text' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {def.type === 'text' ? 'Texte' : `Sélection (${def.options.length})`}
                </span>
              </div>
              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="sm" onClick={() => openEditDef(def)}><Pencil size={15} /></Button>
                <Button variant="ghost" size="sm" onClick={() => deleteDef(def.id)}><Trash2 size={15} className="text-red-500" /></Button>
              </div>
            </div>
            {expanded === def.id && def.type === 'select' && (
              <div className="border-t px-4 py-3 space-y-2">
                {def.options.map(opt => (
                  <div key={opt.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <div>
                      <span className="font-medium">{opt.value}</span>
                      {opt.price_modifier > 0 && <span className="text-sm text-gray-500 ml-2">+{opt.price_modifier}€</span>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEditOpt(opt)} className="p-1 hover:bg-gray-200 rounded"><Pencil size={14} /></button>
                      <button onClick={() => deleteOpt(opt.id)} className="p-1 hover:bg-gray-200 rounded"><Trash2 size={14} className="text-red-500" /></button>
                    </div>
                  </div>
                ))}
                {def.options.length === 0 && <p className="text-sm text-gray-400">Aucune option</p>}
                <Button size="sm" variant="ghost" onClick={() => openCreateOpt(def.id)}><Plus size={14} /> Option</Button>
              </div>
            )}
            {expanded === def.id && def.type === 'text' && (
              <div className="border-t px-4 py-6 text-center text-sm text-gray-400">
                Attribut de type texte — configurable dans chaque produit
              </div>
            )}
          </div>
        ))}
        {definitions.length === 0 && <p className="text-gray-400 text-center py-12">Aucun attribut défini</p>}
      </div>

      <Modal isOpen={defModal} onClose={() => setDefModal(false)} title={editDef ? 'Modifier' : 'Nouvel attribut'}>
        <div className="space-y-4">
          <Input label="Nom de l'attribut" value={defName} onChange={e => setDefName(e.target.value)} placeholder="ex: Taille, Cuisson, Supplément" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg flex-1 has-[:checked]:border-[var(--primary)] has-[:checked]:bg-[var(--primary)]/5">
                <input type="radio" name="defType" value="select" checked={defType === 'select'} onChange={() => setDefType('select')} className="w-4 h-4" />
                <div>
                  <p className="font-medium text-sm">Sélection</p>
                  <p className="text-xs text-gray-500">Options prédéfinies</p>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg flex-1 has-[:checked]:border-[var(--primary)] has-[:checked]:bg-[var(--primary)]/5">
                <input type="radio" name="defType" value="text" checked={defType === 'text'} onChange={() => setDefType('text')} className="w-4 h-4" />
                <div>
                  <p className="font-medium text-sm">Texte</p>
                  <p className="text-xs text-gray-500">Zone de texte libre</p>
                </div>
              </label>
            </div>
          </div>
          <Button onClick={saveDef} disabled={loading || !defName} className="w-full">Sauvegarder</Button>
        </div>
      </Modal>

      <Modal isOpen={optModal} onClose={() => setOptModal(false)} title={editOpt ? 'Modifier' : 'Nouvelle option'}>
        <div className="space-y-4">
          <Input label="Valeur" value={optForm.value} onChange={e => setOptForm({ ...optForm, value: e.target.value })} placeholder="ex: Petite, Grande, À point" />
          <Input label="Supplément de prix (€)" type="number" step="0.01" min="0" value={optForm.price_modifier} onChange={e => setOptForm({ ...optForm, price_modifier: Number(e.target.value) })} />
          <Button onClick={saveOpt} disabled={loading || !optForm.value} className="w-full">Sauvegarder</Button>
        </div>
      </Modal>
    </div>
  )
}
