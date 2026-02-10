
import React from 'react';
import { ShieldCheck, Zap, Users, AlertTriangle, Instagram } from 'lucide-react';

// Custom SVGs for icons not available in the icon set
const TikTokIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.394 6.394 0 0 0-5.394 10.137 6.362 6.362 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
  </svg>
);

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020202] py-20 px-4 relative overflow-hidden">
      {/* Background Abstract */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] -z-0"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -z-0"></div>

      <div className="max-w-4xl mx-auto relative z-10 text-right">
        {/* Header */}
        <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6">
                قصة <span className="text-blue-600 drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]">BLOX STORE</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto font-bold leading-relaxed mb-10">
                وجهتك الأولى والموثوقة لامتلاك أقوى حسابات وفواكه Blox Fruits بأمان وسرعة خيالية.
            </p>

            {/* Social Media Links */}
            <div className="flex justify-center gap-6">
                <a href="https://www.instagram.com/bloxstore87?igsh=MWh4bTM0d3I0OTgwcA==" target="_blank" rel="noopener noreferrer" className="w-16 h-16 bg-[#111] rounded-[1.5rem] flex items-center justify-center text-pink-500 hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(236,72,153,0.1)] hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] border border-gray-800 hover:border-pink-500/50 hover:bg-pink-900/10 group">
                    <Instagram size={32} className="group-hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
                </a>
                <a href="https://tiktok.com/@blox.store92" target="_blank" rel="noopener noreferrer" className="w-16 h-16 bg-[#111] rounded-[1.5rem] flex items-center justify-center text-gray-200 hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] border border-gray-800 hover:border-white/50 hover:bg-white/5 group">
                    <TikTokIcon size={30} className="group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                </a>
            </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-[#0a0a0a] p-8 rounded-[2rem] border border-gray-800 text-center hover:border-blue-900/50 transition-all group duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center text-blue-500 mx-auto mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                    <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-black text-white mb-3">أمان 100%</h3>
                <p className="text-gray-500 text-sm font-bold leading-relaxed">نضمن لك عملية شراء آمنة وحسابات نظيفة ومتحقق منها بالكامل لضمان راحة بالك.</p>
            </div>
            <div className="bg-[#0a0a0a] p-8 rounded-[2rem] border border-gray-800 text-center hover:border-blue-900/50 transition-all group duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center text-orange-500 mx-auto mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                    <Zap size={32} />
                </div>
                <h3 className="text-xl font-black text-white mb-3">تسليم فوري</h3>
                <p className="text-gray-500 text-sm font-bold leading-relaxed">نظام تسليم سريع وفعال يضمن حصولك على طلبك في أسرع وقت ممكن بعد تأكيد الدفع.</p>
            </div>
            <div className="bg-[#0a0a0a] p-8 rounded-[2rem] border border-gray-800 text-center hover:border-blue-900/50 transition-all group duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center text-green-500 mx-auto mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    <Users size={32} />
                </div>
                <h3 className="text-xl font-black text-white mb-3">دعم متواصل</h3>
                <p className="text-gray-500 text-sm font-bold leading-relaxed">فريق دعم فني متخصص جاهز لمساعدتك والإجابة على استفساراتك وحل أي مشكلة تواجهك.</p>
            </div>
        </div>

        {/* Mission Content */}
        <div className="bg-[#0a0a0a] rounded-[3rem] p-10 md:p-14 border border-gray-800 mb-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px]"></div>
            <h2 className="text-3xl font-black text-white mb-8 relative z-10 border-r-4 border-blue-600 pr-4">رؤيتنا ومهمتنا</h2>
            <div className="space-y-6 text-gray-400 font-medium relative z-10 leading-loose text-lg">
                <p>
                    تأسس <span className="text-white font-bold">Blox Store</span> بهدف سد الفجوة في سوق الألعاب العربي، حيث كان اللاعبون يواجهون صعوبة في إيجاد متاجر موثوقة لشراء حسابات وعناصر الألعاب بأسعار منافسة وبطرق دفع مريحة.
                </p>
                <p>
                    نحن نسعى لتقديم تجربة تسوق احترافية تليق باللاعبين العرب، مع التركيز الكامل على الشفافية، المصداقية، والجودة العالية للمنتجات. كل حساب يتم عرضه في متجرنا يمر بعملية فحص دقيقة للتأكد من خلوه من أي مشاكل تقنية أو أمنية.
                </p>
            </div>
        </div>

        {/* Disclaimer */}
        <div className="border border-red-900/30 bg-red-900/5 rounded-[2rem] p-8 flex flex-col md:flex-row gap-6 items-start backdrop-blur-sm">
            <div className="bg-red-900/20 p-3 rounded-full text-red-500 shrink-0">
                <AlertTriangle size={24} />
            </div>
            <div>
                <h4 className="text-red-500 font-black text-lg mb-2">إخلاء مسؤولية قانوني</h4>
                <p className="text-gray-500 text-xs leading-relaxed font-bold">
                    Blox Store هو متجر مستقل ولا يتبع لشركة Roblox Corporation أو Gamer Robot Inc (مطوري Blox Fruits) بأي شكل من الأشكال. جميع الحقوق التجارية للعبة وشخصياتها مملوكة لأصحابها الأصليين. نحن نقدم خدمة وساطة وبيع حسابات تم تطويرها بشكل قانوني وآمن، ولا نتحمل مسؤولية سوء استخدام الحسابات بعد البيع.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default About;
