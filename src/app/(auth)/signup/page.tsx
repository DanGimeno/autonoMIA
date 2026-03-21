import { redirect } from 'next/navigation'
import SignupForm from './SignupForm'

export const dynamic = 'force-dynamic'

export default function SignupPage() {
  if (process.env.NEXT_PUBLIC_SIGNUP_ENABLED === 'false') {
    redirect('/login')
  }

  return <SignupForm />
}
