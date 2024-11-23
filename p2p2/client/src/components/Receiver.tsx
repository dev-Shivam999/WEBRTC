import { useEffect, useMemo, useRef, useState } from "react";


const Receiver = () => {

    const socket = useMemo(() => { return new WebSocket("ws://localhost:3000") }, [])
    const remoteVideoRef = useRef<HTMLVideoElement>(null)
    const localVideoRef = useRef<HTMLVideoElement>(null)
    const [localStream, setLocalStream] = useState<null | MediaStream>(null)
    const [peer, setPeer] = useState<null | RTCPeerConnection>(null)
    const server = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
        ],
    }
    useEffect(() => {
        socket.onopen = () => {

            socket.send(JSON.stringify({ type: "receiver" }))
        }
        const pc = new RTCPeerConnection(server)
        const pc2 = new RTCPeerConnection(server)
        setPeer(pc2)
     
        pc.ontrack = (event) => {


            if (event.track.kind == "video" && remoteVideoRef.current) {


                remoteVideoRef.current.srcObject = event.streams[0]
            }

        }

        localStream?.getTracks().forEach(track => {
            peer?.addTrack(track, localStream)
        })

        socket.onmessage = async (message) => {
            const data = JSON.parse(message.data)
            console.log(data);



            if (data.type == "ice") {

                pc.addIceCandidate(new RTCIceCandidate(data.sdp))

            }
            else if (data.type == "offer") {

                pc.setRemoteDescription({ sdp: data.offer.sdp, type: "offer" })
                const ans = await pc.createAnswer()
                await pc.setLocalDescription(ans)


                socket.send(JSON.stringify({ type: "ans", answer: pc.localDescription }))
            } else if (data.type == "get-ans"){
                peer?.setRemoteDescription({ sdp: data.ans.sdp, type: "answer" })

            } else if (data.type == "send-offer"){
                console.log("hi");
                
                pc2.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.send(JSON.stringify({ type: "send-ice", ice: event.candidate }))

                    }
                }
                pc2.onnegotiationneeded = async () => {
                    const offer = await pc2.createOffer()
                    await pc2.setLocalDescription(offer)
                    socket.send(JSON.stringify({ type: "send-offer2", offer: pc2.localDescription }))
                }
            }
        }
        mediaAccess(pc)

        return () => {
            socket.close()
            pc.close()
        }
    }, [socket])
 


    const mediaAccess = async (pc: RTCPeerConnection) => {
        window.navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true


        }).then(stream => {
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = new MediaStream([stream.getVideoTracks()[0]])
                localVideoRef.current.play()
            }
            setLocalStream(stream)

        })

    }
    return (
        <div>
            <video width={400} height={400} ref={remoteVideoRef} autoPlay></video>
            <video width={400} height={400} ref={localVideoRef} muted ></video>

        </div>
    );
};

export default Receiver;