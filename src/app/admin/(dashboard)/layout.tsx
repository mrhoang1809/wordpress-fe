import { AdminProviders } from "../providers";
import { AdminLayoutShell } from "../shell";

/** Protected admin routes — sidebar is shown only after a valid session. */
export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProviders>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </AdminProviders>
  );
}
