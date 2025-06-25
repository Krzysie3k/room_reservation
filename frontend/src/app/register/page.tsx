"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Rejestracja nie powiodła się");
      }

      setSuccess(true);
      setTimeout(() => router.push("/"), 1500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-900">
        Rejestracja
      </h1>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && (
        <p className="text-green-600 mb-2">
          Rejestracja udana! Przekierowanie...
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="first_name"
          placeholder="Imię"
          value={formData.first_name}
          onChange={handleChange}
          required
          className="input"
        />
        <input
          name="last_name"
          placeholder="Nazwisko"
          value={formData.last_name}
          onChange={handleChange}
          required
          className="input"
        />
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={formData.email}
          onChange={handleChange}
          required
          className="input"
        />
        <input
          type="password"
          name="password"
          placeholder="Hasło"
          value={formData.password}
          onChange={handleChange}
          required
          className="input"
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="input"
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
          <option value="wykladowca">Wykładowca</option>
        </select>
        <button
          type="submit"
          className="w-full bg-blue-950 text-white py-2 rounded hover:bg-blue-900"
        >
          Zarejestruj się
        </button>
      </form>
    </div>
  );
}
