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
  code?: string;
  notes?: string;
}

// Comprehensive dialect dictionary with 4-digit codes
const dialectDictionary: DialectComparison[] = [
  // Category 1: Pronouns - جێناو (1000-1099)
  { sorani: "من", kurmanji: "ez", category: "جێناو", code: "1001" },
  { sorani: "تۆ", kurmanji: "tu", category: "جێناو", code: "1002" },
  { sorani: "ئەو", kurmanji: "ew", category: "جێناو", code: "1003" },
  { sorani: "ئێمە", kurmanji: "em", category: "جێناو", code: "1004" },
  { sorani: "ئێوە", kurmanji: "hûn", category: "جێناو", code: "1005" },
  { sorani: "ئەوان", kurmanji: "wan", category: "جێناو", code: "1006" },
  { sorani: "خۆم", kurmanji: "xwe", category: "جێناو", code: "1007" },
  { sorani: "خۆت", kurmanji: "xwe", category: "جێناو", code: "1008" },
  { sorani: "ئەم", kurmanji: "ev", category: "جێناو", code: "1009" },
  { sorani: "ئەو", kurmanji: "wî", category: "جێناو", code: "1010" },
  { sorani: "کێ", kurmanji: "kî", category: "جێناو", code: "1011" },
  { sorani: "چی", kurmanji: "çi", category: "جێناو", code: "1012" },
  { sorani: "کام", kurmanji: "kîjan", category: "جێناو", code: "1013" },
  
  // Category 2: Verbs - کردار (2000-2999)
  // Basic Movement Verbs (2000-2099)
  { sorani: "هاتن", kurmanji: "hatin", category: "کردار", code: "2001" },
  { sorani: "چوون", kurmanji: "çûn", category: "کردار", code: "2002" },
  { sorani: "ڕۆیشتن", kurmanji: "şûn", category: "کردار", code: "2003" },
  { sorani: "گەڕانەوە", kurmanji: "vegerîn", category: "کردار", code: "2004" },
  { sorani: "پەڕین", kurmanji: "peřîn", category: "کردار", code: "2005" },
  { sorani: "فڕین", kurmanji: "firîn", category: "کردار", code: "2006" },
  { sorani: "وەستان", kurmanji: "rawestan", category: "کردار", code: "2007" },
  { sorani: "ڕاکشان", kurmanji: "rakirîn", category: "کردار", code: "2008" },

  // Daily Actions (2100-2199)
  { sorani: "کردن", kurmanji: "kirin", category: "کردار", code: "2101" },
  { sorani: "وتن", kurmanji: "gotin", category: "کردار", code: "2102" },
  { sorani: "خواردن", kurmanji: "xwarin", category: "کردار", code: "2103" },
  { sorani: "خواردنەوە", kurmanji: "vexwarin", category: "کردار", code: "2104" },
  { sorani: "خەوتن", kurmanji: "razan", category: "کردار", code: "2105" },
  { sorani: "ژیان", kurmanji: "jiyan", category: "کردار", code: "2106" },
  { sorani: "مردن", kurmanji: "mirin", category: "کردار", code: "2107" },
  { sorani: "دیتن", kurmanji: "dîtin", category: "کردار", code: "2108" },
  { sorani: "بیستن", kurmanji: "bihîstin", category: "کردار", code: "2109" },
  { sorani: "نووسین", kurmanji: "nivîsandin", category: "کردار", code: "2110" },
  { sorani: "خوێندن", kurmanji: "xwendin", category: "کردار", code: "2111" },
  { sorani: "گەڕان", kurmanji: "gerandin", category: "کردار", code: "2112" },
  { sorani: "کارکردن", kurmanji: "kar kirin", category: "کردار", code: "2113" },
  { sorani: "هەڵگرتن", kurmanji: "hilgirtin", category: "کردار", code: "2114" },
  { sorani: "داندانان", kurmanji: "danîn", category: "کردار", code: "2115" },
  { sorani: "داخستن", kurmanji: "girtîn", category: "کردار", code: "2116" },
  { sorani: "کردنەوە", kurmanji: "vekirîn", category: "کردار", code: "2117" },
  { sorani: "شۆردن", kurmanji: "şûştin", category: "کردار", code: "2118" },
  { sorani: "پاککردنەوە", kurmanji: "paqij kirin", category: "کردار", code: "2119" },

  // Thinking/Learning Verbs (2200-2299)
  { sorani: "بیرکردنەوە", kurmanji: "bîr kirin", category: "کردار", code: "2201" },
  { sorani: "فکرکردن", kurmanji: "fikir kirin", category: "کردار", code: "2202" },
  { sorani: "فێربوون", kurmanji: "hînbûn", category: "کردار", code: "2203" },
  { sorani: "فێرکردن", kurmanji: "hînkirin", category: "کردار", code: "2204" },
  { sorani: "تێگەیشتن", kurmanji: "têgihiştin", category: "کردار", code: "2205" },
  { sorani: "پرسیار کردن", kurmanji: "pirs kirin", category: "کردار", code: "2206" },
  { sorani: "وەڵامدانەوە", kurmanji: "bersiv dan", category: "کردار", code: "2207" },
  { sorani: "لێکۆڵینەوە", kurmanji: "lêkolîn", category: "کردار", code: "2208" },

  // Emotional Verbs (2300-2399)
  { sorani: "خۆشەویستن", kurmanji: "evîn", category: "کردار", code: "2301" },
  { sorani: "ڕقبوون", kurmanji: "nefret kirin", category: "کردار", code: "2302" },
  { sorani: "خۆشحاڵبوون", kurmanji: "kêfxweş bûn", category: "کردار", code: "2303" },
  { sorani: "خەمباربوون", kurmanji: "xemgîn bûn", category: "کردار", code: "2304" },
  { sorani: "ترسان", kurmanji: "tirsîn", category: "کردار", code: "2305" },
  { sorani: "دڵخۆشی", kurmanji: "şahî", category: "کردار", code: "2306" },
  { sorani: "داندانان", kurmanji: "danîn", category: "کردار" },
  
  // Time expressions - کات (3000-3999)
  // Basic Time Units (3001-3099)
  { sorani: "ئێستا", kurmanji: "niha", category: "کات", code: "3001" },
  { sorani: "دوێنێ", kurmanji: "duh", category: "کات", code: "3002" },
  { sorani: "سبەی", kurmanji: "sibê", category: "کات", code: "3003" },
  { sorani: "پارێزەر", kurmanji: "paşê", category: "کات", code: "3004" },
  { sorani: "پێشتر", kurmanji: "berê", category: "کات", code: "3005" },
  { sorani: "ڕۆژ", kurmanji: "roj", category: "کات", code: "3006" },
  { sorani: "شەو", kurmanji: "şev", category: "کات", code: "3007" },
  { sorani: "حەفتە", kurmanji: "hefte", category: "کات", code: "3008" },
  { sorani: "مانگ", kurmanji: "meh", category: "کات", code: "3009" },
  { sorani: "ساڵ", kurmanji: "sal", category: "کات", code: "3010" },
  { sorani: "سەدە", kurmanji: "sede", category: "کات", code: "3011" },
  { sorani: "هەزارساڵ", kurmanji: "hezarsal", category: "کات", code: "3012" },
  
  // Time Periods (3101-3199)
  { sorani: "بەیانی", kurmanji: "beyan", category: "کات", code: "3101" },
  { sorani: "نیوەڕۆ", kurmanji: "nîvroj", category: "کات", code: "3102" },
  { sorani: "ئێوارە", kurmanji: "êvar", category: "کات", code: "3103" },
  { sorani: "نیوەشەو", kurmanji: "nîvşev", category: "کات", code: "3104" },
  { sorani: "بەرەبەیان", kurmanji: "berebeyan", category: "کات", code: "3105" },
  { sorani: "ئێوارانی", kurmanji: "êvarî", category: "کات", code: "3106" },
  { sorani: "شەوانی", kurmanji: "şevanî", category: "کات", code: "3107" },
  
  // Time Measurements (3201-3299)
  { sorani: "کاتژمێر", kurmanji: "demjimêr", category: "کات", code: "3201" },
  { sorani: "خولەک", kurmanji: "xulek", category: "کات", code: "3202" },
  { sorani: "چرکە", kurmanji: "çirke", category: "کات", code: "3203" },
  { sorani: "چەند چرکەیەک", kurmanji: "çend çirkeyek", category: "کات", code: "3204" },
  { sorani: "ماوە", kurmanji: "dem", category: "کات", code: "3205" },
  { sorani: "کات", kurmanji: "wext", category: "کات", code: "3206" },
  
  // Days of Week (3301-3399)
  { sorani: "یەکشەممە", kurmanji: "yekşem", category: "کات", code: "3301" },
  { sorani: "دووشەممە", kurmanji: "duşem", category: "کات", code: "3302" },
  { sorani: "سێشەممە", kurmanji: "sêşem", category: "کات", code: "3303" },
  { sorani: "چوارشەممە", kurmanji: "çarşem", category: "کات", code: "3304" },
  { sorani: "پێنجشەممە", kurmanji: "pêncşem", category: "کات", code: "3305" },
  { sorani: "هەینی", kurmanji: "înî", category: "کات", code: "3306" },
  { sorani: "شەممە", kurmanji: "şemî", category: "کات", code: "3307" },
  
  // Seasons (3401-3499)
  { sorani: "بەهار", kurmanji: "bihar", category: "کات", code: "3401" },
  { sorani: "هاوین", kurmanji: "havîn", category: "کات", code: "3402" },
  { sorani: "پاییز", kurmanji: "payîz", category: "کات", code: "3403" },
  { sorani: "زستان", kurmanji: "zivistan", category: "کات", code: "3404" },
  
  // Family - خێزان (4000-4999)
  // Parents & Core Family (4001-4099)
  { sorani: "باوک", kurmanji: "bav", category: "خێزان", code: "4001" },
  { sorani: "دایک", kurmanji: "dayik", category: "خێزان", code: "4002" },
  { sorani: "دایبابان", kurmanji: "dêubav", category: "خێزان", code: "4003" },
  { sorani: "مێرد", kurmanji: "mêr", category: "خێزان", code: "4004" },
  { sorani: "ژن", kurmanji: "jin", category: "خێزان", code: "4005" },
  { sorani: "هاوسەر", kurmanji: "hevser", category: "خێزان", code: "4006" },
  { sorani: "ڕەفیق", kurmanji: "heval", category: "خێزان", code: "4007" },
  
  // Children (4101-4199)
  { sorani: "کوڕ", kurmanji: "kur", category: "خێزان", code: "4101" },
  { sorani: "کچ", kurmanji: "keç", category: "خێزان", code: "4102" },
  { sorani: "منداڵ", kurmanji: "zarok", category: "خێزان", code: "4103" },
  { sorani: "منێ", kurmanji: "zarokê", category: "خێزان", code: "4104" },
  { sorani: "لاو", kurmanji: "lawik", category: "خێزان", code: "4105" },
  { sorani: "کچان", kurmanji: "keça", category: "خێزان", code: "4106" },
  
  // Siblings (4201-4299)
  { sorani: "برا", kurmanji: "bira", category: "خێزان", code: "4201" },
  { sorani: "خوشک", kurmanji: "xweh", category: "خێزان", code: "4202" },
  { sorani: "براو خوشک", kurmanji: "bira û xweh", category: "خێزان", code: "4203" },
  { sorani: "برای گەورە", kurmanji: "birayê mezin", category: "خێزان", code: "4204" },
  { sorani: "برای بچووک", kurmanji: "birayê biçûk", category: "خێزان", code: "4205" },
  { sorani: "خوشکی گەورە", kurmanji: "xweha mezin", category: "خێزان", code: "4206" },
  { sorani: "خوشکی بچووک", kurmanji: "xweha biçûk", category: "خێزان", code: "4207" },
  
  // Grandparents (4301-4399)
  { sorani: "باپیر", kurmanji: "bavpîr", category: "خێزان", code: "4301" },
  { sorani: "دایپیر", kurmanji: "daypîr", category: "خێزان", code: "4302" },
  { sorani: "دایک و باوکی گەورە", kurmanji: "dê û bavê mezin", category: "خێزان", code: "4303" },
  
  // Uncles & Aunts (4401-4499)
  { sorani: "مام", kurmanji: "mam", category: "خێزان", code: "4401" },
  { sorani: "پورە", kurmanji: "pûr", category: "خێزان", code: "4402" },
  { sorani: "خالو", kurmanji: "xal", category: "خێزان", code: "4403" },
  { sorani: "خاتوو", kurmanji: "xatû", category: "خێزان", code: "4404" },
  { sorani: "ژنی مام", kurmanji: "jina mam", category: "خێزان", code: "4405" },
  { sorani: "ژنی خالو", kurmanji: "jina xal", category: "خێزان", code: "4406" },
  
  // Extended Family (4501-4599)
  { sorani: "کوڕی برا", kurmanji: "kurê bira", category: "خێزان", code: "4501" },
  { sorani: "کچی برا", kurmanji: "keça bira", category: "خێزان", code: "4502" },
  { sorani: "کوڕی خوشک", kurmanji: "kurê xweh", category: "خێزان", code: "4503" },
  { sorani: "کچی خوشک", kurmanji: "keça xweh", category: "خێزان", code: "4504" },
  { sorani: "نەوە", kurmanji: "nevî", category: "خێزان", code: "4505" },
  { sorani: "نەوەکان", kurmanji: "nevîyan", category: "خێزان", code: "4506" },
  
  // Numbers - ژمارە (5000-5999)
  // Basic Numbers 1-10 (5001-5099)
  { sorani: "یەک", kurmanji: "yek", category: "ژمارە", code: "5001" },
  { sorani: "دوو", kurmanji: "du", category: "ژمارە", code: "5002" },
  { sorani: "سێ", kurmanji: "sê", category: "ژمارە", code: "5003" },
  { sorani: "چوار", kurmanji: "çar", category: "ژمارە", code: "5004" },
  { sorani: "پێنج", kurmanji: "pênc", category: "ژمارە", code: "5005" },
  { sorani: "شەش", kurmanji: "şeş", category: "ژمارە", code: "5006" },
  { sorani: "حەوت", kurmanji: "heft", category: "ژمارە", code: "5007" },
  { sorani: "هەشت", kurmanji: "heşt", category: "ژمارە", code: "5008" },
  { sorani: "نۆ", kurmanji: "neh", category: "ژمارە", code: "5009" },
  { sorani: "دە", kurmanji: "deh", category: "ژمارە", code: "5010" },
  
  // Numbers 11-20 (5101-5199)
  { sorani: "یازدە", kurmanji: "yazde", category: "ژمارە", code: "5101" },
  { sorani: "دوازدە", kurmanji: "dûwazde", category: "ژمارە", code: "5102" },
  { sorani: "سێزدە", kurmanji: "sêzde", category: "ژمارە", code: "5103" },
  { sorani: "چواردە", kurmanji: "çarde", category: "ژمارە", code: "5104" },
  { sorani: "پازدە", kurmanji: "pazde", category: "ژمارە", code: "5105" },
  { sorani: "شازدە", kurmanji: "şazde", category: "ژمارە", code: "5106" },
  { sorani: "حەڤدە", kurmanji: "hevde", category: "ژمارە", code: "5107" },
  { sorani: "هەژدە", kurmanji: "hejde", category: "ژمارە", code: "5108" },
  { sorani: "نۆزدە", kurmanji: "nozde", category: "ژمارە", code: "5109" },
  { sorani: "بیست", kurmanji: "bîst", category: "ژمارە", code: "5110" },
  
  // Tens (5201-5299)
  { sorani: "سی", kurmanji: "sî", category: "ژمارە", code: "5201" },
  { sorani: "چل", kurmanji: "çil", category: "ژمارە", code: "5202" },
  { sorani: "پەنجا", kurmanji: "pêncî", category: "ژمارە", code: "5203" },
  { sorani: "شەست", kurmanji: "şêst", category: "ژمارە", code: "5204" },
  { sorani: "حەفتا", kurmanji: "heftê", category: "ژمارە", code: "5205" },
  { sorani: "هەشتا", kurmanji: "heştê", category: "ژمارە", code: "5206" },
  { sorani: "نەوەد", kurmanji: "newed", category: "ژمارە", code: "5207" },
  
  // Hundreds & Thousands (5301-5399)
  { sorani: "سەد", kurmanji: "sed", category: "ژمارە", code: "5301" },
  { sorani: "دووسەد", kurmanji: "dused", category: "ژمارە", code: "5302" },
  { sorani: "سێسەد", kurmanji: "sêsed", category: "ژمارە", code: "5303" },
  { sorani: "پێنج سەد", kurmanji: "pênc sed", category: "ژمارە", code: "5304" },
  { sorani: "هەزار", kurmanji: "hezar", category: "ژمارە", code: "5305" },
  { sorani: "دە هەزار", kurmanji: "deh hezar", category: "ژمارە", code: "5306" },
  { sorani: "سەد هەزار", kurmanji: "sed hezar", category: "ژمارə", code: "5307" },
  { sorani: "ملیۆن", kurmanji: "mîlyon", category: "ژمارە", code: "5308" },
  
  // Ordinal Numbers (5401-5499)
  { sorani: "یەکەم", kurmanji: "yekem", category: "ژمارە", code: "5401" },
  { sorani: "دووەم", kurmanji: "duyem", category: "ژمارە", code: "5402" },
  { sorani: "سێیەم", kurmanji: "sêyem", category: "ژمارە", code: "5403" },
  { sorani: "چوارەم", kurmanji: "çarem", category: "ژمارە", code: "5404" },
  { sorani: "پێنجەم", kurmanji: "pêncem", category: "ژمارە", code: "5405" },
  { sorani: "کۆتایی", kurmanji: "dawî", category: "ژمارە", code: "5406" },
  
  // Colors - ڕەنگ (6000-6999)
  // Primary Colors (6001-6099)
  { sorani: "سوور", kurmanji: "sor", category: "ڕەنگ", code: "6001" },
  { sorani: "زەرد", kurmanji: "zer", category: "ڕەنگ", code: "6002" },
  { sorani: "شین", kurmanji: "şîn", category: "ڕەنگ", code: "6003" },
  { sorani: "سپی", kurmanji: "spî", category: "ڕەنگ", code: "6004" },
  { sorani: "ڕەش", kurmanji: "reş", category: "ڕەنگ", code: "6005" },
  { sorani: "سەوز", kurmanji: "kesk", category: "ڕەنگ", code: "6006" },
  
  // Secondary Colors (6101-6199)
  { sorani: "پەمەیی", kurmanji: "pembe", category: "ڕەنگ", code: "6101" },
  { sorani: "مۆر", kurmanji: "mor", category: "ڕەنگ", code: "6102" },
  { sorani: "نارەنجی", kurmanji: "pirteqal", category: "ڕەنگ", code: "6103" },
  { sorani: "قاوەیی", kurmanji: "qehwerî", category: "ڕەنگ", code: "6104" },
  { sorani: "بۆر", kurmanji: "bor", category: "ڕەنگ", code: "6105" },
  { sorani: "خاکی", kurmanji: "xakî", category: "ڕەنگ", code: "6106" },
  { sorani: "زیڤی", kurmanji: "zîvî", category: "ڕەنگ", code: "6107" },
  { sorani: "زێڕینی", kurmanji: "zêrîn", category: "ڕەنگ", code: "6108" },
  
  // Color Shades (6201-6299)
  { sorani: "ڕووناک", kurmanji: "ronak", category: "ڕەنگ", code: "6201" },
  { sorani: "تاریک", kurmanji: "tarî", category: "ڕەنگ", code: "6202" },
  { sorani: "کاڵ", kurmanji: "kal", category: "ڕەنگ", code: "6203" },
  { sorani: "تونژ", kurmanji: "tûj", category: "ڕەنگ", code: "6204" },
  
  // Body parts - ئەندامەکانی لەش (7000-7999)
  // Head & Face (7001-7099)
  { sorani: "سەر", kurmanji: "ser", category: "لەش", code: "7001" },
  { sorani: "سەرئەسک", kurmanji: "serhesk", category: "لەش", code: "7002" },
  { sorani: "ڕوو", kurmanji: "rû", category: "لەش", code: "7003" },
  { sorani: "ناوچەوان", kurmanji: "navçavan", category: "لەش", code: "7004" },
  { sorani: "چاو", kurmanji: "çav", category: "لەش", code: "7005" },
  { sorani: "برۆ", kurmanji: "birû", category: "لەش", code: "7006" },
  { sorani: "قژ", kurmanji: "porî", category: "لەش", code: "7007" },
  { sorani: "گوێ", kurmanji: "guh", category: "لەش", code: "7008" },
  { sorani: "لووت", kurmanji: "lût", category: "لەش", code: "7009" },
  { sorani: "دەم", kurmanji: "dev", category: "لەش", code: "7010" },
  { sorani: "دان", kurmanji: "diran", category: "لەش", code: "7011" },
  { sorani: "زمان", kurmanji: "ziman", category: "لەش", code: "7012" },
  { sorani: "سیل", kurmanji: "sil", category: "لەش", code: "7013" },
  { sorani: "چەناگە", kurmanji: "çenage", category: "لەش", code: "7014" },
  
  // Upper Body (7101-7199)
  { sorani: "ملە", kurmanji: "mil", category: "لەش", code: "7101" },
  { sorani: "شان", kurmanji: "şan", category: "لەش", code: "7102" },
  { sorani: "سنگ", kurmanji: "sing", category: "لەش", code: "7103" },
  { sorani: "پشت", kurmanji: "piştir", category: "لەش", code: "7104" },
  { sorani: "دەست", kurmanji: "dest", category: "لەش", code: "7105" },
  { sorani: "بازوو", kurmanji: "bazû", category: "لەش", code: "7106" },
  { sorani: "ئارەنج", kurmanji: "arinc", category: "لەش", code: "7107" },
  { sorani: "مەچەک", kurmanji: "meçek", category: "لەش", code: "7108" },
  { sorani: "پەنجە", kurmanji: "tilî", category: "لەش", code: "7109" },
  { sorani: "لەپ", kurmanji: "lep", category: "لەش", code: "7110" },
  
  // Lower Body (7201-7299)
  { sorani: "سک", kurmanji: "sk", category: "لەش", code: "7201" },
  { sorani: "قاچ", kurmanji: "ling", category: "لەش", code: "7202" },
  { sorani: "ئەژنۆ", kurmanji: "ejirnok", category: "لەش", code: "7203" },
  { sorani: "پێ", kurmanji: "pê", category: "لەش", code: "7204" },
  { sorani: "پاژنە", kurmanji: "paşne", category: "لەش", code: "7205" },
  { sorani: "پەنجەی پێ", kurmanji: "tiliya pê", category: "لەش", code: "7206" },
  
  // Internal Organs (7301-7399)
  { sorani: "دڵ", kurmanji: "dil", category: "لەش", code: "7301" },
  { sorani: "سیسرچ", kurmanji: "sîserç", category: "لەش", code: "7302" },
  { sorani: "جگەر", kurmanji: "ciger", category: "لەش", code: "7303" },
  { sorani: "گورچیلە", kurmanji: "gurçîle", category: "لەش", code: "7304" },
  { sorani: "مێشک", kurmanji: "mejî", category: "لەش", code: "7305" },
  { sorani: "خوێن", kurmanji: "xwîn", category: "لەش", code: "7306" },
  
  // Places - شوێن (8000-8999)
  // Buildings & Structures (8001-8099)
  { sorani: "ماڵ", kurmanji: "mal", category: "شوێن", code: "8001" },
  { sorani: "خانوو", kurmanji: "xanû", category: "شوێن", code: "8002" },
  { sorani: "بینا", kurmanji: "avahî", category: "شوێن", code: "8003" },
  { sorani: "بەشگە", kurmanji: "berxane", category: "شوێن", code: "8004" },
  { sorani: "کۆشک", kurmanji: "koşk", category: "شوێن", code: "8005" },
  { sorani: "قوللە", kurmanji: "qule", category: "شوێن", code: "8006" },
  { sorani: "گەردوون", kurmanji: "gerdûn", category: "شوێن", code: "8007" },
  { sorani: "پرد", kurmanji: "pird", category: "شوێن", code: "8008" },
  { sorani: "دیوار", kurmanji: "dîwar", category: "شوێن", code: "8009" },
  { sorani: "ڕیشە", kurmanji: "rişe", category: "شوێن", code: "8010" },
  
  // Urban Areas (8101-8199)
  { sorani: "شار", kurmanji: "bajar", category: "شوێن", code: "8101" },
  { sorani: "شارۆچکە", kurmanji: "bajarok", category: "شوێن", code: "8102" },
  { sorani: "گوند", kurmanji: "gund", category: "شوێن", code: "8103" },
  { sorani: "گەرەک", kurmanji: "gerek", category: "شوێن", code: "8104" },
  { sorani: "خەڵک", kurmanji: "gel", category: "شوێن", code: "8105" },
  { sorani: "مەحەڵە", kurmanji: "mehele", category: "شوێن", code: "8106" },
  { sorani: "کۆڵان", kurmanji: "kolan", category: "شوێن", code: "8107" },
  { sorani: "شەقام", kurmanji: "şeqam", category: "شوێن", code: "8108" },
  { sorani: "ڕێگا", kurmanji: "rê", category: "شوێن", code: "8109" },
  { sorani: "تەریق", kurmanji: "terîq", category: "شوێن", code: "8110" },
  
  // Commercial Places (8201-8299)
  { sorani: "بازاڕ", kurmanji: "bazar", category: "شوێن", code: "8201" },
  { sorani: "دکان", kurmanji: "dukan", category: "شوێن", code: "8202" },
  { sorani: "فرۆشگا", kurmanji: "firoşge", category: "شوێن", code: "8203" },
  { sorani: "مۆڵ", kurmanji: "mol", category: "شوێن", code: "8204" },
  { sorani: "بانک", kurmanji: "bank", category: "شوێن", code: "8205" },
  { sorani: "چایخانە", kurmanji: "çayxane", category: "شوێن", code: "8206" },
  { sorani: "چێشتخانە", kurmanji: "çêştxane", category: "شوێن", code: "8207" },
  { sorani: "هوتێل", kurmanji: "hotel", category: "شوێن", code: "8208" },
  
  // Educational Institutions (8301-8399)
  { sorani: "قوتابخانە", kurmanji: "dibistan", category: "شوێن", code: "8301" },
  { sorani: "ئامادەیی", kurmanji: "amadeî", category: "شوێن", code: "8302" },
  { sorani: "زانکۆ", kurmanji: "zanînge", category: "شوێن", code: "8303" },
  { sorani: "کتێبخانە", kurmanji: "pirtûkxane", category: "شوێن", code: "8304" },
  { sorani: "پۆلینکلینیک", kurmanji: "polîklînîk", category: "شوێن", code: "8305" },
  { sorani: "کۆلێژ", kurmanji: "kolêj", category: "شوێن", code: "8306" },
  
  // Healthcare (8401-8499)
  { sorani: "نەخۆشخانە", kurmanji: "nexweşxane", category: "شوێن", code: "8401" },
  { sorani: "کلینک", kurmanji: "klînîk", category: "شوێن", code: "8402" },
  { sorani: "دەرمانخانە", kurmanji: "dermanxane", category: "شوێن", code: "8403" },
  { sorani: "دکتۆرخانە", kurmanji: "doktorxane", category: "شوێن", code: "8404" },
  
  // Natural Places (8501-8599)
  { sorani: "دارستان", kurmanji: "daristan", category: "شوێن", code: "8501" },
  { sorani: "چیا", kurmanji: "çiya", category: "شوێن", code: "8502" },
  { sorani: "ڕووبار", kurmanji: "çem", category: "شوێن", code: "8503" },
  { sorani: "دەریا", kurmanji: "derya", category: "شوێن", code: "8504" },
  { sorani: "گۆل", kurmanji: "gol", category: "شوێن", code: "8505" },
  { sorani: "دەشت", kurmanji: "deşt", category: "شوێن", code: "8506" },
  { sorani: "بیابان", kurmanji: "çol", category: "شوێن", code: "8507" },
  { sorani: "ده‌ڵ", kurmanji: "dal", category: "شوێن", code: "8508" },
  { sorani: "لۆ", kurmanji: "lo", category: "شوێن", code: "8509" },
  { sorani: "ئاو", kurmanji: "av", category: "شوێن", code: "8510" },
  
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
  { sorani: "بە چی؟", kurmanji: "bi çî?", category: "دەربڕین", notes: "With what?" },

  // Extended Numbers - ژمارە فراوان
  { sorani: "سێزدە", kurmanji: "sêzde", category: "ژمارە" },
  { sorani: "چواردە", kurmanji: "çarde", category: "ژمارە" },
  { sorani: "پازدە", kurmanji: "pazde", category: "ژمارە" },
  { sorani: "شازدە", kurmanji: "şazde", category: "ژمارە" },
  { sorani: "حەڤدە", kurmanji: "hevde", category: "ژمارە" },
  { sorani: "هەژدە", kurmanji: "hejde", category: "ژمارە" },
  { sorani: "نۆزدە", kurmanji: "nozde", category: "ژمارە" },
  { sorani: "چل", kurmanji: "çil", category: "ژمارە" },
  { sorani: "پەنجا", kurmanji: "pêncî", category: "ژمارە" },
  { sorani: "شەست", kurmanji: "şêst", category: "ژمارە" },
  { sorani: "حەفتا", kurmanji: "heftê", category: "ژمارە" },
  { sorani: "هەشتا", kurmanji: "heştê", category: "ژمارە" },
  { sorani: "نەوەد", kurmanji: "newed", category: "ژمارە" },
  { sorani: "سەد", kurmanji: "sed", category: "ژمارە" },
  { sorani: "هەزار", kurmanji: "hezar", category: "ژمارە" },
  { sorani: "ملیۆن", kurmanji: "mîlyon", category: "ژمارە" },

  // Colors - ڕەنگ
  { sorani: "سوور", kurmanji: "sor", category: "ڕەنگ" },
  { sorani: "شین", kurmanji: "şîn", category: "ڕەنگ" },
  { sorani: "زەرد", kurmanji: "zer", category: "ڕەنگ" },
  { sorani: "سەوز", kurmanji: "kesk", category: "ڕەنگ" },
  { sorani: "ڕەش", kurmanji: "reş", category: "ڕەنگ" },
  { sorani: "سپی", kurmanji: "spî", category: "ڕەنگ" },
  { sorani: "پەمەیی", kurmanji: "pembe", category: "ڕەنگ" },
  { sorani: "مۆر", kurmanji: "mor", category: "ڕەنگ" },
  { sorani: "نارەنجی", kurmanji: "narincî", category: "ڕەنگ" },
  { sorani: "قاوەیی", kurmanji: "qehweyî", category: "ڕەنگ" },
  { sorani: "خۆڵەمێشی", kurmanji: "xolêmêş", category: "ڕەنگ" },
  { sorani: "بەتایی", kurmanji: "beta", category: "ڕەنگ" },

  // Body Parts - ئەندامەکانی لەش
  { sorani: "سەر", kurmanji: "ser", category: "لەش" },
  { sorani: "چاو", kurmanji: "çav", category: "لەش" },
  { sorani: "لووت", kurmanji: "lût", category: "لەش" },
  { sorani: "دەم", kurmanji: "dev", category: "لەش" },
  { sorani: "دەست", kurmanji: "dest", category: "لەش" },
  { sorani: "پێ", kurmanji: "pî", category: "لەش" },
  { sorani: "ملاو", kurmanji: "milav", category: "لەش" },
  { sorani: "سنگ", kurmanji: "sing", category: "لەش" },
  { sorani: "پشت", kurmanji: "pişt", category: "لەش" },
  { sorani: "زگ", kurmanji: "zik", category: "لەش" },
  { sorani: "دڵ", kurmanji: "dil", category: "لەش" },
  { sorani: "سییەکان", kurmanji: "sihîk", category: "لەش" },
  { sorani: "گورچیلە", kurmanji: "guh", category: "لەش" },
  { sorani: "لێوی", kurmanji: "lêv", category: "لەش" },
  { sorani: "ددان", kurmanji: "diran", category: "لەش" },
  { sorani: "زمان", kurmanji: "ziman", category: "لەش" },
  { sorani: "قژ", kurmanji: "por", category: "لەش" },
  { sorani: "رووخسار", kurmanji: "rû", category: "لەش" },
  { sorani: "پەنجە", kurmanji: "tilî", category: "لەش" },
  { sorani: "نینۆک", kurmanji: "nînok", category: "لەش" },

  // Animals - ئاژەڵ
  { sorani: "سەگ", kurmanji: "kûçik", category: "ئاژەڵ" },
  { sorani: "پشیلە", kurmanji: "pisîk", category: "ئاژەڵ" },
  { sorani: "ئەسپ", kurmanji: "hesp", category: "ئاژەڵ" },
  { sorani: "مانگا", kurmanji: "çêlek", category: "ئاژەڵ" },
  { sorani: "بزن", kurmanji: "bizin", category: "ئاژەڵ" },
  { sorani: "مەڕ", kurmanji: "mî", category: "ئاژەڵ" },
  { sorani: "کەروێشک", kurmanji: "kerûşk", category: "ئاژەڵ" },
  { sorani: "شێر", kurmanji: "şêr", category: "ئاژەڵ" },
  { sorani: "گورگ", kurmanji: "gur", category: "ئاژەڵ" },
  { sorani: "ورچ", kurmanji: "beraz", category: "ئاژەڵ" },
  { sorani: "کوێر", kurmanji: "korr", category: "ئاژەڵ" },
  { sorani: "بە", kurmanji: "ber", category: "ئاژەڵ" },
  { sorani: "مش", kurmanji: "mişk", category: "ئاژەڵ" },
  { sorani: "ماسی", kurmanji: "masî", category: "ئاژەڵ" },
  { sorani: "باڵندە", kurmanji: "çûçik", category: "ئاژەڵ" },
  { sorani: "کەوتار", kurmanji: "kevtar", category: "ئاژەڵ" },
  { sorani: "کوندەپەپوو", kurmanji: "pepûk", category: "ئاژەڵ" },
  { sorani: "مرج", kurmanji: "mirç", category: "ئاژەڵ" },
  { sorani: "شانۆ", kurmanji: "şano", category: "ئاژەڵ" },

  // Food - خواردن
  { sorani: "نان", kurmanji: "nan", category: "خواردن" },
  { sorani: "ئاو", kurmanji: "av", category: "خواردن" },
  { sorani: "شیر", kurmanji: "şîr", category: "خواردن" },
  { sorani: "گۆشت", kurmanji: "goşt", category: "خواردن" },
  { sorani: "مەیوە", kurmanji: "fêkî", category: "خواردن" },
  { sorani: "سبزە", kurmanji: "sebze", category: "خواردن" },
  { sorani: "برنج", kurmanji: "birinc", category: "خواردن" },
  { sorani: "بەرق", kurmanji: "berq", category: "خواردن" },
  { sorani: "پەنیر", kurmanji: "penîr", category: "خواردن" },
  { sorani: "هێلکە", kurmanji: "hêlke", category: "خواردن" },
  { sorani: "قاوە", kurmanji: "qehwe", category: "خواردن" },
  { sorani: "چا", kurmanji: "çay", category: "خواردن" },
  { sorani: "شەکر", kurmanji: "şekir", category: "خواردن" },
  { sorani: "خوێ", kurmanji: "xwê", category: "خواردن" },
  { sorani: "سێو", kurmanji: "sêv", category: "خواردن" },
  { sorani: "گلاس", kurmanji: "glas", category: "خواردن" },
  { sorani: "هەرمێ", kurmanji: "hirmî", category: "خواردن" },
  { sorani: "بادەنجان", kurmanji: "badencan", category: "خواردن" },
  { sorani: "فەلفەل", kurmanji: "biber", category: "خواردن" },
  { sorani: "پیاز", kurmanji: "pîvaz", category: "خواردن" },

  // Nature - سروشت
  { sorani: "دار", kurmanji: "dar", category: "سروشت" },
  { sorani: "گوڵ", kurmanji: "gul", category: "سروشت" },
  { sorani: "ئاسمان", kurmanji: "ezman", category: "سروشت" },
  { sorani: "زەوی", kurmanji: "erd", category: "سروشت" },
  { sorani: "کانی", kurmanji: "kanî", category: "سروشت" },
  { sorani: "ڕووبار", kurmanji: "çem", category: "سروشت" },
  { sorani: "چیا", kurmanji: "çiya", category: "سروشت" },
  { sorani: "دەشت", kurmanji: "deşt", category: "سروشت" },
  { sorani: "بارانی", kurmanji: "baran", category: "سروشت" },
  { sorani: "بەفر", kurmanji: "berf", category: "سروشت" },
  { sorani: "با", kurmanji: "ba", category: "سروشت" },
  { sorani: "خۆر", kurmanji: "roj", category: "سروشت" },
  { sorani: "مانگ", kurmanji: "heyv", category: "سروشت" },
  { sorani: "ئەستێرە", kurmanji: "stêr", category: "سروشت" },
  { sorani: "هەور", kurmanji: "ewr", category: "سروشت" },
  { sorani: "ئاگر", kurmanji: "agir", category: "سروشت" },
  { sorani: "بەرد", kurmanji: "berd", category: "سروشت" },
  { sorani: "خۆڵ", kurmanji: "ax", category: "سروشت" },

  // Clothing - جل و بەرگ
  { sorani: "جل", kurmanji: "cil", category: "جل" },
  { sorani: "کراس", kurmanji: "kiras", category: "جل" },
  { sorani: "پانتۆڵ", kurmanji: "pantol", category: "جل" },
  { sorani: "پێڵاو", kurmanji: "pêlav", category: "جل" },
  { sorani: "کڵاو", kurmanji: "kulav", category: "جل" },
  { sorani: "کۆت", kurmanji: "kote", category: "جل" },
  { sorani: "فانیلە", kurmanji: "fanîle", category: "جل" },
  { sorani: "شاڵ", kurmanji: "şal", category: "جل" },
  { sorani: "دەستکش", kurmanji: "destkêş", category: "جل" },
  { sorani: "جوراب", kurmanji: "gorav", category: "جل" },
  { sorani: "پشتێن", kurmanji: "piştin", category: "جل" },
  { sorani: "قەپوت", kurmanji: "qeput", category: "جل" },

  // Transportation - گواستنەوە
  { sorani: "ئۆتۆمبێل", kurmanji: "otomobîl", category: "گواستنەوە" },
  { sorani: "پاسکیل", kurmanji: "bisîklet", category: "گواستنەوە" },
  { sorani: "فڕۆکە", kurmanji: "balafir", category: "گواستنەوە" },
  { sorani: "کەشتی", kurmanji: "keştî", category: "گواستنەوە" },
  { sorani: "شەمەندەفەر", kurmanji: "şemendefer", category: "گواستنەوە" },
  { sorani: "پاس", kurmanji: "otobûs", category: "گواستنەوە" },

  // Buildings - بینا
  { sorani: "ماڵ", kurmanji: "mal", category: "بینا" },
  { sorani: "مزگەوت", kurmanji: "mizgeft", category: "بینا" },
  { sorani: "قوتابخانە", kurmanji: "dibistan", category: "بینا" },
  { sorani: "نەخۆشخانە", kurmanji: "nexweşxane", category: "بینا" },
  { sorani: "بازاڕ", kurmanji: "bazar", category: "بینا" },
  { sorani: "دووکان", kurmanji: "dukan", category: "بینا" },
  { sorani: "کتێبخانە", kurmanji: "pirtûkxane", category: "بینا" },
  { sorani: "پارک", kurmanji: "park", category: "بینا" },
  { sorani: "دەرگا", kurmanji: "derî", category: "بینا" },
  { sorani: "پەنجەرە", kurmanji: "pace", category: "بینا" },
  { sorani: "بان", kurmanji: "ban", category: "بینا" },
  { sorani: "باخچە", kurmanji: "baxçe", category: "بینا" },

  // Professions - پیشە
  { sorani: "پزیشک", kurmanji: "doktor", category: "پیشە" },
  { sorani: "مامۆستا", kurmanji: "mamoste", category: "پیشە" },
  { sorani: "ئەندازیار", kurmanji: "endazyar", category: "پیشە" },
  { sorani: "یاساناس", kurmanji: "parêzer", category: "پیشە" },
  { sorani: "کارگەر", kurmanji: "karker", category: "پیشە" },
  { sorani: "جوتیار", kurmanji: "çêker", category: "پیشە" },
  { sorani: "شۆفێر", kurmanji: "ajovan", category: "پیشە" },
  { sorani: "ئاشپێژ", kurmanji: "aşpêj", category: "پیشە" },
  { sorani: "دەرزی", kurmanji: "derzî", category: "پیشە" },
  { sorani: "پۆلیس", kurmanji: "polîs", category: "پیشە" },
  { sorani: "سەرباز", kurmanji: "leşker", category: "پیشە" },
  { sorani: "بازرگان", kurmanji: "bazirgan", category: "پیشە" },

  // Technology - تەکنەلۆژیا
  { sorani: "کۆمپیوتەر", kurmanji: "komputer", category: "تەکنەلۆژیا" },
  { sorani: "مۆبایل", kurmanji: "mobîl", category: "تەکنەلۆژیا" },
  { sorani: "ئینتەرنێت", kurmanji: "înternet", category: "تەکنەلۆژیا" },
  { sorani: "تەلەفۆن", kurmanji: "têlefon", category: "تەکنەلۆژیا" },
  { sorani: "تەلەفیزیۆن", kurmanji: "televizyon", category: "تەکنەلۆژیا" },
  { sorani: "ڕادیۆ", kurmanji: "radyo", category: "تەکنەلۆژیا" },

  // Weather - کەشوهەوا
  { sorani: "گەرم", kurmanji: "germ", category: "کەشوهەوا" },
  { sorani: "سارد", kurmanji: "sar", category: "کەشوهەوا" },
  { sorani: "ڕوون", kurmanji: "zelal", category: "کەشوهەوا" },
  { sorani: "هەوری", kurmanji: "ewrî", category: "کەشوهەوا" },
  { sorani: "باراونی", kurmanji: "baranî", category: "کەشوهەوا" },
  { sorani: "بەفراوی", kurmanji: "berfî", category: "کەشوهەوا" },

  // Emotions - هەست
  { sorani: "دڵخۆش", kurmanji: "kêfxweş", category: "هەست" },
  { sorani: "خەمبار", kurmanji: "xembar", category: "هەست" },
  { sorani: "تووڕە", kurmanji: "jê re", category: "هەست" },
  { sorani: "ترسنۆک", kurmanji: "tirsok", category: "هەست" },
  { sorani: "سەرسام", kurmanji: "sersam", category: "هەست" },
  { sorani: "شاد", kurmanji: "şad", category: "هەست" },
  { sorani: "نیگەران", kurmanji: "xem", category: "هەست" },

  // Common Adjectives - ناو لاوان
  { sorani: "گەورە", kurmanji: "mezin", category: "ناولاو" },
  { sorani: "بچووک", kurmanji: "piçûk", category: "ناولاو" },
  { sorani: "درێژ", kurmanji: "dirêj", category: "ناولاو" },
  { sorani: "کورت", kurmanji: "kurt", category: "ناولاو" },
  { sorani: "بەرز", kurmanji: "bilind", category: "ناولاو" },
  { sorani: "نزم", kurmanji: "nizm", category: "ناولاو" },
  { sorani: "چاک", kurmanji: "baş", category: "ناولاو" },
  { sorani: "خراپ", kurmanji: "xirab", category: "ناولاو" },
  { sorani: "نوێ", kurmanji: "nû", category: "ناولاو" },
  { sorani: "کۆن", kurmanji: "kevn", category: "ناولاو" },
  { sorani: "زۆر", kurmanji: "gelek", category: "ناولاو" },
  { sorani: "کەم", kurmanji: "kêm", category: "ناولاو" },
  { sorani: "هەموو", kurmanji: "hemû", category: "ناولاو" },
  { sorani: "هیچ", kurmanji: "tu", category: "ناولاو" },

  // Directions - ئاراستە
  { sorani: "باکوور", kurmanji: "bakur", category: "ئاراستە" },
  { sorani: "باشوور", kurmanji: "başûr", category: "ئاراستە" },
  { sorani: "ڕۆژهەڵات", kurmanji: "rojhilat", category: "ئاراستە" },
  { sorani: "ڕۆژئاوا", kurmanji: "rojava", category: "ئاراستە" },
  { sorani: "ڕاست", kurmanji: "rast", category: "ئاراستە" },
  { sorani: "چەپ", kurmanji: "çep", category: "ئاراستە" },
  { sorani: "سەرەوە", kurmanji: "jor", category: "ئاراستە" },
  { sorani: "خوارەوە", kurmanji: "jêr", category: "ئاراستە" },
  { sorani: "پێشەوە", kurmanji: "pêş", category: "ئاراستە" },
  { sorani: "دواوە", kurmanji: "paş", category: "ئاراستە" },

  // School subjects - بابەتە خوێندنەکان
  { sorani: "بیرکاری", kurmanji: "matematîk", category: "خوێندن" },
  { sorani: "زانست", kurmanji: "zanist", category: "خوێندن" },
  { sorani: "مێژوو", kurmanji: "dîrok", category: "خوێندن" },
  { sorani: "جوگرافیا", kurmanji: "erdnasî", category: "خوێندن" },
  { sorani: "زمان", kurmanji: "ziman", category: "خوێندن" },
  { sorani: "ئەدەبیات", kurmanji: "edebîyat", category: "خوێندن" },
  { sorani: "وێنە", kurmanji: "resim", category: "خوێندن" },
  { sorani: "مۆزیک", kurmanji: "mûzîk", category: "خوێندن" },
  { sorani: "وەرزش", kurmanji: "werziş", category: "خوێندن" },

  // Extended Numbers - ژمارە زیاتر
  { sorani: "سێزدە", kurmanji: "sêzde", category: "ژمارە" },
  { sorani: "چواردە", kurmanji: "çarde", category: "ژمارە" },
  { sorani: "پازدە", kurmanji: "pazde", category: "ژمارە" },
  { sorani: "شازدە", kurmanji: "şazde", category: "ژمارە" },
  { sorani: "حەڤدە", kurmanji: "hevde", category: "ژمارە" },
  { sorani: "هەژدە", kurmanji: "hejde", category: "ژمارە" },
  { sorani: "نۆزدە", kurmanji: "nozde", category: "ژمارە" },
  { sorani: "حەفتا", kurmanji: "heftê", category: "ژمارە" },
  { sorani: "هەشتا", kurmanji: "heştê", category: "ژمارە" },
  { sorani: "نەوەد", kurmanji: "newed", category: "ژمارە" },
  { sorani: "ملیۆن", kurmanji: "mîlyon", category: "ژمارە" },
  { sorani: "ملیار", kurmanji: "mîlyar", category: "ژمارە" },

  // Extended Colors - ڕەنگ زیاتر
  { sorani: "خۆڵەمێشی", kurmanji: "xolêmêş", category: "ڕەنگ" },
  { sorani: "بەتایی", kurmanji: "beta", category: "ڕەنگ" },
  { sorani: "تۆخی", kurmanji: "toxî", category: "ڕەنگ" },
  { sorani: "گولاوی", kurmanji: "gulawî", category: "ڕەنگ" },
  { sorani: "شیلەیی", kurmanji: "şîleî", category: "ڕەنگ" },
  { sorani: "ئەرخەوانی", kurmanji: "erxewanî", category: "ڕەنگ" },
  { sorani: "بادەمجانی", kurmanji: "bademcanî", category: "ڕەنگ" },

  // Extended Body Parts - لەش زیاتر
  { sorani: "ملاو", kurmanji: "milav", category: "لەش" },
  { sorani: "سنگ", kurmanji: "sing", category: "لەش" },
  { sorani: "پشت", kurmanji: "pişt", category: "لەش" },
  { sorani: "زگ", kurmanji: "zik", category: "لەش" },
  { sorani: "سییەکان", kurmanji: "sihîk", category: "لەش" },
  { sorani: "لێوی", kurmanji: "lêv", category: "لەش" },
  { sorani: "زمان", kurmanji: "ziman", category: "لەش" },
  { sorani: "قژ", kurmanji: "por", category: "لەش" },
  { sorani: "رووخسار", kurmanji: "rû", category: "لەش" },
  { sorani: "نینۆک", kurmanji: "nînok", category: "لەش" },
  { sorani: "ناخن", kurmanji: "naxin", category: "لەش" },
  { sorani: "قۆڵ", kurmanji: "qol", category: "لەش" },
  { sorani: "ناوق", kurmanji: "naoq", category: "لەش" },
  { sorani: "سک", kurmanji: "sik", category: "لەش" },
  { sorani: "هەناو", kurmanji: "henav", category: "لەش" },

  // Extended Food Items - خۆراک زیاتر
  { sorani: "سێو", kurmanji: "sêv", category: "خۆراک" },
  { sorani: "هەرمێ", kurmanji: "hirmî", category: "خۆراک" },
  { sorani: "ئەنجیر", kurmanji: "encîr", category: "خۆراک" },
  { sorani: "هێلکە", kurmanji: "hêlke", category: "خۆراک" },
  { sorani: "گەنم", kurmanji: "genim", category: "خۆراک" },
  { sorani: "جۆ", kurmanji: "co", category: "خۆراک" },
  { sorani: "پیاز", kurmanji: "pîvaz", category: "خۆراک" },
  { sorani: "فەلفەل", kurmanji: "biber", category: "خۆراک" },
  { sorani: "بادنجان", kurmanji: "badencan", category: "خۆراک" },
  { sorani: "خیار", kurmanji: "xiyar", category: "خۆراک" },
  { sorani: "بامیە", kurmanji: "bamye", category: "خۆراک" },
  { sorani: "لۆبیا", kurmanji: "lobya", category: "خۆراک" },
  { sorani: "نۆخود", kurmanji: "noxod", category: "خۆراک" },
  { sorani: "کەوەنگی", kurmanji: "kewengî", category: "خۆراک" },
  { sorani: "خورما", kurmanji: "xurma", category: "خۆراک" },
  { sorani: "کیشمیش", kurmanji: "kişmîş", category: "خۆراک" },
  { sorani: "بادام", kurmanji: "badam", category: "خۆراک" },
  { sorani: "گوێز", kurmanji: "gwêz", category: "خۆراک" },
  { sorani: "فستق", kurmanji: "fistiq", category: "خۆراک" },
  { sorani: "هەندەوانە", kurmanji: "hendewane", category: "خۆراک" },
  { sorani: "خەربووزە", kurmanji: "xerbuze", category: "خۆراک" },
  { sorani: "شەکر", kurmanji: "şekir", category: "خۆراک" },

  // Extended Animals - ئاژەڵ زیاتر
  { sorani: "ورچ", kurmanji: "beraz", category: "ئاژەڵ" },
  { sorani: "شێر", kurmanji: "şêr", category: "ئاژەڵ" },
  { sorani: "گورگ", kurmanji: "gur", category: "ئاژەڵ" },
  { sorani: "مانگا", kurmanji: "çêlek", category: "ئاژەڵ" },
  { sorani: "کەروێشک", kurmanji: "kerûşk", category: "ئاژەڵ" },
  { sorani: "مش", kurmanji: "mişk", category: "ئاژەڵ" },
  { sorani: "ماسی", kurmanji: "masî", category: "ئاژەڵ" },
  { sorani: "کوندەپەپوو", kurmanji: "pepûk", category: "ئاژەڵ" },
  { sorani: "کوێر", kurmanji: "korr", category: "ئاژەڵ" },
  { sorani: "باڵندە", kurmanji: "çûçik", category: "ئاژەڵ" },
  { sorani: "کەوتار", kurmanji: "kevtar", category: "ئاژەڵ" },
  { sorani: "بە", kurmanji: "ber", category: "ئاژەڵ" },
  { sorani: "مرج", kurmanji: "mirç", category: "ئاژەڵ" },
  { sorani: "کۆتر", kurmanji: "koter", category: "ئاژەڵ" },
  { sorani: "قاز", kurmanji: "qaz", category: "ئاژەڵ" },
  { sorani: "بات", kurmanji: "bat", category: "ئاژەڵ" },
  { sorani: "مەلی", kurmanji: "melî", category: "ئاژەڵ" },
  { sorani: "ئەردەک", kurmanji: "erdek", category: "ئاژەڵ" },

  // Clothing Extended - جل و بەرگ زیاتر
  { sorani: "چارک", kurmanji: "çarik", category: "جل" },
  { sorani: "کەمەر", kurmanji: "kemer", category: "جل" },
  { sorani: "ساعات", kurmanji: "saat", category: "جل" },
  { sorani: "گەردەنی", kurmanji: "gerdenî", category: "جل" },
  { sorani: "خازن", kurmanji: "xazin", category: "جل" },

  // Weather Extended - کەشوهەوا
  { sorani: "باراونی", kurmanji: "baranî", category: "کەشوهەوا" },
  { sorani: "بەفراوی", kurmanji: "berfî", category: "کەشوهەوا" },
  { sorani: "هەوری", kurmanji: "ewrî", category: "کەشوهەوا" },
  { sorani: "بەهارانی", kurmanji: "beharanî", category: "کەشوهەوا" },
  { sorani: "هاوینانی", kurmanji: "hawînanî", category: "کەشوهەوا" },
  { sorani: "پاییزانی", kurmanji: "payîzanî", category: "کەشوهەوا" },
  { sorani: "زستانی", kurmanji: "zistanî", category: "کەشوهەوا" },
  { sorani: "رووەک", kurmanji: "riwek", category: "کەشوهەوا" },
  { sorani: "ڕوون", kurmanji: "zelal", category: "کەشوهەوا" },
  { sorani: "مامز", kurmanji: "mamz", category: "کەشوهەوا" },
  { sorani: "تیژ", kurmanji: "tîj", category: "کەشوهەوا" },
  { sorani: "نەرم", kurmanji: "nerm", category: "کەشوهەوا" },

  // Professions Extended - پیشە
  { sorani: "یاساناس", kurmanji: "parêzer", category: "پیشە" },
  { sorani: "کارگەر", kurmanji: "karker", category: "پیشە" },
  { sorani: "جوتیار", kurmanji: "çêker", category: "پیشە" },
  { sorani: "شۆفێر", kurmanji: "ajovan", category: "پیشە" },
  { sorani: "سەرباز", kurmanji: "leşker", category: "پیشە" },
  { sorani: "پۆلیس", kurmanji: "polîs", category: "پیشە" },
  { sorani: "بازرگان", kurmanji: "bazirgan", category: "پیشە" },
  { sorani: "ئاشپێژ", kurmanji: "aşpêj", category: "پیشە" },
  { sorani: "دەرزی", kurmanji: "derzî", category: "پیشە" },
  { sorani: "جەوهەری", kurmanji: "cewherî", category: "پیشە" },
  { sorani: "کتێبفرۆش", kurmanji: "pirtûkfiroş", category: "پیشە" },
  { sorani: "وەکیل", kurmanji: "wakîl", category: "پیشە" },
  { sorani: "حەکیم", kurmanji: "hekîm", category: "پیشە" },
  { sorani: "نەخۆشپارێز", kurmanji: "nexweşparêz", category: "پیشە" },

  // Buildings Extended - بیناسازی
  { sorani: "بانک", kurmanji: "bank", category: "بیناسازی" },
  { sorani: "مزگەوت", kurmanji: "mizgeft", category: "بیناسازی" },
  { sorani: "کتێبخانە", kurmanji: "pirtûkxane", category: "بیناسازی" },
  { sorani: "پارک", kurmanji: "park", category: "بیناسازی" },
  { sorani: "باخچە", kurmanji: "baxçe", category: "بیناسازی" },
  { sorani: "پەنجەرە", kurmanji: "pace", category: "بیناسازی" },
  { sorani: "دەرگا", kurmanji: "derî", category: "بیناسازی" },
  { sorani: "قەسر", kurmanji: "qesr", category: "بیناسازی" },
  { sorani: "کۆشک", kurmanji: "koşk", category: "بیناسازی" },
  { sorani: "قوللە", kurmanji: "qulle", category: "بیناسازی" },
  { sorani: "هۆتێل", kurmanji: "hotêl", category: "بیناسازی" },
  { sorani: "چێشتخانە", kurmanji: "çêştxane", category: "بیناسازی" },

  // Nature Extended - سروشت زیاتر
  { sorani: "ئاسمان", kurmanji: "ezman", category: "سروشت" },
  { sorani: "زەوی", kurmanji: "erd", category: "سروشت" },
  { sorani: "دەریا", kurmanji: "beher", category: "سروشت" },
  { sorani: "گۆل", kurmanji: "gol", category: "سروشت" },
  { sorani: "دۆڵ", kurmanji: "dol", category: "سروشت" },
  { sorani: "گرد", kurmanji: "gird", category: "سروشت" },
  { sorani: "جەم", kurmanji: "cem", category: "سروشت" },
  { sorani: "کانزا", kurmanji: "kanza", category: "سروشت" },

  // Technology Extended - تەکنەلۆژیا زیاتر
  { sorani: "تەلەفۆن", kurmanji: "têlefon", category: "تەکنەلۆژیا" },
  { sorani: "تەلەفیزیۆن", kurmanji: "televizyon", category: "تەکنەلۆژیا" },
  { sorani: "ڕادیۆ", kurmanji: "radyo", category: "تەکنەلۆژیا" },
  { sorani: "کامێرا", kurmanji: "kamera", category: "تەکنەلۆژیا" },
  { sorani: "کۆمپیوتەری سەردەست", kurmanji: "laptopî", category: "تەکنەلۆژیا" },
  { sorani: "تابلێت", kurmanji: "tablet", category: "تەکنەلۆژیا" },
  { sorani: "مۆدێم", kurmanji: "modem", category: "تەکنەلۆژیا" },
  { sorani: "پڕینتەر", kurmanji: "printer", category: "تەکنەلۆژیا" },

  // Academic Subjects Extended - خوێندن زیاتر
  { sorani: "بیرکاری", kurmanji: "matematîk", category: "خوێندن" },
  { sorani: "فیزیا", kurmanji: "fîzya", category: "خوێندن" },
  { sorani: "کیمیا", kurmanji: "kîmya", category: "خوێندن" },
  { sorani: "بایۆلۆجی", kurmanji: "bîyolojî", category: "خوێندن" },

  // Sports Extended - وەرزش زیاتر
  { sorani: "تۆپی پێ", kurmanji: "futbol", category: "وەرزش" },
  { sorani: "باسکتبۆڵ", kurmanji: "basketbol", category: "وەرزش" },
  { sorani: "تێنس", kurmanji: "tenîs", category: "وەرزش" },
  { sorani: "یاری", kurmanji: "lîstik", category: "وەرزش" },
  { sorani: "پاڵەوان", kurmanji: "qahreman", category: "وەرزش" },
  { sorani: "یاریگا", kurmanji: "stadium", category: "وەرزش" },
  { sorani: "بۆکس", kurmanji: "boks", category: "وەرزش" },
  { sorani: "کوشتی", kurmanji: "kuştî", category: "وەرزش" },

  // Health Extended - تەندروستی
  { sorani: "تەندروستی", kurmanji: "tendirustî", category: "تەندروستی" },
  { sorani: "نەخۆش", kurmanji: "nexweş", category: "تەندروستی" },
  { sorani: "دەرمان", kurmanji: "derman", category: "تەندروستی" },
  { sorani: "ئازار", kurmanji: "azar", category: "تەندروستی" },
  { sorani: "درد", kurmanji: "êş", category: "تەندروستی" },
  { sorani: "چاکبوونەوە", kurmanji: "çakbûn", category: "تەندروستی" },
  { sorani: "برین", kurmanji: "birîn", category: "تەندروستی" },

  // Emotions Extended - هەست
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

  // Business Extended - بازرگانی
  { sorani: "بازرگانی", kurmanji: "bazirganî", category: "بازرگانی" },
  { sorani: "کارمەند", kurmanji: "karker", category: "بازرگانی" },
  { sorani: "کارخانە", kurmanji: "fabrika", category: "بازرگانی" },
  { sorani: "فرۆشگا", kurmanji: "firotge", category: "بازرگانی" },
  { sorani: "نرخ", kurmanji: "nirx", category: "بازرگانی" },
  { sorani: "فرۆشتن", kurmanji: "firotin", category: "بازرگانی" },
  { sorani: "کڕین", kurmanji: "kirîn", category: "بازرگانی" },
  { sorani: "قازانج", kurmanji: "qezenc", category: "بازرگانی" },
  { sorani: "زیان", kurmanji: "ziyan", category: "بازرگانی" },
  { sorani: "حیساب", kurmanji: "hîsab", category: "بازرگانی" },
  { sorani: "قەرز", kurmanji: "qerz", category: "بازرگانی" },
  { sorani: "سوود", kurmanji: "sûd", category: "بازرگانی" },

  // Kitchen Extended - چێشتخانە
  { sorani: "مێز", kurmanji: "mêz", category: "چێشتخانە" },
  { sorani: "کورسی", kurmanji: "kursî", category: "چێشتخانە" },
  { sorani: "قاپ", kurmanji: "qab", category: "چێشتخانە" },
  { sorani: "چنگاڵ", kurmanji: "çingal", category: "چێشتخانە" },
  { sorani: "کێشک", kurmanji: "kevçî", category: "چێشتخانە" },
  { sorani: "چاقو", kurmanji: "kêr", category: "چێشتخانە" },
  { sorani: "تاس", kurmanji: "tas", category: "چێشتخانە" },
  { sorani: "گڵاس", kurmanji: "glas", category: "چێشتخانە" },
  { sorani: "کەتڵ", kurmanji: "ketel", category: "چێشتخانە" },
  { sorani: "تاوە", kurmanji: "tawe", category: "چێشتخانە" },

  // Geographic Terms - جوگرافیا
  { sorani: "وڵات", kurmanji: "welat", category: "جوگرافیا" },
  { sorani: "نیشتمان", kurmanji: "niştiman", category: "جوگرافیا" },
  { sorani: "سنوور", kurmanji: "sînor", category: "جوگرافیا" },
  { sorani: "پایتەخت", kurmanji: "paytext", category: "جوگرافیا" },
  { sorani: "شارستان", kurmanji: "parêzge", category: "جوگرافیا" },

  // Religious Terms - ئایین
  { sorani: "خودا", kurmanji: "Xwedê", category: "ئایین" },
  { sorani: "نوێژ", kurmanji: "nimêj", category: "ئایین" },
  { sorani: "قورئان", kurmanji: "Quran", category: "ئایین" },
  { sorani: "ڕۆژوو", kurmanji: "rojî", category: "ئایین" },
  { sorani: "حەج", kurmanji: "hec", category: "ئایین" },
  { sorani: "زەکات", kurmanji: "zekat", category: "ئایین" },
  { sorani: "دوعا", kurmanji: "dua", category: "ئایین" },
  { sorani: "حەلاڵ", kurmanji: "helal", category: "ئایین" },
  { sorani: "حەرام", kurmanji: "heram", category: "ئایین" },

  // Adjectives Extended - ناولاو
  { sorani: "بەرز", kurmanji: "bilind", category: "ناولاو" },
  { sorani: "نزم", kurmanji: "nizm", category: "ناولاو" },
  { sorani: "درێژ", kurmanji: "dirêj", category: "ناولاو" },
  { sorani: "کورت", kurmanji: "kurt", category: "ناولاو" },
  { sorani: "نوێ", kurmanji: "nû", category: "ناولاو" },
  { sorani: "کۆن", kurmanji: "kevn", category: "ناولاو" },
  { sorani: "تایبەت", kurmanji: "taybet", category: "ناولاو" },

  // Advanced Verbs - کردارە پێشکەوتووەکان
  { sorani: "پێکردن", kurmanji: "pê kirin", category: "کردارە پێشکەوتووەکان" },
  { sorani: "تێگەیشتن", kurmanji: "fêm kirin", category: "کردارە پێشکەوتووەکان" },
  { sorani: "فێربوون", kurmanji: "hîn bûn", category: "کردارە پێشکەوتووەکان" },
  { sorani: "فێرکردن", kurmanji: "hîn kirin", category: "کردارە پێشکەوتووەکان" },
  { sorani: "بیرکردنەوە", kurmanji: "bîr kirin", category: "کردارە پێشکەوتووەکان" },
  { sorani: "بڕیاردان", kurmanji: "biryar dan", category: "کردارە پێشکەوتووەکان" },
  { sorani: "پلاندانان", kurmanji: "plan danîn", category: "کردارە پێشکەوتووەکان" },
  { sorani: "ئامادەکردن", kurmanji: "amade kirin", category: "کردارە پێشکەوتووەکان" },

  // Complex Phrases - دەربڕینە ئاڵۆزەکان
  { sorani: "چ خەبەر؟", kurmanji: "çi nû ye?", category: "دەربڕینە ئاڵۆزەکان" },
  { sorani: "کوا دەچی؟", kurmanji: "ku diçî?", category: "دەربڕینە ئاڵۆزەکان" },
  { sorani: "چی دەکەی؟", kurmanji: "çi dikî?", category: "دەربڕینە ئاڵۆزەکان" },
  { sorani: "کەی دێیتەوە؟", kurmanji: "kengî tê?", category: "دەربڕینە ئاڵۆزەکان" },
  { sorani: "بۆچی؟", kurmanji: "çima?", category: "دەربڕینە ئاڵۆزەکان" },
  { sorani: "چەند؟", kurmanji: "çend?", category: "دەربڕینە ئاڵۆزەکان" },

  // Transportation Extended - گواستنەوە زیاتر
  { sorani: "پاسکیل", kurmanji: "bisîklet", category: "گواستنەوە" },
  { sorani: "فڕۆکە", kurmanji: "balafir", category: "گواستنەوە" },
  { sorani: "کەشتی", kurmanji: "keştî", category: "گواستنەوە" },
  { sorani: "شەمەندەفەر", kurmanji: "şemendefer", category: "گواستنەوە" },
  { sorani: "پاس", kurmanji: "otobûs", category: "گواستنەوە" },
  { sorani: "تاکسی", kurmanji: "taksî", category: "گواستنەوە" },
  { sorani: "تریلەر", kurmanji: "kamyon", category: "گواستنەوە" },
  { sorani: "مۆتۆر", kurmanji: "motor", category: "گواستنەوە" },
  { sorani: "هەلیکۆپتەر", kurmanji: "helîkopter", category: "گواستنەوە" },
  { sorani: "ترەن", kurmanji: "tren", category: "گواستنەوە" },
  { sorani: "مەترۆ", kurmanji: "metro", category: "گواستنەوە" },

  // More Food Items - خۆراک تر
  { sorani: "خوێ", kurmanji: "xwê", category: "خۆراک" },
  { sorani: "مەست", kurmanji: "mest", category: "خۆراک" },
  { sorani: "نۆک", kurmanji: "nok", category: "خۆراک" },
  { sorani: "بەرق", kurmanji: "berq", category: "خۆراک" },
  { sorani: "رەوەن", kurmanji: "rewen", category: "خۆراک" },
  { sorani: "کەرەوێز", kurmanji: "kerewêz", category: "خۆراک" },
  { sorani: "ترە", kurmanji: "tire", category: "خۆراک" },
  { sorani: "شوید", kurmanji: "şiwîd", category: "خۆراک" },
  { sorani: "کزبرە", kurmanji: "kizbere", category: "خۆراک" },
  { sorani: "نەعنا", kurmanji: "pûng", category: "خۆراک" },
  { sorani: "ڕێحان", kurmanji: "rêhan", category: "خۆراک" },
  { sorani: "کەتێلە", kurmanji: "ketêle", category: "خۆراک" },
  { sorani: "رەشە", kurmanji: "reşe", category: "خۆراک" },
  { sorani: "هەڵو", kurmanji: "helû", category: "خۆراک" },
  { sorani: "گژۆگ", kurmanji: "gijog", category: "خۆراک" },

  // More Animals - ئاژەڵی تر
  { sorani: "تیشک", kurmanji: "tîşk", category: "ئاژەڵ" },
  { sorani: "مارەدار", kurmanji: "maredar", category: "ئاژەڵ" },
  { sorani: "کەرەکورە", kurmanji: "kerekure", category: "ئاژەڵ" },
  { sorani: "هەیوان", kurmanji: "heywan", category: "ئاژەڵ" },
  { sorani: "ڕەشەوە", kurmanji: "reşewe", category: "ئاژەڵ" },
  { sorani: "وەرە", kurmanji: "were", category: "ئاژەڵ" },
  { sorani: "شپشە", kurmanji: "şipşe", category: "ئاژەڵ" },
  { sorani: "مێش", kurmanji: "mêş", category: "ئاژەڵ" },
  { sorani: "هەنگ", kurmanji: "heng", category: "ئاژەڵ" },
  { sorani: "کەرم", kurmanji: "kerm", category: "ئاژەڵ" },
  { sorani: "پەپوولە", kurmanji: "pepûle", category: "ئاژەڵ" },
  { sorani: "مەگەس", kurmanji: "meges", category: "ئاژەڵ" },
  { sorani: "مور", kurmanji: "mêrû", category: "ئاژەڵ" },
  { sorani: "کارکوت", kurmanji: "karkût", category: "ئاژەڵ" },

  // More Body Parts - لەشی تر
  { sorani: "گوپشە", kurmanji: "gopşe", category: "لەش" },
  { sorani: "پاژنە", kurmanji: "pajin", category: "لەش" },
  { sorani: "پشتی پێ", kurmanji: "pişt pê", category: "لەش" },
  { sorani: "لەپی پێ", kurmanji: "lep pê", category: "لەش" },
  { sorani: "ڕان", kurmanji: "ran", category: "لەش" },
  { sorani: "چۆک", kurmanji: "çok", category: "لەش" },
  { sorani: "ناو چاو", kurmanji: "nav çav", category: "لەش" },
  { sorani: "برۆ", kurmanji: "birû", category: "لەش" },
  { sorani: "ملچە", kurmanji: "milçe", category: "لەش" },
  { sorani: "سپەندار", kurmanji: "spêndar", category: "لەش" },

  // Kitchen Items Extended - چێشتخانەی تر
  { sorani: "جانتا", kurmanji: "çanta", category: "چێشتخانە" },
  { sorani: "مەنجەڵ", kurmanji: "mencel", category: "چێشتخانە" },
  { sorani: "قاپی چێشت", kurmanji: "qabî çêşt", category: "چێشتخانە" },
  { sorani: "دەستەشۆر", kurmanji: "desteşor", category: "چێشتخانە" },
  { sorani: "مەلەقە", kurmanji: "meleqe", category: "چێشتخانە" },
  { sorani: "قەدەح", kurmanji: "qedeh", category: "چێشتخانە" },
  { sorani: "جام", kurmanji: "cam", category: "چێشتخانە" },
  { sorani: "کاسە", kurmanji: "kase", category: "چێشتخانە" },
  { sorani: "بوتڵ", kurmanji: "şûşe", category: "چێشتخانە" },
  { sorani: "قوتو", kurmanji: "quto", category: "چێشتخانە" },

  // More Weather Terms - کەشوهەوای تر
  { sorani: "بەردەم", kurmanji: "berdem", category: "کەشوهەوا" },
  { sorani: "بایەک", kurmanji: "bayek", category: "کەشوهەوا" },
  { sorani: "ڕەشەبا", kurmanji: "reşeba", category: "کەشوهەوا" },
  { sorani: "گەرمایی", kurmanji: "germahî", category: "کەشوهەوا" },
  { sorani: "سارایی", kurmanji: "sarahî", category: "کەشوهەوا" },
  { sorani: "شەپۆل", kurmanji: "şepol", category: "کەشوهەوا" },
  { sorani: "میژوو", kurmanji: "mij", category: "کەشوهەوا" },
  { sorani: "تەڕی", kurmanji: "nemî", category: "کەشوهەوا" },
  { sorani: "وشکایی", kurmanji: "wuşkahî", category: "کەشوهەوا" },

  // More Technology - تەکنەلۆژیای تر
  { sorani: "وێبکام", kurmanji: "webkam", category: "تەکنەلۆژیا" },
  { sorani: "سکانەر", kurmanji: "skaner", category: "تەکنەلۆژیا" },
  { sorani: "فاکس", kurmanji: "faks", category: "تەکنەلۆژیا" },
  { sorani: "کیبۆرد", kurmanji: "klavye", category: "تەکنەلۆژیا" },
  { sorani: "ماوس", kurmanji: "fare", category: "تەکنەلۆژیا" },
  { sorani: "مۆنیتەر", kurmanji: "ekran", category: "تەکنەلۆژیا" },
  { sorani: "سپیکەر", kurmanji: "hoparlör", category: "تەکنەلۆژیا" },
  { sorani: "مایکرۆفۆن", kurmanji: "mîkrofon", category: "تەکنەلۆژیا" },
  { sorani: "ڕۆوتەر", kurmanji: "router", category: "تەکنەلۆژیا" },
  { sorani: "وایفای", kurmanji: "wîfî", category: "تەکنەلۆژیا" },

  // More Buildings - بیناسازی تر
  { sorani: "بەربەرخانە", kurmanji: "berberxane", category: "بیناسازی" },
  { sorani: "نانەواخانە", kurmanji: "nanewaxane", category: "بیناسازی" },
  { sorani: "خانووبەرە", kurmanji: "xanûbere", category: "بیناسازی" },
  { sorani: "پرد", kurmanji: "pird", category: "بیناسازی" },
  { sorani: "بان", kurmanji: "ban", category: "بیناسازی" },
  { sorani: "پاڵانگا", kurmanji: "palanga", category: "بیناسازی" },
  { sorani: "سەردەم", kurmanji: "serdem", category: "بیناسازی" },
  { sorani: "ئاسانسۆر", kurmanji: "asansör", category: "بیناسازی" },
  { sorani: "پلەکان", kurmanji: "pelekan", category: "بیناسازی" },
  { sorani: "هۆڵ", kurmanji: "hol", category: "بیناسازی" },

  // More Emotions - هەستی تر
  { sorani: "ترسنۆک", kurmanji: "tirsok", category: "هەست" },
  { sorani: "تووڕە", kurmanji: "jê re", category: "هەست" },
  { sorani: "دڵخۆش", kurmanji: "kêfxweş", category: "هەست" },
  { sorani: "خەمبار", kurmanji: "xembar", category: "هەست" },
  { sorani: "سەرسام", kurmanji: "sersam", category: "هەست" },
  { sorani: "نیگەران", kurmanji: "xem", category: "هەست" },
  { sorani: "شاد", kurmanji: "şad", category: "هەست" },
  { sorani: "دەستپاک", kurmanji: "destpak", category: "هەست" },
  { sorani: "بێ ئەندازە", kurmanji: "bê endaze", category: "هەست" },
  { sorani: "سەروەری", kurmanji: "serwerî", category: "هەست" },

  // More Adjectives - ناولاوی تر
  { sorani: "هەموو", kurmanji: "hemû", category: "ناولاو" },
  { sorani: "هیچ", kurmanji: "tu", category: "ناولاو" },
  { sorani: "پاک", kurmanji: "paqij", category: "ناولاو" },
  { sorani: "پیس", kurmanji: "pîs", category: "ناولاو" },
  { sorani: "خۆش", kurmanji: "xweş", category: "ناولاو" },
  { sorani: "ناخۆش", kurmanji: "nexweş", category: "ناولاو" },
  { sorani: "قورس", kurmanji: "hişk", category: "ناولاو" },
  { sorani: "نەرم", kurmanji: "nerm", category: "ناولاو" },
  { sorani: "گرم", kurmanji: "germ", category: "ناولاو" },
  { sorani: "سارد", kurmanji: "sar", category: "ناولاو" },
  { sorani: "تازە", kurmanji: "taze", category: "ناولاو" },
  { sorani: "کۆن", kurmanji: "kevin", category: "ناولاو" },

  // Days of Week - ڕۆژەکانی هەفتە
  { sorani: "یەکشەممە", kurmanji: "yekşem", category: "کات" },
  { sorani: "دووشەممە", kurmanji: "duşem", category: "کات" },
  { sorani: "سێشەممە", kurmanji: "sêşem", category: "کات" },
  { sorani: "چوارشەممە", kurmanji: "çarşem", category: "کات" },
  { sorani: "پێنجشەممە", kurmanji: "pêncşem", category: "کات" },
  { sorani: "هەینی", kurmanji: "în", category: "کات" },
  { sorani: "شەممە", kurmanji: "şemî", category: "کات" },

  // Months - مانگەکان
  { sorani: "ڕێبەندان", kurmanji: "rêbendan", category: "کات" },
  { sorani: "ڕەشەمە", kurmanji: "reşeme", category: "کات" },
  { sorani: "نەورۆز", kurmanji: "newroz", category: "کات" },
  { sorani: "گوڵان", kurmanji: "gulan", category: "کات" },
  { sorani: "جۆزەردان", kurmanji: "cozerdan", category: "کات" },
  { sorani: "پووشپەڕ", kurmanji: "pûşper", category: "کات" },
  { sorani: "گەلاوێژ", kurmanji: "gelawêj", category: "کات" },
  { sorani: "خەرمانان", kurmanji: "xermanan", category: "کات" },
  { sorani: "ڕەزبەر", kurmanji: "rezber", category: "کات" },
  { sorani: "گەڵاڕێزان", kurmanji: "gelarêzan", category: "کات" },
  { sorani: "سەرماوەز", kurmanji: "sermawez", category: "کات" },
  { sorani: "بەفرانبار", kurmanji: "befranbar", category: "کات" },

  // More Verbs - کرداری تر
  { sorani: "پەیوەندیکردن", kurmanji: "têkilî kirin", category: "کردار" },
  { sorani: "ئامادەبوون", kurmanji: "amade bûn", category: "کردار" },
  { sorani: "دەستپێکردن", kurmanji: "dest pê kirin", category: "کردار" },
  { sorani: "کۆتاییهێنان", kurmanji: "kotayî hênan", category: "کردار" },
  { sorani: "بەردەوامبوون", kurmanji: "berdewam bûn", category: "کردار" },
  { sorani: "وەستان", kurmanji: "westan", category: "کردار" },
  { sorani: "ڕاوەستان", kurmanji: "rawestan", category: "کردار" },
  { sorani: "گەیشتن", kurmanji: "gîhîştin", category: "کردار" },
  { sorani: "ڕۆیشتن", kurmanji: "çûn", category: "کردار" },
  { sorani: "گەڕانەوە", kurmanji: "vegerîn", category: "کردار" },

  // More Directions - ئاراستەی تر
  { sorani: "لە کوێوە", kurmanji: "ji ku ve", category: "ئاراستە" },
  { sorani: "بۆ کوێ", kurmanji: "bo ku", category: "ئاراستە" },
  { sorani: "لە ناو", kurmanji: "ji nav", category: "ئاراستە" },
  { sorani: "لە سەر", kurmanji: "li ser", category: "ئاراستە" },
  { sorani: "لە ژێر", kurmanji: "li jêr", category: "ئاراستە" },
  { sorani: "لە پێش", kurmanji: "li pêş", category: "ئاراستە" },
  { sorani: "لە دوا", kurmanji: "li paş", category: "ئاراستە" },
  { sorani: "لە تەنیشت", kurmanji: "li kêleka", category: "ئاراستە" },

  // Question Words - پرسیار
  { sorani: "کێ؟", kurmanji: "kî?", category: "پرسیار" },
  { sorani: "چی؟", kurmanji: "çi?", category: "پرسیار" },
  { sorani: "کوا؟", kurmanji: "ku?", category: "پرسیار" },
  { sorani: "کەی؟", kurmanji: "kengî?", category: "پرسیار" },
  { sorani: "چۆن؟", kurmanji: "çawa?", category: "پرسیار" },
  { sorani: "بۆچی؟", kurmanji: "çima?", category: "پرسیار" },
  { sorani: "چەند؟", kurmanji: "çend?", category: "پرسیار" },
  { sorani: "کام؟", kurmanji: "kîjan?", category: "پرسیار" },
  
  // Animals - ئاژەڵەکان (9000-9099)
  // Domestic Animals (9001-9049)
  { sorani: "پشیلە", kurmanji: "pisîk", category: "ئاژەڵ", code: "9001" },
  { sorani: "سەگ", kurmanji: "kûçik", category: "ئاژەڵ", code: "9002" },
  { sorani: "ئەسپ", kurmanji: "hesp", category: "ئاژەڵ", code: "9003" },
  { sorani: "گا", kurmanji: "çêl", category: "ئاژەڵ", code: "9004" },
  { sorani: "مانگا", kurmanji: "manga", category: "ئاژەڵ", code: "9005" },
  { sorani: "بەرخ", kurmanji: "berx", category: "ئاژەڵ", code: "9006" },
  { sorani: "مەڕ", kurmanji: "pez", category: "ئاژەڵ", code: "9007" },
  { sorani: "بزن", kurmanji: "bizin", category: "ئاژەڵ", code: "9008" },
  { sorani: "مریشک", kurmanji: "mirîşk", category: "ئاژەڵ", code: "9009" },
  { sorani: "کەر", kurmanji: "ker", category: "ئاژەڵ", code: "9010" },
  { sorani: "قاز", kurmanji: "qaz", category: "ئاژەڵ", code: "9011" },
  { sorani: "وردک", kurmanji: "werdek", category: "ئاژەڵ", code: "9012" },
  { sorani: "کەوتر", kurmanji: "kevok", category: "ئاژەڵ", code: "9013" },
  
  // Wild Animals (9050-9099)
  { sorani: "شێر", kurmanji: "şêr", category: "ئاژەڵ", code: "9050" },
  { sorani: "هەرس", kurmanji: "hirç", category: "ئاژەڵ", code: "9051" },
  { sorani: "گوڕ", kurmanji: "gur", category: "ئاژەڵ", code: "9052" },
  { sorani: "ڕووی", kurmanji: "rûvî", category: "ئاژەڵ", code: "9053" },
  { sorani: "کەچەڵ", kurmanji: "keçel", category: "ئاژەڵ", code: "9054" },
  { sorani: "فیل", kurmanji: "fîl", category: "ئاژەڵ", code: "9055" },
  { sorani: "پیل", kurmanji: "pîl", category: "ئاژەڵ", code: "9056" },
  { sorani: "ماروو", kurmanji: "mar", category: "ئاژەڵ", code: "9057" },
  { sorani: "کوورە", kurmanji: "kûvî", category: "ئاژەڵ", code: "9058" },
  { sorani: "بۆری", kurmanji: "borî", category: "ئاژەڵ", code: "9059" },
  
  // Food & Drink - خۆراک و خواردنەوە (9100-9999)
  // Basic Foods (9100-9199)
  { sorani: "نان", kurmanji: "nan", category: "خۆراک", code: "9100" },
  { sorani: "برنج", kurmanji: "birinc", category: "خۆراک", code: "9101" },
  { sorani: "مکارۆنی", kurmanji: "makarônî", category: "خۆراک", code: "9102" },
  { sorani: "بورغوڵ", kurmanji: "bulgur", category: "خۆراک", code: "9103" },
  { sorani: "گەنم", kurmanji: "genim", category: "خۆراک", code: "9104" },
  { sorani: "جۆ", kurmanji: "cih", category: "خۆراک", code: "9105" },
  { sorani: "نۆک", kurmanji: "nok", category: "خۆراک", code: "9106" },
  { sorani: "لۆبیا", kurmanji: "lobya", category: "خۆراک", code: "9107" },
  { sorani: "عەدەس", kurmanji: "ades", category: "خۆراک", code: "9108" },
  { sorani: "نخود", kurmanji: "nixûd", category: "خۆراک", code: "9109" },
  
  // Meat & Protein (9200-9299)
  { sorani: "گۆشت", kurmanji: "goşt", category: "خۆراک", code: "9200" },
  { sorani: "گۆشتی مانگا", kurmanji: "goştê manga", category: "خۆراک", code: "9201" },
  { sorani: "گۆشتی مەڕ", kurmanji: "goştê pez", category: "خۆراک", code: "9202" },
  { sorani: "گۆشتی مریشک", kurmanji: "goştê mirîşk", category: "خۆراک", code: "9203" },
  { sorani: "ماسی", kurmanji: "masî", category: "خۆراک", code: "9204" },
  { sorani: "هێلکە", kurmanji: "hêlke", category: "خۆراک", code: "9205" },
  { sorani: "کبابا", kurmanji: "kebab", category: "خۆراک", code: "9206" },
  { sorani: "کۆفتە", kurmanji: "kofte", category: "خۆراک", code: "9207" },
  { sorani: "سوجق", kurmanji: "sucux", category: "خۆراک", code: "9208" },
  
  // Dairy Products (9300-9399)
  { sorani: "شیر", kurmanji: "şîr", category: "خۆراک", code: "9300" },
  { sorani: "پەنیر", kurmanji: "penîr", category: "خۆراک", code: "9301" },
  { sorani: "ماست", kurmanji: "mast", category: "خۆراک", code: "9302" },
  { sorani: "کرە", kurmanji: "kere", category: "خۆراک", code: "9303" },
  { sorani: "قەیماغ", kurmanji: "qeymex", category: "خۆراک", code: "9304" },
  { sorani: "دۆغ", kurmanji: "doğ", category: "خۆراک", code: "9305" },
  
  // Vegetables (9400-9499)
  { sorani: "سەوزە", kurmanji: "sebze", category: "خۆراک", code: "9400" },
  { sorani: "پیاز", kurmanji: "pîvaz", category: "خۆراک", code: "9401" },
  { sorani: "سیر", kurmanji: "sîr", category: "خۆراک", code: "9402" },
  { sorani: "تەماتە", kurmanji: "fireng", category: "خۆراک", code: "9403" },
  { sorani: "بادنجان", kurmanji: "bacan", category: "خۆراک", code: "9404" },
  { sorani: "خیار", kurmanji: "xiyar", category: "خۆراک", code: "9405" },
  { sorani: "گەزەر", kurmanji: "gizer", category: "خۆراک", code: "9406" },
  { sorani: "کەلەرم", kurmanji: "kelerm", category: "خۆراک", code: "9407" },
  { sorani: "کاهو", kurmanji: "kahu", category: "خۆراک", code: "9408" },
  { sorani: "سپیناخ", kurmanji: "spînax", category: "خۆراک", code: "9409" },
  { sorani: "شوتاڵە", kurmanji: "şutale", category: "خۆراک", code: "9410" },
  { sorani: "فڵفڵ", kurmanji: "biber", category: "خۆراک", code: "9411" },
  { sorani: "بامیە", kurmanji: "bamye", category: "خۆراک", code: "9412" },
  { sorani: "کووندر", kurmanji: "gûzir", category: "خۆراک", code: "9413" },
  
  // Fruits (9500-9599)
  { sorani: "میوە", kurmanji: "fêkî", category: "خۆراک", code: "9500" },
  { sorani: "سێو", kurmanji: "sêv", category: "خۆراک", code: "9501" },
  { sorani: "موز", kurmanji: "moz", category: "خۆراک", code: "9502" },
  { sorani: "پرتەقاڵ", kurmanji: "pirteqal", category: "خۆراک", code: "9503" },
  { sorani: "لیمۆ", kurmanji: "lîmo", category: "خۆراک", code: "9504" },
  { sorani: "ئەنجیر", kurmanji: "hejîr", category: "خۆراک", code: "9505" },
  { sorani: "ئەنگور", kurmanji: "tirî", category: "خۆراک", code: "9506" },
  { sorani: "هەندێوانە", kurmanji: "zebeş", category: "خۆراک", code: "9507" },
  { sorani: "خەربووزە", kurmanji: "qûn", category: "خۆراک", code: "9508" },
  { sorani: "هەناری", kurmanji: "hinar", category: "خۆراک", code: "9509" },
  { sorani: "تۆو", kurmanji: "tû", category: "خۆراک", code: "9510" },
  { sorani: "چەرز", kurmanji: "çerz", category: "خۆراک", code: "9511" },
  { sorani: "گولاب", kurmanji: "gulab", category: "خۆراک", code: "9512" },
  { sorani: "ئالووچە", kurmanji: "aluç", category: "خۆراک", code: "9513" },
  { sorani: "زەردەآلوو", kurmanji: "zerdealu", category: "خۆراک", code: "9514" },
  
  // Beverages (9600-9699)
  { sorani: "ئاو", kurmanji: "av", category: "خۆراک", code: "9600" },
  { sorani: "چا", kurmanji: "çay", category: "خۆراک", code: "9601" },
  { sorani: "قاوە", kurmanji: "qehwe", category: "خۆراک", code: "9602" },
  { sorani: "شەربەت", kurmanji: "şerbet", category: "خۆراک", code: "9603" },
  { sorani: "کۆکا", kurmanji: "koka", category: "خۆراک", code: "9604" },
  { sorani: "ئاوی میوە", kurmanji: "avê fêkî", category: "خۆراک", code: "9605" },
  { sorani: "ئاوی لیمۆ", kurmanji: "avê lîmo", category: "خۆراک", code: "9606" },
  { sorani: "عەرەق", kurmanji: "eraq", category: "خۆراک", code: "9607" },
  
  // Spices & Seasonings (9700-9799)
  { sorani: "خوێ", kurmanji: "xwê", category: "خۆراک", code: "9700" },
  { sorani: "بیبەر", kurmanji: "biber", category: "خۆراک", code: "9701" },
  { sorani: "زەعفەران", kurmanji: "za'feran", category: "خۆراک", code: "9702" },
  { sorani: "زەیرە", kurmanji: "zêre", category: "خۆراک", code: "9703" },
  { sorani: "نیعنا", kurmanji: "pûng", category: "خۆراک", code: "9704" },
  { sorani: "دارچین", kurmanji: "darçîn", category: "خۆراک", code: "9705" },
  { sorani: "زەردەچۆبە", kurmanji: "zerdeçobe", category: "خۆراک", code: "9706" },
  { sorani: "کەمون", kurmanji: "kemûn", category: "خۆراک", code: "9707" },
  { sorani: "گوڵی میخەک", kurmanji: "mixek", category: "خۆراک", code: "9708" },
  { sorani: "کاردامۆن", kurmanji: "kardamon", category: "خۆراک", code: "9709" },
  
  // Sweets & Desserts (9800-9899)
  { sorani: "شیرینی", kurmanji: "şîrînî", category: "خۆراک", code: "9800" },
  { sorani: "کێک", kurmanji: "kek", category: "خۆراک", code: "9801" },
  { sorani: "شۆکلێت", kurmanji: "çokolat", category: "خۆراک", code: "9802" },
  { sorani: "هەنگوین", kurmanji: "hingiv", category: "خۆراک", code: "9803" },
  { sorani: "شەکر", kurmanji: "şekir", category: "خۆراک", code: "9804" },
  { sorani: "بەقلاوا", kurmanji: "beqlawa", category: "خۆراک", code: "9805" },
  { sorani: "کلۆچە", kurmanji: "kuloçe", category: "خۆراک", code: "9806" },
  { sorani: "حەلوا", kurmanji: "helwe", category: "خۆراک", code: "9807" },
  { sorani: "گەز", kurmanji: "gez", category: "خۆراک", code: "9808" },
  { sorani: "پەستە", kurmanji: "peste", category: "خۆراک", code: "9809" }
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

  // Force purple background by overriding parent styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      main[class*="bg-background"] {
        background: linear-gradient(to bottom right, rgb(243 232 255), rgb(250 245 255), rgb(224 231 255)) !important;
      }
      .sidebar-inset-override {
        background: linear-gradient(to bottom right, rgb(243 232 255), rgb(250 245 255), rgb(224 231 255)) !important;
        min-height: 100vh !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
    
    // Check if it's a single word or multiple words
    const words = text.split(/[\s،؛۔]+/).filter(word => word.length > 0);
    const isSingleWord = words.length === 1;

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

    if (isSingleWord) {
      // For single word: Try dictionary first, then AI if not found
      const cleanedWord = text.replace(/[َُِّْ]/g, '');
      const dictionaryTranslation = translationMap.get(text) || translationMap.get(cleanedWord);
      
      if (dictionaryTranslation) {
        setTranslatedText(dictionaryTranslation);
        toast.success(`Dictionary translated "${text}" from ${sourceDialect} to ${targetDialect}`);
      } else {
        // Single word not found in dictionary, use AI
        toast.info('Word not found in dictionary. Using AI translation...');
        try {
          const aiPrompt = `As an expert in Kurdish dialects, translate the following single word from **${sourceDialect === 'sorani' ? 'Sorani' : 'Kurmanji'}** to **${targetDialect === 'kurmanji' ? 'Kurmanji' : 'Sorani'}**.

**Word to Translate:**
"${text}"

**Translation Guidelines:**
1.  **Accuracy:** Provide the most common and accurate translation for this word.
2.  **Dialect-Specific Vocabulary:** Ensure the translation uses the correct vocabulary for the target dialect.
3.  **Proper Nouns:** If the word is a proper noun, it should remain unchanged.

**Your Task:**
Provide only the translated word, without any additional explanations.

**Translated Word:**`;

          const aiTranslation = await geminiService.translateText(aiPrompt);
          if (aiTranslation && aiTranslation.trim() !== text) {
            setTranslatedText(aiTranslation.trim());
            toast.success(`AI translated word "${text}" from ${sourceDialect} to ${targetDialect}`);
          } else {
            setTranslatedText(`[لە فەرهەنگدا نەدۆزرایەوە] ${text}`);
            toast.warning('AI translation failed for this word. Try checking the spelling.');
          }
        } catch (error) {
          console.error('AI translation error:', error);
          setTranslatedText(`[لە فەرهەنگدا نەدۆزرایەوە] ${text}`);
          toast.error('AI translation failed. Check your connection.');
        }
      }
    } else {
      // For sentences (multiple words): Always use AI for better context
      toast.info('Translating sentence using AI for better context...');
      try {
        const aiPrompt = `As an expert in Kurdish dialects, translate the following text from **${sourceDialect === 'sorani' ? 'Sorani' : 'Kurmanji'}** to **${targetDialect === 'kurmanji' ? 'Kurmanji' : 'Sorani'}**.

**Text to Translate:**
"${text}"

**Translation Guidelines:**
1.  **Accuracy:** Prioritize direct and accurate translation.
2.  **Dialect-Specific Vocabulary:** Use the correct vocabulary for the target dialect (e.g., "çay" in Sorani vs. "çay" in Kurmanji).
3.  **Grammar and Syntax:** Adapt the sentence structure to fit the grammatical rules of the target dialect.
4.  **Clarity:** Ensure the translation is clear and natural-sounding.

**Example:**
-   **Sorani to Kurmanji:** "من دەچم بۆ بازاڕ" → "ez diçim bazarê"
-   **Kurmanji to Sorani:** "ew pirtûkekê dixwîne" → "ئەو کتێبێک دەخوێنێتەوە"

**Your Task:**
Provide only the translated text, without any additional explanations.

**Translated Text:**`;

        const aiTranslation = await geminiService.translateText(aiPrompt);
        if (aiTranslation && aiTranslation.trim() !== text) {
          setTranslatedText(aiTranslation.trim());
          toast.success(`AI translated sentence from ${sourceDialect} to ${targetDialect}`);
        } else {
          setTranslatedText(`[AI translation unavailable] ${text}`);
          toast.warning('AI translation failed. Try breaking down into smaller parts.');
        }
      } catch (error) {
        console.error('AI translation error:', error);
        setTranslatedText(`[وەرگێڕان نەکرا] ${text}`);
        toast.error('AI translation failed. Check your connection.');
      }
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
    <div className="sidebar-inset-override min-h-screen w-full p-4" dir="rtl">
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
                    <div key={index} className="border border-purple-300 bg-white/90 backdrop-blur rounded-lg p-4 hover:shadow-md hover:bg-purple-50/90 transition-all duration-200">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <Badge variant="secondary" className="text-xs bg-purple-600 text-white border-purple-600">
                            {item.category}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="text-right">
                            <span className="font-semibold text-purple-700">سۆرانی: </span>
                            <span className="text-lg text-gray-900 font-medium">{item.sorani}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-indigo-700">کورمانجی: </span>
                            <span className="text-lg text-gray-900 font-medium">{item.kurmanji}</span>
                          </div>
                          {item.notes && (
                            <div className="text-sm text-gray-700 mt-2 bg-gray-100 p-2 rounded">
                              {item.notes}
                            </div>
                          )}
                          <div className="mt-3 flex gap-2 justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setInputText(item.sorani)}
                              className="text-xs h-7 px-3 bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200 hover:text-purple-900"
                            >
                              سۆرانی
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setInputText(item.kurmanji)}
                              className="text-xs h-7 px-3 bg-indigo-100 border-indigo-300 text-indigo-800 hover:bg-indigo-200 hover:text-indigo-900"
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
