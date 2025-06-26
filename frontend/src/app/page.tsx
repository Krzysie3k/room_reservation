"use client";

import { login } from "services/authService";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Page() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login(username, password);

      // 🟢 Zapisz token
      localStorage.setItem("access_token", data.access_token);

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.user.id,
          name: data.user.first_name,
          surname: data.user.last_name,
          role: data.user.role,
        })
      );

      router.push("/schedule");
    } catch (err) {
      setError("Nieprawidłowy e-mail lub hasło");
      setUsername("");
      setPassword("");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-lg shadow-md">
      <div className="flex justify-center mb-6">
        <Image
          src="/sanspace_logo.png"
          alt="Logo SanSpace"
          width={160}
          height={160}
          priority
        />
      </div>
      <h1 className="flex justify-center text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-500 to-purple-900 bg-clip-text text-transparent">
        Logowanie SanSpace
      </h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">
            E-mail
          </label>
          <input
            type="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="block w-full border border-cyan-50 rounded-md px-3 py-2 text-gray-900 shadow-blue-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Hasło
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block w-full border border-cyan-50 rounded-md px-3 py-2 text-gray-900 shadow-blue-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="mx-auto rounded-2xl bg-blue-950 text-white px-4 py-2 hover:bg-blue-900 transition"
          >
            Zaloguj się
          </button>
        </div>
        <div className="flex justify-center">
          <div
            onClick={() => router.push("/register")}
            className="mt-4 text-sm text-blue-900 cursor-pointer"
          >
            <div className="flex justify-center">
              <button
                type="button"
                disabled
                title="Opcja będzie dostępna w przyszłości"
                className="mt-4 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded shadow-sm bg-white text-gray-700 cursor-not-allowed hover:bg-gray-100 transition"
              >
                <Image
                  src="/microsoft_logo.svg"
                  alt="Microsoft logo"
                  width={20}
                  height={20}
                />
                <span>Zaloguj się Microsoft</span>
              </button>
            </div>
            <p className="mt-4 text-sm text-blue-900 hover:underline">
              Nie masz konta? Zarejestruj się
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
