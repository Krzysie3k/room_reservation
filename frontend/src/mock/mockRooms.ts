// Typ sali
export type Room = {
  id: number;
  name: string;
  capacity: number;
  type: string;
  building: string;
  floor: string;
  description: string;
};

// Dane mockowane (z SQL)
export const mockRooms: Room[] = [
  {
    id: 1,
    name: "11",
    capacity: 20,
    type: "wykładowa",
    building: "P",
    floor: "1",
    description: "Sala wykładowa",
  },
  {
    id: 2,
    name: "12",
    capacity: 30,
    type: "komputerowa",
    building: "P",
    floor: "1",
    description: "Sala komputerowa",
  },
  {
    id: 3,
    name: "13",
    capacity: 20,
    type: "graficzna",
    building: "P",
    floor: "1",
    description: "Sala graficzna",
  },
  {
    id: 4,
    name: "21",
    capacity: 30,
    type: "wykładowa",
    building: "P",
    floor: "2",
    description: "Pokój wykładowców",
  },
  {
    id: 5,
    name: "22",
    capacity: 20,
    type: "komputerowa",
    building: "P",
    floor: "2",
    description: "Sala komputerowa",
  },
  {
    id: 6,
    name: "23",
    capacity: 20,
    type: "komputerowa",
    building: "P",
    floor: "3",
    description: "Sala komputerowa",
  },
  {
    id: 7,
    name: "24",
    capacity: 20,
    type: "graficzna",
    building: "P",
    floor: "3",
    description: "Sala graficzna",
  },
  {
    id: 8,
    name: "31",
    capacity: 20,
    type: "programistyczna",
    building: "P",
    floor: "4",
    description: "Sala programistyczna",
  },
  {
    id: 9,
    name: "32",
    capacity: 30,
    type: "programistyczna",
    building: "P",
    floor: "4",
    description: "Sala programistyczna",
  },
  {
    id: 10,
    name: "33",
    capacity: 30,
    type: "programistyczna",
    building: "P",
    floor: "4",
    description: "Sala programistyczna",
  },
  {
    id: 11,
    name: "41",
    capacity: 30,
    type: "programistyczna",
    building: "P",
    floor: "4",
    description: "Sala programistyczna",
  },
  {
    id: 12,
    name: "42",
    capacity: 30,
    type: "programistyczna",
    building: "P",
    floor: "4",
    description: "Sala programistyczna",
  },
  {
    id: 13,
    name: "A3",
    capacity: 200,
    type: "wykładowa",
    building: "P",
    floor: "parter",
    description: "Aula główna",
  },
];
