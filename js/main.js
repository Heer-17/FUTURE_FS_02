// =============================================
//  FUTURE_FS_02 — Mini CRM JavaScript
//  Author: Heer Patel
// =============================================

// --- STATE ---
let leads = JSON.parse(localStorage.getItem('crm_leads')) || [
  { id: '1', name: 'Raj Sharma', email: 'raj@example.com', phone: '+91 98765 43210', company: 'TechCorp', source: 'Website', status: 'New', notes: [{ id: 'n1', text: 'Interested in web development services', date: '2025-05-01' }], date: '2025-05-01' },
  { id: '2', name: 'Priya Mehta', email: 'priya@gmail.com', phone: '+91 87654 32109', company: 'StartupXYZ', source: 'LinkedIn', status: 'Contacted', notes: [{ id: 'n2', text: 'Follow up next week', date: '2025-05-03' }], date: '2025-05-03' },
  { id: '3', name: 'Amit Patel', email: 'amit@business.com', phone: '+91 76543 21098', company: 'Patel & Co.', source: 'Referral', status: 'Converted', notes: [{ id: 'n3', text: 'Signed the contract!', date: '2025-05-05' }], date: '2025-05-05' },
  { id: '4', name: 'Sneha Joshi', email: 'sneha@agency.com', phone: '+91 65432 10987', company: 'Creative Agency', source: 'Email', status: 'New', notes: [], date: '2025-05-07' },
  { id: '5', name: 'Vikram Singh', email: 'vikram@singh.in', phone: '+91 54321 09876', company: 'Singh Enterprises', source: 'Cold Call', status: 'Contacted', notes: [{ id: 'n4', text: 'Call scheduled for Monday', date: '2025-05-08' }], date: '2025-05-08' },
];

let currentFilter = 'All';
let currentModalId = null;
let searchQuery = '';

// --- SAVE ---
function saveLeads() {
  localStorage.setItem('crm_leads', JSON.stringify(leads));
}

// --- LOGIN ---
function handleLogin() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  const err  = document.getElementById('loginError');

  if (user === 'admin' && pass === 'admin123') {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    renderAll();
  } else {
    err.classList.add('show');
    setTimeout(() => err.classList.remove('show'), 3000);
  }
}

// Allow Enter key on login
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.getElementById('loginPage').style.display !== 'none') {
    handleLogin();
  }
});

function handleLogout() {
  document.getElementById('app').style.display = 'none';
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
}

// --- PAGES ---
function showPage(name, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
  document.getElementById('topbarTitle').textContent =
    name === 'dashboard' ? 'Dashboard' : name === 'leads' ? 'All Leads' : 'Add Lead';

  // Close sidebar on mobile
  if (window.innerWidth <= 900) {
    document.getElementById('sidebar').classList.remove('open');
  }

  if (name === 'leads') renderLeadsTable();
  if (name === 'dashboard') renderDashboard();
  if (name === 'add') { resetForm(); }
  return false;
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// --- RENDER ALL ---
function renderAll() {
  renderDashboard();
  renderLeadsTable();
}

// --- DASHBOARD ---
function renderDashboard() {
  const total     = leads.length;
  const newL      = leads.filter(l => l.status === 'New').length;
  const contacted = leads.filter(l => l.status === 'Contacted').length;
  const converted = leads.filter(l => l.status === 'Converted').length;

  document.getElementById('statTotal').textContent     = total;
  document.getElementById('statNew').textContent       = newL;
  document.getElementById('statContacted').textContent = contacted;
  document.getElementById('statConverted').textContent = converted;

  // Recent leads
  const recent = [...leads].reverse().slice(0, 5);
  document.getElementById('recentLeads').innerHTML = recent.length ? recent.map(l => `
    <div class="recent-lead" onclick="openModal('${l.id}')">
      <div class="lead-avatar">${getInitials(l.name)}</div>
      <div>
        <div class="lead-name">${l.name}</div>
        <div class="lead-email">${l.email}</div>
      </div>
      <div class="lead-status-badge">${statusBadge(l.status)}</div>
    </div>
  `).join('') : '<p style="color:var(--muted);font-size:0.88rem;text-align:center;padding:2rem">No leads yet</p>';

  // Sources chart
  const sources = {};
  leads.forEach(l => { sources[l.source] = (sources[l.source] || 0) + 1; });
  const maxVal = Math.max(...Object.values(sources), 1);
  document.getElementById('sourcesChart').innerHTML = Object.entries(sources).length ?
    Object.entries(sources).map(([src, cnt]) => `
      <div class="source-item">
        <span class="source-label">${src}</span>
        <div class="source-bar-wrap"><div class="source-bar" style="width:${(cnt/maxVal)*100}%"></div></div>
        <span class="source-count">${cnt}</span>
      </div>
    `).join('') : '<p style="color:var(--muted);font-size:0.88rem">No data yet</p>';
}

// --- LEADS TABLE ---
function renderLeadsTable() {
  let filtered = leads.filter(l => {
    const matchStatus = currentFilter === 'All' || l.status === currentFilter;
    const matchSearch = !searchQuery ||
      l.name.toLowerCase().includes(searchQuery) ||
      l.email.toLowerCase().includes(searchQuery) ||
      (l.company && l.company.toLowerCase().includes(searchQuery));
    return matchStatus && matchSearch;
  });

  const tbody = document.getElementById('leadsTableBody');
  const empty = document.getElementById('emptyState');

  if (!filtered.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = filtered.map(l => `
    <tr onclick="openModal('${l.id}')">
      <td>
        <div style="display:flex;align-items:center;gap:0.6rem">
          <div class="lead-avatar" style="width:30px;height:30px;font-size:0.65rem">${getInitials(l.name)}</div>
          <strong>${l.name}</strong>
        </div>
      </td>
      <td style="color:var(--muted)">${l.email}</td>
      <td style="color:var(--muted)">${l.phone || '—'}</td>
      <td style="color:var(--muted)">${l.source}</td>
      <td>${statusBadge(l.status)}</td>
      <td style="color:var(--muted)">${l.date}</td>
      <td onclick="event.stopPropagation()">
        <div class="action-btns">
          <button class="icon-btn" onclick="editLead('${l.id}')" title="Edit">✏️</button>
          <button class="icon-btn" onclick="confirmDelete('${l.id}')" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// --- FILTER & SEARCH ---
function filterLeads(status, el) {
  currentFilter = status;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderLeadsTable();
}

function searchLeads() {
  searchQuery = document.getElementById('searchInput').value.toLowerCase();
  if (document.getElementById('page-leads').classList.contains('active')) renderLeadsTable();
  if (document.getElementById('page-dashboard').classList.contains('active')) renderDashboard();
}

// --- SAVE LEAD ---
function saveLead() {
  const name    = document.getElementById('fName').value.trim();
  const email   = document.getElementById('fEmail').value.trim();
  const phone   = document.getElementById('fPhone').value.trim();
  const company = document.getElementById('fCompany').value.trim();
  const source  = document.getElementById('fSource').value;
  const status  = document.getElementById('fStatus').value;
  const note    = document.getElementById('fNote').value.trim();
  const editId  = document.getElementById('editId').value;
  const msg     = document.getElementById('formMsg');

  if (!name || !email) {
    msg.className = 'form-msg error';
    msg.textContent = '❌ Name and Email are required!';
    setTimeout(() => msg.textContent = '', 3000);
    return;
  }

  if (editId) {
    // UPDATE
    const idx = leads.findIndex(l => l.id === editId);
    if (idx !== -1) {
      leads[idx] = { ...leads[idx], name, email, phone, company, source, status };
      if (note) leads[idx].notes.push({ id: Date.now().toString(), text: note, date: new Date().toISOString().split('T')[0] });
    }
    msg.className = 'form-msg success';
    msg.textContent = '✅ Lead updated successfully!';
  } else {
    // CREATE
    const newLead = {
      id: Date.now().toString(), name, email, phone, company,
      source, status, date: new Date().toISOString().split('T')[0],
      notes: note ? [{ id: Date.now().toString(), text: note, date: new Date().toISOString().split('T')[0] }] : []
    };
    leads.push(newLead);
    msg.className = 'form-msg success';
    msg.textContent = '✅ Lead added successfully!';
  }

  saveLeads();
  renderDashboard();

  setTimeout(() => {
    resetForm();
    showPage('leads', document.querySelector('[onclick*=leads]'));
  }, 1000);
}

function editLead(id) {
  const lead = leads.find(l => l.id === id);
  if (!lead) return;
  document.getElementById('editId').value    = id;
  document.getElementById('fName').value     = lead.name;
  document.getElementById('fEmail').value    = lead.email;
  document.getElementById('fPhone').value    = lead.phone || '';
  document.getElementById('fCompany').value  = lead.company || '';
  document.getElementById('fSource').value   = lead.source;
  document.getElementById('fStatus').value   = lead.status;
  document.getElementById('fNote').value     = '';
  document.getElementById('formTitle').textContent = 'Edit Lead';
  showPage('add', document.querySelector('[onclick*=add]'));
}

function resetForm() {
  document.getElementById('editId').value   = '';
  document.getElementById('fName').value    = '';
  document.getElementById('fEmail').value   = '';
  document.getElementById('fPhone').value   = '';
  document.getElementById('fCompany').value = '';
  document.getElementById('fSource').value  = 'Website';
  document.getElementById('fStatus').value  = 'New';
  document.getElementById('fNote').value    = '';
  document.getElementById('formTitle').textContent = 'Add New Lead';
  document.getElementById('formMsg').textContent   = '';
}

function confirmDelete(id) {
  if (confirm('Delete this lead? This cannot be undone.')) {
    leads = leads.filter(l => l.id !== id);
    saveLeads();
    renderLeadsTable();
    renderDashboard();
  }
}

// --- MODAL ---
function openModal(id) {
  const lead = leads.find(l => l.id === id);
  if (!lead) return;
  currentModalId = id;

  document.getElementById('modalName').textContent = lead.name;
  document.getElementById('modalInfo').innerHTML = `
    <div class="modal-info-item"><strong>Email</strong><span>${lead.email}</span></div>
    <div class="modal-info-item"><strong>Phone</strong><span>${lead.phone || '—'}</span></div>
    <div class="modal-info-item"><strong>Company</strong><span>${lead.company || '—'}</span></div>
    <div class="modal-info-item"><strong>Source</strong><span>${lead.source}</span></div>
    <div class="modal-info-item"><strong>Status</strong><span>${statusBadge(lead.status)}</span></div>
    <div class="modal-info-item"><strong>Added On</strong><span>${lead.date}</span></div>
  `;
  renderModalNotes(lead);
  document.getElementById('modalOverlay').classList.add('open');
}

function renderModalNotes(lead) {
  const list = document.getElementById('modalNotesList');
  list.innerHTML = lead.notes.length ? lead.notes.map(n => `
    <div class="note-item">
      <div>
        <div class="note-text">${n.text}</div>
        <div class="note-date">${n.date}</div>
      </div>
      <button class="note-del" onclick="deleteNote('${lead.id}','${n.id}')">✕</button>
    </div>
  `).join('') : '<p style="color:var(--dim);font-size:0.85rem;margin-bottom:0.5rem">No notes yet</p>';
}

function addNote() {
  const input = document.getElementById('newNoteInput');
  const text  = input.value.trim();
  if (!text || !currentModalId) return;
  const lead = leads.find(l => l.id === currentModalId);
  if (!lead) return;
  lead.notes.push({ id: Date.now().toString(), text, date: new Date().toISOString().split('T')[0] });
  saveLeads();
  renderModalNotes(lead);
  input.value = '';
}

function deleteNote(leadId, noteId) {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;
  lead.notes = lead.notes.filter(n => n.id !== noteId);
  saveLeads();
  renderModalNotes(lead);
}

function deleteLead() {
  if (!currentModalId) return;
  if (confirm('Delete this lead permanently?')) {
    leads = leads.filter(l => l.id !== currentModalId);
    saveLeads();
    closeModal();
    renderLeadsTable();
    renderDashboard();
  }
}

function editFromModal() {
  closeModal();
  editLead(currentModalId);
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  currentModalId = null;
}

// Enter key for note input
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.activeElement.id === 'newNoteInput') addNote();
});

// --- HELPERS ---
function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function statusBadge(status) {
  const map = {
    'New':       'badge badge-new',
    'Contacted': 'badge badge-contacted',
    'Converted': 'badge badge-converted'
  };
  const icons = { 'New': '🆕', 'Contacted': '📞', 'Converted': '✅' };
  return `<span class="${map[status]}">${icons[status]} ${status}</span>`;
}
