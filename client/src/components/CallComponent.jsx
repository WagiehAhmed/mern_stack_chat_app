import React, { useEffect, useRef, useState } from "react";
// import Peer from "simple-peer";
import Peer from "simple-peer/simplepeer.min.js";

import { useDataContext } from "../context/DataContextProvider";
import { useParams } from "react-router-dom";
export default function CallComponent() {
  const { socket, onlineUsers, userDetails } = useDataContext();
  const [stream, setStream] = useState(null);
  const [peers, setPeers] = useState([]);
  const userVideoRef = useRef();
  const partnerVideoRef = useRef();
  const { chatId } = useParams();
  useEffect(() => {
    // Access the user's camera and microphone
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = currentStream;
        }
      })
      .catch((err) => console.error("Error accessing media devices.", err));

    // Listen for incoming connections
    socket.on("signal", async (data) => {
      const { signal, from } = data;
      const peer = peers.find((p) => p.peerId === from);

      if (!peer) {
        const newPeer = createPeer(from, socket.id, false);
        setPeers((prevPeers) => [...prevPeers, newPeer]);
        newPeer.signal(signal);
      } else {
        peer.signal(signal);
      }
    });
  }, []);

  // Function to initiate a call
  const initiateCall = () => {
    const peer = createPeer(
      onlineUsers.get(userDetails._id)?.socketId,
      onlineUsers.get(chatId)?.socketId,
      true
    );
    setPeers((prevPeers) => [...prevPeers, peer]);
  };

  // Helper function to create a SimplePeer instance
  const createPeer = (initiatorId, receiverId, isInitiator) => {
    const peer = new Peer({
      initiator: isInitiator,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("signal", {
        signal,
        to: isInitiator ? receiverId : initiatorId,
      });
    });

    peer.on("stream", (partnerStream) => {
      if (partnerVideoRef.current) {
        partnerVideoRef.current.srcObject = partnerStream;
      }
    });

    return { peer, peerId: initiatorId || socket.id };
  };

  return (
    <div>
      <h1>WebRTC Audio/Video Call</h1>
      <video
        ref={userVideoRef}
        autoPlay
        muted
        style={{ width: "300px", height: "200px" }}
      />
      <video
        ref={partnerVideoRef}
        autoPlay
        style={{ width: "300px", height: "200px" }}
      />
      <button onClick={initiateCall}>Initiate Call</button>
    </div>
  );
}
