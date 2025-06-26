"use client";
import { useState, useEffect } from "react";
import React from "react";

type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

export default function UserTable({ users }: { users: User[] }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const handleClose = () => setSelectedUser(null);
  const handleSave = () => {
    setSelectedUser(null);
  };

  return (
    <>
      <table className="min-w-full bg-white border rounded-lg shadow">
        <thead>
          <tr className="bg-gray-200 border border-gray-200 text-left">
            <th className="p-3">Imię i nazwisko</th>
            <th className="p-3">Email</th>
            <th className="p-3">Rola</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border border-gray-200">
              <td className="p-3">
                {user.first_name} {user.last_name}
              </td>
              <td className="p-3">{user.email}</td>
              <td className="p-3">{user.role}</td>
              <td>
                <button
                  className="px-2 py-1 rounded-[6px] hover:bg-gray-200 transition"
                  onClick={() => setSelectedUser(user)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Edytuj użytkownika</h2>

            <EditUserForm
              user={selectedUser}
              onClose={handleClose}
              onSave={handleSave}
            />
          </div>
        </div>
      )}
    </>
  );
}

function EditUserForm({
  user,
  onClose,
  onSave,
}: {
  user: User;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState<User>(user);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { id, ...payload } = formData;

    await fetch(`http://localhost:8000/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    onSave();
    window.location.reload();
  };

  return (
    <div>
      <input
        name="first_name"
        value={formData.first_name}
        onChange={handleChange}
        className="w-full border p-2 rounded mb-3"
        placeholder="Imię"
      />
      <input
        name="last_name"
        value={formData.last_name}
        onChange={handleChange}
        className="w-full border p-2 rounded mb-3"
        placeholder="Nazwisko"
      />
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        className="w-full border p-2 rounded mb-3"
        placeholder="Email"
      />
      <input
        name="role"
        value={formData.role}
        onChange={handleChange}
        className="w-full border p-2 rounded mb-3"
        placeholder="Rola"
      />

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded hover:bg-gray-100 text-gray-600"
        >
          Anuluj
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
        >
          Zapisz
        </button>
      </div>
    </div>
  );
}
