import { useState, useEffect } from "react";
import SalesNotesForm from "@/components/SalesNotesForm";
import SplashScreen from "@/components/SplashScreen";

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Desmonta el splash después de que la animación termine (1.5s delay + 0.55s fade)
    const timer = setTimeout(() => setShowSplash(false), 2400);
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
