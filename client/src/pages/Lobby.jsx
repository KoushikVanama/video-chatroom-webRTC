import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

export const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [roomId, setRoom] = useState("");
  const socket = useSocket();
  const navigate = useNavigate();
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, roomId });
    },
    [email, roomId, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, roomId } = data;
      console.log(email, roomId);
      navigate(`/room/${roomId}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [handleJoinRoom, socket]);

  return (
    <>
      <h1>Lobby</h1>
      <form id="lobbyForm" onSubmit={handleSubmit}>
        <label htmlFor="email">Email ID</label>
        <input
          type="email"
          id="email"
          onChange={(e) => setEmail(e.target.value)}
        ></input>
        <br />
        <label htmlFor="roomno">Room no</label>
        <input
          type="text"
          id="roomno"
          onChange={(e) => setRoom(e.target.value)}
        ></input>
        <br />
        <button>JOIN</button>
      </form>
    </>
  );
};
