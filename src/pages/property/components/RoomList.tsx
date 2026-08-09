import { Card } from "@/components/ui/card"
import { RoomCard } from "./RoomCard"
import type { Room } from "@/types/property"

type RoomListProps = {
  rooms: Room[]
  onSelectRoomType?: (room: Room) => void
}

export function RoomList({ rooms, onSelectRoomType }: RoomListProps) {
  return (
    <Card className="gap-0 rounded-3xl p-6 shadow-sm ring-0">
      <h2 className="mb-5 text-xl font-bold text-gray-900">
        Available Room Types
      </h2>

      {rooms.length === 0 ? (
        <p className="text-sm text-gray-500">No room types are available.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              {...room}
              onViewRooms={onSelectRoomType}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
