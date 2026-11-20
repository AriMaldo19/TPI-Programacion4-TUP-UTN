/** Se formatean los precios en pesos. */
export function pesos(valor: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(valor)
}
