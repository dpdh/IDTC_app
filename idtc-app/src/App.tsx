import { useState } from 'react'
import './App.css'

type MenuKey = 'literasi' | 'regulasi' | 'referensi' | 'project' | 'profil'

const menuItems: { key: MenuKey; label: string; icon: string }[] = [
  { key: 'literasi', label: 'Literasi', icon: '◎' },
  { key: 'regulasi', label: 'Regulasi', icon: '▤' },
  { key: 'referensi', label: 'Referensi', icon: '▥' },
  { key: 'project', label: 'Project DT', icon: '⌁' },
  { key: 'profil', label: 'Profil', icon: '◉' },
]

const learningCards = [
  { number: '01', title: 'Data nyata', text: 'Sensor membaca suhu, getaran, tekanan, lokasi, dan energi dari aset fisik.', icon: '⌁' },
  { number: '02', title: 'Model digital', text: 'Data diperkaya dengan model 3D, simulasi, AI, dan aturan operasional.', icon: '◈' },
  { number: '03', title: 'Keputusan', text: 'Insight menjadi alarm, rekomendasi, atau kontrol untuk tindakan yang tepat.', icon: '↗' },
]

const twinTypes = ['Component Twin', 'Asset Twin', 'System Twin', 'Process Twin']

type AppScreen = 'onboarding' | 'auth' | 'app'
type AuthMode = 'login' | 'register'
type ThemeMode = 'light' | 'dark'

const onboardingSlides = [
  { kicker: '01 / KENALI', title: 'Kembaran digital\nuntuk dunia nyata.', text: 'Digital Twin adalah representasi digital dinamis dari objek, proses, sistem, atau lingkungan fisik.', art: 'orbit' },
  { kicker: '02 / HUBUNGKAN', title: 'Data fisik\nmenjadi insight.', text: 'Sensor IoT mengirim suhu, getaran, tekanan, lokasi, dan energi secara berkala atau real-time.', art: 'signal' },
  { kicker: '03 / MODELKAN', title: 'Bangun model\nyang hidup.', text: 'Model digital menggabungkan visualisasi, data operasional, analitik, AI, dan aturan bisnis.', art: 'layers' },
  { kicker: '04 / PANTAU', title: 'Lihat kondisi\ndengan jernih.', text: 'Pantau kesehatan aset dan temukan anomali sebelum masalah mengganggu operasi.', art: 'pulse' },
  { kicker: '05 / PREDIKSI', title: 'Antisipasi sebelum\nkerusakan terjadi.', text: 'Prediksi maintenance membantu menekan downtime, biaya, dan risiko operasional.', art: 'predict' },
  { kicker: '06 / SIMULASIKAN', title: 'Uji keputusan\nsebelum bertindak.', text: 'Coba berbagai skenario secara virtual tanpa menghentikan mesin atau sistem sebenarnya.', art: 'scenario' },
  { kicker: '07 / BERTINDAK', title: 'Dari data menuju\nkeputusan nyata.', text: 'Mulai perjalanan literasi Digital Twin dan bangun sistem yang lebih adaptif.', art: 'action' },
]

function OnboardingArt({ type }: { type: string }) {
  return <div className={`onboarding-art art-${type}`} aria-hidden="true"><span className="art-core">DT</span><i /><i /><i /><b>01</b><b>02</b><b>03</b></div>
}

function OnboardingView({ onFinish }: { onFinish: () => void }) {
  const [slide, setSlide] = useState(0)
  const current = onboardingSlides[slide]
  const isLast = slide === onboardingSlides.length - 1

  return <main className="onboarding-screen"><div className="onboarding-top"><div className="brand-mark">ID<span>TC</span></div><button type="button" onClick={onFinish}>Lewati</button></div><div className="onboarding-counter"><span>{String(slide + 1).padStart(2, '0')}</span><div>{onboardingSlides.map((item, index) => <i className={index === slide ? 'active' : ''} key={item.kicker} />)}</div><span>07</span></div><section className="onboarding-content"><p className="eyebrow">{current.kicker}</p><h1>{current.title.split('\n').map((line) => <span key={line}>{line}</span>)}</h1><p className="onboarding-copy">{current.text}</p><OnboardingArt type={current.art} /></section><div className="onboarding-actions"><button className="onboarding-next" type="button" onClick={() => isLast ? onFinish() : setSlide(slide + 1)}>{isLast ? 'Mulai menjelajah' : 'Lanjut' } <span>↗</span></button>{slide > 0 && <button className="back-button" type="button" onClick={() => setSlide(slide - 1)}>Kembali</button>}</div></main>
}

function AuthView({ mode, setMode, onSuccess }: { mode: AuthMode; setMode: (mode: AuthMode) => void; onSuccess: (email?: string) => void }) {
  const isLogin = mode === 'login'
  const [authError, setAuthError] = useState('')
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const formData = new FormData(event.currentTarget); const email = String(formData.get('email') ?? ''); const password = String(formData.get('password') ?? ''); if (isLogin && (email !== 'dani@idtc.org' || password !== 'Admin888')) { setAuthError('Email atau password belum sesuai.'); return } onSuccess(email) }
  return <main className="auth-screen"><div className="auth-brand"><div className="brand-mark">ID<span>TC</span></div><span className="auth-status">DIGITAL TWIN PLATFORM</span></div><section className="auth-panel"><p className="eyebrow">{isLogin ? 'SELAMAT DATANG KEMBALI' : 'MULAI PERJALANANMU'}</p><h1>{isLogin ? 'Masuk ke ruang belajar.' : 'Buat akun IDTC.'}</h1><p className="auth-intro">{isLogin ? 'Lanjutkan eksplorasi dan simpan progres literasi Digital Twin kamu.' : 'Bergabung untuk mempelajari, merancang, dan mengembangkan Digital Twin.'}</p><button className="google-button" type="button" onClick={() => onSuccess()}><span className="google-g">G</span> Lanjutkan dengan Google</button><div className="auth-divider"><span>atau dengan email</span></div><form onSubmit={submit}>{!isLogin && <label>Nama lengkap<input required name="name" type="text" placeholder="Nama kamu" /></label>}<label>Email<input required name="email" type="email" placeholder="nama@email.com" /></label><label>Password<input required name="password" type="password" placeholder="Minimal 8 karakter" minLength={8} /></label>{!isLogin && <label className="check-label"><input required name="terms" type="checkbox" /> <span>Saya menyetujui syarat dan kebijakan privasi.</span></label>}{authError && <p className="auth-error" role="alert">{authError}</p>}<button className="auth-submit" type="submit">{isLogin ? 'Masuk' : 'Daftar sekarang'} <span>↗</span></button></form>{isLogin && <button className="forgot-button" type="button">Lupa password?</button>}<p className="auth-switch">{isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'} <button type="button" onClick={() => setMode(isLogin ? 'register' : 'login')}>{isLogin ? 'Daftar di sini' : 'Masuk di sini'}</button></p></section><button className="auth-back" type="button" onClick={() => setMode(isLogin ? 'register' : 'login')}>← {isLogin ? 'Buat akun baru' : 'Kembali ke login'}</button></main>
}

function ProfileView({ theme, setTheme, futuristic, setFuturistic, isSuperAdmin, restartOnboarding }: { theme: ThemeMode; setTheme: (theme: ThemeMode) => void; futuristic: boolean; setFuturistic: (enabled: boolean) => void; isSuperAdmin: boolean; restartOnboarding: () => void }) {
  return <section className="profile-view"><div className="profile-hero"><div className="profile-avatar">DH</div><div><p className="eyebrow">AKUN AKTIF</p><h1>Dani Hamdani</h1><p>dani@idtc.org</p><small className="profile-origin">Orang Sunda</small></div><span className="online-dot" /></div>{isSuperAdmin && <div className="admin-banner"><span>✦</span><div><strong>Super Admin</strong><small>Kontrol penuh platform IDTC</small></div><b>ADMIN</b></div>}<section className="settings-section"><div className="settings-heading"><p className="eyebrow">PREFERENSI</p><h2>Ruang kerja kamu</h2></div><div className="setting-row"><span className="setting-icon">◐</span><div><strong>Mode tampilan</strong><small>{theme === 'dark' ? 'Mode gelap aktif' : 'Mode terang aktif'}</small></div><div className="segmented"><button className={theme === 'light' ? 'selected' : ''} type="button" onClick={() => setTheme('light')}>Terang</button><button className={theme === 'dark' ? 'selected' : ''} type="button" onClick={() => setTheme('dark')}>Gelap</button></div></div><div className="setting-row"><span className="setting-icon">✧</span><div><strong>Futuristic theme</strong><small>Gradien biru, grid, dan efek neon</small></div><button className={`switch ${futuristic ? 'on' : ''}`} type="button" aria-label="Aktifkan tema futuristik" onClick={() => setFuturistic(!futuristic)}><i /></button></div></section><section className="profile-actions"><button type="button" onClick={restartOnboarding}><span>◈</span><div><strong>Ulangi onboarding</strong><small>Pelajari kembali dasar Digital Twin</small></div><b>↗</b></button>{isSuperAdmin && <button type="button" className="user-management"><span>◎</span><div><strong>User Management</strong><small>Kelola pengguna, akses, dan peran</small></div><b>↗</b></button>}</section><button className="logout-button" type="button">Keluar dari akun</button></section>
}

function LiterasiView() {
  return <>
    <section className="welcome-card">
      <div><p className="eyebrow">DASAR DIGITAL TWIN</p><h1>Melihat dunia nyata<br /><em>lebih jernih.</em></h1><p>Pelajari cara data fisik berubah menjadi insight, simulasi, dan keputusan.</p></div>
      <div className="twin-orbit"><span>DT</span><i className="orbit-dot dot-a" /><i className="orbit-dot dot-b" /><i className="orbit-dot dot-c" /></div>
    </section>
    <section className="section-block"><div className="section-title"><div><p className="eyebrow">MATERI UTAMA</p><h2>Mulai dari konsepnya</h2></div><span>01 / 04</span></div><p className="intro-copy">Digital twin adalah representasi digital yang dinamis dari objek, proses, sistem, atau lingkungan nyata yang terus diperbarui oleh data aktual.</p><div className="learning-list">{learningCards.map((card) => <article className="learning-card" key={card.number}><span className="card-number">{card.number}</span><span className="card-symbol">{card.icon}</span><h3>{card.title}</h3><p>{card.text}</p></article>)}</div></section>
    <section className="section-block tinted"><div className="section-title"><div><p className="eyebrow">TINGKATAN</p><h2>Dari model menuju twin</h2></div></div><div className="level-list"><div><b>01</b><span><strong>Digital model</strong> Dibuat manual, belum terhubung ke aset.</span></div><div><b>02</b><span><strong>Digital shadow</strong> Data mengalir ke model tanpa kontrol balik.</span></div><div className="active-level"><b>03</b><span><strong>Digital twin</strong> Data mengalir dua arah dan bisa memengaruhi aset.</span></div><div><b>04</b><span><strong>Autonomous twin</strong> AI mengambil tindakan dengan intervensi minimal.</span></div></div></section>
    <section className="section-block"><div className="section-title"><div><p className="eyebrow">JELAJAHI LEBIH LANJUT</p><h2>Jenis digital twin</h2></div></div><div className="type-grid">{twinTypes.map((type, index) => <div className="type-item" key={type}><span>0{index + 1}</span><strong>{type}</strong><small>{['Satu komponen kecil', 'Satu aset utuh', 'Interaksi banyak aset', 'Alur operasi end-to-end'][index]}</small></div>)}</div></section>
  </>
}

function SimpleView({ menu, ...profileProps }: { menu: MenuKey; theme: ThemeMode; setTheme: (theme: ThemeMode) => void; futuristic: boolean; setFuturistic: (enabled: boolean) => void; isSuperAdmin: boolean; restartOnboarding: () => void }) {
  if (menu === 'profil') return <ProfileView {...profileProps} />
  const content = {
    regulasi: { eyebrow: 'PUSAT REGULASI', title: 'Rambu untuk inovasi yang bertanggung jawab.', text: 'Temukan panduan, standar, dan prinsip tata kelola data untuk implementasi Digital Twin.', items: ['Tata kelola data & privasi', 'Keamanan siber aset terhubung', 'Standar interoperabilitas', 'Etika AI dan otomasi'] },
    referensi: { eyebrow: 'PERPUSTAKAAN', title: 'Sumber untuk terus belajar.', text: 'Kumpulan bacaan, istilah, dan referensi teknologi yang membantu memperdalam pemahaman.', items: ['Glosarium Digital Twin', 'IoT, cloud, dan edge computing', 'Simulasi & predictive maintenance', 'BIM dan pemodelan 3D'] },
    project: { eyebrow: 'WORKSPACE', title: 'Project DT kamu, terpantau.', text: 'Kelola ide dan progres penerapan Digital Twin dalam satu ruang kerja ringkas.', items: ['Pilot project manufaktur', 'Monitoring energi gedung', 'Dashboard aset prioritas', 'Eksperimen sensor IoT'] },
    profil: { eyebrow: 'AKUN SAYA', title: 'Belajar sesuai ritmemu.', text: 'Simpan materi favorit dan pantau progres literasi Digital Twin kamu.', items: ['Progres belajar 32%', '3 materi tersimpan', 'Level: Explorer', 'Atur notifikasi'] },
    literasi: { eyebrow: '', title: '', text: '', items: [] },
  }[menu]

  return <section className={`simple-view ${menu}`}><div className="simple-hero"><p className="eyebrow">{content.eyebrow}</p><h1>{content.title}</h1><p>{content.text}</p></div><div className="simple-list">{content.items.map((item, index) => <button type="button" key={item}><span>0{index + 1}</span><strong>{item}</strong><i>↗</i></button>)}</div>{menu === 'project' && <button className="primary-button full-button" type="button">+ Buat project baru</button>}</section>
}

function App() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>('literasi')
  const [screen, setScreen] = useState<AppScreen>('onboarding')
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [theme, setTheme] = useState<ThemeMode>('light')
  const [futuristic, setFuturistic] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  if (screen === 'onboarding') return <OnboardingView onFinish={() => setScreen('auth')} />
  if (screen === 'auth') return <AuthView mode={authMode} setMode={setAuthMode} onSuccess={(email) => { setIsSuperAdmin(email === 'dani@idtc.org'); setScreen('app') }} />

  return (
    <main className={`mobile-app ${theme === 'dark' ? 'theme-dark' : ''} ${futuristic ? 'theme-futuristic' : ''}`}>
      <header className="app-header"><div className="brand-mark">ID<span>TC</span></div><button className="header-action" type="button" aria-label="Notifikasi">♧<b /></button></header>
      <div className="app-content">{activeMenu === 'literasi' ? <LiterasiView /> : <SimpleView menu={activeMenu} theme={theme} setTheme={setTheme} futuristic={futuristic} setFuturistic={setFuturistic} isSuperAdmin={isSuperAdmin} restartOnboarding={() => setScreen('onboarding')} />}</div>
      <nav className="bottom-nav" aria-label="Menu utama">{menuItems.map((item) => <button className={activeMenu === item.key ? 'active' : ''} key={item.key} type="button" onClick={() => setActiveMenu(item.key)}><span className="nav-icon">{item.icon}</span><span>{item.label}</span></button>)}</nav>
    </main>
  )
}

export default App
