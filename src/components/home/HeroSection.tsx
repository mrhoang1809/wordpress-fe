'use client';

import { useTrialModal } from './TrialRegistrationModal';

export function HeroSection() {
  const { open } = useTrialModal();

  return (
    <section className="relative bg-mesh-gradient text-white overflow-hidden py-16 lg:py-24">
      {/* Background blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-magenta/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-yellow-300 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full">
              <span className="text-accent-pink">♥</span>
              <span>Giải Pháp Sức Khỏe &amp; Vóc Dáng Số 1 Cho Phụ Nữ Bận Rộn</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight text-white tracking-tight">
              Phòng Tập Gym{' '}
              <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-accent-magenta bg-clip-text text-transparent">
                30 Phút
              </span>{' '}
              Dành Riêng Cho Phái Nữ
            </h1>

            {/* Philosophy badge */}
            <div className="py-3 px-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 inline-block w-full max-w-xl">
              <p className="text-xs sm:text-sm font-bold text-pink-200 uppercase tracking-wider mb-1">
                Triết lý độc bản tại Curves
              </p>
              <div className="flex flex-wrap justify-around gap-2 text-sm font-extrabold text-white">
                {['Không Đàn Ông', 'Không Gương Soi', 'Không Trang Điểm'].map((v) => (
                  <span key={v} className="flex items-center gap-1">
                    <span className="text-green-400">✓</span> {v}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-slate-200 text-base sm:text-lg max-w-2xl font-light leading-relaxed">
              Phương pháp tập luyện kết hợp Tim Mạch - Sức Mạnh Kháng Thủy Lực - Giãn Cơ độc quyền
              giúp đốt cháy đến 500 Calories chỉ trong 30 phút. Thoải mái tập luyện trong không gian
              riêng tư, vui vẻ và an toàn.
            </p>

            {/* CTA group */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => open('Hero Main CTA')}
                className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-brand-900 font-black px-8 py-4 rounded-full shadow-2xl hover:shadow-yellow-500/40 hover:scale-105 transition-all text-base flex items-center justify-center gap-3"
              >
                📅 ĐẶT LỊCH ĐO INBODY &amp; TẬP THỬ MIỄN PHÍ
              </button>
              <a
                href="#workout"
                className="w-full sm:w-auto text-center font-bold text-white hover:text-yellow-300 py-3 px-6 border border-white/30 rounded-full hover:bg-white/10 transition-colors text-sm"
              >
                Tìm hiểu phương pháp
              </a>
            </div>

            {/* Stat badges */}
            <div className="pt-8 border-t border-white/15 grid grid-cols-3 gap-4 text-center">
              {[
                { value: '30 Phút', label: 'Tiết kiệm thời gian', color: 'text-yellow-300' },
                { value: '500 kcal', label: 'Tiêu hao tối đa', color: 'text-pink-300' },
                { value: '100%', label: 'Nữ giới đồng hành', color: 'text-purple-200' },
              ].map((s) => (
                <div key={s.value} className="bg-white/5 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
                  <div className={`text-2xl sm:text-3xl font-black ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-slate-300">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute inset-0 bg-gradient-to-tr from-accent-magenta to-yellow-400 rounded-3xl transform rotate-3 scale-105 opacity-40 blur-lg" />
              <div className="relative bg-white text-slate-800 rounded-3xl p-6 shadow-2xl border border-white/40">
                <div className="relative rounded-2xl overflow-hidden mb-6 h-72 sm:h-80 bg-brand-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80"
                    alt="Nữ tập gym Curves"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-brand-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                    Hơn 30 Chi Nhánh
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>TRẢI NGHIỆM ĐỘC BẢN</span>
                    <span className="text-accent-magenta font-bold">HLV Nữ 1-on-1</span>
                  </div>
                  <h3 className="text-lg font-bold text-brand-900">
                    Không gian tập luyện thoải mái nhất cho phụ nữ
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Bạn không cần lo lắng về trang phục, không lo ánh nhìn dèm pha. Hãy đến với
                    không gian âm nhạc sôi động và sự hỗ trợ nhiệt tình từ Huấn luyện viên nữ.
                  </p>
                  <button
                    onClick={() => open('Hero Card Banner')}
                    className="w-full py-3 bg-brand-50 hover:bg-brand-100 text-brand-800 font-bold text-sm rounded-xl transition-colors border border-brand-200 flex items-center justify-center gap-2"
                  >
                    Nhận Voucher Tập Thử 3 Ngày →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
