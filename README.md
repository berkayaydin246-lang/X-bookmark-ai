# X Bookmark AI

[TR](#turkce) | [EN](#english)

---

## Turkce

X (Twitter) bookmark arsivini yapay zeka ile kategorize eden, etiketleyen ve filtrelenebilir bir panelde sunan Next.js uygulamasi.

### One Cikanlar

- X data archive icinden bookmarks.js veya JSON uyumlu veri okuma
- AI destekli kategori, ozet, etiket ve confidence uretimi
- Dil secimi destegi (TR, EN ve ek diller)
- Kategori bazli filtre, tam metin arama ve siralama
- JSON ve CSV disa aktarma
- Session bazli API key kullanimi
- API tuketimini azaltan optimizasyonlar:
- Duplicate bookmark dedup
- Dil bazli session cache
- Guclu sinyalde local hizli siniflandirma
- Exponential backoff ile retry

### Teknoloji Yigini

- Next.js 14 (App Router)
- TypeScript (strict)
- Tailwind CSS
- Zustand
- Framer Motion
- Sonner
- Lucide React
- Anthropic Claude API (claude-sonnet-4-20250514)

### Mimari

```text
src/
	app/
		page.tsx                    -> Landing
		app/page.tsx                -> Dashboard
		api/categorize/route.ts     -> Claude API proxy
	components/
		landing/*                   -> Landing section bilesenleri
		dashboard/*                 -> Upload, progress, sonuc ekranlari
	lib/
		parser.ts                   -> bookmarks.js parse islemi
		categorizer.ts              -> Batch isleme + cache + retry
		export.ts                   -> JSON/CSV export
		types.ts                    -> Tum tipler
	store/
		useBookmarkStore.ts         -> Zustand state yonetimi
```

### Kurulum

1. Gereksinimler:
- Node.js 18+
- npm 9+

2. Bagimliliklari yukle:

```bash
npm install
```

3. Gelistirme sunucusunu baslat:

```bash
npm run dev
```

Tarayicida ac:

```text
http://localhost:3000
```

### Kullanim Akisi

1. Landing uzerinden uygulamaya gir.
2. Anthropic API key gir.
3. bookmarks.js dosyasini yukle.
4. Cikti dili sec.
5. Start Categorizing ile islemi baslat.
6. Sonuclari filtrele, ara, sirala ve export et.

### Guvenlik Notu

- API key sessionStorage uzerinde tutulur.
- Sunucu tarafindaki proxy endpoint uzerinden Anthropic API cagrisi yapilir.
- Uygulama veriyi kalici veritabanina yazmaz.

Not: Tarayici istemcisi endpoint cagrisinda API key gonderdigi icin bu yapi tam gizli sunucu-anahtar modelinden farklidir. Gercek production gizliligi icin key yonetimi sunucu ortam degiskenleri ve kimlik dogrulamasi ile yapilmalidir.

### NPM Scriptleri

```bash
npm run dev
npm run build
npm run start
npm run lint
```

### Hata Giderme

Non-fast-forward:

```bash
git pull --rebase origin main
git push -u origin main
```

Unmerged files:

```bash
git rebase --abort
git merge --abort
git status
```

---

## English

A Next.js application that categorizes, tags, and organizes X (Twitter) bookmarks into a searchable dashboard using AI.

### Highlights

- Parse bookmarks.js (and JSON-compatible bookmark exports)
- AI-powered category, summary, tags, and confidence generation
- Multi-language output support (TR, EN, and more)
- Category filters, full-text search, sorting
- Export results as JSON and CSV
- Session-based API key handling
- API cost optimizations:
- Duplicate bookmark deduplication
- Language-scoped session cache
- Fast local classification on strong text signals
- Exponential backoff retry logic

### Tech Stack

- Next.js 14 (App Router)
- TypeScript (strict)
- Tailwind CSS
- Zustand
- Framer Motion
- Sonner
- Lucide React
- Anthropic Claude API (claude-sonnet-4-20250514)

### Architecture

```text
src/
	app/
		page.tsx                    -> Landing
		app/page.tsx                -> Dashboard
		api/categorize/route.ts     -> Claude API proxy
	components/
		landing/*                   -> Landing sections
		dashboard/*                 -> Upload, progress, results UI
	lib/
		parser.ts                   -> bookmarks.js parser
		categorizer.ts              -> Batch processing + cache + retry
		export.ts                   -> JSON/CSV export
		types.ts                    -> Shared TypeScript types
	store/
		useBookmarkStore.ts         -> Global state with Zustand
```

### Setup

1. Requirements:
- Node.js 18+
- npm 9+

2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

Open in browser:

```text
http://localhost:3000
```

### Usage Flow

1. Open the app from landing page.
2. Enter your Anthropic API key.
3. Upload bookmarks.js.
4. Select output language.
5. Click Start Categorizing.
6. Filter, search, sort, and export results.

### Security Note

- API key is stored in sessionStorage.
- Anthropic calls are made through the proxy endpoint.
- No persistent database storage is used.

Note: Since the client sends the API key to the endpoint, this is not a fully hidden server-secret model. For production-grade secrecy, use server-managed credentials with authentication.

### NPM Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

### Troubleshooting

Non-fast-forward push:

```bash
git pull --rebase origin main
git push -u origin main
```

Unmerged files:

```bash
git rebase --abort
git merge --abort
git status
```

## License

This repository is currently prepared for private/project use. Add a license file if needed.
