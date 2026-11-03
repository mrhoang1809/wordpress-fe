'use client';

import { useTrialModal } from './TrialRegistrationModal';

const CARDS = [
  {
    icon: '🛡️',
    title: 'Máy Kháng Thủy Lực',
    subtitle: 'Tự động điều chỉnh lực theo sức đẩy của người tập. An toàn tuyệt đối cho khớp.',
    backTitle: 'Công Nghệ Độc Quyền',
    backDesc:
      'Không tạ nặng gây áp lực lên cột sống hay đầu gối. Khi bạn đẩy nhanh, kháng lực tăng; khi bạn đẩy chậm, kháng lực giảm. Phù hợp cho mọi thể trạng!',
    cta: 'Tập Thử Ngay',
    iconBg: 'bg-brand-100 text-brand-700',
    source: 'Advantage 1',
  },
  {
    icon: '👩‍🏫',
    title: 'HLV Nữ Đồng Hành',
    subtitle: 'Đội ngũ HLV nữ tận tâm hướng dẫn từng động tác trong suốt buổi tập.',
    backTitle: 'Tận Tâm & Thấu Hiểu',
    backDesc:
      'Luôn có Huấn luyện viên túc trực ở trung tâm vòng tập để chỉnh sửa tư thế, đo đạc chỉ số hàng tháng và tiếp thêm động lực cho bạn mỗi ngày.',
    cta: 'Gặp HLV Nữ',
    iconBg: 'bg-pink-100 text-accent-magenta',
    source: 'Advantage 2',
  },
  {
    icon: '❤️',
    title: 'Mọi Độ Tuổi Phụ Nữ',
    subtitle: 'Từ bạn trẻ sinh viên, nhân viên văn phòng tới phụ nữ trung niên.',
    backTitle: 'Thích Hợp Từ 18 - 70+',
    backDesc:
      'Bài tập thiết kế không phân biệt tuổi tác. Giúp cải thiện chứng đau lưng, mỏi cổ vai cánh tay và gia tăng mật độ xương hiệu quả.',
    cta: 'Đăng Ký Ngay',
    iconBg: 'bg-purple-100 text-brand-600',
    source: 'Advantage 3',
  },
  {
    icon: '😊',
    title: 'Thoải Mái Tối Đa',
    subtitle: 'Không gương, không đánh giá, hoàn toàn tự do là chính mình.',
    backTitle: 'Tự Tin Tập Luyện',
    backDesc:
      'Bạn không cần phải lo makeup hay mặc đồ tập quá gợi cảm. Đến với Curves, bạn chỉ cần mặc đồ thoải mái và mỉm cười tập hết mình!',
    cta: 'Khám Phá Thêm',
    iconBg: 'bg-amber-100 text-amber-700',
    source: 'Advantage 4',
  },
];

export function AdvantagesSection() {
  const { open } = useTrialModal();

  return (
    <section id="advantages" className="py-20 bg-gradient-to-b from-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-700 font-bold text-xs uppercase tracking-widest bg-brand-100 px-3 py-1 rounded-full">
            Ưu Thế Tối Ưu
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-900 mt-3">
            Vì Sao Hơn 10 Tỷ Phụ Nữ Chọn Curves?
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">
            Rê chuột hoặc chạm vào từng thẻ bên dưới để khám phá những đặc quyền dành riêng cho bạn!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CARDS.map((c) => (
            <div key={c.title} className="flip-card h-80 cursor-pointer">
              <div className="flip-card-inner relative w-full h-full shadow-lg rounded-3xl border border-purple-100 bg-white">
                {/* Front */}
                <div className="flip-card-front absolute inset-0 p-8 flex flex-col items-center justify-center text-center rounded-3xl bg-white">
                  <div className={`w-16 h-16 rounded-2xl ${c.iconBg} flex items-center justify-center mb-6 text-3xl`}>
                    {c.icon}
                  </div>
                  <h3 className="text-xl font-bold text-brand-900 mb-2">{c.title}</h3>
                  <p className="text-xs text-slate-500">{c.subtitle}</p>
                  <span className="mt-6 text-xs font-bold text-accent-magenta">Lật xem chi tiết →</span>
                </div>
                {/* Back */}
                <div className="flip-card-back absolute inset-0 p-8 flex flex-col items-center justify-center text-center rounded-3xl bg-gradient-to-br from-brand-800 to-brand-900 text-white">
                  <h4 className="text-lg font-bold text-yellow-300 mb-3">{c.backTitle}</h4>
                  <p className="text-xs text-slate-200 leading-relaxed">{c.backDesc}</p>
                  <button
                    onClick={() => open(c.source)}
                    className="mt-4 text-xs font-bold bg-white text-brand-900 px-4 py-2 rounded-full"
                  >
                    {c.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
