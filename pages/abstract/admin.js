/* ========================================================================
   ADMIN.JS – Fully Updated with Registrations Module (Dec 2025)
   ======================================================================== */

const API_BASE = '/api';
const tokenKey = 'apsc_token';

const getToken = () => localStorage.getItem(tokenKey);
const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  'Content-Type': 'application/json'
});

/* ========================================================================
   INIT
   ======================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const token = getToken();
  if (!token) return (window.location.href = 'index.html');

  /* ------------------------------------------------------
     VERIFY ADMIN
  ------------------------------------------------------ */
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    if (!res.ok || !data.isAdmin) {
      window.location.href = 'index.html';
      return;
    }

    document.getElementById('adminEmailBadge').textContent =
      `${data.email} (Admin)`;

  } catch {
    return (window.location.href = 'index.html');
  }

  /* ------------------------------------------------------
     LOGOUT
  ------------------------------------------------------ */
  document.getElementById('adminLogoutButton').addEventListener('click', () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem('apsc_user');
    window.location.href = 'index.html';
  });

  /* ------------------------------------------------------
     TAB SWITCHING
  ------------------------------------------------------ */
  const tabs = document.querySelectorAll('.admin-tab');
  const abstractsTab = document.getElementById('adminAbstractsTab');
  const usersTab = document.getElementById('adminUsersTab');
  const registrationsTab = document.getElementById('adminRegistrationsTab');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      // hide all
      abstractsTab.classList.add('hidden');
      usersTab.classList.add('hidden');
      registrationsTab.classList.add('hidden');

      // show selected
      if (tab.dataset.tab === 'abstracts') abstractsTab.classList.remove('hidden');
      else if (tab.dataset.tab === 'users') usersTab.classList.remove('hidden');
      else if (tab.dataset.tab === 'registrations') registrationsTab.classList.remove('hidden');
    });
  });

  /* ========================================================================
     ██████╗  █████╗ ███████╗████████╗██████╗  █████╗ ████████╗███████╗███████╗
     ██╔══██╗██╔══██╗██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝██╔════╝██╔════╝
     ██████╔╝███████║███████╗   ██║   ██████╔╝███████║   ██║   █████╗  ███████╗
     ██╔══██╗██╔══██║╚════██║   ██║   ██╔══██╗██╔══██║   ██║   ██╔══╝  ╚════██║
     ██║  ██║██║  ██║███████║   ██║   ██║  ██║██║  ██║   ██║   ███████╗███████║
     ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚══════╝
     ABSTRACTS MODULE
  ======================================================================== */

  const filterEmail = document.getElementById('filterEmail');
  const filterCategory = document.getElementById('filterCategory');
  const filterType = document.getElementById('filterType');
  const adminAbstractsStatus = document.getElementById('adminAbstractsStatus');
  const adminAbstractsTableBody = document.getElementById('adminAbstractsTableBody');

  document.getElementById('applyFiltersButton').addEventListener('click', loadAbstracts);
  document.getElementById('clearFiltersButton').addEventListener('click', () => {
    filterEmail.value = '';
    filterCategory.value = '';
    filterType.value = '';
    loadAbstracts();
  });

  document.getElementById('exportExcelButton').addEventListener('click', exportAbstracts);

  async function exportAbstracts() {
    try {
      const res = await fetch('/api/admin/abstracts/export', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'apsc_abstracts.xlsx';
      a.click();
    } catch (err) {
      alert('Error exporting Excel');
    }
  }

  async function loadAbstracts() {
    adminAbstractsStatus.textContent = 'Loading...';
    adminAbstractsTableBody.innerHTML = '';

    try {
      const params = new URLSearchParams();
      if (filterEmail.value.trim()) params.set('email', filterEmail.value.trim());
      if (filterCategory.value) params.set('scientificCategory', filterCategory.value);
      if (filterType.value) params.set('preferredPresentationType', filterType.value);

      const res = await fetch(`/api/admin/abstracts?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        adminAbstractsStatus.textContent =
          data.message || 'Failed to load abstracts.';
        adminAbstractsStatus.style.color = '#ef4444';
        return;
      }

      adminAbstractsStatus.textContent = '';

      if (!data.data?.length) {
        adminAbstractsTableBody.innerHTML =
          `<tr><td colspan="7">No abstracts found.</td></tr>`;
        return;
      }

      data.data.forEach((abs) => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
          <td>${abs.owner?.email || '-'}</td>
          <td>${abs.abstractTitle || '-'}</td>
          <td>${abs.scientificCategory || '-'}</td>
          <td>${abs.preferredPresentationType || '-'}</td>
          <td>${abs.file?.originalName ? '<span class="chip">Attached</span>' : '-'}</td>
          <td>${new Date(abs.updatedAt || abs.createdAt).toLocaleString()}</td>
          <td class="text-right">
            <button class="link-button" onclick="loadAbstractDetail('${abs._id}')">View / Edit</button>
          </td>
        `;

        adminAbstractsTableBody.appendChild(tr);
      });
    } catch (err) {
      adminAbstractsStatus.textContent = 'Error loading abstracts.';
      adminAbstractsStatus.style.color = '#ef4444';
    }
  }

  /* ------------- Abstract Detail Panel ------------- */

  const adminAbstractDetailCard = document.getElementById('adminAbstractDetailCard');
  const adminAbstractForm = document.getElementById('adminAbstractForm');
  const adminAbstractFormStatus = document.getElementById('adminAbstractFormStatus');

  const adminAbstractId = document.getElementById('adminAbstractId');
  const adminAbstractEmail = document.getElementById('adminAbstractEmail');
  const adminAbstractTitle = document.getElementById('adminAbstractTitle');
  const adminAbstractCategory = document.getElementById('adminAbstractCategory');
  const adminAbstractType = document.getElementById('adminAbstractType');
  const adminAbstractText = document.getElementById('adminAbstractText');
  const adminAbstractKeywords = document.getElementById('adminAbstractKeywords');
  const adminAbstractStatus = document.getElementById('adminAbstractStatus');

  window.loadAbstractDetail = async function (id) {
    adminAbstractDetailCard.style.display = 'block';
    adminAbstractFormStatus.textContent = 'Loading...';

    try {
      const res = await fetch(`/api/admin/abstracts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        adminAbstractFormStatus.textContent = data.message || 'Failed to load.';
        adminAbstractFormStatus.style.color = '#ef4444';
        return;
      }

      adminAbstractId.value = data._id;
      adminAbstractEmail.value = data.owner?.email || '';
      adminAbstractTitle.value = data.abstractTitle || '';
      adminAbstractCategory.value = data.scientificCategory || '';
      adminAbstractType.value = data.preferredPresentationType || '';
      adminAbstractText.value = data.abstractText || '';
      adminAbstractKeywords.value = (data.keywords || []).join(', ');
      adminAbstractStatus.value = data.status || '';

      adminAbstractFormStatus.textContent = '';
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (err) {
      adminAbstractFormStatus.textContent = 'Error loading.';
      adminAbstractFormStatus.style.color = '#ef4444';
    }
  };

  adminAbstractForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = adminAbstractId.value;

    const payload = {
      abstractTitle: adminAbstractTitle.value,
      scientificCategory: adminAbstractCategory.value,
      preferredPresentationType: adminAbstractType.value,
      abstractText: adminAbstractText.value,
      keywords: adminAbstractKeywords.value.split(',').map((k) => k.trim()),
      status: adminAbstractStatus.value
    };

    try {
      const res = await fetch(`/api/admin/abstracts/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        adminAbstractFormStatus.textContent = data.message || 'Failed to save.';
        adminAbstractFormStatus.style.color = '#ef4444';
        return;
      }

      adminAbstractFormStatus.textContent = 'Saved.';
      adminAbstractFormStatus.style.color = '#22c55e';
      loadAbstracts();

    } catch (err) {
      adminAbstractFormStatus.textContent = 'Error saving.';
      adminAbstractFormStatus.style.color = '#ef4444';
    }
  });

  document.getElementById('adminAbstractCloseBtn').addEventListener('click', () => {
    adminAbstractDetailCard.style.display = 'none';
  });

  /* ========================================================================
     USERS MODULE
  ======================================================================== */

  const adminUsersStatus = document.getElementById('adminUsersStatus');
  const adminUsersTableBody = document.getElementById('adminUsersTableBody');
  const adminUserDetail = document.getElementById('adminUserDetail');
  const adminUserDetailSubtitle = document.getElementById('adminUserDetailSubtitle');
  const adminUserAbstractsBody = document.getElementById('adminUserAbstractsBody');

  async function loadUsers() {
    adminUsersStatus.textContent = 'Loading...';
    adminUsersTableBody.innerHTML = '';

    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        adminUsersStatus.textContent = data.message || 'Failed loading users.';
        adminUsersStatus.style.color = '#ef4444';
        return;
      }

      adminUsersStatus.textContent = '';

      if (!data.data?.length) {
        adminUsersTableBody.innerHTML =
          `<tr><td colspan="4">No users found.</td></tr>`;
        return;
      }

      data.data.forEach((u) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${u.email}</td>
          <td>${u.isAdmin ? 'Admin' : 'User'}</td>
          <td>${new Date(u.createdAt).toLocaleString()}</td>
          <td class="text-right">
            <button class="link-button" onclick="loadUserDetail('${u.id}')">View</button>
          </td>
        `;
        adminUsersTableBody.appendChild(tr);
      });

    } catch (err) {
      adminUsersStatus.textContent = 'Error loading users.';
      adminUsersStatus.style.color = '#ef4444';
    }
  }

  window.loadUserDetail = async function (id) {
    adminUserDetail.style.display = 'block';
    adminUserDetailSubtitle.textContent = 'Loading...';
    adminUserAbstractsBody.innerHTML = '';

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        adminUserDetailSubtitle.textContent =
          data.message || 'Failed loading user.';
        adminUserDetailSubtitle.style.color = '#ef4444';
        return;
      }

      adminUserDetailSubtitle.textContent = data.email;

      if (!data.abstracts?.length) {
        adminUserAbstractsBody.innerHTML =
          `<tr><td colspan="4">No abstracts submitted.</td></tr>`;
        return;
      }

      data.abstracts.forEach((abs) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${abs.abstractTitle}</td>
          <td>${abs.scientificCategory}</td>
          <td>${abs.preferredPresentationType}</td>
          <td class="text-right">
            <button class="link-button" onclick="loadAbstractDetail('${abs._id}')">View</button>
          </td>
        `;
        adminUserAbstractsBody.appendChild(tr);
      });

    } catch (err) {
      adminUserDetailSubtitle.textContent = 'Error loading details.';
      adminUserDetailSubtitle.style.color = '#ef4444';
    }
  };

  /* ========================================================================
     REGISTRATIONS MODULE
  ======================================================================== */

  const adminRegistrationsStatus = document.getElementById('adminRegistrationsStatus');
  const adminRegistrationsTableBody = document.getElementById('adminRegistrationsTableBody');
  const registrationStatsContainer = document.getElementById('registrationStatsContainer');

  /* ------------------------------------------------------
     LOAD REGISTRATION STATISTICS
  ------------------------------------------------------ */

  async function loadRegistrationStats() {
    registrationStatsContainer.innerHTML =
      `<div class="loading-card">Loading statistics...</div>`;

    try {
      const res = await fetch('/api/admin/registrations/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const stats = await res.json();
      if (!res.ok) throw new Error(stats.message);

      registrationStatsContainer.innerHTML = `
        <div class="stat-card"><h3>${stats.totalRegistrations}</h3><p>Total Registrations</p></div>
        <div class="stat-card"><h3>${stats.totalPaidRegistrations}</h3><p>Paid</p></div>
        <div class="stat-card"><h3>${stats.totalUnpaidRegistrations}</h3><p>Unpaid</p></div>
        <div class="stat-card"><h3>$${stats.totalFeesCollected}</h3><p>Total Fees</p></div>
        <div class="stat-card"><h3>${Object.keys(stats.regByConferenceType).length}</h3><p>Conference Types</p></div>
        <div class="stat-card"><h3>${stats.authorsWithRegistration}</h3><p>Authors Registered</p></div>
      `;

    } catch (err) {
      registrationStatsContainer.innerHTML =
        `<div class="error">Failed to load statistics.</div>`;
    }
  }

  /* ------------------------------------------------------
     LOAD REGISTRATION TABLE
  ------------------------------------------------------ */

  async function loadRegistrations() {
    adminRegistrationsStatus.textContent = 'Loading...';
    adminRegistrationsTableBody.innerHTML = '';

    try {
      const res = await fetch('/api/admin/registrations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        adminRegistrationsStatus.textContent =
          data.message || 'Failed to load registrations.';
        adminRegistrationsStatus.style.color = '#ef4444';
        return;
      }

      adminRegistrationsStatus.textContent = '';

      const list = data.data || [];
      if (list.length === 0) {
        adminRegistrationsTableBody.innerHTML =
          `<tr><td colspan="9">No registrations found.</td></tr>`;
        return;
      }

      list.forEach((reg) => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
          <td>${reg.registrationId}</td>
          <td>${reg.firstName} ${reg.lastName}</td>
          <td>${reg.email}</td>
          <td>${reg.country}</td>
          <td>${reg.participantCategory}</td>
          <td>${reg.conferenceType}</td>
          <td>$${reg.feeAmount}</td>
          <td>${reg.paymentStatus}</td>
          <td class="text-right">
            <button class="link-button" onclick="loadRegistrationDetail('${reg._id}')">View / Edit</button>
          </td>
        `;

        adminRegistrationsTableBody.appendChild(tr);
      });

    } catch (err) {
      adminRegistrationsStatus.textContent = 'Error loading registrations.';
      adminRegistrationsStatus.style.color = '#ef4444';
    }
  }

  /* ------------------------------------------------------
     REGISTRATION DETAIL PANEL
  ------------------------------------------------------ */

  const regDetailCard = document.getElementById('adminRegistrationDetail');
  const regDetailForm = document.getElementById('adminRegistrationForm');
  const regDetailFormStatus = document.getElementById('adminRegistrationFormStatus');

  const regDetailId = document.getElementById('regDetailId');
  const regDetailRegId = document.getElementById('regDetailRegId');
  const regDetailTitle = document.getElementById('regDetailTitle');
  const regDetailFirstName = document.getElementById('regDetailFirstName');
  const regDetailLastName = document.getElementById('regDetailLastName');
  const regDetailEmail = document.getElementById('regDetailEmail');
  const regDetailInstitution = document.getElementById('regDetailInstitution');
  const regDetailCountry = document.getElementById('regDetailCountry');
  const regDetailCategory = document.getElementById('regDetailCategory');
  const regDetailConfType = document.getElementById('regDetailConfType');
  const regDetailFee = document.getElementById('regDetailFee');
  const regDetailPaymentStatus = document.getElementById('regDetailPaymentStatus');
  const regDetailPaymentRef = document.getElementById('regDetailPaymentRef');
  const regDetailPaymentProvider = document.getElementById('regDetailPaymentProvider');

  window.loadRegistrationDetail = async function (id) {
    regDetailCard.style.display = 'block';
    regDetailFormStatus.textContent = 'Loading...';

    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const reg = await res.json();
      if (!res.ok) throw new Error(reg.message);

      regDetailId.value = reg._id;
      regDetailRegId.value = reg.registrationId;
      regDetailTitle.value = reg.title || '';
      regDetailFirstName.value = reg.firstName || '';
      regDetailLastName.value = reg.lastName || '';
      regDetailEmail.value = reg.email || '';
      regDetailInstitution.value = reg.institution || '';
      regDetailCountry.value = reg.country || '';
      regDetailCategory.value = reg.participantCategory || '';
      regDetailConfType.value = reg.conferenceType || '';
      regDetailFee.value = reg.feeAmount || '';
      regDetailPaymentStatus.value = reg.paymentStatus || '';
      regDetailPaymentRef.value = reg.paymentReference || '';
      regDetailPaymentProvider.value = reg.paymentProvider || '';

      regDetailFormStatus.textContent = '';

    } catch (err) {
      regDetailFormStatus.textContent = 'Failed to load registration.';
      regDetailFormStatus.style.color = '#ef4444';
    }
  };

  /* ------------------------------------------------------
     UPDATE REGISTRATION
  ------------------------------------------------------ */

  regDetailForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = regDetailId.value;

    const payload = {
      title: regDetailTitle.value,
      firstName: regDetailFirstName.value,
      lastName: regDetailLastName.value,
      email: regDetailEmail.value,
      institution: regDetailInstitution.value,
      country: regDetailCountry.value,
      participantCategory: regDetailCategory.value,
      conferenceType: regDetailConfType.value,
      feeAmount: Number(regDetailFee.value),
      paymentStatus: regDetailPaymentStatus.value,
      paymentReference: regDetailPaymentRef.value,
      paymentProvider: regDetailPaymentProvider.value
    };

    regDetailFormStatus.textContent = 'Saving...';

    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        regDetailFormStatus.textContent = data.message || 'Save failed.';
        regDetailFormStatus.style.color = '#ef4444';
        return;
      }

      regDetailFormStatus.textContent = 'Saved successfully.';
      regDetailFormStatus.style.color = '#22c55e';

      loadRegistrations();
      loadRegistrationStats();

    } catch (err) {
      regDetailFormStatus.textContent = 'Error saving.';
      regDetailFormStatus.style.color = '#ef4444';
    }
  });

  /* ------------------------------------------------------
     DELETE REGISTRATION
  ------------------------------------------------------ */

  document.getElementById('regDetailDeleteBtn').addEventListener('click', async () => {
    const id = regDetailId.value;
    if (!confirm('Delete this registration?')) return;

    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });

      if (!res.ok) {
        alert('Failed to delete.');
        return;
      }

      alert('Registration deleted.');
      regDetailCard.style.display = 'none';

      loadRegistrations();
      loadRegistrationStats();

    } catch (err) {
      alert('Error deleting registration.');
    }
  });

  document.getElementById('regDetailCloseBtn').addEventListener('click', () => {
    regDetailCard.style.display = 'none';
  });

  /* ========================================================================
     INITIAL LOAD
  ======================================================================== */

  loadAbstracts();
  loadUsers();
  loadRegistrations();
  loadRegistrationStats();
});
