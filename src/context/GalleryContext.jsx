import { createContext, useContext, useState, useEffect } from 'react'
import { galleryPlaneData } from '@/data/galleryData'
import { fetchGalleryItems } from '@/lib/db'

function rowToPlane(row, fallbackTextureSrc) {
  return {
    fallbackColor: row.fallback_color,
    accentColor: row.accent_color,
    textureSrc: row.texture_url || fallbackTextureSrc,
    position: { x: row.position_x, y: row.position_y },
    backgroundColor: row.background_color,
    blob1Color: row.blob1_color,
    blob2Color: row.blob2_color,
    label: { word: row.label_word, pms: row.label_pms, color: row.label_color },
    caseStudy: {
      slug: row.slug,
      title: row.cs_title,
      tagline: row.cs_tagline,
      accent: row.cs_accent,
      section1Title: row.cs_section1_title || 'Overview',
      overview: row.cs_overview,
      section2Title: row.cs_section2_title || 'Approach',
      approach: row.cs_approach,
      section3Title: row.cs_section3_title || 'Outcome',
      outcome: row.cs_outcome,
      stat1: { value: row.cs_stat1_value, label: row.cs_stat1_label },
      stat2: { value: row.cs_stat2_value, label: row.cs_stat2_label },
      stat3: { value: row.cs_stat3_value, label: row.cs_stat3_label },
    },
  }
}

const GalleryContext = createContext(galleryPlaneData)

export function GalleryProvider({ children }) {
  const [planeData, setPlaneData] = useState(galleryPlaneData)

  useEffect(() => {
    fetchGalleryItems()
      .then((rows) => {
        const mapped = rows.map((row, i) => rowToPlane(row, galleryPlaneData[i]?.textureSrc))
        setPlaneData(mapped)
      })
      .catch(() => {})
  }, [])

  return (
    <GalleryContext.Provider value={{ planeData, setPlaneData }}>
      {children}
    </GalleryContext.Provider>
  )
}

export function useGallery() {
  return useContext(GalleryContext)
}

export { rowToPlane }
