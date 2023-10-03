import {useState} from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='landingPage'>      
      <h1>We are Coming Soon...</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
      
    </div>
  )
}

export default App
