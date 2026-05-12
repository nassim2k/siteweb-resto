'use client'

import { Table } from '@/types'

interface TableInteractiveProps {
  table: Table
  isSelected: boolean
  onClick: () => void
}

export default function TableInteractive({ table, isSelected, onClick }: TableInteractiveProps) {
  const getShapeStyle = () => {
    const base: Record<string, React.CSSProperties> = {
      circle: {
        width: table.width,
        height: table.width,
        borderRadius: '50%',
      },
      square: {
        width: table.width,
        height: table.width,
        borderRadius: '8px',
      },
      rectangle: {
        width: table.width * 1.5,
        height: table.height,
        borderRadius: '8px',
      },
    }
    return base[table.shape] || base.circle
  }

  const getColor = () => {
    if (isSelected) return '#3B82F6'
    return table.status === 'free' ? '#22C55E' : '#F97316'
  }

  const style: React.CSSProperties = {
    position: 'absolute',
    left: table.pos_x,
    top: table.pos_y,
    ...getShapeStyle(),
    backgroundColor: getColor(),
    cursor: table.status === 'free' ? 'pointer' : 'not-allowed',
    opacity: table.status === 'occupied' ? 0.8 : 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 600,
    fontSize: 12,
    transition: 'all 0.3s ease',
    boxShadow: isSelected ? '0 0 0 3px white, 0 0 0 5px #3B82F6' : '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: isSelected ? 10 : 1,
  }

  return (
    <div
      style={style}
      onClick={table.status === 'free' ? onClick : undefined}
      className="hover:scale-105"
      title={`${table.name} - ${table.status === 'free' ? 'Libre' : 'Occupée'}`}
    >
      <span>{table.name}</span>
      <span style={{ fontSize: 10, opacity: 0.9 }}>
        {table.capacity} pers.
      </span>
    </div>
  )
}
