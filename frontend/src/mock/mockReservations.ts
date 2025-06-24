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
    data: "2025-06-06",
    godzina_od: "08:00",
    godzina_do: "11:30",
    cel: "Zajęcia z matematyki",
  },
  {
    id_rezerwacji: 2,
    id_sali: 2,
    id_uzytkownika: 2,
    data: "2025-06-06",
    godzina_od: "13:30",
    godzina_do: "15:15",
    cel: "Programowanie",
  },
  {
    id_rezerwacji: 3,
    id_sali: 2,
    id_uzytkownika: 1,
    data: "2025-06-06",
    godzina_od: "08:00",
    godzina_do: "11:30",
    cel: "Test",
  },
  {
    id_rezerwacji: 4,
    id_sali: 4,
    id_uzytkownika: 3,
    data: "2025-06-06",
    godzina_od: "09:00",
    godzina_do: "11:30",
    cel: "Test2",
  },
  {
    id_rezerwacji: 5,
    id_sali: 3,
    id_uzytkownika: 4,
    data: "2025-06-06",
    godzina_od: "17:00",
    godzina_do: "18:45",
    cel: "Test2",
  },
  {
    id_rezerwacji: 6,
    id_sali: 2,
    id_uzytkownika: 4,
    data: "2025-06-06",
    godzina_od: "11:30",
    godzina_do: "13:30",
    cel: "Konsultacje indywidualne",
  },
  {
    id_rezerwacji: 7,
    id_sali: 3,
    id_uzytkownika: 4,
    data: "2025-06-07",
    godzina_od: "15:15",
    godzina_do: "17:00",
    cel: "Egzamin końcowy",
  },
  {
    id_rezerwacji: 8,
    id_sali: 4,
    id_uzytkownika: 4,
    data: "2025-06-08",
    godzina_od: "17:00",
    godzina_do: "18:45",
    cel: "Projekt grupowy",
  },
];
