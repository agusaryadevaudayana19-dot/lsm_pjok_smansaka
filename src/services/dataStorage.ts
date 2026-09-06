import {
  User,
  Kelas,
  MataPelajaran,
  Materi,
  Tugas,
  PengumpulanTugas,
  Quiz,
  Soal,
  JawabanQuiz,
  PenilaianPraktik,
  PresensiRecord,
  JurnalMengajar,
  NotifikasiItem,
  RekapNilaiMurid,
  PengaturanSekolah,
} from '../types';

export interface LMSDatabase {
  users: User[];
  kelas: Kelas[];
  mataPelajaran: MataPelajaran[];
  materi: Materi[];
  tugas: Tugas[];
  pengumpulanTugas: PengumpulanTugas[];
  quiz: Quiz[];
  jawabanQuiz: JawabanQuiz[];
  penilaianPraktik: PenilaianPraktik[];
  presensi: PresensiRecord[];
  jurnal: JurnalMengajar[];
  notifikasi: NotifikasiItem[];
  nilai: RekapNilaiMurid[];
  settings: PengaturanSekolah;
}

const STORAGE_KEY = 'lms_pjok_db_v1';

const DEFAULT_QUIZ_SOAL: Soal[] = [
  {
    id: 'soal-1',
    quizId: 'qz-1',
    pertanyaan:
      'Ketika seorang pemain menerima smash keras lawan, mengapa posisi tangan passing bawah harus dikunci lurus dan siku tidak boleh tertekuk?',
    tipe: 'Pilihan Ganda',
    kategoriSoal: 'HOTS',
    pilihan: [
      'Agar pantulan bola stabil dan arah lambungan mudah dikontrol ke arah setter',
      'Agar bola langsung kembali ke lapangan lawan tanpa disentuh setter',
      'Untuk menghindari pelanggaran double touch oleh wasit',
      'Agar kecepatan bola meningkat tajam saat memantul ke atas',
    ],
    kunciJawaban: 'Agar pantulan bola stabil dan arah lambungan mudah dikontrol ke arah setter',
    pembahasan:
      'Siku yang dikunci lurus menciptakan bidang datar solid pada lengan bawah, meminimalkan getaran dan menghasilkan pantulan elastis yang terarah.',
    bobot: 25,
  },
  {
    id: 'soal-2',
    quizId: 'qz-1',
    pertanyaan:
      'Dalam sistem perputaran pemain (rotasi) bola voli modern, rotasi dilakukan searah jarum jam setiap kali regu penerima servis berhasil mematikan bola lawan.',
    tipe: 'Benar/Salah',
    kategoriSoal: 'AKM',
    pilihan: ['Benar', 'Salah'],
    kunciJawaban: 'Benar',
    pembahasan:
      'Rotasi searah jarum jam (posisi 1 ke 6, 6 ke 5, dst) dilakukan saat tim berpindah hak servis.',
    bobot: 25,
  },
  {
    id: 'soal-3',
    quizId: 'qz-1',
    pertanyaan:
      'Berapa jumlah sentuhan maksimal yang diperbolehkan bagi satu tim sebelum bola harus diseberangkan ke daerah lawan (tidak termasuk sentuhan block)?',
    tipe: 'Pilihan Ganda',
    kategoriSoal: 'Standar',
    pilihan: ['1 kali', '2 kali', '3 kali', '4 kali'],
    kunciJawaban: '3 kali',
    pembahasan:
      'Satu tim berhak menyentuh bola maksimal 3 kali (biasanya dig-set-spike) sebelum bola melewati net.',
    bobot: 25,
  },
  {
    id: 'soal-4',
    quizId: 'qz-1',
    pertanyaan:
      'Pemain bertahan khusus dalam permainan bola voli yang bertugas murni menahan serangan dan dilarang melakukan smash ataupun servis disebut...',
    tipe: 'Isian',
    kategoriSoal: 'Standar',
    pilihan: [],
    kunciJawaban: 'Libero',
    pembahasan: 'Libero memakai seragam berbeda warna dan memiliki aturan spesifik pertahanan.',
    bobot: 25,
  },
];

export const INITIAL_DATABASE: LMSDatabase = {
  settings: {
    namaSekolah: 'SMAN 1 Olahraga Nusantara',
    logoSekolah: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=150&auto=format&fit=crop&q=80',
    tahunPelajaran: '2026/2027',
    semester: 'Ganjil',
    namaKepalaSekolah: 'Dr. Drs. I Nyoman Sukadana, M.Pd.',
    nipKepalaSekolah: '19690815 199412 1 002',
    namaGuruPJOKUtama: 'Haryono, S.Pd.Jas, M.Or.',
    nipGuruPJOKUtama: '19850314 201001 1 018',
    mataPelajaran: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    temaWarna: 'Biru & Hijau Sportif',
    terakhirSinkron: new Date().toISOString(),
  },
  users: [
    {
      id: 'usr-admin-1',
      username: 'admin',
      role: 'ADMIN',
      name: 'Bambang Sudrajat, M.Kom',
      nip: '19780512 200501 1 009',
      email: 'admin.pjok@sman1olahraga.sch.id',
      status: 'Aktif',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-guru-1',
      username: 'guru',
      role: 'GURU',
      name: 'Haryono, S.Pd.Jas, M.Or.',
      nip: '19850314 201001 1 018',
      mataPelajaran: 'PJOK Fase E & F',
      email: 'haryono.pjok@sman1olahraga.sch.id',
      status: 'Aktif',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-guru-2',
      username: 'ratna',
      role: 'GURU',
      name: 'Ratna Sartika, S.Pd.',
      nip: '19901020 201502 2 004',
      mataPelajaran: 'PJOK Putri & Senam',
      email: 'ratna.pjok@sman1olahraga.sch.id',
      status: 'Aktif',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-murid-1',
      username: 'murid',
      role: 'MURID',
      name: 'Andi Pratama',
      nis: '240101',
      nisn: '0089123451',
      kelasId: 'cls-xi-1',
      jenisKelamin: 'L',
      tahunPelajaran: '2026/2027',
      email: 'andi.pratama@siswa.sman1olahraga.sch.id',
      status: 'Aktif',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-murid-2',
      username: 'budi',
      role: 'MURID',
      name: 'Budi Santoso',
      nis: '240102',
      nisn: '0089123452',
      kelasId: 'cls-xi-1',
      jenisKelamin: 'L',
      tahunPelajaran: '2026/2027',
      email: 'budi.santoso@siswa.sman1olahraga.sch.id',
      status: 'Aktif',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-murid-3',
      username: 'citra',
      role: 'MURID',
      name: 'Citra Dewi',
      nis: '240103',
      nisn: '0089123453',
      kelasId: 'cls-xi-1',
      jenisKelamin: 'P',
      tahunPelajaran: '2026/2027',
      email: 'citra.dewi@siswa.sman1olahraga.sch.id',
      status: 'Aktif',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-murid-4',
      username: 'dewi',
      role: 'MURID',
      name: 'Dewi Lestari',
      nis: '240104',
      nisn: '0089123454',
      kelasId: 'cls-xi-1',
      jenisKelamin: 'P',
      tahunPelajaran: '2026/2027',
      email: 'dewi.lestari@siswa.sman1olahraga.sch.id',
      status: 'Aktif',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-murid-5',
      username: 'eko',
      role: 'MURID',
      name: 'Eko Saputra',
      nis: '240105',
      nisn: '0089123455',
      kelasId: 'cls-xi-2',
      jenisKelamin: 'L',
      tahunPelajaran: '2026/2027',
      email: 'eko.saputra@siswa.sman1olahraga.sch.id',
      status: 'Aktif',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-murid-6',
      username: 'fajar',
      role: 'MURID',
      name: 'Fajar Ramadhan',
      nis: '240106',
      nisn: '0089123456',
      kelasId: 'cls-xi-2',
      jenisKelamin: 'L',
      tahunPelajaran: '2026/2027',
      email: 'fajar.r@siswa.sman1olahraga.sch.id',
      status: 'Aktif',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-murid-7',
      username: 'gita',
      role: 'MURID',
      name: 'Gita Gutawa',
      nis: '240107',
      nisn: '0089123457',
      kelasId: 'cls-xi-3',
      jenisKelamin: 'P',
      tahunPelajaran: '2026/2027',
      email: 'gita.g@siswa.sman1olahraga.sch.id',
      status: 'Aktif',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    },
  ],
  kelas: [
    {
      id: 'cls-xi-1',
      nama: 'XI 1',
      tingkat: 'XI',
      waliKelasId: 'usr-guru-1',
      waliKelasNama: 'Haryono, S.Pd.Jas',
      guruPengampuId: 'usr-guru-1',
      guruPengampuNama: 'Haryono, S.Pd.Jas',
      tahunPelajaran: '2026/2027',
      totalMurid: 34,
    },
    {
      id: 'cls-xi-2',
      nama: 'XI 2',
      tingkat: 'XI',
      waliKelasId: 'usr-guru-2',
      waliKelasNama: 'Ratna Sartika, S.Pd.',
      guruPengampuId: 'usr-guru-1',
      guruPengampuNama: 'Haryono, S.Pd.Jas',
      tahunPelajaran: '2026/2027',
      totalMurid: 32,
    },
    {
      id: 'cls-xi-3',
      nama: 'XI 3',
      tingkat: 'XI',
      waliKelasId: 'usr-guru-1',
      waliKelasNama: 'Haryono, S.Pd.Jas',
      guruPengampuId: 'usr-guru-2',
      guruPengampuNama: 'Ratna Sartika, S.Pd.',
      tahunPelajaran: '2026/2027',
      totalMurid: 33,
    },
    {
      id: 'cls-xi-4',
      nama: 'XI 4',
      tingkat: 'XI',
      waliKelasId: 'usr-guru-2',
      waliKelasNama: 'Ratna Sartika, S.Pd.',
      guruPengampuId: 'usr-guru-1',
      guruPengampuNama: 'Haryono, S.Pd.Jas',
      tahunPelajaran: '2026/2027',
      totalMurid: 34,
    },
    {
      id: 'cls-xi-5',
      nama: 'XI 5',
      tingkat: 'XI',
      waliKelasId: 'usr-guru-1',
      waliKelasNama: 'Haryono, S.Pd.Jas',
      guruPengampuId: 'usr-guru-2',
      guruPengampuNama: 'Ratna Sartika, S.Pd.',
      tahunPelajaran: '2026/2027',
      totalMurid: 32,
    },
    {
      id: 'cls-xi-6',
      nama: 'XI 6',
      tingkat: 'XI',
      waliKelasId: 'usr-guru-1',
      waliKelasNama: 'Haryono, S.Pd.Jas',
      guruPengampuId: 'usr-guru-1',
      guruPengampuNama: 'Haryono, S.Pd.Jas',
      tahunPelajaran: '2026/2027',
      totalMurid: 30,
    },
    {
      id: 'cls-xi-7',
      nama: 'XI 7',
      tingkat: 'XI',
      waliKelasId: 'usr-guru-2',
      waliKelasNama: 'Ratna Sartika, S.Pd.',
      guruPengampuId: 'usr-guru-1',
      guruPengampuNama: 'Haryono, S.Pd.Jas',
      tahunPelajaran: '2026/2027',
      totalMurid: 31,
    },
  ],
  mataPelajaran: [
    {
      id: 'mp-pjok-f',
      nama: 'PJOK',
      fase: 'F',
      tingkat: 'Kelas XI',
      tahunPelajaran: '2026/2027',
      guruPengampuId: 'usr-guru-1',
      guruPengampuNama: 'Haryono, S.Pd.Jas, M.Or.',
    },
  ],
  materi: [
    {
      id: 'mat-1',
      judul: 'Teknik Dasar & Taktik Permainan Bola Voli',
      kategori: 'Bola Voli',
      kelasId: 'cls-xi-1',
      kelasNama: 'XI 1',
      fase: 'F',
      semester: '1',
      tujuanPembelajaran:
        'Peserta didik mampu menganalisis dan mempraktikkan keterampilan variasi pola gerak dasar passing bawah, passing atas, dan servis mengapung dalam permainan bola voli secara efektif dan suportif.',
      deskripsi:
        'Materi mencakup pengenalan posisi siap (ready position), perkenaan bola pada lengan bawah, ayunan tangan, dan rotasi posisi lapangan 6 orang.',
      kontenTeks: `### 1. Passing Bawah (Underhand Pass)
Passing bawah merupakan teknik dasar yang sangat esensial untuk menerima servis lawan maupun menahan spike (serangan tajam).
Kunci keberhasilan passing bawah:
- **Kaki**: Dibuka selebar bahu, salah satu kaki sedikit di depan, lutut ditekuk membentuk sudut 100-110 derajat.
- **Tangan**: Kedua ibu jari sejajar rapat, telapak tangan saling mengunci tanpa menekuk siku saat memukul bola.
- **Perkenaan**: Bola menyentuh bagian proksimal pergelangan tangan (sekitar 5-10 cm di atas pergelangan).
- **Gerakan Lanjutan**: Dorongan berasal dari meluruskan tungkai kaki, bukan semata-mata mengayunkan lengan.

### 2. Passing Atas (Overhand Set)
Digunakan untuk mengumpan bola ke spiker dengan presisi tinggi.
- Bentuk jari-jari tangan seperti mangkuk terbuka tepat di depan dahi.
- Sentuhan bola hanya dengan ruas-ruas jari, hindari menyentuh telapak tangan.`,
      videoUrl: 'https://www.youtube.com/watch?v=0e68H4Q26pA',
      gambarUrl: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&auto=format&fit=crop&q=80',
      pdfUrl: 'https://pjok.kemdikbud.go.id/modul-bola-voli-fase-f.pdf',
      linkSumber: 'https://kemdikbud.go.id/kurikulum-merdeka/pjok',
      aktivitasMurid:
        'Praktikkan passing bawah berpasangan sebanyak 20 kali tanpa bola jatuh bersama rekan kelompokmu di lapangan.',
      dibuatOleh: 'Haryono, S.Pd.Jas',
      tanggalDibuat: '2026-08-20',
    },
    {
      id: 'mat-2',
      judul: 'Permainan Bola Basket: Pola Serangan & Fastbreak',
      kategori: 'Bola Basket',
      kelasId: 'cls-xi-1',
      kelasNama: 'XI 1',
      fase: 'F',
      semester: '1',
      tujuanPembelajaran:
        'Menganalisis konsep gerak dribble zigzag, crossover, chest pass dinamis, dan penyelesaian lay-up shoot dari sisi kanan maupun kiri ring.',
      deskripsi:
        'Materi ini menekankan kecepatan pengambilan keputusan saat transisi menyerang dan akurasi lay-up di bawah tekanan lawan.',
      kontenTeks: `### Fundamental Bola Basket
1. **Dribble Rendah**: Melindungi bola dari jangkauan lawan dengan membungkukkan badan.
2. **Chest Pass & Bounce Pass**: Umpan cepat setinggi dada dan umpan pantul untuk membelah pertahanan zone defense.
3. **Lay-Up Shoot**: Langkah berirama dua langkah (kanan-kiri-lompat) dengan memantulkan bola di sudut kotak papan pantul.`,
      videoUrl: 'https://www.youtube.com/watch?v=3g83hM-nBf4',
      gambarUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80',
      aktivitasMurid:
        'Buat video rekaman gerak lambat lay-up shoot dengan langkah yang benar dan unggah ke LMS.',
      dibuatOleh: 'Haryono, S.Pd.Jas',
      tanggalDibuat: '2026-08-25',
    },
    {
      id: 'mat-3',
      judul: 'Bulutangkis: Footwork Cepat & Teknik Smash Menukik',
      kategori: 'Bulutangkis',
      kelasId: 'cls-xi-1',
      kelasNama: 'XI 1',
      fase: 'F',
      semester: '1',
      tujuanPembelajaran:
        'Peserta didik mampu memperagakan kelincahan footwork 6 titik lapangan serta teknik pukulan forehand overhead smash dengan sudut menukik tajam.',
      deskripsi:
        'Penguasaan koordinasi langkah kaki (footwork) dan timing pukulan shuttlecock di titik tertinggi jangkauan raket.',
      kontenTeks: `### Footwork Bulutangkis
Langkah kaki adalah 70% keberhasilan bermain bulutangkis. Posisi tubuh selalu kembali ke titik tengah (home base) setelah melakukan pukulan.
### Pukulan Smash
Gunakan lecutan pergelangan tangan (pronation) saat raket menyentuh kepala shuttlecock di titik optimal.`,
      gambarUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
      aktivitasMurid:
        'Latihan shuttle-run 6 titik sudut lapangan selama 3 set x 30 detik untuk melatih daya ledak.',
      dibuatOleh: 'Haryono, S.Pd.Jas',
      tanggalDibuat: '2026-09-01',
    },
    {
      id: 'mat-4',
      judul: 'Kebugaran Jasmani & Pengukuran Denyut Nadi Maksimal',
      kategori: 'Kebugaran Jasmani',
      kelasId: 'cls-xi-1',
      kelasNama: 'XI 1',
      fase: 'F',
      semester: '1',
      tujuanPembelajaran:
        'Menganalisis derajat kebugaran jasmani melalui tes daya tahan aerobik (VO2Max) dan memahami rumus target heart rate.',
      deskripsi:
        'Memahami konsep 220 - Usia untuk menentukan intensitas latihan aerobik pada zona pembakaran lemak dan penguatan kardiovaskular.',
      kontenTeks: `### Komponen Kebugaran Jasmani
1. Daya Tahan Kardiorespirasi (Cardiovascular Endurance)
2. Kekuatan Otot (Muscular Strength)
3. Kelenturan (Flexibility)
4. Komposisi Tubuh (Body Composition)

**Rumus Denyut Nadi Maksimal (DNM):**
DNM = 220 - Usia
Zona Latihan Efektif: 65% - 85% dari DNM.`,
      gambarUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
      aktivitasMurid: 'Hitung denyut nadi istirahat pagi hari dan denyut nadi setelah berolahraga 15 menit.',
      dibuatOleh: 'Ratna Sartika, S.Pd.',
      tanggalDibuat: '2026-09-02',
    },
  ],
  tugas: [
    {
      id: 'tug-1',
      judul: 'Tugas Analisis Video Gerakan Passing Bawah Bola Voli',
      materiId: 'mat-1',
      materiJudul: 'Teknik Dasar & Taktik Permainan Bola Voli',
      kelasId: 'cls-xi-1',
      kelasNama: 'XI 1',
      instruksi:
        'Rekam video gerakan passing bawah mandiri atau berpasangan durasi 1-2 menit. Jelaskan 3 kesalahan umum (sikap badan terlalu tegak, siku menekuk, perkenaan tidak rata) yang sering terjadi pada awal belajar.',
      tanggalMulai: '2026-09-01',
      deadline: '2026-09-12 23:59',
      jenisPengumpulan: 'Video/Foto',
      status: 'Aktif',
      dibuatOleh: 'Haryono, S.Pd.Jas',
    },
    {
      id: 'tug-2',
      judul: 'Laporan Jurnal Kebugaran Jasmani Mandiri 7 Hari',
      materiId: 'mat-4',
      materiJudul: 'Kebugaran Jasmani & Pengukuran Denyut Nadi Maksimal',
      kelasId: 'cls-xi-1',
      kelasNama: 'XI 1',
      instruksi:
        'Catat aktivitas fisik selama 7 hari berturut-turut meliputi jenis olahraga (jogging, push up, plank, skipping), durasi menit, denyut nadi sebelum dan sesudah latihan.',
      tanggalMulai: '2026-09-03',
      deadline: '2026-09-15 23:59',
      jenisPengumpulan: 'Dokumen',
      status: 'Aktif',
      dibuatOleh: 'Ratna Sartika, S.Pd.',
    },
  ],
  pengumpulanTugas: [
    {
      id: 'sub-1',
      tugasId: 'tug-1',
      tugasJudul: 'Tugas Analisis Video Gerakan Passing Bawah Bola Voli',
      muridId: 'usr-murid-1',
      muridNama: 'Andi Pratama',
      kelasId: 'cls-xi-1',
      tanggalKumpul: '2026-09-04 14:30',
      isiJawaban:
        'Saya telah mengunggah rekaman video passing bawah di lapangan sekolah. Dari rekaman, saya memperhatikan posisi lutut sudah ditekuk stabil dan perkenaan pas di lengan bawah bagian dalam.',
      fileUrl: 'https://drive.google.com/file/d/sample-video-passing-andi.mp4',
      status: 'Dinilai',
      nilai: 92,
      komentarGuru:
        'Luar biasa Andi! Sikap awal sangat seimbang dan perkenaan bola konsisten. Pertahankan koordinasi gerakannya.',
    },
    {
      id: 'sub-2',
      tugasId: 'tug-1',
      tugasJudul: 'Tugas Analisis Video Gerakan Passing Bawah Bola Voli',
      muridId: 'usr-murid-2',
      muridNama: 'Budi Santoso',
      kelasId: 'cls-xi-1',
      tanggalKumpul: '2026-09-04 16:15',
      isiJawaban:
        'Video praktik passing bawah bersama rekan. Masih sedikit kaku saat bola datang terlalu cepat.',
      fileUrl: 'https://drive.google.com/file/d/sample-budi.mp4',
      status: 'Sudah Dikumpulkan',
      komentarGuru: 'Menunggu review guru PJOK.',
    },
  ],
  quiz: [
    {
      id: 'qz-1',
      judul: 'Quiz Pengetahuan: Aturan & Variasi Gerak Bola Voli (AKM/HOTS)',
      materiId: 'mat-1',
      materiJudul: 'Teknik Dasar & Taktik Permainan Bola Voli',
      kelasId: 'cls-xi-1',
      kelasNama: 'XI 1',
      durasiMenit: 20,
      batasWaktu: '2026-09-18 23:59',
      acakSoal: true,
      acakJawaban: true,
      dibuatOleh: 'Haryono, S.Pd.Jas',
      soal: DEFAULT_QUIZ_SOAL,
      soalList: DEFAULT_QUIZ_SOAL,
    },
  ],
  jawabanQuiz: [
    {
      id: 'jwb-1',
      quizId: 'qz-1',
      quizJudul: 'Quiz Pengetahuan: Aturan & Variasi Gerak Bola Voli (AKM/HOTS)',
      muridId: 'usr-murid-1',
      muridNama: 'Andi Pratama',
      kelasId: 'cls-xi-1',
      tanggalMengerjakan: '2026-09-04 10:15',
      nilai: 100,
      jumlahBenar: 4,
      jumlahSalah: 0,
      jawabanMurid: {
        'soal-1': 'Agar pantulan bola stabil dan arah lambungan mudah dikontrol ke arah setter',
        'soal-2': 'Benar',
        'soal-3': '3 kali',
        'soal-4': 'Libero',
      },
      status: 'Selesai',
    },
  ],
  penilaianPraktik: [
    {
      id: 'prk-1',
      kelasId: 'cls-xi-1',
      kelasNama: 'XI 1',
      materi: 'Passing Bawah & Servis Mengapung Bola Voli',
      muridId: 'usr-murid-1',
      muridNama: 'Andi Pratama',
      tanggal: '2026-09-04',
      aspekNilai: {
        sikapAwal: 4, // Sangat Berkembang
        teknikGerakan: 4,
        ketepatan: 3,
        koordinasi: 4,
        kerjaSama: 4,
        sportivitas: 4,
      },
      totalSkor: 23,
      rataRata: 3.83,
      nilaiAkhir: 96,
      predikat: 'A',
      catatanGuru: 'Gerakan sangat luwes, koordinasi tangan dan kaki harmonis. Mampu memimpin tim.',
      guruNama: 'Haryono, S.Pd.Jas',
    },
    {
      id: 'prk-2',
      kelasId: 'cls-xi-1',
      kelasNama: 'XI 1',
      materi: 'Passing Bawah & Servis Mengapung Bola Voli',
      muridId: 'usr-murid-2',
      muridNama: 'Budi Santoso',
      tanggal: '2026-09-04',
      aspekNilai: {
        sikapAwal: 3,
        teknikGerakan: 3,
        ketepatan: 3,
        koordinasi: 3,
        kerjaSama: 4,
        sportivitas: 4,
      },
      totalSkor: 20,
      rataRata: 3.33,
      nilaiAkhir: 83,
      predikat: 'B',
      catatanGuru: 'Sudah berkembang baik. Perbaiki kestabilan posisi telapak tangan.',
      guruNama: 'Haryono, S.Pd.Jas',
    },
    {
      id: 'prk-3',
      kelasId: 'cls-xi-1',
      kelasNama: 'XI 1',
      materi: 'Passing Bawah & Servis Mengapung Bola Voli',
      muridId: 'usr-murid-3',
      muridNama: 'Citra Dewi',
      tanggal: '2026-09-04',
      aspekNilai: {
        sikapAwal: 4,
        teknikGerakan: 4,
        ketepatan: 4,
        koordinasi: 3,
        kerjaSama: 4,
        sportivitas: 4,
      },
      totalSkor: 23,
      rataRata: 3.83,
      nilaiAkhir: 96,
      predikat: 'A',
      catatanGuru: 'Akurasi passing atas dan bawah sangat baik.',
      guruNama: 'Haryono, S.Pd.Jas',
    },
  ],
  presensi: [
    {
      id: 'pres-1',
      tanggal: '2026-09-05',
      kelasId: 'cls-xi-1',
      kelasNama: 'XI 1',
      muridId: 'usr-murid-1',
      muridNama: 'Andi Pratama',
      status: 'H',
      guruId: 'usr-guru-1',
      guruNama: 'Haryono, S.Pd.Jas',
    },
    {
      id: 'pres-2',
      tanggal: '2026-09-05',
      kelasId: 'cls-xi-1',
      kelasNama: 'XI 1',
      muridId: 'usr-murid-2',
      muridNama: 'Budi Santoso',
      status: 'H',
      guruId: 'usr-guru-1',
      guruNama: 'Haryono, S.Pd.Jas',
    },
    {
      id: 'pres-3',
      tanggal: '2026-09-05',
      kelasId: 'cls-xi-1',
      kelasNama: 'XI 1',
      muridId: 'usr-murid-3',
      muridNama: 'Citra Dewi',
      status: 'I',
      keterangan: 'Lomba Paduan Suara Daerah',
      guruId: 'usr-guru-1',
      guruNama: 'Haryono, S.Pd.Jas',
    },
    {
      id: 'pres-4',
      tanggal: '2026-09-05',
      kelasId: 'cls-xi-1',
      kelasNama: 'XI 1',
      muridId: 'usr-murid-4',
      muridNama: 'Dewi Lestari',
      status: 'S',
      keterangan: 'Demam & Flu',
      guruId: 'usr-guru-1',
      guruNama: 'Haryono, S.Pd.Jas',
    },
    {
      id: 'pres-5',
      tanggal: '2026-09-04',
      kelasId: 'cls-xi-1',
      kelasNama: 'XI 1',
      muridId: 'usr-murid-1',
      muridNama: 'Andi Pratama',
      status: 'H',
      guruId: 'usr-guru-1',
      guruNama: 'Haryono, S.Pd.Jas',
    },
    {
      id: 'pres-6',
      tanggal: '2026-09-03',
      kelasId: 'cls-xi-1',
      kelasNama: 'XI 1',
      muridId: 'usr-murid-1',
      muridNama: 'Andi Pratama',
      status: 'H',
      guruId: 'usr-guru-1',
      guruNama: 'Haryono, S.Pd.Jas',
    },
    {
      id: 'pres-7',
      tanggal: '2026-09-02',
      kelasId: 'cls-xi-1',
      kelasNama: 'XI 1',
      muridId: 'usr-murid-1',
      muridNama: 'Andi Pratama',
      status: 'H',
      guruId: 'usr-guru-1',
      guruNama: 'Haryono, S.Pd.Jas',
    },
  ],
  jurnal: [
    {
      id: 'jrn-1',
      tanggal: '2026-09-05',
      kelasId: 'cls-xi-1',
      kelasNama: 'XI 1',
      materi: 'Variasi Passing Bawah dan Formasi Bertahan Bola Voli',
      tujuanPembelajaran:
        'Peserta didik mampu melakukan gerak passing bawah berpasangan dengan akurasi 80% ke area setter.',
      kegiatanPembelajaran:
        'Pemanasan dinamis jogging keliling lapangan 3 putaran, stretching statis, drill berpasangan 15 menit, game simulasi 3v3 setengah lapangan.',
      metode: 'Demonstrasi Guru, Drill Praktik, dan Pembelajaran Berdiferensiasi',
      media: '10 Bola Voli Mikasa, Peluit Molten, Lapangan Utama SMAN 1, Kerucut Cone',
      kehadiranRingkas: 'Hadir: 32, Izin: 1, Sakit: 1, Alpa: 0',
      catatanRefleksi:
        'Mayoritas siswa sudah rileks saat kontak dengan bola. Perlu perhatian khusus bagi 4 siswa yang masih sering mengayun tangan terlalu tinggi di atas pundak.',
      guruId: 'usr-guru-1',
      guruNama: 'Haryono, S.Pd.Jas, M.Or.',
    },
  ],
  notifikasi: [
    {
      id: 'notif-1',
      judul: 'Tugas Baru Diberikan',
      pesan: 'Pak Haryono menambahkan tugas: Analisis Video Gerakan Passing Bawah Bola Voli.',
      waktu: '2 jam yang lalu',
      tipe: 'tugas',
      dibaca: false,
    },
    {
      id: 'notif-2',
      judul: 'Nilai Praktik Diberikan',
      pesan: 'Nilai praktik PJOK Passing Bawah Anda telah dinilai (Skor: 96 / Predikat A).',
      waktu: '1 hari yang lalu',
      tipe: 'nilai',
      dibaca: false,
    },
    {
      id: 'notif-3',
      judul: 'Quiz Aktif Tersedia',
      pesan: 'Quiz Pengetahuan Aturan & Variasi Gerak Bola Voli dibuka hingga 18 September 2026.',
      waktu: '2 hari yang lalu',
      tipe: 'quiz',
      dibaca: true,
    },
    {
      id: 'notif-4',
      judul: 'Pengumuman Penting',
      pesan: 'Jadwal Tes Kebugaran Jasmani Indonesia (TKJI) akan dilaksanakan Jumat depan.',
      waktu: '3 hari yang lalu',
      tipe: 'pengumuman',
      dibaca: true,
    },
  ],
  nilai: [
    {
      id: 'nil-1',
      muridId: 'usr-murid-1',
      muridNama: 'Andi Pratama',
      nis: '240101',
      kelasId: 'cls-xi-1',
      kelasNama: 'XI 1',
      semester: '1 (Ganjil)',
      tugas: 88,
      quiz: 85,
      praktik: 92,
      pengetahuan: 87,
      keterampilan: 92,
      sikap: 95,
      nilaiAkhir: 90,
      predikat: 'A',
    },
    {
      id: 'nil-2',
      muridId: 'usr-murid-2',
      muridNama: 'Budi Santoso',
      nis: '240102',
      kelasId: 'cls-xi-1',
      kelasNama: 'XI 1',
      semester: '1 (Ganjil)',
      tugas: 82,
      quiz: 80,
      praktik: 86,
      pengetahuan: 81,
      keterampilan: 86,
      sikap: 88,
      nilaiAkhir: 84,
      predikat: 'B',
    },
    {
      id: 'nil-3',
      muridId: 'usr-murid-3',
      muridNama: 'Citra Dewi',
      nis: '240103',
      kelasId: 'cls-xi-1',
      kelasNama: 'XI 1',
      semester: '1 (Ganjil)',
      tugas: 92,
      quiz: 90,
      praktik: 95,
      pengetahuan: 91,
      keterampilan: 95,
      sikap: 96,
      nilaiAkhir: 93,
      predikat: 'A',
    },
    {
      id: 'nil-4',
      muridId: 'usr-murid-4',
      muridNama: 'Dimas Anggara',
      nis: '240104',
      kelasId: 'cls-xi-1',
      kelasNama: 'XI 1',
      semester: '1 (Ganjil)',
      tugas: 80,
      quiz: 75,
      praktik: 85,
      pengetahuan: 78,
      keterampilan: 85,
      sikap: 85,
      nilaiAkhir: 81,
      predikat: 'B',
    },
  ],
};

class DataStorageService {
  private db: LMSDatabase;
  private listeners: Array<(db: LMSDatabase) => void> = [];

  constructor() {
    this.db = this.loadFromLocalStorage();
  }

  public getCurrentUser(): User {
    try {
      const savedUser = localStorage.getItem('lms_pjok_current_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      // fallback
    }
    return this.db.users[0];
  }

  public setCurrentUser(user: User) {
    try {
      localStorage.setItem('lms_pjok_current_user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save current user:', e);
    }
  }

  public resetToDefault() {
    this.resetToDefaults();
  }

  private loadFromLocalStorage(): LMSDatabase {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_DATABASE,
          ...parsed,
          settings: {
            ...INITIAL_DATABASE.settings,
            ...(parsed?.settings || {}),
          },
          users: Array.isArray(parsed?.users) && parsed.users.length > 0 ? parsed.users : INITIAL_DATABASE.users,
          kelas: Array.isArray(parsed?.kelas) ? parsed.kelas : INITIAL_DATABASE.kelas,
          mataPelajaran: Array.isArray(parsed?.mataPelajaran) ? parsed.mataPelajaran : INITIAL_DATABASE.mataPelajaran,
          materi: (Array.isArray(parsed?.materi) ? parsed.materi : INITIAL_DATABASE.materi).map((m: any) => ({
            ...m,
            guruNama: m.guruNama || m.dibuatOleh || 'Haryono, S.Pd.Jas',
            dibuatOleh: m.dibuatOleh || m.guruNama || 'Haryono, S.Pd.Jas',
          })),
          tugas: (Array.isArray(parsed?.tugas) ? parsed.tugas : INITIAL_DATABASE.tugas).map((t: any) => ({
            ...t,
            guruNama: t.guruNama || t.dibuatOleh || 'Haryono, S.Pd.Jas',
            dibuatOleh: t.dibuatOleh || t.guruNama || 'Haryono, S.Pd.Jas',
          })),
          pengumpulanTugas: Array.isArray(parsed?.pengumpulanTugas) ? parsed.pengumpulanTugas : INITIAL_DATABASE.pengumpulanTugas,
          quiz: (Array.isArray(parsed?.quiz) ? parsed.quiz : INITIAL_DATABASE.quiz).map((q: any) => {
            const rawSoal = Array.isArray(q.soal) && q.soal.length > 0 
              ? q.soal 
              : (Array.isArray(q.soalList) ? q.soalList : []);
            return {
              ...q,
              soal: rawSoal,
              soalList: rawSoal,
              guruNama: q.guruNama || q.dibuatOleh || 'Haryono, S.Pd.Jas',
              dibuatOleh: q.dibuatOleh || q.guruNama || 'Haryono, S.Pd.Jas',
            };
          }),
          jawabanQuiz: Array.isArray(parsed?.jawabanQuiz) ? parsed.jawabanQuiz : INITIAL_DATABASE.jawabanQuiz,
          penilaianPraktik: Array.isArray(parsed?.penilaianPraktik) ? parsed.penilaianPraktik : INITIAL_DATABASE.penilaianPraktik,
          presensi: Array.isArray(parsed?.presensi) ? parsed.presensi : INITIAL_DATABASE.presensi,
          jurnal: Array.isArray(parsed?.jurnal) ? parsed.jurnal : INITIAL_DATABASE.jurnal,
          notifikasi: Array.isArray(parsed?.notifikasi) ? parsed.notifikasi : INITIAL_DATABASE.notifikasi,
          nilai: Array.isArray(parsed?.nilai) ? parsed.nilai : INITIAL_DATABASE.nilai,
        };
      }
    } catch (e) {
      console.error('Failed to load local DB, resetting to defaults:', e);
    }
    this.saveToLocalStorage(INITIAL_DATABASE);
    return INITIAL_DATABASE;
  }

  private saveToLocalStorage(data: LMSDatabase) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  public getDatabase(): LMSDatabase {
    return this.db;
  }

  public subscribe(listener: (db: LMSDatabase) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.saveToLocalStorage(this.db);
    this.listeners.forEach((l) => l(this.db));
  }

  public updateDatabase(updater: (prev: LMSDatabase) => LMSDatabase) {
    this.db = updater(this.db);
    this.notify();
  }

  public resetToDefaults() {
    this.db = JSON.parse(JSON.stringify(INITIAL_DATABASE));
    this.notify();
  }

  // Helper getters
  public getMuridList(kelasId?: string): User[] {
    return this.db.users.filter(
      (u) => u.role === 'MURID' && (!kelasId || u.kelasId === kelasId)
    );
  }

  public getGuruList(): User[] {
    return this.db.users.filter((u) => u.role === 'GURU');
  }

  public getKelasList(): Kelas[] {
    return this.db.kelas;
  }

  public getMateriList(kelasId?: string): Materi[] {
    return this.db.materi.filter((m) => !kelasId || m.kelasId === kelasId);
  }

  public getTugasList(kelasId?: string): Tugas[] {
    return this.db.tugas.filter((t) => !kelasId || t.kelasId === kelasId);
  }

  public getQuizList(kelasId?: string): Quiz[] {
    return this.db.quiz.filter((q) => !kelasId || q.kelasId === kelasId);
  }

  // Format data for Google Sheets tables
  public toSheetsPayload(): Record<string, any[]> {
    return {
      USERS: this.db.users,
      ADMIN: this.db.users.filter((u) => u.role === 'ADMIN'),
      GURU: this.db.users.filter((u) => u.role === 'GURU'),
      MURID: this.db.users.filter((u) => u.role === 'MURID'),
      KELAS: this.db.kelas,
      MATERI: this.db.materi,
      TUGAS: this.db.tugas,
      PENGUMPULAN: this.db.pengumpulanTugas,
      QUIZ: this.db.quiz.map((q: any) => {
        const list = q.soalList || q.soal || [];
        const { soalList, soal, ...rest } = q;
        return {
          ...rest,
          jumlahSoal: list.length,
        };
      }),
      SOAL: this.db.quiz.flatMap((q) => q.soalList || q.soal || []),
      JAWABAN: this.db.jawabanQuiz,
      PRESENSI: this.db.presensi,
      NILAI: this.db.penilaianPraktik,
      JURNAL: this.db.jurnal,
      NOTIFIKASI: this.db.notifikasi,
      SETTING: [this.db.settings],
    };
  }
}

export const dataStorage = new DataStorageService();
