'use client';

import { useState } from 'react';
import { useTrialModal } from './TrialRegistrationModal';

interface CalcResult {
  bmi: number;
  bmiLabel: string;
  bmiColor: string;
  curvesCal: number;
  normalCal: number;
}

function calcBMI(age: number, height: number, weight: number, activity: number): CalcResult {
  const bmi = weight / ((height / 100) ** 2);
  let bmiLabel = 'Bình thường';
  let bmiColor = 'text-green-600';
  if (bmi < 18.5) { bmiLabel = 'Thiếu cân'; bmiColor = 'text-blue-600'; }
  else if (bmi >= 25 && bmi < 30) { bmiLabel = 'Thừa cân'; bmiColor = 'text-yellow-600'; }
  else if (bmi >= 30) { bmiLabel = 'Béo phì'; bmiColor = 'text-red-600'; }

  const bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  const tdee = bmr * activity;
  const curvesCal = Math.round((tdee / 24 / 60) * 30 * 1.8);
  const normalCal = Math.round((tdee / 24 / 60) * 30 * 0.8);

  return { bmi: parseFloat(bmi.toFixed(1)), bmiLabel, bmiColor, curvesCal, normalCal };
}

export function BmiCalculatorSection() {
  const { open } = useTrialModal();
  const [age, setAge] = useState(30);
  const [height, setHeight] = useState(160);
  const [weight, setWeight] = useState(58);
  const [activity, setActivity] = useState(1.2);
  const [result, setResult] = useState<CalcResult | null>(() =>
    calcBMI(30, 160, 58, 1.2)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(calcBMI(age, height, weight, activity));
  };

  return (
    <section id="calculator" className="py-20 bg-brand-900 text-white relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-magenta/20 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-yellow-300 font-bold text-xs uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/10">
              Công Cụ Thông Minh
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Tính Toán Chỉ Số BMI &amp; Calo Tiêu Hao Trong 30 Phút
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Hãy nhập chỉ số thể trạng hiện tại của bạn để xem sự khác biệt kỳ diệu về năng lượng
              tiêu hao giữa bài tập 30 phút tại Curves và gym truyền thống!
            </p>
            <div className="p-4 bg-white/10 rounded-2xl border border-white/15 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-pink-300">
                ℹ️ Lưu ý chuyên khoa:
              </div>
              <p className="text-slate-300">
                Máy kháng thủy lực tại Curves cho phép cơ thể liên tục hoạt động ở vùng đốt mỡ tối
                ưu mà không mất sức quá đà.
              </p>
            </div>
          </div>

          {/* Right calculator */}
          <div className="lg:col-span-7 bg-white text-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Tuổi của bạn', value: age, min: 15, max: 80, setter: setAge },
                  { label: 'Chiều cao (cm)', value: height, min: 120, max: 200, setter: setHeight },
                  { label: 'Cân nặng (kg)', value: weight, min: 35, max: 150, setter: setWeight },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">{f.label}</label>
                    <input
                      type="number"
                      value={f.value}
                      min={f.min}
                      max={f.max}
                      required
                      onChange={(e) => f.setter(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-600 font-semibold text-sm"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Tần suất vận động hiện tại
                </label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-600 font-semibold text-sm"
                >
                  <option value={1.2}>Ít vận động (Dân văn phòng, ngồi nhiều)</option>
                  <option value={1.375}>Thỉnh thoảng tập nhẹ (1-2 buổi/tuần)</option>
                  <option value={1.55}>Vận động vừa phải (3-4 buổi/tuần)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-brand-700 to-accent-magenta text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-brand-500/30 hover:scale-[1.01] transition-all text-sm flex items-center justify-center gap-2"
              >
                🧮 TÍNH TOÁN NGAY
              </button>
            </form>

            {result && (
              <div className="mt-6 p-6 rounded-2xl bg-brand-50 border border-brand-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase">Chỉ số BMI</span>
                  <div className="text-2xl font-black text-brand-800 mt-1">{result.bmi}</div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${result.bmiColor} bg-green-100`}>
                    {result.bmiLabel}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase">Calo tại Curves</span>
                  <div className="text-2xl font-black text-accent-magenta mt-1">~ {result.curvesCal} kcal</div>
                  <span className="text-[11px] font-bold text-purple-700">Chỉ trong 30 phút</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase">Gym Thường (30p)</span>
                  <div className="text-2xl font-black text-slate-600 mt-1">~ {result.normalCal} kcal</div>
                  <span className="text-[11px] text-slate-500">Tiêu hao ít hơn ~50%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
