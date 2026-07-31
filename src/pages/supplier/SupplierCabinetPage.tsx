import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Logo } from '@/components/ui/logo'
import { Card, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { IntegerInput } from '@/components/ui/numeric-input'
import { UzbekPhoneInput } from '@/components/ui/uzbek-phone-input'
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
  const allOrders = useAppDataStore((s) => s.orders)
  const orders = useMemo(
    () => allOrders.filter((o) => o.supplier_id === supplier.id),
    [allOrders, supplier.id],
  )
  const updateOrderStatus = useAppDataStore((s) => s.updateOrderStatus)
  const push = useToastStore((s) => s.push)
  const [products, setProducts] = useState(() => {
    try {
      const raw = localStorage.getItem('simchi-supplier-products')
      if (raw) return JSON.parse(raw) as Array<{ id: string; name: string; price: number; stock: number }>
    } catch {
      // ignore
    }
    return [
      { id: '1', name: 'Кабель ВВГнг 3×2.5', price: 18500, stock: 1200 },
      { id: '2', name: 'Розетка одинарная', price: 45000, stock: 340 },
      { id: '3', name: 'Автомат 16A', price: 65000, stock: 180 },
    ]
  })
  const [company, setCompany] = useState(() => {
    try {
      const raw = localStorage.getItem('simchi-supplier-company')
      if (raw) return JSON.parse(raw) as { name: string; phone: string; description: string }
    } catch {
      // ignore
    }
    return {
      name: supplier.name,
      phone: supplier.phone ?? '',
      description: supplier.description ?? '',
    }
  })
  const [branches, setBranches] = useState(() => {
    try {
      const raw = localStorage.getItem('simchi-supplier-branches')
      if (raw) return JSON.parse(raw) as Array<{ id: string; name: string; address: string }>
    } catch {
      // ignore
    }
    return [
      { id: 'b1', name: 'Центральный склад', address: supplier.address ?? '' },
      { id: 'b2', name: 'Филиал Чиланзар', address: 'Чиланзар-8, павильон 12' },
    ]
  })
  const [branchName, setBranchName] = useState('')
  const [branchAddress, setBranchAddress] = useState('')

  const persistProducts = (next: typeof products) => {
    setProducts(next)
    localStorage.setItem('simchi-supplier-products', JSON.stringify(next))
  }
  const persistBranches = (next: typeof branches) => {
    setBranches(next)
    localStorage.setItem('simchi-supplier-branches', JSON.stringify(next))
  }

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
            <Input label={t('common.name')} value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
            <UzbekPhoneInput label={t('common.phone')} value={company.phone} onValueChange={(phone) => setCompany({ ...company, phone })} />
            <Textarea label={t('common.description')} value={company.description} onChange={(e) => setCompany({ ...company, description: e.target.value })} />
            <Button
              onClick={() => {
                localStorage.setItem('simchi-supplier-company', JSON.stringify(company))
                push(t('common.success'), 'success')
              }}
            >
              {t('common.save')}
            </Button>
          </Card>
        )}

        {tab === 'branches' && (
          <div className="space-y-3">
            {branches.map((b) => (
              <Card key={b.id} className="space-y-1">
                <p className="font-bold">{b.name}</p>
                <p className="text-sm text-muted">{b.address}</p>
              </Card>
            ))}
            <Card className="space-y-3">
              <Input label={t('supplier.branchName')} value={branchName} onChange={(e) => setBranchName(e.target.value)} />
              <Input label={t('project.address')} value={branchAddress} onChange={(e) => setBranchAddress(e.target.value)} />
              <Button
                onClick={() => {
                  if (!branchName.trim()) return
                  persistBranches([
                    ...branches,
                    { id: crypto.randomUUID(), name: branchName.trim(), address: branchAddress.trim() },
                  ])
                  setBranchName('')
                  setBranchAddress('')
                  push(t('common.success'), 'success')
                }}
              >
                {t('common.add')}
              </Button>
            </Card>
          </div>
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
                {t('supplier.downloadCsvTemplate')}
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
                      id: `imp-${Date.now()}-${i}`,
                      name: cols[1] || `Товар ${i + 1}`,
                      price: Number(cols[5]) || 0,
                      stock: Number(cols[6]) || 0,
                    }
                  })
                  persistProducts([...imported, ...products])
                  push(t('supplier.importedCount', { count: imported.length }), 'success')
                }}
              />
            </Card>
            {products.map((p) => (
              <Card key={p.id} className="grid gap-3 sm:grid-cols-3">
                <p className="font-bold sm:col-span-3">{p.name}</p>
                <IntegerInput
                  label={t('common.price')}
                  value={p.price}
                  onValueChange={(price) =>
                    persistProducts(products.map((x) => (x.id === p.id ? { ...x, price: price ?? 0 } : x)))
                  }
                />
                <IntegerInput
                  label={t('supplier.stock')}
                  value={p.stock}
                  onValueChange={(stock) =>
                    persistProducts(products.map((x) => (x.id === p.id ? { ...x, stock: stock ?? 0 } : x)))
                  }
                />
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
