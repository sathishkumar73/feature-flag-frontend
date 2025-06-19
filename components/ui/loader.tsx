export default function Loader3DCube() {
  return (
    <div className="loader-cube-wrapper">
      <div className="loader-cube">
        <div></div><div></div><div></div><div></div><div></div><div></div>
      </div>

      <style jsx>{`
        .loader-cube-wrapper {
          width: 64px;
          height: 64px;
          perspective: 800px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .loader-cube {
          width: 40px;
          height: 40px;
          position: relative;
          transform-style: preserve-3d;
          animation: rotate-cube 2s linear infinite;
        }
        .loader-cube div {
          position: absolute;
          width: 40px;
          height: 40px;
          background: #2D2D2D; /* Softer dark gray for the main cube color */
          opacity: 0.8; /* Keep the existing opacity for a subtle transparency */
          border: 2px solid #555555; /* A slightly lighter dark gray for the border */
        }
        .loader-cube div:nth-child(1) { transform: translateZ(20px); }
        .loader-cube div:nth-child(2) { transform: rotateY(90deg) translateZ(20px); }
        .loader-cube div:nth-child(3) { transform: rotateY(180deg) translateZ(20px); }
        .loader-cube div:nth-child(4) { transform: rotateY(-90deg) translateZ(20px); }
        .loader-cube div:nth-child(5) { transform: rotateX(90deg) translateZ(20px); }
        .loader-cube div:nth-child(6) { transform: rotateX(-90deg) translateZ(20px); }

        @keyframes rotate-cube {
          0% { transform: rotateX(0deg) rotateY(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}