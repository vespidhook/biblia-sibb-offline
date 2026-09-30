import books from '../constants/bible-books.json';

export const BIBLE_BOOKS = books;
export const TOTAL_CHAPTERS = books.reduce((total, book) => total + book.chapters, 0);
export type ReadingProgress = Record<string, string>;

export function chapterKey(bookId: string, chapter: number) {
  const book = books.find((item) => item.id === bookId);
  if (!book || !Number.isInteger(chapter) || chapter < 1 || chapter > book.chapters) {
    throw new Error('Capítulo inválido');
  }
  return `${bookId}:${chapter}`;
}

export function parseProgress(raw: string | null): ReadingProgress {
  if (raw === null) return {};
  const data: unknown = JSON.parse(raw);
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Progresso inválido');
  const progress: ReadingProgress = {};
  for (const book of books) {
    for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
      const key = chapterKey(book.id, chapter);
      const date = (data as Record<string, unknown>)[key];
      if (typeof date === 'string' && Number.isFinite(Date.parse(date))) progress[key] = date;
    }
  }
  return progress;
}

export function updateChapter(progress: ReadingProgress, bookId: string, chapter: number, read: boolean, date = new Date().toISOString()): ReadingProgress {
  const key = chapterKey(bookId, chapter);
  const next = { ...progress };
  if (read) next[key] = next[key] ?? date;
  else delete next[key];
  return next;
}

export function summarizeProgress(progress: ReadingProgress) {
  const byBook = books.map((book, index) => {
    const read = Array.from({ length: book.chapters }, (_, chapter) =>
      Boolean(progress[chapterKey(book.id, chapter + 1)]));
    const count = read.filter(Boolean).length;
    return { ...book, index, count, read, nextChapter: read.findIndex((value) => !value) + 1 };
  });
  const count = byBook.reduce((total, book) => total + book.count, 0);
  return {
    byBook,
    count,
    completedBooks: byBook.filter((book) => book.count === book.chapters).length,
    percent: Math.floor(count / TOTAL_CHAPTERS * 100),
  };
}
