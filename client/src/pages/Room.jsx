import React, { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";

import { useSocket } from "../context/SocketProvider";
import PeerService from "../service/peer";

const peer = new PeerService();

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log("came here? from client");
    console.log(`Email ${email} joined room with ${id}`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    console.log(stream, "stream in handleCallUSer");
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(stream, "stream in handleIncomingCall");
      console.log("Incoming call :", from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    console.log(myStream, "myStream in sendStreams");
    for (const track of myStream?.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("call accepted");
      sendStreams();
    },
    [sendStreams]
  );

  useEffect(() => {
    peer.peer.addEventListener("track", async (event) => {
      const remoteStream = event.streams;
      console.log("GOT TRACKS!!!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.on("incoming:call", handleIncomingCall);
      socket.on("call:accepted", handleCallAccepted);
    };
  }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted]);

  return (
    <div>
      <h1>Room page</h1>
      <h4>{remoteSocketId ? "connected" : " No one in room"}</h4>
      {myStream && <button onClick={sendStreams}>Send Stream</button>}
      {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
      {myStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            playing
            muted
            width="350px"
            height="200px"
            url={myStream}
          />
        </>
      )}
      {remoteStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            playing
            muted
            width="350px"
            height="200px"
            url={remoteStream}
          />
        </>
      )}
    </div>
  );
};

export default RoomPage;
