"use client";

import { FaCalendarDay } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { useEffect, useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { mockReservations } from "@/mock/mockReservations";
import { mockRooms } from "@/mock/mockRooms";
import { mockUsers } from "@/mock/mockUsers";
import DatePicker, { registerLocale } from "react-datepicker";
import { pl } from "date-fns/locale";
registerLocale("pl", pl);

const hours = ["08:00", "09:45", "11:30", "13:30", "15:15", "17:00", "18:45"];

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
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

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  const formattedDate = format(currentDate, "EEEE, d MMMM yyyy", {
    locale: pl,
  });
  const dateKey = format(currentDate, "yyyy-MM-dd");

  const userReservations = mockReservations.filter(
    (r) => r.id_uzytkownika === currentUser?.id
  );

  const uniqueBuildings = Array.from(new Set(mockRooms.map((r) => r.building)));
  const uniqueTypes = Array.from(new Set(mockRooms.map((r) => r.type)));

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
                  console.log("Rezerwuję:", {
                    ...selectedSlot,
                    cel: reservationPurpose,
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
                {uniqueBuildings.map((b) => (
                  <option key={b} value={b}>
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
                {uniqueTypes.map((t) => (
                  <option key={t} value={t}>
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
                const room = mockRooms.find((r) => r.id === res.id_sali);
                return (
                  <li
                    key={res.id_rezerwacji}
                    className="bg-indigo-900 text-white rounded-lg px-3 py-3 shadow-sm border border-blue-200 hover:bg-blue-800"
                  >
                    <div className="text-xs font-medium flex items-center gap-1">
                      <FaCalendarDay className="text-blue-200" />
                      <span>
                        {format(new Date(res.data), "P", { locale: pl })} –{" "}
                        {res.godzina_od}–{res.godzina_do}
                      </span>
                    </div>
                    <div className="text-sm font-bold mt-1">
                      Sala {room?.name || "?"}
                    </div>
                    <div className="text-xs italic text-blue-200">
                      {res.cel}
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
                {mockRooms
                  .filter(
                    (room) =>
                      (!selectedBuilding ||
                        room.building === selectedBuilding) &&
                      (!selectedType || room.type === selectedType)
                  )
                  .map((room) => (
                    <tr key={room.id} className="h-12">
                      <td className="bg-gray-50 text-gray-500 px-2 py-1">
                        {room.name}
                      </td>
                      <td className="bg-gray-50 text-gray-500 px-2 py-1">
                        {room.capacity}
                      </td>
                      <td className="bg-gray-50 text-gray-500 px-2 py-1 text-xs">
                        {room.building}
                      </td>
                      <td className="bg-gray-50 text-gray-500 px-2 py-1 text-xs">
                        {room.floor}
                      </td>
                      {hours.map((hour) => {
                        const res = mockReservations.find(
                          (r) =>
                            r.id_sali === room.id &&
                            r.data === dateKey &&
                            toMinutes(r.godzina_od) <= toMinutes(hour) &&
                            toMinutes(r.godzina_do) > toMinutes(hour)
                        );
                        const user = res
                          ? mockUsers.find((u) => u.id === res.id_uzytkownika)
                          : null;

                        return (
                          <td
                            key={hour}
                            className={`border border-gray-100 px-1 py-1 text-center rounded-lg ${
                              res
                                ? res.id_uzytkownika === currentUser?.id
                                  ? "bg-fuchsia-900 text-white"
                                  : "bg-blue-950 text-white"
                                : "bg-gray-50 hover:bg-blue-200 cursor-pointer"
                            }`}
                            title={
                              res
                                ? `Zajęte: ${res.godzina_od}–${res.godzina_do}\n${res.cel}`
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
                                <span>{res.cel}</span>
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
