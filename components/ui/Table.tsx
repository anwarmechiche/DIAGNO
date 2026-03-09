'use client'

import { ReactNode } from 'react'

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => ReactNode
  align?: 'left' | 'center' | 'right'
  width?: string
}

interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  emptyMessage?: string
  loading?: boolean
  onRowClick?: (item: T) => void
  className?: string
}

export default function Table<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'Aucune donnée disponible',
  loading = false,
  onRowClick,
  className = ''
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-gray-600">Chargement des données...</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="text-4xl mb-4 text-gray-300">📋</div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune donnée</h3>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-white">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`p-4 text-xs font-bold text-dark uppercase tracking-wider text-${column.align || 'left'}`}
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={`p-4 text-${column.align || 'left'}`}
                >
                  {column.render
                    ? column.render(item)
                    : String(item[column.key as keyof T] || '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}