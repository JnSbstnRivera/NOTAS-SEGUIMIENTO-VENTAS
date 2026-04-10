import windmarLogo from "@/assets/windmar-logo.png";

export default function SplashScreen() {
  return (
    <div className="splash-container">
      <div className="splash-logo">
        <img src={windmarLogo} alt="Windmar Home" className="splash-img" />
      </div>
      <div className="splash-text">
        <p className="splash-title-orange">Notas de Seguimiento</p>
        <p className="splash-title-white">Equipo de Ventas</p>
      </div>
      <div className="splash-loading-track">
        <div className="splash-loading-fill" />
      </div>
    </div>
  );
}
