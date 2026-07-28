-- SIMCHI seed reference data (Uzbekistan / UZS)
-- Auth users are created via app registration. After creating a demo electrician,
-- you can attach sample clients/projects to that profile id.

insert into public.device_types (code, name_ru, name_uz, name_en, default_power_w, category)
values
  ('socket_single', 'Обычная розетка', 'Oddiy rozetka', 'Single socket', 0, 'socket'),
  ('socket_double', 'Двойная розетка', 'Qoʻsh rozetka', 'Double socket', 0, 'socket'),
  ('switch', 'Выключатель', 'Oʻchirgich', 'Switch', 0, 'switch'),
  ('pass_switch', 'Проходной выключатель', 'Oʻtish oʻchirgichi', 'Pass-through switch', 0, 'switch'),
  ('light', 'Светильник', 'Yoritgich', 'Light', 60, 'light'),
  ('chandelier', 'Люстра', 'Qandil', 'Chandelier', 200, 'light'),
  ('ac', 'Кондиционер', 'Konditsioner', 'Air conditioner', 2000, 'appliance'),
  ('tv', 'Телевизор', 'Televizor', 'TV', 150, 'appliance'),
  ('fridge', 'Холодильник', 'Muzlatgich', 'Fridge', 300, 'appliance'),
  ('oven', 'Духовка', 'Duxovka', 'Oven', 2500, 'appliance'),
  ('stove', 'Электроплита', 'Elektroplita', 'Electric stove', 7000, 'appliance'),
  ('boiler', 'Бойлер', 'Boyler', 'Boiler', 2000, 'appliance'),
  ('washer', 'Стиральная машина', 'Kir yuvish mashinasi', 'Washer', 2000, 'appliance'),
  ('dishwasher', 'Посудомоечная машина', 'Idish yuvish mashinasi', 'Dishwasher', 1800, 'appliance'),
  ('socket_inet', 'Интернет-розетка', 'Internet rozetka', 'Ethernet outlet', 0, 'low_voltage'),
  ('socket_tv', 'Телевизионная розетка', 'TV rozetka', 'TV outlet', 0, 'low_voltage'),
  ('floor_heating', 'Тёплый пол', 'Issiq pol', 'Floor heating', 1500, 'appliance'),
  ('ventilation', 'Вентиляция', 'Ventilyatsiya', 'Ventilation', 100, 'appliance'),
  ('custom', 'Собственная точка', 'Maxsus nuqta', 'Custom point', null, 'custom')
on conflict (code) do nothing;

insert into public.calculation_rules (name, point_type, formula, unit, coefficient, spare_percent, min_qty, rounding, pack_size, version, is_active, warning, unit_price, category)
values
  ('Кабель ВВГнг 3×2.5', 'general_circuit', '(room_route + distance_to_panel + vertical*3 + separate_lines*room_route*0.35) * coefficient', 'м', 1, 10, 5, 'ceil', 1, 1, true, 'Сечение кабеля требует проверки квалифицированным специалистом', 18500, 'cables'),
  ('Розетка одинарная', 'socket_single', 'quantity * coefficient', 'шт', 1, 5, 1, 'ceil', 1, 1, true, null, 45000, 'sockets'),
  ('Розетка двойная', 'socket_double', 'quantity * coefficient', 'шт', 1, 5, 1, 'ceil', 1, 1, true, null, 62000, 'sockets'),
  ('Выключатель', 'switch', 'quantity * coefficient', 'шт', 1, 5, 1, 'ceil', 1, 1, true, null, 38000, 'switches'),
  ('Проходной выключатель', 'pass_switch', 'quantity * coefficient', 'шт', 1, 5, 1, 'ceil', 1, 1, true, null, 55000, 'switches'),
  ('Подрозетник', 'mounting_box', 'device_points * coefficient', 'шт', 1, 8, 1, 'ceil', 1, 1, true, null, 8500, 'mounting_boxes'),
  ('Гофра 20 мм', 'conduit', 'cable_meters * 1.05 * coefficient', 'м', 1, 10, 10, 'pack', 10, 1, true, null, 4200, 'conduit'),
  ('Распределительная коробка', 'junction_box', 'rooms_count * coefficient', 'шт', 1, 0, 1, 'ceil', 1, 1, true, null, 22000, 'junction_boxes');

insert into public.canonical_products (name, category, brand, model, sku, unit)
values
  ('Кабель ВВГнг 3×2.5', 'cables', 'CableTech', 'VVGng-3x2.5', 'VVG-3x25', 'м'),
  ('Кабель ВВГнг 3×1.5', 'cables', 'CableTech', 'VVGng-3x1.5', 'VVG-3x15', 'м'),
  ('Провод ПВС 3×1.5', 'wires', 'CableTech', 'PVS-3x1.5', 'PVS-15', 'м'),
  ('Розетка одинарная', 'sockets', 'Schneider', 'GLOSSA', 'SKT-01', 'шт'),
  ('Розетка двойная', 'sockets', 'Schneider', 'GLOSSA-D', 'SKT-02', 'шт'),
  ('Выключатель 1-кл', 'switches', 'Legrand', 'Valena', 'SW-01', 'шт'),
  ('Выключатель проходной', 'switches', 'Legrand', 'Valena-P', 'SW-P1', 'шт'),
  ('Рамка 1-местная', 'frames', 'Schneider', 'Frame-1', 'FR-01', 'шт'),
  ('Подрозетник', 'mounting_boxes', 'Hegel', 'KU-68', 'MB-68', 'шт'),
  ('Коробка распред.', 'junction_boxes', 'IEK', 'JK-100', 'JB-100', 'шт'),
  ('Гофра 20 мм', 'conduit', 'DKS', 'G20', 'GF-20', 'м'),
  ('Труба ПВХ 20', 'pipes', 'DKS', 'T20', 'TP-20', 'м'),
  ('Кабель-канал 40×25', 'cable_channels', 'IEK', 'KK-4025', 'CC-4025', 'м'),
  ('Клипса крепления', 'fasteners', 'IEK', 'CL-20', 'CL-20', 'шт'),
  ('Клемма WAGO 221', 'terminals', 'WAGO', '221-413', 'WG-221', 'шт'),
  ('Наконечник НШВИ', 'lugs', 'KVT', 'NShVI', 'NS-25', 'шт'),
  ('Щит 12 модулей', 'panels', 'ABB', 'SH12', 'PN-12', 'шт'),
  ('Автомат 16A', 'modular_devices', 'ABB', 'S201-C16', 'MCB-16', 'шт'),
  ('УЗО 40A', 'modular_devices', 'ABB', 'F204', 'RCD-40', 'шт'),
  ('Изолента', 'consumables', '3M', 'Tape', 'TP-ISO', 'шт');

insert into public.suppliers (id, name, description, city, address, phone, telegram, website, rating, delivery_terms, min_order_amount, electrician_discount_percent, platform_commission_percent, verification_status, is_active)
values
  ('11111111-1111-1111-1111-111111111111', 'ElectroMarket Tashkent', 'Кабели, автоматы и розетки оптом', 'Ташкент', 'Сергели, склад 4', '+998 71 150 20 20', '@electromarket', 'https://electromarket.uz', 4.8, 'Доставка по городу от 150 000 UZS', 1000000, 3, 3, 'verified', true),
  ('22222222-2222-2222-2222-222222222222', 'Kabel Pro', 'Специализация на кабельной продукции', 'Ташкент', 'Юнусабад-12', '+998 71 230 44 55', '@kabelpro', null, 4.6, 'Самовывоз / доставка 1–2 дня', 500000, 2, 3, 'verified', true),
  ('33333333-3333-3333-3333-333333333333', 'SamElektro', 'Поставщик для Самарканда и региона', 'Самарканд', 'ул. Регистанская, 8', '+998 66 233 11 00', null, null, 4.4, 'По области 2–3 дня', 800000, 2.5, 3, 'verified', true)
on conflict (id) do nothing;

insert into public.supplier_branches (supplier_id, name, city, address, is_main)
values
  ('11111111-1111-1111-1111-111111111111', 'Центральный склад', 'Ташкент', 'Сергели, склад 4', true),
  ('22222222-2222-2222-2222-222222222222', 'Юнусабад', 'Ташкент', 'Юнусабад-12', true),
  ('33333333-3333-3333-3333-333333333333', 'Регистан', 'Самарканд', 'ул. Регистанская, 8', true);

-- Create sample supplier products/offers from canonical products for supplier 1 and 2 with different prices
insert into public.supplier_products (supplier_id, canonical_product_id, name, brand, sku, category, unit)
select s.id, cp.id, cp.name, cp.brand, cp.sku, cp.category, cp.unit
from public.canonical_products cp
cross join (values
  ('11111111-1111-1111-1111-111111111111'::uuid),
  ('22222222-2222-2222-2222-222222222222'::uuid)
) as s(id);

insert into public.supplier_offers (supplier_product_id, price, stock, pack_size, min_qty, delivery_days)
select sp.id,
  case when sp.supplier_id = '11111111-1111-1111-1111-111111111111' then 10000 + (row_number() over ()) * 1500
       else 9500 + (row_number() over ()) * 1400 end,
  100 + (row_number() over ()) * 7,
  1,
  1,
  case when sp.supplier_id = '11111111-1111-1111-1111-111111111111' then 1 else 2 end
from public.supplier_products sp;

-- NOTE: After registering demo electrician (e.g. aziz@simchi.uz),
-- run optional SQL to insert 3 clients / 4 projects linked to that auth.users id.
