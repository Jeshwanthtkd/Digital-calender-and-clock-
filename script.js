// --- TAB SWITCHING LOGIC ---
const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const heroTitle = document.getElementById('hero-title');
const heroSubtitle = document.getElementById('hero-subtitle');

const tabInfo = {
    'tab-alarm': { title: 'Online Clock & Alarm', sub: 'A dependable, free, and simple alarm clock that runs instantly in your browser.' },
    'tab-timer': { title: 'Online Timer', sub: 'Set a timer for any duration.' },
    'tab-stopwatch': { title: 'Online Stopwatch', sub: 'Simple and accurate stopwatch.' },
    'tab-countdown': { title: 'Countdown Timer', sub: 'Count down to a specific date and time.' },
    'tab-worldclock': { title: 'World Clock', sub: 'Check the current time in cities worldwide.' }
};

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all
        navButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
        
        // Update hero text
        heroTitle.textContent = tabInfo[tabId].title;
        heroSubtitle.textContent = tabInfo[tabId].sub;
    });
});

// --- FULLSCREEN LOGIC ---
const fullscreenBtn = document.getElementById('fullscreenBtn');
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
});

// --- GLOBAL CLOCK & ALARM LOGIC ---
let alarms = [];

// Populate dropdowns for Alarm
const hrSelect = document.getElementById('alarm-hour');
for (let i = 1; i <= 12; i++) {
    let val = i < 10 ? "0" + i : i;
    hrSelect.innerHTML += `<option value="${i}">${val}</option>`;
}
const minSelect = document.getElementById('alarm-minute');
for (let i = 0; i <= 59; i++) {
    let val = i < 10 ? "0" + i : i;
    minSelect.innerHTML += `<option value="${i}">${val}</option>`;
}

// Plus minus buttons for inputs
document.getElementById('hour-minus').onclick = () => { hrSelect.selectedIndex = Math.max(0, hrSelect.selectedIndex - 1); };
document.getElementById('minute-minus').onclick = () => { minSelect.selectedIndex = Math.max(0, minSelect.selectedIndex - 1); };
document.getElementById('minute-plus').onclick = () => { minSelect.selectedIndex = Math.min(59, minSelect.selectedIndex + 1); };

function updateMainClock() {
    const now = new Date();
    
    // Main Display
    let h = now.getHours();
    let m = now.getMinutes();
    let s = now.getSeconds();
    let ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    
    const hStr = h < 10 ? "0" + h : h;
    const mStr = m < 10 ? "0" + m : m;
    const sStr = s < 10 ? "0" + s : s;
    
    document.getElementById('main-clock').textContent = `${hStr}:${mStr}:${sStr}`;
    document.getElementById('main-ampm').textContent = ampm;
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('main-date').textContent = now.toLocaleDateString(undefined, options);

    // Check Alarms
    checkAlarms(now);
}

function checkAlarms(now) {
    let currentHour24 = now.getHours();
    let currentMin = now.getMinutes();
    let currentSec = now.getSeconds();

    if (currentSec !== 0) return; // Only trigger at the start of the minute

    alarms.forEach((alarm, index) => {
        if (!alarm.triggered) {
            let alarmH24 = alarm.h;
            if (alarm.ampm === 'PM' && alarm.h !== 12) alarmH24 += 12;
            if (alarm.ampm === 'AM' && alarm.h === 12) alarmH24 = 0;

            if (currentHour24 === alarmH24 && currentMin === alarm.m) {
                alert(`⏰ ALARM! Time is ${alarm.h}:${alarm.m < 10 ? '0'+alarm.m : alarm.m} ${alarm.ampm}`);
                alarm.triggered = true; // prevent re-triggering
            }
        }
    });
}

document.getElementById('setAlarmBtn').addEventListener('click', () => {
    const h = parseInt(hrSelect.value);
    const m = parseInt(minSelect.value);
    const ampm = document.getElementById('alarm-ampm').value;
    
    alarms.push({ h, m, ampm, triggered: false });
    renderAlarms();
});

// Expose remove function globally for inline onclick
window.removeAlarm = function(index) {
    alarms.splice(index, 1);
    renderAlarms();
}

function renderAlarms() {
    const list = document.getElementById('active-alarms-list');
    list.innerHTML = '<h4>Active Alarms</h4>';
    alarms.forEach((a, i) => {
        const mStr = a.m < 10 ? '0'+a.m : a.m;
        list.innerHTML += `<div class="alarm-item"><span>${a.h}:${mStr} ${a.ampm}</span> <button onclick="removeAlarm(${i})">Remove</button></div>`;
    });
}

setInterval(updateMainClock, 1000);
updateMainClock();

// --- TIMER LOGIC ---
let timerInterval;
let timerSeconds = 0;

function updateTimerDisplay() {
    let h = Math.floor(timerSeconds / 3600);
    let m = Math.floor((timerSeconds % 3600) / 60);
    let s = timerSeconds % 60;
    
    h = h < 10 ? "0" + h : h;
    m = m < 10 ? "0" + m : m;
    s = s < 10 ? "0" + s : s;
    
    document.getElementById('timer-display').textContent = `${h}:${m}:${s}`;
}

document.getElementById('timer-start').addEventListener('click', () => {
    if (timerSeconds === 0) {
        let h = parseInt(document.getElementById('timer-h').value) || 0;
        let m = parseInt(document.getElementById('timer-m').value) || 0;
        let s = parseInt(document.getElementById('timer-s').value) || 0;
        timerSeconds = (h * 3600) + (m * 60) + s;
    }
    
    if (timerSeconds > 0) {
        document.getElementById('timer-start').style.display = 'none';
        document.getElementById('timer-pause').style.display = 'inline-block';
        
        timerInterval = setInterval(() => {
            timerSeconds--;
            updateTimerDisplay();
            if (timerSeconds <= 0) {
                clearInterval(timerInterval);
                alert("⏳ Timer finished!");
                document.getElementById('timer-start').style.display = 'inline-block';
                document.getElementById('timer-pause').style.display = 'none';
            }
        }, 1000);
    }
});

document.getElementById('timer-pause').addEventListener('click', () => {
    clearInterval(timerInterval);
    document.getElementById('timer-start').style.display = 'inline-block';
    document.getElementById('timer-pause').style.display = 'none';
});

document.getElementById('timer-reset').addEventListener('click', () => {
    clearInterval(timerInterval);
    timerSeconds = 0;
    updateTimerDisplay();
    document.getElementById('timer-start').style.display = 'inline-block';
    document.getElementById('timer-pause').style.display = 'none';
});

// --- STOPWATCH LOGIC ---
let swInterval;
let swStartTime;
let swElapsedTime = 0;
let laps = [];

function updateSWDisplay() {
    let totalMs = swElapsedTime;
    if (swStartTime) {
        totalMs += Date.now() - swStartTime;
    }
    
    let ms = Math.floor((totalMs % 1000) / 10);
    let s = Math.floor((totalMs / 1000) % 60);
    let m = Math.floor((totalMs / (1000 * 60)) % 60);
    let h = Math.floor((totalMs / (1000 * 60 * 60)));
    
    let hStr = h < 10 ? "0" + h : h;
    let mStr = m < 10 ? "0" + m : m;
    let sStr = s < 10 ? "0" + s : s;
    let msStr = ms < 10 ? "0" + ms : ms;
    
    let display = h > 0 ? `${hStr}:${mStr}:${sStr}` : `${mStr}:${sStr}`;
    if (h === 0 && m === 0) display = `00:${sStr}`;
    
    document.getElementById('stopwatch-display').textContent = display;
    document.getElementById('stopwatch-ms').textContent = `.${msStr}`;
}

document.getElementById('stopwatch-start').addEventListener('click', () => {
    swStartTime = Date.now();
    swInterval = setInterval(updateSWDisplay, 10);
    document.getElementById('stopwatch-start').style.display = 'none';
    document.getElementById('stopwatch-pause').style.display = 'inline-block';
});

document.getElementById('stopwatch-pause').addEventListener('click', () => {
    clearInterval(swInterval);
    swElapsedTime += Date.now() - swStartTime;
    swStartTime = null;
    document.getElementById('stopwatch-start').style.display = 'inline-block';
    document.getElementById('stopwatch-pause').style.display = 'none';
});

document.getElementById('stopwatch-reset').addEventListener('click', () => {
    clearInterval(swInterval);
    swStartTime = null;
    swElapsedTime = 0;
    laps = [];
    document.getElementById('lap-list').innerHTML = '';
    updateSWDisplay();
    document.getElementById('stopwatch-start').style.display = 'inline-block';
    document.getElementById('stopwatch-pause').style.display = 'none';
});

document.getElementById('stopwatch-lap').addEventListener('click', () => {
    if (!swStartTime && swElapsedTime === 0) return;
    
    let totalMs = swElapsedTime;
    if (swStartTime) totalMs += Date.now() - swStartTime;
    
    let ms = Math.floor((totalMs % 1000) / 10);
    let s = Math.floor((totalMs / 1000) % 60);
    let m = Math.floor((totalMs / (1000 * 60)) % 60);
    
    let lapTime = `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}.${ms < 10 ? '0'+ms : ms}`;
    laps.push(lapTime);
    
    const lapList = document.getElementById('lap-list');
    lapList.innerHTML = `<div class="lap-item"><span>Lap ${laps.length}</span> <span>${lapTime}</span></div>` + lapList.innerHTML;
});

// --- COUNTDOWN LOGIC ---
let cdInterval;
document.getElementById('start-countdown').addEventListener('click', () => {
    const targetVal = document.getElementById('countdown-target').value;
    if (!targetVal) return alert("Please select a target date and time first.");
    
    const targetDate = new Date(targetVal).getTime();
    clearInterval(cdInterval);
    
    cdInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;
        
        if (distance < 0) {
            clearInterval(cdInterval);
            alert("🎉 Countdown finished!");
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('cd-days').textContent = days;
        document.getElementById('cd-hours').textContent = hours < 10 ? "0"+hours : hours;
        document.getElementById('cd-mins').textContent = minutes < 10 ? "0"+minutes : minutes;
        document.getElementById('cd-secs').textContent = seconds < 10 ? "0"+seconds : seconds;
    }, 1000);
});

// --- WORLD CLOCK LOGIC ---
const cities = [
    { name: "London", tz: "Europe/London" },
    { name: "New York", tz: "America/New_York" },
    { name: "Tokyo", tz: "Asia/Tokyo" },
    { name: "Sydney", tz: "Australia/Sydney" },
    { name: "Dubai", tz: "Asia/Dubai" },
    { name: "Paris", tz: "Europe/Paris" }
];

function updateWorldClocks() {
    const grid = document.getElementById('world-clock-grid');
    if (!grid.hasChildNodes()) {
        cities.forEach(city => {
            grid.innerHTML += `
                <div class="wc-card">
                    <div class="wc-city">${city.name}</div>
                    <div class="wc-time" id="wc-time-${city.name.replace(' ', '')}">--:--</div>
                    <div class="wc-date" id="wc-date-${city.name.replace(' ', '')}">--</div>
                </div>
            `;
        });
    }
    
    const now = new Date();
    cities.forEach(city => {
        const timeOptions = { timeZone: city.tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        const dateOptions = { timeZone: city.tz, weekday: 'short', month: 'short', day: 'numeric' };
        
        const timeString = new Intl.DateTimeFormat('en-US', timeOptions).format(now);
        const dateString = new Intl.DateTimeFormat('en-US', dateOptions).format(now);
        
        document.getElementById(`wc-time-${city.name.replace(' ', '')}`).textContent = timeString;
        document.getElementById(`wc-date-${city.name.replace(' ', '')}`).textContent = dateString;
    });
}
setInterval(updateWorldClocks, 1000);
updateWorldClocks();
