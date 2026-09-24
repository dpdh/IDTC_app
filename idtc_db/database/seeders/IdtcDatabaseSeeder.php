<?php

namespace Database\Seeders;

use App\Models\Content;
use App\Models\ContentSection;
use App\Models\Project;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class IdtcDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $roles = collect([
            ['name' => 'super_admin', 'label' => 'Super Admin', 'description' => 'Full access to users, content, projects, and settings.'],
            ['name' => 'content_editor', 'label' => 'Content Editor', 'description' => 'Create, edit, publish, and archive IDTC learning content.'],
            ['name' => 'facility_manager', 'label' => 'Facility Manager', 'description' => 'Manage Digital Twin project and operational data.'],
            ['name' => 'viewer', 'label' => 'Viewer', 'description' => 'Read published content and project summaries.'],
        ])->mapWithKeys(fn (array $role) => [$role['name'] => Role::updateOrCreate(['name' => $role['name']], $role)]);

        $admin = User::updateOrCreate(
            ['email' => 'admin@idtc.local'],
            ['name' => 'IDTC Administrator', 'password' => Hash::make('change-me'), 'status' => 'active', 'organization' => 'IDTC']
        );
        $admin->roles()->syncWithoutDetaching([$roles['super_admin']->id]);

        $projects = [
            ['slug' => 'rs-siloam', 'name' => 'RS Siloam', 'facility_type' => 'Smart Hospital', 'status' => 'operational', 'health_score' => 94],
            ['slug' => 'rs-hermina', 'name' => 'RS Hermina', 'facility_type' => 'Healthcare Campus', 'status' => 'monitoring', 'health_score' => 88],
            ['slug' => 'gedung-mth-27-adhi', 'name' => 'Gedung MTH 27 Adhi', 'facility_type' => 'Commercial Building', 'status' => 'operational', 'health_score' => 91],
            ['slug' => 'gbk', 'name' => 'GBK', 'facility_type' => 'Stadium & Public Facility', 'status' => 'event_ready', 'health_score' => 97],
        ];
        foreach ($projects as $project) {
            Project::updateOrCreate(['slug' => $project['slug']], $project);
        }

        $chapters = [
            ['slug' => 'memahami-digital-twin', 'title' => 'Memahami Digital Twin'],
            ['slug' => 'prinsip-fundamental-digital-twin', 'title' => 'Prinsip Fundamental Digital Twin'],
            ['slug' => 'digital-twin-dimulai-dari-keputusan', 'title' => 'Digital Twin Dimulai dari Keputusan'],
            ['slug' => 'digital-twin-adalah-ilmu-multidisiplin', 'title' => 'Digital Twin adalah Ilmu Multidisiplin'],
            ['slug' => 'data-sebagai-jantung-digital-twin', 'title' => 'Data sebagai Jantung Digital Twin'],
            ['slug' => 'membangun-representasi-digital', 'title' => 'Membangun Representasi Digital'],
            ['slug' => 'sensor-iot-dan-hubungan-dunia-nyata', 'title' => 'Sensor, IoT dan Hubungan dengan Dunia Nyata'],
            ['slug' => 'digital-twin-dan-teknologi-pendukung', 'title' => 'Digital Twin dan Teknologi Pendukung'],
            ['slug' => 'interoperabilitas-dan-ekosistem', 'title' => 'Interoperabilitas dan Ekosistem Digital Twin'],
            ['slug' => 'dari-model-menjadi-digital-twin', 'title' => 'Dari Model Menjadi Digital Twin'],
            ['slug' => 'contoh-implementasi-digital-twin', 'title' => 'Contoh Implementasi Digital Twin'],
            ['slug' => 'digital-twin-indonesia', 'title' => 'Digital Twin Indonesia'],
            ['slug' => 'ke-mana-digital-twin-indonesia', 'title' => 'Ke Mana Digital Twin Indonesia?'],
        ];

        foreach ($chapters as $index => $chapter) {
            $content = Content::updateOrCreate(
                ['slug' => $chapter['slug']],
                ['title' => $chapter['title'], 'author_id' => $admin->id, 'content_type' => 'chapter', 'status' => 'published', 'sort_order' => $index + 1, 'published_at' => now()]
            );
            ContentSection::updateOrCreate(
                ['content_id' => $content->id, 'sort_order' => 1],
                ['heading' => $chapter['title'], 'body' => 'Materi pembelajaran Digital Twin IDTC. Kelola isi bab ini melalui content management.', 'section_type' => 'text']
            );
        }
    }
}
