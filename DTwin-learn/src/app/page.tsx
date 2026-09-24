"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import AuthGate from "@/components/AuthGate";
import DigitalTwinLab, { ThreeTwinScene } from "@/components/DigitalTwinLab";
import { getCurrentUser, getRolePermissions, ROLE_OPTIONS, type AppUser, type UserRole, setCurrentUserRole } from "@/lib/auth";
import {
  Activity, ArrowRight, Award, Bell, BookOpen, BrainCircuit, CalendarDays,
  Check, ChevronDown, ChevronRight, Clock3, Cpu, Grid2X2, GraduationCap,
  LayoutDashboard, LineChart, Menu, Play, Radio, Search, Settings2, Sparkles,
  Star, Target, Users, Zap,
} from "lucide-react";

type View = "beranda" | "katalog" | "kelas" | "detail" | "lab" | "pengajar" | "admin";
type Course = { id: number; title: string; category: string; level: string; mentor: string; rating: string; learners: string; duration: string; price: string; color: string; tags: string[] };
type UserRecord = { id: number; name: string; email: string; role: UserRole; status: "Aktif" | "Pending" | "Nonaktif"; lastLogin: string; permissions: string[]; };
type PortalRecommendation = { name: string; url: string; keywords: string[]; category: string; };

const portalRecommendations: PortalRecommendation[] = [
  { name: "SIGI PU", url: "https://sigi.pu.go.id/", category: "Kementerian PU", keywords: ["peta geospasial kementerian pu", "data GIS PUPR", "informasi spasial infrastruktur", "peta jalan", "jaringan pu", "data lokasi proyek", "buka SIGI PU", "geoportal kementerian pekerjaan umum"] },
  { name: "BIM PU", url: "https://bim.pu.go.id/", category: "BIM PUPR", keywords: ["data BIM PUPR", "download model BIM", "informasi building information modeling PU", "portal BIM Kementerian PU", "model bangunan infrastruktur", "data BIM proyek PU", "akses BIM PU"] },
  { name: "SITABA PU", url: "https://sitaba.pu.go.id/", category: "Kebencanaan", keywords: ["data bencana PUPR", "peta kebencanaan PU", "informasi banjir dan longsor", "data tanggap darurat infrastruktur", "portal SITABA", "risiko bencana wilayah", "buka data kebencanaan PU"] },
  { name: "Data PU", url: "https://data.pu.go.id/", category: "Data Publik", keywords: ["statistik PUPR", "data statistik kementerian PU", "data pembangunan infrastruktur", "angka jalan nasional", "statistik air minum", "sanitasi", "data publik PUPR", "portal satu data PU"] },
  { name: "Tanah Air Indonesia", url: "https://tanahair.indonesia.go.id/", category: "Rupabumi", keywords: ["peta RBI Indonesia", "batas administrasi Indonesia", "data DEMNAS", "unduh data elevasi nasional", "peta topografi Indonesia", "informasi rupabumi Indonesia", "portal Tanah Air Indonesia"] },
  { name: "SIHKA SDA", url: "https://sihka.sda.pu.go.id/", category: "Sumber Daya Air", keywords: ["data sensor sumber daya air", "sensor tinggi muka air", "data curah hujan PU", "informasi hidrologi", "monitoring sungai dan bendungan", "API data SDA", "buka SIHKA"] },
  { name: "XPlore OneGeo Pertamina", url: "https://onegeo.pertamina.com/", category: "Energi", keywords: ["data geospasial Pertamina", "peta aset Pertamina", "data HSSE Pertamina", "lokasi kilang Pertamina", "data fuel terminal", "peta tanah dan bangunan Pertamina", "portal OneGeo Pertamina", "akses data internal Pertamina"] },
  { name: "Jakarta Satu", url: "https://jakartasatu.jakarta.go.id/", category: "GIS DKI", keywords: ["peta Jakarta", "data geospasial DKI Jakarta", "peta 3D Jakarta", "informasi tata ruang Jakarta", "data bangunan Jakarta", "Jakarta Satu Map", "portal GIS DKI"] },
  { name: "BHUMI ATR/BPN", url: "https://bhumi.atrbpn.go.id/", category: "Pertanahan", keywords: ["peta bidang tanah", "informasi pertanahan Indonesia", "data ATR BPN", "cek peta tanah", "peta sertifikat tanah", "data geospasial BPN", "buka BHUMI ATR BPN"] },
  { name: "Satu Data IKN", url: "https://satudata.ikn.go.id/", category: "IKN", keywords: ["data Ibu Kota Nusantara", "statistik IKN", "peta pembangunan IKN", "informasi Otorita IKN", "data kawasan Nusantara", "satu data IKN", "portal data IKN"] },
  { name: "Geoportal ESDM", url: "https://geoportal.esdm.go.id/", category: "Energi & Mineral", keywords: ["peta energi dan sumber daya mineral", "data tambang Indonesia", "data ESDM", "peta wilayah kerja migas", "informasi mineral dan batubara", "geoportal kementerian ESDM", "data geospasial energi"] },
  { name: "SIGAP Kehutanan", url: "https://sigap.kehutanan.go.id/", category: "Kehutanan", keywords: ["peta kawasan hutan", "data kehutanan Indonesia", "informasi tutupan lahan", "data perizinan hutan", "peta konservasi", "portal SIGAP Kehutanan", "data geospasial hutan"] },
  { name: "GeoMap Geologi ESDM", url: "https://geologi.esdm.go.id/geomap/pages/signin-", category: "Geologi", keywords: ["peta geologi Indonesia", "data batuan dan struktur geologi", "peta sesar aktif", "informasi gunung api", "data geologi ESDM", "GeoMap Badan Geologi", "masuk portal geologi"] },
  { name: "GIS Dukcapil Kemendagri", url: "https://gis.dukcapil.kemendagri.go.id/peta/", category: "Administrasi Kependudukan", keywords: ["peta administrasi kependudukan", "data Dukcapil", "peta penduduk Indonesia", "informasi demografi wilayah", "batas wilayah Kemendagri", "GIS Dukcapil", "data kependudukan daerah"] },
  { name: "GIS Hub Kemenhub", url: "https://gishub.kemenhub.go.id/#/", category: "Transportasi", keywords: ["peta transportasi Indonesia", "data kementerian perhubungan", "peta jalan kereta pelabuhan bandara", "informasi jaringan transportasi", "GIS Kemenhub", "data geospasial transportasi", "buka GIS Hub"] },
  { name: "GIS Lemhannas", url: "https://gis.lemhannas.go.id/arcgis/home/", category: "Strategis Nasional", keywords: ["peta Lemhannas", "data geospasial nasional strategis", "portal ArcGIS Lemhannas", "informasi wilayah strategis", "GIS ketahanan nasional", "data spasial Lemhannas", "buka portal Lemhannas"] },
  { name: "GISTARU ATR/BPN", url: "https://gistaru.atrbpn.go.id/rtronline/", category: "Tata Ruang", keywords: ["cek tata ruang wilayah", "RTR online", "peta rencana tata ruang", "informasi zonasi tanah", "peta RDTR", "GISTARU ATR BPN", "cek peruntukan lahan", "tata ruang nasional dan daerah"] },
];

const normalizeQuery = (value: string) => value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

const recommendPortals = (query: string) => {
  const cleaned = normalizeQuery(query);
  if (!cleaned) return [];

  const words = cleaned.split(" ").filter(Boolean);

  return portalRecommendations
    .map((portal) => {
      const combined = [portal.name, portal.category, ...portal.keywords].join(" ");
      const normalizedCombined = normalizeQuery(combined);
      const wordMatchCount = words.filter((word) => normalizedCombined.includes(word)).length;
      const containsExact = normalizedCombined.includes(cleaned);
      const score = wordMatchCount * 10 + (containsExact ? 30 : 0) + (normalizedCombined.includes(cleaned.split(" ")[0] || "") ? 5 : 0);

      return { portal, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((item) => item.portal);
};

const initialUsers: UserRecord[] = [
  { id: 1, name: "Adit Pratama", email: "adit@twinlearn.id", role: "Super admin", status: "Aktif", lastLogin: "2 menit lalu", permissions: ["Manage users", "Billing", "System settings"] },
  { id: 2, name: "Nadia Kusuma", email: "nadia@twinlearn.id", role: "Admin", status: "Aktif", lastLogin: "18 menit lalu", permissions: ["Create courses", "Moderate content", "Reports"] },
  { id: 3, name: "Raka Putra", email: "raka@membership.id", role: "Membership", status: "Aktif", lastLogin: "1 jam lalu", permissions: ["Access premium courses", "Download files"] },
  { id: 4, name: "Salsa Dewi", email: "salsa@free.id", role: "Free Member", status: "Pending", lastLogin: "Kemarin", permissions: ["Basic access"] },
  { id: 5, name: "Bimo Wijaya", email: "bimo@twinlearn.id", role: "Free Member", status: "Nonaktif", lastLogin: "1 minggu lalu", permissions: ["Basic access"] },
];

const courses: Course[] = [
  { id: 1, title: "Dasar-Dasar Digital Twin", category: "Fundamental", level: "Pemula", mentor: "Dr. Raka Pratama", rating: "4.9", learners: "1.2k", duration: "6 jam", price: "Gratis", color: "violet", tags: ["Beginner", "Core"] },
  { id: 2, title: "IoT Sensor untuk Smart Factory", category: "IoT & Sensor", level: "Menengah", mentor: "Nadia Kusuma", rating: "4.8", learners: "892", duration: "8 jam", price: "Rp 249K", color: "cyan", tags: ["IoT", "Hands-on"] },
  { id: 3, title: "Simulasi Digital Twin dengan Python", category: "Simulation", level: "Menengah", mentor: "Fajar Wicaksono", rating: "4.9", learners: "756", duration: "10 jam", price: "Rp 299K", color: "blue", tags: ["Python", "Simulation"] },
  { id: 4, title: "Predictive Maintenance Berbasis AI", category: "AI & Analytics", level: "Lanjutan", mentor: "Dr. Ayu Larasati", rating: "4.9", learners: "634", duration: "12 jam", price: "Rp 399K", color: "pink", tags: ["AI", "Industry"] },
  { id: 5, title: "Digital Twin untuk Smart City", category: "Smart City", level: "Menengah", mentor: "Arief Nugraha", rating: "4.7", learners: "521", duration: "7 jam", price: "Rp 199K", color: "green", tags: ["GIS", "City"] },
  { id: 6, title: "Visualisasi Data Real-Time", category: "Data Analytics", level: "Pemula", mentor: "Mira Salsabila", rating: "4.8", learners: "1.1k", duration: "5 jam", price: "Rp 149K", color: "orange", tags: ["Dashboard", "Data"] },
];
const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "beranda", label: "Beranda", icon: LayoutDashboard }, { id: "katalog", label: "Katalog", icon: BookOpen },
  { id: "kelas", label: "Kelas", icon: GraduationCap }, { id: "lab", label: "DT Lab", icon: Cpu },
];

function Logo() { return <div className="logo"><Image className="logo-image" src="/assets/IDTC_m.png" alt="Logo IDTC" width={28} height={28} priority /><span>IDTC <span>Learn</span></span></div>; }
function Stat({ value, label, icon: Icon }: { value: string; label: string; icon: typeof Users }) { return <div className="stat"><div className="stat-icon"><Icon size={17} /></div><div><strong>{value}</strong><span>{label}</span></div></div>; }
function Header({ view, setView, onAuthOpen }: { view: View; setView: (v: View) => void; onAuthOpen: (open: boolean) => void }) {
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState("");
  const suggestions = useMemo(() => recommendPortals(search), [search]);

  return <header className="topbar"><div className="topbar-inner"><button className="mobile-menu" onClick={() => setMobile(!mobile)}><Menu size={20} /></button><button onClick={() => setView("beranda")}><Logo /></button><nav className={mobile ? "main-nav open" : "main-nav"}>{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? "nav-link active" : "nav-link"} onClick={() => { setView(id); setMobile(false); }}><Icon size={16} />{label}</button>)}<button className={view === "pengajar" || view === "admin" ? "nav-link active" : "nav-link"} onClick={() => setView("pengajar")}><Users size={16} />Admin</button></nav><div className="top-actions"><div className="portal-search-wrap"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari portal geospasial..." aria-label="Cari portal" /><div className={search.trim() ? "portal-search-results" : "portal-search-results hidden"}>{suggestions.length > 0 ? suggestions.map((portal) => <a key={portal.name} href={portal.url} target="_blank" rel="noreferrer" onClick={() => setSearch("")}><span>{portal.name}</span><small>{portal.category}</small></a>) : <span className="portal-no-result">Coba: peta jalan PU, data BIM, GIS Jakarta, atau SIGI</span>}</div></div><button className="icon-button"><Bell size={18} /></button><button className="button small ghost" onClick={() => onAuthOpen(true)}>Masuk</button><button className="avatar" onClick={() => setView("admin")}>AR</button></div></div></header>;
}
function TwinVisual({ anomaly = false }: { anomaly?: boolean }) {
  const modelUrl = process.env.NEXT_PUBLIC_TWIN_MODEL_URL;

  return (
    <div className={`twin-visual building-visual ${anomaly ? "is-anomaly" : ""}`}>
      <div className="twin-stage">
        <ThreeTwinScene modelUrl={modelUrl} anomaly={anomaly} />
      </div>
      <div className="grid-floor" />
    </div>
  );
}
function CourseCard({ course, onOpen }: { course: Course; onOpen?: () => void }) { return <button className={`course-card accent-${course.color}`} onClick={onOpen}><div className="course-art"><span className="course-code">DT / {String(course.id).padStart(2, "0")}</span><div className="mini-orbit"><span /><i /><i /><i /></div><div className="art-label"><Zap size={14} /> DIGITAL TWIN</div></div><div className="course-body"><div className="tag-row">{course.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div><h3>{course.title}</h3><p className="mentor">{course.mentor}</p><div className="course-meta"><span><Star size={13} fill="currentColor" /> {course.rating}</span><span><Users size={13} /> {course.learners}</span><span><Clock3 size={13} /> {course.duration}</span></div><div className="course-bottom"><strong>{course.price}</strong><span>Pelajari <ArrowRight size={14} /></span></div></div></button>; }
function Hero({ setView }: { setView: (v: View) => void }) { return <section className="hero-section"><div className="hero-copy"><div className="eyebrow"><span className="pulse-dot" /> PLATFORM PEMBELAJARAN DIGITAL TWIN</div><h1>Belajar Digital Twin,<br /><em>Bangun Masa Depan</em> Industri.</h1><p>Pelajari simulasi aset fisik, IoT, data real-time, AI, dan analitik prediktif melalui pengalaman belajar yang dirancang untuk dunia nyata.</p><div className="hero-actions"><button className="button primary" onClick={() => setView("katalog")}>Mulai belajar <ArrowRight size={16} /></button><button className="button ghost" onClick={() => setView("katalog")}><Play size={15} fill="currentColor" /> Lihat kelas</button></div><div className="hero-stats"><Stat value="2.500+" label="Peserta aktif" icon={Users} /><Stat value="40+" label="Kelas terkurasi" icon={BookOpen} /><Stat value="25+" label="Mentor industri" icon={Award} /><Stat value="500+" label="Sertifikat" icon={Award} /></div></div><div className="hero-art"><TwinVisual /><div className="floating-card fc-one"><span className="tiny-icon cyan"><Activity size={15} /></span><div><b>Real-time insight</b><small>Data streaming aktif</small></div><span className="live-pill">LIVE</span></div><div className="floating-card fc-two"><div className="ring-progress">78<span>%</span></div><div><b>Progress belajar</b><small>3 modul minggu ini</small></div></div></div></section>; }
function Landing({ setView }: { setView: (v: View) => void }) { return <main><Hero setView={setView} /><section className="section-block"><div className="section-heading"><div><span className="eyebrow">EXPLORE BY TOPIC</span><h2>Bangun kompetensi yang relevan.</h2></div><button className="text-button" onClick={() => setView("katalog")}>Lihat semua kategori <ArrowRight size={15} /></button></div><div className="category-grid">{[[Cpu, "Fundamental Digital Twin", "Mulai dari fondasi", "violet"], [Radio, "IoT dan Sensor", "Hubungkan dunia nyata", "cyan"], [Settings2, "Smart Manufacturing", "Optimalkan produksi", "blue"], [Grid2X2, "Smart City", "Rancang kota adaptif", "green"], [LineChart, "Data Analytics", "Temukan pola data", "orange"], [BrainCircuit, "AI Predictive Maintenance", "Prediksi sebelum terjadi", "pink"]].map(([Icon, title, copy, color]) => <button className="category-card" key={title as string}><span className={`category-icon ${color as string}`}><Icon size={20} /></span><div><b>{title as string}</b><small>{copy as string}</small></div><ChevronRight size={17} /></button>)}</div></section><section className="section-block popular"><div className="section-heading"><div><span className="eyebrow">PILIHAN MINGGU INI</span><h2>Kelas yang sedang populer.</h2></div><button className="text-button" onClick={() => setView("katalog")}>Lihat katalog <ArrowRight size={15} /></button></div><div className="course-grid">{courses.slice(0, 3).map((course) => <CourseCard key={course.id} course={course} onOpen={() => setView("detail")} />)}</div></section><section className="mentor-band"><div><span className="eyebrow">BELAJAR DARI PRAKTISI</span><h2>Ilmu yang teruji<br /><em>di lapangan.</em></h2><p>Mentor kami membawa pengalaman membangun sistem Digital Twin di manufaktur, energi, dan pemerintahan.</p><button className="button primary">Kenali para mentor <ArrowRight size={16} /></button></div><div className="mentor-stack"><div className="mentor-avatar avatar-a">RK</div><div className="mentor-avatar avatar-b">AL</div><div className="mentor-avatar avatar-c">FN</div><div className="mentor-avatar avatar-d">MS</div><span>25+ expert industri</span></div></section><section className="testimonial"><div><span className="eyebrow">CERITA MEREKA</span><h2>Belajar lebih dekat<br />dengan dunia nyata.</h2></div><blockquote>“TwinLearn membuat konsep yang kompleks terasa sangat praktis. Saya bisa langsung menguji sensor dan model prediktif di Digital Twin Lab.”<footer><span className="quote-avatar">DP</span><span><b>Dimas Prakoso</b><small>Asset Reliability Engineer</small></span><span className="quote-stars">★★★★★</span></footer></blockquote></section><section className="teacher-cta"><Sparkles size={22} /><div><h3>Punya pengalaman untuk dibagikan?</h3><p>Bantu generasi berikutnya membangun sistem yang lebih cerdas.</p></div><button className="button light">Menjadi pengajar <ArrowRight size={16} /></button></section></main>; }
function Catalog({ setView }: { setView: (v: View) => void }) { const [query, setQuery] = useState(""); const [category, setCategory] = useState("Semua"); const filtered = courses.filter((course) => (category === "Semua" || course.category === category) && course.title.toLowerCase().includes(query.toLowerCase())); return <main className="page-main"><div className="page-heading"><div><span className="eyebrow">LEARNING CATALOG</span><h1>Temukan kelas<br /><em>untuk langkah berikutnya.</em></h1></div><p>Materi terkurasi untuk membangun Digital Twin dari ide sampai implementasi.</p></div><div className="filter-bar"><div className="search-field"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari kelas, topik, atau mentor..." /></div><select value={category} onChange={(e) => setCategory(e.target.value)}>{["Semua", ...Array.from(new Set(courses.map((course) => course.category)))].map((item) => <option key={item}>{item}</option>)}</select><button className="filter-button"><Settings2 size={16} /> Filter lainnya</button></div><div className="catalog-result"><span>{filtered.length} kelas ditemukan</span><button className="sort-button">Paling populer <ChevronDown size={14} /></button></div><div className="course-grid catalog-grid">{filtered.map((course) => <CourseCard key={course.id} course={course} onOpen={() => setView("detail")} />)}</div></main>; }
function ClassDetail({ setView }: { setView: (v: View) => void }) { const [open, setOpen] = useState(0); const course = courses[2]; return <main className="page-main detail-page"><button className="back-link" onClick={() => setView("katalog")}>← Kembali ke katalog</button><div className="detail-hero"><div><div className="tag-row"><span className="tag">Simulation</span><span className="tag">Python</span><span className="tag">Intermediate</span></div><h1>{course.title}</h1><p>Bangun model Digital Twin yang mampu membaca kondisi aset, menjalankan simulasi skenario, dan menghasilkan insight operasional menggunakan Python.</p><div className="detail-meta"><span><Star size={15} fill="currentColor" /> {course.rating} <small>(86 ulasan)</small></span><span><Users size={15} /> {course.learners} peserta</span><span><Clock3 size={15} /> {course.duration}</span></div></div><div className="detail-art"><TwinVisual /></div></div><div className="detail-layout"><div className="detail-content"><section className="detail-section"><span className="eyebrow">KURIKULUM</span><h2>Yang akan kamu pelajari</h2>{["Fondasi model dan data aset", "Membangun pipeline telemetry", "Simulasi what-if dengan Python", "Validasi model dan analisis hasil"].map((item, index) => <button className="module-row" key={item} onClick={() => setOpen(open === index ? -1 : index)}><span className="module-number">0{index + 1}</span><span><b>{item}</b>{open === index && <small>Video, latihan praktik, dan mini project untuk menguji pemahamanmu.</small>}</span><ChevronDown size={17} className={open === index ? "rotate" : ""} /></button>)}</section><section className="detail-section split-info"><div><span className="eyebrow">PRASYARAT</span><p>Dasar Python dan pemahaman spreadsheet. Tidak perlu pengalaman Digital Twin sebelumnya.</p></div><div><span className="eyebrow">SERTIFIKAT</span><p>Sertifikat digital setelah menyelesaikan seluruh modul dan project akhir.</p></div></section></div><aside className="enroll-card"><div className="price">{course.price}</div><p>Akses penuh selamanya</p><button className="button primary full" onClick={() => setView("kelas")}>Daftar kelas <ArrowRight size={16} /></button><div className="enroll-list"><span><Check size={15} /> 10 jam video dan praktik</span><span><Check size={15} /> Dataset dan starter code</span><span><Check size={15} /> Akses Digital Twin Lab</span><span><Check size={15} /> Sertifikat penyelesaian</span></div><div className="mentor-mini"><div className="mentor-avatar avatar-b">FN</div><span><small>Mentor kamu</small><b>Fajar Wicaksono</b></span></div></aside></div></main>; }
function StudentDashboard({ setView }: { setView: (v: View) => void }) { return <main className="page-main dashboard-page"><div className="dashboard-greeting"><div><span className="eyebrow">SENIN, 17 SEPTEMBER 2026</span><h1>Selamat pagi, <em>Aditya.</em></h1><p>Siap melanjutkan eksplorasi Digital Twin hari ini?</p></div><button className="button primary" onClick={() => setView("lab")}><Cpu size={16} /> Buka Digital Lab</button></div><div className="progress-panel"><div><span className="eyebrow">PROGRES BELAJAR</span><h2>Terus bergerak maju.</h2><p>3 dari 8 modul selesai di kelas yang sedang kamu ikuti.</p><div className="progress-line"><span style={{ width: "42%" }} /></div><small>42% selesai <b>•</b> estimasi 4 jam tersisa</small></div><div className="progress-ring"><strong>42<span>%</span></strong><small>overall progress</small></div></div><div className="dashboard-grid"><section className="dash-section"><div className="section-heading compact"><div><span className="eyebrow">KELAS SAYA</span><h2>Lanjutkan belajar</h2></div><button className="text-button">Lihat semua <ArrowRight size={14} /></button></div><div className="learning-row"><div className="learning-art accent-blue"><span>DT / 03</span><div className="mini-orbit"><i /><i /><i /></div></div><div className="learning-info"><span className="tag">SEDANG BERJALAN</span><h3>Simulasi Digital Twin dengan Python</h3><p>Modul 4 dari 8 • Simulasi kondisi normal</p><div className="progress-line"><span style={{ width: "42%" }} /></div><button className="button small primary" onClick={() => setView("kelas")}>Lanjutkan <ArrowRight size={14} /></button></div></div></section><section className="dash-section insight-card"><span className="insight-icon"><Sparkles size={19} /></span><span className="eyebrow">DIGITAL TWIN INSIGHT HARI INI</span><h3>Data yang baik membuat prediksi lebih tajam.</h3><p>Pastikan sensor memiliki interval pembacaan yang konsisten sebelum melatih model predictive maintenance.</p><button className="text-button">Baca insight <ArrowRight size={14} /></button></section></div><div className="dashboard-grid lower"><section className="dash-section"><div className="section-heading compact"><div><span className="eyebrow">JADWAL</span><h2>Agenda belajarmu</h2></div><CalendarDays size={18} /></div>{["Kuis: Data pipeline", "Live session bersama mentor", "Deadline mini project"].map((item, index) => <div className="agenda-row" key={item}><span className="date-box"><b>{18 + index * 2}</b><small>SEP</small></span><span><b>{item}</b><small>{index === 0 ? "Besok • 20 menit" : index === 1 ? "20 Sep • 19:00 WIB" : "22 Sep • 23:59 WIB"}</small></span><ChevronRight size={16} /></div>)}</section><section className="dash-section badges"><div className="section-heading compact"><div><span className="eyebrow">PENCAPAIAN</span><h2>Badge terbaru</h2></div><Award size={18} /></div><div className="badge-row"><div className="badge-medal"><Target size={24} /></div><div><b>First Simulation</b><small>Simulasi pertama selesai</small></div></div><div className="badge-row"><div className="badge-medal purple"><Zap size={24} /></div><div><b>Data Explorer</b><small>3 dataset dianalisis</small></div></div></section></div></main>; }
function Admin({ setView }: { setView: (v: View) => void }) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [selectedRole, setSelectedRole] = useState<UserRole | "Semua">("Semua");
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "Free Member" as UserRole, status: "Aktif" as UserRecord["status"] });
  const [isFormOpen, setIsFormOpen] = useState(false);

  const roleOptions: Array<UserRole | "Semua"> = ["Semua", ...ROLE_OPTIONS];
  const totalMembers = users.length;
  const roleCounts = useMemo(() => ({
    "Super admin": users.filter((user) => user.role === "Super admin").length,
    Admin: users.filter((user) => user.role === "Admin").length,
    Membership: users.filter((user) => user.role === "Membership").length,
    "Free Member": users.filter((user) => user.role === "Free Member").length,
  }), [users]);
  const filteredUsers = selectedRole === "Semua" ? users : users.filter((user) => user.role === selectedRole);

  const openCreateForm = () => {
    setFormMode("create");
    setEditingId(null);
    setForm({ name: "", email: "", role: "Free Member", status: "Aktif" });
    setIsFormOpen(true);
  };

  const openEditForm = (user: UserRecord) => {
    setFormMode("edit");
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, role: user.role, status: user.status });
    setIsFormOpen(true);
  };

  const submitUser = () => {
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    if (!trimmedName || !trimmedEmail) return;

    if (formMode === "create") {
      const nextUser: UserRecord = {
        id: Date.now(),
        name: trimmedName,
        email: trimmedEmail,
        role: form.role,
        status: form.status,
        lastLogin: "Baru dibuat",
        permissions: getRolePermissions(form.role),
      };

      setUsers((previous) => [nextUser, ...previous]);
    } else if (editingId !== null) {
      setUsers((previous) => previous.map((user) => user.id === editingId ? {
        ...user,
        name: trimmedName,
        email: trimmedEmail,
        role: form.role,
        status: form.status,
        permissions: getRolePermissions(form.role),
      } : user));
    }

    setIsFormOpen(false);
    setForm({ name: "", email: "", role: "Free Member", status: "Aktif" });
    setEditingId(null);
  };

  const updateUserRole = (userId: number, role: UserRole) => {
    setUsers((previous) => previous.map((user) => user.id === userId ? { ...user, role, permissions: getRolePermissions(role) } : user));
    const current = getCurrentUser();
    const currentRoleUser = users.find((user) => user.id === userId);
    if (current && current.email === currentRoleUser?.email) {
      setCurrentUserRole(role);
    }
  };

  return <main className="page-main admin-page"><div className="dashboard-greeting"><div><span className="eyebrow">CMS / ADMIN CONSOLE</span><h1>Control the <em>twin.</em></h1><p>Pantau ekosistem belajar TwinLearn dari satu ruang kendali.</p></div><button className="button primary" onClick={openCreateForm}><PlusIcon /> Buat user baru</button></div><div className="admin-stats"><Stat value={String(totalMembers)} label="Total pengguna" icon={Users} /><Stat value={String(roleCounts["Super admin"])} label="Super admin" icon={Target} /><Stat value={String(roleCounts.Admin)} label="Admin" icon={BookOpen} /><Stat value={String(roleCounts.Membership + roleCounts["Free Member"])} label="Member aktif" icon={LineChart} /></div>{isFormOpen && <div className="user-form-panel"><div className="section-heading compact"><div><span className="eyebrow">{formMode === "create" ? "CREATE USER" : "EDIT USER"}</span><h2>{formMode === "create" ? "Tambah anggota baru" : "Perbarui data user"}</h2></div><button className="text-button" onClick={() => setIsFormOpen(false)}>Tutup</button></div><div className="user-form-grid"><label><span>Nama</span><input value={form.name} onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))} placeholder="Nama lengkap" /></label><label><span>Email</span><input value={form.email} onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))} placeholder="email@domain.com" /></label><label><span>Role</span><select value={form.role} onChange={(event) => setForm((previous) => ({ ...previous, role: event.target.value as UserRole }))}>{ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}</select></label><label><span>Status</span><select value={form.status} onChange={(event) => setForm((previous) => ({ ...previous, status: event.target.value as UserRecord["status"] }))}><option value="Aktif">Aktif</option><option value="Pending">Pending</option><option value="Nonaktif">Nonaktif</option></select></label></div><div className="form-actions"><button className="button ghost" onClick={() => setIsFormOpen(false)}>Batal</button><button className="button primary" onClick={submitUser}>{formMode === "create" ? "Simpan user" : "Update user"}</button></div></div>}<section className="user-management-panel"><div className="section-heading compact"><div><span className="eyebrow">USER MANAGEMENT</span><h2>Kelola role & akses</h2></div><div className="role-filter">{roleOptions.map((role) => <button key={role} className={selectedRole === role ? "role-chip active" : "role-chip"} onClick={() => setSelectedRole(role)}>{role}</button>)}</div></div><div className="admin-table"><div className="user-table-head"><span>Pengguna</span><span>Role</span><span>Status</span><span>Terakhir login</span><span>Action</span></div>{filteredUsers.map((user) => <div className="user-row" key={user.id}><span className="table-avatar">{user.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}</span><span className="user-meta"><b>{user.name}</b><small>{user.email}</small></span><span className="role-cell"><select value={user.role} onChange={(event) => updateUserRole(user.id, event.target.value as UserRole)}><option>Super admin</option><option>Admin</option><option>Membership</option><option>Free Member</option></select></span><span className={user.status === "Aktif" ? "status-green" : user.status === "Pending" ? "status-yellow" : "status-red"}>{user.status}</span><span className="user-last-login">{user.lastLogin}</span><button className="text-button" onClick={() => openEditForm(user)}>Edit</button></div>)}</div></section><section className="permissions-panel"><div className="section-heading compact"><div><span className="eyebrow">ROLE ACCESS</span><h2>Izin berdasarkan role</h2></div></div><div className="permission-grid">{ROLE_OPTIONS.map((role) => <div className="permission-card" key={role}><div className="permission-head"><span className={role === "Super admin" ? "role-pill super" : role === "Admin" ? "role-pill admin" : role === "Membership" ? "role-pill membership" : "role-pill free"}>{role}</span></div><ul>{getRolePermissions(role).map((permission) => <li key={permission}>{permission}</li>)}</ul></div>)}</div></section></main>; }
function PlusIcon() { return <span>+</span>; }
export default function Home() {
  const [view, setView] = useState<View>("beranda");
  const [authOpen, setAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const isAdminArea = currentUser?.role === "Super admin" || currentUser?.role === "Admin";
  const effectiveView = currentUser && !isAdminArea && view === "admin" ? "kelas" : view;

  const content = effectiveView === "beranda" ? <Landing setView={setView} /> : effectiveView === "katalog" ? <Catalog setView={setView} /> : effectiveView === "kelas" ? <StudentDashboard setView={setView} /> : effectiveView === "detail" ? <ClassDetail setView={setView} /> : effectiveView === "lab" ? <DigitalTwinLab /> : <Admin setView={setView} />;

  return (
    <div className="app-shell">
      <Header view={effectiveView} setView={setView} onAuthOpen={setAuthOpen} />
      {authOpen && (
        <div className="auth-overlay" onClick={() => setAuthOpen(false)}>
          <div className="auth-modal" onClick={(event) => event.stopPropagation()}>
            <AuthGate onAuthenticated={(user) => { setCurrentUser(user); setAuthOpen(false); }} />
          </div>
        </div>
      )}
      {currentUser && !isAdminArea && effectiveView === "admin" && (
        <div className="page-note">Akses admin dibatasi untuk role Super admin dan Admin.</div>
      )}
      {content}
      <footer className="footer"><Logo /><span>© 2026 IDTC Learn | Digital Twin Indonesia.</span><div><a href="#">Tentang</a><a href="#">Bantuan</a><a href="#">Privasi</a></div></footer>
    </div>
  );
}

