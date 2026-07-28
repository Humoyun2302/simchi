import { useEffect, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { ErrorBoundary } from '@/components/ErrorBoundary'
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

function Page({ children }: { children: ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}

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
      <Route
        path="/estimate/public/:token"
        element={
          <Page>
            <PublicEstimatePage />
          </Page>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route
            index
            element={
              <Page>
                <HomePage />
              </Page>
            }
          />
          <Route
            path="projects"
            element={
              <Page>
                <ProjectsPage />
              </Page>
            }
          />
          <Route
            path="projects/new"
            element={
              <Page>
                <ProjectWizardPage />
              </Page>
            }
          />
          <Route
            path="projects/:id"
            element={
              <Page>
                <ProjectDetailPage />
              </Page>
            }
          />
          <Route
            path="projects/:id/rooms"
            element={
              <Page>
                <ProjectRoomsPage />
              </Page>
            }
          />
          <Route
            path="projects/:id/points"
            element={
              <Page>
                <ProjectPointsPage />
              </Page>
            }
          />
          <Route
            path="projects/:id/materials"
            element={
              <Page>
                <ProjectMaterialsPage />
              </Page>
            }
          />
          <Route
            path="projects/:id/works"
            element={
              <Page>
                <ProjectWorksPage />
              </Page>
            }
          />
          <Route
            path="projects/:id/suppliers"
            element={
              <Page>
                <ProjectSuppliersPage />
              </Page>
            }
          />
          <Route
            path="projects/:id/estimate"
            element={
              <Page>
                <ProjectEstimatePage />
              </Page>
            }
          />
          <Route
            path="clients"
            element={
              <Page>
                <ClientsPage />
              </Page>
            }
          />
          <Route
            path="clients/:id"
            element={
              <Page>
                <ClientDetailPage />
              </Page>
            }
          />
          <Route
            path="catalog"
            element={
              <Page>
                <CatalogPage />
              </Page>
            }
          />
          <Route
            path="suppliers"
            element={
              <Page>
                <SuppliersPage />
              </Page>
            }
          />
          <Route
            path="suppliers/:id"
            element={
              <Page>
                <SupplierDetailPage />
              </Page>
            }
          />
          <Route
            path="orders"
            element={
              <Page>
                <OrdersPage />
              </Page>
            }
          />
          <Route
            path="orders/:id"
            element={
              <Page>
                <OrderDetailPage />
              </Page>
            }
          />
          <Route
            path="profile"
            element={
              <Page>
                <ProfilePage />
              </Page>
            }
          />
          <Route
            path="settings"
            element={
              <Page>
                <SettingsPage />
              </Page>
            }
          />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route
          path="/admin"
          element={
            <Page>
              <AdminPage />
            </Page>
          }
        />
      </Route>

      <Route element={<ProtectedRoute roles={['supplier', 'admin']} />}>
        <Route
          path="/supplier"
          element={
            <Page>
              <SupplierCabinetPage />
            </Page>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
