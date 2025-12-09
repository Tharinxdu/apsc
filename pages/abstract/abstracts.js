/* ----------------------------------------------------
   ABSTRACTS.JS – NON-AUTH VERSION (NO AUTH, NO TOKENS)
-----------------------------------------------------*/

// DOM ELEMENTS
const abstractListEl = document.getElementById('abstractList');
const abstractCountBadge = document.getElementById('abstractCountBadge');
const newAbstractButton = document.getElementById('newAbstractButton');
const abstractForm = document.getElementById('abstractForm');
const formTitleEl = document.getElementById('formTitle');
const abstractFormStatus = document.getElementById('abstractFormStatus');
const abstractIdInput = document.getElementById('abstractId');
const cancelEditButton = document.getElementById('cancelEditButton');
const scientificCategorySelect = document.getElementById('scientificCategory');
const otherCategoryGroup = document.getElementById('otherCategoryGroup');
const abstractTextArea = document.getElementById('abstractText');
const abstractWordCount = document.getElementById('abstractWordCount');
const keywordsInput = document.getElementById('keywordsInput');
const fileInput = document.getElementById('fileInput');
const currentFileInfo = document.getElementById('currentFileInfo');
const removeFileCheckbox = document.getElementById('removeFileCheckbox');
const attachmentOptionsGroup = document.getElementById('attachmentOptionsGroup');
const emailInput = document.getElementById('email');

/* ----------------------------------------------------
   PLAIN FETCH (NO AUTH)
-----------------------------------------------------*/

function apiFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
}

/* ----------------------------------------------------
   CLIENT-SIDE VALIDATION UI HELPERS
-----------------------------------------------------*/

function setFieldError(id, msg) {
  const el = document.querySelector(`[data-error-for="${id}"]`);
  if (el) el.textContent = msg || '';
}

function clearErrors() {
  document.querySelectorAll('.error-message').forEach((el) => (el.textContent = ''));
}

/* ----------------------------------------------------
   WORD COUNT
-----------------------------------------------------*/

function updateWordCount() {
  const text = abstractTextArea.value || '';
  const words = text.trim().split(/\s+/).filter(Boolean);
  abstractWordCount.textContent = words.length;
}
abstractTextArea?.addEventListener('input', updateWordCount);

/* ----------------------------------------------------
   CATEGORY "OTHER" TOGGLE
-----------------------------------------------------*/

scientificCategorySelect?.addEventListener('change', () => {
  otherCategoryGroup.style.display =
    scientificCategorySelect.value === 'Other' ? 'block' : 'none';
});

/* ----------------------------------------------------
   FORM RESET
-----------------------------------------------------*/

function resetForm() {
  abstractForm.reset();

  abstractIdInput.value = '';
  formTitleEl.textContent = 'New Abstract';
  abstractFormStatus.textContent = '';

  clearErrors();
  updateWordCount();

  currentFileInfo.textContent = '';
  removeFileCheckbox.checked = false;
  attachmentOptionsGroup.classList.add('hidden');
  otherCategoryGroup.style.display = 'none';
}

newAbstractButton?.addEventListener('click', resetForm);
cancelEditButton?.addEventListener('click', resetForm);

/* ----------------------------------------------------
   RENDER ABSTRACT LIST
-----------------------------------------------------*/

function renderAbstractList(items) {
  abstractListEl.innerHTML = '';
  abstractCountBadge.textContent = `${items.length} abstract${items.length === 1 ? '' : 's'}`;

  if (!items.length) {
    abstractListEl.innerHTML = `<p class="help-text">You have not submitted any abstracts yet.</p>`;
    return;
  }

  items.forEach((abs) => {
    const card = document.createElement('div');
    card.className = 'abstract-card';

    const header = document.createElement('div');
    header.className = 'abstract-card-header';

    const title = document.createElement('div');
    title.className = 'abstract-card-title';
    title.textContent = abs.abstractTitle;

    const chips = document.createElement('div');
    chips.style.display = 'flex';
    chips.style.gap = '0.35rem';
    chips.style.flexWrap = 'wrap';

    const typeChip = document.createElement('span');
    typeChip.className = 'chip accent';
    typeChip.textContent = abs.preferredPresentationType || '-';

    const catChip = document.createElement('span');
    catChip.className = 'chip';
    catChip.textContent = abs.scientificCategory || '-';

    chips.appendChild(typeChip);
    chips.appendChild(catChip);

    header.appendChild(title);
    header.appendChild(chips);

    const meta = document.createElement('div');
    meta.className = 'abstract-card-meta';
    const created = new Date(abs.createdAt);
    const updated = new Date(abs.updatedAt);
    meta.textContent = `Created: ${created.toLocaleDateString()} • Last updated: ${updated.toLocaleDateString()}`;

    const actions = document.createElement('div');
    actions.className = 'form-actions-row';

    const editBtn = document.createElement('button');
    editBtn.className = 'secondary-button';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => loadAbstract(abs._id));

    const fileBtn = document.createElement('button');
    fileBtn.className = 'link-button';
    fileBtn.textContent = abs.file ? 'Download attachment' : 'No file';
    fileBtn.disabled = !abs.file;
    if (abs.file) fileBtn.addEventListener('click', () => downloadAttachment(abs._id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'secondary-button';
    deleteBtn.style.background = '#7f1d1d';
    deleteBtn.style.borderColor = '#b91c1c';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteAbstract(abs._id);

    actions.appendChild(editBtn);
    actions.appendChild(fileBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(header);
    card.appendChild(meta);
    card.appendChild(actions);

    abstractListEl.appendChild(card);
  });
}

/* ----------------------------------------------------
   FETCH ABSTRACT LIST
-----------------------------------------------------*/

async function fetchAbstracts() {
  try {
    const res = await apiFetch('/api/abstracts');
    const data = await res.json();
    if (!res.ok) {
      abstractListEl.innerHTML = `<p class="help-text">Unable to load abstracts.</p>`;
      return;
    }
    renderAbstractList(data);
  } catch (err) {
    console.error(err);
  }
}

/* ----------------------------------------------------
   LOAD ABSTRACT INTO FORM (EDIT MODE)
-----------------------------------------------------*/

async function loadAbstract(id) {
  clearErrors();
  abstractFormStatus.textContent = 'Loading abstract...';

  try {
    const res = await apiFetch(`/api/abstracts/${id}`);
    const data = await res.json();
    if (!res.ok) {
      abstractFormStatus.textContent = data.message || 'Unable to load abstract';
      return;
    }

    formTitleEl.textContent = 'Edit Abstract';
    abstractIdInput.value = data._id;

    [
      'title', 'firstName', 'lastName', 'email', 'mobileNumber', 'affiliation',
      'department', 'city', 'country', 'designation', 'presentingAuthorName',
      'correspondingAuthorName', 'correspondingAuthorEmail', 'abstractTitle', 'coAuthors'
    ].forEach((key) => {
      const el = document.getElementById(key);
      if (el) el.value = data[key] || '';
    });

    document.getElementById('preferredPresentationType').value =
      data.preferredPresentationType || '';

    scientificCategorySelect.value = data.scientificCategory || '';
    if (data.scientificCategory === 'Other') {
      otherCategoryGroup.style.display = 'block';
      document.getElementById('otherScientificCategory').value =
        data.otherScientificCategory || '';
    } else {
      otherCategoryGroup.style.display = 'none';
    }

    document.getElementById('isTraineeOrStudent').value =
      data.isTraineeOrStudent ? 'true' : 'false';

    document.getElementById('considerForYoungInvestigatorAward').value =
      data.considerForYoungInvestigatorAward ? 'true' : 'false';

    document.getElementById('isOriginalWork').checked = !!data.isOriginalWork;
    document.getElementById('allAuthorsApproved').checked = !!data.allAuthorsApproved;
    document.getElementById('agreeToIncludeInProceedings').checked =
      !!data.agreeToIncludeInProceedings;

    abstractTextArea.value = data.abstractText || '';
    updateWordCount();

    keywordsInput.value = (data.keywords || []).join(', ');

    if (data.file && data.file.originalName) {
      currentFileInfo.textContent = `Current attachment: ${data.file.originalName}`;
      removeFileCheckbox.checked = false;
      attachmentOptionsGroup.classList.remove('hidden');
    } else {
      currentFileInfo.textContent = '';
      attachmentOptionsGroup.classList.add('hidden');
    }

    abstractFormStatus.textContent = '';

    abstractForm.scrollIntoView({ behavior: 'smooth' });

  } catch (err) {
    console.error(err);
    abstractFormStatus.textContent = 'Error loading abstract';
  }
}

/* ----------------------------------------------------
   DOWNLOAD ATTACHMENT (NO AUTH)
-----------------------------------------------------*/

async function downloadAttachment(id) {
  try {
    const res = await fetch(`/api/abstracts/${id}/file`);
    if (!res.ok) return alert('Unable to download file');

    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="(.+)"/);
    const filename = match ? match[1] : 'attachment';

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
  }
}

/* ----------------------------------------------------
   DELETE ABSTRACT
-----------------------------------------------------*/

async function deleteAbstract(id) {
  if (!confirm('Are you sure you want to delete this abstract?')) return;

  try {
    const res = await apiFetch(`/api/abstracts/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert('Failed to delete abstract.');
      return;
    }

    fetchAbstracts();
    resetForm();
  } catch (err) {
    console.error(err);
  }
}

/* ----------------------------------------------------
   BUILD PAYLOAD
-----------------------------------------------------*/

function buildPayloadFromForm() {
  const payload = {
    title: document.getElementById('title').value,
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('email').value,

    mobileNumber: document.getElementById('mobileNumber').value,
    affiliation: document.getElementById('affiliation').value,
    department: document.getElementById('department').value,
    city: document.getElementById('city').value,
    country: document.getElementById('country').value,
    designation: document.getElementById('designation').value,

    presentingAuthorName: document.getElementById('presentingAuthorName').value,
    correspondingAuthorName: document.getElementById('correspondingAuthorName').value,
    correspondingAuthorEmail: document.getElementById('correspondingAuthorEmail').value,

    isTraineeOrStudent: document.getElementById('isTraineeOrStudent').value === 'true',
    considerForYoungInvestigatorAward:
      document.getElementById('considerForYoungInvestigatorAward').value === 'true',

    abstractTitle: document.getElementById('abstractTitle').value,
    preferredPresentationType: document.getElementById('preferredPresentationType').value,

    scientificCategory: scientificCategorySelect.value,
    otherScientificCategory: document.getElementById('otherScientificCategory').value,

    abstractText: abstractTextArea.value,
    coAuthors: document.getElementById('coAuthors').value,

    isOriginalWork: document.getElementById('isOriginalWork').checked,
    allAuthorsApproved: document.getElementById('allAuthorsApproved').checked,
    agreeToIncludeInProceedings:
      document.getElementById('agreeToIncludeInProceedings').checked
  };

  // Keywords
  payload.keywords = (keywordsInput.value || '')
    .split(/[\n,]/)
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 5);

  if (removeFileCheckbox.checked) {
    payload.removeFile = true;
  }

  return payload;
}

/* ----------------------------------------------------
   CLIENT VALIDATION
-----------------------------------------------------*/

function validateClient(payload) {
  let valid = true;
  clearErrors();

  const required = [
    'title',
    'firstName',
    'lastName',
    'mobileNumber',
    'affiliation',
    'country',
    'designation',
    'presentingAuthorName',
    'abstractTitle',
    'preferredPresentationType',
    'scientificCategory',
    'abstractText'
  ];

  required.forEach((f) => {
    if (!payload[f]) {
      setFieldError(f, 'This field is required');
      valid = false;
    }
  });

  const wc = payload.abstractText.trim().split(/\s+/).filter(Boolean).length;
  if (wc > 300) {
    setFieldError('abstractText', `Abstract must not exceed 300 words (currently ${wc})`);
    valid = false;
  }

  if (!payload.isOriginalWork) {
    setFieldError('isOriginalWork', 'Required');
    valid = false;
  }
  if (!payload.allAuthorsApproved) {
    setFieldError('allAuthorsApproved', 'Required');
    valid = false;
  }
  if (!payload.agreeToIncludeInProceedings) {
    setFieldError('agreeToIncludeInProceedings', 'Required');
    valid = false;
  }

  return valid;
}

/* ----------------------------------------------------
   SAVE ABSTRACT
-----------------------------------------------------*/

abstractForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  abstractFormStatus.textContent = '';

  const payload = buildPayloadFromForm();
  if (!validateClient(payload)) {
    abstractFormStatus.textContent = 'Please correct the errors.';
    return;
  }

  const id = abstractIdInput.value;
  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/abstracts/${id}` : '/api/abstracts';

  try {
    abstractFormStatus.textContent = 'Saving...';

    const res = await apiFetch(url, {
      method,
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      abstractFormStatus.textContent = data.message || 'Save failed';
      if (data.fieldErrors) {
        Object.entries(data.fieldErrors).forEach(([f, m]) => setFieldError(f, m));
      }
      return;
    }

    const savedId = id || data._id;

    if (fileInput.files[0]) {
      await uploadFile(savedId);
    }

    await fetchAbstracts();
    loadAbstract(savedId);

    abstractFormStatus.textContent = 'Saved successfully.';

  } catch (err) {
    console.error(err);
    abstractFormStatus.textContent = 'Error saving abstract.';
  }
});

/* ----------------------------------------------------
   FILE UPLOAD (NO AUTH)
-----------------------------------------------------*/

async function uploadFile(id) {
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  const res = await fetch(`/api/abstracts/${id}/upload`, {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  if (!res.ok) {
    setFieldError('file', data.message || 'Upload failed');
  } else {
    currentFileInfo.textContent = `Current attachment: ${data.file.originalName}`;
    removeFileCheckbox.checked = false;
    fileInput.value = '';
    attachmentOptionsGroup.classList.remove('hidden');
  }
}

/* ----------------------------------------------------
   INIT — NO AUTH
-----------------------------------------------------*/

(async function init() {
  await fetchAbstracts();

  const params = new URLSearchParams(window.location.search);
  const abstractId = params.get('abstractId');

  if (abstractId) {
    loadAbstract(abstractId);
  } else {
    resetForm();
  }
})();
