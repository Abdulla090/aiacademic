import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRightLeft, BookOpen, Globe, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { geminiService } from '@/services/geminiService';

interface DialectComparison {
  sorani: string;
  kurmanji: string;
  category: string;
  notes?: string;
}

// Comprehensive dialect dictionary
const dialectDictionary: DialectComparison[] = [
  // Pronouns - جێناو
  { sorani: "من", kurmanji: "ez", category: "جێناو" },
  { sorani: "تۆ", kurmanji: "tu", category: "جێناو" },
  { sorani: "ئەو", kurmanji: "ew", category: "جێناو" },
  { sorani: "ئێمە", kurmanji: "em", category: "جێناو" },
  { sorani: "ئێوە", kurmanji: "hûn", category: "جێناو" },
  { sorani: "ئەوان", kurmanji: "wan", category: "جێناو" },
  { sorani: "خۆم", kurmanji: "xwe", category: "جێناو" },
  { sorani: "خۆت", kurmanji: "xwe", category: "جێناو" },
  
  // Verbs - کردار
  { sorani: "هاتن", kurmanji: "hatin", category: "کردار" },
  { sorani: "چوون", kurmanji: "çûn", category: "کردار" },
  { sorani: "کردن", kurmanji: "kirin", category: "کردار" },
  { sorani: "وتن", kurmanji: "gotin", category: "کردار" },
  { sorani: "خواردن", kurmanji: "xwarin", category: "کردار" },
  { sorani: "خەوتن", kurmanji: "razان", category: "کردار" },
  { sorani: "ژیان", kurmanji: "jiyan", category: "کردار" },
  { sorani: "مردن", kurmanji: "mirin", category: "کردار" },
  { sorani: "دیتن", kurmanji: "dîtin", category: "کردار" },
  { sorani: "بیستن", kurmanji: "bihîstin", category: "کردار" },
  { sorani: "نووسین", kurmanji: "nivîsandin", category: "کردار" },
  { sorani: "خوێندن", kurmanji: "xwendin", category: "کردار" },
  { sorani: "گەڕان", kurmanji: "gerandin", category: "کردار" },
  { sorani: "دۆزینەوە", kurmanji: "dîtin", category: "کردار" },
  { sorani: "کار", kurmanji: "kar", category: "کردار" },
  { sorani: "کارکردن", kurmanji: "kar kirin", category: "کردار" },
  { sorani: "بینین", kurmanji: "dîtin", category: "کردار" },
  { sorani: "گوتن", kurmanji: "gotin", category: "کردار" },
  { sorani: "هەڵگرتن", kurmanji: "hilgirtin", category: "کردار" },
  { sorani: "داندانان", kurmanji: "danîn", category: "کردار" },
  
  // Time expressions - کات
  { sorani: "ئێستا", kurmanji: "niha", category: "کات" },
  { sorani: "دوێنێ", kurmanji: "duh", category: "کات" },
  { sorani: "سبەی", kurmanji: "sibê", category: "کات" },
  { sorani: "ئێوارە", kurmanji: "êvar", category: "کات" },
  { sorani: "بەیانی", kurmanji: "beyan", category: "کات" },
  { sorani: "شەو", kurmanji: "şev", category: "کات" },
  { sorani: "ڕۆژ", kurmanji: "roj", category: "کات" },
  { sorani: "حەفتە", kurmanji: "hefte", category: "کات" },
  { sorani: "مانگ", kurmanji: "meh", category: "کات" },
  { sorani: "ساڵ", kurmanji: "sal", category: "کات" },
  { sorani: "کاتژمێر", kurmanji: "demjimêr", category: "کات" },
  { sorani: "خولەک", kurmanji: "xulek", category: "کات" },
  { sorani: "چرکە", kurmanji: "çirke", category: "کات" },
  { sorani: "ئێوارانی", kurmanji: "êvarî", category: "کات" },
  { sorani: "نیوەشەو", kurmanji: "nîvşev", category: "کات" },
  
  // Family - خێزان
  { sorani: "باوک", kurmanji: "bav", category: "خێزان" },
  { sorani: "دایک", kurmanji: "dayik", category: "خێزان" },
  { sorani: "کوڕ", kurmanji: "kur", category: "خێزان" },
  { sorani: "کچ", kurmanji: "keç", category: "خێزان" },
  { sorani: "برا", kurmanji: "bira", category: "خێزان" },
  { sorani: "خوشک", kurmanji: "xweh", category: "خێزان" },
  { sorani: "باپیر", kurmanji: "bavpîr", category: "خێزان" },
  { sorani: "دایپیر", kurmanji: "daypîr", category: "خێزان" },
  { sorani: "مام", kurmanji: "mam", category: "خێزان" },
  { sorani: "پورە", kurmanji: "pûr", category: "خێزان" },
  { sorani: "خالو", kurmanji: "xal", category: "خێزان" },
  { sorani: "ژن", kurmanji: "jin", category: "خێزان" },
  { sorani: "مێرد", kurmanji: "mêr", category: "خێزان" },
  { sorani: "هاوسەر", kurmanji: "hevser", category: "خێزان" },
  
  // Numbers - ژمارە
  { sorani: "یەک", kurmanji: "yek", category: "ژمارە" },
  { sorani: "دوو", kurmanji: "du", category: "ژمارە" },
  { sorani: "سێ", kurmanji: "sê", category: "ژمارە" },
  { sorani: "چوار", kurmanji: "çar", category: "ژمارە" },
  { sorani: "پێنج", kurmanji: "pênc", category: "ژمارە" },
  { sorani: "شەش", kurmanji: "şeş", category: "ژمارە" },
  { sorani: "حەوت", kurmanji: "heft", category: "ژمارە" },
  { sorani: "هەشت", kurmanji: "heşt", category: "ژمارە" },
  { sorani: "نۆ", kurmanji: "neh", category: "ژمارە" },
  { sorani: "دە", kurmanji: "deh", category: "ژمارە" },
  { sorani: "یازدە", kurmanji: "yazde", category: "ژمارە" },
  { sorani: "دوازدە", kurmanji: "dûwazde", category: "ژمارە" },
  { sorani: "بیست", kurmanji: "bîst", category: "ژمارە" },
  { sorani: "سی", kurmanji: "sî", category: "ژمارە" },
  { sorani: "چل", kurmanji: "çil", category: "ژمارە" },
  { sorani: "پەنجا", kurmanji: "pêncî", category: "ژمارە" },
  { sorani: "شەست", kurmanji: "şêst", category: "ژمارە" },
  { sorani: "سەد", kurmanji: "sed", category: "ژمارە" },
  { sorani: "هەزار", kurmanji: "hezar", category: "ژمارە" },
  
  // Colors - ڕەنگ
  { sorani: "سوور", kurmanji: "sor", category: "ڕەنگ" },
  { sorani: "زەرد", kurmanji: "zer", category: "ڕەنگ" },
  { sorani: "شین", kurmanji: "şîn", category: "ڕەنگ" },
  { sorani: "سپی", kurmanji: "spî", category: "ڕەنگ" },
  { sorani: "ڕەش", kurmanji: "reş", category: "ڕەنگ" },
  { sorani: "سەوز", kurmanji: "kesk", category: "ڕەنگ" },
  { sorani: "پەمەیی", kurmanji: "pembe", category: "ڕەنگ" },
  { sorani: "مۆر", kurmanji: "mor", category: "ڕەنگ" },
  { sorani: "نارەنجی", kurmanji: "pirteqal", category: "ڕەنگ" },
  { sorani: "قاوەیی", kurmanji: "qehwerî", category: "ڕەنگ" },
  
  // Body parts - ئەندامەکانی لەش
  { sorani: "سەر", kurmanji: "ser", category: "لەش" },
  { sorani: "چاو", kurmanji: "çav", category: "لەش" },
  { sorani: "گوێ", kurmanji: "guh", category: "لەش" },
  { sorani: "لووت", kurmanji: "lût", category: "لەش" },
  { sorani: "دەم", kurmanji: "dev", category: "لەش" },
  { sorani: "دان", kurmanji: "diran", category: "لەش" },
  { sorani: "ملە", kurmanji: "mil", category: "لەش" },
  { sorani: "دەست", kurmanji: "dest", category: "لەش" },
  { sorani: "پەنجە", kurmanji: "tilî", category: "لەش" },
  { sorani: "قاچ", kurmanji: "ling", category: "لەش" },
  { sorani: "پێ", kurmanji: "pê", category: "لەش" },
  { sorani: "دڵ", kurmanji: "dil", category: "لەش" },
  
  // Common words - وشەی باو
  { sorani: "ماڵ", kurmanji: "mal", category: "شوێن" },
  { sorani: "شار", kurmanji: "bajar", category: "شوێن" },
  { sorani: "گوند", kurmanji: "gund", category: "شوێن" },
  { sorani: "بازاڕ", kurmanji: "bazar", category: "شوێن" },
  { sorani: "دکان", kurmanji: "dukan", category: "شوێن" },
  { sorani: "قوتابخانە", kurmanji: "dibistan", category: "شوێن" },
  { sorani: "نەخۆشخانە", kurmanji: "nexweşxane", category: "شوێن" },
  { sorani: "ڕێگا", kurmanji: "rê", category: "شوێن" },
  { sorani: "دارستان", kurmanji: "daristan", category: "شوێن" },
  { sorani: "چیا", kurmanji: "çiya", category: "شوێن" },
  { sorani: "ڕووبار", kurmanji: "çem", category: "شوێن" },
  
  // Animals - ئاژەڵ
  { sorani: "پشیلە", kurmanji: "pisîk", category: "ئاژەڵ" },
  { sorani: "سەگ", kurmanji: "kûçik", category: "ئاژەڵ" },
  { sorani: "ئەسپ", kurmanji: "hesp", category: "ئاژەڵ" },
  { sorani: "گا", kurmanji: "çêl", category: "ئاژەڵ" },
  { sorani: "بەرخ", kurmanji: "berx", category: "ئاژەڵ" },
  { sorani: "مەڕ", kurmanji: "pez", category: "ئاژەڵ" },
  { sorani: "بزن", kurmanji: "bizin", category: "ئاژەڵ" },
  { sorani: "مریشک", kurmanji: "mirîşk", category: "ئاژەڵ" },
  
  // Food - خۆراک
  { sorani: "نان", kurmanji: "nan", category: "خۆراک" },
  { sorani: "ئاو", kurmanji: "av", category: "خۆراک" },
  { sorani: "شیر", kurmanji: "şîr", category: "خۆراک" },
  { sorani: "پەنیر", kurmanji: "penîr", category: "خۆراک" },
  { sorani: "گۆشت", kurmanji: "goşt", category: "خۆراک" },
  { sorani: "برنج", kurmanji: "birinc", category: "خۆراک" },
  { sorani: "سەوزە", kurmanji: "sebze", category: "خۆراک" },
  { sorani: "میوە", kurmanji: "fêkî", category: "خۆراک" },
  { sorani: "چا", kurmanji: "çay", category: "خۆراک" },
  { sorani: "قاوە", kurmanji: "qehwe", category: "خۆراک" },
  
  // Common Phrases - دەربڕین
  { sorani: "چۆنی؟", kurmanji: "çawa yî?", category: "دەربڕین", notes: "How are you?" },
  { sorani: "زۆر سوپاس", kurmanji: "gelek spas", category: "دەربڕین", notes: "Thank you very much" },
  { sorani: "ببوورە", kurmanji: "bibore", category: "دەربڕین", notes: "Excuse me/Sorry" },
  { sorani: "سڵاو", kurmanji: "silav", category: "دەربڕین", notes: "Hello/Greeting" },
  { sorani: "بەخێربێی", kurmanji: "bi xêr be", category: "دەربڕین", notes: "Goodbye" },
  { sorani: "ئەرێ", kurmanji: "erê", category: "دەربڕین", notes: "Yes" },
  { sorani: "نەخێر", kurmanji: "na", category: "دەربڕین", notes: "No" },
  { sorani: "سپاس", kurmanji: "sipas", category: "دەربڕین", notes: "Thank you" },
  { sorani: "خوا حافیز", kurmanji: "xatirê te", category: "دەربڕین", notes: "Goodbye" },
  { sorani: "بەخێر بێی", kurmanji: "bi xêr hatî", category: "دەربڕین", notes: "Welcome" },
  { sorani: "چاکم", kurmanji: "çak im", category: "دەربڕین", notes: "I'm fine" },
  { sorani: "تۆ چۆنی؟", kurmanji: "tu çawa yî?", category: "دەربڕین", notes: "How are you?" },
  
  // Academic Terms - زانست
  { sorani: "پەروەردە", kurmanji: "perwerde", category: "زانست", notes: "Education" },
  { sorani: "زانکۆ", kurmanji: "zanîngeه", category: "زانست", notes: "University" },
  { sorani: "خوێندکار", kurmanji: "xwendekar", category: "زانست", notes: "Student" },
  { sorani: "مامۆستا", kurmanji: "mamosta", category: "زانست", notes: "Teacher" },
  { sorani: "پەڕتووک", kurmanji: "pirtûk", category: "زانست", notes: "Book" },
  { sorani: "وتار", kurmanji: "gotar", category: "زانست", notes: "Article" },
  { sorani: "توێژینەوە", kurmanji: "lêkolîn", category: "زانست", notes: "Research" },
  { sorani: "وانە", kurmanji: "ders", category: "زانست", notes: "Lesson" },
  { sorani: "ئیمتحان", kurmanji: "îmtîhan", category: "زانست", notes: "Exam" },
  { sorani: "پرسیار", kurmanji: "pirs", category: "زانست", notes: "Question" },
  { sorani: "وەڵام", kurmanji: "bersiv", category: "زانست", notes: "Answer" },
  { sorani: "نمرە", kurmanji: "nimre", category: "زانست", notes: "Grade" },
  { sorani: "بڕوانامە", kurmanji: "şehadetname", category: "زانست", notes: "Certificate" },
  
  // Technology - تەکنەلۆژیا
  { sorani: "کۆمپیوتەر", kurmanji: "komputer", category: "تەکنەلۆژیا" },
  { sorani: "مۆبایل", kurmanji: "telefon", category: "تەکنەلۆژیا" },
  { sorani: "ئینتەرنێت", kurmanji: "înternet", category: "تەکنەلۆژیا" },
  { sorani: "ویبسایت", kurmanji: "malper", category: "تەکنەلۆژیا" },
  { sorani: "ئیمەیل", kurmanji: "e-name", category: "تەکنەلۆژیا" },
  { sorani: "بەرنامە", kurmanji: "program", category: "تەکنەلۆژیا" },
  
  // Directions - ئاراستە
  { sorani: "باکوور", kurmanji: "bakur", category: "ئاراستە" },
  { sorani: "باشوور", kurmanji: "başûr", category: "ئاراستە" },
  { sorani: "ڕۆژهەڵات", kurmanji: "rojhilat", category: "ئاراستە" },
  { sorani: "ڕۆژئاوا", kurmanji: "rojava", category: "ئاراستە" },
  { sorani: "چەپ", kurmanji: "çep", category: "ئاراستە" },
  { sorani: "ڕاست", kurmanji: "rast", category: "ئاراستە" },
  { sorani: "سەرەوە", kurmanji: "jor", category: "ئاراستە" },
  { sorani: "خوارەوە", kurmanji: "jêr", category: "ئاراستە" },
  
  // Weather - کەشوهەوا
  { sorani: "کەشوهەوا", kurmanji: "hewayî", category: "کەشوهەوا" },
  { sorani: "باران", kurmanji: "baran", category: "کەشوهەوا" },
  { sorani: "بەفر", kurmanji: "berf", category: "کەشوهەوا" },
  { sorani: "خۆر", kurmanji: "roj", category: "کەشوهەوا" },
  { sorani: "هەور", kurmanji: "ewr", category: "کەشوهەوا" },
  { sorani: "با", kurmanji: "ba", category: "کەشوهەوا" },
  { sorani: "گەرم", kurmanji: "germ", category: "کەشوهەوا" },
  { sorani: "سارد", kurmanji: "sar", category: "کەشوهەوا" },
  { sorani: "سوک", kurmanji: "sil", category: "کەشوهەوا" },
  { sorani: "تاریک", kurmanji: "tarî", category: "کەشوهەوا" },
  { sorani: "ڕووناک", kurmanji: "ronak", category: "کەشوهەوا" },
  { sorani: "بروسک", kurmanji: "birûsk", category: "کەشوهەوا" },
  
  // Clothing - جل و بەرگ
  { sorani: "جل", kurmanji: "cil", category: "جل و بەرگ" },
  { sorani: "کراس", kurmanji: "kiras", category: "جل و بەرگ" },
  { sorani: "پانتاڵۆن", kurmanji: "pantol", category: "جل و بەرگ" },
  { sorani: "پێڵاو", kurmanji: "pêlav", category: "جل و بەرگ" },
  { sorani: "کەڵەشە", kurmanji: "koleş", category: "جل و بەرگ" },
  { sorani: "کۆت", kurmanji: "kot", category: "جل و بەرگ" },
  { sorani: "فستان", kurmanji: "fustan", category: "جل و بەرگ" },
  { sorani: "گیان", kurmanji: "girêdan", category: "جل و بەرگ" },
  { sorani: "پشتک", kurmanji: "piştik", category: "جل و بەرگ" },
  { sorani: "شاپۆ", kurmanji: "şapik", category: "جل و بەرگ" },
  
  // Transportation - گواستنەوە
  { sorani: "ئۆتۆمبێل", kurmanji: "otomobîl", category: "گواستنەوە" },
  { sorani: "پاسکل", kurmanji: "bisiklet", category: "گواستنەوە" },
  { sorani: "فڕۆکە", kurmanji: "balafir", category: "گواستنەوە" },
  { sorani: "کەشتی", kurmanji: "keştî", category: "گواستنەوە" },
  { sorani: "شەمەندەفەر", kurmanji: "şemendefer", category: "گواستنەوە" },
  { sorani: "پاص", kurmanji: "otobûs", category: "گواستنەوە" },
  { sorani: "تاکسی", kurmanji: "taksî", category: "گواستنەوە" },
  { sorani: "تریلەر", kurmanji: "kamyon", category: "گواستنەوە" },
  { sorani: "مۆتۆر", kurmanji: "motor", category: "گواستنەوە" },
  
  // Emotions - هەست
  { sorani: "خۆشەویستی", kurmanji: "evîn", category: "هەست" },
  { sorani: "دڵخۆشی", kurmanji: "kêf", category: "هەست" },
  { sorani: "خەمۆکی", kurmanji: "xemgînî", category: "هەست" },
  { sorani: "ترس", kurmanji: "tirs", category: "هەست" },
  { sorani: "توڕەیی", kurmanji: "hêrs", category: "هەست" },
  { sorani: "ئومێد", kurmanji: "hêvî", category: "هەست" },
  { sorani: "نائومێدی", kurmanji: "bêhêvî", category: "هەست" },
  { sorani: "سەرسوڕمان", kurmanji: "ecêb", category: "هەست" },
  { sorani: "ئارامی", kurmanji: "aramî", category: "هەست" },
  { sorani: "شانازی", kurmanji: "şanazî", category: "هەست" },
  
  // Business - بازرگانی
  { sorani: "بازرگانی", kurmanji: "bazirganî", category: "بازرگانی" },
  { sorani: "کارمەند", kurmanji: "karker", category: "بازرگانی" },
  { sorani: "کارخانە", kurmanji: "fabrika", category: "بازرگانی" },
  { sorani: "فرۆشگا", kurmanji: "firotgeه", category: "بازرگانی" },
  { sorani: "پارە", kurmanji: "pere", category: "بازرگانی" },
  { sorani: "نرخ", kurmanji: "nirx", category: "بازرگانی" },
  { sorani: "فرۆشتن", kurmanji: "firotin", category: "بازرگانی" },
  { sorani: "کڕین", kurmanji: "kirîn", category: "بازرگانی" },
  { sorani: "قازانج", kurmanji: "qezenc", category: "بازرگانی" },
  { sorani: "زیان", kurmanji: "ziyan", category: "بازرگانی" },
  
  // Sports - وەرزش
  { sorani: "وەرزش", kurmanji: "werziş", category: "وەرزش" },
  { sorani: "تۆپی پێ", kurmanji: "futbol", category: "وەرزش" },
  { sorani: "باسکتبۆڵ", kurmanji: "basketbol", category: "وەرزش" },
  { sorani: "تێنس", kurmanji: "tenîs", category: "وەرزش" },
  { sorani: "ئاوڕکردن", kurmanji: "avjenî", category: "وەرزش" },
  { sorani: "ڕاکردن", kurmanji: "bezandin", category: "وەرزش" },
  { sorani: "یاری", kurmanji: "lîstik", category: "وەرزش" },
  { sorani: "پاڵەوان", kurmanji: "qahreman", category: "وەرزش" },
  { sorani: "یاریگا", kurmanji: "stadium", category: "وەرزش" },
  
  // Health - تەندروستی
  { sorani: "تەندروستی", kurmanji: "tendirustî", category: "تەندروستی" },
  { sorani: "نەخۆش", kurmanji: "nexweş", category: "تەندروستی" },
  { sorani: "دەرمان", kurmanji: "derman", category: "تەندروستی" },
  { sorani: "پزیشک", kurmanji: "doktor", category: "تەندروستی" },
  { sorani: "نەخۆشخانە", kurmanji: "nexweşxane", category: "تەندروستی" },
  { sorani: "ئازار", kurmanji: "azar", category: "تەندروستی" },
  { sorani: "درد", kurmanji: "êş", category: "تەندروستی" },
  { sorani: "چاکبوونەوە", kurmanji: "çakbûn", category: "تەندروستی" },
  { sorani: "ڕقەزی", kurmanji: "şişbûn", category: "تەندروستی" },
  { sorani: "برین", kurmanji: "birîn", category: "تەندروستی" },
  
  // Nature - سروشت
  { sorani: "سروشت", kurmanji: "xwezayî", category: "سروشت" },
  { sorani: "گوڵ", kurmanji: "gul", category: "سروشت" },
  { sorani: "درەخت", kurmanji: "dar", category: "سروشت" },
  { sorani: "برگ", kurmanji: "pelg", category: "سروشت" },
  { sorani: "ڕووەک", kurmanji: "riwek", category: "سروشت" },
  { sorani: "گیا", kurmanji: "giya", category: "سروشت" },
  { sorani: "ئاو", kurmanji: "av", category: "سروشت" },
  { sorani: "ئاگر", kurmanji: "agir", category: "سروشت" },
  { sorani: "بەرد", kurmanji: "ber", category: "سروشت" },
  { sorani: "خۆڵ", kurmanji: "ax", category: "سروشت" },
  { sorani: "دەریا", kurmanji: "beher", category: "سروشت" },
  { sorani: "گۆل", kurmanji: "gol", category: "سروشت" },
  
  // Music - مۆسیقا
  { sorani: "مۆسیقا", kurmanji: "mûzîk", category: "مۆسیقا" },
  { sorani: "گۆرانی", kurmanji: "stran", category: "مۆسیقا" },
  { sorani: "گۆرانیبێژ", kurmanji: "stranbêj", category: "مۆسیقا" },
  { sorani: "ساز", kurmanji: "amûr", category: "مۆسیقا" },
  { sorani: "دەف", kurmanji: "def", category: "مۆسیقا" },
  { sorani: "زرنا", kurmanji: "zirne", category: "مۆسیقا" },
  { sorani: "دوودڵ", kurmanji: "bilûr", category: "مۆسیقا" },
  { sorani: "سەما", kurmanji: "govend", category: "مۆسیقا" },
  { sorani: "هەڵپەڕکێ", kurmanji: "halparke", category: "مۆسیقا" },
  
  // Kitchen - چێشتخانە
  { sorani: "چێشتخانە", kurmanji: "metbex", category: "چێشتخانە" },
  { sorani: "مێز", kurmanji: "miز", category: "چێشتخانە" },
  { sorani: "کورسی", kurmanji: "kursî", category: "چێشتخانە" },
  { sorani: "قاپ", kurmanji: "qab", category: "چێشتخانە" },
  { sorani: "چنگاڵ", kurmanji: "çingal", category: "چێشتخانە" },
  { sorani: "کێشک", kurmanji: "kevçî", category: "چێشتخانە" },
  { sorani: "چاقو", kurmanji: "kêr", category: "چێشتخانە" },
  { sorani: "تاس", kurmanji: "tas", category: "چێشتخانە" },
  { sorani: "گڵاس", kurmanji: "glas", category: "چێشتخانە" },
  { sorani: "جانتا", kurmanji: "çanta", category: "چێشتخانە" },
  
  // Work - کار
  { sorani: "کار", kurmanji: "kar", category: "کار" },
  { sorani: "نووسەر", kurmanji: "nivîskar", category: "کار" },
  { sorani: "وەکیل", kurmanji: "parêzer", category: "کار" },
  { sorani: "پزیشک", kurmanji: "doktor", category: "کار" },
  { sorani: "ئەندازیار", kurmanji: "endezyar", category: "کار" },
  { sorani: "فەرمانبەر", kurmanji: "fermander", category: "کار" },
  { sorani: "جوتیار", kurmanji: "cotyar", category: "کار" },
  { sorani: "شوان", kurmanji: "şivan", category: "کار" },
  { sorani: "درووگەر", kurmanji: "derzî", category: "کار" },
  { sorani: "ئاسنگەر", kurmanji: "asnger", category: "کار" },
  { sorani: "نەجار", kurmanji: "necar", category: "کار" },
  { sorani: "بنا", kurmanji: "bena", category: "کار" },
  
  // Geography - جوگرافیا
  { sorani: "جوگرافیا", kurmanji: "erdnîgarî", category: "جوگرافیا" },
  { sorani: "وڵات", kurmanji: "welat", category: "جوگرافیا" },
  { sorani: "نیشتمان", kurmanji: "niştiman", category: "جوگرافیا" },
  { sorani: "سنوور", kurmanji: "sînor", category: "جوگرافیا" },
  { sorani: "پایتەخت", kurmanji: "paytext", category: "جوگرافیا" },
  { sorani: "شارستان", kurmanji: "parêzge", category: "جوگرافیا" },
  { sorani: "دەشت", kurmanji: "deşt", category: "جوگرافیا" },
  { sorani: "کێوی", kurmanji: "girî", category: "جوگرافیا" },
  { sorani: "دۆڵ", kurmanji: "dol", category: "جوگرافیا" },
  { sorani: "کانیاو", kurmanji: "kanîya", category: "جوگرافیا" },
  
  // Religion - ئایین
  { sorani: "ئایین", kurmanji: "ol", category: "ئایین" },
  { sorani: "خودا", kurmanji: "Xwedê", category: "ئایین" },
  { sorani: "نوێژ", kurmanji: "nimêj", category: "ئایین" },
  { sorani: "مزگەوت", kurmanji: "mizgeft", category: "ئایین" },
  { sorani: "قورئان", kurmanji: "Quran", category: "ئایین" },
  { sorani: "ڕۆژوو", kurmanji: "rojî", category: "ئایین" },
  { sorani: "حەج", kurmanji: "hec", category: "ئایین" },
  { sorani: "زەکات", kurmanji: "zekat", category: "ئایین" },
  { sorani: "شەهادە", kurmanji: "şehadet", category: "ئایین" },
  { sorani: "دوعا", kurmanji: "dua", category: "ئایین" },
  
  // Advanced Verbs - کردارە پێشکەوتووەکان
  { sorani: "پێکردن", kurmanji: "pê kirin", category: "کردارە پێشکەوتووەکان" },
  { sorani: "تێگەیشتن", kurmanji: "fêm kirin", category: "کردارە پێشکەوتووەکان" },
  { sorani: "فێربوون", kurmanji: "hîn bûn", category: "کردارە پێشکەوتووەکان" },
  { sorani: "فێرکردن", kurmanji: "hîn kirin", category: "کردارە پێشکەوتووەکان" },
  { sorani: "بیرکردنەوە", kurmanji: "bîr kirin", category: "کردارە پێشکەوتووەکان" },
  { sorani: "بڕیاردان", kurmanji: "biryar dan", category: "کردارە پێشکەوتووەکان" },
  { sorani: "پلاندانان", kurmanji: "plan danîn", category: "کردارە پێشکەوتووەکان" },
  { sorani: "ئامادەکردن", kurmanji: "amade kirin", category: "کردارە پێشکەوتووەکان" },
  { sorani: "پشکنین", kurmanji: "kontrolkirin", category: "کردارە پێشکەوتووەکان" },
  { sorani: "ڕێکخستن", kurmanji: "rêk xistin", category: "کردارە پێشکەوتووەکان" },
  
  // Complex Phrases - دەربڕینە ئاڵۆزەکان
  { sorani: "چ خەبەر؟", kurmanji: "çi nû ye?", category: "دەربڕین", notes: "What's new?" },
  { sorani: "کوا دەچی؟", kurmanji: "ku diçî?", category: "دەربڕین", notes: "Where are you going?" },
  { sorani: "چی دەکەی؟", kurmanji: "çi dikî?", category: "دەربڕین", notes: "What are you doing?" },
  { sorani: "کەی دێیتەوە؟", kurmanji: "kengî tê?", category: "دەربڕین", notes: "When will you come?" },
  { sorani: "بۆچی؟", kurmanji: "çima?", category: "دەربڕین", notes: "Why?" },
  { sorani: "چەند؟", kurmanji: "çend?", category: "دەربڕین", notes: "How much?" },
  { sorani: "لە کوێوە؟", kurmanji: "ji ku ve?", category: "دەربڕین", notes: "From where?" },
  { sorani: "بۆ کوێ؟", kurmanji: "bo ku?", category: "دەربڕین", notes: "To where?" },
  { sorani: "لەگەڵ کێ؟", kurmanji: "ligel kê?", category: "دەربڕین", notes: "With whom?" },
  { sorani: "بە چی؟", kurmanji: "bi çî?", category: "دەربڕین", notes: "With what?" }
];

const KurdishDialectTranslator: React.FC = () => {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceDialect, setSourceDialect] = useState<'sorani' | 'kurmanji'>('sorani');
  const [targetDialect, setTargetDialect] = useState<'kurmanji' | 'sorani'>('kurmanji');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Get unique categories
  const categories = [...new Set(dialectDictionary.map(item => item.category))];
  
  // Filter dictionary based on category and search
  const filteredDictionary = dialectDictionary.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const searchMatch = searchTerm === '' || 
      item.sorani.includes(searchTerm) || 
      item.kurmanji.includes(searchTerm) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return categoryMatch && searchMatch;
  });

  // Enhanced translation logic with AI fallback
  const translateText = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to translate');
      return;
    }

    setIsTranslating(true);
    let text = inputText.trim();
    let translatedText = text;
    let matchesFound = 0;

    // Create a map for faster lookup
    const translationMap = new Map<string, string>();
    dialectDictionary.forEach(item => {
      if (sourceDialect === 'sorani') {
        translationMap.set(item.sorani, item.kurmanji);
        // Also add without diacritics for better matching
        translationMap.set(item.sorani.replace(/[َُِّْ]/g, ''), item.kurmanji);
      } else {
        translationMap.set(item.kurmanji, item.sorani);
        translationMap.set(item.kurmanji.replace(/[َُِّْ]/g, ''), item.sorani);
      }
    });

    // Sort by length (longest first) to handle phrases before individual words
    const sortedKeys = Array.from(translationMap.keys()).sort((a, b) => b.length - a.length);

    // Replace each word/phrase
    sortedKeys.forEach(originalWord => {
      const translation = translationMap.get(originalWord);
      if (translation) {
        // Create regex that matches the word with word boundaries
        // Handle Kurdish text properly
        const escapedWord = originalWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedWord}\\b|(?<=[\\s،؛۔]|^)${escapedWord}(?=[\\s،؛۔]|$)`, 'gi');
        
        const beforeReplace = translatedText;
        translatedText = translatedText.replace(regex, translation);
        
        if (beforeReplace !== translatedText) {
          matchesFound++;
        }
      }
    });

    // If no dictionary matches found, try AI translation
    if (matchesFound === 0) {
      toast.info('Using AI translation...');
      try {
        const aiPrompt = `Translate this text from ${sourceDialect === 'sorani' ? 'Kurdish Sorani' : 'Kurdish Kurmanji'} to ${targetDialect === 'sorani' ? 'Kurdish Sorani' : 'Kurdish Kurmanji'}. 

Text to translate: "${text}"

Guidelines:
- Provide only the translation without explanations
- Maintain the original meaning and context
- Use proper Kurdish ${targetDialect} dialect conventions
- Keep proper nouns as they are
- Preserve punctuation and formatting

Translation:`;

        const aiTranslation = await geminiService.translateText(aiPrompt);
        if (aiTranslation && aiTranslation.trim() !== text) {
          setTranslatedText(aiTranslation.trim());
          toast.success(`AI translated from ${sourceDialect} to ${targetDialect}`);
        } else {
          setTranslatedText(`[AI translation unavailable] ${text}`);
          toast.warning('AI translation failed. Try adding more words to the dictionary.');
        }
      } catch (error) {
        console.error('AI translation error:', error);
        setTranslatedText(`[لە فەرهەنگدا نەدۆزرایەوە] ${text}`);
        toast.error('AI translation failed. Check your connection.');
      }
    } else {
      setTranslatedText(translatedText);
      toast.success(`Dictionary translated ${matchesFound} word${matchesFound > 1 ? 's' : ''} from ${sourceDialect} to ${targetDialect}`);
    }
    
    setIsTranslating(false);
  };

  // Swap dialects
  const swapDialects = () => {
    setSourceDialect(targetDialect);
    setTargetDialect(sourceDialect);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const clearAll = () => {
    setInputText('');
    setTranslatedText('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-100 p-4" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
            <Globe className="text-purple-600" />
            {t('kurdishDialectTranslator')}
          </h1>
          <p className="text-gray-700">
            {t('translateBetweenSoraniKurmanji')}
          </p>
          <div className="flex justify-center gap-4 text-sm text-gray-600">
            <span>فەرهەنگ: {dialectDictionary.length} وشە</span>
            <span>پۆلەکان: {categories.length}</span>
          </div>
        </div>

        <Tabs defaultValue="translator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="translator">
              <ArrowRightLeft className="w-4 h-4 ml-2" />
              وەرگێڕ (Translator)
            </TabsTrigger>
            <TabsTrigger value="dictionary">
              <BookOpen className="w-4 h-4 ml-2" />
              فەرهەنگ (Dictionary)
            </TabsTrigger>
          </TabsList>

          {/* Translator Tab */}
          <TabsContent value="translator">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <Card className="bg-purple-200/70 backdrop-blur border-purple-300">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-sm">
                        {sourceDialect === 'sorani' ? 'سۆرانی (Sorani)' : 'کورمانجی (Kurmanji)'}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={swapDialects}
                      className="flex items-center gap-2"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      گۆڕین
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={sourceDialect === 'sorani' ? 'دەقی سۆرانی لێرە بنووسە...' : 'دەقی کورمانجی لێرە بنووسە...'}
                    className="min-h-[200px] text-right text-lg bg-purple-100/80 border-purple-300 text-black placeholder:text-gray-600"
                    dir="rtl"
                  />
                  <div className="flex gap-2">
                    <Button onClick={translateText} disabled={isTranslating} className="flex-1">
                      {isTranslating ? 'وەرگێڕان لە کاردایە...' : 'وەرگێڕان'}
                    </Button>
                    <Button variant="outline" onClick={clearAll}>
                      پاککردنەوە
                    </Button>
                  </div>
                  
                  {/* Example sentences */}
                  <div className="mt-4 p-3 bg-purple-300/60 border border-purple-400 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2 text-gray-800">نموونە:</h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      {sourceDialect === 'sorani' ? (
                        <>
                          <p>• "من خوێندکارم" → "ez xwendekar im"</p>
                          <p>• "تۆ چۆنی؟" → "tu çawa yî?"</p>
                          <p>• "ئەو هاتووە" → "ew hatiye"</p>
                        </>
                      ) : (
                        <>
                          <p>• "ez xwendekar im" → "من خوێندکارم"</p>
                          <p>• "tu çawa yî?" → "تۆ چۆنی؟"</p>
                          <p>• "ew hatiye" → "ئەو هاتووە"</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Quick phrases */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-sm mb-2 text-gray-800">دەربڕینە خێراکان:</h4>
                    <div className="flex flex-wrap gap-2">
                      {(sourceDialect === 'sorani' ? 
                        ['سڵاو', 'چۆنی؟', 'زۆر سوپاس', 'ببوورە', 'بەخێربێی'] :
                        ['silav', 'çawa yî?', 'gelek spas', 'bibore', 'bi xêr be']
                      ).map((phrase, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setInputText(phrase)}
                          className="text-xs"
                        >
                          {phrase}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Output Section */}
              <Card className="bg-purple-200/70 backdrop-blur border-purple-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                      {targetDialect === 'kurmanji' ? 'کورمانجی (Kurmanji)' : 'سۆرانی (Sorani)'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={translatedText}
                    readOnly
                    placeholder="وەرگێڕانەکە لێرە دەردەکەوێت..."
                    className="min-h-[200px] text-right text-lg bg-indigo-100/80 border-purple-300 text-black placeholder:text-gray-600"
                    dir="rtl"
                  />
                  {translatedText && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(translatedText)}
                        className="flex items-center gap-2"
                      >
                        کۆپی کردن
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Dictionary Tab */}
          <TabsContent value="dictionary">
            <Card className="bg-purple-200/70 backdrop-blur border-purple-300">
              <CardHeader>
                <CardTitle className="text-gray-800">فەرهەنگی شێوەزار (Dialect Dictionary)</CardTitle>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="گەڕان لە فەرهەنگ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-purple-300 rounded-md text-right bg-purple-100/70 text-black placeholder:text-gray-600"
                      dir="rtl"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-purple-300 rounded-md bg-purple-100/70 text-black"
                  >
                    <option value="all">هەموو پۆلەکان</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDictionary.map((item, index) => (
                    <div key={index} className="border border-purple-300 bg-purple-100/70 rounded-lg p-4 hover:shadow-md hover:bg-purple-200/80 transition-all duration-200">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="text-right">
                            <span className="font-semibold text-purple-600">سۆرانی: </span>
                            <span className="text-lg text-gray-800">{item.sorani}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-indigo-600">کورمانجی: </span>
                            <span className="text-lg text-gray-800">{item.kurmanji}</span>
                          </div>
                          {item.notes && (
                            <div className="text-sm text-gray-600 mt-2">
                              {item.notes}
                            </div>
                          )}
                          <div className="mt-2 flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setInputText(item.sorani)}
                              className="text-xs h-6 px-2"
                            >
                              سۆرانی
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setInputText(item.kurmanji)}
                              className="text-xs h-6 px-2"
                            >
                              کورمانجی
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredDictionary.length === 0 && (
                  <div className="text-center py-8 text-gray-600">
                    هیچ ئەنجامێک نەدۆزرایەوە
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default KurdishDialectTranslator;
