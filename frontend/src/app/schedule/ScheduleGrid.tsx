"use client";

import { FaCalendarDay } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { useEffect, useState } from "react";
import { format, addDays, subDays } from "date-fns";
import DatePicker, { registerLocale } from "react-datepicker";
import { pl } from "date-fns/locale";
registerLocale("pl", pl);

const hours = ["08:00", "09:45", "11:30", "13:30", "15:15", "17:00", "18:45"];

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getNextHour(hour: string): string {
  const index = hours.indexOf(hour);
  return index >= 0 && index < hours.length - 1 ? hours[index + 1] : "20:30";
}

export default function ScheduleGrid() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{
    roomName: string;
    hour: string;
    date: string;
  } | null>(null);
  const [reservationPurpose, setReservationPurpose] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // 👇 Zmieniamy kolejność – te stany muszą być wcześniej
  const [rooms, setRooms] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data));

    fetch("http://localhost:8000/reservations")
      .then((res) => res.json())
      .then((data) => setReservations(data));

    fetch("http://localhost:8000/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);
  if (
    !Array.isArray(reservations) ||
    !Array.isArray(rooms) ||
    !Array.isArray(users)
  ) {
    return <div>Ładowanie danych...</div>;
  }

  const formattedDate = format(currentDate, "EEEE, d MMMM yyyy", {
    locale: pl,
  });
  const dateKey = format(currentDate, "yyyy-MM-dd");

  const userReservations = Array.isArray(reservations)
    ? reservations.filter((r) => {
        if (r.user_id !== currentUser?.id) return false;

        const resEnd = new Date(`${r.date}T${r.time_to}`);
        return resEnd >= new Date(); // tylko przyszłe lub trwające
      })
    : [];

  const uniqueBuildings = Array.from(new Set(rooms.map((r) => r.building)));
  const uniqueTypes = Array.from(
    new Set(rooms.map((r) => r.room_type?.name).filter(Boolean))
  );

  return (
    <>
      {/* MODAL */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-bold mb-2 text-gray-700">
              Rezerwacja sali
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              Sala: <strong>{selectedSlot.roomName}</strong>
              <br />
              Godzina: <strong>{selectedSlot.hour}</strong>
              <br />
              Data: <strong>{selectedSlot.date}</strong>
            </p>
            <input
              type="text"
              className="w-full border px-3 py-2 mb-4 rounded text-gray-600"
              placeholder="Cel rezerwacji"
              value={reservationPurpose}
              onChange={(e) => setReservationPurpose(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedSlot(null)}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Zamknij
              </button>
              <button
                onClick={() => {
                  const roomId = rooms.find(
                    (r) => r.name === selectedSlot.roomName
                  )?.id;
                  if (!roomId || !currentUser?.id) {
                    alert("Brakuje danych do rezerwacji.");
                    return;
                  }

                  const payload = {
                    room_id: roomId,
                    user_id: currentUser.id,
                    date: selectedSlot.date,
                    time_from: selectedSlot.hour,
                    time_to: getNextHour(selectedSlot.hour),
                    purpose: reservationPurpose,
                  };

                  // console.log("📦 Payload do wysłania:", payload);

                  fetch("http://localhost:8000/reservations", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                  })
                    .then((res) => {
                      if (!res.ok) throw new Error("Błąd zapisu");
                      return res.json();
                    })
                    .then((data) => {
                      // Po udanym zapisie – odśwież dane z backendu
                      fetch("http://localhost:8000/reservations")
                        .then((res) => res.json())
                        .then((data) => setReservations(data));
                    })
                    .catch((err) => {
                      console.error("❌ Błąd zapisu rezerwacji:", err);
                      alert("Nie udało się zapisać rezerwacji.");
                    });

                  setSelectedSlot(null);
                }}
                className="px-3 py-1 bg-blue-950 text-white rounded hover:bg-blue-700"
              >
                Rezerwuj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="flex items-stretch gap-4">
        {/* LEWA KOLUMNA */}
        <div className="bg-gray-50 rounded shadow text-sm p-4 w-[275px] flex flex-col">
          {/* KALENDARZ */}
          <div className="datepicker-wrapper">
            <DatePicker
              selected={currentDate}
              onChange={(date: Date | null) => date && setCurrentDate(date)}
              locale="pl"
              dateFormat="yyyy-MM-dd"
              inline
            />
          </div>

          {/* FILTROWANIE */}
          <div className="my-4 space-y-2">
            <div>
              <h3 className="text-sm font-semibold px-1 mb-3 text-gray-700">
                Filtrowanie
              </h3>
              <label className="block text-xs text-gray-600 mb-1 px-1">
                Budynek:
              </label>
              <select
                value={selectedBuilding || ""}
                onChange={(e) => setSelectedBuilding(e.target.value || null)}
                className="w-full text-xs p-1 border border-gray-300 rounded"
              >
                <option value="">Wszystkie</option>
                {uniqueBuildings.map((b, index) => (
                  <option key={`building-${index}`} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1 px-1">
                Typ sali:
              </label>
              <select
                value={selectedType || ""}
                onChange={(e) => setSelectedType(e.target.value || null)}
                className="w-full text-xs p-1 border border-gray-300 rounded"
              >
                <option value="">Wszystkie</option>
                {uniqueTypes.map((t, index) => (
                  <option key={`type-${index}`} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* MOJE REZERWACJE */}
          <div className="mt-4 flex-1">
            <h3 className="text-sm font-semibold px-1 mb-3 text-gray-700">
              Moje rezerwacje
            </h3>
            <ul className="space-y-3">
              {userReservations.length === 0 && (
                <li className="text-xs text-gray-600">Brak rezerwacji</li>
              )}
              {userReservations.map((res) => {
                const room = rooms.find((r) => r.id === res.room_id);
                return (
                  <li
                    key={res.id}
                    className="bg-indigo-900 text-white rounded-lg px-3 py-3 shadow-sm border border-blue-200 hover:bg-blue-800"
                  >
                    <div className="text-xs font-medium flex items-center gap-1">
                      <FaCalendarDay className="text-blue-200" />
                      <span>
                        {format(new Date(res.date), "P", { locale: pl })} –{" "}
                        {res.time_from}–{res.time_to}
                      </span>
                    </div>
                    <div className="text-sm font-bold mt-1">
                      Sala {room?.name || "?"}
                    </div>
                    <div className="text-xs italic text-blue-200">
                      {res.purpose}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* PRAWA KOLUMNA */}
        <div className="flex-1 flex flex-col rounded-b">
          {/* NAWIGACJA */}
          <div className="flex justify-between items-center px-4 py-2 bg-gray-50 rounded-t text-gray-400">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentDate((prev) => subDays(prev, 1))}
                className="px-3 py-1 hover:bg-blue-950 hover:text-white rounded"
              >
                ←
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 bg-blue-950 text-white rounded hover:bg-blue-900"
              >
                Dzisiaj
              </button>
              <button
                onClick={() => setCurrentDate((prev) => addDays(prev, 1))}
                className="px-3 py-1 hover:bg-blue-950 hover:text-white rounded"
              >
                →
              </button>
            </div>
            <div className="text-gray-500">{formattedDate}</div>
          </div>

          {/* TABELA */}
          <div className="flex-1 overflow-auto bg-white rounded-b">
            <table className="table-fixed border-collapse w-full text-sm">
              <thead className="bg-gray-100 text-gray-500">
                <tr>
                  <th className="px-2 py-1 w-[40px] text-left">Nr</th>
                  <th className="px-2 py-1 w-[60px] text-left">Miejsca</th>
                  <th className="px-2 py-1 w-[40px] text-left">Bud.</th>
                  <th className="px-2 py-1 w-[40px] text-left">Piętro</th>
                  {hours.map((hour) => (
                    <th key={hour} className="w-[100px] px-4 py-1 text-center">
                      {hour}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rooms
                  .filter(
                    (room) =>
                      (!selectedBuilding ||
                        room.building === selectedBuilding) &&
                      (!selectedType || room.room_type?.name === selectedType)
                  )
                  .map((room) => (
                    <tr key={room.id} className="h-12">
                      <td className="bg-gray-50 text-gray-500 px-2 py-1">
                        {room.name}
                      </td>
                      <td className="bg-gray-50 text-gray-500 px-2 py-1">
                        {room.seat_count}
                      </td>
                      <td className="bg-gray-50 text-gray-500 px-2 py-1 text-xs">
                        {room.building}
                      </td>
                      <td className="bg-gray-50 text-gray-500 px-2 py-1 text-xs">
                        {room.floor}
                      </td>
                      {hours.map((hour) => {
                        const res = reservations.find(
                          (r) =>
                            r.room_id === room.id &&
                            r.date === dateKey &&
                            toMinutes(r.time_from) <= toMinutes(hour) &&
                            toMinutes(r.time_to) > toMinutes(hour)
                        );
                        const user = res
                          ? users.find((u) => u.id === res.user_id)
                          : null;

                        return (
                          <td
                            key={hour}
                            className={`border border-gray-100 px-1 py-1 text-center rounded-lg ${
                              res
                                ? res.user_id === currentUser?.id
                                  ? "bg-fuchsia-900 text-white"
                                  : "bg-blue-950 text-white"
                                : "bg-gray-50 hover:bg-blue-200 cursor-pointer"
                            }`}
                            title={
                              res
                                ? `Zajęte: ${res.time_from}–${res.time_to}\n${res.purpose}`
                                : `Sala ${room.name} dostępna o ${hour}`
                            }
                            onClick={() => {
                              if (!res) {
                                setSelectedSlot({
                                  roomName: room.name,
                                  hour,
                                  date: dateKey,
                                });
                                setReservationPurpose("");
                              }
                            }}
                          >
                            {res && (
                              <div className="flex flex-col text-xs leading-tight">
                                <span className="font-semibold">
                                  {user
                                    ? `${user.name.charAt(0)}. ${user.surname}`
                                    : "Nieznany"}
                                </span>
                                <span>{res.purpose}</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
