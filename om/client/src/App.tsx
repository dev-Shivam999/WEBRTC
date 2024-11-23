import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const App = () => {
    const signalingServer = useMemo(() => new WebSocket("ws://localhost:3000"), []);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [Peer, SetPeer] = useState<null | RTCPeerConnection>(null)
    const [LocalStream, setLocalStream] = useState<null | MediaStream>(null)
    const [newPeer, newSetPeer] = useState<null | RTCPeerConnection>(null)
    const iceServer = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
        ],
    }
    const getCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            // if (localVideoRef.current) {
            // localVideoRef.current.srcObject = new MediaStream([stream.getVideoTracks()[0]]);
            // await localVideoRef.current.play();
            // }
            setLocalStream(stream)
        } catch (error) {
            console.error("Error accessing camera:", error);
        }
    }, []);

    // WebSocket message handler
    const handleSignalingServerMessage = async (message: MessageEvent) => {
        const data = JSON.parse(message.data);
        console.log(data.type);

        if (data.type == "create-offer") {
            const pc = new RTCPeerConnection(iceServer)

            if (LocalStream) {
                LocalStream.getTracks().forEach(track => {
                    pc.addTrack(track, LocalStream)
                })
            }
            pc.ontrack = async (event) => {
                if (event.track.kind == "video" && localVideoRef.current) {


                    localVideoRef.current.srcObject = event.streams[0]
                    await localVideoRef.current.play()
                }
            }
            SetPeer(pc)
           
            pc.onnegotiationneeded = async () => {

                const offer = await pc.createOffer()
                await pc.setLocalDescription(offer)
                pc.onicecandidate = (ice) => {
                    if (ice.candidate) {
                        signalingServer.send(JSON.stringify({
                            type: "ice", ice: ice.candidate
                        }));


                    }

                }
                signalingServer.send(JSON.stringify({ type: "send-Offer", offer: pc.localDescription }));


            }



        }
        else if (data.type == "create-answer") {
            const peer = new RTCPeerConnection(iceServer)
            newSetPeer(peer)
          

            peer.ontrack = async (event) => {
                console.log(event.streams[0]);
                if (event.track.kind == "video" && remoteVideoRef.current) {


                    remoteVideoRef.current.srcObject = event.streams[0]
                    await remoteVideoRef.current.play().then((e)=>console.log(e)
                    ).catch((e) => console.log(e)).catch((e) => console.log(e))
                }
            }
            await peer?.setRemoteDescription(new RTCSessionDescription(data.offer))
            const ans = await peer?.createAnswer()


            await peer.setLocalDescription(ans)


            signalingServer.send(JSON.stringify({ type: "send-ans", ans: peer.localDescription }));

        } else if (data.type == "answer") {
            Peer?.setRemoteDescription(new RTCSessionDescription(data.ans))
        } else if (data.type == "send-ice") {


           await newPeer?.addIceCandidate(new RTCIceCandidate(data.ice))
        }


    }

    useEffect(() => {


        signalingServer.onopen = () => {
            console.log("WebSocket connection opened");
            signalingServer.send(JSON.stringify({ type: "user" }));
        };

        signalingServer.onmessage = handleSignalingServerMessage;

        signalingServer.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        signalingServer.onclose = () => {
            console.log("WebSocket connection closed");
        };


    }, [signalingServer, handleSignalingServerMessage]);
    useEffect(() => { getCamera(); }, [])
    console.log("ji");
    

    return (
        <div>
            <video width={300} height={300} muted  ref={localVideoRef}></video>
            <video width={300} height={300} autoPlay muted playsInline  ref={remoteVideoRef}></video>
        </div>
    );
};

export default App;
