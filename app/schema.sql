-- قم بتشغيل هذا الكود في محرر SQL داخل مشروع Supabase الخاص بك

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

-- إعدادات الأمان (لأغراض العرض، يتم فتح الصلاحيات للعامة)
-- تحذير: في بيئة الإنتاج الحقيقية، يجب تقييد هذه الصلاحيات لتناسب نظام تسجيل الدخول!
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to courses" ON courses FOR SELECT TO public USING (true);
CREATE POLICY "Allow public all access to courses" ON courses FOR ALL TO public USING (true);

CREATE POLICY "Allow public insert access to registrations" ON registrations FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public read access to registrations" ON registrations FOR SELECT TO public USING (true);
CREATE POLICY "Allow public all access to registrations" ON registrations FOR ALL TO public USING (true);
