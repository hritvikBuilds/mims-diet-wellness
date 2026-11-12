/* ═══════════════════════════════════════════════════════════════════
   dt Mimmy | Nourish Delight — Interactive Engine (Phase 2 Figma)
   ═══════════════════════════════════════════════════════════════════ */

// ── Official Coach WhatsApp Destination (+91 98353 87146) ──
const MIMMY_WHATSAPP_NUMBER = '919835387146';

// ── Safe LocalStorage Helpers (Security & Resilience) ──
function getStoredLeads() {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('mims_leads');
      return stored ? JSON.parse(stored) : [];
    }
  } catch (e) {
    console.warn('localStorage read error:', e);
  }
  return [];
}

function saveStoredLeads(leads) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mims_leads', JSON.stringify(leads));
    }
  } catch (e) {
    console.warn('localStorage write error:', e);
  }
}

// ── State Management ──
const state = {
  quizStep: 1,
  waterGlasses: 5,
  maxWater: 8,
  currentUser: null,
  leads: getStoredLeads(),
  selectedProgram: '12-Week Hormone Rebirth',
  pricingMode: 'monthly',
  testiIndex: 0
};

// Seed initial demo lead if none exists
if (state.leads.length === 0) {
  state.leads.push({
    id: 'lead-1',
    name: 'Aditi Verma',
    phone: '+91 98231 45678',
    email: 'aditi.v@gmail.com',
    goal: 'Hormonal Imbalance & PCOS',
    bmi: '26.8 (Overweight / Metabolic Sluggishness)',
    weight: '68 kg (Target: 58 kg)',
    date: 'Today, 2:15 PM'
  });
  saveStoredLeads(state.leads);
}

// Expose state and constants on window
if (typeof window !== 'undefined') {
  window.state = state;
  window.MIMMY_WHATSAPP_NUMBER = MIMMY_WHATSAPP_NUMBER;
}

// ═══════════════════════════════════════════════════════════════════
// 1. NAVBAR & NAVIGATION
// ═══════════════════════════════════════════════════════════════════

function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  initScrollspy();
}

function initScrollspy() {
  const sectionIds = ['hero', 'features', 'quiz', 'swaps', 'pricing', 'about', 'testimonials', 'faq'];
  const desktopLinks = document.querySelectorAll('.nav-links a');
  const mobileLinks = document.querySelectorAll('#mobileNav a[href^="#"]');

  function updateActive(activeId) {
    const targetNavId = (activeId === 'testimonials') ? 'about' : activeId;

    desktopLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${targetNavId}` || (targetNavId === 'hero' && (href === '#' || href === '#hero'))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    mobileLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${targetNavId}` || (targetNavId === 'hero' && (href === '#' || href === '#hero'))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  function handleScroll() {
    const scrollPosition = window.scrollY + 140; // sticky navbar offset + tolerance

    // Check if near bottom of page -> highlight faq
    if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 80)) {
      updateActive('faq');
      return;
    }

    // If near top -> hero
    if (window.scrollY < 180) {
      updateActive('hero');
      return;
    }

    // Find the current section
    let currentId = 'hero';
    for (let i = 0; i < sectionIds.length; i++) {
      const el = document.getElementById(sectionIds[i]);
      if (el) {
        const top = el.offsetTop;
        if (scrollPosition >= top) {
          currentId = sectionIds[i];
        }
      }
    }
    updateActive(currentId);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll, { passive: true });
  handleScroll();

  // Instant active state on clicking a link
  desktopLinks.forEach(link => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        updateActive(href.slice(1));
      }
    });
  });
}

function toggleMobileNav() {
  const nav = document.getElementById('mobileNav');
  if (nav) {
    nav.classList.toggle('open');
  }
}

// ═══════════════════════════════════════════════════════════════════
// 2. HEALTH QUIZ (LEAD GENERATION ENGINE)
// ═══════════════════════════════════════════════════════════════════

const quizStepLabels = [
  'Step 1 of 4: Health Goal',
  'Step 2 of 4: Body Symptoms',
  'Step 3 of 4: Diet & Lifestyle',
  'Step 4 of 4: Measurements & Contact'
];

function gotoStep(stepNum) {
  if (stepNum < 1 || stepNum > 4) return;
  state.quizStep = stepNum;

  // Toggle active step
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`qStep${i}`);
    if (el) {
      if (i === stepNum) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    }
  }

  // Update progress bar
  const pct = stepNum * 25;
  const bar = document.getElementById('quizBar');
  const pctEl = document.getElementById('quizPct');
  const labelEl = document.getElementById('quizStepLabel');

  if (bar) bar.style.width = `${pct}%`;
  if (pctEl) pctEl.innerText = `${pct}%`;
  if (labelEl) labelEl.innerText = quizStepLabels[stepNum - 1];

  if (stepNum === 4) {
    calcBMI();
  }
}

function calcBMI() {
  const hInput = document.getElementById('qHeight');
  const wInput = document.getElementById('qWeight');
  let heightCm = parseFloat(hInput ? hInput.value : 162);
  let weightKg = parseFloat(wInput ? wInput.value : 72);

  // Robust validation & sanitization against zero/negative/extreme numbers
  if (isNaN(heightCm) || heightCm < 40) heightCm = 162;
  if (heightCm > 260) heightCm = 260;
  if (isNaN(weightKg) || weightKg < 20) weightKg = 72;
  if (weightKg > 350) weightKg = 350;

  const heightM = heightCm / 100;
  const bmi = (weightKg / (heightM * heightM)).toFixed(1);

  let category = 'Healthy Balance';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 24.9) category = 'Healthy Metabolic Range';
  else if (bmi < 29.9) category = 'Overweight / Metabolic Sluggishness';
  else category = 'High Endocrine Load';

  const liveEl = document.getElementById('liveBMI');
  if (liveEl) {
    liveEl.innerText = `${bmi} — ${category}`;
  }
  return { bmi, category };
}

// ═══════════════════════════════════════════════════════════════════
// INPUT VALIDATION (Strict Phone & Email Verification)
// ═══════════════════════════════════════════════════════════════════

function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  // Clean whitespace, dashes, parens, plus
  let clean = phone.replace(/[\s\-\(\)\+]/g, '');
  if (clean.startsWith('91') && clean.length === 12) {
    clean = clean.substring(2);
  } else if (clean.startsWith('0') && clean.length === 11) {
    clean = clean.substring(1);
  }
  // Must be strictly 10 digits starting with 6, 7, 8, or 9
  if (!/^[6-9]\d{9}$/.test(clean)) {
    return false;
  }
  // Reject identical repeating digits (e.g. 9999999999, 8888888888)
  if (/^(\d)\1{9}$/.test(clean)) {
    return false;
  }
  // Reject common dummy test sequences
  if (['1234567890', '9876543210', '0123456789'].includes(clean)) {
    return false;
  }
  return true;
}

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  // Standard RFC-compliant email pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) return false;
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;
  const domainParts = parts[1].split('.');
  if (domainParts.length < 2) return false;
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) return false;
  return true;
}

function validateFieldLive(fieldId) {
  const el = document.getElementById(fieldId);
  if (!el) return true;
  const val = (el.value || '').trim();
  const errEl = document.getElementById(fieldId + 'Error');
  let isValid = true;
  let errorMsg = '';

  if (fieldId === 'qPhone' || fieldId === 'bPhone' || fieldId === 'suPhone' || fieldId === 'suGooglePhone') {
    if (!val) {
      isValid = false;
      errorMsg = 'Please enter your 10-digit WhatsApp phone number.';
    } else if (!isValidPhone(val)) {
      isValid = false;
      errorMsg = 'Please enter a valid 10-digit Indian WhatsApp number (e.g. 9876543210).';
    }
  } else if (fieldId === 'qEmail' || fieldId === 'bEmail') {
    if (val && !isValidEmail(val)) {
      isValid = false;
      errorMsg = 'Please enter a valid email address (e.g. name@example.com).';
    }
  } else if (fieldId === 'suEmail') {
    if (!val) {
      isValid = false;
      errorMsg = 'Please enter your email address.';
    } else if (!isValidEmail(val)) {
      isValid = false;
      errorMsg = 'Please enter a valid email address (e.g. name@example.com).';
    }
  } else if (fieldId === 'qName' || fieldId === 'bName' || fieldId === 'suName') {
    if (!val || val.length < 2) {
      isValid = false;
      errorMsg = 'Please enter your full name (at least 2 letters).';
    }
  } else if (fieldId === 'suPassword' || fieldId === 'suGooglePassword') {
    if (!val || val.length < 6) {
      isValid = false;
      errorMsg = 'Password must be at least 6 characters.';
    }
  } else if (fieldId === 'suPasswordConfirm') {
    const p1 = document.getElementById('suPassword')?.value || '';
    if (!val) {
      isValid = false;
      errorMsg = 'Please confirm your password.';
    } else if (val !== p1) {
      isValid = false;
      errorMsg = 'Passwords do not match.';
    }
  } else if (fieldId === 'suGooglePasswordConfirm') {
    const p1 = document.getElementById('suGooglePassword')?.value || '';
    if (!val) {
      isValid = false;
      errorMsg = 'Please confirm your password.';
    } else if (val !== p1) {
      isValid = false;
      errorMsg = 'Passwords do not match.';
    }
  } else if (fieldId === 'authLoginInput') {
    if (!val) {
      isValid = false;
      errorMsg = 'Please enter your registered email or 10-digit phone number.';
    } else if (!isValidEmail(val) && !isValidPhone(val)) {
      isValid = false;
      errorMsg = 'Please enter a valid email address or 10-digit mobile number.';
    }
  }

  if (errEl) {
    if (!isValid) {
      errEl.innerText = errorMsg;
      errEl.classList.add('visible');
      el.classList.add('input-error');
      el.classList.remove('input-success');
    } else {
      errEl.innerText = '';
      errEl.classList.remove('visible');
      el.classList.remove('input-error');
      if (val) el.classList.add('input-success');
      else el.classList.remove('input-success');
    }
  }
  return isValid;
}

if (typeof window !== 'undefined') {
  window.isValidPhone = isValidPhone;
  window.isValidEmail = isValidEmail;
  window.validateFieldLive = validateFieldLive;
}

function handleQuizSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const isNameValid = validateFieldLive('qName');
  const isPhoneValid = validateFieldLive('qPhone');
  const isEmailValid = validateFieldLive('qEmail');

  if (!isNameValid || !isPhoneValid || !isEmailValid) {
    const firstInvalid = !isNameValid ? document.getElementById('qName') :
                         !isPhoneValid ? document.getElementById('qPhone') :
                         document.getElementById('qEmail');
    if (firstInvalid && typeof firstInvalid.focus === 'function') firstInvalid.focus();
    return false;
  }

  const name = (document.getElementById('qName')?.value || '').trim();
  const phone = (document.getElementById('qPhone')?.value || '').trim();
  const email = (document.getElementById('qEmail')?.value || '').trim();
  const height = document.getElementById('qHeight')?.value || '162';
  const weight = document.getElementById('qWeight')?.value || '72';
  const target = document.getElementById('qTarget')?.value || '60';

  const goalEl = document.querySelector('input[name="goal"]:checked');
  const goal = goalEl ? goalEl.value : 'Hormonal Imbalance & PCOS';

  const dietEl = document.querySelector('input[name="diet"]:checked');
  const diet = dietEl ? dietEl.value : 'Vegetarian';

  const actEl = document.querySelector('input[name="activity"]:checked');
  const activity = actEl ? actEl.value : 'Sedentary';

  const symptoms = Array.from(document.querySelectorAll('input[name="symptoms"]:checked')).map(cb => cb.value);

  const { bmi, category } = calcBMI();

  // Save to leads array
  const newLead = {
    id: `lead-${Date.now()}`,
    name: name || 'Prospective Client',
    phone: phone || 'N/A',
    email: email || 'N/A',
    goal,
    diet: `${diet} (${activity})`,
    symptoms: symptoms.join(', ') || 'Metabolic Sluggishness',
    bmi: `${bmi} (${category})`,
    weight: `${weight} kg (Target: ${target} kg)`,
    date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
  };

  state.leads.unshift(newLead);
  saveStoredLeads(state.leads);

  // Trigger Confetti!
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 120,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#CBEA7B', '#234338', '#1A3129', '#EEF8D3', '#E76F51']
    });
  }

  // Populate Result Screen
  const firstName = name.split(' ')[0] || 'Friend';
  const rName = document.getElementById('rName');
  if (rName) rName.innerText = firstName;

  const score = Math.max(68, 92 - symptoms.length * 4);
  const rScore = document.getElementById('rScore');
  if (rScore) rScore.innerText = `${score} / 100`;

  let focus = 'Hormone & Insulin Reset';
  let timeline = '8–12 Weeks';
  if (goal.includes('Postpartum')) {
    focus = 'Lactation Micronutrients & Core Vitality';
    timeline = '8–10 Weeks';
  } else if (goal.includes('Disorder')) {
    focus = 'Gut Microbiome & Metabolic Detox';
    timeline = '12–16 Weeks';
  } else if (goal.includes('Fat Loss')) {
    focus = 'Non-Starvation Caloric Partitioning';
    timeline = '6–10 Weeks';
  }

  const rFocus = document.getElementById('rFocus');
  if (rFocus) rFocus.innerText = focus;

  const rTimeline = document.getElementById('rTimeline');
  if (rTimeline) rTimeline.innerText = timeline;

  // Pre-filled WhatsApp link
  const waText = encodeURIComponent(
    `Hi dt Mimmy! 🌿 I just completed your Health Quiz on Nourish Delight.\n\n` +
    `👤 Name: ${name}\n` +
    `📞 Phone: ${phone}\n` +
    `🎯 Priority: ${goal}\n` +
    `⚖️ Current: ${weight} kg | Target: ${target} kg (BMI: ${bmi})\n` +
    `🥗 Diet: ${diet} | Activity: ${activity}\n` +
    `⚠️ Symptoms: ${symptoms.length ? symptoms.slice(0, 3).join(', ') : 'Metabolic Sluggishness'}\n\n` +
    `I would love to claim my Free 15-Minute Discovery Call with you!`
  );

  const rWa = document.getElementById('rWhatsApp');
  if (rWa) {
    rWa.href = `https://wa.me/${MIMMY_WHATSAPP_NUMBER}?text=${waText}`;
  }

  // Hide form, show results
  const form = document.getElementById('quizForm');
  const res = document.getElementById('quizResult');
  if (form) form.style.display = 'none';
  if (res) res.style.display = 'block';

  updateLeadsTable();
}

function resetQuiz() {
  const form = document.getElementById('quizForm');
  const res = document.getElementById('quizResult');
  if (form) form.style.display = 'block';
  if (res) res.style.display = 'none';
  gotoStep(1);
}

// ═══════════════════════════════════════════════════════════════════
// 3. FOOD SWAPS
// ═══════════════════════════════════════════════════════════════════

const swapData = {
  sweet: {
    title: "Sweet & Sugar Cravings",
    problem: "Late afternoon cortisol spikes cause sudden drops in cellular glucose, driving urges for bakery treats or chocolate.",
    badItem: "Milk Chocolate / Bakery Pastries / Sweet Biscuits",
    badDesc: "Causes a rapid insulin spike followed by a precipitous crash that fuels androgen production, facial acne, and waistline fat storage.",
    swapItem: "Mimmy's 3-Ingredient Chia Date Truffles",
    swapDesc: "Medjool dates crushed with raw ceremonial cacao, soaked chia seeds, and Himalayan pink salt. Packed with bioavailable magnesium & zinc.",
    benefit: "Magnesium naturally calms nervous system restlessness, while chia fiber ensures zero glucose spikes.",
    prepTime: "5 mins (No cook)",
    protein: "6g",
    fiber: "8g"
  },
  bloat: {
    title: "PMS & Fluid Retention Bloat",
    problem: "Elevated estrogen-to-progesterone ratios 5–7 days before cycles trigger fluid accumulation and sluggish peristalsis.",
    badItem: "Salted Potato Chips / Deep-Fried Namkeen",
    badDesc: "Industrial refined seed oils and excessive sodium worsen capillary leakage, resulting in uncomfortable abdominal puffiness.",
    swapItem: "Roasted Herb Makhana + Warm Ajwain Mint Infusion",
    swapDesc: "Foxnuts slow-roasted in 1/2 tsp pure A2 cow ghee with rock salt, turmeric, paired with boiled carom seed and mint infusion.",
    benefit: "Ajwain (thymol) stimulates gastric hydrochloric acid, while high-potassium makhana swiftly flushes stagnant extracellular sodium.",
    prepTime: "7 mins",
    protein: "7g",
    fiber: "5g"
  },
  postpartum: {
    title: "Postpartum Fatigue & Nursing Dips",
    problem: "Lactation requires 500+ extra clean calories daily; skipping meals causes sudden maternal exhaustion and low milk volume.",
    badItem: "Excessive Coffee & White Flour Rusk",
    badDesc: "High caffeine intake leaches calcium, passes into breast milk causing infant fussiness, and causes severe energy dips.",
    swapItem: "Cardamom Almond Elixir + Flax Gondh Laddoo",
    swapDesc: "Warm almond milk steeped with saffron, crushed green cardamom, and 1 mini flaxseed gondh laddoo sweetened with jaggery.",
    benefit: "Gondh and fenugreek act as potent natural galactagogues to maintain milk supply while replenishing maternal bone density.",
    prepTime: "6 mins",
    protein: "10g",
    fiber: "6g"
  },
  night: {
    title: "Late Night Munching & Insomnia",
    problem: "Screen exposure after 10 PM disrupts melatonin production, confusing fatigue signals with hunger pangs.",
    badItem: "Instant Noodles / White Bread Butter Toast",
    badDesc: "Simple refined starch late at night blocks nocturnal fat-burning human growth hormone (HGH) and degrades REM sleep quality.",
    swapItem: "Warm Herb Cottage Cheese / Sautéed Spiced Edamame",
    swapDesc: "Lightly seared fresh paneer cubes seasoned with oregano, black pepper, and lemon drizzle, or warm sea-salt edamame.",
    benefit: "Slow-digesting casein protein steadily releases amino acids all night, supporting overnight muscle repair without fat storage.",
    prepTime: "8 mins",
    protein: "18g",
    fiber: "4g"
  }
};

if (typeof window !== 'undefined') {
  window.swapData = swapData;
}

function renderSwap(type, btn) {
  const data = swapData[type] || swapData.sweet;
  const container = document.getElementById('swapContent');
  if (!container) return;

  // Update tab buttons
  document.querySelectorAll('.swap-tab').forEach(b => b.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else {
    const tabs = document.querySelectorAll('.swap-tab');
    tabs.forEach(t => {
      if (t.getAttribute('onclick')?.includes(type)) t.classList.add('active');
    });
  }

  container.innerHTML = `
    <!-- Left Column: The Comparison -->
    <div style="display:flex;flex-direction:column;gap:18px;">
      <!-- Bad Item -->
      <div style="background:#FFF5F5;border:1.5px solid #FED7D7;border-radius:14px;padding:24px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <span style="font-size:12px;font-weight:700;color:#C53030;text-transform:uppercase;letter-spacing:.05em;display:flex;align-items:center;gap:6px;">
            ⚠️ The Inflammatory Trap
          </span>
          <span style="font-size:11px;font-weight:700;background:#FED7D7;color:#9B2C2C;padding:3px 10px;border-radius:999px;">Spikes Hormones</span>
        </div>
        <h4 style="font-size:18px;font-weight:800;color:#742A2A;margin-bottom:6px;">${escapeHtml(data.badItem)}</h4>
        <p style="font-size:13px;color:#9B2C2C;line-height:1.6;">${escapeHtml(data.badDesc)}</p>
      </div>

      <!-- Mimmy Swap -->
      <div style="background:#F6FBE9;border:1.5px solid #EEF8D3;border-radius:14px;padding:26px;box-shadow:0 8px 24px rgba(26,49,41,.06);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <span style="font-size:12px;font-weight:700;color:#234338;text-transform:uppercase;letter-spacing:.05em;display:flex;align-items:center;gap:6px;">
            🌿 Mimmy's Nourish Swap
          </span>
          <span style="font-size:11px;font-weight:700;background:#CBEA7B;color:#1A3129;padding:3px 10px;border-radius:999px;">Recommended</span>
        </div>
        <h4 style="font-size:20px;font-weight:800;color:#1A3129;margin-bottom:8px;">${escapeHtml(data.swapItem)}</h4>
        <p style="font-size:14px;color:#2C5446;line-height:1.65;margin-bottom:16px;">${escapeHtml(data.swapDesc)}</p>
        <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:12px;font-weight:700;color:#1A3129;border-top:1px solid #EEF8D3;padding-top:14px;">
          <span>🕒 Prep: ${escapeHtml(data.prepTime)}</span>
          <span>💪 Protein: ${escapeHtml(data.protein)}</span>
          <span>🌾 Fiber: ${escapeHtml(data.fiber)}</span>
        </div>
      </div>
    </div>

    <!-- Right Column: The Science & Action -->
    <div style="background:#FAFDF2;border:1.5px solid #EEF8D3;border-radius:14px;padding:32px;display:flex;flex-direction:column;gap:18px;">
      <span style="font-size:12px;font-weight:700;color:#234338;text-transform:uppercase;letter-spacing:.06em;">⚡ Nutritional Science</span>
      <h3 style="font-size:24px;font-weight:800;color:#1A3129;">${escapeHtml(data.title)}</h3>
      <p style="font-size:14px;color:#4C4C4D;line-height:1.65;">${escapeHtml(data.problem)}</p>

      <div style="background:#FFFFFF;border:1px solid #EEF8D3;border-radius:12px;padding:18px;line-height:1.6;font-size:13px;color:#1A3129;">
        💡 <strong>The Mimmy Secret:</strong> ${escapeHtml(data.benefit)}
      </div>

      <div style="margin-top:auto;padding-top:12px;">
        <button onclick="openChatWith('Hey dt Mimmy, can you share the exact recipe for ${escapeHtml(data.swapItem)}?')" class="btn-primary" style="width:100%;justify-content:center;font-size:14px;padding:14px;">
          ✨ Ask Mimmy for Full Recipe in Chat
        </button>
      </div>
    </div>
  `;

  // Attach interactive cursor depth to swap card elements
  if (typeof attachSwapInteractivity === 'function') {
    attachSwapInteractivity(container);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 4. TESTIMONIALS
// ═══════════════════════════════════════════════════════════════════

function updateTestiUI() {
  const dots = document.querySelectorAll('#testiDots .testi-dot');
  dots.forEach((dot, idx) => {
    if (idx === state.testiIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });

  const cards = document.querySelectorAll('.testi-card');
  cards.forEach((card, idx) => {
    if (idx === state.testiIndex) {
      card.style.borderColor = 'var(--dark-20)';
      card.style.transform = 'translateY(-4px)';
    } else {
      card.style.borderColor = 'var(--green-90)';
      card.style.transform = 'none';
    }
  });
}

function prevTesti() {
  state.testiIndex = (state.testiIndex - 1 + 3) % 3;
  updateTestiUI();
}

function nextTesti() {
  state.testiIndex = (state.testiIndex + 1) % 3;
  updateTestiUI();
}

// ═══════════════════════════════════════════════════════════════════
// 5. PRICING TOGGLE
// ═══════════════════════════════════════════════════════════════════

function setPricingPlan(mode, btn) {
  state.pricingMode = mode;
  document.querySelectorAll('.pricing-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const p1 = document.getElementById('price1');
  const p2 = document.getElementById('price2');
  const p3 = document.getElementById('price3');

  if (mode === 'yearly') {
    if (p1) p1.innerHTML = '₹2,099 <span>/month (Save 40%)</span>';
    if (p2) p2.innerHTML = '₹4,799 <span style="color:#EEF8D3;">/month (Save 40%)</span>';
    if (p3) p3.innerHTML = '₹3,299 <span>/8 weeks (Save 40%)</span>';
  } else {
    if (p1) p1.innerHTML = '₹3,499 <span>/month</span>';
    if (p2) p2.innerHTML = '₹7,999 <span style="color:#EEF8D3;">/month</span>';
    if (p3) p3.innerHTML = '₹5,499 <span>/8 weeks</span>';
  }
}

// ═══════════════════════════════════════════════════════════════════
// 6. FAQ ACCORDION
// ═══════════════════════════════════════════════════════════════════

function toggleFaq(btn) {
  if (!btn) return;
  const answer = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');

  // Close other open FAQ items
  document.querySelectorAll('.faq-q').forEach(q => {
    q.classList.remove('open');
    if (q.nextElementSibling) {
      q.nextElementSibling.style.maxHeight = null;
    }
  });

  if (!isOpen && answer) {
    btn.classList.add('open');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }
}

// ═══════════════════════════════════════════════════════════════════
// 7. CHATBOT WIDGET
// ═══════════════════════════════════════════════════════════════════

function toggleChat() {
  const drawer = document.getElementById('chatDrawer');
  if (!drawer) return;
  drawer.classList.toggle('open');
  if (drawer.classList.contains('open')) {
    const input = document.getElementById('chatInp');
    input?.focus();
    const msgs = document.getElementById('chatMsgs');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }
}

function openChatWith(text) {
  const drawer = document.getElementById('chatDrawer');
  if (drawer && !drawer.classList.contains('open')) {
    drawer.classList.add('open');
  }
  if (text) {
    sendChat(text);
  }
}

function sendChat(customText) {
  const input = document.getElementById('chatInp');
  const text = (customText || (input ? input.value : '')).trim();
  if (!text) return;

  if (input && !customText) {
    input.value = '';
  }

  const container = document.getElementById('chatMsgs');
  if (!container) return;

  // Append user bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble user';
  userBubble.innerText = text;
  container.appendChild(userBubble);
  container.scrollTop = container.scrollHeight;

  // Typing indicator
  const typing = document.createElement('div');
  typing.className = 'chat-bubble bot typing-bubble';
  typing.id = 'typingBubble';
  typing.innerText = 'dt Mimmy is typing...';
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;

  setTimeout(() => {
    const t = document.getElementById('typingBubble');
    if (t) t.remove();

    const response = generateBotResponse(text);
    const botBubble = document.createElement('div');
    botBubble.className = 'chat-bubble bot';
    botBubble.innerHTML = `
      <div>${response.text}</div>
      ${response.actionHtml || ''}
    `;
    container.appendChild(botBubble);
    container.scrollTop = container.scrollHeight;
  }, 650);
}

function generateBotResponse(input) {
  const q = input.toLowerCase();

  if (q.includes('pcos') || q.includes('pcod') || q.includes('period') || q.includes('cycle') || q.includes('acne')) {
    return {
      text: "For PCOS & hormonal balance, we target insulin resistance and LH/FSH balance. Our clients typically regain natural cycles within 8–12 weeks through cycle-synced nutrition, seed cycling, and spearmint infusions — without lifelong birth control pills!",
      actionHtml: `<a href="#quiz" onclick="toggleChat()" class="action-btn">✨ Take Free PCOS Assessment</a>`
    };
  }

  if (q.includes('postpartum') || q.includes('baby') || q.includes('lactat') || q.includes('breastfeed') || q.includes('nursing') || q.includes('milk')) {
    return {
      text: "Postpartum recovery requires gentle, restorative nourishment! dt Mimmy designs meals that boost breast milk supply while gradually rebuilding core muscle and maternal iron/calcium stores. You can safely lose 10–14 kg without exhaustion.",
      actionHtml: `<button onclick="bookProgram('Postpartum Nurture & Core');toggleChat();" class="action-btn">👶 View Postpartum Program</button>`
    };
  }

  if (q.includes('price') || q.includes('cost') || q.includes('fee') || q.includes('package') || q.includes('program') || q.includes('plan')) {
    return {
      text: "We offer 3 structured coaching programs:\n• 4-Week Reset: ₹3,499\n• 12-Week Hormone Rebirth (Most Popular): ₹7,999\n• Postpartum Nurture: ₹5,499\nAll plans include personalized weekly meal charts, workout routines, and daily 1:1 WhatsApp support with Mimmy!",
      actionHtml: `<a href="#pricing" onclick="toggleChat()" class="action-btn">💳 Compare All Programs</a>`
    };
  }

  if (q.includes('book') || q.includes('call') || q.includes('consult') || q.includes('appointment')) {
    return {
      text: "I’d love to connect with you! You can book a Free 15-Minute Discovery Call directly with dt Mimmy on WhatsApp right now.",
      actionHtml: `<a href="https://wa.me/${MIMMY_WHATSAPP_NUMBER}?text=Hi%20dt%20Mimmy,%20I'd%20like%20to%20book%20my%20free%2015-minute%20discovery%20call!" target="_blank" rel="noopener noreferrer" class="action-btn green">📲 Open WhatsApp Discovery Call</a>`
    };
  }

  if (q.includes('recipe') || q.includes('swap') || q.includes('fudge') || q.includes('makhana') || q.includes('snack') || q.includes('sweet')) {
    return {
      text: "Check out our interactive Food Swaps section! It has step-by-step craving hacks for sweet tooth cravings, PMS bloating, and late-night satiety.",
      actionHtml: `<a href="#swaps" onclick="toggleChat()" class="action-btn">🥗 Explore Food Swaps</a>`
    };
  }

  if (q.includes('diet') || q.includes('roti') || q.includes('rice') || q.includes('vegetarian') || q.includes('veg') || q.includes('jain') || q.includes('food')) {
    return {
      text: "dt Mimmy never starves you or cuts out cultural Indian comfort foods! You will enjoy rotis, rice, dals, paneer, and homemade treats. We teach you correct food sequencing and glycemic balancing.",
      actionHtml: `<a href="#quiz" onclick="toggleChat()" class="action-btn">📋 Get My Custom Diet Chart</a>`
    };
  }

  if (q.includes('workout') || q.includes('exercise') || q.includes('fitness') || q.includes('gym')) {
    return {
      text: "dt Mimmy provides tailored home workout coaching (20–30 mins/day) designed specifically for hormonal sensitivity — focusing on strength training, low-cortisol walking, and postpartum core toning.",
      actionHtml: `<button onclick="bookProgram('12-Week Hormone Rebirth');toggleChat();" class="action-btn">💪 Explore Coaching</button>`
    };
  }

  if (q.includes('hi') || q.includes('hello') || q.includes('hey') || q.includes('namaste')) {
    return {
      text: "Hello! 🌿 Welcome to dt Mimmy's Nourish Delight. Are you looking to balance hormones, shed postpartum weight, or reverse a lifestyle condition? Tell me what you'd like help with!",
      actionHtml: `<a href="#quiz" onclick="toggleChat()" class="action-btn">🌿 Take Free Health Quiz</a>`
    };
  }

  return {
    text: "Nutrition works best when tailored to your exact metabolic markers. dt Mimmy personally reviews your case to customize your daily meals and habits. Would you like to chat with her on WhatsApp?",
    actionHtml: `<a href="https://wa.me/${MIMMY_WHATSAPP_NUMBER}?text=Hi%20dt%20Mimmy,%20I%20have%20a%20question%20about%20your%20diet%20coaching." target="_blank" rel="noopener noreferrer" class="action-btn green">💬 WhatsApp dt Mimmy</a>`
  };
}

// ═══════════════════════════════════════════════════════════════════
// 8. CLIENT PORTAL, AUTHENTICATION & FIREBASE OTP SIGN UP
// ═══════════════════════════════════════════════════════════════════

function sanitizeInput(str) {
  if (!str) return '';
  return String(str)
    .replace(/[<>]/g, '')
    .trim();
}

let otpResendCountdown = 0;
let otpResendTimer = null;

function toggleAuthModal() {
  if (state.currentUser) {
    openDash();
    return;
  }
  const modal = document.getElementById('authModal');
  if (modal) {
    const willOpen = !modal.classList.contains('open');
    modal.classList.toggle('open');
    if (willOpen) {
      // Default to login tab unless user specifically triggered sign up
      switchAuthTab('login');
    }
  }
}

function switchAuthTab(tab) {
  const loginTab = document.getElementById('authTabLogin');
  const signupTab = document.getElementById('authTabSignup');
  const loginView = document.getElementById('authLoginView');
  const signupView = document.getElementById('authSignupView');
  const modalTitle = document.getElementById('authModalTitle');
  const modalSub = document.getElementById('authModalSub');

  if (tab === 'signup') {
    if (loginTab) loginTab.classList.remove('active');
    if (signupTab) signupTab.classList.add('active');
    if (loginView) loginView.style.display = 'none';
    if (signupView) signupView.style.display = 'block';
    if (modalTitle) modalTitle.innerText = 'Create Client Account';
    if (modalSub) modalSub.innerText = 'Join dt Mimmy\'s personalized hormone & nutrition coaching community';
    resetSignupStep();
    setTimeout(() => {
      const suName = document.getElementById('suName');
      if (suName && typeof suName.focus === 'function') suName.focus();
    }, 50);
  } else {
    if (loginTab) loginTab.classList.add('active');
    if (signupTab) signupTab.classList.remove('active');
    if (loginView) loginView.style.display = 'block';
    if (signupView) signupView.style.display = 'none';
    if (modalTitle) modalTitle.innerText = 'Client Portal';
    if (modalSub) modalSub.innerText = 'Access your meal plans, water tracker, and 1:1 chat with dt Mimmy';
  }
}

function resetSignupStep() {
  const step1 = document.getElementById('suStepDetails');
  const step2 = document.getElementById('suStepOtp');
  const stepGoogle = document.getElementById('suGoogleStep');
  if (step1) step1.style.display = 'block';
  if (step2) step2.style.display = 'none';
  if (stepGoogle) stepGoogle.style.display = 'none';
  const otpInp = document.getElementById('suOtpCode');
  if (otpInp) otpInp.value = '';
  const otpErr = document.getElementById('suOtpError');
  if (otpErr) {
    otpErr.innerText = '';
    otpErr.classList.remove('visible');
  }
  const genErr = document.getElementById('suGeneralError');
  if (genErr) {
    genErr.innerText = '';
    genErr.classList.remove('visible');
  }
  const googleErr = document.getElementById('suGoogleGeneralError');
  if (googleErr) {
    googleErr.innerText = '';
    googleErr.classList.remove('visible');
  }
}

function clearOtpTimer() {
  if (otpResendTimer) {
    clearInterval(otpResendTimer);
    otpResendTimer = null;
  }
  otpResendCountdown = 0;
}

function startOtpResendTimer() {
  const resendBtn = document.getElementById('suResendBtn');
  if (!resendBtn) return;
  if (otpResendTimer) clearInterval(otpResendTimer);
  otpResendCountdown = 30;
  resendBtn.disabled = true;
  resendBtn.style.opacity = '0.6';
  resendBtn.innerText = `Resend in ${otpResendCountdown}s`;

  otpResendTimer = setInterval(() => {
    otpResendCountdown--;
    if (otpResendCountdown <= 0) {
      clearInterval(otpResendTimer);
      otpResendTimer = null;
      resendBtn.disabled = false;
      resendBtn.style.opacity = '1';
      resendBtn.innerText = 'Resend OTP';
    } else {
      resendBtn.innerText = `Resend in ${otpResendCountdown}s`;
    }
  }, 1000);
  if (otpResendTimer && typeof otpResendTimer.unref === 'function') {
    otpResendTimer.unref();
  }
}

async function handleSendSignupOtp(e) {
  if (e && e.preventDefault) e.preventDefault();
  const isNameValid = validateFieldLive('suName');
  const isPhoneValid = validateFieldLive('suPhone');
  const isEmailValid = validateFieldLive('suEmail');
  const isPassValid = validateFieldLive('suPassword');
  const isPassConfirmValid = validateFieldLive('suPasswordConfirm');

  if (!isNameValid || !isPhoneValid || !isEmailValid || !isPassValid || !isPassConfirmValid) {
    const firstInvalid = !isNameValid ? document.getElementById('suName') :
                         !isPhoneValid ? document.getElementById('suPhone') :
                         !isEmailValid ? document.getElementById('suEmail') :
                         !isPassValid ? document.getElementById('suPassword') :
                         document.getElementById('suPasswordConfirm');
    if (firstInvalid && typeof firstInvalid.focus === 'function') firstInvalid.focus();
    return false;
  }

  const name = sanitizeInput(document.getElementById('suName')?.value || '');
  const rawPhone = (document.getElementById('suPhone')?.value || '').trim();
  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
  const email = (document.getElementById('suEmail')?.value || '').trim().toLowerCase();
  const goal = (document.getElementById('suGoal')?.value || '12-Week Hormone Rebirth (PCOS & Thyroid)').trim();
  const password = (document.getElementById('suPassword')?.value || '').trim();

  const btn = document.getElementById('suSubmitPhoneBtn');
  const origBtnText = btn ? btn.innerHTML : '';
  const errEl = document.getElementById('suGeneralError');
  if (errEl) {
    errEl.innerText = '';
    errEl.classList.remove('visible');
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ Sending OTP...';
  }

  try {
    const authService = (typeof window !== 'undefined' && window.MimsAuthService) ? window.MimsAuthService : null;
    let res = null;
    if (authService && typeof authService.sendOtp === 'function') {
      res = await authService.sendOtp(cleanPhone, { name, email, goal, password }, 'recaptcha-container');
    } else {
      res = { success: true, mode: 'sandbox' };
    }

    const step1 = document.getElementById('suStepDetails');
    const step2 = document.getElementById('suStepOtp');
    if (step1) step1.style.display = 'none';
    if (step2) step2.style.display = 'block';

    const phoneDisplay = document.getElementById('suTargetPhoneDisplay');
    if (phoneDisplay) phoneDisplay.innerText = `+91 ${cleanPhone}`;

    // Secure: Sandbox OTP is NEVER shown on the UI or in placeholder
    const otpInp = document.getElementById('suOtpCode');
    if (otpInp) {
      otpInp.value = '';
      otpInp.placeholder = '• • • • • •';
      if (typeof otpInp.focus === 'function') otpInp.focus();
    }

    startOtpResendTimer();
    return true;
  } catch (err) {
    if (errEl) {
      errEl.innerText = err.message || 'Failed to send SMS OTP via Firebase. Please check your number.';
      errEl.classList.add('visible');
    }
    return false;
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origBtnText;
    }
  }
}

async function handleVerifySignupOtp(e) {
  if (e && e.preventDefault) e.preventDefault();
  const otpInp = document.getElementById('suOtpCode');
  const otpVal = (otpInp?.value || '').trim();
  const otpErr = document.getElementById('suOtpError');

  if (!otpVal || otpVal.length < 6) {
    if (otpErr) {
      otpErr.innerText = 'Please enter the 6-digit verification code sent to your phone.';
      otpErr.classList.add('visible');
    }
    if (otpInp && typeof otpInp.focus === 'function') otpInp.focus();
    return false;
  }

  const verifyBtn = document.getElementById('suVerifyOtpBtn');
  const origVerifyText = verifyBtn ? verifyBtn.innerHTML : '';
  if (verifyBtn) {
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '⏳ Verifying & Storing Account...';
  }

  try {
    let userProfile = null;
    const authService = (typeof window !== 'undefined' && window.MimsAuthService) ? window.MimsAuthService : null;
    const password = (document.getElementById('suPassword')?.value || '').trim();
    if (authService && typeof authService.verifyOtpAndRegister === 'function') {
      userProfile = await authService.verifyOtpAndRegister(otpVal, password);
    } else {
      const name = sanitizeInput(document.getElementById('suName')?.value || 'Client');
      const cleanPhone = (document.getElementById('suPhone')?.value || '').replace(/\D/g, '').slice(-10);
      userProfile = {
        uid: 'mims_user_' + Date.now(),
        name: name,
        phone: `+91 ${cleanPhone}`,
        email: (document.getElementById('suEmail')?.value || '').trim().toLowerCase(),
        password: password,
        program: (document.getElementById('suGoal')?.value || '12-Week Hormone Rebirth (PCOS & Thyroid)').trim(),
        role: 'client'
      };
      if (typeof window !== 'undefined' && window.MimsUserStorage) {
        window.MimsUserStorage.saveUser(userProfile);
      }
    }

    state.currentUser = userProfile;

    // Add to CRM leads list
    const newLead = {
      id: `usr-${Date.now()}`,
      name: userProfile.name,
      phone: userProfile.phone,
      email: userProfile.email || 'N/A',
      goal: `Client Sign-Up: ${userProfile.program || userProfile.goal || 'General'}`,
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Active Client'
    };
    state.leads.unshift(newLead);

    // Confetti celebration
    try {
      if (typeof confetti === 'function') {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    } catch (_) {}

    // Close auth modal and open customized dashboard
    document.getElementById('authModal')?.classList.remove('open');
    updateNavPortalUI();
    openDash();

    return true;
  } catch (err) {
    if (otpErr) {
      otpErr.innerText = err.message || 'Invalid verification code. Please check your SMS or enter your designated OTP.';
      otpErr.classList.add('visible');
    }
    return false;
  } finally {
    if (verifyBtn) {
      verifyBtn.disabled = false;
      verifyBtn.innerHTML = origVerifyText;
    }
  }
}

async function handleResendOtp() {
  if (otpResendCountdown > 0) return;
  const rawPhone = (document.getElementById('suPhone')?.value || '').trim();
  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length !== 10) {
    resetSignupStep();
    return;
  }
  const name = sanitizeInput(document.getElementById('suName')?.value || 'Client');
  const email = (document.getElementById('suEmail')?.value || '').trim().toLowerCase();
  const goal = (document.getElementById('suGoal')?.value || '12-Week Hormone Rebirth (PCOS & Thyroid)').trim();
  const password = (document.getElementById('suPassword')?.value || '').trim();

  try {
    const authService = (typeof window !== 'undefined' && window.MimsAuthService) ? window.MimsAuthService : null;
    if (authService && typeof authService.sendOtp === 'function') {
      await authService.sendOtp(cleanPhone, { name, email, goal, password }, 'recaptcha-container');
    }
    startOtpResendTimer();
  } catch (err) {
    const otpErr = document.getElementById('suOtpError');
    if (otpErr) {
      otpErr.innerText = err.message || 'Error resending OTP via Firebase.';
      otpErr.classList.add('visible');
    }
  }
}

// ── Global Toast / Notification Engine ──
function showNotification(msg) {
  if (typeof document === 'undefined' || !document.body) return;
  let toast = document.getElementById('mimsToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'mimsToast';
    toast.className = 'mims-toast';
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// ── Google Account Chooser & Onboarding Engine (Disabled for now as requested) ──
const GOOGLE_AUTH_ENABLED = false;
let activeGoogleChooserContext = 'signup';

function openGoogleChooser(context = 'signup') {
  if (!GOOGLE_AUTH_ENABLED) {
    console.info('Google Sign-In is temporarily disabled.');
    closeGoogleChooser();
    return false;
  }
  activeGoogleChooserContext = context;
  const modal = document.getElementById('googleChooserModal');
  if (modal) {
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    const authModal = document.getElementById('authModal');
    if (authModal) {
      authModal.dataset.wasOpen = authModal.classList.contains('open') ? 'true' : 'false';
      authModal.classList.remove('open');
    }
  }
  return true;
}

function closeGoogleChooser() {
  const modal = document.getElementById('googleChooserModal');
  if (modal) {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  }
  const authModal = document.getElementById('authModal');
  if (authModal && authModal.dataset.wasOpen === 'true') {
    authModal.classList.add('open');
  }
}

async function selectGoogleAccount(email, name, photoURL, badgeColor, badgeLetter) {
  if (!GOOGLE_AUTH_ENABLED) {
    console.info('Google Sign-In is temporarily disabled.');
    closeGoogleChooser();
    return false;
  }
  const gUser = {
    uid: 'goog_' + Date.now(),
    name: name || 'Google User',
    email: (email || '').trim().toLowerCase(),
    photoURL: photoURL || 'assets/mimmy_mascot_avatar.svg',
    badgeColor: badgeColor || null,
    badgeLetter: badgeLetter || null
  };

  closeGoogleChooser();

  let existingUser = null;
  if (typeof window !== 'undefined' && window.MimsUserStorage) {
    existingUser = window.MimsUserStorage.findUserByPhoneOrEmail(gUser.email);
  }

  if (activeGoogleChooserContext === 'login') {
    if (existingUser) {
      state.currentUser = existingUser;
      updateNavPortalUI();
      document.getElementById('authModal')?.classList.remove('open');
      openDash();
      showNotification(`✨ Welcome back, ${existingUser.name}! Signed in via Google.`);
      if (typeof confetti === 'function') {
        confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
      }
      return true;
    } else {
      activeGoogleChooserContext = 'signup';
      showNotification(`👋 Welcome ${gUser.name}! Please set your WhatsApp number and password to complete registration.`);
    }
  }

  // Sign Up / First Time Onboarding Flow
  if (typeof window !== 'undefined' && window.MimsAuthService) {
    window.MimsAuthService.pendingGoogleUser = gUser;
  }

  const authModal = document.getElementById('authModal');
  if (authModal) authModal.classList.add('open');
  switchAuthTab('signup');

  const step1 = document.getElementById('suStepDetails');
  const step2 = document.getElementById('suStepOtp');
  const stepGoogle = document.getElementById('suGoogleStep');
  if (step1) step1.style.display = 'none';
  if (step2) step2.style.display = 'none';
  if (stepGoogle) stepGoogle.style.display = 'block';

  const nameEl = document.getElementById('suGoogleName');
  const emailEl = document.getElementById('suGoogleEmail');
  const avatarEl = document.getElementById('suGoogleAvatar');
  if (nameEl) nameEl.innerText = gUser.name;
  if (emailEl) emailEl.innerText = gUser.email;
  if (avatarEl) {
    avatarEl.src = gUser.photoURL || 'assets/mimmy_mascot_avatar.svg';
  }

  setTimeout(() => {
    document.getElementById('suGooglePhone')?.focus();
  }, 100);

  return true;
}

function handleUseAnotherGoogleAccount() {
  if (!GOOGLE_AUTH_ENABLED) {
    console.info('Google Sign-In is temporarily disabled.');
    closeGoogleChooser();
    return false;
  }
  const googleSignInUrl = 'https://accounts.google.com/signin/v2/identifier';
  if (typeof window !== 'undefined' && typeof window.open === 'function') {
    window.open(googleSignInUrl, '_blank', 'noopener,noreferrer');
  }
  showNotification('🌐 Opening official Google Sign-In in a new secure tab. Or choose any account above.');
}

function openLegalNotice(type) {
  const isPrivacy = type === 'privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms of Service';
  const text = isPrivacy 
    ? 'dt Mimmy Nourish Delight respects your privacy. All your dietary data, WhatsApp logs, and health measurements are end-to-end protected and never shared with third parties.'
    : 'By using dt Mimmy Nourish Delight, you agree to our personalized nutrition coaching and consultation guidelines.';
  if (typeof alert === 'function') {
    alert(`📋 ${title}\n\n${text}`);
  }
}

async function handleGoogleAuth(context = 'signup') {
  if (!GOOGLE_AUTH_ENABLED) {
    console.info('Google Sign-In is temporarily disabled.');
    closeGoogleChooser();
    return false;
  }
  openGoogleChooser(context);

  try {
    const authService = (typeof window !== 'undefined' && window.MimsAuthService) ? window.MimsAuthService : null;
    if (authService && typeof authService.signInWithGoogle === 'function') {
      const res = await authService.signInWithGoogle();
      const gUser = res.user;

      let existingUser = null;
      if (typeof window !== 'undefined' && window.MimsUserStorage) {
        existingUser = window.MimsUserStorage.findUserByPhoneOrEmail(gUser.email);
      }

      if (existingUser && context === 'login') {
        state.currentUser = existingUser;
        updateNavPortalUI();
        document.getElementById('authModal')?.classList.remove('open');
        closeGoogleChooser();
        openDash();
        return true;
      }

      switchAuthTab('signup');
      const step1 = document.getElementById('suStepDetails');
      const step2 = document.getElementById('suStepOtp');
      const stepGoogle = document.getElementById('suGoogleStep');
      if (step1) step1.style.display = 'none';
      if (step2) step2.style.display = 'none';
      if (stepGoogle) stepGoogle.style.display = 'block';

      const nameEl = document.getElementById('suGoogleName');
      const emailEl = document.getElementById('suGoogleEmail');
      const avatarEl = document.getElementById('suGoogleAvatar');
      if (nameEl) nameEl.innerText = gUser.name;
      if (emailEl) emailEl.innerText = gUser.email;
      if (avatarEl && gUser.photoURL) avatarEl.src = gUser.photoURL;

      setTimeout(() => {
        document.getElementById('suGooglePhone')?.focus();
      }, 50);

      return true;
    }
  } catch (err) {
    const errEl = document.getElementById('suGeneralError') || document.getElementById('authLoginError');
    if (errEl) {
      errEl.innerText = err.message || 'Google Sign-In was cancelled or unavailable.';
      errEl.classList.add('visible');
    }
    return false;
  }
  return true;
}

async function handleCompleteGoogleSignup(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (!GOOGLE_AUTH_ENABLED) {
    console.info('Google Sign-In is temporarily disabled.');
    return false;
  }
  const isPhoneValid = validateFieldLive('suGooglePhone');
  const isPassValid = validateFieldLive('suGooglePassword');
  const isPassConfirmValid = validateFieldLive('suGooglePasswordConfirm');

  if (!isPhoneValid || !isPassValid || !isPassConfirmValid) {
    const firstInvalid = !isPhoneValid ? document.getElementById('suGooglePhone') :
                         !isPassValid ? document.getElementById('suGooglePassword') :
                         document.getElementById('suGooglePasswordConfirm');
    if (firstInvalid && typeof firstInvalid.focus === 'function') firstInvalid.focus();
    return false;
  }

  const rawPhone = (document.getElementById('suGooglePhone')?.value || '').trim();
  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
  const goal = (document.getElementById('suGoogleGoal')?.value || '12-Week Hormone Rebirth (PCOS & Thyroid)').trim();
  const password = (document.getElementById('suGooglePassword')?.value || '').trim();

  const btn = document.getElementById('suGoogleCompleteBtn');
  const origText = btn ? btn.innerHTML : '';
  const errEl = document.getElementById('suGoogleGeneralError');
  if (errEl) {
    errEl.innerText = '';
    errEl.classList.remove('visible');
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ Saving Account to Firebase...';
  }

  try {
    const authService = (typeof window !== 'undefined' && window.MimsAuthService) ? window.MimsAuthService : null;
    let userProfile = null;
    if (authService && typeof authService.completeGoogleSignup === 'function') {
      userProfile = await authService.completeGoogleSignup({ phone: cleanPhone, goal, password });
    } else {
      userProfile = {
        uid: 'goog_usr_' + Date.now(),
        name: document.getElementById('suGoogleName')?.innerText || 'Google Client',
        email: document.getElementById('suGoogleEmail')?.innerText || '',
        phone: `+91 ${cleanPhone}`,
        password: password,
        program: goal,
        role: 'client'
      };
    }

    state.currentUser = userProfile;

    // Add to CRM leads
    const newLead = {
      id: `usr-${Date.now()}`,
      name: userProfile.name,
      phone: userProfile.phone,
      email: userProfile.email || 'N/A',
      goal: `Google Client Sign-Up: ${userProfile.program || userProfile.goal}`,
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Active Client'
    };
    state.leads.unshift(newLead);

    // Confetti
    try {
      if (typeof confetti === 'function') confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (_) {}

    document.getElementById('authModal')?.classList.remove('open');
    updateNavPortalUI();
    openDash();
    return true;
  } catch (err) {
    if (errEl) {
      errEl.innerText = err.message || 'Could not complete registration. Please try again.';
      errEl.classList.add('visible');
    }
    return false;
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origText;
    }
  }
}

function loginDemo() {
  state.currentUser = {
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    program: '12-Week Hormone & Metabolism Reset — Week 4 of 12'
  };
  updateNavPortalUI();
  document.getElementById('authModal')?.classList.remove('open');
  openDash();
}

function handleLogin(e) {
  if (e && e.preventDefault) e.preventDefault();
  const isLoginValid = validateFieldLive('authLoginInput');
  if (!isLoginValid) {
    document.getElementById('authLoginInput')?.focus();
    return false;
  }
  const inputVal = (document.getElementById('authLoginInput')?.value || '').trim();
  const passwordVal = (document.getElementById('authPasswordInput')?.value || '').trim();
  const passErr = document.getElementById('authPasswordError');
  const loginErr = document.getElementById('authLoginError');
  if (passErr) { passErr.innerText = ''; passErr.classList.remove('visible'); }
  if (loginErr) { loginErr.innerText = ''; loginErr.classList.remove('visible'); }

  // Demo fallback support
  if (inputVal === 'priya.sharma@example.com' && (!passwordVal || passwordVal === 'nourish123')) {
    loginDemo();
    return true;
  }

  // Real user verification with saved password
  let verifyRes = null;
  if (typeof window !== 'undefined' && window.MimsUserStorage) {
    verifyRes = window.MimsUserStorage.verifyUserCredentials(inputVal, passwordVal);
  }

  if (verifyRes && verifyRes.success && verifyRes.user) {
    state.currentUser = verifyRes.user;
    updateNavPortalUI();
    document.getElementById('authModal')?.classList.remove('open');
    openDash();
    return true;
  }

  if (verifyRes && verifyRes.reason === 'invalid_password') {
    if (passErr) {
      passErr.innerText = 'Incorrect password. Please enter the password you set during registration.';
      passErr.classList.add('visible');
    }
    document.getElementById('authPasswordInput')?.focus();
    return false;
  }

  // User not found
  if (loginErr) {
    loginErr.innerText = 'No account found with this email or mobile number. Please click Create New Account below.';
    loginErr.classList.add('visible');
  }
  return false;
}

function logoutDash() {
  state.currentUser = null;
  updateNavPortalUI();
  closeDash();
}

function updateNavPortalUI() {
  const label = document.getElementById('navPortalLabel');
  const btn = document.getElementById('navPortalBtn');
  if (state.currentUser) {
    if (label) label.innerText = `${state.currentUser.name.split(' ')[0]}'s Portal`;
    if (btn) {
      btn.style.background = '#CBEA7B';
      btn.style.color = '#1A3129';
    }
  } else {
    if (label) label.innerText = 'Client Portal';
    if (btn) {
      btn.style.background = '';
      btn.style.color = '';
    }
  }
}

function openDash() {
  const dash = document.getElementById('dashOverlay');
  if (dash) dash.classList.add('open');
  const nameEl = document.getElementById('dashClientName');
  const progEl = document.querySelector('.dash-program');
  const avatarEl = document.querySelector('.dash-avatar');

  if (state.currentUser) {
    if (nameEl) nameEl.innerText = state.currentUser.name;
    if (progEl) progEl.innerText = state.currentUser.program || '12-Week Hormone & Metabolism Reset';
    if (avatarEl) {
      const parts = state.currentUser.name.trim().split(/\s+/);
      const initials = (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
      avatarEl.innerText = initials || 'PS';
    }
  } else {
    if (nameEl) nameEl.innerText = 'Priya Sharma';
    if (progEl) progEl.innerText = '12-Week Hormone & Metabolism Reset — Week 4 of 12';
    if (avatarEl) avatarEl.innerText = 'PS';
  }

  renderWaterGlasses();
  updateLeadsTable();
  switchTab('meals');
}

function closeDash() {
  const dash = document.getElementById('dashOverlay');
  if (dash) dash.classList.remove('open');
}

if (typeof window !== 'undefined') {
  window.toggleAuthModal = toggleAuthModal;
  window.switchAuthTab = switchAuthTab;
  window.resetSignupStep = resetSignupStep;
  window.startOtpResendTimer = startOtpResendTimer;
  window.handleSendSignupOtp = handleSendSignupOtp;
  window.handleVerifySignupOtp = handleVerifySignupOtp;
  window.handleResendOtp = handleResendOtp;
  window.loginDemo = loginDemo;
  window.handleLogin = handleLogin;
  window.logoutDash = logoutDash;
  window.openDash = openDash;
  window.closeDash = closeDash;
  window.clearOtpTimer = clearOtpTimer;
  window.handleGoogleAuth = handleGoogleAuth;
  window.handleCompleteGoogleSignup = handleCompleteGoogleSignup;
  window.openGoogleChooser = openGoogleChooser;
  window.closeGoogleChooser = closeGoogleChooser;
  window.selectGoogleAccount = selectGoogleAccount;
  window.handleUseAnotherGoogleAccount = handleUseAnotherGoogleAccount;
  window.openLegalNotice = openLegalNotice;
}

function switchTab(tabName) {
  // Update buttons
  const tabs = ['meals', 'water', 'chat', 'progress'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-${t}`);
    if (btn) {
      if (t === tabName) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });

  // Update sections
  const sections = ['meals', 'water', 'chat', 'progress', 'leads'];
  sections.forEach(s => {
    const sec = document.getElementById(`ds-${s}`);
    if (sec) {
      if (s === tabName) sec.classList.add('active');
      else sec.classList.remove('active');
    }
  });

  if (tabName === 'water') renderWaterGlasses();
  if (tabName === 'leads') updateLeadsTable();
}

function switchToLeads() {
  switchTab('leads');
}

// ── Water Tracker ──
function renderWaterGlasses() {
  const grid = document.getElementById('waterGrid');
  const label = document.getElementById('waterLabel');
  if (!grid) return;

  grid.innerHTML = '';
  for (let i = 1; i <= state.maxWater; i++) {
    const isFilled = i <= state.waterGlasses;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `glass-btn ${isFilled ? 'filled' : ''}`;
    btn.onclick = () => toggleGlass(i);
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="${isFilled ? '#ffffff' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
      <span>${i * 250} ml</span>
    `;
    grid.appendChild(btn);
  }

  if (label) {
    label.innerText = `${state.waterGlasses} / ${state.maxWater} Glasses (${(state.waterGlasses * 0.25).toFixed(1)}L)`;
  }
}

function toggleGlass(i) {
  if (state.waterGlasses === i) {
    state.waterGlasses = i - 1;
  } else {
    state.waterGlasses = i;
  }
  renderWaterGlasses();
}

// ── 1:1 Portal Chat with dt Mimmy ──
function sendPortalMsg() {
  const input = document.getElementById('portalInp');
  const text = (input ? input.value : '').trim();
  if (!text) return;
  input.value = '';

  const msgs = document.getElementById('portalMsgs');
  if (!msgs) return;

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // User message
  const userRow = document.createElement('div');
  userRow.style.display = 'flex';
  userRow.style.justifyContent = 'flex-end';
  userRow.innerHTML = `
    <div class="chat-bubble user" style="border-radius:14px 14px 4px 14px; max-width:80%;">
      ${escapeHtml(text)}
      <span style="display:block;font-size:10px;color:rgba(255,255,255,.6);margin-top:4px;text-align:right;">Just now (${timeStr})</span>
    </div>
  `;
  msgs.appendChild(userRow);
  msgs.scrollTop = msgs.scrollHeight;

  // Coach reply
  setTimeout(() => {
    const coachRow = document.createElement('div');
    coachRow.style.display = 'flex';
    coachRow.style.gap = '10px';
    coachRow.style.maxWidth = '80%';
    coachRow.innerHTML = `
      <img src="assets/mimmy_mascot_avatar.svg" style="width:30px;height:30px;border-radius:50%;object-fit:cover;flex-shrink:0;background:#234338;">
      <div class="chat-bubble bot" style="border-radius:4px 14px 14px 14px;">
        Got it Priya! 🌱 You are doing wonderfully this week. Keep up the high hydration and make sure to finish your dinner by 8 PM. Let me know if you need any ingredient adjustments!
        <span style="display:block;font-size:10px;color:#999;margin-top:4px;">Just now</span>
      </div>
    `;
    msgs.appendChild(coachRow);
    msgs.scrollTop = msgs.scrollHeight;
  }, 750);
}

// ── Leads CRM ──
function updateLeadsTable() {
  const tbody = document.getElementById('leadsTableBody');
  const badge = document.getElementById('leadsBadge');
  if (!tbody) return;

  if (badge) {
    badge.innerText = `${state.leads.length} ${state.leads.length === 1 ? 'Lead' : 'Leads'}`;
  }

  tbody.innerHTML = '';
  state.leads.forEach(lead => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:700;color:#1A3129;">${escapeHtml(lead.name)}</td>
      <td style="color:#666;">${escapeHtml(lead.phone)}</td>
      <td><span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;background:#EEF8D3;color:#1A3129;">${escapeHtml(lead.goal)}</span></td>
      <td style="color:#666;">${escapeHtml(lead.weight || lead.bmi || 'N/A')}</td>
      <td style="color:#999;font-size:12px;">${escapeHtml(lead.date)}</td>
      <td style="text-align:right;">
        <a href="https://wa.me/${(lead.phone || '').replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(lead.name)},%20this%20is%20dt%20Mimmy!%20I%20reviewed%20your%20health%20assessment." target="_blank" rel="noopener noreferrer" class="btn-primary" style="font-size:11px;padding:6px 12px;text-decoration:none;display:inline-flex;gap:4px;">
          📲 WhatsApp
        </a>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ═══════════════════════════════════════════════════════════════════
// 9. BOOKING MODAL
// ═══════════════════════════════════════════════════════════════════

function bookProgram(progName) {
  state.selectedProgram = progName;
  const sub = document.getElementById('bookingSubtitle');
  if (sub) sub.innerText = `Selected Program: ${progName}`;
  const modal = document.getElementById('bookingModal');
  if (modal) modal.classList.add('open');
  document.getElementById('bName')?.focus();
}

function closeBooking() {
  const modal = document.getElementById('bookingModal');
  if (modal) modal.classList.remove('open');
}

function handleBooking(e) {
  if (e && e.preventDefault) e.preventDefault();

  const isNameValid = validateFieldLive('bName');
  const isPhoneValid = validateFieldLive('bPhone');
  const isEmailValid = validateFieldLive('bEmail');

  if (!isNameValid || !isPhoneValid || !isEmailValid) {
    const firstInvalid = !isNameValid ? document.getElementById('bName') :
                         !isPhoneValid ? document.getElementById('bPhone') :
                         document.getElementById('bEmail');
    if (firstInvalid && typeof firstInvalid.focus === 'function') firstInvalid.focus();
    return false;
  }

  const name = (document.getElementById('bName')?.value || '').trim();
  const phone = (document.getElementById('bPhone')?.value || '').trim();
  const email = (document.getElementById('bEmail')?.value || '').trim();
  const note = (document.getElementById('bNote')?.value || '').trim();

  const newLead = {
    id: `book-${Date.now()}`,
    name: name || 'Program Inquirer',
    phone: phone || 'N/A',
    email: email || 'N/A',
    goal: `Program Inquiry: ${state.selectedProgram}`,
    bmi: 'Program Booking',
    weight: note || 'Direct Program Inquiry',
    date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
  };

  state.leads.unshift(newLead);
  saveStoredLeads(state.leads);

  closeBooking();

  const msg = encodeURIComponent(
    `Hi dt Mimmy! 🌸 I am interested in joining your ${state.selectedProgram}.\n\n` +
    `👤 Name: ${name}\n` +
    `📞 Phone: ${phone}\n` +
    (email ? `📧 Email: ${email}\n` : '') +
    `💬 Note: ${note || 'Please share next steps to enroll!'}`
  );
  window.open(`https://wa.me/${MIMMY_WHATSAPP_NUMBER}?text=${msg}`, '_blank', 'noopener,noreferrer');
}

// ═══════════════════════════════════════════════════════════════════
// 10. HELPER UTILITIES & INITIALIZATION
// ═══════════════════════════════════════════════════════════════════

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ═══════════════════════════════════════════════════════════════
//  PARALLAX & CURSOR-INTERACTIVE EFFECTS ENGINE
// ═══════════════════════════════════════════════════════════════

function initParallaxAndCursorEffects() {
  // Respect prefers-reduced-motion
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  } catch (_) { /* JSDOM or unsupported — proceed */ }

  // ── Hero Parallax Cursor Tracking ──
  const heroEl = document.getElementById('hero');
  const cursorGlow = document.getElementById('heroCursorGlow');
  const parallaxLayers = document.querySelectorAll('.parallax-layer');

  // Smoothing state for lerped parallax
  let heroMouse = { x: 0, y: 0 };
  let heroTarget = { x: 0, y: 0 };
  let heroAnimating = false;

  if (heroEl && parallaxLayers.length > 0) {
    heroEl.addEventListener('mousemove', (e) => {
      const rect = heroEl.getBoundingClientRect();
      // Normalized -1 to 1 from center
      heroTarget.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      heroTarget.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      // Update cursor glow position
      if (cursorGlow) {
        cursorGlow.style.left = (e.clientX - rect.left) + 'px';
        cursorGlow.style.top = (e.clientY - rect.top) + 'px';
      }

      if (!heroAnimating) {
        heroAnimating = true;
        requestAnimationFrame(animateHeroParallax);
      }
    });

    heroEl.addEventListener('mouseleave', () => {
      heroTarget.x = 0;
      heroTarget.y = 0;
      if (cursorGlow) cursorGlow.style.opacity = '0';
      if (!heroAnimating) {
        heroAnimating = true;
        requestAnimationFrame(animateHeroParallax);
      }
    });
  }

  function animateHeroParallax() {
    // Lerp towards target
    const ease = 0.08;
    heroMouse.x += (heroTarget.x - heroMouse.x) * ease;
    heroMouse.y += (heroTarget.y - heroMouse.y) * ease;

    // Apply transforms to each parallax layer based on its data-depth
    parallaxLayers.forEach(layer => {
      const depth = parseFloat(layer.dataset.depth) || 0.05;
      const moveX = heroMouse.x * depth * 100;
      const moveY = heroMouse.y * depth * 80;
      layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });

    // Continue until close enough
    const dx = Math.abs(heroTarget.x - heroMouse.x);
    const dy = Math.abs(heroTarget.y - heroMouse.y);
    if (dx > 0.001 || dy > 0.001) {
      requestAnimationFrame(animateHeroParallax);
    } else {
      heroAnimating = false;
    }
  }

  // ── Hero Heading Interactive Reveal: Silky-Smooth Cursor-Proximity Driven Engine ──
  const headingWrap = document.getElementById('heroHeadingWrap');
  if (headingWrap) {
    const avo = document.getElementById('revElemAvo');
    const wheat = document.getElementById('revElemWheat');
    const leafR = document.getElementById('revElemLeafR');
    const steth = document.getElementById('revElemSteth');
    const hintPill = headingWrap.querySelector('.reveal-hint-pill');
    const heroHeading = headingWrap.querySelector('.hero-heading');

    let currentReveal = 0; // 0.0 (draped resting) to 1.0 (fully parted outwards)
    let targetReveal = 0;
    let isToggled = false;
    let animFrameId = null;

    function applyRevealFactor(p) {
      if (!avo && !wheat && !leafR && !steth) return;

      if (p <= 0.001) {
        // Back at resting state: clear inline styles to restore natural CSS idle floating bob
        [avo, wheat, leafR, steth].forEach(el => {
          if (el) {
            el.style.transform = '';
            el.style.opacity = '';
            el.style.filter = '';
          }
        });
        if (hintPill) {
          hintPill.style.opacity = '';
          hintPill.style.transform = '';
        }
        if (heroHeading) {
          heroHeading.style.textShadow = '';
        }
        return;
      }

      const blurVal = (2.5 * p).toFixed(2);
      const opacityVal = (1 - 0.62 * p).toFixed(3);
      const dropShadow = 'drop-shadow(0 12px 24px rgba(0, 0, 0, 0.6))';
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
      const spread = isMobile ? 0.45 : 1.0;

      // 1. Avocado (top-left): glides outwards towards top-left (-65px, -35px)
      if (avo) {
        avo.style.transform = `translate3d(${(-65 * spread * p).toFixed(2)}px, ${(-35 * spread * p).toFixed(2)}px, 0) rotate(${(-14 - 4 * p).toFixed(2)}deg) scale(${(1 - 0.08 * p).toFixed(3)})`;
        avo.style.opacity = opacityVal;
        avo.style.filter = `blur(${blurVal}px) ${dropShadow}`;
      }

      // 2. Wheat Bud (lower-left): glides outwards towards bottom-left (-55px, +40px)
      if (wheat) {
        wheat.style.transform = `translate3d(${(-55 * spread * p).toFixed(2)}px, ${(40 * spread * p).toFixed(2)}px, 0) rotate(${(10 - 4 * p).toFixed(2)}deg) scale(${(1 - 0.08 * p).toFixed(3)})`;
        wheat.style.opacity = opacityVal;
        wheat.style.filter = `blur(${blurVal}px) ${dropShadow}`;
      }

      // 3. Right Tulsi Leaf (top-right): glides outwards towards top-right (+65px, -35px)
      if (leafR) {
        leafR.style.transform = `translate3d(${(65 * spread * p).toFixed(2)}px, ${(-35 * spread * p).toFixed(2)}px, 0) rotate(${(8 + 6 * p).toFixed(2)}deg) scale(${(1 - 0.08 * p).toFixed(3)})`;
        leafR.style.opacity = opacityVal;
        leafR.style.filter = `blur(${blurVal}px) ${dropShadow}`;
      }

      // 4. Clinical Stethoscope (lower-right): glides outwards towards bottom-right (+70px, +40px)
      if (steth) {
        steth.style.transform = `translate3d(${(70 * spread * p).toFixed(2)}px, ${(40 * spread * p).toFixed(2)}px, 0) rotate(${(10 * p).toFixed(2)}deg) scale(${(1 - 0.08 * p).toFixed(3)})`;
        steth.style.opacity = opacityVal;
        steth.style.filter = `blur(${blurVal}px) ${dropShadow}`;
      }

      // Interactive hint pill fades out as user explores
      if (hintPill) {
        hintPill.style.opacity = Math.max(0, 0.95 - p * 1.5).toFixed(3);
        hintPill.style.transform = `translateX(-50%) translateY(${(12 * p).toFixed(1)}px)`;
      }

      // Hero text radiates a soft bio-luminescent glow when unveiled
      if (heroHeading) {
        const glowAlpha = (0.75 * p).toFixed(2);
        heroHeading.style.textShadow = `0 0 ${(45 * p).toFixed(1)}px rgba(203, 234, 123, ${glowAlpha}), 0 4px 25px rgba(0, 0, 0, 0.85)`;
      }
    }

    const safeRAF = (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function')
      ? window.requestAnimationFrame.bind(window)
      : (typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (cb) => setTimeout(cb, 16));

    function renderRevealAnimation() {
      const diff = targetReveal - currentReveal;
      if (Math.abs(diff) > 0.0008) {
        currentReveal += diff * 0.09; // Silky-smooth physics damping
        applyRevealFactor(currentReveal);
        animFrameId = safeRAF(renderRevealAnimation);
      } else {
        currentReveal = targetReveal;
        applyRevealFactor(currentReveal);
        animFrameId = null;
      }
    }

    function triggerRevealFrame() {
      if (!animFrameId) {
        animFrameId = safeRAF(renderRevealAnimation);
      }
    }

    // Continuous cursor-proximity tracking
    function onPointerMoveHero(e) {
      if (isToggled) return;
      const rect = headingWrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);

      const maxRadius = Math.max(rect.width * 0.72, 380);
      const innerRadius = 45;

      if (dist <= innerRadius) {
        targetReveal = 1.0;
      } else if (dist >= maxRadius) {
        targetReveal = 0.0;
      } else {
        const norm = (maxRadius - dist) / (maxRadius - innerRadius);
        // Smoothstep cubic easing
        targetReveal = norm * norm * (3 - 2 * norm);
      }

      if (targetReveal > 0.45) {
        headingWrap.classList.add('revealed');
      } else if (!isToggled) {
        headingWrap.classList.remove('revealed');
      }

      triggerRevealFrame();
    }

    window.addEventListener('mousemove', onPointerMoveHero, { passive: true });

    document.addEventListener('mouseleave', () => {
      if (!isToggled) {
        targetReveal = 0;
        headingWrap.classList.remove('revealed');
        triggerRevealFrame();
      }
    });

    // Touch device tap / click toggle
    headingWrap.addEventListener('click', () => {
      isToggled = !isToggled;
      if (isToggled) {
        headingWrap.classList.add('revealed');
        targetReveal = 1.0;
      } else {
        headingWrap.classList.remove('revealed');
        targetReveal = 0.0;
      }
      triggerRevealFrame();
    });

    // Mouseenter & mouseleave handlers for synthetic test suite dispatch
    headingWrap.addEventListener('mouseenter', () => {
      headingWrap.classList.add('revealed');
      targetReveal = 1.0;
      triggerRevealFrame();
    });

    headingWrap.addEventListener('mouseleave', () => {
      if (!isToggled) {
        headingWrap.classList.remove('revealed');
        targetReveal = 0.0;
        triggerRevealFrame();
      }
    });

    // Hash check for revealed demo mode
    if (window.location.hash.includes('reveal')) {
      isToggled = true;
      headingWrap.classList.add('revealed');
      targetReveal = 1.0;
      applyRevealFactor(1.0);
    }
  }

  // ── Feature Card 3D Tilt ──
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach(card => {
    card.classList.add('cursor-tilt-card');
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (y - 0.5) * -8;  // subtle tilt
      const rotateY = (x - 0.5) * 8;
      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      // Shine position
      card.style.setProperty('--shine-x', (x * 100) + '%');
      card.style.setProperty('--shine-y', (y * 100) + '%');
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale(1)';
    });
  });

  // ── Pricing Card Cursor Glow ──
  const pricingCards = document.querySelectorAll('.pricing-card');
  pricingCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--glow-x', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--glow-y', (e.clientY - rect.top) + 'px');
    });
  });

  // ── Testimonial Card Depth Tilt ──
  const testiCards = document.querySelectorAll('.testi-card');
  testiCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${y * -4}deg) rotateY(${x * 4}deg) translateY(-4px)`;
      card.style.boxShadow = `${x * -10}px ${10 + y * 5}px 30px rgba(0,0,0,0.12)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
      card.style.boxShadow = '';
    });
  });

  // ── Hero Badge Magnetic Repel ──
  const heroBadges = document.querySelectorAll('.hero-badge');
  heroBadges.forEach(badge => {
    badge.addEventListener('mousemove', (e) => {
      const rect = badge.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      badge.style.transform = `translate(${x * 4}px, ${y * 4}px) scale(1.03)`;
    });
    badge.addEventListener('mouseleave', () => {
      badge.style.transform = '';
    });
  });

  // ── Stats Ribbon Interactive Hover Float ──
  const statItems = document.querySelectorAll('.stats-grid > div');
  statItems.forEach(item => {
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      item.style.transform = `perspective(500px) rotateX(${y * -4}deg) rotateY(${x * 4}deg) translateY(-5px)`;
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
    });
  });

  // ── Food Swap Cards Interactive Tilt ──
  window.attachSwapInteractivity = function(container) {
    const parent = container || document.getElementById('swapContent');
    if (!parent) return;
    const cards = parent.querySelectorAll('.swap-card, [style*="border-radius:14px"]');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(600px) rotateX(${y * -5}deg) rotateY(${x * 5}deg) translateY(-3px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  };
  const swapContainer = document.getElementById('swapContent');
  if (swapContainer) window.attachSwapInteractivity(swapContainer);

  // ── About dt Mimmy Mascot Card 3D Depth ──
  const aboutMascotCard = document.querySelector('.about-card-mascot');
  if (aboutMascotCard) {
    aboutMascotCard.addEventListener('mousemove', (e) => {
      const rect = aboutMascotCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      aboutMascotCard.style.transform = `perspective(900px) rotateX(${y * -5}deg) rotateY(${x * 5}deg) translateY(-5px)`;
      aboutMascotCard.style.boxShadow = `${x * -12}px ${12 + y * 6}px 35px rgba(26,49,41,0.14)`;
    });
    aboutMascotCard.addEventListener('mouseleave', () => {
      aboutMascotCard.style.transform = '';
      aboutMascotCard.style.boxShadow = '';
    });
  }

  // ── Quiz & BMI Card Interactive Perspective ──
  const quizCards = document.querySelectorAll('.quiz-card, .bmi-card, .bmi-result-card');
  quizCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${y * -3}deg) rotateY(${x * 3}deg) translateY(-3px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ── Section Scroll Reveal ──
  const revealSections = document.querySelectorAll('#features, #quiz, #swaps, #pricing, #about, #testimonials, #faq');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

    revealSections.forEach(section => {
      section.classList.add('section-reveal');
      revealObserver.observe(section);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  renderSwap('sweet');
  renderWaterGlasses();
  updateLeadsTable();
  calcBMI();
  initParallaxAndCursorEffects();

  // Enter key listeners
  const chatInp = document.getElementById('chatInp');
  if (chatInp) {
    chatInp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendChat();
    });
  }

  const portalInp = document.getElementById('portalInp');
  if (portalInp) {
    portalInp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendPortalMsg();
    });
  }

  // Close modals on clicking overlay outside box
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  });

  // URL Hash handling for direct modal deep links
  try {
    const hash = window.location.hash;
    if (hash === '#login' || hash === '#auth') {
      toggleAuthModal();
      switchAuthTab('login');
    } else if (hash === '#signup' || hash === '#auth-signup') {
      toggleAuthModal();
      switchAuthTab('signup');
    } else if (hash === '#signup-scrolled') {
      toggleAuthModal();
      switchAuthTab('signup');
      setTimeout(() => {
        const box = document.querySelector('#authModal .modal-box');
        if (box) box.scrollTop = box.scrollHeight;
      }, 100);
    } else if (hash === '#otp') {
      toggleAuthModal();
      switchAuthTab('signup');
      const suName = document.getElementById('suName');
      const suPhone = document.getElementById('suPhone');
      const suEmail = document.getElementById('suEmail');
      const suPass = document.getElementById('suPassword');
      const suPassConf = document.getElementById('suPasswordConfirm');
      if (suName) suName.value = 'Ananya Sen';
      if (suPhone) suPhone.value = '9823456781';
      if (suEmail) suEmail.value = 'ananya.sen@gmail.com';
      if (suPass) suPass.value = 'Health@2026';
      if (suPassConf) suPassConf.value = 'Health@2026';
      handleSendSignupOtp();
    } else if (hash === '#google-step' || hash === '#google-chooser' || hash === '#google-accounts') {
      // Google sign-in is disabled; fallback to standard signup modal
      toggleAuthModal();
      switchAuthTab('signup');
    }
  } catch (_) {}
});
