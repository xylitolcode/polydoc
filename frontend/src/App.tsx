import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
        <div className="flex justify-center space-x-4 mb-6">
          <a href="https://vite.dev" target="_blank" className="hover:opacity-80 transition-opacity">
            <img src={viteLogo} className="h-24 w-24" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" className="hover:opacity-80 transition-opacity">
            <img src={reactLogo} className="h-24 w-24 animate-spin-slow" alt="React logo" />
          </a>
        </div>
        <h1 className="text-4xl font-bold text-blue-500 mb-6">Vite + React + Tailwind</h1>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg max-w-md mx-auto">
          <button 
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-full mb-4 transition-all duration-300 transform hover:scale-105"
            onClick={() => setCount((count) => count + 1)}
          >
            count is {count}
          </button>
          <p className="text-gray-300">
            Edit <code className="bg-gray-700 px-1 rounded">src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="mt-6 text-gray-400 hover:text-gray-200 transition-colors">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </>
  )
}

export default App
