import { headers } from 'next/headers'
import SuiviContent from './SuiviContent'

export default async function SuiviCommandePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  await headers()
  const { email } = await searchParams
  return <SuiviContent initialEmail={email || ''} />
}
