import RoomTable from "./RoomTable";
import { mockRooms } from "@/mock/mockRooms";

export default function RoomsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Sale</h1>
      <RoomTable rooms={mockRooms} />
    </div>
  );
}
