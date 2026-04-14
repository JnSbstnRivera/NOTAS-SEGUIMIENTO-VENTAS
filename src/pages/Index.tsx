import { useState, useEffect } from "react";
import SalesNotesForm from "@/components/SalesNotesForm";
import SplashScreen from "@/components/SplashScreen";

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Cortina baja 0.32s + barra 0.72s + cortina sube 0.42s = 1.46s + margen
    const timer = setTimeout(() => setShowSplash(false), 1650);
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
