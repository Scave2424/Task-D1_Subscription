import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import NavFooter from './components/NavFooter'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Post from './pages/Post'

// Connects the website pages to their routes.
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NavFooter />}>
          <Route index element={<Home />} />
          <Route path="post" element={<Post />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App