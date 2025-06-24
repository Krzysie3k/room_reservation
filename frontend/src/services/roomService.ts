import { mockRooms, Room } from "mock/mockRooms";
// import axios from' '@/mock/mockRooms';

export async function getRooms(): Promise<Room[]> {
  // Tu teraz mock, później axios
  return Promise.resolve(mockRooms);
}
