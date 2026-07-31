import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/logo'
import { Card, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IntegerInput } from '@/components/ui/numeric-input'
import { DEMO_SUPPLIERS, useAppDataStore } from '@/stores/app-data-store'
import { DEMO_PROFILE } from '@/stores/demo-data'
import { DEFAULT_RULES } from '@/features/calculation-engine'
import { formatMoney } from '@/lib/utils'
import { translateMaterialName, translateRole } from '@/lib/labels'

type Tab = 'users' | 'suppliers' | 'catalog' | 'rules' | 'orders' | 'ledger' | 'stats' | 'audit'

export function AdminPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('users')
  const orders = useAppDataStore((s) => s.orders)
  const projects = useAppDataStore((s) => s.projects)
  const [commission, setCommission] = useState(3)
  const [auditEvents, setAuditEvents] = useState<Array<{ id: string; at: string; text: string }>>([])
  const [users, setUsers] = useState([
    { ...DEMO_PROFILE, role: DEMO_PROFILE.role as string },
  ])

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'users', label: t('admin.users') },
    { id: 'suppliers', label: t('admin.suppliers') },
    { id: 'catalog', label: t('admin.catalog') },
    { id: 'rules', label: t('admin.rules') },
    { id: 'orders', label: t('admin.orders') },
    { id: 'ledger', label: t('admin.ledger') },
    { id: 'stats', label: t('admin.stats') },
    { id: 'audit', label: t('admin.audit') },
  ]

  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,#F5F8FF,#EAF2FF)] px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex items-center justify-between gap-3">
          <Logo />
          <Link to="/" className="text-sm font-semibold text-primary">
            {t('nav.home')}
          </Link>
        </div>
        <h1 className="text-3xl font-extrabold">{t('admin.title')}</h1>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`min-h-11 whitespace-nowrap rounded-full px-4 text-sm font-semibold ${tab === item.id ? 'bg-primary text-white' : 'bg-white/70 text-muted'}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'users' && (
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="text-muted">
                  <th className="pb-3">{t('admin.name')}</th>
                  <th>{t('admin.email')}</th>
                  <th>{t('admin.role')}</th>
                  <th>{t('admin.city')}</th>
                  <th>{t('admin.status')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-white/70">
                    <td className="py-3 font-semibold">{u.full_name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        className="rounded-xl border border-white/80 bg-white/70 px-2 py-1"
                        value={u.role}
                        onChange={(e) =>
                          setUsers((list) =>
                            list.map((x) => (x.id === u.id ? { ...x, role: e.target.value } : x)),
                          )
                        }
                      >
                        <option value="electrician">{translateRole(t, 'electrician')}</option>
                        <option value="supplier">{translateRole(t, 'supplier')}</option>
                        <option value="admin">{translateRole(t, 'admin')}</option>
                      </select>
                    </td>
                    <td>{u.city}</td>
                    <td>{t('admin.statusActive')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-sm text-muted">{t('admin.demoRolesHint')}</p>
          </Card>
        )}

        {tab === 'suppliers' && (
          <div className="grid gap-3">
            {DEMO_SUPPLIERS.map((s) => (
              <Card key={s.id} className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold">{s.name}</p>
                  <p className="text-sm text-muted">{s.city}</p>
                </div>
                <Badge tone="success">{s.verification_status}</Badge>
              </Card>
            ))}
          </div>
        )}

        {tab === 'catalog' && (
          <Card>
            <p className="font-semibold">{t('admin.catalogManaged')}</p>
            <p className="mt-2 text-sm text-muted">{t('admin.catalogMvpHint')}</p>
          </Card>
        )}

        {tab === 'rules' && (
          <div className="grid gap-3">
            {DEFAULT_RULES.map((r) => (
              <Card key={r.id} className="flex justify-between gap-3">
                <div>
                  <p className="font-bold">{translateMaterialName(t, { name: r.name, ruleId: r.id })}</p>
                  <p className="text-xs text-muted">{r.formula}</p>
                </div>
                <Badge tone={r.isActive ? 'success' : 'neutral'}>v{r.version}</Badge>
              </Card>
            ))}
          </div>
        )}

        {tab === 'orders' && (
          <div className="grid gap-3">
            {orders.map((o) => (
              <Card key={o.id} className="flex justify-between">
                <div>
                  <p className="font-bold">{o.suppliers?.name}</p>
                  <p className="text-sm text-muted">{t(`orders.statuses.${o.status}`)}</p>
                </div>
                <p className="font-extrabold text-primary">{formatMoney(o.grand_total)}</p>
              </Card>
            ))}
          </div>
        )}

        {tab === 'ledger' && (
          <Card className="space-y-3">
            <IntegerInput label={t('admin.commissionPercent')} value={commission} onValueChange={(v) => setCommission(v ?? 0)} />
            {orders.map((o) => (
              <div key={o.id} className="flex justify-between border-t border-white/70 pt-3 text-sm">
                <span>{o.suppliers?.name}</span>
                <span className="font-semibold">{formatMoney(Math.round(o.subtotal * (commission / 100)))}</span>
              </div>
            ))}
            <p className="text-sm text-muted">
              {t('admin.total')}: {formatMoney(orders.reduce((s, o) => s + Math.round(o.subtotal * (commission / 100)), 0))}
            </p>
          </Card>
        )}

        {tab === 'stats' && (
          <div className="grid gap-3 sm:grid-cols-3">
            <Card><p className="text-sm text-muted">{t('admin.projects')}</p><p className="text-2xl font-extrabold">{projects.length}</p></Card>
            <Card><p className="text-sm text-muted">{t('admin.orders')}</p><p className="text-2xl font-extrabold">{orders.length}</p></Card>
            <Card><p className="text-sm text-muted">{t('admin.commissions')}</p><p className="text-2xl font-extrabold">{formatMoney(orders.reduce((s, o) => s + Math.round(o.subtotal * (commission / 100)), 0))}</p></Card>
          </div>
        )}

        {tab === 'audit' && (
          <Card className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{t('admin.audit')}</p>
              <Button
                variant="outline"
                onClick={() => {
                  setAuditEvents([
                    { id: crypto.randomUUID(), at: new Date().toISOString(), text: t('admin.auditOrdersView', { count: orders.length }) },
                    { id: crypto.randomUUID(), at: new Date().toISOString(), text: t('admin.auditProjectsCount', { count: projects.length }) },
                    ...auditEvents,
                  ].slice(0, 20))
                }}
              >
                {t('common.refresh')}
              </Button>
            </div>
            {auditEvents.length === 0 ? (
              <p className="text-sm text-muted">{t('admin.auditEmpty')}</p>
            ) : (
              auditEvents.map((e) => (
                <div key={e.id} className="border-t border-white/70 pt-2 text-sm">
                  <p className="font-semibold">{e.text}</p>
                  <p className="text-xs text-muted">{new Date(e.at).toLocaleString()}</p>
                </div>
              ))
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
