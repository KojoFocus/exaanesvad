import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import styles from './layout.module.css';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/admin');

  return (
    <div className={styles.shell}>
      <AdminSidebar />
      <main className={styles.body}>{children}</main>
    </div>
  );
}
