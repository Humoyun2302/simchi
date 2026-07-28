import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/logo'
import { Card, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DEMO_SUPPLIERS, useAppDataStore } from '@/stores/app-data-store'
import { DEMO_PROFILE } from '@/stores/demo-data'
import { DEFAULT_RULES } from '@/features/calculation-engine'
import { formatMoney } from '@/lib/utils'

type Tab = 'users' | 'suppliers' | 'catalog' | 'rules' | 'orders' | 'ledger' | 'stats' | 'audit'

export function AdminPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('users')
  const orders = useAppDataStore((s) => s.orders)
  const projects = useAppDataStore((s) => s.projects)
  const [commission, setCommission] = useState(3)

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
                  <th className="pb-3">Имя</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Город</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-white/70">
                  <td className="py-3 font-semibold">{DEMO_PROFILE.full_name}</td>
                  <td>{DEMO_PROFILE.email}</td>
                  <td><Badge tone="primary">electrician</Badge></td>
                  <td>{DEMO_PROFILE.city}</td>
                  <td>active</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-3 text-sm text-muted">Назначение ролей supplier/admin — через SQL/админ API после подключения Supabase.</p>
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
            <p className="font-semibold">Canonical products / supplier offers управляются в БД.</p>
            <p className="mt-2 text-sm text-muted">В MVP доступен справочник правил и демо-каталог на /catalog.</p>
          </Card>
        )}

        {tab === 'rules' && (
          <div className="grid gap-3">
            {DEFAULT_RULES.map((r) => (
              <Card key={r.id} className="flex justify-between gap-3">
                <div>
                  <p className="font-bold">{r.name}</p>
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
            <Input label="Комиссия SIMCHI %" type="number" value={commission} onChange={(e) => setCommission(Number(e.target.value) || 0)} />
            {orders.map((o) => (
              <div key={o.id} className="flex justify-between border-t border-white/70 pt-3 text-sm">
                <span>{o.suppliers?.name}</span>
                <span className="font-semibold">{formatMoney(o.commission_total)}</span>
              </div>
            ))}
          </Card>
        )}

        {tab === 'stats' && (
          <div className="grid gap-3 sm:grid-cols-3">
            <Card><p className="text-sm text-muted">Проекты</p><p className="text-2xl font-extrabold">{projects.length}</p></Card>
            <Card><p className="text-sm text-muted">Заказы</p><p className="text-2xl font-extrabold">{orders.length}</p></Card>
            <Card><p className="text-sm text-muted">Комиссии</p><p className="text-2xl font-extrabold">{formatMoney(orders.reduce((s, o) => s + o.commission_total, 0))}</p></Card>
          </div>
        )}

        {tab === 'audit' && (
          <Card>
            <p className="font-semibold">Audit log</p>
            <p className="mt-2 text-sm text-muted">События пишутся в таблицу audit_logs после применения миграций.</p>
            <Button className="mt-4" variant="outline" onClick={() => undefined}>Обновить</Button>
          </Card>
        )}
      </div>
    </div>
  )
}
