import { redirect } from 'next/navigation'
import { home_path } from '@/app/not-found'

export default function DriveIndex() {
    redirect(home_path)
}
