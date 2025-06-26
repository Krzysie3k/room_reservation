"use client";

import { FaCalendarDay } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { useEffect, useState } from "react";
import { format, addDays, subDays } from "date-fns";
import DatePicker, { registerLocale } from "react-datepicker";
import { pl } from "date-fns/locale";
import { FaTrashAlt } from "react-icons/fa";

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

  const [rooms, setRooms] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);

  // Ustawienie użytkownika z localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);
  const [users, setUsers] = useState<any[]>([]);
  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user
      ? `${user.first_name} ${user.last_name}`
      : "Nieznany użytkownik";
  };

  // Pobieranie danych użytkowników
  useEffect(() => {
    fetch("http://localhost:8000/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) =>
        console.error("❌ Błąd przy pobieraniu danych użytkowników:", err)
      );
  }, []);

  // Pobieranie danych z backendu
  useEffect(() => {
    fetch("http://localhost:8000/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch((err) =>
        console.error("❌ Błąd przy pobieraniu danych o pokojach:", err)
      );

    fetch("http://localhost:8000/reservations")
      .then((res) => res.json())
      .then((data) => setReservations(data))
      .catch((err) =>
        console.error("❌ Błąd przy pobieraniu danych o rezerwacjach:", err)
      );
  }, []);

  const formattedDate = format(currentDate, "EEEE, d MMMM yyyy", {
    locale: pl,
  });
  const dateKey = format(currentDate, "yyyy-MM-dd");

  // Filtrujemy rezerwacje dla obecnego użytkownika
  const userReservations = reservations.filter(
    (r) =>
      r.user_id === currentUser?.id &&
      new Date(`${r.date}T${r.time_to}`) >= new Date()
  );

  // Unikalne wartości budynków i typów sal
  const uniqueBuildings = Array.from(new Set(rooms.map((r) => r.building)));
  const uniqueTypes = Array.from(
    new Set(rooms.map((r) => r.room_type?.name).filter(Boolean))
  );

  const handleDeleteReservation = async (reservationId: string) => {
    const token = localStorage.getItem("access_token"); // Pobierz token z localStorage
    if (!token) {
      console.error("Brak tokenu autoryzacyjnego!");
      alert("Proszę się zalogować ponownie.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8000/reservations/${reservationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Błąd przy usuwaniu rezerwacji");

      const data = await res.json();
      console.log("Dane z backendu:", data);

      // Pobranie zaktualizowanej listy rezerwacji
      const updatedReservations = await fetch(
        "http://localhost:8000/reservations"
      );
      const updatedData = await updatedReservations.json();
      setReservations(updatedData);
    } catch (err) {
      console.error("❌ Błąd usuwania rezerwacji:", err);
      alert("Nie udało się usunąć rezerwacji.");
    }
  };

  return (
    <>
      {/* MODAL CREATE */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-bold mb-2 text-gray-700">
              Rezerwacja sali
            </h2>
            <div className="mb-3 flex items-center gap-2">
              <label className="w-20 text-sm text-gray-700">Data:</label>
              <DatePicker
                selected={new Date(selectedSlot.date)}
                onChange={(date) =>
                  date &&
                  setSelectedSlot((prev) =>
                    prev ? { ...prev, date: format(date, "yyyy-MM-dd") } : null
                  )
                }
                locale="pl"
                dateFormat="yyyy-MM-dd"
                className="flex-1 border px-2 py-1 rounded"
              />
            </div>

            <div className="mb-3 flex items-center gap-2">
              <label className="w-20 text-sm text-gray-700">Godzina:</label>
              <select
                value={selectedSlot.hour}
                onChange={(e) =>
                  setSelectedSlot((prev) =>
                    prev ? { ...prev, hour: e.target.value } : null
                  )
                }
                className="flex-1 border px-2 py-1 rounded"
              >
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4 flex items-start gap-2">
              <label className="w-20 text-sm text-gray-700 pt-2">Cel:</label>
            </div>

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
                    .then(() => {
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
                const room = rooms.find((r) => r.id === res.room_id);
                return (
                  <li
                    key={res.id}
                    className={`cursor-pointer ${
                      res.user_id === currentUser?.id
                        ? "bg-indigo-900 text-white"
                        : "bg-gray-200 text-black"
                    } rounded-lg px-3 py-3 shadow-sm border border-blue-200 hover:bg-blue-800`}
                  >
                    <div className="relative">
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

                      {/* Przycisk usuwania rezerwacji */}
                      {res.user_id === currentUser?.id && (
                        <button
                          onClick={() => handleDeleteReservation(res.id)}
                          className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                          title="Usuń rezerwację"
                        >
                          <FaTrashAlt className="text-white" />
                        </button>
                      )}
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

                        return (
                          <td
                            key={hour}
                            className={`border border-gray-100 px-1 py-1 text-center rounded-lg ${
                              res
                                ? res.user_id === currentUser?.id
                                  ? "bg-fuchsia-900 text-white cursor-pointer"
                                  : "bg-blue-950 text-white"
                                : "bg-gray-50 hover:bg-blue-200 cursor-pointer"
                            } relative`} // Ustawiamy 'relative' na komórce
                            title={
                              res
                                ? `Zajęte: ${res.time_from}–${res.time_to}\n${res.purpose}`
                                : `Sala ${room.name} dostępna o ${hour}`
                            }
                            onClick={() => {
                              if (res) {
                                // To może być np. podgląd rezerwacji, jak w poprzednich wersjach
                              } else {
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
                                  {getUserName(res.user_id)}
                                </span>
                                <span>{res.purpose}</span>

                                {/* Ikona kosza w prawym górnym rogu */}
                                {currentUser?.role === "admin" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation(); // Zapobiega propagacji kliknięcia do komórki
                                      handleDeleteReservation(res.id);
                                    }}
                                    className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                                    title="Usuń rezerwację"
                                  >
                                    <FaTrashAlt className="text-white" />
                                  </button>
                                )}
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
