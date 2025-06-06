"use client";

import { useEffect, useState } from "react";
import { getRooms } from "services/roomService";
import { Room } from "mock/mockRooms";

export default function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    getRooms().then(setRooms);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Lista sal</h1>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Nazwa</th>
            <th className="p-2 border">Typ</th>
            <th className="p-2 border">Pojemność</th>
            <th className="p-2 border">Budynek</th>
            <th className="p-2 border">Piętro</th>
            <th className="p-2 border">Opis</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td className="p-2 border">{room.name}</td>
              <td className="p-2 border">{room.type}</td>
              <td className="p-2 border">{room.capacity}</td>
              <td className="p-2 border">{room.building}</td>
              <td className="p-2 border">{room.floor}</td>
              <td className="p-2 border">{room.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
