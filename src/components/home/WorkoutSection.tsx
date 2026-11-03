'use client';

import { useState } from 'react';

const TABS = [
  {
    id: 1,
    duration: '10 Phút',
    title: 'Khởi Động & Tim Mạch',
    subtitle: 'Đốt mỡ thừa & làm nóng toàn thân',
    badge: 'Giai Đoạn 1',
    fullTitle: 'Khởi Động Năng Lượng & Tim Mạch (Cardio)',
    desc: 'Cơ thể bắt đầu thích nghi với nhịp độ vận động thông qua các đĩa phục hồi chuyển động liên tục. Nhịp tim tăng nhẹ giúp máu lưu thông tốt hơn, kích hoạt quá trình đốt cháy chất béo và làm nóng các khớp trước khi bước vào tập kháng lực.',
    points: [
      'Kích hoạt nhịp tim tối ưu đốt mỡ',
      'Giảm nguy cơ chấn thương xương khớp',
      'Âm nhạc sôi động truyền năng lượng',
    ],
    img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    duration: '15 Phút',
    title: 'Máy Kháng Thủy Lực',
    subtitle: 'Săn chắc cơ bắp & an toàn khớp',
    badge: 'Giai Đoạn 2',
    fullTitle: 'Tập Luyện Máy Kháng Thủy Lực',
    desc: 'Hệ thống máy kháng thủy lực độc quyền tại Curves tự động điều chỉnh lực kháng theo sức đẩy của từng người. Không tạ nặng, không áp lực khớp. Đây là giai đoạn cốt lõi giúp tăng cơ, định hình vóc dáng và đốt mỡ hiệu quả nhất.',
    points: [
      'Tự động điều chỉnh lực theo thể trạng',
      'An toàn tuyệt đối cho mọi khớp xương',
      'Tập đủ 8 nhóm cơ chính trong 15 phút',
    ],
    img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    duration: '5 Phút',
    title: 'Thả Lỏng & Giãn Cơ',
    subtitle: 'Tránh đau mỏi & thon gọn cơ',
    badge: 'Giai Đoạn 3',
    fullTitle: 'Thả Lỏng, Giãn Cơ & Phục Hồi',
    desc: 'Giai đoạn cuối giúp cơ thể trở về trạng thái bình thường, giảm axit lactic tích tụ trong cơ bắp. Các bài giãn cơ nhẹ nhàng giúp tăng độ linh hoạt, ngăn ngừa đau mỏi sau tập và giúp cơ phục hồi nhanh chóng để sẵn sàng cho buổi tập kế tiếp.',
    points: [
      'Giảm đau nhức cơ sau tập hiệu quả',
      'Tăng độ dẻo dai và linh hoạt khớp',
      'Cân bằng nhịp tim, thư giãn tinh thần',
    ],
    img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
  },
];

export function WorkoutSection() {
  const [activeTab, setActiveTab] = useState(1);
  const tab = TABS.find((t) => t.id === activeTab)!;

  return (
    <section id="workout" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-accent-magenta font-bold text-xs uppercase tracking-widest bg-accent-pink/10 px-3 py-1 rounded-full">
            Bí Quyết Khoa Học
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-900 mt-3">
            Vòng Tập 30 Phút Diệu Kỳ Tại Curves
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">
            Tối ưu hóa thời gian cho phụ nữ bận rộn. Kết hợp hoàn hảo giữa 3 giai đoạn giúp tăng cơ,
            giảm mỡ và phục hồi tức thì.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-brand-100">
          {/* Tab buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {TABS.map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
                    active
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-slate-200 hover:border-brand-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-sm ${
                        active
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {t.id}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        active
                          ? 'bg-brand-200 text-brand-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {t.duration}
                    </span>
                  </div>
                  <h4 className={`font-bold text-base ${active ? 'text-brand-900' : 'text-slate-800'}`}>
                    {t.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">{t.subtitle}</p>
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-brand-50/50 p-6 sm:p-8 rounded-2xl border border-brand-100">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-brand-600 text-white">
                {tab.badge}
              </div>
              <h3 className="text-2xl font-extrabold text-brand-900">{tab.fullTitle}</h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{tab.desc}</p>
              <ul className="space-y-2 text-sm text-slate-700 font-medium pt-2">
                {tab.points.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">✓</span> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-5">
              <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tab.img}
                  alt={tab.fullTitle}
                  className="w-full h-full object-cover transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
