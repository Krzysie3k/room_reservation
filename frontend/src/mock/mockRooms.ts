// Typ sali
export type Room = {
  id: number;
  name: string;
  capacity: number;
  type: string;
  location: string;
  description: string;
};

// Dane mockowane (z SQL)
export const mockRooms: Room[] = [
  {
    id: 1,
    name: "11",
    capacity: 20,
    type: "wykładowa",
    location: "Budynek P, piętro 1",
    description: "Sala wykładowa",
  },
  {
    id: 2,
    name: "12",
    capacity: 30,
    type: "komputerowa",
    location: "Budynek P, piętro 1",
    description: "Sala komputerowa",
  },
  {
    id: 3,
    name: "13",
    capacity: 20,
    type: "wykładowa",
    location: "Budynek P, piętro 2",
    description: "Pokój wykładowców",
  },
  {
    id: 4,
    name: "21",
    capacity: 20,
    type: "komputerowa",
    location: "Budynek P, piętro 3",
    description: "Sala komputerowa",
  },
  {
    id: 5,
    name: "22",
    capacity: 20,
    type: "komputerowa",
    location: "Budynek P, piętro 3",
    description: "Sala komputerowa",
  },
  {
    id: 6,
    name: "23",
    capacity: 20,
    type: "graficzna",
    location: "Budynek P, piętro 3",
    description: "Sala graficzna",
  },
  {
    id: 7,
    name: "31",
    capacity: 20,
    type: "programistyczna",
    location: "Budynek P, piętro 4",
    description: "Sala programistyczna",
  },
  {
    id: 8,
    name: "32",
    capacity: 20,
    type: "programistyczna",
    location: "Budynek P, piętro 4",
    description: "Sala programistyczna",
  },
  {
    id: 9,
    name: "33",
    capacity: 20,
    type: "programistyczna",
    location: "Budynek P, piętro 4",
    description: "Sala programistyczna",
  },
  {
    id: 10,
    name: "A3",
    capacity: 200,
    type: "wykładowa",
    location: "Budynek P, parter",
    description: "Aula główna",
  },
];
