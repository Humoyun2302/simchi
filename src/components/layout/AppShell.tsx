import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import {
  Home,
  FolderKanban,
  Plus,
  Package,
  User,
  Users,
  Boxes,
  Truck,
  Settings,
  Shield,
  Store,
} from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { ToastViewport } from '@/components/ui/dialog'
import { useToastStore } from '@/stores/toast-store'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

const desktopLinks = [
  { to: '/', icon: Home, key: 'home' as const },
  { to: '/projects', icon: FolderKanban, key: 'projects' as const },
  { to: '/clients', icon: Users, key: 'clients' as const },
  { to: '/catalog', icon: Boxes, key: 'catalog' as const },
  { to: '/suppliers', icon: Truck, key: 'suppliers' as const },
  { to: '/orders', icon: Package, key: 'orders' as const },
  { to: '/settings', icon: Settings, key: 'settings' as const },
]

function shouldHideMobileNav(pathname: string) {
  return pathname === '/projects/new'
}

export function AppShell() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const profile = useAuthStore((s) => s.profile)
  const toasts = useToastStore((s) => s.items)
  const dismiss = useToastStore((s) => s.dismiss)
  const hideNav = shouldHideMobileNav(location.pathname)

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target
      if (!(el instanceof HTMLElement)) return
      if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return
      window.setTimeout(() => {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }, 280)
    }
    document.addEventListener('focusin', onFocusIn)
    return () => document.removeEventListener('focusin', onFocusIn)
  }, [])

  return (
    <div className="min-h-dvh lg:flex">
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-white/60 lg:bg-white/40 lg:backdrop-blur-xl lg:p-5">
        <Logo className="mb-8" />
        <nav className="flex flex-1 flex-col gap-1">
          {desktopLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-muted transition hover:bg-white/70',
                  isActive && 'bg-primary text-white hover:bg-primary',
                )
              }
            >
              <link.icon size={18} />
              {t(`nav.${link.key}`)}
            </NavLink>
          ))}
          {profile?.role === 'admin' ? (
            <NavLink to="/admin" className="mt-2 flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-muted hover:bg-white/70">
              <Shield size={18} />
              {t('nav.admin')}
            </NavLink>
          ) : null}
          {profile?.role === 'supplier' ? (
            <NavLink to="/supplier" className="mt-2 flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-muted hover:bg-white/70">
              <Store size={18} />
              {t('nav.supplierCabinet')}
            </NavLink>
          ) : null}
        </nav>
        <Button variant="secondary" onClick={() => navigate('/projects/new')}>
          <Plus size={18} />
          {t('home.newCalc')}
        </Button>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col">
        <main
          className={cn(
            'mx-auto w-full max-w-6xl flex-1 px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 lg:pb-8 lg:pt-6',
            hideNav ? 'pb-6' : 'pb-nav lg:pb-8',
          )}
        >
          <Outlet />
        </main>

        {!hideNav ? (
          <nav
            className="fixed inset-x-0 bottom-0 z-40 border-t border-white/70 bg-white/85 backdrop-blur-xl safe-bottom lg:hidden"
            style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
          >
            <div className="mx-auto grid h-16 max-w-lg grid-cols-5 items-center px-1">
              <MobileItem to="/" icon={Home} label={t('nav.home')} />
              <MobileItem to="/projects" icon={FolderKanban} label={t('nav.projects')} />
              <button
                type="button"
                aria-label={t('nav.newCalc')}
                onClick={() => navigate('/projects/new')}
                className="flex flex-col items-center justify-center"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-[0_10px_24px_rgb(63_127_241_/_0.35)] active:scale-95">
                  <Plus size={24} strokeWidth={2.5} />
                </span>
              </button>
              <MobileItem to="/orders" icon={Package} label={t('nav.orders')} />
              <MobileItem to="/profile" icon={User} label={t('nav.profile')} />
            </div>
          </nav>
        ) : null}
      </div>

      <ToastViewport items={toasts} onDismiss={dismiss} />
    </div>
  )
}

function MobileItem({ to, icon: Icon, label }: { to: string; icon: typeof Home; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex min-h-12 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-semibold leading-none text-muted',
          isActive && 'text-primary',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
          <span className="max-w-full truncate">{label}</span>
        </>
      )}
    </NavLink>
  )
}
