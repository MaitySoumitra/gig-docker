import { useEffect, useState } from "react";
import { socket } from "../services/socket";

export const useOnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    socket.on("online-users", setOnlineUsers);

    return () => {
      socket.off("online-users");
    };
  }, []);

  return onlineUsers;
};
