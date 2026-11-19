// The four sides of THE MESS. Each gets its own page at /<slug>/.
// Copy here is only what's confirmed; the details still needed (classes, prices,
// timetables, booking) are listed in SEO_TODO.md. Keep wellness wording within
// docs/seo/06-compliance.md: relaxation, never treatment.

export interface Offering {
  slug: 'coffee' | 'interiors' | 'pilates' | 'wellness';
  name: string;        // page heading and nav label
  tag: string;         // label in the hero tagline
  sub: string;         // line under the heading
  copy: string;
  note?: string;       // small print (wellness disclaimer)
  title: string;       // <title>
  description: string; // meta description
  schemaType?: string; // schema.org type for the department (coffee is the business itself)
  schemaDesc: string;
}

export const offerings: Offering[] = [
  {
    slug: 'coffee',
    name: 'Coffee',
    tag: 'Coffee',
    sub: 'Speciality coffee & artisan pastries',
    copy: 'Speciality coffee, served alongside artisan pastries.',
    title: 'Speciality Coffee & Pastries, Glasgow West End | THE MESS',
    description:
      "Speciality coffee served alongside artisan pastries at THE MESS, 37 Otago Street in Glasgow's West End. See the full drinks menu. Open daily 8am–6pm.",
    schemaDesc: 'Speciality coffee served alongside artisan pastries.',
  },
  {
    slug: 'interiors',
    name: 'Interiors',
    tag: 'Interiors',
    sub: 'Homeware & interior design',
    copy: 'Furniture, objects and homeware sourced from around the world, in limited quantities. Interior design services available.',
    title: 'Interiors, Homeware & Interior Design, Glasgow West End | THE MESS',
    description:
      'Furniture, objects and homeware sourced from around the world in limited quantities, plus interior design services, at THE MESS, 37 Otago Street, Glasgow.',
    schemaType: 'HomeGoodsStore',
    schemaDesc: 'Furniture, objects and homeware sourced from around the world in limited quantities, plus interior design services.',
  },
  {
    slug: 'pilates',
    name: 'Pilates',
    tag: 'Pilates',
    sub: 'Reformer classes',
    copy: 'Reformer Pilates classes, guided with care.',
    title: 'Reformer Pilates, Glasgow West End | THE MESS',
    description:
      "Reformer Pilates classes, guided with care, at THE MESS on Otago Street in Glasgow's West End, a short walk from Kelvinbridge Subway.",
    schemaType: 'HealthClub',
    schemaDesc: 'Reformer Pilates classes.',
  },
  {
    slug: 'wellness',
    name: 'Wellness',
    tag: 'Wellbeing',
    sub: 'Time to relax, including Reiki',
    copy: 'Calm, quiet sessions to relax and unwind, including Reiki.',
    note: 'Our wellbeing sessions are for relaxation and are not a substitute for medical advice or treatment.',
    title: 'Wellbeing & Reiki, Glasgow West End | THE MESS',
    description:
      "Calm, quiet sessions to relax and unwind, including Reiki, at THE MESS, 37 Otago Street in Glasgow's West End.",
    schemaType: 'HealthAndBeautyBusiness',
    schemaDesc: 'Relaxation and wellbeing sessions, including Reiki.',
  },
];
