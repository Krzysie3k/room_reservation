type User = {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
  //   status: string;
};

export default function UserTable({ users }: { users: User[] }) {
  return (
    <table className="min-w-full bg-white border rounded-lg shadow">
      <thead>
        <tr className="bg-gray-200 border border-gray-200 text-left">
          <th className="p-3">Imię i nazwisko</th>
          <th className="p-3">Email</th>
          <th className="p-3">Rola</th>
          {/* <th className="p-3">Status</th> */}
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} className="border-t border border-gray-200">
            <td className="p-3">
              {user.name} {user.surname}
            </td>
            <td className="p-3">{user.email}</td>
            <td className="p-3">{user.role}</td>
            {/* <td className="p-3">
              <span
                className={`px-2 py-1 rounded text-sm font-medium ${
                  user.status === "active"
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {user.status}
              </span>
            </td> */}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
