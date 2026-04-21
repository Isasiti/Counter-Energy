import { useState } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Login } from "./components/Login";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return <RouterProvider router={router} />;
}
