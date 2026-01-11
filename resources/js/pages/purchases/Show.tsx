import type { Purchase } from '@/types/models'

interface Props {
  purchase: Purchase & {
    purchaseDetails: Array<{
      id: string
      item: {
        id: string
        nama_barang: string
      }
    }>
  }
}

export default function Show({ purchase }: Props) {
  return (
    <div>
      <h1>Purchase Details</h1>
      {/* Placeholder component */}
    </div>
  )
}
