// import UserTable from "./UserTable";
// import { mockUsers } from "@/mock/mockUsers";

// export default function UsersPage() {
//   return (
//     <div>
//       <h1 className="text-xl font-semibold mb-4">Użytkownicy</h1>
//       <UserTable users={mockUsers} />
//     </div>
//   );
// }
"use client"; // ← to dodaj na górze, bo używasz useEffect

import { useEffect, useState } from "react";
import UserTable from "./UserTable";

type User = {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Użytkownicy</h1>
      <UserTable users={users} />
    </div>
  );
}
