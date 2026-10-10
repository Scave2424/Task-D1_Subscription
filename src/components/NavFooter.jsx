import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

// Keeps the same header and footer around each page.
function NavFooter() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}

export default NavFooter