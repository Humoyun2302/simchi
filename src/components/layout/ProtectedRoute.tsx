import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { Spinner } from '@/components/ui/card'
import type { UserRole } from '@/types/database'

/** Soft gate: app works as guest/demo. Role checks only for special cabinets. */
export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const profile = useAuthStore((s) => s.profile)
  const initialized = useAuthStore((s) => s.initialized)

  if (!initialized) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  // Always allow app shell routes — guest uses demo profile
  if (!roles) {
    return <Outlet />
  }

  if (!profile || !roles.includes(profile.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
