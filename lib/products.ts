/**
 * The products of Eclipse, in the order of Eclipse-Web's `content/products.json` (76767ea). Today roofy only
 * draws Roofy's plate (section 02); lote B3 brings the rest of that file (status, points) for «otros negocios».
 */
export const PRODUCT_IDS = ['roofy', 'foody', 'markyt', 'handy', 'gym', 'dental', 'clinic', 'vet'] as const;
export type ProductId = (typeof PRODUCT_IDS)[number];
