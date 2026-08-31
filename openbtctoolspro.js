const ec = new elliptic.ec('secp256k1');
        const B58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

        const MAX_HARDWARE_CORES = navigator.hardwareConcurrency || 4;

        let currentLang = 'en';
        let isVanitySearching = false;
        let isVanityPaused = false;
        let isHexScanning = false;
        let isHexPaused = false;
        let autoSearchMode = true;

        let selectedCpuCores = Math.min(MAX_HARDWARE_CORES, 4);
        let selectedPerfMode = 'balanced'; // 'eco', 'balanced', 'turbo'
        let workerList = [];

        let vanityResultsList = [];

        let hexCurrentInt = null;
        let hexEndInt = null;
        let hexTargetAddr = "";
        let hexTargetPubkey = "";
        let hexTotalRange = 0n;
        let hexCurrentStep = 0n;

        let totalKeysTested = 0;
        let vanityMatchesCount = 0;
        let speedCounter = 0;
        let speedTimer = null;
        let startTime = null;
        let timeTimer = null;

        let savedKeysList = JSON.parse(localStorage.getItem('bitvanity_saved_keys') || '[]');

        const translations = {
            en: {
                subtitle: "Vanity Search & HEX Private Key Scanner",
                nav_vanity: "Auto Vanity Search",
                nav_hex: "HEX Range Scan",
                nav_saved: "Saved Vault",
                menu: "MENU",
                drawer_title: "Settings & Menu",
                select_lang: "Select Language (16 Languages)",
                select_theme: "Select Theme",
                cpu_cores: "CPU Cores / Threads",
                perf_mode: "Performance Mode",
                perf_eco: "🌿 Eco (Low Heat / Days & Months)",
                perf_balanced: "⚖️ Balanced Mode",
                perf_turbo: "🚀 Turbo (Max Speed)",
                cpu_info: "Multi-threading offloads calculations to background Web Workers so your browser stays fluid during multi-day searches.",
                nav_title: "Navigation",
                about_title: "About BitVanity",
                secure_title: "100% Client-Side & Secure",
                secure_desc: "All keys are generated directly in your browser without external servers.",
                tips_title: "Vanity Search Tips",
                tip1: "Legacy Bitcoin addresses start with 1.",
                tip2: "Invalid Base58 chars: 0, O, I, l.",
                tip3: "3-4 character prefixes are found quickly.",
                stat_speed: "Search Speed",
                stat_total: "Total Tested",
                stat_time: "Elapsed Time",
                stat_matches: "Found Matches",
                vanity_params: "Vanity Parameters",
                auto_active: "Auto Mode Ready",
                auto_mode_label: "Auto Search Mode",
                auto_mode_desc: "Searches instantly as you type prefix/suffix",
                prefix_label: "Prefix (Starts with 1)",
                prefix_ex: "Ex: 1BTC, 1Love",
                prefix_ph: "Type prefix (e.g. BTC)",
                suffix_label: "Suffix (Optional)",
                suffix_ex: "Ex: 77, WIN",
                suffix_ph: "Type suffix here",
                advanced_target_title: "Target Address & PubKey Search",
                exact_addr: "Target Full Address (Optional)",
                exact_addr_ph: "Ex: 1BgG23dBnn3Cj3edL3khZJw...",
                target_pubkey: "Target Public Key (HEX) (Optional)",
                target_pubkey_ph: "Ex: 0279be667ef9dc...",
                err_base58: "Contains invalid Base58 characters (0, O, I, l)",
                case_sensitive: "Case Sensitive",
                btn_start: "Start Search",
                btn_pause: "Pause",
                btn_resume: "Resume",
                btn_stop: "Stop",
                auto_search_note: "Note: In Auto Mode, search starts automatically when typing.",
                scan_status_label: "Live Scan Status",
                status_ready: "READY",
                status_scanning: "SCANNING...",
                status_paused: "PAUSED",
                status_stopped: "STOPPED",
                live_address: "LIVE ADDRESS:",
                live_privkey: "PRIVATE KEY (HEX):",
                found_results_title: "Found Vanity Results",
                clear_list: "Clear List",
                empty_results: "No vanity results found yet. Start searching to generate custom addresses.",
                hex_title: "Private Key HEX Range Scan",
                hex_subtitle: "Scan Hexadecimal Private Key ranges for target Bitcoin addresses.",
                preset_label: "Preset:",
                preset_custom: "-- Custom Range --",
                start_hex: "Start HEX",
                end_hex: "End HEX",
                target_addr: "Target Address (Optional)",
                blank_all: "Leave blank to scan all",
                btn_start_hex: "Start HEX Scan",
                current_hex_pos: "Current Pos:",
                hex_log_title: "HEX Scan Log",
                clear_log: "Clear Log",
                log_empty: "Scan log will appear here...",
                vault_title: "Saved Key Vault",
                vault_subtitle: "Your saved vanity keys and HEX scan results stored locally.",
                btn_export: "Export JSON",
                btn_export_txt: "Export TXT",
                btn_clear_all: "Delete All",
                vault_empty: "Your vault is empty.",
                vault_empty_sub: "Click 'Save' on any search result to store keys here.",
                qr_title: "Address QR Code",
                close: "Close",
                footer_copy: "© 2026 BTC Tools Pro. All cryptographic generation runs locally in browser.",
                copy_addr: "Copy Address",
                copy_wif: "Copy WIF",
                save: "Save",
                match_tag: "VANITY MATCH",
                est_very_easy: "Estimate: Very Easy",
                est_200: "Estimate: ~200 Keys",
                est_10k: "Estimate: ~10,000 Keys",
                est_hard: "Estimate: ~500,000+ Keys",
                toast_saved: "Saved to Vault!",
                toast_copied: "Copied to clipboard!",
                toast_auto_on: "Auto Search Activated!",
                toast_auto_off: "Auto Search Deactivated.",
                check_balance: "Check Balance"
            },
            ms: {
                subtitle: "Penjana Vanity & Imbasan HEX Private Key",
                nav_vanity: "Auto Vanity Search",
                nav_hex: "Imbasan Julat HEX",
                nav_saved: "Kunci Tersimpan",
                menu: "MENU",
                drawer_title: "Tetapan & Menu",
                select_lang: "Pilih Bahasa (16 Bahasa)",
                select_theme: "Pilih Tema Visual",
                cpu_cores: "Teras CPU / Teras Kerja",
                perf_mode: "Mod Prestasi",
                perf_eco: "🌿 Eco (Larian Berhari-hari)",
                perf_balanced: "⚖️ Mod Seimbang",
                perf_turbo: "🚀 Turbo (Kelajuan Maks)",
                cpu_info: "Sistem Multi-threading menjalankan pengiraan di latar belakang tanpa menjejaskan kelancaran pelayar anda.",
                nav_title: "Navigasi Utama",
                about_title: "Mengenai BitVanity",
                secure_title: "100% Tempatan & Selamat",
                secure_desc: "Semua kunci dihasilkan dalam pelayar anda secara terus tanpa pelayan luaran.",
                tips_title: "Petua Carian Vanity",
                tip1: "Alamat Legacy Bitcoin bermula dengan angka 1.",
                tip2: "Huruf tidak sah Base58: 0, O, I, l.",
                tip3: "Teks 3-4 huruf adalah paling pantas ditemui.",
                stat_speed: "Kelajuan Carian",
                stat_total: "Jumlah Diuji",
                stat_time: "Masa Berjalan",
                stat_matches: "Hasil Ditemui",
                vanity_params: "Parameter Vanity",
                auto_active: "Mod Auto Aktif",
                auto_mode_label: "Auto Search Mod",
                auto_mode_desc: "Carian automatik berjalan apabila prefix/suffix diisi",
                prefix_label: "Awalan / Prefix (Bermula 1)",
                prefix_ex: "Contoh: 1BTC, 1Love",
                prefix_ph: "Taip prefix (cth: BTC)",
                suffix_label: "Akhiran / Suffix (Opsional)",
                suffix_ex: "Contoh: 77, WIN",
                suffix_ph: "Taip suffix di sini",
                advanced_target_title: "Carian Alamat & PubKey Sasaran",
                exact_addr: "Alamat Penuh Sasaran (Opsional)",
                exact_addr_ph: "Contoh: 1BgG23dBnn3Cj3edL3khZJw...",
                target_pubkey: "Kunci Awam Sasaran (HEX) (Opsional)",
                target_pubkey_ph: "Contoh: 0279be667ef9dc...",
                err_base58: "Mengandungi aksara tidak sah (0, O, I, l)",
                case_sensitive: "Peka Huruf Besar/Kecil",
                btn_start: "Mula Carian",
                btn_pause: "Jeda",
                btn_resume: "Sambung",
                btn_stop: "Henti",
                auto_search_note: "Nota: Dalam Mod Auto, carian bermula secara automatik apabila menaip.",
                scan_status_label: "Status Imbasan Semasa",
                status_ready: "BERSEDIA",
                status_scanning: "MENJIMBAS...",
                status_paused: "DIJEDA",
                status_stopped: "DIHENTIKAN",
                live_address: "ALAMAT SECARA LANGSUNG:",
                live_privkey: "PRIVATE KEY (HEX):",
                found_results_title: "Hasil Vanity Ditemui",
                clear_list: "Kosongkan Senarai",
                empty_results: "Belum ada hasil vanity ditemui. Mula carian untuk hasilkan alamat kustom.",
                hex_title: "Carian Julat Private Key HEX",
                hex_subtitle: "Semak julat Hexadecimal Private Key untuk sasaran alamat Bitcoin.",
                preset_label: "Preset:",
                preset_custom: "-- Pilihan Kustom --",
                start_hex: "Start HEX",
                end_hex: "End HEX",
                target_addr: "Sasaran Alamat (Opsional)",
                blank_all: "Meninggalkan kosong untuk imbas semua",
                btn_start_hex: "Mula Imbasan HEX",
                current_hex_pos: "Kedudukan Semasa:",
                hex_log_title: "Log Hasil Imbasan HEX",
                clear_log: "Padam Log",
                log_empty: "Log imbasan akan dipaparkan di sini...",
                vault_title: "Peti Simpanan Kunci",
                vault_subtitle: "Senarai kunci vanity dan imbasan HEX tersimpan tempatan.",
                btn_export: "Eksport JSON",
                btn_export_txt: "Eksport TXT",
                btn_clear_all: "Padam Semua",
                vault_empty: "Peti simpanan anda masih kosong.",
                vault_empty_sub: "Tekan 'Simpan' pada sebarang hasil carian.",
                qr_title: "Kod QR Alamat",
                close: "Tutup",
                footer_copy: "© 2026 BTC Tools Pro. Penjanaan diproses pada pelayar tempatan.",
                copy_addr: "Salin Alamat",
                copy_wif: "Salin WIF",
                save: "Simpan",
                match_tag: "PADANAN VANITY",
                est_very_easy: "Anggaran: Sangat Mudah",
                est_200: "Anggaran: ~200 Kunci",
                est_10k: "Anggaran: ~10,000 Kunci",
                est_hard: "Anggaran: ~500,000+ Kunci",
                toast_saved: "Berjaya disimpan ke Peti Simpanan!",
                toast_copied: "Berjaya disalin ke papan klip!",
                toast_auto_on: "Mod Auto Search Diaktifkan!",
                toast_auto_off: "Mod Auto Search Dinyahaktifkan.",
                check_balance: "Semak Baki"
            },
            id: {
                subtitle: "Pencari Vanity & Pemindai HEX Key Private",
                nav_vanity: "Auto Vanity Search",
                nav_hex: "Pemindaian HEX",
                nav_saved: "Kunci Tersimpan",
                menu: "MENU",
                drawer_title: "Pengaturan & Menu",
                select_lang: "Pilih Bahasa (16 Bahasa)",
                select_theme: "Pilih Tema Visual",
                cpu_cores: "Inti CPU / Thread",
                perf_mode: "Mode Performa",
                perf_eco: "🌿 Eco (Jangka Panjang)",
                perf_balanced: "⚖️ Mode Seimbang",
                perf_turbo: "🚀 Turbo (Maksimal)",
                cpu_info: "Multi-threading menjalankan komputasi di latar belakang agar browser tidak lag.",
                nav_title: "Navigasi Utama",
                about_title: "Tentang BitVanity",
                secure_title: "100% Lokal & Aman",
                secure_desc: "Semua kunci dibuat langsung di browser Anda tanpa server luar.",
                tips_title: "Tips Pencarian Vanity",
                tip1: "Alamat Legacy Bitcoin dimulai dengan 1.",
                tip2: "Karakter Base58 tidak valid: 0, O, I, l.",
                tip3: "Awalan 3-4 karakter sangat cepat ditemukan.",
                stat_speed: "Kecepatan Cari",
                stat_total: "Total Diuji",
                stat_time: "Waktu Berjalan",
                stat_matches: "Hasil Ditemukan",
                vanity_params: "Parameter Vanity",
                auto_active: "Mode Auto Siap",
                auto_mode_label: "Mode Auto Search",
                auto_mode_desc: "Pencarian otomatis saat mengetik awalan/akhiran",
                prefix_label: "Awalan / Prefix (Mulai dari 1)",
                prefix_ex: "Contoh: 1BTC, 1Love",
                prefix_ph: "Ketik awalan (misal: BTC)",
                suffix_label: "Akhiran / Suffix (Opsional)",
                suffix_ex: "Contoh: 77, WIN",
                suffix_ph: "Ketik akhiran di sini",
                advanced_target_title: "Pencarian Alamat & PubKey Target",
                exact_addr: "Alamat Lengkap Target (Opsional)",
                exact_addr_ph: "Contoh: 1BgG23dBnn3Cj3edL3khZJw...",
                target_pubkey: "Public Key Target (HEX) (Opsional)",
                target_pubkey_ph: "Contoh: 0279be667ef9dc...",
                err_base58: "Mengandung karakter Base58 tidak valid (0, O, I, l)",
                case_sensitive: "Sensitif Huruf Besar/Kecil",
                btn_start: "Mulai Pencarian",
                btn_pause: "Jeda",
                btn_resume: "Lanjutkan",
                btn_stop: "Hentikan",
                auto_search_note: "Catatan: Dalam Mode Auto, pencarian berjalan saat mengetik.",
                scan_status_label: "Status Pemindaian",
                status_ready: "SIAP",
                status_scanning: "MEMINDAI...",
                status_paused: "DIJEDA",
                status_stopped: "DIHENTIKAN",
                live_address: "ALAMAT LANGSUNG:",
                live_privkey: "PRIVATE KEY (HEX):",
                found_results_title: "Hasil Vanity Ditemukan",
                clear_list: "Bersihkan Daftar",
                empty_results: "Belum ada hasil vanity ditemukan.",
                hex_title: "Pemindaian Rentang HEX Private Key",
                hex_subtitle: "Pindai rentang Private Key Hexadecimal untuk target Bitcoin.",
                preset_label: "Preset:",
                preset_custom: "-- Rentang Kustom --",
                start_hex: "Start HEX",
                end_hex: "End HEX",
                target_addr: "Alamat Target (Opsional)",
                blank_all: "Biarkan kosong untuk pindai semua",
                btn_start_hex: "Mulai Pindai HEX",
                current_hex_pos: "Posisi Saat Ini:",
                hex_log_title: "Log Pemindaian HEX",
                clear_log: "Hapus Log",
                log_empty: "Log pemindaian akan muncul di sini...",
                vault_title: "Brankas Kunci Tersimpan",
                vault_subtitle: "Daftar kunci vanity & pemindaian HEX tersimpan lokal.",
                btn_export: "Ekspor JSON",
                btn_export_txt: "Ekspor TXT",
                btn_clear_all: "Hapus Semua",
                vault_empty: "Brankas Anda masih kosong.",
                vault_empty_sub: "Klik 'Simpan' pada hasil pencarian.",
                qr_title: "Kode QR Alamat",
                close: "Tutup",
                footer_copy: "© 2026 BTC Tools Pro. Semua proses kriptografi berjalan di browser.",
                copy_addr: "Salin Alamat",
                copy_wif: "Salin WIF",
                save: "Simpan",
                match_tag: "HASIL VANITY",
                est_very_easy: "Estimasi: Sangat Mudah",
                est_200: "Estimasi: ~200 Kunci",
                est_10k: "Estimasi: ~10,000 Kunci",
                est_hard: "Estimasi: ~500,000+ Kunci",
                toast_saved: "Berhasil disimpan ke Brankas!",
                toast_copied: "Teks berhasil disalin!",
                toast_auto_on: "Mode Auto Search Aktif!",
                toast_auto_off: "Mode Auto Search Nonaktif.",
                check_balance: "Cek Saldo"
            },
            ja: {
                subtitle: "バニティ検索＆HEX秘密鍵スキャナー",
                nav_vanity: "自動バニティ検索",
                nav_hex: "HEX範囲スキャン",
                nav_saved: "保存済み金庫",
                menu: "メニュー",
                drawer_title: "設定＆メニュー",
                select_lang: "言語選択 (16言語)",
                select_theme: "テーマ選択",
                cpu_cores: "CPUコア / スレッド",
                perf_mode: "パフォーマンスモード",
                perf_eco: "🌿 省電力 (長期間実行)",
                perf_balanced: "⚖️ バランス",
                perf_turbo: "🚀 ターボ (最高速)",
                cpu_info: "マルチスレッドにより、バックグラウンドWeb Workersで計算を実行し、ブラウザの動きを滑らかに保ちます。",
                nav_title: "メインナビゲーション",
                about_title: "BitVanityについて",
                secure_title: "100% クライアントサイド＆安全",
                secure_desc: "すべての鍵はブラウザ内で直接生成され、外部サーバーには送信されません。",
                tips_title: "検索のヒント",
                tip1: "レガシービットコインアドレスは「1」で始まります。",
                tip2: "無効なBase58文字: 0, O, I, l。",
                tip3: "3〜4文字の接頭辞は非常に早く見つかります。",
                stat_speed: "検索速度",
                stat_total: "合計テスト数",
                stat_time: "経過時間",
                stat_matches: "マッチ数",
                vanity_params: "バニティパラメータ",
                auto_active: "自動モード準備完了",
                auto_mode_label: "自動検索モード",
                auto_mode_desc: "入力時に即座に自動検索を開始します",
                prefix_label: "接頭辞 Prefix (1から開始)",
                prefix_ex: "例: 1BTC, 1Love",
                prefix_ph: "接頭辞を入力 (例: BTC)",
                suffix_label: "接尾辞 Suffix (任意)",
                suffix_ex: "例: 77, WIN",
                suffix_ph: "接尾辞を入力",
                advanced_target_title: "ターゲットアドレス＆公開鍵検索",
                exact_addr: "ターゲット完全アドレス (任意)",
                exact_addr_ph: "例: 1BgG23dBnn3Cj3edL3khZJw...",
                target_pubkey: "ターゲット公開鍵 (HEX) (任意)",
                target_pubkey_ph: "例: 0279be667ef9dc...",
                err_base58: "無効なBase58文字が含まれています (0, O, I, l)",
                case_sensitive: "大文字小文字を区別",
                btn_start: "検索開始",
                btn_pause: "一時停止",
                btn_resume: "再開",
                btn_stop: "停止",
                auto_search_note: "注：自動モードでは入力時に検索が自動開始されます。",
                scan_status_label: "スキャンステータス",
                status_ready: "準備完了",
                status_scanning: "スキャン中...",
                status_paused: "一時停止中",
                status_stopped: "停止",
                live_address: "ライブアドレス:",
                live_privkey: "秘密鍵 (HEX):",
                found_results_title: "発見されたアドレス",
                clear_list: "リスト消去",
                empty_results: "結果はまだ見つかっていません。",
                hex_title: "秘密鍵 HEX 範囲スキャン",
                hex_subtitle: "16進数秘密鍵の範囲をスキャンします。",
                preset_label: "プリセット:",
                preset_custom: "-- カスタム範囲 --",
                start_hex: "開始 HEX",
                end_hex: "終了 HEX",
                target_addr: "ターゲットアドレス (任意)",
                blank_all: "空欄で全スキャン",
                btn_start_hex: "HEXスキャン開始",
                current_hex_pos: "現在の位置:",
                hex_log_title: "スキャンログ",
                clear_log: "ログ消去",
                log_empty: "スキャンログがここに表示されます...",
                vault_title: "保存済み金庫",
                vault_subtitle: "ローカルに保存された鍵のリスト。",
                btn_export: "JSON出力",
                btn_export_txt: "TXT出力",
                btn_clear_all: "すべて削除",
                vault_empty: "金庫は空です。",
                vault_empty_sub: "結果の「保存」ボタンをクリックしてください。",
                qr_title: "アドレスQRコード",
                close: "閉じる",
                footer_copy: "© 2026 BTC Tools Pro. すべての計算はブラウザ上で行われます。",
                copy_addr: "アドレスコピー",
                copy_wif: "WIFコピー",
                save: "保存",
                match_tag: "バニティマッチ",
                est_very_easy: "推定: 非常に簡単",
                est_200: "推定: ~200 鍵",
                est_10k: "推定: ~10,000 鍵",
                est_hard: "推定: ~500,000+ 鍵",
                toast_saved: "金庫に保存しました！",
                toast_copied: "クリップボードにコピーしました！",
                toast_auto_on: "自動検索モード有効化！",
                toast_auto_off: "自動検索モード無効化。",
                check_balance: "残高確認"
            },
            zh: {
                subtitle: "靓号生成与 HEX 私钥扫描器",
                nav_vanity: "自动靓号搜索",
                nav_hex: "HEX 范围扫描",
                nav_saved: "已存金库",
                menu: "菜单",
                drawer_title: "设置与菜单",
                select_lang: "选择语言 (16 种语言)",
                select_theme: "选择主题",
                cpu_cores: "CPU 核心 / 线程",
                perf_mode: "性能模式",
                perf_eco: "🌿 节能 (适合长期运行)",
                perf_balanced: "⚖️ 平衡模式",
                perf_turbo: "🚀 极速 (最大速度)",
                cpu_info: "多线程在后台 Web Workers 中计算，确保浏览器在长期搜索时保持流畅。",
                nav_title: "主导航",
                about_title: "关于 BitVanity",
                secure_title: "100% 本地且安全",
                secure_desc: "所有密钥直接在您的浏览器中生成，无需外部服务器。",
                tips_title: "生成技巧",
                tip1: "传统比特币地址以数字 1 开头。",
                tip2: "Base58 无效字符: 0, O, I, l。",
                tip3: "3-4 个字符的前缀生成速度最快。",
                stat_speed: "搜索速度",
                stat_total: "已测试总数",
                stat_time: "运行时间",
                stat_matches: "已匹配结果",
                vanity_params: "靓号参数设置",
                auto_active: "自动模式就绪",
                auto_mode_label: "自动搜索模式",
                auto_mode_desc: "输入前缀/后缀时即时自动生成",
                prefix_label: "前缀 Prefix (以 1 开头)",
                prefix_ex: "示例: 1BTC, 1Love",
                prefix_ph: "输入前缀 (如: BTC)",
                suffix_label: "后缀 Suffix (可选)",
                suffix_ex: "示例: 77, WIN",
                suffix_ph: "输入后缀",
                advanced_target_title: "目标地址与公钥搜索",
                exact_addr: "目标完整地址 (可选)",
                exact_addr_ph: "示例: 1BgG23dBnn3Cj3edL3khZJw...",
                target_pubkey: "目标公钥 (HEX) (可选)",
                target_pubkey_ph: "示例: 0279be667ef9dc...",
                err_base58: "包含无效的 Base58 字符 (0, O, I, l)",
                case_sensitive: "区分大小写",
                btn_start: "开始搜索",
                btn_pause: "暂停",
                btn_resume: "继续",
                btn_stop: "停止",
                auto_search_note: "注意：在自动模式下，打字时将自动开始搜索。",
                scan_status_label: "实时扫描状态",
                status_ready: "就绪",
                status_scanning: "正在扫描...",
                status_paused: "已暂停",
                status_stopped: "已停止",
                live_address: "实时地址:",
                live_privkey: "私钥 (HEX):",
                found_results_title: "匹配靓号结果",
                clear_list: "清空列表",
                empty_results: "暂未找到匹配的靓号地址。",
                hex_title: "私钥 HEX 范围扫描",
                hex_subtitle: "扫描十六进制私钥范围以匹配目标地址。",
                preset_label: "预设:",
                preset_custom: "-- 自定义范围 --",
                start_hex: "起始 HEX",
                end_hex: "结束 HEX",
                target_addr: "目标地址 (可选)",
                blank_all: "留空将扫描全部",
                btn_start_hex: "开始 HEX 扫描",
                current_hex_pos: "当前位置:",
                hex_log_title: "HEX 扫描日志",
                clear_log: "清除日志",
                log_empty: "扫描日志将在此显示...",
                vault_title: "已保存的密钥金库",
                vault_subtitle: "本地存储的靓号及 HEX 扫描密钥。",
                btn_export: "导出 JSON",
                btn_export_txt: "导出 TXT",
                btn_clear_all: "删除全部",
                vault_empty: "金库为空。",
                vault_empty_sub: "请点击搜索结果上的“保存”按钮。",
                qr_title: "地址二维码",
                close: "关闭",
                footer_copy: "© 2026 BTC Tools Pro. 所有密码学计算均在本地浏览器中完成。",
                copy_addr: "复制地址",
                copy_wif: "复制 WIF",
                save: "保存",
                match_tag: "靓号匹配",
                est_very_easy: "估计: 极易",
                est_200: "估计: ~200 个密钥",
                est_10k: "估计: ~10,000 个密钥",
                est_hard: "估计: ~500,000+ 个密钥",
                toast_saved: "已成功保存到金库！",
                toast_copied: "已复制到剪贴板！",
                toast_auto_on: "自动搜索模式已开启！",
                toast_auto_off: "自动搜索模式已关闭。",
                check_balance: "查询余额"
            },
            ko: {
                subtitle: "바니티 생성기 & HEX 개인키 스캐너",
                nav_vanity: "자동 바니티 검색",
                nav_hex: "HEX 범위 스캔",
                nav_saved: "보관함",
                menu: "메뉴",
                drawer_title: "설정 및 메뉴",
                select_lang: "언어 선택 (16개 언어)",
                select_theme: "테마 선택",
                cpu_cores: "CPU 코어 / 스레드",
                perf_mode: "성능 모드",
                perf_eco: "🌿 에코 (장기 실행용)",
                perf_balanced: "⚖️ 균형 모드",
                perf_turbo: "🚀 터보 (최대 속도)",
                cpu_info: "멀티스레딩은 백그라운드 Web Workers에서 연산을 처리하여 브라우저를 쾌적하게 유지합니다.",
                nav_title: "주요 탐색",
                about_title: "BitVanity 정보",
                secure_title: "100% 클라이언트 측 보안",
                secure_desc: "모든 키는 외부 서버 없이 브라우저에서 직접 생성됩니다.",
                tips_title: "검색 팁",
                tip1: "레거시 비트코인 주소는 1로 시작합니다.",
                tip2: "잘못된 Base58 문자의 예: 0, O, I, l.",
                tip3: "3-4자 접두사가 가장 빠르게 탐색됩니다.",
                stat_speed: "검색 속도",
                stat_total: "총 테스트 키",
                stat_time: "진행 시간",
                stat_matches: "발견한 결과",
                vanity_params: "바니티 파라미터",
                auto_active: "자동 모드 준비 완료",
                auto_mode_label: "자동 검색 모드",
                auto_mode_desc: "입력 즉시 자동으로 탐색을 시작합니다",
                prefix_label: "접두사 Prefix (1로 시작)",
                prefix_ex: "예: 1BTC, 1Love",
                prefix_ph: "접두사 입력 (예: BTC)",
                suffix_label: "접미사 Suffix (선택사항)",
                suffix_ex: "예: 77, WIN",
                suffix_ph: "접미사 입력",
                advanced_target_title: "대상 주소 및 공개키 검색",
                exact_addr: "대상 전체 주소 (선택)",
                exact_addr_ph: "예: 1BgG23dBnn3Cj3edL3khZJw...",
                target_pubkey: "대상 공개키 (HEX) (선택)",
                target_pubkey_ph: "예: 0279be667ef9dc...",
                err_base58: "유효하지 않은 Base58 문자가 포함되어 있습니다 (0, O, I, l)",
                case_sensitive: "대소문자 구분",
                btn_start: "검색 시작",
                btn_pause: "일시정지",
                btn_resume: "재개",
                btn_stop: "중지",
                auto_search_note: "참고: 자동 모드에서는 입력 시 검색이 자동 시작됩니다.",
                scan_status_label: "실시간 스캔 상태",
                status_ready: "준비 완료",
                status_scanning: "스캔 중...",
                status_paused: "일시정지됨",
                status_stopped: "중지됨",
                live_address: "실시간 주소:",
                live_privkey: "개인키 (HEX):",
                found_results_title: "발견된 결과",
                clear_list: "목록 비우기",
                empty_results: "아직 결과가 없습니다.",
                hex_title: "개인키 HEX 범위 스캔",
                hex_subtitle: "16진수 개인키 범위를 탐색합니다.",
                preset_label: "프리셋:",
                preset_custom: "-- 사용자 지정 --",
                start_hex: "시작 HEX",
                end_hex: "종료 HEX",
                target_addr: "대상 주소 (선택)",
                blank_all: "비워두면 전체 스캔",
                btn_start_hex: "HEX 스캔 시작",
                current_hex_pos: "현재 위치:",
                hex_log_title: "스캔 로그",
                clear_log: "로그 지우기",
                log_empty: "스캔 로그가 여기에 표시됩니다...",
                vault_title: "저장된 키 보관함",
                vault_subtitle: "로컬에 저장된 키 목록입니다.",
                btn_export: "JSON 내보내기",
                btn_export_txt: "TXT 내보내기",
                btn_clear_all: "모두 삭제",
                vault_empty: "보관함이 비어 있습니다.",
                vault_empty_sub: "결과의 '저장' 버튼을 클릭하세요.",
                qr_title: "주소 QR 코드",
                close: "닫기",
                footer_copy: "© 2026 BTC Tools Pro. 모든 암호화는 브라우저에서 수행됩니다.",
                copy_addr: "주소 복사",
                copy_wif: "WIF 복사",
                save: "저장",
                match_tag: "바니티 일치",
                est_very_easy: "예상: 매우 쉬움",
                est_200: "예상: ~200 키",
                est_10k: "예상: ~10,000 키",
                est_hard: "예상: ~500,000+ 키",
                toast_saved: "보관함에 저장되었습니다!",
                toast_copied: "클립보드에 복사되었습니다!",
                toast_auto_on: "자동 검색 모드 활성화!",
                toast_auto_off: "자동 검색 모드 비활성화.",
                check_balance: "잔액 확인"
            },
            th: {
                subtitle: "เครื่องมือค้นหา Vanity & สแกน HEX Private Key",
                nav_vanity: "ค้นหา Vanity อัตโนมัติ",
                nav_hex: "สแกนช่วง HEX",
                nav_saved: "คลังที่บันทึก",
                menu: "เมนู",
                drawer_title: "ตั้งค่า & เมนู",
                select_lang: "เลือกภาษา (16 ภาษา)",
                select_theme: "เลือกธีม",
                cpu_cores: "คอร์ CPU / เธรด",
                perf_mode: "โหมดประสิทธิภาพ",
                perf_eco: "🌿 ประหยัดพลังงาน (รันยาวนาน)",
                perf_balanced: "⚖️ โหมดสมดุล",
                perf_turbo: "🚀 เทอร์โบ (ความเร็วสูงสุด)",
                cpu_info: "ระบบมัลติเธรดจะประมวลผลเบื้องหลังโดยไม่ทำให้เบราว์เซอร์หน่วง",
                nav_title: "การนำทาง",
                about_title: "เกี่ยวกับ BitVanity",
                secure_title: "ปลอดภัย 100% ทำงานบนเบราว์เซอร์",
                secure_desc: "คีย์ทั้งหมดถูกสร้างบนเครื่องของคุณโดยไม่ผ่านเซิร์ฟเวอร์ภายนอก",
                tips_title: "คำแนะนำ",
                tip1: "ที่อยู่ บิตคอยน์ เลกาซี เริ่มต้นด้วย 1",
                tip2: "อักขระ Base58 ที่ไม่ถูกต้อง: 0, O, I, l",
                tip3: "ข้อความ 3-4 ตัวอักษรจะพบได้อย่างรวดเร็ว",
                stat_speed: "ความเร็วค้นหา",
                stat_total: "ทดสอบแล้ว",
                stat_time: "เวลาที่ใช้",
                stat_matches: "ผลลัพธ์ที่พบ",
                vanity_params: "พารามิเตอร์ Vanity",
                auto_active: "โหมดออโต้พร้อม",
                auto_mode_label: "โหมดค้นหาอัตโนมัติ",
                auto_mode_desc: "ค้นหาทันทีเมื่อพิมพ์คำนำหน้า/ต่อท้าย",
                prefix_label: "คำนำหน้า Prefix (เริ่มด้วย 1)",
                prefix_ex: "ตัวอย่าง: 1BTC, 1Love",
                prefix_ph: "พิมพ์คำนำหน้า (เช่น BTC)",
                suffix_label: "คำต่อท้าย Suffix (ไม่บังคับ)",
                suffix_ex: "ตัวอย่าง: 77, WIN",
                suffix_ph: "พิมพ์คำต่อท้ายที่นี่",
                advanced_target_title: "ค้นหาที่อยู่และ PubKey เป้าหมาย",
                exact_addr: "ที่อยู่เต็มเป้าหมาย (ไม่บังคับ)",
                exact_addr_ph: "ตัวอย่าง: 1BgG23dBnn3Cj3edL3khZJw...",
                target_pubkey: "Public Key เป้าหมาย (HEX) (ไม่บังคับ)",
                target_pubkey_ph: "ตัวอย่าง: 0279be667ef9dc...",
                err_base58: "มีอักขระ Base58 ที่ไม่ถูกต้อง (0, O, I, l)",
                case_sensitive: "ตัวพิมพ์เล็ก-ใหญ่ตรงกัน",
                btn_start: "เริ่มค้นหา",
                btn_pause: "พัก",
                btn_resume: "ดำเนินการต่อ",
                btn_stop: "หยุด",
                auto_search_note: "หมายเหตุ: ในโหมดอัตโนมัติ การค้นหาจะเริ่มทันทีเมื่อพิมพ์",
                scan_status_label: "สถานะการสแกนสด",
                status_ready: "พร้อม",
                status_scanning: "กำลังสแกน...",
                status_paused: "หยุดชั่วคราว",
                status_stopped: "หยุดแล้ว",
                live_address: "ที่อยู่ปัจจุบัน:",
                live_privkey: "PRIVATE KEY (HEX):",
                found_results_title: "ผลลัพธ์ที่พบ",
                clear_list: "ล้างรายการ",
                empty_results: "ยังไม่พบผลลัพธ์",
                hex_title: "สแกนช่วง Private Key HEX",
                hex_subtitle: "สแกนช่วงกุญแจฐานสิบหกเพื่อหาเป้าหมาย",
                preset_label: "ตั้งค่าล่วงหน้า:",
                preset_custom: "-- ช่วงกำหนดเอง --",
                start_hex: "เริ่ม HEX",
                end_hex: "สิ้นสุด HEX",
                target_addr: "ที่อยู่เป้าหมาย (ไม่บังคับ)",
                blank_all: "เว้นว่างเพื่อสแกนทั้งหมด",
                btn_start_hex: "เริ่มสแกน HEX",
                current_hex_pos: "ตำแหน่งปัจจุบัน:",
                hex_log_title: "บันทึกการสแกน HEX",
                clear_log: "ล้างบันทึก",
                log_empty: "บันทึกจะแสดงที่นี่...",
                vault_title: "คลังเก็บกุญแจ",
                vault_subtitle: "รายการกุญแจที่บันทึกไว้ในเครื่อง",
                btn_export: "ส่งออก JSON",
                btn_export_txt: "ส่งออก TXT",
                btn_clear_all: "ลบทั้งหมด",
                vault_empty: "คลังของคุณว่างเปล่า",
                vault_empty_sub: "คลิก 'บันทึก' บนผลลัพธ์การค้นหา",
                qr_title: "คิวอาร์โค้ดที่อยู่",
                close: "ปิด",
                footer_copy: "© 2026 BTC Tools Pro. ทำงานบนเบราว์เซอร์ของคุณ",
                copy_addr: "คัดลอกที่อยู่",
                copy_wif: "คัดลอก WIF",
                save: "บันทึก",
                match_tag: "ตรงกับ VANITY",
                est_very_easy: "ประมาณการ: ง่ายมาก",
                est_200: "ประมาณการ: ~200 คีย์",
                est_10k: "ประมาณการ: ~10,000 คีย์",
                est_hard: "ประมาณการ: ~500,000+ คีย์",
                toast_saved: "บันทึกเข้าคลังเรียบร้อย!",
                toast_copied: "คัดลอกลงคลิปบอร์ดแล้ว!",
                toast_auto_on: "เปิดโหมดค้นหาอัตโนมัติ!",
                toast_auto_off: "ปิดโหมดค้นหาอัตโนมัติ",
                check_balance: "เช็คยอดเงิน"
            },
            ru: {
                subtitle: "Генератор Vanity и Сканер HEX Приватных Ключей",
                nav_vanity: "Авто Vanity Поиск",
                nav_hex: "Сканер HEX Диапазона",
                nav_saved: "Сохраненные Ключи",
                menu: "МЕНЮ",
                drawer_title: "Настройки и Меню",
                select_lang: "Выберите Язык (16 языков)",
                select_theme: "Выберите Тему",
                cpu_cores: "Ядра CPU / Потоки",
                perf_mode: "Режим Производительности",
                perf_eco: "🌿 Эко (Длительный Поиск)",
                perf_balanced: "⚖️ Сбалансированный",
                perf_turbo: "🚀 Турбо (Максимальный)",
                cpu_info: "Многопоточность выполняет вычисления в фоновых Web Workers, чтобы браузер работал плавно.",
                nav_title: "Главная Навигация",
                about_title: "О BitVanity",
                secure_title: "100% Безопасно в Браузере",
                secure_desc: "Все ключи создаются в вашем браузере без внешних серверов.",
                tips_title: "Советы по Поиску",
                tip1: "Bitcoin адреса начинаются с 1.",
                tip2: "Недопустимые символы Base58: 0, O, I, l.",
                tip3: "Префиксы из 3-4 символов находятся очень быстро.",
                stat_speed: "Скорость",
                stat_total: "Проверено",
                stat_time: "Прошло Времени",
                stat_matches: "Найдено",
                vanity_params: "Параметры Поиска",
                auto_active: "Авто-режим Готов",
                auto_mode_label: "Автоматический Поиск",
                auto_mode_desc: "Ищет сразу при вводе префикса/суффикса",
                prefix_label: "Префикс (Начинается с 1)",
                prefix_ex: "Пример: 1BTC, 1Love",
                prefix_ph: "Введите префикс (напр. BTC)",
                suffix_label: "Суффикс (Необязательно)",
                suffix_ex: "Пример: 77, WIN",
                suffix_ph: "Введите суффикс",
                advanced_target_title: "Поиск по Адресу и Публичному Ключу",
                exact_addr: "Целевой Полный Адрес (Необязательно)",
                exact_addr_ph: "Пример: 1BgG23dBnn3Cj3edL3khZJw...",
                target_pubkey: "Целевой Публичный Ключ (HEX) (Необязательно)",
                target_pubkey_ph: "Пример: 0279be667ef9dc...",
                err_base58: "Содержит недопустимые символы Base58 (0, O, I, l)",
                case_sensitive: "Учитывать Регистр",
                btn_start: "Начать Поиск",
                btn_pause: "Пауза",
                btn_resume: "Продолжить",
                btn_stop: "Стоп",
                auto_search_note: "Примечание: В авто-режиме поиск начинается при вводе текста.",
                scan_status_label: "Статус Сканирования",
                status_ready: "ГОТОВ",
                status_scanning: "СКАНИРОВАНИЕ...",
                status_paused: "ПАУЗА",
                status_stopped: "ОСТАНОВЛЕНО",
                live_address: "АДРЕС:",
                live_privkey: "ПРИВАТНЫЙ КЛЮЧ (HEX):",
                found_results_title: "Найденные Адреса",
                clear_list: "Очистить Список",
                empty_results: "Результаты пока не найдены.",
                hex_title: "Сканирование HEX Диапазона",
                hex_subtitle: "Сканирование диапазона шестнадцатеричных ключей.",
                preset_label: "Прессет:",
                preset_custom: "-- Свой Диапазон --",
                start_hex: "Начальный HEX",
                end_hex: "Конечный HEX",
                target_addr: "Целевой Адрес (Необязательно)",
                blank_all: "Оставьте пустым для полного сканирования",
                btn_start_hex: "Запустить HEX Сканер",
                current_hex_pos: "Текущая Позиция:",
                hex_log_title: "Лог Сканирования HEX",
                clear_log: "Очистить Лог",
                log_empty: "Лог сканирования появится здесь...",
                vault_title: "Хранилище Ключей",
                vault_subtitle: "Сохраненные локально приватные ключи.",
                btn_export: "Экспорт JSON",
                btn_export_txt: "Экспорт TXT",
                btn_clear_all: "Удалить Все",
                vault_empty: "Хранилище пусто.",
                vault_empty_sub: "Нажмите 'Сохранить' у найденного адреса.",
                qr_title: "QR Код Адреса",
                close: "Закрыть",
                footer_copy: "© 2026 BTC Tools Pro. Все вычисления выполняются в браузере.",
                copy_addr: "Копировать Адрес",
                copy_wif: "Копировать WIF",
                save: "Сохранить",
                match_tag: "СОВПАДЕНИЕ VANITY",
                est_very_easy: "Оценка: Очень Легко",
                est_200: "Оценка: ~200 Ключей",
                est_10k: "Оценка: ~10 000 Ключей",
                est_hard: "Оценка: ~500 000+ Ключей",
                toast_saved: "Сохранено в Хранилище!",
                toast_copied: "Скопировано в буфер обмена!",
                toast_auto_on: "Авто-поиск включен!",
                toast_auto_off: "Авто-поиск выключен.",
                check_balance: "Баланс"
            },
            uk: {
                subtitle: "Генератор Vanity та Сканер HEX Приватних Ключів",
                nav_vanity: "Авто Пошук Vanity",
                nav_hex: "Сканер HEX Діапазону",
                nav_saved: "Збережені Ключі",
                menu: "МЕНЮ",
                drawer_title: "Налаштування та Меню",
                select_lang: "Оберіть Мову (16 мов)",
                select_theme: "Оберіть Тему",
                cpu_cores: "Ядра CPU / Потоки",
                perf_mode: "Режим Продуктивності",
                perf_eco: "🌿 Еко (Тривалий Пошук)",
                perf_balanced: "⚖️ Збалансований",
                perf_turbo: "🚀 Турбо (Максимальний)",
                cpu_info: "Багатопотоковість виконує обчислення у фонових Web Workers, зберігаючи швидкість браузера.",
                nav_title: "Головна Навігація",
                about_title: "Про BitVanity",
                secure_title: "100% Безпечно у Браузері",
                secure_desc: "Усі ключі створюються у вашому браузері без зовнішніх серверів.",
                tips_title: "Поради щодо Пошуку",
                tip1: "Адреси Bitcoin починаються з 1.",
                tip2: "Неприпустимі символи Base58: 0, O, I, l.",
                tip3: "Префікси з 3-4 символів знаходяться дуже швидко.",
                stat_speed: "Швидкість",
                stat_total: "Перевірено",
                stat_time: "Пройшло Часу",
                stat_matches: "Знайдено",
                vanity_params: "Параметри Пошуку",
                auto_active: "Авто-режим Готовий",
                auto_mode_label: "Автоматичний Пошук",
                auto_mode_desc: "Шукає одразу при введенні префікса/суфікса",
                prefix_label: "Префікс (Починається з 1)",
                prefix_ex: "Приклад: 1BTC, 1Love",
                prefix_ph: "Введіть префікс (напр. BTC)",
                suffix_label: "Суфікс (Необов'язково)",
                suffix_ex: "Приклад: 77, WIN",
                suffix_ph: "Введіть суфікс",
                advanced_target_title: "Пошук за Адресою та Публічним Ключем",
                exact_addr: "Цільова Повна Адреса (Необов'язково)",
                exact_addr_ph: "Приклад: 1BgG23dBnn3Cj3edL3khZJw...",
                target_pubkey: "Цільовий Публічний Ключ (HEX) (Необов'язково)",
                target_pubkey_ph: "Приклад: 0279be667ef9dc...",
                err_base58: "Містить недопустимі символи Base58 (0, O, I, l)",
                case_sensitive: "Ураховувати Регістр",
                btn_start: "Почати Пошук",
                btn_pause: "Пауза",
                btn_resume: "Продовжити",
                btn_stop: "Стоп",
                auto_search_note: "Примітка: В авто-режимі пошук починається при введенні тексту.",
                scan_status_label: "Статус Сканування",
                status_ready: "ГОТОВИЙ",
                status_scanning: "СКАНУВАННЯ...",
                status_paused: "ПАУЗА",
                status_stopped: "ЗУПИНЕНО",
                live_address: "АДРЕСА:",
                live_privkey: "ПРИВАТНИЙ КЛЮЧ (HEX):",
                found_results_title: "Знайдені Адреси",
                clear_list: "Очистити Список",
                empty_results: "Результати поки не знайдені.",
                hex_title: "Сканування HEX Діапазону",
                hex_subtitle: "Сканування діапазону шістнадцяткових ключів.",
                preset_label: "Пресет:",
                preset_custom: "-- Свій Діапазон --",
                start_hex: "Початковий HEX",
                end_hex: "Кінцевий HEX",
                target_addr: "Цільова Адреса (Необов'язково)",
                blank_all: "Залиште порожнім для повного сканування",
                btn_start_hex: "Запустити HEX Сканер",
                current_hex_pos: "Поточна Позиція:",
                hex_log_title: "Лог Сканування HEX",
                clear_log: "Очистити Лог",
                log_empty: "Лог сканування з'явиться тут...",
                vault_title: "Сховище Ключів",
                vault_subtitle: "Збережені локально приватні ключі.",
                btn_export: "Експорт JSON",
                btn_export_txt: "Експорт TXT",
                btn_clear_all: "Видалити Все",
                vault_empty: "Сховище порожнє.",
                vault_empty_sub: "Натисніть 'Зберегти' біля знайденої адреси.",
                qr_title: "QR Код Адреси",
                close: "Закрити",
                footer_copy: "© 2026 BTC Tools Pro. Усі обчислення виконуються у браузері.",
                copy_addr: "Копіювати Адресу",
                copy_wif: "Копіювати WIF",
                save: "Зберегти",
                match_tag: "ЗБІГ VANITY",
                est_very_easy: "Оцінка: Дуже Легко",
                est_200: "Оцінка: ~200 Ключів",
                est_10k: "Оцінка: ~10 000 Ключів",
                est_hard: "Оцінка: ~500 000+ Ключів",
                toast_saved: "Збережено у Сховище!",
                toast_copied: "Скопійовано у буфер обміну!",
                toast_auto_on: "Авто-пошук увімкнено!",
                toast_auto_off: "Авто-пошук вимкнено.",
                check_balance: "Баланс"
            },
            hi: {
                subtitle: "वैनिटी सर्च एवं HEX प्राइवेट की स्कैनर",
                nav_vanity: "ऑटो वैनिटी खोज",
                nav_hex: "HEX रेंज स्कैन",
                nav_saved: "सुरक्षित वॉल्ट",
                menu: "मेनू",
                drawer_title: "सेटिंग्स और मेनू",
                select_lang: "भाषा चुनें (16 भाषाएं)",
                select_theme: "थीम चुनें",
                cpu_cores: "CPU कोर / थ्रेड्स",
                perf_mode: "प्रदर्शन मोड",
                perf_eco: "🌿 इको (लंबे समय के लिए)",
                perf_balanced: "⚖️ संतुलित मोड",
                perf_turbo: "🚀 टर्बो (अधिकतम गति)",
                cpu_info: "मल्टी-थ्रेडिंग बैकग्राउंड वेब वर्कर्स में गणना करती है ताकि आपका ब्राउज़र सुचारू रहे।",
                nav_title: "मुख्य नेविगेशन",
                about_title: "BitVanity के बारे में",
                secure_title: "100% स्थानीय और सुरक्षित",
                secure_desc: "सभी कुंजियाँ बिना किसी बाहरी सर्वर के सीधे आपके ब्राउज़र में बनती हैं।",
                tips_title: "खोज सुझाव",
                tip1: "बिटकॉइन पते 1 से शुरू होते हैं।",
                tip2: "अमान्य Base58 अक्षर: 0, O, I, l।",
                tip3: "3-4 अक्षरों के उपसर्ग बहुत तेज़ी से मिलते हैं।",
                stat_speed: "खोज गति",
                stat_total: "कुल परीक्षण",
                stat_time: "बीता हुआ समय",
                stat_matches: "मिले परिणाम",
                vanity_params: "वैनिटी पैरामीटर",
                auto_active: "ऑटो मोड तैयार",
                auto_mode_label: "ऑटो सर्च मोड",
                auto_mode_desc: "टाइप करते ही तुरंत खोज शुरू होती है",
                prefix_label: "उपसर्ग Prefix (1 से शुरू)",
                prefix_ex: "उदा: 1BTC, 1Love",
                prefix_ph: "उपसर्ग लिखें (उदा: BTC)",
                suffix_label: "प्रत्यय Suffix (वैकल्पिक)",
                suffix_ex: "उदा: 77, WIN",
                suffix_ph: "प्रत्यय लिखें",
                advanced_target_title: "लक्ष्य पता एवं पब्लिक की खोज",
                exact_addr: "लक्ष्य पूरा पता (वैकल्पिक)",
                exact_addr_ph: "उदा: 1BgG23dBnn3Cj3edL3khZJw...",
                target_pubkey: "लक्ष्य पब्लिक की (HEX) (वैकल्पिक)",
                target_pubkey_ph: "उदा: 0279be667ef9dc...",
                err_base58: "अमान्य Base58 अक्षर शामिल हैं (0, O, I, l)",
                case_sensitive: "अक्षर संवेदी (Case Sensitive)",
                btn_start: "खोज शुरू करें",
                btn_pause: "पॉज़",
                btn_resume: "जारी रखें",
                btn_stop: "रोकें",
                auto_search_note: "नोट: ऑटो मोड में, टाइप करते ही खोज अपने आप शुरू हो जाती है।",
                scan_status_label: "लाइव स्कैन स्थिति",
                status_ready: "तैयार",
                status_scanning: "स्कैन जारी...",
                status_paused: "रुका हुआ",
                status_stopped: "रुक गया",
                live_address: "लाइव पता:",
                live_privkey: "प्राइवेट की (HEX):",
                found_results_title: "मिले हुए पते",
                clear_list: "सूची साफ़ करें",
                empty_results: "अभी तक कोई परिणाम नहीं मिला।",
                hex_title: "प्राइवेट की HEX रेंज स्कैन",
                hex_subtitle: "लक्ष्य बिटकॉइन पते के लिए हेक्साडेसिमल की रेंज स्कैन करें।",
                preset_label: "प्रीसेट:",
                preset_custom: "-- कस्टम रेंज --",
                start_hex: "शुरुआती HEX",
                end_hex: "अंतिम HEX",
                target_addr: "लक्ष्य पता (वैकल्पिक)",
                blank_all: "सभी स्कैन करने के लिए खाली छोड़ें",
                btn_start_hex: "HEX स्कैन शुरू करें",
                current_hex_pos: "वर्तमान स्थिति:",
                hex_log_title: "HEX स्कैन लॉग",
                clear_log: "लॉग साफ़ करें",
                log_empty: "स्कैन लॉग यहाँ दिखाई देगा...",
                vault_title: "सुरक्षित कुंजियों का वॉल्ट",
                vault_subtitle: "स्थानीय रूप से सहेजी गई कुंजियों की सूची।",
                btn_export: "JSON एक्सपोर्ट करें",
                btn_export_txt: "TXT एक्सपोर्ट करें",
                btn_clear_all: "सभी हटाएँ",
                vault_empty: "आपका वॉल्ट खाली है।",
                vault_empty_sub: "परिणामों पर 'सहेजें' बटन दबाएँ।",
                qr_title: "पता QR कोड",
                close: "बंद करें",
                footer_copy: "© 2026 BTC Tools Pro. सभी गणनाएँ आपके ब्राउज़र में होती हैं।",
                copy_addr: "पता कॉपी करें",
                copy_wif: "WIF कॉपी करें",
                save: "सहेजें",
                match_tag: "वैनिटी मैच",
                est_very_easy: "अनुमान: बहुत आसान",
                est_200: "अनुमान: ~200 कुंजियाँ",
                est_10k: "अनुमान: ~10,000 कुंजियाँ",
                est_hard: "अनुमान: ~500,000+ कुंजियाँ",
                toast_saved: "वॉल्ट में सहेजा गया!",
                toast_copied: "क्लिपबोर्ड पर कॉपी किया गया!",
                toast_auto_on: "ऑटो सर्च चालू किया गया!",
                toast_auto_off: "ऑटो सर्च बंद किया गया।",
                check_balance: "बैलेंस जांचें"
            },
            es: {
                subtitle: "Buscador Vanity y Escáner de Claves Privadas HEX",
                nav_vanity: "Búsqueda Auto Vanity",
                nav_hex: "Escáner Rango HEX",
                nav_saved: "Bóveda Guardada",
                menu: "MENÚ",
                drawer_title: "Ajustes y Menú",
                select_lang: "Seleccionar Idioma (16 Idiomas)",
                select_theme: "Seleccionar Tema",
                cpu_cores: "Núcleos CPU / Hilos",
                perf_mode: "Modo de Rendimiento",
                perf_eco: "🌿 Eco (Larga Duración)",
                perf_balanced: "⚖️ Modo Equilibrado",
                perf_turbo: "🚀 Turbo (Máxima Vel.)",
                cpu_info: "El procesamiento multihilo ejecuta cálculos en Web Workers de fondo para mantener su navegador fluido.",
                nav_title: "Navegación Principal",
                about_title: "Acerca de BitVanity",
                secure_title: "100% Local y Seguro",
                secure_desc: "Todas las claves se generan en su navegador sin servidores externos.",
                tips_title: "Consejos de Búsqueda",
                tip1: "Las direcciones Bitcoin empiezan con 1.",
                tip2: "Caracteres Base58 no válidos: 0, O, I, l.",
                tip3: "Prefijos de 3-4 caracteres se encuentran rápido.",
                stat_speed: "Velocidad",
                stat_total: "Total Probado",
                stat_time: "Tiempo Transcurrido",
                stat_matches: "Coincidencias",
                vanity_params: "Parámetros Vanity",
                auto_active: "Modo Auto Listo",
                auto_mode_label: "Modo Búsqueda Auto",
                auto_mode_desc: "Busca automáticamente al escribir el prefijo/sufijo",
                prefix_label: "Prefijo (Empieza con 1)",
                prefix_ex: "Ej: 1BTC, 1Love",
                prefix_ph: "Escriba prefijo (ej: BTC)",
                suffix_label: "Sufijo (Opcional)",
                suffix_ex: "Ej: 77, WIN",
                suffix_ph: "Escriba sufijo",
                advanced_target_title: "Búsqueda por Dirección y Clave Pública",
                exact_addr: "Dirección Completa Objetivo (Opcional)",
                exact_addr_ph: "Ej: 1BgG23dBnn3Cj3edL3khZJw...",
                target_pubkey: "Clave Pública Objetivo (HEX) (Opcional)",
                target_pubkey_ph: "Ej: 0279be667ef9dc...",
                err_base58: "Contiene caracteres Base58 no válidos (0, O, I, l)",
                case_sensitive: "Sensible a Mayúsculas",
                btn_start: "Iniciar Búsqueda",
                btn_pause: "Pausa",
                btn_resume: "Reanudar",
                btn_stop: "Detener",
                auto_search_note: "Nota: En Modo Auto, la búsqueda empieza al escribir.",
                scan_status_label: "Estado del Escaneo",
                status_ready: "LISTO",
                status_scanning: "ESCANEANDO...",
                status_paused: "PAUSADO",
                status_stopped: "DETENIDO",
                live_address: "DIRECCIÓN EN VIVO:",
                live_privkey: "CLAVE PRIVADA (HEX):",
                found_results_title: "Resultados Encontrados",
                clear_list: "Limpiar Lista",
                empty_results: "No se han encontrado resultados todavía.",
                hex_title: "Escáner de Rango HEX",
                hex_subtitle: "Escanee rangos de claves privadas hexadecimales.",
                preset_label: "Preajuste:",
                preset_custom: "-- Rango Personalizado --",
                start_hex: "HEX Inicial",
                end_hex: "HEX Final",
                target_addr: "Dirección Objetivo (Opcional)",
                blank_all: "Dejar en blanco para escanear todo",
                btn_start_hex: "Iniciar Escaneo HEX",
                current_hex_pos: "Posición Actual:",
                hex_log_title: "Registro de Escaneo HEX",
                clear_log: "Limpiar Registro",
                log_empty: "El registro aparecerá aquí...",
                vault_title: "Bóveda de Claves Guardadas",
                vault_subtitle: "Claves guardadas localmente.",
                btn_export: "Exportar JSON",
                btn_export_txt: "Exportar TXT",
                btn_clear_all: "Eliminar Todo",
                vault_empty: "Su bóveda está vacía.",
                vault_empty_sub: "Haga clic en 'Guardar' en un resultado.",
                qr_title: "Código QR de Dirección",
                close: "Cerrar",
                footer_copy: "© 2026 BTC Tools Pro. Generación criptográfica local.",
                copy_addr: "Copiar Dirección",
                copy_wif: "Copiar WIF",
                save: "Guardar",
                match_tag: "COINCIDENCIA VANITY",
                est_very_easy: "Estimación: Muy Fácil",
                est_200: "Estimación: ~200 Claves",
                est_10k: "Estimación: ~10,000 Claves",
                est_hard: "Estimación: ~500,000+ Claves",
                toast_saved: "¡Guardado en la Bóveda!",
                toast_copied: "¡Copiado al portapapeles!",
                toast_auto_on: "¡Búsqueda Auto Activada!",
                toast_auto_off: "Búsqueda Auto Desactivada.",
                check_balance: "Ver Saldo"
            },
            de: {
                subtitle: "Vanity-Suche & HEX-Privatschlüssel-Scanner",
                nav_vanity: "Auto-Vanity-Suche",
                nav_hex: "HEX-Bereichsscan",
                nav_saved: "Gespeicherter Tresor",
                menu: "MENÜ",
                drawer_title: "Einstellungen & Menü",
                select_lang: "Sprache wählen (16 Sprachen)",
                select_theme: "Thema wählen",
                cpu_cores: "CPU-Kerne / Threads",
                perf_mode: "Leistungsmodus",
                perf_eco: "🌿 Eco (Langzeitlauf)",
                perf_balanced: "⚖️ Ausgewogen",
                perf_turbo: "🚀 Turbo (Max. Speed)",
                cpu_info: "Multithreading verlagert Berechnungen in Hintergrund-Web-Worker, damit Ihr Browser flüssig bleibt.",
                nav_title: "Hauptnavigation",
                about_title: "Über BitVanity",
                secure_title: "100% Lokal & Sicher",
                secure_desc: "Alle Schlüssel werden direkt in Ihrem Browser generiert.",
                tips_title: "Suchtipps",
                tip1: "Legacy-Bitcoin-Adressen beginnen mit 1.",
                tip2: "Ungültige Base58-Zeichen: 0, O, I, l.",
                tip3: "3-4 Zeichen Präfixe werden schnell gefunden.",
                stat_speed: "Suchgeschwindigkeit",
                stat_total: "Getestet Gesamt",
                stat_time: "Verstrichene Zeit",
                stat_matches: "Gefundene Treffer",
                vanity_params: "Vanity-Parameter",
                auto_active: "Auto-Modus Bereit",
                auto_mode_label: "Auto-Suchmodus",
                auto_mode_desc: "Sucht automatisch bei der Eingabe",
                prefix_label: "Präfix (Beginnt mit 1)",
                prefix_ex: "Bsp: 1BTC, 1Love",
                prefix_ph: "Präfix eingeben (z.B. BTC)",
                suffix_label: "Suffix (Optional)",
                suffix_ex: "Bsp: 77, WIN",
                suffix_ph: "Suffix eingeben",
                advanced_target_title: "Zieladresse & Öffentlicher Schlüssel",
                exact_addr: "Vollständige Zieladresse (Optional)",
                exact_addr_ph: "Bsp: 1BgG23dBnn3Cj3edL3khZJw...",
                target_pubkey: "Ziel Öffentlicher Schlüssel (HEX) (Optional)",
                target_pubkey_ph: "Bsp: 0279be667ef9dc...",
                err_base58: "Enthält ungültige Base58-Zeichen (0, O, I, l)",
                case_sensitive: "Groß-/Kleinschreibung",
                btn_start: "Suche Starten",
                btn_pause: "Pause",
                btn_resume: "Fortsetzen",
                btn_stop: "Stopp",
                auto_search_note: "Hinweis: Im Auto-Modus startet die Suche beim Tippen.",
                scan_status_label: "Live-Scan-Status",
                status_ready: "BEREIT",
                status_scanning: "SCANNEN...",
                status_paused: "PAUSIERT",
                status_stopped: "GESTOPPT",
                live_address: "LIVE ADRESSE:",
                live_privkey: "PRIVATSCHLÜSSEL (HEX):",
                found_results_title: "Gefundene Adressen",
                clear_list: "Liste Leeren",
                empty_results: "Noch keine Ergebnisse gefunden.",
                hex_title: "HEX-Bereichsscan",
                hex_subtitle: "Scannen Sie Hexadezimal-Schlüsselbereiche.",
                preset_label: "Voreinstellung:",
                preset_custom: "-- Benutzerdefiniert --",
                start_hex: "Start HEX",
                end_hex: "Ende HEX",
                target_addr: "Zieladresse (Optional)",
                blank_all: "Leer lassen für Vollscan",
                btn_start_hex: "HEX-Scan Starten",
                current_hex_pos: "Aktuelle Position:",
                hex_log_title: "HEX-Scan-Protokoll",
                clear_log: "Protokoll Löschen",
                log_empty: "Protokoll erscheint hier...",
                vault_title: "Schlüsseltresor",
                vault_subtitle: "Lokal gespeicherte Schlüssel.",
                btn_export: "JSON Exportieren",
                btn_export_txt: "TXT Exportieren",
                btn_clear_all: "Alle Löschen",
                vault_empty: "Ihr Tresor ist leer.",
                vault_empty_sub: "Klicken Sie bei Ergebnissen auf 'Speichern'.",
                qr_title: "Adress-QR-Code",
                close: "Schließen",
                footer_copy: "© 2026 BTC Tools Pro. Lokale kryptografische Berechnung.",
                copy_addr: "Adresse Kopieren",
                copy_wif: "WIF Kopieren",
                save: "Speichern",
                match_tag: "VANITY TREFFER",
                est_very_easy: "Schätzung: Sehr Einfach",
                est_200: "Schätzung: ~200 Schlüssel",
                est_10k: "Schätzung: ~10.000 Schlüssel",
                est_hard: "Schätzung: ~500.000+ Schlüssel",
                toast_saved: "Im Tresor gespeichert!",
                toast_copied: "In Zwischenablage kopiert!",
                toast_auto_on: "Auto-Suche aktiviert!",
                toast_auto_off: "Auto-Suche deaktiviert.",
                check_balance: "Guthaben"
            },
            it: {
                subtitle: "Ricerca Vanity e Scanner Chiavi Private HEX",
                nav_vanity: "Ricerca Auto Vanity",
                nav_hex: "Scansione Range HEX",
                nav_saved: "Cassaforte Chiavi",
                menu: "MENU",
                drawer_title: "Impostazioni e Menu",
                select_lang: "Seleziona Lingua (16 Lingue)",
                select_theme: "Seleziona Tema",
                cpu_cores: "Core CPU / Thread",
                perf_mode: "Modalità Prestazioni",
                perf_eco: "🌿 Eco (Lunga Durata)",
                perf_balanced: "⚖️ Bilanciato",
                perf_turbo: "🚀 Turbo (Velocità Max)",
                cpu_info: "Il multi-threading sposta i calcoli in Web Workers di background per mantenere il browser fluido.",
                nav_title: "Navigazione",
                about_title: "Informazioni su BitVanity",
                secure_title: "100% Locale e Sicuro",
                secure_desc: "Tutte le chiavi vengono generate nel tuo browser.",
                tips_title: "Consigli di Ricerca",
                tip1: "Gli indirizzi Bitcoin Legacy iniziano con 1.",
                tip2: "Caratteri Base58 non validi: 0, O, I, l.",
                tip3: "I prefissi di 3-4 caratteri sono veloci.",
                stat_speed: "Velocità",
                stat_total: "Totale Testati",
                stat_time: "Tempo Trascorso",
                stat_matches: "Trovati",
                vanity_params: "Parametri Vanity",
                auto_active: "Modalità Auto Pronta",
                auto_mode_label: "Modalità Ricerca Auto",
                auto_mode_desc: "Cerca automaticamente mentre digiti",
                prefix_label: "Prefisso (Inizia con 1)",
                prefix_ex: "Es: 1BTC, 1Love",
                prefix_ph: "Digita prefisso (es. BTC)",
                suffix_label: "Suffisso (Opzionale)",
                suffix_ex: "Es: 77, WIN",
                suffix_ph: "Digita suffisso",
                advanced_target_title: "Ricerca Indirizzo e Chiave Pubblica Target",
                exact_addr: "Indirizzo Completo Target (Opzionale)",
                exact_addr_ph: "Es: 1BgG23dBnn3Cj3edL3khZJw...",
                target_pubkey: "Chiave Pubblica Target (HEX) (Opzionale)",
                target_pubkey_ph: "Es: 0279be667ef9dc...",
                err_base58: "Contiene caratteri Base58 non validi (0, O, I, l)",
                case_sensitive: "Maiuscole/Minuscole",
                btn_start: "Avvia Ricerca",
                btn_pause: "Pausa",
                btn_resume: "Riprendi",
                btn_stop: "Ferma",
                auto_search_note: "Nota: In Modalità Auto, la ricerca parte digitando.",
                scan_status_label: "Stato Scansione Live",
                status_ready: "PRONTO",
                status_scanning: "SCANSIONE...",
                status_paused: "IN PAUSA",
                status_stopped: "FERMATO",
                live_address: "INDIRIZZO LIVE:",
                live_privkey: "CHIAVE PRIVATA (HEX):",
                found_results_title: "Risultati Trovati",
                clear_list: "Svuota Lista",
                empty_results: "Nessun risultato trovato al momento.",
                hex_title: "Scansione Range HEX",
                hex_subtitle: "Scansiona intervalli di chiavi private esadecimali.",
                preset_label: "Preimpostazione:",
                preset_custom: "-- Intervallo Personalizzato --",
                start_hex: "HEX Iniziale",
                end_hex: "HEX Finale",
                target_addr: "Indirizzo Target (Opzionale)",
                blank_all: "Lascia vuoto per scansionare tutto",
                btn_start_hex: "Avvia Scansione HEX",
                current_hex_pos: "Posizione Attuale:",
                hex_log_title: "Log Scansione HEX",
                clear_log: "Cancella Log",
                log_empty: "Il log apparirà qui...",
                vault_title: "Cassaforte Chiavi Salvate",
                vault_subtitle: "Chiavi salvate localmente.",
                btn_export: "Esporta JSON",
                btn_export_txt: "Esporta TXT",
                btn_clear_all: "Elimina Tutto",
                vault_empty: "La cassaforte è vuota.",
                vault_empty_sub: "Clicca 'Salva' su un risultato.",
                qr_title: "Codice QR Indirizzo",
                close: "Chiudi",
                footer_copy: "© 2026 BTC Tools Pro. Generazione crittografica locale.",
                copy_addr: "Copia Indirizzo",
                copy_wif: "Copia WIF",
                save: "Salva",
                match_tag: "CORRISPONDENZA VANITY",
                est_very_easy: "Stima: Molto Facile",
                est_200: "Stima: ~200 Chiavi",
                est_10k: "Stima: ~10.000 Chiavi",
                est_hard: "Stima: ~500.000+ Chiavi",
                toast_saved: "Salvato nella Cassaforte!",
                toast_copied: "Copiato negli appunti!",
                toast_auto_on: "Ricerca Auto Attivata!",
                toast_auto_off: "Ricerca Auto Disattivata.",
                check_balance: "Saldo"
            },
            la: {
                subtitle: "Inquisitio Vanity & Scrutator Clavis Privatae HEX",
                nav_vanity: "Auto Inquisitio Vanity",
                nav_hex: "Scrutinium HEX Range",
                nav_saved: "Arca Servata",
                menu: "TABULA",
                drawer_title: "Ordines & Tabula",
                select_lang: "Elige Linguam (16 Linguae)",
                select_theme: "Elige Argumentum",
                cpu_cores: "Centra CPU / Fila",
                perf_mode: "Modus Celeritatis",
                perf_eco: "🌿 Eco (Longum Tempus)",
                perf_balanced: "⚖️ Aequatus",
                perf_turbo: "🚀 Turbo (Celerissimus)",
                cpu_info: "Samba filorum computationes in Web Workers peragit ut navigatrum agile maneat.",
                nav_title: "Navigatio Principalis",
                about_title: "De BitVanity",
                secure_title: "100% In Navigatro & Tutum",
                secure_desc: "Omnes claves in navigatro tuo sine servitris generantur.",
                tips_title: "Consilia Inquisitionis",
                tip1: "Inscriptiones Bitcoin ab 1 incipiunt.",
                tip2: "Characteres Base58 invalidi: 0, O, I, l.",
                tip3: "Praefixa 3-4 litterarum celeriter inveniuntur.",
                stat_speed: "Celeritas",
                stat_total: "Probatum Totum",
                stat_time: "Tempus Elapsum",
                stat_matches: "Inventa",
                vanity_params: "Parametra Vanity",
                auto_active: "Modus Auto Paratus",
                auto_mode_label: "Modus Auto Inquisitionis",
                auto_mode_desc: "Statim quaerit cum scribis",
                prefix_label: "Praefixum (Incipit ab 1)",
                prefix_ex: "Ex: 1BTC, 1Love",
                prefix_ph: "Scribe praefixum (e.g. BTC)",
                suffix_label: "Suffixum (Optivum)",
                suffix_ex: "Ex: 77, WIN",
                suffix_ph: "Scribe suffixum hic",
                advanced_target_title: "Inquisitio Inscriptionis & Clavis Publicae",
                exact_addr: "Inscriptio Plena Scopi (Optivum)",
                exact_addr_ph: "Ex: 1BgG23dBnn3Cj3edL3khZJw...",
                target_pubkey: "Clavis Publica Scopi (HEX) (Optivum)",
                target_pubkey_ph: "Ex: 0279be667ef9dc...",
                err_base58: "Characteres Base58 invalidos continet (0, O, I, l)",
                case_sensitive: "Litterae Maiusculae/Minusculae",
                btn_start: "Incipe Inquisitionem",
                btn_pause: "Mora",
                btn_resume: "Perge",
                btn_stop: "Siste",
                auto_search_note: "Nota: In Modo Auto, inquisitio incipit scribendo.",
                scan_status_label: "Status Scrutinii",
                status_ready: "PARATUS",
                status_scanning: "SCRUTANS...",
                status_paused: "INTERMISSUS",
                status_stopped: "INTERMISSUS",
                live_address: "INSCRIPTIO VIVA:",
                live_privkey: "CLAVIS PRIVATA (HEX):",
                found_results_title: "Inscriptiones Inventae",
                clear_list: "Munda Indicem",
                empty_results: "Nondum inventum est quicquam.",
                hex_title: "Scrutinium HEX Spatii",
                hex_subtitle: "Scrutare spatia clavium privatarum hexadecimalium.",
                preset_label: "Praeset:",
                preset_custom: "-- Spatium Optivum --",
                start_hex: "Initium HEX",
                end_hex: "Finis HEX",
                target_addr: "Inscriptio Scopi (Optivum)",
                blank_all: "Vacuum relinque ut omnia scruteris",
                btn_start_hex: "Incipe Scrutinium HEX",
                current_hex_pos: "Positio Hodierna:",
                hex_log_title: "Acta Scrutinii HEX",
                clear_log: "Dele Acta",
                log_empty: "Acta scrutinii hic apparebunt...",
                vault_title: "Arca Clavium Servatarum",
                vault_subtitle: "Claves servantur in computatro tuo.",
                btn_export: "Exporta JSON",
                btn_export_txt: "Exporta TXT",
                btn_clear_all: "Dele Omnia",
                vault_empty: "Arca tua vacua est.",
                vault_empty_sub: "Preme 'Serva' in inventis.",
                qr_title: "Inscriptio QR Code",
                close: "Claude",
                footer_copy: "© 2026 BTC Tools Pro. Computatio localis est.",
                copy_addr: "Exscribe Inscriptionem",
                copy_wif: "Exscribe WIF",
                save: "Serva",
                match_tag: "VANITY INVENTUM",
                est_very_easy: "Aestimatio: Facillimum",
                est_200: "Aestimatio: ~200 Claves",
                est_10k: "Aestimatio: ~10,000 Claves",
                est_hard: "Aestimatio: ~500,000+ Claves",
                toast_saved: "Servatum in Arca!",
                toast_copied: "Exscriptum est!",
                toast_auto_on: "Auto Inquisitio Activata!",
                toast_auto_off: "Auto Inquisitio Deactivata.",
                check_balance: "Nuntianti"
            },
            ar: {
                subtitle: "الباحث عن العناوين المميزة وماسح مفاتيح HEX",
                nav_vanity: "بحث تلقائي مميز",
                nav_hex: "مسح نطاق HEX",
                nav_saved: "المحفظة المحفوظة",
                menu: "القائمة",
                drawer_title: "الإعدادات والقائمة",
                select_lang: "اختر اللغة (16 لغة)",
                select_theme: "اختر الثيم",
                cpu_cores: "أنوية المعالج / المسارات",
                perf_mode: "وضع الأداء",
                perf_eco: "🌿 اقتصادي (تشغيل مستمر)",
                perf_balanced: "⚖️ متوازن",
                perf_turbo: "🚀 فائق (أقصى سرعة)",
                cpu_info: "تقوم الأنوية المتعددة بإجراء الحسابات في الخلفية حتى يظل المتصفح خفيفاً وسلساً.",
                nav_title: "التنقل الرئيسي",
                about_title: "حول BitVanity",
                secure_title: "100% آمن وآمن في المتصفح",
                secure_desc: "تتم إنشاء جميع المفاتيح في متصفحك دون خوادم خارجية.",
                tips_title: "نصائح البحث",
                tip1: "تبدأ عناوين بيتكوين التقليدية بـ 1.",
                tip2: "أحرف Base58 غير الصالحة: 0, O, I, l.",
                tip3: "يتم العثور على البادئات من 3-4 أحرف بسرعة.",
                stat_speed: "سرعة البحث",
                stat_total: "إجمالي الاختبارات",
                stat_time: "الوقت المنقضي",
                stat_matches: "النتائج المطابقة",
                vanity_params: "إعدادات العنوان",
                auto_active: "الوضع التلقائي جاهز",
                auto_mode_label: "وضع البحث التلقائي",
                auto_mode_desc: "يبحث تلقائياً فور كتابة البادئة",
                prefix_label: "البادئة (تبدأ بـ 1)",
                prefix_ex: "مثال: 1BTC, 1Love",
                prefix_ph: "اكتب البادئة (مثال: BTC)",
                suffix_label: "اللاحقة (اختياري)",
                suffix_ex: "مثال: 77, WIN",
                suffix_ph: "اكتب اللاحقة هنا",
                advanced_target_title: "البحث عن طريق العنوان والمفتاح العام",
                exact_addr: "العنوان الكامل المستهدف (اختياري)",
                exact_addr_ph: "مثال: 1BgG23dBnn3Cj3edL3khZJw...",
                target_pubkey: "المفتاح العام المستهدف (HEX) (اختياري)",
                target_pubkey_ph: "مثال: 0279be667ef9dc...",
                err_base58: "يحتوي على أحرف Base58 غير صالحة (0, O, I, l)",
                case_sensitive: "حساس لحالة الأحرف",
                btn_start: "بدء البحث",
                btn_pause: "إيقاف مؤقت",
                btn_resume: "استئناف",
                btn_stop: "إيقاف",
                auto_search_note: "ملاحظة: في الوضع التلقائي يبدأ البحث عند الكتابة.",
                scan_status_label: "حالة المسح المباشر",
                status_ready: "جاهز",
                status_scanning: "جاري المسح...",
                status_paused: "متوقف مؤقتاً",
                status_stopped: "متوقف",
                live_address: "العنوان المباشر:",
                live_privkey: "المفتاح الخاص (HEX):",
                found_results_title: "النتائج المطابقة",
                clear_list: "مسح القائمة",
                empty_results: "لم يتم العثور على نتائج حتى الآن.",
                hex_title: "مسح نطاق مفاتيح HEX",
                hex_subtitle: "مسح نطاق المفاتيح الخاصة الست عشرية.",
                preset_label: "الإعداد المسبق:",
                preset_custom: "-- نطاق مخصص --",
                start_hex: "بداية HEX",
                end_hex: "نهاية HEX",
                target_addr: "العنوان المستهدف (اختياري)",
                blank_all: "اتركه فارغاً لمسح الكل",
                btn_start_hex: "بدء مسح HEX",
                current_hex_pos: "الموقع الحالي:",
                hex_log_title: "سجل مسح HEX",
                clear_log: "مسح السجل",
                log_empty: "سيظهر سجل المسح هنا...",
                vault_title: "خزنة المفاتيح المحفوظة",
                vault_subtitle: "المفاتيح المحفوظة محلياً في جهازك.",
                btn_export: "تصدير JSON",
                btn_export_txt: "تصدير TXT",
                btn_clear_all: "حذف الكل",
                vault_empty: "محفظتك فارغة.",
                vault_empty_sub: "انقر على 'حفظ' في نتائج البحث.",
                qr_title: "رمز QR للعنوان",
                close: "إغلاق",
                footer_copy: "© 2026 BTC Tools Pro. جميع العمليات تتم محلياً في متصفحك.",
                copy_addr: "نسخ العنوان",
                copy_wif: "نسخ WIF",
                save: "حفظ",
                match_tag: "مطابقة ممتازة",
                est_very_easy: "التقدير: سهل جداً",
                est_200: "التقدير: ~200 مفتاح",
                est_10k: "التقدير: ~10,000 مفتاح",
                est_hard: "التقدير: ~500,000+ مفتاح",
                toast_saved: "تم الحفظ في الخزنة!",
                toast_copied: "تم النسخ إلى الحافظة!",
                toast_auto_on: "تم تفعيل البحث التلقائي!",
                toast_auto_off: "تم إيقاف البحث التلقائي.",
                check_balance: "فحص الرصيد"
            },
            jv: {
                subtitle: "Panguluru Vanity & Pamindai HEX Private Key",
                nav_vanity: "Panguluru Vanity Otomatis",
                nav_hex: "Pindai Julat HEX",
                nav_saved: "Kunci Kasimpen",
                menu: "MENU",
                drawer_title: "Setelan & Menu",
                select_lang: "Pilih Basa (16 Basa)",
                select_theme: "Pilih Tema Visual",
                cpu_cores: "Inti CPU / Thread",
                perf_mode: "Mode Performa",
                perf_eco: "🌿 Eco (Penggunaan Suwe)",
                perf_balanced: "⚖️ Mode Imbang",
                perf_turbo: "🚀 Turbo (Banter Maks)",
                cpu_info: "Multi-threading nglakokake petungan ing latar mburi supaya browser tetep lancar.",
                nav_title: "Navigasi Utama",
                about_title: "Babagan BitVanity",
                secure_title: "100% Lokal & Aman",
                secure_desc: "Kabeh kunci digawe ing browser sampeyan tanpa server njaba.",
                tips_title: "Tips Ngluru Vanity",
                tip1: "Alamat Legacy Bitcoin diwititi angka 1.",
                tip2: "Karakter ora sah Base58: 0, O, I, l.",
                tip3: "Awalan 3-4 karakter cepet banget ditemokake.",
                stat_speed: "Kacepantan",
                stat_total: "Kabeh Ditest",
                stat_time: "Wektu Lumaku",
                stat_matches: "Kunci Ditemokake",
                vanity_params: "Parameter Vanity",
                auto_active: "Mode Otomatis Siap",
                auto_mode_label: "Mode Auto Search",
                auto_mode_desc: "Ngluru otomatis nalika ngetik awalan/akhiran",
                prefix_label: "Awalan / Prefix (Diwititi 1)",
                prefix_ex: "Conto: 1BTC, 1Love",
                prefix_ph: "Ketik awalan (cth: BTC)",
                suffix_label: "Akhiran / Suffix (Pilihan)",
                suffix_ex: "Conto: 77, WIN",
                suffix_ph: "Ketik akhiran ing kene",
                advanced_target_title: "Ngluru Alamat & PubKey Target",
                exact_addr: "Alamat Lengkap Target (Pilihan)",
                exact_addr_ph: "Conto: 1BgG23dBnn3Cj3edL3khZJw...",
                target_pubkey: "Kunci Publik Target (HEX) (Pilihan)",
                target_pubkey_ph: "Conto: 0279be667ef9dc...",
                err_base58: "Ana karakter ora sah Base58 (0, O, I, l)",
                case_sensitive: "Membedakan Aksara Gede/Cilik",
                btn_start: "Mulai Ngluru",
                btn_pause: "Jeda",
                btn_resume: "Banjurake",
                btn_stop: "Leren",
                auto_search_note: "Cathetan: Ing Mode Otomatis, ngluru langsung nalika ngetik.",
                scan_status_label: "Status Pemindaian",
                status_ready: "SIAP",
                status_scanning: "MRAKSA...",
                status_paused: "Dilereni sauntara",
                status_stopped: "DIAMBREGAKE",
                live_address: "ALAMAT LANGSUNG:",
                live_privkey: "PRIVATE KEY (HEX):",
                found_results_title: "Hasil Ditemokake",
                clear_list: "Resiki Dhaptar",
                empty_results: "Dereng wonten hasil vanity ditemokake.",
                hex_title: "Pindai Julat Private Key HEX",
                hex_subtitle: "Priksa julat Hexadecimal Private Key kanggo target Bitcoin.",
                preset_label: "Setelan:",
                preset_custom: "-- Julat Kustom --",
                start_hex: "Awal HEX",
                end_hex: "Akhir HEX",
                target_addr: "Target Alamat (Pilihan)",
                blank_all: "Jarke kosong kanggo pindai kabeh",
                btn_start_hex: "Mulai Pindai HEX",
                current_hex_pos: "Posisi Saiki:",
                hex_log_title: "Log Pindai HEX",
                clear_log: "Busam Log",
                log_empty: "Log pemindaian bakal katon ing kene...",
                vault_title: "Pethi Simpenan Kunci",
                vault_subtitle: "Kunci vanity & pemindaian HEX disimpen ing lokal.",
                btn_export: "Ekspor JSON",
                btn_export_txt: "Ekspor TXT",
                btn_clear_all: "Busam Kabeh",
                vault_empty: "Pethi simpenan sampeyan isih kosong.",
                vault_empty_sub: "Pencet 'Simpen' ing hasil ngluru.",
                qr_title: "Kode QR Alamat",
                close: "Tutup",
                footer_copy: "© 2026 BTC Tools Pro. Pemrosesan ing browser lokal.",
                copy_addr: "Salin Alamat",
                copy_wif: "Salin WIF",
                save: "Simpen",
                match_tag: "HASIL VANITY",
                est_very_easy: "Gampangan: Gampang Banget",
                est_200: "Gampangan: ~200 Kunci",
                est_10k: "Gampangan: ~10,000 Kunci",
                est_hard: "Gampangan: ~500,000+ Kunci",
                toast_saved: "Kasil disimpen ing Pethi!",
                toast_copied: "Kasil disalin ing clipboard!",
                toast_auto_on: "Mode Auto Search Ditingkatake!",
                toast_auto_off: "Mode Auto Search Dideaktifake.",
                check_balance: "Cek Saldo"
            }
        };

        const workerBlobCode = `
            importScripts('https://cdnjs.cloudflare.com/ajax/libs/elliptic/6.5.4/elliptic.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js');

            const ec = new elliptic.ec('secp256k1');
            const B58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

            function base58Encode(buffer) {
                let digits = [0];
                for (let i = 0; i < buffer.length; i++) {
                    for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
                    digits[0] += buffer[i];
                    let carry = 0;
                    for (let j = 0; j < digits.length; j++) {
                        digits[j] += carry;
                        carry = (digits[j] / 58) | 0;
                        digits[j] %= 58;
                    }
                    while (carry) {
                        digits.push(carry % 58);
                        carry = (carry / 58) | 0;
                    }
                }
                for (let i = 0; buffer[i] === 0 && i < buffer.length - 1; i++) digits.push(0);
                return digits.reverse().map(d => B58_ALPHABET[d]).join('');
            }

            function hexToBytes(hex) {
                let bytes = [];
                for (let c = 0; c < hex.length; c += 2) {
                    bytes.push(parseInt(hex.substr(c, 2), 16));
                }
                return bytes;
            }

            function generateBtcPair(customPrivHex = null) {
                let keyPair;
                if (customPrivHex) {
                    keyPair = ec.keyFromPrivate(customPrivHex, 'hex');
                } else {
                    keyPair = ec.genKeyPair();
                }
                
                const privHex = keyPair.getPrivate('hex').padStart(64, '0');
                const pubHex = keyPair.getPublic(true, 'hex');
                const pubHexUncompressed = keyPair.getPublic(false, 'hex');
                
                const pubWordArray = CryptoJS.enc.Hex.parse(pubHex);
                const sha256Hash = CryptoJS.SHA256(pubWordArray);
                const ripemd160Hash = CryptoJS.RIPEMD160(sha256Hash);
                
                const addressBytesHex = '00' + ripemd160Hash.toString(CryptoJS.enc.Hex);
                const addressWordArray = CryptoJS.enc.Hex.parse(addressBytesHex);
                
                const doubleSha = CryptoJS.SHA256(CryptoJS.SHA256(addressWordArray));
                const checksum = doubleSha.toString(CryptoJS.enc.Hex).substring(0, 8);
                
                const fullHex = addressBytesHex + checksum;
                const address = base58Encode(hexToBytes(fullHex));
                
                const wifHex = '80' + privHex + '01';
                const wifWordArray = CryptoJS.enc.Hex.parse(wifHex);
                const wifChecksum = CryptoJS.SHA256(CryptoJS.SHA256(wifWordArray)).toString(CryptoJS.enc.Hex).substring(0, 8);
                const wifFullHex = wifHex + wifChecksum;
                const wif = base58Encode(hexToBytes(wifFullHex));

                return { privHex, pubHex, pubHexUncompressed, address, wif };
            }

            let isRunning = false;
            let isPaused = false;
            let searchParams = null;
            let mode = 'vanity';
            let hexCurrentInt = null;
            let hexEndInt = null;
            let hexStepMultiplier = 1n;
            let lastLogTime = 0;

            self.onmessage = function(e) {
                const data = e.data;
                const cmd = data.cmd;
                const params = data.params;

                if (cmd === 'START_VANITY') {
                    isRunning = true;
                    isPaused = false;
                    mode = 'vanity';
                    searchParams = params;
                    runVanityLoop();
                } else if (cmd === 'START_HEX') {
                    isRunning = true;
                    isPaused = false;
                    mode = 'hex';
                    searchParams = params;
                    hexCurrentInt = BigInt("0x" + params.startHex);
                    hexEndInt = BigInt("0x" + params.endHex);
                    hexStepMultiplier = BigInt(params.stepMultiplier || 1);
                    runHexLoop();
                } else if (cmd === 'PAUSE') {
                    isPaused = true;
                } else if (cmd === 'RESUME') {
                    isPaused = false;
                    if (mode === 'vanity') runVanityLoop();
                    else if (mode === 'hex') runHexLoop();
                } else if (cmd === 'STOP') {
                    isRunning = false;
                    isPaused = false;
                } else if (cmd === 'UPDATE_PARAMS') {
                    searchParams = params;
                }
            };

            function runVanityLoop() {
                if (!isRunning || isPaused) return;

                const prefix = searchParams.prefix;
                const suffix = searchParams.suffix;
                const targetAddr = searchParams.targetAddr;
                const targetPubkey = searchParams.targetPubkey;
                const caseSensitive = searchParams.caseSensitive;
                const perfDelay = searchParams.perfDelay || 0;

                const BATCH = 20;
                let testedCount = 0;
                let lastPair = null;

                for (let i = 0; i < BATCH; i++) {
                    testedCount++;
                    const pair = generateBtcPair();
                    lastPair = pair;

                    let addrToTest = pair.address;
                    let targetPrefix = "1" + prefix;
                    let targetSuffix = suffix;

                    if (!caseSensitive) {
                        addrToTest = addrToTest.toLowerCase();
                        targetPrefix = targetPrefix.toLowerCase();
                        targetSuffix = targetSuffix.toLowerCase();
                    }

                    const matchPrefix = prefix === "" || addrToTest.startsWith(targetPrefix);
                    const matchSuffix = suffix === "" || addrToTest.endsWith(targetSuffix);
                    const matchExactAddr = targetAddr === "" || pair.address === targetAddr;
                    const matchPubkey = targetPubkey === "" || pair.pubHex.toLowerCase() === targetPubkey || pair.pubHexUncompressed.toLowerCase() === targetPubkey;

                    const hasSearchCondition = prefix !== "" || suffix !== "" || targetAddr !== "" || targetPubkey !== "";

                    if (matchPrefix && matchSuffix && matchExactAddr && matchPubkey && hasSearchCondition) {
                        self.postMessage({ type: 'MATCH', pair: pair });
                    }
                }

                self.postMessage({ type: 'PROGRESS', count: testedCount, lastPair: lastPair });

                if (isRunning && !isPaused) {
                    setTimeout(runVanityLoop, perfDelay);
                }
            }

            function runHexLoop() {
                if (!isRunning || isPaused || hexCurrentInt > hexEndInt) {
                    if (hexCurrentInt > hexEndInt) {
                        self.postMessage({ type: 'HEX_DONE' });
                    }
                    return;
                }

                const targetAddr = searchParams.targetAddr;
                const targetPubkey = searchParams.targetPubkey;
                const perfDelay = searchParams.perfDelay || 0;

                const BATCH = 8;
                let testedCount = 0;
                let lastPair = null;

                for (let i = 0; i < BATCH && hexCurrentInt <= hexEndInt; i++) {
                    testedCount++;
                    const currentHex32 = hexCurrentInt.toString(16).padStart(64, '0');
                    const pair = generateBtcPair(currentHex32);
                    lastPair = pair;

                    const isAddrMatch = targetAddr !== "" && pair.address === targetAddr;
                    const isPubkeyMatch = targetPubkey !== "" && (pair.pubHex.toLowerCase() === targetPubkey || pair.pubHexUncompressed.toLowerCase() === targetPubkey);
                    const isMatch = (targetAddr !== "" || targetPubkey !== "") ? (isAddrMatch || isPubkeyMatch) : false;

                    // Send log only when match is found or throttled once every 400ms to avoid memory/DOM overload
                    const now = Date.now();
                    if (isMatch || (now - lastLogTime > 400)) {
                        lastLogTime = now;
                        self.postMessage({ type: 'HEX_LOG', hex: currentHex32, pair: pair, isMatch: isMatch });
                    }

                    if (isMatch) {
                        self.postMessage({ type: 'MATCH', pair: pair });
                    }

                    hexCurrentInt += hexStepMultiplier;
                }

                self.postMessage({ type: 'PROGRESS', count: testedCount, lastPair: lastPair, currentHex: hexCurrentInt.toString(16) });

                if (isRunning && !isPaused && hexCurrentInt <= hexEndInt) {
                    setTimeout(runHexLoop, perfDelay);
                }
            }
        `;

        let workerBlobUrl = null;

        function getWorkerBlobUrl() {
            if (!workerBlobUrl) {
                const blob = new Blob([workerBlobCode], { type: 'application/javascript' });
                workerBlobUrl = URL.createObjectURL(blob);
            }
            return workerBlobUrl;
        }

        function initCpuOptions() {
            const panelSelect = document.getElementById('panel-cpu-cores');
            const menuSelect = document.getElementById('menu-cpu-cores');
            const hexPanelSelect = document.getElementById('hex-panel-cpu-cores');

            panelSelect.innerHTML = '';
            menuSelect.innerHTML = '';
            if (hexPanelSelect) hexPanelSelect.innerHTML = '';

            for (let i = 1; i <= Math.max(MAX_HARDWARE_CORES, 8); i++) {
                const isDefault = (i === selectedCpuCores);
                const optionText = `${i} ${i === 1 ? 'Core' : 'Cores'} ${i === MAX_HARDWARE_CORES ? '(Max)' : ''}`;

                const opt1 = new Option(optionText, i, false, isDefault);
                const opt2 = new Option(optionText, i, false, isDefault);
                const opt3 = new Option(optionText, i, false, isDefault);

                panelSelect.add(opt1);
                menuSelect.add(opt2);
                if (hexPanelSelect) hexPanelSelect.add(opt3);
            }
        }

        function updateCpuCores(num) {
            selectedCpuCores = parseInt(num) || 1;
            document.getElementById('panel-cpu-cores').value = selectedCpuCores;
            document.getElementById('menu-cpu-cores').value = selectedCpuCores;
            const hexSelect = document.getElementById('hex-panel-cpu-cores');
            if (hexSelect) hexSelect.value = selectedCpuCores;

            if (isVanitySearching && !isVanityPaused) {
                stopWorkers();
                spawnWorkersAndStart('START_VANITY', getVanitySearchParams());
            } else if (isHexScanning && !isHexPaused) {
                stopWorkers();
                const params = getHexSearchParams();
                if (hexCurrentInt) {
                    params.startHex = hexCurrentInt.toString(16).padStart(64, '0');
                }
                spawnWorkersAndStart('START_HEX', params);
            }
        }

        function updatePerfMode(mode) {
            selectedPerfMode = mode;
            document.getElementById('panel-perf-mode').value = mode;
            document.getElementById('menu-perf-mode').value = mode;
            const hexPerfSelect = document.getElementById('hex-panel-perf-mode');
            if (hexPerfSelect) hexPerfSelect.value = mode;

            broadcastWorkerParams();
        }

        function getPerfDelayMs() {
            if (selectedPerfMode === 'eco') return 15;
            if (selectedPerfMode === 'balanced') return 2;
            return 0; // turbo
        }

        function spawnWorkersAndStart(cmd, params) {
            stopWorkers();

            const perfDelay = getPerfDelayMs();
            params.perfDelay = perfDelay;

            for (let threadIdx = 0; threadIdx < selectedCpuCores; threadIdx++) {
                try {
                    const worker = new Worker(getWorkerBlobUrl());
                    
                    const threadParams = Object.assign({}, params);
                    if (cmd === 'START_HEX') {
                        const startInt = BigInt("0x" + params.startHex) + BigInt(threadIdx);
                        threadParams.startHex = startInt.toString(16).padStart(64, '0');
                        threadParams.stepMultiplier = selectedCpuCores;
                    }

                    worker.onmessage = function(e) {
                        handleWorkerMessage(e.data, threadIdx);
                    };

                    worker.postMessage({ cmd: cmd, params: threadParams });
                    workerList.push(worker);
                } catch (err) {
                    console.warn("Worker creation failed, falling back to single thread:", err);
                    break;
                }
            }
        }

        function broadcastWorkerMessage(msg) {
            workerList.forEach(w => w.postMessage(msg));
        }

        function broadcastWorkerParams() {
            if (isVanitySearching) {
                const params = getVanitySearchParams();
                params.perfDelay = getPerfDelayMs();
                broadcastWorkerMessage({ cmd: 'UPDATE_PARAMS', params: params });
            } else if (isHexScanning) {
                const params = getHexSearchParams();
                params.perfDelay = getPerfDelayMs();
                broadcastWorkerMessage({ cmd: 'UPDATE_PARAMS', params: params });
            }
        }

        function stopWorkers() {
            workerList.forEach(w => {
                w.postMessage({ cmd: 'STOP' });
                w.terminate();
            });
            workerList = [];
        }

        let lastUiUpdate = 0;

        function handleWorkerMessage(data, threadIdx) {
            if (data.type === 'PROGRESS') {
                totalKeysTested += data.count;
                speedCounter += data.count;

                if (data.currentHex) {
                    try {
                        hexCurrentInt = BigInt("0x" + data.currentHex);
                    } catch(e){}
                }

                const now = Date.now();
                if (now - lastUiUpdate > 80 && data.lastPair) {
                    lastUiUpdate = now;
                    document.getElementById('live-address').innerText = data.lastPair.address;
                    document.getElementById('live-privkey').innerText = data.lastPair.privHex;
                    document.getElementById('stat-total').innerText = totalKeysTested.toLocaleString();

                    if (isHexScanning && hexTotalRange > 0n && hexCurrentInt) {
                        const done = hexCurrentInt - (BigInt("0x" + getHexSearchParams().startHex));
                        let pct = Number((done * 100n) / hexTotalRange);
                        if (pct < 0) pct = 0;
                        if (pct > 100) pct = 100;
                        document.getElementById('hex-progress-bar').style.width = pct.toFixed(1) + '%';
                        document.getElementById('hex-current-step').innerText = `HEX: ...${hexCurrentInt.toString(16).slice(-12)} (${pct.toFixed(1)}%)`;
                    }
                }
            } else if (data.type === 'MATCH') {
                vanityMatchesCount++;
                document.getElementById('stat-matches').innerText = vanityMatchesCount;

                const pair = data.pair;
                const matchItem = {
                    address: pair.address,
                    wif: pair.wif,
                    privHex: pair.privHex,
                    pubHex: pair.pubHex,
                    timestamp: new Date().toLocaleTimeString()
                };
                vanityResultsList.unshift(matchItem);

                addVanityMatchResult(pair);
                showToast(`Match Found: ${pair.address.substring(0, 10)}...`, "success");

                if (isHexScanning) {
                    saveKeyToVault(pair.address, pair.privHex, pair.wif, "HEX Match");
                }
            } else if (data.type === 'HEX_LOG') {
                if (threadIdx === 0) {
                    logHexEntry(data.hex, data.pair.address, data.isMatch, data.pair);
                }
            } else if (data.type === 'HEX_DONE') {
                stopHexScan();
                showToast("HEX Scan Completed!", "info");
            }
        }

        function changeLanguage(langCode) {
            if (!translations[langCode]) langCode = 'en';
            currentLang = langCode;
            localStorage.setItem('bitvanity_lang', langCode);

            const dict = translations[langCode];

            const htmlRoot = document.getElementById('html-root');
            if (langCode === 'ar') {
                htmlRoot.setAttribute('dir', 'rtl');
            } else {
                htmlRoot.removeAttribute('dir');
            }

            document.getElementById('lang-selector').value = langCode;
            document.getElementById('active-lang-code').innerText = langCode;

            document.querySelectorAll('[data-i18n]').forEach(elem => {
                const key = elem.getAttribute('data-i18n');
                if (dict[key]) {
                    elem.innerText = dict[key];
                }
            });

            document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
                const key = elem.getAttribute('data-i18n-placeholder');
                if (dict[key]) {
                    elem.placeholder = dict[key];
                }
            });

            document.getElementById('text-pause-vanity').innerText = isVanityPaused ? getTranslation('btn_resume') : getTranslation('btn_pause');
            document.getElementById('text-hex-pause').innerText = isHexPaused ? getTranslation('btn_resume') : getTranslation('btn_pause');

            handlePrefixInput();

            if (!document.getElementById('section-saved').classList.contains('hidden')) {
                renderSavedKeys();
            }
        }

        function getTranslation(key) {
            return (translations[currentLang] && translations[currentLang][key]) ? translations[currentLang][key] : (translations['en'][key] || key);
        }

        function base58Encode(buffer) {
            let digits = [0];
            for (let i = 0; i < buffer.length; i++) {
                for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
                digits[0] += buffer[i];
                let carry = 0;
                for (let j = 0; j < digits.length; j++) {
                    digits[j] += carry;
                    carry = (digits[j] / 58) | 0;
                    digits[j] %= 58;
                }
                while (carry) {
                    digits.push(carry % 58);
                    carry = (carry / 58) | 0;
                }
            }
            for (let i = 0; buffer[i] === 0 && i < buffer.length - 1; i++) digits.push(0);
            return digits.reverse().map(d => B58_ALPHABET[d]).join('');
        }

        function hexToBytes(hex) {
            let bytes = [];
            for (let c = 0; c < hex.length; c += 2) {
                bytes.push(parseInt(hex.substr(c, 2), 16));
            }
            return bytes;
        }

        function generateBtcPair(customPrivHex = null) {
            let keyPair;
            if (customPrivHex) {
                keyPair = ec.keyFromPrivate(customPrivHex, 'hex');
            } else {
                keyPair = ec.genKeyPair();
            }
            
            const privHex = keyPair.getPrivate('hex').padStart(64, '0');
            const pubHex = keyPair.getPublic(true, 'hex');
            const pubHexUncompressed = keyPair.getPublic(false, 'hex');
            
            const pubWordArray = CryptoJS.enc.Hex.parse(pubHex);
            const sha256Hash = CryptoJS.SHA256(pubWordArray);
            const ripemd160Hash = CryptoJS.RIPEMD160(sha256Hash);
            
            const addressBytesHex = '00' + ripemd160Hash.toString(CryptoJS.enc.Hex);
            const addressWordArray = CryptoJS.enc.Hex.parse(addressBytesHex);
            
            const doubleSha = CryptoJS.SHA256(CryptoJS.SHA256(addressWordArray));
            const checksum = doubleSha.toString(CryptoJS.enc.Hex).substring(0, 8);
            
            const fullHex = addressBytesHex + checksum;
            const address = base58Encode(hexToBytes(fullHex));
            
            const wifHex = '80' + privHex + '01';
            const wifWordArray = CryptoJS.enc.Hex.parse(wifHex);
            const wifChecksum = CryptoJS.SHA256(CryptoJS.SHA256(wifWordArray)).toString(CryptoJS.enc.Hex).substring(0, 8);
            const wifFullHex = wifHex + wifChecksum;
            const wif = base58Encode(hexToBytes(wifFullHex));

            return { privHex, pubHex, pubHexUncompressed, address, wif };
        }

        function switchTab(tab) {
            document.getElementById('section-vanity').classList.add('hidden');
            document.getElementById('section-hex').classList.add('hidden');
            document.getElementById('section-saved').classList.add('hidden');

            document.getElementById('tab-btn-vanity').className = 'px-3.5 py-2 rounded-lg text-xs lg:text-sm font-semibold flex items-center space-x-2 transition text-gray-400 hover:text-white';
            document.getElementById('tab-btn-hex').className = 'px-3.5 py-2 rounded-lg text-xs lg:text-sm font-semibold flex items-center space-x-2 transition text-gray-400 hover:text-white';
            document.getElementById('tab-btn-saved').className = 'px-3.5 py-2 rounded-lg text-xs lg:text-sm font-semibold flex items-center space-x-2 transition text-gray-400 hover:text-white';

            if (tab === 'vanity') {
                document.getElementById('section-vanity').classList.remove('hidden');
                document.getElementById('tab-btn-vanity').className = 'px-3.5 py-2 rounded-lg text-xs lg:text-sm font-semibold flex items-center space-x-2 transition bg-amber-500 text-black shadow-sm';
            } else if (tab === 'hex') {
                document.getElementById('section-hex').classList.remove('hidden');
                document.getElementById('tab-btn-hex').className = 'px-3.5 py-2 rounded-lg text-xs lg:text-sm font-semibold flex items-center space-x-2 transition bg-indigo-600 text-white shadow-sm';
            } else if (tab === 'saved') {
                document.getElementById('section-saved').classList.remove('hidden');
                document.getElementById('tab-btn-saved').className = 'px-3.5 py-2 rounded-lg text-xs lg:text-sm font-semibold flex items-center space-x-2 transition bg-emerald-600 text-white shadow-sm';
                renderSavedKeys();
            }
        }

        function changeTheme(themeClass) {
            document.body.className = `${themeClass} min-h-screen font-sans antialiased flex flex-col justify-between selection:bg-yellow-500 selection:text-black`;
            localStorage.setItem('bitvanity_theme', themeClass);
            document.getElementById('theme-selector').value = themeClass;
        }

        function toggleMenuDrawer() {
            const drawer = document.getElementById('menu-drawer');
            const backdrop = document.getElementById('drawer-backdrop');
            
            if (drawer.classList.contains('translate-x-full')) {
                drawer.classList.remove('translate-x-full');
                backdrop.classList.remove('opacity-0');
            } else {
                drawer.classList.add('translate-x-full');
                backdrop.classList.add('opacity-0');
            }
        }

        function toggleAdvancedSearchAccordion() {
            const panel = document.getElementById('advanced-search-panel');
            const chevron = document.getElementById('accordion-chevron');
            if (panel.classList.contains('hidden')) {
                panel.classList.remove('hidden');
                chevron.classList.add('rotate-180');
            } else {
                panel.classList.add('hidden');
                chevron.classList.remove('rotate-180');
            }
        }

        function toggleAutoSearchMode() {
            autoSearchMode = document.getElementById('auto-search-toggle').checked;
            if (autoSearchMode) {
                showToast(getTranslation('toast_auto_on'), "success");
                handlePrefixInput();
            } else {
                showToast(getTranslation('toast_auto_off'), "info");
            }
        }

        function getVanitySearchParams() {
            return {
                prefix: document.getElementById('vanity-prefix').value.trim(),
                suffix: document.getElementById('vanity-suffix').value.trim(),
                targetAddr: document.getElementById('target-address-input')?.value.trim() || "",
                targetPubkey: document.getElementById('target-pubkey-input')?.value.trim().toLowerCase() || "",
                caseSensitive: document.getElementById('vanity-case').checked
            };
        }

        function handlePrefixInput() {
            const prefixInput = document.getElementById('vanity-prefix').value.trim();
            const prefixError = document.getElementById('prefix-error');

            if (/[0OIl]/.test(prefixInput)) {
                prefixError.classList.remove('hidden');
                return;
            } else {
                prefixError.classList.add('hidden');
            }

            const length = prefixInput.length;
            const diffElem = document.getElementById('diff-estimate');
            if (length <= 2) diffElem.innerText = getTranslation('est_very_easy');
            else if (length === 3) diffElem.innerText = getTranslation('est_200');
            else if (length === 4) diffElem.innerText = getTranslation('est_10k');
            else if (length >= 5) diffElem.innerText = getTranslation('est_hard');

            const hasTargetAddr = document.getElementById('target-address-input')?.value.trim().length > 0;
            const hasTargetPubkey = document.getElementById('target-pubkey-input')?.value.trim().length > 0;

            if (isVanitySearching) {
                broadcastWorkerParams();
            }

            if (autoSearchMode && (prefixInput.length > 0 || document.getElementById('vanity-suffix').value.trim().length > 0 || hasTargetAddr || hasTargetPubkey)) {
                if (!isVanitySearching) {
                    startVanitySearch();
                }
            }
        }

        function startVanitySearch() {
            if (isVanitySearching && !isVanityPaused) return;

            if (isVanityPaused) {
                togglePauseVanitySearch();
                return;
            }

            isVanitySearching = true;
            isVanityPaused = false;
            document.getElementById('btn-start-vanity').disabled = true;
            document.getElementById('btn-pause-vanity').disabled = false;
            document.getElementById('btn-stop-vanity').disabled = false;

            document.getElementById('icon-pause-vanity').className = "fa-solid fa-pause";
            document.getElementById('text-pause-vanity').innerText = getTranslation('btn_pause');

            document.getElementById('scan-status-text').innerText = getTranslation('status_scanning');
            document.getElementById('scan-status-text').className = "text-xs font-mono font-semibold text-emerald-400 animate-pulse";

            startTimers();

            const params = getVanitySearchParams();
            spawnWorkersAndStart('START_VANITY', params);
        }

        function togglePauseVanitySearch() {
            if (!isVanitySearching) return;

            if (!isVanityPaused) {
                isVanityPaused = true;
                broadcastWorkerMessage({ cmd: 'PAUSE' });
                document.getElementById('icon-pause-vanity').className = "fa-solid fa-play";
                document.getElementById('text-pause-vanity').innerText = getTranslation('btn_resume');
                document.getElementById('scan-status-text').innerText = getTranslation('status_paused');
                document.getElementById('scan-status-text').className = "text-xs font-mono font-semibold text-amber-400";
                showToast("Vanity Search Paused", "info");
            } else {
                isVanityPaused = false;
                broadcastWorkerMessage({ cmd: 'RESUME' });
                document.getElementById('icon-pause-vanity').className = "fa-solid fa-pause";
                document.getElementById('text-pause-vanity').innerText = getTranslation('btn_pause');
                document.getElementById('scan-status-text').innerText = getTranslation('status_scanning');
                document.getElementById('scan-status-text').className = "text-xs font-mono font-semibold text-emerald-400 animate-pulse";
                showToast("Vanity Search Resumed", "success");
            }
        }

        function stopVanitySearch() {
            isVanitySearching = false;
            isVanityPaused = false;
            stopWorkers();
            stopTimers();

            document.getElementById('btn-start-vanity').disabled = false;
            document.getElementById('btn-pause-vanity').disabled = true;
            document.getElementById('btn-stop-vanity').disabled = false;

            document.getElementById('icon-pause-vanity').className = "fa-solid fa-pause";
            document.getElementById('text-pause-vanity').innerText = getTranslation('btn_pause');

            document.getElementById('scan-status-text').innerText = getTranslation('status_stopped');
            document.getElementById('scan-status-text').className = "text-xs font-mono font-semibold text-amber-400";
        }

        function addVanityMatchResult(pair) {
            const container = document.getElementById('vanity-results-container');
            const emptyState = document.getElementById('vanity-empty-state');
            if (emptyState) emptyState.remove();

            const card = document.createElement('div');
            card.className = "p-4 rounded-xl bg-gray-900 border border-emerald-500/40 space-y-2 relative transition hover:border-emerald-400";
            card.innerHTML = `
                <div class="flex items-center justify-between">
                    <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">${getTranslation('match_tag')}</span>
                    <span class="text-[10px] text-gray-500 font-mono">${new Date().toLocaleTimeString()}</span>
                </div>
                <div>
                    <span class="text-[10px] text-gray-400 block">${getTranslation('live_address')}</span>
                    <p class="font-mono text-xs sm:text-sm font-bold text-amber-400 break-all">${pair.address}</p>
                </div>
                <div>
                    <span class="text-[10px] text-gray-400 block">PUBLIC KEY (HEX):</span>
                    <p class="font-mono text-[11px] text-indigo-300 break-all select-all">${pair.pubHex}</p>
                </div>
                <div>
                    <span class="text-[10px] text-gray-400 block">PRIVATE KEY (WIF):</span>
                    <p class="font-mono text-xs text-gray-300 break-all select-all">${pair.wif}</p>
                </div>
                <div class="pt-2 flex flex-wrap items-center gap-2 border-t border-gray-800/80">
                    <button onclick="saveKeyToVault('${pair.address}', '${pair.privHex}', '${pair.wif}', 'Vanity')" class="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-semibold rounded-lg transition flex items-center space-x-1 border border-amber-500/30">
                        <i class="fa-solid fa-bookmark"></i>
                        <span>${getTranslation('save')}</span>
                    </button>
                    <button onclick="copyToClipboard('${pair.address}')" class="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition flex items-center space-x-1">
                        <i class="fa-solid fa-copy"></i>
                        <span>${getTranslation('copy_addr')}</span>
                    </button>
                    <button onclick="copyToClipboard('${pair.wif}')" class="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition flex items-center space-x-1">
                        <i class="fa-solid fa-key"></i>
                        <span>${getTranslation('copy_wif')}</span>
                    </button>
                    <a href="https://bitref.com/${pair.address}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-emerald-400 text-xs font-semibold rounded-lg transition flex items-center space-x-1">
                        <i class="fa-solid fa-wallet"></i>
                        <span>${getTranslation('check_balance')}</span>
                    </a>
                    <button onclick="openQrModal('${pair.address}')" class="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition">
                        <i class="fa-solid fa-qrcode"></i>
                    </button>
                </div>
            `;
            container.prepend(card);
        }

        function clearVanityResults() {
            const container = document.getElementById('vanity-results-container');
            container.innerHTML = `
                <div id="vanity-empty-state" class="text-center py-10 text-gray-500">
                    <i class="fa-solid fa-magnifying-glass text-3xl mb-2 opacity-50"></i>
                    <p class="text-xs sm:text-sm" data-i18n="empty_results">${getTranslation('empty_results')}</p>
                </div>
            `;
            vanityMatchesCount = 0;
            vanityResultsList = [];
            document.getElementById('stat-matches').innerText = "0";
        }

        function exportVanityResultsTxt() {
            if (vanityResultsList.length === 0) {
                showToast("No vanity results to export!", "error");
                return;
            }

            let txtContent = "==================================================\n";
            txtContent += "BTC TOOLS PRO - FOUND VANITY RESULTS\n";
            txtContent += `Export Date    : ${new Date().toLocaleString()}\n`;
            txtContent += `Total Addresses: ${vanityResultsList.length}\n`;
            txtContent += "==================================================\n\n";

            vanityResultsList.forEach((item, index) => {
                txtContent += `[#${index + 1}] Timestamp: ${item.timestamp}\n`;
                txtContent += `Address    : ${item.address}\n`;
                txtContent += `WIF        : ${item.wif}\n`;
                txtContent += `PubKey HEX : ${item.pubHex}\n`;
                txtContent += `HEX PrivKey: ${item.privHex}\n`;
                txtContent += `--------------------------------------------------\n`;
            });

            const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
            const downloadAnchor = document.createElement('a');
            downloadAnchor.href = URL.createObjectURL(blob);
            downloadAnchor.download = `bitvanity_results_${Date.now()}.txt`;
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            URL.revokeObjectURL(downloadAnchor.href);

            showToast("TXT file exported successfully!", "success");
        }

        function applyHexPreset(preset) {
            const startInput = document.getElementById('hex-start');
            const endInput = document.getElementById('hex-end');
            const targetInput = document.getElementById('hex-target');
            const targetPubkeyInput = document.getElementById('hex-target-pubkey');

            if (preset === 'puzzle1') {
                startInput.value = "0000000000000000000000000000000000000000000000000000000000000001";
                endInput.value = "000000000000000000000000000000000000000000000000000000000000000f";
                targetInput.value = "1BgG23dBnn3Cj3edL3khZJwRny4687ZhkU";
                if(targetPubkeyInput) targetPubkeyInput.value = "";
            } else if (preset === 'puzzle10') {
                startInput.value = "0000000000000000000000000000000000000000000000000000000000000200";
                endInput.value = "00000000000000000000000000000000000000000000000000000000000003ff";
                targetInput.value = "1L23L3j5q3oB35...";
                if(targetPubkeyInput) targetPubkeyInput.value = "";
            } else if (preset === 'micro') {
                startInput.value = "0000000000000000000000000000000000000000000000000000000000000010";
                endInput.value = "0000000000000000000000000000000000000000000000000000000000000020";
                targetInput.value = "";
                if(targetPubkeyInput) targetPubkeyInput.value = "";
            }
        }

        function getHexSearchParams() {
            return {
                startHex: document.getElementById('hex-start').value.trim(),
                endHex: document.getElementById('hex-end').value.trim(),
                targetAddr: document.getElementById('hex-target').value.trim(),
                targetPubkey: document.getElementById('hex-target-pubkey')?.value.trim().toLowerCase() || ""
            };
        }

        function startHexScan() {
            if (isHexScanning && !isHexPaused) return;

            if (isHexPaused) {
                togglePauseHexScan();
                return;
            }

            const params = getHexSearchParams();

            try {
                hexCurrentInt = BigInt("0x" + params.startHex);
                hexEndInt = BigInt("0x" + params.endHex);
            } catch (e) {
                showToast("Invalid HEX Format!", "error");
                return;
            }

            if (hexCurrentInt > hexEndInt) {
                showToast("Start HEX must be smaller than End HEX!", "error");
                return;
            }

            isHexScanning = true;
            isHexPaused = false;
            document.getElementById('btn-hex-start').disabled = true;
            document.getElementById('btn-hex-pause').disabled = false;
            document.getElementById('btn-hex-stop').disabled = false;

            document.getElementById('icon-hex-pause').className = "fa-solid fa-pause";
            document.getElementById('text-hex-pause').innerText = getTranslation('btn_pause');

            hexTotalRange = hexEndInt - hexCurrentInt + 1n;
            hexCurrentStep = 0n;

            startTimers();
            clearHexLog();

            spawnWorkersAndStart('START_HEX', params);
        }

        function togglePauseHexScan() {
            if (!isHexScanning) return;

            if (!isHexPaused) {
                isHexPaused = true;
                broadcastWorkerMessage({ cmd: 'PAUSE' });
                document.getElementById('icon-hex-pause').className = "fa-solid fa-play";
                document.getElementById('text-hex-pause').innerText = getTranslation('btn_resume');
                showToast("HEX Scan Paused", "info");
            } else {
                isHexPaused = false;
                broadcastWorkerMessage({ cmd: 'RESUME' });
                document.getElementById('icon-hex-pause').className = "fa-solid fa-pause";
                document.getElementById('text-hex-pause').innerText = getTranslation('btn_pause');
                showToast("HEX Scan Resumed", "success");
            }
        }

        function stopHexScan() {
            isHexScanning = false;
            isHexPaused = false;
            stopWorkers();
            stopTimers();

            document.getElementById('btn-hex-start').disabled = false;
            document.getElementById('btn-hex-pause').disabled = true;
            document.getElementById('btn-hex-stop').disabled = true;

            document.getElementById('icon-hex-pause').className = "fa-solid fa-pause";
            document.getElementById('text-hex-pause').innerText = getTranslation('btn_pause');
        }

        function logHexEntry(hex, address, isMatch, pair) {
            const logBox = document.getElementById('hex-log-box');
            if (logBox.children.length === 1 && logBox.children[0].classList.contains('italic')) {
                logBox.innerHTML = '';
            }

            if (logBox.children.length > 50) {
                logBox.removeChild(logBox.lastElementChild);
            }

            const line = document.createElement('div');
            line.className = `flex items-center justify-between p-1.5 rounded ${isMatch ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500' : 'hover:bg-gray-800/60'}`;
            line.innerHTML = `
                <div class="truncate max-w-[70%]">
                    <span class="text-gray-500">HEX: ...${hex.substring(50)}</span>
                    <span class="text-gray-300 ml-2">${address}</span>
                </div>
                <div>
                    ${isMatch ? '<span class="text-emerald-400 font-bold">MATCH!</span>' : `<button onclick="saveKeyToVault('${address}', '${hex}', '${pair.wif}', 'HEX')" class="text-[10px] text-amber-400 hover:underline">${getTranslation('save')}</button>`}
                </div>
            `;
            logBox.prepend(line);
        }

        function clearHexLog() {
            document.getElementById('hex-log-box').innerHTML = `<div class="text-gray-600 italic text-center py-8" data-i18n="log_empty">${getTranslation('log_empty')}</div>`;
        }

        function saveKeyToVault(address, privHex, wif, source = "Manual") {
            if (savedKeysList.some(k => k.address === address)) {
                showToast("Key already saved in vault!", "info");
                return;
            }

            const item = {
                id: Date.now(),
                address,
                privHex,
                wif,
                source,
                date: new Date().toLocaleDateString()
            };

            savedKeysList.unshift(item);
            localStorage.setItem('bitvanity_saved_keys', JSON.stringify(savedKeysList));
            updateSavedBadge();
            showToast(getTranslation('toast_saved'), "success");

            if (!document.getElementById('section-saved').classList.contains('hidden')) {
                renderSavedKeys();
            }
        }

        function renderSavedKeys() {
            const container = document.getElementById('saved-keys-container');
            const emptyState = document.getElementById('saved-empty-state');

            if (savedKeysList.length === 0) {
                container.innerHTML = '';
                emptyState.classList.remove('hidden');
                return;
            }

            emptyState.classList.add('hidden');
            container.innerHTML = savedKeysList.map(item => `
                <div class="app-card p-4 rounded-xl space-y-2 border border-gray-800 hover:border-amber-500/50 relative">
                    <div class="flex items-center justify-between border-b border-gray-800 pb-2">
                        <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">${item.source}</span>
                        <div class="flex items-center space-x-2">
                            <span class="text-[10px] text-gray-500">${item.date}</span>
                            <button onclick="deleteSavedKey(${item.id})" class="text-gray-500 hover:text-red-400 transition">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div>

                    <div>
                        <span class="text-[10px] text-gray-400 block">${getTranslation('live_address')}</span>
                        <p class="font-mono text-xs font-bold text-amber-400 break-all">${item.address}</p>
                    </div>

                    <div>
                        <span class="text-[10px] text-gray-400 block">PRIVATE KEY (WIF):</span>
                        <p class="font-mono text-[11px] text-gray-300 break-all select-all">${item.wif}</p>
                    </div>

                    <div class="pt-2 flex flex-wrap items-center gap-2 border-t border-gray-800/80">
                        <button onclick="copyToClipboard('${item.address}')" class="flex-1 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-semibold rounded-lg transition text-center min-w-[90px]">
                            <i class="fa-solid fa-copy"></i> ${getTranslation('copy_addr')}
                        </button>
                        <button onclick="copyToClipboard('${item.wif}')" class="flex-1 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-semibold rounded-lg transition text-center min-w-[90px]">
                            <i class="fa-solid fa-key"></i> ${getTranslation('copy_wif')}
                        </button>
                        <a href="https://bitref.com/${item.address}" target="_blank" rel="noopener noreferrer" class="flex-1 py-1.5 bg-gray-800 hover:bg-gray-700 text-emerald-400 text-[11px] font-semibold rounded-lg transition text-center flex items-center justify-center space-x-1 min-w-[100px]">
                            <i class="fa-solid fa-wallet"></i> <span>${getTranslation('check_balance')}</span>
                        </a>
                        <button onclick="openQrModal('${item.address}')" class="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-semibold rounded-lg transition">
                            <i class="fa-solid fa-qrcode"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }

        function deleteSavedKey(id) {
            savedKeysList = savedKeysList.filter(item => item.id !== id);
            localStorage.setItem('bitvanity_saved_keys', JSON.stringify(savedKeysList));
            updateSavedBadge();
            renderSavedKeys();
            showToast("Key removed from vault.", "info");
        }

        function clearAllSavedKeys() {
            if (savedKeysList.length === 0) return;
            savedKeysList = [];
            localStorage.setItem('bitvanity_saved_keys', JSON.stringify(savedKeysList));
            updateSavedBadge();
            renderSavedKeys();
            showToast("All saved keys deleted.", "info");
        }

        function exportSavedKeys() {
            if (savedKeysList.length === 0) {
                showToast("No keys to export!", "error");
                return;
            }
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedKeysList, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `bitvanity_vault_backup_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            showToast("JSON file downloaded successfully!", "success");
        }

        function updateSavedBadge() {
            document.getElementById('saved-badge').innerText = savedKeysList.length;
        }

        function startTimers() {
            if (!startTime) startTime = Date.now();
            
            if (!speedTimer) {
                speedTimer = setInterval(() => {
                    document.getElementById('stat-speed').innerText = speedCounter.toLocaleString();
                    speedCounter = 0;
                }, 1000);
            }

            if (!timeTimer) {
                timeTimer = setInterval(() => {
                    const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
                    const hrs = String(Math.floor(elapsedSec / 3600)).padStart(2, '0');
                    const mins = String(Math.floor((elapsedSec % 3600) / 60)).padStart(2, '0');
                    const secs = String(elapsedSec % 60).padStart(2, '0');
                    document.getElementById('stat-time').innerText = `${hrs}:${mins}:${secs}`;
                }, 1000);
            }
        }

        function stopTimers() {
            clearInterval(speedTimer);
            clearInterval(timeTimer);
            speedTimer = null;
            timeTimer = null;
            document.getElementById('stat-speed').innerText = "0";
        }

        function copyToClipboard(text) {
            const tempInput = document.createElement('textarea');
            tempInput.value = text;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            showToast(getTranslation('toast_copied'), "success");
        }

        function openQrModal(address) {
            document.getElementById('qr-modal-address').innerText = address;
            const container = document.getElementById('qrcode-container');
            container.innerHTML = '';
            new QRCode(container, {
                text: address,
                width: 160,
                height: 160,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            document.getElementById('qr-modal').classList.remove('hidden');
        }

        function closeQrModal() {
            document.getElementById('qr-modal').classList.add('hidden');
        }

        function showToast(message, type = "success") {
            const toast = document.getElementById('toast');
            const icon = document.getElementById('toast-icon');
            const msgElem = document.getElementById('toast-message');

            msgElem.innerText = message;

            if (type === "success") {
                icon.className = "fa-solid fa-circle-check text-emerald-400 text-base";
            } else if (type === "error") {
                icon.className = "fa-solid fa-circle-xmark text-red-400 text-base";
            } else {
                icon.className = "fa-solid fa-circle-info text-blue-400 text-base";
            }

            toast.classList.remove('translate-y-20', 'opacity-0');
            
            setTimeout(() => {
                toast.classList.add('translate-y-20', 'opacity-0');
            }, 3000);
        }

        window.addEventListener('DOMContentLoaded', () => {
            initCpuOptions();

            const savedTheme = localStorage.getItem('bitvanity_theme') || 'theme-dark-gold';
            changeTheme(savedTheme);

            const savedLang = localStorage.getItem('bitvanity_lang') || 'en';
            changeLanguage(savedLang);

            updateSavedBadge();
        });