<?php

namespace App\Console\Commands;

use App\Models\TwiniAiKnowledge;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class ImportTwiniAiKnowledge extends Command
{
    protected $signature = 'twini-ai:import {path : Markdown file containing ### N. Question headings}';

    protected $description = 'Import Twini AI Q&A knowledge from Markdown';

    public function handle(): int
    {
        $path = $this->argument('path');
        if (! is_file($path)) {
            $this->error("Knowledge file not found: {$path}");
            return self::FAILURE;
        }

        $entries = $this->parseMarkdown((string) file_get_contents($path));
        foreach ($entries as $entry) {
            TwiniAiKnowledge::updateOrCreate(
                ['slug' => $entry['slug']],
                $entry + ['source' => $path, 'is_active' => true]
            );
        }

        $this->info("Imported {$entries->count()} Twini AI knowledge entries.");
        return self::SUCCESS;
    }

    private function parseMarkdown(string $markdown): \Illuminate\Support\Collection
    {
        preg_match_all('/^###\s+(\d+)\.\s+(.+?)\R(.*?)(?=^###\s+\d+\.\s+|\z)/ms', $markdown, $matches, PREG_SET_ORDER);

        return collect($matches)->map(function (array $match) {
            $question = trim($match[2]);
            $answer = trim(preg_replace('/\s*\R\s*/', ' ', $match[3]));
            $topic = $this->topicFor((int) $match[1]);

            return [
                'slug' => Str::slug($match[1].'-'.$question),
                'topic' => $topic,
                'question' => $question,
                'answer' => $answer,
                'keywords' => $this->keywords($question),
                'priority' => 0,
            ];
        });
    }

    private function topicFor(int $number): string
    {
        return match (true) {
            $number <= 50 => 'Dasar dan terminologi',
            $number <= 100 => 'Arsitektur dan komponen',
            $number <= 150 => 'Data dan kualitas',
            $number <= 200 => 'Pemodelan aset dan semantik',
            $number <= 250 => 'Sensor, IoT, dan konektivitas',
            $number <= 300 => 'Simulasi dan rekayasa',
            $number <= 350 => 'AI, analitik, dan prediksi',
            $number <= 400 => 'Integrasi sistem dan interoperabilitas',
            $number <= 450 => 'Cloud, edge, dan komputasi',
            $number <= 500 => 'Visualisasi dan interaksi',
            $number <= 550 => 'Manufaktur dan rantai pasok',
            $number <= 600 => 'Bangunan dan infrastruktur',
            $number <= 650 => 'Energi dan utilitas',
            $number <= 700 => 'Kesehatan dan ilmu hayati',
            $number <= 750 => 'Transportasi dan mobilitas',
            $number <= 800 => 'Operasi, pemeliharaan, dan keselamatan',
            $number <= 850 => 'Keamanan siber dan privasi',
            $number <= 900 => 'Tata kelola, standar, dan etika',
            $number <= 950 => 'Bisnis, biaya, dan pengukuran manfaat',
            default => 'Implementasi, adopsi, dan masa depan',
        };
    }

    private function keywords(string $question): array
    {
        $stopWords = ['apa', 'apakah', 'bagaimana', 'mengapa', 'dalam', 'digital', 'twin'];
        return collect(preg_split('/\s+/', Str::of($question)->lower()->replaceMatches('/[^a-z0-9\s]/', ' ')->squish()->toString()))
            ->filter(fn (string $word) => strlen($word) > 3 && ! in_array($word, $stopWords, true))
            ->values()->all();
    }
}
