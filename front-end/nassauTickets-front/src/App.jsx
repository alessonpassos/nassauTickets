import { useEffect, useState } from 'react';

function App() {
  const [status, setStatus] = useState('verificando...');

  useEffect(() => {
    fetch('http://localhost:3000/api/health')
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus('offline'));
  }, []);

  return (
    <main>
      <h1>Nassau Tickets</h1>
      <p>Back-end: {status}</p>
    </main>
  );
}

export default App;