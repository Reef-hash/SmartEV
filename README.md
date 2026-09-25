# SmartEV Stor

Sistem stor dalam satu web app: rekod penggunaan material, restok, senarai stok dan mesej Telegram.

Gabungan dua projek asal:

- [MATERIAL-USAGE](https://github.com/fiqriadam0-source/MATERIAL-USAGE): borang penggunaan material (kini halaman **Penggunaan Material**)
- [RESTOCK](https://github.com/fiqriadam0-source/RESTOCK): borang restok, senarai stok dan Telegram Sender

## Halaman

| Halaman | URL | Fungsi |
| --- | --- | --- |
| Penggunaan Material | `#usage` | Borang pemohonan bahan (banyak baris), semakan baki masa nyata, usage history |
| Restok | `#restock` | Tambah stok untuk material & saiz |
| Senarai Stock | `#stock` | Baki semua material, merah jika bawah paras minimum |
| Telegram Sender | `#telegram` | Hantar mesej manual ke kumpulan stor |

Aplikasi ini ialah PWA, jadi boleh ditambah ke Home Screen.

Dokumentasi teknikal (seni bina, pelan kerja) ada dalam [docs/](docs/README.md).

## Teknologi

- React 19 + Vite
- Tailwind CSS 4 (`@tailwindcss/vite`)
- Google Apps Script + Google Sheets sebagai backend ([backend/stock.gs](backend/stock.gs))

## Struktur

```
src/
  App.jsx            navigasi, tema, data dikongsi (material & stok)
  api.js             URL backend + helper GET/POST
  pages/             UsagePage, RestockPage, StockPage, TelegramPage
  components/        MaterialCombobox, StockList, StatusMessage
  hooks/             useRemoteData, useInstallPrompt
public/              manifest, service worker, ikon
backend/stock.gs     kod Google Apps Script
```

## Environment variable

| Nama | Nilai |
| --- | --- |
| `VITE_API_URL` | URL web app Apps Script (`https://script.google.com/macros/s/<ID>/exec`) |

Nilai `VITE_*` dimasukkan ke dalam JavaScript yang dimuat turun pelayar, jadi **jangan letak rahsia** (contohnya token Telegram) di sini. Token Telegram disimpan dalam Script Properties (lihat bawah).

## Jalankan secara lokal

```bash
cp .env.example .env.local   # kemudian isi VITE_API_URL
npm install
npm run dev
```

Build production: `npm run build`

## Backend (Google Apps Script)

Kod dalam [backend/stock.gs](backend/stock.gs) disalin ke projek Apps Script yang terikat pada Google Sheet.

Sheet yang diperlukan:

- `Stock`: A bahan | B stok awal | C digunakan | D baki | E minimum | F saiz
- `MaterialUsage`: tarikh | nama | material | kuantiti | unit | tujuan
- `Restock`: tarikh | material | kuantiti | saiz

Endpoint:

| Method | Parameter | Fungsi |
| --- | --- | --- |
| GET | `action=getMaterials` | Senarai nama material (unik) |
| GET | `action=getSizesByMaterial&material=` | Senarai saiz untuk material |
| GET | `action=getBalanceByMaterial&material=&saiz=` | `{ material, baki, minimum, saiz }` |
| GET | `action=getStock` | `[{ material, saiz, baki, minimum }]` |
| GET | `action=getUsageHistory` | Rekod penggunaan, terbaru dahulu |
| POST | `nama, tujuan, items` (JSON) | Rekod penggunaan material |
| POST | `type=restock, material, saiz, kuantiti` | Rekod restok |
| POST | `type=telegram, message` | Hantar mesej Telegram |

### Tetapan Telegram

Token bot **tidak** disimpan dalam kod. Dalam editor Apps Script, buka **Project Settings → Script properties** dan tambah:

- `TELEGRAM_TOKEN`: token bot dari @BotFather
- `TELEGRAM_CHAT_ID`: chat ID penerima

Selepas ubah kod, buat **Deploy → Manage deployments → Edit → New version** supaya URL `/exec` yang sama menggunakan kod baharu.

## Deploy ke Vercel

1. Import repo ini di Vercel. Framework **Vite** dikesan secara automatik (build `npm run build`, output `dist`).
2. **Project Settings → Environment Variables**: tambah `VITE_API_URL` untuk Production (dan Preview jika perlu).
3. Deploy. Jika `VITE_API_URL` ditukar, buat **Redeploy** kerana nilai ini dibaca semasa build.

Navigasi guna `#hash`, jadi tiada tetapan rewrite diperlukan.

## Deploy ke GitHub Pages (alternatif)

Workflow [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) build dan deploy setiap push ke `main`.
Sekali sahaja:

- **Settings → Pages → Build and deployment → Source: GitHub Actions**
- **Settings → Secrets and variables → Actions → Variables**: tambah `VITE_API_URL`
