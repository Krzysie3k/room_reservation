// import { mockUsers, User } from "mock/mockUsers";

// export function loginMockUser(email: string, password: string): User | null {
//   const user = mockUsers.find(
//     (u) => u.email === email && u.password === password
//   );
//   return user ?? null;
// }

// services/authService.ts

export async function login(username: string, password: string) {
  const body = new URLSearchParams();
  body.append("username", username);
  body.append("password", password);

  const response = await fetch("http://localhost:8000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error("Błąd logowania");
  }

  return await response.json(); // { access_token, token_type }
}
