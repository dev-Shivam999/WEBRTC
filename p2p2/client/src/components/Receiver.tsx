import { useEffect, useMemo, useRef } from "react";


const Receiver = () => {

    const socket = useMemo(() => { return new WebSocket("ws://localhost:3000") }, [])
    const remoteVideoRef = useRef<HTMLVideoElement>(null)
    const localVideoRef = useRef<HTMLVideoElement>(null)
    useEffect(() => {
        socket.onopen = () => {

            socket.send(JSON.stringify({ type: "receiver" }))
        }
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
            ],
        })
        pc.ontrack = (event) => {


            if (event.track.kind == "video" && remoteVideoRef.current) {


                remoteVideoRef.current.srcObject = event.streams[0]
            }

        }
        socket.onmessage = async (message) => {
            const data = JSON.parse(message.data)



            if (data.type == "ice") {

                pc.addIceCandidate(new RTCIceCandidate(data.sdp))

            }
            else if (data.type == "offer") {
               
                pc.setRemoteDescription({sdp:data.offer.sdp,type:"offer"})
                const ans = await pc.createAnswer()
                await pc.setLocalDescription(ans)


                socket.send(JSON.stringify({ type: "ans", answer: pc.localDescription }))
            }
        }
        // mediaAccess(pc)

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
                localVideoRef.current.srcObject=stream
                localVideoRef.current.play()
            }
            // stream.getTracks().forEach(track => {
            //     pc.addTrack(track,stream)
            // })
        })
      
    }
    return (
        <div>
            <video width={400} height={400} ref={remoteVideoRef} muted autoPlay></video>
            <video width={400} height={400} ref={localVideoRef} muted ></video>

        </div>
    );
};

export default Receiver;