'use client';

import { useState } from 'react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail('');
  };

  return (
    <footer className="bg-brand-dark text-slate-300 pt-16 pb-12 border-t border-brand-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-brand-900/60">
          {/* Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent-magenta flex items-center justify-center text-white font-black text-xl">
                C
              </div>
              <span className="text-xl font-black text-white tracking-wider">CURVES VIETNAM</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Thương hiệu phòng tập 30 phút dành riêng cho phụ nữ lớn nhất thế giới. Tự hào đồng
              hành cùng sức khỏe và vẻ đẹp phái nữ Việt Nam.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {[
                { label: 'Facebook', emoji: '📘' },
                { label: 'YouTube', emoji: '▶️' },
                { label: 'Instagram', emoji: '📸' },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-accent-magenta flex items-center justify-center text-white transition-colors text-sm"
                >
                  {s.emoji}
                </a>
              ))}
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Giờ Hoạt Động</h4>
            <div className="text-xs space-y-2 text-slate-300">
              <p className="font-semibold text-pink-300">Thứ 2 - Thứ 6:</p>
              <p>• Ca sáng: 10:30 - 13:00</p>
              <p>• Ca chiều: 16:00 - 19:30</p>
              <p className="font-semibold text-pink-300 pt-1">Thứ 7:</p>
              <p>• Ca sáng: 10:00 - 13:00</p>
              <p className="text-slate-400 italic pt-1">* Chủ Nhật &amp; Ngày Lễ nghỉ</p>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Liên Kết Nhanh</h4>
            <ul className="text-xs space-y-2">
              {[
                ['#about', 'Triết lý 3 Không'],
                ['#workout', 'Phương pháp 30 phút'],
                ['#advantages', 'Máy kháng thủy lực'],
                ['#locations', 'Danh sách chi nhánh'],
                ['#faq', 'Chính sách hội viên'],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="hover:text-pink-300 transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Đăng Ký Nhận Tin</h4>
            <p className="text-xs text-slate-400">
              Nhận mẹo chăm sóc sức khỏe &amp; ưu đãi hội viên mới nhất.
            </p>
            {submitted ? (
              <p className="text-xs text-green-400 font-semibold">✓ Đã đăng ký thành công!</p>
            ) : (
              <form onSubmit={handleNewsletter} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email của bạn..."
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-accent-magenta"
                />
                <button
                  type="submit"
                  className="w-full bg-accent-magenta hover:bg-accent-pink text-white font-bold py-2 rounded-xl text-xs transition-colors"
                >
                  Đăng Ký
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="pt-8 text-center text-xs text-slate-500">
          <p>© 2026 Curves Vietnam. All rights reserved. Trải nghiệm Gym 30 Phút Cho Phái Nữ.</p>
        </div>
      </div>
    </footer>
  );
}
