// export default function AdminLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="flex h-screen">
//       {/* Sidebar */}
//       <aside className="w-64 bg-gray-900 text-white p-6">
//         <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
//         <nav className="flex flex-col space-y-3">
//           <a href="/admin" className="hover:text-gray-300">Dashboard</a>
//           <a href="/admin/users" className="hover:text-gray-300">Users</a>
//           <a href="/admin/rooms" className="hover:text-gray-300">Rooms</a>
//           <a href="/admin/settings" className="hover:text-gray-300">Settings</a>
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 bg-gray-100 p-8 overflow-y-auto">
//         {children}
//       </main>
//     </div>
//   );
// }

import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <nav className="flex flex-col space-y-3">
          <a href="/admin" className="hover:text-gray-300">
            Dashboard
          </a>
          <a href="/admin/users" className="hover:text-gray-300">
            Users
          </a>
          <a href="/admin/rooms" className="hover:text-gray-300">
            Rooms
          </a>
          <a href="/admin/settings" className="hover:text-gray-300">
            Settings
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
