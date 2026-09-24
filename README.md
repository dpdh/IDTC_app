# IDTC App

Platform Digital Twin Indonesia yang terdiri dari aplikasi mobile Expo/React Native, API Laravel, dan aplikasi web pendukung.

## Fitur

- Onboarding futuristik dengan animasi grid 3D isometrik.
- Materi literasi Digital Twin dan carousel pembelajaran.
- Portfolio project dan fasilitas Digital Twin.
- Twini AI dengan knowledge base Laravel.
- Twini Shop untuk katalog merchandise.
- Login Google/Apple dan autentikasi lokal.
- Dukungan iOS Simulator, Android, dan web.

## Struktur Proyek

```text
IDTC/
├── idtc-native/   # Aplikasi Expo React Native
├── idtc_db/       # Laravel API dan database
├── DTwin-learn/   # Aplikasi web pembelajaran Next.js
└── idtc-app/      # Aplikasi web Vite
```

## Persyaratan

- Node.js dan npm
- PHP 8.3+
- Composer
- Xcode untuk iOS Simulator
- Android Studio untuk Android Emulator

## Menjalankan API Laravel

```bash
cd idtc_db
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000
```

API tersedia di `http://127.0.0.1:8000`.

Endpoint utama:

```text
GET  /api/idtc/bootstrap
POST /api/dina-ai/chat
```

Contoh request Twini AI:

```bash
curl -X POST http://127.0.0.1:8000/api/dina-ai/chat \
	-H 'Accept: application/json' \
	-H 'Content-Type: application/json' \
	-d '{"message":"Apa itu Digital Twin?"}'
```

## Menjalankan Aplikasi Native

```bash
cd idtc-native
npm install
cp .env.example .env
```

Untuk iOS Simulator, gunakan:

```env
EXPO_PUBLIC_IDTC_API_URL=http://127.0.0.1:8000
```

Kemudian jalankan:

```bash
npm start
npm run ios
```

Untuk perangkat fisik, ganti `127.0.0.1` dengan alamat IP komputer pada jaringan yang sama, misalnya:

```env
EXPO_PUBLIC_IDTC_API_URL=http://192.168.1.10:8000
```

Android Emulator biasanya menggunakan `http://10.0.2.2:8000` untuk mengakses API host.

## Validasi

```bash
cd idtc-native
npx tsc -p tsconfig.json --noEmit
npx expo export --platform ios --output-dir /tmp/idtc-export
```

Untuk test API Laravel:

```bash
cd idtc_db
php artisan test
```

## Ikon dan Splash Screen

- Ikon aplikasi: `idtc-native/assets/ITDC_icon_app_01.png`
- Splash screen: `idtc-native/assets/ITDC_icon.png`
- Ikon Twini AI: `idtc-native/assets/ITDC_icon.png`
- Ikon Twini Shop: `idtc-native/assets/twini shop.png`

File `.env`, dependency, build output, dan metadata lokal dikecualikan dari repository melalui `.gitignore`.
