import { Routes, Route, useLocation } from 'react-router-dom'
import { GalleryProvider } from './context/GalleryContext'
import Navbar from './components/Navbar'
import HeroZoom from './components/HeroZoom'
import BrainSection from './components/BrainSection'
import DepthGallery from './components/DepthGallery'
import Footer from './components/Footer'
import SmoothSnap from './components/SmoothSnap'
import CaseStudy from './pages/CaseStudy'
import AdminLogin from './pages/AdminLogin'
import Admin from './pages/Admin'

function HomePage() {
  const { state } = useLocation()

  return (
    <>
      <SmoothSnap locationState={state} />
      <Navbar />
      <HeroZoom />
      <BrainSection />
      <DepthGallery locationState={state} />
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <GalleryProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/case-study/:slug" element={<CaseStudy />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </GalleryProvider>
  )
}
