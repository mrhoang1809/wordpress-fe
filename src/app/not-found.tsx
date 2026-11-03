"use client";

import Link from "next/link";
import { HomeProviders } from "@/components/home/HomeProviders";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";

export default function NotFound() {
  return (
    <HomeProviders>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-slate-50 py-20">
          <div className="text-center max-w-md px-4">
            <h1 className="text-6xl font-black text-brand-800 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Trang không tồn tại
            </h2>
            <p className="text-slate-600 mb-6">
              Chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-brand-800 text-white font-bold px-6 py-3 rounded-xl hover:bg-brand-900 transition-colors"
            >
              Quay về trang chủ
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </HomeProviders>
  );
}
