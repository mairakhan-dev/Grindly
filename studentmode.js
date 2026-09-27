// ===== BOTTOM FEATURES FUNCTIONS =====

// Quick Notes
let bottomNotesTimer;
const bottomNotesInput = document.getElementById('bottomQuickNotes');
const bottomNotesStatus = document.getElementById('bottomNotesStatus');

if (bottomNotesInput) {
    const savedNotes = localStorage.getItem('bottomQuickNotes');
    if (savedNotes) bottomNotesInput.value = savedNotes;
    
    bottomNotesInput.addEventListener('input', function() {
        localStorage.setItem('bottomQuickNotes', this.value);
        bottomNotesStatus.textContent = 'Saving...';
        clearTimeout(bottomNotesTimer);
        bottomNotesTimer = setTimeout(() => {
            bottomNotesStatus.textContent = 'Saved';
        }, 500);
    });
}

function copyBottomNotes() {
    if (bottomNotesInput && bottomNotesInput.value) {
        navigator.clipboard.writeText(bottomNotesInput.value);
        showNotification("Notes copied!", "success");
    }
}

function clearBottomNotes() {
    if (bottomNotesInput) {
        bottomNotesInput.value = '';
        localStorage.setItem('bottomQuickNotes', '');
        showNotification("Notes cleared!", "success");
    }
}

// Study Stats Compare
function updateBottomStats() {
    const statsCompareMessages = [
        "You studied 20% more than average",
        "Top 10% of users this week",
        "Your streak is ahead of 70% of students",
        "You're in the top 25% for weekly focus",
        "You're above average for consistency",
        "You're ahead of your weekly goal"
    ];
    const idx1 = Math.floor(Math.random() * statsCompareMessages.length);
    let idx2 = Math.floor(Math.random() * statsCompareMessages.length);
    if (idx2 === idx1) idx2 = (idx2 + 1) % statsCompareMessages.length;
    
    const msg1 = document.getElementById('compareMsg1Bottom');
    const msg2 = document.getElementById('compareMsg2Bottom');
    if (msg1) msg1.textContent = statsCompareMessages[idx1];
    if (msg2) msg2.textContent = statsCompareMessages[idx2];
}

// Teach Mode - With Text Inputs
let bottomBullets = [false, false, false, false, false];
let bottomRecording = false;
let bottomMediaRecorder = null;
let bottomAudioChunks = [];

function toggleBottomBullet(num) {
    const bullet = document.querySelector(`.teach-bullet-check[data-num="${num}"]`);
    bottomBullets[num - 1] = !bottomBullets[num - 1];
    if (bottomBullets[num - 1]) {
        bullet.classList.add('filled');
    } else {
        bullet.classList.remove('filled');
    }
}

function toggleBottomRecording() {
    if (bottomRecording) {
        stopBottomRecording();
    } else {
        startBottomRecording();
    }
}

function startBottomRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            bottomMediaRecorder = new MediaRecorder(stream);
            bottomAudioChunks = [];
            
            bottomMediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) bottomAudioChunks.push(e.data);
            };
            
            bottomMediaRecorder.onstop = () => {
                const blob = new Blob(bottomAudioChunks, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                localStorage.setItem('bottomTeachRecording', url);
                document.getElementById('bottomTeachStatus').textContent = 'Recording saved';
                stream.getTracks().forEach(track => track.stop());
            };
            
            bottomMediaRecorder.start();
            bottomRecording = true;
            document.getElementById('bottomTeachStatus').textContent = 'Recording...';
        })
        .catch(() => {
            showNotification("Microphone access needed", "warning");
        });
}

function stopBottomRecording() {
    if (bottomMediaRecorder && bottomRecording) {
        bottomMediaRecorder.stop();
        bottomRecording = false;
        document.getElementById('bottomTeachStatus').textContent = 'Recording stopped';
    }
}

function completeBottomTeach() {
    const topic = document.getElementById('bottomTeachTopic').value;
    
    // Get bullet text inputs
    const bulletInputs = [
        document.getElementById('bottomBullet1').value.trim(),
        document.getElementById('bottomBullet2').value.trim(),
        document.getElementById('bottomBullet3').value.trim(),
        document.getElementById('bottomBullet4').value.trim(),
        document.getElementById('bottomBullet5').value.trim()
    ];
    
    const bulletsFilledCount = bulletInputs.filter(b => b.length > 0).length;
    const hasRecording = localStorage.getItem('bottomTeachRecording');
    
    if (!topic && bulletsFilledCount < 3 && !hasRecording) {
        showNotification("Add topic, fill at least 3 bullet points, or record!", "warning");
        return;
    }
    
    showNotification("✅ Great job teaching! Tree will grow!", "success");
    
    // Grow the tree if function exists
    if (typeof growTree === 'function') {
        growTree();
    } else if (typeof window.growTree === 'function') {
        window.growTree();
    }
    
    // Save completion
    const today = new Date().toDateString();
    localStorage.setItem('teachCompleted_' + today, 'true');
    
    // Trigger confetti if available
    if (typeof triggerConfetti === 'function') {
        triggerConfetti();
    } else if (typeof window.triggerConfetti === 'function') {
        window.triggerConfetti();
    }
    
    // Reset form
    bottomBullets = [false, false, false, false, false];
    document.querySelectorAll('.teach-bullet-check').forEach(b => b.classList.remove('filled'));
    document.getElementById('bottomTeachTopic').value = '';
    document.getElementById('bottomBullet1').value = '';
    document.getElementById('bottomBullet2').value = '';
    document.getElementById('bottomBullet3').value = '';
    document.getElementById('bottomBullet4').value = '';
    document.getElementById('bottomBullet5').value = '';
    localStorage.removeItem('bottomTeachRecording');
}

// Daily Challenge - FULL CELEBRATION
function completeBottomChallenge() {
    const btn = document.getElementById('bottomDailyChallengeBtn');
    const today = new Date().toDateString();
    const alreadyCompleted = localStorage.getItem('dailyChallengeCompleted') === today;
    
    if (alreadyCompleted) {
        showNotification("You already completed today's challenge!", "info");
        return;
    }
    
    // Mark as completed
    btn.disabled = true;
    btn.textContent = '✅ Completed!';
    localStorage.setItem('dailyChallengeCompleted', today);
    
    // Play applause sound
    if (typeof playApplauseSound === 'function') {
        playApplauseSound();
    } else if (typeof window.playApplauseSound === 'function') {
        window.playApplauseSound();
    } else {
        // Create simple applause sound
        try {
            const audio = new Audio('https://www.soundjay.com/misc/sounds/applause-01.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => {});
        } catch(e) {}
    }
    
    // Play clapping video/effect
    if (typeof playClappingVideo === 'function') {
        playClappingVideo();
    } else if (typeof window.playClappingVideo === 'function') {
        window.playClappingVideo();
    }
    
    // Trigger confetti
    if (typeof triggerConfetti === 'function') {
        triggerConfetti();
    } else if (typeof window.triggerConfetti === 'function') {
        window.triggerConfetti();
    } else if (typeof launchConfetti === 'function') {
        launchConfetti();
    }
    
    // Show success message
    showNotification("🎉 Challenge completed! Great job!", "success");
    
    // Update the challenge text for tomorrow
    const challenges = [
        "Finish one focused 25‑minute study session",
        "Review notes for 10 minutes without distractions",
        "Complete one pending task from your list",
        "Summarize one lesson in 3 bullet points",
        "Do 10 practice questions in a row"
    ];
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    const textEl = document.getElementById('bottomDailyChallengeText');
    if (textEl) textEl.textContent = randomChallenge;
}

// Load daily challenge on page load
function loadBottomChallenge() {
    const challenges = [
        "Finish one focused 25‑minute study session",
        "Review notes for 10 minutes without distractions",
        "Complete one pending task from your list",
        "Summarize one lesson in 3 bullet points",
        "Do 10 practice questions in a row"
    ];
    
    const lastCompleted = localStorage.getItem('dailyChallengeCompleted');
    const today = new Date().toDateString();
    
    if (lastCompleted === today) {
        const btn = document.getElementById('bottomDailyChallengeBtn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = '✅ Completed!';
        }
    } else {
        const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
        const textEl = document.getElementById('bottomDailyChallengeText');
        if (textEl) textEl.textContent = randomChallenge;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateBottomStats();
    loadBottomChallenge();
    setInterval(updateBottomStats, 60000);
    
    // Check if teach was already completed today
    const today = new Date().toDateString();
    if (localStorage.getItem('teachCompleted_' + today) === 'true') {
        const teachBtn = document.querySelector('.teach-actions .btn-success');
        if (teachBtn) {
            teachBtn.disabled = true;
            teachBtn.textContent = '✅ Completed Today';
        }
    }
});

// ========== MOBILE MENU FUNCTIONALITY ==========
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
}

// Add mobile menu toggle listener
document.getElementById('mobileMenuToggle').addEventListener('click', toggleMobileMenu);
document.getElementById('mobileOverlay').addEventListener('click', closeMobileMenu);

// Close menu when clicking outside on mobile
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const overlay = document.getElementById('mobileOverlay');
    
    if (window.innerWidth <= 991 && 
        !sidebar.contains(event.target) && 
        !toggleBtn.contains(event.target) && 
        sidebar.classList.contains('active')) {
        closeMobileMenu();
    }
});

// Close menu on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeMobileMenu();
    }
});

// ========== FIREBASE CONFIGURATION ==========
const firebaseConfig = {
    apiKey: "AIzaSyBAIPxgXPZmGdPvB98TLFRfTAClgXWEIM0",
    authDomain: "student-teacher-app-4e7c9.firebaseapp.com",
    databaseURL: "https://student-teacher-app-4e7c9-default-rtdb.firebaseio.com",
    projectId: "student-teacher-app-4e7c9",
    storageBucket: "student-teacher-app-4e7c9.firebasestorage.app",
    messagingSenderId: "737621420458",
    appId: "1:737621420458:web:74c873869a1a47c2ce23d3"
};
const IMGBB_API_KEY = "PASTE_YOUR_IMGBB_KEY_HERE";



async function uploadImageToImgBB(blob) {
    const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result;
            resolve(result.split(',')[1]); // base64 only
        };
        if (sectionId === 'exitTicket' && itemText.includes('Exit Ticket')) {
            item.classList.add('active');
            return;
        }
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

    const form = new FormData();
    form.append('image', base64);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: form
    });

    const data = await res.json();
    if (!data || !data.success) {
        throw new Error('ImgBB upload failed');
    }

    return data.data.url; // direct image URL
}

async function shortenUrl(longUrl) {
    const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
    const shortUrl = await res.text();
    return shortUrl;
}

// ========== GLOBAL VARIABLES ==========
let currentUser = null;
let currentUserId = null;
let currentUserName = "Student";
let database = null;
let auth = null;
let userClasses = [];
let currentClassCode = null;
let selectedClassIndex = 0;

const STORAGE_SCHEMA_VERSION = 2;

function initLocalStorageSchema() {
    try {
        const stored = parseInt(localStorage.getItem('lifeos_schema_version') || '1', 10);
        if (stored >= STORAGE_SCHEMA_VERSION) return;

        if (stored < 2) {
            const legacyName = localStorage.getItem('student_name');
            const newName = localStorage.getItem('studentName');
            if (legacyName && !newName) {
                localStorage.setItem('studentName', legacyName);
            }
            if (newName && !legacyName) {
                localStorage.setItem('student_name', newName);
            }
        }

        localStorage.setItem('lifeos_schema_version', String(STORAGE_SCHEMA_VERSION));
    } catch (error) {
        console.error("Schema migration failed:", error);
    }
}

// Initialize with proper default values to prevent undefined errors
let studyData = {
    streak: 0,
    lastStudyDate: "",
    totalMinutes: 0,
    totalStudyDays: 0,
    totalStudyHours: 0,
    studySessions: [],
    weeklyPattern: [0, 0, 0, 0, 0, 0, 0],
    streakHistory: [],
    streakMilestones: [3, 7, 14, 30, 60, 90],
    currentMilestone: 0,
    dailyStats: [],
    focusScores: [],
    consistencyScores: []
};

let tasks = [];
let assignments = [];
let currentTaskFilter = 'all';
let currentSection = 'dashboard';
let selectedPriority = 'urgent';

// Chart instances
let hoursChart = null;
let tasksChart = null;
let weeklyChart = null;
let assignmentsChart = null;
let streakChart = null;
let focusChart = null;

// Chart auto-refresh interval
let chartRefreshInterval = null;

// ========== INSPIRING QUOTES DATABASE ==========
const inspiringQuotes = [
    { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
    { text: "Don't let what you cannot do interfere with what you can do.", author: "John Wooden" },
    { text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss" },
    { text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.", author: "Brian Herbert" },
    { text: "Knowledge is power. Information is liberating. Education is the premise of progress, in every society, in every family.", author: "Kofi Annan" },
    { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
    { text: "Education is not preparation for life; education is life itself.", author: "John Dewey" },
    { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
    { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
    { text: "The only person who is educated is the one who has learned how to learn and change.", author: "Carl Rogers" },
    { text: "Education is the key to unlocking the world, a passport to freedom.", author: "Oprah Winfrey" },
    { text: "Learning is a treasure that will follow its owner everywhere.", author: "Chinese Proverb" },
    { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { text: "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful.", author: "Albert Schweitzer" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
    { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
    { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Optimism is the faith that leads to achievement. Nothing can be done without hope and confidence.", author: "Helen Keller" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "I can't change the direction of the wind, but I can adjust my sails to always reach my destination.", author: "Jimmy Dean" },
    { text: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A.A. Milne" },
    { text: "The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack in will.", author: "Vince Lombardi" },
    { text: "The harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
    { text: "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.", author: "Roy T. Bennett" },
    { text: "Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't.", author: "Rikki Rogers" },
    { text: "Every accomplishment starts with the decision to try.", author: "John F. Kennedy" },
    { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
    { text: "The only thing standing between you and your goal is the story you keep telling yourself as to why you can't achieve it.", author: "Jordan Belfort" },
    { text: "Small daily improvements are the key to staggering long-term results.", author: "Darren Hardy" },
    { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
    { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
    { text: "Your potential is endless. Go do what you were created to do.", author: "Unknown" },
    { text: "The moment you give up is the moment you let someone else win.", author: "Kobe Bryant" },
    { text: "Challenges are what make life interesting and overcoming them is what makes life meaningful.", author: "Joshua J. Marine" },
    { text: "Don't limit your challenges. Challenge your limits.", author: "Unknown" },
    { text: "The pain of discipline weighs ounces, the pain of regret weighs tons.", author: "Jim Rohn" },
    { text: "Success is stumbling from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
    { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" }
];

// ========== AI CHATBOT ==========
const chatbotMessages = [
    "You’ve got this. One step at a time.",
    "Small progress is still progress.",
    "Focus for five minutes — start now.",
    "You’re building a powerful habit.",
    "Be proud of showing up today.",
    "Keep going. Future you will thank you.",
    "You’re not alone — keep pushing.",
    "Just one more task, you can do it.",
    "Your effort matters more than perfection.",
    "Deep breath. You are capable.",
    "Consistency beats intensity.",
    "Start messy. Finish strong.",
    "Do the next small thing.",
    "You’re making it happen.",
    "Keep the streak alive.",
    "Show up for yourself today.",
    "Make today count.",
    "Momentum starts now.",
    "You’re stronger than distractions.",
    "One focused hour can change a day.",
    "Tiny steps, big results.",
    "This is your time. Use it.",
    "Stay steady. You are doing great.",
    "Progress is a victory.",
    "You’re learning fast.",
    "Your focus is your superpower.",
    "Don’t wait for perfect. Start.",
    "You are in control.",
    "Finish one task. Then another.",
    "Keep the pace.",
    "You’re closer than you think.",
    "Today’s effort shapes tomorrow.",
    "Keep your eyes on the goal.",
    "You’re building mastery.",
    "You can do hard things.",
    "Stay with it.",
    "One page at a time.",
    "One problem at a time.",
    "Keep calm and study on.",
    "Breathe. Focus. Execute.",
    "Your future self is cheering.",
    "This is a good moment to start.",
    "Every session counts.",
    "You’re on the right track.",
    "Your discipline is growing.",
    "You’re doing better than you think.",
    "It’s okay to go slow.",
    "Choose progress today.",
    "You’ve already begun — keep going.",
    "The work will pay off.",
    "Stay locked in.",
    "You are capable of more.",
    "Make it happen today.",
    "Focus now, relax later.",
    "Small wins matter.",
    "Do it for your goals.",
    "Keep your head up.",
    "You’ve got momentum.",
    "Trust the process.",
    "You’re building something great."
];

const dailyChallenges = [
    "Finish one focused 25‑minute study session.",
    "Review notes for 10 minutes without distractions.",
    "Complete one pending task from your list.",
    "Summarize one lesson in 3 bullet points.",
    "Do 10 practice questions in a row.",
    "Study for 20 minutes and take a 5‑minute break.",
    "Organize your tasks for tomorrow.",
    "Rewrite a concept in your own words.",
    "Teach a concept out loud for 3 minutes.",
    "Clear one small assignment step today."
];

const DAILY_CHALLENGE_KEY = 'studentDailyChallenge';
const DAILY_CHALLENGE_DATE_KEY = 'studentDailyChallengeDate';
const DAILY_CHALLENGE_DONE_KEY = 'studentDailyChallengeDone';
const DAILY_CHALLENGE_SHOWN_KEY = 'studentDailyChallengeShown';

function getTodayKeySimple() {
    return new Date().toDateString();
}

function getDailyChallenge() {
    const today = getTodayKeySimple();
    const savedDate = localStorage.getItem(DAILY_CHALLENGE_DATE_KEY);
    if (savedDate === today) {
        return localStorage.getItem(DAILY_CHALLENGE_KEY);
    }
    const challenge = dailyChallenges[Math.floor(Math.random() * dailyChallenges.length)];
    localStorage.setItem(DAILY_CHALLENGE_DATE_KEY, today);
    localStorage.setItem(DAILY_CHALLENGE_KEY, challenge);
    localStorage.setItem(DAILY_CHALLENGE_DONE_KEY, 'false');
    localStorage.setItem(DAILY_CHALLENGE_SHOWN_KEY, '');
    return challenge;
}

function renderDailyChallenge() {
    const card = document.getElementById('dailyChallengeCard');
    const textEl = document.getElementById('dailyChallengeText');
    const btn = document.getElementById('dailyChallengeDoneBtn');
    if (!card || !textEl || !btn) return;
    const challenge = getDailyChallenge() || "Complete today’s focus block.";
    textEl.textContent = challenge;
    const done = localStorage.getItem(DAILY_CHALLENGE_DONE_KEY) === 'true';
    btn.disabled = done;
    btn.textContent = done ? "✅ Completed today" : "✅ I am done";
    card.style.display = done ? 'none' : 'block';
}

function playApplauseSound() {
    try {
        const audio = document.getElementById('applauseAudio') || new Audio('applause.mp3');
        audio.currentTime = 0;
        audio.volume = 0.9;
        audio.play().catch((e) => console.warn("Audio playback blocked:", e));
        return audio;
    } catch (e) {
        console.warn("Audio playback blocked or unavailable:", e);
        return null;
    }
}

function playClappingVideo() {
    const overlay = document.getElementById('clapOverlay');
    const video = document.getElementById('clapVideo');
    const canvas = document.getElementById('clapCanvas');
    if (!overlay || !video) return;
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('show'));
    video.currentTime = 0;
    const ctx = canvas ? canvas.getContext('2d') : null;
    const drawFrame = () => {
        if (!ctx || video.paused || video.ended) return;
        const vw = video.videoWidth || 0;
        const vh = video.videoHeight || 0;
        if (vw && vh) {
            canvas.width = vw;
            canvas.height = vh;
            ctx.drawImage(video, 0, 0, vw, vh);
            const frame = ctx.getImageData(0, 0, vw, vh);
            const data = frame.data;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                if (g > 100 && g > r * 1.2 && g > b * 1.2) {
                    data[i + 3] = 0;
                }
            }
            ctx.putImageData(frame, 0, 0);
        }
        requestAnimationFrame(drawFrame);
    };
    video.play().then(() => {
        requestAnimationFrame(drawFrame);
    }).catch((e) => console.warn("Video playback blocked:", e));
    video.onended = () => {
        stopClappingVideo();
    };
}

function stopClappingVideo() {
    const overlay = document.getElementById('clapOverlay');
    const video = document.getElementById('clapVideo');
    if (video) {
        video.pause();
        video.currentTime = 0;
    }
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 250);
    }
}

function completeDailyChallenge() {
    localStorage.setItem(DAILY_CHALLENGE_DONE_KEY, 'true');
    renderDailyChallenge();
    const audio = playApplauseSound();
    playClappingVideo();
    if (audio) {
        audio.onended = () => stopClappingVideo();
    }
    showNotification("Challenge completed! 🎉", "success");
}

function showDailyChallengeFromChatbot() {
    renderDailyChallenge();
    const card = document.getElementById('dailyChallengeCard');
    if (card) card.style.display = 'block';
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

const statsCompareMessages = [
    "You studied 20% more than average.",
    "Top 10% of users this week.",
    "Your streak is ahead of 70% of students.",
    "You’re in the top 25% for weekly focus.",
    "You completed more sessions than most this week.",
    "You’re above average for consistency.",
    "You’re trending upward — keep it going.",
    "Your study time beat last week by 15%.",
    "You’re keeping a strong pace this week.",
    "You’re ahead of your weekly goal."
];

function updateStatsCompare() {
    const msg1 = document.getElementById('compareMsg1');
    const msg2 = document.getElementById('compareMsg2');
    if (!msg1 || !msg2) return;

    const idx1 = Math.floor(Math.random() * statsCompareMessages.length);
    let idx2 = Math.floor(Math.random() * statsCompareMessages.length);
    if (idx2 === idx1) idx2 = (idx2 + 1) % statsCompareMessages.length;

    msg1.textContent = statsCompareMessages[idx1];
    msg2.textContent = statsCompareMessages[idx2];
}

let chatbotTimeoutId = null;

function showChatbotGreetingThenChallenge() {
    const bubble = document.getElementById('chatbotBubble');
    if (!bubble) return;
    bubble.classList.remove('challenge');
    bubble.textContent = "Hi! Ready to grind?";
    bubble.classList.add('show');
    setTimeout(() => {
        bubble.classList.remove('show');
        setTimeout(showChallengeBubble, 600);
    }, 2000);
}

function showChallengeBubble() {
    const bubble = document.getElementById('chatbotBubble');
    if (!bubble) return;
    const today = getTodayKeySimple();
    const shownDate = localStorage.getItem(DAILY_CHALLENGE_SHOWN_KEY);
    if (shownDate !== today && localStorage.getItem(DAILY_CHALLENGE_DONE_KEY) !== 'true') {
        const challenge = getDailyChallenge();
        bubble.textContent = `Today's challenge: ${challenge}`;
        bubble.classList.add('challenge');
        localStorage.setItem(DAILY_CHALLENGE_SHOWN_KEY, today);
        showDailyChallengeFromChatbot();
        bubble.classList.add('show');
        setTimeout(() => bubble.classList.remove('show'), 12000);
    }
}

function showChatbotMessage() {
    const bubble = document.getElementById('chatbotBubble');
    if (!bubble) return;
    const today = getTodayKeySimple();
    const shownDate = localStorage.getItem(DAILY_CHALLENGE_SHOWN_KEY);
    let msg = "";
    if (shownDate !== today && localStorage.getItem(DAILY_CHALLENGE_DONE_KEY) !== 'true') {
        const challenge = getDailyChallenge();
        msg = `Today's challenge: ${challenge}`;
        bubble.classList.add('challenge');
        localStorage.setItem(DAILY_CHALLENGE_SHOWN_KEY, today);
        showDailyChallengeFromChatbot();
    } else {
        msg = chatbotMessages[Math.floor(Math.random() * chatbotMessages.length)];
        bubble.classList.remove('challenge');
    }
    bubble.textContent = msg;
    bubble.classList.add('show');
    setTimeout(() => bubble.classList.remove('show'), 12000);
}

function scheduleChatbotMessage() {
    if (chatbotTimeoutId) clearTimeout(chatbotTimeoutId);
    const delay = Math.floor(Math.random() * 8000) + 7000; // 7-15s
    chatbotTimeoutId = setTimeout(() => {
        showChatbotMessage();
        scheduleChatbotMessage();
    }, delay);
}







// ========== PREMIUM THEME REFERRALS ==========
const REFERRAL_KEY = 'studentPremiumReferrals';
const REFERRAL_REFERRER_KEY = 'studentReferralReferrer';
const REFERRAL_CREDITED_KEY_PREFIX = 'studentReferralCredited_';
const REFERRAL_PENDING_KEY = 'studentReferralPending';
const REFERRAL_TARGET = 3;
const REFERRAL_NOTIFS_SEEN_KEY = 'studentReferralNotifsSeen';
const REFERRAL_UNLOCKED_KEY = 'studentReferralUnlocked';
const RAINBOW_UNLOCKED_KEY = 'studentRainbowUnlocked';
const FOREST_UNLOCKED_KEY = 'studentForestUnlocked';

function getReferralCount() {
    return parseInt(localStorage.getItem(REFERRAL_KEY) || '0', 10);
}

function setReferralCount(val) {
    localStorage.setItem(REFERRAL_KEY, String(val));
}

function updateReferralUI() {
    const count = Math.min(getReferralCount(), REFERRAL_TARGET);
    const countEl = document.getElementById('referralCount');
    const countModalEl = document.getElementById('referralCountModal');
    const statusEl = document.getElementById('premiumStatusMsg');
    if (countEl) countEl.textContent = count;
    if (countModalEl) countModalEl.textContent = count;
    if (statusEl) {
        statusEl.textContent = count >= REFERRAL_TARGET
            ? "Premium Theme unlocked! Select it in the theme menu."
            : `Refer Grindly Learn to ${REFERRAL_TARGET} friends to unlock the Premium Theme.`;
    }

    if (count >= REFERRAL_TARGET) {
        const unlocked = localStorage.getItem(REFERRAL_UNLOCKED_KEY) === 'true';
        localStorage.setItem('studentTheme', 'premium');
        document.body.className = 'premium';
        const themeSelector = document.querySelector('.theme-selector');
        if (themeSelector) themeSelector.value = 'premium';
        if (!unlocked) {
            localStorage.setItem(REFERRAL_UNLOCKED_KEY, 'true');
            showNotification("Premium unlocked! Enjoy the new look ✨", "success");
            triggerPremiumSparkles();
        }
    }
}

function copyReferralLink() {
    const link = `https://grindlylearn.netlify.app/studentmode.html?ref=${encodeURIComponent(currentUserId || '')}`;
    navigator.clipboard.writeText(link).then(() => {
        showNotification("Referral link copied!", "success");
    }).catch(() => {
        showNotification("Could not copy link. Please copy manually.", "warning");
    });
}

async function markReferral() {
    copyReferralLink();

    if (!currentUserId) {
        showNotification("Referral not available yet. Try again in a moment.", "warning");
        return;
    }

    try {
        const serverCountRaw = await firebaseGet(`users/${currentUserId}/referralCount`);
        const serverCount = Math.min(parseInt(serverCountRaw || 0, 10) || 0, REFERRAL_TARGET);
        const localCount = getReferralCount();

        if (serverCount > localCount) {
            setReferralCount(serverCount);
            updateReferralUI();
            showNotification("Referral counted!", "success");
        } else {
            showNotification("Referral not verified yet. Your friend must open your link and log a study session.", "warning");
        }
    } catch (e) {
        console.warn("Failed to verify referral count:", e);
        showNotification("Could not verify referral yet. Please try again soon.", "warning");
    }
}

function previewPremiumTheme() {
    const current = localStorage.getItem('studentTheme') || 'light';
    document.body.dataset.previewTheme = current;
    document.body.className = 'premium';
    showNotification("Previewing Premium Theme…", "info");
    openReferralModal();
}

function updateRainbowUI() {
    const streak = studyData.streak || 0;
    const unlocked = streak >= 30 || localStorage.getItem(RAINBOW_UNLOCKED_KEY) === 'true';
    const statusEl = document.getElementById('rainbowStatusMsg');
    const countEl = document.getElementById('rainbowStreakCount');
    const badgeEl = document.getElementById('rainbowBadge');
    if (countEl) countEl.textContent = Math.min(streak, 30);
    if (badgeEl) badgeEl.textContent = unlocked ? '🌈 Unlocked' : '🔒 Locked';
    if (statusEl) {
        statusEl.textContent = unlocked
            ? "Rainbow Theme unlocked! Select it in the theme menu."
            : "Reach a 30‑day streak to unlock the Rainbow Theme.";
    }
}

function openRainbowModal() {
    const modal = document.getElementById('rainbowModal');
    if (modal) modal.classList.add('show');
    const countEl = document.getElementById('rainbowModalCount');
    if (countEl) countEl.textContent = Math.min(studyData.streak || 0, 30);
    const textEl = document.getElementById('rainbowModalText');
    if (textEl) {
        textEl.textContent = (studyData.streak || 0) >= 30
            ? "Rainbow Theme unlocked! Select it in the theme menu."
            : "Hit a 30‑day streak to unlock the Rainbow Theme.";
    }
}

function closeRainbowModal() {
    const modal = document.getElementById('rainbowModal');
    if (modal) modal.classList.remove('show');
    const current = localStorage.getItem('studentTheme') || 'light';
    document.body.className = current;
    const themeSelector = document.querySelector('.theme-selector');
    if (themeSelector) themeSelector.value = current;
}

function previewRainbowTheme() {
    const current = localStorage.getItem('studentTheme') || 'light';
    document.body.className = 'rainbow';
    openRainbowModal();
}

function openForestModal() {
    const modal = document.getElementById('forestModal');
    if (modal) modal.classList.add('show');
    const countEl = document.getElementById('forestModalCount');
    if (countEl) countEl.textContent = Math.min(studyData.streak || 0, 7);
    const textEl = document.getElementById('forestModalText');
    if (textEl) {
        textEl.textContent = (studyData.streak || 0) >= 7
            ? "Forest Theme unlocked! Select it in the theme menu."
            : "Hit a 7‑day streak to unlock the Forest Theme.";
    }
}

function closeForestModal() {
    const modal = document.getElementById('forestModal');
    if (modal) modal.classList.remove('show');
    const current = localStorage.getItem('studentTheme') || 'light';
    document.body.className = current;
    const themeSelector = document.querySelector('.theme-selector');
    if (themeSelector) themeSelector.value = current;
}

function previewForestTheme() {
    const current = localStorage.getItem('studentTheme') || 'light';
    document.body.className = 'forest';
    openForestModal();
}

function openReferralModal() {
    const modal = document.getElementById('referralModal');
    if (modal) modal.classList.add('show');
    updateReferralUI();
}

function closeReferralModal() {
    const modal = document.getElementById('referralModal');
    if (modal) modal.classList.remove('show');
    const referrals = getReferralCount();
    const previewTheme = document.body.dataset.previewTheme;
    if (previewTheme) {
        document.body.className = previewTheme;
        localStorage.setItem('studentTheme', previewTheme);
        const themeSelector = document.querySelector('.theme-selector');
        if (themeSelector) themeSelector.value = previewTheme;
        delete document.body.dataset.previewTheme;
        return;
    }
    if (referrals < REFERRAL_TARGET) {
        localStorage.setItem('studentTheme', 'dark');
        document.body.className = 'dark';
        const themeSelector = document.querySelector('.theme-selector');
        if (themeSelector) themeSelector.value = 'dark';
    }
}

function captureReferralFromUrl() {
    try {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref && ref.startsWith('student_') && ref !== currentUserId) {
            localStorage.setItem(REFERRAL_REFERRER_KEY, ref);
            localStorage.setItem(REFERRAL_PENDING_KEY, 'true');
        }
    } catch (e) {
        console.warn("Failed to parse referral URL:", e);
    }
}

function getReferralCreditedKey(referrerId) {
    return `${REFERRAL_CREDITED_KEY_PREFIX}${referrerId}`;
}

function hasStudyActivity() {
    return ((studyData?.studySessions || []).length > 0) ||
        ((studyData?.totalMinutes || 0) > 0) ||
        !!studyData?.lastStudyDate;
}

async function maybeCreditReferral() {
    const referrerId = localStorage.getItem(REFERRAL_REFERRER_KEY);
    if (!referrerId || referrerId === currentUserId) return;

    const creditedKey = getReferralCreditedKey(referrerId);
    const credited = localStorage.getItem(creditedKey);
    if (credited === 'true') return;

    if (!hasStudyActivity()) return;

    if (!database || !currentUser) {
        localStorage.setItem(REFERRAL_PENDING_KEY, 'true');
        return;
    }

    try {
        const path = `users/${referrerId}/referralCount`;
        const next = await firebaseIncrement(path, REFERRAL_TARGET);
        if (next === null || next === undefined) return;
        await firebaseSet(`users/${referrerId}/referralNotifications/${currentUserId}`, {
            name: currentUserName || 'A friend',
            joinedAt: new Date().toISOString()
        });
        localStorage.setItem(creditedKey, 'true');
        localStorage.removeItem(REFERRAL_PENDING_KEY);
    } catch (e) {
        console.warn("Failed to credit referral:", e);
    }
}

function retryPendingReferralCredit() {
    if (localStorage.getItem(REFERRAL_PENDING_KEY) !== 'true') return;
    maybeCreditReferral();
}

function triggerPremiumSparkles() {
    const layer = document.getElementById('premiumSparkleLayer');
    if (!layer) return;

    const sparkleCount = 80;
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'premium-sparkle';
        sparkle.style.left = `${Math.random() * 100}vw`;
        sparkle.style.top = `${50 + Math.random() * 40}vh`;
        sparkle.style.animationDelay = `${Math.random() * 0.4}s`;
        sparkle.style.width = `${4 + Math.random() * 6}px`;
        sparkle.style.height = sparkle.style.width;
        layer.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 3000);
    }
}

async function syncReferralCountFromFirebase() {
    if (!currentUserId) return;
    try {
        const count = await firebaseGet(`users/${currentUserId}/referralCount`);
        if (count !== null && count !== undefined) {
            setReferralCount(parseInt(count, 10) || 0);
        }
    } catch (e) {
        console.warn("Failed to sync referral count:", e);
    }
}

function loadSeenReferralNotifs() {
    try {
        const raw = localStorage.getItem(REFERRAL_NOTIFS_SEEN_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveSeenReferralNotifs(list) {
    try {
        localStorage.setItem(REFERRAL_NOTIFS_SEEN_KEY, JSON.stringify(list));
    } catch (e) {
        console.warn("Failed to save seen referral notifications:", e);
    }
}

function setupReferralNotifications() {
    if (!database || !currentUser) return;
    if (!currentUserId) return;

    const seen = new Set(loadSeenReferralNotifs());
    const ref = database.ref(`users/${currentUserId}/referralNotifications`);
    const countRef = database.ref(`users/${currentUserId}/referralCount`);

    countRef.on('value', (snap) => {
        const val = Math.min(parseInt(snap.val() || 0, 10) || 0, REFERRAL_TARGET);
        setReferralCount(val);
        updateReferralUI();
    });

    ref.on('child_added', (snap) => {
        if (!snap || !snap.key) return;
        if (seen.has(snap.key)) return;

        const data = snap.val() || {};
        const name = data.name || 'A friend';

        showNotification(`${name} is studying because of you!`, "success");
        seen.add(snap.key);
        saveSeenReferralNotifs(Array.from(seen));

        // Keep local count in sync as soon as a referral is detected
        syncReferralCountFromFirebase().then(updateReferralUI);
    });
}

// ========== INSPIRING STORIES DATABASE ==========
const inspiringStories = [
    {
        id: 1,
        name: "Albert Einstein",
        icon: "🧠",
        quote: "Imagination is more important than knowledge.",
        story: "Albert Einstein, one of the greatest physicists of all time, faced numerous struggles in his early life. He didn't speak until he was four years old and was considered a slow learner by his teachers. He failed his first entrance exam to the Swiss Federal Polytechnic School. Despite these early challenges, Einstein's curiosity and persistence led him to develop the theory of relativity, which revolutionized our understanding of space, time, and gravity. He was awarded the Nobel Prize in Physics in 1921.",
        struggles: [
            "Late development in speech and learning",
            "Failed university entrance exam",
            "Worked as a patent clerk while developing groundbreaking theories",
            "Faced skepticism from the scientific community"
        ],
        lessons: "Never give up on your curiosity. What others see as weaknesses might be your greatest strengths."
    },
    {
        id: 2,
        name: "Oprah Winfrey",
        icon: "🎤",
        quote: "Turn your wounds into wisdom.",
        story: "Oprah Winfrey overcame a childhood of poverty and abuse to become one of the most influential media personalities in the world. Born into poverty in rural Mississippi, she was molested by relatives and became pregnant at 14 (the child died in infancy). Despite these traumatic experiences, she excelled in school and won a scholarship to Tennessee State University. Her breakthrough came when she moved to Chicago to host a morning talk show, which eventually became 'The Oprah Winfrey Show' - the highest-rated talk show in American history.",
        struggles: [
            "Poverty and childhood abuse",
            "Teen pregnancy and loss of child",
            "Racial and gender discrimination",
            "Battled with weight and self-esteem issues"
        ],
        lessons: "Your past doesn't define your future. Use your experiences to empower yourself and others."
    },
    {
        id: 3,
        name: "Stephen Hawking",
        icon: "🌌",
        quote: "However difficult life may seem, there is always something you can do and succeed at.",
        story: "Stephen Hawking was diagnosed with ALS (amyotrophic lateral sclerosis) at age 21 and given just two years to live. Despite being confined to a wheelchair and losing his ability to speak, he became one of the most brilliant theoretical physicists of our time. Using a speech-generating device, he continued his research on black holes and the origins of the universe. His book 'A Brief History of Time' sold over 25 million copies worldwide, making complex scientific concepts accessible to the general public.",
        struggles: [
            "Diagnosed with ALS at 21",
            "Gradual loss of mobility and speech",
            "Confined to wheelchair for most of his life",
            "Medical complications including pneumonia"
        ],
        lessons: "Physical limitations cannot constrain the human mind. Focus on what you can do, not what you can't."
    },
    {
        id: 4,
        name: "J.K. Rowling",
        icon: "✍️",
        quote: "Rock bottom became the solid foundation on which I rebuilt my life.",
        story: "Before publishing Harry Potter, J.K. Rowling was a single mother living on welfare in Edinburgh, Scotland. She wrote the first Harry Potter book in cafes while her baby daughter slept. The manuscript was rejected by 12 publishers before Bloomsbury accepted it. Today, the Harry Potter series has sold over 500 million copies worldwide, making Rowling one of the most successful authors in history. She went from being on government assistance to becoming a billionaire (though she has since donated much of her wealth to charity).",
        struggles: [
            "Single mother living on welfare",
            "Clinical depression and suicidal thoughts",
            "12 publishers rejected Harry Potter",
            "Struggled with poverty for years"
        ],
        lessons: "Failure is not permanent. Persistence can turn your biggest dreams into reality."
    },
    {
        id: 5,
        name: "Thomas Edison",
        icon: "💡",
        quote: "I have not failed. I've just found 10,000 ways that won't work.",
        story: "Thomas Edison, one of America's greatest inventors, was told by his teachers that he was 'too stupid to learn anything.' He was fired from his first two jobs for being 'non-productive.' Despite these setbacks, he went on to hold 1,093 patents, including the phonograph, the motion picture camera, and perhaps most famously, the practical electric light bulb. His invention of the light bulb required thousands of experiments with different materials before finding one that worked.",
        struggles: [
            "Teachers said he was 'too stupid to learn'",
            "Fired from early jobs",
            "Thousands of failed experiments",
            "Lost his hearing as a child"
        ],
        lessons: "Persistence and learning from failure are keys to innovation and success."
    },
    {
        id: 6,
        name: "Malala Yousafzai",
        icon: "📚",
        quote: "One child, one teacher, one book, one pen can change the world.",
        story: "Malala Yousafzai was shot in the head by the Taliban at age 15 for advocating for girls' education in Pakistan. She survived the attack and continued her activism, becoming the youngest-ever Nobel Prize laurete at age 17. Her recovery involved multiple surgeries and rehabilitation in the UK. Today, she continues to fight for education rights through the Malala Fund, which supports education programs around the world.",
        struggles: [
            "Shot by Taliban at age 15",
            "Faced death threats for advocating education",
            "Multiple surgeries and long recovery",
            "Forced to leave her home country"
        ],
        lessons: "Courage means standing up for what you believe in, even in the face of extreme danger."
    },
    {
        id: 7,
        name: "Walt Disney",
        icon: "🏰",
        quote: "All our dreams can come true if we have the courage to pursue them.",
        story: "Walt Disney was fired from a newspaper for 'lacking imagination' and 'having no good ideas.' His first animation company went bankrupt. He was turned down 302 times before getting financing for Disney World. Despite these failures, he created Mickey Mouse and built the Disney empire, which has brought joy to millions of people worldwide. His theme parks and films continue to be beloved by generations.",
        struggles: [
            "Fired from newspaper for 'no imagination'",
            "First animation company bankrupt",
            "302 rejections for Disney World financing",
            "Struggled with financial problems"
        ],
        lessons: "Believe in your vision even when others don't. Persistence can create magic."
    },
    {
        id: 8,
        name: "Bethany Hamilton",
        icon: "🏄‍♀️",
        quote: "Courage doesn't mean you don't get afraid. Courage means you don't let fear stop you.",
        story: "At age 13, professional surfer Bethany Hamilton lost her left arm to a shark attack. Just one month after the attack, she returned to surfing. She went on to win her first national surfing title two years later and became a professional surfer. Her story was made into the movie 'Soul Surfer.' She continues to surf competitively and inspires people worldwide with her determination.",
        struggles: [
            "Lost arm in shark attack at 13",
            "Learned to surf with one arm",
            "Faced physical and emotional challenges",
            "Overcame fear of returning to ocean"
        ],
        lessons: "Life's challenges can become opportunities for growth and inspiration."
    }
];

// ========== DATA PERSISTENCE HELPER ==========
function persistData() {
    try {
        const dataToSave = {
            version: "2.5", // Updated version
            lastSaved: new Date().toISOString(),
            userId: currentUserId,
            userName: currentUserName,
            studyData: studyData,
            tasks: tasks,
            assignments: assignments,
            userClasses: userClasses,
            currentClassCode: currentClassCode,
            selectedClassIndex: selectedClassIndex,
            currentSection: currentSection
        };
        
        // Clean up any undefined arrays before saving
        if (!studyData.studySessions) studyData.studySessions = [];
        if (!studyData.dailyStats) studyData.dailyStats = [];
        if (!studyData.focusScores) studyData.focusScores = [];
        if (!studyData.consistencyScores) studyData.consistencyScores = [];
        
        localStorage.setItem('studentPersistentData', JSON.stringify(dataToSave));
        console.log("💾 Data persisted to localStorage");
    } catch (e) {
        console.error("Error persisting data:", e);
    }
}

function loadPersistedData() {
    try {
        const savedData = localStorage.getItem('studentPersistentData');
        if (savedData) {
            const data = JSON.parse(savedData);
            
            // Check version compatibility
            if (data.version && (data.version === "2.5" || data.version === "2.4" || data.version === "2.3" || data.version === "2.2" || data.version === "2.1" || data.version === "2.0")) {
                console.log("📂 Loading persisted data version:", data.version);
                
                // Load study data with safety checks
                if (data.studyData) {
                    studyData = data.studyData;
                    // Initialize arrays if they don't exist
                    if (!studyData.studySessions) studyData.studySessions = [];
                    if (!studyData.dailyStats) studyData.dailyStats = [];
                    if (!studyData.focusScores) studyData.focusScores = [];
                    if (!studyData.consistencyScores) studyData.consistencyScores = [];
                    if (!studyData.streakHistory) studyData.streakHistory = [];
                    if (!studyData.weeklyPattern) studyData.weeklyPattern = [0, 0, 0, 0, 0, 0, 0];
                    if (!studyData.streakMilestones) studyData.streakMilestones = [3, 7, 14, 30, 60, 90];
                    
                    console.log("📊 Loaded study data:", {
                        streak: studyData.streak,
                        hours: studyData.totalStudyHours,
                        sessions: studyData.studySessions?.length || 0,
                        dailyStats: studyData.dailyStats?.length || 0
                    });
                }
                
                // Load tasks with safety check
                if (data.tasks && Array.isArray(data.tasks)) {
                    tasks = data.tasks;
                    console.log("📝 Loaded tasks:", tasks.length);
                } else {
                    tasks = [];
                }
                
                // Load assignments with safety check
                if (data.assignments && Array.isArray(data.assignments)) {
                    assignments = data.assignments;
                    console.log("📚 Loaded assignments:", assignments.length);
                } else {
                    assignments = [];
                }
                
                // Load classes with safety check
                if (data.userClasses && Array.isArray(data.userClasses)) {
                    userClasses = data.userClasses;
                    console.log("🏫 Loaded classes:", userClasses.length);
                } else {
                    userClasses = [];
                }
                
                // Load current class
                if (data.currentClassCode) {
                    currentClassCode = data.currentClassCode;
                }
                
                if (data.selectedClassIndex !== undefined) {
                    selectedClassIndex = data.selectedClassIndex;
                }
                
                // Load current section
                if (data.currentSection) {
                    currentSection = data.currentSection;
                }
                
                // Load user info
                if (data.userName) {
                    currentUserName = data.userName;
                }
                
                if (data.userId && data.userId.startsWith('student_')) {
                    currentUserId = data.userId;
                    localStorage.setItem('studentUserId', currentUserId);
                    console.log("👤 Loaded user ID from persisted data:", currentUserId);
                }
                
                console.log("✅ Persisted data loaded successfully");
                return true;
            } else {
                console.log("⚠️ No compatible version found in persisted data");
            }
        }
    } catch (e) {
        console.error("❌ Error loading persisted data:", e);
    }
    
    console.log("⚠️ No persisted data found, using defaults");
    return false;
}

// ========== FIREBASE DATABASE HELPERS ==========
function getDatabaseRef(path) {
    if (!database) return null;
    return database.ref(path);
}

async function firebaseGet(refPath) {
    if (!database || !currentUser) {
        console.log("⚠️ Firebase not available or user not authenticated, using localStorage");
        return null;
    }
    
    try {
        const ref = getDatabaseRef(refPath);
        const snapshot = await ref.once('value');
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.error(`❌ Firebase get error at ${refPath}:`, error);
        return null;
    }
}

async function firebaseSet(refPath, data) {
    if (!database || !currentUser) {
        console.log("⚠️ Firebase not available or user not authenticated, data saved locally only");
        return false;
    }
    
    try {
        const ref = getDatabaseRef(refPath);
        await ref.set(data);
        return true;
    } catch (error) {
        console.error(`❌ Firebase set error at ${refPath}:`, error);
        return false;
    }
}

async function firebaseUpdate(refPath, data) {
    if (!database || !currentUser) {
        console.log("⚠️ Firebase not available or user not authenticated, data saved locally only");
        return false;
    }
    
    try {
        const ref = getDatabaseRef(refPath);
        await ref.update(data);
        return true;
    } catch (error) {
        console.error(`❌ Firebase update error at ${refPath}:`, error);
        return false;
    }
}

async function firebaseIncrement(refPath, maxVal = null) {
    if (!database || !currentUser) {
        console.log("⚠️ Firebase not available or user not authenticated");
        return null;
    }

    return new Promise((resolve, reject) => {
        const ref = getDatabaseRef(refPath);
        ref.transaction((current) => {
            const base = parseInt(current || 0, 10) || 0;
            let next = base + 1;
            if (maxVal !== null) next = Math.min(next, maxVal);
            return next;
        }, (error, committed, snapshot) => {
            if (error) return reject(error);
            if (!committed) return resolve(snapshot ? snapshot.val() : null);
            return resolve(snapshot ? snapshot.val() : null);
        });
    });
}

async function firebaseRemove(refPath) {
    if (!database || !currentUser) {
        console.log("⚠️ Firebase not available or user not authenticated");
        return false;
    }
    
    try {
        const ref = getDatabaseRef(refPath);
        await ref.remove();
        return true;
    } catch (error) {
        console.error(`❌ Firebase remove error at ${refPath}:`, error);
        return false;
    }
}

// ========== LIVE ACTIVITY FEED (STUDENT -> TEACHER) ==========
async function logLiveActivity(type, payload = {}) {
    if (!database || !currentUser || !currentUserId) return;

    const classCodes = [];
    if (currentClassCode) {
        classCodes.push(currentClassCode);
    } else if (userClasses && userClasses.length > 0) {
        userClasses.forEach(c => c.code && classCodes.push(c.code));
    }

    if (classCodes.length === 0) return;

    const activity = {
        type: type || 'activity',
        studentId: currentUserId,
        studentName: currentUserName || 'Student',
        firebaseUid: currentUser.uid || null,
        createdAt: new Date().toISOString(),
        ...payload
    };

    try {
        await Promise.all(classCodes.map(code => {
            const ref = database.ref(`classActivity/${code}`).push();
            return ref.set(activity);
        }));
    } catch (e) {
        console.warn("Live activity write failed:", e);
    }
}

// ========== QUICK NOTES + FOCUS MODE ==========
const QUICK_NOTES_KEY = 'studentQuickNotes';
const FOCUS_MODE_KEY = 'studentFocusMode';
let quickNotesSaveTimer = null;

function isTypingTarget(target) {
    return target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
}

function updateQuickNotesStatus(text) {
    const statusEl = document.getElementById('quickNotesStatus');
    if (statusEl) statusEl.textContent = text;
}

function saveQuickNotes() {
    const input = document.getElementById('quickNotesInput');
    if (!input) return;

    localStorage.setItem(QUICK_NOTES_KEY, input.value);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    updateQuickNotesStatus(`Saved ${time}`);
}

function initializeQuickNotes() {
    const input = document.getElementById('quickNotesInput');
    if (!input) return;

    input.value = localStorage.getItem(QUICK_NOTES_KEY) || '';
    updateQuickNotesStatus(input.value ? 'Loaded' : 'Saved');

    input.addEventListener('input', () => {
        updateQuickNotesStatus('Saving...');
        if (quickNotesSaveTimer) clearTimeout(quickNotesSaveTimer);
        quickNotesSaveTimer = setTimeout(saveQuickNotes, 400);
    });

    document.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.key.toLowerCase() === 'n') {
            if (isTypingTarget(document.activeElement)) return;
            e.preventDefault();
            input.focus();
        }
    });
}

function copyQuickNotes() {
    const input = document.getElementById('quickNotesInput');
    if (!input) return;

    if (!input.value.trim()) {
        showNotification("Notes are empty.", "info");
        return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(input.value).then(() => {
            showNotification("Notes copied to clipboard.", "success");
        }).catch(() => {
            showNotification("Couldn't copy notes. Try again.", "error");
        });
        return;
    }

    const temp = document.createElement('textarea');
    temp.value = input.value;
    document.body.appendChild(temp);
    temp.select();
    try {
        document.execCommand('copy');
        showNotification("Notes copied to clipboard.", "success");
    } catch (err) {
        showNotification("Couldn't copy notes. Try again.", "error");
    } finally {
        document.body.removeChild(temp);
    }
}

function clearQuickNotes() {
    const input = document.getElementById('quickNotesInput');
    if (!input) return;

    if (!input.value.trim()) {
        showNotification("Notes are already empty.", "info");
        return;
    }

    input.value = '';
    saveQuickNotes();
    showNotification("Notes cleared.", "success");
}

function setFocusMode(isOn) {
    document.body.classList.toggle('focus-mode', isOn);
    localStorage.setItem(FOCUS_MODE_KEY, isOn ? 'true' : 'false');

    const btn = document.getElementById('focusModeBtn');
    if (btn) {
        btn.textContent = isOn ? 'Exit Focus' : 'Focus Portal';
        btn.title = 'Shift+F';
    }
    updateCommitmentUI();
}

function toggleFocusMode() {
    const entering = !document.body.classList.contains('focus-mode');
    setFocusMode(entering);
    if (entering) {
        playPortalSwoosh();
        triggerPortalEntry();
    }
}

function initializeFocusMode() {
    const saved = localStorage.getItem(FOCUS_MODE_KEY) === 'true';
    setFocusMode(saved);

    document.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.key.toLowerCase() === 'f') {
            if (isTypingTarget(document.activeElement)) return;
            e.preventDefault();
            toggleFocusMode();
        }
    });
}

// ========== FOCUS TOOLKIT ==========
const FOCUS_STATE_KEY = 'studentFocusTimer';
const FOCUS_SESSIONS_KEY = 'studentFocusSessions';
const BRAIN_DUMP_KEY = 'studentBrainDump';
const BLOCKER_KEY = 'studentDistractionBlocker';
const BLOCKER_ENABLED_KEY = 'studentDistractionBlockerEnabled';
const FOCUS_GOAL_KEY = 'studentFocusGoal';
const IDENTITY_KEY = 'studentFutureIdentity';
const ENERGY_LOG_KEY = 'studentEnergyLog';
const RITUAL_KEY = 'studentRitualState';
const TREE_KEY = 'studentGrowthTreeLevel';
const TREE_LAST_KEY = 'studentGrowthTreeLastDate';
const TEACH_LAST_KEY = 'studentTeachLastDate';
const TEACH_AUDIO_KEY = 'studentTeachAudioDuration';
const FOCUS_COMMITMENT_KEY = 'studentFocusCommitment';
const EMERGENCY_UNLOCK_KEY = 'studentEmergencyUnlockAt';

let focusTimerState = {
    mode: 'focus',
    focusMinutes: 50,
    breakMinutes: 10,
    remainingSeconds: 3000,
    running: false
};
let focusTimerInterval = null;
let focusAudioContext = null;
let focusSoundNodes = [];
let fullscreenGuardActive = false;
let teachRecorder = null;
let teachAudioChunks = [];
let teachRecordingSeconds = 0;
let teachRecordingTimer = null;
let portalOverlayTimer = null;

function loadFocusTimerState() {
    const saved = localStorage.getItem(FOCUS_STATE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            focusTimerState = { ...focusTimerState, ...parsed };
        } catch (e) { /* ignore */ }
    }
}

function saveFocusTimerState() {
    localStorage.setItem(FOCUS_STATE_KEY, JSON.stringify(focusTimerState));
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.max(0, seconds % 60);
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function updateFocusTimerUI() {
    const display = document.getElementById('focusTimerDisplay');
    const modeEl = document.getElementById('focusTimerMode');
    const nextBreakEl = document.getElementById('focusNextBreak');
    if (display) display.textContent = formatTime(focusTimerState.remainingSeconds);
    if (modeEl) modeEl.textContent = focusTimerState.mode === 'focus' ? 'Focus' : 'Break';
    if (nextBreakEl) nextBreakEl.textContent = `${focusTimerState.breakMinutes}m`;
}

function getSessionsData() {
    const raw = localStorage.getItem(FOCUS_SESSIONS_KEY);
    if (!raw) return { sessionsByDate: {}, streak: 0 };
    try {
        return JSON.parse(raw);
    } catch (e) {
        return { sessionsByDate: {}, streak: 0 };
    }
}

function saveSessionsData(data) {
    localStorage.setItem(FOCUS_SESSIONS_KEY, JSON.stringify(data));
}

function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
}

function updateFocusMetrics() {
    const data = getSessionsData();
    const today = getTodayKey();
    const todayCount = data.sessionsByDate[today] || 0;

    const sessionsEl = document.getElementById('focusSessionsToday');
    const streakEl = document.getElementById('focusStreak');
    if (sessionsEl) sessionsEl.textContent = todayCount;
    if (streakEl) streakEl.textContent = data.streak || 0;
    updateFocusGoalProgress(todayCount);
}

function getFocusGoal() {
    const stored = Number(localStorage.getItem(FOCUS_GOAL_KEY));
    return stored > 0 ? stored : 3;
}

function saveFocusGoal() {
    const input = document.getElementById('focusGoalInput');
    if (!input) return;
    const value = Math.max(1, Math.min(12, Number(input.value) || 3));
    localStorage.setItem(FOCUS_GOAL_KEY, String(value));
    updateFocusGoalProgress();
    showNotification("Focus goal updated.", "success");
}

function updateFocusGoalProgress(forcedCount) {
    const goal = getFocusGoal();
    const data = getSessionsData();
    const today = getTodayKey();
    const count = typeof forcedCount === 'number' ? forcedCount : (data.sessionsByDate[today] || 0);
    const progressEl = document.getElementById('focusGoalProgress');
    const msgEl = document.getElementById('focusGoalMessage');
    if (progressEl) progressEl.textContent = `${count} / ${goal}`;
    if (msgEl) msgEl.textContent = count >= goal ? 'Goal hit. Great work.' : `${goal - count} to go`;
}

function initializeFutureIdentity() {
    const input = document.getElementById('futureIdentityInput');
    const output = document.getElementById('futureIdentityText');
    if (!input || !output) return;
    const saved = localStorage.getItem(IDENTITY_KEY) || '';
    input.value = saved;
    output.textContent = saved ? `You’re building ${saved}.` : 'You’re building Future You.';
    input.addEventListener('input', () => {
        const value = input.value.trim();
        localStorage.setItem(IDENTITY_KEY, value);
        output.textContent = value ? `You’re building ${value}.` : 'You’re building Future You.';
    });
}

function saveFutureIdentity() {
    const input = document.getElementById('futureIdentityInput');
    const output = document.getElementById('futureIdentityText');
    if (!input || !output) return;
    const value = input.value.trim();
    localStorage.setItem(IDENTITY_KEY, value);
    output.textContent = value ? `You’re building ${value}.` : 'You’re building Future You.';
    showNotification("Identity saved.", "success");
}

function completeFocusSession() {
    const data = getSessionsData();
    const today = getTodayKey();
    data.sessionsByDate[today] = (data.sessionsByDate[today] || 0) + 1;

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (data.sessionsByDate[yesterday]) {
        data.streak = (data.streak || 0) + 1;
    } else if (!data.sessionsByDate[today] || data.sessionsByDate[today] === 1) {
        data.streak = 1;
    }

    saveSessionsData(data);
    updateFocusMetrics();
}

function tickFocusTimer() {
    if (!focusTimerState.running) return;
    focusTimerState.remainingSeconds -= 1;
    if (focusTimerState.remainingSeconds <= 0) {
        if (focusTimerState.mode === 'focus') {
            completeFocusSession();
            focusTimerState.mode = 'break';
            focusTimerState.remainingSeconds = focusTimerState.breakMinutes * 60;
            showNotification("Break time. Recharge quickly.", "info");
        } else {
            focusTimerState.mode = 'focus';
            focusTimerState.remainingSeconds = focusTimerState.focusMinutes * 60;
            showNotification("Back to focus. You got this.", "success");
        }
    }
    updateFocusTimerUI();
    saveFocusTimerState();
}

function startFocusTimer() {
    const focusInput = document.getElementById('focusMinutes');
    const breakInput = document.getElementById('breakMinutes');
    if (focusInput && breakInput) {
        focusTimerState.focusMinutes = Math.max(25, Number(focusInput.value) || 50);
        focusTimerState.breakMinutes = Math.max(5, Number(breakInput.value) || 10);
    }
    if (!focusTimerState.running) {
        focusTimerState.running = true;
        focusTimerInterval = setInterval(tickFocusTimer, 1000);
    }
    if (focusTimerState.remainingSeconds <= 0) {
        focusTimerState.remainingSeconds = focusTimerState.focusMinutes * 60;
    }
    saveFocusTimerState();
    updateFocusTimerUI();
}

function pauseFocusTimer() {
    focusTimerState.running = false;
    if (focusTimerInterval) {
        clearInterval(focusTimerInterval);
        focusTimerInterval = null;
    }
    saveFocusTimerState();
}

function resetFocusTimer() {
    pauseFocusTimer();
    focusTimerState.mode = 'focus';
    focusTimerState.remainingSeconds = focusTimerState.focusMinutes * 60;
    saveFocusTimerState();
    updateFocusTimerUI();
}

function renderBlockedSites() {
    const listEl = document.getElementById('blockedSitesList');
    if (!listEl) return;
    const raw = localStorage.getItem(BLOCKER_KEY);
    const items = raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : [];
    listEl.innerHTML = items.length ? items.map(item => `<span>${item}</span>`).join('') : '<span>No sites listed yet.</span>';
}

function toggleDistractionBlocker() {
    const current = localStorage.getItem(BLOCKER_KEY) || '';
    const input = document.getElementById('blockedSitesInput');
    if (input && input.value.trim()) {
        localStorage.setItem(BLOCKER_KEY, input.value.trim());
    }
    const enabled = document.body.classList.toggle('focus-blocker-enabled');
    localStorage.setItem(BLOCKER_ENABLED_KEY, enabled ? 'true' : 'false');
    const btn = document.getElementById('blockerToggleBtn');
    if (btn) btn.textContent = enabled ? 'Disable Blocker' : 'Enable Blocker';
    if (enabled) {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        enterFocusFullscreen();
    }
    if (!enabled) {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        exitFocusFullscreen();
    }
    showNotification(enabled ? "Distraction blocker enabled." : "Distraction blocker disabled.", "info");
    renderBlockedSites();
}

function loadBlockerState() {
    const input = document.getElementById('blockedSitesInput');
    const saved = localStorage.getItem(BLOCKER_KEY);
    if (input && saved) input.value = saved;
    const enabled = localStorage.getItem(BLOCKER_ENABLED_KEY) === 'true';
    document.body.classList.toggle('focus-blocker-enabled', enabled);
    const btn = document.getElementById('blockerToggleBtn');
    if (btn) btn.textContent = enabled ? 'Disable Blocker' : 'Enable Blocker';
    if (enabled) {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        enterFocusFullscreen();
    }
    renderBlockedSites();
}

function getCommitment() {
    const raw = localStorage.getItem(FOCUS_COMMITMENT_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

function setCommitment(commitment) {
    if (commitment) {
        localStorage.setItem(FOCUS_COMMITMENT_KEY, JSON.stringify(commitment));
    } else {
        localStorage.removeItem(FOCUS_COMMITMENT_KEY);
    }
    updateCommitmentUI();
}

function updateCommitmentUI() {
    const banner = document.getElementById('focusLockBanner');
    const status = document.getElementById('focusCommitStatus');
    const commitment = getCommitment();
    if (!commitment || Date.now() > commitment.endAt) {
        if (commitment && Date.now() > commitment.endAt) {
            setCommitment(null);
        }
        if (banner) banner.style.display = 'none';
        if (status) status.textContent = 'No active commitment';
        return;
    }
    const minutesLeft = Math.ceil((commitment.endAt - Date.now()) / 60000);
    if (banner) {
        banner.style.display = 'block';
        banner.textContent = `Locked in: ${commitment.topic} · ${minutesLeft} min remaining`;
    }
    if (status) status.textContent = `Active: ${commitment.topic}`;
}

function startFocusCommitment() {
    const topicInput = document.getElementById('focusTopic');
    const minutesInput = document.getElementById('focusCommitMinutes');
    const topic = topicInput ? topicInput.value.trim() : '';
    const minutes = minutesInput ? Number(minutesInput.value) : 0;
    if (!topic) {
        showNotification("Enter what you're studying first.", "error");
        return;
    }
    if (!minutes || minutes < 15) {
        showNotification("Commitment must be at least 15 minutes.", "error");
        return;
    }
    const commitment = {
        topic,
        startAt: Date.now(),
        endAt: Date.now() + minutes * 60000
    };
    setCommitment(commitment);
    setFocusMode(true);
    startFocusTimer();
    showNotification("Commitment locked in. Stay focused.", "success");
}

function requestEmergencyUnlock() {
    const unlockAt = Date.now() + 60000;
    localStorage.setItem(EMERGENCY_UNLOCK_KEY, String(unlockAt));
    updateEmergencyUnlockTimer();
    showNotification("Emergency unlock available in 60 seconds.", "warning");
}

function canExitFocusMode() {
    const commitment = getCommitment();
    const blockerEnabled = document.body.classList.contains('focus-blocker-enabled');
    const commitmentActive = commitment && Date.now() <= commitment.endAt;
    if (!commitmentActive && !blockerEnabled) {
        return true;
    }
    const unlockAt = Number(localStorage.getItem(EMERGENCY_UNLOCK_KEY)) || 0;
    if (unlockAt && Date.now() >= unlockAt) {
        return true;
    }
    if (!unlockAt) requestEmergencyUnlock();
    return false;
}

function updateEmergencyUnlockTimer() {
    const timerEl = document.getElementById('emergencyUnlockTimer');
    const unlockAt = Number(localStorage.getItem(EMERGENCY_UNLOCK_KEY)) || 0;
    if (!timerEl) return;
    if (!unlockAt) {
        timerEl.textContent = '';
        return;
    }
    const secondsLeft = Math.max(0, Math.ceil((unlockAt - Date.now()) / 1000));
    timerEl.textContent = secondsLeft > 0 ? `Unlock in ${secondsLeft}s` : 'Unlock ready';
}

function initializeEmergencyUnlockTicker() {
    setInterval(updateEmergencyUnlockTimer, 1000);
}

function toggleFocusMode() {
    if (document.body.classList.contains('focus-mode')) {
        if (!canExitFocusMode()) {
            showNotification("Commitment active. Emergency unlock required.", "warning");
            return;
        }
        localStorage.removeItem(EMERGENCY_UNLOCK_KEY);
        if (document.body.classList.contains('focus-blocker-enabled')) {
            showNotification("Disable the distraction blocker before exiting focus mode.", "warning");
            return;
        }
    }
    setFocusMode(!document.body.classList.contains('focus-mode'));
}

function createNoiseBuffer(context) {
    const bufferSize = 2 * context.sampleRate;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
        data[i] = Math.random() * 2 - 1;
    }
    return buffer;
}

function stopFocusSound() {
    focusSoundNodes.forEach(node => {
        try { node.stop && node.stop(); } catch (e) { /* ignore */ }
        try { node.disconnect && node.disconnect(); } catch (e) { /* ignore */ }
    });
    focusSoundNodes = [];
    if (focusAudioContext) {
        focusAudioContext.close().catch(() => {});
        focusAudioContext = null;
    }
    document.querySelectorAll('.sound-chip').forEach(btn => btn.classList.remove('active'));
}

function startFocusSound(type) {
    stopFocusSound();
    focusAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    const gain = focusAudioContext.createGain();
    const volume = document.getElementById('soundVolume');
    gain.gain.value = volume ? Number(volume.value) / 100 : 0.35;
    gain.connect(focusAudioContext.destination);

    if (type === 'music') {
        const osc1 = focusAudioContext.createOscillator();
        const osc2 = focusAudioContext.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.value = 220;
        osc2.frequency.value = 330;
        osc1.connect(gain);
        osc2.connect(gain);
        osc1.start();
        osc2.start();
        focusSoundNodes.push(osc1, osc2, gain);
    } else {
        const noise = focusAudioContext.createBufferSource();
        noise.buffer = createNoiseBuffer(focusAudioContext);
        noise.loop = true;
        const filter = focusAudioContext.createBiquadFilter();
        filter.type = type === 'brown' ? 'lowpass' : 'bandpass';
        filter.frequency.value = type === 'rain' ? 800 : 1200;
        noise.connect(filter);
        filter.connect(gain);
        noise.start();
        focusSoundNodes.push(noise, filter, gain);
    }

    document.querySelectorAll('.sound-chip').forEach(btn => {
        const label = btn.textContent.toLowerCase();
        if ((type === 'music' && label.includes('instrumental')) || (type !== 'music' && label.includes(type))) {
            btn.classList.add('active');
        }
    });
}

function updateSoundVolume() {
    const volume = document.getElementById('soundVolume');
    if (!volume || !focusAudioContext) return;
    focusSoundNodes.forEach(node => {
        if (node.gain) node.gain.value = Number(volume.value) / 100;
    });
}

function loadBrainDump() {
    const raw = localStorage.getItem(BRAIN_DUMP_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch (e) {
        return [];
    }
}

function saveBrainDump(items) {
    localStorage.setItem(BRAIN_DUMP_KEY, JSON.stringify(items));
}

function renderBrainDump() {
    const list = document.getElementById('brainDumpList');
    if (!list) return;
    const items = loadBrainDump();
    list.innerHTML = items.length ? items.map((item, index) => `
        <div class="brain-dump-item">
          <span>${escapeHtml(item)}</span>
          <button class="btn btn-secondary" onclick="removeBrainDumpItem(${index})">Done</button>
        </div>
    `).join('') : '<div style="color: var(--text-muted); font-size: 0.85rem;">Nothing dumped yet.</div>';
}

function addBrainDumpItem() {
    const input = document.getElementById('brainDumpInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    const items = loadBrainDump();
    items.unshift(text);
    saveBrainDump(items);
    input.value = '';
    renderBrainDump();
}

function removeBrainDumpItem(index) {
    const items = loadBrainDump();
    items.splice(index, 1);
    saveBrainDump(items);
    renderBrainDump();
}

function clearBrainDump() {
    saveBrainDump([]);
    renderBrainDump();
}

function initializeFocusToolkit() {
    loadFocusTimerState();
    if (!focusTimerState.running) {
        focusTimerState.remainingSeconds = (focusTimerState.mode === 'break' ? focusTimerState.breakMinutes : focusTimerState.focusMinutes) * 60;
        saveFocusTimerState();
    }
    const focusInput = document.getElementById('focusMinutes');
    const breakInput = document.getElementById('breakMinutes');
    if (focusInput) focusInput.value = focusTimerState.focusMinutes;
    if (breakInput) breakInput.value = focusTimerState.breakMinutes;
    updateFocusTimerUI();
    updateFocusMetrics();
    updateCommitmentUI();
    loadBlockerState();
    renderBrainDump();
    initializeEmergencyUnlockTicker();

    const goalInput = document.getElementById('focusGoalInput');
    if (goalInput) {
        goalInput.value = getFocusGoal();
        updateFocusGoalProgress();
    }

    initializeFutureIdentity();

    if (focusTimerState.running && !focusTimerInterval) {
        focusTimerInterval = setInterval(tickFocusTimer, 1000);
    }

    const soundVolume = document.getElementById('soundVolume');
    if (soundVolume) soundVolume.addEventListener('input', updateSoundVolume);

    const brainInput = document.getElementById('brainDumpInput');
    if (brainInput) {
        brainInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addBrainDumpItem();
            }
        });
    }

    const blockedInput = document.getElementById('blockedSitesInput');
    if (blockedInput) {
        blockedInput.addEventListener('change', () => {
            if (blockedInput.value.trim()) {
                localStorage.setItem(BLOCKER_KEY, blockedInput.value.trim());
            }
            renderBlockedSites();
        });
    }

    initializeEnergyTracker();
    initializeRitualBuilder();
    updateGrowthTreeUI();

    document.addEventListener('fullscreenchange', () => {
        if (document.body.classList.contains('focus-blocker-enabled') && !document.fullscreenElement) {
            enterFocusFullscreen();
        }
    });

    window.addEventListener('beforeunload', (e) => {
        if (document.body.classList.contains('focus-blocker-enabled')) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

function playPortalSwoosh() {
    const audio = document.getElementById('portalSwoosh');
    const tryPlay = (el) => {
        if (!el) return false;
        el.currentTime = 0;
        el.volume = 0.7;
        el.play().catch(() => {});
        return true;
    };
    if (tryPlay(audio)) return;
    const fallback = new Audio('portal.mp3');
    fallback.volume = 0.7;
    fallback.play().catch(() => {});
}

function triggerPortalEntry() {
    const overlay = document.getElementById('portalOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    void overlay.offsetWidth;
    overlay.classList.add('active');
    if (portalOverlayTimer) clearTimeout(portalOverlayTimer);
    portalOverlayTimer = setTimeout(() => {
        overlay.classList.remove('active');
    }, 1800);
}

// ===== Mental Energy Tracker =====
function getEnergyLog() {
    const raw = localStorage.getItem(ENERGY_LOG_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch (e) {
        return [];
    }
}

function saveEnergyLog(entries) {
    localStorage.setItem(ENERGY_LOG_KEY, JSON.stringify(entries));
}

function logEnergy(score) {
    const entries = getEnergyLog();
    entries.push({ score, hour: new Date().getHours(), ts: Date.now() });
    saveEnergyLog(entries);
    updateEnergyInsight();
    showNotification("Energy logged.", "success");
}

function getPeakHour(entries) {
    const buckets = {};
    entries.forEach(entry => {
        if (!buckets[entry.hour]) buckets[entry.hour] = { total: 0, count: 0 };
        buckets[entry.hour].total += entry.score;
        buckets[entry.hour].count += 1;
    });
    let bestHour = null;
    let bestAvg = -1;
    Object.keys(buckets).forEach(hourKey => {
        const avg = buckets[hourKey].total / buckets[hourKey].count;
        if (avg > bestAvg) {
            bestAvg = avg;
            bestHour = Number(hourKey);
        }
    });
    return { hour: bestHour, avg: bestAvg };
}

function updateEnergyInsight() {
    const insightEl = document.getElementById('energyInsight');
    const hardestInput = document.getElementById('hardestSubjectInput');
    if (!insightEl) return;
    const entries = getEnergyLog();
    if (entries.length < 3) {
        insightEl.textContent = 'Log a few sessions to find your peak hour.';
        return;
    }
    const peak = getPeakHour(entries);
    if (peak.hour === null) return;
    const nowHour = new Date().getHours();
    const subject = hardestInput ? hardestInput.value.trim() : '';
    if (nowHour === peak.hour && subject) {
        insightEl.textContent = `Peak hour now. Tackle: ${subject}.`;
    } else {
        insightEl.textContent = `Peak hour: ${peak.hour}:00 (${peak.avg.toFixed(1)}/5). Schedule hard work then.`;
    }
}

function initializeEnergyTracker() {
    const hardestInput = document.getElementById('hardestSubjectInput');
    if (hardestInput) {
        const saved = localStorage.getItem('studentHardestSubject') || '';
        hardestInput.value = saved;
        hardestInput.addEventListener('input', () => {
            localStorage.setItem('studentHardestSubject', hardestInput.value.trim());
            updateEnergyInsight();
        });
    }
    updateEnergyInsight();
}

// ===== Study Ritual Builder =====
function loadRitualState() {
    const raw = localStorage.getItem(RITUAL_KEY);
    if (!raw) return { sound: false, water: false, stretch: false, desk: false };
    try {
        return JSON.parse(raw);
    } catch (e) {
        return { sound: false, water: false, stretch: false, desk: false };
    }
}

function saveRitualState(state) {
    localStorage.setItem(RITUAL_KEY, JSON.stringify(state));
}

function initializeRitualBuilder() {
    const state = loadRitualState();
    const map = [
        { key: 'sound', id: 'ritualSound' },
        { key: 'water', id: 'ritualWater' },
        { key: 'stretch', id: 'ritualStretch' },
        { key: 'desk', id: 'ritualDesk' }
    ];
    map.forEach(item => {
        const el = document.getElementById(item.id);
        if (!el) return;
        el.checked = Boolean(state[item.key]);
        el.addEventListener('change', () => {
            const updated = loadRitualState();
            updated[item.key] = el.checked;
            saveRitualState(updated);
        });
    });
}

function completeRitual() {
    const status = document.getElementById('ritualStatus');
    if (status) status.textContent = 'Ritual complete. Ready to focus.';
    showNotification("Ritual complete. Start your session.", "success");
}

function resetRitual() {
    saveRitualState({ sound: false, water: false, stretch: false, desk: false });
    initializeRitualBuilder();
    const status = document.getElementById('ritualStatus');
    if (status) status.textContent = 'Ritual not started';
}

// ===== Growth Tree (shared) =====
function getTreeLevel() {
    return Number(localStorage.getItem(TREE_KEY)) || 0;
}

function setTreeLevel(level) {
    localStorage.setItem(TREE_KEY, String(Math.max(0, level)));
}

function applyTreeDecay() {
    const last = localStorage.getItem(TREE_LAST_KEY);
    if (!last) return;
    const lastDate = new Date(last);
    const today = new Date();
    const diffDays = Math.floor((today - lastDate) / 86400000);
    if (diffDays >= 1) {
        const newLevel = Math.max(0, getTreeLevel() - diffDays);
        setTreeLevel(newLevel);
        localStorage.setItem(TREE_LAST_KEY, today.toISOString().slice(0, 10));
    }
}

function getTreeEmoji(level) {
    if (level <= 0) return '🌱';
    if (level <= 2) return '🌿';
    if (level <= 4) return '🌳';
    if (level <= 7) return '🌲';
    return '🌴';
}

function updateGrowthTreeUI() {
    applyTreeDecay();
    const level = getTreeLevel();
    const treeEl = document.getElementById('growthTree');
    const statusEl = document.getElementById('growthTreeStatus');
    if (treeEl) treeEl.textContent = getTreeEmoji(level);
    if (statusEl) statusEl.textContent = `Tree level: ${level}. Complete Learn By Teaching to grow.`;
}

function growTree() {
    const level = getTreeLevel() + 1;
    setTreeLevel(level);
    localStorage.setItem(TREE_LAST_KEY, new Date().toISOString().slice(0, 10));
    updateGrowthTreeUI();
}

// ===== Learn By Teaching =====
function countTeachBullets() {
    let count = 0;
    for (let i = 1; i <= 5; i += 1) {
        const el = document.getElementById(`teachBullet${i}`);
        if (el && el.value.trim()) count += 1;
    }
    return count;
}

async function toggleTeachRecording() {
    const btn = document.getElementById('teachRecordBtn');
    const status = document.getElementById('teachRecordStatus');
    if (!btn || !status) return;
    if (teachRecorder && teachRecorder.state === 'recording') {
        teachRecorder.stop();
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        teachRecorder = new MediaRecorder(stream);
        teachAudioChunks = [];
        teachRecordingSeconds = 0;
        status.textContent = 'Recording...';
        btn.textContent = 'Stop Recording';
        teachRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) teachAudioChunks.push(e.data);
        };
        teachRecorder.onstop = () => {
            stream.getTracks().forEach(track => track.stop());
            const blob = new Blob(teachAudioChunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            const audioEl = document.getElementById('teachPlayback');
            if (audioEl) {
                audioEl.src = url;
                audioEl.style.display = 'block';
            }
            localStorage.setItem(TEACH_AUDIO_KEY, String(teachRecordingSeconds));
            status.textContent = `Recorded ${teachRecordingSeconds}s`;
            btn.textContent = 'Start Recording';
            if (teachRecordingTimer) clearInterval(teachRecordingTimer);
            teachRecordingTimer = null;
        };
        teachRecorder.start();
        teachRecordingTimer = setInterval(() => {
            teachRecordingSeconds += 1;
            status.textContent = `Recording... ${teachRecordingSeconds}s`;
        }, 1000);
    } catch (err) {
        showNotification("Microphone permission needed for recording.", "error");
    }
}

function completeTeachMode() {
    const bullets = countTeachBullets();
    const recordingSeconds = Number(localStorage.getItem(TEACH_AUDIO_KEY)) || 0;
    if (bullets < 5 && recordingSeconds < 60) {
        showNotification("Add 5 bullets or record 60 seconds.", "warning");
        return;
    }
    localStorage.setItem(TEACH_LAST_KEY, new Date().toISOString().slice(0, 10));
    growTree();
    const status = document.getElementById('teachModeStatus');
    if (status) status.textContent = 'Great explanation. Tree grew.';
    showNotification("Teach mode complete. Tree grew.", "success");
}

function enterFocusFullscreen() {
    if (fullscreenGuardActive) return;
    fullscreenGuardActive = true;
    document.body.classList.add('focus-fullscreen');
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
    }
    setTimeout(() => { fullscreenGuardActive = false; }, 500);
}

function exitFocusFullscreen() {
    document.body.classList.remove('focus-fullscreen');
    if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
    }
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async function() {
    console.log("🎓 Student Mode initializing...");
    
    // FIRST: Load persisted data BEFORE Firebase initialization
    initLocalStorageSchema();
    const dataLoaded = loadPersistedData();
    console.log("📂 Data loaded from localStorage:", dataLoaded);
    
    try {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        auth = firebase.auth();
        
        console.log("✅ Firebase initialized successfully");
        
        // Check if we have a user ID from persisted data
        if (!currentUserId) {
            const savedUserId = localStorage.getItem('studentUserId');
            if (savedUserId && savedUserId.startsWith('student_')) {
                currentUserId = savedUserId;
                console.log("🆔 Loaded user ID from localStorage:", currentUserId);
            } else {
                currentUserId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem('studentUserId', currentUserId);
                console.log("🆕 Generated new persistent user ID:", currentUserId);
            }
        }
        
        // Set user name from persisted data or localStorage
        const savedName = localStorage.getItem('studentName');
        if (savedName) {
            currentUserName = savedName;
        }
        
        console.log("👤 Current user info:", {
            id: currentUserId,
            name: currentUserName,
            streak: studyData.streak,
            hours: studyData.totalStudyHours
        });

        captureReferralFromUrl();
        
        try {
            // Try anonymous authentication
            console.log("🔐 Attempting anonymous sign-in...");
            const userCredential = await auth.signInAnonymously();
            currentUser = userCredential.user;
            
            console.log("✅ Anonymous authentication successful");
            console.log("📝 Firebase UID:", currentUser.uid);
            console.log("📝 Our Student ID:", currentUserId);
            
            localStorage.setItem('studentFirebaseUid', currentUser.uid);
            retryPendingReferralCredit();
            
        } catch (authError) {
            console.error("❌ Anonymous sign-in failed:", authError);
            console.log("⚠️ Using offline mode only");
            showNotification("⚠️ Working in offline mode. Data saved locally.", "warning");
        }

        await syncReferralCountFromFirebase();
        setupReferralNotifications();
        
        // Initialize the app
        initUI();
        loadAllData();
        setupEventListeners();
        initializeQuickNotes();
        initializeFocusMode();
        initializeFocusToolkit();
        setupAutoSave();
        setupChartAutoRefresh();
        



      


        // Update UI with loaded data
        updateUI();
        updateStreakUI();
        updateAllStatistics();
        
        console.log("🎓 Student Mode ready!");
        console.log("📊 Loaded data:", {
            streak: studyData.streak,
            hours: studyData.totalStudyHours,
            tasks: tasks.length,
            assignments: assignments.length,
            classes: userClasses.length
        });
        
        setTimeout(() => {
            showNotification(`Welcome back, ${currentUserName}! 📚 Streak: ${studyData.streak} days`, "success");
        }, 1000);
        
    } catch (error) {
        console.error("❌ Initialization error:", error);
        
        // Fallback: Ensure we have a user ID even if everything fails
        if (!currentUserId) {
            const savedUserId = localStorage.getItem('studentUserId');
            if (savedUserId && savedUserId.startsWith('student_')) {
                currentUserId = savedUserId;
            } else {
                currentUserId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem('studentUserId', currentUserId);
            }
        }
        
        // Initialize in offline mode
        initUI();
        loadAllData();
        setupEventListeners();
        setupAutoSave();
        setupChartAutoRefresh();
        
        updateUI();
        updateStreakUI();
        updateAllStatistics();
        
        showNotification("⚠️ Working in offline mode. Data saved locally.", "warning");
    }
      // Initialize memory wall functions
    console.log("Initializing memory wall system...");
    
    // Check if student memory wall exists
    const studentMemoryWall = document.getElementById('studentMemoryWall');
    if (studentMemoryWall) {
        console.log("Student memory wall system ready");
    }
});

// ========== AUTO-SAVE SYSTEM ==========
function setupAutoSave() {
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
            persistData();
        }
    });
    
    window.addEventListener('beforeunload', function() {
        persistData();
    });
    
    setInterval(persistData, 30000);
    
    console.log("💾 Auto-save system initialized");
}

// ========== CHART AUTO-REFRESH ==========
function setupChartAutoRefresh() {
    if (chartRefreshInterval) {
        clearInterval(chartRefreshInterval);
    }
    
    chartRefreshInterval = setInterval(() => {
        if (currentSection === 'statistics') {
            console.log("🔄 Auto-refreshing charts...");
            refreshChartsSilently();
        }
    }, 300000);
    
    console.log("📈 Chart auto-refresh system initialized");
}

function refreshChartsSilently() {
    if (currentSection === 'statistics') {
        updateCharts();
        updateSyncStatus("Charts updated", "success");
    }
}

// ========== USER DATA MANAGEMENT ==========
function loadUserData() {
    const savedUserId = localStorage.getItem('studentUserId');
    if (savedUserId && savedUserId.startsWith('student_')) {
        currentUserId = savedUserId;
    } else if (!currentUserId) {
        currentUserId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('studentUserId', currentUserId);
    }
    
    currentUserName = localStorage.getItem('studentName') || 'Student';
    
    const savedClasses = localStorage.getItem('studentUserClasses');
    if (savedClasses) {
        try {
            userClasses = JSON.parse(savedClasses);
            console.log(`📚 Loaded ${userClasses.length} classes from localStorage`);
            
            if (userClasses.length > 0 && !currentClassCode) {
                currentClassCode = userClasses[0].code;
                selectedClassIndex = 0;
            }
        } catch (e) {
            console.error("Error parsing user classes:", e);
            userClasses = [];
        }
    }
    
    const nameField = document.getElementById('studentName');
    if (nameField) nameField.value = currentUserName;
    
    const profileNameField = document.getElementById('profileName');
    if (profileNameField) profileNameField.value = currentUserName;
}

function saveUserData() {
    if (currentUserId) {
        localStorage.setItem('studentUserId', currentUserId);
    }
    
    if (currentUserName) {
        localStorage.setItem('studentName', currentUserName);
    }
    
    if (userClasses.length > 0) {
        localStorage.setItem('studentUserClasses', JSON.stringify(userClasses));
    }
    
    persistData();
    
    console.log("💾 User data saved:", {
        userId: currentUserId,
        name: currentUserName,
        classesCount: userClasses.length
    });
}

// ========== IMPROVED STREAK SYSTEM ==========
function updateStreakUI() {
    const streakNumber = document.getElementById('streakNumber');
    const streakLabel = document.getElementById('streakLabel');
    const streakProgressFill = document.getElementById('streakProgressFill');
    const streakMilestones = document.getElementById('streakMilestones');
    const nextMilestone = document.getElementById('nextMilestone');
    
    if (!streakNumber) return;
    
    streakNumber.textContent = studyData.streak || 0;
    
    let streakEmoji = "📈";
    if (studyData.streak >= 30) streakEmoji = "🏆";
    else if (studyData.streak >= 14) streakEmoji = "🔥";
    else if (studyData.streak >= 7) streakEmoji = "✨";
    else if (studyData.streak >= 3) streakEmoji = "⭐";
    
    streakLabel.textContent = `${streakEmoji} ${studyData.streak || 0} DAY STREAK`;
    
    let nextMilestoneDay = studyData.streakMilestones.find(milestone => milestone > studyData.streak) || studyData.streakMilestones[studyData.streakMilestones.length - 1];
    let currentMilestoneIndex = studyData.streakMilestones.findIndex(milestone => milestone > studyData.streak) - 1;
    
    if (currentMilestoneIndex < 0) {
        currentMilestoneIndex = studyData.streakMilestones.length - 1;
    }
    
    let progressPercentage = 0;
    if (nextMilestoneDay) {
        progressPercentage = ((studyData.streak || 0) / nextMilestoneDay) * 100;
        if (progressPercentage > 100) progressPercentage = 100;
    }
    streakProgressFill.style.width = `${progressPercentage}%`;
    
    let milestonesHTML = '';
    studyData.streakMilestones.forEach((milestone, index) => {
        const isActive = studyData.streak >= milestone;
        const isCurrent = index === currentMilestoneIndex;
        milestonesHTML += `<div class="milestone ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}" title="${milestone} days"></div>`;
    });
    streakMilestones.innerHTML = milestonesHTML;
    
    if (nextMilestoneDay) {
        const daysLeft = nextMilestoneDay - (studyData.streak || 0);
        nextMilestone.textContent = `${nextMilestoneDay} days (${daysLeft} to go)`;
    } else {
        nextMilestone.textContent = "Maximum milestone reached! 🎉";
    }
    
    updateStreakButton();

    if ((studyData.streak || 0) >= 30) {
        const unlocked = localStorage.getItem(RAINBOW_UNLOCKED_KEY) === 'true';
        if (!unlocked) {
            localStorage.setItem(RAINBOW_UNLOCKED_KEY, 'true');
            showNotification("🌈 Rainbow theme unlocked for your 30‑day streak!", "success");
        }
    }

    if ((studyData.streak || 0) >= 7) {
        const forestUnlocked = localStorage.getItem(FOREST_UNLOCKED_KEY) === 'true';
        if (!forestUnlocked) {
            localStorage.setItem(FOREST_UNLOCKED_KEY, 'true');
            showNotification("🌲 Forest theme unlocked for your 7‑day streak!", "success");
        }
    }

    updateRainbowUI();
}

function getTodayKey() {
    const today = new Date();
    return today.toDateString();
}

function isConsecutiveDay(lastDateString, currentDateString) {
    if (!lastDateString) return false;
    
    const lastDate = new Date(lastDateString);
    const currentDate = new Date(currentDateString);
    
    const diffTime = Math.abs(currentDate - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1;
}

async function markStudyToday() {
    console.log("🔥 markStudyToday() called");
    
    const todayKey = getTodayKey();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toDateString();
    
    if (studyData.lastStudyDate === todayKey) {
        showNotification("You've already marked study for today! Come back tomorrow.", "info");
        updateStreakButton();
        return;
    }
    
    let message = "";
    let messageType = "success";
    
    if (!studyData.lastStudyDate) {
        studyData.streak = 1;
        message = "🎉 First study day! Starting your streak!";
    } else if (studyData.lastStudyDate === yesterdayKey || isConsecutiveDay(studyData.lastStudyDate, todayKey)) {
        studyData.streak = (studyData.streak || 0) + 1;
        message = `🔥 Streak continued! Now at ${studyData.streak} days!`;
        
        const milestoneAchieved = studyData.streakMilestones.find(milestone => milestone === studyData.streak);
        if (milestoneAchieved) {
            message = `🏆 MILESTONE ACHIEVED! ${milestoneAchieved}-day streak! Keep going!`;
            messageType = "warning";
        }
    } else {
        const lastDate = new Date(studyData.lastStudyDate);
        const today = new Date();
        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
            message = `⏰ You missed ${diffDays - 1} day(s). Starting new streak.`;
            messageType = "warning";
        } else {
            message = "🔄 Starting new streak today!";
        }
        studyData.streak = 1;
    }
    
    studyData.lastStudyDate = todayKey;
    studyData.totalStudyDays = (studyData.totalStudyDays || 0) + 1;
    
    if (!studyData.streakHistory) studyData.streakHistory = [];
    studyData.streakHistory.push({
        date: todayKey,
        streak: studyData.streak
    });
    
    const dayOfWeek = new Date().getDay();
    if (!studyData.weeklyPattern) studyData.weeklyPattern = [0, 0, 0, 0, 0, 0, 0];
    studyData.weeklyPattern[dayOfWeek] = (studyData.weeklyPattern[dayOfWeek] || 0) + 1;
    
    // Add a study session
    const sessionHours = 1.0; // Default 1 hour for daily streak
    const focusScore = calculateFocusScore();
    const consistencyScore = calculateConsistencyScore();
    
    if (!studyData.studySessions) studyData.studySessions = [];
    studyData.studySessions.push({
        date: new Date().toISOString(),
        hours: sessionHours,
        baseHours: sessionHours,
        bonusHours: 0,
        streak: studyData.streak
    });
    
    // Update daily stats
    if (!studyData.dailyStats) studyData.dailyStats = [];
    const todayStats = studyData.dailyStats.find(s => s.date === todayKey);
    if (todayStats) {
        todayStats.sessions = (todayStats.sessions || 0) + 1;
        todayStats.hours = (todayStats.hours || 0) + sessionHours;
        todayStats.focusScore = focusScore;
        todayStats.consistencyScore = consistencyScore;
    } else {
        studyData.dailyStats.unshift({
            date: todayKey,
            sessions: 1,
            hours: sessionHours,
            focusScore: focusScore,
            consistencyScore: consistencyScore
        });
        
        if (!studyData.focusScores) studyData.focusScores = [];
        studyData.focusScores.unshift({
            date: todayKey,
            score: focusScore
        });
        
        if (!studyData.consistencyScores) studyData.consistencyScores = [];
        studyData.consistencyScores.unshift({
            date: todayKey,
            score: consistencyScore
        });
        updateDailyGoalUI();

        // Keep only last 30 days
        if (studyData.dailyStats.length > 30) {
            studyData.dailyStats = studyData.dailyStats.slice(0, 30);
        }
        if (studyData.focusScores.length > 30) {
            studyData.focusScores = studyData.focusScores.slice(0, 30);
        }
        if (studyData.consistencyScores.length > 30) {
            studyData.consistencyScores = studyData.consistencyScores.slice(0, 30);
        }
        updateDailyGoalUI();

    }
    
    // Update total hours
    studyData.totalMinutes = (studyData.totalMinutes || 0) + sessionHours * 60;
    studyData.totalStudyHours = (studyData.totalMinutes / 60).toFixed(1);

    await logLiveActivity('streak_reached', {
        streak: studyData.streak || 0
    });
    
    persistData();
    await maybeCreditReferral();
    updateUI();
    updateSidebarStats();
    updateStreakUI();
    updateAllStatistics();
    
    updateSyncStatus("Saving to all classes...", "syncing");
    await saveStudyDataToFirebase();
    
    showNotification(message, messageType);
    
    if (currentSection === 'statistics') {
        updateCharts();
    }
    
    setTimeout(() => {
        updateSyncStatus("Saved successfully!", "success");
    }, 1500);
}

function updateStreakButton() {
    const streakBtn = document.getElementById('streakButton');
    const streakMessage = document.getElementById('streakMessage');
    const lastStudyDate = document.getElementById('lastStudyDate');
    
    if (!streakBtn) return;
    
    const todayKey = getTodayKey();
    
    if (studyData.lastStudyDate === todayKey) {
        streakBtn.disabled = true;
        streakBtn.innerHTML = '<span>✅ Already Marked Today</span>';
        streakBtn.style.background = 'var(--success)';
        streakBtn.style.opacity = '0.8';
        
        if (streakMessage) {
            streakMessage.textContent = `Come back tomorrow to continue your ${studyData.streak || 0}-day streak!`;
            streakMessage.style.color = 'white';
        }
        
        if (lastStudyDate) {
            lastStudyDate.textContent = studyData.lastStudyDate || 'Never';
        }
    } else {
        streakBtn.disabled = false;
        streakBtn.innerHTML = '<span>🔥 Mark Study Today</span>';
        streakBtn.style.background = '';
        streakBtn.style.opacity = '1';
        
        if (streakMessage) {
            if (studyData.streak > 0) {
                streakMessage.textContent = `Current streak: ${studyData.streak} days. Keep it going!`;
            } else {
                streakMessage.textContent = `Start a new study streak today!`;
            }
            streakMessage.style.color = 'white';
        }
        
        if (lastStudyDate) {
            if (studyData.lastStudyDate) {
                lastStudyDate.textContent = studyData.lastStudyDate;
            } else {
                lastStudyDate.textContent = 'Never';
            }
        }
    }
}


// ========== DAILY GOAL TRACKER ==========

function getTodaySessionsCount() {
    const todayKey = new Date().toDateString();
    if (!studyData.dailyStats) return 0;
    const todayStats = studyData.dailyStats.find(s => s.date === todayKey);
    return todayStats ? (todayStats.sessions || 0) : 0;
}

function updateDailyGoalUI() {
    const count = getTodaySessionsCount();

    const goalText = document.getElementById('dailyGoalText');
    const goalTarget = document.getElementById('dailyGoalTarget');
    const goalCount = document.getElementById('dailyGoalCount');
    const goalFill = document.getElementById('dailyGoalFill');
    const goalMsg = document.getElementById('dailyGoalMessage');
    const celebrateBtn = document.getElementById('celebrateGoalBtn');

    if (!goalText || !goalTarget || !goalCount || !goalFill || !goalMsg || !celebrateBtn) return;

    const target = getDailyGoalTarget();
    goalText.textContent = target;
    goalTarget.textContent = target;
    goalCount.textContent = count;

    const progress = Math.min(100, (count / target) * 100);
    goalFill.style.width = `${progress}%`;

    if (count >= target) {
        goalMsg.textContent = "🎉 Goal achieved! Amazing work!";
        celebrateBtn.style.display = 'block';
        celebrateBtn.classList.add('pulse');
    } else {
goalMsg.textContent = `You're doing great! ${target - count} to go 🚀`;

        celebrateBtn.style.display = 'none';
        celebrateBtn.classList.remove('pulse');
            }
}


function maybeCelebrateGoal() {
    const todayKey = new Date().toDateString();
    const storageKey = `dailyGoalCelebrated_${todayKey}`;

    if (localStorage.getItem(storageKey)) return;

    localStorage.setItem(storageKey, "true");
    triggerConfetti();
}

function triggerConfetti() {
    const layer = document.getElementById('confettiLayer');
    if (!layer) return;

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#22c55e'];

    for (let i = 0; i < 120; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = (Math.random() * 0.5) + 's';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.width = (6 + Math.random() * 6) + 'px';
        confetti.style.height = (10 + Math.random() * 8) + 'px';
        confetti.style.animationDuration = (5.5 + Math.random() * 1.5) + 's';

        layer.appendChild(confetti);
        setTimeout(() => confetti.remove(), 8000);
    }
}

function triggerConfettiBurst() {
    const layer = document.getElementById('confettiLayer');
    if (!layer) return;

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#22c55e'];

    playCelebrateSound();

    // Big center burst
    for (let i = 0; i < 160; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti burst';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = (Math.random() * 0.05) + 's';
        confetti.style.width = (6 + Math.random() * 8) + 'px';
        confetti.style.height = (10 + Math.random() * 10) + 'px';
        confetti.style.animationDuration = (1.6 + Math.random() * 0.8) + 's';
        confetti.style.setProperty('--x', `${(Math.random() * 2 - 1) * 420}px`);
        confetti.style.setProperty('--y', `${(Math.random() * 2 - 1) * 380}px`);
        if (Math.random() < 0.25) confetti.classList.add('sparkle');
        layer.appendChild(confetti);

        setTimeout(() => confetti.remove(), 2500);
    }

    // Side bursts for extra impact
    for (let i = 0; i < 80; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti burst';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = (Math.random() * 0.1) + 's';
        confetti.style.width = (5 + Math.random() * 7) + 'px';
        confetti.style.height = (8 + Math.random() * 9) + 'px';
        confetti.style.animationDuration = (1.4 + Math.random() * 0.8) + 's';
        confetti.style.left = '15%';
        confetti.style.top = '55%';
        confetti.style.setProperty('--x', `${(Math.random() * 2 - 1) * 260}px`);
        confetti.style.setProperty('--y', `${(Math.random() * 2 - 1) * 260}px`);
        if (Math.random() < 0.3) confetti.classList.add('sparkle');
        layer.appendChild(confetti);
        setTimeout(() => confetti.remove(), 2200);
    }

    for (let i = 0; i < 80; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti burst';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = (Math.random() * 0.1) + 's';
        confetti.style.width = (5 + Math.random() * 7) + 'px';
        confetti.style.height = (8 + Math.random() * 9) + 'px';
        confetti.style.animationDuration = (1.4 + Math.random() * 0.8) + 's';
        confetti.style.left = '85%';
        confetti.style.top = '55%';
        confetti.style.setProperty('--x', `${(Math.random() * 2 - 1) * 260}px`);
        confetti.style.setProperty('--y', `${(Math.random() * 2 - 1) * 260}px`);
        if (Math.random() < 0.3) confetti.classList.add('sparkle');
        layer.appendChild(confetti);
        setTimeout(() => confetti.remove(), 2200);
    }

    // Light rain after burst
    for (let i = 0; i < 80; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = (0.1 + Math.random() * 0.4) + 's';
        confetti.style.width = (4 + Math.random() * 6) + 'px';
        confetti.style.height = (7 + Math.random() * 8) + 'px';
        confetti.style.animationDuration = (6 + Math.random() * 2) + 's';
        if (Math.random() < 0.2) confetti.classList.add('sparkle');
        layer.appendChild(confetti);
        setTimeout(() => confetti.remove(), 8500);
    }
}

function playCelebrateSound() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        const master = ctx.createGain();
        master.gain.value = 0.25;
        master.connect(ctx.destination);

        // Burst noise (confetti pop)
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.0, now);
        noiseGain.gain.linearRampToValueAtTime(1.0, now + 0.01);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        noise.connect(noiseGain);
        noiseGain.connect(master);
        noise.start(now);

        // Low boom
        const boom = ctx.createOscillator();
        const boomGain = ctx.createGain();
        boom.type = 'sine';
        boom.frequency.value = 90;
        boomGain.gain.setValueAtTime(0.0, now);
        boomGain.gain.linearRampToValueAtTime(0.9, now + 0.02);
        boomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        boom.connect(boomGain);
        boomGain.connect(master);
        boom.start(now);
        boom.stop(now + 0.45);

        const tones = [
            { freq: 523.25, time: 0.0 },  // C5
            { freq: 659.25, time: 0.08 }, // E5
            { freq: 783.99, time: 0.16 }, // G5
            { freq: 1046.5, time: 0.24 }  // C6
        ];

        tones.forEach(t => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = t.freq;
            gain.gain.setValueAtTime(0, now + t.time);
            gain.gain.linearRampToValueAtTime(0.4, now + t.time + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + t.time + 0.22);
            osc.connect(gain);
            gain.connect(master);
            osc.start(now + t.time);
            osc.stop(now + t.time + 0.26);
        });

        setTimeout(() => ctx.close(), 1200);
    } catch (e) {
        console.warn("Audio playback blocked or unavailable:", e);
    }
}


const DAILY_GOAL_KEY = 'dailyGoalTarget';

function getDailyGoalTarget() {
    return parseInt(localStorage.getItem(DAILY_GOAL_KEY) || '3', 10);
}

function setDailyGoalTarget(value) {
    localStorage.setItem(DAILY_GOAL_KEY, String(value));
}

function initDailyGoalInput() {
    const input = document.getElementById('dailyGoalInput');
    if (!input) return;

    input.value = getDailyGoalTarget();

    input.addEventListener('change', () => {
        let val = parseInt(input.value, 10);
        if (!val || val < 1) val = 1;
        if (val > 20) val = 20;

        input.value = val;
        setDailyGoalTarget(val);
        updateDailyGoalUI();
        showNotification(`Daily goal set to ${val} sessions`, "success");
    });
}

// ========== STUDY DATA MANAGEMENT ==========
function loadStudyData() {
    updateUI();
    updateStreakUI();
}

async function saveStudyDataToFirebase() {
    if (!currentUserId || !currentUser) return;
    
    const studentData = {
        name: currentUserName,
        userId: currentUserId,
        firebaseUid: currentUser.uid,
        streak: studyData.streak || 0,
        totalMinutes: studyData.totalMinutes || 0,
        totalStudyHours: (studyData.totalMinutes / 60).toFixed(1),
        points: Math.floor(studyData.totalMinutes / 60) * 100 || 0,
        lastActive: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isStudentEntry: true,
        isTeacherAccount: false,
        isSameBrowserIssue: false
    };
    
    console.log(`💾 Saving student data. Student ID: ${currentUserId}, Firebase UID: ${currentUser.uid}`);
    
    for (const classInfo of userClasses) {
        try {
            await firebaseSet(`classes/${classInfo.code}/students/${currentUserId}`, studentData);
            console.log(`✅ Updated data in class: ${classInfo.code} with student ID: ${currentUserId}`);
            
        } catch (error) {
            console.error(`Error updating class ${classInfo.code}:`, error);
            
            try {
                await firebaseSet(`classStudents/${classInfo.code}/${currentUserId}`, studentData);
                console.log(`✅ Updated data in classStudents: ${classInfo.code}`);
            } catch (altError) {
                console.error(`Both paths failed for ${classInfo.code}:`, altError);
            }
        }
    }
}

async function addStudyHours() {
    const input = document.getElementById('hoursInput');
    if (!input) {
        showNotification("Study hours input not found", "error");
        return;
    }
    
    const hours = parseFloat(input.value);
    
    if (!hours || hours <= 0) {
        showNotification("Please enter valid study hours (minimum 0.25)", "error");
        return;
    }
    
    const addButton = event.target;
    const originalText = addButton.innerHTML;
    
    addButton.innerHTML = '⏳ Saving...';
    addButton.disabled = true;
    
    const baseHours = hours;
    const streakBonus = (studyData.streak || 0) > 7 ? 0.2 : (studyData.streak || 0) > 3 ? 0.1 : 0;
    const bonusHours = baseHours * streakBonus;
    const totalHours = baseHours + bonusHours;
    
    studyData.totalMinutes = (studyData.totalMinutes || 0) + totalHours * 60;
    studyData.totalStudyHours = (studyData.totalMinutes / 60).toFixed(1);

    await logLiveActivity('timer_started', {
        duration: Math.round(totalHours * 60)
    });
    
    if (!studyData.studySessions) studyData.studySessions = [];
    studyData.studySessions.push({
        date: new Date().toISOString(),
        hours: totalHours,
        baseHours: baseHours,
        bonusHours: bonusHours,
        streak: studyData.streak || 0
    });
    
    // Update daily stats
    const todayKey = getTodayKey();
    if (!studyData.dailyStats) studyData.dailyStats = [];
    const todayStats = studyData.dailyStats.find(s => s.date === todayKey);
    const focusScore = calculateFocusScore();
    const consistencyScore = calculateConsistencyScore();
    
    if (todayStats) {
        todayStats.sessions = (todayStats.sessions || 0) + 1;
        todayStats.hours = (todayStats.hours || 0) + totalHours;
        todayStats.focusScore = focusScore;
        todayStats.consistencyScore = consistencyScore;
    } else {
        studyData.dailyStats.unshift({
            date: todayKey,
            sessions: 1,
            hours: totalHours,
            focusScore: focusScore,
            consistencyScore: consistencyScore
        });
        
        if (!studyData.focusScores) studyData.focusScores = [];
        studyData.focusScores.unshift({
            date: todayKey,
            score: focusScore
        });
        
        if (!studyData.consistencyScores) studyData.consistencyScores = [];
        studyData.consistencyScores.unshift({
            date: todayKey,
            score: consistencyScore
        });
        
        // Keep only last 30 days
        if (studyData.dailyStats.length > 30) {
            studyData.dailyStats = studyData.dailyStats.slice(0, 30);
        }
        if (studyData.focusScores.length > 30) {
            studyData.focusScores = studyData.focusScores.slice(0, 30);
        }
        if (studyData.consistencyScores.length > 30) {
            studyData.consistencyScores = studyData.consistencyScores.slice(0, 30);
        }
    }
    
    persistData();
    await maybeCreditReferral();
    updateUI();
    updateSidebarStats();
    updateAllStatistics();
    input.value = "";
    
    updateSyncStatus("Syncing to all classes...", "syncing");
    await saveStudyDataToFirebase();
    
    setTimeout(() => {
        addButton.innerHTML = originalText;
        addButton.disabled = false;
    }, 1000);
    
    let message = `⏰ Added ${baseHours.toFixed(1)} study hours!`;
    if (bonusHours > 0) {
        message += ` (+${bonusHours.toFixed(1)} streak bonus)`;
    }
    message += ` Total: ${studyData.totalStudyHours} hours`;
    message += ` | Streak: ${studyData.streak || 0} days 🔥`;
    
    showNotification(message, "success");
    
    if (currentSection === 'statistics') {
        updateCharts();
    }
    
    setTimeout(() => {
        updateSyncStatus("Saved to all classes!", "success");
    }, 1500);
    updateDailyGoalUI();

}

// ========== TASK MANAGEMENT WITH PRIORITIES ==========
function addTask() {
    let taskInput = document.getElementById('taskInput');
    if (!taskInput) taskInput = document.getElementById('taskInputFull');
    
    const text = taskInput.value.trim();
    
    if (!text) {
        showNotification("Please enter a task", "error");
        return;
    }
    
    const task = {
        id: Date.now().toString(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString(),
        priority: selectedPriority,
        completedAt: null
    };
    
    tasks.unshift(task);
    taskInput.value = '';
    
    saveTasks();
    renderTasks();
    renderDashboardTasks();
    updateAllStatistics();
    
    const priorityText = {
        'urgent': '🔴 Urgent',
        'not-urgent': '🟡 Not Urgent',
        'optional': '⚪ Optional'
    }[selectedPriority];
    
    showNotification(`Task added as ${priorityText}!`, "success");
}

function selectPriority(priority) {
    selectedPriority = priority;
    
    document.querySelectorAll('.priority-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.priority === priority) {
            option.classList.add('active');
        }
    });
}

function getPriorityClass(priority) {
    switch(priority) {
        case 'urgent': return 'urgent';
        case 'not-urgent': return 'not-urgent';
        case 'optional': return 'optional';
        default: return '';
    }
}

function getPriorityBadge(priority) {
    switch(priority) {
        case 'urgent': return '<span class="priority-badge priority-urgent">🔴 Urgent</span>';
        case 'not-urgent': return '<span class="priority-badge priority-not-urgent">🟡 Not Urgent</span>';
        case 'optional': return '<span class="priority-badge priority-optional">⚪ Optional</span>';
        default: return '';
    }
}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        saveTasks();
        renderTasks();
        renderDashboardTasks();
        updateAllStatistics();
        
        if (task.completed) {
            showNotification("Task completed! ✅", "success");
        }
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
    renderDashboardTasks();
    updateAllStatistics();
    showNotification("Task deleted", "info");
}

function saveTasks() {
    persistData();
}

function renderTasks() {
    const fullTaskList = document.getElementById('fullTaskList');
    if (!fullTaskList) return;
    
    let filteredTasks = tasks;
    
    switch(currentTaskFilter) {
        case 'urgent':
            filteredTasks = tasks.filter(t => t.priority === 'urgent');
            break;
        case 'not-urgent':
            filteredTasks = tasks.filter(t => t.priority === 'not-urgent');
            break;
        case 'optional':
            filteredTasks = tasks.filter(t => t.priority === 'optional');
            break;
        case 'active':
            filteredTasks = tasks.filter(t => !t.completed);
            break;
        case 'completed':
            filteredTasks = tasks.filter(t => t.completed);
            break;
        case 'all':
        default:
            filteredTasks = tasks;
    }
    
    if (filteredTasks.length === 0) {
        fullTaskList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-title">No tasks found</div>
                <div class="empty-state-description">
                    ${currentTaskFilter === 'all' ? 'Add your first task above!' : 
                      currentTaskFilter === 'active' ? 'All tasks are completed! 🎉' : 
                      currentTaskFilter === 'completed' ? 'No completed tasks yet' :
                      `No ${currentTaskFilter.replace('-', ' ')} tasks`}
                </div>
            </div>
        `;
    } else {
        fullTaskList.innerHTML = filteredTasks.map((task, index) => `
            <li class="task-item ${task.completed ? 'completed' : ''} ${getPriorityClass(task.priority)}">
                <div class="task-text" onclick="toggleTask('${task.id}')">
                    ${task.text}
                    <div style="margin-top: var(--spacing-xs);">
                        ${getPriorityBadge(task.priority)}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn ${task.completed ? 'btn-success' : 'btn-warning'}" 
                            onclick="toggleTask('${task.id}')">
                        ${task.completed ? '✅ Completed' : '⬜ Mark Done'}
                    </button>
                    <button class="btn btn-danger" onclick="deleteTask('${task.id}')">🗑️ Delete</button>
                </div>
            </li>
        `).join('');
    }
    
    updateTaskStats();
}

function renderDashboardTasks() {
    const taskList = document.getElementById('taskList');
    if (!taskList) return;
    
    const urgentTasks = tasks.filter(t => t.priority === 'urgent' && !t.completed);
    const notUrgentTasks = tasks.filter(t => t.priority === 'not-urgent' && !t.completed);
    const optionalTasks = tasks.filter(t => t.priority === 'optional' && !t.completed);
    
    const recentTasks = [...urgentTasks, ...notUrgentTasks, ...optionalTasks].slice(0, 5);
    
    if (recentTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state" style="padding: var(--spacing-lg);">
                <div class="empty-state-icon" style="font-size: 2rem;">📝</div>
                <div class="empty-state-description">No tasks yet. Add your first task!</div>
            </div>
        `;
    } else {
        taskList.innerHTML = recentTasks.map(task => `
            <li class="task-item ${getPriorityClass(task.priority)}" style="padding: var(--spacing-md); margin-bottom: var(--spacing-sm);">
                <div class="task-text" onclick="toggleTask('${task.id}')" style="font-size: 1rem;">
                    ${task.text}
                    <div style="margin-top: var(--spacing-xs); font-size: 0.75rem;">
                        ${getPriorityBadge(task.priority)}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn ${task.completed ? 'btn-success' : 'btn-secondary'}" 
                            onclick="toggleTask('${task.id}')" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                        ${task.completed ? '✅' : '⬜'}
                    </button>
                </div>
            </li>
        `).join('');
    }
}

function filterTasks(filter) {
    currentTaskFilter = filter;
    renderTasks();
}

function updateTaskStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const totalTasksEl = document.getElementById('totalTasks');
    const pendingTasksEl = document.getElementById('pendingTasks');
    const completedTasksEl = document.getElementById('completedTasks');
    const completionRateEl = document.getElementById('completionRate');
    
    if (totalTasksEl) totalTasksEl.textContent = totalTasks;
    if (pendingTasksEl) pendingTasksEl.textContent = pendingTasks;
    if (completedTasksEl) completedTasksEl.textContent = completedTasks;
    if (completionRateEl) completionRateEl.textContent = `${completionRate}%`;
}

function clearCompletedTasks() {
    if (tasks.length === 0) {
        showNotification("No tasks to clear", "info");
        return;
    }
    
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) {
        showNotification("No completed tasks to clear", "info");
        return;
    }
    
    if (confirm(`Clear ${completedCount} completed task${completedCount === 1 ? '' : 's'}?`)) {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
        renderDashboardTasks();
        updateAllStatistics();
        showNotification(`Cleared ${completedCount} completed task${completedCount === 1 ? '' : 's'}`, "success");
    }
}

// ========== ASSIGNMENT MANAGEMENT ==========
function loadAssignments() {
    renderAssignments();
    renderDashboardAssignments();
}

function addAssignment() {
    const name = document.getElementById('assignmentName').value.trim();
    const subject = document.getElementById('assignmentSubject').value.trim();
    const dueDate = document.getElementById('assignmentDueDate').value;
    const description = document.getElementById('assignmentDescription').value.trim();
    
    if (!name || !subject || !dueDate) {
        showNotification("Please fill all required fields", "error");
        return;
    }
    
    const assignment = {
        id: Date.now().toString(),
        name,
        subject,
        dueDate,
        description,
        createdAt: new Date().toISOString(),
        completed: false
    };
    
    assignments.unshift(assignment);
    saveAssignments();
    renderAssignments();
    renderDashboardAssignments();
    
    showNotification("Assignment added!", "success");
    hideAssignmentForm();
}

function renderAssignments() {
    const fullAssignmentList = document.getElementById('fullAssignmentList');
    if (!fullAssignmentList) return;
    
    if (assignments.length === 0) {
        fullAssignmentList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📚</div>
                <div class="empty-state-title">No assignments yet</div>
                <div class="empty-state-description">Add your first assignment!</div>
            </div>
        `;
    } else {
        fullAssignmentList.innerHTML = assignments.map((assignment, index) => {
            const dueDate = new Date(assignment.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const diffTime = dueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let urgencyClass = 'normal';
            if (diffDays < 0) urgencyClass = 'overdue';
            else if (diffDays === 0) urgencyClass = 'today';
            else if (diffDays <= 3) urgencyClass = 'due-soon';
            
            return `
                <div class="assignment-item ${assignment.completed ? 'completed' : ''}">
                    <div class="assignment-header">
                        <div class="assignment-title">${assignment.name}</div>
                        <div class="assignment-date ${urgencyClass}">
                            ${urgencyClass === 'overdue' ? '⚠️ Overdue' : 
                              urgencyClass === 'today' ? '🔥 Due Today' : 
                              urgencyClass === 'due-soon' ? '⏰ Due Soon' : `📅 ${dueDate.toLocaleDateString()}`}
                        </div>
                    </div>
                    <div class="assignment-content">
                        <div style="color: var(--text-muted); margin-bottom: var(--spacing-sm);">
                            📚 ${assignment.subject}
                        </div>
                        ${assignment.description ? `<p>${assignment.description}</p>` : ''}
                    </div>
                    <div class="assignment-actions">
                        <button class="btn ${assignment.completed ? 'btn-success' : 'btn-secondary'}" onclick="toggleAssignment('${assignment.id}')">
                            ${assignment.completed ? '✅ Completed' : '⬜ Mark Complete'}
                        </button>
                        <button class="btn btn-danger" onclick="deleteAssignment('${assignment.id}')">🗑️ Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function renderDashboardAssignments() {
    const assignmentList = document.getElementById('assignmentList');
    if (!assignmentList) return;
    
    const recentAssignments = assignments.slice(0, 3);
    
    if (recentAssignments.length === 0) {
        assignmentList.innerHTML = `
            <div class="empty-state" style="padding: var(--spacing-lg);">
                <div class="empty-state-icon" style="font-size: 2rem;">📚</div>
                <div class="empty-state-description">No assignments yet</div>
            </div>
        `;
    } else {
        assignmentList.innerHTML = recentAssignments.map(assignment => {
            const dueDate = new Date(assignment.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const diffTime = dueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let urgencyClass = 'normal';
            if (diffDays < 0) urgencyClass = 'overdue';
            else if (diffDays === 0) urgencyClass = 'today';
            else if (diffDays <= 3) urgencyClass = 'due-soon';
            
            return `
                <div class="assignment-item" style="padding: var(--spacing-md); margin-bottom: var(--spacing-sm);">
                    <div class="assignment-header">
                        <div class="assignment-title" style="font-size: 1rem;">${assignment.name}</div>
                        <div class="assignment-date" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">
                            ${urgencyClass === 'overdue' ? '⚠️' : 
                              urgencyClass === 'today' ? '🔥' : 
                              urgencyClass === 'due-soon' ? '⏰' : '📅'}
                        </div>
                    </div>
                    <div style="color: var(--text-muted); font-size: 0.875rem;">
                        📚 ${assignment.subject}
                    </div>
                    <div style="margin-top: var(--spacing-sm);">
                        <button class="btn ${assignment.completed ? 'btn-success' : 'btn-secondary'}" 
                                onclick="toggleAssignment('${assignment.id}')" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                            ${assignment.completed ? '✅' : '⬜'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function toggleAssignment(assignmentId) {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
        assignment.completed = !assignment.completed;
        saveAssignments();
        renderAssignments();
        renderDashboardAssignments();
        if (assignment.completed) {
            logLiveActivity('assignment_completed', {
                assignmentTitle: assignment.name || 'Assignment'
            });
        }
        showNotification(assignment.completed ? "Assignment marked as completed!" : "Assignment marked as incomplete", "success");
    }
}

function deleteAssignment(assignmentId) {
    assignments = assignments.filter(a => a.id !== assignmentId);
    saveAssignments();
    renderAssignments();
    renderDashboardAssignments();
    showNotification("Assignment deleted", "info");
}

function saveAssignments() {
    persistData();
}

function showAssignmentForm() {
    const form = document.getElementById('assignmentForm');
    if (form) form.style.display = 'block';
}

function hideAssignmentForm() {
    const form = document.getElementById('assignmentForm');
    if (form) form.style.display = 'none';
}

// ========== UPDATED STATISTICS SECTION ==========
async function markStudySession() {
    const today = new Date().toDateString();
    
    const hours = parseFloat(prompt("How many hours did you study? (e.g., 2.5)", "1"));
    
    if (isNaN(hours) || hours <= 0) {
        showNotification("Please enter a valid number of hours", "error");
        return;
    }
    
    const focusScore = Math.min(100, Math.floor(Math.random() * 30) + 70);
    const consistencyScore = calculateConsistencyScore();
    
    // Initialize arrays if they don't exist
    if (!studyData.studySessions) studyData.studySessions = [];
    if (!studyData.dailyStats) studyData.dailyStats = [];
    
    // Update study sessions
    studyData.studySessions.unshift({
        date: new Date().toISOString(),
        hours: hours,
        baseHours: hours,
        bonusHours: 0,
        streak: studyData.streak || 0
    });
    
    // Update daily stats
    const todayStats = studyData.dailyStats.find(s => s.date === today);
    if (todayStats) {
        todayStats.sessions = (todayStats.sessions || 0) + 1;
        todayStats.hours = (todayStats.hours || 0) + hours;
        todayStats.focusScore = focusScore;
        todayStats.consistencyScore = consistencyScore;
    } else {
        studyData.dailyStats.unshift({
            date: today,
            sessions: 1,
            hours: hours,
            focusScore: focusScore,
            consistencyScore: consistencyScore
        });
        
        if (studyData.dailyStats.length > 30) {
            studyData.dailyStats = studyData.dailyStats.slice(0, 30);
        }
    }
    
    // Update total hours
    studyData.totalMinutes = (studyData.totalMinutes || 0) + hours * 60;
    studyData.totalStudyHours = (studyData.totalMinutes / 60).toFixed(1);

    await logLiveActivity('timer_started', {
        duration: Math.round(hours * 60)
    });
    
    persistData();
    await maybeCreditReferral();
    updateCharts();
    updateAllStatistics();
    updateDailyGoalUI();

    showNotification(`Study session recorded! ${hours} hours studied.`, "success");
}

function calculateConsistencyScore() {
    if (!studyData.dailyStats || studyData.dailyStats.length === 0) return 100;
    
    const last7Days = studyData.dailyStats.slice(0, 7);
    const daysStudied = last7Days.length;
    const totalDays = Math.min(7, studyData.dailyStats.length);
    
    return Math.min(100, Math.floor((daysStudied / totalDays) * 100));
}

function updateCharts() {
    // Destroy existing charts
    if (hoursChart) hoursChart.destroy();
    if (tasksChart) tasksChart.destroy();
    if (weeklyChart) weeklyChart.destroy();
    if (assignmentsChart) assignmentsChart.destroy();
    if (streakChart) streakChart.destroy();
    if (focusChart) focusChart.destroy();
    
    updateOverviewCards();
    updatePerformanceMetrics();
    updateDetailedStats();
    createHoursChart();
    createTasksChart();
    createWeeklyChart();
    createAssignmentsChart();
    createStreakChart();
    createFocusChart();
}

function updateOverviewCards() {
    document.getElementById('overviewStreak').textContent = studyData.streak || 0;
    document.getElementById('overviewHours').textContent = parseFloat(studyData.totalStudyHours || 0).toFixed(1);
    document.getElementById('overviewTasks').textContent = tasks.filter(t => t.completed).length;
    document.getElementById('overviewFocus').textContent = `${calculateFocusScore()}%`;
    
    updateTrends();
}

function updateTrends() {
    if (!studyData.dailyStats || studyData.dailyStats.length < 2) return;
    
    const today = studyData.dailyStats[0] || {};
    const yesterday = studyData.dailyStats[1] || {};
    
    // Update streak trend
    const streakTrend = document.getElementById('streakTrend');
    const streakDiff = (studyData.streak || 0) - (yesterday.streak || 0);
    updateTrendElement(streakTrend, streakDiff, "days streak");
    
    // Update hours trend
    const hoursTrend = document.getElementById('hoursTrend');
    const hoursDiff = (today.hours || 0) - (yesterday.hours || 0);
    updateTrendElement(hoursTrend, hoursDiff, "hours");
    
    // Update tasks trend
    const tasksTrend = document.getElementById('tasksTrend');
    const todayCompleted = tasks.filter(t => {
        if (!t.completedAt) return false;
        const completedDate = new Date(t.completedAt).toDateString();
        return completedDate === new Date().toDateString();
    }).length;
    const yesterdayCompleted = tasks.filter(t => {
        if (!t.completedAt) return false;
        const completedDate = new Date(t.completedAt).toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return completedDate === yesterday.toDateString();
    }).length;
    const tasksDiff = todayCompleted - yesterdayCompleted;
    updateTrendElement(tasksTrend, tasksDiff, "tasks");
    
    // Update focus trend
    const focusTrend = document.getElementById('focusTrend');
    const focusDiff = (today.focusScore || calculateFocusScore()) - (yesterday.focusScore || calculateFocusScore());
    updateTrendElement(focusTrend, focusDiff, "% focus");
}

function updateTrendElement(element, diff, label) {
    if (!element) return;
    
    let trendClass = 'neutral';
    let icon = '➡️';
    let text = 'No change';
    
    if (diff > 0) {
        trendClass = 'up';
        icon = '📈';
        text = `+${diff} ${label}`;
    } else if (diff < 0) {
        trendClass = 'down';
        icon = '📉';
        text = `${diff} ${label}`;
    }
    
    element.className = `stats-overview-trend ${trendClass}`;
    element.innerHTML = `<span>${icon}</span><span>${text}</span>`;
}

function updatePerformanceMetrics() {
    // Study sessions this week
    const thisWeekSessions = studyData.dailyStats ? 
        studyData.dailyStats.slice(0, 7).reduce((sum, day) => sum + (day.sessions || 0), 0) : 0;
    document.getElementById('metricSessions').textContent = thisWeekSessions;
    
    // Average daily hours
    const avgDailyHours = studyData.totalStudyDays > 0 ? 
        (parseFloat(studyData.totalStudyHours || 0) / studyData.totalStudyDays).toFixed(1) : 0;
    document.getElementById('metricAvgHours').textContent = `${avgDailyHours}h`;
    
    // Longest streak
    const longestStreak = studyData.streakHistory ? 
        Math.max(...studyData.streakHistory.map(s => s.streak || 0), studyData.streak || 0) : studyData.streak || 0;
    document.getElementById('metricLongestStreak').textContent = longestStreak;
    
    // Consistency score
    const consistencyScore = calculateConsistencyScore();
    document.getElementById('metricConsistency').textContent = `${consistencyScore}%`;
}

function updateDetailedStats() {
    // Productivity Metrics
    document.getElementById('detailTotalHours').textContent = parseFloat(studyData.totalStudyHours || 0).toFixed(1);
    document.getElementById('detailTotalSessions').textContent = studyData.studySessions ? studyData.studySessions.length : 0;
    
    const avgSessionLength = studyData.studySessions && studyData.studySessions.length > 0 ? 
        (parseFloat(studyData.totalStudyHours || 0) / studyData.studySessions.length).toFixed(1) : 0;
    document.getElementById('detailAvgSession').textContent = `${avgSessionLength}h`;
    
    const longestSession = studyData.studySessions && studyData.studySessions.length > 0 ? 
        Math.max(...studyData.studySessions.map(s => s.hours || 0)) : 0;
    document.getElementById('detailLongestSession').textContent = `${longestSession.toFixed(1)}h`;
    
    // Task Metrics
    document.getElementById('detailTotalTasks').textContent = tasks.length;
    document.getElementById('detailCompletedTasks').textContent = tasks.filter(t => t.completed).length;
    
    const completionRate = tasks.length > 0 ? 
        Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;
    document.getElementById('detailCompletionRate').textContent = `${completionRate}%`;
    
    document.getElementById('detailActiveTasks').textContent = tasks.filter(t => !t.completed).length;
    
    // Achievement Metrics
    document.getElementById('detailCurrentStreak').textContent = studyData.streak || 0;
    
    const longestStreak = studyData.streakHistory ? 
        Math.max(...studyData.streakHistory.map(s => s.streak || 0), studyData.streak || 0) : studyData.streak || 0;
    document.getElementById('detailLongestStreak').textContent = longestStreak;
    
    document.getElementById('detailFocusScore').textContent = `${calculateFocusScore()}%`;
    document.getElementById('detailConsistencyScore').textContent = `${calculateConsistencyScore()}%`;
}

function createHoursChart() {
    const ctx = document.getElementById('hoursChart');
    if (!ctx) return;
    
    const last7Days = Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toDateString();
    }).reverse();
    
    if (!studyData.studySessions) studyData.studySessions = [];
    
    const dailyHours = last7Days.map(day => {
        const daySessions = studyData.studySessions.filter(s => {
            const sessionDate = new Date(s.date).toDateString();
            return sessionDate === day;
        });
        return daySessions.reduce((sum, session) => sum + (session.hours || 0), 0);
    });
    
    // Theme-adaptive colors
    const barColor = getComputedStyle(document.documentElement).getPropertyValue('--accent');
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-dark');
    
    hoursChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: last7Days.map(date => {
                const d = new Date(date);
                return d.toLocaleDateString('en-US', { weekday: 'short' });
            }),
            datasets: [{
                label: 'Study Hours',
                data: dailyHours,
                backgroundColor: barColor + '80', // 50% opacity
                borderColor: borderColor,
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text'),
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card'),
                    titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text'),
                    bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-muted'),
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border'),
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border') + '40'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted'),
                        font: {
                            size: 11
                        }
                    },
                    title: {
                        display: true,
                        text: 'Hours',
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted'),
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border') + '40'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted'),
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
    
    // Update legend
    const legend = document.getElementById('hoursLegend');
    if (legend) {
        legend.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background: ${barColor};"></div>
                <span>Daily Study Hours</span>
            </div>
        `;
    }
}

function createTasksChart() {
    const ctx = document.getElementById('tasksChart');
    if (!ctx) return;
    
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = tasks.filter(t => !t.completed).length;
    
    // Theme-adaptive colors
    const successColor = getComputedStyle(document.documentElement).getPropertyValue('--success');
    const warningColor = getComputedStyle(document.documentElement).getPropertyValue('--warning');
    
    tasksChart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending'],
            datasets: [{
                data: [completedTasks, pendingTasks],
                backgroundColor: [
                    successColor + '80',
                    warningColor + '80'
                ],
                borderColor: [
                    successColor,
                    warningColor
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text'),
                        font: {
                            size: 11
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card'),
                    titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text'),
                    bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-muted'),
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border'),
                    borderWidth: 1
                }
            }
        }
    });
    
    // Update legend
    const legend = document.getElementById('tasksLegend');
    if (legend) {
        legend.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background: ${successColor};"></div>
                <span>Completed Tasks</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: ${warningColor};"></div>
                <span>Pending Tasks</span>
            </div>
        `;
    }
}

function createWeeklyChart() {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;
    
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    if (!studyData.weeklyPattern) studyData.weeklyPattern = [0, 0, 0, 0, 0, 0, 0];
    
    // Theme-adaptive colors
    const lineColor = getComputedStyle(document.documentElement).getPropertyValue('--purple');
    const fillColor = lineColor + '20';
    
    weeklyChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: daysOfWeek,
            datasets: [{
                label: 'Study Sessions',
                data: studyData.weeklyPattern,
                backgroundColor: fillColor,
                borderColor: lineColor,
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text'),
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card'),
                    titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text'),
                    bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-muted'),
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border'),
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border') + '40'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted'),
                        font: {
                            size: 11
                        }
                    },
                    title: {
                        display: true,
                        text: 'Sessions',
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted'),
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border') + '40'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted'),
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
    
    // Update legend
    const legend = document.getElementById('weeklyLegend');
    if (legend) {
        legend.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background: ${lineColor};"></div>
                <span>Weekly Study Pattern</span>
            </div>
        `;
    }
}

function createAssignmentsChart() {
    const ctx = document.getElementById('assignmentsChart');
    if (!ctx) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdue = assignments.filter(a => {
        const dueDate = new Date(a.dueDate);
        return dueDate < today && !a.completed;
    }).length;
    
    const dueToday = assignments.filter(a => {
        const dueDate = new Date(a.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime() && !a.completed;
    }).length;
    
    const dueSoon = assignments.filter(a => {
        const dueDate = new Date(a.dueDate);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 3 && !a.completed;
    }).length;
    
    const completed = assignments.filter(a => a.completed).length;
    const future = assignments.filter(a => {
        const dueDate = new Date(a.dueDate);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 3 && !a.completed;
    }).length;
    
    // Theme-adaptive colors
    const colors = [
        getComputedStyle(document.documentElement).getPropertyValue('--danger'),
        getComputedStyle(document.documentElement).getPropertyValue('--warning'),
        getComputedStyle(document.documentElement).getPropertyValue('--info'),
        getComputedStyle(document.documentElement).getPropertyValue('--success'),
        getComputedStyle(document.documentElement).getPropertyValue('--text-muted')
    ];
    
    assignmentsChart = new Chart(ctx.getContext('2d'), {
        type: 'pie',
        data: {
            labels: ['Overdue', 'Due Today', 'Due Soon', 'Completed', 'Future'],
            datasets: [{
                data: [overdue, dueToday, dueSoon, completed, future],
                backgroundColor: colors.map(color => color + '80'),
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text'),
                        font: {
                            size: 11
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card'),
                    titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text'),
                    bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-muted'),
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border'),
                    borderWidth: 1
                }
            }
        }
    });
    
    // Update legend
    const legend = document.getElementById('assignmentsLegend');
    if (legend) {
        legend.innerHTML = colors.map((color, index) => {
            const labels = ['Overdue', 'Due Today', 'Due Soon', 'Completed', 'Future'];
            return `
                <div class="legend-item">
                    <div class="legend-color" style="background: ${color};"></div>
                    <span>${labels[index]}</span>
                </div>
            `;
        }).join('');
    }
}

function createStreakChart() {
    const ctx = document.getElementById('streakChart');
    if (!ctx) return;
    
    const last14Days = Array.from({length: 14}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toDateString();
    }).reverse();
    
    if (!studyData.streakHistory) studyData.streakHistory = [];
    
    const streakData = last14Days.map(day => {
        const streakEntry = studyData.streakHistory.find(s => s.date === day);
        return streakEntry ? streakEntry.streak : 0;
    });
    
    // Theme-adaptive colors
    const lineColor = getComputedStyle(document.documentElement).getPropertyValue('--warning');
    const fillColor = lineColor + '20';
    
    streakChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: last14Days.map(date => {
                const d = new Date(date);
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }),
            datasets: [{
                label: 'Streak Days',
                data: streakData,
                backgroundColor: fillColor,
                borderColor: lineColor,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: lineColor,
                pointBorderColor: getComputedStyle(document.documentElement).getPropertyValue('--card'),
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text'),
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card'),
                    titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text'),
                    bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-muted'),
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border'),
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border') + '40'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted'),
                        font: {
                            size: 11
                        }
                    },
                    title: {
                        display: true,
                        text: 'Days',
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted'),
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border') + '40'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted'),
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
    
    // Update legend
    const legend = document.getElementById('streakLegend');
    if (legend) {
        legend.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background: ${lineColor};"></div>
                <span>Daily Streak</span>
            </div>
        `;
    }
}

function createFocusChart() {
    const ctx = document.getElementById('focusChart');
    if (!ctx) return;
    
    const last7Days = Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toDateString();
    }).reverse();
    
    if (!studyData.focusScores) studyData.focusScores = [];
    
    const focusData = last7Days.map(day => {
        const focusEntry = studyData.focusScores.find(s => s.date === day);
        return focusEntry ? focusEntry.score : 0;
    });
    
    // Theme-adaptive colors
    const lineColor = getComputedStyle(document.documentElement).getPropertyValue('--accent');
    const fillColor = lineColor + '20';
    
    focusChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: last7Days.map(date => {
                const d = new Date(date);
                return d.toLocaleDateString('en-US', { weekday: 'short' });
            }),
            datasets: [{
                label: 'Focus Score (%)',
                data: focusData,
                backgroundColor: fillColor,
                borderColor: lineColor,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: lineColor,
                pointBorderColor: getComputedStyle(document.documentElement).getPropertyValue('--card'),
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text'),
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card'),
                    titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text'),
                    bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-muted'),
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border'),
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border') + '40'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted'),
                        font: {
                            size: 11
                        }
                    },
                    title: {
                        display: true,
                        text: 'Score (%)',
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted'),
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border') + '40'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted'),
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
    
    // Update legend
    const legend = document.getElementById('focusLegend');
    if (legend) {
        legend.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background: ${lineColor};"></div>
                <span>Daily Focus Score</span>
            </div>
        `;
    }
}

function refreshCharts() {
    updateCharts();
    showNotification("Charts refreshed successfully!", "success");
}

function calculateFocusScore() {
    let score = 50;
    
    const streakBonus = Math.min((studyData.streak || 0) * 5, 30);
    score += streakBonus;
    
    if ((studyData.totalStudyDays || 0) > 7) score += 10;
    if ((studyData.totalStudyDays || 0) > 30) score += 10;
    
    const completionRate = tasks.length > 0 ? 
        (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0;
    score += Math.min(completionRate * 0.2, 10);
    
    return Math.min(Math.max(Math.round(score), 0), 100);
}

function exportStatistics() {
    const statsData = {
        exportDate: new Date().toISOString(),
        summary: {
            totalHours: parseFloat(studyData.totalStudyHours || (studyData.totalMinutes / 60).toFixed(1) || 0),
            currentStreak: studyData.streak || 0,
            taskCompletionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0,
            focusScore: calculateFocusScore()
        },
        detailed: {
            totalSessions: studyData.studySessions ? studyData.studySessions.length : 0,
            avgDailyHours: (studyData.totalStudyDays || 0) > 0 ? (parseFloat(studyData.totalStudyHours || 0) / (studyData.totalStudyDays || 1)).toFixed(1) : 0,
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.completed).length,
            totalAssignments: assignments.length,
            completedAssignments: assignments.filter(a => a.completed).length,
            weeklyPattern: studyData.weeklyPattern || [0, 0, 0, 0, 0, 0, 0],
            streakHistory: studyData.streakHistory || [],
            dailyStats: studyData.dailyStats || []
        }
    };
    
    const dataStr = JSON.stringify(statsData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `student-stats-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification("Statistics exported successfully!", "success");
}

// ========== INSPIRING STORIES ==========
function loadInspiringStories() {
    const storiesList = document.getElementById('storiesList');
    if (!storiesList) return;
    
    const shuffledStories = [...inspiringStories].sort(() => 0.5 - Math.random()).slice(0, 3);
    
    storiesList.innerHTML = shuffledStories.map(story => `
        <div class="story-item" onclick="showStoryModal(${story.id})">
            <div class="story-name">
                ${story.icon} ${story.name}
            </div>
            <div class="story-quote">"${story.quote}"</div>
        </div>
    `).join('');
}

function showStoryModal(storyId) {
    const story = inspiringStories.find(s => s.id === storyId);
    if (!story) return;
    
    const modal = document.getElementById('storyModal');
    const title = document.getElementById('storyModalTitle');
    const content = document.getElementById('storyModalContent');
    
    title.textContent = `${story.icon} ${story.name}'s Story`;
    
    content.innerHTML = `
        <div style="margin-bottom: var(--spacing-lg);">
            <h3 style="color: var(--accent); margin-bottom: var(--spacing-sm);">Their Famous Quote:</h3>
            <div style="font-style: italic; font-size: 1.25rem; color: var(--text); padding: var(--spacing-md); background: var(--bg); border-radius: var(--radius); border-left: 4px solid var(--accent);">
                "${story.quote}"
            </div>
        </div>
        
        <div style="margin-bottom: var(--spacing-lg);">
            <h3 style="color: var(--accent); margin-bottom: var(--spacing-sm);">Their Journey:</h3>
            <p style="line-height: 1.6;">${story.story}</p>
        </div>
        
        <div style="margin-bottom: var(--spacing-lg);">
            <h3 style="color: var(--accent); margin-bottom: var(--spacing-sm);">Challenges They Overcame:</h3>
            <ul style="padding-left: var(--spacing-lg); line-height: 1.6;">
                ${story.struggles.map(s => `<li style="margin-bottom: var(--spacing-xs);">${s}</li>`).join('')}
        </ul>
        </div>
        
        <div style="padding: var(--spacing-lg); background: var(--accent-light); border-radius: var(--radius); border-left: 4px solid var(--accent);">
            <h3 style="color: var(--accent); margin-bottom: var(--spacing-sm);">💡 Key Lesson:</h3>
            <p style="font-weight: 600; color: var(--text);">${story.lessons}</p>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function closeStoryModal() {
    document.getElementById('storyModal').style.display = 'none';
}

// ========== CLASS MANAGEMENT ==========
function updateClassSelector() {
    const selector = document.getElementById('classSelector');
    if (!selector) return;
    
    selector.innerHTML = '<option value="">Select a Class</option>';
    
    userClasses.forEach((classInfo, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${classInfo.name || 'Class'} (${classInfo.code})`;
        if (index === selectedClassIndex) {
            option.selected = true;
        }
        selector.appendChild(option);
    });
}

async function switchClass(classIndex) {
    if (classIndex === "") return;
    
    classIndex = parseInt(classIndex);
    if (classIndex >= 0 && classIndex < userClasses.length) {
        selectedClassIndex = classIndex;
        currentClassCode = userClasses[classIndex].code;
        
        console.log(`🔄 Switched to class: ${currentClassCode}`);
        
        persistData();
        loadClassroomData();
        if (currentSection === 'classroom') {
            await loadTeacherContent();
            await loadClassLeaderboard();
        }
        
        showNotification(`Switched to ${userClasses[classIndex].name || 'Class'}`, "success");
    }
}

function showJoinClassForm() {
    const form = document.getElementById('joinClassForm');
    if (form) {
        form.style.display = 'block';
        document.getElementById('joinClassCode').focus();
    }
}

function hideJoinClassForm() {
    const form = document.getElementById('joinClassForm');
    if (form) form.style.display = 'none';
}

async function joinClass() {
    const classCodeInput = document.getElementById('joinClassCode');
    const classCode = classCodeInput.value.toUpperCase().trim();
    
    if (!classCode || classCode.length !== 6) {
        showNotification("Please enter a valid 6-digit class code", "error");
        return;
    }
    
    const joinBtn = event.target;
    const originalText = joinBtn.innerHTML;
    joinBtn.innerHTML = '🔄 Joining...';
    joinBtn.disabled = true;
    
    try {
        console.log(`🎓 Attempting to join class: ${classCode}`);
        
        if (userClasses.some(c => c.code === classCode)) {
            showNotification("You've already joined this class", "info");
            hideJoinClassForm();
            joinBtn.innerHTML = originalText;
            joinBtn.disabled = false;
            return;
        }
        
        let classData = null;
        try {
            classData = await firebaseGet('classCodes/' + classCode);
        } catch (error) {
            console.log("Trying alternative path...");
            classData = await firebaseGet('classes/' + classCode);
        }
        
        if (!classData) {
            showNotification("Class not found. Check the code and try again.", "error");
            joinBtn.innerHTML = originalText;
            joinBtn.disabled = false;
            return;
        }
        
        console.log("✅ Class found:", classData);
        
        const studentData = {
            name: currentUserName || 'Student',
            userId: currentUserId,
            firebaseUid: currentUser ? currentUser.uid : null,
            streak: studyData.streak || 0,
            totalMinutes: studyData.totalMinutes || 0,
            totalStudyHours: (studyData.totalMinutes / 60).toFixed(1),
            points: Math.floor(studyData.totalMinutes / 60) * 100 || 0,
            lastActive: new Date().toISOString(),
            joinedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isStudentEntry: true,
            isTeacherAccount: false
        };
        
        console.log(`📤 Writing student data to class ${classCode}...`);
        
        let success = false;
        let errorMessages = [];
        
        try {
            await firebaseSet(`classes/${classCode}/students/${currentUserId}`, studentData);
            console.log(`✅ Path 1 successful: classes/${classCode}/students/${currentUserId}`);
            success = true;
        } catch (error1) {
            errorMessages.push(`Path 1: ${error1.message}`);
            console.error(`❌ Path 1 failed: ${error1.message}`);
        }
        
        if (!success) {
            try {
                await firebaseSet(`classStudents/${classCode}/${currentUserId}`, studentData);
                console.log(`✅ Path 2 successful: classStudents/${classCode}/${currentUserId}`);
                success = true;
            } catch (error2) {
                errorMessages.push(`Path 2: ${error2.message}`);
                console.error(`❌ Path 2 failed: ${error2.message}`);
            }
        }
        
        if (!success) {
            try {
                const simpleData = {
                    name: currentUserName || 'Student',
                    streak: studyData.streak || 0,
                    totalHours: (studyData.totalMinutes / 60).toFixed(1),
                    joined: new Date().toISOString()
                };
                
                await firebaseSet(`studentList/${classCode}/${currentUserId}`, simpleData);
                console.log(`✅ Path 3 successful: studentList/${classCode}/${currentUserId}`);
                success = true;
            } catch (error3) {
                errorMessages.push(`Path 3: ${error3.message}`);
                console.error(`❌ Path 3 failed: ${error3.message}`);
            }
        }
        
        if (!success) {
            console.error("All paths failed:", errorMessages);
            showNotification("Could not join class due to permissions. Try using incognito mode.", "error");
            
            console.log("Full error details:", {
                classCode,
                teacherId: classData.teacherId,
                currentUserId,
                currentUserUid: currentUser?.uid,
                errorMessages
            });
            
            joinBtn.innerHTML = originalText;
            joinBtn.disabled = false;
            return;
        }
        
        const newClass = {
            code: classCode,
            name: classData.name || 'Class ' + classCode,
            teacherId: classData.teacherId,
            joinedAt: new Date().toISOString()
        };
        
        userClasses.push(newClass);
        currentClassCode = classCode;
        selectedClassIndex = userClasses.length - 1;
        
        saveUserData();
        persistData();
        
        updateClassSelector();
        renderClassesList();
        loadClassroomData();
        
        classCodeInput.value = '';
        hideJoinClassForm();
        
        await saveStudyDataToFirebase();
        
        showNotification(`Successfully joined ${classData.name || 'the class'}!`, "success");
        
        if (currentSection === 'classroom') {
            await loadTeacherContent();
            await loadClassLeaderboard();
        }
        
    } catch (error) {
        console.error("❌ Join class error:", error);
        console.error("Error stack:", error.stack);
        
        showNotification("Failed to join class: " + (error.message || "Unknown error"), "error");
    } finally {
        joinBtn.innerHTML = originalText;
        joinBtn.disabled = false;
    }
}

function renderClassesList() {
    const classesList = document.getElementById('classesList');
    const noClassesMessage = document.getElementById('noClassesMessage');
    
    if (!classesList) return;
    
    if (userClasses.length === 0) {
        classesList.innerHTML = '';
        if (noClassesMessage) noClassesMessage.style.display = 'block';
        return;
    }
    
    if (noClassesMessage) noClassesMessage.style.display = 'none';
    
    classesList.innerHTML = userClasses.map((classInfo, index) => {
        const isActive = index === selectedClassIndex;
        
        return `
            <div class="class-card ${isActive ? 'active' : ''}">
                <div class="class-card-header">
                    <div class="class-card-title">${classInfo.name || 'Class'}</div>
                    <div class="class-card-code">${classInfo.code}</div>
                </div>
                <div style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: var(--spacing-sm);">
                    Joined: ${new Date(classInfo.joinedAt).toLocaleDateString()}
                </div>
                <div class="class-card-stats">
                    <div class="class-card-stat">
                        <div class="value">${studyData.streak || 0}</div>
                        <div class="label">Streak</div>
                    </div>
                    <div class="class-card-stat">
                        <div class="value">${(studyData.totalMinutes / 60).toFixed(1)}</div>
                        <div class="label">Hours</div>
                    </div>
                </div>
                <div class="class-card-actions">
                    <button class="btn ${isActive ? 'btn-primary' : 'btn-secondary'}" 
                            onclick="switchClass(${index})" style="flex: 1;">
                        ${isActive ? '✓ Active' : 'Switch'}
                    </button>
                    <button class="btn btn-danger" onclick="leaveClassConfirm('${classInfo.code}')">
                        🚪 Leave
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function leaveClassConfirm(classCode) {
    if (confirm(`Are you sure you want to leave this class?`)) {
        leaveClass(classCode);
    }
}

async function leaveClass(classCodeToLeave = null) {
    const classCode = classCodeToLeave || currentClassCode;
    
    if (!classCode) {
        showNotification("No class to leave", "error");
        return;
    }
    
    const classIndex = userClasses.findIndex(c => c.code === classCode);
    if (classIndex === -1) {
        showNotification("Class not found in your list", "error");
        return;
    }
    
    const className = userClasses[classIndex].name || 'Class';
    
    try {
        await firebaseRemove(`classes/${classCode}/students/${currentUserId}`);
        console.log(`✅ Student removed from class: ${classCode}`);
    } catch (error) {
        console.error("Error removing student from Firebase:", error);
    }
    
    userClasses.splice(classIndex, 1);
    
    if (classCode === currentClassCode) {
        if (userClasses.length > 0) {
            selectedClassIndex = 0;
            currentClassCode = userClasses[0].code;
        } else {
            currentClassCode = null;
            selectedClassIndex = -1;
        }
    }
    
    saveUserData();
    persistData();
    
    updateClassSelector();
    renderClassesList();
    loadClassroomData();
    
    if (currentSection === 'classroom') {
        await loadTeacherContent();
        await loadClassLeaderboard();
    }
    
    showNotification(`You have left ${className}`, "success");
}

// ========== CLASSROOM MANAGEMENT ==========
function loadClassroomData() {
    const notInClassView = document.getElementById('notInClassView');
    const inClassView = document.getElementById('inClassView');
    
    if (currentClassCode && userClasses.length > 0) {
        notInClassView.style.display = 'none';
        inClassView.style.display = 'block';
        
        const codeElement = document.getElementById('currentClassCode');
        if (codeElement) codeElement.textContent = currentClassCode;
        
        loadTeacherContent();
        loadClassLeaderboard();
    } else {
        if (notInClassView) notInClassView.style.display = 'block';
        if (inClassView) inClassView.style.display = 'none';
    }
}

async function loadTeacherContent() {
    if (!currentClassCode) {
        console.log("❌ Cannot load teacher content: No class selected");
        return;
    }
    
    console.log(`📢 Loading teacher content for class: ${currentClassCode}`);
    
    try {
        const announcements = await firebaseGet(`announcements/${currentClassCode}`);
        const announcementsDiv = document.getElementById('teacherAnnouncements');
        
        if (announcements && announcementsDiv) {
            const announcementList = Object.entries(announcements).map(([id, ann]) => ({
                id,
                ...ann
            }));
            
            announcementList.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.date || 0);
                const dateB = new Date(b.createdAt || b.date || 0);
                return dateB - dateA;
            });
            
            if (announcementList.length === 0) {
                announcementsDiv.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📢</div>
                        <div class="empty-state-title">No announcements yet</div>
                        <div class="empty-state-description">Check back later for updates from your teacher</div>
                    </div>
                `;
            } else {
                announcementsDiv.innerHTML = announcementList.map((ann, index) => `
                    <div class="classroom-item">
                        <div class="classroom-item-header">
                            <div class="classroom-item-title">${ann.title || 'Announcement'}</div>
                            <div class="classroom-item-date">
                                📅 ${new Date(ann.createdAt || ann.date || Date.now()).toLocaleDateString()}
                            </div>
                        </div>
                        <div class="classroom-item-content">
                            <p>${ann.content || ''}</p>
                        </div>
                    </div>
                `).join('');
            }
            
            const countElement = document.getElementById('announcementCount');
            if (countElement) countElement.textContent = announcementList.length;
        } else {
            if (announcementsDiv) {
                announcementsDiv.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📢</div>
                        <div class="empty-state-title">No announcements yet</div>
                        <div class="empty-state-description">Check back later for updates from your teacher</div>
                    </div>
                `;
                const countElement = document.getElementById('announcementCount');
                if (countElement) countElement.textContent = '0';
            }
        }
    } catch (error) {
        console.error("❌ Error loading announcements:", error);
        const announcementsDiv = document.getElementById('teacherAnnouncements');
        if (announcementsDiv) {
            announcementsDiv.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">❌</div>
                    <div class="empty-state-title">Error loading announcements</div>
                    <div class="empty-state-description">You may need to refresh or check your connection</div>
                </div>
            `;
        }
    }
    
    try {
        const resources = await firebaseGet(`resources/${currentClassCode}`);
        const resourcesDiv = document.getElementById('teacherResources');
        
        if (resources && resourcesDiv) {
            const resourceList = Object.entries(resources).map(([id, res]) => ({
                id,
                ...res
            }));
            
            if (resourceList.length === 0) {
                resourcesDiv.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📚</div>
                        <div class="empty-state-title">No resources yet</div>
                        <div class="empty-state-description">Your teacher will add resources here</div>
                    </div>
                `;
            } else {
                resourcesDiv.innerHTML = resourceList.map((res, index) => `
                    <div class="classroom-item">
                        <div class="classroom-item-header">
                            <div class="classroom-item-title">${res.title || 'Resource'}</div>
                            <div class="classroom-item-date">
                                📅 ${new Date(res.createdAt || res.date || Date.now()).toLocaleDateString()}
                            </div>
                        </div>
                        <div class="classroom-item-content">
                            ${res.description ? `<p>${res.description}</p>` : ''}
                            ${res.url ? `
                                <a href="${res.url}" target="_blank" class="classroom-item-link">
                                    📎 ${res.url}
                                </a>
                            ` : ''}
                        </div>
                    </div>
                `).join('');
            }
            
            const countElement = document.getElementById('resourceCount');
            if (countElement) countElement.textContent = resourceList.length;
        } else {
            if (resourcesDiv) {
                resourcesDiv.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📚</div>
                        <div class="empty-state-title">No resources yet</div>
                        <div class="empty-state-description">Your teacher will add resources here</div>
                    </div>
                `;
                const countElement = document.getElementById('resourceCount');
                if (countElement) countElement.textContent = '0';
            }
        }
    } catch (error) {
        console.error("❌ Error loading resources:", error);
        const resourcesDiv = document.getElementById('teacherResources');
        if (resourcesDiv) {
            resourcesDiv.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">❌</div>
                    <div class="empty-state-title">Error loading resources</div>
                    <div class="empty-state-description">You may need to refresh or check your connection</div>
                </div>
            `;
        }
    }
    
    try {
        const polls = await firebaseGet(`polls/${currentClassCode}`);
        const pollsDiv = document.getElementById('teacherPolls');
        
        if (polls && pollsDiv) {
            const pollList = Object.entries(polls).map(([id, pol]) => ({
                id,
                ...pol
            }));
            
            pollList.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.date || 0);
                const dateB = new Date(b.createdAt || b.date || 0);
                return dateB - dateA;
            });
            
            if (pollList.length === 0) {
                pollsDiv.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🗳️</div>
                        <div class="empty-state-title">No polls yet</div>
                        <div class="empty-state-description">Your teacher will share polls here</div>
                    </div>
                `;
            } else {
                pollsDiv.innerHTML = pollList.filter(p => !p.isArchived).map(pol => {
                    const votedIndex = pol.responses && currentUserId ? pol.responses[currentUserId] : null;
                    const options = pol.options || [];
                    const isClosed = pol.isActive === false;
                    const canVote = votedIndex === null || votedIndex === undefined;
                    
                    const optionsHtml = options.map((opt, idx) => {
                        const isOther = String(opt || '').trim().toLowerCase() === 'other';
                        return `
                        <label class="poll-option">
                            <input class="poll-radio" type="radio" name="poll_${pol.id}" value="${idx}" ${(!canVote || isClosed) ? 'disabled' : ''}>
                            ${isOther
                                ? `<span>Other:</span><input class="poll-other-input" type="text" id="poll_${pol.id}_other_${idx}" ${(!canVote || isClosed) ? 'disabled' : ''}>`
                                : `<span>${opt}</span>`
                            }
                        </label>
                        `;
                    }).join('');
                    
                    const results = pol.results || {};
                    const totalVotes = Object.values(results).reduce((sum, v) => sum + (Number(v) || 0), 0);
                    const resultsHtml = options.map((opt, idx) => {
                        const count = Number(results[idx] || 0);
                        const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                        return `
                            <div class="poll-result-row">
                                <div class="poll-result-head">
                                    <span>${opt}</span>
                                    <span>${count} (${percent}%)</span>
                                </div>
                                <div class="poll-bar">
                                    <div class="poll-bar-fill" style="width: ${percent}%;"></div>
                                </div>
                            </div>
                        `;
                    }).join('');
                    
                    const votedText = votedIndex !== null && votedIndex !== undefined
                        ? `<div class="poll-status voted">You voted: ${options[votedIndex] || 'Option'}</div>`
                        : '';
                    
                    return `
                        <div class="classroom-item poll-card" data-poll-id="${pol.id}">
                            <div class="classroom-item-header">
                                <div class="classroom-item-title">${pol.question || 'Class Poll'}</div>
                                <div class="classroom-item-date">
                                    🗓 ${new Date(pol.createdAt || Date.now()).toLocaleDateString()}
                                </div>
                            </div>
                            <div class="poll-divider"></div>
                            <div class="classroom-item-content">
                                ${(!isClosed && canVote) ? `<div class="poll-options">${optionsHtml}</div>` : ''}
                                ${(!isClosed && canVote) ? `<button class="poll-submit" onclick="submitPollResponse('${pol.id}')">Vote</button>` : ''}
                                ${(!isClosed && canVote) ? `<div class="poll-actions"><span class="poll-action-link" onclick="togglePollResults('${pol.id}')">View Results</span><span class="poll-action-link" onclick="copyPollLink('${pol.id}')">Share This</span></div>` : ''}
                                ${(isClosed || !canVote) ? `
                                    <div class="poll-results" style="display: block;">
                                        <div style="font-weight: 600; margin-bottom: 0.5rem;">Results</div>
                                        ${resultsHtml}
                                        <div style="margin-top: 0.25rem; color: var(--text-muted); font-size: 0.875rem;">Total votes: ${totalVotes}</div>
                                    </div>
                                ` : ''}
                                ${(isClosed || !canVote) ? `<div class="poll-actions"><span class="poll-action-link" onclick="togglePollResults('${pol.id}')">View Results</span><span class="poll-action-link" onclick="copyPollLink('${pol.id}')">Share This</span></div>` : ''}
                                ${votedText}
                                ${isClosed ? `<div class="poll-status closed">Poll closed</div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
            }
            
            const countElement = document.getElementById('pollCount');
            if (countElement) countElement.textContent = pollList.filter(p => !p.isArchived).length;
        } else {
            if (pollsDiv) {
                pollsDiv.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🗳️</div>
                        <div class="empty-state-title">No polls yet</div>
                        <div class="empty-state-description">Your teacher will share polls here</div>
                    </div>
                `;
                const countElement = document.getElementById('pollCount');
                if (countElement) countElement.textContent = '0';
            }
        }
    } catch (error) {
        console.error("❌ Error loading polls:", error);
        const pollsDiv = document.getElementById('teacherPolls');
        if (pollsDiv) {
            pollsDiv.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">❌</div>
                    <div class="empty-state-title">Error loading polls</div>
                    <div class="empty-state-description">You may need to refresh or check your connection</div>
                </div>
            `;
        }
    }
    await renderAggregateHeatmap();
}

async function submitPollResponse(pollId) {
    if (!currentClassCode || !currentUserId) {
        showNotification("Please join a class first", "error");
        return;
    }
    
    const selected = document.querySelector(`input[name="poll_${pollId}"]:checked`);
    if (!selected) {
        showNotification("Please select an option", "error");
        return;
    }
    
    const optionIndex = selected.value;
    
    try {
        const responsePath = `polls/${currentClassCode}/${pollId}/responses/${currentUserId}`;
        const existing = await firebaseGet(responsePath);
        if (existing !== null && existing !== undefined) {
            showNotification("You have already voted in this poll", "warning");
            return;
        }
        
        await firebaseSet(responsePath, optionIndex);
        
        if (database && currentUser) {
            const resultRef = database.ref(`polls/${currentClassCode}/${pollId}/results/${optionIndex}`);
            resultRef.transaction((current) => {
                const base = parseInt(current || 0, 10) || 0;
                return base + 1;
            });
        }
        
        showNotification("Vote submitted!", "success");
        loadTeacherContent();
    } catch (error) {
        console.error("❌ Error submitting poll response:", error);
        showNotification("Failed to submit vote. Try again.", "error");
    }
}

function togglePollResults(pollId) {
    const pollNode = document.querySelector(`[data-poll-id="${pollId}"]`);
    if (!pollNode) return;
    const results = pollNode.querySelector('.poll-results');
    if (!results) return;
    results.style.display = results.style.display === 'none' ? 'block' : 'none';
}

function copyPollLink(pollId) {
    if (!currentClassCode) return;
    const url = `${window.location.origin}${window.location.pathname}?class=${encodeURIComponent(currentClassCode)}&poll=${encodeURIComponent(pollId)}`;
    navigator.clipboard.writeText(url).then(() => {
        showNotification("Poll link copied!", "success");
    }).catch(() => {
        showNotification("Unable to copy poll link", "warning");
    });
}

async function loadClassLeaderboard() {
    if (!currentClassCode) {
        console.log("❌ Cannot load leaderboard: No class selected");
        showLeaderboardError("Not connected to a class");
        return;
    }
    
    console.log(`📊 Loading leaderboard for class: ${currentClassCode}`);
    
    const leaderboardDiv = document.getElementById('classLeaderboard');
    if (leaderboardDiv) {
        leaderboardDiv.innerHTML = `
            <div class="loading">
                <div>Loading leaderboard...</div>
            </div>
        `;
    }
    
    try {
        const students = await firebaseGet(`classes/${currentClassCode}/students`);
        
        if (!students) {
            showLeaderboardEmpty();
            return;
        }
        
        const studentList = Object.entries(students).map(([id, studentData]) => {
            const totalStudyHours = studentData.totalStudyHours || (studentData.totalMinutes / 60).toFixed(1) || 0;
            
            return {
                id,
                name: studentData.name || 'Student ' + id.substr(0, 6),
                totalStudyHours: parseFloat(totalStudyHours),
                streak: studentData.streak || 0,
                points: studentData.points || Math.floor(totalStudyHours * 100) || 0,
                lastActive: studentData.lastActive || 'Unknown',
                isTeacherAccount: id.includes('teacher') || studentData.name?.includes('Teacher')
            };
        });
        
        const filteredStudents = studentList.filter(s => !s.isTeacherAccount);
        filteredStudents.sort((a, b) => b.totalStudyHours - a.totalStudyHours);
        
        renderLeaderboard(filteredStudents);
        
    } catch (error) {
        console.error("❌ Error loading leaderboard:", error);
        showLeaderboardError("Failed to load leaderboard. Please try again.");
    }
}

function renderLeaderboard(students) {
    const leaderboardDiv = document.getElementById('classLeaderboard');
    if (!leaderboardDiv) return;
    
    if (students.length === 0) {
        showLeaderboardEmpty();
        return;
    }
    
    const totalStudents = students.length;
    const totalHours = students.reduce((sum, student) => sum + student.totalStudyHours, 0);
    const avgHours = totalStudents > 0 ? totalHours / totalStudents : 0;
    const topStudent = students.length > 0 ? students[0] : null;
    
    leaderboardDiv.innerHTML = `
        <div class="leaderboard-stats">
            <div class="leaderboard-stat">
                <div class="value">${totalStudents}</div>
                <div class="label">Students</div>
            </div>
            <div class="leaderboard-stat">
                <div class="value">${totalHours.toFixed(1)}</div>
                <div class="label">Total Hours</div>
            </div>
            <div class="leaderboard-stat">
                <div class="value">${avgHours.toFixed(1)}</div>
                <div class="label">Avg/Student</div>
            </div>
            <div class="leaderboard-stat">
                <div class="value">${topStudent ? topStudent.totalStudyHours.toFixed(1) : '0.0'}</div>
                <div class="label">Top Score</div>
            </div>
        </div>
        
        <div class="leaderboard-list">
            ${students.map((student, index) => {
                const isCurrentUser = student.id === currentUserId;
                const rankClass = `rank-${index + 1}`;
                const isTopThree = index < 3;
                
                const initials = student.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                
                let lastActiveText = 'Never';
                if (student.lastActive && student.lastActive !== 'Unknown') {
                    const lastActive = new Date(student.lastActive);
                    const now = new Date();
                    const diffDays = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
                    
                    if (diffDays === 0) lastActiveText = 'Today';
                    else if (diffDays === 1) lastActiveText = 'Yesterday';
                    else if (diffDays < 7) lastActiveText = `${diffDays}d ago`;
                    else if (diffDays < 30) lastActiveText = `${Math.floor(diffDays/7)}w ago`;
                    else lastActiveText = lastActive.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }
                
                return `
                    <div class="leaderboard-item ${rankClass} ${isCurrentUser ? 'you' : ''}">
                        <div class="leaderboard-rank">
                            ${isTopThree ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
                        </div>
                        <div class="leaderboard-avatar">
                            ${initials}
                        </div>
                        <div class="leaderboard-info">
                            <div class="leaderboard-name">
                                ${student.name} ${isCurrentUser ? '(You)' : ''}
                            </div>
                            <div class="leaderboard-subtitle">
                                Last active: ${lastActiveText}
                            </div>
                            <div class="leaderboard-stats-row">
                                <span class="stats-badge fire">🔥 ${student.streak || 0}</span>
                                <span class="stats-badge time">⏰ ${student.totalStudyHours.toFixed(1)}h</span>
                                <span class="stats-badge points">⭐ ${student.points || 0}</span>
                            </div>
                        </div>
                        <div class="leaderboard-score">
                            ${student.totalStudyHours.toFixed(1)}h
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function showLeaderboardEmpty() {
    const leaderboardDiv = document.getElementById('classLeaderboard');
    if (leaderboardDiv) {
        leaderboardDiv.innerHTML = `
            <div class="leaderboard-empty">
                <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">🏆</div>
                <h3>No Students Yet</h3>
                <p>Be the first to join and start studying!</p>
            </div>
        `;
    }
}

function showLeaderboardError(message) {
    const leaderboardDiv = document.getElementById('classLeaderboard');
    if (leaderboardDiv) {
        leaderboardDiv.innerHTML = `
            <div class="leaderboard-empty">
                <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">❌</div>
                <h3>Error Loading Leaderboard</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="loadClassLeaderboard()" style="margin-top: var(--spacing-md);">
                    🔄 Retry
                </button>
            </div>
        `;
    }
}

function refreshLeaderboard() {
    updateSyncStatus("Refreshing leaderboard...", "syncing");
    loadClassLeaderboard();
    setTimeout(() => {
        updateSyncStatus("Leaderboard refreshed", "success");
    }, 500);
}

function copyClassCode() {
    if (!currentClassCode) return;
    
    navigator.clipboard.writeText(currentClassCode).then(() => {
        showNotification("Class code copied to clipboard!", "success");
    });
}

async function refreshClassroom() {
    updateSyncStatus("Refreshing...", "syncing");
    await loadTeacherContent();
    await loadClassLeaderboard();
    setTimeout(() => {
        showNotification("Classroom data refreshed", "success");
        updateSyncStatus("Refreshed", "success");
    }, 500);
}

// ========== ACHIEVEMENT BADGES ==========
const BADGES_STORAGE_KEY = 'studentEarnedBadges';

function loadEarnedBadges() {
    try {
        const raw = localStorage.getItem(BADGES_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.warn("Failed to load earned badges:", e);
        return [];
    }
}

function saveEarnedBadges(badges) {
    try {
        localStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(badges));
    } catch (e) {
        console.warn("Failed to save earned badges:", e);
    }
}

function getAchievementBadges() {
    const sessions = studyData.studySessions || [];
    const totalMinutes = studyData.totalMinutes || (parseFloat(studyData.totalStudyHours || 0) * 60) || 0;
    const todayKey = new Date().toDateString();
    const todayStats = (studyData.dailyStats || []).find(s => s.date === todayKey);
    const todaySessions = todayStats ? (todayStats.sessions || 0) : 0;
    const goalTarget = getDailyGoalTarget();
    const completedTimers = sessions.length;
    const totalHours = totalMinutes / 60;
    const completedTasks = tasks.filter(t => t.completed).length;
    const completedAssignments = assignments.filter(a => a.completed).length;
    const last7Days = (studyData.dailyStats || []).slice(0, 7);
    const daysStudiedLast7 = last7Days.filter(d => (d.sessions || 0) > 0).length;

    const hasEarlyBird = sessions.some(s => {
        const d = new Date(s.date);
        return !isNaN(d) && d.getHours() < 8;
    });

    const hasWeekendWarrior = sessions.some(s => {
        const d = new Date(s.date);
        if (isNaN(d)) return false;
        const day = d.getDay();
        return day === 0 || day === 6;
    });

    const hasFocusMaster = completedTimers >= 10;
    const hasTwoHours = totalMinutes >= 120;
    const hasGoalGetter = todaySessions >= goalTarget;
    const hasStreakStarter = (studyData.streak || 0) >= 3;
    const hasStreakBuilder = (studyData.streak || 0) >= 7;
    const hasStreakChampion = (studyData.streak || 0) >= 14;
    const hasTaskCrusher = completedTasks >= 10;
    const hasAssignmentAce = completedAssignments >= 5;
    const hasConsistencyKing = daysStudiedLast7 >= 5;
    const hasStudyMarathon = totalHours >= 10;

    return [
        {
            id: "early-bird",
            title: "Early Bird",
            desc: "Study before 8 AM",
            icon: "&#9728;",
            tone: "sunrise",
            earned: hasEarlyBird
        },
        {
            id: "weekend-warrior",
            title: "Weekend Warrior",
            desc: "Study on Saturday or Sunday",
            icon: "&#128197;",
            tone: "weekend",
            earned: hasWeekendWarrior
        },
        {
            id: "focus-master",
            title: "Focus Master",
            desc: "Complete 10 timers",
            icon: "&#127919;",
            tone: "focus",
            earned: hasFocusMaster
        },
        {
            id: "two-hour-club",
            title: "2-Hour Club",
            desc: "Time: 2 hours",
            icon: "&#9201;",
            tone: "time",
            earned: hasTwoHours
        },
        {
            id: "goal-getter",
            title: "Goal Getter",
            desc: "Hit today's daily goal",
            icon: "&#127881;",
            tone: "goal",
            earned: hasGoalGetter
        },
        {
            id: "streak-starter",
            title: "Streak Starter",
            desc: "Reach a 3-day streak",
            icon: "&#128293;",
            tone: "streak",
            earned: hasStreakStarter
        },
        {
            id: "streak-builder",
            title: "Streak Builder",
            desc: "Reach a 7-day streak",
            icon: "&#128293;",
            tone: "streak",
            earned: hasStreakBuilder
        },
        {
            id: "streak-champion",
            title: "Streak Champion",
            desc: "Reach a 14-day streak",
            icon: "&#127942;",
            tone: "streak",
            earned: hasStreakChampion
        },
        {
            id: "task-crusher",
            title: "Task Crusher",
            desc: "Complete 10 tasks",
            icon: "&#9989;",
            tone: "tasks",
            earned: hasTaskCrusher
        },
        {
            id: "assignment-ace",
            title: "Assignment Ace",
            desc: "Complete 5 assignments",
            icon: "&#128218;",
            tone: "assign",
            earned: hasAssignmentAce
        },
        {
            id: "consistency-king",
            title: "Consistency",
            desc: "Study 5 of the last 7 days",
            icon: "&#128200;",
            tone: "consistency",
            earned: hasConsistencyKing
        },
        {
            id: "study-marathon",
            title: "Study Marathon",
            desc: "Reach 10 total study hours",
            icon: "&#9200;",
            tone: "time",
            earned: hasStudyMarathon
        }
    ];
}

function renderBadges() {
    const grid = document.getElementById('badgesGrid');
    const empty = document.getElementById('badgesEmpty');
    const countEl = document.getElementById('badgeCount');
    if (!grid || !empty || !countEl) return;

    const stored = loadEarnedBadges();
    const badges = getAchievementBadges().map(b => ({
        ...b,
        earned: b.earned || stored.includes(b.id)
    }));
    const earnedIds = badges.filter(b => b.earned).map(b => b.id);
    saveEarnedBadges(Array.from(new Set(earnedIds)));

    const earnedBadges = badges.filter(b => b.earned);
    countEl.textContent = `${earnedBadges.length} earned`;

    if (earnedBadges.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'flex';
        return;
    }

    empty.style.display = 'none';
    grid.innerHTML = earnedBadges.map(b => `
        <div class="badge-item" data-tone="${b.tone || 'goal'}">
            <div class="badge-icon">${b.icon}</div>
            <div class="badge-info">
                <div class="badge-title">${b.title}</div>
                <div class="badge-desc">${b.desc}</div>
                <div class="badge-tag">Achieved</div>
            </div>
        </div>
    `).join('');
}

// ========== STUDY HEATMAP ==========
function renderStudyHeatmap() {
    const grid = document.getElementById('studyHeatmap');
    if (!grid) return;

    const daysToShow = 84; // 12 weeks
    const today = new Date();
    const dayStats = new Map();
    const daily = studyData.dailyStats || [];
    if (daily.length > 0) {
        daily.forEach(stat => {
            if (stat?.date) {
                dayStats.set(stat.date, stat.sessions || 0);
            }
        });
    } else {
        // Fallback: aggregate from studySessions if dailyStats is empty
        (studyData.studySessions || []).forEach(session => {
            if (!session?.date) return;
            const key = new Date(session.date).toDateString();
            dayStats.set(key, (dayStats.get(key) || 0) + 1);
        });
    }

    const cells = [];
    for (let i = daysToShow - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toDateString();
        const sessions = dayStats.get(key) || 0;
        const level =
            sessions >= 4 ? 4 :
            sessions === 3 ? 3 :
            sessions === 2 ? 2 :
            sessions === 1 ? 1 : 0;
        const title = `${d.toLocaleDateString()}: ${sessions} session${sessions === 1 ? '' : 's'}`;
        cells.push(
            `<div class="heatmap-cell level-${level}" title="${title}">` +
            `<span class="heatmap-value">${sessions}</span>` +
            `</div>`
        );
    }

    grid.innerHTML = cells.join('');
}

// ========== ENGAGEMENT HEATMAP (AGGREGATE) ==========
async function getAggregateHeatmap() {
    if (!currentClassCode) return null;
    const activity = await firebaseGet(`classActivity/${currentClassCode}`);
    const buckets = Array.from({ length: 7 }, () => Array(4).fill(0));

    if (!activity) {
        return { buckets, total: 0 };
    }

    const events = Object.values(activity);
    let total = 0;

    events.forEach(evt => {
        const ts = evt?.createdAt || evt?.date || evt?.timestamp;
        if (!ts) return;
        const d = new Date(ts);
        if (Number.isNaN(d.getTime())) return;
        const day = d.getDay();
        const hour = d.getHours();

        let slot = 0; // Night (0-6)
        if (hour >= 6 && hour < 12) slot = 1; // Morning
        else if (hour >= 12 && hour < 17) slot = 2; // Afternoon
        else slot = 3; // Evening (17-24)

        buckets[day][slot] += 1;
        total += 1;
    });

    return { buckets, total };
}

async function renderAggregateHeatmap() {
    const container = document.getElementById('aggregateHeatmap');
    const insightEl = document.getElementById('aggregateInsight');
    if (!container || !insightEl) return;

    const data = await getAggregateHeatmap();
    if (!data || data.total === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: var(--spacing-lg);">
                <div class="empty-state-icon" style="font-size: 2rem;">📊</div>
                <div class="empty-state-description">No class activity yet.</div>
            </div>
        `;
        insightEl.textContent = "Free insights: Class activity will appear once study sessions begin.";
        return;
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeNames = ['Night', 'Morning', 'Afternoon', 'Evening'];
    const flat = data.buckets.flat();
    const max = Math.max(...flat, 1);

    const levelFor = (count) => {
        const ratio = count / max;
        if (ratio >= 0.8) return 4;
        if (ratio >= 0.6) return 3;
        if (ratio >= 0.4) return 2;
        if (ratio >= 0.2) return 1;
        return 0;
    };

    const headerRow = `
        <div class="aggregate-heatmap-grid">
            <div></div>
            ${timeNames.map(t => `<div class="aggregate-heatmap-time">${t}</div>`).join('')}
        </div>
    `;

    const rows = data.buckets.map((row, dayIdx) => {
        const cells = row.map((count, tIdx) => {
            const level = levelFor(count);
            return `<div class="aggregate-heatmap-cell level-${level}" title="${dayNames[dayIdx]} ${timeNames[tIdx]}: ${count} activities"></div>`;
        }).join('');
        return `
            <div class="aggregate-heatmap-grid">
                <div class="aggregate-heatmap-label">${dayNames[dayIdx]}</div>
                ${cells}
            </div>
        `;
    }).join('');

    container.innerHTML = headerRow + rows;

    let bestDay = 0;
    let bestSlot = 0;
    let bestCount = -1;
    data.buckets.forEach((row, dIdx) => {
        row.forEach((count, tIdx) => {
            if (count > bestCount) {
                bestCount = count;
                bestDay = dIdx;
                bestSlot = tIdx;
            }
        });
    });

    const insight = `Free insights: Class studies most on ${dayNames[bestDay]} ${timeNames[bestSlot].toLowerCase()}s.`;
    insightEl.textContent = insight;
}

// ========== STATISTICS & UI UPDATES ==========
function updateAllStatistics() {
    updateUI();
    updateTaskStats();
    updateSidebarStats();
    renderBadges();
    renderStudyHeatmap();
    
    if (currentSection === 'statistics') {
        updateCharts();
    }
    
    persistData();
}

function updateUI() {
    const streakDisplay = document.getElementById('streakDisplay');
    const streakNumber = document.getElementById('streakNumber');
    if (streakDisplay) streakDisplay.textContent = studyData.streak || 0;
    if (streakNumber) streakNumber.textContent = studyData.streak || 0;
    
    const totalHoursDisplay = document.getElementById('totalHoursDisplay');
    const hours = studyData.totalStudyHours || (studyData.totalMinutes / 60).toFixed(1) || 0;
    if (totalHoursDisplay) totalHoursDisplay.textContent = parseFloat(hours).toFixed(1);
    
    const tasksCompleted = tasks.filter(t => t.completed).length;
    const tasksCompletedDisplay = document.getElementById('tasksCompletedDisplay');
    if (tasksCompletedDisplay) tasksCompletedDisplay.textContent = tasksCompleted;
    
    const focusScore = calculateFocusScore();
    const focusScoreDisplay = document.getElementById('focusScoreDisplay');
    if (focusScoreDisplay) focusScoreDisplay.textContent = `${focusScore}%`;
    
    updateSidebarStats();
    updateStreakUI();
    updateDailyGoalUI();

}

function updateSidebarStats() {
    const sidebarStreak = document.getElementById('sidebarStreak');
    const sidebarHours = document.getElementById('sidebarHours');
    const sidebarTasks = document.getElementById('sidebarTasks');
    const sidebarFocus = document.getElementById('sidebarFocus');
    
    if (sidebarStreak) sidebarStreak.textContent = studyData.streak || 0;
    if (sidebarHours) {
        const hours = studyData.totalStudyHours || (studyData.totalMinutes / 60).toFixed(1) || 0;
        sidebarHours.textContent = parseFloat(hours).toFixed(1);
    }
    if (sidebarTasks) {
        const completedTasks = tasks.filter(t => t.completed).length;
        sidebarTasks.textContent = completedTasks;
    }
    if (sidebarFocus) {
        const focusScore = calculateFocusScore();
        sidebarFocus.textContent = `${focusScore}%`;
    }
}

// ========== PROFILE MANAGEMENT ==========
async function saveProfile() {
    const name = document.getElementById('studentName').value.trim();
    const email = document.getElementById('studentEmail').value.trim();
    const bio = document.getElementById('studentBio').value.trim();
    
    if (!name) {
        showNotification("Please enter your name", "error");
        return;
    }
    
    currentUserName = name;
    saveUserData();
    
    if (currentUserId) {
        try {
            await firebaseUpdate(`users/${currentUserId}`, {
                name: currentUserName,
                email: email,
                bio: bio,
                updatedAt: new Date().toISOString()
            });
            
            await saveStudyDataToFirebase();
            
        } catch (error) {
            console.error("❌ Error saving profile to Firebase:", error);
        }
    }
    
    showNotification("Profile saved successfully!", "success");
}

async function saveProfileSettings() {
    const name = document.getElementById('profileName').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const bio = document.getElementById('profileBio').value.trim();
    
    if (!name) {
        showNotification("Please enter your name", "error");
        return;
    }
    
    currentUserName = name;
    saveUserData();
    
    document.getElementById('studentName').value = name;
    document.getElementById('studentEmail').value = email;
    document.getElementById('studentBio').value = bio;
    
    if (currentUserId) {
        try {
            await firebaseUpdate(`users/${currentUserId}`, {
                name: currentUserName,
                email: email,
                bio: bio,
                updatedAt: new Date().toISOString()
            });
            
            await saveStudyDataToFirebase();
            
        } catch (error) {
            console.error("❌ Error saving profile to Firebase:", error);
        }
    }
    
    showNotification("Profile settings saved successfully!", "success");
}

// ========== NAVIGATION ==========
function showSection(sectionId) {
    console.log("📱 Switching to section:", sectionId);
    
    // Hide all sections first
    document.querySelectorAll('.dashboard-content').forEach(section => {
        section.style.display = 'none';
    });
    
    // Update active nav items - MORE SPECIFIC MATCHING
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        const itemText = item.textContent.trim();
        
        // EXACT MATCHING based on expected text
        const expectedTexts = {
            'dashboard': '📊 Dashboard',
            'tasks': '📝 Tasks',
            'assignments': '📚 Assignments',
            'classroom': '🏫 Classroom',
            'myclasses': '🎓 My Classes',
            'statistics': '📈 Statistics',
            'tools': '🛠️ Study Tools',
            'ai': '🤖 AI Help',
            'profile': '👤 Profile'
        };
        
        if (expectedTexts[sectionId] && itemText === expectedTexts[sectionId]) {
            item.classList.add('active');
        }
    });
    
    // Show the requested section
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
        sectionElement.style.display = 'block';
        currentSection = sectionId;
        persistData();
        
        // Load section-specific data
        loadSectionData(sectionId);
    } else {
        console.error("❌ Section not found:", sectionId);
        showNotification("Section not available", "error");
        
        // Fallback to dashboard
        showSection('dashboard');
    }
}

// Load section-specific data
function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'dashboard':
            renderDashboardTasks();
            renderDashboardAssignments();
            updateStreakUI();
            updateUI();
            updateDailyGoalUI();
            break;
            
        case 'tasks':
            renderTasks();
            break;
            
        case 'assignments':
            renderAssignments();
            break;
            
        case 'classroom':
            loadClassroomData();
            break;
            
        case 'myclasses':
            renderClassesList();
            break;
            
        case 'statistics':
            setTimeout(updateCharts, 100);
            break;
            
        case 'tools':
            // Nothing special needed
            break;
            
        case 'ai':
            // Nothing special needed
            break;
            
        case 'profile':
            // Load profile data
            document.getElementById('profileName').value = currentUserName || '';
            document.getElementById('profileEmail').value = localStorage.getItem('studentEmail') || '';
            document.getElementById('profileBio').value = localStorage.getItem('studentBio') || '';
            updateReferralUI();
            updateRainbowUI();
            break;
        case 'exitTicket':
            renderExitTicketStudentSection();
            break;
    }
}
    


   // Fixed showStudentMemoryWall function
function showStudentMemoryWall() {
    // Hide other sections
    document.querySelectorAll('.dashboard-content').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show student memory wall
    const memoryWallSection = document.getElementById('studentMemoryWall');
    if (memoryWallSection) {
        memoryWallSection.style.display = 'block';
        
        // Update active nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.textContent.includes('📝 Memory Wall')) {
                item.classList.add('active');
            }
        });
        
        // Update header
        const header = document.getElementById('dashboardHeader');
        if (header) {
            header.querySelector('h1').textContent = 'Class Memory Wall';
            header.querySelector('.dashboard-subtitle').textContent = 'Share memories and encouragement with classmates';
        }
        
        // Load memory wall data
        setTimeout(() => {
            loadStudentMemoryWall();
        }, 100);
    } else {
        console.error("Student memory wall section not found!");
        showNotification("Memory wall feature not available", "error");
    }
}


function getNavItemText(sectionId) {
    const navTexts = {
        'dashboard': '📊',
        'tasks': '📝',
        'assignments': '📚',
        'classroom': '🏫',
        'myclasses': '🎓',
        'statistics': '📈',
        'tools': '🛠️',
        'ai': '🤖',
        'profile': '👤'
    };
    return navTexts[sectionId] || '';
}

function updateDashboardHeader(sectionId) {
    const header = document.getElementById('dashboardHeader');
    const subtitle = document.getElementById('dashboardSubtitle');
    
    if (!header || !subtitle) return;
    
    switch(sectionId) {
        case 'dashboard':
            header.querySelector('h1').textContent = 'Welcome to Your Learning Dashboard';
            subtitle.textContent = 'Track your progress, manage tasks, and achieve your study goals';
            break;
        case 'tasks':
            header.querySelector('h1').textContent = 'Task Manager';
            subtitle.textContent = 'Organize and track your daily tasks';
            renderTasks();
            break;
        case 'assignments':
            header.querySelector('h1').textContent = 'Assignment Tracker';
            subtitle.textContent = 'Manage your school assignments and deadlines';
            renderAssignments();
            break;
        case 'classroom':
            header.querySelector('h1').textContent = 'Classroom';
            subtitle.textContent = 'Connect with your teacher and classmates';
            loadClassroomData();
            break;
        case 'myclasses':
            header.querySelector('h1').textContent = 'My Classes';
            subtitle.textContent = 'Manage your classrooms and join new ones';
            renderClassesList();
            break;
        case 'statistics':
            header.querySelector('h1').textContent = 'Learning Statistics';
            subtitle.textContent = 'Visualize your progress with charts and insights';
            break;
        case 'tools':
            header.querySelector('h1').textContent = 'Study Tools';
            subtitle.textContent = 'Tools and resources to enhance your learning';
            break;
        case 'ai':
            header.querySelector('h1').textContent = 'AI Learning Resources';
            subtitle.textContent = 'AI-powered tools and educational resources';
            break;
        case 'profile':
            header.querySelector('h1').textContent = 'Profile Settings';
            subtitle.textContent = 'Manage your profile and preferences';
            break;
    }
}

// ========== UTILITY FUNCTIONS ==========
function initUI() {
    const savedTheme = localStorage.getItem('studentTheme') || 'light';
    const isPremiumUnlocked = getReferralCount() >= REFERRAL_TARGET;
    const isRainbowUnlocked = (studyData.streak || 0) >= 30 || localStorage.getItem(RAINBOW_UNLOCKED_KEY) === 'true';
    const isForestUnlocked = (studyData.streak || 0) >= 7 || localStorage.getItem(FOREST_UNLOCKED_KEY) === 'true';
    let appliedTheme = savedTheme;
    if (savedTheme === 'premium' && !isPremiumUnlocked) {
        appliedTheme = 'light';
    }
    if (savedTheme === 'rainbow' && !isRainbowUnlocked) {
        appliedTheme = 'light';
    }
    if (savedTheme === 'forest' && !isForestUnlocked) {
        appliedTheme = 'light';
    }
    document.body.className = appliedTheme;
    const themeSelector = document.querySelector('.theme-selector');
    if (themeSelector) themeSelector.value = appliedTheme;
    localStorage.setItem('studentTheme', appliedTheme);
    
    loadMotivationalQuote();
    loadInspiringStories();
    renderStudyHeatmap();
    
    const nameField = document.getElementById('studentName');
    if (nameField && currentUserName) nameField.value = currentUserName;
    
    const profileNameField = document.getElementById('profileName');
    if (profileNameField && currentUserName) profileNameField.value = currentUserName;
    
    showSection(currentSection);
    
    updateReferralUI();
    updateRainbowUI();
    renderDailyChallenge();
    setInterval(syncReferralCountFromFirebase, 30000);

    updateTimeGreeting();
    applyTimeTheme();
    setInterval(updateTimeGreeting, 600000);

    const chatbotBtn = document.getElementById('chatbotBtn');
    if (chatbotBtn) {
        chatbotBtn.addEventListener('click', showChatbotMessage);
    }
    showChatbotGreetingThenChallenge();
    scheduleChatbotMessage();
    updateStatsCompare();

    console.log("🎨 UI initialized with theme:", savedTheme);
}

function setupEventListeners() {
    const taskInput = document.getElementById('taskInput');
    if (taskInput) {
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTask();
        });
    }
    
    const taskInputFull = document.getElementById('taskInputFull');
    if (taskInputFull) {
        taskInputFull.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTask();
        });
    }
    
    const hoursInput = document.getElementById('hoursInput');
    if (hoursInput) {
        hoursInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addStudyHours();
        });
    }
    
    document.getElementById('storyModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeStoryModal();
        }
    });

    const rainbowModal = document.getElementById('rainbowModal');
    if (rainbowModal) {
        rainbowModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeRainbowModal();
            }
        });
    }
    const forestModal = document.getElementById('forestModal');
    if (forestModal) {
        forestModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeForestModal();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeStoryModal();
            closeRainbowModal();
            closeForestModal();
        }
    });
}

function loadAllData() {
    renderTasks();
    renderDashboardTasks();
    renderAssignments();
    renderDashboardAssignments();
    loadClassroomData();
    loadMotivationalQuote();
    loadInspiringStories();
    updateClassSelector();
    renderClassesList();
    
    const savedProfile = localStorage.getItem('studentProfile');
    if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        document.getElementById('studentName').value = profile.name || '';
        document.getElementById('studentEmail').value = profile.email || '';
        document.getElementById('studentBio').value = profile.bio || '';
        document.getElementById('profileName').value = profile.name || '';
        document.getElementById('profileEmail').value = profile.email || '';
        document.getElementById('profileBio').value = profile.bio || '';
        currentUserName = profile.name || 'Student';
    }
    initDailyGoalInput();

}

// ========== MOTIVATIONAL QUOTES ==========
function loadMotivationalQuote() {
    const randomQuote = inspiringQuotes[Math.floor(Math.random() * inspiringQuotes.length)];
    document.getElementById('dailyQuote').textContent = `"${randomQuote.text}"`;
    document.getElementById('quoteAuthor').textContent = `— ${randomQuote.author}`;
}

// ========== TIME OF DAY THEMING + GREETING ==========
function getTimeGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning! Ready to grind?";
    if (hour >= 12 && hour < 18) return "Good afternoon! Keep the momentum going.";
    if (hour >= 18 && hour < 22) return "Good evening! Time to make progress.";
    return "Late night study session?";
}

function isDaytime() {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18;
}

function updateTimeGreeting() {
    const el = document.getElementById('timeGreeting');
    if (el) el.textContent = getTimeGreeting();
}

function applyTimeTheme() {
    const savedTheme = localStorage.getItem('studentTheme') || 'light';
    if (savedTheme !== 'light' && savedTheme !== 'dark') return;
    const nextTheme = isDaytime() ? 'light' : 'dark';
    if (savedTheme !== nextTheme) {
        document.body.className = nextTheme;
        localStorage.setItem('studentTheme', nextTheme);
        const themeSelector = document.querySelector('.theme-selector');
        if (themeSelector) themeSelector.value = nextTheme;
    }
}

function newQuote() {
    loadMotivationalQuote();
    showNotification("New inspiration loaded! 💫", "info");
}

// ========== NOTIFICATION SYSTEM ==========
function showNotification(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '💡';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    if (type === 'info') icon = 'ℹ️';
    
    toast.innerHTML = `
        <span style="font-size: 1.5rem;">${icon}</span>
        <div style="flex: 1;">
            <div style="font-weight: 700;">${message}</div>
            <div style="font-size: 0.875rem; opacity: 0.8;">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function updateSyncStatus(text, type = "info") {
    const syncStatus = document.getElementById('syncStatus');
    const syncIcon = syncStatus.querySelector('.sync-icon');
    const syncText = syncStatus.querySelector('.sync-text');
    
    if (!syncStatus) return;
    
    syncStatus.style.display = 'flex';
    syncStatus.className = `sync-status ${type}`;
    syncText.textContent = text;
    
    let icon = '⏳';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    if (type === 'info') icon = 'ℹ️';
    
    syncIcon.textContent = icon;
    
    if (type === 'success') {
        setTimeout(() => {
            syncStatus.style.opacity = '0';
            setTimeout(() => {
                syncStatus.style.display = 'none';
                syncStatus.style.opacity = '1';
            }, 300);
        }, 2000);
    }
}

// ========== THEME MANAGEMENT ==========
function changeTheme(theme) {
    const current = localStorage.getItem('studentTheme') || 'light';
    const referrals = getReferralCount();
    const wasFocus = document.body.classList.contains('focus-mode');
    const wasBlocker = document.body.classList.contains('focus-blocker-enabled');
    if (theme === 'premium' && referrals < REFERRAL_TARGET) {
        document.body.className = 'premium';
        if (wasFocus) document.body.classList.add('focus-mode');
        if (wasBlocker) document.body.classList.add('focus-blocker-enabled');
        openReferralModal();
        return;
    }
    if (theme === 'forest' && (studyData.streak || 0) < 7 && localStorage.getItem(FOREST_UNLOCKED_KEY) !== 'true') {
        previewForestTheme();
        const themeSelector = document.querySelector('.theme-selector');
        if (themeSelector) themeSelector.value = current;
        return;
    }
    if (theme === 'rainbow' && (studyData.streak || 0) < 30) {
        previewRainbowTheme();
        const themeSelector = document.querySelector('.theme-selector');
        if (themeSelector) themeSelector.value = current;
        return;
    } else {
        document.body.className = theme;
    }
    if (wasFocus) document.body.classList.add('focus-mode');
    if (wasBlocker) document.body.classList.add('focus-blocker-enabled');
    localStorage.setItem('studentTheme', theme);
    
    // Recreate charts with new theme colors
    if (currentSection === 'statistics') {
        setTimeout(updateCharts, 100);
    }
    
    showNotification(`Switched to ${theme} theme`, "success");
}

// ========== DATA IMPORT/EXPORT ==========
function exportData() {
    const allData = {
        exportDate: new Date().toISOString(),
        version: "2.5",
        user: {
            id: currentUserId,
            name: currentUserName,
            classes: userClasses
        },
        studyData: studyData,
        tasks: tasks,
        assignments: assignments,
        profile: JSON.parse(localStorage.getItem('studentProfile') || '{}')
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `student-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification("All data exported successfully", "success");
}

function clearAllData() {
    if (confirm("⚠️ This will delete ALL your data including tasks, assignments, study history, and profile. This cannot be undone! Continue?")) {
        localStorage.removeItem('studentPersistentData');
        localStorage.removeItem('studentTasks');
        localStorage.removeItem('studentAssignments');
        localStorage.removeItem('studentStudyData');
        localStorage.removeItem('studentProfile');
        localStorage.removeItem('studentUserClasses');
        localStorage.removeItem('studentUserId');
        localStorage.removeItem('studentName');
        localStorage.removeItem('studentTheme');
        
        tasks = [];
        assignments = [];
        studyData = {
            streak: 0,
            lastStudyDate: "",
            totalMinutes: 0,
            totalStudyDays: 0,
            totalStudyHours: 0,
            studySessions: [],
            weeklyPattern: [0, 0, 0, 0, 0, 0, 0],
            streakHistory: [],
            streakMilestones: [3, 7, 14, 30, 60, 90],
            currentMilestone: 0,
            dailyStats: [],
            focusScores: [],
            consistencyScores: []
        };
        userClasses = [];
        currentClassCode = null;
        selectedClassIndex = -1;
        currentUserId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        currentUserName = 'Student';
        
        document.getElementById('studentName').value = '';
        document.getElementById('studentEmail').value = '';
        document.getElementById('studentBio').value = '';
        document.getElementById('profileName').value = '';
        document.getElementById('profileEmail').value = '';
        document.getElementById('profileBio').value = '';
        document.getElementById('hoursInput').value = '';
        
        localStorage.setItem('studentUserId', currentUserId);
        
        loadAllData();
        updateAllStatistics();
        
        showNotification("All data cleared", "info");
    }
}

// ========== AUTOSAVE AND REFRESH ==========
function refreshData() {
    const refreshBtn = event.target;
    const originalText = refreshBtn.innerHTML;
    
    refreshBtn.innerHTML = '🔄 Refreshing...';
    refreshBtn.disabled = true;
    
    loadAllData();
    updateAllStatistics();
    
    if (currentSection === 'statistics') {
        updateCharts();
    }
    
    setTimeout(() => {
        refreshBtn.innerHTML = originalText;
        refreshBtn.disabled = false;
        showNotification("All data refreshed", "success");
    }, 1000);
}
// ========== FEEDBACK FORM ==========
function openFeedbackForm() {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLScJMM1dwIx3HvSu9mxyZm3HgZ7UO7QwLX673JKellaKLSM7EQ/viewform?usp=publish-editor', '_blank');
}

// ========== STREAK SHARE (capture full streak card) ==========
async function captureStreakCard() {
    const card = document.querySelector('.streak-card');
    if (!card) throw new Error('Streak card not found');

    const canvas = await html2canvas(card, {
        backgroundColor: null,
        scale: 2
    });

    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
    });
}

// Placeholder: replace with work.ink shortener once you provide endpoint/token
async function shortenUrl(longUrl) {
    return longUrl;
}

async function shareStreak() {
    const msg = document.getElementById('streakShareMsg');
    const shareBtn = document.getElementById('shareStreakBtn');

    if (!msg || !shareBtn) return;

    showNotification("Generating your streak image… please wait", "info");
    msg.textContent = 'Generating your streak image...';
    shareBtn.disabled = true;

    try {
        const card = document.querySelector('.streak-card');
        if (!card) throw new Error('Streak card not found');

        const canvas = await html2canvas(card, { backgroundColor: null, scale: 2 });
        const dataUrl = canvas.toDataURL('image/png');

        await navigator.clipboard.writeText(dataUrl);

        showNotification("URL copied! Paste it into a browser or chat to share.", "success");
        msg.textContent = 'URL copied! Paste into a browser or message.';
    } catch (err) {
        console.error(err);
        showNotification("Could not generate URL. Try again.", "error");
        msg.textContent = 'Could not generate the URL. Try again.';
    } finally {
        shareBtn.disabled = false;
    }
}



document.addEventListener('DOMContentLoaded', () => {
    const shareBtn = document.getElementById('shareStreakBtn');
    if (shareBtn) shareBtn.addEventListener('click', shareStreak);
});


// ========== INITIALIZATION COMPLETE ==========
console.log("✅ Student Mode initialized successfully!");
// Add to all pages (guard analytics when SDK isn't loaded)
if (window.firebase && firebase.analytics) {
  firebase.analytics().logEvent('page_view', { page_location: window.location.href });
}



// Function to load memory wall for students
function loadStudentMemoryWall() {
    if (!currentClassCode) return;
    
    try {
        database.ref(`memoryWall/${currentClassCode}`).on('value', (snapshot) => {
            const memoriesContainer = document.getElementById('studentMemoryWall');
            if (!memoriesContainer) return;
            
            if (snapshot.exists()) {
                const memories = [];
                snapshot.forEach(child => {
                    memories.push(child.val());
                });
                
                // Sort by date (newest first)
                memories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                // Render memories
                memoriesContainer.innerHTML = memories.map(memory => `
                    <div class="memory-card">
                        <div class="memory-text">${memory.text}</div>
                        <div class="memory-footer">
                            <span class="memory-author">👤 ${memory.author}</span>
                            <span class="memory-date">${getTimeAgo(memory.createdAt)}</span>
                        </div>
                        <button class="btn-like" onclick="likeMemoryAsStudent('${memory.id}')">
                            👍 ${memory.likes || 0}
                        </button>
                    </div>
                `).join('');
            }
        });
    } catch (error) {
        console.error("Error loading memory wall for students:", error);
    }
}

function openExitTicketFromStudent() {
  showSection('exitTicket');
}

async function renderExitTicketStudentSection() {
  const questionsEl = document.getElementById('exitTicketStudentQuestions');
  const statusEl = document.getElementById('exitTicketStudentStatus');
  if (statusEl) statusEl.textContent = '';
  if (!currentClassCode) {
    if (questionsEl) questionsEl.textContent = 'Join a class to view Exit Tickets.';
    return;
  }
  if (questionsEl) questionsEl.textContent = 'Loading questions...';
  try {
    if (!database) throw new Error('No database');
    const snap = await database.ref(`exitTickets/${currentClassCode}/current`).once('value');
    if (!snap.exists()) {
      if (questionsEl) questionsEl.textContent = 'No Exit Ticket available yet.';
      return;
    }
    const data = snap.val();
    const questions = data.questions || [];
    if (!questions.length) {
      if (questionsEl) questionsEl.textContent = 'No Exit Ticket questions found.';
      return;
    }
    if (questionsEl) {
      questionsEl.innerHTML = questions.map((q, idx) => `<div style="margin-bottom: 8px;"><strong>${idx + 1}.</strong> ${q}</div>`).join('');
    }
  } catch (error) {
    if (questionsEl) questionsEl.textContent = 'Unable to load Exit Ticket. Please try again.';
  }
}

async function submitExitTicketStudent() {
  const statusEl = document.getElementById('exitTicketStudentStatus');
  const thankYouEl = document.getElementById('exitTicketThankYou');
  const formCard = document.getElementById('exitTicketFormCard');
  if (!currentClassCode) {
    if (statusEl) statusEl.textContent = 'Join a class to submit.';
    return;
  }
  const answers = [
    document.getElementById('exitTicketAnswer1').value.trim(),
    document.getElementById('exitTicketAnswer2').value.trim(),
    document.getElementById('exitTicketAnswer3').value.trim()
  ];
  if (!answers[0] && !answers[1] && !answers[2]) {
    if (statusEl) statusEl.textContent = 'Please answer at least one question.';
    return;
  }
  const payload = {
    answers: answers,
    submittedAt: new Date().toISOString(),
    student: localStorage.getItem('studentName') || 'Student'
  };
  try {
    if (!database) throw new Error('No database');
    await database.ref(`exitTickets/${currentClassCode}/responses`).push().set(payload);
    if (statusEl) statusEl.textContent = 'Exit Ticket submitted. Thank you!';
    if (formCard) formCard.style.display = 'none';
    if (thankYouEl) thankYouEl.style.display = 'block';
  } catch (error) {
    if (statusEl) statusEl.textContent = 'Unable to submit. Please try again.';
  }
}





// Student Mode Memory Wall Functions
let studentSelectedNoteColor = '#FFEB3B';
let studentMemoryWallNotes = [];

// Load memory wall for students
function loadStudentMemoryWall() {
    if (!currentClassCode) return;
    
    try {
        database.ref(`memoryWall/${currentClassCode}/notes`).on('value', (snapshot) => {
            if (snapshot.exists()) {
                studentMemoryWallNotes = [];
                snapshot.forEach(child => {
                    studentMemoryWallNotes.push({
                        id: child.key,
                        ...child.val()
                    });
                });
                renderStudentStickyNotes();
            } else {
                studentMemoryWallNotes = [];
                renderStudentStickyNotes();
            }
        });
    } catch (error) {
        console.error("Error loading memory wall for student:", error);
        studentMemoryWallNotes = [];
        renderStudentStickyNotes();
    }
}

// Toggle add memory form for students
function studentToggleAddMemoryForm() {
    const form = document.getElementById('studentAddMemoryForm');
    if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'block';
        document.getElementById('studentMemoryText').focus();
        
        // Set up character count
        const textarea = document.getElementById('studentMemoryText');
        const charCount = document.getElementById('studentMemoryCharCount');
        
        textarea.addEventListener('input', function() {
            const length = this.value.length;
            charCount.textContent = length;
            
            if (length > 300) {
                this.value = this.value.substring(0, 300);
                charCount.textContent = '300';
                charCount.style.color = 'var(--danger)';
            } else {
                charCount.style.color = 'var(--text-muted)';
            }
        });
        
        // Set student name if available
        const studentName = localStorage.getItem('studentName') || 'Student';
        document.getElementById('studentMemoryAuthor').value = studentName;
    } else {
        form.style.display = 'none';
    }
}

// Student select note color
function studentSelectNoteColor(color) {
    studentSelectedNoteColor = color;
    
    // Update selected state
    document.querySelectorAll('#studentAddMemoryForm .color-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.color === color) {
            option.classList.add('selected');
        }
    });
}

// Student add memory
function studentAddMemoryFromForm() {
    const text = document.getElementById('studentMemoryText').value.trim();
    const author = document.getElementById('studentMemoryAuthor').value.trim() || 'Student';
    
    if (!text) {
        showNotification("Please write something for your memory note!", "error");
        return;
    }
    
    // Get student ID
    const studentId = localStorage.getItem('studentUserId') || 'student_' + Date.now();
    
    // Create new note
    const note = {
        id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        text: text,
        author: author,
        color: studentSelectedNoteColor,
        x: Math.random() * 70 + 10,
        y: Math.random() * 70 + 10,
        rotation: (Math.random() * 8) - 4,
        likes: 0,
        likedBy: [],
        createdAt: new Date().toISOString(),
        classCode: currentClassCode,
        studentId: studentId,
        isStudentNote: true
    };
    
    try {
        const noteRef = database.ref(`memoryWall/${currentClassCode}/notes`).push();
        note.id = noteRef.key;
        
        noteRef.set(note)
            .then(() => {
                showNotification("Your memory has been added to the wall! 📝", "success");
                
                // Clear form
                document.getElementById('studentMemoryText').value = '';
                document.getElementById('studentMemoryCharCount').textContent = '0';
                studentToggleAddMemoryForm();
            })
            .catch(error => {
                console.error("Error saving student note:", error);
                showNotification("Failed to save note: " + error.message, "error");
            });
    } catch (error) {
        console.error("Error saving student note:", error);
        showNotification("Error saving note", "error");
    }
}

// Render student sticky notes
function renderStudentStickyNotes() {
    const container = document.getElementById('studentStickyNotesContainer');
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    if (studentMemoryWallNotes.length === 0) {
        // Show welcome message
        const welcomeNote = document.createElement('div');
        welcomeNote.className = 'sticky-note welcome';
        welcomeNote.style.position = 'absolute';
        welcomeNote.style.top = '50%';
        welcomeNote.style.left = '50%';
        welcomeNote.style.transform = 'translate(-50%, -50%) rotate(-1deg)';
        welcomeNote.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        welcomeNote.style.color = 'white';
        welcomeNote.style.width = '300px';
        welcomeNote.style.textAlign = 'center';
        
        welcomeNote.innerHTML = `
            <div class="note-content">
                <div class="note-text">Welcome to our Class Memory Wall! 🎉<br><br>Share memories, achievements, or encouraging words!</div>
                <div class="note-meta">
                    <span class="note-author">👨‍🏫 Teacher</span>
                </div>
            </div>
        `;
        
        container.appendChild(welcomeNote);
        return;
    }
    
    // Create each sticky note
    studentMemoryWallNotes.forEach(note => {
        const noteElement = createStudentStickyNoteElement(note);
        container.appendChild(noteElement);
    });
}

// Create student sticky note element
// In your createStudentStickyNoteElement() function
function createStudentStickyNoteElement(note) {
    try {
        const noteElement = document.createElement('div');
        noteElement.className = 'student-sticky-note';
        noteElement.id = `student-note-${note.id}`;
        
        // Apply note properties
        noteElement.style.background = note.color || '#FFEB3B';
        noteElement.style.left = `${note.x || 20}%`;
        noteElement.style.top = `${note.y || 20}%`;
        noteElement.style.transform = `rotate(${note.rotation || 0}deg)`;
        noteElement.style.zIndex = '2';
        
        // ADD THIS: Force dark text on light backgrounds
        const isLightColor = [
            '#FFEB3B', '#FFF9C4', '#C8E6C9', '#BBDEFB', 
            '#E1BEE7', '#FFCCBC', '#FFFFFF'
        ].some(color => (note.color || '').toUpperCase().includes(color));
        
        if (isLightColor) {
            noteElement.style.color = '#333';
        }
        
        // Format date
        const date = new Date(note.createdAt || Date.now());
        const timeAgo = getTimeAgo(note.createdAt);
        
        // Create note content
        noteElement.innerHTML = `
            <div class="student-note-content">
                <div class="student-note-text" style="color: inherit;">
                    ${escapeHtml(note.text || '')}
                </div>
                <div class="student-note-meta" style="color: inherit;">
                    <div class="student-note-author" style="color: inherit;">
                        👤 ${escapeHtml(note.author || 'Anonymous')}
                        ${note.isStudentNote ? ' 👨‍🎓' : ''}
                    </div>
                    <div class="student-note-date" style="color: inherit;" title="${date.toLocaleString()}">
                        ${timeAgo}
                    </div>
                </div>
                <div class="student-note-actions">
                    <div class="student-note-likes" style="color: inherit;">
                        <span>👍</span>
                        <span>${note.likes || 0}</span>
                    </div>
                    <div style="flex-grow: 1;"></div>
                    <button class="btn-student-note btn-like" onclick="studentLikeNote('${note.id}', event)" style="color: #e63946;">
                        👍
                    </button>
                </div>
            </div>
        `;
        
        // Add drag functionality
        setupStudentNoteDragging(noteElement, note);
        
        return noteElement;
    } catch (error) {
        console.error("Error creating student sticky note:", error, note);
        return null;
    }
}
// Setup student note dragging (temporary drag, doesn't save)
function setupStudentNoteDragging(noteElement) {
    let isDragging = false;
    let startX, startY;
    
    noteElement.addEventListener('mousedown', startDrag);
    noteElement.addEventListener('touchstart', startDragTouch);
    
    function startDrag(e) {
        e.preventDefault();
        e.stopPropagation();
        
        isDragging = true;
        startX = e.clientX - noteElement.offsetLeft;
        startY = e.clientY - noteElement.offsetTop;
        
        noteElement.classList.add('dragging');
        noteElement.style.zIndex = '1000';
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    }
    
    function startDragTouch(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.touches.length === 1) {
            isDragging = true;
            const touch = e.touches[0];
            startX = touch.clientX - noteElement.offsetLeft;
            startY = touch.clientY - noteElement.offsetTop;
            
            noteElement.classList.add('dragging');
            noteElement.style.zIndex = '1000';
            
            document.addEventListener('touchmove', dragTouch);
            document.addEventListener('touchend', stopDragTouch);
        }
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        const whiteboard = document.getElementById('studentMemoryWhiteboard');
        const whiteboardRect = whiteboard.getBoundingClientRect();
        
        let newX = e.clientX - startX - whiteboardRect.left;
        let newY = e.clientY - startY - whiteboardRect.top;
        
        const xPercent = (newX / whiteboardRect.width) * 100;
        const yPercent = (newY / whiteboardRect.height) * 100;
        
        const boundedX = Math.max(0, Math.min(95, xPercent));
        const boundedY = Math.max(0, Math.min(95, yPercent));
        
        noteElement.style.left = `${boundedX}%`;
        noteElement.style.top = `${boundedY}%`;
    }
    
    function dragTouch(e) {
        if (!isDragging || e.touches.length !== 1) return;
        
        const touch = e.touches[0];
        const whiteboard = document.getElementById('studentMemoryWhiteboard');
        const whiteboardRect = whiteboard.getBoundingClientRect();
        
        let newX = touch.clientX - startX - whiteboardRect.left;
        let newY = touch.clientY - startY - whiteboardRect.top;
        
        const xPercent = (newX / whiteboardRect.width) * 100;
        const yPercent = (newY / whiteboardRect.height) * 100;
        
        const boundedX = Math.max(0, Math.min(95, xPercent));
        const boundedY = Math.max(0, Math.min(95, yPercent));
        
        noteElement.style.left = `${boundedX}%`;
        noteElement.style.top = `${boundedY}%`;
    }
    
    function stopDrag() {
        if (!isDragging) return;
        
        isDragging = false;
        noteElement.classList.remove('dragging');
        noteElement.style.zIndex = '2';
        
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
    }
    
    function stopDragTouch() {
        if (!isDragging) return;
        
        isDragging = false;
        noteElement.classList.remove('dragging');
        noteElement.style.zIndex = '2';
        
        document.removeEventListener('touchmove', dragTouch);
        document.removeEventListener('touchend', stopDragTouch);
    }
}

// Student like note
function studentLikeNote(noteId, event) {
    if (event) event.stopPropagation();
    
    const note = studentMemoryWallNotes.find(n => n.id === noteId);
    if (!note) return;
    
    // Get student ID
    const studentId = localStorage.getItem('studentUserId');
    if (!studentId) {
        showNotification("Please log in to like notes", "error");
        return;
    }
    
    // Check if already liked
    if (note.likedBy && note.likedBy.includes(studentId)) {
        showNotification("You already liked this note!", "info");
        return;
    }
    
    // Update in Firebase
    const newLikes = (note.likes || 0) + 1;
    const newLikedBy = [...(note.likedBy || []), studentId];
    
    database.ref(`memoryWall/${currentClassCode}/notes/${noteId}`).update({
        likes: newLikes,
        likedBy: newLikedBy
    })
    .then(() => {
        // Update UI
        note.likes = newLikes;
        note.likedBy = newLikedBy;
        
        const noteElement = document.getElementById(`student-note-${noteId}`);
        if (noteElement) {
            const likesSpan = noteElement.querySelector('.note-likes span:last-child');
            if (likesSpan) {
                likesSpan.textContent = newLikes;
            }
        }
        
        showNotification("Liked! 👍", "success");
    })
    .catch(error => {
        console.error("Error liking note:", error);
        showNotification("Failed to like note", "error");
    });
}





// Add this to your student mode navigation
// Memory Wall Navigation - Fixed
function showStudentMemoryWall() {
    console.log("📝 Showing student memory wall");
    
    // Hide all sections
    document.querySelectorAll('.dashboard-content').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show memory wall
    const memoryWallSection = document.getElementById('studentMemoryWall');
    if (memoryWallSection) {
        memoryWallSection.style.display = 'block';
        
        // Update active nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.textContent.includes('📝 Memory Wall')) {
                item.classList.add('active');
            }
        });
        
        // Load memory wall data
        loadStudentMemoryWall();
    } else {
        console.error("Memory wall section not found!");
        showNotification("Memory wall feature not available", "error");
        showSection('dashboard'); // Fallback
    }
}








// Student Mode Memory Wall Navigation
let studentSelectedAddMemoryColor = '#FFEB3B';

// Show student memory wall
function showStudentMemoryWall() {
    // Hide other sections
    document.querySelectorAll('.dashboard-content').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show student memory wall
    document.getElementById('studentMemoryWall').style.display = 'block';
    
    // Load memory wall data
    loadStudentMemoryWall();
}

// Show student add memory page
function showStudentAddMemoryPage() {
    document.getElementById('studentMemoryWall').style.display = 'none';
    document.getElementById('studentAddMemoryPage').style.display = 'block';
    
    // Reset form
    document.getElementById('studentAddMemoryText').value = '';
    document.getElementById('studentAddMemoryCharCount').textContent = '0';
    document.getElementById('studentAddMemoryPreviewText').textContent = 'Your memory will appear here...';
    
    // Set student name
    const studentName = localStorage.getItem('studentName') || 'Student';
    document.getElementById('studentAddMemoryAuthor').value = studentName;
    document.getElementById('studentAddMemoryPreviewAuthor').textContent = studentName;
    
    // Reset color
    studentSelectAddMemoryColor('#FFEB3B');
    
    // Setup preview
    setupStudentMemoryPreview();
}

// Go back to student memory wall
function studentBackToMemoryWall() {
    document.getElementById('studentAddMemoryPage').style.display = 'none';
    document.getElementById('studentMemoryWall').style.display = 'block';
}

// Student select color
function studentSelectAddMemoryColor(color) {
    studentSelectedAddMemoryColor = color;
    
    document.querySelectorAll('#studentAddMemoryPage .color-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.color === color) {
            option.classList.add('selected');
        }
    });
    
    document.getElementById('studentAddMemoryPreview').style.background = color;
}

// Setup student memory preview
function setupStudentMemoryPreview() {
    const textInput = document.getElementById('studentAddMemoryText');
    const authorInput = document.getElementById('studentAddMemoryAuthor');
    const charCount = document.getElementById('studentAddMemoryCharCount');
    
    textInput.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = length;
        
        document.getElementById('studentAddMemoryPreviewText').textContent = 
            this.value || 'Your memory will appear here...';
        
        if (length > 300) {
            this.value = this.value.substring(0, 300);
            charCount.textContent = '300';
            charCount.style.color = 'var(--danger)';
        } else {
            charCount.style.color = 'var(--text-muted)';
        }
    });
    
    authorInput.addEventListener('input', function() {
        const author = this.value.trim() || 'Student';
        document.getElementById('studentAddMemoryPreviewAuthor').textContent = author;
    });
}

// Student submit memory
function studentSubmitMemory() {
    const text = document.getElementById('studentAddMemoryText').value.trim();
    const author = document.getElementById('studentAddMemoryAuthor').value.trim() || 'Student';
    const studentId = localStorage.getItem('studentUserId') || 'student_' + Date.now();
    
    if (!text) {
        showNotification("Please write something for your memory note!", "error");
        return;
    }
    
    if (text.length < 10) {
        showNotification("Please write a bit more (at least 10 characters)", "warning");
        return;
    }
    
    const note = {
        id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        text: text,
        author: author,
        color: studentSelectedAddMemoryColor,
        x: Math.random() * 70 + 10,
        y: Math.random() * 70 + 10,
        rotation: (Math.random() * 8) - 4,
        likes: 0,
        likedBy: [],
        createdAt: new Date().toISOString(),
        classCode: currentClassCode,
        isTeacherNote: false,
        studentId: studentId,
        isStudentNote: true
    };
    
    try {
        const noteRef = database.ref(`memoryWall/${currentClassCode}/notes`).push();
        note.id = noteRef.key;
        
        noteRef.set(note)
            .then(() => {
                showNotification("Your memory has been added to the wall! 📝", "success");
                studentBackToMemoryWall();
            })
            .catch(error => {
                console.error("Error saving student note:", error);
                showNotification("Failed to save note: " + error.message, "error");
            });
    } catch (error) {
        console.error("Error saving student note:", error);
        showNotification("Error saving note", "error");
    }
}








// Replace the existing showStudentMemoryWall function with this:
function showStudentMemoryWall() {
    // Hide other sections
    document.querySelectorAll('.dashboard-content').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show student memory wall
    const memoryWallSection = document.getElementById('studentMemoryWall');
    if (memoryWallSection) {
        memoryWallSection.style.display = 'block';
        
        // Update active nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.textContent.includes('📝 Memory Wall')) {
                item.classList.add('active');
            }
        });
        
        // Load memory wall data
        loadStudentMemoryWall();
    } else {
        console.error("Student memory wall section not found!");
    }
}

// Add student memory wall loading function
function loadStudentMemoryWall() {
    if (!currentClassCode) {
        showNotification("Please join a class first", "error");
        return;
    }
    
    try {
        database.ref(`memoryWall/${currentClassCode}/notes`).on('value', (snapshot) => {
            if (snapshot.exists()) {
                studentMemoryWallNotes = [];
                snapshot.forEach(child => {
                    studentMemoryWallNotes.push({
                        id: child.key,
                        ...child.val()
                    });
                });
                renderStudentStickyNotes();
                updateStudentMemoryWallStats();
            } else {
                studentMemoryWallNotes = [];
                renderStudentStickyNotes();
            }
        });
    } catch (error) {
        console.error("Error loading memory wall for student:", error);
    }
}

// Student render sticky notes

// Student memory wall stats
function updateStudentMemoryWallStats() {
    const totalNotes = studentMemoryWallNotes.length;
    const totalLikes = studentMemoryWallNotes.reduce((sum, note) => sum + (note.likes || 0), 0);
    const studentNotes = studentMemoryWallNotes.filter(note => note.isStudentNote).length;
    
    const totalEl = document.getElementById('studentTotalNotesCount');
    const likesEl = document.getElementById('studentTotalLikesCount');
    const studentEl = document.getElementById('studentNotesCount');
    
    if (totalEl) totalEl.textContent = totalNotes;
    if (likesEl) likesEl.textContent = totalLikes;
    if (studentEl) studentEl.textContent = studentNotes;
}





// COMPLETE Student Sticky Notes Renderer
function renderStudentStickyNotes() {
    const container = document.getElementById('studentStickyNotesContainer');
    if (!container) {
        console.error("Student sticky notes container not found!");
        return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    if (!studentMemoryWallNotes || studentMemoryWallNotes.length === 0) {
        // Show welcome message for student
        const whiteboard = document.getElementById('studentMemoryWhiteboard');
        if (whiteboard) {
            const welcomeNote = document.createElement('div');
            welcomeNote.className = 'student-welcome-note';
            
            welcomeNote.innerHTML = `
                <div style="font-size: 3rem; margin-bottom: var(--spacing-md);">🎉</div>
                <div style="font-weight: 700; font-size: 1.25rem; margin-bottom: var(--spacing-sm);">
                    Welcome to the Class Memory Wall!
                </div>
                <div style="line-height: 1.5; opacity: 0.9;">
                    Be the first to share a memory, achievement, or encouraging word!
                </div>
            `;
            
            whiteboard.appendChild(welcomeNote);
        }
        updateStudentMemoryWallStats();
        return;
    }
    
    // Remove any existing welcome note
    const welcomeNote = document.querySelector('.student-welcome-note');
    if (welcomeNote) {
        welcomeNote.remove();
    }
    
    // Create each sticky note
    studentMemoryWallNotes.forEach(note => {
        const noteElement = createStudentStickyNoteElement(note);
        if (noteElement) {
            container.appendChild(noteElement);
        }
    });
    
    updateStudentMemoryWallStats();
}

// Create individual student sticky note element
function createStudentStickyNoteElement(note) {
    try {
        const noteElement = document.createElement('div');
        noteElement.className = 'student-sticky-note';
        noteElement.id = `student-note-${note.id}`;
        
        // Apply note properties
        noteElement.style.background = note.color || '#FFEB3B';
        noteElement.style.left = `${note.x || 20}%`;
        noteElement.style.top = `${note.y || 20}%`;
        noteElement.style.transform = `rotate(${note.rotation || 0}deg)`;
        noteElement.style.zIndex = '2';
        
        // Format date
        const date = new Date(note.createdAt || Date.now());
        const timeAgo = getTimeAgo(note.createdAt);
        
        // Create note content
        noteElement.innerHTML = `
            <div class="student-note-content">
                <div class="student-note-text">
                    ${escapeHtml(note.text || '')}
                </div>
                <div class="student-note-meta">
                    <div class="student-note-author">
                        👤 ${escapeHtml(note.author || 'Anonymous')}
                        ${note.isStudentNote ? ' 👨‍🎓' : ''}
                    </div>
                    <div class="student-note-date" title="${date.toLocaleString()}">
                        ${timeAgo}
                    </div>
                </div>
                <div class="student-note-actions">
                    <div class="student-note-likes">
                        <span>👍</span>
                        <span>${note.likes || 0}</span>
                    </div>
                    <div style="flex-grow: 1;"></div>
                    <button class="btn-student-note btn-like" onclick="studentLikeNote('${note.id}', event)">
                        👍
                    </button>
                </div>
            </div>
        `;
        
        // Add drag functionality for students
        setupStudentNoteDragging(noteElement, note);
        
        return noteElement;
    } catch (error) {
        console.error("Error creating student sticky note:", error, note);
        return null;
    }
}

// Setup dragging for student notes
function setupStudentNoteDragging(noteElement, note) {
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    const startDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        isDragging = true;
        
        if (e.type === 'touchstart') {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        } else {
            startX = e.clientX;
            startY = e.clientY;
        }
        
        // Get current position
        const rect = noteElement.getBoundingClientRect();
        const whiteboard = document.getElementById('studentMemoryWhiteboard');
        if (!whiteboard) return;
        
        const whiteboardRect = whiteboard.getBoundingClientRect();
        
        initialX = rect.left - whiteboardRect.left;
        initialY = rect.top - whiteboardRect.top;
        
        noteElement.classList.add('dragging');
        noteElement.style.zIndex = '1000';
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', dragTouch);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDragTouch);
    };
    
    const drag = (e) => {
        if (!isDragging) return;
        
        const whiteboard = document.getElementById('studentMemoryWhiteboard');
        if (!whiteboard) return;
        
        const whiteboardRect = whiteboard.getBoundingClientRect();
        
        const currentX = e.clientX;
        const currentY = e.clientY;
        
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        
        let newX = initialX + deltaX;
        let newY = initialY + deltaY;
        
        // Convert to percentages
        const xPercent = (newX / whiteboardRect.width) * 100;
        const yPercent = (newY / whiteboardRect.height) * 100;
        
        // Keep within bounds
        const boundedX = Math.max(0, Math.min(95, xPercent));
        const boundedY = Math.max(0, Math.min(95, yPercent));
        
        noteElement.style.left = `${boundedX}%`;
        noteElement.style.top = `${boundedY}%`;
        
        // Update note data
        note.x = boundedX;
        note.y = boundedY;
    };
    
    const dragTouch = (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        
        const touch = e.touches[0];
        const whiteboard = document.getElementById('studentMemoryWhiteboard');
        if (!whiteboard) return;
        
        const whiteboardRect = whiteboard.getBoundingClientRect();
        
        const currentX = touch.clientX;
        const currentY = touch.clientY;
        
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        
        let newX = initialX + deltaX;
        let newY = initialY + deltaY;
        
        const xPercent = (newX / whiteboardRect.width) * 100;
        const yPercent = (newY / whiteboardRect.height) * 100;
        
        const boundedX = Math.max(0, Math.min(95, xPercent));
        const boundedY = Math.max(0, Math.min(95, yPercent));
        
        noteElement.style.left = `${boundedX}%`;
        noteElement.style.top = `${boundedY}%`;
        
        note.x = boundedX;
        note.y = boundedY;
    };
    
    const stopDrag = () => {
        if (!isDragging) return;
        
        isDragging = false;
        noteElement.classList.remove('dragging');
        noteElement.style.zIndex = '2';
        
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchmove', dragTouch);
        document.removeEventListener('touchend', stopDragTouch);
        
        // Save position (students can only drag temporarily, not save)
        // Note: Student dragging is temporary, positions aren't saved to Firebase
    };
    
    const stopDragTouch = () => {
        stopDrag();
    };
    
    // Add event listeners
    noteElement.addEventListener('mousedown', startDrag);
    noteElement.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrag(e);
    }, { passive: false });
}

// Helper function for time ago
function getTimeAgo(dateString) {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';
    
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Escape HTML helper
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

// Update student memory wall stats
function updateStudentMemoryWallStats() {
    if (!studentMemoryWallNotes) {
        studentMemoryWallNotes = [];
    }
    
    const totalNotes = studentMemoryWallNotes.length;
    const totalLikes = studentMemoryWallNotes.reduce((sum, note) => sum + (note.likes || 0), 0);
    
    // Count student's own notes
    const studentId = localStorage.getItem('studentUserId');
    const studentNotes = studentId ? 
        studentMemoryWallNotes.filter(note => note.studentId === studentId).length : 
        0;
    
    const totalEl = document.getElementById('studentTotalNotesCount');
    const likesEl = document.getElementById('studentTotalLikesCount');
    const studentEl = document.getElementById('studentNotesCount');
    
    if (totalEl) totalEl.textContent = totalNotes;
    if (likesEl) likesEl.textContent = totalLikes;
    if (studentEl) studentEl.textContent = studentNotes;
}

// Refresh student memory wall
function refreshStudentMemoryWall() {
    loadStudentMemoryWall();
    showNotification("Memory wall refreshed", "info");
}

// Load student memory wall data
function loadStudentMemoryWall() {
    if (!currentClassCode) {
        showNotification("Please join a class first", "error");
        return;
    }
    
    console.log("Loading memory wall for class:", currentClassCode);
    
    try {
        // First clear existing data
        studentMemoryWallNotes = [];
        
        // Listen for memory wall changes
        const memoryWallRef = database.ref(`memoryWall/${currentClassCode}/notes`);
        
        memoryWallRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                const notes = [];
                snapshot.forEach(child => {
                    const noteData = child.val();
                    notes.push({
                        id: child.key,
                        ...noteData
                    });
                });
                
                studentMemoryWallNotes = notes;
                console.log("Loaded", studentMemoryWallNotes.length, "notes");
                renderStudentStickyNotes();
            } else {
                studentMemoryWallNotes = [];
                renderStudentStickyNotes();
                console.log("No memory wall notes found");
            }
        }, (error) => {
            console.error("Error loading memory wall:", error);
            showNotification("Error loading memory wall", "error");
        });
        
    } catch (error) {
        console.error("Error setting up memory wall listener:", error);
        showNotification("Error connecting to memory wall", "error");
    }
}





(function() {
    console.log('🌀 Adding Focus Portal button to mobile nav...');
    
    function addFocusPortalToMobileNav() {
        const mobileNavControls = document.getElementById('mobileNavControls');
        if (!mobileNavControls) {
            console.log('Mobile nav controls not found');
            return false;
        }
        
        // Check if button already exists
        if (document.getElementById('focusPortalNavBtn')) {
            console.log('Focus Portal button already exists');
            return true;
        }
        
        // Create Focus Portal button
        const focusBtn = document.createElement('button');
        focusBtn.className = 'btn focus-portal-nav-btn';
        focusBtn.id = 'focusPortalNavBtn';
        focusBtn.onclick = function(e) {
            e.preventDefault();
            if (window.playSound) window.playSound('select');
            openFocusPortalFromNav();
        };
        
        // Add icon and text
        focusBtn.innerHTML = '<span>🌀 FOCUS</span>';
        
        // Insert after refresh button or at the end
        const refreshBtn = mobileNavControls.querySelector('.btn-secondary');
        if (refreshBtn) {
            refreshBtn.insertAdjacentElement('afterend', focusBtn);
        } else {
            mobileNavControls.appendChild(focusBtn);
        }
        
        console.log('✅ Focus Portal button added to mobile nav');
        return true;
    }
    
    // Function to open focus portal from nav
    window.openFocusPortalFromNav = function() {
        // Check if focus mode is already on
        if (document.body.classList.contains('focus-mode')) {
            // If in focus mode, maybe show a message or just focus on it
            const focusPanel = document.querySelector('.focus-mode-panel');
            if (focusPanel) {
                focusPanel.scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }
        
        // Toggle focus mode
        if (window.toggleFocusMode) {
            window.toggleFocusMode();
        } else {
            // Fallback if function not available
            console.log('Focus mode toggle not available');
            createFocusPortalModal();
        }
    };
    
    // Fallback focus portal modal
    function createFocusPortalModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('focusPortalModal');
        if (existingModal) existingModal.remove();
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'focusPortalModal';
        modal.className = 'character-modal';
        modal.innerHTML = `
            <div class="character-select-card" style="max-width: 500px; background: linear-gradient(135deg, #1e1a3a, #2a1a4a);">
                <div class="character-select-title">🌀 FOCUS PORTAL</div>
                <div style="color: #fbbf24; margin: 20px 0; font-size: 18px;">
                    ⚡ ENHANCED FOCUS MODE ⚡
                </div>
                <div style="color: #94a3b8; margin-bottom: 30px;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 25px 0;">
                        <div style="background: rgba(0,0,0,0.6); border: 2px solid #8b5cf6; border-radius: 15px; padding: 15px; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 10px;">⏰</div>
                            <div style="color: #8b5cf6; font-weight: 700;">Timer</div>
                        </div>
                        <div style="background: rgba(0,0,0,0.6); border: 2px solid #8b5cf6; border-radius: 15px; padding: 15px; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 10px;">🔊</div>
                            <div style="color: #8b5cf6; font-weight: 700;">Sounds</div>
                        </div>
                        <div style="background: rgba(0,0,0,0.6); border: 2px solid #8b5cf6; border-radius: 15px; padding: 15px; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 10px;">🧠</div>
                            <div style="color: #8b5cf6; font-weight: 700;">Brain Dump</div>
                        </div>
                        <div style="background: rgba(0,0,0,0.6); border: 2px solid #8b5cf6; border-radius: 15px; padding: 15px; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 10px;">🔒</div>
                            <div style="color: #8b5cf6; font-weight: 700;">Lock In</div>
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button class="action-btn" style="padding: 15px 30px; background: linear-gradient(135deg, #333, #222);" onclick="closeFocusPortalModal()">CLOSE</button>
                    <button class="ultimate-btn" style="padding: 15px 30px;" onclick="toggleFocusModeFromModal()">ENTER FOCUS</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeFocusPortalModal();
        });
    }
    
    // Close modal function
    window.closeFocusPortalModal = function() {
        const modal = document.getElementById('focusPortalModal');
        if (modal) modal.remove();
        if (window.playSound) window.playSound('select');
    };
    
    // Toggle focus from modal
    window.toggleFocusModeFromModal = function() {
        closeFocusPortalModal();
        if (window.toggleFocusMode) {
            window.toggleFocusMode();
        } else {
            // Manual toggle
            document.body.classList.toggle('focus-mode');
            const focusPanel = document.querySelector('.focus-mode-panel');
            if (focusPanel) {
                focusPanel.style.display = 'block';
                focusPanel.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };
    
    // Try to add button when DOM is ready
    function tryAddButton(attempt = 1) {
        const mobileNav = document.getElementById('mobileNavControls');
        if (mobileNav && mobileNav.children.length > 0) {
            addFocusPortalToMobileNav();
        } else if (attempt < 20) {
            setTimeout(() => tryAddButton(attempt + 1), 500);
        }
    }
    
    // Start trying
    setTimeout(() => tryAddButton(1), 1000);
    
    // Also try when switching sections
    const originalShowSection = window.showSection;
    if (originalShowSection) {
        window.showSection = function(sectionId) {
            originalShowSection(sectionId);
            setTimeout(() => {
                if (!document.getElementById('focusPortalNavBtn')) {
                    addFocusPortalToMobileNav();
                }
            }, 500);
        };
    }
    
    // Handle resize events to ensure button fits
    window.addEventListener('resize', function() {
        const btn = document.getElementById('focusPortalNavBtn');
        if (!btn) return;
        
        if (window.innerWidth <= 359) {
            btn.innerHTML = '<span>🌀</span>';
        } else {
            btn.innerHTML = '<span>🌀 FOCUS</span>';
        }
    });
    
    console.log('🌀 Focus Portal button script loaded');
})();

(function() {
    'use strict';
    
    // Store original functions
    const originalToggleFocusMode = window.toggleFocusMode;
    
    // Enhanced toggle function
    window.toggleFocusMode = function() {
        const isEntering = !document.body.classList.contains('focus-mode');
        
        if (originalToggleFocusMode) {
            originalToggleFocusMode();
        } else {
            document.body.classList.toggle('focus-mode');
        }
        
        if (isEntering) {
            // Entering focus mode
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            
            // Scroll to top
            window.scrollTo(0, 0);
            document.querySelector('.main-content')?.scrollTo(0, 0);
            
            // Force hide all dashboard content
            setTimeout(() => {
                document.querySelectorAll('.dashboard-header, .dashboard-grid, .footer, .quick-stats, .content-card, .form-card, .streak-card, .motivation-card, .pro-tip, .controls-bar, .stats-overview-cards, .charts-container, .toast-container, .feedback-btn, .chatbot-fab, .student-view-bar, .mobile-nav-controls').forEach(el => {
                    if (el) el.style.setProperty('display', 'none', 'important');
                });
            }, 10);
        } else {
            // Exiting focus mode
            document.body.style.overflow = '';
            document.body.style.height = '';
            document.body.style.position = '';
            document.body.style.width = '';
            
            // Restore dashboard content
            setTimeout(() => {
                document.querySelectorAll('.dashboard-header, .dashboard-grid, .footer, .quick-stats, .content-card, .form-card, .streak-card, .motivation-card, .pro-tip, .controls-bar, .stats-overview-cards, .charts-container, .toast-container, .feedback-btn, .chatbot-fab, .student-view-bar, .mobile-nav-controls').forEach(el => {
                    if (el) el.style.removeProperty('display');
                });
            }, 10);
        }
    };
    
    // Handle keyboard shortcut
    document.addEventListener('keydown', function(e) {
        if (e.shiftKey && e.key.toLowerCase() === 'f') {
            if (document.activeElement?.tagName.match(/^(INPUT|TEXTAREA|SELECT)$/i)) {
                return;
            }
            e.preventDefault();
            window.toggleFocusMode();
        }
    });
    
    // Handle resize events
    window.addEventListener('resize', function() {
        if (document.body.classList.contains('focus-mode')) {
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        }
    });
    
    // Handle touch events to prevent pull-to-refresh
    document.addEventListener('touchmove', function(e) {
        if (document.body.classList.contains('focus-mode')) {
            const mainContent = document.querySelector('.main-content');
            const focusPanel = document.querySelector('.focus-mode-panel');
            
            if (mainContent && focusPanel) {
                const isScrollingDown = e.targetTouches[0].clientY > e.targetTouches[0].clientY;
                const atTop = mainContent.scrollTop <= 0;
                
                if (atTop && isScrollingDown) {
                    e.preventDefault();
                }
            }
        }
    }, { passive: false });
    
    // Ensure proper state on page load
    if (document.body.classList.contains('focus-mode')) {
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        
        document.querySelectorAll('.dashboard-header, .dashboard-grid, .footer, .quick-stats, .content-card, .form-card, .streak-card, .motivation-card, .pro-tip, .controls-bar, .stats-overview-cards, .charts-container, .toast-container, .feedback-btn, .chatbot-fab, .student-view-bar, .mobile-nav-controls').forEach(el => {
            if (el) el.style.setProperty('display', 'none', 'important');
        });
    }
})();

// ========== STUDENT JOIN WHITEBOARD ==========
let stuWbCanvas = null, stuWbCtx = null;
let stuWbDrawing = false;
let stuWbTool = 'pen';
let stuWbColor = 'black';
let stuWbSize = 4;
let stuWbLastX = 0, stuWbLastY = 0;
let stuWbSessionCode = null;
let stuWbSyncTimer = null;

function getStuWbDb() {
    return window.database || (firebase ? firebase.database() : null);
}

function joinWbSession() {
    const codeInput = document.getElementById('wbCodeInput');
    const code = codeInput.value.trim().toUpperCase();
    
    if (!code || code.length !== 6) {
        alert("Please enter a valid 6-digit code");
        return;
    }
    
    const db = getStuWbDb();
    if (!db) {
        alert("Database not connected. Please refresh.");
        return;
    }
    
    db.ref(`whiteboard/${code}`).once('value', (snapshot) => {
        if (!snapshot.exists()) {
            alert("Session not found. Check the code.");
            return;
        }
        
        const session = snapshot.val();
        if (!session.active) {
            alert("Session has ended.");
            return;
        }
        
        stuWbSessionCode = code;
        
        const studentId = localStorage.getItem('studentUserId') || 'student_' + Date.now();
        const studentName = localStorage.getItem('studentName') || 'Student';
        
        db.ref(`whiteboard/${code}/participants/${studentId}`).set({
            name: studentName,
            joinedAt: Date.now(),
            active: true
        });
        
        db.ref(`whiteboard/${code}/participants/${studentId}`).onDisconnect().remove();
        
        document.getElementById('joinWbContainer').style.display = 'none';
        document.getElementById('activeWbSession').style.display = 'block';
        document.getElementById('activeWbCode').textContent = code;
        
        initStudentWbCanvas();
        
        db.ref(`whiteboard/${code}/drawing`).on('value', (snapshot) => {
            if (snapshot.exists() && stuWbCtx) {
                const data = snapshot.val();
                if (data && data.data) {
                    const img = new Image();
                    img.onload = () => {
                        stuWbCtx.drawImage(img, 0, 0, stuWbCanvas.width, stuWbCanvas.height);
                    };
                    img.src = data.data;
                }
            }
        });
        
        alert("✅ Joined session! You can now draw with everyone.");
    });
}

function initStudentWbCanvas() {
    const canvas = document.getElementById('studentWbCanvas');
    if (!canvas) { setTimeout(initStudentWbCanvas, 100); return; }
    
    stuWbCanvas = canvas;
    stuWbCtx = canvas.getContext('2d');
    
    const container = canvas.parentElement;
    stuWbCanvas.width = Math.min(1000, container.clientWidth - 20);
    stuWbCanvas.height = 500;
    stuWbCanvas.style.width = '100%';
    stuWbCanvas.style.height = 'auto';
    
    stuWbCtx.fillStyle = 'white';
    stuWbCtx.fillRect(0, 0, stuWbCanvas.width, stuWbCanvas.height);
    
    setupStudentWbDrawing();
    setStudentWbColor('black');
    setStudentWbSize(4);
}

function setupStudentWbDrawing() {
    const getCoords = (e) => {
        const rect = stuWbCanvas.getBoundingClientRect();
        const scaleX = stuWbCanvas.width / rect.width;
        const scaleY = stuWbCanvas.height / rect.height;
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        let x = (clientX - rect.left) * scaleX;
        let y = (clientY - rect.top) * scaleY;
        x = Math.max(0, Math.min(stuWbCanvas.width, x));
        y = Math.max(0, Math.min(stuWbCanvas.height, y));
        return { x, y };
    };
    
    const start = (e) => {
        e.preventDefault();
        stuWbDrawing = true;
        const coords = getCoords(e);
        stuWbLastX = coords.x;
        stuWbLastY = coords.y;
        stuWbCtx.beginPath();
        stuWbCtx.moveTo(stuWbLastX, stuWbLastY);
    };
    
    const draw = (e) => {
        if (!stuWbDrawing) return;
        e.preventDefault();
        const coords = getCoords(e);
        const x = coords.x, y = coords.y;
        
        stuWbCtx.lineTo(x, y);
        stuWbCtx.stroke();
        stuWbCtx.beginPath();
        stuWbCtx.moveTo(x, y);
        
        syncStudentWbDrawing();
    };
    
    const end = () => {
        if (!stuWbDrawing) return;
        stuWbDrawing = false;
        stuWbCtx.beginPath();
        syncStudentWbDrawing();
    };
    
    stuWbCanvas.addEventListener('mousedown', start);
    stuWbCanvas.addEventListener('mousemove', draw);
    stuWbCanvas.addEventListener('mouseup', end);
    stuWbCanvas.addEventListener('mouseleave', end);
    stuWbCanvas.addEventListener('touchstart', start);
    stuWbCanvas.addEventListener('touchmove', draw);
    stuWbCanvas.addEventListener('touchend', end);
}

function setStudentWbTool(tool) {
    stuWbTool = tool;
    document.querySelectorAll('.student-wb-tool').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(tool === 'pen' ? 'Pen' : 'Eraser')) {
            btn.classList.add('active');
        }
    });
    
    if (stuWbTool === 'eraser') {
        stuWbCtx.globalCompositeOperation = 'destination-out';
        stuWbCtx.strokeStyle = 'white';
    } else {
        stuWbCtx.globalCompositeOperation = 'source-over';
        stuWbCtx.strokeStyle = stuWbColor;
    }
    stuWbCtx.lineCap = 'round';
    stuWbCtx.lineJoin = 'round';
}

function setStudentWbColor(color) {
    stuWbColor = color;
    if (stuWbTool !== 'eraser') {
        stuWbCtx.strokeStyle = color;
    }
    document.querySelectorAll('.student-wb-color').forEach(el => {
        el.classList.remove('active');
        if (el.style.backgroundColor === color) el.classList.add('active');
    });
}

function setStudentWbSize(size) {
    stuWbSize = parseInt(size);
    stuWbCtx.lineWidth = stuWbSize;
}

function clearStudentWbCanvas() {
    if (confirm("Clear the whiteboard for everyone?")) {
        stuWbCtx.fillStyle = 'white';
        stuWbCtx.fillRect(0, 0, stuWbCanvas.width, stuWbCanvas.height);
        syncStudentWbDrawing();
    }
}

function syncStudentWbDrawing() {
    const db = getStuWbDb();
    if (!db || !stuWbSessionCode) return;
    if (stuWbSyncTimer) clearTimeout(stuWbSyncTimer);
    
    stuWbSyncTimer = setTimeout(() => {
        try {
            const drawingData = stuWbCanvas.toDataURL();
            db.ref(`whiteboard/${stuWbSessionCode}/drawing`).set({
                data: drawingData,
                timestamp: Date.now()
            });
        } catch(e) {}
    }, 100);
}

function leaveWbSession() {
    if (!stuWbSessionCode) return;
    const db = getStuWbDb();
    if (db) {
        const studentId = localStorage.getItem('studentUserId') || 'student_' + Date.now();
        db.ref(`whiteboard/${stuWbSessionCode}/participants/${studentId}`).remove();
    }
    stuWbSessionCode = null;
    document.getElementById('activeWbSession').style.display = 'none';
    document.getElementById('joinWbContainer').style.display = 'block';
    document.getElementById('wbCodeInput').value = '';
    alert("You left the session.");
}

function addJoinWbButton() {
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (!sidebarNav) { setTimeout(addJoinWbButton, 1000); return; }
    if (document.getElementById('joinWbBtn')) return;
    
    const btn = document.createElement('div');
    btn.className = 'nav-item';
    btn.id = 'joinWbBtn';
    btn.innerHTML = '🎨 Join Whiteboard';
    btn.onclick = () => {
        document.getElementById('joinWbContainer').style.display = 'block';
        document.getElementById('activeWbSession').style.display = 'none';
        document.getElementById('wbCodeInput').focus();
    };
    btn.style.background = '#10b981';
    btn.style.color = 'white';
    btn.style.marginTop = '10px';
    sidebarNav.appendChild(btn);
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(addJoinWbButton, 2000);
});


// Force all referral links to use grindlylearn.com
(function() {
    console.log('🔗 Force updating all referral links to grindlylearn.com...');
    
    // Override the copyReferralLink function completely
    window.copyReferralLink = function() {
        const userId = localStorage.getItem('studentUserId') || currentUserId || '';
        const link = `https://grindlylearn.com/studentmode.html?ref=${encodeURIComponent(userId)}`;
        
        navigator.clipboard.writeText(link).then(() => {
            if (typeof window.showNotification === 'function') {
                window.showNotification(`✅ Referral link copied: ${link}`, "success");
            } else {
                alert(`Referral link copied: ${link}`);
            }
        }).catch(() => {
            if (typeof window.showNotification === 'function') {
                window.showNotification(`📋 Copy manually: ${link}`, "info");
            } else {
                alert(`Copy manually: ${link}`);
            }
        });
        
        console.log("📤 Referral link copied:", link);
        return link;
    };
    
    // Override the markReferral function to ensure it uses the correct domain
    const originalMarkReferral = window.markReferral;
    window.markReferral = async function() {
        const userId = localStorage.getItem('studentUserId') || currentUserId || '';
        const link = `https://grindlylearn.com/studentmode.html?ref=${encodeURIComponent(userId)}`;
        
        // Copy the correct link
        await navigator.clipboard.writeText(link);
        
        if (typeof window.showNotification === 'function') {
            window.showNotification(`✅ Referral link copied! Share: ${link}`, "success");
        }
        
        if (!userId) {
            if (typeof window.showNotification === 'function') {
                window.showNotification("Referral not available yet. Try again in a moment.", "warning");
            }
            return;
        }
        
        try {
            if (window.database && userId) {
                const serverCountRaw = await window.firebaseGet(`users/${userId}/referralCount`);
                const serverCount = Math.min(parseInt(serverCountRaw || 0, 10) || 0, 3);
                const localCount = parseInt(localStorage.getItem('studentPremiumReferrals') || '0', 10);
                
                if (serverCount > localCount) {
                    localStorage.setItem('studentPremiumReferrals', serverCount.toString());
                    if (typeof window.updateReferralUI === 'function') window.updateReferralUI();
                    if (typeof window.showNotification === 'function') {
                        window.showNotification("Referral counted!", "success");
                    }
                } else {
                    if (typeof window.showNotification === 'function') {
                        window.showNotification("Referral not verified yet. Your friend must open your link and log a study session.", "warning");
                    }
                }
            } else {
                if (typeof window.showNotification === 'function') {
                    window.showNotification("Referral link copied! Share with friends.", "success");
                }
            }
        } catch (e) {
            console.warn("Failed to verify referral:", e);
            if (typeof window.showNotification === 'function') {
                window.showNotification("Referral link copied! Share with friends.", "success");
            }
        }
    };
    
    // Update any existing buttons that call copyReferralLink
    setTimeout(() => {
        // Find all buttons that might call copyReferralLink
        const allButtons = document.querySelectorAll('[onclick*="copyReferralLink"], [onclick*="markReferral"]');
        allButtons.forEach(btn => {
            const originalOnclick = btn.getAttribute('onclick');
            if (originalOnclick && originalOnclick.includes('copyReferralLink')) {
                btn.setAttribute('onclick', 'copyReferralLink()');
            }
            if (originalOnclick && originalOnclick.includes('markReferral')) {
                btn.setAttribute('onclick', 'markReferral()');
            }
        });
        
        // Update modal content
        const modal = document.getElementById('referralModal');
        if (modal) {
            const modalText = modal.querySelector('.referral-modal-text');
            if (modalText) {
                const userId = localStorage.getItem('studentUserId') || currentUserId || '';
                const link = `https://grindlylearn.com/studentmode.html?ref=${encodeURIComponent(userId)}`;
                modalText.innerHTML = `Refer Grindly Learn to 3 friends. The theme unlocks when they log their first study session.<br><br>
                <strong>Your referral link:</strong><br>
                <code style="background: var(--bg); padding: 8px; border-radius: 8px; display: inline-block; word-break: break-all; font-size: 0.75rem;">${link}</code>`;
            }
        }
        
        console.log('✅ All referral links now use grindlylearn.com');
    }, 1000);
    
    // Also update the referral link in the profile section
    const updateProfileReferral = setInterval(() => {
        const profileSection = document.getElementById('profile');
        if (profileSection && profileSection.style.display !== 'none') {
            const referralLinkElement = document.querySelector('.referral-link-display, #referralLinkDisplay, .copy-referral-link');
            if (referralLinkElement) {
                const userId = localStorage.getItem('studentUserId') || currentUserId || '';
                referralLinkElement.textContent = `https://grindlylearn.com/studentmode.html?ref=${encodeURIComponent(userId)}`;
            }
        }
    }, 2000);
    
    // Clear interval after 10 seconds
    setTimeout(() => clearInterval(updateProfileReferral), 10000);
})();

// ========== FOCUS PERSONA FEATURE - CANVAS BASED (GUARANTEED TO WORK) ==========
(function() {
    'use strict';
    console.log('🎴 Initializing Focus Persona Card feature...');
    
    // Set today's date immediately
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const dateEl = document.getElementById('personaDate');
    if (dateEl) dateEl.textContent = dateStr;
    
    // Set username immediately
    const userName = localStorage.getItem('studentName') || 'Grindly Student';
    const userEl = document.getElementById('personaUser');
    if (userEl) userEl.textContent = userName;
    
    // Add persona button to sidebar
    function addPersonaButtonToSidebar() {
        const sidebarNav = document.querySelector('.sidebar-nav');
        if (!sidebarNav) return false;
        
        if (document.getElementById('personaNavBtn')) return true;
        
        const personaBtn = document.createElement('div');
        personaBtn.className = 'nav-item persona-nav-btn';
        personaBtn.id = 'personaNavBtn';
        personaBtn.onclick = function() {
            showPersonaSection();
            if (typeof closeMobileMenu === 'function') closeMobileMenu();
        };
        personaBtn.innerHTML = '🎴 FOCUS PERSONA';
        
        const questsBtn = Array.from(sidebarNav.children).find(el => 
            el.textContent && el.textContent.includes('RPG QUESTS')
        );
        
        if (questsBtn) {
            questsBtn.insertAdjacentElement('beforebegin', personaBtn);
        } else {
            sidebarNav.appendChild(personaBtn);
        }
        
        return true;
    }
    
    // Show persona section
    window.showPersonaSection = function() {
        document.querySelectorAll('.dashboard-content').forEach(section => {
            section.style.display = 'none';
        });
        
        const container = document.getElementById('personaContainer');
        if (container) {
            container.style.display = 'block';
            
            const cardContainer = document.getElementById('personaCardContainer');
            const card = document.getElementById('focusPersonaCard');
            
            if (cardContainer && card && !cardContainer.contains(card)) {
                cardContainer.appendChild(card);
            }
        }
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const personaBtn = document.getElementById('personaNavBtn');
        if (personaBtn) personaBtn.classList.add('active');
        
        const header = document.getElementById('dashboardHeader');
        if (header) {
            const h1 = header.querySelector('h1');
            const subtitle = header.querySelector('.dashboard-subtitle');
            if (h1) h1.textContent = 'Focus Persona';
            if (subtitle) subtitle.textContent = 'Discover your study identity';
        }
        
        setTimeout(() => {
            generatePersonaCard();
        }, 100);
    };
    
    // ========== PERSONA ANALYSIS ==========
    window.getStudySessions = function() {
        if (window.studyData && window.studyData.studySessions) {
            return window.studyData.studySessions;
        }
        try {
            const saved = localStorage.getItem('studentPersistentData');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.studyData && data.studyData.studySessions) {
                    return data.studyData.studySessions;
                }
            }
        } catch (e) {}
        return [];
    };
    
    window.getTotalStudyHours = function() {
        if (window.studyData && window.studyData.totalStudyHours) {
            return parseFloat(window.studyData.totalStudyHours);
        }
        if (window.studyData && window.studyData.totalMinutes) {
            return window.studyData.totalMinutes / 60;
        }
        return 0;
    };
    
    window.analyzeFocusPersona = function() {
        const sessions = getStudySessions();
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentSessions = sessions.filter(s => {
            if (!s || !s.date) return false;
            try {
                return new Date(s.date) >= sevenDaysAgo;
            } catch (e) {
                return false;
            }
        });
        
        if (recentSessions.length === 0) {
            return {
                title: "The Unawakened",
                description: "Start your journey to discover your focus persona!",
                icon: "🌙",
                quote: "Every master was once a beginner.",
                stats: {
                    avgStartTime: "--:--",
                    avgDuration: "0 min",
                    sessionsPerDay: "0"
                }
            };
        }
        
        const sessionsByDay = {};
        let totalStartHour = 0;
        let totalDuration = 0;
        let sessionCount = 0;
        
        recentSessions.forEach(session => {
            try {
                const date = new Date(session.date);
                if (isNaN(date.getTime())) return;
                
                const dayKey = date.toDateString();
                sessionsByDay[dayKey] = (sessionsByDay[dayKey] || 0) + 1;
                totalStartHour += date.getHours();
                totalDuration += session.hours || 0;
                sessionCount++;
            } catch (e) {}
        });
        
        if (sessionCount === 0) {
            return {
                title: "The Unawakened",
                description: "Start your journey to discover your focus persona!",
                icon: "🌙",
                quote: "Every master was once a beginner.",
                stats: {
                    avgStartTime: "--:--",
                    avgDuration: "0 min",
                    sessionsPerDay: "0"
                }
            };
        }
        
        const avgStartTime = totalStartHour / sessionCount;
        const avgDuration = totalDuration / sessionCount;
        const avgSessionsPerDay = Object.keys(sessionsByDay).length > 0 ? 
            sessionCount / Object.keys(sessionsByDay).length : 0;
        
        const formatDuration = (hours) => {
            if (hours < 1) return `${Math.round(hours * 60)} min`;
            return `${hours.toFixed(1)} hrs`;
        };
        
        const formatHour = (hour) => {
            const h = Math.floor(hour);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const displayHour = h % 12 || 12;
            return `${displayHour}:00 ${ampm}`;
        };
        
        if (avgStartTime >= 22 || avgStartTime < 5) {
            return {
                title: "The Night Owl",
                description: "You thrive when the world sleeps. Your mind awakens under moonlight.",
                icon: "🦉",
                quote: "Darkness is my canvas, focus is my brush.",
                stats: {
                    avgStartTime: formatHour(avgStartTime),
                    avgDuration: formatDuration(avgDuration),
                    sessionsPerDay: avgSessionsPerDay.toFixed(1)
                }
            };
        }
        
        if (avgDuration > 1) {
            return {
                title: "The Deep Diver",
                description: "You lose yourself in the flow. Hours feel like minutes when you focus.",
                icon: "🏊‍♂️",
                quote: "Depth over breadth, quality over quantity.",
                stats: {
                    avgStartTime: formatHour(avgStartTime),
                    avgDuration: formatDuration(avgDuration),
                    sessionsPerDay: avgSessionsPerDay.toFixed(1)
                }
            };
        }
        
        if (avgSessionsPerDay > 5) {
            return {
                title: "The Sprinter",
                description: "You tackle challenges in bursts of intense focus. Small wins add up fast.",
                icon: "⚡",
                quote: "Speed is my ally, momentum my weapon.",
                stats: {
                    avgStartTime: formatHour(avgStartTime),
                    avgDuration: formatDuration(avgDuration),
                    sessionsPerDay: avgSessionsPerDay.toFixed(1)
                }
            };
        }
        
        return {
            title: "The Steady Scholar",
            description: "Consistency is your superpower. Day by day, you build lasting knowledge.",
            icon: "📚",
            quote: "Slow and steady wins the race of mastery.",
            stats: {
                avgStartTime: formatHour(avgStartTime),
                avgDuration: formatDuration(avgDuration),
                sessionsPerDay: avgSessionsPerDay.toFixed(1)
            }
        };
    };
    
    window.getLast7DaysFocusData = function() {
        const sessions = getStudySessions();
        const last7Days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            
            const daySessions = sessions.filter(s => {
                if (!s || !s.date) return false;
                try {
                    const sessionDate = new Date(s.date);
                    return sessionDate >= date && sessionDate < nextDay;
                } catch (e) {
                    return false;
                }
            });
            
            const totalHours = daySessions.reduce((sum, s) => sum + (s.hours || 0), 0);
            
            last7Days.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                hours: totalHours,
                sessions: daySessions.length
            });
        }
        
        return last7Days;
    };
    
    window.calculateUserLevel = function() {
        const totalHours = getTotalStudyHours();
        if (totalHours < 5) return 1;
        if (totalHours < 15) return 2;
        if (totalHours < 30) return 3;
        if (totalHours < 50) return 4;
        if (totalHours < 100) return 5;
        return 6;
    };
    
    window.renderPersonaCard = function(data) {
        const card = document.getElementById('focusPersonaCard');
        if (!card) return;
        
        card.style.display = 'block';
        
        document.getElementById('personaIcon').textContent = data.persona.icon;
        document.getElementById('personaTitle').textContent = data.persona.title;
        
        const levelBadge = document.querySelector('#personaLevel .level-badge');
        if (levelBadge) levelBadge.textContent = `LVL ${data.level}`;
        
        document.getElementById('personaDescription').textContent = data.persona.description;
        document.getElementById('personaQuote').textContent = `"${data.persona.quote}"`;
        
        if (data.persona.stats) {
            document.getElementById('statStart').textContent = data.persona.stats.avgStartTime;
            document.getElementById('statDuration').textContent = data.persona.stats.avgDuration;
            document.getElementById('statSessions').textContent = data.persona.stats.sessionsPerDay;
        }
        
        renderBarChart(data.last7Days);
    };
    
    window.renderBarChart = function(daysData) {
        const chartContainer = document.getElementById('focusBarChart');
        if (!chartContainer) return;
        
        const maxHours = Math.max(...daysData.map(d => d.hours), 1);
        
        chartContainer.innerHTML = daysData.map(day => {
            const heightPercent = (day.hours / maxHours) * 100;
            const barHeight = heightPercent > 0 ? Math.max(heightPercent, 8) : 4;
            
            return `
                <div class="chart-bar-container">
                    <div class="chart-bar" style="height: ${barHeight}px; background: linear-gradient(180deg, #ffd700, #c0a0e0);"></div>
                    <div class="chart-label">${day.date}</div>
                    <div class="chart-value">${day.hours.toFixed(1)}h</div>
                </div>
            `;
        }).join('');
    };
    
    window.generatePersonaCard = function() {
        const persona = analyzeFocusPersona();
        const last7Days = getLast7DaysFocusData();
        
        const data = {
            persona,
            last7Days,
            userName: localStorage.getItem('studentName') || 'Grindly Student',
            level: calculateUserLevel(),
            date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })
        };
        
        renderPersonaCard(data);
        
        document.getElementById('focusPersonaCard').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        if (window.showNotification) {
            window.showNotification(`✨ Your persona: ${persona.title}`, 'success');
        }
    };
    
    // ========== NEW - CANVAS BASED DOWNLOAD (100% WORKS) ==========
    window.downloadPersonaCard = function() {
        const persona = analyzeFocusPersona();
        const last7Days = getLast7DaysFocusData();
        const level = calculateUserLevel();
        const userName = localStorage.getItem('studentName') || 'Grindly Student';
        const today = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        if (window.showNotification) {
            window.showNotification('Generating image...', 'info');
        }
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 650;
        const ctx = canvas.getContext('2d');
        
        // Draw background
        ctx.fillStyle = '#1a1e2f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw border
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        // Draw top gradient line
        const gradient = ctx.createLinearGradient(0, 15, canvas.width, 15);
        gradient.addColorStop(0, '#ffd700');
        gradient.addColorStop(0.3, '#c0a0e0');
        gradient.addColorStop(0.7, '#4f9eff');
        gradient.addColorStop(1, '#ffd700');
        ctx.fillStyle = gradient;
        ctx.fillRect(20, 20, canvas.width - 40, 4);
        
        // Draw icon
        ctx.font = '50px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(persona.icon, 50, 110);
        
        // Draw icon glow
        ctx.shadowColor = '#4f46e5';
        ctx.shadowBlur = 20;
        ctx.fillText(persona.icon, 50, 110);
        ctx.shadowBlur = 0;
        
        // Draw title
        ctx.font = 'bold 28px "Inter", "Poppins", sans-serif';
        ctx.fillStyle = '#ffffff';
        const titleGradient = ctx.createLinearGradient(130, 70, 350, 70);
        titleGradient.addColorStop(0, '#ffd700');
        titleGradient.addColorStop(0.5, '#c0a0e0');
        titleGradient.addColorStop(1, '#4f9eff');
        ctx.fillStyle = titleGradient;
        ctx.fillText(persona.title, 130, 90);
        
        ctx.font = '14px "Inter", "Poppins", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Focus Persona', 130, 115);
        
        // Draw level badge
        ctx.fillStyle = '#4f46e5';
        ctx.beginPath();
        ctx.arc(420, 70, 35, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = 'bold 14px "Inter", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`LVL ${level}`, 400, 75);
        
        // Draw stats background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(40, 130, canvas.width - 80, 70);
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(40, 130, canvas.width - 80, 70);
        
        // Draw stats
        ctx.font = 'bold 18px "Inter", sans-serif';
        ctx.fillStyle = '#ffffff';
        
        // Stat 1
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px "Inter", sans-serif';
        ctx.fillText('AVG START', 70, 155);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px "Inter", sans-serif';
        ctx.fillText(persona.stats.avgStartTime, 70, 185);
        
        // Stat 2
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px "Inter", sans-serif';
        ctx.fillText('AVG DURATION', 200, 155);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px "Inter", sans-serif';
        ctx.fillText(persona.stats.avgDuration, 200, 185);
        
        // Stat 3
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px "Inter", sans-serif';
        ctx.fillText('SESSIONS/DAY', 350, 155);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px "Inter", sans-serif';
        ctx.fillText(persona.stats.sessionsPerDay, 350, 185);
        
        // Draw chart background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(40, 220, canvas.width - 80, 150);
        ctx.strokeStyle = 'rgba(79, 158, 255, 0.3)';
        ctx.strokeRect(40, 220, canvas.width - 80, 150);
        
        ctx.font = 'bold 14px "Inter", sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('⚔️ FOCUS HOURS (LAST 7 DAYS)', 100, 250);
        
        // Draw bars
        const barWidth = 40;
        const maxBarHeight = 80;
        const maxHours = Math.max(...last7Days.map(d => d.hours), 1);
        
        last7Days.forEach((day, index) => {
            const x = 60 + (index * 55);
            const barHeight = (day.hours / maxHours) * maxBarHeight || 4;
            
            // Draw bar
            const barGradient = ctx.createLinearGradient(x, 350 - barHeight, x, 350);
            barGradient.addColorStop(0, '#ffd700');
            barGradient.addColorStop(1, '#c0a0e0');
            ctx.fillStyle = barGradient;
            ctx.fillRect(x, 350 - barHeight, barWidth - 5, barHeight);
            
            // Draw day label
            ctx.fillStyle = '#94a3b8';
            ctx.font = '12px "Inter", sans-serif';
            ctx.fillText(day.date, x, 370);
            
            // Draw hour value
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px "Inter", sans-serif';
            ctx.fillText(day.hours.toFixed(1), x + 5, 335 - barHeight);
        });
        
        // Draw description
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'italic 14px "Inter", sans-serif';
        ctx.fillText(persona.description, 40, 420);
        
        // Draw quote
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'italic 12px "Inter", sans-serif';
        ctx.fillText(`"${persona.quote}"`, 40, 470);
        
        // Draw footer
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, 500);
        ctx.lineTo(canvas.width - 40, 500);
        ctx.stroke();
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px "Inter", sans-serif';
        ctx.fillText(userName, 40, 530);
        ctx.fillText(today, canvas.width - 150, 530);
        
        // Draw badge
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(430, 580, 30, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px "Inter", sans-serif';
        ctx.fillText('PERSONA', 405, 580);
        ctx.fillText('UNLOCKED', 400, 600);
        
        // Download
        const link = document.createElement('a');
        link.download = `focus-persona-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        if (window.showNotification) {
            window.showNotification('✅ Persona card downloaded!', 'success');
        }
    };
    
    // ========== SHARE ==========
    window.sharePersonaCard = function() {
        downloadPersonaCard();
        if (window.showNotification) {
            window.showNotification('ℹ️ Image downloaded - you can now share it!', 'info');
        }
    };
    
    // ========== INITIALIZE ==========
    function tryInit(attempt = 1) {
        if (document.querySelector('.sidebar-nav')) {
            addPersonaButtonToSidebar();
            console.log('✅ Focus Persona Card feature ready!');
        } else if (attempt < 20) {
            setTimeout(() => tryInit(attempt + 1), 500);
        }
    }
    
    setTimeout(tryInit, 1500);
})();

// ========== REAL-TIME CURSOR TRACKING - WORKING VERSION ==========
(function() {
    let cursorTrackingActive = false;
    let cursorRef = null;
    let myCursorId = null;
    let sessionId = null;
    
    // Get database
    function getDb() {
        return window.database || (window.firebase ? firebase.database() : null);
    }
    
    // Get current user info
    function getUserInfo() {
        const isTeacher = window.location.href.includes('teachermode') || document.querySelector('.teacher-emoji');
        return {
            id: isTeacher ? 'teacher_' + (localStorage.getItem('teacherUserId') || Date.now()) : localStorage.getItem('studentUserId') || 'student_' + Date.now(),
            name: isTeacher ? (localStorage.getItem('teacherName') || 'Teacher') : (localStorage.getItem('studentName') || 'Student'),
            isTeacher: isTeacher
        };
    }
    
    // Get current session code from whiteboard
    function getSessionCode() {
        // Try all possible session code elements
        const codeEl = document.getElementById('wbCodeDisplay') || 
                       document.getElementById('activeWbCode') ||
                       document.getElementById('activeSimpleCode') ||
                       document.querySelector('.wb-session-code');
        
        if (codeEl && codeEl.textContent && codeEl.textContent !== '------') {
            return codeEl.textContent.trim();
        }
        
        // Also check if there's a session code variable in window
        if (window.wbSessionCode) return window.wbSessionCode;
        if (window.stuWbSessionCode) return window.stuWbSessionCode;
        
        return null;
    }
    
    // Track mouse movement
    function trackMouseMovement(canvas, sessionCode, userInfo) {
        if (!canvas || !sessionCode) return;
        
        const db = getDb();
        if (!db) return;
        
        myCursorId = userInfo.id;
        cursorRef = db.ref(`whiteboard/${sessionCode}/cursors/${myCursorId}`);
        
        // Send initial presence
        cursorRef.set({
            name: userInfo.name,
            isTeacher: userInfo.isTeacher,
            active: true,
            lastUpdate: Date.now()
        });
        
        // Track mouse movement
        let lastSend = 0;
        
        const sendPosition = (x, y) => {
            if (!cursorRef) return;
            cursorRef.update({
                x: x,
                y: y,
                lastUpdate: Date.now()
            }).catch(() => {});
        };
        
        const onMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            // Only track if mouse is inside canvas
            if (e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom) {
                
                const x = e.clientX;
                const y = e.clientY;
                
                const now = Date.now();
                if (now - lastSend > 30) { // Send every 30ms for smooth tracking
                    lastSend = now;
                    sendPosition(x, y);
                }
            }
        };
        
        const onMouseLeave = () => {
            cursorRef.update({ x: null, y: null }).catch(() => {});
        };
        
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseleave', onMouseLeave);
        
        // Store cleanup function
        canvas._cursorCleanup = () => {
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('mouseleave', onMouseLeave);
            cursorRef.remove().catch(() => {});
        };
        
        console.log('✅ Cursor tracking active for:', userInfo.name);
    }
    
    // Display other users' cursors
    function displayOtherCursors(sessionCode) {
        const db = getDb();
        if (!db || !sessionCode) return;
        
        const cursorContainer = document.createElement('div');
        cursorContainer.id = 'cursor-container';
        cursorContainer.style.position = 'fixed';
        cursorContainer.style.top = '0';
        cursorContainer.style.left = '0';
        cursorContainer.style.width = '100%';
        cursorContainer.style.height = '100%';
        cursorContainer.style.pointerEvents = 'none';
        cursorContainer.style.zIndex = '9998';
        document.body.appendChild(cursorContainer);
        
        db.ref(`whiteboard/${sessionCode}/cursors`).on('value', (snapshot) => {
            if (!snapshot.exists()) return;
            
            const cursors = snapshot.val();
            
            // Remove cursors that are no longer active
            document.querySelectorAll('.cursor-tracker').forEach(el => {
                const id = el.dataset.userId;
                if (!cursors[id] || !cursors[id].x) {
                    el.remove();
                }
            });
            
            // Add/update cursors
            Object.keys(cursors).forEach(userId => {
                if (userId === myCursorId) return; // Skip own cursor
                
                const data = cursors[userId];
                if (!data.x || !data.y) return; // No position
                
                let cursorEl = document.getElementById(`cursor-${userId}`);
                
                if (!cursorEl) {
                    cursorEl = document.createElement('div');
                    cursorEl.className = 'cursor-tracker';
                    cursorEl.id = `cursor-${userId}`;
                    cursorEl.dataset.userId = userId;
                    cursorEl.innerHTML = `
                        <div class="cursor-dot" style="background: ${data.isTeacher ? 'rgba(255, 107, 107, 0.4)' : 'rgba(108, 99, 255, 0.4)'}; border-color: ${data.isTeacher ? '#ff6b6b' : '#6c63ff'};"></div>
                        <div class="cursor-label">${escapeHtml(data.name)} ${data.isTeacher ? '👩‍🏫' : '👨‍🎓'}</div>
                    `;
                    cursorContainer.appendChild(cursorEl);
                }
                
                cursorEl.style.left = (data.x - 10) + 'px';
                cursorEl.style.top = (data.y - 10) + 'px';
            });
        });
    }
    
    // Clean up inactive cursors
    function cleanupInactiveCursors(sessionCode) {
        const db = getDb();
        if (!db || !sessionCode) return;
        
        const now = Date.now();
        db.ref(`whiteboard/${sessionCode}/cursors`).once('value', (snapshot) => {
            if (!snapshot.exists()) return;
            
            const cursors = snapshot.val();
            Object.keys(cursors).forEach(userId => {
                const data = cursors[userId];
                if (now - (data.lastUpdate || 0) > 10000) { // Inactive for 10 seconds
                    db.ref(`whiteboard/${sessionCode}/cursors/${userId}`).remove();
                }
            });
        });
    }
    
    // Main initialization function
    function initCursorTracking() {
        if (cursorTrackingActive) return;
        
        // Find the canvas
        const canvas = document.getElementById('wbCanvas') || document.getElementById('studentWbCanvas');
        if (!canvas) {
            setTimeout(initCursorTracking, 1000);
            return;
        }
        
        // Get session code
        const checkSession = setInterval(() => {
            const code = getSessionCode();
            if (code && code !== '------') {
                clearInterval(checkSession);
                
                sessionId = code;
                const userInfo = getUserInfo();
                myCursorId = userInfo.id;
                
                // Start tracking
                trackMouseMovement(canvas, sessionId, userInfo);
                displayOtherCursors(sessionId);
                cursorTrackingActive = true;
                
                // Clean up inactive cursors every 10 seconds
                setInterval(() => cleanupInactiveCursors(sessionId), 10000);
                
                console.log('🎯 Cursor tracking started for session:', sessionId);
            }
        }, 500);
        
        // Stop tracking on page unload
        window.addEventListener('beforeunload', () => {
            if (cursorRef) cursorRef.remove().catch(() => {});
            if (sessionId && getDb()) {
                getDb().ref(`whiteboard/${sessionId}/cursors/${myCursorId}`).remove().catch(() => {});
            }
        });
    }
    
    // Helper
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Start tracking when whiteboard is opened
    const checkWhiteboardInterval = setInterval(() => {
        const whiteboard = document.getElementById('wbSession') || document.getElementById('studentWhiteboardFinal') || document.getElementById('studentWhiteboardContainer');
        if (whiteboard && whiteboard.style.display === 'block') {
            if (!cursorTrackingActive) {
                setTimeout(initCursorTracking, 500);
            }
        }
    }, 2000);
    
    // Also try to start when page loads if whiteboard is already open
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const whiteboard = document.getElementById('wbSession') || document.getElementById('studentWhiteboardFinal');
            if (whiteboard && whiteboard.style.display === 'block') {
                initCursorTracking();
            }
        }, 2000);
    });
    
    // Expose function to manually start
    window.startCursorTracking = initCursorTracking;
    
    console.log('🎯 Cursor tracking system ready');
})();

// ========== STUDENT CLASSROOM ENHANCEMENTS (NO COMMENTS) ==========

let currentResourceData = null;

// ========== RESOURCE POPUP ==========
function openResourcePopup(resourceId, resourceTitle, resourceDesc, resourceUrl, resourceFileData, resourceFileName, resourceFileSize) {
    const overlay = document.createElement('div');
    overlay.className = 'student-popup-overlay';
    overlay.id = 'resourcePopup';
    
    let previewHtml = '';
    
    if (resourceFileData && resourceFileName) {
        const fileExt = resourceFileName.split('.').pop().toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt);
        const isPdf = fileExt === 'pdf';
        
        currentResourceData = { fileData: resourceFileData, fileName: resourceFileName };
        
        if (isImage) {
            previewHtml = `
                <div class="file-preview-container">
                    <strong>🖼️ Image Preview:</strong>
                    <div style="margin-top: 12px;">
                        <img src="${resourceFileData}" alt="${resourceFileName}">
                    </div>
                    <div style="margin-top: 10px; font-size: 0.8rem; color: var(--text-muted);">
                        📎 ${resourceFileName} (${Math.round(resourceFileSize / 1024)} KB)
                    </div>
                    <button class="download-btn" onclick="downloadCurrentResource()">
                        📥 Download Image
                    </button>
                </div>
            `;
        } else if (isPdf) {
            previewHtml = `
                <div class="file-preview-container">
                    <strong>📄 PDF Preview:</strong>
                    <div style="margin-top: 12px;">
                        <iframe src="${resourceFileData}"></iframe>
                    </div>
                    <div style="margin-top: 10px; font-size: 0.8rem; color: var(--text-muted);">
                        📎 ${resourceFileName} (${Math.round(resourceFileSize / 1024)} KB)
                    </div>
                    <button class="download-btn" onclick="downloadCurrentResource()">
                        📥 Download PDF
                    </button>
                </div>
            `;
        } else {
            previewHtml = `
                <div class="file-preview-container">
                    <strong>📎 Attached File:</strong>
                    <div style="margin-top: 12px;">
                        📄 ${resourceFileName} (${Math.round(resourceFileSize / 1024)} KB)
                    </div>
                    <button class="download-btn" onclick="downloadCurrentResource()">
                        📥 Download File
                    </button>
                </div>
            `;
        }
    } else if (resourceUrl) {
        previewHtml = `
            <div style="background: var(--bg); padding: 16px; border-radius: 16px; margin: 16px 0;">
                <strong>🔗 Resource Link:</strong>
                <div style="margin-top: 8px; word-break: break-all;">
                    <a href="${resourceUrl}" target="_blank" style="color: var(--accent);">${resourceUrl}</a>
                </div>
                <button class="link-btn" onclick="window.open('${resourceUrl}', '_blank')">
                    🔗 Open Link
                </button>
            </div>
        `;
    }
    
    overlay.innerHTML = `
        <div class="student-popup">
            <div class="student-popup-header">
                <button class="student-popup-close" onclick="closeResourcePopup()">×</button>
                <h3>📄 ${escapeHtml(resourceTitle)}</h3>
            </div>
            <div class="student-popup-body">
                <div style="background: var(--bg); padding: 16px; border-radius: 16px;">
                    <strong>📝 Description:</strong>
                    <p style="margin-top: 8px; line-height: 1.6;">${escapeHtml(resourceDesc || 'No description provided')}</p>
                </div>
                ${previewHtml}
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function closeResourcePopup() {
    const overlay = document.getElementById('resourcePopup');
    if (overlay) overlay.remove();
    currentResourceData = null;
}

function downloadCurrentResource() {
    if (currentResourceData && currentResourceData.fileData) {
        const link = document.createElement('a');
        link.href = currentResourceData.fileData;
        link.download = currentResourceData.fileName;
        link.click();
        showNotification("Download started!", "success");
    }
}

// Helper: escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== ENHANCE EXISTING LOAD TEACHER CONTENT ==========

// Store original function
const originalLoadTeacherContent = window.loadTeacherContent;

// Override to add preview buttons (no comments)
window.loadTeacherContent = async function() {
    // Call original first
    if (originalLoadTeacherContent) {
        await originalLoadTeacherContent();
    }
    
    // Now enhance the existing DOM elements
    setTimeout(() => {
        enhanceResourcesSection();
        enhanceAnnouncementsSection();
    }, 100);
};

function enhanceResourcesSection() {
    const resourcesDiv = document.getElementById('teacherResources');
    if (!resourcesDiv) return;
    
    const resourceItems = resourcesDiv.querySelectorAll('.classroom-item');
    
    resourceItems.forEach((item, index) => {
        if (item.hasAttribute('data-enhanced')) return;
        item.setAttribute('data-enhanced', 'true');
        
        const titleEl = item.querySelector('.classroom-item-title');
        const contentEl = item.querySelector('.classroom-item-content');
        const linkEl = item.querySelector('.classroom-item-link');
        
        const resourceTitle = titleEl?.textContent || 'Resource';
        const resourceDesc = contentEl?.querySelector('p')?.textContent || '';
        const resourceUrl = linkEl?.href || '';
        
        let resourceId = `resource_${Date.now()}_${index}`;
        const existingId = item.getAttribute('data-resource-id');
        if (existingId) resourceId = existingId;
        item.setAttribute('data-resource-id', resourceId);
        
        let resourceData = null;
        if (window.resources) {
            resourceData = resources.find(r => r.title === resourceTitle);
            if (resourceData) resourceId = resourceData.id;
        }
        
        let actionsContainer = item.querySelector('.resource-actions');
        if (!actionsContainer) {
            actionsContainer = document.createElement('div');
            actionsContainer.className = 'student-classroom-actions';
            actionsContainer.style.marginTop = '12px';
            item.appendChild(actionsContainer);
        }
        
        // Add preview button only
        const previewBtn = document.createElement('button');
        previewBtn.className = 'student-preview-btn';
        previewBtn.innerHTML = '👁️ Preview';
        previewBtn.onclick = (e) => {
            e.stopPropagation();
            if (resourceData) {
                openResourcePopup(
                    resourceData.id,
                    resourceData.title,
                    resourceData.description,
                    resourceData.url,
                    resourceData.fileData,
                    resourceData.fileName,
                    resourceData.fileSize
                );
            } else {
                openResourcePopup(
                    resourceId,
                    resourceTitle,
                    resourceDesc,
                    resourceUrl,
                    null, null, null
                );
            }
        };
        
        actionsContainer.innerHTML = '';
        actionsContainer.appendChild(previewBtn);
        
        // Apply modern styling
        item.classList.add('student-classroom-card');
        const oldHeader = item.querySelector('.classroom-item-header');
        if (oldHeader) oldHeader.classList.add('student-classroom-header');
        if (titleEl) titleEl.classList.add('student-classroom-title');
        const dateEl = item.querySelector('.classroom-item-date');
        if (dateEl) dateEl.classList.add('student-classroom-date');
        if (contentEl) contentEl.classList.add('student-classroom-content');
    });
}

function enhanceAnnouncementsSection() {
    const announcementsDiv = document.getElementById('teacherAnnouncements');
    if (!announcementsDiv) return;
    
    const announcementItems = announcementsDiv.querySelectorAll('.classroom-item');
    
    announcementItems.forEach((item, index) => {
        if (item.hasAttribute('data-announcement-enhanced')) return;
        item.setAttribute('data-announcement-enhanced', 'true');
        
        const titleEl = item.querySelector('.classroom-item-title');
        const contentEl = item.querySelector('.classroom-item-content');
        
        const announcementTitle = titleEl?.textContent || 'Announcement';
        const announcementContent = contentEl?.textContent || '';
        const announcementId = `announcement_${Date.now()}_${index}`;
        
        // Apply modern styling (no comments)
        item.classList.add('student-classroom-card');
        const oldHeader = item.querySelector('.classroom-item-header');
        if (oldHeader) oldHeader.classList.add('student-classroom-header');
        if (titleEl) titleEl.classList.add('student-classroom-title');
        const dateEl = item.querySelector('.classroom-item-date');
        if (dateEl) dateEl.classList.add('student-classroom-date');
        if (contentEl) contentEl.classList.add('student-classroom-content');
    });
}

// Run enhancement after page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (document.getElementById('teacherResources')) {
            enhanceResourcesSection();
            enhanceAnnouncementsSection();
        }
    }, 2000);
});

console.log("✅ Student classroom enhancement loaded - resources now have Preview buttons (no comments)");

(function() {
    'use strict';

    console.log('📁 Student Resource Preview fix loading...');

    function getResources() {
        if (typeof resources !== 'undefined' && resources.length) return resources;
        try {
            const classCode = localStorage.getItem('studentCurrentClass') || '';
            const data = localStorage.getItem(`class_${classCode}_resources`);
            if (data) return JSON.parse(data);
        } catch (e) {}
        return [];
    }

    function createModal() {
        if (document.getElementById('studentResourceModal')) return;

        const modal = document.createElement('div');
        modal.id = 'studentResourceModal';
        modal.className = 'modal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 9999;
            align-items: center;
            justify-content: center;
            padding: 20px;
            backdrop-filter: blur(4px);
        `;
        modal.innerHTML = `
            <div class="modal-content" style="max-width:600px; max-height:90vh; overflow-y:auto; background: var(--card); border-radius: var(--radius-lg); padding: var(--spacing-xl); position: relative; border: 1px solid var(--border);">
                <button class="modal-close" onclick="document.getElementById('studentResourceModal').style.display='none'" style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:1.8rem;cursor:pointer;color:var(--text-muted);">&times;</button>
                <h3 id="studentResourceModalTitle" style="margin-bottom:12px;font-weight:700;">Resource</h3>
                <div id="studentResourceModalBody"></div>
                <div id="studentResourceModalActions" style="margin-top:20px;display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;"></div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', function(e) {
            if (e.target === this) this.style.display = 'none';
        });

        console.log('✅ Resource modal created.');
    }

    // Use the existing openResourcePopup (no comments) – but we can keep this for fallback
    // We'll keep the global function intact, but ensure it doesn't show comments.

    function attachDirectListeners() {
        document.addEventListener('click', function(e) {
            const previewBtn = e.target.closest('.student-preview-btn, [onclick*="openResourcePopup"]');
            if (previewBtn) {
                const card = previewBtn.closest('.classroom-item');
                if (card) {
                    const resourceId = card.dataset.resourceId || card.dataset.id;
                    if (resourceId) {
                        e.preventDefault();
                        window.openResourcePopup(resourceId);
                    }
                }
            }
        });
        console.log('✅ Direct click listeners attached.');
    }

    function init() {
        createModal();
        setTimeout(attachDirectListeners, 500);
        console.log('✅ Student resource preview fix ready (no comments).');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
