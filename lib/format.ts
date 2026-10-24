// Petites fonctions d'affichage des coordonnées (téléphone, liens).

export function formatPhone(phone: string): string {
  const m = phone.replace(/\s/g, "").match(/^\+212(\d{3})(\d{3})(\d{3})$/);
  return m ? `+212 ${m[1]} ${m[2]} ${m[3]}` : phone;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, "")}`;
}

export function waHref(whatsapp: string): string {
  return `https://wa.me/${whatsapp.replace(/\D/g, "")}`;
}
