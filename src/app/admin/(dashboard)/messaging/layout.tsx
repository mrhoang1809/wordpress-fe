import type { Metadata } from 'next';
import { AdminProviders } from '@/app/admin/providers';

export const metadata: Metadata = {
  title: 'Messaging',
  description: 'Manage campaigns and subscribers',
};

export default function MessagingLayout({ children }: { children: React.ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>;
}
