export type User = {
  id: number;
  name: string;
  surname: string;
  email: string;
  password: string;
  role: string;
};

export const mockUsers: User[] = [
  {
    id: 1,
    name: "Agnieszka",
    surname: "Siwocha",
    email: "asiwocha@san.edu.pl",
    password: "AsIw0chA1",
    role: "wykladowca",
  },
  {
    id: 2,
    name: "Leszek",
    surname: "Rutkowski",
    email: "lrutkowski@san.edu.pl",
    password: "Lr@tK0ws2",
    role: "wykladowca",
  },
  {
    id: 3,
    name: "Danuta",
    surname: "Rutkowska",
    email: "drutkowska@san.edu.pl",
    password: "Dr!tk0ws3",
    role: "wykladowca",
  },
  {
    id: 4,
    name: "Test",
    surname: "Testowski",
    email: "test@s.pl",
    password: "test",
    role: "wykladowca",
  },
];
