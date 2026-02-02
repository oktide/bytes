import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MealView from './pages/MealView'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MealView />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
