# SoloConference

SoloConference is a secure, real-time 1-on-1 video calling application built with React, Express, WebSockets, and WebRTC. It allows users to create protected virtual meeting rooms, invite a peer via a unique meeting code, and establish peer-to-peer audio/video streaming.


## Features

- **Direct peer-to-peer streaming:** Audio and video route directly between participants via WebRTC, backed by standard STUN servers for reliable NAT traversal and minimal latency.
- **Instant conference generation:** Generates a unique conference code upon creation for seamless invite sharing.
- **Passcode protected conferences:** Add an optional room passcode to ensure only intended participants can join the session.
- **Robust Authentication:** User access is guarded by a dual-token JWT architecture (short-lived access tokens paired with secure refresh tokens) and Argon2 password hashing.
- **Responsive signaling:** A dedicated WebSocket signaling layer negotiates connection handshakes—handling SDP offer/answer exchanges and ICE candidates—before stepping aside for direct media flow.

## Tech Stack

- **Frontend:**  React, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Real-Time / Media:** WebRTC API, WebSockets / Socket.io, Google Public STUN
- **Authentication:** JWT (Access + Refresh Token flow), Argon2 password hashing

## Getting Started

### Using Docker

1. Clone the repository.

2. Navigate to the project directory:
   ```bash
   cd soloconference
   ```

3. Setup the env files for both backend and frontend:
    - Move to the `backend` directory and run the following command to create a `.env` file:
    ```bash
    cd backend

    cp .env.example .env
    cp database.env.example database.env
    ```

    - Move to the `frontend` directory and run the following command to create a `.env` file:
    ```bash
    cd ../frontend

    cp .env.example .env.local
    ```

4. Modify the `.env`, `database.env` and `.env.local` file according to your environment.s

4. Start the application using Docker Compose:
    ```bash
    docker compose up --build
    ```

5. Access the application in your browser at `http://localhost:5173` or at the port which you have configured in `frontend/.env.local` file.

### Manual Setup

1. Clone the repository.

