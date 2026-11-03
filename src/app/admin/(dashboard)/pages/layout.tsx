import type { Metadata } from 'next';
import { AdminProviders } from '@/app/admin/providers';

export const metadata: Metadata = {
  title: 'Pages',
  description: 'Manage site pages',
};

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>;
}
