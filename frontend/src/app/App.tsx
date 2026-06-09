import { useState, useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Login } from "./components/Login";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión guardada en localStorage
    const usuarioCedula = localStorage.getItem("usuarioCedula");
    if (usuarioCedula) {
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("usuarioCedula");
    localStorage.removeItem("usuarioEmail");
    localStorage.removeItem("usuarioNombre");
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return <RouterProvider router={router} context={{ onLogout: handleLogout }} />;
}

