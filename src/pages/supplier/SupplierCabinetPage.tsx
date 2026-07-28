import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Logo } from '@/components/ui/logo'
import { Card, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DEMO_SUPPLIERS, useAppDataStore } from '@/stores/app-data-store'
import { formatMoney } from '@/lib/utils'
import { useToastStore } from '@/stores/toast-store'
import type { OrderStatus } from '@/types/database'

type Tab = 'company' | 'branches' | 'products' | 'orders' | 'sales'

const CSV_TEMPLATE = `sku,name,brand,category,unit,price,stock,pack_size,min_qty,branch
VVG-3x25,Кабель ВВГнг 3×2.5,CableTech,cables,м,18500,1200,100,10,Центральный
SKT-01,Розетка одинарная,Schneider,sockets,шт,45000,340,1,1,Центральный
`

export function SupplierCabinetPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('orders')
  const supplier = DEMO_SUPPLIERS[0]
  const orders = useAppDataStore((s) => s.orders.filter((o) => o.supplier_id === supplier.id || s.orders.length > 0))
  const updateOrderStatus = useAppDataStore((s) => s.updateOrderStatus)
  const push = useToastStore((s) => s.push)
  const [products, setProducts] = useState([
    { id: '1', name: 'Кабель ВВГнг 3×2.5', price: 18500, stock: 1200 },
    { id: '2', name: 'Розетка одинарная', price: 45000, stock: 340 },
    { id: '3', name: 'Автомат 16A', price: 65000, stock: 180 },
  ])
  const [company, setCompany] = useState({
    name: supplier.name,
    phone: supplier.phone ?? '',
    description: supplier.description ?? '',
  })

  const sales = useMemo(() => orders.reduce((s, o) => s + o.grand_total, 0), [orders])
  const commission = useMemo(() => orders.reduce((s, o) => s + o.commission_total, 0), [orders])

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'company', label: t('supplier.company') },
    { id: 'branches', label: t('supplier.branches') },
    { id: 'products', label: t('supplier.products') },
    { id: 'orders', label: t('supplier.orders') },
    { id: 'sales', label: t('supplier.sales') },
  ]

  return (
    <div className="min-h-dvh px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="flex items-center justify-between">
          <Logo />
          <Link to="/" className="text-sm font-semibold text-primary">{t('nav.home')}</Link>
        </div>
        <h1 className="text-3xl font-extrabold">{t('supplier.title')}</h1>
        <div className="flex gap-2 overflow-x-auto">
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

        {tab === 'company' && (
          <Card className="space-y-3">
            <Input label="Название" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
            <Input label="Телефон" value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} />
            <Textarea label="Описание" value={company.description} onChange={(e) => setCompany({ ...company, description: e.target.value })} />
            <Button onClick={() => push(t('common.success'), 'success')}>{t('common.save')}</Button>
          </Card>
        )}

        {tab === 'branches' && (
          <Card className="space-y-2">
            <p className="font-bold">Центральный склад</p>
            <p className="text-sm text-muted">{supplier.address}</p>
            <p className="font-bold mt-4">Филиал Чиланзар</p>
            <p className="text-sm text-muted">Чиланзар-8, павильон 12</p>
          </Card>
        )}

        {tab === 'products' && (
          <div className="space-y-4">
            <Card className="space-y-3">
              <p className="font-semibold">{t('supplier.importCsv')}</p>
              <a
                className="text-sm font-semibold text-primary"
                href={`data:text/csv;charset=utf-8,${encodeURIComponent(CSV_TEMPLATE)}`}
                download="simchi-products-template.csv"
              >
                Скачать шаблон CSV
              </a>
              <input
                type="file"
                accept=".csv"
                className="block w-full text-sm"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const text = await file.text()
                  const lines = text.trim().split(/\r?\n/).slice(1)
                  const imported = lines.map((line, i) => {
                    const cols = line.split(',')
                    return {
                      id: `imp-${i}`,
                      name: cols[1] || `Товар ${i + 1}`,
                      price: Number(cols[5]) || 0,
                      stock: Number(cols[6]) || 0,
                    }
                  })
                  setProducts((p) => [...imported, ...p])
                  push(`Импортировано: ${imported.length}`, 'success')
                }}
              />
            </Card>
            {products.map((p) => (
              <Card key={p.id} className="grid gap-3 sm:grid-cols-3">
                <p className="font-bold sm:col-span-3">{p.name}</p>
                <Input label="Цена" type="number" value={p.price} onChange={(e) => setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, price: Number(e.target.value) || 0 } : x)))} />
                <Input label="Остаток" type="number" value={p.stock} onChange={(e) => setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, stock: Number(e.target.value) || 0 } : x)))} />
                <p className="self-end font-extrabold text-primary">{formatMoney(p.price)}</p>
              </Card>
            ))}
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-3">
            {orders.map((o) => (
              <Card key={o.id} className="space-y-3">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-bold">{formatMoney(o.grand_total)}</p>
                    <Badge tone="primary">{t(`orders.statuses.${o.status}`)}</Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['confirmed_by_supplier', 'assembling', 'ready_for_pickup', 'in_delivery', 'received'] as OrderStatus[]).map((st) => (
                    <Button key={st} size="sm" variant="outline" onClick={() => { updateOrderStatus(o.id, st); push(t('common.success'), 'success') }}>
                      {t(`orders.statuses.${st}`)}
                    </Button>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'sales' && (
          <div className="grid gap-3 sm:grid-cols-3">
            <Card><p className="text-sm text-muted">{t('supplier.sales')}</p><p className="text-2xl font-extrabold">{formatMoney(sales)}</p></Card>
            <Card><p className="text-sm text-muted">{t('supplier.commission')}</p><p className="text-2xl font-extrabold">{formatMoney(commission)}</p></Card>
            <Card><p className="text-sm text-muted">{t('supplier.returns')}</p><p className="text-2xl font-extrabold">0 UZS</p></Card>
          </div>
        )}
      </div>
    </div>
  )
}
