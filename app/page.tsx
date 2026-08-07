"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Calendar,
  Clock,
  Database,
  GraduationCap,
  LayoutDashboard,
  Settings,
  X,
  Trash2,
  Plus,
  Users,
  Copy,
  Check,
  DollarSign,
  User,
  Mail,
  Phone,
  Loader2,
  ShieldAlert,
  UserPlus,
  Edit2,
  Sun,
  Moon,
  Search,
  MessageSquare,
  Star,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';

// --- Type Definitions ---
type Course = {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  created_at: string;
};

type Registration = {
  id: string;
  student_name: string;
  email: string;
  phone: string;
  course_id: string;
  enrolled_at: string;
  courses?: { title: string };
};

type Testimonial = {
  id: string;
  student_name: string;
  content: string;
  rating: number;
  is_published: boolean;
  created_at: string;
};

// --- Setup Screen Component ---
function SetupScreen() {
  const [copied, setCopied] = useState(false);
  const sql = `
-- تفعيل امتداد UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- إنشاء جدول الكورسات
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول التسجيلات
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول التقييمات
CREATE TABLE testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إعدادات الأمان (يتم فتح الصلاحيات للعامة لأغراض العرض)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to courses" ON courses FOR SELECT TO public USING (true);
CREATE POLICY "Allow public all access to courses" ON courses FOR ALL TO public USING (true);

CREATE POLICY "Allow public insert access to registrations" ON registrations FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public read access to registrations" ON registrations FOR SELECT TO public USING (true);
CREATE POLICY "Allow public all access to registrations" ON registrations FOR ALL TO public USING (true);

CREATE POLICY "Allow public read access to testimonials" ON testimonials FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert access to testimonials" ON testimonials FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public all access to testimonials" ON testimonials FOR ALL TO public USING (true);
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-950">
      <div className="max-w-2xl w-full bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="flex items-center gap-4 text-emerald-400">
          <Database className="w-8 h-8" />
          <h1 className="text-2xl font-bold text-surface-text">إعداد قاعدة البيانات (Supabase)</h1>
        </div>
        
        <div className="text-surface-300 leading-relaxed space-y-4">
          <p>
            تطبيقك الآن جاهز، لكنه بحاجة للاتصال بقاعدة بيانات Supabase ليعمل بشكل صحيح.
          </p>
          <ul className="list-decimal list-inside space-y-2 text-surface-400">
            <li>قم بإنشاء مشروع جديد في <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">Supabase</a>.</li>
            <li>انسخ كود SQL التالي وقم بتشغيله في قسم <b>SQL Editor</b> داخل لوحة تحكم Supabase.</li>
            <li>اذهب إلى <b>Project Settings {'>'} API</b>.</li>
            <li>انسخ <code className="bg-surface-800 px-2 py-1 rounded text-emerald-300 text-sm">Project URL</code> و <code className="bg-surface-800 px-2 py-1 rounded text-emerald-300 text-sm">anon key</code>.</li>
            <li>أضفهما إلى متغيرات البيئة الخاصة بالتطبيق في AI Studio.</li>
          </ul>
        </div>

        <div className="relative group">
          <button 
            onClick={handleCopy}
            className="absolute top-3 left-3 p-2 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
          </button>
          <pre className="bg-surface-950 p-6 rounded-xl overflow-x-auto text-sm text-emerald-300 border border-surface-800 dir-ltr text-left">
            <code>{sql}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

// --- Main Platform Wrapper ---
export default function App() {
  const [isEnvConfigured, setIsEnvConfigured] = useState(true);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || !url.startsWith('http')) {
      setIsEnvConfigured(false);
    }
  }, []);

  if (!isEnvConfigured) {
    return <SetupScreen />;
  }

  return <MainPlatform />;
}

// --- Platform Core Logic & State ---
function MainPlatform() {
  const [view, setView] = useState<'student' | 'admin'>('student');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetchCourses();
    fetchRegistrations();
    fetchTestimonials();

    // Setup realtime subscriptions
    const coursesSub = supabase.channel('courses_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
        fetchCourses();
      })
      .subscribe();

    const registrationsSub = supabase.channel('registrations_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => {
        fetchRegistrations();
      })
      .subscribe();

    const testimonialsSub = supabase.channel('testimonials_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => {
        fetchTestimonials();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(coursesSub);
      supabase.removeChannel(registrationsSub);
      supabase.removeChannel(testimonialsSub);
    };
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setCourses(data);
    setLoading(false);
  };

  const fetchRegistrations = async () => {
    const { data, error } = await supabase
      .from('registrations')
      .select('*, courses(title)')
      .order('enrolled_at', { ascending: false });
    
    if (!error && data) setRegistrations(data);
  };

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setTestimonials(data);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-surface-900 border-b border-surface-800 h-20 flex items-center shrink-0">
        <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 relative">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-surface-text tracking-tight cursor-pointer" onClick={() => setView('student')}>أكاديميا</span>
            
            {/* Secret Admin Access - Double click the logo area */}
            <div 
              className="absolute inset-0 z-10 cursor-pointer opacity-0"
              onDoubleClick={() => setView('admin')}
              title=""
            >
            </div>
          </div>
          
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-xl bg-surface-800 text-surface-400 hover:text-emerald-400 transition-colors border border-surface-700"
            title={isDarkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {view === 'student' ? (
            <motion.div
              key="student-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <StudentView
                courses={courses}
                testimonials={testimonials.filter(t => t.is_published)}
                loading={loading}
                onEnroll={(course) => {
                  setSelectedCourse(course);
                  setIsEnrollModalOpen(true);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {isAdminAuthenticated ? (
                <AdminView 
    courses={courses} 
    registrations={registrations} 
    testimonials={testimonials} 
    onRefreshCourses={fetchCourses} 
    onRefreshRegistrations={fetchRegistrations} 
    onRefreshTestimonials={fetchTestimonials} 
  />
              ) : (
                <AdminLogin 
                  onLogin={() => setIsAdminAuthenticated(true)} 
                  onCancel={() => setView('student')} 
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-800 py-8 bg-surface-950 text-center text-surface-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center">
          <p>&copy; {new Date().getFullYear()} أكاديميا. جميع الحقوق محفوظة.</p>
        </div>
      </footer>

      {/* Enrollment Modal */}
      <AnimatePresence>
        {isEnrollModalOpen && selectedCourse && (
          <EnrollmentModal
            course={selectedCourse}
            onClose={() => setIsEnrollModalOpen(false)}
            onSuccess={() => {
              setIsEnrollModalOpen(false);
              fetchRegistrations(); // optimistically refresh
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Subcomponents ---

const CATEGORIES = ["الكل", "برمجة وتطوير", "تصميم", "ذكاء اصطناعي", "أعمال", "لغات", "أخرى"];

const getCourseCategory = (course: Course) => {
  const text = (course.title + " " + course.description).toLowerCase();
  if (text.includes("برمج") || text.includes("ويب") || text.includes("تطوير") || text.includes("تطبيق") || text.includes("react") || text.includes("node")) return "برمجة وتطوير";
  if (text.includes("تصميم") || text.includes("design") || text.includes("ui/ux") || text.includes("فوتوشوب")) return "تصميم";
  if (text.includes("ذكاء") || text.includes("ai") || text.includes("بيانات") || text.includes("تعلم آلي") || text.includes("data")) return "ذكاء اصطناعي";
  if (text.includes("أعمال") || text.includes("تسويق") || text.includes("إدارة") || text.includes("ريادة") || text.includes("مبيعات")) return "أعمال";
  if (text.includes("لغ") || text.includes("إنجليز") || text.includes("فرنس") || text.includes("english")) return "لغات";
  return "أخرى";
};

function StudentView({ courses, testimonials, loading, onEnroll }: { courses: Course[]; testimonials: Testimonial[]; loading: boolean; onEnroll: (course: Course) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqs = [
    { question: 'كيف يمكنني التسجيل في الكورسات؟', answer: 'يمكنك التسجيل بسهولة عبر النقر على زر "سجل الآن" تحت الكورس المناسب لك وتعبئة البيانات المطلوبة.' },
    { question: 'هل أحصل على شهادة بعد إتمام الكورس؟', answer: 'نعم، بعد إتمامك لأي كورس بنجاح، ستحصل على شهادة معتمدة من منصة أكاديميا.' },
    { question: 'ما هي طرق الدفع المتاحة؟', answer: 'نوفر عدة خيارات للدفع تشمل البطاقات الائتمانية، باي بال، والدفع عند الاستلام في بعض الدول.' },
    { question: 'هل يمكنني استرداد أموالي إذا لم يعجبني الكورس؟', answer: 'بالتأكيد، نوفر ضمان استرداد الأموال خلال أول 14 يوماً من تاريخ شراء الكورس.' }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'الكل' || getCourseCategory(course) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-10 right-10 md:right-32 text-emerald-500/10 pointer-events-none animate-pulse" style={{ animationDuration: '4s' }}>
        <BookOpen className="w-32 h-32 md:w-48 md:h-48 transform -rotate-12" />
      </div>
      <div className="absolute top-40 left-10 md:left-32 text-emerald-500/10 pointer-events-none animate-bounce" style={{ animationDuration: '6s' }}>
        <GraduationCap className="w-24 h-24 md:w-40 md:h-40 transform rotate-12" />
      </div>
      
      {/* Gradient Blobs */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none dark:bg-emerald-500/20"></div>
      <div className="absolute top-40 -left-20 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none dark:bg-emerald-500/20"></div>

      {/* Hero Section */}
      <section className="shrink-0 pt-20 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="space-y-2 flex-1 w-full">
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                <span className="w-8 h-[1px] bg-emerald-500/50"></span> منصة تعليمية
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-surface-text tracking-tight">
                تعلم من أفضل الخبراء <br />
                <span className="text-emerald-500">
                  في أي وقت ومكان
                </span>
              </h1>
              <p className="text-lg text-surface-400 max-w-2xl leading-relaxed mt-4">
                اكتشف مجموعة واسعة من الكورسات المصممة خصيصًا لتطوير مهاراتك ومساعدتك في تحقيق أهدافك المهنية والشخصية.
              </p>
            </div>
            
            <div className="w-full md:w-96 shrink-0 relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-surface-400" />
              </div>
              <input
                type="text"
                placeholder="ابحث عن كورس..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-800/50 border border-surface-700 text-surface-text rounded-2xl py-4 pr-12 pl-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2 shrink-0">
            <span className="w-8 h-[1px] bg-emerald-500/50"></span> الكورسات المتاحة
          </h3>
          
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto mask-fade-right">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  selectedCategory === category
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                    : 'bg-surface-800/40 border-surface-700 text-surface-400 hover:text-surface-200 hover:border-surface-500 hover:bg-surface-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-surface-800/50 rounded-3xl border border-surface-700/50">
            <BookOpen className="w-16 h-16 text-surface-600 mx-auto mb-4" />
            <h3 className="text-xl text-surface-300 font-medium">لا توجد كورسات مطابقة لبحثك</h3>
            <p className="text-surface-500 mt-2">حاول استخدام كلمات مفتاحية مختلفة أو تغيير التصنيف.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  y: -8, 
                  boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.15), 0 8px 10px -6px rgba(16, 185, 129, 0.1)",
                  borderColor: "rgba(16, 185, 129, 0.5)"
                }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                key={course.id}
                className="group flex flex-col bg-surface-800/40 border border-surface-700 p-5 rounded-2xl transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-surface-900/80 backdrop-blur border border-surface-700 text-surface-300 text-[10px] px-3 py-1 rounded-full font-medium">
                    {getCourseCategory(course)}
                  </span>
                </div>
                <div className="w-full h-32 bg-surface-900 rounded-xl overflow-hidden flex items-center justify-center mb-4">
                   <BookOpen className="w-10 h-10 text-surface-600 group-hover:text-emerald-500/50 transition-colors" />
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="font-bold text-surface-text text-lg group-hover:text-emerald-400 transition-colors">
                    {course.title}
                  </h4>
                  <p className="text-xs text-surface-400 line-clamp-2 leading-relaxed mb-4">
                    {course.description || "لا يوجد وصف."}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-surface-700 mt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-surface-500 uppercase tracking-widest mb-1">السعر</span>
                    <span className="text-emerald-500 font-bold text-lg">${course.price}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-surface-500 uppercase tracking-widest mb-1">المدة</span>
                    <span className="text-xs text-surface-400">{course.duration || "غير محدد"}</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={() => onEnroll(course)}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    سجل الآن
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Testimonials Section */}
      {testimonials && testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
          <div className="flex flex-col md:items-center justify-center mb-12 text-center">
            <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-[0.2em] flex items-center justify-center gap-2 mb-4">
              <span className="w-8 h-[1px] bg-emerald-500/50"></span> آراء طلابنا <span className="w-8 h-[1px] bg-emerald-500/50"></span>
            </h3>
            <h2 className="text-3xl md:text-4xl font-bold text-surface-text tracking-tight">ماذا يقولون عنا؟</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((test, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                key={test.id}
                className="bg-surface-800/40 border border-surface-700 p-6 rounded-2xl relative"
              >
                <div className="flex items-center gap-1 text-emerald-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < test.rating ? 'fill-current' : 'text-surface-700'}`} />
                  ))}
                </div>
                <p className="text-surface-300 text-sm leading-relaxed mb-6">"{test.content}"</p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="font-bold text-surface-text text-sm">{test.student_name}</div>
                    <div className="text-xs text-surface-500">طالب في المنصة</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-6 pb-24 relative z-10">
        <div className="flex flex-col md:items-center justify-center mb-12 text-center">
          <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-[0.2em] flex items-center justify-center gap-2 mb-4">
            <span className="w-8 h-[1px] bg-emerald-500/50"></span> الأسئلة الشائعة <span className="w-8 h-[1px] bg-emerald-500/50"></span>
          </h3>
          <h2 className="text-3xl md:text-4xl font-bold text-surface-text tracking-tight">كيف يمكننا مساعدتك؟</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              key={idx} 
              className="bg-surface-800/40 border border-surface-700 rounded-2xl overflow-hidden"
            >
              <button 
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-right focus:outline-none"
              >
                <span className="font-bold text-surface-text">{faq.question}</span>
                {openFaqIndex === idx ? (
                  <ChevronUp className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-surface-500 shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {openFaqIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-surface-400 text-sm leading-relaxed border-t border-surface-700/50 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/1234567890" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 bg-[#25D366] hover:bg-[#1ebe57] text-white p-4 rounded-full shadow-lg shadow-green-900/30 transition-transform hover:scale-110 flex items-center justify-center group"
        title="تواصل معنا عبر واتساب"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        <span className="absolute right-full mr-4 bg-surface-900 text-surface-text text-sm py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-surface-800">
          تواصل معنا
        </span>
      </a>
    </div>
  );
}

function EnrollmentModal({ course, onClose, onSuccess }: { course: Course; onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    student_name: '',
    email: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: sbError } = await supabase.from('registrations').insert([
      {
        student_name: formData.student_name,
        email: formData.email,
        phone: formData.phone,
        course_id: course.id,
      }
    ]);

    setLoading(false);

    if (sbError) {
      setError('حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.');
      console.error(sbError);
    } else {
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-surface-950/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-surface-900 rounded-3xl border border-surface-700 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] pointer-events-none"></div>
        <div className="p-6 md:p-8 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-surface-text mb-1">تسجيل في الكورس</h3>
              <p className="text-emerald-400 font-medium">{course.title}</p>
            </div>
            <button onClick={onClose} className="p-2 text-surface-400 hover:text-surface-text bg-surface-800 hover:bg-surface-700 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center"
            >
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-emerald-400" />
              </div>
              <h4 className="text-2xl font-bold text-surface-text mb-2">تم التسجيل بنجاح!</h4>
              <p className="text-surface-400">سنتواصل معك قريباً لتأكيد الحجز.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="block text-[10px] text-surface-500 mb-2 uppercase tracking-widest">الاسم الكامل</label>
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input
                    required
                    type="text"
                    value={formData.student_name}
                    onChange={(e) => setFormData({...formData, student_name: e.target.value})}
                    className="w-full bg-surface-900 border border-surface-700 rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="أحمد محمد"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] text-surface-500 mb-2 uppercase tracking-widest">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-surface-900 border border-surface-700 rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-left"
                    placeholder="email@example.com"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] text-surface-500 mb-2 uppercase tracking-widest">رقم الهاتف</label>
                <div className="relative">
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-surface-900 border border-surface-700 rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-left"
                    placeholder="+966 50 000 0000"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl mt-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-xl shadow-emerald-900/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تأكيد التسجيل'}
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-3 opacity-40">
                <div className="w-4 h-[1px] bg-surface-400"></div>
                <p className="text-[9px] uppercase tracking-[0.3em]">تشفير آمن للمعلومات</p>
                <div className="w-4 h-[1px] bg-surface-400"></div>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function AdminLogin({ onLogin, onCancel }: { onLogin: () => void, onCancel: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPassword = typeof window !== 'undefined' ? localStorage.getItem('admin_password') || 'admin123' : 'admin123';
    if (password === storedPassword) { 
      onLogin();
    } else {
      setError('كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-surface-900 border border-surface-800 rounded-3xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] pointer-events-none"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-center w-16 h-16 bg-surface-950 rounded-2xl mx-auto mb-6 border border-surface-800">
          <ShieldAlert className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-surface-text text-center mb-2">تسجيل الدخول للإدارة</h2>
        <p className="text-surface-400 text-center text-sm mb-8">يرجى إدخال كلمة المرور للوصول إلى لوحة التحكم</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-[10px] text-surface-500 uppercase tracking-widest text-center">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-950 border border-surface-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-center text-surface-text"
              placeholder="••••••••"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20"
          >
            دخول
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-transparent hover:bg-surface-800 text-surface-400 font-medium py-3 rounded-xl transition-all"
          >
            العودة للرئيسية
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminView({ 
  courses, 
  registrations, 
  testimonials, 
  onRefreshCourses, 
  onRefreshRegistrations, 
  onRefreshTestimonials 
}: { 
  courses: Course[]; 
  registrations: Registration[]; 
  testimonials: Testimonial[]; 
  onRefreshCourses?: () => void; 
  onRefreshRegistrations?: () => void; 
  onRefreshTestimonials?: () => void; 
}) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'registrations' | 'testimonials' | 'settings'>('dashboard');

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-8">
      {/* Admin Sidebar */}
      <div className="w-full md:w-64 shrink-0 space-y-2">
        <div className="text-xs font-bold tracking-wider text-surface-500 mb-4 px-4 uppercase">القائمة الرئيسية</div>
        
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'dashboard' 
              ? 'bg-surface-900/50 border-r-4 border-emerald-500 text-emerald-400' 
              : 'text-surface-400 hover:bg-surface-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          لوحة القيادة
        </button>
        <button
          onClick={() => setActiveTab('courses')}

          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'courses' 
              ? 'bg-surface-900/50 border-r-4 border-emerald-500 text-emerald-400' 
              : 'text-surface-400 hover:bg-surface-900'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          إدارة الكورسات
        </button>
                <button
          onClick={() => setActiveTab('registrations')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'registrations' 
              ? 'bg-surface-900/50 border-r-4 border-emerald-500 text-emerald-400' 
              : 'text-surface-400 hover:bg-surface-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5" />
            الطلبات
          </div>
          {registrations.length > 0 && (
            <span className="bg-emerald-500/20 text-emerald-400 py-0.5 px-2 rounded-full text-xs border border-emerald-500/20">
              {registrations.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('testimonials')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'testimonials' 
              ? 'bg-surface-900/50 border-r-4 border-emerald-500 text-emerald-400' 
              : 'text-surface-400 hover:bg-surface-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5" />
            التقييمات
          </div>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'settings' 
              ? 'bg-surface-900/50 border-r-4 border-emerald-500 text-emerald-400' 
              : 'text-surface-400 hover:bg-surface-900'
          }`}
        >
          <Settings className="w-5 h-5" />
          الإعدادات
        </button>
      </div>

      {/* Admin Content Panel */}
      <div className="flex-1 bg-surface-900 border border-surface-800 rounded-3xl p-6 md:p-8 min-h-[600px] shadow-2xl">
        <AnimatePresence mode="wait">
          
          {activeTab === 'dashboard' && (
            <motion.div key="admin-dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AdminDashboard courses={courses} registrations={registrations} />
            </motion.div>
          )}
          {activeTab === 'courses' && (

            <motion.div key="admin-courses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AdminCourses courses={courses} registrations={registrations} onRefreshCourses={onRefreshCourses} />
            </motion.div>
          )}
          {activeTab === 'registrations' && (
            <motion.div key="admin-regs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AdminRegistrations registrations={registrations} onRefreshRegistrations={onRefreshRegistrations} />
            </motion.div>
          )}
          {activeTab === 'testimonials' && (
            <motion.div key="admin-testimonials" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AdminTestimonials testimonials={testimonials} onRefreshTestimonials={onRefreshTestimonials} />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div key="admin-settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AdminSettings />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


function AdminDashboard({ courses, registrations }: { courses: Course[]; registrations: Registration[] }) {
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-surface-text mb-1">نظرة عامة</h2>
        <p className="text-surface-400 text-sm">إحصائيات وأداء المنصة</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-800/40 border border-surface-700 p-6 rounded-2xl flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <div className="text-sm text-surface-400">إجمالي الكورسات</div>
              <div className="text-3xl font-bold text-surface-text">{courses.length}</div>
            </div>
          </div>
        </div>

        <div className="bg-surface-800/40 border border-surface-700 p-6 rounded-2xl flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-sm text-surface-400">الطلاب المسجلين</div>
              <div className="text-3xl font-bold text-surface-text">{registrations.length}</div>
            </div>
          </div>
        </div>

        
      </div>

      <div>
        <h3 className="text-lg font-bold text-surface-text mb-4">أحدث التسجيلات</h3>
        <div className="bg-surface-800/40 border border-surface-700 rounded-2xl overflow-hidden">
          {registrations.slice(0, 5).length > 0 ? (
            <div className="divide-y divide-surface-700">
              {registrations.slice(0, 5).map(reg => (
                <div key={reg.id} className="p-4 flex items-center justify-between hover:bg-surface-800/60 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-surface-700 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-surface-400" />
                    </div>
                    <div>
                      <div className="font-bold text-surface-200">{reg.student_name}</div>
                      <div className="text-xs text-surface-500">{reg.courses?.title || 'كورس غير معروف'}</div>
                    </div>
                  </div>
                  <div className="text-xs text-surface-500">
                    {new Date(reg.enrolled_at).toLocaleDateString('ar-EG')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-surface-500">لا توجد تسجيلات حديثة</div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminSettings() {

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const storedPassword = typeof window !== 'undefined' ? localStorage.getItem('admin_password') || 'admin123' : 'admin123';
    
    if (currentPassword !== storedPassword) {
      setError('كلمة المرور الحالية غير صحيحة');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمة المرور الجديدة غير متطابقة');
      return;
    }

    if (newPassword.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_password', newPassword);
    }
    
    setMessage('تم تحديث كلمة المرور بنجاح');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-text mb-1">إعدادات الحساب</h2>
        <p className="text-surface-400 text-sm">تغيير كلمة المرور الخاصة بلوحة الإدارة</p>
      </div>

      <div className="max-w-md bg-surface-800/40 border border-surface-700 p-6 rounded-2xl">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
              {message}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-[10px] text-surface-500 uppercase tracking-widest">كلمة المرور الحالية</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-surface-900 border border-surface-700 text-surface-text rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] text-surface-500 uppercase tracking-widest">كلمة المرور الجديدة</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-surface-900 border border-surface-700 text-surface-text rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] text-surface-500 uppercase tracking-widest">تأكيد كلمة المرور</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-surface-900 border border-surface-700 text-surface-text rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all mt-4"
          >
            تحديث كلمة المرور
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminCourses({ 
  courses, 
  registrations, 
  onRefreshCourses 
}: { 
  courses: Course[]; 
  registrations: Registration[]; 
  onRefreshCourses?: () => void; 
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', price: '', duration: '' });

  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const courseData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price) || 0,
      duration: formData.duration.trim()
    };

    try {
      if (editingCourseId) {
        const { error } = await supabase.from('courses').update(courseData).eq('id', editingCourseId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('courses').insert([courseData]);
        if (error) throw error;
      }

      setFormData({ title: '', description: '', price: '', duration: '' });
      setIsAdding(false);
      setEditingCourseId(null);

      if (onRefreshCourses) {
        await onRefreshCourses();
      }
    } catch (err: any) {
      console.error('Error saving course:', err);
      alert('حدث خطأ أثناء حفظ الكورس: ' + (err.message || 'يرجى المحاولة مرة أخرى'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (course: Course) => {
    setEditingCourseId(course.id);
    setFormData({
      title: course.title,
      description: course.description || '',
      price: course.price.toString(),
      duration: course.duration || ''
    });
    setIsAdding(true);
  };

  const cancelAddOrEdit = () => {
    setIsAdding(false);
    setEditingCourseId(null);
    setFormData({ title: '', description: '', price: '', duration: '' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الكورس؟')) {
      try {
        const { error } = await supabase.from('courses').delete().eq('id', id);
        if (error) throw error;
        if (onRefreshCourses) {
          await onRefreshCourses();
        }
      } catch (err: any) {
        console.error('Error deleting course:', err);
        alert('حدث خطأ أثناء حذف الكورس: ' + (err.message || 'يرجى المحاولة مرة أخرى'));
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-surface-text mb-1">الكورسات التدريبية</h2>
          <p className="text-surface-400 text-sm">إدارة وإضافة الكورسات المتاحة على المنصة</p>
        </div>
        <button
          onClick={() => isAdding ? cancelAddOrEdit() : setIsAdding(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? 'إلغاء' : 'إضافة كورس'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddOrEdit} className="bg-surface-950/50 p-6 rounded-2xl border border-emerald-500/30 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                {editingCourseId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <h3 className="font-bold">{editingCourseId ? 'تعديل بيانات الكورس' : 'إضافة كورس جديد'}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] text-surface-500 mb-2 uppercase tracking-widest">عنوان الكورس</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-surface-900 border border-surface-700 text-surface-text rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors" placeholder="تطوير تطبيقات الويب..." />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] text-surface-500 mb-2 uppercase tracking-widest">المدة (أمثلة: 10 ساعات، شهرين)</label>
                  <input value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full bg-surface-900 border border-surface-700 text-surface-text rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors" placeholder="20 ساعة مسجلة" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-[10px] text-surface-500 mb-2 uppercase tracking-widest">الوصف</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-surface-900 border border-surface-700 text-surface-text rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none" placeholder="وصف الكورس وماذا سيتعلم الطالب..." />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] text-surface-500 mb-2 uppercase tracking-widest">السعر ($)</label>
                  <input required type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-surface-900 border border-surface-700 text-surface-text rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-left" dir="ltr" placeholder="99.00" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={cancelAddOrEdit} className="px-6 py-2.5 rounded-lg text-sm font-medium text-surface-400 hover:text-surface-200 transition-colors">إلغاء</button>
                <button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50">
                  {loading ? 'جاري الحفظ...' : 'حفظ الكورس'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-surface-950 border border-surface-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-surface-300">
            <thead className="text-[10px] text-surface-500 uppercase tracking-widest bg-surface-900/50 border-b border-surface-800">
              <tr>
                <th className="px-6 py-4 font-medium text-right">الكورس</th>
                <th className="px-6 py-4 font-medium text-center">المسجلين</th>
                <th className="px-6 py-4 font-medium text-right">المدة</th>
                <th className="px-6 py-4 font-medium text-right">السعر</th>
                <th className="px-6 py-4 font-medium text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-surface-500">لا يوجد كورسات حالياً. قم بإضافة كورس جديد.</td>
                </tr>
              ) : (
                courses.map(course => {
                  const enrolledCount = registrations.filter(r => r.course_id === course.id).length;
                  return (
                    <tr key={course.id} className="hover:bg-surface-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-surface-200">{course.title}</div>
                        <div className="text-surface-500 text-xs mt-1 truncate max-w-xs">{course.description}</div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-1 rounded-full text-xs">
                          {enrolledCount} طالب
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{course.duration || 'غير محدد'}</td>
                      <td className="px-6 py-4 font-medium text-emerald-400 whitespace-nowrap">${course.price}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEditClick(course)} className="p-2 text-surface-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors" title="تعديل">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(course.id)} className="p-2 text-surface-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="حذف">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminTestimonials({ 
  testimonials, 
  onRefreshTestimonials 
}: { 
  testimonials: Testimonial[]; 
  onRefreshTestimonials?: () => void; 
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ student_name: '', content: '', rating: '5', is_published: false });

  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const testData = {
      student_name: formData.student_name.trim(),
      content: formData.content.trim(),
      rating: parseInt(formData.rating) || 5,
      is_published: formData.is_published
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('testimonials').update(testData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('testimonials').insert([testData]);
        if (error) throw error;
      }

      setFormData({ student_name: '', content: '', rating: '5', is_published: false });
      setIsAdding(false);
      setEditingId(null);

      if (onRefreshTestimonials) {
        await onRefreshTestimonials();
      }
    } catch (err: any) {
      console.error('Error saving testimonial:', err);
      alert('حدث خطأ أثناء حفظ التقييم: ' + (err.message || 'يرجى المحاولة مرة أخرى'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (test: Testimonial) => {
    setEditingId(test.id);
    setFormData({
      student_name: test.student_name,
      content: test.content,
      rating: test.rating.toString(),
      is_published: test.is_published
    });
    setIsAdding(true);
  };

  const cancelAddOrEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ student_name: '', content: '', rating: '5', is_published: false });
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      try {
        const { error } = await supabase.from('testimonials').delete().eq('id', id);
        if (error) throw error;
        if (onRefreshTestimonials) {
          await onRefreshTestimonials();
        }
      } catch (err: any) {
        console.error('Error deleting testimonial:', err);
        alert('حدث خطأ أثناء حذف التقييم: ' + (err.message || 'يرجى المحاولة مرة أخرى'));
      }
    }
  };

  const togglePublish = async (test: Testimonial) => {
    try {
      const { error } = await supabase.from('testimonials').update({ is_published: !test.is_published }).eq('id', test.id);
      if (error) throw error;
      if (onRefreshTestimonials) {
        await onRefreshTestimonials();
      }
    } catch (err: any) {
      console.error('Error toggling publish state:', err);
      alert('حدث خطأ أثناء تغيير حالة النشر');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-text mb-1">التقييمات والآراء</h2>
          <p className="text-surface-400 text-sm">إدارة آراء الطلاب المعروضة في الصفحة الرئيسية</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            إضافة تقييم
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddOrEdit} className="bg-surface-950/50 p-6 rounded-2xl border border-emerald-500/30 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            {editingId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <h3 className="font-bold">{editingId ? 'تعديل التقييم' : 'إضافة تقييم جديد'}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[10px] text-surface-500 mb-2 uppercase tracking-widest">اسم الطالب</label>
              <input required value={formData.student_name} onChange={e => setFormData({...formData, student_name: e.target.value})} className="w-full bg-surface-900 border border-surface-700 text-surface-text rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors" placeholder="اسم الطالب" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] text-surface-500 mb-2 uppercase tracking-widest">التقييم (من 1 إلى 5)</label>
              <input required type="number" min="1" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} className="w-full bg-surface-900 border border-surface-700 text-surface-text rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-[10px] text-surface-500 mb-2 uppercase tracking-widest">نص التقييم</label>
              <textarea required rows={3} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-surface-900 border border-surface-700 text-surface-text rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none" placeholder="اكتب التقييم..." />
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <input type="checkbox" id="is_published" checked={formData.is_published} onChange={e => setFormData({...formData, is_published: e.target.checked})} className="w-4 h-4 text-emerald-500 bg-surface-900 border-surface-700 rounded focus:ring-emerald-500 cursor-pointer" />
              <label htmlFor="is_published" className="text-sm text-surface-300 cursor-pointer">نشر في الصفحة الرئيسية</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-800">
            <button type="button" onClick={cancelAddOrEdit} className="px-6 py-2 rounded-xl text-surface-400 hover:text-surface-200 transition-colors text-sm">إلغاء</button>
            <button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-2 rounded-xl transition-colors font-bold text-sm">
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-surface-950 border border-surface-800 rounded-2xl overflow-hidden">
        {testimonials.length === 0 ? (
          <div className="p-8 text-center text-surface-500">
            لا توجد تقييمات حتى الآن.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-surface-300">
              <thead className="bg-surface-900 border-b border-surface-800 text-surface-500">
                <tr>
                  <th className="px-6 py-4 font-medium text-right w-1/4">الطالب</th>
                  <th className="px-6 py-4 font-medium text-right w-2/4">التقييم</th>
                  <th className="px-6 py-4 font-medium text-center">النشر</th>
                  <th className="px-6 py-4 font-medium text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800">
                {testimonials.map(test => (
                  <tr key={test.id} className="hover:bg-surface-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-surface-200">{test.student_name}</div>
                      <div className="flex items-center text-emerald-500 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < test.rating ? 'fill-current' : 'text-surface-700'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-surface-400 line-clamp-2">{test.content}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => togglePublish(test)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${test.is_published ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-surface-800 text-surface-500 border-surface-700 hover:bg-surface-700'}`}
                      >
                        {test.is_published ? 'منشور' : 'مخفي'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEditClick(test)} className="p-2 bg-surface-800 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg transition-colors" title="تعديل">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(test.id)} className="p-2 bg-surface-800 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors" title="حذف">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminRegistrations({ 
  registrations, 
  onRefreshRegistrations 
}: { 
  registrations: Registration[]; 
  onRefreshRegistrations?: () => void; 
}) {
  const handleDeleteRegistration = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      try {
        const { error } = await supabase.from('registrations').delete().eq('id', id);
        if (error) throw error;
        if (onRefreshRegistrations) {
          await onRefreshRegistrations();
        }
      } catch (err: any) {
        console.error('Error deleting registration:', err);
        alert('حدث خطأ أثناء حذف طلب التسجيل: ' + (err.message || 'يرجى المحاولة مرة أخرى'));
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(dateString));
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-text mb-1">طلبات التسجيل</h2>
          <p className="text-surface-400 text-sm">متابعة الطلاب المسجلين حديثاً في الكورسات</p>
        </div>
        <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
          إجمالي الطلبات: {registrations.length}
        </div>
      </div>

      <div className="bg-surface-950 border border-surface-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-surface-300">
            <thead className="text-[10px] text-surface-500 uppercase tracking-widest bg-surface-900/50 border-b border-surface-800">
              <tr>
                <th className="px-6 py-4 font-medium text-right">الطالب</th>
                <th className="px-6 py-4 font-medium text-right">التواصل</th>
                <th className="px-6 py-4 font-medium text-right">الكورس</th>
                <th className="px-6 py-4 font-medium text-right">تاريخ التسجيل</th>
                <th className="px-6 py-4 font-medium text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-surface-500">لا يوجد طلبات تسجيل حتى الآن.</td>
                </tr>
              ) : (
                registrations.map(reg => (
                  <tr key={reg.id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-surface-200">{reg.student_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1.5 text-surface-400">
                          <Mail className="w-3 h-3" />
                          <span dir="ltr" className="text-right">{reg.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-surface-400">
                          <Phone className="w-3 h-3" />
                          <span dir="ltr" className="text-right">{reg.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-emerald-400">
                      {reg.courses?.title || 'كورس محذوف'}
                    </td>
                    <td className="px-6 py-4 text-surface-500 text-xs" dir="ltr">
                      <div className="text-right">
                        {formatDate(reg.enrolled_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDeleteRegistration(reg.id)}
                        className="p-2 text-surface-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="حذف الطلب"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
