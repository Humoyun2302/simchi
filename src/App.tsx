import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { useAuthStore } from '@/stores/auth-store'
import { Spinner } from '@/components/ui/card'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { HomePage } from '@/pages/HomePage'
import { ProjectsPage } from '@/pages/projects/ProjectsPage'
import { ProjectWizardPage } from '@/pages/projects/ProjectWizardPage'
import { ProjectDetailPage } from '@/pages/projects/ProjectDetailPage'
import { ProjectRoomsPage } from '@/pages/projects/ProjectRoomsPage'
import { ProjectPointsPage } from '@/pages/projects/ProjectPointsPage'
import { ProjectMaterialsPage } from '@/pages/projects/ProjectMaterialsPage'
import { ProjectWorksPage } from '@/pages/projects/ProjectWorksPage'
import { ProjectSuppliersPage } from '@/pages/projects/ProjectSuppliersPage'
import { ProjectEstimatePage } from '@/pages/projects/ProjectEstimatePage'
import { ClientsPage } from '@/pages/clients/ClientsPage'
import { ClientDetailPage } from '@/pages/clients/ClientDetailPage'
import { CatalogPage } from '@/pages/CatalogPage'
import { SuppliersPage } from '@/pages/suppliers/SuppliersPage'
import { SupplierDetailPage } from '@/pages/suppliers/SupplierDetailPage'
import { OrdersPage } from '@/pages/orders/OrdersPage'
import { OrderDetailPage } from '@/pages/orders/OrderDetailPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { PublicEstimatePage } from '@/pages/estimate/PublicEstimatePage'
import { AdminPage } from '@/pages/admin/AdminPage'
import { SupplierCabinetPage } from '@/pages/supplier/SupplierCabinetPage'

export default function App() {
  const init = useAuthStore((s) => s.init)
  const initialized = useAuthStore((s) => s.initialized)

  useEffect(() => {
    void init()
  }, [init])

  if (!initialized) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/estimate/public/:token" element={<PublicEstimatePage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/new" element={<ProjectWizardPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="projects/:id/rooms" element={<ProjectRoomsPage />} />
          <Route path="projects/:id/points" element={<ProjectPointsPage />} />
          <Route path="projects/:id/materials" element={<ProjectMaterialsPage />} />
          <Route path="projects/:id/works" element={<ProjectWorksPage />} />
          <Route path="projects/:id/suppliers" element={<ProjectSuppliersPage />} />
          <Route path="projects/:id/estimate" element={<ProjectEstimatePage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="clients/:id" element={<ClientDetailPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="suppliers/:id" element={<SupplierDetailPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={['supplier', 'admin']} />}>
        <Route path="/supplier" element={<SupplierCabinetPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
