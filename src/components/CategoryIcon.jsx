const ICONS = {
  chauds: (
    <>
      <path d="M4 9h12v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9Z" />
      <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M7 3.5c0 1-1 1-1 2s1 1 1 2" />
      <path d="M10.5 3.5c0 1-1 1-1 2s1 1 1 2" />
    </>
  ),
  frappe: (
    <>
      <path d="M6 4h8l-1 13.5a2 2 0 0 1-2 1.5h-2a2 2 0 0 1-2-1.5L6 4Z" />
      <path d="M5 4h10" />
      <path d="M10 4V2" />
    </>
  ),
  signature: (
    <path d="M10 2.5 12 8l5.5.5-4.2 3.6 1.3 5.4L10 14.6 5.4 17.5l1.3-5.4L2.5 8.5 8 8Z" />
  ),
  petitDej: (
    <path d="M3 13c0-4.5 3.2-9 7-9 1 0 1.6.7 1.3 1.6-.5 1.4.4 2.6 1.8 2.3.9-.2 1.7.5 1.4 1.4-.4 1.2.5 2.3 1.7 2 1-.2 1.8.7 1.4 1.6C16.8 15.8 13.8 18 10.3 18 6.5 18 3 16 3 13Z" />
  ),
  touteHeure: (
    <>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 5.5V10l3 2" />
    </>
  ),
  table: (
    <>
      <path d="M5 2v7a2 2 0 0 0 2 2v7" />
      <path d="M5 2v4M7 2v4" />
      <path d="M14 2c-1.5 0-2.5 1.8-2.5 4s1 4 2.5 4v8" />
    </>
  ),
  desserts: (
    <>
      <path d="M3 11h14l-1.5 6a2 2 0 0 1-2 1.5H6.5a2 2 0 0 1-2-1.5L3 11Z" />
      <path d="M4 11c0-3.5 3-6 6-6s6 2.5 6 6" />
      <path d="M10 5V2.5" />
    </>
  ),
}

function pickIcon(name = '') {
  const n = name.toLowerCase()
  if (n.includes('chaud') || n.includes('froid')) return ICONS.chauds
  if (n.includes('frappuccino') || n.includes('smoothie')) return ICONS.frappe
  if (n.includes('signature')) return ICONS.signature
  if (n.includes('petit-déjeuner') || n.includes('petit-dejeuner')) return ICONS.petitDej
  if (n.includes('toute heure')) return ICONS.touteHeure
  if (n.includes('table')) return ICONS.table
  if (n.includes('dessert')) return ICONS.desserts
  return ICONS.signature
}

export default function CategoryIcon({ name, size = 16, style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {pickIcon(name)}
    </svg>
  )
}
