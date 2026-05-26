import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import HeroZoom from './components/HeroZoom'
import NextSection from './components/NextSection'
import DepthGallery from './components/DepthGallery'
import Footer from './components/Footer'
import FlowerCursor from './components/FlowerCursor'
import SmoothSnap from './components/SmoothSnap'
import CaseStudy from './pages/CaseStudy'

function HomePage() {
  const { state } = useLocation()

  return (
    <>
      <SmoothSnap locationState={state} />
      <Navbar />
      <HeroZoom />
      <NextSection />
      <DepthGallery />
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <>
      <FlowerCursor />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/case-study/:slug" element={<CaseStudy />} />
      </Routes>
    </>
  )
}
