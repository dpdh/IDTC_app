<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## IDTC Database

Laravel backend untuk user management, content management, learning progress, dan portfolio project Digital Twin.

### Domain Database

- `users`, `roles`, `role_user`: akun dan role multi-user (`super_admin`, `content_editor`, `facility_manager`, `viewer`).
- `contents`, `content_sections`, `content_media`: chapter, section, media, status draft/published, author, dan soft delete.
- `content_progress`: progress belajar unik per user dan content.
- `projects`: portfolio fasilitas Digital Twin, health score, status, metadata APS, hub, dan model URN.
- `twini_ai_knowledge`: knowledge base Q&A Twini AI, topic, keywords, prioritas, dan status aktif.

### Local Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Seeder lokal membuat admin `admin@idtc.local` dengan password sementara `change-me`. Ganti password tersebut sebelum deployment.

### Laravel Commands

```bash
php artisan migrate:fresh --seed
php artisan test
```

Import knowledge base Q&A Markdown dengan format heading `### 1. Pertanyaan` dan jawaban di baris berikutnya:

```bash
php artisan twini-ai:import /path/to/1000-pertanyaan-digital-twin.md
```

Endpoint `POST /api/dina-ai/chat` mencari jawaban aktif dari database terlebih dahulu, lalu memakai knowledge base bawaan sebagai fallback.

### Native App Integration

Run the API from this project and configure the Expo app:

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

```bash
EXPO_PUBLIC_IDTC_API_URL=http://YOUR_MAC_IP:8000
```

The native app reads `GET /api/idtc/bootstrap` and uses local fallback data when the API is unavailable.

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

In addition, [Laracasts](https://laracasts.com) contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

You can also watch bite-sized lessons with real-world projects on [Laravel Learn](https://laravel.com/learn), where you will be guided through building a Laravel application from scratch while learning PHP fundamentals.

## Agentic Development

Laravel's predictable structure and conventions make it ideal for AI coding agents like Claude Code, Cursor, and GitHub Copilot. Install [Laravel Boost](https://laravel.com/docs/ai) to supercharge your AI workflow:

```bash
composer require laravel/boost --dev

php artisan boost:install
```

Boost provides your agent 15+ tools and skills that help agents build Laravel applications while following best practices.

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
