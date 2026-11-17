// The café menu, exactly as on the printed menu board (order and wording). Prices in GBP.
// Feeds the Menu section on the site and the Menu structured data.

export interface MenuItem { name: string; price: number }
export interface MenuSection { id: string; name: string; items: MenuItem[] }

export const menu: MenuSection[] = [
  {
    id: 'hot-drinks',
    name: 'Hot Drinks',
    items: [
      { name: 'Double Espresso', price: 3.2 },
      { name: 'Espresso', price: 2.9 },
      { name: 'Long Black', price: 3.2 },
      { name: 'Americano', price: 3.2 },
      { name: 'Macchiato', price: 3.9 },
      { name: 'Flat White', price: 3.9 },
      { name: 'Cappuccino', price: 3.9 },
      { name: 'Cortado', price: 3.6 },
      { name: 'Mocha', price: 4.1 },
      { name: 'Latte', price: 3.9 },
      { name: 'Matcha', price: 5.2 },
      { name: 'Tea', price: 2.7 },
      { name: 'Chai', price: 3.9 },
      { name: 'Chai Latte', price: 4.2 },
      { name: 'Hot Chocolate (Large)', price: 4.4 },
      { name: 'Hot Chocolate (Small)', price: 3.9 },
      { name: 'Kombucha', price: 3.5 },
      { name: 'Latte', price: 3.9 },
    ],
  },
  {
    id: 'cold-drinks',
    name: 'Cold Drinks',
    items: [
      { name: 'Iced Latte', price: 4.2 },
      { name: 'Iced Matcha', price: 5.2 },
      { name: 'Iced Americano', price: 3.5 },
      { name: 'Iced Tea', price: 3.5 },
      { name: 'Iced Mango Matcha', price: 5.2 },
      { name: 'Still Water', price: 2.0 },
      { name: 'Sparkling Water', price: 2.0 },
      { name: 'Soda', price: 2.7 },
    ],
  },
];

export const gbp = (p: number) => `£${p.toFixed(2)}`;

for (const s of menu) for (const i of s.items) {
  if (!i.name || !(i.price > 0)) throw new Error(`src/data/menu.ts: bad item in ${s.name}`);
}
