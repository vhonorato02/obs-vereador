/**
 * Other names a sitting councillor has used in official records. Matching by name
 * alone would silently drop old propositions if a parliamentary name changes.
 * Keys are compared after normalisation (no accents, lower case).
 */
export const APELIDOS: Record<string, string[]> = {
  "norberto-moraes": ["Norbertinho"],
  "felipinho-cesar": ["Felipe César Filho - FC", "Felipe César Filho", "Felipe Cesar - FC"],
};
