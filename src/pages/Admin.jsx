import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { fetchGalleryItems, updateGalleryItem, uploadGalleryImage, insertGalleryItem, deleteGalleryItem, extractColorsFromImage } from '@/lib/db'
import { useGallery } from '@/context/GalleryContext'
import { rowToPlane } from '@/context/GalleryContext'
import { galleryPlaneData } from '@/data/galleryData'
import styles from './Admin.module.css'

function rowToFormState(row) {
  return {
    fallback_color: row.fallback_color,
    accent_color: row.accent_color,
    texture_url: row.texture_url || '',
    background_color: row.background_color,
    blob1_color: row.blob1_color,
    blob2_color: row.blob2_color,
    label_word: row.label_word,
    label_pms: row.label_pms,
    label_color: row.label_color,
    cs_title: row.cs_title,
    cs_tagline: row.cs_tagline,
    cs_accent: row.cs_accent,
    cs_section1_title: row.cs_section1_title || 'Overview',
    cs_overview: row.cs_overview,
    cs_section2_title: row.cs_section2_title || 'Approach',
    cs_approach: row.cs_approach,
    cs_section3_title: row.cs_section3_title || 'Outcome',
    cs_outcome: row.cs_outcome,
    cs_stat1_value: row.cs_stat1_value,
    cs_stat1_label: row.cs_stat1_label,
    cs_stat2_value: row.cs_stat2_value,
    cs_stat2_label: row.cs_stat2_label,
    cs_stat3_value: row.cs_stat3_value,
    cs_stat3_label: row.cs_stat3_label,
  }
}

function ColorField({ label, name, value, onChange }) {
  return (
    <div className={styles.colorField}>
      <span className={styles.colorLabel}>{label}</span>
      <div className={styles.colorRow}>
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(name, e.target.value)}
          className={styles.colorPicker}
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(name, e.target.value)}
          className={styles.colorText}
          placeholder="#000000"
          maxLength={7}
        />
      </div>
    </div>
  )
}

function EditPanel({ row, fallbackTextureSrc, onSaved, onDeleted }) {
  const [form, setForm] = useState(rowToFormState(row))
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [previewSrc, setPreviewSrc] = useState(row.texture_url || fallbackTextureSrc)
  const [uploadMsg, setUploadMsg] = useState('')
  const [statusMsg, setStatusMsg] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    setForm(rowToFormState(row))
    setPreviewSrc(row.texture_url || fallbackTextureSrc)
    setUploadMsg('')
    setConfirmDelete(false)
  }, [row.slug])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewSrc(URL.createObjectURL(file))
    setUploadMsg('Uploading…')
    try {
      const url = await uploadGalleryImage(row.slug, file)
      set('texture_url', url)
      setPreviewSrc(url)
      setUploadMsg('Uploaded ✓')
    } catch (err) {
      setUploadMsg('Upload failed: ' + err.message)
    }
  }

  const handleAutoExtract = async () => {
    const src = form.texture_url || fallbackTextureSrc
    if (!src) return
    setExtracting(true)
    const colors = await extractColorsFromImage(src)
    setExtracting(false)
    if (colors) setForm((f) => ({ ...f, ...colors }))
  }

  const handleSave = async () => {
    setSaving(true)
    setStatusMsg('')
    try {
      await updateGalleryItem(row.slug, form)
      const rows = await fetchGalleryItems()
      onSaved(rows)
      setStatusMsg('Saved ✓')
    } catch (err) {
      setStatusMsg('Error: ' + err.message)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    try {
      await deleteGalleryItem(row.slug)
      const rows = await fetchGalleryItems()
      onDeleted(rows)
    } catch (err) {
      setStatusMsg('Delete failed: ' + err.message)
      setDeleting(false)
    }
  }

  return (
    <div className={styles.editPanel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>{form.label_word || form.cs_title}</h2>
        <div className={styles.dangerZone}>
          {confirmDelete && <span className={styles.confirmMsg}>Are you sure?</span>}
          <button
            className={`${styles.btnDanger} ${confirmDelete ? styles.btnDangerConfirm : ''}`}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : confirmDelete ? 'Yes, delete' : 'Delete card'}
          </button>
          {confirmDelete && (
            <button className={styles.btnSecondary} onClick={() => setConfirmDelete(false)}>Cancel</button>
          )}
        </div>
      </div>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Image</h3>
        <div className={styles.imageRow}>
          <div className={styles.preview} onClick={() => fileInputRef.current?.click()}>
            {previewSrc
              ? <img src={previewSrc} alt="preview" className={styles.previewImg} />
              : <span className={styles.previewPlaceholder}>Click to upload</span>}
            <div className={styles.previewOverlay}>Replace</div>
          </div>
          <div className={styles.imageActions}>
            <input ref={fileInputRef} type="file" accept="image/*" className={styles.hidden} onChange={handleImageChange} />
            <button className={styles.btnSecondary} onClick={() => fileInputRef.current?.click()}>Upload image</button>
            <button className={styles.btnSecondary} onClick={handleAutoExtract} disabled={extracting}>
              {extracting ? 'Extracting…' : '⬛ Auto-extract colors'}
            </button>
            {uploadMsg && <p className={styles.uploadMsg}>{uploadMsg}</p>}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Colors</h3>
        <div className={styles.colorGrid}>
          <ColorField label="Background" name="background_color" value={form.background_color} onChange={set} />
          <ColorField label="Blob 1" name="blob1_color" value={form.blob1_color} onChange={set} />
          <ColorField label="Blob 2" name="blob2_color" value={form.blob2_color} onChange={set} />
          <ColorField label="Accent" name="accent_color" value={form.accent_color} onChange={set} />
          <ColorField label="Fallback" name="fallback_color" value={form.fallback_color} onChange={set} />
          <ColorField label="Label color" name="label_color" value={form.label_color} onChange={set} />
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Gallery label</h3>
        <div className={styles.row2}>
          <label className={styles.fieldLabel}>Word <input className={styles.input} value={form.label_word} onChange={(e) => set('label_word', e.target.value)} /></label>
          <label className={styles.fieldLabel}>PMS code <input className={styles.input} value={form.label_pms} onChange={(e) => set('label_pms', e.target.value)} /></label>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Case study</h3>
        <div className={styles.fields}>
          <label className={styles.fieldLabel}>Title <input className={styles.input} value={form.cs_title} onChange={(e) => set('cs_title', e.target.value)} /></label>
          <label className={styles.fieldLabel}>Tagline <input className={styles.input} value={form.cs_tagline} onChange={(e) => set('cs_tagline', e.target.value)} /></label>
          <ColorField label="Accent color" name="cs_accent" value={form.cs_accent} onChange={set} />
          {[1, 2, 3].map((n) => (
            <div key={n} className={styles.sectionBlock}>
              <div className={styles.sectionBlockHeader}>
                <input
                  className={`${styles.input} ${styles.sectionNameInput}`}
                  value={form[`cs_section${n}_title`]}
                  onChange={(e) => set(`cs_section${n}_title`, e.target.value)}
                  placeholder="Section title"
                />
                <span className={styles.sectionRenameHint}>rename</span>
              </div>
              <textarea
                className={styles.textarea}
                rows={4}
                value={form[n === 1 ? 'cs_overview' : n === 2 ? 'cs_approach' : 'cs_outcome']}
                onChange={(e) => set(n === 1 ? 'cs_overview' : n === 2 ? 'cs_approach' : 'cs_outcome', e.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Stats</h3>
        {[1, 2, 3].map((n) => (
          <div key={n} className={styles.statRow}>
            <label className={styles.fieldLabel}>Value <input className={styles.input} value={form[`cs_stat${n}_value`]} onChange={(e) => set(`cs_stat${n}_value`, e.target.value)} /></label>
            <label className={styles.fieldLabel}>Label <input className={styles.input} value={form[`cs_stat${n}_label`]} onChange={(e) => set(`cs_stat${n}_label`, e.target.value)} /></label>
          </div>
        ))}
      </section>

      <div className={styles.saveRow}>
        {statusMsg && <span className={statusMsg.startsWith('Error') || statusMsg.startsWith('Delete') ? styles.errMsg : styles.okMsg}>{statusMsg}</span>}
        <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

export default function Admin() {
  const navigate = useNavigate()
  const { setPlaneData } = useGallery()
  const [rows, setRows] = useState(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const [ready, setReady] = useState(false)
  const [addingCard, setAddingCard] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/admin/login'); return }
      setReady(true)
      fetchGalleryItems().then(setRows).catch(console.error)
    })
  }, [navigate])

  const syncPlaneData = (newRows) => {
    setRows(newRows)
    const planes = newRows.map((row, i) => rowToPlane(row, galleryPlaneData[i]?.textureSrc))
    setPlaneData(planes)
  }

  const handleSaved = (newRows) => { syncPlaneData(newRows) }
  const handleDeleted = (newRows) => { syncPlaneData(newRows); setActiveIdx((i) => Math.max(0, i - 1)) }

  const handleAddCard = async () => {
    setAddingCard(true)
    try {
      await insertGalleryItem(rows.length)
      const newRows = await fetchGalleryItems()
      syncPlaneData(newRows)
      setActiveIdx(newRows.length - 1)
    } catch (err) {
      console.error(err)
    }
    setAddingCard(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  if (!ready || !rows) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    )
  }

  const activeRow = rows[activeIdx]

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>dotMaxine</div>
        <nav className={styles.nav}>
          {rows.map((row, idx) => (
            <button
              key={row.slug}
              className={`${styles.navItem} ${idx === activeIdx ? styles.navItemActive : ''}`}
              onClick={() => setActiveIdx(idx)}
            >
              <div className={styles.navSwatch} style={{ background: row.accent_color }} />
              <span className={styles.navLabel}>{row.label_word || row.cs_title}</span>
            </button>
          ))}
          <button className={styles.addCard} onClick={handleAddCard} disabled={addingCard}>
            {addingCard ? '…' : '+ Add card'}
          </button>
        </nav>
        <button className={styles.logout} onClick={handleSignOut}>Sign out</button>
      </aside>
      <main className={styles.main}>
        {activeRow && (
          <EditPanel
            key={activeRow.slug}
            row={activeRow}
            fallbackTextureSrc={galleryPlaneData[activeIdx]?.textureSrc}
            onSaved={handleSaved}
            onDeleted={handleDeleted}
          />
        )}
      </main>
    </div>
  )
}
