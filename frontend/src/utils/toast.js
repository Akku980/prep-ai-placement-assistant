let timer = null

export default function toast(msg, type = 'info') {
  document.querySelector('.toast')?.remove()
  if (timer) clearTimeout(timer)

  const el = document.createElement('div')
  el.className = `toast toast-${type}`
  el.textContent = msg
  document.body.appendChild(el)
  timer = setTimeout(() => el?.remove(), 3500)
}
