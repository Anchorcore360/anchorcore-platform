// ============================================
// RRTA LEARNING PORTAL — SUPABASE CONNECTED V1
// ============================================
// IMPORTANT:
// 1) Replace YOUR_SUPABASE_PUBLISHABLE_KEY_HERE below with the Publishable key
//    from Supabase > Settings > API Keys.
// 2) Never use a secret/service_role key in this browser file.

const SUPABASE_URL = "https://qgbpotjqggeodxqcwkgj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_J1yPM1Hi7INCX2m7rp3PdA_JdQ46FRS";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const QUESTIONS = [{"id": 1, "category": "ARRIVE", "q": "When does an engineer begin representing the company during a customer visit?", "options": ["When they introduce themselves", "When they enter the property", "From the point they arrive at the location", "When the work begins"], "correct": 2, "image": null}, {"id": 2, "category": "ARRIVE", "q": "You arrive 15 minutes early for an appointment. What is the most appropriate approach?", "options": ["Knock immediately because the customer is expecting you", "Consider the appointment time and avoid unnecessarily inconveniencing the customer", "Wait until exactly the appointment time regardless of circumstances", "Contact your supervisor before approaching the property"], "correct": 1, "image": "images/q02-arrival-parking.jpg"}, {"id": 3, "category": "ARRIVE", "q": "A customer opens the door and immediately asks you to come inside. What should you do first?", "options": ["Enter and explain the work once inside", "Introduce yourself, identify the company and confirm the purpose of the visit", "Ask where they want the equipment installed", "Bring your equipment inside before discussing the job"], "correct": 1, "image": "images/q03-customer-door.jpg"}, {"id": 4, "category": "ARRIVE", "q": "A customer says they do not need to see your identification because they were expecting an engineer. What is the best approach?", "options": ["Accept this because the customer has given permission", "Only show identification if company procedure specifically requires the customer to ask", "Continue to follow the normal identification and introduction process", "Ask the customer to confirm their identity instead"], "correct": 2, "image": null}, {"id": 5, "category": "ARRIVE", "q": "Which behaviour is most likely to affect the customer's first impression before you have spoken to them?", "options": ["The type of tools being carried", "How quickly the installation is completed", "Parking, appearance and behaviour when arriving", "The technical specification of the equipment"], "correct": 2, "image": "images/q05-first-impression.jpg"}, {"id": 6, "category": "ARRIVE", "q": "You cannot park directly outside the customer's house. What should primarily influence where you leave the vehicle?", "options": ["Being able to see it from the property", "Parking legally, safely and considerately", "Keeping walking distance to a minimum", "Ensuring your tools are close to the property"], "correct": 1, "image": null}, {"id": 7, "category": "ARRIVE", "q": "You arrive at the correct address, but the person answering cannot confirm any details about the scheduled work. What should you do?", "options": ["Enter because the address is correct", "Begin external preparation while they check", "Confirm that you are at the correct job and authorised to proceed before starting", "Ask to see their identification"], "correct": 2, "image": "images/q07-correct-address.jpg"}, {"id": 8, "category": "ARRIVE", "q": "An engineer's clothing is slightly dirty from their previous job but remains appropriate and serviceable. What is the most important consideration?", "options": ["Clothing must always look completely new", "The engineer should change before every customer visit", "Their overall appearance remains professional and suitable for entering the premises", "Appearance is irrelevant provided the work is completed correctly"], "correct": 2, "image": null}, {"id": 9, "category": "ARRIVE", "q": "The customer seems confused about why you have attended. What should you do first?", "options": ["Show them the job information on your phone", "Begin the work and explain as you go", "Clearly explain who you are and the purpose of the visit before proceeding", "Ask the customer to contact the provider"], "correct": 2, "image": "images/q09-confused-customer.jpg"}, {"id": 10, "category": "ARRIVE", "q": "Which best describes a professional arrival?", "options": ["Arrive, identify the work area and start promptly", "Arrive considerately, introduce yourself, confirm the customer and explain your purpose", "Arrive early, prepare equipment and minimise conversation", "Arrive on time and allow the customer to direct the visit"], "correct": 1, "image": null}, {"id": 11, "category": "CHECK", "q": "You arrive and only a 15-year-old is present. Their parent phones and gives permission for the installation. What should you do?", "options": ["Proceed because the parent has verbally authorised it", "Complete only work that does not require entering the property", "Follow company procedure regarding the absence of an appropriate responsible adult", "Ask the parent to confirm permission by text message"], "correct": 2, "image": "images/q11-minor-at-door.jpg"}, {"id": 12, "category": "CHECK", "q": "A customer appears to have difficulty understanding your explanation of the work. What should you do?", "options": ["Ask them to sign the job before starting", "Adapt your communication and make sure they understand before agreement is obtained", "Explain the work exactly as you would to any other customer", "Ask them whether someone else can make the decision"], "correct": 1, "image": "images/q12-communication-needs.jpg"}, {"id": 13, "category": "CHECK", "q": "You notice a crack in the wall immediately beside the proposed drilling position. What is the best first action?", "options": ["Select another drilling position", "Identify and record the existing damage and discuss it with the customer", "Ask the customer whether they caused the damage", "Proceed carefully because the damage already exists"], "correct": 1, "image": "images/q13-existing-wall-damage.jpg"}, {"id": 14, "category": "CHECK", "q": "The work area is cluttered with the customer's possessions. The installation itself appears straightforward. What should happen?", "options": ["Carefully move enough belongings to create a working area", "Ask the customer for permission before moving their belongings", "Ask the customer to make the work area suitably accessible", "Work around the belongings where reasonably possible"], "correct": 2, "image": "images/q14-cluttered-work-area.jpg"}, {"id": 15, "category": "CHECK", "q": "A large cabinet blocks the agreed installation position. The customer offers to help you move it. What is the most appropriate response?", "options": ["Move it together because the customer has volunteered", "Help only if it can be moved without lifting equipment", "Explain that the work area needs to be made accessible without you moving customer furniture", "Change the installation position instead"], "correct": 2, "image": "images/q15-cabinet-obstruction.jpg"}, {"id": 16, "category": "CHECK", "q": "You see what appears to be a used needle close to where you need to work. What should you do?", "options": ["Ask the customer to remove it and continue once it has gone", "Avoid touching it and work from the opposite side", "Wear appropriate gloves before moving it", "Stop, avoid contact and follow the appropriate escalation process"], "correct": 3, "image": "images/q16-used-needle.jpg"}, {"id": 17, "category": "CHECK", "q": "The customer has a dog loose in the room. They say it is friendly and has never bitten anyone. What should you do?", "options": ["Continue unless the dog becomes aggressive", "Ask for the animal to be secured away from the work area", "Continue provided the customer remains in the room", "Assess the dog's behaviour before deciding"], "correct": 1, "image": "images/q17-loose-dog.jpg"}, {"id": 18, "category": "CHECK", "q": "When should an engineer consider whether conditions at the property have changed?", "options": ["During the initial pre-work check", "Before drilling or using tools", "Throughout the visit as work and conditions develop", "Only if a new hazard becomes obvious"], "correct": 2, "image": null}, {"id": 19, "category": "CHECK", "q": "You completed your checks when you arrived. Thirty minutes later, circumstances in the work area have changed. What should you do?", "options": ["Continue because the initial check was satisfactory", "Record the change after completing the job", "Reconsider the risks before continuing", "Inform the customer but continue with the agreed work"], "correct": 2, "image": null}, {"id": 20, "category": "CHECK", "q": "A hazard does not directly affect your planned cable route but could affect you while accessing the work area. Is it relevant?", "options": ["No, because it is outside the installation route", "Yes, because safe access and the working environment form part of the assessment", "Only if the customer identifies it as a problem", "Only if it prevents the work being completed"], "correct": 1, "image": null}, {"id": 21, "category": "AGREE", "q": "When should the proposed cable route normally be agreed with the customer?", "options": ["After drilling positions have been identified", "Before installation work begins", "Once the internal equipment is positioned", "During completion and sign-off"], "correct": 1, "image": null}, {"id": 22, "category": "AGREE", "q": "The customer agrees the cable route but does not appear to understand where the internal equipment will be positioned. What should you do?", "options": ["Continue because the route has been agreed", "Position it where technically most appropriate", "Clarify the equipment position and obtain agreement before starting", "Record the position on the job before proceeding"], "correct": 2, "image": "images/q22-equipment-position.jpg"}, {"id": 23, "category": "AGREE", "q": "The technically easiest route is different from the route originally discussed. What should happen before changing it?", "options": ["Use the easier route if there is no additional risk", "Tell the customer after completing the installation", "Explain the proposed change and obtain appropriate agreement before proceeding", "Continue if the final appearance will be better"], "correct": 2, "image": "images/q23-route-change.jpg"}, {"id": 24, "category": "AGREE", "q": "A customer agrees to a revised cable route. However, you are unsure whether the change falls within your authority. What should you do?", "options": ["Continue because the customer has authorised it", "Stop and establish whether the revised work is authorised before continuing", "Complete the route if it can be installed safely", "Return to the original route without further discussion"], "correct": 1, "image": null}, {"id": 25, "category": "AGREE", "q": "Why is customer agreement alone not always sufficient to proceed with a requested change?", "options": ["Customers cannot alter an installation once work starts", "Engineers must always follow the original plan", "The request may still fall outside the engineer's authority or permitted scope", "Changes must always be authorised by a supervisor"], "correct": 2, "image": null}, {"id": 26, "category": "AGREE", "q": "A customer asks for equipment in a position that you believe may not be suitable. What is the best approach?", "options": ["Install it where requested because it is their property", "Explain the concern clearly and determine an appropriate agreed solution", "Install it in the position you consider technically correct", "Ask the customer to sign to accept responsibility"], "correct": 1, "image": "images/q26-unsuitable-location.jpg"}, {"id": 27, "category": "AGREE", "q": "Why should unnecessary technical jargon be avoided?", "options": ["Technical information should not be given to customers", "It makes the installation appear more complicated", "The customer needs to understand what is being proposed before agreeing", "Technical language should only be used between engineers"], "correct": 2, "image": null}, {"id": 28, "category": "AGREE", "q": "A customer says, \"Just put it wherever you think.\" What is the best response?", "options": ["Choose the easiest compliant position", "Ask them to sign the job before starting", "Explain the proposed location clearly and establish their agreement", "Choose the position that uses the least cable"], "correct": 2, "image": null}, {"id": 29, "category": "AGREE", "q": "Halfway through the work, the customer changes their mind about an agreed equipment position. What should happen first?", "options": ["Explain that it cannot now be changed", "Pause and discuss the implications before deciding whether work can continue", "Complete the original installation because agreement was already given", "Move the equipment if the customer accepts the additional work"], "correct": 1, "image": null}, {"id": 30, "category": "AGREE", "q": "Which statement best represents the AGREE stage?", "options": ["Customer preference determines how the installation is completed", "The engineer explains what they intend to do after completing checks", "The engineer explains the proposed work clearly and establishes agreement before proceeding", "Agreement is primarily evidence that the customer accepts responsibility"], "correct": 2, "image": null}, {"id": 31, "category": "PROTECT", "q": "Why should existing property damage be recorded before work begins?", "options": ["To establish whether the customer caused it", "To determine whether the installation should be cancelled", "To establish the property's pre-work condition and avoid later uncertainty", "To protect the engineer from all potential damage claims"], "correct": 2, "image": null}, {"id": 32, "category": "PROTECT", "q": "You need access behind a television cabinet. The customer says you may move it. What should you do?", "options": ["Move it because permission has been obtained", "Move it if another engineer assists", "Ask for the required work area to be made accessible in accordance with procedure", "Move only the items necessary to gain access"], "correct": 2, "image": null}, {"id": 33, "category": "PROTECT", "q": "A customer gives you their Wi-Fi password to configure equipment. How should that information be treated?", "options": ["Record it on the job notes in case another engineer needs it", "Use it only for the authorised purpose and protect the customer's privacy", "Store it temporarily until the installation has been signed off", "Ask the customer to change it after the visit"], "correct": 1, "image": null}, {"id": 34, "category": "PROTECT", "q": "You take a legitimate work photograph inside the customer's property. Which principle is most important?", "options": ["Include as much of the room as possible for context", "Keep a personal copy in case evidence is later required", "Capture only what is required and handle the image in accordance with authorised processes", "Ask the customer to take the photograph for you"], "correct": 2, "image": null}, {"id": 35, "category": "PROTECT", "q": "The customer offers you a £10 tip because they are pleased with the installation. What should determine your response?", "options": ["Whether accepting it could offend the customer", "The value of the tip", "The company's rules on gifts, tips and professional boundaries", "Whether the customer offers it after the job is signed off"], "correct": 2, "image": null}, {"id": 36, "category": "PROTECT", "q": "A customer offers cash for a small private job after you have finished the authorised work. What should you do?", "options": ["Accept if you are no longer working on company time", "Give them your personal contact details for later", "Politely decline and maintain appropriate professional boundaries", "Refer the customer to another engineer"], "correct": 2, "image": null}, {"id": 37, "category": "PROTECT", "q": "During installation, you accidentally mark the customer's wall. The mark is small and may not be noticed. What should you do?", "options": ["Attempt to clean or repair it before mentioning it", "Finish the installation and mention it during sign-off", "Be open about what happened and follow the appropriate reporting process", "Photograph it and wait to see whether the customer raises it"], "correct": 2, "image": "images/q37-property-damage.jpg"}, {"id": 38, "category": "PROTECT", "q": "Which is the strongest example of protecting the customer?", "options": ["Completing the job as quickly as possible", "Allowing them to make all decisions about the installation", "Protecting their safety, property, belongings, privacy and information throughout the visit", "Avoiding unnecessary conversation while working"], "correct": 2, "image": null}, {"id": 39, "category": "PROTECT", "q": "A customer asks why you are photographing an existing defect. What is the best response?", "options": ["It is required so the company is not blamed", "Explain professionally that you are recording the existing condition before work starts", "We photograph damage at every property", "Tell them photographs are required for insurance purposes"], "correct": 1, "image": null}, {"id": 40, "category": "PROTECT", "q": "Which principle should apply to customer information encountered during a visit?", "options": ["Information may be recorded if it could assist another engineer", "Information may be shared internally if it relates to the installation", "Customer information should only be accessed, used and recorded where appropriately required", "Information is acceptable to retain provided it is not shared externally"], "correct": 2, "image": null}, {"id": 41, "category": "COMMUNICATE", "q": "The installation is taking considerably longer than expected. When should the customer be informed?", "options": ["Once you know exactly how long the delay will be", "As soon as it becomes clear expectations are likely to change", "At the end of the job so you can give an accurate explanation", "Only if the customer asks why the work is taking longer"], "correct": 1, "image": null}, {"id": 42, "category": "COMMUNICATE", "q": "A customer complains about the service and is visibly frustrated. What is the most appropriate initial response?", "options": ["Explain why the situation has occurred", "Remain calm, listen and establish what their concern actually is", "Refer them immediately to customer services", "Explain what aspects of the issue are outside your control"], "correct": 1, "image": "images/q42-customer-complaint.jpg"}, {"id": 43, "category": "COMMUNICATE", "q": "A customer makes an unfair accusation about you. What should you do first?", "options": ["Correct the accusation so there is no misunderstanding", "Ask the customer to provide evidence", "Remain professional and avoid allowing the interaction to become confrontational", "End the visit because the working relationship has broken down"], "correct": 2, "image": null}, {"id": 44, "category": "COMMUNICATE", "q": "A customer raises their voice but you do not currently feel threatened. What is the best approach?", "options": ["Leave immediately whenever a customer raises their voice", "Continue working and avoid engaging with them", "Remain calm, assess the situation and communicate professionally while monitoring whether it escalates", "Tell them you will leave unless they calm down"], "correct": 2, "image": "images/q44-raised-voice.jpg"}, {"id": 45, "category": "COMMUNICATE", "q": "The customer's behaviour changes and you now feel personally threatened. What becomes the priority?", "options": ["De-escalating the customer before leaving", "Protecting the partially completed installation", "Your personal safety and appropriate withdrawal/escalation", "Obtaining evidence of the customer's behaviour"], "correct": 2, "image": "images/q45-personal-threat.jpg"}, {"id": 46, "category": "COMMUNICATE", "q": "While working alone, you become uncomfortable about activity outside the property around your vehicle. No direct threat has been made. What should you do?", "options": ["Continue until someone directly threatens you", "Ask the customer whether the area is normally safe", "Take the concern seriously, dynamically assess the situation and withdraw/escalate if necessary", "Finish the internal work but avoid returning to the vehicle alone"], "correct": 2, "image": null}, {"id": 47, "category": "COMMUNICATE", "q": "Why is communicating a delay early generally better than waiting until completion?", "options": ["It prevents the customer making a complaint", "It allows expectations to be managed as circumstances change", "It transfers responsibility for the delay to the customer", "It allows the customer to decide whether the work should continue"], "correct": 1, "image": null}, {"id": 48, "category": "COMMUNICATE", "q": "A customer asks a question and you do not know the answer. What is the most professional response?", "options": ["Give the most likely answer based on your experience", "Tell them it is outside your role", "Be clear that you are unsure and establish or escalate the correct information", "Suggest they search for the information after you leave"], "correct": 2, "image": null}, {"id": 49, "category": "COMMUNICATE", "q": "Which is the strongest approach when dealing with a complaint?", "options": ["Explain the company's position before the customer becomes more frustrated", "Avoid accepting responsibility until the facts are established", "Listen, remain professional, clarify the concern and follow the appropriate route for resolving or escalating it", "Refer complaints to a manager because engineers should not become involved"], "correct": 2, "image": null}, {"id": 50, "category": "COMMUNICATE", "q": "A customer asks you to do something you believe may be outside the authorised job scope. What should you do?", "options": ["Complete it if it is quick and technically straightforward", "Refuse because only listed work can ever be completed", "Establish whether the request is authorised before proceeding", "Complete it if the customer confirms the request in writing"], "correct": 2, "image": null}, {"id": 51, "category": "COMPLETE", "q": "The technical installation is complete. What should happen before leaving?", "options": ["Ask the customer to sign immediately so the job can be closed", "Pack the tools and allow the customer to inspect the work themselves", "Complete final checks, leave the area appropriately, demonstrate the work and confirm understanding", "Photograph the completed installation and leave once uploaded"], "correct": 2, "image": null}, {"id": 52, "category": "COMPLETE", "q": "The customer says they do not need you to demonstrate the completed work. What should you do?", "options": ["Leave because they have declined the demonstration", "Ensure the required completion information has still been appropriately communicated", "Ask them to sign that they refused a demonstration", "Demonstrate it regardless of their wishes"], "correct": 1, "image": null}, {"id": 53, "category": "COMPLETE", "q": "You finish the job but notice packaging and small pieces of cable on the floor. The customer says they will clean it later. What should you do?", "options": ["Leave it because the customer has agreed", "Leave the work area in an appropriate condition before departure", "Remove only waste that could create a hazard", "Ask the customer to confirm this on the job record"], "correct": 1, "image": "images/q53-messy-work-area.jpg"}, {"id": 54, "category": "COMPLETE", "q": "Why is the COMPLETE stage part of professional conduct rather than simply administration?", "options": ["It provides evidence that the engineer attended", "It allows outstanding work to be identified", "The final condition of the work area and the engineer's departure influence the customer's overall experience", "It transfers responsibility for the installation to the customer"], "correct": 2, "image": null}, {"id": 55, "category": "COMPLETE", "q": "You encounter a situation that is not specifically covered in your instructions and you are unsure whether you have authority to proceed. What is the best principle?", "options": ["Proceed if the work appears safe", "Use your experience to make the most reasonable decision", "Do not guess; make the situation safe and seek appropriate guidance/escalation", "Ask the customer which option they prefer"], "correct": 2, "image": null}, {"id": 56, "category": "COMPLETE", "q": "Which best describes STOP-WORK authority within this course?", "options": ["Work should stop whenever a customer becomes dissatisfied", "Only a supervisor can instruct an engineer to stop work", "An engineer should not continue where the circumstances are unsafe, inappropriate or outside appropriate authority", "Work should only stop where there is an immediate physical hazard"], "correct": 2, "image": null}, {"id": 57, "category": "COMPLETE", "q": "A situation is safe, but you believe the requested action is unauthorised. Should you continue?", "options": ["Yes, because safety is the main consideration", "Yes, if the customer gives permission", "Not until appropriate authority to proceed has been established", "Only if the requested work changes the installation"], "correct": 2, "image": null}, {"id": 58, "category": "COMPLETE", "q": "Which statement best represents professional judgement?", "options": ["Experienced engineers should resolve most issues without escalation", "Customer satisfaction should normally determine whether work continues", "Engineers should recognise the limits of their authority and escalate when appropriate", "Work should continue unless a clear safety rule has been breached"], "correct": 2, "image": null}, {"id": 59, "category": "COMPLETE", "q": "During completion, the customer raises a new concern about the cable route they previously agreed to. What should you do?", "options": ["Explain that the route was agreed before work started", "Ask them to raise the issue with customer services", "Listen to the concern and establish what action, if any, can appropriately be taken", "Change the route if doing so will prevent a complaint"], "correct": 2, "image": null}, {"id": 60, "category": "COMPLETE", "q": "Which statement best summarises the standard expected throughout a customer visit?", "options": ["Complete the technical work safely while following customer instructions", "Keep the customer satisfied while completing the work efficiently", "Act professionally, check the environment, agree the work, protect people and property, communicate and complete appropriately", "Follow the planned installation unless circumstances make it impossible"], "correct": 2, "image": null}];

const COURSE_CODE = "RRTA-CS001";
const COURSE_NAME = "Customer Service & Professional Conduct";
const PASS_MARK = 16;
const ASSESSMENT_SIZE = 20;
const DURATION = 20 * 60;
const BLUEPRINT = { ARRIVE:3, CHECK:4, AGREE:4, PROTECT:3, COMMUNICATE:3, COMPLETE:3 };

// Trainer remains a browser-only demo account for this stage.
// Learner login is now genuine Supabase authentication.
const TRAINER_DEMO = {
  id: "trainer-demo",
  role: "trainer",
  name: "RRTA Trainer",
  email: "trainer@rrta.demo",
  password: "Trainer123!"
};

const $ = id => document.getElementById(id);

let session = null;
let profile = null;
let currentAssignment = null;
let currentCourse = null;
let latestAttempt = null;

let exam = [];
let answers = [];
let qIndex = 0;
let secondsLeft = DURATION;
let timer = null;
let lastResult = null;

// -------------------------
// GENERAL UI
// -------------------------

function showScreen(name) {
  document.querySelectorAll(".screen").forEach(x => x.classList.remove("active"));
  const target = $("screen-" + name);
  if (target) target.classList.add("active");
  window.scrollTo(0, 0);
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[m]));
}

function fmtDate(s) {
  return s ? new Intl.DateTimeFormat("en-GB").format(new Date(s)) : "—";
}

function setHeaderUser(name, role) {
  $("headerUser").classList.remove("hidden");
  $("headerUser").textContent =
    `${name} · ${role === "trainer" ? "Trainer / Assessor" : "Learner"}`;
}

function clearHeaderUser() {
  $("headerUser").classList.add("hidden");
  $("headerUser").textContent = "";
}

function showLoginError(message = "Email or password not recognised.") {
  $("loginError").textContent = message;
  $("loginError").classList.remove("hidden");
}

function hideLoginError() {
  $("loginError").classList.add("hidden");
}

// -------------------------
// SUPABASE DATA
// -------------------------

async function loadLearnerData(userId) {
  const { data: profileData, error: profileError } = await db
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;
  profile = profileData;

  const { data: assignments, error: assignmentError } = await db
    .from("assignments")
    .select(`
      id,
      status,
      assigned_at,
      due_date,
      completed_at,
      course_id,
      courses (
        id,
        course_code,
        title,
        description,
        pass_mark,
        question_count,
        active
      )
    `)
    .eq("learner_id", userId)
    .order("assigned_at", { ascending: false });

  if (assignmentError) throw assignmentError;

  currentAssignment =
    assignments?.find(a => a.courses?.course_code === COURSE_CODE) || null;

  currentCourse = currentAssignment?.courses || null;

  const { data: attempts, error: attemptsError } = await db
    .from("assessment_attempts")
    .select("*")
    .eq("learner_id", userId)
    .order("completed_at", { ascending: false })
    .limit(20);

  if (attemptsError) throw attemptsError;

  latestAttempt =
    attempts?.find(a =>
      !currentCourse || Number(a.course_id) === Number(currentCourse.id)
    ) || null;

  return { assignments, attempts };
}

async function refreshLearner() {
  if (!session?.user?.id) return;
  await loadLearnerData(session.user.id);
  renderLearner();
}

// -------------------------
// AUTHENTICATION
// -------------------------

async function loginLearner(email, password) {
  const { data, error } = await db.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  session = data.session;
  await loadLearnerData(data.user.id);

  if (profile.role !== "learner") {
    await db.auth.signOut();
    session = null;
    profile = null;
    throw new Error("This account is not configured as a learner.");
  }

  setHeaderUser(profile.full_name, profile.role);
  renderLearner();
  showScreen("learner");
}

function loginTrainerDemo() {
  session = { demoTrainer: true };
  profile = TRAINER_DEMO;
  setHeaderUser(profile.name, "trainer");
  renderTrainerDemo();
  showScreen("trainer");
}

async function logout() {
  clearInterval(timer);

  if (session && !session.demoTrainer) {
    await db.auth.signOut();
  }

  session = null;
  profile = null;
  currentAssignment = null;
  currentCourse = null;
  latestAttempt = null;
  lastResult = null;

  clearHeaderUser();
  $("loginForm").reset();
  hideLoginError();
  showScreen("login");
}

document.querySelectorAll('[data-action="logout"]').forEach(b => {
  b.onclick = logout;
});

$("loginForm").onsubmit = async e => {
  e.preventDefault();
  hideLoginError();

  const email = $("loginEmail").value.trim().toLowerCase();
  const password = $("loginPassword").value;

  if (
    email === TRAINER_DEMO.email &&
    password === TRAINER_DEMO.password
  ) {
    loginTrainerDemo();
    return;
  }

  try {
    await loginLearner(email, password);
  } catch (err) {
    console.error(err);
    showLoginError("Email or password not recognised.");
  }
};

const trainerDemoButton = document.querySelector('[data-demo="trainer"]');
if (trainerDemoButton) {
  trainerDemoButton.onclick = () => {
    $("loginEmail").value = TRAINER_DEMO.email;
    $("loginPassword").value = TRAINER_DEMO.password;
  };
}

const learnerDemoButton = document.querySelector('[data-demo="learner"]');
if (learnerDemoButton) {
  learnerDemoButton.onclick = () => {
    $("loginEmail").value = "john.smith@rrta.demo";
    $("loginPassword").value = "Learner123!";
  };
}

// Restore a real learner session after refresh.
(async function restoreSession() {
  try {
    const { data } = await db.auth.getSession();
    if (!data.session) return;

    session = data.session;
    await loadLearnerData(data.session.user.id);

    if (profile?.role === "learner") {
      setHeaderUser(profile.full_name, profile.role);
      renderLearner();
      showScreen("learner");
    }
  } catch (err) {
    console.error("Session restore failed", err);
  }
})();

// -------------------------
// TRAINER DEMO
// -------------------------

function trainerView(name) {
  document.querySelectorAll(".trainer-view")
    .forEach(v => v.classList.remove("active"));

  const view = $("trainer-" + name);
  if (view) view.classList.add("active");

  document.querySelectorAll("[data-trainer-view]")
    .forEach(b =>
      b.classList.toggle("active", b.dataset.trainerView === name)
    );

  if (name === "learners") renderTrainerLearnersDemo();
  if (name === "results") renderTrainerResultsDemo();
}

document.querySelectorAll("[data-trainer-view]").forEach(b => {
  b.onclick = () => trainerView(b.dataset.trainerView);
});

function renderTrainerDemo() {
  $("trainerStats").innerHTML = `
    <div class="stat"><span>Learners</span><strong>1</strong></div>
    <div class="stat alert"><span>Assigned learning</span><strong>1</strong></div>
    <div class="stat"><span>Passed</span><strong>—</strong></div>
    <div class="stat"><span>Assessment attempts</span><strong>—</strong></div>
  `;

  $("recentActivity").innerHTML = `
    <p class="muted">
      Trainer authentication and live management will be connected to Supabase next.
      John Smith is now a genuine database-backed learner.
    </p>
  `;

  renderTrainerLearnersDemo();
  renderTrainerResultsDemo();
}

function renderTrainerLearnersDemo() {
  $("learnersTable").innerHTML = `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Learner</th>
            <th>Organisation</th>
            <th>Customer Service</th>
            <th>System</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>John Smith</strong><br>
              <small>john.smith@rrta.demo</small>
            </td>
            <td>RRTA</td>
            <td><span class="pill assigned">Assigned</span></td>
            <td><span class="pill pass">Supabase connected</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function renderTrainerResultsDemo() {
  $("resultsTable").innerHTML = `
    <p class="muted">
      Learner assessment results are now designed to save to Supabase.
      A real trainer account and trainer RLS permissions are the next stage.
    </p>
  `;
}

function openAssignDemo() {
  alert(
    "The trainer assignment screen is still in demo mode. " +
    "John Smith's assignment is already stored in Supabase."
  );
}

if ($("quickAssignBtn")) $("quickAssignBtn").onclick = openAssignDemo;
if ($("confirmAssign")) $("confirmAssign").onclick = openAssignDemo;
if ($("demoAddLearnerBtn")) {
  $("demoAddLearnerBtn").onclick = () =>
    alert("Real trainer user management will be connected to Supabase next.");
}
if ($("closeAssignModal")) {
  $("closeAssignModal").onclick = () =>
    $("assignModal").classList.add("hidden");
}

// -------------------------
// LEARNER DASHBOARD
// -------------------------

function renderLearner() {
  if (!profile) return;

  $("learnerWelcome").textContent = `Welcome, ${profile.full_name}`;

  if (!currentAssignment) {
    $("learnerDashboard").innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✓</div>
        <h2>No assessments assigned</h2>
        <p class="muted">
          You currently have no learning or assessments to complete.
          New assignments from your trainer will appear here.
        </p>
      </div>
    `;
    return;
  }

  let statusText = "Assigned";
  let pillClass = "assigned";

  if (latestAttempt) {
    statusText = latestAttempt.passed ? "Completed" : "Reassessment required";
    pillClass = latestAttempt.passed ? "pass" : "refer";
  }

  const title = currentCourse?.title || COURSE_NAME;
  const description =
    currentCourse?.description ||
    "Face-to-face course for field engineers with an online summative assessment.";

  $("learnerDashboard").innerHTML = `
    <div class="learning-grid">
      <article class="learning-card">
        <span class="pill ${pillClass}">${statusText}</span>

        <h2>${esc(title)}</h2>

        <p class="muted">${esc(description)}</p>

        <div class="learning-meta">
          <span>Face-to-face</span>
          <span>20-minute assessment</span>
          <span>80% pass mark</span>
        </div>

        ${latestAttempt ? `
          <p>
            <strong>Latest result:</strong>
            ${latestAttempt.score}% —
            ${latestAttempt.passed ? "PASS" : "REFER"}
          </p>
        ` : ""}

        <button class="btn primary" id="openCourseBtn">
          ${latestAttempt?.passed ? "View course" : "Open learning"}
        </button>
      </article>
    </div>
  `;

  $("openCourseBtn").onclick = () => {
    renderCourse();
    showScreen("course");
  };
}

function renderCourse() {
  let html = "";

  if (latestAttempt?.passed) {
    html = `
      <div class="course-action">
        <span class="pill pass">Assessment passed</span>
        <h3>Completed</h3>
        <p>
          You achieved ${latestAttempt.score}%.
          Your result is held in your learning record.
        </p>
        <button class="btn secondary" id="retakeDemo">
          Retake for development testing
        </button>
      </div>
    `;
  } else if (latestAttempt && !latestAttempt.passed) {
    html = `
      <div class="course-action">
        <span class="pill refer">Reassessment required</span>
        <h3>Speak to your trainer / assessor</h3>
        <p>
          Your latest score was ${latestAttempt.score}%.
          Further teaching should take place before reassessment.
        </p>
        <button class="btn primary" id="startCourseAssessment">
          Start reassessment
        </button>
      </div>
    `;
  } else {
    html = `
      <div class="course-action">
        <h3>Your assessment is ready</h3>
        <p>Begin only when instructed by your trainer / assessor.</p>
        <button class="btn primary" id="startCourseAssessment">
          Start assessment
        </button>
      </div>
    `;
  }

  $("courseAction").innerHTML = html;

  const start = $("startCourseAssessment");
  if (start) start.onclick = assessmentIntro;

  const retake = $("retakeDemo");
  if (retake) retake.onclick = assessmentIntro;
}

$("backToLearning").onclick = () => {
  renderLearner();
  showScreen("learner");
};

// -------------------------
// ASSESSMENT
// -------------------------

function assessmentIntro() {
  $("assessmentDeclaration").checked = false;
  $("beginAssessment").disabled = true;
  showScreen("assessment-intro");
}

$("assessmentDeclaration").onchange = e =>
  $("beginAssessment").disabled = !e.target.checked;

$("cancelAssessment").onclick = () => {
  renderCourse();
  showScreen("course");
};

$("beginAssessment").onclick = startAssessment;

function secureRandom(max) {
  if (window.crypto?.getRandomValues) {
    const a = new Uint32Array(1);
    window.crypto.getRandomValues(a);
    return a[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function shuffle(a) {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = secureRandom(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildExam() {
  let chosen = [];

  Object.entries(BLUEPRINT).forEach(([cat, n]) => {
    chosen.push(
      ...shuffle(QUESTIONS.filter(q => q.category === cat)).slice(0, n)
    );
  });

  return shuffle(chosen).map(q => {
    const opts = q.options.map((text, i) => ({
      text,
      correct: i === q.correct
    }));

    return {
      ...q,
      options: shuffle(opts)
    };
  });
}

function startAssessment() {
  exam = buildExam();
  answers = Array(ASSESSMENT_SIZE).fill(null);
  qIndex = 0;
  secondsLeft = DURATION;
  lastResult = null;

  showScreen("test");
  renderQuestion();
  startTimer();
}

function renderQuestion() {
  const q = exam[qIndex];

  $("progressText").textContent =
    `Question ${qIndex + 1} of ${ASSESSMENT_SIZE}`;

  $("progressBar").style.width =
    `${((qIndex + 1) / ASSESSMENT_SIZE) * 100}%`;

  $("questionText").textContent = q.q;

  $("scenarioImageWrap").classList.add("hidden");

  if (q.image) {
    $("scenarioImage").src = q.image;
    $("scenarioImage").onload = () =>
      $("scenarioImageWrap").classList.remove("hidden");
    $("scenarioImage").onerror = () =>
      $("scenarioImageWrap").classList.add("hidden");
  }

  $("answerList").innerHTML = q.options.map((o, i) => `
    <button
      class="answer ${answers[qIndex] === i ? "selected" : ""}"
      data-i="${i}"
    >
      <span class="answer-letter">${String.fromCharCode(65 + i)}</span>
      <span>${esc(o.text)}</span>
    </button>
  `).join("");

  document.querySelectorAll(".answer").forEach(b => {
    b.onclick = () => {
      answers[qIndex] = Number(b.dataset.i);
      renderQuestion();
    };
  });

  $("prevQuestion").disabled = qIndex === 0;

  $("nextQuestion").textContent =
    qIndex === ASSESSMENT_SIZE - 1 ? "Review answers" : "Next";
}

$("prevQuestion").onclick = () => {
  if (qIndex > 0) {
    qIndex--;
    renderQuestion();
  }
};

$("nextQuestion").onclick = () => {
  if (qIndex < ASSESSMENT_SIZE - 1) {
    qIndex++;
    renderQuestion();
  } else {
    renderReview();
  }
};

function startTimer() {
  clearInterval(timer);
  updateTimer();

  timer = setInterval(() => {
    secondsLeft--;
    updateTimer();

    if (secondsLeft <= 0) {
      clearInterval(timer);
      submitNow(true);
    }
  }, 1000);
}

function updateTimer() {
  const m = Math.floor(Math.max(0, secondsLeft) / 60);
  const s = Math.max(0, secondsLeft) % 60;

  $("timer").textContent =
    `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  $("timer").classList.toggle("low", secondsLeft <= 300);
}

function renderReview() {
  showScreen("review");

  const count = answers.filter(x => x !== null).length;

  $("reviewSummary").textContent =
    `${count} of ${ASSESSMENT_SIZE} questions answered. ` +
    "You must answer all questions before submitting.";

  $("reviewGrid").innerHTML = answers.map((a, i) => `
    <button
      class="review-q ${a !== null ? "answered" : ""}"
      data-i="${i}"
    >
      ${i + 1}
    </button>
  `).join("");

  document.querySelectorAll(".review-q").forEach(b => {
    b.onclick = () => {
      qIndex = Number(b.dataset.i);
      showScreen("test");
      renderQuestion();
    };
  });

  $("submitAssessment").disabled =
    count !== ASSESSMENT_SIZE;
}

$("returnToQuestion").onclick = () => {
  showScreen("test");
  renderQuestion();
};

$("submitAssessment").onclick = () => {
  if (
    confirm(
      "Submit your assessment? You will not be able to change your answers afterwards."
    )
  ) {
    submitNow(false);
  }
};

async function submitNow(timedOut) {
  clearInterval(timer);

  let rawCorrect = 0;

  exam.forEach((q, i) => {
    if (
      answers[i] !== null &&
      q.options[answers[i]]?.correct
    ) {
      rawCorrect++;
    }
  });

  const pct = Math.round((rawCorrect / ASSESSMENT_SIZE) * 100);
  const passed = rawCorrect >= PASS_MARK;

  lastResult = {
    rawCorrect,
    score: pct,
    pct,
    passed,
    timedOut,
    completedAt: new Date().toISOString(),
    questionIds: exam.map(q => q.id)
  };

  // Save genuine learner result to Supabase.
  if (session?.user?.id && currentCourse?.id) {
    const { data: savedAttempt, error } = await db
      .from("assessment_attempts")
      .insert({
        learner_id: session.user.id,
        course_id: currentCourse.id,
        assignment_id: currentAssignment?.id || null,
        score: pct,
        passed,
        started_at: new Date(
          Date.now() - (DURATION - secondsLeft) * 1000
        ).toISOString(),
        completed_at: lastResult.completedAt
      })
      .select()
      .single();

    if (error) {
      console.error("Assessment save failed:", error);
      alert(
        "Your assessment was marked, but the database could not save the result. " +
        "Please tell the trainer before closing this page."
      );
    } else {
      latestAttempt = savedAttempt;

      if (passed && currentAssignment?.id) {
        const { error: assignmentUpdateError } = await db
          .from("assignments")
          .update({
            status: "completed",
            completed_at: lastResult.completedAt
          })
          .eq("id", currentAssignment.id);

        if (assignmentUpdateError) {
          console.error(
            "Assignment completion update failed:",
            assignmentUpdateError
          );
        } else {
          currentAssignment.status = "completed";
          currentAssignment.completed_at = lastResult.completedAt;
        }
      }
    }
  }

  renderResult();
  showScreen("result");
}

function renderResult() {
  $("resultCard").classList.toggle("refer", !lastResult.passed);

  $("resultBadge").textContent =
    lastResult.passed ? "PASS" : "REFER";

  $("resultHeading").textContent =
    lastResult.passed ? "Assessment passed" : "Assessment referred";

  $("resultLearner").textContent =
    profile?.full_name || "Learner";

  $("resultScore").textContent =
    `${lastResult.rawCorrect}/20 · ${lastResult.pct}%`;

  $("resultMessage").textContent =
    lastResult.passed
      ? "You have achieved the required 80% standard. Your result has been added to your learning record."
      : "The required pass mark is 16/20. Please speak to your trainer / assessor before reassessment.";

  $("downloadCertificate").style.display =
    lastResult.passed ? "inline-block" : "none";
}

$("finishResult").onclick = async () => {
  await refreshLearner();
  showScreen("learner");
};

// -------------------------
// PDF CERTIFICATE / RECORD
// -------------------------

async function logoData() {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext("2d").drawImage(img, 0, 0);
      resolve(c.toDataURL("image/png"));
    };

    img.onerror = reject;
    img.src = "rrta-logo.png";
  });
}

function filename(s) {
  return s
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_|_$/g, "");
}

$("downloadCertificate").onclick = async () => {
  if (!window.jspdf) {
    alert("PDF library unavailable. Please check your internet connection.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  });

  const W = 297;
  const H = 210;

  doc.setDrawColor(157, 11, 26);
  doc.setLineWidth(1.8);
  doc.rect(8, 8, W - 16, H - 16);

  doc.setDrawColor(38, 43, 48);
  doc.setLineWidth(.4);
  doc.rect(11, 11, W - 22, H - 22);

  try {
    doc.addImage(await logoData(), "PNG", 106, 18, 85, 31);
  } catch (e) {}

  doc.setTextColor(157, 11, 26);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(
    "CERTIFICATE OF ACHIEVEMENT",
    W / 2,
    61,
    { align: "center" }
  );

  doc.setTextColor(38, 43, 48);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(
    "This is to certify that",
    W / 2,
    75,
    { align: "center" }
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(
    profile?.full_name || "Learner",
    W / 2,
    91,
    { align: "center" }
  );

  doc.setDrawColor(185, 188, 191);
  doc.line(80, 96, 217, 96);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(
    "has successfully completed the",
    W / 2,
    108,
    { align: "center" }
  );

  doc.setTextColor(157, 11, 26);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text(
    COURSE_NAME,
    W / 2,
    121,
    { align: "center" }
  );

  doc.setTextColor(82, 88, 94);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    "Face-to-Face Course for Field Engineers",
    W / 2,
    131,
    { align: "center" }
  );

  const d = fmtDate(lastResult.completedAt);

  doc.setFillColor(244, 245, 246);
  doc.roundedRect(37, 148, 223, 25, 3, 3, "F");

  [
    ["DATE COMPLETED", d],
    ["ASSESSMENT RESULT", `${lastResult.rawCorrect}/20 (${lastResult.pct}%)`],
    ["CERTIFICATE NO.", `RRTA-CS-${Date.now().toString().slice(-8)}`]
  ].forEach(([k, v], i) => {
    const x = [74, 148.5, 223][i];

    doc.setTextColor(105, 112, 118);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(k, x, 157, { align: "center" });

    doc.setTextColor(38, 43, 48);
    doc.setFontSize(10);
    doc.text(v, x, 166, { align: "center" });
  });

  doc.setTextColor(157, 11, 26);
  doc.setFontSize(7.5);
  doc.text(
    "RAPID RESPONSE TRAINING ACADEMY",
    W / 2,
    195,
    { align: "center" }
  );

  doc.save(
    `${filename(profile?.full_name || "Learner")}_Customer_Service_Certificate.pdf`
  );
};

$("downloadRecord").onclick = async () => {
  if (!window.jspdf) {
    alert("PDF library unavailable. Please check your internet connection.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    unit: "mm",
    format: "a4"
  });

  try {
    doc.addImage(await logoData(), "PNG", 65, 12, 80, 29);
  } catch (e) {}

  doc.setTextColor(157, 11, 26);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(
    "ASSESSMENT RECORD",
    105,
    51,
    { align: "center" }
  );

  doc.setTextColor(38, 43, 48);
  doc.setFontSize(14);
  doc.text(
    COURSE_NAME,
    105,
    61,
    { align: "center" }
  );

  doc.setDrawColor(210);
  doc.line(18, 68, 192, 68);

  const rows = [
    ["Learner", profile?.full_name || ""],
    ["Organisation", profile?.organisation || ""],
    ["Date", fmtDate(lastResult.completedAt)],
    ["Score", `${lastResult.rawCorrect}/20 (${lastResult.pct}%)`],
    ["Result", lastResult.passed ? "PASS" : "REFER"],
    ["Question Bank IDs", lastResult.questionIds.join(", ")]
  ];

  let y = 80;

  rows.forEach(([k, v]) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(k, 24, y);

    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(String(v), 112);
    doc.text(lines, 73, y);

    y += Math.max(9, lines.length * 5);
  });

  doc.save(
    `${filename(profile?.full_name || "Learner")}_Assessment_Record.pdf`
  );
};
