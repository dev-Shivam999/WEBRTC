import { useEffect, useMemo, useRef } from "react";

const Send = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const socket = useMemo(() => new WebSocket("ws://localhost:3000"), []);

    useEffect(() => {
        socket.onopen = () => {
            socket.send(JSON.stringify({ message: "sender" }));
        };

        return () => {
            socket.close();
        };
    }, [socket]);

    const click = () => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log(event.candidate);
                
                socket.send(JSON.stringify({ message: "ice", ice: event.candidate }));
            }
        };
       

        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.send(JSON.stringify({ message: "createOffer", offer: pc.localDescription }));
        };

        socket.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            if (data.message === "ans") {
                try {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.ans));
                } catch (error) {
                    console.error("Failed to set remote description:", error);
                }
            }
        };

        media(pc);
    };

    const media = async (pc: RTCPeerConnection) => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        }
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    };
console.log("ko");

    return (
        <div>
            <button onClick={click}>Start Stream</button>
            <video ref={videoRef} autoPlay muted width={400} height={400}></video>
        </div>
    );
};

export default Send;
