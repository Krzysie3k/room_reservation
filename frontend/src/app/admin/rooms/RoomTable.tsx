type Room = {
  id: number;
  name: string;
  capacity: number;
  type: string;
  building: string;
  floor: string;
  description: string;
};

export default function RoomTable({ rooms }: { rooms: Room[] }) {
  return (
    <table className="min-w-full bg-white  rounded-lg shadow">
      <thead>
        <tr className="bg-gray-100 text-left">
          <th className="p-3">Nr</th>
          <th className="p-3">Typ</th>
          <th className="p-3">Pojemność</th>
          <th className="p-3">Budynek</th>
          <th className="p-3">Piętro</th>
          <th className="p-3">Opis</th>
        </tr>
      </thead>
      <tbody>
        {rooms.map((room) => (
          <tr key={room.id} className="border border-gray-200">
            <td className="p-3">{room.name}</td>
            <td className="p-3">
              {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
            </td>
            <td className="p-3">{room.capacity}</td>
            <td className="p-3">{room.building}</td>
            <td className="p-3">{room.floor}</td>
            <td className="p-3">{room.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
