import { LinearGradient } from 'expo-linear-gradient';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { askDinaAi, fetchACCProjects, fetchAPSFacilities, fetchIdtcBootstrap, type APSFacilityProject } from './apsApi';
import { ihsanAiProfile } from './ihsanAiData';

WebBrowser.maybeCompleteAuthSession();

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type MenuKey = 'literasi' | 'regulasi' | 'referensi' | 'project' | 'profil';
type Screen = 'onboarding' | 'auth' | 'app';
type AuthMode = 'login' | 'register';
type MaintenanceParameters = {
  planning: string;
  predictive: string;
  preventive: string;
  reactive: string;
};

const slides = [
  ['01 / FUNDAMEN', 'Fundamental\nDigital Twin.', 'Digital Twin adalah representasi virtual berbasis data dari objek, aset, proses, atau sistem nyata yang tersinkronisasi secara berkala maupun real-time.'],
  ['02 / KONEKTIVITAS', 'Data operasional\nmenjadi kecerdasan.', 'Sensor IoT menangkap suhu, getaran, tekanan, lokasi, dan energi untuk membentuk visibilitas real-time.'],
  ['03 / PEMODELAN', 'Bangun model\nyang responsif.', 'Model digital memadukan visualisasi, data operasional, analitik, AI, serta aturan bisnis yang terukur.'],
  ['04 / MONITORING', 'Pahami kondisi\nsecara presisi.', 'Pantau performa aset dan identifikasi anomali sebelum berkembang menjadi gangguan operasional.'],
  ['05 / PREDIKSI', 'Cegah risiko\nsebelum terjadi.', 'Predictive maintenance menekan downtime, mengendalikan biaya, dan meningkatkan keandalan aset.'],
  ['06 / SIMULASI', 'Validasi keputusan\nsebelum eksekusi.', 'Uji berbagai skenario secara virtual tanpa menghentikan sistem fisik yang sedang beroperasi.'],
  ['07 / AKSI', 'Dari data menjadi\nkeputusan strategis.', 'Bangun fondasi Digital Twin yang adaptif, terukur, dan siap mendukung masa depan operasional.'],
];

const onboardingProgress = Array.from({ length: slides.length + 1 });

const introductionText = `Indonesia sedang memasuki fase baru dalam pengelolaan informasi, aset, wilayah, dan pengambilan keputusan. Perkembangan teknologi digital telah menghasilkan kemampuan baru untuk mengumpulkan, menyimpan, memvisualisasikan, menganalisis, dan menghubungkan data dari berbagai sumber.

Namun, persoalan terbesar kita bukan lagi semata-mata bagaimana memperoleh data.

Persoalannya adalah:

Bagaimana berbagai data tersebut dapat dihubungkan sehingga kita benar-benar memahami kondisi dunia nyata dan dapat mengambil keputusan yang lebih baik?

Di berbagai sektor, Indonesia telah memiliki data dalam jumlah yang sangat besar. Pemerintah dan berbagai organisasi telah membangun sistem informasi, basis data, peta digital, model BIM, jaringan sensor, hasil survei, citra penginderaan jauh, data operasional, hingga berbagai dashboard pemantauan.

Akan tetapi, keberadaan data yang banyak belum otomatis menghasilkan pemahaman yang utuh.

Data dapat berada pada sistem yang berbeda. Model dapat dibuat untuk kebutuhan yang berbeda. Sensor dapat menghasilkan informasi secara terus-menerus, tetapi belum tentu terhubung dengan model atau proses pengambilan keputusan. BIM dapat berkembang dalam lingkungan proyek, sementara GIS berkembang dalam lingkungan spasial. Data aset dapat tersimpan pada satu institusi, sedangkan informasi kondisi lapangan berada pada institusi lainnya.

Akibatnya, kita dapat memiliki banyak data, banyak model, dan banyak sistem, tetapi belum tentu memiliki satu pemahaman yang terhubung mengenai kondisi dunia nyata.

Ketika Data Ada, tetapi Pemahaman Belum Terhubung

Bayangkan sebuah kawasan perkotaan yang memiliki jalan, jembatan, gedung, jaringan air, jaringan listrik, drainase, utilitas bawah tanah, ruang terbuka, dan berbagai aktivitas masyarakat.

Masing-masing objek tersebut dapat memiliki data.

Jalan memiliki data geometrik dan kondisi perkerasan.
Jembatan memiliki data struktur dan hasil inspeksi.
Gedung memiliki model BIM.
Wilayah memiliki data GIS.
Cuaca memiliki data dari sensor dan stasiun pengamatan.
Banjir dapat dipantau melalui sensor dan citra satelit.
Utilitas memiliki data jaringan.
Pemerintah daerah memiliki data administrasi dan tata ruang.

Namun, pertanyaan yang dihadapi pengambil keputusan sering kali tidak berhenti pada satu jenis data.

Ketika terjadi hujan ekstrem, misalnya, pertanyaannya dapat menjadi:

Bagaimana kondisi kawasan?
Wilayah mana yang berpotensi terdampak?
Bagaimana kondisi drainase dan sungai?
Aset infrastruktur apa yang berada di wilayah tersebut?
Bagaimana kondisi jalan dan jembatan?
Apakah terdapat fasilitas penting yang berpotensi terganggu?
Bagaimana perubahan kondisi tersebut dari waktu ke waktu?
Tindakan apa yang perlu dilakukan?

Pertanyaan-pertanyaan tersebut membutuhkan hubungan antara ruang, objek, waktu, kondisi, data, analisis, dan keputusan.

Di sinilah gagasan Digital Twin menjadi penting.

Digital Twin tidak hadir karena kita membutuhkan satu teknologi baru. Digital Twin hadir karena kita membutuhkan cara yang lebih terintegrasi untuk memahami dunia nyata.

Digital Twin Bukan Sekadar Model 3D

Salah satu alasan materi ini disusun adalah masih adanya pemahaman bahwa Digital Twin identik dengan model 3D.

Model 3D memang dapat menjadi bagian penting dari Digital Twin, khususnya ketika bentuk, posisi, volume, ketinggian, dan hubungan spasial suatu objek perlu dipahami. Namun, Digital Twin tidak ditentukan semata-mata oleh keberadaan model 3D.

Dalam diskusi IDTC, Digital Twin dipahami memiliki hubungan yang terus berlangsung dengan dunia nyata. Perubahan pada dunia nyata dapat tercermin pada representasi digital, sementara hasil analisis digital dapat digunakan untuk mendukung atau memengaruhi tindakan di dunia nyata.

Karena itu, model 3D adalah salah satu komponen, bukan keseluruhan Digital Twin.

Demikian pula sensor bukan Digital Twin.
IoT bukan Digital Twin.
GIS bukan Digital Twin.
BIM bukan Digital Twin.
AI bukan Digital Twin.
Dashboard juga bukan Digital Twin.

Semua teknologi tersebut dapat menjadi bagian dari ekosistem Digital Twin ketika digunakan untuk tujuan yang jelas dan saling terhubung.

Masalah yang Ingin Dijawab

Materi ini berangkat dari berbagai persoalan yang sering muncul ketika data, model, teknologi, dan organisasi berkembang secara terpisah.

Pertama, data tersebar.

Data yang dibutuhkan untuk memahami suatu objek atau wilayah dapat berasal dari berbagai sumber dan dikelola oleh berbagai organisasi. Bahkan untuk aset yang sama, informasi dapat tersebar pada beberapa sistem atau institusi.

Kedua, sistem masih sering berdiri sendiri.

Sebuah organisasi dapat memiliki berbagai aplikasi dan database yang masing-masing berjalan dengan baik, tetapi belum tentu dapat saling berkomunikasi atau berbagi konteks secara efektif.

Ketiga, model belum selalu terhubung dengan kondisi aktual.

Model digital dapat menggambarkan kondisi suatu aset pada saat tertentu. Namun, dunia nyata terus berubah. Tanpa hubungan dengan data terbaru, model dapat kehilangan relevansinya terhadap kondisi aktual.

Keempat, data belum selalu aktual terhadap kebutuhan keputusan.

Tidak semua informasi harus diperbarui secara real-time. Namun, informasi harus tersedia dengan frekuensi pembaruan yang sesuai dengan keputusan yang akan dibuat. Prinsip ini menjadi bagian penting dari pendekatan fit for purpose dalam Digital Twin.

Kelima, sensor belum selalu terintegrasi dengan konteks.

Sensor dapat menghasilkan data secara cepat dan dalam jumlah besar. Tetapi data sensor akan memiliki nilai yang lebih besar ketika dapat ditempatkan dalam konteks objek, lokasi, waktu, kondisi, dan kebutuhan analisis.

Keenam, BIM dan GIS sering berkembang dalam ruangnya masing-masing.

BIM sangat kuat dalam merepresentasikan informasi objek dan aset, sedangkan GIS memberikan konteks geografis dan hubungan spasial. Ketika keduanya dapat dihubungkan dengan sumber data lainnya, terbuka peluang untuk membangun pemahaman yang jauh lebih komprehensif.

Ketujuh, data pemerintah tersebar pada berbagai instansi.

Informasi mengenai wilayah, infrastruktur, lingkungan, kebencanaan, cuaca, geologi, tata ruang, pertanahan, dan berbagai sektor lainnya tidak selalu berada pada satu tempat atau satu sistem. Tantangannya bukan sekadar mengumpulkan seluruh data tersebut ke dalam satu database, tetapi membangun interoperabilitas dan hubungan yang tepat antar-data.

Kedelapan, keputusan sering belum memiliki situational awareness yang cukup.

Pengambil keputusan membutuhkan gambaran kondisi yang relevan, bukan sekadar kumpulan data. Informasi perlu memberikan konteks: apa yang terjadi, di mana, kapan, mengapa, apa dampaknya, dan tindakan apa yang mungkin dilakukan.

Dari Data Menuju Pemahaman

Karena itu, Digital Twin perlu dipahami sebagai sebuah perjalanan.

Bukan:
Data -> Visualisasi

Tetapi lebih jauh:
Dunia Nyata -> Data -> Representasi Digital -> Integrasi -> Analisis -> Pemahaman -> Keputusan -> Tindakan -> Pembelajaran

Dalam diskusi IDTC, pengembangan Digital Twin bahkan dirumuskan melalui siklus Sensing -> Understanding -> Acting -> Learning. Hasil dari tindakan dapat menjadi data dan pengetahuan baru untuk memperbaiki pemahaman dan keputusan berikutnya.

Inilah yang membedakan Digital Twin dari sekadar sistem informasi biasa.

Tujuannya bukan hanya mengetahui.

Tujuannya adalah memahami agar dapat bertindak.

Dari Technology-Driven Menjadi Decision-Driven

Materi ini juga disusun untuk mengubah cara kita memulai pembicaraan mengenai Digital Twin.

Kita sering memulai dengan pertanyaan:

Platform apa yang digunakan?
Sensor apa yang dipasang?
Bagaimana membuat model 3D?
Apakah menggunakan AI?
Apakah harus real-time?

Pertanyaan-pertanyaan tersebut penting, tetapi bukan pertanyaan pertama.

Pertanyaan pertama seharusnya adalah:

Keputusan apa yang ingin kita perbaiki?

Dari pertanyaan tersebut kemudian kita menentukan:

Decision -> Entity -> Data -> Update -> Responsibility

yaitu keputusan apa yang ingin diperbaiki, entitas atau sistem apa yang harus dipahami, data apa yang diperlukan, seberapa sering data perlu diperbarui, serta siapa yang bertanggung jawab terhadap keputusan dan tindakan.

Pendekatan ini penting agar Digital Twin tidak berubah menjadi sekadar proyek teknologi.

Tanpa tujuan yang jelas, Digital Twin berisiko menjadi:

3D-driven, hanya menjadi visualisasi;
platform-driven, terlalu bergantung pada platform tertentu;
sensor-driven, hanya menjadi dashboard monitoring;
AI-driven, tanpa kejelasan bagaimana hasilnya digunakan;
real-time everything, ketika seluruh data dipaksakan real-time tanpa mempertimbangkan manfaat dan biaya; atau
mega-centralized database, yang justru menghadirkan persoalan baru terkait kepemilikan data, interoperabilitas, tata kelola, privasi, dan keamanan siber.

Teknologi tetap penting.

Tetapi teknologi adalah enabler, bukan titik awal dan bukan tujuan akhir Digital Twin.

Mengapa Kita Membutuhkan Fondasi Digital Twin?

Perkembangan Digital Twin membutuhkan lebih dari sekadar teknologi.

Dibutuhkan kesamaan pemahaman.

Dibutuhkan bahasa yang dapat dipahami oleh berbagai disiplin.

Dibutuhkan pemahaman mengenai hubungan antara BIM, GIS, sensor, IoT, data, AI, simulasi, infrastruktur, wilayah, dan manusia.

Dibutuhkan pula cara berpikir yang memungkinkan pemerintah, akademisi, industri, asosiasi profesi, dan masyarakat melihat Digital Twin sebagai ekosistem kolaboratif, bukan sebagai milik satu disiplin atau satu organisasi.

Materi ini karena itu ditempatkan sebagai fondasi.

Materi ini bukan untuk menjawab seluruh persoalan Digital Twin Indonesia, tetapi untuk membangun pemahaman yang sama mengenai:

apa itu Digital Twin, prinsip apa yang mendasarinya, bagaimana cara berpikir tentang Digital Twin, teknologi apa yang mendukungnya, bagaimana berbagai disiplin berkontribusi, dan bagaimana semuanya dapat diarahkan untuk menghasilkan keputusan yang lebih baik.

Dari fondasi inilah pembahasan yang lebih mendalam dapat dikembangkan pada seri-seri berikutnya.

Dari Indonesia yang Memiliki Banyak Data Menuju Indonesia yang Mampu Memahami Datanya

Indonesia tidak harus selalu memulai dari nol.

Berbagai data, sistem, model, sensor, infrastruktur teknologi, sumber daya manusia, dan pengalaman implementasi sebenarnya telah tersedia di berbagai sektor. Bahkan berbagai contoh implementasi Digital Twin di Indonesia mulai muncul pada fasilitas dan industri, utilitas bawah tanah, pemodelan kota dan tata ruang, reality mapping, kebencanaan, hingga pemantauan wilayah.

Tantangannya adalah bagaimana building blocks tersebut dapat berkembang dari sesuatu yang berjalan sendiri-sendiri menjadi ekosistem yang saling terhubung.

Karena itu, pertanyaan besar Digital Twin Indonesia bukan:

Apakah Indonesia sudah memiliki Digital Twin?

Pertanyaan yang lebih penting adalah:

Seberapa jauh data, model, sensor, sistem, manusia, dan proses pengambilan keputusan di Indonesia sudah terhubung untuk memahami dunia nyata secara lebih utuh?

Pembahasan Fundamental Digital Twin dimulai dari pertanyaan tersebut.

Pembahasan ini membawa kita dari konsep menuju cara berpikir, dari cara berpikir menuju implementasi, dan dari implementasi menuju ekosistem Digital Twin Indonesia.

Karena masa depan Digital Twin Indonesia bukan hanya tentang seberapa canggih teknologi yang kita bangun, tetapi tentang seberapa baik kita menghubungkan data, pengetahuan, manusia, dan keputusan untuk menghasilkan Indonesia yang lebih baik.`;

const fundamentalPrinciplesText = `# BAB II

# PRINSIP FUNDAMENTAL DIGITAL TWIN
Digital Twin tidak dapat dipahami hanya dari teknologi yang digunakan. Ia harus dipahami dari hubungan antara dunia nyata dan dunia digital.

Pada BAB I telah dibahas apa yang dimaksud dengan Digital Twin serta perbedaannya dengan model 3D, BIM, GIS, Smart City, Simulation, Dashboard, dan Digital Triplet. Pada bab ini pembahasan bergerak lebih dalam: apa prinsip yang membuat sebuah sistem dapat memiliki karakteristik Digital Twin?

Dalam perspektif IDTC, prinsip fundamental Digital Twin adalah satu siklus yang hidup, terhubung, dan terus berkembang antara dunia nyata dan representasi digitalnya. Digital Twin bukan sekadar model digital atau visualisasi 3D, tetapi representasi digital yang terhubung dengan dunia nyata untuk menghasilkan pemahaman, mendukung keputusan, memengaruhi tindakan, dan belajar dari perubahan yang terjadi.

Secara konseptual, prinsip tersebut dapat digambarkan sebagai:

DUNIA NYATA

↓

REPRESENTASI DIGITAL

↓

CONNECTION

↓

SENSING

↓

UNDERSTANDING

↓

ACTING

↓

LEARNING

↺

DUNIA NYATA

Bab ini akan membahas setiap elemen tersebut sebagai satu kesatuan, bukan sebagai teknologi yang berdiri sendiri.`;

const decisionDrivenText = `# BAB III

# DIGITAL TWIN DIMULAI DARI KEPUTUSAN
Ini adalah bab penting yang menjadi pembeda buku Indonesia ini: Digital Twin harus dimulai dari kebutuhan keputusan, bukan dari teknologi yang ingin digunakan.

### 3.1 Jangan Mulai dari Teknologi

Jangan memulai Digital Twin dengan pertanyaan tentang platform, sensor, model 3D, AI, atau cloud. Teknologi adalah enabler. Teknologi dipilih setelah tujuan, masalah, dan keputusan yang ingin diperbaiki sudah jelas.

### 3.2 Mulai dari Masalah

Mulailah dari kondisi nyata yang ingin dipahami atau diperbaiki. Masalah dapat berupa downtime, banjir, pemborosan energi, kemacetan, keterlambatan pemeliharaan, risiko keselamatan, atau kualitas layanan yang belum optimal.

### 3.3 Mulai dari Keputusan

Tentukan keputusan apa yang perlu dibuat dengan lebih cepat, tepat, transparan, dan dapat dipertanggungjawabkan. Digital Twin bernilai ketika insight yang dihasilkan benar-benar membantu keputusan dan tindakan.

### 3.4 Apa yang Ingin Diperbaiki?

Rumuskan hasil yang ingin diperbaiki. Apakah yang ingin ditingkatkan adalah keandalan, keselamatan, efisiensi, kualitas, biaya, waktu respons, atau keberlanjutan?

### 3.5 Apa Entitas yang Harus Dipahami?

Tentukan entitas dunia nyata yang terkait dengan keputusan: aset, bangunan, jalan, jembatan, utilitas, kawasan, kota, proses, mesin, atau sistem yang lebih luas.

### 3.6 Data Apa yang Dibutuhkan?

Identifikasi data yang benar-benar diperlukan untuk memahami kondisi entitas dan mendukung keputusan. Data dapat berasal dari sensor, BIM, GIS, survei, inspeksi, dokumen, sistem operasional, simulasi, atau sumber lain.

### 3.7 Seberapa Sering Data Harus Diperbarui?

Frekuensi pembaruan mengikuti kebutuhan keputusan. Tidak semua data harus real-time. Pembaruan dapat berlangsung setiap detik, menit, jam, hari, bulan, atau sesuai siklus kerja yang relevan.

### 3.8 Siapa yang Bertanggung Jawab?

Tetapkan pihak yang bertanggung jawab atas data, kualitas informasi, analisis, keputusan, tindakan, dan pembelajaran. Digital Twin membutuhkan tata kelola, bukan hanya infrastruktur teknologi.

### 3.9 Fit-for-Purpose

Representasi, data, tingkat detail, akurasi, dan frekuensi pembaruan harus sesuai dengan tujuan. Solusi yang paling kompleks belum tentu menjadi solusi yang paling bermanfaat.

### 3.10 Level of Detail

Tentukan seberapa detail representasi yang diperlukan. Detail tambahan harus memiliki hubungan yang jelas dengan kebutuhan analisis atau keputusan.

### 3.11 Level of Accuracy

Tentukan tingkat ketelitian yang dibutuhkan dan dapat dipertanggungjawabkan. Akurasi harus seimbang dengan biaya pengukuran, pengolahan, pemeliharaan, dan penggunaannya.

### 3.12 Level of Information

Tentukan informasi minimum yang harus tersedia agar pengguna dapat memahami kondisi dan bertindak. Banyaknya data tidak otomatis menghasilkan informasi yang lebih baik.

### 3.13 Uncertainty

Setiap data, model, dan prediksi memiliki ketidakpastian. Ketidakpastian perlu dicatat, dikomunikasikan, dan dipertimbangkan dalam keputusan.

### 3.14 Cost vs Value

Bandingkan biaya pembangunan dan pemeliharaan dengan nilai keputusan yang dihasilkan. Digital Twin harus menghasilkan manfaat yang terukur, bukan sekadar menjadi demonstrasi teknologi.

### 3.15 Decision-Driven Digital Twin

Digital Twin yang decision-driven menyatukan tujuan, entitas, data, pembaruan, tanggung jawab, analisis, keputusan, dan tindakan dalam satu alur yang jelas.

Framework sederhana yang digunakan adalah:

Decision -> Entity -> Data -> Update -> Responsibility

Framework ini telah dirumuskan secara eksplisit dalam FAQ 96.

### JANGAN MEMBANGUN DIGITAL TWIN SEPERTI INI

3D-driven

Platform-driven

Sensor-driven

AI-driven

Real-time everything

Mega-centralized database

Semua pola tersebut telah diidentifikasi sebagai risiko dalam diskusi IDTC. Digital Twin seharusnya dibangun untuk memperbaiki keputusan, dengan teknologi yang dipilih secara proporsional sesuai kebutuhan.`;

const extendedChapters = [
  { number: 4, title: 'Digital Twin adalah Ilmu Multidisiplin', sections: ['4.1 Mengapa Digital Twin Multidisiplin?', '4.2 Geodesi dan Surveying - reference system, datum, koordinat, akurasi, positioning, monitoring.', '4.3 Geomatika dan GIS', '4.4 Teknik Sipil', '4.5 Arsitektur', '4.6 BIM', '4.7 Planologi dan Urban Planning', '4.8 Teknik Elektro', '4.9 Teknik Mesin', '4.10 Teknik Lingkungan', '4.11 Informatika dan Sistem Informasi', '4.12 Data Science dan AI', '4.13 IoT dan Sensor', '4.14 Remote Sensing', '4.15 Teknik Kebumian dan Geologi', '4.16 Kebencanaan', '4.17 Transportasi', '4.18 Energi', '4.19 Manajemen Aset', '4.20 Peran Ilmu Sosial dan Manusia', '4.21 Satu Digital Twin, Banyak Keahlian', 'Peta ekosistem: Geography -> Engineering -> Architecture -> Planning -> Data -> AI -> IoT -> Simulation -> Governance -> Human.'] },
  { number: 5, title: 'Data sebagai Jantung Digital Twin', sections: ['5.1 Digital Twin adalah Sistem Informasi yang Hidup', '5.2 Jenis Data', '5.3 Data Spasial', '5.4 Data BIM', '5.5 Data Sensor', '5.6 Data IoT', '5.7 Data Historis', '5.8 Data Real-Time', '5.9 Data Operasional', '5.10 Data Subsurface', '5.11 Data Pemerintahan', '5.12 Data 2D dan 3D', '5.13 Data Authoritative', '5.14 Data Quality', '5.15 Data Accuracy', '5.16 Data Completeness', '5.17 Data Lineage', '5.18 Data Ownership', '5.19 Data Sharing', '5.20 Wali Data', '5.21 Apakah Semua Data Harus Digabungkan?', 'Jawaban penting: Tidak. Fit for purpose menjadi titik awal dan tidak semua data harus dipaksakan berada dalam satu model atau scene.'] },
  { number: 6, title: 'Membangun Representasi Digital', sections: ['6.1 Representasi Digital', '6.2 2D Digital Twin', '6.3 3D Digital Twin', '6.4 Model-Based Digital Twin', '6.5 Reality-Based / Photorealistic Digital Twin', '6.6 BIM sebagai Source', '6.7 GIS sebagai Spatial Context', '6.8 BIM -> GIS -> Digital Twin', '6.9 LoD1, LoD2, LoD3, LoD4', '6.10 LOD BIM vs LoD Geospasial', '6.11 Geometry vs Information', '6.12 Simplifikasi Geometry', '6.13 3D Mesh', '6.14 Point Cloud', '6.15 Photogrammetry', '6.16 Nadir', '6.17 Oblique', '6.18 LiDAR', '6.19 Reality Mapping', '6.20 Gaussian Splatting', '6.21 Multi-LOD', '6.22 3D Tiles dan Streaming', 'Rujukan utama: FAQ 37-75 dan 84-91, dari sensor, LiDAR, oblique, reality mapping, Gaussian Splatting sampai GIS-Native.'] },
  { number: 7, title: 'Sensor, IoT dan Hubungan dengan Dunia Nyata', sections: ['7.1 Mengapa Digital Twin Membutuhkan Sensing?', '7.2 Apakah Semua Digital Twin Membutuhkan Sensor?', '7.3 Jenis Sensor', '7.4 Sensor Lingkungan', '7.5 Sensor Struktur', '7.6 Sensor Geospasial', '7.7 Sensor Infrastruktur', '7.8 Sensor Kebencanaan', '7.9 Sensor Pemerintahan', '7.10 IoT', '7.11 Data Acquisition', '7.12 Edge', '7.13 Gateway', '7.14 Streaming Data', '7.15 Real-Time vs Near Real-Time', '7.16 Sensor -> Platform -> Digital Twin', '7.17 Sensor tidak sama dengan Digital Twin', 'Peta sensor pemerintahan Indonesia: PU, BNPB, BIG, BMKG, Badan Geologi, dan Pemerintah Daerah.'] },
  { number: 8, title: 'Digital Twin dan Teknologi Pendukung', sections: ['8.1 BIM', '8.2 GIS', '8.3 IoT', '8.4 Sensor', '8.5 Remote Sensing', '8.6 Cloud', '8.7 On-Premise', '8.8 Database', '8.9 API', '8.10 Open Standards', '8.11 IFC', '8.12 CityGML', '8.13 CityJSON', '8.14 3D Tiles', '8.15 AI', '8.16 Machine Learning', '8.17 Simulation', '8.18 Optimization', '8.19 Visualization', '8.20 Digital Twin Platform', 'Tidak ada satu teknologi yang merupakan Digital Twin. Teknologi adalah enabler.'] },
  { number: 9, title: 'Interoperabilitas dan Ekosistem Digital Twin', sections: ['9.1 Mengapa Sistem Tidak Boleh Berdiri Sendiri?', '9.2 Interoperability', '9.3 Syntactic Interoperability', '9.4 Semantic Interoperability', '9.5 Spatial Interoperability', '9.6 Temporal Interoperability', '9.7 API', '9.8 Open Standard', '9.9 IFC', '9.10 CityGML / CityJSON', '9.11 GIS-Native', '9.12 Federation vs Centralization', '9.13 Apakah Semua Data Harus Berada dalam Satu Database?', '9.14 BIM Repository', '9.15 Geospatial Database', '9.16 Digital Twin Platform', '9.17 Data Federation', '9.18 Security dan Privacy', 'Arsitektur: IFC Repository -> Geospatial/3D Database -> Multi-LOD/3D Tiles -> Digital Twin Platform -> Analisis/Simulasi.'] },
  { number: 10, title: 'Dari Model Menjadi Digital Twin', sections: ['10.1 Model', '10.2 Connected Model', '10.3 Monitoring', '10.4 Understanding', '10.5 Simulation', '10.6 Prediction', '10.7 Decision Support', '10.8 Acting', '10.9 Learning', '10.10 Closing the Loop', '10.11 Digital Twin Maturity', 'Framework konseptual IDTC: Level 0 - Data -> Level 1 - Digital Model -> Level 2 - Connected Model -> Level 3 - Monitoring -> Level 4 - Understanding -> Level 5 - Simulation & Prediction -> Level 6 - Decision Support -> Level 7 - Closed Loop / Living Digital Twin.'] },
  { number: 11, title: 'Contoh Implementasi Digital Twin', sections: ['Format setiap studi kasus: Masalah; Entitas yang ditwin; Keputusan yang ingin diperbaiki; Data yang dibutuhkan; Teknologi yang digunakan; Model/representasi; Sensing; Analisis; Output; Manfaat; Tantangan; Pelajaran.', '11.1 Digital Twin Bangunan', '11.2 Digital Twin Infrastruktur', '11.3 Digital Twin Kawasan', '11.4 Urban Digital Twin', '11.5 Digital Twin Transportasi', '11.6 Digital Twin Utilitas', '11.7 Underground Asset', '11.8 Digital Twin Kebencanaan', '11.9 Digital Twin Banjir', '11.10 Digital Twin Longsor', '11.11 Digital Twin Gunung Api', '11.12 Digital Twin Industri', '11.13 Digital Twin Pertambangan', '11.14 Digital Twin Energi', '11.15 Digital Twin Pemerintahan', '11.16 Digital Twin Nasional'] },
  { number: 12, title: 'Digital Twin Indonesia', sections: ['12.1 Mengapa Indonesia Membutuhkan Digital Twin?', '12.2 Indonesia Sebenarnya Sudah Memiliki Banyak Building Blocks', '12.3 Data Pemerintah sebagai Fondasi', '12.4 BIM Pemerintah', '12.5 GIS Pemerintah', '12.6 Data Kebencanaan', '12.7 Data Cuaca dan Iklim', '12.8 Data Geologi', '12.9 Data Pertanahan', '12.10 Data Tata Ruang', '12.11 Data Infrastruktur', '12.12 Data Pemerintah Daerah', '12.13 Tantangan Data Sharing', '12.14 Wali Data', '12.15 Interoperabilitas Nasional', '12.16 Standar Nasional', '12.17 Regulasi', '12.18 SDM', '12.19 Industri dan Ekosistem', '12.20 Peran IDTC', 'Empat arah IDTC: Pilot Project, Standardisasi Data, Rekomendasi Regulasi, dan Sharing Knowledge, dengan lima kelompok kerja.'] },
  { number: 13, title: 'Ke Mana Digital Twin Indonesia?', sections: ['13.1 Dari Digital Model ke Digital Twin', '13.2 Dari Data ke Intelligence', '13.3 Dari Monitoring ke Decision', '13.4 Dari Silo ke Ekosistem', '13.5 Dari Proyek ke Lifecycle', '13.6 Dari Institusi ke Kolaborasi', '13.7 Dari Technology-Driven ke Decision-Driven', '13.8 Living Digital Twin Indonesia', '13.9 Visi Ekosistem Digital Twin Indonesia', '13.10 Pesan untuk Generasi Digital Twin Indonesia', 'Closing case: pelajaran dari perjalanan Singapura dan perbandingannya dengan kondisi Indonesia.'] },
];
const projectFacilities: Array<APSFacilityProject & { image: any; maintenance: MaintenanceParameters }> = [
  { id: 'siloam', name: 'RS Siloam', type: 'Smart Hospital', status: 'Operational', health: 94, image: require('./assets/ITDC_05.jpeg'), issue: '2 anomaly alerts', focus: 'HVAC, electrical distribution, elevators', maintenance: { planning: '18 work orders • 92% scheduled', predictive: '94% confidence • 2 anomalies', preventive: '89% compliance • 14 assets', reactive: '3 open tickets • 18 min SLA' } },
  { id: 'hermina', name: 'RS Hermina', type: 'Healthcare Campus', status: 'Monitoring', health: 88, image: require('./assets/ITDC_14.jpeg'), issue: '1 work order due', focus: 'Medical utilities, water systems, HVAC', maintenance: { planning: '23 work orders • 86% scheduled', predictive: '88% confidence • 4 anomalies', preventive: '81% compliance • 19 assets', reactive: '5 open tickets • 24 min SLA' } },
  { id: 'mth-27', name: 'Gedung MTH 27 Adhi', type: 'Commercial Building', status: 'Operational', health: 91, image: require('./assets/ITDC_16.jpeg'), issue: '4 assets scheduled', focus: 'MEP, tenant energy, lifts', maintenance: { planning: '12 work orders • 95% scheduled', predictive: '91% confidence • 1 anomaly', preventive: '93% compliance • 11 assets', reactive: '2 open tickets • 16 min SLA' } },
  { id: 'gbk', name: 'GBK', type: 'Stadium & Public Facility', status: 'Event ready', health: 97, image: require('./assets/ITDC_02.jpeg'), issue: 'All critical assets healthy', focus: 'Lighting, crowd flow, field systems', maintenance: { planning: '31 work orders • 98% scheduled', predictive: '96% confidence • 0 anomalies', preventive: '97% compliance • 28 assets', reactive: '1 open ticket • 12 min SLA' } },
];
const regulationStandards = [
  ['ISO 19650', 'Tata kelola informasi BIM sepanjang siklus hidup aset: CDE, penamaan model, status, versi, dan hak akses.'],
  ['ISO 19650-5', 'Pengelolaan informasi berorientasi keamanan untuk bangunan, infrastruktur, dan aset kritis.'],
  ['ISO 55000 / 55001:2024', 'Manajemen aset: biaya, risiko, kinerja, umur pakai, nilai aset, dan KPI maintenance.'],
  ['ISO 23247', 'Kerangka Digital Twin manufaktur: sensor, mesin, proses, analitik, dan digital thread.'],
  ['ISO/IEC 27001', 'Keamanan informasi: kontrol akses, enkripsi, audit log, risiko, dan respons insiden.'],
  ['ISO/IEC 27701', 'Tata kelola privasi untuk pasien, penghuni, pengunjung, teknisi, dan CCTV.'],
  ['ISO 41001', 'Facility Management System untuk layanan operasional gedung.'],
  ['ISO 50001', 'Manajemen energi untuk listrik, chiller efficiency, emisi, dan optimasi energi.'],
];
const regulationAreas = [
  ['Bangunan gedung', 'UU 28/2002 dan PP 16/2021', 'PBG, SLF, fungsi bangunan, keselamatan, keandalan, dan riwayat inspeksi.'],
  ['Penataan ruang', 'PP 21/2021', 'RTRW, RDTR, dan KKPR menjadi referensi lokasi dan pemanfaatan ruang.'],
  ['Data pribadi', 'UU 27/2022 tentang PDP', 'Minimalkan data pasien, pegawai, pengunjung, biometrik, CCTV, dan lokasi; terapkan dasar pemrosesan, akses, serta retensi.'],
  ['Sistem elektronik', 'UU ITE, UU 1/2024, dan PP 71/2019', 'Keandalan sistem, keamanan, audit trail, tata kelola PSE, dan pemulihan insiden.'],
  ['Data pemerintah', 'Perpres 95/2018 SPBE dan Perpres 39/2019 Satu Data Indonesia', 'Metadata, standar data, API interoperabel, arsitektur SPBE, dan peran walidata.'],
  ['Pendataan gedung', 'Permen PUPR 22/2021', 'Data aset, lokasi, fungsi, kondisi, dan pembaruan bangunan yang terstruktur.'],
];
const complianceDashboard = ['Regulatory Compliance Score', 'PBG & SLF Status', 'RTRW / RDTR / KKPR Compliance', 'Building Technical Compliance', 'Fire & Life Safety Compliance', 'BAS / HVAC Equipment Compliance', 'Asset Health & Lifecycle Risk', 'Preventive Maintenance Completion', 'Predictive Alert Accuracy', 'Reactive Maintenance SLA', 'Energy & Carbon Compliance', 'Data Privacy Compliance', 'Cybersecurity Risk Level', 'IoT Sensor Calibration Status', 'Audit Trail Completeness', 'Vendor Access & Contract Compliance'];
const menus: [MenuKey, string, string][] = [['literasi', '◎', 'Home'], ['regulasi', '▤', 'Regulasi'], ['referensi', '▦', 'E-Learning'], ['project', '⌁', 'Project DT'], ['profil', '◉', 'Profil']];
const learningCourses = [
  { id: 'fundamental', code: 'DT-101', title: 'Fundamental Digital Twin', copy: 'Bangun pemahaman menyeluruh tentang konsep, komponen, dan siklus Digital Twin.', level: 'Pemula', duration: '4 jam', image: require('./assets/ITDC_16.jpeg'), modules: ['Orientasi Digital Twin', 'Data, model, dan konteks', 'Sensing - Understanding - Acting', 'Kuis fondasi'] },
  { id: 'implementation', code: 'DT-201', title: 'Implementasi Ekosistem', copy: 'Hubungkan BIM, GIS, IoT, analitik, dan proses keputusan dalam satu kerangka kerja.', level: 'Menengah', duration: '6 jam', image: require('./assets/ITDC_05.jpeg'), modules: ['Arsitektur data', 'Interoperabilitas BIM dan GIS', 'Sensor, API, dan web services', 'Studi kasus implementasi'] },
  { id: 'governance', code: 'DT-301', title: 'Tata Kelola & Strategi', copy: 'Rancang keputusan, tanggung jawab, keamanan, dan roadmap Digital Twin yang terukur.', level: 'Lanjutan', duration: '5 jam', image: require('./assets/ITDC_14.jpeg'), modules: ['Decision-driven Digital Twin', 'Access, privacy, dan security', 'Analytics dan predictive insight', 'Evaluasi dan roadmap'] },
  { id: 'rn-lms', code: 'RN-LMS-101', title: 'Build a Learning Management System with React Native', copy: 'Learn to build a fully functional Learning Management System (LMS) mobile application from scratch using React Native. Designed for beginners and experienced developers, this course guides you from development environment setup through backend API integration and complete LMS logic.', level: 'Menengah', duration: '12 jam', image: require('./assets/ITDC_03.jpeg'), modules: ['Development environment setup', 'React Native project architecture', 'Responsive LMS interface and reusable components', 'Navigation, authentication, and user roles', 'Course, lesson, and learning progress features', 'Backend API integration and data fetching', 'Enrollment, assessments, and completion logic', 'Admin, instructor, and student workflows', 'Notifications, validation, and error handling', 'Testing, production build, and deployment'] },
];
const assessmentStages = [
  { stage: 1, title: 'Fondasi Digital Twin', weight: '10%', activities: [
    ['Kuis konsep awal', 'Menjawab 10-15 soal pilihan ganda tentang pengertian, komponen, dan manfaat Digital Twin.', 'Nilai kuis.', 'Ketepatan jawaban.'],
    ['Peta konsep Digital Twin', 'Membuat peta konsep yang menghubungkan aset fisik, sensor, data, model digital, analitik, dan aksi.', 'Peta konsep/diagram.', 'Kelengkapan komponen dan ketepatan hubungan.'],
    ['Refleksi penerapan', 'Menulis 200-300 kata mengenai satu objek di lingkungan sekitar yang dapat menggunakan Digital Twin.', 'Refleksi tertulis.', 'Ketepatan contoh, relevansi manfaat, dan argumentasi.'],
  ] },
  { stage: 2, title: 'Data dan Sensing', weight: '20%', activities: [
    ['Identifikasi jenis sensor', 'Mencocokkan kebutuhan pemantauan aset dengan sensor yang sesuai, misalnya suhu, getaran, tekanan, atau arus listrik.', 'Lembar jawaban.', 'Ketepatan pemilihan sensor dan alasan.'],
    ['Audit kualitas data', 'Menandai data hilang, duplikat, data di luar batas normal, dan kesalahan format pada dataset yang disediakan.', 'Dataset beranotasi.', 'Ketelitian identifikasi masalah data.'],
    ['Pembersihan dataset', 'Membersihkan dataset sensor: menghapus duplikasi, menangani nilai kosong, dan menyamakan format waktu/satuan.', 'Dataset bersih.', 'Ketepatan proses dan kelengkapan dokumentasi perubahan.'],
    ['Interpretasi grafik sensor', 'Membuat grafik tren suhu, getaran, atau energi lalu menjelaskan pola yang terlihat.', 'Grafik dan analisis singkat.', 'Ketepatan visualisasi dan interpretasi pola/anomali.'],
  ] },
  { stage: 3, title: 'Model Aset', weight: '15%', activities: [
    ['Inventarisasi aset', 'Memilih satu aset, misalnya mesin pompa atau ruang kelas, kemudian mengidentifikasi komponen fisiknya.', 'Daftar komponen aset.', 'Kelengkapan dan relevansi komponen.'],
    ['Diagram model aset', 'Membuat diagram hubungan antara aset, komponen, sensor, data, dan indikator kondisi.', 'Diagram Digital Twin.', 'Struktur model, kejelasan hubungan, dan ketepatan simbol.'],
    ['Definisi parameter operasional', 'Menetapkan parameter, satuan, rentang normal, dan batas peringatan untuk setiap sensor pada aset.', 'Tabel parameter.', 'Ketepatan parameter, satuan, dan batas operasional.'],
  ] },
  { stage: 4, title: 'Integrasi dan Monitoring', weight: '20%', activities: [
    ['Rancang arsitektur integrasi', 'Membuat diagram alur data dari sensor menuju gateway, penyimpanan data, model Digital Twin, dashboard, dan pengguna.', 'Diagram arsitektur.', 'Kelengkapan alur dan logika integrasi data.'],
    ['Pembuatan dashboard', 'Membuat dashboard sederhana yang memperlihatkan status aset, grafik tren, indikator energi, dan kondisi peringatan.', 'Tangkapan layar atau tautan dashboard.', 'Keterbacaan, relevansi indikator, dan fungsionalitas.'],
    ['Konfigurasi notifikasi', 'Menetapkan aturan notifikasi, misalnya suhu >70 C atau getaran meningkat selama 10 menit.', 'Tabel aturan/notifikasi dashboard.', 'Kejelasan ambang batas dan kesesuaian tindakan.'],
  ] },
  { stage: 5, title: 'Simulasi dan Keputusan', weight: '20%', activities: [
    ['Simulasi kondisi normal', 'Menjalankan model dengan data normal dan mendokumentasikan perilaku indikator serta dashboard.', 'Hasil simulasi.', 'Konsistensi hasil dan ketepatan interpretasi.'],
    ['Simulasi kondisi anomali', 'Mengubah data untuk menggambarkan gangguan, seperti kenaikan suhu atau getaran berlebih.', 'Grafik dan hasil simulasi anomali.', 'Ketepatan skenario dan kemampuan mengenali risiko.'],
    ['Analisis what-if', 'Membandingkan minimal tiga tindakan, misalnya mengurangi beban, menghentikan mesin, atau menjadwalkan perawatan.', 'Tabel perbandingan skenario.', 'Logika asumsi, analisis dampak, dan kualitas perbandingan.'],
    ['Laporan rekomendasi teknis', 'Menyusun rekomendasi berdasarkan hasil simulasi, termasuk prioritas tindakan dan alasannya.', 'Laporan 1-2 halaman.', 'Kesesuaian rekomendasi dengan data dan simulasi.'],
  ] },
  { stage: 6, title: 'Proyek dan Refleksi', weight: '15%', activities: [
    ['Proyek purwarupa Digital Twin', 'Kelompok menyusun purwarupa lengkap: model aset, dataset, dashboard, dan simulasi.', 'Produk/prototipe Digital Twin.', 'Integrasi komponen, fungsi model, dan kualitas implementasi.'],
    ['Presentasi solusi', 'Mempresentasikan masalah, proses analisis, hasil simulasi, dan rekomendasi kepada kelas.', 'Slide dan rekaman/presentasi langsung.', 'Kejelasan komunikasi, penguasaan materi, dan kemampuan menjawab pertanyaan.'],
    ['Penilaian teman sejawat dan refleksi individu', 'Menilai kontribusi anggota kelompok serta menulis refleksi mengenai pembelajaran, kendala, dan peningkatan solusi.', 'Form penilaian teman sejawat dan refleksi.', 'Objektivitas penilaian, kedalaman refleksi, dan kesadaran kontribusi.'],
  ] },
];
const syllabusWeeks = [
  ['01', 'Pengenalan Digital Twin', 'Kuliah, diskusi tren industri, identifikasi contoh', 'Ringkasan konsep'],
  ['02', 'Digital Model, Shadow, dan Twin', 'Analisis studi kasus', 'Matriks perbandingan'],
  ['03', 'Arsitektur Digital Twin', 'Perancangan komponen sistem', 'Diagram arsitektur'],
  ['04', 'Aset fisik dan IoT', 'Pengenalan sensor, aktuator, gateway', 'Desain akuisisi data'],
  ['05', 'Protokol dan konektivitas', 'Praktik MQTT/REST atau simulasi data sensor', 'Publisher/subscriber sederhana'],
  ['06', 'Data pipeline dan basis data', 'Ingest data, penyimpanan time-series', 'Dataset dan skema basis data'],
  ['07', 'Pemodelan sistem', 'Model aset/proses menggunakan spreadsheet, Python, atau simulator', 'Model awal sistem'],
  ['08', 'UTS: desain solusi', 'Presentasi desain arsitektur dan model', 'Dokumen desain'],
  ['09', 'Visualisasi dan dashboard', 'Praktik Grafana, Power BI, Node-RED, atau web dashboard', 'Dashboard monitoring'],
  ['10', 'Simulasi dan kalibrasi', 'Membandingkan model dengan data aktual/sintetis', 'Laporan validasi'],
  ['11', 'Analitik prediktif', 'Regresi, klasifikasi, anomaly detection', 'Model analitik'],
  ['12', 'Predictive maintenance', 'Studi kasus mesin/peralatan', 'Strategi pemeliharaan prediktif'],
  ['13', 'Keamanan dan tata kelola', 'Threat modeling, identitas perangkat, enkripsi, akses', 'Rencana keamanan'],
  ['14', 'Interoperabilitas dan integrasi', 'API, OPC UA, standardisasi data', 'Desain integrasi'],
  ['15', 'Pengembangan proyek akhir', 'Konsultasi dan pengujian prototipe', 'Prototipe fungsional'],
  ['16', 'UAS: presentasi proyek', 'Demo, presentasi, evaluasi sejawat', 'Laporan dan demo akhir'],
];
const syllabusSections = {
  outcomes: ['Menjelaskan konsep, karakteristik, manfaat, dan batasan Digital Twin.', 'Membedakan Digital Model, Digital Shadow, dan Digital Twin.', 'Merancang arsitektur Digital Twin dari aset fisik, konektivitas, data, model, dan aplikasi.', 'Mengintegrasikan data sensor atau simulasi melalui protokol IoT.', 'Membuat model digital aset atau proses menggunakan pemodelan, simulasi, atau analitik data.', 'Mengembangkan dashboard pemantauan kondisi dan indikator kinerja.', 'Menggunakan analitik prediktif untuk deteksi anomali, prediksi kegagalan, atau optimasi.', 'Mempertimbangkan keamanan siber, privasi, interoperabilitas, dan tata kelola data.', 'Mengimplementasikan prototipe Digital Twin untuk studi kasus nyata.', 'Menyusun laporan teknis dan mempresentasikan solusi secara profesional.'],
  topics: ['Dasar dan evolusi Digital Twin', 'Siklus hidup aset dan representasi digital', 'Arsitektur Digital Twin', 'Sensor, aktuator, edge computing, dan IoT gateway', 'Protokol komunikasi: MQTT, HTTP/REST, OPC UA, Modbus', 'Akuisisi, penyimpanan, dan pemrosesan data real-time', 'Time-series database dan data pipeline', 'Pemodelan aset, proses, dan sistem', 'Simulasi fisik, statistik, dan berbasis data', 'Visualisasi, dashboard, dan pengalaman pengguna', 'Machine learning untuk prediksi dan deteksi anomali', 'Integrasi cloud, edge, enterprise system, dan API', 'Keamanan, privasi, etika, serta tata kelola data', 'Studi kasus industri', 'Pengembangan proyek Digital Twin', 'Presentasi dan evaluasi proyek akhir'],
  methods: ['Kuliah interaktif dan diskusi.', 'Studi kasus lintas industri.', 'Praktikum IoT, data engineering, dan dashboard.', 'Pembelajaran berbasis proyek.', 'Presentasi teknis dan peer review.', 'Analisis artikel ilmiah atau dokumentasi teknologi.'],
  practices: ['Mengirim data suhu, getaran, atau kelembapan melalui MQTT.', 'Menyimpan data telemetri dalam basis data time-series.', 'Membuat dashboard kondisi aset secara real-time.', 'Membuat model sederhana untuk estimasi kondisi aset.', 'Mendeteksi nilai sensor yang tidak normal.', 'Memprediksi kegagalan atau kebutuhan perawatan.', 'Menghubungkan data, model, dashboard, dan notifikasi dalam satu prototipe Digital Twin.'],
  tools: ['Pemrograman: Python, JavaScript, SQL', 'IoT: ESP32, Raspberry Pi, simulator sensor', 'Konektivitas: MQTT, Mosquitto, Node-RED', 'Data: PostgreSQL, InfluxDB, TimescaleDB', 'Visualisasi: Grafana, Power BI, Tableau, Streamlit', 'Cloud: AWS IoT, Azure Digital Twins, Google Cloud IoT alternatif', 'Simulasi: MATLAB/Simulink, AnyLogic, Modelica, Python', 'Machine Learning: scikit-learn, TensorFlow, PyTorch', 'Version control: Git dan GitHub/GitLab'],
};
const colors = { navy: '#071a30', logoNavy: '#062f63', blue: '#0b6b9e', cyan: '#65e9ff', logoTeal: '#19c7c9', pink: '#ff7098', text: '#e5f4ff', muted: '#9ab8ce', panel: '#0d2a45' };
const carouselWidth = Dimensions.get('window').width - 40;
const sparklePositions = [{ top: 118, left: '16%' }, { top: 205, left: '78%' }, { top: 358, left: '9%' }, { top: 466, left: '88%' }, { top: 612, left: '24%' }, { top: 734, left: '70%' }];
const onboardingImages = [require('./assets/ITDC_14.jpeg'), require('./assets/ITDC_15.jpeg'), require('./assets/ITDC_02.jpeg'), require('./assets/ITDC_07.jpeg')];

function FuturisticBackdrop({ children }: { children: ReactNode }) {
  const motion = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(motion, { toValue: 1, duration: 7000, useNativeDriver: true }),
      Animated.timing(motion, { toValue: 0, duration: 7000, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [motion]);
  return <LinearGradient colors={['#06152d', '#0b3454', '#083c57', '#071a30']} locations={[0, 0.34, 0.68, 1]} style={{ flex: 1 }}>
    <AnimatedGlassCircles />
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: 300, height: 300, top: 60, right: -110, borderRadius: 150, backgroundColor: '#65e9ff', shadowColor: '#65e9ff', shadowOpacity: 0.8, shadowRadius: 55, shadowOffset: { width: 0, height: 0 }, elevation: 20 }, { opacity: motion.interpolate({ inputRange: [0, 1], outputRange: [0.24, 0.62] }), transform: [{ translateX: motion.interpolate({ inputRange: [0, 1], outputRange: [-80, 80] }) }, { translateY: motion.interpolate({ inputRange: [0, 1], outputRange: [50, -30] }) }] }]} />
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: 230, height: 230, bottom: 90, left: -90, borderRadius: 115, backgroundColor: '#ff7098', shadowColor: '#ff7098', shadowOpacity: 0.65, shadowRadius: 48, shadowOffset: { width: 0, height: 0 }, elevation: 18 }, { opacity: motion.interpolate({ inputRange: [0, 1], outputRange: [0.16, 0.5] }), transform: [{ translateX: motion.interpolate({ inputRange: [0, 1], outputRange: [70, -70] }) }, { translateY: motion.interpolate({ inputRange: [0, 1], outputRange: [-40, 70] }) }] }]} />
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: 180, height: 180, top: '42%', left: '34%', borderRadius: 90, backgroundColor: '#19c7c9', shadowColor: '#19c7c9', shadowOpacity: 0.55, shadowRadius: 44, shadowOffset: { width: 0, height: 0 }, elevation: 16 }, { opacity: motion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.08, 0.3, 0.1] }), transform: [{ translateX: motion.interpolate({ inputRange: [0, 1], outputRange: [-45, 45] }) }, { translateY: motion.interpolate({ inputRange: [0, 1], outputRange: [35, -35] }) }, { scale: motion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.86, 1.16, 0.9] }) }] }]} />
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: 290, height: 290, top: '28%', left: '18%', borderRadius: 145, borderWidth: 1, borderColor: '#65e9ff55', borderTopColor: '#ff7098aa', borderRightColor: '#19c7c988' }, { opacity: motion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.18, 0.5, 0.22] }), transform: [{ rotate: motion.interpolate({ inputRange: [0, 1], outputRange: ['-18deg', '342deg'] }) }, { scale: motion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.94, 1.02, 0.96] }) }] }]} />
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>{sparklePositions.map((position, index) => <Animated.View key={index} style={[{ position: 'absolute', width: 5, height: 5, borderRadius: 3, backgroundColor: '#f3feff', shadowColor: '#65e9ff', shadowOpacity: 0.95, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 8 }, position as any, { opacity: motion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.22 + index * 0.03, 0.85, 0.3 + index * 0.04] }), transform: [{ scale: motion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.65, 1.4 + index * 0.06, 0.8] }) }] }]} />)}</View>
    <View style={{ flex: 1 }}>{children}</View>
  </LinearGradient>;
}

const glassCircleSpecs = [
  { size: 210, color: '#65e9ff', top: '8%', left: '-14%', x: 130, y: 70, rotate: '24deg', duration: 2400 },
  { size: 165, color: '#ff7098', top: '19%', left: '68%', x: -110, y: 110, rotate: '-30deg', duration: 2900 },
  { size: 125, color: '#a98bff', top: '43%', left: '16%', x: 150, y: -90, rotate: '38deg', duration: 2100 },
  { size: 240, color: '#19c7c9', top: '58%', left: '64%', x: -135, y: -125, rotate: '-42deg', duration: 3200 },
  { size: 92, color: '#ffb36b', top: '73%', left: '6%', x: 175, y: -45, rotate: '55deg', duration: 1850 },
  { size: 135, color: '#6ff0bb', top: '86%', left: '48%', x: -120, y: -80, rotate: '-24deg', duration: 2600 },
] as const;

function AnimatedGlassCircles() {
  const motions = useRef(glassCircleSpecs.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = motions.map((motion, index) => {
      const spec = glassCircleSpecs[index];
      const animation = Animated.loop(Animated.sequence([
        Animated.delay(index * 95),
        Animated.timing(motion, { toValue: 1, duration: spec.duration, useNativeDriver: true }),
        Animated.timing(motion, { toValue: 0, duration: Math.round(spec.duration * 0.72), useNativeDriver: true }),
      ]));
      animation.start();
      return animation;
    });
    return () => animations.forEach((animation) => animation.stop());
  }, [motions]);

  return <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 }}>
    {glassCircleSpecs.map((spec, index) => {
      const motion = motions[index];
      return <Animated.View key={spec.color} style={[{ position: 'absolute', borderWidth: 1, shadowOpacity: 0.72, shadowRadius: 30, shadowOffset: { width: 0, height: 0 }, elevation: 14, overflow: 'hidden' }, { width: spec.size, height: spec.size, borderRadius: spec.size / 2, backgroundColor: `${spec.color}24`, borderColor: `${spec.color}88`, shadowColor: spec.color, top: spec.top, left: spec.left }, {
        opacity: motion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.28, 0.62, 0.34] }),
        transform: [
          { translateX: motion.interpolate({ inputRange: [0, 1], outputRange: [0, spec.x] }) },
          { translateY: motion.interpolate({ inputRange: [0, 1], outputRange: [0, spec.y] }) },
          { rotate: motion.interpolate({ inputRange: [0, 1], outputRange: ['0deg', spec.rotate] }) },
          { scale: motion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.86, 1.08, 0.92] }) },
        ],
      }]}>
        <Animated.View style={[{ position: 'absolute', width: '52%', height: '22%', top: '12%', left: '14%', borderRadius: 999, transform: [{ rotate: '-28deg' }], shadowOpacity: 0.9, shadowRadius: 18, shadowOffset: { width: 0, height: 0 }, elevation: 8 }, { backgroundColor: `${spec.color}b8` }, { opacity: motion.interpolate({ inputRange: [0, 0.45, 0.8, 1], outputRange: [0.16, 0.65, 0.1, 0.3] }) }]} />
      </Animated.View>;
    })}
  </View>;
}

function Brand({ image = false }: { image?: boolean }) { return <View style={styles.brandLockup}>{image && <ZoomableMediaImage source={require('./assets/IDTC_m.png')} style={styles.logoImage} resizeMode="contain" imageStyle={styles.logoImage} />}<Text style={styles.brand}><Text style={styles.logoId}>ID</Text><Text style={styles.logoTc}>TC</Text></Text></View>; }

function ZoomableMediaImage({ source, style, resizeMode = 'cover', imageStyle }: { source: any; style?: any; resizeMode?: any; imageStyle?: any }) {
  const [visible, setVisible] = useState(false);
  return <><Pressable onPress={() => setVisible(true)} style={style}><Image source={source} resizeMode={resizeMode} style={[{ width: '100%', height: '100%' }, imageStyle]} /></Pressable><Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}><View style={{ flex: 1, backgroundColor: '#061b3bf2' }}><Pressable onPress={() => setVisible(false)} style={{ position: 'absolute', top: 54, right: 18, zIndex: 2, padding: 12 }}><Text style={{ color: colors.text, fontSize: 26 }}>×</Text></Pressable><ScrollView maximumZoomScale={4} minimumZoomScale={1} bouncesZoom centerContent pinchGestureEnabled contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 12 }}><Image source={source} resizeMode="contain" style={{ width: Dimensions.get('window').width - 24, height: Dimensions.get('window').height * 0.78 }} /></ScrollView><Text style={{ position: 'absolute', bottom: 28, alignSelf: 'center', color: colors.text, fontSize: 12 }}>Cubit dua jari untuk memperbesar</Text></View></Modal></>;
}

function OnboardingImage({ source, imageWidth = '92%' }: { source: any; imageWidth?: any }) {
  const [zoomed, setZoomed] = useState(false);
  const reveal = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(reveal, { toValue: 1, duration: 850, useNativeDriver: true }).start();
  }, [reveal]);
  return <><Pressable onPress={() => setZoomed(true)} style={{ width: '100%', height: 220, alignItems: 'center', justifyContent: 'center', marginTop: 8 }}><Image source={source} resizeMode="contain" style={{ width: imageWidth, height: 220, alignSelf: 'center', borderRadius: 18 }} /></Pressable><Modal visible={zoomed} transparent animationType="fade" onRequestClose={() => setZoomed(false)}><View style={{ flex: 1, backgroundColor: '#061b3bf2' }}><Pressable onPress={() => setZoomed(false)} style={{ position: 'absolute', top: 54, right: 18, zIndex: 2, padding: 12 }}><Text style={{ color: colors.text, fontSize: 26 }}>×</Text></Pressable><ScrollView maximumZoomScale={4} minimumZoomScale={1} bouncesZoom centerContent pinchGestureEnabled contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 12 }}><Image source={source} resizeMode="contain" style={{ width: Dimensions.get('window').width - 24, height: Dimensions.get('window').height * 0.78 }} /></ScrollView><Text style={{ position: 'absolute', bottom: 28, alignSelf: 'center', color: colors.text, fontSize: 12 }}>Cubit dua jari untuk memperbesar</Text></View></Modal></>;
}

function ZoomableImage({ source, style }: { source: any; style: any }) {
  const [visible, setVisible] = useState(false);
  return <><Pressable onPress={() => setVisible(true)} style={style}><Image source={source} resizeMode="cover" style={{ width: '100%', height: '100%' }} /></Pressable><Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}><View style={{ flex: 1, backgroundColor: '#061b3bf2' }}><Pressable onPress={() => setVisible(false)} style={{ position: 'absolute', top: 54, right: 18, zIndex: 2, padding: 12 }}><Text style={{ color: colors.text, fontSize: 26 }}>×</Text></Pressable><ScrollView maximumZoomScale={4} minimumZoomScale={1} bouncesZoom centerContent pinchGestureEnabled contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 12 }}><Image source={source} resizeMode="contain" style={{ width: Dimensions.get('window').width - 24, height: Dimensions.get('window').height * 0.78 }} /></ScrollView><Text style={{ position: 'absolute', bottom: 28, alignSelf: 'center', color: colors.text, fontSize: 12 }}>Cubit dua jari untuk memperbesar</Text></View></Modal></>;
}

function ZoomableAnimatedImage({ source, style, imageStyle, resizeMode = 'contain' }: { source: any; style?: any; imageStyle?: any; resizeMode?: any }) {
  const [visible, setVisible] = useState(false);
  return <><Pressable onPress={() => setVisible(true)} style={style}><Animated.Image source={source} resizeMode={resizeMode} style={[{ width: '100%', height: '100%' }, imageStyle]} /></Pressable><Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}><View style={{ flex: 1, backgroundColor: '#061b3bf2' }}><Pressable onPress={() => setVisible(false)} style={{ position: 'absolute', top: 54, right: 18, zIndex: 2, padding: 12 }}><Text style={{ color: colors.text, fontSize: 26 }}>×</Text></Pressable><ScrollView maximumZoomScale={4} minimumZoomScale={1} bouncesZoom centerContent pinchGestureEnabled contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 12 }}><Image source={source} resizeMode="contain" style={{ width: Dimensions.get('window').width - 24, height: Dimensions.get('window').height * 0.78 }} /></ScrollView><Text style={{ position: 'absolute', bottom: 28, alignSelf: 'center', color: colors.text, fontSize: 12 }}>Cubit dua jari untuk memperbesar</Text></View></Modal></>;
}

function OnboardingGridLight({ children }: { children: ReactNode }) {
  const gridMotion = useRef(new Animated.Value(0)).current;
  const orbMotions = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  const [orbPaths, setOrbPaths] = useState([
    { x: 110, y: -70, scale: 1.2 },
    { x: -100, y: 95, scale: 0.82 },
    { x: 75, y: 105, scale: 1.05 },
  ]);

  useEffect(() => {
    const gridAnimation = Animated.loop(Animated.sequence([
      Animated.timing(gridMotion, { toValue: 1, duration: 5600, useNativeDriver: true }),
      Animated.timing(gridMotion, { toValue: 0, duration: 4600, useNativeDriver: true }),
    ]));
    gridAnimation.start();
    return () => gridAnimation.stop();
  }, [gridMotion]);

  useEffect(() => {
    const cancellations = orbMotions.map((motion, index) => {
      let cancelled = false;
      const animate = () => {
        if (cancelled) return;
        setOrbPaths((current) => current.map((path, pathIndex) => pathIndex === index ? {
          x: -145 + Math.random() * 290,
          y: -155 + Math.random() * 310,
          scale: 0.72 + Math.random() * 0.72,
        } : path));
        motion.setValue(0);
        Animated.timing(motion, { toValue: 1, duration: 2800 + Math.random() * 1500, useNativeDriver: true }).start(({ finished }) => {
          if (finished && !cancelled) animate();
        });
      };
      const delay = setTimeout(animate, index * 520);
      return () => {
        cancelled = true;
        clearTimeout(delay);
        motion.stopAnimation();
      };
    });
    return () => cancellations.forEach((cancel) => cancel());
  }, [orbMotions]);

  const verticalLines = Array.from({ length: 9 });
  const horizontalLines = Array.from({ length: 13 });
  const orbColors = ['#65e9ff', '#ff7098', '#ffe66d'];
  return <View style={{ flex: 1, backgroundColor: '#020b22', overflow: 'hidden' }}>
    <ZoomableMediaImage source={require('./assets/ITDC_icon.png')} resizeMode="contain" style={{ position: 'absolute', width: '98%', height: '54%', alignSelf: 'center', top: '13%', zIndex: 2 }} imageStyle={{ width: '100%', height: '100%', opacity: 1 }} />
    <LinearGradient pointerEvents="none" colors={['#020b2240', '#061b3730', '#020b2260']} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
    <Animated.View pointerEvents="none" style={{ position: 'absolute', top: '-18%', left: '-22%', width: '145%', height: '132%', opacity: 0.2, transform: [{ perspective: 720 }, { rotateX: '58deg' }, { rotateZ: '-8deg' }, { scale: 1.18 }] }}>
      {verticalLines.map((_, index) => <Animated.View key={`v-${index}`} style={{ position: 'absolute', top: 0, bottom: 0, left: `${index * 12.5}%`, width: 1, backgroundColor: index % 2 === 0 ? '#65e9ff66' : '#ff709955', transform: [{ translateX: gridMotion.interpolate({ inputRange: [0, 1], outputRange: [index % 2 === 0 ? -14 : 14, index % 2 === 0 ? 14 : -14] }) }] }} />)}
      {horizontalLines.map((_, index) => <Animated.View key={`h-${index}`} style={{ position: 'absolute', left: 0, right: 0, top: `${index * 8.33}%`, height: 1, backgroundColor: index % 2 === 0 ? '#19c7c955' : '#ffe66d44', transform: [{ translateY: gridMotion.interpolate({ inputRange: [0, 1], outputRange: [index % 2 === 0 ? -8 : 8, index % 2 === 0 ? 8 : -8] }) }] }} />)}
    </Animated.View>
    {orbMotions.map((motion, index) => <Animated.View key={orbColors[index]} pointerEvents="none" style={{ position: 'absolute', width: index === 1 ? 230 : 280, height: index === 1 ? 230 : 280, borderRadius: 150, left: index === 1 ? '62%' : index === 0 ? '-28%' : '30%', top: index === 0 ? '16%' : index === 1 ? '48%' : '70%', backgroundColor: `${orbColors[index]}30`, shadowColor: orbColors[index], shadowOpacity: 0.42, shadowRadius: 58, shadowOffset: { width: 0, height: 0 }, elevation: 12, opacity: 0.24, transform: [{ translateX: motion.interpolate({ inputRange: [0, 1], outputRange: [0, orbPaths[index].x] }) }, { translateY: motion.interpolate({ inputRange: [0, 1], outputRange: [0, orbPaths[index].y] }) }, { scale: motion.interpolate({ inputRange: [0, 1], outputRange: [0.7, orbPaths[index].scale] }) }] }} />)}
    <View style={{ flex: 1 }}>{children}</View>
  </View>;
}

function OnboardingIntroSlide({ finish, setIndex }: { finish: () => void; setIndex: (value: number) => void }) {
  return <OnboardingGridLight><SafeAreaView style={{ flex: 1 }}><View style={styles.topRow}><Brand /><Pressable onPress={finish}><Text style={styles.mutedButton}>Lewati</Text></Pressable></View><View style={styles.progressRow}><Text style={styles.progressText}>01</Text><View style={styles.progressTrack}>{onboardingProgress.map((_, item) => <View key={item} style={[styles.progressBar, item === 0 && styles.progressActive]} />)}</View><Text style={styles.progressText}>08</Text></View><View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 28, paddingTop: 230 }}><Text style={[styles.eyebrow, { color: '#65e9ff', letterSpacing: 2 }]}>IDTC / DIGITAL TWIN</Text><Text style={{ color: '#f3feff', textAlign: 'center', fontSize: 30, lineHeight: 38, fontWeight: '900', marginTop: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#65e9ffcc', borderRadius: 16, backgroundColor: '#061b37d9', textShadowColor: '#03172c', textShadowRadius: 8 }}>Selamat datang di{`\n`}masa depan digital.</Text><Text style={{ color: '#c9f7ff', fontSize: 13, lineHeight: 21, textAlign: 'center', marginTop: 16, maxWidth: 320 }}>Hubungkan dunia nyata dengan data, model, dan keputusan yang lebih cerdas.</Text><View style={{ marginTop: 18, padding: 10, borderRadius: 999, borderWidth: 1, borderColor: '#65e9ff99', backgroundColor: '#061b3766' }}><Text style={{ color: '#ffe66d', fontSize: 10, fontWeight: '900', letterSpacing: 2 }}>EXPLORE THE TWIN</Text></View></View><View style={[styles.actionRow, { justifyContent: 'center' }]}><Pressable style={[styles.primaryButton, { backgroundColor: '#65e9ff' }]} onPress={() => setIndex(1)}><Text style={[styles.primaryText, { color: '#03172c' }]}>Mulai  ↗</Text></Pressable></View><StatusBar style="light" /></SafeAreaView></OnboardingGridLight>;
}

function OnboardingImageSlide({ index, current, finish, setIndex, source }: { index: number; current: string[]; finish: () => void; setIndex: (value: number) => void; source: any }) {
  return <SafeAreaView style={styles.screen}><View style={styles.topRow}><Brand /><Pressable onPress={finish}><Text style={styles.mutedButton}>Lewati</Text></Pressable></View><View style={styles.progressRow}><Text style={styles.progressText}>{String(index + 1).padStart(2, '0')}</Text><View style={styles.progressTrack}>{slides.map((_, item) => <View key={item} style={[styles.progressBar, item === index && styles.progressActive]} />)}</View><Text style={styles.progressText}>07</Text></View><View style={styles.onboardingBody}><Text style={styles.eyebrow}>{current[0]}</Text><Text style={styles.onboardingTitle}>{current[1]}</Text><Text style={[styles.onboardingCopy, { textAlign: 'justify' }]}>{current[2]}</Text><OnboardingImage source={source} /><View style={styles.orbit}><Text style={styles.orbitCore}>DT</Text><View style={styles.orbitLine} /><View style={styles.orbitLineSmall} /></View></View><View style={[styles.actionRow, { justifyContent: 'flex-end', position: 'relative' }]}><Pressable style={styles.primaryButton} onPress={() => index === 6 ? finish() : setIndex(index + 1)}><Text style={styles.primaryText}>{index === 6 ? 'Mulai menjelajah' : 'Lanjut'}  ↗</Text></Pressable><Pressable style={{ position: 'absolute', left: 0 }} onPress={() => setIndex(index - 1)}><Text style={styles.mutedButton}>Kembali</Text></Pressable></View><StatusBar style="light" /></SafeAreaView>;
}

function Onboarding({ finish }: { finish: () => void }) {
  const [index, setIndex] = useState(0);
  const imageReveal = useRef(new Animated.Value(0)).current;
  const current = slides[index];

  useEffect(() => {
    imageReveal.setValue(0);
    Animated.timing(imageReveal, { toValue: 1, duration: 850, useNativeDriver: true }).start();
  }, [imageReveal, index]);

  if (index === 1) {
    return <SafeAreaView style={styles.screen}><View style={styles.topRow}><Brand /><Pressable onPress={finish}><Text style={styles.mutedButton}>Lewati</Text></Pressable></View><View style={styles.progressRow}><Text style={styles.progressText}>02</Text><View style={styles.progressTrack}>{slides.map((_, item) => <View key={item} style={[styles.progressBar, item === index && styles.progressActive]} />)}</View><Text style={styles.progressText}>07</Text></View><View style={styles.onboardingBody}><Text style={styles.eyebrow}>{current[0]}</Text><Text style={styles.onboardingTitle}>{current[1]}</Text><Text style={[styles.onboardingCopy, { textAlign: 'justify' }]}>{current[2]}</Text><ZoomableAnimatedImage source={require('./assets/ITDC_03.jpeg')} style={{ width: '100%', marginTop: 18 }} imageStyle={{ width: '100%', height: 320, borderRadius: 18, opacity: imageReveal, transform: [{ scale: imageReveal.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }] }} /><View style={styles.orbit}><Text style={styles.orbitCore}>DT</Text><View style={styles.orbitLine} /><View style={styles.orbitLineSmall} /></View></View><View style={[styles.actionRow, { justifyContent: 'flex-end', position: 'relative' }]}><Pressable style={styles.primaryButton} onPress={() => setIndex(2)}><Text style={styles.primaryText}>Lanjut  ↗</Text></Pressable><Pressable style={{ position: 'absolute', left: 0 }} onPress={() => setIndex(0)}><Text style={styles.mutedButton}>Kembali</Text></Pressable></View><StatusBar style="light" /></SafeAreaView>;
  }

  if (index === 0) {
    return <SafeAreaView style={styles.screen}><View style={styles.topRow}><Brand /><Pressable onPress={finish}><Text style={styles.mutedButton}>Lewati</Text></Pressable></View><View style={styles.progressRow}><Text style={styles.progressText}>01</Text><View style={styles.progressTrack}>{slides.map((_, item) => <View key={item} style={[styles.progressBar, item === index && styles.progressActive]} />)}</View><Text style={styles.progressText}>07</Text></View><View style={styles.onboardingBody}><Text style={styles.eyebrow}>{current[0]}</Text><Text style={styles.onboardingTitle}>{current[1]}</Text><Text style={[styles.onboardingCopy, { textAlign: 'justify' }]}>{current[2]}</Text><ZoomableAnimatedImage source={require('./assets/ITDC_01.jpeg')} style={{ width: '100%', marginTop: 18 }} imageStyle={{ width: '100%', height: 320, borderRadius: 18, opacity: imageReveal, transform: [{ scale: imageReveal.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }] }} /><View style={styles.orbit}><Text style={styles.orbitCore}>DT</Text><View style={styles.orbitLine} /><View style={styles.orbitLineSmall} /></View></View><View style={[styles.actionRow, { justifyContent: 'flex-end', position: 'relative' }]}><Pressable style={styles.primaryButton} onPress={() => setIndex(1)}><Text style={styles.primaryText}>Lanjut  ↗</Text></Pressable></View><StatusBar style="light" /></SafeAreaView>;
  }

  if (index === 2) {
    return <SafeAreaView style={styles.screen}><View style={styles.topRow}><Brand /><Pressable onPress={finish}><Text style={styles.mutedButton}>Lewati</Text></Pressable></View><View style={styles.progressRow}><Text style={styles.progressText}>03</Text><View style={styles.progressTrack}>{slides.map((_, item) => <View key={item} style={[styles.progressBar, item === index && styles.progressActive]} />)}</View><Text style={styles.progressText}>07</Text></View><View style={styles.onboardingBody}><Text style={styles.eyebrow}>{current[0]}</Text><Text style={styles.onboardingTitle}>{current[1]}</Text><Text style={[styles.onboardingCopy, { textAlign: 'justify' }]}>{current[2]}</Text><OnboardingImage source={require('./assets/ITDC_05.jpeg')} imageWidth="276%" /><View style={styles.orbit}><Text style={styles.orbitCore}>DT</Text><View style={styles.orbitLine} /><View style={styles.orbitLineSmall} /></View></View><View style={[styles.actionRow, { justifyContent: 'flex-end', position: 'relative' }]}><Pressable style={styles.primaryButton} onPress={() => setIndex(3)}><Text style={styles.primaryText}>Lanjut  ↗</Text></Pressable><Pressable style={{ position: 'absolute', left: 0 }} onPress={() => setIndex(1)}><Text style={styles.mutedButton}>Kembali</Text></Pressable></View><StatusBar style="light" /></SafeAreaView>;
  }

  if (index >= 3) {
    return <OnboardingImageSlide index={index} current={current} finish={finish} setIndex={setIndex} source={onboardingImages[index - 3]} />;
  }

  return <SafeAreaView style={styles.screen}><View style={styles.topRow}><Brand /><Pressable onPress={finish}><Text style={styles.mutedButton}>Lewati</Text></Pressable></View><View style={styles.progressRow}><Text style={styles.progressText}>{String(index + 1).padStart(2, '0')}</Text><View style={styles.progressTrack}>{slides.map((_, item) => <View key={item} style={[styles.progressBar, item === index && styles.progressActive]} />)}</View><Text style={styles.progressText}>07</Text></View><View style={styles.onboardingBody}><Text style={styles.eyebrow}>{current[0]}</Text><Text style={styles.onboardingTitle}>{current[1]}</Text><Text style={styles.onboardingCopy}>{current[2]}</Text>{index === 0 && <ZoomableAnimatedImage source={require('./assets/ITDC_01.jpeg')} style={{ width: '100%', marginTop: 18 }} imageStyle={{ width: '100%', height: 250, borderRadius: 18, opacity: imageReveal, transform: [{ scale: imageReveal.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }] }} />}<View style={styles.orbit}><Text style={styles.orbitCore}>DT</Text><View style={styles.orbitLine} /><View style={styles.orbitLineSmall} /></View></View><View style={[styles.actionRow, { justifyContent: 'flex-end', position: 'relative' }]}><Pressable style={styles.primaryButton} onPress={() => index === 6 ? finish() : setIndex(index + 1)}><Text style={styles.primaryText}>{index === 6 ? 'Mulai menjelajah' : 'Lanjut'}  ↗</Text></Pressable>{index > 0 && <Pressable style={{ position: 'absolute', left: 0 }} onPress={() => setIndex(index - 1)}><Text style={styles.mutedButton}>Kembali</Text></Pressable>}</View><StatusBar style="light" /></SafeAreaView>;
}

function OnboardingLegacySlide({ index, current, finish, setIndex, source }: { index: number; current: string[]; finish: () => void; setIndex: (value: number) => void; source: any }) {
  const isLast = index === slides.length;
  return <SafeAreaView style={styles.screen}><View style={styles.topRow}><Brand /><Pressable onPress={finish}><Text style={styles.mutedButton}>Lewati</Text></Pressable></View><View style={styles.progressRow}><Text style={styles.progressText}>{String(index + 1).padStart(2, '0')}</Text><View style={styles.progressTrack}>{onboardingProgress.map((_, item) => <View key={item} style={[styles.progressBar, item === index && styles.progressActive]} />)}</View><Text style={styles.progressText}>08</Text></View><View style={styles.onboardingBody}><Text style={styles.eyebrow}>{current[0]}</Text><Text style={styles.onboardingTitle}>{current[1]}</Text><Text style={styles.onboardingCopy}>{current[2]}</Text><OnboardingImage source={source} /><View style={styles.orbit}><Text style={styles.orbitCore}>DT</Text><View style={styles.orbitLine} /><View style={styles.orbitLineSmall} /></View></View><View style={[styles.actionRow, { justifyContent: 'flex-end', position: 'relative' }]}><Pressable style={styles.primaryButton} onPress={() => isLast ? finish() : setIndex(index + 1)}><Text style={styles.primaryText}>{isLast ? 'Mulai menjelajah' : 'Lanjut'}  ↗</Text></Pressable>{index > 0 && <Pressable style={{ position: 'absolute', left: 0 }} onPress={() => setIndex(index - 1)}><Text style={styles.mutedButton}>Kembali</Text></Pressable>}</View><StatusBar style="light" /></SafeAreaView>;
}

function OnboardingExperience({ finish }: { finish: () => void }) {
  const [index, setIndex] = useState(0);
  const legacySources = [require('./assets/ITDC_01.jpeg'), require('./assets/ITDC_03.jpeg'), require('./assets/ITDC_05.jpeg'), ...onboardingImages];
  if (index === 0) return <OnboardingIntroSlide finish={finish} setIndex={setIndex} />;
  return <OnboardingLegacySlide index={index} current={slides[index - 1]} finish={finish} setIndex={setIndex} source={legacySources[index - 1]} />;
}

function Auth({ mode, changeMode, finish }: { mode: AuthMode; changeMode: (mode: AuthMode) => void; finish: (admin: boolean) => void }) {
  const login = mode === 'login';
  const [error, setError] = useState('');
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID;
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? 'google-client-id-not-configured',
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    clientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID ?? googleClientId,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    void AppleAuthentication.isAvailableAsync().then(setAppleAvailable).catch(() => setAppleAvailable(false));
  }, []);

  useEffect(() => {
    if (!response) return;
    if (response.type === 'cancel' || response.type === 'dismiss') {
      setLoadingProvider(null);
      return;
    }
    if (response.type === 'error') {
      setLoadingProvider(null);
      setError('Login Google gagal. Periksa client ID dan konfigurasi OAuth Google Anda.');
      return;
    }
    if (response.type !== 'success' || !response.authentication?.accessToken) {
      setLoadingProvider(null);
      setError('Respons login Google tidak lengkap. Silakan coba lagi.');
      return;
    }

    const loadGoogleProfile = async () => {
      try {
        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.authentication?.accessToken}` },
        });
        if (!profileResponse.ok) throw new Error('Google profile request failed');
        const profile = await profileResponse.json() as { email?: string };
        if (!profile.email) throw new Error('Google account email is unavailable');
        setLoadingProvider(null);
        finish(profile.email.toLowerCase() === 'dani@idtc.org');
      } catch {
        setLoadingProvider(null);
        setError('Akun Google berhasil dipilih, tetapi profilnya belum dapat dibaca. Coba lagi.');
      }
    };

    void loadGoogleProfile();
  }, [response, finish]);

  const signInWithGoogle = async () => {
    setError('');
    if (!request) {
      setError('Google Sign-In belum siap. Pastikan EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID sudah diatur.');
      return;
    }
    setLoadingProvider('google');
    try {
      await promptAsync();
    } catch {
      setLoadingProvider(null);
      setError('Google Sign-In tidak dapat dibuka. Silakan coba lagi.');
    }
  };

  const signInWithApple = async () => {
    setError('');
    if (!appleAvailable) {
      setError('Apple ID Sign-In hanya tersedia pada perangkat Apple yang mendukungnya.');
      return;
    }
    setLoadingProvider('apple');
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
      });
      setLoadingProvider(null);
      finish(credential.email?.toLowerCase() === 'dani@idtc.org');
    } catch (appleError) {
      setLoadingProvider(null);
      if ((appleError as { code?: string }).code !== 'ERR_REQUEST_CANCELED') {
        setError('Login dengan Apple ID gagal. Silakan coba lagi.');
      }
    }
  };

  const providerLoading = loadingProvider !== null;
  const appleButtonStyle = { height: 52, borderRadius: 18, backgroundColor: '#050505', marginTop: 12, alignItems: 'center' as const, justifyContent: 'center' as const, flexDirection: 'row' as const, gap: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 4 };
  const authButtonDisabledStyle = { opacity: 0.55 };
  return <SafeAreaView style={styles.screen}><View style={styles.topRow}><Brand /><Text style={styles.authStatus}>DIGITAL TWIN PLATFORM</Text></View><ScrollView contentContainerStyle={styles.authBody}><Text style={styles.eyebrow}>{login ? 'AKSES PLATFORM' : 'REGISTRASI PENGGUNA'}</Text><Text style={styles.authTitle}>{login ? 'Masuk ke pusat kendali.' : 'Buat identitas IDTC.'}</Text><Text style={styles.onboardingCopy}>{login ? 'Akses wawasan, pantau progres, dan kembangkan kapabilitas Digital Twin Anda.' : 'Daftarkan diri untuk mempelajari, merancang, dan mengembangkan sistem Digital Twin.'}</Text><Pressable disabled={providerLoading} style={[styles.googleButton, providerLoading && authButtonDisabledStyle]} onPress={signInWithGoogle}><Text style={styles.googleText}>G</Text><Text style={styles.googleLabel}>{loadingProvider === 'google' ? 'Menghubungkan ke Google...' : login ? 'Masuk dengan akun Gmail' : 'Daftar dengan akun Gmail'}</Text></Pressable>{appleAvailable && <Pressable disabled={providerLoading} style={[appleButtonStyle, providerLoading && authButtonDisabledStyle]} onPress={signInWithApple}><Text style={{ color: '#fff', fontSize: 18 }}>●</Text><Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{loadingProvider === 'apple' ? 'Menghubungkan ke Apple...' : login ? 'Masuk dengan Apple ID' : 'Daftar dengan Apple ID'}</Text></Pressable>}<Text style={styles.divider}>────────  akun digunakan untuk akses IDTC  ────────</Text>{error !== '' && <Text style={styles.error}>{error}</Text>}<Pressable disabled={providerLoading} style={[styles.primaryButtonWide, providerLoading && authButtonDisabledStyle]} onPress={signInWithGoogle}><Text style={styles.primaryText}>{login ? 'Masuk melalui Gmail' : 'Daftar melalui Gmail'}  ↗</Text></Pressable>{!login && <Pressable disabled={providerLoading} style={styles.guestButton} onPress={() => finish(false)}><Text style={styles.guestText}>Masuk sebagai tamu  →</Text></Pressable>}<Pressable disabled={providerLoading} onPress={() => changeMode(login ? 'register' : 'login')}><Text style={styles.switchText}>{login ? 'Belum memiliki akun? Daftar sekarang' : 'Sudah memiliki akun? Masuk ke platform'}</Text></Pressable></ScrollView><StatusBar style="light" /></SafeAreaView>;
}

function Profile({ themeDark, setThemeDark, admin, restart }: { themeDark: boolean; setThemeDark: (value: boolean) => void; admin: boolean; restart: () => void }) { return <ScrollView contentContainerStyle={styles.content}><View style={styles.profileHero}><View style={styles.avatar}><Text style={styles.avatarText}>DH</Text></View><View><Text style={styles.eyebrow}>IDENTITAS PENGGUNA</Text><Text style={styles.profileName}>Dani Hamdani</Text><Text style={styles.profileEmail}>dani@idtc.org</Text><Text style={styles.origin}>Super Admin</Text></View></View>{admin && <View style={styles.adminBanner}><Text style={styles.adminStar}>✦</Text><View style={{ flex: 1 }}><Text style={styles.adminTitle}>Super Admin</Text><Text style={styles.adminCopy}>Akses penuh terhadap ekosistem IDTC</Text></View><Text style={styles.adminTag}>ADMIN</Text></View>}<Text style={styles.sectionEyebrow}>KONFIGURASI</Text><Text style={styles.sectionTitle}>Preferensi platform</Text><View style={styles.setting}><Text style={styles.settingIcon}>◐</Text><View style={{ flex: 1 }}><Text style={styles.settingTitle}>Mode gelap</Text><Text style={styles.settingCopy}>{themeDark ? 'Mode gelap aktif' : 'Mode terang aktif'}</Text></View><Switch value={themeDark} onValueChange={setThemeDark} trackColor={{ false: '#467087', true: colors.blue }} thumbColor={themeDark ? colors.cyan : '#d7edf4'} /></View><Pressable style={styles.profileAction} onPress={restart}><Text style={styles.actionIcon}>◈</Text><View style={{ flex: 1 }}><Text style={styles.settingTitle}>Tinjau kembali onboarding</Text><Text style={styles.settingCopy}>Bangun fondasi pemahaman Digital Twin</Text></View><Text style={styles.actionArrow}>↗</Text></Pressable>{admin && <Pressable style={styles.profileAction}><Text style={styles.actionIcon}>◎</Text><View style={{ flex: 1 }}><Text style={styles.settingTitle}>Manajemen pengguna</Text><Text style={styles.settingCopy}>Kelola akses, peran, dan otorisasi pengguna</Text></View><Text style={styles.actionArrow}>↗</Text></Pressable>}</ScrollView>; }

function ProfileLayout({ themeDark, setThemeDark, admin, restart }: { themeDark: boolean; setThemeDark: (value: boolean) => void; admin: boolean; restart: () => void }) {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [name, setName] = useState('Dani Hamdani');
  const [email, setEmail] = useState('dani@idtc.org');
  const [phone, setPhone] = useState('+62 812 3456 7890');
  const [organization, setOrganization] = useState('Indonesia Digital Twin Consortium');
  const [jobTitle, setJobTitle] = useState('Digital Twin Strategist');
  const [editing, setEditing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [usageInsights, setUsageInsights] = useState(false);
  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (!result.canceled) setProfilePhoto(result.assets[0].uri);
  };
  return <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 190 }}>
    <View style={{ padding: 20, borderRadius: 24, backgroundColor: '#0b426b', borderWidth: 1, borderColor: colors.cyan, shadowColor: colors.cyan, shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}><Text style={styles.sectionEyebrow}>PROFILE / ACCOUNT</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16 }}><Pressable onPress={choosePhoto} accessibilityLabel="Ganti foto profil" style={{ width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cyan, borderWidth: 2, borderColor: '#d9fbff', overflow: 'hidden' }}>{profilePhoto ? <Image source={{ uri: profilePhoto }} style={{ width: '100%', height: '100%' }} /> : <Text style={{ color: '#03172c', fontSize: 26, fontWeight: '900' }}>DH</Text>}</Pressable><View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 22, fontWeight: '900' }}>{name}</Text><Text style={{ color: '#b2d4e5', fontSize: 12, marginTop: 4 }}>{email}</Text><Text style={{ color: colors.pink, fontSize: 10, fontWeight: '900', marginTop: 7 }}>{admin ? 'SUPER ADMIN' : 'MEMBER IDTC'}</Text></View></View><Pressable onPress={choosePhoto} style={{ alignSelf: 'flex-start', marginTop: 14, paddingVertical: 9, paddingHorizontal: 13, borderRadius: 12, backgroundColor: '#65e9ff20', borderWidth: 1, borderColor: colors.cyan }}><Text style={{ color: colors.cyan, fontSize: 11, fontWeight: '800' }}>Pilih foto profil</Text></Pressable></View>
    {admin && <View style={{ marginTop: 14, padding: 16, borderRadius: 18, backgroundColor: '#123553', borderWidth: 1, borderColor: '#397694', flexDirection: 'row', alignItems: 'center', gap: 12 }}><Text style={{ color: colors.cyan, fontSize: 22 }}>✦</Text><View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 14, fontWeight: '900' }}>Admin workspace</Text><Text style={{ color: '#b2d4e5', fontSize: 11, marginTop: 4 }}>Akses pengaturan dan CMS platform</Text></View><Text style={{ color: colors.cyan, fontSize: 18 }}>●</Text></View>}
    <View style={{ marginTop: 22, padding: 16, borderRadius: 18, backgroundColor: '#123553', borderWidth: 1, borderColor: '#397694' }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={styles.sectionTitle}>Informasi akun</Text><Pressable onPress={() => setEditing((value) => !value)}><Text style={{ color: colors.cyan, fontSize: 12, fontWeight: '800' }}>{editing ? 'Selesai' : 'Edit'}</Text></Pressable></View>{editing ? <><TextInput value={name} onChangeText={setName} placeholder="Nama lengkap" placeholderTextColor="#7da6bc" style={[styles.input, { marginTop: 14, color: colors.text }]} /><TextInput value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#7da6bc" style={[styles.input, { color: colors.text }]} /><TextInput value={phone} onChangeText={setPhone} placeholder="Nomor telepon" keyboardType="phone-pad" placeholderTextColor="#7da6bc" style={[styles.input, { color: colors.text }]} /><TextInput value={organization} onChangeText={setOrganization} placeholder="Organisasi" placeholderTextColor="#7da6bc" style={[styles.input, { color: colors.text }]} /><TextInput value={jobTitle} onChangeText={setJobTitle} placeholder="Jabatan" placeholderTextColor="#7da6bc" style={[styles.input, { color: colors.text }]} /></> : <><Text style={{ color: colors.text, fontSize: 14, marginTop: 12 }}>{name}</Text><Text style={{ color: '#b2d4e5', fontSize: 12, marginTop: 5 }}>{email}</Text><Text style={{ color: '#b2d4e5', fontSize: 12, marginTop: 5 }}>{phone}</Text><Text style={{ color: '#b2d4e5', fontSize: 12, marginTop: 5 }}>{jobTitle} • {organization}</Text></>}</View>
    <Text style={[styles.sectionEyebrow, { marginTop: 28 }]}>PREFERENCES</Text><Text style={[styles.sectionTitle, { color: colors.text, marginTop: 6 }]}>Pengaturan platform</Text><View style={{ marginTop: 12, padding: 16, borderRadius: 18, backgroundColor: '#123553', borderWidth: 1, borderColor: '#397694', flexDirection: 'row', alignItems: 'center', gap: 12 }}><Text style={{ color: colors.cyan, fontSize: 22 }}>◐</Text><View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 14, fontWeight: '900' }}>Mode gelap</Text><Text style={{ color: '#b2d4e5', fontSize: 11, marginTop: 4 }}>{themeDark ? 'Mode gelap aktif' : 'Mode terang aktif'}</Text></View><Switch value={themeDark} onValueChange={setThemeDark} trackColor={{ false: '#397694', true: colors.blue }} thumbColor={themeDark ? colors.cyan : '#d7edf4'} /></View><View style={{ marginTop: 10, padding: 16, borderRadius: 18, backgroundColor: '#123553', borderWidth: 1, borderColor: '#397694', flexDirection: 'row', alignItems: 'center', gap: 12 }}><Text style={{ color: colors.cyan, fontSize: 22 }}>◌</Text><View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 14, fontWeight: '900' }}>Notifikasi</Text><Text style={{ color: '#b2d4e5', fontSize: 11, marginTop: 4 }}>{notifications ? 'Peringatan dan update aktif' : 'Notifikasi dimatikan'}</Text></View><Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: '#397694', true: colors.blue }} thumbColor={notifications ? colors.cyan : '#d7edf4'} /></View><View style={{ marginTop: 10, padding: 16, borderRadius: 18, backgroundColor: '#123553', borderWidth: 1, borderColor: '#397694', flexDirection: 'row', alignItems: 'center', gap: 12 }}><Text style={{ color: colors.cyan, fontSize: 22 }}>⌁</Text><View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 14, fontWeight: '900' }}>Keamanan biometrik</Text><Text style={{ color: '#b2d4e5', fontSize: 11, marginTop: 4 }}>{biometric ? 'Face ID / Touch ID aktif' : 'Gunakan pengamanan perangkat'}</Text></View><Switch value={biometric} onValueChange={setBiometric} trackColor={{ false: '#397694', true: colors.blue }} thumbColor={biometric ? colors.cyan : '#d7edf4'} /></View><View style={{ marginTop: 10, padding: 16, borderRadius: 18, backgroundColor: '#123553', borderWidth: 1, borderColor: '#397694', flexDirection: 'row', alignItems: 'center', gap: 12 }}><Text style={{ color: colors.cyan, fontSize: 22 }}>↻</Text><View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 14, fontWeight: '900' }}>Sinkronisasi otomatis</Text><Text style={{ color: '#b2d4e5', fontSize: 11, marginTop: 4 }}>{autoSync ? 'Data project diperbarui otomatis' : 'Sinkronisasi manual'}</Text></View><Switch value={autoSync} onValueChange={setAutoSync} trackColor={{ false: '#397694', true: colors.blue }} thumbColor={autoSync ? colors.cyan : '#d7edf4'} /></View><View style={{ marginTop: 10, padding: 16, borderRadius: 18, backgroundColor: '#123553', borderWidth: 1, borderColor: '#397694', flexDirection: 'row', alignItems: 'center', gap: 12 }}><Text style={{ color: colors.cyan, fontSize: 22 }}>◌</Text><View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 14, fontWeight: '900' }}>Insight penggunaan</Text><Text style={{ color: '#b2d4e5', fontSize: 11, marginTop: 4 }}>{usageInsights ? 'Analitik penggunaan diizinkan' : 'Analitik penggunaan dimatikan'}</Text></View><Switch value={usageInsights} onValueChange={setUsageInsights} trackColor={{ false: '#397694', true: colors.blue }} thumbColor={usageInsights ? colors.cyan : '#d7edf4'} /></View><Pressable style={{ marginTop: 10, padding: 16, borderRadius: 18, backgroundColor: '#123553', borderWidth: 1, borderColor: '#397694', flexDirection: 'row', alignItems: 'center', gap: 12 }} onPress={restart}><Text style={{ color: colors.cyan, fontSize: 20 }}>◈</Text><View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 14, fontWeight: '900' }}>Tinjau onboarding</Text><Text style={{ color: '#b2d4e5', fontSize: 11, marginTop: 4 }}>Bangun kembali fondasi Digital Twin</Text></View><Text style={{ color: colors.pink, fontSize: 18 }}>↗</Text></Pressable>
  </ScrollView>;
}

function LegacyAppHome({ admin, restart }: { admin: boolean; restart: () => void }) {
  const [menu, setMenu] = useState<MenuKey>('literasi');
  const [dark, setDark] = useState(false);
  const pageTitle: Record<MenuKey, string> = { literasi: '', regulasi: 'Rambu untuk inovasi yang bertanggung jawab.', referensi: 'Sumber untuk terus belajar.', project: 'Project DT kamu, terpantau.', profil: '' };
  const pageCopy: Record<MenuKey, string> = { literasi: '', regulasi: 'Temukan panduan, standar, dan prinsip tata kelola data untuk implementasi Digital Twin.', referensi: 'Kumpulan bacaan, istilah, dan referensi teknologi yang membantu memperdalam pemahaman.', project: 'Kelola ide dan progres penerapan Digital Twin dalam satu ruang kerja ringkas.', profil: '' };
  return <View style={[styles.app, dark && styles.appDark]}><SafeAreaView style={styles.appSafe}><View style={styles.appHeader}><Brand /><Text style={styles.notification}>♧</Text></View>{menu === 'profil' ? <Profile themeDark={dark} setThemeDark={setDark} admin={admin} restart={restart} /> : menu === 'literasi' ? <ScrollView contentContainerStyle={styles.content}><View style={styles.hero}><Text style={styles.eyebrow}>INTELLIGENCE LAYER</Text><Text style={styles.heroTitle}>Pahami realitas<Text style={{ color: colors.pink }}> secara presisi.</Text></Text><Text style={styles.heroCopy}>Ubah data aset menjadi visibilitas operasional, prediksi yang tajam, dan keputusan yang dapat dipertanggungjawabkan.</Text><View style={styles.heroOrb}><Text style={styles.orbitCore}>DT</Text></View></View><Text style={styles.sectionEyebrow}>KERANGKA UTAMA</Text><Text style={styles.sectionTitle}>Fondasi Digital Twin</Text><Text style={styles.bodyCopy}>Digital Twin menyatukan aset fisik, data aktual, model digital, analitik, dan simulasi dalam satu ekosistem yang terus berkembang.</Text>{['Data terukur', 'Model adaptif', 'Aksi strategis'].map((title, index) => <View style={styles.learningCard} key={title}><Text style={styles.cardNumber}>0{index + 1}</Text><Text style={styles.cardTitle}>{title}</Text><Text style={styles.cardCopy}>{['Sensor membangun gambaran kondisi aset secara real-time.', 'Model mengolah konteks melalui simulasi, AI, dan aturan bisnis.', 'Insight mengarahkan rekomendasi serta keputusan operasional.'][index]}</Text></View>)}</ScrollView> : <ScrollView contentContainerStyle={styles.content}><View style={styles.simpleHero}><Text style={styles.eyebrow}>{menu.toUpperCase()}</Text><Text style={styles.simpleTitle}>{pageTitle[menu]}</Text><Text style={styles.heroCopy}>{pageCopy[menu]}</Text></View>{['Tata kelola data & privasi', 'Keamanan siber aset terhubung', 'Standar interoperabilitas', 'Etika AI dan otomasi'].map((item, index) => <View style={styles.simpleRow} key={item}><Text style={styles.cardNumber}>0{index + 1}</Text><Text style={styles.settingTitle}>{menu === 'project' ? ['Pilot manufaktur', 'Inteligensi energi gedung', 'Portofolio aset prioritas', 'Eksperimen sensor IoT'][index] : menu === 'referensi' ? ['Glosarium Digital Twin', 'IoT, cloud, dan edge computing', 'Simulasi & predictive maintenance', 'BIM dan pemodelan 3D'][index] : item}</Text><Text style={styles.actionArrow}>↗</Text></View>)}</ScrollView>}<View style={styles.floatingNav}>{menus.map(([key, icon, label]) => <Pressable key={key} style={[styles.navItem, menu === key && styles.navActive]} onPress={() => setMenu(key)}><Text style={[styles.navIcon, menu === key && styles.navIconActive]}>{icon}</Text><Text style={styles.navLabel}>{label}</Text></Pressable>)}</View></SafeAreaView></View>;
}

function SlideDetail({ slide, close }: { slide: number; close: () => void }) {
  const [kicker, title, copy] = slides[slide];
  const details = ['Digital Twin adalah representasi virtual berbasis data dari objek, aset, proses, atau sistem di dunia nyata yang terhubung dan disinkronkan secara berkala atau real-time dengan kondisi fisiknya.\n\nContoh: sebuah mesin pompa di pabrik memiliki sensor suhu, getaran, tekanan, dan konsumsi listrik. Data sensor dikirim ke sistem digital untuk membentuk “kembaran digital” pompa. Tim dapat memantau kondisi, memprediksi kerusakan, atau menguji pengaturan baru tanpa mengganggu mesin asli.\n\nDigital Twin Consortium mendefinisikannya sebagai representasi virtual terintegrasi dan berbasis data dari entitas atau proses dunia nyata, dengan interaksi tersinkronisasi pada frekuensi dan tingkat ketelitian tertentu.', 'Konektivitas data membangun visibilitas kondisi aset melalui sensor, jaringan, dan platform analitik.', 'Model adaptif menggabungkan data aktual, simulasi, AI, serta aturan bisnis untuk menghasilkan konteks.', 'Monitoring presisi membantu organisasi mengenali pola operasi normal dan mendeteksi anomali lebih awal.', 'Prediksi berbasis kondisi memungkinkan tim merencanakan maintenance sebelum gangguan berdampak pada operasi.', 'Simulasi memberikan ruang untuk menguji skenario, mengukur konsekuensi, dan memilih keputusan terbaik.', 'Aksi strategis mengubah insight menjadi rekomendasi yang terukur dan peningkatan performa berkelanjutan.'];
  const objectives = ['Memantau kondisi aset secara real-time.', 'Memprediksi kegagalan atau kebutuhan perawatan.', 'Menjalankan simulasi sebelum perubahan diterapkan ke aset fisik.', 'Mengoptimalkan operasi, energi, biaya, dan kualitas.', 'Mendukung keputusan berbasis data.', 'Memperpanjang umur aset dan mengurangi downtime.', 'Meningkatkan desain produk pada siklus berikutnya.'];
  const comparison = [['Digital Model', 'Tidak otomatis terhubung dengan data fisik.', 'Model CAD sebuah mesin.'], ['Digital Shadow', 'Data fisik otomatis memperbarui model, tanpa umpan balik otomatis.', 'Dashboard IoT suhu mesin.'], ['Digital Twin', 'Data dan model tersinkronisasi; mampu menganalisis, mensimulasikan, dan memberi rekomendasi.', 'Prediksi kegagalan dan penjadwalan maintenance.']];
  const components = [['01', 'Entitas fisik', 'Mesin, kendaraan, gedung, lini produksi, jaringan listrik, tubuh manusia, kota, atau proses bisnis.'], ['02', 'Sensor dan aktuator', 'Sensor membaca suhu, getaran, lokasi, tekanan, kelembapan, kamera, dan energi. Aktuator menjalankan aksi seperti menurunkan kecepatan mesin.'], ['03', 'Konektivitas', 'Wi-Fi, Ethernet, 4G/5G, LoRaWAN, MQTT, OPC UA, Modbus, atau API.'], ['04', 'Platform data', 'Database time-series, data lake, event streaming, dan data warehouse untuk data real-time maupun historis.'], ['05', 'Model digital', '3D/CAD, BIM, model fisika, simulasi, statistik, machine learning, aturan bisnis, dan logika operasional.'], ['06', 'Analitik dan visualisasi', 'Dashboard, notifikasi, prediksi, simulasi skenario, peta, model 3D, serta antarmuka AR/VR.'], ['07', 'Keputusan dan tindakan', 'Rekomendasi manusia atau kontrol otomatis melalui SCADA, ERP, CMMS, dan MES.']];
  const workflow = ['Sensor membaca kondisi objek fisik.', 'Data dikirim secara real-time atau berkala.', 'Data dibersihkan, divalidasi, dan disimpan.', 'Model digital diperbarui mengikuti kondisi aktual.', 'Analisis, prediksi, atau simulasi dijalankan.', 'Insight, alarm, rekomendasi, atau perintah kontrol dihasilkan.', 'Tindakan operasi menjadi data baru untuk menyempurnakan model.'];
  const twinTypes = [['Component Twin', 'Bearing atau baterai.'], ['Asset Twin', 'Satu mesin CNC lengkap.'], ['System Twin', 'Kumpulan aset dalam satu lini produksi.'], ['Process Twin', 'Aliran produksi hingga distribusi.']];
  const lifecycleTypes = [['Design Twin', 'Desain dan rekayasa produk.'], ['Production Twin', 'Manufaktur dan quality control.'], ['Operational Twin', 'Saat aset digunakan.'], ['Performance Twin', 'Performa, energi, keandalan, dan maintenance.']];
  const technologies = ['IoT dan sensor', 'Cloud dan edge computing', 'Big data dan database time-series', 'Artificial Intelligence dan machine learning', 'Simulasi fisik dan computational fluid dynamics', 'CAD, BIM, GIS, dan 3D visualization', 'API dan integrasi enterprise', 'AR/VR untuk visualisasi dan pelatihan', 'Cybersecurity, identity management, dan data governance'];
  const applications = [['Manufaktur', 'Memantau output, kualitas, energi, dan kesehatan mesin; mengurangi downtime, menemukan bottleneck, mengoptimalkan urutan kerja, dan menjalankan predictive maintenance.'], ['Gedung dan Smart Building', 'Menggabungkan BIM, okupansi, suhu, listrik, HVAC, dan keamanan untuk efisiensi energi, perawatan fasilitas, dan respons darurat.'], ['Smart City', 'Memodelkan jalan, transportasi, drainase, energi, dan kualitas udara untuk simulasi jalan, optimasi lampu lalu lintas, prediksi banjir, dan tata kota.']];
  return <SafeAreaView style={styles.detailScreen}><View style={styles.detailHeader}><Pressable onPress={close} style={styles.backCircle}><Text style={styles.backCircleText}>‹</Text></Pressable><Text style={styles.detailHeaderLabel}>INTELLIGENCE MODULE</Text><Text style={styles.detailIndex}>0{slide + 1}</Text></View><ScrollView contentContainerStyle={styles.detailContent}><Text style={styles.eyebrow}>{kicker}</Text><Text style={styles.detailTitle}>{title.replace('\n', ' ')}</Text><Text style={styles.detailCopy}>{copy}</Text><View style={styles.detailBadge}><Text style={styles.detailBadgeText}>◉  PRIORITY INSIGHT</Text></View><View style={styles.detailGlass}><View style={styles.warningOrb}><Text style={styles.warningIcon}>!</Text></View><Text style={styles.detailGlassLabel}>SIGNAL ANALYSIS</Text><Text style={styles.detailGlassTitle}>Insight {String(slide + 1).padStart(2, '0')}</Text><Text style={styles.detailGlassCopy}>{details[slide]}</Text></View>{slide === 0 && <View style={styles.objectivesCard}><Text style={styles.objectivesEyebrow}>STRATEGIC OBJECTIVES</Text><Text style={styles.objectivesTitle}>Tujuan Digital Twin</Text>{objectives.map((objective, index) => <View style={styles.objectiveRow} key={objective}><Text style={styles.objectiveNumber}>0{index + 1}</Text><Text style={styles.objectiveText}>{objective}</Text></View>)}</View>}{slide === 0 && <View style={styles.comparisonCard}><Text style={styles.objectivesEyebrow}>ARCHITECTURE SPECTRUM</Text><Text style={styles.objectivesTitle}>Model, Shadow, atau Twin?</Text>{comparison.map(([name, relation, example], index) => <View style={styles.comparisonRow} key={name}><View style={styles.comparisonTop}><Text style={styles.comparisonNumber}>0{index + 1}</Text><Text style={styles.comparisonName}>{name}</Text></View><Text style={styles.comparisonRelation}>{relation}</Text><Text style={styles.comparisonExample}>Contoh: {example}</Text></View>)}<Text style={styles.comparisonNote}>Intinya, dashboard IoT belum otomatis menjadi Digital Twin. Sebuah sistem layak disebut Digital Twin apabila memiliki representasi aset, koneksi data yang bermakna, konteks operasional, serta kemampuan analisis atau simulasi.</Text></View>}{slide === 0 && <View style={styles.knowledgeStack}><View style={styles.knowledgeCard}><Text style={styles.knowledgeEyebrow}>04 / ARCHITECTURE</Text><Text style={styles.knowledgeTitle}>Komponen utama</Text><Text style={styles.knowledgeFlow}>Objek fisik → Sensor/IoT → Jaringan → Platform data → Model digital/AI{"\n"}↑  Rekomendasi atau kontrol  ↓</Text>{components.map(([number, name, description]) => <View style={styles.knowledgeRow} key={name}><Text style={styles.knowledgeNumber}>{number}</Text><View style={{ flex: 1 }}><Text style={styles.knowledgeName}>{name}</Text><Text style={styles.knowledgeText}>{description}</Text></View></View>)}</View><View style={styles.knowledgeCard}><Text style={styles.knowledgeEyebrow}>05 / OPERATION LOOP</Text><Text style={styles.knowledgeTitle}>Cara kerja</Text>{workflow.map((step, index) => <View style={styles.knowledgeRow} key={step}><Text style={styles.knowledgeNumber}>0{index + 1}</Text><Text style={styles.knowledgeText}>{step}</Text></View>)}<Text style={styles.knowledgeNote}>Contoh: pola getaran motor yang tidak normal dapat memprediksi kerusakan bearing dalam 10 hari dan memicu work order maintenance sebelum mesin berhenti.</Text></View><View style={styles.knowledgeCard}><Text style={styles.knowledgeEyebrow}>06 / CLASSIFICATION</Text><Text style={styles.knowledgeTitle}>Jenis Digital Twin</Text><Text style={styles.knowledgeSubhead}>Berdasarkan cakupan</Text>{twinTypes.map(([name, example]) => <View style={styles.knowledgeRow} key={name}><Text style={styles.knowledgeNumber}>›</Text><View style={{ flex: 1 }}><Text style={styles.knowledgeName}>{name}</Text><Text style={styles.knowledgeText}>{example}</Text></View></View>)}<Text style={styles.knowledgeSubhead}>Berdasarkan fase siklus hidup</Text>{lifecycleTypes.map(([name, example]) => <View style={styles.knowledgeRow} key={name}><Text style={styles.knowledgeNumber}>›</Text><View style={{ flex: 1 }}><Text style={styles.knowledgeName}>{name}</Text><Text style={styles.knowledgeText}>{example}</Text></View></View>)}</View><View style={styles.knowledgeCard}><Text style={styles.knowledgeEyebrow}>07 / TECHNOLOGY STACK</Text><Text style={styles.knowledgeTitle}>Teknologi pendukung</Text>{technologies.map((technology, index) => <View style={styles.knowledgeRow} key={technology}><Text style={styles.knowledgeNumber}>0{index + 1}</Text><Text style={styles.knowledgeText}>{technology}</Text></View>)}</View><View style={styles.knowledgeCard}><Text style={styles.knowledgeEyebrow}>08 / APPLICATIONS</Text><Text style={styles.knowledgeTitle}>Contoh penerapan</Text>{applications.map(([name, description], index) => <View style={styles.applicationRow} key={name}><Text style={styles.knowledgeNumber}>0{index + 1}</Text><Text style={styles.knowledgeName}>{name}</Text><Text style={styles.knowledgeText}>{description}</Text></View>)}</View></View>}<View style={styles.detailLine}><Text style={styles.detailLineNumber}>0{slide + 1}</Text><Text style={styles.detailLineText}>DIGITAL TWIN / OPERATIONAL INTELLIGENCE</Text></View></ScrollView><Pressable style={styles.detailAction} onPress={close}><Text style={styles.detailActionText}>Kembali ke Home  ↗</Text></Pressable><StatusBar style="light" /></SafeAreaView>;
}

function renderIntroductionText(section: string) {
  const highlights = /(Digital Twin|Dunia Nyata|Keputusan|Data -> Visualisasi|Dunia Nyata -> Data -> Representasi Digital -> Integrasi -> Analisis -> Pemahaman -> Keputusan -> Tindakan -> Pembelajaran|Sensing -> Understanding -> Acting -> Learning|Decision -> Entity -> Data -> Update -> Responsibility|Teknologi adalah enabler, bukan titik awal dan bukan tujuan akhir Digital Twin\.|Tujuannya adalah memahami agar dapat bertindak\.)/g;
  return section.split(highlights).map((part, index) => index % 2 === 1 ? <Text key={`${part}-${index}`} style={{ color: colors.cyan, fontWeight: '800' }}>{part}</Text> : part);
}

function IntroductionModal({ visible, close }: { visible: boolean; close: () => void }) {
  const sections = introductionText.split('\n\n');
  const headings = new Set(['Ketika Data Ada, tetapi Pemahaman Belum Terhubung', 'Digital Twin Bukan Sekadar Model 3D', 'Masalah yang Ingin Dijawab', 'Dari Data Menuju Pemahaman', 'Dari Technology-Driven Menjadi Decision-Driven', 'Mengapa Kita Membutuhkan Fondasi Digital Twin?', 'Dari Indonesia yang Memiliki Banyak Data Menuju Indonesia yang Mampu Memahami Datanya']);
  return <Modal visible={visible} animationType="slide" onRequestClose={close}><SafeAreaView style={styles.detailScreen}><View style={styles.detailHeader}><Pressable onPress={close} style={styles.backCircle}><Text style={styles.backCircleText}>‹</Text></Pressable><Text style={styles.detailHeaderLabel}>PENDAHULUAN</Text><Text style={styles.detailIndex}>00</Text></View><ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 48 }}>{sections.map((section, index) => headings.has(section) ? <Text key={index} style={[styles.sectionTitle, { color: colors.text, marginTop: index === 0 ? 0 : 22, marginBottom: 8 }]}>{section}</Text> : <Text key={index} style={[styles.detailCopy, { marginTop: index === 0 ? 0 : 12, textAlign: 'justify' }]}>{renderIntroductionText(section)}</Text>)}</ScrollView></SafeAreaView></Modal>;
}

function FundamentalPrinciplesModal({ visible, close }: { visible: boolean; close: () => void }) {
  const sections = fundamentalPrinciplesText.split('\n\n');
  return <Modal visible={visible} animationType="slide" onRequestClose={close}><SafeAreaView style={styles.detailScreen}><View style={styles.detailHeader}><Pressable onPress={close} style={styles.backCircle}><Text style={styles.backCircleText}>‹</Text></Pressable><Text style={styles.detailHeaderLabel}>BAB 2</Text><Text style={styles.detailIndex}>02</Text></View><ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 48 }}>{sections.map((section, index) => <Text key={index} style={[styles.detailCopy, { marginTop: index === 0 ? 0 : 12, textAlign: 'justify' }]}>{section}</Text>)}</ScrollView></SafeAreaView></Modal>;
}

function DecisionDrivenModal({ visible, close }: { visible: boolean; close: () => void }) {
  const sections = decisionDrivenText.split('\n\n');
  return <Modal visible={visible} animationType="slide" onRequestClose={close}><SafeAreaView style={styles.detailScreen}><View style={styles.detailHeader}><Pressable onPress={close} style={styles.backCircle}><Text style={styles.backCircleText}>‹</Text></Pressable><Text style={styles.detailHeaderLabel}>BAB 3</Text><Text style={styles.detailIndex}>03</Text></View><ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 48 }}>{sections.map((section, index) => <Text key={index} style={[styles.detailCopy, { marginTop: index === 0 ? 0 : 12, textAlign: 'justify' }]}>{section}</Text>)}</ScrollView></SafeAreaView></Modal>;
}

function ExtendedChapterModal({ chapter, close }: { chapter: typeof extendedChapters[number]; close: () => void }) {
  return <Modal visible animationType="slide" onRequestClose={close}><SafeAreaView style={styles.detailScreen}><View style={styles.detailHeader}><Pressable onPress={close} style={styles.backCircle}><Text style={styles.backCircleText}>‹</Text></Pressable><Text style={styles.detailHeaderLabel}>{`BAB ${chapter.number}`}</Text><Text style={styles.detailIndex}>{String(chapter.number).padStart(2, '0')}</Text></View><ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 48 }}><Text style={styles.detailTitle}>{chapter.title}</Text><Text style={[styles.detailCopy, { marginTop: 10 }]}>Bab ini menjadi bagian dari peta pembelajaran Digital Twin Indonesia.</Text>{chapter.sections.map((section) => <View key={section} style={{ marginTop: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#2c6688' }}><Text style={[styles.sectionTitle, { color: colors.text, fontSize: 17, lineHeight: 23 }]}>{section}</Text></View>)}</ScrollView></SafeAreaView></Modal>;
}

function ProjectDashboard({ openProject }: { openProject: (projectId: string) => void }) {
  return <ScrollView contentContainerStyle={styles.content}>
    <View style={{ padding: 22, borderRadius: 26, backgroundColor: '#050f26', borderWidth: 1, borderColor: '#4b8db5', marginBottom: 18, overflow: 'hidden' }}>
      <Text style={{ color: colors.cyan, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 }}>DIGITAL TWIN COMMAND CENTER</Text>
      <Text style={{ color: colors.text, fontSize: 28, lineHeight: 32, fontWeight: '800', marginTop: 12 }}>Project DT</Text>
      <Text style={{ color: '#a9c9dc', fontSize: 12, lineHeight: 19, marginTop: 8 }}>Pantau aset fasilitas Indonesia melalui model digital, telemetry IoT, dan insight pemeliharaan.</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 18 }}><View style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: '#123052', borderWidth: 1, borderColor: '#28648a' }}><Text style={{ color: colors.cyan, fontSize: 18, fontWeight: '900' }}>04</Text><Text style={{ color: '#a9c9dc', fontSize: 9, marginTop: 3 }}>FACILITIES</Text></View><View style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: '#123052', borderWidth: 1, borderColor: '#28648a' }}><Text style={{ color: '#6ff0bb', fontSize: 18, fontWeight: '900' }}>92%</Text><Text style={{ color: '#a9c9dc', fontSize: 9, marginTop: 3 }}>AVG HEALTH</Text></View><View style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: '#123052', borderWidth: 1, borderColor: '#28648a' }}><Text style={{ color: '#ffb36b', fontSize: 18, fontWeight: '900' }}>07</Text><Text style={{ color: '#a9c9dc', fontSize: 9, marginTop: 3 }}>ALERTS</Text></View></View>
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}><View><Text style={styles.sectionEyebrow}>PORTFOLIO OVERVIEW</Text><Text style={[styles.sectionTitle, { color: '#082d50', marginTop: 5 }]}>Facility digital twins</Text></View><Text style={{ color: colors.blue, fontSize: 10, fontWeight: '900' }}>LIVE SYNC  •  09:42</Text></View>
    {projectFacilities.map((project) => <Pressable key={project.id} onPress={() => openProject(project.id)} style={{ marginTop: 14, borderRadius: 20, overflow: 'hidden', backgroundColor: '#071a30', borderWidth: 1, borderColor: '#2c6688' }}><ZoomableMediaImage source={project.image} style={{ width: '100%', height: 112 }} resizeMode="cover" imageStyle={{ opacity: 0.75 }} /><View style={{ padding: 15 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><View><Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{project.name}</Text><Text style={{ color: '#a9c9dc', fontSize: 11, marginTop: 4 }}>{project.type}</Text></View><View style={{ alignItems: 'flex-end' }}><Text style={{ color: '#6ff0bb', fontSize: 11, fontWeight: '900' }}>● {project.status}</Text><Text style={{ color: colors.cyan, fontSize: 20, fontWeight: '900', marginTop: 4 }}>{project.health}%</Text></View></View><View style={{ height: 5, borderRadius: 4, backgroundColor: '#173c58', marginTop: 13, overflow: 'hidden' }}><View style={{ width: `${project.health}%`, height: '100%', backgroundColor: '#55e6c1' }} /></View><Text style={{ color: '#ffb36b', fontSize: 11, fontWeight: '800', marginTop: 10 }}>{project.issue}</Text><Text style={{ color: '#a9c9dc', fontSize: 10, marginTop: 5 }}>Systems: {project.focus}</Text></View></Pressable>)}
    <View style={{ marginTop: 22, padding: 17, borderRadius: 20, backgroundColor: '#071a30', borderWidth: 1, borderColor: '#2c6688' }}><Text style={{ color: colors.cyan, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 }}>MAINTENANCE OPERATIONS</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>{['Maintenance Planning', 'Predictive Maintenance', 'Preventive Maintenance', 'Reactive Maintenance'].map((label, index) => <View key={label} style={{ width: '48%', padding: 12, borderRadius: 13, backgroundColor: index === 3 ? '#572842' : '#123052', borderWidth: 1, borderColor: index === 3 ? '#bd5a72' : '#28648a' }}><Text style={{ color: index === 3 ? '#ffb0b7' : '#a9e8ff', fontSize: 11, fontWeight: '800' }}>{label}</Text><Text style={{ color: '#e5f4ff', fontSize: 17, fontWeight: '900', marginTop: 8 }}>{['18', '94%', '86%', '03'][index]}<Text style={{ color: '#8fb5c9', fontSize: 10 }}>{index === 0 ? ' work orders' : index === 3 ? ' open alerts' : ' health'}</Text></Text></View>)}</View></View>
  </ScrollView>;
}

function ProjectDetail({ project, close }: { project: typeof projectFacilities[number]; close: () => void }) {
  const telemetry = [68, 76, 72, 84, 81, 91, 87, 94];
  const domainCards = [
    { name: 'Building Maintenance', color: '#65e9ff', kpi: '94%', metric: 'Asset health', parameters: 'HVAC • chiller • AHU • cooling tower • ventilation • electrical panels • genset • UPS • lighting • transformer • plumbing • water pump • fire protection • sewage • elevator • escalator • access control • CCTV • BMS • occupancy • indoor air quality • energy • warranty • lifecycle • work orders' },
    { name: 'Infrastructure', color: '#79a8ff', kpi: '87%', metric: 'Service-level KPI', parameters: 'Road • bridge • drainage • parking • utility networks • power distribution • water supply • wastewater • telecom • structural condition • vibration • cracks • temperature • pressure • traffic flow • parking availability • utility consumption • incident alerts • risk map' },
    { name: 'Industrial', color: '#a98bff', kpi: '91%', metric: 'Equipment efficiency', parameters: 'Production equipment • machinery • motor • conveyor • pumps • compressors • SCADA • IoT • temperature • vibration • pressure • humidity • energy • RPM • OEE • downtime • capacity • anomaly detection • root-cause analysis • spare parts • technician deployment • safety • energy optimization' },
    { name: 'Smart City', color: '#55e6c1', kpi: '82%', metric: 'Sustainability score', parameters: '3D city map • buildings • public facilities • roads • transport • utilities • green areas • smart traffic • public lighting • waste • flood monitoring • air quality • weather • CCTV • emergency response • water usage • carbon emission • citizen services • safety alerts • disaster heatmap • district health' },
  ];
  return <ScrollView contentContainerStyle={styles.content}><Pressable onPress={close} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 }}><Text style={{ color: colors.blue, fontSize: 22 }}>‹</Text><Text style={{ color: colors.blue, fontWeight: '800' }}>Kembali ke Project DT</Text></Pressable><View style={{ padding: 20, borderRadius: 24, backgroundColor: '#071a30', borderWidth: 1, borderColor: '#2c6688' }}><Text style={{ color: colors.cyan, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 }}>DIGITAL TWIN / LIVE FACILITY</Text><Text style={{ color: colors.text, fontSize: 27, lineHeight: 31, fontWeight: '800', marginTop: 10 }}>{project.name}</Text><Text style={{ color: '#a9c9dc', fontSize: 12, marginTop: 5 }}>{project.type}  •  {project.status}</Text><View style={{ marginTop: 18, height: 145, borderRadius: 17, backgroundColor: '#0c2b48', borderWidth: 1, borderColor: '#28648a', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}><View style={{ width: 150, height: 88, borderWidth: 2, borderColor: colors.cyan, transform: [{ skewX: '-12deg' }], backgroundColor: '#12486a99' }} /><Text style={{ position: 'absolute', color: '#8ff4ff', fontSize: 10, letterSpacing: 2 }}>3D TWIN MODEL  •  ACTIVE</Text><Text style={{ position: 'absolute', top: 14, right: 14, color: '#6ff0bb', fontSize: 10 }}>● IoT CONNECTED</Text></View></View><View style={{ marginTop: 18, flexDirection: 'row', gap: 8 }}><View style={{ flex: 1, padding: 15, borderRadius: 16, backgroundColor: '#f1fbff', borderWidth: 1, borderColor: '#9acfe3' }}><Text style={{ color: colors.blue, fontSize: 10, fontWeight: '900' }}>ASSET HEALTH</Text><Text style={{ color: '#082d50', fontSize: 25, fontWeight: '900', marginTop: 7 }}>{project.health}%</Text></View><View style={{ flex: 1, padding: 15, borderRadius: 16, backgroundColor: '#f1fbff', borderWidth: 1, borderColor: '#9acfe3' }}><Text style={{ color: colors.blue, fontSize: 10, fontWeight: '900' }}>RUL ESTIMATE</Text><Text style={{ color: '#082d50', fontSize: 25, fontWeight: '900', marginTop: 7 }}>128d</Text></View></View><Text style={[styles.sectionTitle, { color: '#082d50', marginTop: 24 }]}>Maintenance intelligence</Text>{[['Maintenance Planning', '18 work orders', 'Next inspection 14:30'], ['Predictive Maintenance', '94% confidence', 'No critical anomaly'], ['Preventive Maintenance', '86% compliance', '12 assets in cycle'], ['Reactive Maintenance', '03 open tickets', 'Average response 18 min']].map(([label, value, copy], index) => <View key={label} style={{ marginTop: 10, padding: 15, borderRadius: 16, backgroundColor: index === 3 ? '#fff1f2' : '#f1fbff', borderWidth: 1, borderColor: index === 3 ? '#e6a8b2' : '#9acfe3' }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: '#082d50', fontWeight: '900', fontSize: 13 }}>{label}</Text><Text style={{ color: index === 3 ? '#b63a50' : colors.blue, fontWeight: '900', fontSize: 12 }}>{value}</Text></View><Text style={{ color: '#47718a', fontSize: 11, marginTop: 6 }}>{copy}</Text></View>)}<Text style={[styles.sectionTitle, { color: '#082d50', marginTop: 24 }]}>Live telemetry</Text><View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 90, gap: 7, padding: 14, borderRadius: 16, backgroundColor: '#071a30' }}>{telemetry.map((value, index) => <View key={index} style={{ flex: 1, height: `${value}%`, minHeight: 18, borderRadius: 4, backgroundColor: index > 5 ? colors.cyan : '#277ba5' }} />)}</View></ScrollView>;
}

function ProjectCommandCenter({ openProject }: { openProject: (projectId: string) => void }) {
  const domains = [
    ['Building', '#65e9ff', 'HVAC, chiller, AHU, electrical, plumbing, fire protection, elevators, BMS, IAQ, energy, lifecycle'],
    ['Infrastructure', '#79a8ff', 'Road, bridge, drainage, parking, utilities, structural monitoring, traffic, risk map, service KPI'],
    ['Industrial', '#a98bff', 'Machinery, motors, pumps, compressors, SCADA, vibration, pressure, OEE, downtime, RUL, safety'],
    ['Smart City', '#55e6c1', '3D city map, traffic, lighting, waste, flood, air quality, weather, CCTV, carbon, citizen services'],
  ];
  return <ScrollView contentContainerStyle={styles.content}><View style={{ padding: 22, borderRadius: 26, backgroundColor: '#050f26', borderWidth: 1, borderColor: '#4b8db5', marginBottom: 18 }}><Text style={{ color: colors.cyan, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 }}>DIGITAL TWIN COMMAND CENTER</Text><Text style={{ color: colors.text, fontSize: 28, lineHeight: 32, fontWeight: '800', marginTop: 12 }}>Unified facility intelligence.</Text><Text style={{ color: '#a9c9dc', fontSize: 12, lineHeight: 19, marginTop: 8 }}>Building, Infrastructure, Industrial, dan Smart City terhubung dalam satu ekosistem Digital Twin.</Text><View style={{ marginTop: 18, height: 150, borderRadius: 17, backgroundColor: '#0c2b48', borderWidth: 1, borderColor: '#28648a', justifyContent: 'center', alignItems: 'center' }}><View style={{ width: 150, height: 84, borderWidth: 2, borderColor: colors.cyan, transform: [{ skewX: '-12deg' }], backgroundColor: '#12486a99' }} /><View style={{ position: 'absolute', width: 230, height: 1, backgroundColor: colors.cyan, transform: [{ rotate: '-14deg' }] }} /><Text style={{ position: 'absolute', color: '#8ff4ff', fontSize: 10, letterSpacing: 2 }}>3D DIGITAL TWIN  •  ALL DOMAINS CONNECTED</Text><Text style={{ position: 'absolute', top: 14, right: 14, color: '#6ff0bb', fontSize: 10 }}>● 248 SENSOR NODES</Text></View><View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>{[['FACILITIES', '04'], ['HEALTH', '92%'], ['ALERTS', '07']].map(([label, value]) => <View key={label} style={{ flex: 1, padding: 11, borderRadius: 13, backgroundColor: '#123052' }}><Text style={{ color: colors.cyan, fontSize: 18, fontWeight: '900' }}>{value}</Text><Text style={{ color: '#a9c9dc', fontSize: 9, marginTop: 3 }}>{label}</Text></View>)}</View></View><Text style={[styles.sectionTitle, { color: '#082d50' }]}>Integrated asset domains</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 10 }}>{domains.map(([name, color, parameters]) => <View key={name} style={{ width: '48%', padding: 13, borderRadius: 16, backgroundColor: '#071a30', borderWidth: 1, borderColor: `${color}88` }}><Text style={{ color, fontSize: 13, fontWeight: '900' }}>{name}</Text><Text style={{ color: '#c8e8f5', fontSize: 9, lineHeight: 15, marginTop: 8 }}>{parameters}</Text><Text style={{ color: '#8fb5c9', fontSize: 9, marginTop: 9 }}>EXPANDABLE ZONE  ↗</Text></View>)}</View><Text style={[styles.sectionTitle, { color: '#082d50', marginTop: 24 }]}>Portfolio overview</Text>{projectFacilities.map((project) => <Pressable key={project.id} onPress={() => openProject(project.id)} style={{ marginTop: 12, borderRadius: 18, overflow: 'hidden', backgroundColor: '#071a30', borderWidth: 1, borderColor: '#2c6688' }}><Image source={project.image} resizeMode="cover" style={{ width: '100%', height: 96, opacity: 0.72 }} /><View style={{ padding: 14, flexDirection: 'row', justifyContent: 'space-between' }}><View><Text style={{ color: colors.text, fontSize: 17, fontWeight: '800' }}>{project.name}</Text><Text style={{ color: '#a9c9dc', fontSize: 10, marginTop: 4 }}>{project.type}  •  {project.focus}</Text></View><View style={{ alignItems: 'flex-end' }}><Text style={{ color: '#6ff0bb', fontSize: 10, fontWeight: '900' }}>● {project.status}</Text><Text style={{ color: colors.cyan, fontSize: 18, fontWeight: '900', marginTop: 5 }}>{project.health}%</Text></View></View></Pressable>)}<View style={{ marginTop: 22, padding: 16, borderRadius: 18, backgroundColor: '#071a30', borderWidth: 1, borderColor: '#2c6688' }}><Text style={{ color: colors.cyan, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 }}>MAINTENANCE INTELLIGENCE</Text>{['Maintenance Planning', 'Predictive Maintenance', 'Preventive Maintenance', 'Reactive Maintenance'].map((label, index) => <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: index === 3 ? 0 : 1, borderBottomColor: '#214b68' }}><Text style={{ color: '#c8e8f5', fontSize: 11, fontWeight: '800' }}>{label}</Text><Text style={{ color: index === 3 ? '#ffb0b7' : '#6ff0bb', fontSize: 11, fontWeight: '900' }}>{['18 work orders', '94% confidence', '86% compliance', '03 open tickets'][index]}</Text></View>)}</View></ScrollView>;
}

function IsometricFacilityVisual({ project, seed }: { project: typeof projectFacilities[number]; seed: number }) {
  const motion = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(motion, { toValue: 1, duration: 2200 + seed * 180, useNativeDriver: true }),
      Animated.timing(motion, { toValue: 0, duration: 1700 + seed * 130, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [motion, seed]);
  const dataFlow = { opacity: motion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 0.75, 0.22] }), transform: [{ translateX: motion.interpolate({ inputRange: [0, 1], outputRange: [-55, 62] }) }] };
  const floors = seed === 3 ? 3 : seed === 2 ? 5 : 6;
  return <View style={{ height: 126, marginTop: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: '#06152d', borderWidth: 1, borderColor: '#28648a' }}><View style={{ position: 'absolute', left: 12, right: 12, bottom: 15, height: 1, backgroundColor: '#65e9ff55' }} /><View style={{ position: 'absolute', left: 25, right: 25, bottom: 27, height: 1, backgroundColor: '#65e9ff33', transform: [{ rotate: '-12deg' }] }} /><View style={{ position: 'absolute', left: 50, bottom: 25, width: 112, height: 70, backgroundColor: '#0c4665', borderWidth: 1, borderColor: '#65e9ff99', transform: [{ skewY: '-25deg' }] }} /><View style={{ position: 'absolute', left: 71, bottom: 25, width: 112, height: 70, backgroundColor: '#0b3454', borderWidth: 1, borderColor: '#4a8ed0aa', transform: [{ skewY: '25deg' }] }} /><View style={{ position: 'absolute', left: 81, bottom: 25, width: 78, height: 72, backgroundColor: '#123e5b', borderWidth: 1, borderColor: '#8ff4ff88', transform: [{ skewY: '-25deg' }] }}>{Array.from({ length: floors }).map((_, index) => <View key={index} style={{ height: 10, marginTop: index * 1, borderBottomWidth: 1, borderBottomColor: index % 2 === 0 ? '#65e9ff88' : '#a98bff66' }} />)}</View><View style={{ position: 'absolute', left: 125, bottom: 95, width: 5, height: 22, backgroundColor: '#8ff4ff', shadowColor: '#65e9ff', shadowOpacity: 0.9, shadowRadius: 8 }} /><Animated.View style={[{ position: 'absolute', top: 18, left: 88, width: 34, height: 2, backgroundColor: '#8ff4ff', shadowColor: '#65e9ff', shadowRadius: 8 }, dataFlow]} /><View style={{ position: 'absolute', right: 15, top: 14, padding: 7, borderRadius: 9, backgroundColor: '#0b3155dd', borderWidth: 1, borderColor: '#397694' }}><Text style={{ color: colors.cyan, fontSize: 9, fontWeight: '900' }}>{project.name}</Text><Text style={{ color: '#6ff0bb', fontSize: 9, marginTop: 3 }}>● {project.health}% HEALTH</Text></View><View style={{ position: 'absolute', left: 18, top: 17, flexDirection: 'row', gap: 4 }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#6ff0bb' }} /><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#65e9ff' }} /><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#ffb36b' }} /></View></View>;
}

function ProjectMaintenanceParameters({ maintenance }: { maintenance?: MaintenanceParameters }) {
  const safeMaintenance = maintenance ?? { planning: 'Data belum tersedia', predictive: 'Data belum tersedia', preventive: 'Data belum tersedia', reactive: 'Data belum tersedia' };
  const items = [['MAINTENANCE PLANNING', safeMaintenance.planning], ['PREDICTIVE MAINTENANCE', safeMaintenance.predictive], ['PREVENTIVE MAINTENANCE', safeMaintenance.preventive], ['REACTIVE MAINTENANCE', safeMaintenance.reactive]];
  return <View style={{ marginTop: 10, padding: 12, borderRadius: 14, backgroundColor: '#050f26', borderWidth: 1, borderColor: '#28648a' }}>{items.map(([label, value], index) => <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, paddingVertical: 7, borderBottomWidth: index === items.length - 1 ? 0 : 1, borderBottomColor: '#214b68' }}><Text style={{ flex: 1, color: index === 3 ? '#ffb0b7' : '#a9e8ff', fontSize: 9, fontWeight: '900' }}>{label}</Text><Text style={{ flex: 1, color: '#c8e8f5', fontSize: 9, textAlign: 'right' }}>{value}</Text></View>)}</View>;
}

function ProjectRibbonDashboard({ openProject }: { openProject: (projectId: string) => void }) {
  const [projects, setProjects] = useState(projectFacilities);
  const [syncStatus, setSyncStatus] = useState('LOCAL FALLBACK');
  useEffect(() => {
    let active = true;
    Promise.allSettled([fetchAPSFacilities(), fetchACCProjects(), fetchIdtcBootstrap()]).then(([apsResult, accResult, bootstrapResult]) => {
      const remoteProjects = apsResult.status === 'fulfilled' ? apsResult.value : [];
      const accProjects = accResult.status === 'fulfilled' ? accResult.value : [];
      const bootstrap = bootstrapResult.status === 'fulfilled' ? bootstrapResult.value : null;
      if (!active || (remoteProjects.length === 0 && accProjects.length === 0 && !bootstrap)) return;
      const backendProjects: APSFacilityProject[] = (bootstrap?.projects ?? []).map((project) => ({
        id: project.slug,
        name: project.name,
        type: project.facility_type ?? 'Digital Twin Facility',
        status: project.status,
        health: project.health_score ?? 0,
        issue: 'Content managed by IDTC',
        focus: project.description ?? 'APS / ACC integrated project',
        apsProjectId: project.aps_project_id,
        apsHubId: project.aps_hub_id,
        modelUrn: project.model_urn,
        updatedAt: project.updated_at,
      }));
      const combinedProjects = [...remoteProjects, ...accProjects, ...backendProjects];
      setProjects((current) => {
        const currentById = new Map(current.map((project) => [project.id, project]));
        const merged = combinedProjects.map((remote: APSFacilityProject) => ({ ...(currentById.get(remote.id) ?? current[0]), ...remote, image: currentById.get(remote.id)?.image ?? current[0].image }));
        return merged.length > 0 ? merged : current;
      });
      setSyncStatus(bootstrap ? 'IDTC + APS + ACC LIVE' : accProjects.length > 0 ? 'APS + ACC LIVE' : 'APS API LIVE');
    }).catch(() => setSyncStatus('LOCAL FALLBACK'));
    return () => { active = false; };
  }, []);
  return <ScrollView contentContainerStyle={styles.content}>
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.sectionEyebrow}>PROJECT DT / PORTFOLIO</Text>
      <Text style={[styles.sectionTitle, { color: '#082d50', marginTop: 5 }]}>Portfolio project</Text><Text style={{ color: colors.blue, fontSize: 9, fontWeight: '900', marginTop: 4 }}>{syncStatus}  •  Autodesk Platform Services</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 12 }}>
        {projects.map((project, index) => <Pressable key={project.id} onPress={() => openProject(project.id)} style={{ minWidth: 148, padding: 13, borderRadius: 15, backgroundColor: '#071a30', borderWidth: 1, borderColor: index === 0 ? colors.cyan : '#397694' }}><Text style={{ color: index === 0 ? colors.cyan : '#8ff4ff', fontSize: 10, fontWeight: '900' }}>0{index + 1} / FACILITY</Text><Text numberOfLines={1} style={{ color: colors.text, fontSize: 13, fontWeight: '800', marginTop: 8 }}>{project.name}</Text><Text style={{ color: '#6ff0bb', fontSize: 10, fontWeight: '800', marginTop: 7 }}>● {project.health}% health</Text></Pressable>)}
      </ScrollView>
    </View>
    <View style={{ padding: 20, borderRadius: 24, backgroundColor: '#050f26', borderWidth: 1, borderColor: '#4b8db5', marginBottom: 18 }}><Text style={{ color: colors.cyan, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 }}>DIGITAL TWIN COMMAND CENTER</Text><Text style={{ color: colors.text, fontSize: 27, lineHeight: 31, fontWeight: '800', marginTop: 10 }}>Unified facility intelligence.</Text><View style={{ height: 138, marginTop: 17, borderRadius: 16, backgroundColor: '#0c2b48', borderWidth: 1, borderColor: '#28648a', justifyContent: 'center', alignItems: 'center' }}><View style={{ width: 145, height: 78, borderWidth: 2, borderColor: colors.cyan, transform: [{ skewX: '-12deg' }], backgroundColor: '#12486a99' }} /><View style={{ position: 'absolute', width: 220, height: 1, backgroundColor: colors.cyan, transform: [{ rotate: '-14deg' }] }} /><Text style={{ position: 'absolute', color: '#8ff4ff', fontSize: 10, letterSpacing: 1.5 }}>3D DIGITAL TWIN  •  LIVE</Text></View><View style={{ flexDirection: 'row', gap: 8, marginTop: 13 }}>{[['FACILITIES', '04'], ['HEALTH', '92%'], ['ALERTS', '07']].map(([label, value]) => <View key={label} style={{ flex: 1, padding: 10, borderRadius: 12, backgroundColor: '#123052' }}><Text style={{ color: colors.cyan, fontSize: 17, fontWeight: '900' }}>{value}</Text><Text style={{ color: '#a9c9dc', fontSize: 8, marginTop: 3 }}>{label}</Text></View>)}</View></View>
    <Text style={[styles.sectionTitle, { color: '#082d50' }]}>Project list</Text>
    <View style={{ marginTop: 10, gap: 10 }}>{projects.map((project, index) => <Pressable key={project.id} onPress={() => openProject(project.id)} style={{ padding: 12, borderRadius: 16, backgroundColor: '#071a30', borderWidth: 1, borderColor: '#2c6688' }}><View style={{ flexDirection: 'row', alignItems: 'center' }}><Text style={{ color: colors.cyan, fontSize: 11, fontWeight: '900', width: 28 }}>0{index + 1}</Text><View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 13, fontWeight: '800' }}>{project.name}</Text><Text style={{ color: '#a9c9dc', fontSize: 10, marginTop: 3 }}>{project.type}  •  {project.accStatus ?? 'Facility data'}</Text></View><Text style={{ color: '#6ff0bb', fontSize: 11, fontWeight: '900' }}>{project.health}%</Text><Text style={{ color: colors.cyan, fontSize: 18, marginLeft: 9 }}>›</Text></View><ZoomableMediaImage source={project.image} style={{ width: '100%', height: 96, marginTop: 10, borderRadius: 12, overflow: 'hidden' }} resizeMode="cover" imageStyle={{ opacity: 0.72 }} /><View style={{ flexDirection: 'row', gap: 12, marginTop: 9 }}><Text style={{ color: '#8ff4ff', fontSize: 9 }}>DOCS {project.documentCount ?? 0}</Text><Text style={{ color: '#ffb36b', fontSize: 9 }}>ISSUES {project.openIssueCount ?? 0}</Text><Text style={{ color: '#6ff0bb', fontSize: 9 }}>WO {project.openWorkOrderCount ?? 0}</Text></View><ProjectMaintenanceParameters maintenance={project.maintenance} /></Pressable>)}</View>
    <View style={{ marginTop: 20, padding: 16, borderRadius: 18, backgroundColor: '#071a30', borderWidth: 1, borderColor: '#2c6688' }}><Text style={{ color: colors.cyan, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 }}>MAINTENANCE INTELLIGENCE</Text>{['Maintenance Planning', 'Predictive Maintenance', 'Preventive Maintenance', 'Reactive Maintenance'].map((label, index) => <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: index === 3 ? 0 : 1, borderBottomColor: '#214b68' }}><Text style={{ color: '#c8e8f5', fontSize: 11, fontWeight: '800' }}>{label}</Text><Text style={{ color: index === 3 ? '#ffb0b7' : '#6ff0bb', fontSize: 11, fontWeight: '900' }}>{['18 work orders', '94% confidence', '86% compliance', '03 open tickets'][index]}</Text></View>)}</View>
  </ScrollView>;
}

function ProjectDetailWithDomains({ project, close }: { project: typeof projectFacilities[number]; close: () => void }) {
  const domainCards = [
    ['Building Maintenance', '#65e9ff', '94%', 'HVAC, chiller, AHU, electrical, plumbing, fire protection, elevators, BMS, occupancy, IAQ, energy, warranty, lifecycle, work orders'],
    ['Infrastructure', '#79a8ff', '87%', 'Road, bridge, drainage, parking, utilities, power, water, wastewater, telecom, vibration, cracks, traffic, incidents, risk map'],
    ['Industrial', '#a98bff', '91%', 'Production equipment, motors, conveyors, pumps, compressors, SCADA, IoT, temperature, vibration, pressure, RPM, OEE, downtime, RUL, spare parts'],
    ['Smart City', '#55e6c1', '82%', '3D city map, buildings, roads, transport, utilities, green areas, traffic, lighting, waste, flood, air quality, weather, CCTV, carbon, safety alerts'],
  ];
  const bars = [42, 65, 52, 78, 61, 84, 73, 92];
  return <ScrollView contentContainerStyle={styles.content}><Pressable onPress={close} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 }}><Text style={{ color: colors.blue, fontSize: 22 }}>‹</Text><Text style={{ color: colors.blue, fontWeight: '800' }}>Kembali ke Project DT</Text></Pressable><View style={{ padding: 20, borderRadius: 24, backgroundColor: '#050f26', borderWidth: 1, borderColor: '#4b8db5' }}><Text style={{ color: colors.cyan, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 }}>DIGITAL TWIN COMMAND CENTER</Text><Text style={{ color: colors.text, fontSize: 27, lineHeight: 31, fontWeight: '800', marginTop: 10 }}>{project.name}</Text><Text style={{ color: '#a9c9dc', fontSize: 12, marginTop: 5 }}>{project.type}  •  {project.status}</Text><View style={{ marginTop: 18, height: 155, borderRadius: 17, backgroundColor: '#0c2b48', borderWidth: 1, borderColor: '#28648a', justifyContent: 'center', alignItems: 'center' }}><View style={{ width: 156, height: 90, borderWidth: 2, borderColor: colors.cyan, transform: [{ skewX: '-12deg' }], backgroundColor: '#12486a99' }} /><View style={{ position: 'absolute', width: 210, height: 1, backgroundColor: colors.cyan, opacity: 0.7, transform: [{ rotate: '-14deg' }] }} /><Text style={{ position: 'absolute', color: '#8ff4ff', fontSize: 10, letterSpacing: 2 }}>3D TWIN MODEL  •  ACTIVE</Text><Text style={{ position: 'absolute', top: 14, right: 14, color: '#6ff0bb', fontSize: 10 }}>● LIVE IOT STREAM</Text></View></View><View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>{[['ASSET HEALTH', `${project.health}%`], ['RUL ESTIMATE', '128d'], ['LIVE NODES', '248']].map(([label, value]) => <View key={label} style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: '#f1fbff', borderWidth: 1, borderColor: '#9acfe3' }}><Text style={{ color: colors.blue, fontSize: 9, fontWeight: '900' }}>{label}</Text><Text style={{ color: '#082d50', fontSize: 20, fontWeight: '900', marginTop: 6 }}>{value}</Text></View>)}</View><Text style={[styles.sectionTitle, { color: '#082d50', marginTop: 24 }]}>Integrated asset domains</Text>{domainCards.map(([name, color, kpi, parameters]) => <View key={name} style={{ marginTop: 10, padding: 15, borderRadius: 17, backgroundColor: '#071a30', borderWidth: 1, borderColor: `${color}88` }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ color, fontSize: 13, fontWeight: '900' }}>{name}</Text><Text style={{ color: '#e5f4ff', fontSize: 17, fontWeight: '900' }}>{kpi}</Text></View><Text style={{ color: '#8fb5c9', fontSize: 10, marginTop: 3 }}>Integrated parameters</Text><Text style={{ color: '#c8e8f5', fontSize: 10, lineHeight: 17, marginTop: 10 }}>{parameters}</Text></View>)}<Text style={[styles.sectionTitle, { color: '#082d50', marginTop: 24 }]}>Maintenance intelligence</Text>{[['Maintenance Planning', '18 work orders', 'Annual plan • monthly schedule • critical asset priority • budget • workforce'], ['Predictive Maintenance', '94% confidence', 'Failure probability • RUL • condition-based maintenance • anomaly alerts'], ['Preventive Maintenance', '86% compliance', 'Checklist progress • recurring work orders • maintenance cycle'], ['Reactive Maintenance', '03 open tickets', 'Fault alarm • escalation • response time • repair SLA • resolution']].map(([label, value, copy], index) => <View key={label} style={{ marginTop: 10, padding: 15, borderRadius: 16, backgroundColor: index === 3 ? '#572842' : '#071a30', borderWidth: 1, borderColor: index === 3 ? '#bd5a72' : '#28648a' }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: index === 3 ? '#ffb0b7' : '#a9e8ff', fontWeight: '900', fontSize: 13 }}>{label}</Text><Text style={{ color: index === 3 ? '#ffb0b7' : colors.cyan, fontWeight: '900', fontSize: 12 }}>{value}</Text></View><Text style={{ color: '#a9c9dc', fontSize: 10, lineHeight: 16, marginTop: 6 }}>{copy}</Text></View>)}<Text style={[styles.sectionTitle, { color: '#082d50', marginTop: 24 }]}>Live telemetry & health heatmap</Text><View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 90, gap: 7, padding: 14, borderRadius: 16, backgroundColor: '#071a30' }}>{bars.map((value, index) => <View key={index} style={{ flex: 1, height: `${value}%`, minHeight: 18, borderRadius: 4, backgroundColor: index > 5 ? colors.cyan : '#277ba5' }} />)}</View></ScrollView>;
}

function RegulationPolicy() {
  const principles = ['Keandalan dan kualitas data', 'Keamanan siber serta perlindungan data pribadi', 'Interoperabilitas antarperangkat dan vendor', 'Keterlacakan keputusan, alarm, dan work order', 'Kepatuhan teknis bangunan, tata ruang, K3, dan izin operasional', 'Dukungan untuk Maintenance Planning, Predictive, Preventive, dan Reactive Maintenance'];
  const locationLayers = ['RTRW dan RDTR daerah', 'Zonasi, KDB, KLB, KDH, KTB, ketinggian, GSB, dan sempadan', 'Akses, parkir, utilitas, drainase, ruang terbuka hijau, dan mitigasi banjir', 'PBG, SLF, dokumen lingkungan, dan rekomendasi instansi teknis', 'Perda/Perkada bangunan gedung pada lokasi aset', 'Aturan kawasan strategis, cagar budaya, bandara, pesisir, stadion, dan kawasan kesehatan'];
  const policies = ['Kepemilikan data: owner tetap memiliki model BIM, aset, histori maintenance, dan sensor.', 'Common Data Environment: model, drawing, dokumen, inspeksi, work order, dan as-built memiliki versi serta approval.', 'Klasifikasi data: Publik, Internal, Rahasia, dan Kritis.', 'Akses berbasis peran: Owner, Facility Manager, Engineer, Teknisi, Vendor, Auditor, dan Viewer.', 'Integritas sensor: ID aset, lokasi, jenis data, satuan, interval, kalibrasi, dan ambang alarm.', 'Maintenance berbasis risiko: criticality, keselamatan, layanan, probabilitas kegagalan, dan biaya siklus hidup.', 'Audit trail: alarm, work order, approval, perubahan setpoint BAS, dan bukti penyelesaian.', 'Keamanan OT/IoT: segmentasi BAS/SCADA, MFA, enkripsi, patch, backup, dan uji respons insiden.', 'Interoperabilitas: API terdokumentasi, ekspor terbuka, ID aset konsisten, dan anti vendor lock-in.', 'Retensi data: aturan penyimpanan, penghapusan, dan anonimisasi CCTV, sensor, teknisi, pengunjung, serta pasien.'];
  const documentChapters = ['Tujuan dan ruang lingkup', 'Definisi dan arsitektur Digital Twin', 'Standar ISO dan regulasi yang berlaku', 'Tata kelola data, BIM, IoT, BAS, dan CMMS', 'Kepatuhan bangunan, infrastruktur, industri, dan tata ruang', 'Privasi, keamanan siber, dan pengelolaan akses', 'Maintenance Planning, Predictive, Preventive, Reactive Maintenance', 'Audit, pelaporan, KPI, dan penanganan insiden', 'Pengadaan, vendor management, dan hak kekayaan intelektual', 'Evaluasi dan pembaruan regulasi berkala'];
  const Section = ({ label, title, children }: { label: string; title: string; children: ReactNode }) => <View style={{ marginTop: 24 }}><Text style={styles.sectionEyebrow}>{label}</Text><Text style={[styles.sectionTitle, { color: '#082d50', marginTop: 5 }]}>{title}</Text>{children}</View>;
  return <ScrollView contentContainerStyle={styles.content}><View style={{ padding: 22, borderRadius: 25, backgroundColor: '#071a30', borderWidth: 1, borderColor: colors.cyan }}><Text style={{ color: colors.cyan, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 }}>REGULATION / GOVERNANCE</Text><Text style={{ color: colors.text, fontSize: 27, lineHeight: 32, fontWeight: '800', marginTop: 11 }}>Tata kelola Digital Twin.</Text><Text style={{ color: '#a9c9dc', fontSize: 12, lineHeight: 19, marginTop: 8 }}>Kerangka kepatuhan, keamanan, interoperabilitas, dan maintenance untuk aset digital yang dapat diaudit.</Text></View><Section label="01 / PRINCIPLES" title="Prinsip regulasi Digital Twin"><View style={{ marginTop: 10 }}>{principles.map((item, index) => <View key={item} style={{ flexDirection: 'row', gap: 11, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#b6d7e5' }}><Text style={{ color: colors.blue, fontWeight: '900', width: 23 }}>{String(index + 1).padStart(2, '0')}</Text><Text style={{ flex: 1, color: '#244d67', fontSize: 12, lineHeight: 18 }}>{item}</Text></View>)}</View></Section><Section label="02 / INTERNATIONAL" title="Standar internasional yang direkomendasikan"><View style={{ marginTop: 10 }}>{regulationStandards.map(([standard, description]) => <View key={standard} style={{ marginTop: 9, padding: 14, borderRadius: 15, backgroundColor: '#f1fbff', borderWidth: 1, borderColor: '#9acfe3' }}><Text style={{ color: colors.blue, fontSize: 13, fontWeight: '900' }}>{standard}</Text><Text style={{ color: '#47718a', fontSize: 11, lineHeight: 17, marginTop: 5 }}>{description}</Text></View>)}</View></Section><Section label="03 / INDONESIA" title="Landasan regulasi Indonesia"><View style={{ marginTop: 10 }}>{regulationAreas.map(([area, regulation, implementation]) => <View key={area} style={{ marginTop: 9, padding: 14, borderRadius: 15, backgroundColor: '#fff', borderWidth: 1, borderColor: '#9acfe3' }}><Text style={{ color: '#082d50', fontSize: 13, fontWeight: '900' }}>{area}</Text><Text style={{ color: colors.blue, fontSize: 11, fontWeight: '800', marginTop: 4 }}>{regulation}</Text><Text style={{ color: '#47718a', fontSize: 11, lineHeight: 17, marginTop: 5 }}>{implementation}</Text></View>)}</View></Section><Section label="04 / LOCATION" title="Lapisan kepatuhan lokasi"><View style={{ marginTop: 10 }}>{locationLayers.map((item, index) => <View key={item} style={{ flexDirection: 'row', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#b6d7e5' }}><Text style={{ color: colors.blue, fontWeight: '900' }}>0{index + 1}</Text><Text style={{ flex: 1, color: '#244d67', fontSize: 12, lineHeight: 18 }}>{item}</Text></View>)}</View><View style={{ marginTop: 14, padding: 14, borderRadius: 15, backgroundColor: '#fff5e8', borderWidth: 1, borderColor: '#e5b36c' }}><Text style={{ color: '#955b12', fontSize: 11, fontWeight: '900' }}>CATATAN LOKASI</Text><Text style={{ color: '#7c5c2f', fontSize: 11, lineHeight: 17, marginTop: 5 }}>Aset DKI Jakarta seperti Gedung MTH 27 Adhi dan GBK perlu verifikasi RDTR, Perda/Perkada, dan ketentuan kawasan setempat. RS Siloam dan RS Hermina harus divalidasi per lokasi rumah sakit.</Text></View></Section><Section label="05 / POLICY" title="Kebijakan minimum yang disarankan"><View style={{ marginTop: 10 }}>{policies.map((item, index) => <View key={item} style={{ flexDirection: 'row', gap: 11, padding: 13, marginTop: 8, borderRadius: 14, backgroundColor: '#f1fbff' }}><Text style={{ color: colors.blue, fontWeight: '900' }}>{String(index + 1).padStart(2, '0')}</Text><Text style={{ flex: 1, color: '#244d67', fontSize: 11, lineHeight: 17 }}>{item}</Text></View>)}</View></Section><Section label="06 / DASHBOARD" title="Parameter kepatuhan"><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>{complianceDashboard.map((item, index) => <View key={item} style={{ width: '48%', minHeight: 56, padding: 11, borderRadius: 13, backgroundColor: index % 4 === 3 ? '#fff1f2' : '#071a30', borderWidth: 1, borderColor: index % 4 === 3 ? '#e6a8b2' : '#28648a' }}><Text style={{ color: index % 4 === 3 ? '#b63a50' : '#c8e8f5', fontSize: 10, lineHeight: 15, fontWeight: '800' }}>{item}</Text><Text style={{ color: index % 4 === 3 ? '#b63a50' : '#6ff0bb', fontSize: 9, fontWeight: '900', marginTop: 7 }}>{index % 3 === 0 ? '92%' : index % 3 === 1 ? 'VALID' : 'MONITORED'}</Text></View>)}</View></Section><Section label="07 / DOCUMENT" title="Struktur dokumen kebijakan"><View style={{ marginTop: 10, padding: 17, borderRadius: 18, backgroundColor: '#071a30', borderWidth: 1, borderColor: '#2c6688' }}><Text style={{ color: colors.cyan, fontSize: 14, fontWeight: '900' }}>Kebijakan Tata Kelola, Kepatuhan, dan Keamanan Platform Digital Twin</Text>{documentChapters.map((chapter, index) => <View key={chapter} style={{ flexDirection: 'row', gap: 10, paddingVertical: 9, borderBottomWidth: index === documentChapters.length - 1 ? 0 : 1, borderBottomColor: '#214b68' }}><Text style={{ color: '#6ff0bb', fontWeight: '900', width: 22 }}>{index + 1}.</Text><Text style={{ flex: 1, color: '#c8e8f5', fontSize: 11 }}>{chapter}</Text></View>)}</View></Section><View style={{ marginTop: 24, padding: 15, borderRadius: 16, backgroundColor: '#fff5e8', borderWidth: 1, borderColor: '#e5b36c' }}><Text style={{ color: '#955b12', fontSize: 11, lineHeight: 17 }}>Kerangka ini bukan pendapat hukum. Sebelum menjadi kebijakan resmi atau dasar perizinan, lakukan legal review dan verifikasi Perda/Perkada pada alamat aset yang spesifik.</Text></View></ScrollView>;
}

function Syllabus({ close }: { close: () => void }) {
  const bulletSection = (label: string, title: string, items: string[]) => <View style={{ marginTop: 24 }}><Text style={styles.sectionEyebrow}>{label}</Text><Text style={styles.sectionTitle}>{title}</Text>{items.map((item, index) => <View key={item} style={{ flexDirection: 'row', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#b6d7e5' }}><Text style={{ color: colors.blue, fontWeight: '900', width: 24 }}>{String(index + 1).padStart(2, '0')}</Text><Text style={{ flex: 1, color: '#244d67', fontSize: 12, lineHeight: 18 }}>{item}</Text></View>)}</View>;
  const competency = [['Konseptual', 'Memahami prinsip, terminologi, dan nilai bisnis Digital Twin'], ['Teknis', 'IoT, pengolahan data, simulasi, basis data, API, visualisasi'], ['Analitik', 'Monitoring, anomaly detection, predictive maintenance, optimasi'], ['Sistem', 'Arsitektur cloud/edge, integrasi sistem, interoperabilitas'], ['Profesional', 'Dokumentasi, keamanan, etika, presentasi, kerja tim']];
  const assessment = [['Kehadiran dan partisipasi', '10%'], ['Kuis/tugas konsep', '10%'], ['Praktikum', '25%'], ['UTS: desain Digital Twin', '20%'], ['Proyek akhir', '25%'], ['Presentasi dan dokumentasi akhir', '10%']];
  const rubric = [['Ketepatan masalah dan nilai solusi', '15%'], ['Kualitas arsitektur', '20%'], ['Integrasi data dan konektivitas', '20%'], ['Model/simulasi/analitik', '20%'], ['Dashboard dan usability', '10%'], ['Keamanan, tata kelola, dan dokumentasi', '10%'], ['Presentasi dan demo', '5%']];
  return <ScrollView contentContainerStyle={styles.content}><Pressable onPress={close} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 22 }}><Text style={{ color: colors.blue, fontSize: 22 }}>‹</Text><Text style={{ color: colors.blue, fontWeight: '800' }}>Kembali ke E-Learning</Text></Pressable><View style={{ padding: 22, borderRadius: 26, backgroundColor: '#0b426b', borderWidth: 1, borderColor: colors.cyan }}><Text style={{ color: colors.pink, fontSize: 10, letterSpacing: 1.5, fontWeight: '900' }}>SILABUS PEMBELAJARAN</Text><Text style={{ color: colors.text, fontSize: 30, lineHeight: 34, fontWeight: '800', marginTop: 12 }}>Digital Twin</Text><Text style={{ color: '#b2d4e5', fontSize: 12, lineHeight: 19, marginTop: 10 }}>16 pertemuan  /  1 semester  /  3 SKS  /  ±150 menit tatap muka per minggu + praktik mandiri</Text></View><View style={{ marginTop: 24, padding: 18, borderRadius: 20, backgroundColor: '#f1fbff', borderWidth: 1, borderColor: '#9acfe3' }}><Text style={{ color: colors.blue, fontWeight: '900', fontSize: 11 }}>IDENTITAS MATA KULIAH</Text><Text style={{ color: '#244d67', fontSize: 12, lineHeight: 21, marginTop: 10 }}>Prasyarat: Dasar pemrograman, basis data, IoT, dan pemodelan sistem.</Text><Text style={{ color: '#244d67', fontSize: 12, lineHeight: 21 }}>Target peserta: Mahasiswa tingkat lanjut, engineer, analis data, atau profesional industri.</Text></View><View style={{ marginTop: 24 }}><Text style={styles.sectionEyebrow}>DESKRIPSI</Text><Text style={{ color: '#244d67', fontSize: 13, lineHeight: 21, marginTop: 9 }}>Mata kuliah ini membahas konsep, arsitektur, pengembangan, implementasi, dan evaluasi Digital Twin sebagai representasi digital dinamis dari aset, proses, atau sistem fisik yang terhubung dengan data aktual. Peserta mempelajari integrasi sensor/IoT, data real-time, simulasi, analitik, AI, visualisasi, keamanan, serta penerapan Digital Twin di manufaktur, energi, bangunan, kota cerdas, kesehatan, dan rantai pasok.</Text></View>{bulletSection('CAPAIAN PEMBELAJARAN', 'Pada akhir pembelajaran peserta mampu', syllabusSections.outcomes)}{bulletSection('POKOK BAHASAN', '16 tema utama', syllabusSections.topics)}<View style={{ marginTop: 24 }}><Text style={styles.sectionEyebrow}>KOMPETENSI UTAMA</Text><Text style={styles.sectionTitle}>Area kompetensi</Text>{competency.map(([area, detail]) => <View key={area} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#b6d7e5' }}><Text style={{ color: colors.blue, fontSize: 13, fontWeight: '900' }}>{area}</Text><Text style={{ color: '#244d67', fontSize: 12, lineHeight: 18, marginTop: 4 }}>{detail}</Text></View>)}</View><View style={{ marginTop: 24 }}><Text style={styles.sectionEyebrow}>RENCANA PEMBELAJARAN SEMESTER</Text><Text style={styles.sectionTitle}>16 pertemuan</Text>{syllabusWeeks.map(([week, topic, activity, output]) => <View key={week} style={{ marginTop: 10, padding: 14, borderRadius: 16, backgroundColor: '#f1fbff', borderWidth: 1, borderColor: '#9acfe3' }}><View style={{ flexDirection: 'row', gap: 10 }}><Text style={{ color: colors.pink, fontWeight: '900', fontSize: 12 }}>M{week}</Text><Text style={{ flex: 1, color: '#082d50', fontWeight: '900', fontSize: 13 }}>{topic}</Text></View><Text style={{ color: '#47718a', fontSize: 11, lineHeight: 17, marginTop: 7 }}>Aktivitas: {activity}</Text><Text style={{ color: colors.blue, fontSize: 11, fontWeight: '800', marginTop: 5 }}>Luaran: {output}</Text></View>)}</View>{bulletSection('METODE PEMBELAJARAN', 'Pendekatan belajar', syllabusSections.methods)}{bulletSection('PERANGKAT DAN TEKNOLOGI', 'Rekomendasi ekosistem', syllabusSections.tools)}{bulletSection('PRAKTIKUM INTI', 'Hands-on learning', syllabusSections.practices)}<View style={{ marginTop: 24 }}><Text style={styles.sectionEyebrow}>PROYEK AKHIR</Text><Text style={styles.sectionTitle}>Prototipe Digital Twin</Text><Text style={{ color: '#244d67', fontSize: 13, lineHeight: 21, marginTop: 8 }}>Individu atau kelompok 2-4 orang. Contoh: mesin produksi, gedung, kendaraan, greenhouse, logistik, pembangkit surya, ruang kelas/kampus cerdas, atau sistem pengelolaan air.</Text><Text style={{ color: colors.blue, fontWeight: '900', fontSize: 12, marginTop: 14 }}>Komponen minimum</Text>{['Deskripsi aset/proses fisik dan arsitektur sistem.', 'Sumber data sensor, historis, atau sintetis serta data pipeline.', 'Model digital/simulasi, dashboard visualisasi, dan minimal satu fungsi analitik.', 'Pertimbangan keamanan, tata kelola, dokumentasi teknis, dan demo.'].map((item) => <Text key={item} style={{ color: '#244d67', fontSize: 12, lineHeight: 20, marginTop: 5 }}>• {item}</Text>)}</View><View style={{ marginTop: 24 }}><Text style={styles.sectionEyebrow}>PENILAIAN</Text><Text style={styles.sectionTitle}>Komponen nilai</Text>{assessment.map(([name, weight]) => <View key={name} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#b6d7e5' }}><Text style={{ color: '#244d67', fontSize: 12 }}>{name}</Text><Text style={{ color: colors.blue, fontWeight: '900' }}>{weight}</Text></View>)}<View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 14 }}><Text style={{ color: '#082d50', fontWeight: '900' }}>Total</Text><Text style={{ color: colors.pink, fontWeight: '900' }}>100%</Text></View></View><View style={{ marginTop: 24 }}><Text style={styles.sectionEyebrow}>RUBRIK PROYEK AKHIR</Text><Text style={styles.sectionTitle}>Aspek evaluasi</Text>{rubric.map(([aspect, weight]) => <View key={aspect} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#b6d7e5' }}><Text style={{ flex: 1, color: '#244d67', fontSize: 12 }}>{aspect}</Text><Text style={{ color: colors.blue, fontWeight: '900' }}>{weight}</Text></View>)}</View><View style={{ marginTop: 24, paddingBottom: 28 }}><Text style={styles.sectionEyebrow}>REFERENSI DAN ATURAN</Text><Text style={{ color: '#244d67', fontSize: 12, lineHeight: 20, marginTop: 8 }}>Grieves & Vickers; Tao dkk.; ISO 23247 Digital Twin Framework for Manufacturing; serta dokumentasi MQTT, OPC UA, InfluxDB, Grafana, platform cloud Digital Twin, dan artikel terbaru Industrial IoT, predictive maintenance, serta cyber-physical systems.</Text><Text style={{ color: '#244d67', fontSize: 12, lineHeight: 20, marginTop: 10 }}>Kode, data, dan dokumentasi dikelola dengan Git. Data eksternal wajib mencantumkan sumber dan lisensi. Model analitik harus dievaluasi dengan metrik relevan. Proyek wajib menjelaskan asumsi, keterbatasan, risiko keamanan, dan peluang pengembangan.</Text><Text style={{ color: colors.blue, fontSize: 13, lineHeight: 21, fontWeight: '800', marginTop: 16 }}>Hasil akhir: portofolio prototipe Digital Twin yang menerima data, merepresentasikan aset/proses, menampilkan kondisi sistem, dan menghasilkan insight untuk monitoring, prediksi, atau optimasi.</Text></View></ScrollView>;
}

function ELearning() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [showSyllabus, setShowSyllabus] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [view, setView] = useState<'catalog' | 'learning'>('learning');
  const selectedCourse = learningCourses.find((course) => course.id === selectedCourseId);
  const toggleActivity = (courseId: string, activityIndex: number) => {
    const key = `${courseId}-${activityIndex}`;
    setCompleted((current) => ({ ...current, [key]: !current[key] }));
  };
  const getProgress = (course: typeof learningCourses[number]) => {
    const done = course.modules.filter((_, index) => completed[`${course.id}-${index}`]).length;
    return Math.round((done / course.modules.length) * 100);
  };
  if (showSyllabus) return <Syllabus close={() => setShowSyllabus(false)} />;
  if (selectedCourse) {
    const progress = getProgress(selectedCourse);
    return <ScrollView contentContainerStyle={styles.content}>
      <Pressable onPress={() => setSelectedCourseId(null)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 22 }}><Text style={{ color: colors.blue, fontSize: 22 }}>‹</Text><Text style={{ color: colors.blue, fontWeight: '800' }}>Kembali ke E-Learning</Text></Pressable>
      <Text style={styles.sectionEyebrow}>{selectedCourse.code}  /  COURSE DETAIL</Text>
      <Text style={styles.simpleTitle}>{selectedCourse.title}</Text>
      <Text style={[styles.heroCopy, { marginTop: 10 }]}>{selectedCourse.copy}</Text>
      <View style={{ height: 8, borderRadius: 5, backgroundColor: '#c6e6f2', marginTop: 20, overflow: 'hidden' }}><View style={{ width: `${Math.max(progress, 4)}%`, height: '100%', backgroundColor: colors.blue }} /></View>
      <Text style={{ color: colors.blue, fontSize: 12, fontWeight: '800', marginTop: 8 }}>{progress}% selesai  /  {selectedCourse.modules.length} aktivitas</Text>
      <View style={{ marginTop: 24 }}><Text style={styles.sectionEyebrow}>ACTIVITY COMPLETION</Text><Text style={styles.sectionTitle}>Jalur pembelajaran</Text>{selectedCourse.modules.map((module, index) => { const done = completed[`${selectedCourse.id}-${index}`]; return <Pressable key={module} onPress={() => toggleActivity(selectedCourse.id, index)} style={{ flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#b6d7e5' }}><View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? colors.blue : '#d8f2fa', borderWidth: 1, borderColor: colors.blue }}><Text style={{ color: done ? '#fff' : colors.blue, fontWeight: '900' }}>{done ? '✓' : String(index + 1).padStart(2, '0')}</Text></View><View style={{ flex: 1 }}><Text style={{ color: '#082d50', fontSize: 14, fontWeight: '800' }}>{module}</Text><Text style={{ color: '#47718a', fontSize: 11, marginTop: 4 }}>{index === selectedCourse.modules.length - 1 ? 'Quiz & assessment' : 'Lesson & resource'}</Text></View><Text style={{ color: colors.blue, fontSize: 20 }}>{done ? '●' : '○'}</Text></Pressable>; })}</View>
      <View style={{ marginTop: 30 }}><Text style={styles.sectionEyebrow}>DIGITAL TWIN ASSESSMENT</Text><Text style={styles.sectionTitle}>Aktivitas asesmen</Text><Text style={{ color: '#47718a', fontSize: 12, lineHeight: 19, marginTop: 7 }}>20 aktivitas asesmen yang digunakan sepanjang enam tahap pembelajaran Digital Twin.</Text><View style={{ flexDirection: 'row', gap: 7, marginTop: 15, flexWrap: 'wrap' }}>{assessmentStages.map(({ stage, title, weight }) => <View key={stage} style={{ width: '31%', minWidth: 92, padding: 11, borderRadius: 14, backgroundColor: '#f1fbff', borderWidth: 1, borderColor: '#9acfe3' }}><Text style={{ color: colors.pink, fontSize: 10, fontWeight: '900' }}>TAHAP {stage}</Text><Text style={{ color: '#082d50', fontSize: 11, lineHeight: 15, fontWeight: '800', marginTop: 5 }}>{title}</Text><Text style={{ color: colors.blue, fontSize: 16, fontWeight: '900', marginTop: 7 }}>{weight}</Text></View>)}</View>{assessmentStages.map(({ stage, title, activities }) => <View key={stage} style={{ marginTop: 20, padding: 16, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#9acfe3' }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}><View style={{ flex: 1 }}><Text style={{ color: colors.pink, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>TAHAP {stage}</Text><Text style={{ color: '#082d50', fontSize: 17, lineHeight: 22, fontWeight: '800', marginTop: 5 }}>{title}</Text></View><Text style={{ color: colors.blue, fontSize: 13, fontWeight: '900' }}>{assessmentStages[stage - 1].weight}</Text></View>{activities.map(([activity, task, output, criteria], index) => <View key={activity} style={{ marginTop: 15, paddingTop: 14, borderTopWidth: index === 0 ? 0 : 1, borderTopColor: '#d2e8f0' }}><Text style={{ color: colors.blue, fontSize: 13, fontWeight: '900' }}>{String((stage === 1 ? 0 : assessmentStages.slice(0, stage - 1).reduce((total, item) => total + item.activities.length, 0)) + index + 1).padStart(2, '0')}  {activity}</Text><Text style={{ color: '#244d67', fontSize: 12, lineHeight: 18, marginTop: 6 }}>{task}</Text><Text style={{ color: '#47718a', fontSize: 11, lineHeight: 17, marginTop: 7 }}><Text style={{ fontWeight: '900', color: '#082d50' }}>Bukti/Luaran: </Text>{output}</Text><Text style={{ color: '#47718a', fontSize: 11, lineHeight: 17, marginTop: 3 }}><Text style={{ fontWeight: '900', color: '#082d50' }}>Kriteria: </Text>{criteria}</Text></View>)}</View>)}</View>
      <View style={{ marginTop: 24, padding: 18, borderRadius: 20, backgroundColor: '#0b426b', borderWidth: 1, borderColor: colors.cyan }}><Text style={{ color: colors.cyan, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 }}>MOODLE-READY MODEL</Text><Text style={{ color: colors.text, fontSize: 13, lineHeight: 20, marginTop: 8 }}>Course, activity completion, enrolment, access, dan web services siap dipetakan ke backend Moodle 5.3.</Text></View>
    </ScrollView>;
  }
  const totalActivities = learningCourses.reduce((total, course) => total + course.modules.length, 0);
  const completedActivities = Object.values(completed).filter(Boolean).length;
  const overallProgress = Math.round((completedActivities / totalActivities) * 100);
  return <ScrollView contentContainerStyle={styles.content}>
    <View style={{ marginBottom: 22 }}>
      <Text style={styles.sectionEyebrow}>E-LEARNING / KELAS SAYA</Text>
      <Text style={[styles.simpleTitle, { color: '#082d50', marginTop: 7 }]}>Selamat datang kembali.</Text>
      <Text style={{ color: '#47718a', fontSize: 13, lineHeight: 20, marginTop: 7 }}>Lanjutkan pembelajaran Digital Twin dan bangun kemampuan dari konsep sampai implementasi.</Text>
    </View>
    <View style={{ padding: 20, borderRadius: 24, backgroundColor: '#0b426b', borderWidth: 1, borderColor: colors.cyan, marginBottom: 18 }}>
      <Text style={{ color: colors.cyan, fontSize: 10, letterSpacing: 1.4, fontWeight: '900' }}>LANJUTKAN PEMBELAJARAN</Text>
      <Text style={{ color: colors.text, fontSize: 23, lineHeight: 29, fontWeight: '800', marginTop: 10 }}>Bangun fondasi Digital Twin yang kuat.</Text>
      <Text style={{ color: '#b2d4e5', fontSize: 12, lineHeight: 19, marginTop: 8 }}>Progress keseluruhan {overallProgress}% dari {totalActivities} aktivitas pembelajaran.</Text>
      <View style={{ height: 8, borderRadius: 5, backgroundColor: '#1b5c7d', marginTop: 18, overflow: 'hidden' }}><View style={{ width: `${Math.max(overallProgress, 3)}%`, height: '100%', backgroundColor: colors.pink }} /></View>
      <Pressable onPress={() => setSelectedCourseId('fundamental')} style={{ alignSelf: 'flex-start', marginTop: 18, paddingVertical: 11, paddingHorizontal: 15, borderRadius: 12, backgroundColor: colors.pink }}><Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>Lanjutkan Fundamental  ↗</Text></Pressable>
    </View>
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
      {[['COURSE', String(learningCourses.length)], ['AKTIVITAS', String(totalActivities)], ['SELESAI', String(completedActivities)]].map(([label, value]) => <View key={label} style={{ flex: 1, padding: 13, borderRadius: 16, backgroundColor: '#f1fbff', borderWidth: 1, borderColor: '#9acfe3' }}><Text style={{ color: colors.blue, fontSize: 19, fontWeight: '900' }}>{value}</Text><Text style={{ color: '#47718a', fontSize: 9, fontWeight: '900', marginTop: 4 }}>{label}</Text></View>)}
    </View>
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}><Pressable onPress={() => setView('learning')} style={{ flex: 1, paddingVertical: 12, borderRadius: 13, alignItems: 'center', backgroundColor: view === 'learning' ? colors.blue : '#d8eff7' }}><Text style={{ color: view === 'learning' ? '#fff' : colors.blue, fontWeight: '800', fontSize: 12 }}>Kelas saya</Text></Pressable><Pressable onPress={() => setView('catalog')} style={{ flex: 1, paddingVertical: 12, borderRadius: 13, alignItems: 'center', backgroundColor: view === 'catalog' ? colors.blue : '#d8eff7' }}><Text style={{ color: view === 'catalog' ? '#fff' : colors.blue, fontWeight: '800', fontSize: 12 }}>Semua course</Text></Pressable></View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}><View><Text style={styles.sectionEyebrow}>{view === 'learning' ? 'MY LEARNING' : 'COURSE CATALOG'}</Text><Text style={[styles.sectionTitle, { marginTop: 5 }]}>{view === 'learning' ? 'Pembelajaran Digital Twin' : 'Kurikulum pilihan'}</Text></View><Pressable onPress={() => setShowSyllabus(true)}><Text style={{ color: colors.blue, fontWeight: '900', fontSize: 11 }}>Silabus ↗</Text></Pressable></View>
    {learningCourses.map((course) => { const progress = getProgress(course); return <Pressable key={course.id} onPress={() => setSelectedCourseId(course.id)} style={{ marginTop: 16, borderRadius: 22, overflow: 'hidden', backgroundColor: '#f1fbff', borderWidth: 1, borderColor: '#9acfe3' }}><ZoomableMediaImage source={course.image} style={{ width: '100%', height: 130 }} resizeMode="cover" /><View style={{ padding: 17 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ color: colors.pink, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 }}>{course.code}  /  {course.level.toUpperCase()}</Text><Text style={{ color: colors.blue, fontSize: 10, fontWeight: '900' }}>{progress}%</Text></View><Text style={{ color: '#082d50', fontSize: 20, fontWeight: '800', marginTop: 8 }}>{course.title}</Text><Text style={{ color: '#47718a', fontSize: 12, lineHeight: 18, marginTop: 7 }}>{course.copy}</Text><View style={{ flexDirection: 'row', gap: 16, marginTop: 14 }}><Text style={{ color: colors.blue, fontSize: 11, fontWeight: '800' }}>◷ {course.duration}</Text><Text style={{ color: colors.blue, fontSize: 11, fontWeight: '800' }}>▦ {course.modules.length} materi</Text></View><View style={{ height: 5, borderRadius: 4, backgroundColor: '#c6e6f2', marginTop: 14, overflow: 'hidden' }}><View style={{ width: `${Math.max(progress, 2)}%`, height: '100%', backgroundColor: colors.blue }} /></View><Text style={{ color: colors.blue, fontSize: 10, fontWeight: '800', marginTop: 7 }}>{progress === 100 ? 'Selesai dipelajari' : progress > 0 ? 'Lanjutkan materi' : 'Mulai belajar'}  ↗</Text></View></Pressable>; })}
  </ScrollView>;
}

function UnderstandingDigitalTwinModal({ visible, close }: { visible: boolean; close: () => void }) {
  const sections = [
    ['Pendahuluan', introductionText],
    ['1.1 Apa itu Digital Twin?', 'Digital Twin adalah representasi digital dari entitas nyata yang memiliki hubungan dengan entitas tersebut. Hubungan ini memungkinkan kondisi, karakteristik, perubahan, atau perilaku entitas dipahami melalui lingkungan digital. Entitasnya dapat berupa aset, bangunan, jalan, jembatan, utilitas, kawasan, kota, mesin, proses, lingkungan, hingga sistem kompleks.\n\nDigital Twin bukan sekadar membuat versi digital dari sesuatu. Yang penting adalah hubungan antara dunia nyata dan dunia digital: data masuk, dianalisis, digunakan untuk memahami kondisi, mendukung simulasi dan keputusan, lalu dapat menghasilkan tindakan yang memengaruhi dunia nyata.\n\nDunia Nyata -> Data -> Representasi Digital -> Analisis -> Pemahaman -> Keputusan -> Tindakan -> Dunia Nyata'],
    ['Digital Twin sebagai sistem yang terhubung', 'Sebuah Digital Twin dapat dipahami sebagai sistem yang menghubungkan dunia nyata, sensing, representasi digital, integrasi, analisis, pemahaman, keputusan, dan tindakan. Tidak semua Digital Twin memiliki kompleksitas yang sama. Kebutuhan arsitektur bergantung pada tujuan, entitas, keputusan, data, frekuensi pembaruan, dan konteks penerapan.\n\nDigital Twin juga bukan satu teknologi. BIM, GIS, surveying, remote sensing, sensor, IoT, database, API, cloud, AI, simulasi, visualisasi, dan platform Digital Twin dapat menjadi komponennya. Kehadiran teknologi tersebut saja belum cukup tanpa tujuan, konteks, hubungan data, dan mekanisme keputusan yang jelas.'],
    ['1.2 Mengapa Digital Twin muncul?', 'Dunia nyata semakin kompleks, sementara data semakin banyak dan tersebar. Informasi sebuah gedung, misalnya, dapat berada pada gambar arsitektur, model BIM, dokumen pemeliharaan, sistem fasilitas, sensor temperatur, data energi, dan laporan inspeksi. Masing-masing dapat benar, tetapi hubungan antar-data belum tentu terbentuk.\n\nDigital Twin muncul untuk menghubungkan informasi dengan entitas nyata agar kondisi aktual dapat dipahami dengan lebih utuh. Kebutuhannya meliputi pemahaman dunia nyata, pengelolaan data, pemantauan kondisi aktual, integrasi sistem, analisis, prediksi, pengambilan keputusan, tindakan, dan pembelajaran. Teknologi menyediakan kemampuan; kebutuhan dunia nyata menyediakan alasan.'],
    ['1.3 Digital Model, Digital Shadow, dan Digital Twin', 'Digital Model adalah representasi digital seperti CAD, BIM, model 3D, GIS, database, atau simulasi. Fokusnya adalah: seperti apa entitas tersebut dalam bentuk digital?\n\nDigital Shadow memiliki aliran data satu arah: Dunia Nyata -> Digital. Perubahan pada entitas nyata dapat tercermin pada sistem digital, tetapi sistem digital belum menjadi bagian utama dari tindakan balik.\n\nDigital Twin memiliki hubungan yang lebih dinamis dan berkelanjutan: Dunia Nyata <-> Digital Twin. Data digunakan untuk sensing, understanding, decision, acting, dan learning. Hasil tindakan kembali menjadi perubahan yang diamati untuk menentukan keputusan berikutnya.\n\nKetiganya bukan teknologi yang saling bersaing. Digital Model dapat menjadi fondasi representasi, Digital Shadow menjadi jembatan data, dan Digital Twin membangun hubungan yang lebih lengkap sesuai kebutuhan keputusan.'],
    ['1.4 Digital Twin bukan Model 3D', 'Model 3D terutama menjawab pertanyaan: seperti apa bentuk dan ruang sebuah objek? Digital Twin menjawab pertanyaan yang lebih luas: bagaimana kondisi objek, apa yang berubah, apa yang mungkin terjadi, dan keputusan apa yang sebaiknya diambil?\n\nModel 3D dapat menjadi bagian penting ketika bentuk, posisi, volume, ketinggian, struktur, atau hubungan spasial diperlukan. Namun, model 3D ditambah sensor juga belum otomatis menjadi Digital Twin. Data perlu dipahami, dianalisis, dan digunakan dalam siklus keputusan serta tindakan.\n\nSebelum memilih 3D, tanyakan: masalah apa yang diselesaikan, keputusan apa yang didukung, informasi apa yang dibutuhkan, seberapa sering diperbarui, dan apakah manfaatnya sebanding dengan biaya serta kompleksitasnya.'],
    ['1.5 Apakah Digital Twin harus 3D?', 'Tidak. Digital Twin dapat menggunakan representasi 2D, 3D, tabel, grafik, jaringan, atau bentuk non-geometrik lain selama representasi tersebut mendukung tujuan dan memiliki hubungan bermakna dengan entitas nyata.\n\nRepresentasi 2D sering cukup untuk jaringan jalan, pipa, drainase, listrik, lokasi sensor, peta risiko, atau monitoring banjir. Representasi 3D lebih bernilai ketika bentuk, volume, ketinggian, struktur, ruang, atau hubungan tiga dimensi memengaruhi keputusan.\n\nPrinsipnya adalah fit for purpose: bukan seberapa detail representasinya, tetapi seberapa tepat representasi tersebut mendukung tujuan. Digital Twin banjir dengan peta 2D, curah hujan, muka air, debit, elevasi, drainase, data historis, dan model prediksi tetap dapat menjalankan sensing, understanding, prediction, decision, action, dan learning.'],
    ['1.6 Apakah Digital Twin harus real-time?', 'Tidak. Digital Twin harus diperbarui sesuai kebutuhan keputusan, bukan selalu real-time. Kendaraan dan lalu lintas dapat membutuhkan pembaruan detik atau menit; bangunan mungkin cukup jam atau hari; infrastruktur jalan dapat membutuhkan hari atau bulan; tata ruang dapat diperbarui bulan atau tahun.\n\nReal-time, near real-time, dan periodik adalah pilihan temporal. Real-time cocok ketika keterlambatan memengaruhi keputusan secara signifikan. Near real-time sering lebih realistis dan ekonomis. Periodik tetap valid jika hubungan data, representasi, analisis, dan keputusan terjaga.\n\nReal-time adalah karakteristik temporal sistem, bukan definisi Digital Twin. Hindari real-time everything apabila data setiap detik menambah biaya, penyimpanan, komputasi, dan kompleksitas tanpa meningkatkan kualitas keputusan.'],
  ];
  return <Modal visible={visible} animationType="slide" onRequestClose={close}><SafeAreaView style={styles.detailScreen}><View style={styles.detailHeader}><Pressable onPress={close} style={styles.backCircle}><Text style={styles.backCircleText}>‹</Text></Pressable><Text style={styles.detailHeaderLabel}>MEMAHAMI DIGITAL TWIN</Text><Text style={styles.detailIndex}>01</Text></View><ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 48 }}><Text style={styles.detailTitle}>Memahami Digital Twin</Text><Text style={[styles.detailCopy, { marginTop: 10 }]}>Digital Twin bukan sekadar model 3D, dashboard, IoT, atau AI. Bab ini membangun fondasi pemahaman mengenai hubungan dunia nyata dengan representasi digitalnya.</Text>{sections.map(([title, body]) => <View key={title} style={{ marginTop: 24 }}><Text style={[styles.sectionTitle, { color: colors.text, fontSize: 20, lineHeight: 25 }]}>{title}</Text><Text style={[styles.detailCopy, { marginTop: 8, textAlign: 'justify' }]}>{body}</Text></View>)}</ScrollView></SafeAreaView></Modal>;
}

function LiteracyChapterButton({ label, onPress, seed, first = false }: { label: string; onPress: () => void; seed: number; first?: boolean }) {
  const motion = useRef(new Animated.Value(0)).current;
  const duration = 1550 + (seed % 5) * 260;
  const delay = (seed * 170) % 900;
  const reverse = seed % 2 === 1;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(motion, { toValue: 1, duration, delay, useNativeDriver: true }),
      Animated.timing(motion, { toValue: 0, duration: Math.round(duration * 0.82), useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [delay, duration, motion]);
  const pulseStyle = { transform: [{ scale: motion.interpolate({ inputRange: [0, 0.45, 1], outputRange: [1, 1.012 + (seed % 3) * 0.006, 1] }) }] };
  const shineStyle = { opacity: motion.interpolate({ inputRange: [0, 0.25, 0.55, 0.8, 1], outputRange: [0, 0, 0.48, 0.08, 0] }), transform: [{ translateX: motion.interpolate({ inputRange: [0, 1], outputRange: reverse ? [190, -130] : [-130, 190] }) }, { rotate: `${18 + (seed % 4) * 4}deg` }] };
  return <Animated.View style={[{ marginTop: first ? 12 : 0, marginBottom: first ? 4 : 6, borderRadius: 14 }, pulseStyle]}><Pressable onPress={onPress} style={{ overflow: 'hidden', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18, borderWidth: 1, borderColor: colors.cyan, backgroundColor: '#0b426bcc' }}><Animated.View pointerEvents="none" style={[{ position: 'absolute', top: -22, left: 0, width: 34, height: 90, backgroundColor: '#ffffff88' }, shineStyle]} /><Text style={{ color: colors.text, fontSize: 14, fontWeight: '800' }}>{label}  ↗</Text></Pressable></Animated.View>;
}

function CarouselLightField({ seed }: { seed: number }) {
  const motion = useRef(new Animated.Value(0)).current;
  const duration = 1900 + (seed % 4) * 230;
  const colorsForSeed = seed % 2 === 0 ? ['#65e9ff', '#19c7c9'] : ['#ff7098', '#8c7dff'];
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(motion, { toValue: 1, duration, useNativeDriver: true }),
      Animated.timing(motion, { toValue: 0, duration: Math.round(duration * 0.7), useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [duration, motion]);
  const firstLightStyle = { opacity: motion.interpolate({ inputRange: [0, 0.35, 0.75, 1], outputRange: [0.08, 0.35, 0.17, 0.06] }), transform: [{ translateX: motion.interpolate({ inputRange: [0, 1], outputRange: [-75 + seed * 9, 130 - seed * 5] }) }, { translateY: motion.interpolate({ inputRange: [0, 1], outputRange: [48, -42] }) }, { scale: motion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.7, 1.45, 0.9] }) }] };
  const secondLightStyle = { opacity: motion.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0.05, 0.26, 0.1] }), transform: [{ translateX: motion.interpolate({ inputRange: [0, 1], outputRange: [145, -80 + seed * 6] }) }, { translateY: motion.interpolate({ inputRange: [0, 1], outputRange: [-36, 52] }) }, { scale: motion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.9, 1.25, 0.72] }) }] };
  return <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}><Animated.View style={[{ position: 'absolute', width: 175, height: 175, borderRadius: 88, backgroundColor: colorsForSeed[0], shadowColor: colorsForSeed[0], shadowOpacity: 0.9, shadowRadius: 35, shadowOffset: { width: 0, height: 0 }, elevation: 14, left: 55, top: 8 }, firstLightStyle]} /><Animated.View style={[{ position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: colorsForSeed[1], shadowColor: colorsForSeed[1], shadowOpacity: 0.8, shadowRadius: 28, shadowOffset: { width: 0, height: 0 }, elevation: 12, right: 30, top: 62 }, secondLightStyle]} /></View>;
}

function DinaAiFloatingButton() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([{ from: 'ihsan', text: ihsanAiProfile.greeting }]);
  const [loading, setLoading] = useState(false);
  const sendMessage = async () => {
    const question = message.trim();
    if (!question || loading) return;
    setMessage('');
    setMessages((current) => [...current, { from: 'user', text: question }].slice(-40));
    setLoading(true);
    try {
      const answer = await askDinaAi(question);
      setMessages((current) => [...current, { from: 'ihsan', text: answer ?? 'Twini AI belum terhubung ke backend. Coba tanyakan tentang Digital Twin, maintenance, project, atau regulasi.' }].slice(-40));
    } catch {
      setMessages((current) => [...current, { from: 'ihsan', text: 'Backend Twini AI belum tersedia. Jalankan Laravel API dan pastikan EXPO_PUBLIC_IDTC_API_URL sudah benar.' }].slice(-40));
    } finally {
      setLoading(false);
    }
  };
  return <><Pressable accessibilityLabel="Buka Ihsan AI" onPress={() => setVisible(true)} style={{ position: 'absolute', right: 18, bottom: 101, width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', backgroundColor: '#071a30', borderWidth: 2, borderColor: colors.cyan, shadowColor: colors.cyan, shadowOpacity: 0.75, shadowRadius: 15, shadowOffset: { width: 0, height: 5 }, elevation: 14, zIndex: 20 }}><Text style={{ color: colors.cyan, fontSize: 14, fontWeight: '900' }}>IHSAN</Text><Text style={{ color: '#a9c9dc', fontSize: 8, marginTop: 2 }}>AI</Text></Pressable><Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}><View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#03172c99' }}><View style={{ maxHeight: '78%', minHeight: 430, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 18, backgroundColor: '#071a30', borderWidth: 1, borderColor: colors.cyan }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><View><Text style={{ color: colors.cyan, fontSize: 17, fontWeight: '900' }}>Ihsan AI</Text><Text style={{ color: '#a9c9dc', fontSize: 10, marginTop: 3 }}>IDTC Digital Twin Assistant</Text></View><Pressable onPress={() => setVisible(false)}><Text style={{ color: colors.text, fontSize: 25 }}>×</Text></Pressable></View><ScrollView style={{ marginTop: 15 }} contentContainerStyle={{ paddingBottom: 12 }}>{messages.map((item, index) => <View key={`${item.from}-${index}`} style={{ alignSelf: item.from === 'user' ? 'flex-end' : 'flex-start', maxWidth: '86%', marginBottom: 9, padding: 12, borderRadius: 15, backgroundColor: item.from === 'user' ? '#0b6b9e' : '#123553' }}><Text style={{ color: colors.text, fontSize: 12, lineHeight: 18 }}>{item.text}</Text></View>)}{loading && <Text style={{ color: colors.cyan, fontSize: 11, marginBottom: 10 }}>Ihsan sedang menganalisis...</Text>}</ScrollView><View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}><TextInput value={message} onChangeText={setMessage} onSubmitEditing={sendMessage} placeholder="Tanyakan tentang IDTC..." placeholderTextColor="#8faabd" multiline style={{ flex: 1, minHeight: 44, maxHeight: 90, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 14, color: colors.text, backgroundColor: '#0c2b48', borderWidth: 1, borderColor: '#397694' }} /><Pressable onPress={sendMessage} style={{ width: 46, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cyan }}><Text style={{ color: '#03172c', fontSize: 19, fontWeight: '900' }}>↑</Text></Pressable></View></View></View></Modal></>;
}

function TwiniAiFloatingButton() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([{ from: 'twini', text: ihsanAiProfile.greeting }]);
  const [loading, setLoading] = useState(false);
  const messagesScroll = useRef<ScrollView>(null);
  const iconMotion = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(iconMotion, { toValue: 1, duration: 330, useNativeDriver: true }),
      Animated.timing(iconMotion, { toValue: 2, duration: 270, useNativeDriver: true }),
      Animated.timing(iconMotion, { toValue: 0, duration: 360, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [iconMotion]);
  useEffect(() => {
    if (!visible) return;
    requestAnimationFrame(() => messagesScroll.current?.scrollToEnd({ animated: true }));
  }, [loading, messages, visible]);
  const sendMessage = async () => {
    const question = message.trim();
    if (!question || loading) return;
    setMessage('');
    setMessages((current) => [...current, { from: 'user', text: question }].slice(-40));
    setLoading(true);
    try {
      const answer = await askDinaAi(question);
      setMessages((current) => [...current, { from: 'twini', text: answer ?? 'Twini AI belum terhubung ke backend.' }].slice(-40));
    } catch {
      setMessages((current) => [...current, { from: 'twini', text: 'Backend Twini AI belum tersedia.' }].slice(-40));
    } finally {
      setLoading(false);
    }
  };
  return <>
    <Animated.View style={{ position: 'absolute', right: 8, bottom: 104, width: 88, height: 100, alignItems: 'center', zIndex: 30, transform: [{ translateX: iconMotion.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 7, -5] }) }, { translateY: iconMotion.interpolate({ inputRange: [0, 1, 2], outputRange: [0, -8, 4] }) }, { rotate: iconMotion.interpolate({ inputRange: [0, 1, 2], outputRange: ['0deg', '7deg', '-5deg'] }) }] }}>
      <Pressable accessibilityLabel="Buka Twini AI" onPress={() => setVisible(true)} style={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <Image source={require('./assets/ITDC_icon.png')} resizeMode="contain" style={{ width: 62, height: 62 }} />
        <Text style={{ color: '#d9fbff', fontSize: 10, fontWeight: '900', marginTop: 2, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: '#65e9ffcc', backgroundColor: '#061b37dd', textShadowColor: '#03172c', textShadowRadius: 5 }}>Twini AI</Text>
      </Pressable>
    </Animated.View>
    <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#03172c99' }}>
        <View style={{ height: '78%', minHeight: 430, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 18, backgroundColor: '#071a30', borderWidth: 1, borderColor: colors.cyan }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><View><Text style={{ color: colors.cyan, fontSize: 17, fontWeight: '900' }}>Twini AI</Text><Text style={{ color: '#a9c9dc', fontSize: 10, marginTop: 3 }}>IDTC Digital Twin Assistant</Text></View><Pressable onPress={() => setVisible(false)}><Text style={{ color: colors.text, fontSize: 25 }}>×</Text></Pressable></View>
          <ScrollView ref={messagesScroll} style={{ flex: 1, marginTop: 15 }} contentContainerStyle={{ paddingBottom: 12 }} keyboardShouldPersistTaps="handled">{messages.map((item, index) => <View key={`${item.from}-${index}`} style={{ alignSelf: item.from === 'user' ? 'flex-end' : 'flex-start', maxWidth: '86%', marginBottom: 9, padding: 12, borderRadius: 15, backgroundColor: item.from === 'user' ? '#0b6b9e' : '#123553' }}><Text style={{ color: colors.text, fontSize: 12, lineHeight: 18 }}>{item.text}</Text></View>)}{loading && <Text style={{ color: colors.cyan, fontSize: 12, marginBottom: 10 }}>Twini sedang menganalisis...</Text>}</ScrollView>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end', paddingTop: 10 }}><TextInput value={message} onChangeText={setMessage} onSubmitEditing={sendMessage} placeholder="Tanyakan tentang IDTC..." placeholderTextColor="#8faabd" multiline={false} blurOnSubmit returnKeyType="send" style={{ flex: 1, minHeight: 44, maxHeight: 90, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 14, color: colors.text, backgroundColor: '#0c2b48', borderWidth: 1, borderColor: '#397694' }} /><Pressable accessibilityLabel="Kirim pertanyaan" onPress={sendMessage} style={{ width: 46, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cyan }}><Text style={{ color: '#03172c', fontSize: 19, fontWeight: '900' }}>↑</Text></Pressable></View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  </>;
}

const twiniShopProducts = [
  { id: 'mascot', name: 'Twini Mascot Premium', price: 'Rp 450.000', image: require('./assets/merchant/WhatsApp Image 2026-09-23 at 21.07.27.jpeg'), tag: 'BEST SELLER' },
  { id: 'plush', name: 'Twini Plush Collection', price: 'Rp 325.000', image: require('./assets/merchant/WhatsApp Image 2026-09-23 at 21.07.27-2.jpeg'), tag: 'LIMITED' },
  { id: 'cape', name: 'Cape Nusantara Twini', price: 'Rp 175.000', image: require('./assets/merchant/WhatsApp Image 2026-09-23 at 21.07.28.jpeg'), tag: 'NEW' },
  { id: 'collectible', name: 'Twini Collectible Edition', price: 'Rp 275.000', image: require('./assets/merchant/WhatsApp Image 2026-09-23 at 21.07.29.jpeg'), tag: 'COLLECTIBLE' },
];

    function TwiniShopFloatingButton() {
      const [visible, setVisible] = useState(false);
      const [checkoutMessage, setCheckoutMessage] = useState('');
      const iconMotion = useRef(new Animated.Value(0)).current;
      useEffect(() => {
        const animation = Animated.loop(Animated.sequence([
          Animated.delay(90),
          Animated.timing(iconMotion, { toValue: 1, duration: 360, useNativeDriver: true }),
          Animated.timing(iconMotion, { toValue: 2, duration: 290, useNativeDriver: true }),
          Animated.timing(iconMotion, { toValue: 0, duration: 380, useNativeDriver: true }),
        ]));
        animation.start();
        return () => animation.stop();
      }, [iconMotion]);

      const buyProduct = (productName: string) => {
        setCheckoutMessage(`${productName} siap dipesan. Lanjutkan pembayaran untuk menyelesaikan transaksi.`);
      };

      return <>
        <Animated.View style={{ position: 'absolute', left: 4, bottom: 104, width: 94, height: 100, alignItems: 'center', zIndex: 30, transform: [{ translateX: iconMotion.interpolate({ inputRange: [0, 1, 2], outputRange: [0, -7, 5] }) }, { translateY: iconMotion.interpolate({ inputRange: [0, 1, 2], outputRange: [0, -7, 4] }) }, { rotate: iconMotion.interpolate({ inputRange: [0, 1, 2], outputRange: ['0deg', '-7deg', '5deg'] }) }] }}>
          <Pressable
            accessibilityLabel="Buka Twini Shop"
            onPress={() => { setCheckoutMessage(''); setVisible(true); }}
            style={{ alignItems: 'center', justifyContent: 'flex-start' }}
          >
            <Image source={require('./assets/twini shop.png')} resizeMode="contain" style={{ width: 72, height: 72 }} />
            <Text style={{ color: '#fff4f8', fontSize: 10, fontWeight: '900', marginTop: 0, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: '#ff7099cc', backgroundColor: '#061b37dd', textShadowColor: '#03172c', textShadowRadius: 5 }}>Twini Shop</Text>
          </Pressable>
        </Animated.View>
        <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#f4fbff' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 22, paddingBottom: 18, backgroundColor: '#061b37' }}>
              <View style={{ paddingTop: 6 }}>
                <Text style={{ color: '#65e9ff', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 }}>TWINI SHOP</Text>
                <Text style={{ color: '#f3fbff', fontSize: 21, fontWeight: '900', marginTop: 8 }}>Merchandise IDTC</Text>
              </View>
              <Pressable accessibilityLabel="Kembali dari Twini Shop" hitSlop={12} onPress={() => setVisible(false)} style={{ width: 52, height: 52, marginTop: 10, marginRight: -8, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#123553', borderWidth: 1, borderColor: '#65e9ff99' }}><Text style={{ color: '#f3fbff', fontSize: 30, lineHeight: 32 }}>‹</Text></Pressable>
            </View>
            <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 42 }}>
              <View style={{ overflow: 'hidden', borderRadius: 22, backgroundColor: '#dff7ff', borderWidth: 1, borderColor: '#9bdbea' }}>
                <Image source={require('./assets/twini shop.png')} resizeMode="contain" style={{ width: '100%', height: 150 }} />
                <View style={{ paddingHorizontal: 18, paddingBottom: 18 }}>
                  <Text style={{ color: '#082d50', fontSize: 24, fontWeight: '900', marginTop: 2 }}>Selamat berbelanja merchandise</Text>
                  <Text style={{ color: '#47718a', fontSize: 12, lineHeight: 18, marginTop: 7 }}>Bawa semangat Digital Twin ke ruang kerja dan keseharianmu bersama koleksi Twini.</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 26, marginBottom: 12 }}>
                <View><Text style={{ color: '#e34b78', fontSize: 10, fontWeight: '900', letterSpacing: 1.4 }}>KOLEKSI PILIHAN</Text><Text style={{ color: '#082d50', fontSize: 23, fontWeight: '900', marginTop: 4 }}>Belanja Twini</Text></View>
                <Text style={{ color: '#47718a', fontSize: 11, fontWeight: '800' }}>{twiniShopProducts.length} produk</Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 }}>
                {twiniShopProducts.map((product) => <View key={product.id} style={{ width: '48%', overflow: 'hidden', borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#b6dce8' }}>
                  <Image source={product.image} resizeMode="cover" style={{ width: '100%', height: 145 }} />
                  <View style={{ padding: 11 }}>
                    <Text style={{ color: '#e34b78', fontSize: 8, fontWeight: '900', letterSpacing: 1 }}>{product.tag}</Text>
                    <Text style={{ color: '#082d50', fontSize: 13, lineHeight: 17, fontWeight: '900', marginTop: 5, minHeight: 34 }}>{product.name}</Text>
                    <Text style={{ color: '#0b6b9e', fontSize: 14, fontWeight: '900', marginTop: 8 }}>{product.price}</Text>
                    <Pressable accessibilityLabel={`Bayar ${product.name}`} onPress={() => buyProduct(product.name)} style={{ alignItems: 'center', marginTop: 10, paddingVertical: 10, borderRadius: 10, backgroundColor: '#0b6b9e' }}><Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>Bayar langsung</Text></Pressable>
                  </View>
                </View>)}
              </View>
              {checkoutMessage ? <View style={{ marginTop: 18, padding: 14, borderRadius: 14, backgroundColor: '#e6f8ee', borderWidth: 1, borderColor: '#79c99a' }}><Text style={{ color: '#176b3c', fontSize: 12, lineHeight: 18, fontWeight: '800' }}>{checkoutMessage}</Text></View> : null}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </>;
  }

function IDTCBanner() {
  const motion = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(motion, { toValue: 1, duration: 2400, useNativeDriver: true }),
      Animated.timing(motion, { toValue: 0, duration: 1800, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [motion]);
  const glowLeft = { opacity: motion.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0.1, 0.34, 0.12] }), transform: [{ translateX: motion.interpolate({ inputRange: [0, 1], outputRange: [-55, 95] }) }, { scale: motion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 1.18, 0.85] }) }] };
  const glowRight = { opacity: motion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.07, 0.27, 0.1] }), transform: [{ translateX: motion.interpolate({ inputRange: [0, 1], outputRange: [75, -70] }) }, { translateY: motion.interpolate({ inputRange: [0, 1], outputRange: [-8, 16] }) }] };
  const shine = { opacity: motion.interpolate({ inputRange: [0, 0.32, 0.58, 1], outputRange: [0, 0, 0.42, 0] }), transform: [{ translateX: motion.interpolate({ inputRange: [0, 1], outputRange: [-115, 250] }) }, { rotate: '22deg' }] };
  return <View style={{ height: 76, marginHorizontal: 14, marginTop: 8, marginBottom: 8, borderRadius: 22, overflow: 'hidden', backgroundColor: '#071a30e8', borderWidth: 1, borderColor: '#65e9ff99', shadowColor: '#65e9ff', shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 12 }}><Animated.View pointerEvents="none" style={[{ position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: '#65e9ff', shadowColor: '#65e9ff', shadowOpacity: 0.9, shadowRadius: 32, shadowOffset: { width: 0, height: 0 }, left: -30, top: -65 }, glowLeft]} /><Animated.View pointerEvents="none" style={[{ position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: '#8c7dff', shadowColor: '#8c7dff', shadowOpacity: 0.9, shadowRadius: 28, shadowOffset: { width: 0, height: 0 }, right: -28, top: -45 }, glowRight]} /><View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 22, borderWidth: 1, borderColor: '#ffffff22', transform: [{ perspective: 500 }, { rotateX: '8deg' }] }} /><View pointerEvents="none" style={{ position: 'absolute', left: 18, right: 18, bottom: 10, height: 1, backgroundColor: '#65e9ff55' }} /><Animated.View pointerEvents="none" style={[{ position: 'absolute', top: -24, left: 0, width: 30, height: 130, backgroundColor: '#d9fbffcc' }, shine]} /><View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 }}><Brand image /><View style={{ alignItems: 'flex-end' }}><Text style={{ color: colors.cyan, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 }}>DIGITAL TWIN</Text><Text style={{ color: '#b9d7e5', fontSize: 9, marginTop: 4 }}>INTELLIGENCE PLATFORM</Text></View></View></View>;
}

function FloatingIconEffects({ kind }: { kind: 'ai' | 'shop' }) {
  const motion = useRef(new Animated.Value(0)).current;
  const seed = kind === 'ai' ? 0 : 1;
  const [path, setPath] = useState({ bounceX: seed ? -13 : 13, bounceY: -15, settleX: seed ? 9 : -9, settleY: 7 });
  useEffect(() => {
    let cancelled = false;
    const animate = () => {
      if (cancelled) return;
      const direction = Math.random() > 0.5 ? 1 : -1;
      setPath({
        bounceX: (8 + Math.random() * 8) * direction,
        bounceY: -(8 + Math.random() * 8),
        settleX: (5 + Math.random() * 9) * -direction,
        settleY: 3 + Math.random() * 6,
      });
      motion.setValue(0);
      const animation = Animated.sequence([
        Animated.delay(35 + Math.random() * 100 + seed * 25),
        Animated.timing(motion, { toValue: 1, duration: 150 + Math.random() * 100, useNativeDriver: true }),
        Animated.timing(motion, { toValue: 2, duration: 120 + Math.random() * 90, useNativeDriver: true }),
        Animated.timing(motion, { toValue: 3, duration: 170 + Math.random() * 110, useNativeDriver: true }),
      ]);
      animation.start(({ finished }) => {
        if (finished && !cancelled) animate();
      });
    };
    animate();
    return () => {
      cancelled = true;
      motion.stopAnimation();
    };
  }, [motion, seed]);
  const drift = {
    opacity: motion.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [0.86, 1, 0.94, 0.86] }),
    transform: [
      { translateX: motion.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [0, path.bounceX, path.settleX, 0] }) },
      { translateY: motion.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [0, path.bounceY, path.settleY, 0] }) },
      { rotate: motion.interpolate({ inputRange: [0, 1, 2, 3], outputRange: ['0deg', seed ? '-12deg' : '12deg', seed ? '8deg' : '-8deg', '0deg'] }) },
      { scale: motion.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [1, 1.12, 0.94, 1] }) },
    ],
  };
  const position = kind === 'ai' ? { right: 14, bottom: 124 } : { left: 12, bottom: 123 };
  return <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: 78, height: 78, alignItems: 'center', justifyContent: 'center', zIndex: 21 }, position, drift]}>
    <Animated.View style={{ position: 'absolute', width: 92, height: 92, borderRadius: 46, backgroundColor: '#65e9ff55', shadowColor: '#65e9ff', shadowOpacity: 0.95, shadowRadius: 23, shadowOffset: { width: 0, height: 0 }, transform: [{ scale: motion.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [0.8, 1.24, 0.92, 0.8] }) }] }} />
    <Animated.View style={{ position: 'absolute', width: 62, height: 62, borderRadius: 31, backgroundColor: '#ff709955', shadowColor: '#ff7099', shadowOpacity: 0.9, shadowRadius: 18, shadowOffset: { width: 0, height: 0 }, transform: [{ translateX: motion.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [15, -15, 12, 15] }) }, { translateY: motion.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [-7, 13, -8, -7] }) }, { scale: motion.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [0.65, 1.3, 0.78, 0.65] }) }] }} />
    <Animated.View style={{ position: 'absolute', width: 42, height: 42, borderRadius: 21, backgroundColor: '#ffe66d99', shadowColor: '#ffe66d', shadowOpacity: 0.9, shadowRadius: 16, shadowOffset: { width: 0, height: 0 }, transform: [{ translateX: motion.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [-14, 10, -8, -14] }) }, { translateY: motion.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [12, -11, 8, 12] }) }, { scale: motion.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [0.7, 1.2, 0.82, 0.7] }) }] }} />
    <Animated.View style={{ position: 'absolute', width: 34, height: 34, borderRadius: 17, backgroundColor: '#72f1b899', shadowColor: '#72f1b8', shadowOpacity: 0.85, shadowRadius: 14, shadowOffset: { width: 0, height: 0 }, transform: [{ translateX: motion.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [11, -6, 14, 11] }) }, { translateY: motion.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [-12, 7, -3, -12] }) }, { scale: motion.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [0.6, 1.25, 0.76, 0.6] }) }] }} />
  </Animated.View>;
}

type ManagedUser = { id: number; name: string; email: string; role: 'Super Admin' | 'Admin' | 'Instructor' | 'Student'; status: 'Aktif' | 'Nonaktif' };
const initialManagedUsers: ManagedUser[] = [
  { id: 1, name: 'Dani Hamdani', email: 'dani@idtc.org', role: 'Super Admin', status: 'Aktif' },
  { id: 2, name: 'Siti Rahma', email: 'siti.rahma@idtc.org', role: 'Instructor', status: 'Aktif' },
  { id: 3, name: 'Budi Santoso', email: 'budi.santoso@idtc.org', role: 'Student', status: 'Aktif' },
  { id: 4, name: 'Nadia Putri', email: 'nadia.putri@idtc.org', role: 'Admin', status: 'Nonaktif' },
];
const managedRoles: ManagedUser['role'][] = ['Admin', 'Instructor', 'Student'];

function UserManagementPanel({ visible, close }: { visible: boolean; close: () => void }) {
  const [users, setUsers] = useState(initialManagedUsers);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'Semua' | ManagedUser['role']>('Semua');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ManagedUser['role']>('Student');
  const [formError, setFormError] = useState('');
  const filteredUsers = users.filter((user) => {
    const matchesQuery = `${user.name} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesQuery && (roleFilter === 'Semua' || user.role === roleFilter);
  });
  const addUser = () => {
    if (!name.trim() || !email.trim() || !email.includes('@')) {
      setFormError('Nama dan email yang valid wajib diisi.');
      return;
    }
    setUsers((current) => [...current, { id: Date.now(), name: name.trim(), email: email.trim().toLowerCase(), role, status: 'Aktif' }]);
    setName('');
    setEmail('');
    setRole('Student');
    setFormError('');
    setShowForm(false);
  };
  return <Modal visible={visible} animationType="slide" onRequestClose={close}><SafeAreaView style={styles.detailScreen}><View style={styles.detailHeader}><Pressable onPress={close} style={styles.backCircle}><Text style={styles.backCircleText}>‹</Text></Pressable><Text style={styles.detailHeaderLabel}>CMS / USER MANAGEMENT</Text><Text style={styles.detailIndex}>{users.length}</Text></View><ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 48 }}><Text style={styles.detailTitle}>Manajemen pengguna</Text><Text style={[styles.detailCopy, { marginTop: 10 }]}>Kelola akun, peran, dan akses pengguna platform IDTC.</Text><View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}><View style={{ flex: 1, padding: 14, borderRadius: 15, backgroundColor: '#123553', borderWidth: 1, borderColor: colors.cyan }}><Text style={{ color: colors.cyan, fontSize: 20, fontWeight: '900' }}>{users.length}</Text><Text style={{ color: '#b2d4e5', fontSize: 10, marginTop: 4 }}>TOTAL USER</Text></View><View style={{ flex: 1, padding: 14, borderRadius: 15, backgroundColor: '#123553', borderWidth: 1, borderColor: colors.cyan }}><Text style={{ color: colors.cyan, fontSize: 20, fontWeight: '900' }}>{users.filter((user) => user.status === 'Aktif').length}</Text><Text style={{ color: '#b2d4e5', fontSize: 10, marginTop: 4 }}>AKTIF</Text></View></View><TextInput value={query} onChangeText={setQuery} placeholder="Cari nama atau email" placeholderTextColor="#7da6bc" style={[styles.input, { marginTop: 18, color: '#e5f4ff', backgroundColor: '#0b3155' }]} /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>{(['Semua', ...managedRoles] as const).map((filter) => <Pressable key={filter} onPress={() => setRoleFilter(filter)} style={{ paddingVertical: 9, paddingHorizontal: 13, borderRadius: 12, backgroundColor: roleFilter === filter ? colors.cyan : '#123553', borderWidth: 1, borderColor: colors.cyan }}><Text style={{ color: roleFilter === filter ? '#03172c' : colors.text, fontSize: 11, fontWeight: '800' }}>{filter}</Text></Pressable>)}</ScrollView><Pressable onPress={() => setShowForm((current) => !current)} style={[styles.primaryButtonWide, { marginTop: 16 }]}><Text style={styles.primaryText}>{showForm ? 'Tutup formulir' : '+ Tambah pengguna'}</Text></Pressable>{showForm && <View style={{ marginTop: 14, padding: 16, borderRadius: 18, backgroundColor: '#123553', borderWidth: 1, borderColor: colors.cyan }}><TextInput value={name} onChangeText={setName} placeholder="Nama lengkap" placeholderTextColor="#7da6bc" style={[styles.input, { color: colors.text, backgroundColor: '#071a30' }]} /><TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#7da6bc" style={[styles.input, { color: colors.text, backgroundColor: '#071a30' }]} /><Text style={{ color: colors.muted, fontSize: 10, fontWeight: '800', marginBottom: 8 }}>PILIH PERAN</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{managedRoles.map((item) => <Pressable key={item} onPress={() => setRole(item)} style={{ paddingVertical: 9, paddingHorizontal: 11, borderRadius: 11, backgroundColor: role === item ? colors.pink : '#071a30' }}><Text style={{ color: colors.text, fontSize: 11, fontWeight: '800' }}>{item}</Text></Pressable>)}</View>{formError !== '' && <Text style={{ color: '#ff9bb8', fontSize: 11, marginTop: 10 }}>{formError}</Text>}<Pressable onPress={addUser} style={[styles.primaryButtonWide, { marginTop: 14 }]}><Text style={styles.primaryText}>Simpan pengguna</Text></Pressable></View>}{filteredUsers.map((user) => <View key={user.id} style={{ marginTop: 13, padding: 15, borderRadius: 17, backgroundColor: '#123553', borderWidth: 1, borderColor: '#397694' }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><View style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cyan }}><Text style={{ color: '#03172c', fontWeight: '900' }}>{user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</Text></View><View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 13, fontWeight: '900' }}>{user.name}</Text><Text style={{ color: '#b2d4e5', fontSize: 10, marginTop: 3 }}>{user.email}</Text></View><Text style={{ color: user.status === 'Aktif' ? '#7dffcf' : '#ff9bb8', fontSize: 10, fontWeight: '900' }}>{user.status}</Text></View><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 13 }}><Text style={{ color: colors.cyan, fontSize: 11, fontWeight: '800' }}>{user.role}</Text><View style={{ flexDirection: 'row', gap: 8 }}><Pressable onPress={() => setUsers((current) => current.map((item) => item.id === user.id ? { ...item, status: item.status === 'Aktif' ? 'Nonaktif' : 'Aktif' } : item))} style={{ paddingVertical: 7, paddingHorizontal: 9, borderRadius: 9, backgroundColor: '#071a30' }}><Text style={{ color: colors.text, fontSize: 10, fontWeight: '800' }}>{user.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}</Text></Pressable>{user.id !== 1 && <Pressable onPress={() => setUsers((current) => current.filter((item) => item.id !== user.id))} style={{ paddingVertical: 7, paddingHorizontal: 9, borderRadius: 9, backgroundColor: '#5b2341' }}><Text style={{ color: '#ffd9e4', fontSize: 10, fontWeight: '800' }}>Hapus</Text></Pressable>}</View></View></View>)}</ScrollView></SafeAreaView></Modal>;
}

function AppHome({ admin, restart, logout }: { admin: boolean; restart: () => void; logout: () => void }) {
  const [menu, setMenu] = useState<MenuKey>("literasi");
  const [dark, setDark] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [introductionVisible, setIntroductionVisible] = useState(false);
  const [understandingVisible, setUnderstandingVisible] = useState(false);
  const [fundamentalPrinciplesVisible, setFundamentalPrinciplesVisible] = useState(false);
  const [decisionDrivenVisible, setDecisionDrivenVisible] = useState(false);
  const [extendedChapter, setExtendedChapter] = useState<number | null>(null);
  const [userManagementVisible, setUserManagementVisible] = useState(false);
  const buttonMotion = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(buttonMotion, { toValue: 1, duration: 1800, useNativeDriver: true }),
      Animated.timing(buttonMotion, { toValue: 0, duration: 1800, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [buttonMotion]);
  const animatedButtonStyle = { transform: [{ scale: buttonMotion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.025, 1] }) }], shadowColor: colors.cyan, shadowOpacity: 0.65, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 8 };
  const buttonShineStyle = { opacity: buttonMotion.interpolate({ inputRange: [0, 0.35, 0.65, 1], outputRange: [0, 0, 0.65, 0] }), transform: [{ translateX: buttonMotion.interpolate({ inputRange: [0, 1], outputRange: [-120, 190] }) }, { rotate: '24deg' }] };
  const [carouselIndex, setCarouselIndex] = useState(0);
  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 4200,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 4200,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [glow]);
  const pageTitle: Record<MenuKey, string> = {
    literasi: "",
    regulasi: "Rambu untuk inovasi yang bertanggung jawab.",
    referensi: "Sumber untuk terus belajar.",
    project: "Project DT kamu, terpantau.",
    profil: "",
  };
  const pageCopy: Record<MenuKey, string> = {
    literasi: "",
    regulasi:
      "Temukan panduan, standar, dan prinsip tata kelola data untuk implementasi Digital Twin.",
    referensi:
      "Kumpulan bacaan, istilah, dan referensi teknologi yang membantu memperdalam pemahaman.",
    project:
      "Kelola ide dan progres penerapan Digital Twin dalam satu ruang kerja ringkas.",
    profil: "",
  };
  const carousel = (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        snapToInterval={carouselWidth + 12}
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        onMomentumScrollEnd={(event) =>
          setCarouselIndex(
            Math.round(event.nativeEvent.contentOffset.x / (carouselWidth + 12))
          )
        }
        style={{ marginHorizontal: -20 }}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {slides.map(([kicker, title, copy], index) => (
          <View
            key={kicker}
            style={{
              width: carouselWidth,
              minHeight: 214,
              padding: 22,
              marginRight: index === slides.length - 1 ? 0 : 12,
              borderRadius: 28,
              borderWidth: 1,
              borderColor: index === carouselIndex ? colors.cyan : "#3d7090",
              backgroundColor: index % 2 === 0 ? "#0b426b" : "#132d68",
              shadowColor: colors.cyan,
              shadowOpacity: index === carouselIndex ? 0.3 : 0.12,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: index === carouselIndex ? 8 : 3,
            }}
          >
            <CarouselLightField seed={index + 1} />
            <Text style={styles.eyebrow}>{kicker}</Text>
            <Text
              style={{
                color: colors.text,
                fontSize: 27,
                lineHeight: 30,
                fontWeight: "700",
                marginTop: 15,
                maxWidth: "76%",
              }}
            >
              {title.replace("\n", " ")}
            </Text>
            <Text style={{ color: "#b2d4e5", fontSize: 11, lineHeight: 18, marginTop: 12, maxWidth: "78%" }}>{copy}</Text>
            <AnimatedPressable
              onPress={() => setSelectedSlide(index)}
              accessibilityLabel="Klik di sini"
              style={[styles.warningButton, { left: 22, right: 'auto', bottom: 18, width: 204, height: 42, borderRadius: 14, flexDirection: 'row', gap: 7, backgroundColor: '#a91f5866', borderColor: '#ffd1e0', shadowColor: colors.pink, shadowOpacity: 1, shadowRadius: 20, shadowOffset: { width: 0, height: 5 }, elevation: 18, opacity: glow.interpolate({ inputRange: [0, 0.22, 0.5, 0.78, 1], outputRange: [1, 0.42, 1, 0.48, 1] }), transform: [{ scale: glow.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.03, 1] }) }] }]}
            >
              <Text style={[styles.warningButtonText, { color: '#f3feff', fontSize: 11, fontWeight: '900', textShadowColor: colors.cyan, textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 }]}>Klik di sini</Text>
              <Text style={{ color: '#fff4f8', fontSize: 16, fontWeight: '900' }}>↗</Text>
            </AnimatedPressable>
          </View>
        ))}
      </ScrollView>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 5,
          marginTop: 12,
        }}
      >
        {slides.map((_, index) => (
          <View
            key={index}
            style={{
              width: index === carouselIndex ? 22 : 5,
              height: 5,
              borderRadius: 4,
              backgroundColor:
                index === carouselIndex ? colors.cyan : "#3d7090",
            }}
          />
        ))}
      </View>
    </View>
  );
  const home =
    menu === "literasi" ? (
      <ScrollView contentContainerStyle={styles.content}>
        {carousel}
        <View style={{ marginTop: 26 }}>
          <Text style={styles.sectionEyebrow}>KERANGKA UTAMA</Text>
          <LiteracyChapterButton label="Pendahuluan" onPress={() => setIntroductionVisible(true)} seed={1} first />
          <LiteracyChapterButton label="BAB 1 - Digital Twin" onPress={() => setUnderstandingVisible(true)} seed={2} />
          <LiteracyChapterButton label="BAB 2 - Prinsif Fundamental" onPress={() => setFundamentalPrinciplesVisible(true)} seed={3} />
          <LiteracyChapterButton label="BAB 3 · Digital Twin Dimulai dari Keputusan" onPress={() => setDecisionDrivenVisible(true)} seed={4} />
          {extendedChapters.map((chapter, index) => <LiteracyChapterButton key={chapter.number} label={chapter.number === 7 ? 'BAB 7 - Sensor, IoT & hub' : chapter.number === 9 ? 'BAB 9 - nteroperabilitas & Ekosistem' : `BAB ${chapter.number} · ${chapter.title}`} onPress={() => setExtendedChapter(chapter.number)} seed={index + 5} />)}
          <Text style={styles.sectionTitle}>Fondasi Digital Twin</Text>
          <ZoomableMediaImage
            source={require("./assets/ITDC_16.jpeg")}
            style={{
              width: "12.5%",
              alignSelf: "center",
              aspectRatio: 1.2,
              marginTop: 16,
              marginBottom: 16,
              borderRadius: 12,
            }}
            resizeMode="contain"
            imageStyle={{
              width: "100%",
              height: "100%",
              borderRadius: 12,
            }}
          />
          <Text style={styles.bodyCopy}>
            Digital Twin menyatukan aset fisik, data aktual, model digital,
            analitik, dan simulasi dalam satu ekosistem yang terus berkembang.
          </Text>
          {["Data terukur", "Model adaptif", "Aksi strategis"].map(
            (title, index) => (
              <View style={styles.learningCard} key={title}>
                <Text style={styles.cardNumber}>0{index + 1}</Text>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardCopy}>
                  {
                    [
                      "Sensor membangun gambaran kondisi aset secara real-time.",
                      "Model mengolah konteks melalui simulasi, AI, dan aturan bisnis.",
                      "Insight mengarahkan rekomendasi serta keputusan operasional.",
                    ][index]
                  }
                </Text>
              </View>
            )
          )}
        </View>
        <IntroductionModal
          visible={introductionVisible}
          close={() => setIntroductionVisible(false)}
        />
        <UnderstandingDigitalTwinModal
          visible={understandingVisible}
          close={() => setUnderstandingVisible(false)}
        />
        <FundamentalPrinciplesModal
          visible={fundamentalPrinciplesVisible}
          close={() => setFundamentalPrinciplesVisible(false)}
        />
        <DecisionDrivenModal
          visible={decisionDrivenVisible}
          close={() => setDecisionDrivenVisible(false)}
        />
        {extendedChapter !== null && <ExtendedChapterModal chapter={extendedChapters.find((chapter) => chapter.number === extendedChapter) ?? extendedChapters[0]} close={() => setExtendedChapter(null)} />}
      </ScrollView>
    ) : menu === "referensi" ? <ELearning /> : menu === "regulasi" ? <RegulationPolicy /> : menu === "project" ? (selectedProjectId ? <ProjectDetailWithDomains project={projectFacilities.find((project) => project.id === selectedProjectId) ?? projectFacilities[0]} close={() => setSelectedProjectId(null)} /> : <ProjectRibbonDashboard openProject={setSelectedProjectId} />) : (
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.simpleHero}>
          <Text style={styles.eyebrow}>{menu.toUpperCase()}</Text>
          <Text style={styles.simpleTitle}>{pageTitle[menu]}</Text>
          <Text style={styles.heroCopy}>{pageCopy[menu]}</Text>
        </View>
        {[
          "Tata kelola data & privasi",
          "Keamanan siber aset terhubung",
          "Standar interoperabilitas",
          "Etika AI dan otomasi",
        ].map((item, index) => (
          <View style={styles.simpleRow} key={item}>
            <Text style={styles.cardNumber}>0{index + 1}</Text>
            <Text style={styles.settingTitle}>{item}</Text>
            <Text style={styles.actionArrow}>↗</Text>
          </View>
        ))}
      </ScrollView>
    );
  if (selectedSlide !== null)
    return (
      <SlideDetail slide={selectedSlide} close={() => setSelectedSlide(null)} />
    );
  return (
    <LinearGradient
      colors={
        dark
          ? ["#06162e", "#0a2850", "#102d62", "#102d62"]
          : ["#d9f3ff", "#91d5f2", "#4e9edb", "#153b82"]
      }
      locations={[0, 0.3, 0.7, 1]}
      style={styles.app}
    >
      <AnimatedGlassCircles />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ambientGlow,
          {
            opacity: glow.interpolate({
              inputRange: [0, 1],
              outputRange: [0.18, 0.48],
            }),
            transform: [
              {
                translateX: glow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-45, 45],
                }),
              },
              {
                translateY: glow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, -20],
                }),
              },
            ],
          },
        ]}
      />
      <View pointerEvents="none" style={styles.sparkleField}>
        {sparklePositions.map((position, index) => (
          <Animated.View
            key={index}
            style={[
              styles.sparkle,
              position,
              {
                opacity: glow.interpolate({
                  inputRange: [0, 0.35, 1],
                  outputRange: [0.18 + index * 0.04, 0.8, 0.28 + index * 0.03],
                }),
                transform: [
                  {
                    scale: glow.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.7, 1.35 + index * 0.05, 0.85],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
      <SafeAreaView style={styles.appSafe}>
        <IDTCBanner />
        {menu === "profil" ? (
          <ProfileLayout
            themeDark={dark}
            setThemeDark={setDark}
            admin={admin}
            restart={restart}
          />
        ) : (
          home
        )}
        {menu === 'profil' && admin && <Pressable onPress={() => setUserManagementVisible(true)} style={{ position: 'absolute', left: 24, right: 24, bottom: 154, padding: 14, borderRadius: 16, backgroundColor: '#071a30', borderWidth: 1, borderColor: colors.cyan }}><Text style={{ color: colors.cyan, fontSize: 12, fontWeight: '900' }}>Buka CMS User Management  ↗</Text><Text style={{ color: '#b2d4e5', fontSize: 10, marginTop: 4 }}>Kelola akun, peran, dan akses platform</Text></Pressable>}
        {menu === 'profil' && <Pressable onPress={logout} style={{ position: 'absolute', left: 24, right: 24, bottom: 94, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#ff7099', backgroundColor: '#fff3f6' }}><Text style={{ color: '#a52e55', fontSize: 20 }}>⇥</Text><View style={{ flex: 1 }}><Text style={{ color: '#a52e55', fontSize: 13, fontWeight: '900' }}>Keluar akun</Text><Text style={{ color: '#c53b65', fontSize: 10, marginTop: 3 }}>Kembali ke halaman masuk</Text></View><Text style={{ color: '#c53b65', fontSize: 18 }}>↗</Text></Pressable>}
        <UserManagementPanel visible={userManagementVisible} close={() => setUserManagementVisible(false)} />
        {(menu !== 'literasi' || selectedProjectId !== null) && <Pressable accessibilityLabel="Kembali ke Home" onPress={() => { setMenu('literasi'); setSelectedProjectId(null); setSelectedSlide(null); }} style={{ position: 'absolute', right: 18, bottom: 22, width: 68, height: 68, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#071a30ee', borderWidth: 1, borderColor: colors.cyan, shadowColor: colors.cyan, shadowOpacity: 0.75, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 16, zIndex: 30 }}><Text style={{ color: colors.cyan, fontSize: 24, lineHeight: 26 }}>⌂</Text><Text style={{ color: '#d9fbff', fontSize: 9, fontWeight: '900', marginTop: 2 }}>HOME</Text></Pressable>}
        <TwiniAiFloatingButton />
        <TwiniShopFloatingButton />
        <FloatingIconEffects kind="ai" />
        <FloatingIconEffects kind="shop" />
        <View style={[styles.floatingNav, { backgroundColor: '#06152df5', borderColor: '#65e9ff', shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 16, elevation: 14 }]}>
          {menus.map(([key, icon, label]) => (
            <Pressable
              key={key}
              style={[styles.navItem, { backgroundColor: menu === key ? '#65e9ff' : '#123553', borderColor: menu === key ? '#d9fbff' : '#397694' }, menu === key && styles.navActive]}
              onPress={() => setMenu(key)}
            >
              <Text
                style={[styles.navIcon, menu === key && styles.navIconActive, { color: menu === key ? '#03172c' : '#8ff4ff', textShadowColor: menu === key ? 'transparent' : '#65e9ff', textShadowRadius: 5 }]}
              >
                {icon}
              </Text>
              <Text style={[styles.navLabel, { color: menu === key ? '#03172c' : '#e5f4ff', fontWeight: '900', textShadowColor: menu === key ? 'transparent' : '#000', textShadowRadius: 4 }]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function AnimatedSplashScreen({ onFinish }: { onFinish: () => void }) {
  const motion = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(motion, { toValue: 1, duration: 1100, useNativeDriver: true }),
      Animated.timing(motion, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]));
    animation.start();
    const finishTimer = setTimeout(onFinish, 2400);
    return () => {
      animation.stop();
      clearTimeout(finishTimer);
    };
  }, [motion, onFinish]);

  const shine = {
    opacity: motion.interpolate({ inputRange: [0, 0.35, 0.62, 1], outputRange: [0.04, 0.18, 0.72, 0.05] }),
    transform: [{ translateX: motion.interpolate({ inputRange: [0, 1], outputRange: [-260, 260] }) }, { rotate: '24deg' }],
  };
  const glow = (color: string, size: number, position: object, offset: [number, number]) => <Animated.View style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: `${color}55`, shadowColor: color, shadowOpacity: 0.95, shadowRadius: 60, shadowOffset: { width: 0, height: 0 }, elevation: 24 }, position, { opacity: motion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 0.72, 0.26] }), transform: [{ translateX: motion.interpolate({ inputRange: [0, 1], outputRange: [0, offset[0]] }) }, { translateY: motion.interpolate({ inputRange: [0, 1], outputRange: [0, offset[1]] }) }, { scale: motion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.78, 1.18, 0.86] }) }] }]} />;
  return <View style={{ flex: 1, backgroundColor: '#020b22', overflow: 'hidden' }}>
    <LinearGradient colors={['#020b22', '#071f43', '#04142e', '#010817']} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
    {glow('#65e9ff', 310, { top: '8%', left: '-24%' }, [130, 80])}
    {glow('#ff7098', 260, { top: '50%', right: '-18%' }, [-100, -100])}
    {glow('#ffe66d', 190, { bottom: '8%', left: '24%' }, [90, -70])}
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: -180, left: 0, width: 70, height: '145%', backgroundColor: '#f3feff99', shadowColor: '#65e9ff', shadowOpacity: 0.9, shadowRadius: 30, shadowOffset: { width: 0, height: 0 }, elevation: 16 }, shine]} />
    <Image source={require('./assets/ITDC_icon.png')} resizeMode="contain" style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.96 }} />
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 62 }}><Text style={{ color: '#d9fbff', fontSize: 10, fontWeight: '900', letterSpacing: 3 }}>DIGITAL TWIN INDONESIA</Text><Text style={{ color: '#65e9ff', fontSize: 9, marginTop: 8, letterSpacing: 2 }}>INITIALIZING SYSTEM</Text></View>
    <StatusBar style="light" />
  </View>;
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [admin, setAdmin] = useState(false);
  const openAuth = () => setScreen("auth");
  styles.onboardingBody = { ...styles.onboardingBody, paddingTop: 24 };
  styles.onboardingCopy = { ...styles.onboardingCopy, textAlign: 'justify' };
  if (showSplash) return <AnimatedSplashScreen onFinish={() => setShowSplash(false)} />;
  if (screen === "onboarding")
    return <FuturisticBackdrop><OnboardingExperience finish={openAuth} /></FuturisticBackdrop>;
  if (screen === "auth")
    return (
      <FuturisticBackdrop><Auth
        mode={authMode}
        changeMode={setAuthMode}
        finish={(isAdmin) => {
          setAdmin(isAdmin);
          setScreen("app");
        }}
      /></FuturisticBackdrop>
    );
  return <AppHome admin={admin} restart={() => setScreen("onboarding")} logout={() => { setAdmin(false); setAuthMode("login"); setScreen("auth"); }} />;
}

export default function App() { return <SafeAreaProvider><AppContent /></SafeAreaProvider>; }

const styles: any = Object.assign(StyleSheet.create({ warningButton: { position: 'absolute', right: 22, bottom: 22, width: 66, height: 66, borderRadius: 33, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ff70982e', borderWidth: 2, borderColor: colors.pink, shadowColor: colors.pink, shadowOpacity: 0.9, shadowRadius: 16, shadowOffset: { width: 0, height: 0 }, elevation: 12 }, warningButtonText: { color: colors.cyan, fontSize: 12, fontWeight: '800' }, warningButtonMark: { position: 'absolute', top: 7, right: 9, color: colors.pink, fontSize: 14, fontWeight: '900' }, objectivesCard: { marginTop: 22, padding: 20, borderRadius: 26, borderWidth: 1, borderColor: '#65e9ff70', backgroundColor: '#0b3155cc', shadowColor: colors.cyan, shadowOpacity: 0.2, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 }, objectivesEyebrow: { color: colors.pink, fontSize: 9, letterSpacing: 1.4, fontWeight: '800' }, objectivesTitle: { color: colors.text, fontSize: 22, fontWeight: '700', marginTop: 8, marginBottom: 12 }, objectiveRow: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#3d709066' }, objectiveNumber: { color: colors.cyan, fontSize: 10, fontWeight: '800', width: 22 }, objectiveText: { flex: 1, color: '#c1dbe7', fontSize: 11, lineHeight: 17 }, comparisonCard: { marginTop: 18, padding: 20, borderRadius: 26, borderWidth: 1, borderColor: '#ff709870', backgroundColor: '#102d62cc', shadowColor: colors.pink, shadowOpacity: 0.2, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 }, comparisonRow: { paddingVertical: 13, borderTopWidth: 1, borderTopColor: '#65e9ff35' }, comparisonTop: { flexDirection: 'row', alignItems: 'center', gap: 10 }, comparisonNumber: { color: colors.pink, fontSize: 10, fontWeight: '800' }, comparisonName: { color: colors.text, fontSize: 14, fontWeight: '800' }, comparisonRelation: { color: '#c1dbe7', fontSize: 11, lineHeight: 17, marginTop: 7 }, comparisonExample: { color: colors.cyan, fontSize: 10, lineHeight: 15, marginTop: 5 }, comparisonNote: { marginTop: 15, paddingTop: 15, color: '#e3f3fa', fontSize: 11, lineHeight: 18, borderTopWidth: 1, borderTopColor: '#ff709870' }, knowledgeStack: { marginTop: 18, gap: 14 }, knowledgeCard: { padding: 20, borderRadius: 26, borderWidth: 1, borderColor: '#65e9ff70', backgroundColor: '#0b3155cc', shadowColor: colors.cyan, shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 }, knowledgeEyebrow: { color: colors.pink, fontSize: 9, letterSpacing: 1.3, fontWeight: '800' }, knowledgeTitle: { color: colors.text, fontSize: 22, fontWeight: '700', marginTop: 8, marginBottom: 12 }, knowledgeFlow: { padding: 12, color: colors.cyan, fontSize: 10, lineHeight: 17, borderRadius: 12, backgroundColor: '#65e9ff15', borderWidth: 1, borderColor: '#65e9ff45' }, knowledgeRow: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#3d709066' }, knowledgeNumber: { width: 24, color: colors.cyan, fontSize: 10, fontWeight: '800' }, knowledgeName: { color: colors.text, fontSize: 12, fontWeight: '800', lineHeight: 17 }, knowledgeText: { flex: 1, color: '#c1dbe7', fontSize: 11, lineHeight: 17 }, knowledgeSubhead: { color: colors.cyan, fontSize: 10, fontWeight: '800', marginTop: 10, marginBottom: 2 }, knowledgeNote: { marginTop: 12, padding: 12, color: '#ffd7df', fontSize: 10, lineHeight: 16, borderRadius: 12, backgroundColor: '#ff709820', borderWidth: 1, borderColor: '#ff709870' }, applicationRow: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#3d709066' }, detailScreen: { flex: 1, padding: 20, backgroundColor: '#061b3b' }, detailHeader: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, backCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.cyan, backgroundColor: '#65e9ff1c' }, backCircleText: { color: colors.cyan, fontSize: 30, lineHeight: 32 }, detailHeaderLabel: { color: colors.muted, fontSize: 9, letterSpacing: 1.4 }, detailIndex: { color: colors.pink, fontSize: 12, fontWeight: '800' }, detailContent: { paddingTop: 32, paddingBottom: 120 }, detailBadge: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.pink, backgroundColor: '#ff709820', shadowColor: colors.pink, shadowOpacity: 0.45, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } }, detailBadgeText: { color: '#ffc5d3', fontSize: 9, fontWeight: '800', letterSpacing: 1 }, detailTitle: { marginTop: 18, color: colors.text, fontSize: 36, lineHeight: 40, fontWeight: '700', textShadowColor: '#65e9ff66', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 12 }, detailCopy: { marginTop: 18, color: colors.muted, fontSize: 14, lineHeight: 23 }, detailGlass: { marginTop: 34, padding: 22, minHeight: 210, borderRadius: 28, borderWidth: 1, borderColor: '#65e9ff80', backgroundColor: '#0b426bb8', shadowColor: colors.cyan, shadowOpacity: 0.28, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 10 }, warningOrb: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ff709938', borderWidth: 2, borderColor: colors.pink, shadowColor: colors.pink, shadowOpacity: 0.8, shadowRadius: 14, shadowOffset: { width: 0, height: 0 } }, warningIcon: { color: '#fff0f4', fontSize: 25, fontWeight: '900' }, detailGlassLabel: { marginTop: 24, color: colors.cyan, fontSize: 9, letterSpacing: 1.5 }, detailGlassTitle: { marginTop: 8, color: colors.text, fontSize: 23, fontWeight: '700' }, detailGlassCopy: { marginTop: 9, color: '#b2d4e5', fontSize: 12, lineHeight: 20 }, detailLine: { marginTop: 28, paddingTop: 15, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#3d7090' }, detailLineNumber: { color: colors.pink, fontSize: 10 }, detailLineText: { color: colors.muted, fontSize: 8, letterSpacing: 1 }, detailAction: { position: 'absolute', left: 20, right: 20, bottom: 18, alignItems: 'center', paddingVertical: 16, borderRadius: 18, backgroundColor: colors.blue, shadowColor: colors.cyan, shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 }, detailActionText: { color: '#fff', fontSize: 12, fontWeight: '800' }, guestButton: { alignItems: 'center', paddingVertical: 14, marginTop: 10, borderWidth: 1, borderColor: '#3d7090' }, guestText: { color: colors.cyan, fontSize: 11, fontWeight: '700' },
  screen: { flex: 1, padding: 24, backgroundColor: 'transparent' },
  app: { flex: 1, backgroundColor: '#071a30' }, appDark: { backgroundColor: '#030b17' }, appSafe: { flex: 1 }, topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 8 }, logoImage: { width: 30, height: 30, borderRadius: 9, borderWidth: 1, borderColor: '#65e9ff88' }, ambientGlow: { position: 'absolute', width: 260, height: 260, top: 105, right: -70, borderRadius: 130, backgroundColor: '#b9f4ff', shadowColor: '#65e9ff', shadowOpacity: 0.75, shadowRadius: 45, shadowOffset: { width: 0, height: 0 }, elevation: 18 }, sparkleField: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }, sparkle: { position: 'absolute', width: 5, height: 5, borderRadius: 3, backgroundColor: '#f3feff', shadowColor: '#65e9ff', shadowOpacity: 0.95, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 8 }, brand: { fontSize: 24, fontWeight: '900', letterSpacing: -1.5, textShadowColor: '#65e9ff55', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 }, logoId: { color: colors.logoNavy }, logoTc: { color: colors.logoTeal }, mutedButton: { color: colors.muted, fontSize: 12 }, authStatus: { color: colors.muted, fontSize: 9, letterSpacing: 1 }, progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 42 }, progressText: { color: colors.muted, fontSize: 10 }, progressTrack: { flex: 1, flexDirection: 'row', gap: 3 }, progressBar: { flex: 1, height: 2, backgroundColor: '#2d465d' }, progressActive: { backgroundColor: colors.pink }, onboardingBody: { flex: 1, paddingTop: 42 }, eyebrow: { color: colors.pink, fontSize: 10, letterSpacing: 1.5 }, onboardingTitle: { marginTop: 16, color: colors.text, fontSize: 38, lineHeight: 39, fontWeight: '500' }, onboardingCopy: { marginTop: 16, color: colors.muted, fontSize: 13, lineHeight: 22, maxWidth: 310 }, orbit: { width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: '#396477', alignSelf: 'center', marginTop: 36, alignItems: 'center', justifyContent: 'center' }, orbitLine: { position: 'absolute', width: 175, height: 175, borderRadius: 90, borderWidth: 1, borderColor: colors.cyan, transform: [{ rotate: '30deg' }, { scaleY: 0.45 }] }, orbitLineSmall: { position: 'absolute', width: 125, height: 125, borderRadius: 65, borderWidth: 1, borderColor: colors.pink, transform: [{ rotate: '-30deg' }, { scaleY: 0.45 }] }, orbitCore: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.cyan, color: colors.navy, textAlign: 'center', textAlignVertical: 'center', paddingTop: 23, fontWeight: '800', fontSize: 14 }, actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, primaryButton: { paddingVertical: 15, paddingHorizontal: 18, backgroundColor: colors.blue, shadowColor: colors.cyan, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }, primaryText: { color: '#fff', fontSize: 12, fontWeight: '800' }, authBody: { paddingTop: 68, paddingBottom: 30 }, authTitle: { color: colors.text, fontSize: 34, marginTop: 16, lineHeight: 37 }, googleButton: { height: 50, backgroundColor: '#fff', marginTop: 28, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 }, googleText: { color: '#4285f4', fontSize: 17, fontWeight: '800' }, googleLabel: { color: colors.navy, fontWeight: '700' }, divider: { color: colors.muted, fontSize: 9, textAlign: 'center', marginVertical: 22 }, input: { height: 48, paddingHorizontal: 13, marginBottom: 12, color: colors.text, borderWidth: 1, borderColor: '#315674', backgroundColor: colors.panel }, error: { color: colors.pink, fontSize: 11, marginBottom: 10 }, primaryButtonWide: { alignItems: 'center', paddingVertical: 15, backgroundColor: colors.blue, marginTop: 4 }, switchText: { color: colors.cyan, textAlign: 'center', fontSize: 11, marginTop: 26 }, appHeader: { height: 66, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#ffffffaa', backgroundColor: '#eafaffd9', shadowColor: '#0b6b9e', shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 5 }, notification: { color: colors.logoNavy, fontSize: 22, textShadowColor: '#65e9ff66', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 5 }, content: { padding: 20, paddingBottom: 125 }, hero: { padding: 22, minHeight: 255, backgroundColor: '#0b426b', marginBottom: 28 }, heroTitle: { color: colors.text, fontSize: 32, lineHeight: 35, marginTop: 14 }, heroCopy: { color: '#b2d4e5', fontSize: 12, lineHeight: 20, marginTop: 14 }, heroOrb: { width: 110, height: 110, borderRadius: 55, borderWidth: 1, borderColor: colors.cyan, alignSelf: 'flex-end', marginTop: -15, alignItems: 'center', justifyContent: 'center' }, sectionEyebrow: { color: '#061b30', fontSize: 10, letterSpacing: 1.5, marginTop: 8, fontWeight: '800' }, sectionTitle: { color: '#020b17', fontSize: 24, marginTop: 8, marginBottom: 16, fontWeight: '800', textShadowColor: '#ffffff66', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }, bodyCopy: { color: '#071a30', fontSize: 13, lineHeight: 21, marginBottom: 18, fontWeight: '600' }, learningCard: { padding: 17, marginBottom: 10, backgroundColor: colors.panel, borderWidth: 1, borderColor: '#2c5872' }, cardNumber: { color: colors.pink, fontSize: 10 }, cardTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 18 }, cardCopy: { color: colors.muted, fontSize: 11, lineHeight: 18, marginTop: 7 }, simpleHero: { padding: 22, backgroundColor: '#0b426b', marginBottom: 18 }, simpleTitle: { color: colors.text, fontSize: 28, lineHeight: 31, marginTop: 12 }, simpleRow: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 9, backgroundColor: colors.panel, borderWidth: 1, borderColor: '#2c5872', gap: 12 }, actionArrow: { color: colors.pink, fontSize: 18 }, profileHero: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#0e5076' }, avatar: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cyan }, avatarText: { color: colors.navy, fontWeight: '800' }, profileName: { color: colors.text, fontSize: 24, marginTop: 6 }, profileEmail: { color: '#b2d4e5', fontSize: 10, marginTop: 3 }, origin: { color: colors.cyan, fontSize: 9, marginTop: 5 }, adminBanner: { marginTop: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#0b5c82', borderWidth: 1, borderColor: colors.cyan }, adminStar: { color: colors.cyan, fontSize: 20 }, adminTitle: { color: colors.text, fontWeight: '700', fontSize: 12 }, adminCopy: { color: '#abd4e4', fontSize: 9, marginTop: 4 }, adminTag: { color: colors.cyan, fontSize: 9 }, setting: { paddingVertical: 15, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#2c5872' }, settingIcon: { color: colors.pink, fontSize: 20 }, settingTitle: { color: colors.text, fontSize: 11, fontWeight: '700' }, settingCopy: { color: colors.muted, fontSize: 9, marginTop: 4 }, profileAction: { marginTop: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.panel, borderWidth: 1, borderColor: '#2c5872' }, actionIcon: { color: colors.pink, fontSize: 20 }, floatingNav: { position: 'absolute', left: 12, right: 12, bottom: 12, height: 78, padding: 7, flexDirection: 'row', backgroundColor: '#dff8ff38', borderRadius: 28, borderWidth: 1, borderColor: '#ffffffa8', shadowColor: '#04152e', shadowOpacity: 0.5, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 24 }, navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 21, gap: 4, borderWidth: 1, borderColor: '#ffffff18' }, navActive: { backgroundColor: '#65e9ff4d', borderColor: '#b8f7ff9c', shadowColor: colors.cyan, shadowOpacity: 0.55, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 8 }, navIcon: { color: '#f0fbff', fontSize: 24, lineHeight: 27, fontWeight: '700', textShadowColor: '#65e9ff99', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 7 }, navIconActive: { color: '#ffffff', fontSize: 26 }, navLabel: { color: '#f4fcff', fontSize: 10, fontWeight: '700', letterSpacing: 0.2, textShadowColor: '#06233f', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }, authScreen: {},
}), { screen: { flex: 1, padding: 24, backgroundColor: 'transparent' }, onboardingBody: { flex: 1, padding: 26, marginTop: 28, marginBottom: 20, borderRadius: 30, borderWidth: 1, borderColor: '#65e9ff70', backgroundColor: '#0b3155d9', shadowColor: '#65e9ff', shadowOpacity: 0.18, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 12 }, onboardingTitle: { marginTop: 16, color: colors.text, fontSize: 38, lineHeight: 39, fontWeight: '600', textShadowColor: '#65e9ff66', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 10 }, authBody: { padding: 24, paddingTop: 34, paddingBottom: 30, marginTop: 42, borderRadius: 30, borderWidth: 1, borderColor: '#65e9ff70', backgroundColor: '#0b3155d9', shadowColor: '#65e9ff', shadowOpacity: 0.18, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 12 }, authTitle: { color: colors.text, fontSize: 34, marginTop: 16, lineHeight: 37, fontWeight: '600', textShadowColor: '#65e9ff66', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 10 }, input: { height: 52, paddingHorizontal: 17, marginBottom: 13, color: colors.text, borderWidth: 1, borderColor: '#65e9ff70', borderRadius: 18, backgroundColor: '#071a30cc', shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 }, googleButton: { height: 52, borderRadius: 18, backgroundColor: '#edfaff', marginTop: 28, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, shadowColor: colors.cyan, shadowOpacity: 0.22, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 4 }, primaryButton: { paddingVertical: 16, paddingHorizontal: 22, borderRadius: 18, backgroundColor: colors.blue, shadowColor: colors.cyan, shadowOpacity: 0.42, shadowRadius: 16, shadowOffset: { width: 0, height: 7 }, elevation: 8 }, primaryButtonWide: { alignItems: 'center', paddingVertical: 16, borderRadius: 18, backgroundColor: colors.blue, marginTop: 5, shadowColor: colors.cyan, shadowOpacity: 0.42, shadowRadius: 16, shadowOffset: { width: 0, height: 7 }, elevation: 8 }, guestButton: { alignItems: 'center', paddingVertical: 15, marginTop: 11, borderWidth: 1, borderColor: '#65e9ff70', borderRadius: 18, backgroundColor: '#65e9ff16' }, guestText: { color: colors.cyan, fontSize: 11, fontWeight: '700' } });
