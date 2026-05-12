'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ProductFamily, Product, AttributeDefinition } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import ImageUpload from '@/components/ui/ImageUpload'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { CardSkeleton } from '@/components/ui/Skeleton'

export default function AdminCatalogue() {
  const supabase = createClient()
  const { toast } = useToast()
  const [families, setFamilies] = useState<ProductFamily[] | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [activeFamily, setActiveFamily] = useState<string | null>(null)
  const [familyModal, setFamilyModal] = useState(false)
  const [productModal, setProductModal] = useState(false)
  const [editFamily, setEditFamily] = useState<ProductFamily | null>(null)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [familyForm, setFamilyForm] = useState({ name: '', description: '', image_url: '' })
  const [productForm, setProductForm] = useState({ family_id: '', name: '', description: '', price: 0, image_url: '' })
  const [loading, setLoading] = useState(false)
  const [allAttributes, setAllAttributes] = useState<AttributeDefinition[]>([])
  const [selectedAttrIds, setSelectedAttrIds] = useState<string[]>([])
  const [attrTextValues, setAttrTextValues] = useState<Record<string, string>>({})

  useEffect(() => {
    supabase.from('product_families').select('*').order('sort_order').then(({ data }) => {
      if (data) setFamilies(data)
    })
  }, [])

  useEffect(() => {
    if (!activeFamily) { setProducts([]); return }
    supabase.from('products').select('*').eq('family_id', activeFamily).order('name').then(({ data }) => {
      if (data) setProducts(data)
    })
  }, [activeFamily])

  const fetchAttributes = async () => {
    const { data } = await supabase.from('attribute_definitions').select('*').order('sort_order')
    if (data) setAllAttributes(data)
  }

  const openCreateFamily = () => {
    setEditFamily(null)
    setFamilyForm({ name: '', description: '', image_url: '' })
    setFamilyModal(true)
  }

  const openEditFamily = (f: ProductFamily) => {
    setEditFamily(f)
    setFamilyForm({ name: f.name, description: f.description || '', image_url: f.image_url || '' })
    setFamilyModal(true)
  }

  const saveFamily = async () => {
    setLoading(true)
    if (editFamily) {
      await supabase.from('product_families').update(familyForm).eq('id', editFamily.id)
      toast('Famille modifiée')
    } else {
      await supabase.from('product_families').insert(familyForm)
      toast('Famille créée')
    }
    setFamilyModal(false)
    setLoading(false)
    const { data } = await supabase.from('product_families').select('*').order('sort_order')
    if (data) setFamilies(data)
  }

  const deleteFamily = async (id: string) => {
    if (!confirm('Supprimer cette famille ?')) return
    await supabase.from('product_families').delete().eq('id', id)
    toast('Famille supprimée')
    const { data } = await supabase.from('product_families').select('*').order('sort_order')
    if (data) setFamilies(data)
  }

  const openCreateProduct = async () => {
    setEditProduct(null)
    setProductForm({ family_id: activeFamily || '', name: '', description: '', price: 0, image_url: '' })
    setSelectedAttrIds([])
    setAttrTextValues({})
    await fetchAttributes()
    setProductModal(true)
  }

  const openEditProduct = async (p: Product) => {
    setEditProduct(p)
    setProductForm({ family_id: p.family_id, name: p.name, description: p.description || '', price: p.price, image_url: p.image_url || '' })
    await fetchAttributes()
    const { data } = await supabase.from('product_attributes').select('attribute_id, value').eq('product_id', p.id)
    setSelectedAttrIds(data ? data.map(a => a.attribute_id) : [])
    const textVals: Record<string, string> = {}
    if (data) data.forEach(a => { if (a.value) textVals[a.attribute_id] = a.value })
    setAttrTextValues(textVals)
    setProductModal(true)
  }

  const saveProduct = async () => {
    setLoading(true)
    let productId: string | null = null
    if (editProduct) {
      await supabase.from('products').update(productForm).eq('id', editProduct.id)
      productId = editProduct.id
      toast('Produit modifié')
    } else {
      const { data } = await supabase.from('products').insert(productForm).select().single()
      if (data) productId = data.id
      toast('Produit créé')
    }
    if (productId) {
      await supabase.from('product_attributes').delete().eq('product_id', productId)
      if (selectedAttrIds.length > 0) {
        await supabase.from('product_attributes').insert(
          selectedAttrIds.map(aid => ({
            product_id: productId,
            attribute_id: aid,
            value: attrTextValues[aid] || null,
          }))
        )
      }
    }
    setProductModal(false)
    setLoading(false)
    if (activeFamily) {
      const { data } = await supabase.from('products').select('*').eq('family_id', activeFamily).order('name')
      if (data) setProducts(data)
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return
    await supabase.from('products').delete().eq('id', id)
    toast('Produit supprimé')
    if (activeFamily) {
      const { data } = await supabase.from('products').select('*').eq('family_id', activeFamily).order('name')
      if (data) setProducts(data)
    }
  }

  const toggleAttr = (id: string) => {
    setSelectedAttrIds(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Catalogue</h1>
        <Button onClick={openCreateFamily}><Plus size={18} /> Famille</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          {!families ? (
            Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          ) : families.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucune famille</p>
          ) : families.map(f => (
            <div key={f.id} className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between ${activeFamily === f.id ? 'bg-[var(--primary)] text-white' : 'bg-white hover:bg-gray-50'}`} onClick={() => setActiveFamily(f.id)}>
              <div className="min-w-0">
                <p className="font-medium truncate">{f.name}</p>
                {f.description && <p className="text-xs opacity-70 truncate">{f.description}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={(e) => { e.stopPropagation(); openEditFamily(f) }} className="p-1 hover:opacity-70"><Pencil size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); deleteFamily(f.id) }} className="p-1 hover:opacity-70"><Trash2 size={14} className="text-red-400" /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-3">
          {activeFamily ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Produits</h2>
                <Button size="sm" onClick={openCreateProduct}><Plus size={16} /> Ajouter</Button>
              </div>
              <div className="grid gap-3">
                {products.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Aucun produit dans cette famille</p>
                ) : products.map(p => (
                  <div key={p.id} className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm">
                    {p.image_url && <img src={p.image_url} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{p.name}</h3>
                      {p.description && <p className="text-sm text-gray-500 truncate">{p.description}</p>}
                      <p className="text-sm font-bold text-[var(--primary)] mt-1">{formatPrice(p.price)}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => openEditProduct(p)} className="p-1 hover:bg-gray-100 rounded"><Pencil size={16} /></button>
                      <button onClick={() => deleteProduct(p.id)} className="p-1 hover:bg-gray-100 rounded"><Trash2 size={16} className="text-red-500" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-center py-20">Sélectionnez une famille</p>
          )}
        </div>
      </div>

      <Modal isOpen={familyModal} onClose={() => setFamilyModal(false)} title={editFamily ? 'Modifier' : 'Nouvelle famille'}>
        <div className="space-y-4">
          <Input label="Nom" value={familyForm.name} onChange={e => setFamilyForm({ ...familyForm, name: e.target.value })} />
          <Input label="Description" value={familyForm.description} onChange={e => setFamilyForm({ ...familyForm, description: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
            <ImageUpload value={familyForm.image_url} onChange={(url) => setFamilyForm({ ...familyForm, image_url: url })} onRemove={() => setFamilyForm({ ...familyForm, image_url: '' })} folder="families" />
          </div>
          <Button onClick={saveFamily} disabled={loading || !familyForm.name} className="w-full">Sauvegarder</Button>
        </div>
      </Modal>

      <Modal isOpen={productModal} onClose={() => setProductModal(false)} title={editProduct ? 'Modifier' : 'Nouveau produit'}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <Input label="Nom" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
          <Input label="Description" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} />
          <Input label="Prix (€)" type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
            <ImageUpload value={productForm.image_url} onChange={(url) => setProductForm({ ...productForm, image_url: url })} onRemove={() => setProductForm({ ...productForm, image_url: '' })} folder="products" />
          </div>
          {allAttributes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Attributs</label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {allAttributes.map(attr => (
                  <div key={attr.id}>
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                      <input type="checkbox" checked={selectedAttrIds.includes(attr.id)} onChange={() => {
                        if (selectedAttrIds.includes(attr.id)) {
                          setSelectedAttrIds(prev => prev.filter(a => a !== attr.id))
                          const next = { ...attrTextValues }; delete next[attr.id]; setAttrTextValues(next)
                        } else {
                          setSelectedAttrIds(prev => [...prev, attr.id])
                        }
                      }} className="w-4 h-4" />
                      <span className="text-sm">{attr.name}</span>
                      {attr.type === 'text' && <span className="text-xs text-purple-600 ml-1">(texte)</span>}
                    </label>
                    {selectedAttrIds.includes(attr.id) && attr.type === 'text' && (
                      <input
                        type="text"
                        value={attrTextValues[attr.id] || ''}
                        onChange={e => setAttrTextValues(prev => ({ ...prev, [attr.id]: e.target.value }))}
                        placeholder={`Valeur pour ${attr.name}`}
                        className="ml-8 w-[calc(100%-2rem)] px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button onClick={saveProduct} disabled={loading || !productForm.name || productForm.price <= 0} className="w-full">Sauvegarder</Button>
        </div>
      </Modal>
    </div>
  )
}
