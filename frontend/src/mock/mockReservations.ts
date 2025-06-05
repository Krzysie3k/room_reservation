export type Reservation = {
  id_rezerwacji: number;
  id_sali: number;
  id_uzytkownika: number;
  data: string; // yyyy-mm-dd
  godzina_od: string; // HH:mm
  godzina_do: string; // HH:mm
  cel: string;
};

export const mockReservations: Reservation[] = [
  {
    id_rezerwacji: 1,
    id_sali: 1,
    id_uzytkownika: 1,
    data: "2025-06-05",
    godzina_od: "08:00",
    godzina_do: "11:30",
    cel: "Zajęcia z matematyki",
  },
  {
    id_rezerwacji: 2,
    id_sali: 2,
    id_uzytkownika: 2,
    data: "2025-06-05",
    godzina_od: "13:30",
    godzina_do: "15:15",
    cel: "Programowanie",
  },
  {
    id_rezerwacji: 3,
    id_sali: 2,
    id_uzytkownika: 1,
    data: "2025-06-05",
    godzina_od: "08:00",
    godzina_do: "11:30",
    cel: "Test",
  },
  {
    id_rezerwacji: 4,
    id_sali: 4,
    id_uzytkownika: 3,
    data: "2025-06-05",
    godzina_od: "09:00",
    godzina_do: "11:30",
    cel: "Test2",
  },
];
