import { mockUsers, User } from "mock/mockUsers";

export function loginMockUser(email: string, password: string): User | null {
  const user = mockUsers.find(
    (u) => u.email === email && u.password === password
  );
  return user ?? null;
}
