import { useEffect, useRef } from "react";

const LiveCamera = ({ onClose }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // back camera on mobile
        });

        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera error:", err);
      }
    }

    startCamera();
  }, []);

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 bg-dark d-flex flex-column align-items-center justify-content-center"
      style={{ zIndex: 5000 }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "100%", maxWidth: "500px", borderRadius: "10px" }}
      />

      <button className="btn btn-danger mt-3" onClick={onClose}>
        Close Camera
      </button>
    </div>
  );
};

export default LiveCamera;
