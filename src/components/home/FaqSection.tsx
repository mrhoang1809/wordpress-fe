'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'Tôi chưa bao giờ tập gym, có theo kịp bài tập tại Curves không?',
    a: 'Hoàn toàn được! Phương pháp Curves được thiết kế đặc biệt cho phụ nữ ở mọi mức độ thể trạng. Ngay buổi đầu tiên, Huấn luyện viên nữ sẽ hướng dẫn chi tiết từng máy và đồng hành cùng bạn trong suốt quá trình tập.',
  },
  {
    q: 'Máy kháng thủy lực là gì và tại sao lại an toàn cho phụ nữ?',
    a: 'Máy kháng thủy lực hoạt động dựa trên áp suất chất lỏng (tương tự như lực cản của nước khi bạn bơi). Máy không dùng tạ kim loại nặng nên không tạo lực tác động xấu lên đĩa đệm hay khớp xương, giúp loại bỏ nguy cơ chấn thương.',
  },
  {
    q: 'Chi phí tập tại Curves là bao nhiêu?',
    a: 'Curves cung cấp nhiều gói hội viên linh hoạt theo tháng, quý hoặc năm với chi phí vô cùng hợp lý (chỉ từ vài chục ngàn/ngày). Khi đăng ký tập thử miễn phí, bạn sẽ được tư vấn chi tiết gói tập phù hợp nhất với mục tiêu tài chính và vóc dáng.',
  },
  {
    q: 'Lịch mở cửa của câu lạc bộ như thế nào?',
    a: 'Hệ thống Curves áp dụng khung giờ hoạt động linh hoạt: Ca Sáng từ 10:30 đến 13:00 / Ca Chiều từ 16:00 đến 19:30 (Từ Thứ 2 đến Thứ 6 và Sáng Thứ 7). Bạn có thể ghé tập bất kỳ lúc nào trong khung giờ này mà không bị gò bó lịch hẹn.',
  },
];

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section id="faq" className="py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-brand-700 font-bold text-xs uppercase tracking-widest bg-brand-100 px-3 py-1 rounded-full">
            Giải Đáp Thắc Mắc
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-900 mt-3">
            Câu Hỏi Thường Gặp
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <button
                  onClick={() => toggle(i)}
                  className="w-full px-6 py-5 text-left font-bold text-brand-900 flex justify-between items-center hover:bg-brand-50/50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-brand-600 transition-transform duration-300 shrink-0 ml-4 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
