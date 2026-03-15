import { Server, Socket } from "socket.io";

export function registerRoomHandlers(io: Server, socket: Socket) {
  const { roomId, userId, userName } = socket.data;

  // Get online users in room
  socket.on("room:getUsers", async () => {
    const sockets = await io.in(roomId).fetchSockets();
    const users = sockets.map((s) => ({
      userId: s.data.userId,
      userName: s.data.userName,
    }));
    socket.emit("room:users", users);
  });
}
