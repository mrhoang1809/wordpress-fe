import Link from 'next/link';
import { FileText, BookOpen, FolderTree, Menu, Image, MessageCircle, Facebook } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Tổng quan</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { href: '/admin/pages', label: 'Trang', icon: FileText, description: 'Tạo và quản lý trang CMS bằng khối nội dung' },
          { href: '/admin/posts', label: 'Bài viết', icon: BookOpen, description: 'Soạn và xuất bản bài viết' },
          { href: '/admin/categories', label: 'Danh mục', icon: FolderTree, description: 'Phân loại nội dung theo danh mục' },
          { href: '/admin/menus', label: 'Menu', icon: Menu, description: 'Xây dựng menu điều hướng' },
          { href: '/admin/media', label: 'Thư viện', icon: Image, description: 'Tải lên và quản lý hình ảnh' },
          { href: '/admin/messaging/zalo', label: 'Gửi Zalo', icon: MessageCircle, description: 'Chiến dịch tin nhắn Zalo' },
          { href: '/admin/messaging/facebook', label: 'Gửi Facebook', icon: Facebook, description: 'Chiến dịch tin nhắn Facebook' },
        ].map(({ href, label, icon: Icon, description }) => (
          <Link
            key={href}
            href={href}
            className="rounded-lg border bg-card p-6 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <Icon className="h-5 w-5 text-primary" />
              <span className="font-semibold">{label}</span>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
