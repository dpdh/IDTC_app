export type IhsanFaq = {
  question: string;
  keywords: string[];
  answer: string;
};

export const ihsanAiProfile = {
  name: 'Twini AI',
  role: 'IDTC Digital Twin Assistant',
  greeting: 'Halo, saya Twini AI. Saya siap membantu tentang Digital Twin, project, maintenance, dan regulasi IDTC.',
  offlineMessage: 'Backend belum tersedia, tetapi Twini AI tetap dapat menjawab pertanyaan dasar dari knowledge base lokal.',
};

export const ihsanAiTopics = [
  'Digital Twin',
  'Project dan portfolio fasilitas',
  'Maintenance Planning, Predictive, Preventive, dan Reactive',
  'Sensor, IoT, telemetry, dan dashboard',
  'BIM, GIS, API, dan interoperabilitas',
  'Regulasi, keamanan, dan tata kelola data',
  'E-Learning dan materi pembelajaran',
];

export const ihsanAiFaqs: IhsanFaq[] = [
  {
    question: 'Apa itu Digital Twin?',
    keywords: ['digital twin', 'kembaran digital', 'representasi digital'],
    answer: 'Digital Twin adalah representasi digital berbasis data dari aset, proses, atau sistem nyata. Representasi ini terhubung dengan data aktual sehingga kondisi aset dapat dipantau, dianalisis, disimulasikan, dan digunakan untuk mendukung keputusan.',
  },
  {
    question: 'Apa komponen utama Digital Twin?',
    keywords: ['komponen digital twin', 'aset fisik', 'sensor', 'model digital', 'analitik'],
    answer: 'Komponen utama Digital Twin meliputi aset fisik, sensor atau IoT, konektivitas, penyimpanan data, model digital, analitik, visualisasi, serta keputusan dan tindakan yang terhubung kembali ke operasi.',
  },
  {
    question: 'Bagaimana Digital Twin bekerja?',
    keywords: ['cara kerja digital twin', 'digital twin bekerja', 'alur digital twin'],
    answer: 'Alurnya adalah sensor membaca kondisi aset, data dikirim dan divalidasi, model digital diperbarui, analitik menghasilkan insight, lalu pengguna mengambil keputusan atau tindakan. Hasil tindakan dapat menjadi data baru untuk pembelajaran berikutnya.',
  },
  {
    question: 'Apa itu predictive maintenance?',
    keywords: ['predictive maintenance', 'pemeliharaan prediktif', 'prediksi kerusakan'],
    answer: 'Predictive maintenance adalah perawatan berdasarkan kondisi dan prediksi risiko kegagalan aset. Data sensor, histori kerusakan, jam operasi, dan model analitik digunakan untuk menentukan waktu perawatan sebelum terjadi downtime.',
  },
  {
    question: 'Apa perbedaan Digital Twin dan model 3D?',
    keywords: ['model 3d', 'beda digital twin model', 'digital twin bukan 3d'],
    answer: 'Model 3D terutama menggambarkan bentuk dan ruang. Digital Twin lebih luas karena menghubungkan representasi dengan data aktual, kondisi operasi, analitik, simulasi, dan keputusan. Model 3D dapat menjadi salah satu komponen Digital Twin.',
  },
  {
    question: 'Apa peran sensor dan IoT?',
    keywords: ['sensor', 'iot', 'telemetry', 'data sensor'],
    answer: 'Sensor dan IoT menjadi sumber data kondisi nyata, seperti suhu, tekanan, getaran, lokasi, kelembapan, arus listrik, dan energi. Data tersebut membuat Digital Twin dapat mencerminkan perubahan aset secara berkala atau real-time.',
  },
  {
    question: 'Apa manfaat Digital Twin untuk gedung?',
    keywords: ['manfaat gedung', 'smart building', 'gedung', 'hvac', 'energi gedung'],
    answer: 'Digital Twin gedung dapat menghubungkan BIM, sensor, HVAC, energi, okupansi, lift, keamanan, dan maintenance. Hasilnya membantu efisiensi energi, kenyamanan penghuni, pemeliharaan prediktif, dan respons terhadap gangguan.',
  },
  {
    question: 'Apa regulasi penting untuk Digital Twin?',
    keywords: ['regulasi', 'iso', 'kepatuhan', 'keamanan data', 'pdp'],
    answer: 'Rujukan penting meliputi ISO 19650 untuk informasi BIM, ISO 55000/55001 untuk manajemen aset, ISO/IEC 27001 untuk keamanan informasi, ISO/IEC 27701 untuk privasi, serta aturan PBG/SLF, SPBE, Satu Data Indonesia, dan perlindungan data pribadi.',
  },
  {
    question: 'Apa itu interoperabilitas?',
    keywords: ['interoperabilitas', 'api', 'bim gis', 'open standard'],
    answer: 'Interoperabilitas adalah kemampuan sistem, perangkat, dan aplikasi untuk bertukar serta memahami data. Dalam Digital Twin, interoperabilitas menghubungkan BIM, GIS, IoT, database, API, dashboard, ERP, dan sistem maintenance.',
  },
  {
    question: 'Apa materi E-Learning IDTC?',
    keywords: ['materi', 'belajar', 'e-learning', 'chapter', 'kursus'],
    answer: 'E-Learning IDTC membahas fondasi Digital Twin, data dan sensing, model aset, integrasi dan monitoring, simulasi dan keputusan, tata kelola, serta proyek purwarupa Digital Twin.',
  },
];

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

export function findLocalIhsanAnswer(message: string): string | null {
  const question = normalize(message);
  if (!question) return 'Silakan tuliskan pertanyaan tentang Digital Twin, project, maintenance, atau regulasi IDTC.';

  const match = ihsanAiFaqs.find((faq) => faq.keywords.some((keyword) => question.includes(normalize(keyword))));
  if (match) return match.answer;

  if (question.includes('maintenance') || question.includes('pemeliharaan')) {
    return 'Twini AI menyarankan empat alur maintenance: Planning untuk jadwal dan prioritas, Predictive untuk prediksi kegagalan, Preventive untuk checklist dan compliance, serta Reactive untuk alarm, tiket, SLA, dan penyelesaian insiden.';
  }

  return null;
}
