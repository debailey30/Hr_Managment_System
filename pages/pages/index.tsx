import { Inter } from 'next/font/google'
import HRManagementApp from '../components/HRManagementApp'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main className={inter.className}>
      <HRManagementApp />
    </main>
  )
}
