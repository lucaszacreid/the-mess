// Shared structured-data pieces, so every page describes the business the same way.
import { business } from './business';
import { menu } from './menu';
import type { Offering } from './offerings';

export const address = {
  '@type': 'PostalAddress',
  streetAddress: business.street,
  addressLocality: business.locality,
  addressRegion: business.region,
  postalCode: business.postcode,
  addressCountry: business.country,
};

export const hours = [
  { '@type': 'OpeningHoursSpecification', dayOfWeek: [...business.hours.days], opens: business.hours.opens, closes: business.hours.closes },
];

export const ids = (site: string) => ({
  website: `${site}/#website`,
  business: `${site}/#business`,
  menu: `${site}/#coffee-menu`,
});

export const departmentLd = (site: string, o: Offering) => ({
  '@type': o.schemaType,
  '@id': `${site}/${o.slug}/#department`,
  name: `${business.name} ${o.name}`,
  description: o.schemaDesc,
  address,
  telephone: business.phoneHref,
  openingHoursSpecification: hours,
  url: `${site}/${o.slug}/`,
  parentOrganization: { '@id': ids(site).business },
});

export const menuLd = (site: string) => ({
  '@type': 'Menu',
  '@id': ids(site).menu,
  name: `${business.name} menu`,
  url: `${site}/coffee/`,
  inLanguage: 'en-GB',
  hasMenuSection: menu.map((sec) => ({
    '@type': 'MenuSection',
    name: sec.name,
    hasMenuItem: sec.items.map((item) => ({
      '@type': 'MenuItem',
      name: item.name,
      offers: { '@type': 'Offer', price: item.price.toFixed(2), priceCurrency: 'GBP' },
    })),
  })),
});
