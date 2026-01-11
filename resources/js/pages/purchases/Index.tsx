import type { PaginatedResponse } from '@/types/pagination'
import type { Purchase } from '@/types/models'

interface Props {
  purchases: PaginatedResponse<Purchase>
  filters: {
    status?: string
  }
}

export default function Index({ purchases, filters }: Props) {
  return (
    <div>
      <h1>Purchases</h1>
      {/* Placeholder component */}
    </div>
  )
}
