"use client";

import { useEffect, useState } from "react";
import RoomTable from "./RoomTable";

type Room = {
  id: number;
  name: string;
  seat_count: number;
  room_type: { name: string };
  building: string;
  floor: string;
  description: string;
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch((err) => console.error("Błąd przy pobieraniu sal:", err));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Sale</h1>
      <RoomTable rooms={rooms} />
    </div>
  );
}
