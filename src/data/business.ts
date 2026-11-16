// Single source of truth for The Mess's facts. Every page, the footer, the
// structured data and the sitemap read from here, so a change to hours, phone or
// address updates the whole site at once. Keep it identical to the Google
// Business Profile, character for character.
//
// Empty strings are unknowns (see SEO_TODO.md); features that need them stay
// hidden until they're filled in. Never put a guess in here.

export const business = {
  name: 'The Mess Concept', // must match the Google Business Profile name exactly
  brand: 'THE MESS',
  street: '37 Otago Street',
  locality: 'Glasgow',
  region: 'Scotland',
  postcode: 'G12 8JJ',
  country: 'GB',
  area: "Glasgow's West End",
  lat: 55.8747,
  lng: -4.2816,
  phone: '+44 7856 050231',
  phoneHref: '+447856050231',
  email: 'hello@themessconcept.co.uk',
  openedOn: '2026-11-15',
  /** Google Maps place ID for the Business Profile (resolved from the profile's review link). */
  googlePlaceId: 'ChIJe6kB_TFFiEgR_J8gQLLPoFE',
  hours: {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '08:00',
    closes: '18:00',
  },
  links: {
    // Opens the Business Profile in Google Maps (with its Directions button), not just the address
    directions: 'https://www.google.com/maps/search/?api=1&query=The+Mess+Concept+37+Otago+Street+Glasgow&query_place_id=ChIJe6kB_TFFiEgR_J8gQLLPoFE',
    instagram: 'https://www.instagram.com/themessconcept/',
    googleProfile: 'https://www.google.com/maps/place/?q=place_id:ChIJe6kB_TFFiEgR_J8gQLLPoFE',
    googleReview: 'https://g.page/r/CfyfIECyz6BREBM/review',
    loyalty: '', // loyalty card sign-up link: shows "Loyalty Card" once set
  },
  /** Google Search Console HTML-tag verification (the content="…" value only). */
  googleVerification: '',
} as const;

/** Display form of a 24h time: "08:00" → "08.00" (as on the shop sign). */
export const signTime = (t: string) => t.replace(':', '.');

// Build-time guard: fail the build rather than ship broken local data.
const required: [string, unknown][] = [
  ['name', business.name], ['street', business.street], ['locality', business.locality],
  ['postcode', business.postcode], ['phone', business.phone], ['opens', business.hours.opens],
  ['closes', business.hours.closes],
];
for (const [k, val] of required) {
  if (!val) throw new Error(`src/data/business.ts: "${k}" is required for local SEO`);
}
if (!/^\+44\d{9,10}$/.test(business.phoneHref)) throw new Error('business.phoneHref must be +44 followed by digits');
