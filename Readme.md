

1. STUN Server (Session Traversal Utilities for NAT)
Purpose: Helps devices discover their public IP address and the type of NAT (Network Address Translation) they’re behind.
Function: When two devices want to connect, they may be on different networks or behind firewalls. The STUN server helps each device determine their public-facing IP address and port. This information is then shared between peers, allowing them to try connecting directly.
Usage: STUN is typically used for establishing connections in environments where NAT is relatively simple, like home networks.
2. TURN Server (Traversal Using Relays around NAT)
Purpose: Provides a fallback when a direct connection (P2P) isn't possible, usually because of strict firewalls or complex NAT.
Function: The TURN server acts as a relay. Instead of a direct connection, the data (audio, video, etc.) is routed through the TURN server. This makes TURN more resource-intensive but ensures connectivity.
Usage: TURN is used only when STUN fails to establish a direct connection, as relaying through TURN can add latency.
3. Signaling Server
Purpose: Handles the exchange of connection information (metadata) needed to set up the WebRTC connection between peers.
Function: Before peers can connect, they need to exchange details such as their IP addresses, ports, and session descriptions (SDP). The signaling server coordinates this initial exchange via a communication protocol (often WebSocket, but HTTP can work too).
Usage: Signaling is not handled by WebRTC itself; it's left to the developer to implement. The signaling server is used only for the initial setup and not for actual data exchange.