import UserTable from "./UserTable";
import { mockUsers } from "@/mock/mockUsers";

export default function UsersPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Użytkownicy</h1>
      <UserTable users={mockUsers} />
    </div>
  );
}
