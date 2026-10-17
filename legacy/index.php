<!DOCTYPE html>
<html lang="en" dir="ltr" class="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Moemen Team | Technology Partner</title>
    
    <!-- Google Fonts (Cairo & Inter as per Brand Identity) -->
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- AOS Animation CSS -->
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        // Brand Identity Colors
                        brand: {
                            forest: '#1F2A24', // Deep Forest (Dark bg)
                            olive: '#374A3C',  // Dark Olive
                            green: '#506055',  // Moemen Green
                            sage: '#8BA989',   // Sage Green (Adjusted for better contrast)
                            light: '#A7B7A7',  // Light Gray
                        }
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        arabic: ['Cairo', 'sans-serif'],
                    },
                    transitionProperty: {
                        'theme': 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
                    }
                }
            }
        }
    </script>

    <style>
        /* Global & Theme Transitions */
        body {
            transition: background-color 0.6s ease, color 0.6s ease;
            overflow-x: hidden;
            background-color: #ffffff; /* Explicit White for Light Mode */
        }
        
        body.dark {
            background-color: #1F2A24; /* Deep Forest for Dark Mode */
        }

        :root[dir="rtl"] body {
            font-family: 'Cairo', sans-serif;
        }

        /* Bilingual Toggle Logic */
        :root[dir="ltr"] .lang-ar { display: none !important; }
        :root[dir="rtl"] .lang-en { display: none !important; }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #A7B7A7; border-radius: 10px; }
        .dark ::-webkit-scrollbar-thumb { background: #374A3C; }
        ::-webkit-scrollbar-thumb:hover { background: #506055; }

        /* Cards & UI Elements */
        .brand-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dark .brand-card {
            background: #27342D; /* Slightly lighter than Deep Forest */
            border: 1px solid rgba(167, 183, 167, 0.1);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        }
        
        .brand-card:hover {
            transform: translateY(-5px);
            border-color: #506055;
            box-shadow: 0 10px 40px rgba(80, 96, 85, 0.15);
        }

        /* Buttons */
        .btn-primary {
            background-color: #1F2A24;
            color: #ffffff;
            transition: all 0.3s ease;
        }
        .dark .btn-primary {
            background-color: #A7B7A7;
            color: #1F2A24;
        }
        .btn-primary:hover {
            transform: scale(1.02);
            box-shadow: 0 10px 25px rgba(31, 42, 36, 0.2);
        }

        /* Gradients based on identity */
        .text-brand-gradient {
            background: linear-gradient(to right, #374A3C, #8BA989);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .dark .text-brand-gradient {
            background: linear-gradient(to right, #A7B7A7, #ffffff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        /* Image Overlays */
        .img-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, rgba(31,42,36,0.9), transparent);
            opacity: 0.8;
            transition: opacity 0.3s ease;
        }
        .group:hover .img-overlay { opacity: 0.6; }

        /* Background Pattern (Subtle) */
        .bg-pattern {
            background-image: radial-gradient(#A7B7A7 1px, transparent 1px);
            background-size: 30px 30px;
            opacity: 0.3;
        }
        .dark .bg-pattern {
            background-image: radial-gradient(#374A3C 1px, transparent 1px);
            opacity: 0.2;
        }
    </style>
</head>
<body class="text-gray-800 dark:text-gray-200 antialiased selection:bg-brand-sage selection:text-white">

    <!-- Navbar -->
    <nav class="fixed w-full z-50 top-0 transition-theme duration-500 bg-white/90 dark:bg-brand-forest/90 backdrop-blur-md border-b border-gray-100 dark:border-brand-olive/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-20">
                <!-- Logo -->
                <div class="flex-shrink-0 flex items-center gap-3 cursor-pointer interactive-el">
                    <div class="w-10 h-10 rounded bg-brand-forest dark:bg-brand-light flex items-center justify-center text-white dark:text-brand-forest font-bold text-2xl">
                        M
                    </div>
                    <div class="flex flex-col leading-none">
                        <span class="font-extrabold text-xl tracking-widest text-brand-forest dark:text-white uppercase">Moemen</span>
                        <span class="text-[10px] tracking-[0.3em] text-brand-green dark:text-brand-sage font-semibold uppercase">Team</span>
                    </div>
                </div>
                
                <!-- Controls -->
                <div class="flex items-center gap-4">
                    <!-- Theme Toggle -->
                    <button id="theme-toggle" class="interactive-el p-2.5 rounded-lg bg-gray-100 dark:bg-brand-olive text-brand-forest dark:text-brand-light hover:bg-gray-200 dark:hover:bg-brand-green transition-all" aria-label="Toggle Theme">
                        <svg id="theme-icon-dark" class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        <svg id="theme-icon-light" class="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                    </button>
                    <!-- Language Toggle -->
                    <button id="lang-toggle" class="interactive-el px-4 py-2 font-bold text-sm rounded-lg border-2 border-brand-forest dark:border-brand-light text-brand-forest dark:text-brand-light hover:bg-brand-forest hover:text-white dark:hover:bg-brand-light dark:hover:text-brand-forest transition-all uppercase tracking-wider">
                        <span id="lang-text">عربي</span>
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-32">
        
        <!-- Hero Section -->
        <section class="text-center space-y-8 relative py-10" data-aos="fade-up" data-aos-duration="1000">
            <div class="absolute inset-0 bg-pattern -z-10 rounded-3xl"></div>
            
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-light/20 text-brand-green dark:text-brand-light font-semibold text-sm tracking-widest uppercase border border-brand-light/30">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                <span class="lang-en">We Build Solutions That Grow Businesses</span>
                <span class="lang-ar">نبني حلولاً تنمي أعمالك</span>
            </div>
            
            <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight text-brand-forest dark:text-white leading-tight font-sans dark:font-arabic">
                <span class="lang-en">From Experience to a <br><span class="text-brand-gradient">Technology Partner</span></span>
                <span class="lang-ar">من الخبرة إلى <br><span class="text-brand-gradient">شريكك التقني الموثوق</span></span>
            </h1>
            
            <p class="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-medium">
                <span class="lang-en">We design and build digital products, business systems, web platforms, and automation solutions — combining technical expertise with a clear understanding of how businesses operate.</span>
                <span class="lang-ar">نحن نصمم ونبني المنتجات الرقمية، وأنظمة الأعمال، ومنصات الويب، وحلول الأتمتة - دامجين بين الخبرة التقنية والفهم الواضح لكيفية عمل الشركات ونموها.</span>
            </p>

            <div class="flex justify-center gap-4 pt-4">
                <a href="#projects" class="interactive-el btn-primary px-8 py-3.5 rounded-lg font-bold text-sm tracking-wide">
                    <span class="lang-en">Explore Our Work</span>
                    <span class="lang-ar">استكشف أعمالنا</span>
                </a>
                <a href="#contact" class="interactive-el px-8 py-3.5 rounded-lg font-bold text-sm tracking-wide border-2 border-brand-green text-brand-green dark:border-brand-sage dark:text-brand-sage hover:bg-brand-green hover:text-white dark:hover:bg-brand-sage dark:hover:text-brand-forest transition-all">
                    <span class="lang-en">Let's Talk</span>
                    <span class="lang-ar">لنتحدث</span>
                </a>
            </div>
        </section>

        <!-- Section 1: WHO WE ARE -->
        <section id="who-we-are" class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div data-aos="fade-right">
                <h2 class="text-sm font-bold tracking-widest text-brand-green dark:text-brand-sage uppercase mb-3">
                    <span class="lang-en">Who We Are</span>
                    <span class="lang-ar">من نحن</span>
                </h2>
                <h3 class="text-3xl md:text-4xl font-extrabold text-brand-forest dark:text-white mb-6 leading-tight">
                    <span class="lang-en">Built on experience.<br>Driven by expertise.<br>Focused on business.</span>
                    <span class="lang-ar">مبنيون على الخبرة.<br>يقودنا التخصص.<br>ونركز على الأعمال.</span>
                </h3>
                <div class="space-y-4 text-gray-600 dark:text-gray-300 text-lg">
                    <p>
                        <span class="lang-en">Moemen Team brings 4+ years of real-world technology experience into one technology partner for businesses that need more than software — they need solutions that work.</span>
                        <span class="lang-ar">يجمع فريق مؤمن أكثر من 4 سنوات من الخبرة التقنية الواقعية ليكون شريكك التقني الأمثل، للشركات التي تحتاج إلى أكثر من مجرد برمجيات — تحتاج إلى حلول فعّالة.</span>
                    </p>
                    <p>
                        <span class="lang-en">We turn complex business needs into reliable digital solutions. Technology should solve business problems — not create new ones. We build the technology behind better businesses.</span>
                        <span class="lang-ar">نحول احتياجات الأعمال المعقدة إلى حلول رقمية موثوقة. التكنولوجيا يجب أن تحل مشاكل العمل - لا أن تخلق مشاكل جديدة. نحن نبني التكنولوجيا وراء أفضل الشركات.</span>
                    </p>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 gap-4" data-aos="fade-left">
                <div class="brand-card p-6 rounded-2xl text-center">
                    <span class="block text-4xl font-extrabold text-brand-forest dark:text-brand-light mb-2">4+</span>
                    <span class="text-sm font-semibold text-gray-500 uppercase"><span class="lang-en">Years in Market</span><span class="lang-ar">سنوات في السوق</span></span>
                </div>
                <div class="brand-card p-6 rounded-2xl text-center">
                    <span class="block text-4xl font-extrabold text-brand-forest dark:text-brand-light mb-2">20+</span>
                    <span class="text-sm font-semibold text-gray-500 uppercase"><span class="lang-en">Projects</span><span class="lang-ar">مشروع منفذ</span></span>
                </div>
                <div class="brand-card p-6 rounded-2xl text-center">
                    <span class="block text-4xl font-extrabold text-brand-forest dark:text-brand-light mb-2">10+</span>
                    <span class="text-sm font-semibold text-gray-500 uppercase"><span class="lang-en">Businesses</span><span class="lang-ar">شركات مدعومة</span></span>
                </div>
                <div class="brand-card p-6 rounded-2xl text-center">
                    <span class="block text-4xl font-extrabold text-brand-forest dark:text-brand-light mb-2">5+</span>
                    <span class="text-sm font-semibold text-gray-500 uppercase"><span class="lang-en">Industries</span><span class="lang-ar">صناعات مختلفة</span></span>
                </div>
            </div>
        </section>

        <!-- Section 2: WHAT WE DO -->
        <section id="what-we-do" class="relative">
            <div class="text-center mb-16" data-aos="fade-up">
                <h2 class="text-sm font-bold tracking-widest text-brand-green dark:text-brand-sage uppercase mb-3">
                    <span class="lang-en">What We Do</span>
                    <span class="lang-ar">ماذا نقدم</span>
                </h2>
                <h3 class="text-3xl md:text-5xl font-extrabold text-brand-forest dark:text-white">
                    <span class="lang-en">Technology built around your business.</span>
                    <span class="lang-ar">تكنولوجيا مصممة حول طبيعة عملك.</span>
                </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Cap 1 -->
                <div class="brand-card p-8 rounded-2xl group" data-aos="fade-up" data-aos-delay="100">
                    <div class="w-12 h-12 border border-brand-green/30 rounded-xl flex items-center justify-center mb-6 text-brand-green dark:text-brand-sage group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                    </div>
                    <h4 class="text-xl font-bold mb-4 text-brand-forest dark:text-white">
                        <span class="lang-en">Software & Web</span>
                        <span class="lang-ar">برمجيات ومواقع</span>
                    </h4>
                    <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                        <li>• <span class="lang-en">Custom Web Apps</span><span class="lang-ar">تطبيقات ويب مخصصة</span></li>
                        <li>• <span class="lang-en">Corporate Websites</span><span class="lang-ar">مواقع الشركات</span></li>
                        <li>• <span class="lang-en">E-Commerce Platforms</span><span class="lang-ar">منصات التجارة الإلكترونية</span></li>
                        <li>• <span class="lang-en">Mobile Apps (iOS/Android)</span><span class="lang-ar">تطبيقات الهواتف الذكية</span></li>
                    </ul>
                </div>
                <!-- Cap 2 -->
                <div class="brand-card p-8 rounded-2xl group" data-aos="fade-up" data-aos-delay="200">
                    <div class="w-12 h-12 border border-brand-green/30 rounded-xl flex items-center justify-center mb-6 text-brand-green dark:text-brand-sage group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    </div>
                    <h4 class="text-xl font-bold mb-4 text-brand-forest dark:text-white">
                        <span class="lang-en">Business Systems</span>
                        <span class="lang-ar">أنظمة الأعمال</span>
                    </h4>
                    <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                        <li>• <span class="lang-en">Sales & Inventory</span><span class="lang-ar">المبيعات والمخزون</span></li>
                        <li>• <span class="lang-en">Invoicing & Payments</span><span class="lang-ar">الفواتير والمدفوعات</span></li>
                        <li>• <span class="lang-en">CRM & Operations</span><span class="lang-ar">العملاء والعمليات</span></li>
                        <li>• <span class="lang-en">Reports & Analytics</span><span class="lang-ar">التقارير والتحليلات</span></li>
                    </ul>
                </div>
                <!-- Cap 3 -->
                <div class="brand-card p-8 rounded-2xl group" data-aos="fade-up" data-aos-delay="300">
                    <div class="w-12 h-12 border border-brand-green/30 rounded-xl flex items-center justify-center mb-6 text-brand-green dark:text-brand-sage group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                    </div>
                    <h4 class="text-xl font-bold mb-4 text-brand-forest dark:text-white">
                        <span class="lang-en">Automation & AI</span>
                        <span class="lang-ar">الأتمتة والذكاء الاصطناعي</span>
                    </h4>
                    <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                        <li>• <span class="lang-en">Workflow Automation</span><span class="lang-ar">أتمتة سير العمل</span></li>
                        <li>• <span class="lang-en">WhatsApp Integration</span><span class="lang-ar">أتمتة الواتساب</span></li>
                        <li>• <span class="lang-en">AI-Powered Flows</span><span class="lang-ar">تدفقات مدعمة بالذكاء الاصطناعي</span></li>
                        <li>• <span class="lang-en">Notifications System</span><span class="lang-ar">نظام الإشعارات والمتابعة</span></li>
                    </ul>
                </div>
                <!-- Cap 4 -->
                <div class="brand-card p-8 rounded-2xl group" data-aos="fade-up" data-aos-delay="400">
                    <div class="w-12 h-12 border border-brand-green/30 rounded-xl flex items-center justify-center mb-6 text-brand-green dark:text-brand-sage group-hover:scale-110 transition-transform">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path></svg>
                    </div>
                    <h4 class="text-xl font-bold mb-4 text-brand-forest dark:text-white">
                        <span class="lang-en">Integrations & Infra</span>
                        <span class="lang-ar">الربط والبنية التحتية</span>
                    </h4>
                    <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                        <li>• <span class="lang-en">API Integrations</span><span class="lang-ar">ربط التطبيقات (APIs)</span></li>
                        <li>• <span class="lang-en">Payment Gateways</span><span class="lang-ar">بوابات الدفع</span></li>
                        <li>• <span class="lang-en">Hosting & VPS</span><span class="lang-ar">إعداد الخوادم والاستضافة</span></li>
                        <li>• <span class="lang-en">Security & Support</span><span class="lang-ar">الدعم الفني والأمان</span></li>
                    </ul>
                </div>
            </div>
        </section>

        <!-- Section 3: PROJECTS -->
        <section id="projects" class="py-10">
            <div class="flex flex-col md:flex-row justify-between items-end mb-12" data-aos="fade-up">
                <div>
                    <h2 class="text-sm font-bold tracking-widest text-brand-green dark:text-brand-sage uppercase mb-3">
                        <span class="lang-en">Projects & Productions</span>
                        <span class="lang-ar">مشاريعنا وإنتاجنا</span>
                    </h2>
                    <h3 class="text-3xl md:text-5xl font-extrabold text-brand-forest dark:text-white max-w-2xl">
                        <span class="lang-en">Technology we've built. Businesses we've supported.</span>
                        <span class="lang-ar">تكنولوجيا بنيناها. وأعمال تجارية دعمناها.</span>
                    </h3>
                </div>
            </div>

            <!-- Projects Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="projects-grid">
                
                <!-- VODA -->
                <div class="brand-card rounded-2xl overflow-hidden group project-item block" data-aos="fade-up">
                    <div class="h-48 relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" alt="VODA" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                        <div class="img-overlay"></div>
                        <span class="absolute top-4 right-4 bg-white dark:bg-brand-forest text-brand-forest dark:text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Mobile App</span>
                    </div>
                    <div class="p-6">
                        <h4 class="text-xl font-bold mb-2 text-brand-forest dark:text-white">VODA</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            <span class="lang-en">Water Delivery & E-Commerce Platform — Saudi Arabia. Connecting customers, drivers, and operations.</span>
                            <span class="lang-ar">منصة لتوصيل المياه والتجارة الإلكترونية — السعودية. تربط العملاء والسائقين والعمليات.</span>
                        </p>
                        <div class="flex flex-wrap gap-2">
                            <span class="text-[10px] uppercase font-bold text-brand-green bg-brand-green/10 px-2 py-1 rounded">E-Commerce</span>
                            <span class="text-[10px] uppercase font-bold text-brand-green bg-brand-green/10 px-2 py-1 rounded">Delivery</span>
                        </div>
                    </div>
                </div>

                <!-- TAL3A -->
                <div class="brand-card rounded-2xl overflow-hidden group project-item block" data-aos="fade-up" data-aos-delay="100">
                    <div class="h-48 relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img src="https://images.unsplash.com/photo-1528629297340-d1d466945dc5?auto=format&fit=crop&w=800&q=80" alt="TAL3A" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                        <div class="img-overlay"></div>
                        <span class="absolute top-4 right-4 bg-white dark:bg-brand-forest text-brand-forest dark:text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Mobile App</span>
                    </div>
                    <div class="p-6">
                        <h4 class="text-xl font-bold mb-2 text-brand-forest dark:text-white">TAL3A</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            <span class="lang-en">Social & Outdoor Activities Platform. Discover content, build connections, and participate in marathons.</span>
                            <span class="lang-ar">منصة للأنشطة الاجتماعية والخارجية. اكتشف المحتوى، وشارك في الفعاليات والماراثونات.</span>
                        </p>
                        <div class="flex flex-wrap gap-2">
                            <span class="text-[10px] uppercase font-bold text-brand-green bg-brand-green/10 px-2 py-1 rounded">Social</span>
                            <span class="text-[10px] uppercase font-bold text-brand-green bg-brand-green/10 px-2 py-1 rounded">Community</span>
                        </div>
                    </div>
                </div>

                <!-- DONATELLO -->
                <div class="brand-card rounded-2xl overflow-hidden group project-item block" data-aos="fade-up" data-aos-delay="200">
                    <div class="h-48 relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img src="https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80" alt="DONATELLO" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                        <div class="img-overlay"></div>
                        <span class="absolute top-4 right-4 bg-white dark:bg-brand-forest text-brand-forest dark:text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Mobile App</span>
                    </div>
                    <div class="p-6">
                        <h4 class="text-xl font-bold mb-2 text-brand-forest dark:text-white">DONATELLO</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            <span class="lang-en">Premium Donuts E-Commerce App. Visually engaging product catalog and smooth ordering.</span>
                            <span class="lang-ar">تطبيق طلب الدونات الفاخرة. تجربة تسوق بصرية ممتعة وطلب سلس.</span>
                        </p>
                        <div class="flex flex-wrap gap-2">
                            <span class="text-[10px] uppercase font-bold text-brand-green bg-brand-green/10 px-2 py-1 rounded">Food</span>
                            <span class="text-[10px] uppercase font-bold text-brand-green bg-brand-green/10 px-2 py-1 rounded">E-Commerce</span>
                        </div>
                    </div>
                </div>

                <!-- XSPACE / ELEVENS -->
                <div class="brand-card rounded-2xl overflow-hidden group project-item hidden" data-aos="fade-up">
                    <div class="h-48 relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80" alt="Elevens Cafe" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                        <div class="img-overlay"></div>
                        <span class="absolute top-4 right-4 bg-white dark:bg-brand-forest text-brand-forest dark:text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Business System</span>
                    </div>
                    <div class="p-6">
                        <h4 class="text-xl font-bold mb-2 text-brand-forest dark:text-white">Elevens Cafe System</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            <span class="lang-en">Comprehensive management ecosystem for workspace and café operations, POS, and analytics.</span>
                            <span class="lang-ar">نظام إدارة شامل لعمليات المقهى ومساحة العمل، نقاط البيع، والتحليلات.</span>
                        </p>
                        <div class="flex flex-wrap gap-2">
                            <span class="text-[10px] uppercase font-bold text-brand-green bg-brand-green/10 px-2 py-1 rounded">POS</span>
                            <span class="text-[10px] uppercase font-bold text-brand-green bg-brand-green/10 px-2 py-1 rounded">Analytics</span>
                        </div>
                    </div>
                </div>

                <!-- AL-BROLOSY -->
                <div class="brand-card rounded-2xl overflow-hidden group project-item hidden" data-aos="fade-up">
                    <div class="h-48 relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" alt="Al-Brolosy" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                        <div class="img-overlay"></div>
                        <span class="absolute top-4 right-4 bg-white dark:bg-brand-forest text-brand-forest dark:text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Web Platform</span>
                    </div>
                    <div class="p-6">
                        <h4 class="text-xl font-bold mb-2 text-brand-forest dark:text-white">Al-Brolosy Real Estate</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            <span class="lang-en">High-end bilingual web portal, corporate landing pages, and leadership biographical profiles.</span>
                            <span class="lang-ar">بوابة ويب ثنائية اللغة متطورة، صفحات هبوط للشركات، وملفات شخصية للقيادة.</span>
                        </p>
                        <div class="flex flex-wrap gap-2">
                            <span class="text-[10px] uppercase font-bold text-brand-green bg-brand-green/10 px-2 py-1 rounded">Real Estate</span>
                            <span class="text-[10px] uppercase font-bold text-brand-green bg-brand-green/10 px-2 py-1 rounded">Corporate</span>
                        </div>
                    </div>
                </div>

                <!-- TAGMEDIX -->
                <div class="brand-card rounded-2xl overflow-hidden group project-item hidden" data-aos="fade-up">
                    <div class="h-48 relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80" alt="TAGMEDIX" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                        <div class="img-overlay"></div>
                        <span class="absolute top-4 right-4 bg-white dark:bg-brand-forest text-brand-forest dark:text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">System</span>
                    </div>
                    <div class="p-6">
                        <h4 class="text-xl font-bold mb-2 text-brand-forest dark:text-white">TAGMEDIX</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            <span class="lang-en">Apparel Manufacturing & Production Management System. Connecting the entire order lifecycle.</span>
                            <span class="lang-ar">نظام إدارة تصنيع وإنتاج الملابس. يربط دورة حياة الطلب بأكملها.</span>
                        </p>
                        <div class="flex flex-wrap gap-2">
                            <span class="text-[10px] uppercase font-bold text-brand-green bg-brand-green/10 px-2 py-1 rounded">Manufacturing</span>
                            <span class="text-[10px] uppercase font-bold text-brand-green bg-brand-green/10 px-2 py-1 rounded">ERP</span>
                        </div>
                    </div>
                </div>

            </div>
            
            <div class="text-center mt-12">
                <button id="show-more-btn" class="interactive-el px-8 py-3 rounded-lg font-bold text-sm tracking-wide border-2 border-brand-forest dark:border-brand-light text-brand-forest dark:text-brand-light hover:bg-brand-forest hover:text-white dark:hover:bg-brand-light dark:hover:text-brand-forest transition-all">
                    <span class="lang-en" id="show-more-en">Show More Projects</span>
                    <span class="lang-ar" id="show-more-ar">عرض المزيد من المشاريع</span>
                </button>
            </div>
        </section>

        <!-- Section 4: HOW WE CAN START -->
        <section id="how-we-start" class="relative brand-card rounded-3xl p-8 md:p-16 mb-20 overflow-hidden" data-aos="zoom-in">
            <!-- Decorative shape -->
            <div class="absolute top-0 right-0 w-64 h-64 bg-brand-sage/10 rounded-bl-full -z-10 pointer-events-none"></div>
            
            <div class="text-center mb-16">
                <h2 class="text-sm font-bold tracking-widest text-brand-green dark:text-brand-sage uppercase mb-3">
                    <span class="lang-en">How We Can Start</span>
                    <span class="lang-ar">كيف نبدأ معاً</span>
                </h2>
                <h3 class="text-3xl md:text-4xl font-extrabold text-brand-forest dark:text-white">
                    <span class="lang-en">From your business need to a complete solution.</span>
                    <span class="lang-ar">من احتياج عملك إلى حل تقني متكامل.</span>
                </h3>
            </div>

            <div class="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand-green before:to-transparent">
                
                <!-- Step 1 -->
                <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-brand-forest bg-brand-green text-white font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg z-10">1</div>
                    <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-gray-50 dark:bg-brand-forest border border-gray-100 dark:border-brand-olive/50 group-hover:border-brand-green transition-colors">
                        <h4 class="font-bold text-lg mb-2 text-brand-forest dark:text-white">
                            <span class="lang-en">Start the Conversation</span>
                            <span class="lang-ar">ابدأ المحادثة</span>
                        </h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            <span class="lang-en">Tell us what your business does, what you're trying to improve, and what you want to achieve. No technical specs required.</span>
                            <span class="lang-ar">أخبرنا بما تفعله شركتك، وما تحاول تحسينه، وما تريد تحقيقه. لا حاجة لمواصفات تقنية معقدة.</span>
                        </p>
                    </div>
                </div>

                <!-- Step 2 -->
                <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-brand-forest bg-brand-olive text-white font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg z-10">2</div>
                    <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-gray-50 dark:bg-brand-forest border border-gray-100 dark:border-brand-olive/50 group-hover:border-brand-green transition-colors">
                        <h4 class="font-bold text-lg mb-2 text-brand-forest dark:text-white">
                            <span class="lang-en">Understand & Define</span>
                            <span class="lang-ar">الفهم وتحديد الحل</span>
                        </h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            <span class="lang-en">We review your requirements, understand your workflow, and turn the idea into a clear scope with estimated timeline and investment.</span>
                            <span class="lang-ar">نراجع متطلباتك، ونفهم سير عملك، ونحول الفكرة إلى نطاق واضح مع جدول زمني وتكلفة مقدرة.</span>
                        </p>
                    </div>
                </div>

                <!-- Step 3 -->
                <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-brand-forest bg-brand-green text-white font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg z-10">3</div>
                    <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-gray-50 dark:bg-brand-forest border border-gray-100 dark:border-brand-olive/50 group-hover:border-brand-green transition-colors">
                        <h4 class="font-bold text-lg mb-2 text-brand-forest dark:text-white">
                            <span class="lang-en">Align & Build</span>
                            <span class="lang-ar">التوافق والبناء</span>
                        </h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            <span class="lang-en">We refine the scope together. Once aligned, development begins with a focus on quality, performance, and reliability.</span>
                            <span class="lang-ar">نراجع النطاق معاً. بمجرد التوافق، يبدأ التطوير مع التركيز على الجودة، الأداء، والموثوقية.</span>
                        </p>
                    </div>
                </div>

                <!-- Step 4 -->
                <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-brand-forest bg-brand-forest text-white font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg z-10">4</div>
                    <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-gray-50 dark:bg-brand-forest border border-gray-100 dark:border-brand-olive/50 group-hover:border-brand-green transition-colors">
                        <h4 class="font-bold text-lg mb-2 text-brand-forest dark:text-white">
                            <span class="lang-en">Launch & Evolve</span>
                            <span class="lang-ar">الإطلاق والتطوير المستمر</span>
                        </h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            <span class="lang-en">We handle deployment, provide ongoing technical support, and continue improving the solution as your business grows.</span>
                            <span class="lang-ar">نتولى النشر، ونقدم دعماً فنياً مستمراً، ونواصل تحسين الحل مع نمو وتطور عملك.</span>
                        </p>
                    </div>
                </div>

            </div>
            
            <div class="mt-16 text-center">
                <a href="mailto:contact@moemen-team.tech" class="interactive-el inline-block btn-primary px-10 py-4 rounded-xl font-bold text-lg tracking-wide uppercase">
                    <span class="lang-en">Start a Conversation →</span>
                    <span class="lang-ar">← ابدأ المحادثة الآن</span>
                </a>
            </div>
        </section>

    </main>

    <!-- Footer -->
    <footer class="py-10 border-t border-gray-200 dark:border-brand-olive/50 text-center relative z-10">
        <div class="flex items-center justify-center gap-2 mb-4">
            <div class="w-6 h-6 rounded bg-brand-forest dark:bg-brand-light flex items-center justify-center text-white dark:text-brand-forest font-bold text-xs">M</div>
            <span class="font-bold text-brand-forest dark:text-white uppercase tracking-widest text-sm">Moemen Team</span>
        </div>
        <p class="text-gray-500 dark:text-gray-400 text-sm font-medium">
            &copy; 2026 Moemen Team. 
            <span class="lang-en">We build solutions that grow businesses.</span>
            <span class="lang-ar">نحن نبني حلولاً تنمي أعمالك.</span>
        </p>
    </footer>

    <!-- Scripts -->
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script>
        // 1. Initialize Animations
        AOS.init({
            once: true,
            offset: 50,
            duration: 800,
            easing: 'ease-out-cubic',
        });

        // 2. Web Audio API Click Sound (No external audio file needed, generated on the fly)
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        function playClickSound() {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            // Create oscillators for a modern, pleasant "pop/click" sound
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, audioCtx.currentTime); // high pitch
            osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05); // drop
            
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05); // fade out fast
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.05);
        }

        // Attach sound to interactive elements
        document.querySelectorAll('.interactive-el').forEach(el => {
            el.addEventListener('click', playClickSound);
        });

        // 3. Theme Toggle Logic
        const themeBtn = document.getElementById('theme-toggle');
        function toggleTheme() {
            const html = document.documentElement;
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                html.classList.add('light');
                localStorage.setItem('theme', 'light');
            } else {
                html.classList.remove('light');
                html.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
        }
        themeBtn.addEventListener('click', toggleTheme);

        // Ensure default is Light theme if nothing set
        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }

        // 4. Bilingual Toggle Logic
        const langBtn = document.getElementById('lang-toggle');
        const langText = document.getElementById('lang-text');
        let currentLang = 'en'; // Default English
        
        function toggleLanguage() {
            currentLang = currentLang === 'en' ? 'ar' : 'en';
            document.documentElement.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
            document.documentElement.setAttribute('lang', currentLang);
            langText.innerText = currentLang === 'ar' ? 'EN' : 'عربي';
        }
        langBtn.addEventListener('click', toggleLanguage);

        // 5. Show More Projects Logic
        const showMoreBtn = document.getElementById('show-more-btn');
        let projectsExpanded = false;
        
        showMoreBtn.addEventListener('click', () => {
            const hiddenProjects = document.querySelectorAll('.project-item.hidden');
            
            if(!projectsExpanded) {
                // Show all
                hiddenProjects.forEach(proj => {
                    proj.classList.remove('hidden');
                    proj.classList.add('block');
                });
                document.getElementById('show-more-en').innerText = "Show Less";
                document.getElementById('show-more-ar').innerText = "عرض أقل";
                projectsExpanded = true;
                // Re-trigger AOS for new elements
                AOS.refresh();
            } else {
                // Hide extra (indices 3, 4, 5 in this hardcoded structure)
                const allProjects = document.querySelectorAll('.project-item');
                for(let i=3; i<allProjects.length; i++) {
                    allProjects[i].classList.remove('block');
                    allProjects[i].classList.add('hidden');
                }
                document.getElementById('show-more-en').innerText = "Show More Projects";
                document.getElementById('show-more-ar').innerText = "عرض المزيد من المشاريع";
                projectsExpanded = false;
                // Scroll back to projects top
                document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
            }
        });

    </script>
</body>
</html>