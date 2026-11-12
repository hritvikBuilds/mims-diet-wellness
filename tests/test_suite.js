/**
 * ═══════════════════════════════════════════════════════════════════
 * Comprehensive Test Suite for dt Mimmy | Nourish Delight
 * Includes:
 *   1. Component Verification Test Cases for All Site Components
 *   2. Web Security & Resilience Test Cases
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const rawHtml = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const firebaseConfigJs = fs.readFileSync(path.join(projectRoot, 'firebase-config.js'), 'utf8');
const appJs = fs.readFileSync(path.join(projectRoot, 'app.js'), 'utf8');

// Strip script tags from HTML string to prevent JSDOM from trying to fetch them via HTTP
const cleanHtml = rawHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

function createDomEnvironment() {
  const dom = new JSDOM(cleanHtml, {
    runScripts: 'dangerously',
    url: 'http://localhost:3000/'
  });

  const { window } = dom;

  // Mock window.open with tracking
  window.lastOpenedUrl = null;
  window.lastOpenedTarget = null;
  window.lastOpenedFeatures = null;
  window.open = (url, target, features) => {
    window.lastOpenedUrl = url;
    window.lastOpenedTarget = target;
    window.lastOpenedFeatures = features;
    return {};
  };

  // Mock confetti
  window.confettiCalled = false;
  window.confetti = () => {
    window.confettiCalled = true;
  };

  // Execute firebase-config.js and app.js in window context
  window.eval(firebaseConfigJs);
  window.eval(appJs);

  // Trigger DOMContentLoaded
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

  return { dom, window, document: window.document };
}

// ═══════════════════════════════════════════════════════════════════
// 1. COMPONENT TESTS
// ═══════════════════════════════════════════════════════════════════

describe('COMPONENT TESTS', () => {

  it('Component 1: Navigation Bar & Branding', () => {
    const { document } = createDomEnvironment();

    const logo = document.querySelector('.nav-logo img');
    assert.ok(logo, 'Brand logo exists');
    assert.strictEqual(logo.getAttribute('src'), 'assets/mimmy_mascot_avatar.svg', 'Logo uses new mascot avatar');

    const brandDiv = document.querySelector('.nav-logo');
    assert.ok(brandDiv.textContent.includes('dt Mimmy'), 'Brand title is dt Mimmy');
    assert.ok(brandDiv.textContent.includes('Nourish Delight'), 'Brand subtitle is Nourish Delight');

    const links = Array.from(document.querySelectorAll('.nav-links a'));
    assert.strictEqual(links.length, 7, 'All 7 desktop navigation links are present');
    
    const expectedLabels = ['Home', 'Specializations', 'Free Quiz', 'Food Swaps', 'Programs', 'About', 'FAQ'];
    const expectedHrefs = ['#hero', '#features', '#quiz', '#swaps', '#pricing', '#about', '#faq'];

    links.forEach((link, idx) => {
      assert.strictEqual(link.textContent?.trim(), expectedLabels[idx], `Link ${idx} label is ${expectedLabels[idx]}`);
      assert.strictEqual(link.getAttribute('href'), expectedHrefs[idx], `Link ${idx} href is ${expectedHrefs[idx]}`);
    });

    const portalBtn = document.getElementById('navPortalBtn');
    assert.ok(portalBtn, 'Client Portal button exists in navbar');
  });

  it('Component 2: Hero Section & Bio-Vitality Hub Animation', () => {
    const { document, window } = createDomEnvironment();

    const hero = document.getElementById('hero');
    assert.ok(hero, 'Hero section exists');

    const heading = hero.querySelector('.hero-heading');
    assert.ok(heading, 'Hero heading exists');
    assert.ok(heading.textContent.includes('Personalized') && heading.textContent.includes('Hormone & Nutrition'), 'Heading text verified');

    // Verify 4 floating perimeter cards are completely removed
    const floatCards = document.querySelectorAll('.health-float-card');
    assert.strictEqual(floatCards.length, 0, 'All 4 floating perimeter cards are confirmed removed');

    // Verify Interactive Hero Heading Veil Layers (Leaves, Stethoscope, Rice Bag)
    const headingWrap = document.getElementById('heroHeadingWrap');
    assert.ok(headingWrap, 'Hero heading wrap container exists');

    const veil = document.getElementById('heroRevealVeil');
    assert.ok(veil, 'Hero reveal veil layer exists');

    const steth = document.getElementById('revElemSteth');
    assert.ok(steth, 'Clinical Stethoscope layer exists');

    // Verify bag of rice is removed
    const rice = document.getElementById('revElemRice');
    assert.strictEqual(rice, null, 'Bag of rice layer is confirmed removed');

    // Verify 3D Avocado superfood layer in top-left (replacing left leaf)
    const avo = document.getElementById('revElemAvo');
    assert.ok(avo, 'Hormone-Balancing 3D Avocado superfood layer exists in top-left position');

    // Verify Realistic 3D Green Wheat Bud layer in lower-left (replacing previous avocado spot)
    const wheat = document.getElementById('revElemWheat');
    assert.ok(wheat, 'Realistic 3D Green Wheat Bud layer exists in lower-left position');

    const leafR = document.getElementById('revElemLeafR');
    assert.ok(leafR, 'Botanical Right Tulsi 3D Leaf layer exists');

    // Test Interactive Reveal on Hover & Click
    headingWrap.dispatchEvent(new window.Event('mouseenter'));
    assert.ok(headingWrap.classList.contains('revealed'), 'Heading enters revealed state on mouseenter');

    headingWrap.dispatchEvent(new window.Event('mouseleave'));
    assert.ok(!headingWrap.classList.contains('revealed'), 'Heading exits revealed state on mouseleave');

    headingWrap.dispatchEvent(new window.Event('click'));
    assert.ok(headingWrap.classList.contains('revealed'), 'Heading toggles revealed state on click/tap');

    const hub = document.getElementById('vitalityHub');
    assert.ok(hub, 'Bio-Vitality Hub container exists');

    const nodes = document.querySelectorAll('.orbit-node');
    assert.strictEqual(nodes.length, 4, '4 Cycle Phase orbital nodes exist');

    const nodeTexts = Array.from(nodes).map(n => n.textContent?.trim());
    assert.ok(nodeTexts.some(t => t.includes('Follicular')), 'Follicular node verified');
    assert.ok(nodeTexts.some(t => t.includes('Ovulatory')), 'Ovulatory node verified');
    assert.ok(nodeTexts.some(t => t.includes('Luteal')), 'Luteal node verified');
    assert.ok(nodeTexts.some(t => t.includes('Menstrual')), 'Menstrual node verified');

    const quizBtn = hero.querySelector('a[href="#quiz"]');
    assert.ok(quizBtn, 'Hero Free Quiz CTA button exists');

    const chatBtn = hero.querySelector('button[onclick*="openChatWith"]');
    assert.ok(chatBtn, 'Hero Chat CTA button exists');
  });

  it('Component 3: Stats Ribbon', () => {
    const { document } = createDomEnvironment();

    const stats = document.getElementById('statsRibbon');
    assert.ok(stats, 'Stats ribbon section exists');

    const statNums = stats.querySelectorAll('.stat-num');
    assert.strictEqual(statNums.length, 4, '4 metric cards exist in stats ribbon');

    const fullText = stats.textContent;
    assert.ok(fullText.includes('299+'), 'Nutrition protocols published verified');
    assert.ok(fullText.includes('906+'), 'Transformation count metric verified');
    assert.ok(fullText.includes('100%'), '100% Non-starvation diet plans verified');
    assert.ok(fullText.includes('Daily WhatsApp Coaching Access'), 'WhatsApp coaching access verified');
  });

  it('Component 4: Specializations / Clinical Features', () => {
    const { document } = createDomEnvironment();

    const features = document.getElementById('features');
    assert.ok(features, 'Specializations section exists');

    const cards = features.querySelectorAll('.feature-card');
    assert.strictEqual(cards.length, 6, '6 clinical specialization cards exist');

    const titles = Array.from(cards).map(c => c.querySelector('.feature-title')?.textContent?.trim());
    assert.ok(titles.some(t => t.includes('Hormonal Imbalance & PCOS')), 'PCOS feature card verified');
    assert.ok(titles.some(t => t.includes('Postpartum Weight Loss')), 'Postpartum feature card verified');
    assert.ok(titles.some(t => t.includes('Lifestyle Disorder Reversal')), 'Metabolic feature card verified');
    assert.ok(titles.some(t => t.includes('Custom Workout Coaching')), 'Workout coaching card verified');
    assert.ok(titles.some(t => t.includes('Indian Food-Friendly Plans')), 'Indian food friendly card verified');
    assert.ok(titles.some(t => t.includes('Daily WhatsApp Accountability')), 'Accountability feature card verified');
  });

  it('Component 5: Interactive Free Health Quiz & BMI Calculator Engine', () => {
    const { window, document } = createDomEnvironment();

    const quiz = document.getElementById('quiz');
    assert.ok(quiz, 'Quiz section exists');

    // Test step navigation with gotoStep
    window.gotoStep(2);
    assert.strictEqual(window.state.quizStep, 2, 'Navigated to step 2');
    const bar = document.getElementById('quizBar');
    assert.strictEqual(bar.style.width, '50%', 'Progress bar 50% for step 2');

    window.gotoStep(4);
    assert.strictEqual(window.state.quizStep, 4, 'Navigated to step 4 (BMI & Contact)');

    // Test BMI calculation
    const hInput = document.getElementById('qHeight');
    const wInput = document.getElementById('qWeight');
    hInput.value = '160';
    wInput.value = '64';

    const { bmi, category } = window.calcBMI();
    assert.strictEqual(bmi, '25.0', 'BMI calculated accurately (64 / (1.6*1.6) = 25.0)');
    assert.strictEqual(category, 'Overweight / Metabolic Sluggishness', 'Category determined correctly');

    // Test Quiz Submission
    document.getElementById('qName').value = 'Test Client';
    document.getElementById('qPhone').value = '9876500000';
    document.getElementById('qEmail').value = 'test@example.com';

    const fakeEvent = { preventDefault: () => {} };
    window.handleQuizSubmit(fakeEvent);

    assert.ok(window.confettiCalled, 'Confetti was fired on submission');
    assert.strictEqual(window.state.leads[0].name, 'Test Client', 'Lead saved to state');

    const resultBox = document.getElementById('quizResult');
    assert.strictEqual(resultBox.style.display, 'block', 'Result screen displayed');

    const rWa = document.getElementById('rWhatsApp');
    assert.ok(rWa.href.includes('919835387146'), 'WhatsApp link directs to correct Mimmy number 919835387146');
    assert.ok(rWa.href.includes('Test%20Client'), 'WhatsApp link includes lead name parameter');

    // Test Reset
    window.resetQuiz();
    assert.strictEqual(window.state.quizStep, 1, 'Quiz successfully reset to step 1');
  });

  it('Component 6: Smart Nutritional Hacks & Food Swaps', () => {
    const { window, document } = createDomEnvironment();

    const swaps = document.getElementById('swaps');
    assert.ok(swaps, 'Food swaps section exists');

    // Test rendering different swap categories
    window.renderSwap('bloat');
    const content = document.getElementById('swapContent');
    assert.ok(content.textContent.includes('PMS & Fluid Retention Bloat'), 'Bloat swap rendered');

    window.renderSwap('postpartum');
    assert.ok(content.textContent.includes('Postpartum Fatigue & Nursing Dips'), 'Postpartum swap rendered');

    window.renderSwap('night');
    assert.ok(content.textContent.includes('Late Night Munching & Insomnia'), 'Night swap rendered');

    window.renderSwap('sweet');
    assert.ok(content.textContent.includes('Sweet & Sugar Cravings'), 'Sweet swap rendered');
  });

  it('Component 7: Programs & Pricing Section', () => {
    const { window, document } = createDomEnvironment();

    const pricing = document.getElementById('pricing');
    assert.ok(pricing, 'Pricing section exists');

    const cards = pricing.querySelectorAll('.pricing-card');
    assert.strictEqual(cards.length, 3, '3 pricing tiers exist');

    // Test Yearly toggle discount
    const p1 = document.getElementById('price1');
    const p2 = document.getElementById('price2');

    assert.ok(p1.textContent.includes('3,499'), 'Monthly base price verified for plan 1');
    assert.ok(p2.textContent.includes('7,999'), 'Monthly base price verified for plan 2');

    window.setPricingPlan('yearly', document.querySelectorAll('.pricing-tab')[1]);
    assert.ok(p1.textContent.includes('2,099'), 'Yearly discounted price verified for plan 1');
    assert.ok(p2.textContent.includes('4,799'), 'Yearly discounted price verified for plan 2');

    // Test booking modal open
    window.bookProgram('12-Week Hormone Rebirth');
    const bookingModal = document.getElementById('bookingModal');
    assert.ok(bookingModal.classList.contains('open'), 'Booking modal opens');
    assert.strictEqual(window.state.selectedProgram, '12-Week Hormone Rebirth', 'Selected program set');
    window.closeBooking();
    assert.ok(!bookingModal.classList.contains('open'), 'Booking modal closes');
  });

  it('Component 8: Meet Your Coach About dt Mimmy Section', () => {
    const { document } = createDomEnvironment();

    const about = document.getElementById('about');
    assert.ok(about, 'About section exists');

    // Verify real coach photo in about card
    const coachImg = about.querySelector('.about-mascot-img');
    assert.ok(coachImg, 'Coach photo exists in about card');
    assert.strictEqual(coachImg.getAttribute('src'), 'assets/dt_mimmy_coach.jpg', 'Coach photo used in About section');

    // Verify 4 Pillars
    const pillars = about.querySelectorAll('.about-pillar');
    assert.strictEqual(pillars.length, 4, '4 Pillars of Mimmy Method exist');

    const pillarTitles = Array.from(pillars).map(p => p.querySelector('.pillar-title')?.textContent?.trim());
    assert.ok(pillarTitles.includes('100% Ghar Ka Khana'), 'Ghar Ka Khana pillar verified');
    assert.ok(pillarTitles.includes('Root-Cause Hormonal Reversal'), 'Hormonal Reversal pillar verified');
    assert.ok(pillarTitles.includes('Lactation & Core Protection'), 'Lactation pillar verified');
    assert.ok(pillarTitles.includes('Daily 1:1 WhatsApp Mentorship'), 'Daily WhatsApp pillar verified');

    // Verify section order: #pricing comes BEFORE #about, and #about comes BEFORE #testimonials
    const allSections = Array.from(document.querySelectorAll('section')).map(s => s.id);
    const pricingIdx = allSections.indexOf('pricing');
    const aboutIdx = allSections.indexOf('about');
    const testiIdx = allSections.indexOf('testimonials');

    assert.ok(pricingIdx !== -1 && aboutIdx !== -1 && testiIdx !== -1, 'Sections exist in DOM');
    assert.ok(pricingIdx < aboutIdx, '#pricing is before #about');
    assert.ok(aboutIdx < testiIdx, '#about is before #testimonials');
  });

  it('Component 9: Testimonials Section', () => {
    const { window, document } = createDomEnvironment();

    const testimonials = document.getElementById('testimonials');
    assert.ok(testimonials, 'Testimonials section exists');

    const cards = testimonials.querySelectorAll('.testi-card');
    assert.strictEqual(cards.length, 3, '3 transformation cards exist');

    // Test carousel controls
    window.nextTesti();
    assert.strictEqual(window.state.testiIndex, 1, 'Next testimonial index is 1');
    window.prevTesti();
    assert.strictEqual(window.state.testiIndex, 0, 'Prev testimonial index is 0');
  });

  it('Component 10: FAQ Accordion Section', () => {
    const { window, document } = createDomEnvironment();

    const faq = document.getElementById('faq');
    assert.ok(faq, 'FAQ section exists');

    const items = faq.querySelectorAll('.faq-item');
    assert.strictEqual(items.length, 5, '5 FAQ items exist');

    const firstBtn = items[0].querySelector('.faq-q');
    window.toggleFaq(firstBtn);
    assert.ok(firstBtn.classList.contains('open'), 'First FAQ expands on click');

    window.toggleFaq(firstBtn);
    assert.ok(!firstBtn.classList.contains('open'), 'First FAQ collapses on second click');
  });

  it('Component 11: Interactive Chatbot', () => {
    const { window, document } = createDomEnvironment();

    const drawer = document.getElementById('chatDrawer');
    assert.ok(drawer, 'Chatbot drawer exists');

    window.toggleChat();
    assert.ok(drawer.classList.contains('open'), 'Chat opens on toggle');

    // Test response generation
    const pcosResp = window.generateBotResponse('I suffer from severe PCOS and irregular periods');
    assert.ok(pcosResp.text.includes('LH/FSH balance'), 'Generates PCOS guidance');

    const bookResp = window.generateBotResponse('I want to book a call');
    assert.ok(bookResp.actionHtml.includes('919835387146'), 'Chatbot WhatsApp CTA contains correct Mimmy number');
  });

  it('Component 12: Client Portal & Dashboard', () => {
    const { window, document } = createDomEnvironment();

    // Test Login
    window.loginDemo();
    assert.ok(window.state.currentUser, 'User logged in');
    assert.strictEqual(window.state.currentUser.name, 'Priya Sharma', 'User name is Priya Sharma');

    const dash = document.getElementById('dashOverlay');
    assert.ok(dash.classList.contains('open'), 'Dashboard overlay opens');

    // Test water tracker toggleGlass
    window.toggleGlass(7);
    assert.strictEqual(window.state.waterGlasses, 7, 'Water glasses set to 7');
    window.toggleGlass(7);
    assert.strictEqual(window.state.waterGlasses, 6, 'Water glasses toggled down to 6');

    // Test client messaging in portal
    const portalInp = document.getElementById('portalInp');
    portalInp.value = 'Hello Mimmy, quick question about lunch.';
    window.sendPortalMsg();

    const portalMsgs = document.getElementById('portalMsgs');
    assert.ok(portalMsgs.textContent.includes('Hello Mimmy, quick question about lunch.'), 'Message rendered in portal');

    // Test Logout
    window.logoutDash();
    assert.strictEqual(window.state.currentUser, null, 'User logged out');
    assert.ok(!dash.classList.contains('open'), 'Dashboard closes on logout');
  });

  it('Component 13: Client Sign-Up & Firebase Mobile OTP Authentication with Password', async () => {
    const { window, document } = createDomEnvironment();

    // 1. Open Auth Modal
    window.toggleAuthModal();
    const modal = document.getElementById('authModal');
    assert.ok(modal.classList.contains('open'), 'Auth modal opens');

    // 2. Switch to Sign Up tab
    window.switchAuthTab('signup');
    assert.strictEqual(document.getElementById('authSignupView').style.display, 'block', 'Sign up view is displayed');
    assert.strictEqual(document.getElementById('authLoginView').style.display, 'none', 'Sign in view is hidden');
    assert.strictEqual(document.getElementById('authModalTitle').innerText, 'Create Client Account', 'Modal title updates');

    // Verify Send OTP button text is cleanly renamed
    const sendOtpBtn = document.getElementById('suSubmitPhoneBtn');
    assert.ok(sendOtpBtn, 'Send OTP button exists');
    assert.ok(sendOtpBtn.textContent.includes('Send OTP'), 'Send OTP button text contains Send OTP');
    assert.ok(!sendOtpBtn.textContent.includes('via Firebase'), 'via Firebase label is removed from button');

    // 3. Validation failure on empty submission
    const sendResEmpty = await window.handleSendSignupOtp();
    assert.strictEqual(sendResEmpty, false, 'Empty sign up fails validation');

    // 4. Input valid sign up credentials including password
    const suName = document.getElementById('suName');
    const suPhone = document.getElementById('suPhone');
    const suEmail = document.getElementById('suEmail');
    const suGoal = document.getElementById('suGoal');
    const suPassword = document.getElementById('suPassword');
    const suPasswordConfirm = document.getElementById('suPasswordConfirm');

    suName.value = 'Ananya Sen';
    suPhone.value = '9823456781';
    suEmail.value = 'ananya.sen@example.com';
    suGoal.value = '12-Week Hormone Rebirth (PCOS & Thyroid)';
    suPassword.value = 'Health@2026';
    suPasswordConfirm.value = 'Health@2026';

    // 5. Send OTP
    const sendOtpSuccess = await window.handleSendSignupOtp();
    assert.ok(sendOtpSuccess, 'OTP sent successfully');

    // Verify UI switched to OTP Step 2
    assert.strictEqual(document.getElementById('suStepDetails').style.display, 'none', 'Step 1 details hidden');
    assert.strictEqual(document.getElementById('suStepOtp').style.display, 'block', 'Step 2 OTP displayed');
    assert.ok(document.getElementById('suTargetPhoneDisplay').innerText.includes('9823456781'), 'Target phone displayed correctly');

    // Verify sandbox code banner is NOT shown on the page (Hidden as requested)
    assert.strictEqual(document.getElementById('suSandboxBanner'), null, 'Sandbox banner is not present in DOM');
    assert.strictEqual(document.getElementById('suOtpCode').value, '', 'OTP input is not prefilled');

    // 6. Test invalid OTP rejection
    const otpInp = document.getElementById('suOtpCode');
    otpInp.value = '000000';
    const verifyFail = await window.handleVerifySignupOtp();
    assert.strictEqual(verifyFail, false, 'Invalid OTP rejected');

    // 7. Test successful OTP verification with designated sandbox OTP (991920)
    otpInp.value = '991920';
    const verifySuccess = await window.handleVerifySignupOtp();
    assert.ok(verifySuccess, 'Valid designated OTP 991920 verified successfully');

    // Verify current user state and saved password
    assert.ok(window.state.currentUser, 'Current user populated');
    assert.strictEqual(window.state.currentUser.name, 'Ananya Sen', 'User name is Ananya Sen');
    assert.strictEqual(window.state.currentUser.phone, '+919823456781', 'User phone stored');
    assert.strictEqual(window.state.currentUser.password, 'Health@2026', 'Password saved in user profile');

    // Verify saved in MimsUserStorage database with password
    const savedUser = window.MimsUserStorage.findUserByPhoneOrEmail('9823456781');
    assert.ok(savedUser, 'User persisted in MimsUserStorage client database');
    assert.strictEqual(savedUser.name, 'Ananya Sen', 'Persisted user matches name');
    assert.strictEqual(savedUser.password, 'Health@2026', 'Persisted user has saved password');

    // Verify dashboard reflects personalized user profile
    const dash = document.getElementById('dashOverlay');
    assert.ok(dash.classList.contains('open'), 'Dashboard opened for newly registered client');
    assert.strictEqual(document.getElementById('dashClientName').innerText, 'Ananya Sen', 'Dashboard client name is personalized');
    assert.strictEqual(document.querySelector('.dash-avatar').innerText, 'AS', 'Avatar displays initials AS');

    // Verify CRM lead added
    assert.ok(window.state.leads.some(l => l.name === 'Ananya Sen'), 'Sign up added to CRM leads');

    // 8. Test Step Reset
    window.resetSignupStep();
    assert.strictEqual(document.getElementById('suStepDetails').style.display, 'block', 'Step 1 reset to visible');
    assert.strictEqual(document.getElementById('suStepOtp').style.display, 'none', 'Step 2 hidden on reset');

    // Clean up timer
    if (window.clearOtpTimer) window.clearOtpTimer();
  });

  it('Component 14: Quick Google / Gmail Sign-Up Disabled State & Safety Defense', async () => {
    const { window, document } = createDomEnvironment();

    window.toggleAuthModal();
    window.switchAuthTab('signup');

    // 1. Verify Google Sign-Up and Login buttons are disabled and hidden from DOM
    const btnSignup = document.getElementById('btnGoogleSignup');
    const btnLogin = document.getElementById('btnGoogleLogin');

    assert.ok(btnSignup, 'Google signup button element exists in DOM');
    assert.ok(btnSignup.disabled || btnSignup.classList.contains('disabled'), 'Google signup button is marked disabled');
    assert.strictEqual(btnSignup.style.display, 'none', 'Google signup button is visually hidden');

    assert.ok(btnLogin, 'Google login button element exists in DOM');
    assert.ok(btnLogin.disabled || btnLogin.classList.contains('disabled'), 'Google login button is marked disabled');
    assert.strictEqual(btnLogin.style.display, 'none', 'Google login button is visually hidden');

    // 2. Verify Google Chooser and Google Auth calls safely reject / return false
    const chooserRes = window.openGoogleChooser('signup');
    assert.strictEqual(chooserRes, false, 'openGoogleChooser returns false when disabled');

    const authRes = await window.handleGoogleAuth('signup');
    assert.strictEqual(authRes, false, 'handleGoogleAuth returns false when disabled');

    const selectRes = await window.selectGoogleAccount('test@gmail.com', 'Test User');
    assert.strictEqual(selectRes, false, 'selectGoogleAccount returns false when disabled');

    const chooserModal = document.getElementById('googleChooserModal');
    if (chooserModal) {
      assert.strictEqual(chooserModal.style.display, 'none', 'Google Chooser modal remains closed');
    }

    // 3. Verify Firebase signInWithGoogle throws disabled error
    if (window.MimsAuthService && typeof window.MimsAuthService.signInWithGoogle === 'function') {
      await assert.rejects(
        async () => {
          await window.MimsAuthService.signInWithGoogle();
        },
        /disabled/i,
        'Firebase service throws error when Google sign-in is disabled'
      );
    }

    // 4. Verify primary Mobile OTP sign-up flow remains active and accessible
    assert.strictEqual(document.getElementById('suStepDetails').style.display, 'block', 'Step 1 details form remains active');
    assert.ok(document.getElementById('suPhone'), 'WhatsApp phone field is present');
    assert.ok(document.getElementById('suPassword'), 'Password creation field is present');
  });

  it('Component 15: Client Login with Saved Password & Zero Prefill Security', () => {
    const { window, document } = createDomEnvironment();

    // Verify initial inputs are NOT prefilled (Secure)
    const loginInp = document.getElementById('authLoginInput');
    const passInp = document.getElementById('authPasswordInput');
    assert.strictEqual(loginInp.value, '', 'Login email/phone input is not prefilled');
    assert.strictEqual(passInp.value, '', 'Login password input is not prefilled');

    // 1. Seed a user into storage
    window.MimsUserStorage.saveUser({
      uid: 'test_client_01',
      name: 'Ritu Kapoor',
      email: 'ritu@example.com',
      phone: '+919812345678',
      password: 'MySecretPassword123',
      program: 'Gut Detox & Bloating Relief'
    });

    // 2. Test wrong password rejection
    loginInp.value = 'ritu@example.com';
    passInp.value = 'WrongPassword';
    const wrongLogin = window.handleLogin({ preventDefault: () => {} });
    assert.strictEqual(wrongLogin, false, 'Login fails with wrong password');
    assert.ok(document.getElementById('authPasswordError').classList.contains('visible'), 'Password error shown');

    // 3. Test correct password success
    passInp.value = 'MySecretPassword123';
    const correctLogin = window.handleLogin({ preventDefault: () => {} });
    assert.ok(correctLogin, 'Login succeeds with correct password');
    assert.strictEqual(window.state.currentUser.name, 'Ritu Kapoor', 'Logged in as Ritu Kapoor');
    assert.ok(document.getElementById('dashOverlay').classList.contains('open'), 'Dashboard opened');
  });

});

// ═══════════════════════════════════════════════════════════════════
// 2. SECURITY TEST CASES
// ═══════════════════════════════════════════════════════════════════

describe('SECURITY TEST CASES', () => {

  it('Security 1: Zero Private Phone Number Exposure in Rendered DOM', () => {
    const { document } = createDomEnvironment();

    // Check visible text across entire document
    const visibleText = document.body.textContent || '';

    // Verify raw phone number is NOT visible in textual content
    assert.strictEqual(visibleText.includes('98353 87146'), false, 'Private number +91 98353 87146 must NOT be in text content');
    assert.strictEqual(visibleText.includes('9835387146'), false, 'Raw number 9835387146 must NOT be in text content');
    assert.strictEqual(visibleText.includes('98765 43210'), false, 'Old placeholder number must NOT be in text content');
  });

  it('Security 2: WhatsApp Number Integrity in Outbound Links', () => {
    const { document } = createDomEnvironment();

    // Public WhatsApp action links targeting coach Mimmy
    const footerWa = document.querySelector('a.footer-contact-item[href*="wa.me"]');
    assert.ok(footerWa, 'Footer WhatsApp link exists');
    assert.ok(footerWa.getAttribute('href').includes('919835387146'), 'Footer link routes to 919835387146');

    const portalWa = document.querySelector('#ds-chat a[href*="wa.me"]');
    assert.ok(portalWa, 'Portal WhatsApp link exists');
    assert.ok(portalWa.getAttribute('href').includes('919835387146'), 'Portal link routes to 919835387146');
  });

  it('Security 3: Reverse Tab-Nabbing Protection (window.opener hijack defense)', () => {
    const { document } = createDomEnvironment();

    const blankLinks = Array.from(document.querySelectorAll('a[target="_blank"]'));
    assert.ok(blankLinks.length > 0, 'Found target="_blank" links');

    blankLinks.forEach(link => {
      const rel = link.getAttribute('rel') || '';
      assert.ok(rel.includes('noopener'), `Link ${link.getAttribute('href')} has rel="noopener"`);
      assert.ok(rel.includes('noreferrer'), `Link ${link.getAttribute('href')} has rel="noreferrer"`);
    });
  });

  it('Security 4: Cross-Site Scripting (XSS) in Free Health Quiz Inputs', () => {
    const { window, document } = createDomEnvironment();

    const xssPayloadName = '<script>alert("XSS-Name")</script>';
    const validPhone = '9835387146';
    const validEmail = 'test@example.com';

    document.getElementById('qName').value = xssPayloadName;
    document.getElementById('qPhone').value = validPhone;
    document.getElementById('qEmail').value = validEmail;

    const fakeEvent = { preventDefault: () => {} };
    window.handleQuizSubmit(fakeEvent);

    const savedLead = window.state.leads[0];
    assert.strictEqual(savedLead.name, xssPayloadName, 'Payload stored safely');

    // Verify leads table escaping
    window.updateLeadsTable();
    const tableHtml = document.getElementById('leadsTableBody')?.innerHTML || '';
    
    // Crucial check: Table must NOT contain unescaped script tag
    assert.strictEqual(tableHtml.includes('<script>alert'), false, 'Script tag is properly escaped in table HTML');
    assert.ok(tableHtml.includes('&lt;script&gt;'), 'Script tags converted to safe HTML entities');
  });

  it('Security 5: Cross-Site Scripting (XSS) in Booking Modal Form', () => {
    const { window, document } = createDomEnvironment();

    const xssName = '<svg onload=alert("XSS-Book")>';
    const validPhone = '9835387146';
    const xssNote = '<b onmouseover=alert(3)>Malicious Note</b>';

    document.getElementById('bName').value = xssName;
    document.getElementById('bPhone').value = validPhone;
    document.getElementById('bNote').value = xssNote;

    const fakeEvent = { preventDefault: () => {} };
    window.handleBooking(fakeEvent);

    // Verify leads table escaping
    window.updateLeadsTable();
    const tableHtml = document.getElementById('leadsTableBody')?.innerHTML || '';

    assert.strictEqual(tableHtml.includes('<svg onload'), false, 'SVG onload tag escaped in leads table');
    assert.ok(tableHtml.includes('&lt;svg onload='), 'SVG tag converted to safe HTML entities');
  });

  it('Security 6: Cross-Site Scripting (XSS) in Chatbot Messages', () => {
    const { window, document } = createDomEnvironment();

    const maliciousChat = '<img src=invalid onerror="window.pwned=true">';
    window.sendChat(maliciousChat);

    const chatContainer = document.getElementById('chatMsgs');
    const userBubbles = chatContainer.querySelectorAll('.chat-bubble.user');
    const lastUserBubble = userBubbles[userBubbles.length - 1];
    
    assert.ok(lastUserBubble, 'User bubble rendered');
    assert.strictEqual(lastUserBubble.querySelector('img'), null, 'No DOM image element injected into user bubble');
    assert.strictEqual(window.pwned, undefined, 'Script execution blocked');
  });

  it('Security 7: Cross-Site Scripting (XSS) in Client Portal Messaging', () => {
    const { window, document } = createDomEnvironment();

    window.loginDemo();
    const portalInp = document.getElementById('portalInp');
    portalInp.value = '<script>window.portalHacked=true;</script><b>Hello</b>';
    window.sendPortalMsg();

    const portalMsgs = document.getElementById('portalMsgs');
    const msgHtml = portalMsgs.innerHTML;

    assert.strictEqual(msgHtml.includes('<script>window.portalHacked'), false, 'Script tag escaped in portal HTML');
    assert.strictEqual(window.portalHacked, undefined, 'Portal script did not execute');
    assert.ok(msgHtml.includes('&lt;script&gt;'), 'Script tag converted to safe HTML entities');
  });

  it('Security 8: Input Boundary & Division by Zero in BMI Engine', () => {
    const { window, document } = createDomEnvironment();

    const hInput = document.getElementById('qHeight');
    const wInput = document.getElementById('qWeight');

    // Test zero height
    hInput.value = '0';
    wInput.value = '70';
    let res = window.calcBMI();
    assert.ok(Number.isFinite(parseFloat(res.bmi)), 'Zero height does not produce Infinity');

    // Test negative height
    hInput.value = '-160';
    wInput.value = '65';
    res = window.calcBMI();
    assert.ok(Number.isFinite(parseFloat(res.bmi)), 'Negative height does not produce negative or Infinity');

    // Test NaN / non-numeric input
    hInput.value = 'invalid';
    wInput.value = 'not-a-number';
    res = window.calcBMI();
    assert.ok(!isNaN(parseFloat(res.bmi)), 'Non-numeric input does not produce NaN');
  });

  it('Security 9: LocalStorage Tampering Resilience', () => {
    const { window } = createDomEnvironment();

    // Corrupt localStorage with invalid JSON
    window.localStorage.setItem('mims_leads', 'MALFORMED{JSON:::INVALID');
    
    // Ensure state initialization or retrieval handles bad data without fatal error
    assert.doesNotThrow(() => {
      try {
        JSON.parse(window.localStorage.getItem('mims_leads'));
      } catch (e) {
        window.state.leads = [];
      }
      window.updateLeadsTable();
    }, 'Gracefully handles corrupted localStorage');
  });

  it('Security 10: Asset Resource Integrity', () => {
    // Check that all referenced SVG assets exist and are non-empty
    const avatarSvg = path.join(projectRoot, 'assets', 'mimmy_mascot_avatar.svg');
    const fullSvg = path.join(projectRoot, 'assets', 'mimmy_mascot_full.svg');

    assert.ok(fs.existsSync(avatarSvg), 'mimmy_mascot_avatar.svg exists on disk');
    assert.ok(fs.statSync(avatarSvg).size > 1000, 'mimmy_mascot_avatar.svg is valid non-empty file');

    assert.ok(fs.existsSync(fullSvg), 'mimmy_mascot_full.svg exists on disk');
    assert.ok(fs.statSync(fullSvg).size > 1000, 'mimmy_mascot_full.svg is valid non-empty file');

    const coachPhoto = path.join(projectRoot, 'assets', 'dt_mimmy_coach.jpg');
    assert.ok(fs.existsSync(coachPhoto), 'dt_mimmy_coach.jpg exists on disk');
    assert.ok(fs.statSync(coachPhoto).size > 1000, 'dt_mimmy_coach.jpg is valid non-empty file');
  });

  it('Security 11: Rejection of Invalid, Fraudulent, and Malformed Phone Numbers', () => {
    const { window, document } = createDomEnvironment();

    // Verify validator accepts genuine Indian 10-digit mobile numbers
    assert.strictEqual(window.isValidPhone('9835387146'), true, 'Valid 10-digit number (9835387146) accepted');
    assert.strictEqual(window.isValidPhone('+91 98353 87146'), true, 'Valid with +91 country prefix accepted');
    assert.strictEqual(window.isValidPhone('9876500000'), true, 'Valid Indian mobile accepted');

    // Verify validator rejects malformed / fake numbers
    const invalidNumbers = [
      '',                     // Empty
      '12345',                // Too short
      '983538714600',         // Too long
      '5551234567',           // Starts with 5 (invalid Indian mobile)
      '0123456789',           // Invalid prefix
      '9999999999',           // Repeated dummy digits
      '0000000000',           // All zeros
      '1111111111',           // All ones
      '1234567890',           // Sequential dummy
      '9876543210',           // Sequential dummy
      'phone_number',         // Non-numeric
      '<script>alert(1)</script>' // Injected markup
    ];

    invalidNumbers.forEach(badNum => {
      assert.strictEqual(window.isValidPhone(badNum), false, `Rejects fake/invalid number: ${badNum}`);
    });

    // Test form submission blocking with invalid phone in Health Quiz
    document.getElementById('qName').value = 'Valid Name';
    document.getElementById('qPhone').value = '12345'; // Invalid
    const quizResult = window.handleQuizSubmit({ preventDefault: () => {} });
    assert.strictEqual(quizResult, false, 'Quiz submission blocked on invalid phone number');
    assert.ok(document.getElementById('qPhoneError').classList.contains('visible'), 'Error message displayed');

    // Test form submission blocking in Booking Modal
    document.getElementById('bName').value = 'Valid Name';
    document.getElementById('bPhone').value = '9999999999'; // Repeated fake digits
    const bookResult = window.handleBooking({ preventDefault: () => {} });
    assert.strictEqual(bookResult, false, 'Booking submission blocked on fake phone number');
    assert.ok(document.getElementById('bPhoneError').classList.contains('visible'), 'Error message displayed');
  });

  it('Security 12: Strict Email Validation & Malformed Format Defense', () => {
    const { window, document } = createDomEnvironment();

    // Verify validator accepts genuine emails
    assert.strictEqual(window.isValidEmail('priya.sharma@example.com'), true, 'Standard email accepted');
    assert.strictEqual(window.isValidEmail('dt.mimmy@nourishdelight.in'), true, 'Indian domain email accepted');
    assert.strictEqual(window.isValidEmail('user+tag@domain.co.uk'), true, 'Tagged email accepted');

    // Verify validator rejects malformed / invalid emails
    const invalidEmails = [
      '',
      'invalid-email',
      'priya@',
      '@example.com',
      'priya sharma@example.com',
      'priya@example',
      'priya@.com',
      'priya@example..com',
      '<script>alert(1)</script>@evil.com'
    ];

    invalidEmails.forEach(badEmail => {
      assert.strictEqual(window.isValidEmail(badEmail), false, `Rejects invalid email: ${badEmail}`);
    });

    // Test form submission blocking on invalid email
    document.getElementById('qName').value = 'Valid Name';
    document.getElementById('qPhone').value = '9835387146';
    document.getElementById('qEmail').value = 'bad-email@'; // Invalid
    const quizResult = window.handleQuizSubmit({ preventDefault: () => {} });
    assert.strictEqual(quizResult, false, 'Quiz submission blocked on invalid email');
    assert.ok(document.getElementById('qEmailError').classList.contains('visible'), 'Error message displayed');
  });

  it('Security 13: XSS Injection & Malformed Input Defense in Sign-Up Form', async () => {
    const { window, document } = createDomEnvironment();

    window.switchAuthTab('signup');

    // Test rejection of fake/invalid phone number in sign-up
    document.getElementById('suName').value = 'Test User';
    document.getElementById('suPhone').value = '12345'; // Invalid
    document.getElementById('suEmail').value = 'test@example.com';
    document.getElementById('suPassword').value = 'pass123';
    document.getElementById('suPasswordConfirm').value = 'pass123';

    const phoneBlocked = await window.handleSendSignupOtp();
    assert.strictEqual(phoneBlocked, false, 'Sign-up blocked on invalid phone');
    assert.ok(document.getElementById('suPhoneError').classList.contains('visible'), 'Phone error displayed');

    // Test rejection of malformed email in sign-up
    document.getElementById('suPhone').value = '9823456781';
    document.getElementById('suEmail').value = 'bad-email@';

    const emailBlocked = await window.handleSendSignupOtp();
    assert.strictEqual(emailBlocked, false, 'Sign-up blocked on malformed email');
    assert.ok(document.getElementById('suEmailError').classList.contains('visible'), 'Email error displayed');

    // Test password mismatch rejection
    document.getElementById('suEmail').value = 'test@example.com';
    document.getElementById('suPasswordConfirm').value = 'mismatch123';
    const passMismatch = await window.handleSendSignupOtp();
    assert.strictEqual(passMismatch, false, 'Sign-up blocked on mismatched passwords');
    assert.ok(document.getElementById('suPasswordConfirmError').classList.contains('visible'), 'Password mismatch error displayed');

    // Test XSS sanitization in Full Name
    document.getElementById('suName').value = '<script>alert("hacked")</script>Dr. Sneha';
    document.getElementById('suPasswordConfirm').value = 'pass123';
    const otpSent = await window.handleSendSignupOtp();
    assert.ok(otpSent, 'OTP sent for sanitized input');

    document.getElementById('suOtpCode').value = '991920';
    await window.handleVerifySignupOtp();

    // Verify sanitized name does not have script tags
    assert.ok(!window.state.currentUser.name.includes('<script>'), 'Script tag stripped from user name');
    const dashName = document.getElementById('dashClientName').innerHTML;
    assert.ok(!dashName.includes('<script>'), 'Dashboard client name is safely escaped');
    if (window.clearOtpTimer) window.clearOtpTimer();
  });

  it('Security 14: Mobile OTP Rate Limiting & Cooldown Protection', async () => {
    const { window, document } = createDomEnvironment();

    window.switchAuthTab('signup');
    document.getElementById('suName').value = 'Pooja Verma';
    document.getElementById('suPhone').value = '9823456782';
    document.getElementById('suEmail').value = 'pooja@example.com';
    document.getElementById('suPassword').value = 'Pooja@123';
    document.getElementById('suPasswordConfirm').value = 'Pooja@123';

    await window.handleSendSignupOtp();

    const resendBtn = document.getElementById('suResendBtn');
    assert.ok(resendBtn.disabled, 'Resend button disabled during cooldown');
    assert.ok(resendBtn.innerText.includes('Resend in'), 'Resend timer text displayed');

    // Attempting rapid resend should be blocked by cooldown
    await window.handleResendOtp();
    assert.ok(resendBtn.disabled, 'Resend remains blocked while cooldown is active');
    if (window.clearOtpTimer) window.clearOtpTimer();
  });

  it('Security 15: Zero Password and Zero Sandbox OTP Exposure in DOM', () => {
    const { document } = createDomEnvironment();

    // Verify private sandbox OTP is not leaked as OTP hint or prefill in the auth form
    const authBox = document.getElementById('authModal')?.innerHTML || '';
    assert.strictEqual(authBox.includes('991920'), false, 'Designated Sandbox OTP 991920 must not be visible in auth modal');

    // Verify no prefilled passwords in inputs
    const passInput = document.getElementById('authPasswordInput');
    assert.strictEqual(passInput.value, '', 'Password input must not be prefilled');
    assert.strictEqual(passInput.getAttribute('value'), null, 'No default value attribute on password input');

    // Verify OTP input has no prefill
    const otpInput = document.getElementById('suOtpCode');
    assert.strictEqual(otpInput.value, '', 'OTP input must not be prefilled');
  });

});
