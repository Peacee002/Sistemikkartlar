import { RoomCreateForm } from "@/components/rooms/room-create-form";

export default function NewRoomPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Yeni Oda Oluştur</h1>
      <RoomCreateForm />
    </div>
  );
}
