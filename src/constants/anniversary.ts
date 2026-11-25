// Comemoração dos 69 anos da SIBB (1957–2026).
// Abertura, selo, faixa e versículo tema somem sozinhos a partir de
// 01/01/2027. Ícone e splash nativos precisam ser revertidos à mão
// (git revert dos commits "69 anos: ícone" e "abertura comemorativa").
export const ANNIVERSARY_URL = 'https://sibbonsucesso.com.br/69anos/';

const ANNIVERSARY_END = new Date(2026, 11, 31, 23, 59, 59); // 31/12/2026, horário local

export function isAnniversaryActive(now = new Date()) {
  return now <= ANNIVERSARY_END;
}

// Versículo tema: 2 Coríntios 8:11 (texto vem da versão que a pessoa lê).
export const THEME_VERSE = { bookAbbrev: '2co', chapterIndex: 7, verseIndex: 10, ref: '2 Coríntios 8:11' } as const;
