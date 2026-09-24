<?php

namespace App\Services;

use App\Models\Content;
use App\Models\Project;
use App\Models\TwiniAiKnowledge;
use Illuminate\Support\Facades\Cache;

class DinaAiService
{
    public function answer(string $message, string $literacyContext = ''): array
    {
        $question = mb_strtolower(trim($message));
        $projects = Cache::remember('dina-ai:projects', now()->addMinutes(5), fn () => Project::query()
            ->orderBy('name')
            ->get(['name', 'status', 'health_score'])
            ->map(static fn (Project $project): array => $project->toArray())
            ->all());
        $chapters = Cache::remember('dina-ai:chapters', now()->addMinutes(5), fn () => Content::query()
            ->where('status', 'published')
            ->orderBy('sort_order')
            ->pluck('title')
            ->all());

        if ($question === '') {
            return $this->response('Silakan tuliskan pertanyaan tentang Digital Twin, project, maintenance, atau regulasi IDTC.', $projects, $chapters);
        }

        $faqAnswer = $this->findFaqAnswer($message);

        $contextAnswer = $this->findLiteracyContextAnswer($message, $literacyContext);

        $answer = $faqAnswer ?? $contextAnswer ?? match (true) {
            str_contains($question, 'maintenance') || str_contains($question, 'pemeliharaan') => 'Twini AI menyarankan empat alur maintenance: Planning untuk jadwal dan prioritas, Predictive untuk prediksi kegagalan dan RUL, Preventive untuk checklist dan compliance, serta Reactive untuk alarm, tiket, SLA, dan penyelesaian insiden.',
            str_contains($question, 'project') || str_contains($question, 'portfolio') || str_contains($question, 'fasilitas') => 'Portfolio IDTC memuat '. count($projects) .' fasilitas: '. implode(', ', array_column($projects, 'name')) .'. Pilih project untuk melihat health score, model Digital Twin, telemetry, dan maintenance intelligence.',
            str_contains($question, 'regulasi') || str_contains($question, 'iso') || str_contains($question, 'kepatuhan') => 'Untuk regulasi, mulai dari ISO 19650, ISO 55001, ISO/IEC 27001, ISO/IEC 27701, PBG/SLF, RTRW/RDTR/KKPR, perlindungan data pribadi, audit trail, dan keamanan jaringan OT/IoT.',
            str_contains($question, 'bab') || str_contains($question, 'materi') || str_contains($question, 'belajar') => 'Materi IDTC tersedia dalam '. count($chapters) .' chapter published, dari Memahami Digital Twin sampai Ke Mana Digital Twin Indonesia?.',
            default => 'Twini AI adalah asisten Digital Twin IDTC. Saya dapat membantu menjelaskan konsep, membaca portfolio fasilitas, menyusun strategi maintenance, dan menavigasi materi regulasi serta literasi.',
        };

        return $this->response($answer, $projects, $chapters);
    }

    public function findFaqAnswer(string $question): ?string
    {
        $normalized = $this->normalizeQuestion($question);

        $databaseAnswer = $this->findDatabaseAnswer($normalized);
        if ($databaseAnswer !== null) {
            return $databaseAnswer;
        }

        $bestAnswer = null;
        $bestScore = 0;
        foreach ($this->knowledgeBase() as $faq) {
            $score = $this->questionMatchScore($normalized, $faq['question']);

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestAnswer = $faq['answer'];
            }
        }

        return $bestScore >= 14 ? $bestAnswer : null;
    }

    private function findLiteracyContextAnswer(string $question, string $context): ?string
    {
        if (trim($context) === '') {
            return null;
        }

        $keywords = $this->extractKeywords($question);
        if ($keywords === []) {
            return null;
        }

        $paragraphs = preg_split('/(?:\R\s*\R|\\\\n\\\\n)/', trim($context)) ?: [];
        $bestParagraph = null;
        $bestScore = 0;

        foreach ($paragraphs as $paragraph) {
            $paragraph = trim($paragraph);
            if (strlen($paragraph) < 40) {
                continue;
            }

            $normalizedParagraph = $this->normalizeQuestion($paragraph);
            $score = count(array_filter(
                $keywords,
                static fn (string $keyword): bool => str_contains($normalizedParagraph, $keyword)
            ));

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestParagraph = $paragraph;
            }
        }

        $minimumScore = str_contains($this->normalizeQuestion($question), 'closed loop') ? 1 : 2;

        return $bestScore >= $minimumScore ? $bestParagraph : null;
    }

    private function findDatabaseAnswer(string $normalized): ?string
    {
        $knowledge = Cache::remember('twini-ai:knowledge:v1', now()->addMinutes(10), fn () =>
            TwiniAiKnowledge::query()
                ->where('is_active', true)
                ->orderByDesc('priority')
                ->get(['question', 'answer', 'keywords'])
                ->map(static fn (TwiniAiKnowledge $entry): array => [
                    'question' => $entry->question,
                    'answer' => $entry->answer,
                    'keywords' => $entry->keywords ?? [],
                ])
                ->all()
        );

        $bestMatch = null;
        $bestScore = 0;
        foreach ($knowledge as $entry) {
            $score = $this->questionMatchScore($normalized, $entry['question']);

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestMatch = $entry['answer'];
            }
        }

        return $bestScore >= 12 ? $bestMatch : null;
    }

    private function questionMatchScore(string $normalizedQuestion, string $candidateQuestion): int
    {
        $normalizedCandidate = $this->normalizeQuestion($candidateQuestion);
        if ($normalizedQuestion === $normalizedCandidate) {
            return 10000;
        }

        if (str_contains($normalizedQuestion, $normalizedCandidate) || str_contains($normalizedCandidate, $normalizedQuestion)) {
            return 5000;
        }

        $questionKeywords = $this->extractKeywords($normalizedQuestion);
        $candidateKeywords = $this->extractKeywords($normalizedCandidate);
        $overlap = array_filter(
            array_intersect($questionKeywords, $candidateKeywords),
            static fn (string $keyword): bool => ! in_array($keyword, ['digital', 'twin'], true)
        );

        return array_sum(array_map(
            static fn (string $keyword): int => in_array($keyword, ['ai', 'bim', 'gis', 'iot'], true) ? 20 : 10 + strlen($keyword),
            $overlap
        ));
    }

    private function normalizeQuestion(string $question): string
    {
        $normalized = mb_strtolower(trim($question));
        $normalized = preg_replace('/[^a-z0-9\s]/u', ' ', $normalized);
        $normalized = preg_replace('/\s+/', ' ', (string) $normalized);

        return trim((string) $normalized);
    }

    private function extractKeywords(string $question): array
    {
        $stopWords = [
            'apa', 'apakah', 'bagaimana', 'mengapa', 'kapan', 'siapa', 'dimana', 'mana', 'yang', 'ini', 'itu',
            'adalah', 'dari', 'dengan', 'untuk', 'dan', 'atau', 'yang', 'saja', 'tersebut', 'mereka', 'kami', 'di', 'ke',
            'seperti', 'karena', 'terkait', 'pada', 'akan', 'tentang', 'dalam', 'itu', 'bisa', 'jika', 'misalnya', 'hubungan', 'loop',
        ];

        $words = preg_split('/\s+/', $this->normalizeQuestion($question));

        return array_values(array_filter(
            $words,
            static fn (string $word) => strlen($word) > 1 && ! in_array($word, $stopWords, true)
        ));
    }

    private function knowledgeBase(): array
    {
        return [
            ['question' => 'Apa itu Digital Twin?', 'answer' => 'Digital Twin adalah representasi virtual atau digital dari sebuah objek, mesin, produk, proses, bangunan, bahkan kota yang ada di dunia nyata. Representasi ini tidak hanya berbentuk gambar atau model 3D, tetapi juga terhubung dengan data aktual dari sensor, perangkat IoT, sistem operasional, maupun catatan historis. Karena terus menerima pembaruan data, Digital Twin dapat menggambarkan kondisi aset fisik secara lebih akurat.'],
            ['question' => 'Apa tujuan utama Digital Twin?', 'answer' => 'Tujuan utama Digital Twin adalah membantu organisasi memahami kondisi aset atau proses nyata tanpa harus selalu melakukan pemeriksaan fisik secara langsung. Teknologi ini digunakan untuk memantau performa, mendeteksi masalah, membuat simulasi, memprediksi kondisi masa depan, dan menentukan keputusan operasional yang lebih tepat.'],
            ['question' => 'Apa perbedaan Digital Twin dan model 3D?', 'answer' => 'Model 3D pada dasarnya adalah visualisasi bentuk suatu objek, misalnya bentuk gedung, mesin, atau kendaraan. Digital Twin lebih luas karena menggabungkan model visual dengan data aktual, logika operasional, riwayat penggunaan, status sensor, serta kemampuan analitik. Dengan demikian, sebuah model 3D dapat menjadi bagian dari Digital Twin, tetapi belum tentu setiap model 3D adalah Digital Twin.'],
            ['question' => 'Apa saja komponen utama Digital Twin?', 'answer' => 'Komponen utama Digital Twin meliputi aset fisik, sensor atau perangkat IoT, jaringan komunikasi, platform penyimpanan data, mesin analitik, model virtual, dan antarmuka pengguna seperti dashboard. Aset fisik menghasilkan data, sensor menangkap data tersebut, jaringan mengirimkannya, lalu sistem digital mengolah dan menampilkannya menjadi informasi yang berguna.'],
            ['question' => 'Apa hubungan IoT dengan Digital Twin?', 'answer' => 'Internet of Things atau IoT menjadi sumber data utama dalam banyak implementasi Digital Twin. Sensor IoT dapat membaca suhu, tekanan, kelembapan, getaran, posisi, konsumsi energi, kecepatan, atau kondisi mesin. Data tersebut membuat Digital Twin tidak hanya menjadi model statis, tetapi menjadi cerminan kondisi nyata yang terus berubah.'],
            ['question' => 'Apakah Digital Twin harus real-time?', 'answer' => 'Digital Twin tidak selalu wajib menggunakan data real-time. Untuk kebutuhan tertentu, pembaruan per jam, per hari, atau per minggu sudah cukup, misalnya untuk evaluasi energi gedung. Namun, pada sistem yang kritis seperti kendaraan otonom, mesin industri, ruang operasi, atau jaringan listrik, pembaruan mendekati real-time sangat penting agar respons dapat dilakukan dengan cepat.'],
            ['question' => 'Apa manfaat Digital Twin di industri?', 'answer' => 'Dalam industri, Digital Twin dapat membantu perusahaan mengurangi waktu henti mesin, meningkatkan produktivitas, meminimalkan pemborosan energi, serta memperbaiki kualitas produk. Perusahaan juga dapat mensimulasikan perubahan proses produksi sebelum diterapkan ke pabrik nyata, sehingga risiko kesalahan dan biaya percobaan dapat dikurangi.'],
            ['question' => 'Apa itu aset fisik dalam Digital Twin?', 'answer' => 'Aset fisik adalah objek nyata yang menjadi sumber data dan direpresentasikan oleh Digital Twin. Contohnya meliputi mesin produksi, turbin, kendaraan, gedung, panel surya, perangkat medis, jalur produksi, atau infrastruktur kota seperti lampu jalan dan jembatan.'],
            ['question' => 'Apa itu aset digital dalam Digital Twin?', 'answer' => 'Aset digital adalah representasi virtual dari aset fisik. Aset ini dapat berupa dashboard, grafik, basis data, model 3D, simulasi fisika, algoritma AI, atau kombinasi dari semuanya. Aset digital digunakan untuk memahami bagaimana aset fisik bekerja, bagaimana kondisinya sekarang, dan bagaimana kemungkinan kondisinya pada masa depan.'],
            ['question' => 'Apa perbedaan Digital Twin dan simulasi?', 'answer' => 'Simulasi biasanya menggunakan asumsi, data desain, atau skenario buatan untuk mempelajari kemungkinan perilaku suatu sistem. Digital Twin juga dapat melakukan simulasi, tetapi memiliki keunggulan karena terhubung dengan data nyata dari aset fisik. Oleh sebab itu, Digital Twin dapat menyesuaikan modelnya berdasarkan kondisi aktual di lapangan.'],
            ['question' => 'Apa itu Digital Shadow?', 'answer' => 'Digital Shadow adalah representasi digital yang menerima data dari aset fisik secara otomatis, tetapi tidak selalu mengirimkan instruksi atau kontrol kembali ke aset tersebut. Misalnya, dashboard pabrik yang menampilkan suhu dan status mesin adalah Digital Shadow jika dashboard tersebut hanya melakukan pemantauan tanpa mengendalikan mesin.'],
            ['question' => 'Apa itu Digital Thread?', 'answer' => 'Digital Thread adalah aliran informasi yang menghubungkan data sepanjang siklus hidup produk atau aset. Data tersebut dapat dimulai dari desain, pengujian, produksi, distribusi, penggunaan, pemeliharaan, hingga akhir masa pakai. Digital Thread membuat informasi tidak terpisah-pisah antar departemen dan mendukung terbentuknya Digital Twin yang lebih lengkap.'],
            ['question' => 'Bagaimana Digital Twin bekerja?', 'answer' => 'Digital Twin bekerja dengan mengumpulkan data dari aset nyata melalui sensor, perangkat IoT, sistem ERP, SCADA, GPS, kamera, atau sumber data lainnya. Data kemudian dikirim ke platform digital untuk disimpan, dibersihkan, dianalisis, dan dibandingkan dengan model virtual. Hasilnya dapat berupa dashboard kondisi saat ini, peringatan masalah, prediksi kerusakan, atau rekomendasi tindakan.'],
            ['question' => 'Apa contoh Digital Twin sederhana?', 'answer' => 'Contoh sederhana adalah dashboard untuk mesin pompa air di sebuah gedung. Dashboard tersebut menampilkan status pompa hidup atau mati, tekanan air, suhu motor, konsumsi listrik, dan riwayat gangguan. Jika tekanan turun atau suhu motor terlalu tinggi, sistem dapat memberikan notifikasi kepada teknisi.'],
            ['question' => 'Apa contoh Digital Twin di rumah?', 'answer' => 'Digital Twin di rumah dapat berupa sistem smart home yang merepresentasikan kondisi rumah secara digital. Pengguna dapat melihat suhu ruangan, kelembapan, konsumsi listrik, status lampu, kamera keamanan, kualitas udara, serta penggunaan air melalui aplikasi. Sistem juga dapat memberi rekomendasi, misalnya mematikan perangkat yang boros energi.'],
            ['question' => 'Apa manfaat Digital Twin untuk manufaktur?', 'answer' => 'Digital Twin membantu manufaktur memantau seluruh proses produksi dari bahan baku hingga produk jadi. Teknologi ini dapat digunakan untuk mengidentifikasi mesin yang paling sering bermasalah, mencari penyebab produk cacat, memperkirakan kebutuhan perawatan, dan mengoptimalkan kecepatan produksi tanpa menurunkan kualitas.'],
            ['question' => 'Apa manfaat Digital Twin untuk gedung?', 'answer' => 'Dalam gedung, Digital Twin dapat menghubungkan model bangunan dengan data operasional seperti penggunaan listrik, suhu ruangan, kualitas udara, status lift, sistem keamanan, dan kinerja AC. Pengelola gedung dapat mengetahui area yang boros energi, memprediksi kebutuhan perawatan, serta menciptakan kenyamanan yang lebih baik bagi penghuni.'],
            ['question' => 'Apa manfaat Digital Twin untuk kota pintar?', 'answer' => 'Digital Twin untuk kota pintar dapat digunakan untuk memahami kondisi kota secara menyeluruh melalui data lalu lintas, cuaca, banjir, konsumsi energi, sampah, keamanan, dan transportasi publik. Pemerintah dapat menguji kebijakan secara virtual, misalnya dampak penutupan jalan, pembangunan jalur bus, atau perubahan sistem lampu lalu lintas.'],
            ['question' => 'Apa manfaat Digital Twin di kesehatan?', 'answer' => 'Di bidang kesehatan, Digital Twin dapat digunakan untuk memodelkan kondisi pasien, alat medis, rumah sakit, atau alur pelayanan kesehatan. Misalnya, data pasien dapat dianalisis untuk memperkirakan risiko penyakit, sedangkan Digital Twin rumah sakit dapat membantu mengatur ketersediaan ruang, alat, tenaga medis, dan alur pasien.'],
            ['question' => 'Apa manfaat Digital Twin untuk kendaraan?', 'answer' => 'Digital Twin kendaraan dapat memantau kondisi mesin, aki, ban, rem, oli, konsumsi bahan bakar, serta pola penggunaan kendaraan. Dari data tersebut, pemilik atau operator armada dapat menentukan jadwal perawatan yang lebih tepat dan mengurangi risiko kendaraan mengalami kerusakan di perjalanan.'],
            ['question' => 'Apa data yang dibutuhkan Digital Twin?', 'answer' => 'Data yang dibutuhkan bergantung pada jenis aset dan tujuan implementasi. Data umum meliputi suhu, tekanan, getaran, kecepatan, lokasi GPS, kelembapan, konsumsi energi, status perangkat, jam operasi, histori kerusakan, jadwal perawatan, serta data lingkungan seperti cuaca atau kualitas udara.'],
            ['question' => 'Apa peran sensor dalam Digital Twin?', 'answer' => 'Sensor berperan sebagai “mata dan telinga” Digital Twin di dunia nyata. Sensor mengukur kondisi fisik aset secara terus-menerus atau berkala, lalu mengirimkan data ke sistem. Tanpa sensor atau sumber data yang baik, Digital Twin akan sulit mencerminkan kondisi aset secara akurat.'],
            ['question' => 'Apa itu telemetry?', 'answer' => 'Telemetry adalah proses pengukuran, pengumpulan, dan pengiriman data dari perangkat atau aset jarak jauh ke sistem pusat. Contohnya, sensor pada kendaraan mengirimkan informasi kecepatan, lokasi, suhu mesin, dan konsumsi bahan bakar ke platform cloud untuk dipantau oleh operator.'],
            ['question' => 'Apakah Digital Twin membutuhkan AI?', 'answer' => 'Digital Twin dapat dibuat tanpa AI, terutama jika hanya digunakan untuk visualisasi dan pemantauan dasar. Namun, AI membuat Digital Twin lebih cerdas karena dapat mengenali pola, mendeteksi anomali, memprediksi kerusakan, mengklasifikasikan kondisi, dan memberikan rekomendasi tindakan secara otomatis.'],
            ['question' => 'Bagaimana AI digunakan dalam Digital Twin?', 'answer' => 'AI menganalisis data historis dan data real-time untuk menemukan pola yang sulit dideteksi manusia. Misalnya, AI dapat mengetahui bahwa kombinasi getaran tinggi, kenaikan suhu, dan perubahan suara mesin merupakan indikasi awal kerusakan bearing. Berdasarkan pola itu, sistem dapat memberikan peringatan sebelum kerusakan terjadi.'],
            ['question' => 'Apa itu predictive maintenance?', 'answer' => 'Predictive maintenance adalah strategi perawatan yang dilakukan berdasarkan prediksi kondisi aset, bukan hanya berdasarkan jadwal tetap atau setelah terjadi kerusakan. Dengan strategi ini, perusahaan dapat mengganti komponen ketika benar-benar dibutuhkan, sehingga mengurangi biaya perawatan yang tidak perlu dan mencegah downtime mendadak.'],
            ['question' => 'Bagaimana Digital Twin mendukung predictive maintenance?', 'answer' => 'Digital Twin menggabungkan data sensor, riwayat kerusakan, jam operasi, dan model analitik untuk memperkirakan kesehatan aset. Sistem dapat memperkirakan kapan komponen mulai mengalami penurunan performa atau kapan risiko kegagalan meningkat, sehingga teknisi dapat menjadwalkan perawatan lebih awal.'],
            ['question' => 'Apa itu condition monitoring?', 'answer' => 'Condition monitoring adalah pemantauan kondisi suatu aset secara berkelanjutan menggunakan indikator tertentu. Pada mesin, indikator tersebut dapat berupa suhu, getaran, suara, tekanan, putaran, atau konsumsi energi. Tujuannya adalah mengetahui perubahan kondisi sebelum masalah berkembang menjadi kerusakan serius.'],
            ['question' => 'Apa itu anomaly detection?', 'answer' => 'Anomaly detection adalah proses mendeteksi data, perilaku, atau kondisi yang menyimpang dari pola normal. Dalam Digital Twin, anomali dapat berupa lonjakan suhu, getaran tidak biasa, penggunaan energi yang meningkat drastis, atau lokasi kendaraan yang tidak sesuai rute.'],
            ['question' => 'Mengapa anomaly detection penting?', 'answer' => 'Deteksi anomali penting karena banyak kegagalan aset dimulai dari perubahan kecil yang terlihat tidak signifikan. Jika anomali dapat terdeteksi sejak dini, perusahaan dapat melakukan investigasi dan tindakan preventif sebelum masalah menyebabkan downtime, kecelakaan, kerusakan besar, atau kerugian finansial.'],
            ['question' => 'Apa itu dashboard Digital Twin?', 'answer' => 'Dashboard Digital Twin adalah antarmuka visual yang menyajikan data aset dalam bentuk indikator, tabel, grafik, peta, model 3D, status perangkat, dan notifikasi. Dashboard membantu pengguna memahami kondisi kompleks secara cepat tanpa harus membaca data mentah dari banyak sumber.'],
            ['question' => 'Apa itu KPI dalam Digital Twin?', 'answer' => 'KPI atau Key Performance Indicator adalah indikator utama untuk menilai apakah aset atau proses berjalan sesuai target. Dalam Digital Twin, KPI digunakan untuk mengukur produktivitas, kualitas, efisiensi energi, waktu henti, biaya perawatan, keselamatan, dan indikator lain yang relevan dengan tujuan bisnis.'],
            ['question' => 'Apa contoh KPI mesin produksi?', 'answer' => 'KPI mesin produksi dapat mencakup jumlah unit yang dihasilkan, kecepatan produksi, waktu operasi, downtime, jumlah produk cacat, konsumsi energi per unit, suhu mesin, serta frekuensi kerusakan. KPI tersebut membantu manajemen dan teknisi melihat performa mesin dari berbagai sudut.'],
            ['question' => 'Apa itu OEE?', 'answer' => 'OEE atau Overall Equipment Effectiveness adalah ukuran efektivitas mesin dalam proses produksi. OEE umumnya dihitung dari tiga faktor: availability atau ketersediaan mesin, performance atau kecepatan kerja mesin, dan quality atau kualitas hasil produksi. Nilai OEE yang tinggi menunjukkan bahwa mesin bekerja efektif dengan sedikit gangguan dan sedikit produk cacat.'],
            ['question' => 'Bagaimana Digital Twin membantu meningkatkan OEE?', 'answer' => 'Digital Twin dapat mengumpulkan data penyebab downtime, kecepatan aktual mesin, kualitas produk, serta penggunaan energi dalam satu sistem. Dengan analisis tersebut, perusahaan dapat mengetahui apakah rendahnya OEE disebabkan oleh kerusakan, waktu setup yang terlalu lama, kekurangan material, operator, atau masalah kualitas.'],
            ['question' => 'Apa itu edge computing?', 'answer' => 'Edge computing adalah pendekatan pemrosesan data yang dilakukan dekat dengan sumber data, misalnya di pabrik, gateway IoT, kamera, atau perangkat lokal. Data tidak harus selalu dikirim seluruhnya ke cloud terlebih dahulu, sehingga proses dapat berjalan lebih cepat dan tetap berfungsi ketika koneksi internet terbatas.'],
            ['question' => 'Mengapa edge computing penting untuk Digital Twin?', 'answer' => 'Edge computing penting ketika Digital Twin membutuhkan respons cepat, seperti pada sistem keselamatan, kendaraan, robot, atau mesin industri. Dengan pemrosesan di lokasi, sistem dapat mendeteksi kondisi berbahaya dan mengirim alarm atau melakukan tindakan cepat tanpa menunggu komunikasi ke server cloud.'],
            ['question' => 'Apa itu cloud computing dalam Digital Twin?', 'answer' => 'Cloud computing adalah penggunaan infrastruktur komputasi berbasis internet untuk menyimpan, memproses, dan menganalisis data Digital Twin. Cloud memungkinkan organisasi mengelola data dari banyak aset dan lokasi tanpa harus membangun seluruh server fisik sendiri.'],
            ['question' => 'Apa keuntungan cloud untuk Digital Twin?', 'answer' => 'Cloud menawarkan kapasitas penyimpanan besar, kemampuan analitik yang kuat, akses data dari berbagai lokasi, serta fleksibilitas untuk menambah kapasitas ketika jumlah perangkat meningkat. Selain itu, cloud memudahkan integrasi dengan layanan AI, dashboard, basis data, dan aplikasi mobile.'],
            ['question' => 'Apa risiko penggunaan cloud?', 'answer' => 'Risiko utama cloud mencakup kebocoran data, salah konfigurasi akses, ketergantungan pada koneksi internet, biaya penggunaan yang meningkat, dan isu kepatuhan regulasi. Oleh karena itu, perusahaan perlu menerapkan enkripsi, pengendalian akses, pemantauan biaya, serta kebijakan penyimpanan data yang jelas.'],
            ['question' => 'Apa itu latensi?', 'answer' => 'Latensi adalah waktu tunda sejak data dihasilkan oleh sensor sampai data diterima, diproses, lalu menghasilkan respons pada sistem. Latensi dapat dipengaruhi oleh jaringan, kapasitas server, volume data, proses analitik, dan jarak antara perangkat dengan pusat pemrosesan.'],
            ['question' => 'Mengapa latensi penting?', 'answer' => 'Latensi penting karena beberapa sistem membutuhkan keputusan dalam waktu sangat singkat. Pada mesin berbahaya, kendaraan otonom, sistem medis, atau pengendalian listrik, keterlambatan beberapa detik dapat menghasilkan dampak besar. Untuk kebutuhan seperti ini, edge computing sering digunakan.'],
            ['question' => 'Apa itu interoperabilitas?', 'answer' => 'Interoperabilitas adalah kemampuan berbagai perangkat, aplikasi, platform, dan sistem untuk saling bertukar serta memahami data. Digital Twin membutuhkan interoperabilitas karena data biasanya berasal dari banyak sumber yang menggunakan format, vendor, protokol, dan standar berbeda.'],
            ['question' => 'Mengapa interoperabilitas penting?', 'answer' => 'Tanpa interoperabilitas, data akan terjebak dalam sistem yang terpisah atau silo data. Akibatnya, organisasi sulit melihat gambaran kondisi aset secara menyeluruh. Interoperabilitas membantu menghubungkan data dari sensor, ERP, sistem produksi, aplikasi perawatan, dan dashboard menjadi satu ekosistem.'],
            ['question' => 'Apa protokol umum untuk IoT?', 'answer' => 'Protokol yang umum digunakan meliputi MQTT, HTTP, CoAP, OPC UA, dan Modbus. Pemilihan protokol bergantung pada kebutuhan seperti kecepatan komunikasi, tingkat keamanan, jenis perangkat, konsumsi daya, serta lingkungan penggunaan seperti rumah, gedung, atau pabrik.'],
            ['question' => 'Apa itu MQTT?', 'answer' => 'MQTT adalah protokol komunikasi ringan berbasis publish-subscribe yang sangat populer dalam implementasi IoT. Protokol ini cocok untuk perangkat dengan sumber daya terbatas atau koneksi jaringan tidak stabil karena ukuran pesan relatif kecil dan dapat mendukung komunikasi efisien antar perangkat.'],
            ['question' => 'Apa itu OPC UA?', 'answer' => 'OPC UA atau Open Platform Communications Unified Architecture adalah standar komunikasi yang banyak digunakan di lingkungan industri. OPC UA mendukung pertukaran data yang lebih aman, terstruktur, dan interoperabel antara mesin, PLC, SCADA, sistem manufaktur, dan platform Digital Twin.'],
            ['question' => 'Apa itu API dalam Digital Twin?', 'answer' => 'API atau Application Programming Interface adalah mekanisme yang memungkinkan satu sistem berkomunikasi dengan sistem lain. Dalam Digital Twin, API dapat digunakan untuk mengambil data sensor, menghubungkan dashboard dengan basis data, mengirim alarm ke aplikasi, atau mengintegrasikan Digital Twin dengan ERP dan sistem perawatan.'],
            ['question' => 'Apa itu data historian?', 'answer' => 'Data historian adalah sistem yang dirancang untuk menyimpan data operasional dan data sensor dalam jangka panjang. Sistem ini sangat berguna di industri karena mampu menyimpan data dalam jumlah besar dengan cap waktu yang akurat, sehingga perubahan performa aset dapat dianalisis dari waktu ke waktu.'],
            ['question' => 'Mengapa data historis penting?', 'answer' => 'Data historis penting untuk memahami tren, membandingkan performa antar periode, dan mengetahui pola sebelum terjadinya masalah. Data ini juga digunakan untuk melatih model AI agar dapat memprediksi kerusakan atau menentukan kondisi operasi yang optimal.'],
            ['question' => 'Apa itu visualisasi Digital Twin?', 'answer' => 'Visualisasi Digital Twin adalah cara menampilkan data dan kondisi aset agar mudah dipahami pengguna. Bentuknya dapat berupa dashboard 2D, grafik tren, peta digital, model 3D, augmented reality, hingga simulasi interaktif. Pilihan visualisasi harus disesuaikan dengan kebutuhan pengguna, bukan hanya dibuat agar terlihat menarik.'],
            ['question' => 'Apakah Digital Twin harus menggunakan 3D?', 'answer' => 'Tidak harus. Untuk banyak kebutuhan operasional, dashboard 2D dengan grafik, indikator, tabel, dan notifikasi justru lebih efektif serta lebih ringan digunakan. Model 3D diperlukan apabila bentuk, posisi, layout, atau hubungan spasial antar aset menjadi faktor penting dalam pengambilan keputusan.'],
            ['question' => 'Kapan model 3D diperlukan?', 'answer' => 'Model 3D diperlukan ketika pengguna harus memahami letak aset, jalur pipa, susunan mesin, area gedung, atau interaksi antar komponen fisik. Contohnya adalah pengelolaan gedung, pemeliharaan fasilitas industri, perencanaan kota, pelatihan teknisi, dan inspeksi aset kompleks.'],
            ['question' => 'Apa itu BIM?', 'answer' => 'BIM atau Building Information Modeling adalah metode pengelolaan informasi bangunan melalui model digital yang berisi geometri, material, struktur, instalasi listrik, pipa, ventilasi, dan informasi teknis lainnya. BIM banyak digunakan pada tahap desain dan konstruksi bangunan.'],
            ['question' => 'Apa hubungan BIM dan GIS dengan Digital Twin?', 'answer' => 'BIM dapat menjadi fondasi awal Digital Twin untuk bangunan karena menyediakan informasi struktur dan komponen fisik. GIS menambahkan konteks lokasi dan hubungan spasial. Ketika BIM dan GIS dihubungkan dengan sensor, data energi, status peralatan, dan data penghuni, model tersebut berkembang menjadi Digital Twin yang mampu mendukung operasi gedung setelah konstruksi selesai.'],
            ['question' => 'Apa itu geospatial Digital Twin?', 'answer' => 'Geospatial Digital Twin adalah Digital Twin yang berfokus pada lokasi dan ruang geografis. Sistem ini biasanya menggunakan peta, data GIS, citra satelit, GPS, data cuaca, serta informasi infrastruktur untuk memodelkan area seperti kampus, pelabuhan, kawasan industri, atau kota.'],
            ['question' => 'Apa itu Smart City Digital Twin?', 'answer' => 'Smart City Digital Twin adalah representasi digital kota yang menggabungkan data dari berbagai sektor, seperti transportasi, energi, lingkungan, banjir, layanan publik, keamanan, dan tata ruang. Teknologi ini membantu pemerintah membuat keputusan berdasarkan data serta menguji dampak kebijakan sebelum diterapkan secara nyata.'],
            ['question' => 'Bagaimana Digital Twin membantu manajemen energi?', 'answer' => 'Digital Twin dapat memantau konsumsi listrik, gas, air, bahan bakar, dan sumber energi lain secara detail. Sistem dapat menunjukkan perangkat atau area yang paling boros, mendeteksi konsumsi tidak normal, serta mensimulasikan dampak perubahan operasional terhadap penggunaan energi.'],
            ['question' => 'Apa itu energy optimization?', 'answer' => 'Energy optimization adalah proses mencari cara paling efisien untuk menggunakan energi sambil tetap menjaga produktivitas, kenyamanan, keamanan, dan kualitas. Dalam gedung, contohnya adalah mengatur AC dan pencahayaan sesuai okupansi ruangan agar energi tidak terbuang.'],
            ['question' => 'Bagaimana Digital Twin membantu keberlanjutan?', 'answer' => 'Digital Twin mendukung keberlanjutan dengan membantu organisasi mengurangi pemborosan energi, bahan baku, air, dan waktu operasional. Dengan simulasi dan pemantauan yang baik, perusahaan dapat menurunkan emisi karbon, mengurangi limbah, serta menggunakan sumber daya secara lebih efisien.'],
            ['question' => 'Apa itu carbon footprint dalam Digital Twin?', 'answer' => 'Carbon footprint adalah estimasi jumlah emisi gas rumah kaca yang dihasilkan oleh suatu aset, proses, produk, atau operasi. Digital Twin dapat menghitung emisi berdasarkan konsumsi energi, jenis bahan bakar, jarak transportasi, proses produksi, dan faktor emisi yang relevan.'],
            ['question' => 'Apa itu simulasi “what-if”?', 'answer' => 'Simulasi what-if adalah metode untuk menguji berbagai kemungkinan sebelum keputusan diterapkan di dunia nyata. Pengguna dapat bertanya, “Apa yang terjadi jika kecepatan mesin dinaikkan?”, “Bagaimana jika suhu AC diturunkan?”, atau “Apa dampak jika satu jalur produksi dihentikan?”'],
            ['question' => 'Contoh simulasi what-if?', 'answer' => 'Sebuah gedung dapat menggunakan Digital Twin untuk mensimulasikan kenaikan suhu AC dari 22°C menjadi 25°C. Sistem dapat memperkirakan penghematan energi, dampak terhadap kenyamanan penghuni, serta perubahan beban listrik sebelum kebijakan tersebut diterapkan secara nyata.'],
            ['question' => 'Apa itu optimasi dalam Digital Twin?', 'answer' => 'Optimasi adalah proses mencari kombinasi pengaturan terbaik berdasarkan tujuan tertentu. Tujuannya dapat berupa meminimalkan biaya, mengurangi energi, meningkatkan produksi, mempercepat pengiriman, atau menurunkan risiko kerusakan. Digital Twin membantu melakukan optimasi dengan menguji banyak skenario secara virtual.'],
            ['question' => 'Apa itu model fisika?', 'answer' => 'Model fisika adalah model matematis yang menjelaskan perilaku objek berdasarkan hukum fisika, seperti hukum gerak, perpindahan panas, aliran fluida, atau kelistrikan. Contohnya, model fisika dapat digunakan untuk memperkirakan bagaimana suhu mesin berubah ketika beban kerjanya meningkat.'],
            ['question' => 'Apa itu model berbasis data?', 'answer' => 'Model berbasis data adalah model yang belajar dari pola data historis, biasanya menggunakan statistik atau machine learning. Model ini tidak harus memahami seluruh hukum fisika secara detail, tetapi dapat menghasilkan prediksi berdasarkan hubungan yang ditemukan dari data sebelumnya.'],
            ['question' => 'Apa itu hybrid model?', 'answer' => 'Hybrid model adalah gabungan antara model fisika dan model berbasis data. Model fisika memberikan dasar pemahaman teknis, sedangkan machine learning membantu menangkap pola nyata yang tidak sepenuhnya dijelaskan oleh teori. Pendekatan ini sering memberikan hasil yang lebih stabil dan akurat.'],
            ['question' => 'Mengapa hybrid model berguna?', 'answer' => 'Hybrid model berguna karena kondisi dunia nyata sering kali kompleks dan tidak sempurna. Data sensor bisa memiliki noise, sementara model fisika mungkin tidak memasukkan semua faktor operasional. Kombinasi keduanya dapat meningkatkan akurasi, ketahanan model, dan kemampuan prediksi.'],
            ['question' => 'Apa itu kalibrasi Digital Twin?', 'answer' => 'Kalibrasi adalah proses menyesuaikan parameter Digital Twin agar hasil model mendekati kondisi nyata. Contohnya, jika model memprediksi suhu mesin lebih rendah daripada pembacaan sensor, parameter tertentu perlu disesuaikan agar perbedaan tersebut berkurang.'],
            ['question' => 'Bagaimana mengukur akurasi Digital Twin?', 'answer' => 'Akurasi dapat diukur dengan membandingkan hasil prediksi Digital Twin dengan data aktual dari aset fisik. Metrik yang digunakan dapat berupa tingkat kesalahan rata-rata, persentase prediksi benar, selisih suhu, selisih konsumsi energi, atau kemampuan model mendeteksi kegagalan sebelum terjadi.'],
            ['question' => 'Apa itu validasi Digital Twin?', 'answer' => 'Validasi adalah proses memastikan bahwa Digital Twin cukup akurat, relevan, dan dapat digunakan untuk tujuan yang telah ditentukan. Model yang valid untuk monitoring sederhana belum tentu valid untuk pengendalian mesin otomatis, karena tingkat risiko dan kebutuhan akurasinya berbeda.'],
            ['question' => 'Apa tantangan terbesar dalam membangun Digital Twin?', 'answer' => 'Tantangan utamanya meliputi integrasi banyak sumber data, sensor yang belum tersedia, kualitas data rendah, perbedaan format sistem, biaya implementasi, keamanan siber, dan kemampuan sumber daya manusia. Selain teknologi, organisasi juga perlu memastikan bahwa Digital Twin benar-benar menjawab kebutuhan operasional.'],
            ['question' => 'Mengapa kualitas data penting?', 'answer' => 'Kualitas data sangat menentukan kualitas hasil analitik dan keputusan. Jika sensor rusak, data hilang, satuan tidak konsisten, atau data dimasukkan secara salah, maka Digital Twin dapat menghasilkan tampilan dan rekomendasi yang menyesatkan. Prinsipnya adalah “garbage in, garbage out”.'],
            ['question' => 'Apa itu data cleansing?', 'answer' => 'Data cleansing adalah proses membersihkan dan memperbaiki data agar siap digunakan. Kegiatannya dapat mencakup menghapus duplikasi, memperbaiki format tanggal, menangani data kosong, menyamakan satuan pengukuran, mendeteksi nilai tidak masuk akal, dan memperbaiki kesalahan input.'],
            ['question' => 'Apa itu data governance?', 'answer' => 'Data governance adalah kebijakan, peran, standar, dan proses untuk memastikan data dikelola dengan baik. Hal ini mencakup siapa yang boleh mengakses data, bagaimana data disimpan, berapa lama data disimpan, bagaimana kualitasnya dijaga, dan siapa yang bertanggung jawab atas data tersebut.'],
            ['question' => 'Apa risiko keamanan Digital Twin?', 'answer' => 'Risiko keamanan mencakup pencurian data operasional, akses tidak sah ke dashboard, manipulasi data sensor, serangan ransomware, serta serangan terhadap sistem kontrol. Jika Digital Twin terhubung dengan kontrol aset fisik, serangan siber dapat berpotensi memengaruhi operasi dunia nyata.'],
            ['question' => 'Bagaimana cara mengamankan Digital Twin?', 'answer' => 'Keamanan dapat ditingkatkan melalui enkripsi data, autentikasi multi-faktor, pembatasan hak akses, segmentasi jaringan, pembaruan perangkat lunak, pemantauan aktivitas mencurigakan, serta audit keamanan berkala. Perangkat IoT juga harus diberi identitas yang aman dan tidak menggunakan kata sandi bawaan.'],
            ['question' => 'Apa itu autentikasi?', 'answer' => 'Autentikasi adalah proses untuk memverifikasi identitas pengguna, aplikasi, atau perangkat sebelum diberi akses ke sistem. Contohnya adalah login menggunakan kata sandi, kode OTP, sidik jari, token keamanan, atau sertifikat digital perangkat.'],
            ['question' => 'Apa itu otorisasi?', 'answer' => 'Otorisasi adalah proses menentukan tindakan apa yang boleh dilakukan setelah identitas berhasil diverifikasi. Misalnya, operator dapat melihat dashboard mesin, teknisi dapat mengubah status perawatan, sedangkan administrator dapat mengatur akses pengguna dan konfigurasi sistem.'],
            ['question' => 'Mengapa privasi penting dalam Digital Twin?', 'answer' => 'Privasi penting karena Digital Twin dapat memproses data pribadi seperti lokasi, kebiasaan pengguna, data kesehatan, rekaman kamera, atau pola penggunaan perangkat. Organisasi harus memastikan bahwa data dikumpulkan secara sah, digunakan sesuai tujuan, dan tidak diakses oleh pihak yang tidak berwenang.'],
            ['question' => 'Apa itu skalabilitas?', 'answer' => 'Skalabilitas adalah kemampuan sistem untuk tetap bekerja baik ketika jumlah perangkat, data, pengguna, atau aset meningkat. Digital Twin yang awalnya memantau 10 mesin harus dapat dikembangkan untuk memantau ratusan atau ribuan mesin tanpa menurunkan kualitas layanan secara drastis.'],
            ['question' => 'Bagaimana memulai proyek Digital Twin?', 'answer' => 'Proyek sebaiknya dimulai dengan menentukan masalah bisnis yang jelas, misalnya ingin mengurangi downtime mesin atau menghemat energi gedung. Setelah itu, pilih aset prioritas, identifikasi data yang tersedia, tetapkan KPI, buat prototipe kecil, evaluasi hasilnya, lalu kembangkan secara bertahap.'],
            ['question' => 'Apa langkah pertama dalam membuat Digital Twin mesin?', 'answer' => 'Langkah pertama adalah memahami fungsi mesin, mode kegagalan yang sering terjadi, dan indikator kondisi yang relevan. Misalnya, untuk motor listrik, data penting dapat mencakup suhu, getaran, arus listrik, putaran, jam operasi, serta histori perawatan.'],
            ['question' => 'Apa itu proof of concept atau PoC?', 'answer' => 'Proof of Concept adalah implementasi kecil untuk membuktikan bahwa ide Digital Twin dapat bekerja dan memberikan manfaat. PoC biasanya berfokus pada satu aset atau satu masalah spesifik agar risiko, biaya, dan waktu pengembangan dapat dikendalikan.'],
            ['question' => 'Mengapa PoC penting?', 'answer' => 'PoC penting karena membantu organisasi menguji nilai bisnis sebelum melakukan investasi besar. Dari PoC, perusahaan dapat mengetahui apakah data yang tersedia cukup, apakah sensor berfungsi baik, apakah pengguna membutuhkan sistem tersebut, dan apakah manfaatnya sebanding dengan biaya.'],
            ['question' => 'Siapa saja yang terlibat dalam proyek Digital Twin?', 'answer' => 'Proyek Digital Twin biasanya melibatkan manajemen, pemilik aset, operator, teknisi, engineer, tim IT, data engineer, data analyst, data scientist, dan tim keamanan siber. Kolaborasi lintas fungsi sangat penting karena Digital Twin bukan hanya proyek teknologi, melainkan juga proyek operasional dan bisnis.'],
            ['question' => 'Apa peran data engineer dalam Digital Twin?', 'answer' => 'Data engineer bertanggung jawab membangun jalur data dari sensor dan sistem sumber menuju platform penyimpanan atau analitik. Mereka memastikan data dapat dikumpulkan, dibersihkan, diintegrasikan, disimpan dengan aman, dan tersedia untuk dashboard maupun model AI.'],
            ['question' => 'Apa peran data scientist dalam Digital Twin?', 'answer' => 'Data scientist mengembangkan model analitik dan AI untuk menghasilkan insight dari data. Tugasnya dapat meliputi prediksi kerusakan, klasifikasi kondisi aset, deteksi anomali, peramalan konsumsi energi, optimasi proses, serta evaluasi akurasi model.'],
            ['question' => 'Apa peran operator dalam Digital Twin?', 'answer' => 'Operator merupakan pengguna penting karena memahami kondisi nyata di lapangan. Mereka menggunakan informasi dari Digital Twin untuk memantau aset, merespons alarm, memvalidasi hasil analitik, dan memberikan masukan agar sistem digital sesuai dengan kebutuhan operasional sebenarnya.'],
            ['question' => 'Apakah Digital Twin dapat mengontrol aset fisik?', 'answer' => 'Digital Twin dapat terhubung dengan sistem kontrol seperti PLC, SCADA, atau actuator untuk mengirim instruksi ke aset fisik. Namun, kemampuan ini harus dirancang dengan sangat hati-hati karena keputusan digital dapat berdampak langsung terhadap keselamatan, kualitas produksi, dan kerusakan aset.'],
            ['question' => 'Apa risiko kontrol otomatis?', 'answer' => 'Risiko kontrol otomatis meliputi kesalahan data sensor, kesalahan model, serangan siber, kesalahan konfigurasi, dan tindakan sistem yang tidak sesuai konteks lapangan. Karena itu, sistem otomatis sebaiknya memiliki batas aman, prosedur darurat, audit log, serta mekanisme persetujuan manusia untuk keputusan berisiko tinggi.'],
            ['question' => 'Apa itu human-in-the-loop?', 'answer' => 'Human-in-the-loop adalah pendekatan yang menempatkan manusia sebagai bagian dari proses pengambilan keputusan otomatis. Sistem dapat memberikan rekomendasi atau menjalankan tindakan berisiko rendah, tetapi keputusan penting seperti mematikan mesin utama atau mengubah parameter kritis tetap harus ditinjau oleh operator atau ahli.'],
            ['question' => 'Apakah Digital Twin cocok untuk UMKM?', 'answer' => 'Digital Twin juga dapat diterapkan pada UMKM dengan skala yang sederhana dan terjangkau. Contohnya adalah pemantauan listrik usaha, stok bahan baku, suhu penyimpanan makanan, kondisi mesin produksi kecil, atau pelacakan kendaraan pengiriman. Implementasi tidak harus langsung menggunakan model 3D atau AI yang kompleks.'],
            ['question' => 'Apakah Digital Twin mahal?', 'answer' => 'Biaya Digital Twin sangat bergantung pada jumlah aset, kebutuhan sensor, integrasi sistem, penggunaan cloud, tingkat keamanan, visualisasi, dan kebutuhan analitik. Proyek dapat dimulai dari biaya rendah melalui prototipe sederhana, lalu dikembangkan jika manfaat bisnis telah terbukti.'],
            ['question' => 'Bagaimana mengukur ROI Digital Twin?', 'answer' => 'ROI atau Return on Investment dihitung dengan membandingkan manfaat finansial dengan total biaya implementasi dan operasional. Manfaat dapat berasal dari penurunan downtime, penghematan energi, pengurangan produk cacat, efisiensi tenaga kerja, pengurangan biaya perawatan, atau peningkatan kapasitas produksi.'],
            ['question' => 'Apa indikator keberhasilan proyek Digital Twin?', 'answer' => 'Indikator keberhasilan harus sesuai dengan tujuan awal proyek. Contohnya meliputi penurunan downtime, penghematan energi, peningkatan OEE, berkurangnya produk cacat, meningkatnya ketepatan prediksi perawatan, kecepatan respons terhadap alarm, atau kepuasan pengguna terhadap dashboard.'],
            ['question' => 'Apa perbedaan Digital Twin produk dan Digital Twin proses?', 'answer' => 'Digital Twin produk berfokus pada satu produk atau aset tertentu, misalnya satu unit mesin, kendaraan, turbin, atau perangkat medis. Digital Twin proses berfokus pada alur kerja yang lebih luas, seperti proses produksi, rantai pasok, distribusi barang, atau operasional gedung secara keseluruhan.'],
            ['question' => 'Apa masa depan Digital Twin?', 'answer' => 'Masa depan Digital Twin akan semakin terintegrasi dengan AI, robotika, Internet of Things, edge computing, augmented reality, virtual reality, dan sistem otomasi. Digital Twin diperkirakan akan menjadi bagian penting dari transformasi industri, smart city, kesehatan digital, energi terbarukan, dan manajemen aset modern.'],
            ['question' => 'Apakah Digital Twin dapat digunakan untuk pendidikan?', 'answer' => 'Digital Twin sangat berguna untuk pendidikan karena memungkinkan siswa mempelajari sistem kompleks tanpa harus menghadapi risiko langsung. Mahasiswa dapat mensimulasikan mesin, laboratorium, gedung, jaringan listrik, proses manufaktur, atau bahkan kota digital untuk memahami dampak keputusan secara aman.'],
            ['question' => 'Mengapa Digital Twin penting?', 'answer' => 'Digital Twin penting karena membantu manusia memahami dunia fisik melalui data yang terstruktur, visual, dan dapat dianalisis. Teknologi ini membuat organisasi mampu bertindak lebih proaktif daripada reaktif: bukan hanya memperbaiki masalah setelah terjadi, tetapi memprediksi, mensimulasikan, dan mencegah masalah sebelum menimbulkan dampak besar.'],
        ];
    }

    private function response(string $answer, $projects, $chapters): array
    {
        return [
            'agent' => 'Twini AI',
            'answer' => $answer,
            'context' => [
                'project_count' => count($projects),
                'content_count' => count($chapters),
            ],
        ];
    }
}
