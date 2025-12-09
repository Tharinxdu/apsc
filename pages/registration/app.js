// app.js
// Frontend logic for APSC 2026 registration (vanilla ES6)

// --- COUNTRY & INCOME CONFIG -----------------------------------------------

export const COUNTRY_INCOME_GROUPS = {
  // LOW / LOWER-MIDDLE INCOME ECONOMIES
  "Afghanistan": "LOWER",
  "Korea, Dem. People's Rep": "LOWER",
  "Somalia": "LOWER",
  "Burkina Faso": "LOWER",
  "Liberia": "LOWER",
  "South Sudan": "LOWER",
  "Burundi": "LOWER",
  "Madagascar": "LOWER",
  "Sudan": "LOWER",
  "Central African Republic": "LOWER",
  "Malawi": "LOWER",
  "Syrian Arab Republic": "LOWER",
  "Chad": "LOWER",
  "Mali": "LOWER",
  "Togo": "LOWER",
  "Congo, Dem. Rep": "LOWER",
  "Mozambique": "LOWER",
  "Uganda": "LOWER",
  "Eritrea": "LOWER",
  "Niger": "LOWER",
  "Yemen, Rep.": "LOWER",
  "Gambia, The": "LOWER",
  "Rwanda": "LOWER",
  "Guinea-Bissau": "LOWER",
  "Sierra Leone": "LOWER",

  "Angola": "LOWER",
  "India": "LOWER",
  "Papua New Guinea": "LOWER",
  "Bangladesh": "LOWER",
  "Jordan": "LOWER",
  "Philippines": "LOWER",
  "Benin": "LOWER",
  "Kenya": "LOWER",
  "São Tomé and Principe": "LOWER",
  "Bhutan": "LOWER",
  "Kiribati": "LOWER",
  "Senegal": "LOWER",
  "Bolivia": "LOWER",
  "Kyrgyz Republic": "LOWER",
  "Solomon Islands": "LOWER",
  "Cambodia": "LOWER",
  "Lao PDR": "LOWER",

  /* ★ UPDATED:
     Sri Lanka must ALWAYS use LOCAL pricing,
     but we keep its income group here because the override happens later.
  */
  "Sri Lanka": "LOWER",

  "Cameroon": "LOWER",
  "Lebanon": "LOWER",
  "Tajikistan": "LOWER",
  "Comoros": "LOWER",
  "Lesotho": "LOWER",
  "Tanzania": "LOWER",
  "Congo, Rep.": "LOWER",
  "Mauritania": "LOWER",
  "Timor-Leste": "LOWER",
  "Côte d'Ivoire": "LOWER",
  "Micronesia, Fed. Sts.": "LOWER",
  "Tunisia": "LOWER",
  "Djibouti": "LOWER",
  "Morocco": "LOWER",
  "Uzbekistan": "LOWER",
  "Egypt, Arab Rep.": "LOWER",
  "Myanmar": "LOWER",
  "Vanuatu": "LOWER",
  "Eswatini": "LOWER",
  "Namibia": "LOWER",
  "Viet Nam": "LOWER",
  "Ghana": "LOWER",
  "Nepal": "LOWER",
  "West Bank and Gaza": "LOWER",
  "Guinea": "LOWER",
  "Nicaragua": "LOWER",
  "Zambia": "LOWER",
  "Haiti": "LOWER",
  "Nigeria": "LOWER",
  "Zimbabwe": "LOWER",
  "Honduras": "LOWER",
  "Pakistan": "LOWER",

  // UPPER-MIDDLE / HIGH INCOME ECONOMIES
  "Albania": "UPPER",
  "Equatorial Guinea": "UPPER",
  "Moldova": "UPPER",
  "Algeria": "UPPER",
  "Fiji": "UPPER",
  "Mongolia": "UPPER",
  "Argentina": "UPPER",
  "Gabon": "UPPER",
  "Montenegro": "UPPER",
  "Armenia": "UPPER",
  "Georgia": "UPPER",
  "North Macedonia": "UPPER",
  "Azerbaijan": "UPPER",
  "Grenada": "UPPER",
  "Paraguay": "UPPER",
  "Belarus": "UPPER",
  "Guatemala": "UPPER",
  "Peru": "UPPER",
  "Belize": "UPPER",
  "Indonesia": "UPPER",
  "Samoa": "UPPER",
  "Bosnia and Herzegovina": "UPPER",
  "Iran, Islamic Rep.": "UPPER",
  "Serbia": "UPPER",
  "Botswana": "UPPER",
  "Iraq": "UPPER",
  "South Africa": "UPPER",
  "Brazil": "UPPER",
  "Jamaica": "UPPER",
  "St. Lucia": "UPPER",
  "Cabo Verde": "UPPER",
  "Kazakhstan": "UPPER",
  "St. Vincent and the Grenadines": "UPPER",
  "China": "UPPER",
  "Kosovo": "UPPER",
  "Suriname": "UPPER",
  "Colombia": "UPPER",
  "Libya": "UPPER",
  "Thailand": "UPPER",
  "Cuba": "UPPER",
  "Malaysia": "UPPER",
  "Tonga": "UPPER",
  "Dominica": "UPPER",
  "Maldives": "UPPER",
  "Türkiye": "UPPER",
  "Dominican Republic": "UPPER",
  "Marshall Islands": "UPPER",
  "Turkmenistan": "UPPER",
  "Ecuador": "UPPER",
  "Mauritius": "UPPER",
  "Tuvalu": "UPPER",
  "El Salvador": "UPPER",
  "Mexico": "UPPER",
  "Ukraine": "UPPER",

  "American Samoa": "UPPER",
  "Gibraltar": "UPPER",
  "Panama": "UPPER",
  "Andorra": "UPPER",
  "Greece": "UPPER",
  "Poland": "UPPER",
  "Antigua and Barbuda": "UPPER",
  "Greenland": "UPPER",
  "Portugal": "UPPER",
  "Aruba": "UPPER",
  "Guam": "UPPER",
  "Puerto Rico": "UPPER",
  "Australia": "UPPER",
  "Guyana": "UPPER",
  "Qatar": "UPPER",
  "Austria": "UPPER",
  "Hong Kong SAR, China": "UPPER",
  "Romania": "UPPER",
  "Bahamas, The": "UPPER",
  "Hungary": "UPPER",
  "Russian Federation": "UPPER",
  "Bahrain": "UPPER",
  "Iceland": "UPPER",
  "San Marino": "UPPER",
  "Barbados": "UPPER",
  "Ireland": "UPPER",
  "Saudi Arabia": "UPPER",
  "Belgium": "UPPER",
  "Isle of Man": "UPPER",
  "Seychelles": "UPPER",
  "Bermuda": "UPPER",
  "Israel": "UPPER",
  "Singapore": "UPPER",
  "British Virgin Islands": "UPPER",
  "Italy": "UPPER",
  "Sint Maarten (Dutch part)": "UPPER",
  "Brunei Darussalam": "UPPER",
  "Japan": "UPPER",
  "Slovak Republic": "UPPER",
  "Bulgaria": "UPPER",
  "Korea, Rep.": "UPPER",
  "Slovenia": "UPPER",
  "Canada": "UPPER",
  "Kuwait": "UPPER",
  "Spain": "UPPER",
  "Cayman Islands": "UPPER",
  "Latvia": "UPPER",
  "St. Kitts and Nevis": "UPPER",
  "Channel Islands": "UPPER",
  "Liechtenstein": "UPPER",
  "St. Martin (French part)": "UPPER",
  "Chile": "UPPER",
  "Lithuania": "UPPER",
  "Sweden": "UPPER",
  "Costa Rica": "UPPER",
  "Luxembourg": "UPPER",
  "Switzerland": "UPPER",
  "Croatia": "UPPER",
  "Macao SAR, China": "UPPER",
  "Taiwan, China": "UPPER",
  "Curaçao": "UPPER",
  "Malta": "UPPER",
  "Trinidad and Tobago": "UPPER",
  "Cyprus": "UPPER",
  "Monaco": "UPPER",
  "Turks and Caicos Islands": "UPPER",
  "Czechia": "UPPER",
  "Nauru": "UPPER",
  "United Arab Emirates": "UPPER",
  "Denmark": "UPPER",
  "Netherlands": "UPPER",
  "United Kingdom": "UPPER",
  "Estonia": "UPPER",
  "New Caledonia": "UPPER",
  "United States": "UPPER",
  "Faroe Islands": "UPPER",
  "New Zealand": "UPPER",
  "Uruguay": "UPPER",
  "Finland": "UPPER",
  "Northern Mariana Islands": "UPPER",
  "Virgin Islands (U.S.)": "UPPER",
  "France": "UPPER",
  "Norway": "UPPER",
  "French Polynesia": "UPPER",
  "Oman": "UPPER",
  "Germany": "UPPER",
  "Palau": "UPPER"
};

// Helper to get income group label
function getIncomeGroup(country) {
  return COUNTRY_INCOME_GROUPS[country] || null;
}

// ---------------------------------------------------------------------------
// ★ UPDATED: REAL FEE RULES
// ---------------------------------------------------------------------------

export const FEE_RULES = {
  full: {
    LOWER: {
      physician: { early: 75, late: 100 },
      "non-physician": { early: 25, late: 40 }
    },
    UPPER: {
      physician: { early: 200, late: 225 },
      "non-physician": { early: 75, late: 100 }
    },

    // ★ LOCAL (Sri Lanka override)
    LOCAL: {
      physician: { early: 30, late: 80 },
      "non-physician": { early: 20, late: 40 }
    }
  },

  rehab: {
    ALL: { early: 15, late: 40 }
  }
};

// ---------------------------------------------------------------------------
// ★ UPDATED: EARLY BIRD / LATE PERIOD LOGIC
// ---------------------------------------------------------------------------
function getFeePeriod() {
  const today = new Date();
  const earlyEnd = new Date("2026-08-31");

  return today <= earlyEnd ? "early" : "late";
}

// ---------------------------------------------------------------------------
// ★ UPDATED: AUTO-LOCAL FOR SRI LANKA
// ---------------------------------------------------------------------------
function determineIncomeGroup(country) {
  if (country === "Sri Lanka") return "LOCAL";
  return getIncomeGroup(country);
}

// ---------------------------------------------------------------------------
// ★ UPDATED: REAL FEE CALCULATION
// ---------------------------------------------------------------------------
export function calculateFee({ conferenceType, participantCategory, incomeGroup, date }) {
  const period = getFeePeriod();

  if (conferenceType === "rehab") {
    return FEE_RULES.rehab.ALL[period];
  }

  const groupFees = FEE_RULES.full[incomeGroup];
  if (!groupFees) return null;

  return groupFees[participantCategory]?.[period] ?? null;
}

// --- UI & FORM LOGIC --------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {

  const countrySelect = document.getElementById("country");
  const participantCategorySelect = document.getElementById("participantCategory");
  const feeDisplay = document.getElementById("feeAmountDisplay");
  const feeAmountInput = document.getElementById("feeAmount");
  const incomeGroupInput = document.getElementById("incomeGroup");
  const form = document.getElementById("registrationForm");
  const formStatus = document.getElementById("formStatus");
  const successSection = document.getElementById("successSection");
  const successDetails = document.getElementById("successDetails");

  const feePeriodText = document.getElementById("feePeriodText");
  const pricingPeriodBadge = document.getElementById("pricingPeriodBadge");

  // ★ UPDATED: SHOW PERIOD TEXT + BADGE
  const currentPeriod = getFeePeriod();
  pricingPeriodBadge.textContent =
    currentPeriod === "early"
      ? "EARLY BIRD (1 Mar – 31 Aug 2026)"
      : "LATE (1 Sep – 28 Nov 2026)";

  feePeriodText.textContent =
    currentPeriod === "early"
      ? "You are registering during the Early Bird period."
      : "You are registering during the Late period.";

  // Consent checkboxes — now always enabled (as requested)
  document.getElementById("consentDataUse").disabled = false;
  document.getElementById("consentTerms").disabled = false;

  // Populate country list
  const countries = Object.keys(COUNTRY_INCOME_GROUPS).sort();
  countries.forEach((country) => {
    const opt = document.createElement("option");
    opt.value = country;
    opt.textContent = country;
    countrySelect.appendChild(opt);
  });

  countrySelect.addEventListener("change", updateFeeSummary);
  participantCategorySelect.addEventListener("change", updateFeeSummary);
  form.addEventListener("change", (e) => {
    if (e.target.name === "conferenceType") updateFeeSummary();
  });

  function updateFeeSummary() {
    const country = countrySelect.value;
    const participantCategory = participantCategorySelect.value;
    const conferenceType = getSelectedConferenceType();
    const incomeGroup = determineIncomeGroup(country);

    if (!country || !participantCategory || !conferenceType || !incomeGroup) {
      feeDisplay.textContent =
        "Select your country, category, and participation type to see the fee.";
      feeAmountInput.value = "";
      incomeGroupInput.value = "";
      return;
    }

    const fee = calculateFee({
      conferenceType,
      participantCategory,
      incomeGroup,
      date: new Date()
    });

    if (!fee) {
      feeDisplay.textContent =
        "Fee configuration is not available for this combination.";
      feeAmountInput.value = "";
      return;
    }

    feeDisplay.textContent = `Total Fee: USD ${fee}`;
    feeAmountInput.value = fee;
    incomeGroupInput.value = incomeGroup;
  }

  function getSelectedConferenceType() {
    const selected = form.querySelector('input[name="conferenceType"]:checked');
    return selected ? selected.value : null;
  }

  // MODALS — unchanged
  const modalTriggers = document.querySelectorAll("[data-open-modal]");
  const modalCloseButtons = document.querySelectorAll("[data-close-modal]");

  modalTriggers.forEach((btn) => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-open-modal");
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove("hidden");
    });
  });

  modalCloseButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal-overlay");
      if (modal) modal.classList.add("hidden");
    });
  });

  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.add("hidden");
    });
  });

  // Client validation remains unchanged
  function setError(name, message) {
    const errorEl = document.querySelector(`[data-error-for="${name}"]`);
    if (errorEl) errorEl.textContent = message || "";
  }

  function clearAllErrors() {
    document.querySelectorAll(".error-message").forEach((el) => (el.textContent = ""));
  }

  function validateForm() {
    clearAllErrors();
    let valid = true;

    const requiredFields = [
      "title",
      "firstName",
      "lastName",
      "designation",
      "institution",
      "country",
      "email",
      "mobile",
      "participantCategory"
    ];

    requiredFields.forEach((name) => {
      const field = form.elements[name];
      if (field && !field.value.trim()) {
        setError(name, "This field is required.");
        valid = false;
      }
    });

    const email = form.elements["email"]?.value.trim();
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("email", "Please enter a valid email address.");
      valid = false;
    }

    if (!getSelectedConferenceType()) {
      setError("conferenceType", "Please select a participation option.");
      valid = false;
    }

    if (!feeAmountInput.value) {
      setError("conferenceType", "Fee could not be determined.");
      valid = false;
    }

    // ★ UPDATED — Consent checkboxes are directly checked
    if (!document.getElementById("consentDataUse").checked ||
        !document.getElementById("consentTerms").checked) {
      setError("consent", "Please accept all required consents.");
      valid = false;
    }

    return valid;
  }

  // Submit handler — unchanged except it now sends correct fee
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    formStatus.textContent = "";

    if (!validateForm()) {
      formStatus.textContent = "Please fix the highlighted errors.";
      return;
    }

    const payload = buildPayloadFromForm(form);

    try {
      formStatus.textContent = "Submitting registration...";
      const res = await fetch("http://localhost:4000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to submit registration.");
      }

      const data = await res.json();

      formStatus.textContent = "";
      successSection.classList.remove("hidden");
      successDetails.textContent = `Your registration ID is ${data.registrationId}. Total fee: USD ${data.feeAmount.toFixed(2)}. Payment status: ${data.paymentStatus}.`;

      form.closest(".card").classList.add("hidden");

    } catch (error) {
      console.error(error);
      formStatus.textContent = error.message;
    }
  });

  function buildPayloadFromForm(form) {
    const fd = new FormData(form);
    const conferenceType = getSelectedConferenceType();
    return {
      title: fd.get("title"),
      firstName: fd.get("firstName"),
      lastName: fd.get("lastName"),
      designation: fd.get("designation"),
      institution: fd.get("institution"),
      country: fd.get("country"),
      email: fd.get("email"),
      mobile: fd.get("mobile"),
      participantCategory: fd.get("participantCategory"),
      conferenceType,
      feeAmountClient: feeAmountInput.value ? Number(feeAmountInput.value) : null,
      incomeGroup: incomeGroupInput.value || null,
      consentDataUse: fd.get("consentDataUse") === "on",
      consentTerms: fd.get("consentTerms") === "on"
    };
  }
});
