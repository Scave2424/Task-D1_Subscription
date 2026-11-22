import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import NavFooter from './components/NavFooter'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Post from './pages/Post'
import Pricing from './pages/Pricing'

// Checks whether the user is logged in before displaying the Post page.
function ProtectedPost() {
  const token = localStorage.getItem('token')

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ message: 'Please log in first to access the Post page.' }}
      />
    )
  }

  return <Post />
}

// Connects the website pages to their routes.
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NavFooter />}>
          <Route index element={<Home />} />
          <Route path="post" element={<ProtectedPost />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="pricing" element={<Pricing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App