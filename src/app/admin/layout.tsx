import { requireInstructorOrAdmin } from '@/lib/admin';
import { AdminNavbar } from '@/components/admin/admin-navbar';

export const metadata = {
  title: 'Admin — Unified Automation',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireInstructorOrAdmin();
  return (
    <>
      <AdminNavbar userRole={user.role} />
      <main className="bg-bg-alt/30 min-h-screen">{children}</main>
    </>
  );
}
