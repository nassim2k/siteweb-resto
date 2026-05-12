'use client'

import { motion } from 'framer-motion'
import { Room } from '@/types'
import Card from '@/components/ui/Card'
import { Users } from 'lucide-react'

interface SalleCardProps {
  room: Room
  onClick: () => void
  index: number
}

export default function SalleCard({ room, onClick, index }: SalleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card hover onClick={onClick} className="h-full">
        <div className="relative h-48 bg-gray-200">
          {room.image_url ? (
            <img
              src={room.image_url}
              alt={room.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <Users size={48} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white">{room.name}</h3>
          </div>
        </div>
        {room.description && (
          <div className="p-4">
            <p className="text-gray-600 text-sm">{room.description}</p>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
