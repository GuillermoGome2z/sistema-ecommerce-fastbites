import { useState, type ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface Props {
  title: string;
  children: ReactNode;
}

export default function AdminLayout({ title, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminHeader title={title} onMenuToggle={() => setSidebarOpen((s) => !s)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
