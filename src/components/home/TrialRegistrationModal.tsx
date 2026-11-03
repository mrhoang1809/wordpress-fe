"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { X, CheckCircle, MapPin, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { publicApi, trialRegistrationsApi } from "@/lib/api-client";
import type { Location } from "@/types";
import { DEMO_LOCATIONS } from "@/lib/demo-content";

// ─── City helpers (shared với LocationsSection) ───────────────────────────────

const CITY_MAP: Record<string, string> = {
  HCM: "TP.HCM",
  HN: "Hà Nội",
  DN: "Đà Nẵng",
  TH: "Thanh Hóa",
};

function slugToCity(slug: string): string {
  const s = slug.toLowerCase();
  if (
    s.includes("quan") ||
    s.includes("phu-nhuan") ||
    s.includes("phu nhuan") ||
    s.includes("thu duc") ||
    s.includes("thu-duc") ||
    s.includes("nguyen-trai") ||
    s.includes("nguyen trai") ||
    s.includes("pasteur") ||
    s.includes("hoang-dieu") ||
    s.includes("hoang dieu")
  )
    return "HCM";
  if (
    s.includes("ba-dinh") ||
    s.includes("ba dinh") ||
    s.includes("tay-son") ||
    s.includes("tay son") ||
    s.includes("kim-ma") ||
    s.includes("kim ma")
  )
    return "HN";
  if (
    s.includes("hai-chau") ||
    s.includes("hai chau") ||
    s.includes("nguyen-van-linh") ||
    s.includes("nguyen van linh")
  )
    return "DN";
  if (
    s.includes("thanh-hoa") ||
    s.includes("thanh hoa") ||
    s.includes("le-loi") ||
    s.includes("le loi")
  )
    return "TH";
  return "HCM";
}

/** Format tên hiển thị: "Curves Nguyễn Đình Chiểu — TP.HCM" */
function locationLabel(loc: Location): string {
  return `${loc.name} — ${CITY_MAP[slugToCity(loc.slug)] ?? slugToCity(loc.slug)}`;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ModalContextValue {
  open: (source?: string) => void;
  close: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function useTrialModal() {
  const ctx = useContext(ModalContext);
  if (!ctx)
    throw new Error(
      "useTrialModal must be used within TrialRegistrationModal provider",
    );
  return ctx;
}

// ─── Branch Select (tách component để gọi useQuery sau khi modal mount) ───────

function BranchSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  // Dùng cùng queryKey ["public-locations"] → hit cache nếu LocationsSection đã fetch
  const { data, isLoading } = useQuery<Location[]>({
    queryKey: ["public-locations"],
    queryFn: () => publicApi.listLocations(),
    staleTime: 600_000,
    retry: false,
    placeholderData: DEMO_LOCATIONS,
  });

  const locations = data?.length ? data : DEMO_LOCATIONS;

  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
        <MapPin className="w-3.5 h-3.5 inline mr-1 text-brand-600" />
        Chọn chi nhánh gần nhất
      </label>

      <div className="relative">
        {isLoading && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin z-10" />
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isLoading}
          className="w-full appearance-none px-4 py-2.5 pr-9 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-600 focus:outline-none text-sm font-medium text-slate-800 bg-white disabled:opacity-60 transition-colors"
        >
          {isLoading ? (
            <option>Đang tải chi nhánh...</option>
          ) : (
            <>
              {/* Group theo thành phố */}
              {(["HCM", "HN", "DN", "TH"] as const).map((cityCode) => {
                const group = locations.filter(
                  (l) => slugToCity(l.slug) === cityCode,
                );
                if (!group.length) return null;
                return (
                  <optgroup
                    key={cityCode}
                    label={`── ${CITY_MAP[cityCode]} ──`}
                  >
                    {group.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                        {loc.address
                          ? ` · ${loc.address.split(",").slice(-2).join(",").trim()}`
                          : ""}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </>
          )}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Hiện địa chỉ đầy đủ của chi nhánh đã chọn */}
      {!isLoading &&
        (() => {
          const selected = locations.find((l) => l.id === value);
          if (!selected) return null;
          return (
            <p className="mt-1.5 text-[11px] text-slate-500 flex items-start gap-1.5">
              <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-brand-400" />
              {selected.address}
              {selected.phone && (
                <span className="ml-1">· {selected.phone}</span>
              )}
            </p>
          );
        })()}
    </div>
  );
}

// ─── Provider + Modal ─────────────────────────────────────────────────────────

export function TrialRegistrationModal({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  // branchId: id của Location, default rỗng (sẽ được set khi locations load)
  const [branchId, setBranchId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const open = useCallback((src = "") => {
    setSource(src);
    setSuccess(false);
    setSubmitError(null);
    setName("");
    setPhone("");
    setBranchId("");
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await trialRegistrationsApi.submit({
        name,
        phone,
        locationId: branchId || undefined,
        source: source || undefined,
      });
      setSuccess(true);
    } catch {
      setSubmitError("Đã có lỗi xảy ra, vui lòng thử lại hoặc gọi hotline.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalContext.Provider value={{ open, close }}>
      {children}

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-brand-950/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Đăng ký tập thử miễn phí"
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-[0_32px_80px_rgba(0,0,0,0.35)] relative border border-brand-100/60 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gradient bar */}
            <div className="h-1.5 bg-gradient-to-r from-brand-600 via-accent-magenta to-accent-pink" />

            <div className="p-6 sm:p-8">
              {/* Close */}
              <button
                onClick={close}
                className="absolute top-5 right-5 text-slate-300 hover:text-slate-600 p-1 rounded-full transition-colors"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-7">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-100 to-pink-100 text-accent-magenta rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl shadow-sm">
                  ✨
                </div>
                <h3 className="text-xl font-black text-brand-950">
                  Đăng Ký Tập Thử Miễn Phí
                </h3>
                <p className="text-[12px] text-slate-500 mt-1.5 leading-relaxed">
                  Tặng{" "}
                  <strong className="text-brand-700">
                    01 buổi đo chỉ số InBody
                  </strong>{" "}
                  &amp; tư vấn vóc dáng cùng HLV Nữ
                </p>
              </div>

              {/* Success */}
              {success ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black text-slate-800">
                    Đăng Ký Thành Công! 🎉
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                    HLV Curves sẽ liên hệ với bạn trong vòng{" "}
                    <strong>24 giờ</strong> để xác nhận lịch tập thử.
                  </p>
                  <button
                    onClick={close}
                    className="mt-2 bg-brand-50 hover:bg-brand-100 text-brand-800 font-bold px-8 py-2.5 rounded-xl text-sm transition-colors"
                  >
                    Đóng lại
                  </button>
                </div>
              ) : (
                /* Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Tên */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Họ và tên <span className="text-accent-rose">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Nguyễn Thị A"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-400 focus:outline-none text-sm transition-colors"
                    />
                  </div>

                  {/* SĐT */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Số điện thoại <span className="text-accent-rose">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="0901 234 567"
                      pattern="[0-9]{9,11}"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-400 focus:outline-none text-sm transition-colors"
                    />
                  </div>

                  {/* Chi nhánh — fetch từ API */}
                  <BranchSelect value={branchId} onChange={setBranchId} />

                  {/* Submit */}
                  {submitError && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-brand-700 to-accent-magenta hover:from-brand-600 hover:to-accent-pink text-white font-black py-3.5 rounded-xl shadow-glow-purple hover:shadow-glow-magenta transition-all text-sm flex justify-center items-center gap-2 disabled:opacity-60 mt-2"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      "✓ XÁC NHẬN ĐĂNG KÝ"
                    )}
                  </button>

                  <p className="text-center text-[11px] text-slate-400">
                    Miễn phí hoàn toàn · Không cần thẻ tín dụng
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}
