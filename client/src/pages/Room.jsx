import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log("came here? from client");
    console.log(`Email ${email} joined room with ${id}`);
    setRemoteSocketId(id);
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    return () => {
      socket.off("user:joined", handleUserJoined);
    };
  }, [handleUserJoined, socket]);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
  });

  return (
    <div>
      <h1>Room page</h1>
      {remoteSocketId ? "connected" : " No one in room"}
      {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
    </div>
  );
};

export default RoomPage;
