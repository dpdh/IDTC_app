<?php

namespace Database\Seeders;

use App\Models\TwiniAiKnowledge;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TwiniAiKnowledgeSeeder extends Seeder
{
    public function run(): void
    {
        $entries = [
            ['topic' => 'Dasar dan terminologi', 'question' => 'Apa yang dimaksud dengan Digital Twin?', 'answer' => 'Digital Twin adalah representasi virtual atau digital yang terhubung dengan entitas atau proses nyata dan diperbarui menggunakan data. Nilainya berasal dari kemampuan memahami keadaan, menguji skenario, dan membantu keputusan sepanjang siklus hidup.'],
            ['topic' => 'Dasar dan terminologi', 'question' => 'Mengapa Digital Twin penting?', 'answer' => 'Digital Twin menghubungkan data, model, dan proses kerja agar organisasi dapat memahami kondisi aset, menguji pilihan, serta mengambil keputusan yang lebih cepat dan terukur.'],
            ['topic' => 'Arsitektur dan komponen', 'question' => 'Apa saja komponen utama Digital Twin?', 'answer' => 'Komponen utamanya meliputi sumber data, konektivitas, model digital, penyimpanan, layanan analitik, antarmuka pengguna, identitas aset, serta tata kelola dan keamanan.'],
            ['topic' => 'Data dan kualitas', 'question' => 'Mengapa kualitas data penting dalam Digital Twin?', 'answer' => 'Kualitas data menentukan kualitas insight dan keputusan. Pastikan data memiliki makna, satuan, timestamp, provenance, serta pemeriksaan kelengkapan dan validitas yang jelas.'],
            ['topic' => 'AI, analitik, dan prediksi', 'question' => 'Bagaimana AI digunakan dalam Digital Twin?', 'answer' => 'AI dapat mendeteksi anomali, memperkirakan keadaan atau kegagalan, menyarankan tindakan, dan membantu optimasi. Untuk keputusan penting, hasil AI tetap perlu validasi dan pengawasan manusia.'],
            ['topic' => 'Operasi, pemeliharaan, dan keselamatan', 'question' => 'Apa hubungan Digital Twin dengan predictive maintenance?', 'answer' => 'Digital Twin menggabungkan data sensor, histori operasi, dan model analitik untuk memperkirakan risiko kegagalan sehingga pekerjaan pemeliharaan dapat dijadwalkan sebelum downtime terjadi.'],
            ['topic' => 'Keamanan siber dan privasi', 'question' => 'Bagaimana cara mengamankan Digital Twin?', 'answer' => 'Gunakan identitas dan kontrol akses yang kuat, enkripsi, segmentasi jaringan, patching, logging, threat modeling, backup, dan prosedur pemulihan yang sesuai dengan tingkat risiko aset.'],
            ['topic' => 'Bisnis, biaya, dan pengukuran manfaat', 'question' => 'Bagaimana mengukur manfaat Digital Twin?', 'answer' => 'Tetapkan baseline dan ukur indikator yang menghubungkan performa teknis dengan hasil operasional seperti downtime, energi, kualitas, risiko, biaya siklus hidup, dan penggunaan sistem.'],
            ['topic' => 'Implementasi, adopsi, dan masa depan', 'question' => 'Bagaimana memulai proyek Digital Twin?', 'answer' => 'Mulai dari keputusan bernilai dan batas sistem yang jelas, pilih satu skenario nyata, tetapkan data dan KPI, uji pilot, validasi hasil, lalu perluas secara bertahap berdasarkan manfaat dan risiko.'],
        ];

        foreach ($entries as $entry) {
            TwiniAiKnowledge::updateOrCreate(
                ['slug' => Str::slug($entry['question'])],
                $entry + [
                    'keywords' => $this->keywords($entry['question']),
                    'source' => 'seed',
                    'priority' => 10,
                    'is_active' => true,
                ]
            );
        }
    }

    private function keywords(string $question): array
    {
        return collect(preg_split('/\s+/', Str::of($question)->lower()->replaceMatches('/[^a-z0-9\s]/', ' ')->squish()->toString()))
            ->filter(fn (string $word) => strlen($word) > 3 && ! in_array($word, ['apa', 'apakah', 'bagaimana', 'mengapa', 'dengan', 'dalam'], true))
            ->values()->all();
    }
}
