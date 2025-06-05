"use client";
import { loginMockUser } from "services/authService";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Page() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = loginMockUser(username, password);
    if (user) {
      localStorage.setItem("token", "mock-token");
      localStorage.setItem("user", JSON.stringify(user));
      router.push("/rooms");
    } else {
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
            Użytkownik
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className=" block w-full
                border border-cyan-50
                rounded-md
                px-3 py-2
                text-gray-900
                shadow-blue-500
                focus:outline-none
                focus:ring-2 focus:ring-purple-500 focus:border-transparent
                transition"
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
            className=" block w-full
                border border-cyan-50
                rounded-md
                px-3 py-2
                text-gray-900
                shadow-blue-500
                focus:outline-none
                focus:ring-2 focus:ring-purple-500 focus:border-transparent
                transition"
          />
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="mx-auto rounded-2xl bg-cyan-400 text-white px-4 py-2 hover:bg-purple-500 transition"
          >
            Zaloguj się
          </button>
        </div>
      </form>
    </div>
  );
}
