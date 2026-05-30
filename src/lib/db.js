import { supabase } from './supabase'

export async function fetchGalleryItems() {
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .order('sort_order')
  if (error) throw error
  return data
}

export async function updateGalleryItem(slug, fields) {
  const { error } = await supabase
    .from('gallery_items')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('slug', slug)
  if (error) throw error
}

export async function uploadGalleryImage(slug, file) {
  const ext = file.name.split('.').pop()
  const filename = `${slug}-${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('gallery-images')
    .upload(filename, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('gallery-images').getPublicUrl(filename)
  return data.publicUrl
}

export async function insertGalleryItem(sortOrder) {
  const slug = 'card-' + Date.now()
  const { error } = await supabase.from('gallery_items').insert({
    sort_order: sortOrder,
    slug,
    fallback_color: '#8ca550',
    accent_color: '#8ca550',
    background_color: '#111a0d',
    blob1_color: '#8ca550',
    blob2_color: '#4a6030',
    label_word: 'new',
    label_pms: '',
    label_color: '#f4f4f4',
    position_x: 0,
    position_y: 0,
    cs_title: 'New Card',
    cs_tagline: '',
    cs_accent: '#8ca550',
    cs_section1_title: 'Overview',
    cs_overview: '',
    cs_section2_title: 'Approach',
    cs_approach: '',
    cs_section3_title: 'Outcome',
    cs_outcome: '',
    cs_stat1_value: '',
    cs_stat1_label: '',
    cs_stat2_value: '',
    cs_stat2_label: '',
    cs_stat3_value: '',
    cs_stat3_label: '',
  })
  if (error) throw error
}

export async function deleteGalleryItem(slug) {
  const { error } = await supabase.from('gallery_items').delete().eq('slug', slug)
  if (error) throw error
}

export async function extractColorsFromImage(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 80
      canvas.height = 80
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, 80, 80)
      const avg = (x, y, w, h) => {
        const data = ctx.getImageData(x, y, w, h).data
        let r = 0, g = 0, b = 0, n = 0
        for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i + 1]; b += data[i + 2]; n++ }
        const hex = (v) => Math.round(v / n).toString(16).padStart(2, '0')
        return `#${hex(r)}${hex(g)}${hex(b)}`
      }
      resolve({
        backgroundColor: avg(0, 0, 80, 80),
        blob1Color: avg(0, 0, 40, 40),
        blob2Color: avg(40, 40, 80, 80),
      })
    }
    img.onerror = () => resolve(null)
    img.src = src
  })
}
