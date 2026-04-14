import { useState, useEffect } from "react";
import SalesNotesForm from "@/components/SalesNotesForm";
import SplashScreen from "@/components/SplashScreen";

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Barra 0.9s + cortina sube 0.45s = 1.35s + margen
    const timer = setTimeout(() => setShowSplash(false), 1450);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen />}
      <SalesNotesForm />
    </>
  );
};

export default Index;
