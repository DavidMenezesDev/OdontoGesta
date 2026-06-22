import { useEffect, useState } from "react";
import { fetchApi } from "./services/api";
import "./App.css";

interface HealthResponse {
  message: string;
}

function App() {
  const [status, setStatus] = useState<string>("conectando...");

  useEffect(() => {
    fetchApi<HealthResponse>("/")
      .then((data) => setStatus(data.message))
      .catch(() => setStatus("offline"));
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <h1>OdontoGestão</h1>
          <span className={`badge badge--${status === "OdontoGesta API" ? "online" : "offline"}`}>
            {status === "OdontoGesta API" ? "online" : status}
          </span>
        </div>
      </header>

      <main className="main">
        <div className="greeting">
          <h2>Bem-vindo ao OdontoGestão</h2>
          <p>Sistema de gestão para clínicas odontológicas</p>
        </div>
      </main>
    </div>
  );
}

export default App;
