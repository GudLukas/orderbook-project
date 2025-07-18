import './App.css'
import ApiTest from './components/ApiTest.jsx'
import OrderBookGrid from './components/OrderBookGrid';

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>📊 Orderbook Trading Platform</h1>
        <p>Real-time order management system</p>
      </header>
      
      <main className="main-content">
        <div className="welcome-card">
          <h2>Welcome to the Trading Floor</h2>
          <p>Monitor and manage your orders in real-time</p>
        </div>
      </main>

      <OrderBookGrid />

    </div>


  )
}

export default App
