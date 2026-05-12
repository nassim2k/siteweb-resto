'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Room, Table } from '@/types'
import { useTheme } from '@/components/ThemeProvider'
import SalleCard from '@/components/reservation/SalleCard'
import PlanSalle from '@/components/reservation/PlanSalle'
import FormulaireReservation from '@/components/reservation/FormulaireReservation'
import DisponibilitesTimeline from '@/components/reservation/DisponibilitesTimeline'
import Button from '@/components/ui/Button'

export default function ReservationPage() {
  const supabase = createClient()
  const theme = useTheme()
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [step, setStep] = useState<'rooms' | 'plan' | 'success'>('rooms')
  const [successMsg, setSuccessMsg] = useState('')
  const [resDate, setResDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    supabase.from('rooms').select('*').eq('active', true).order('sort_order').then(({ data }) => {
      if (data) setRooms(data)
    })
  }, [])

  const handleSelectRoom = async (room: Room) => {
    setSelectedRoom(room)
    setSelectedTable(null)
    const { data } = await supabase.from('tables_resto').select('*').eq('room_id', room.id).order('name')
    if (data) setTables(data)
    setStep('plan')
  }

  const handleSelectTable = (table: Table) => {
    setSelectedTable(table)
  }

  const handleReservationSuccess = () => {
    setStep('success')
    setSuccessMsg(`Votre réservation pour la table ${selectedTable?.name} a été confirmée !`)
    setSelectedTable(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[var(--primary)] text-white">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step !== 'rooms' ? (
              <button onClick={() => { setStep('rooms'); setSelectedRoom(null); setSelectedTable(null) }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft size={20} /></button>
            ) : (
              <Link href="/" className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft size={20} /></Link>
            )}
            {theme?.logo_url && <img src={theme.logo_url} alt="" className="h-8 w-8 rounded-full object-cover" />}
            <div>
              <h1 className="text-lg font-bold">Réservation</h1>
              <p className="text-white/60 text-xs">
                {step === 'rooms' ? 'Choisissez votre salle' :
                 step === 'plan' ? 'Sélectionnez votre table' : 'Confirmation'}
              </p>
            </div>
          </div>
          {theme?.site_name && <span className="text-white/40 text-sm hidden sm:block">{theme.site_name}</span>}
        </div>
      </header>

      {/* Stepper */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          {['Salle', 'Table', 'Confirmation'].map((label, i) => {
            const activeIdx = step === 'rooms' ? 0 : step === 'plan' ? 1 : 2
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i <= activeIdx ? 'bg-[var(--primary)] text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {i < activeIdx ? <Check size={16} /> : i + 1}
                </div>
                <span className={`text-sm ${i <= activeIdx ? 'text-[var(--primary)] font-medium' : 'text-gray-400'}`}>
                  {label}
                </span>
                {i < 2 && <div className={`w-12 h-0.5 ${i < activeIdx ? 'bg-[var(--primary)]' : 'bg-gray-200'}`} />}
              </div>
            )
          })}
        </div>
      </div>

      <div className="container mx-auto px-6 pb-12">
        <AnimatePresence mode="wait">
          {step === 'rooms' && (
            <motion.div
              key="rooms"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {rooms.map((room, i) => (
                <SalleCard key={room.id} room={room} onClick={() => handleSelectRoom(room)} index={i} />
              ))}
              {rooms.length === 0 && (
                <p className="text-gray-400 col-span-full text-center py-20">Aucune salle disponible</p>
              )}
            </motion.div>
          )}

          {step === 'plan' && selectedRoom && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h2 className="text-xl font-bold">
                    {selectedRoom.name}
                    {selectedRoom.description && <span className="text-sm font-normal text-gray-500 ml-2">{selectedRoom.description}</span>}
                  </h2>
                  <input type="date" value={resDate} onChange={e => setResDate(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1.5" />
                </div>
                <PlanSalle
                  tables={tables}
                  selectedTableId={selectedTable?.id || null}
                  onSelectTable={handleSelectTable}
                />
                {selectedTable && (
                  <DisponibilitesTimeline tableId={selectedTable.id} date={resDate} />
                )}
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
                  <h3 className="font-bold mb-4">
                    {selectedTable ? `Table ${selectedTable.name}` : 'Sélectionnez une table'}
                  </h3>
                  {selectedTable && (
                    <FormulaireReservation table={selectedTable} onSuccess={handleReservationSuccess} />
                  )}
                  {!selectedTable && (
                    <p className="text-gray-400 text-sm">
                      Cliquez sur une table libre (verte) pour commencer votre réservation.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Réservation confirmée !</h2>
              <p className="text-gray-600 mb-8">{successMsg}</p>
              <Button onClick={() => { setStep('rooms'); setSelectedRoom(null) }}>
                Réserver une autre table
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
