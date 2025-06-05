// Typ sali
export type Room = {
  id: number;
  name: string;
  capacity: number;
  type: string;
  location: string;
  description: string;
};

// Dane mockowane
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
    name: "22",
    capacity: 20,
    type: "graficzna",
    location: "Budynek P, piętro 2",
    description: "Sala graficzna",
  },
  {
    id: 4,
    name: "33",
    capacity: 20,
    type: "programistyczna",
    location: "Budynek P, piętro 3",
    description: "Sala programistyczna",
  },
];
