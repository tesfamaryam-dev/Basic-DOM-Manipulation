// ============ DOM Elements ============
const counterDiv = document.getElementById("counter");
const incrementBtn = document.getElementById("increment");
const decrementBtn = document.getElementById("decrement");
const resetBtn = document.getElementById("reset");
const startInput = document.getElementById("startCount");
const maxInput = document.getElementById("maxCount");
const stepSelect = document.getElementById("stepValue");
const themeSelect = document.getElementById("themeSelect");
const streakDiv = document.getElementById("streak");
const levelDiv = document.getElementById("level");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");
const confettiCanvas = document.getElementById("confetti");
const ctx = confettiCanvas.getContext("2d");

// ============ State ============
let counterValue = 0;
let startValue = 0;
let maxValue = 10;
let stepValue = 1;
let streak = 0;
let level = 1;
let history = [];
let confettiParticles = [];

// ============ Load State ============
document.addEventListener("DOMContentLoaded", ()=>{
    counterValue = parseInt(localStorage.getItem("counter"))||0;
    startValue = parseInt(localStorage.getItem("startValue"))||0;
    maxValue = parseInt(localStorage.getItem("maxValue"))||10;
    stepValue = parseInt(localStorage.getItem("stepValue"))||1;
    streak = parseInt(localStorage.getItem("streak"))||0;
    level = parseInt(localStorage.getItem("level"))||1;
    history = JSON.parse(localStorage.getItem("history"))||[];
    const savedTheme = localStorage.getItem("theme")||"gradient";
    document.body.className=savedTheme;
    startInput.value=startValue;
    maxInput.value=maxValue;
    stepSelect.value=stepValue;
    themeSelect.value=savedTheme;
    updateDisplay();
    renderHistory();
});

// ============ Helper Functions ============
function saveState(){
    localStorage.setItem("counter",counterValue);
    localStorage.setItem("startValue",startValue);
    localStorage.setItem("maxValue",maxValue);
    localStorage.setItem("stepValue",stepValue);
    localStorage.setItem("streak",streak);
    localStorage.setItem("level",level);
    localStorage.setItem("history",JSON.stringify(history));
    localStorage.setItem("theme",document.body.className);
}

function updateDisplay(){
    counterDiv.textContent=counterValue;
    counterDiv.style.transform="scale(1.2)";
    setTimeout(()=>counterDiv.style.transform="scale(1)",150);
    streakDiv.textContent=`🔥 Streak: ${streak}`;
    levelDiv.textContent=`🏆 Level: ${level}`;
    saveState();
}

function addHistory(action){
    const time=new Date().toLocaleTimeString();
    const emoji=action.includes("Increment")?"👍":action.includes("Decrement")?"👎":"🔄";
    history.unshift(`${time} ${emoji} — ${action}`);
    if(history.length>15) history.pop();
    renderHistory();
}

function renderHistory(){
    historyList.innerHTML="";
    history.forEach(item=>{
        const li=document.createElement("li");
        li.textContent=item;
        historyList.appendChild(li);
    });
}

// ============ Sound Effects ============
const sounds={
    increment:new Audio("https://freesound.org/data/previews/66/66717_931655-lq.mp3"),
    decrement:new Audio("https://freesound.org/data/previews/66/66717_931655-lq.mp3"),
    reset:new Audio("https://freesound.org/data/previews/331/331912_3248244-lq.mp3"),
    level:new Audio("https://freesound.org/data/previews/341/341695_3248244-lq.mp3")
};

function playSound(type){
    if(sounds[type]){sounds[type].currentTime=0;sounds[type].play();}
}

// ============ Level & Streak ============
function checkLevelUp(){
    if(streak>0 && streak%5===0){
        level++;
        addHistory("Level Up!");
        playSound("level");
        confettiBurst();
    }
}

// ============ Confetti ============
function confettiBurst(){
    confettiCanvas.width=window.innerWidth;
    confettiCanvas.height=window.innerHeight;
    confettiParticles=[];
    for(let i=0;i<150;i++){
        confettiParticles.push({
            x:Math.random()*confettiCanvas.width,
            y:Math.random()*confettiCanvas.height-500,
            r:Math.random()*6+4,
            color:`hsl(${Math.random()*360},70%,60%)`,
            tilt:Math.random()*10-10,
            tiltInc:Math.random()*0.07+0.05
        });
    }
    requestAnimationFrame(drawConfetti);
}

function drawConfetti(){
    ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
    confettiParticles.forEach(p=>{
        ctx.beginPath();
        ctx.moveTo(p.x+p.tilt+p.r/2,p.y);
        ctx.lineTo(p.x+p.tilt,p.y+p.r);
        ctx.strokeStyle=p.color;
        ctx.lineWidth=p.r/2;
        ctx.stroke();
        p.tilt+=p.tiltInc;
        p.y+=2;
        if(p.y>confettiCanvas.height)p.y=-10;
    });
    requestAnimationFrame(drawConfetti);
}

// ============ Button Events ============
incrementBtn.addEventListener("click",()=>{
    if(counterValue+stepValue<=maxValue){
        counterValue+=stepValue;
        streak++;
        addHistory("Incremented");
        playSound("increment");
        checkLevelUp();
        updateDisplay();
        if(counterValue===maxValue) confettiBurst();
    }
});

decrementBtn.addEventListener("click",()=>{
    if(counterValue-stepValue>=0){
        counterValue-=stepValue;
        streak=0;
        addHistory("Decremented");
        playSound("decrement");
        updateDisplay();
    }
});

resetBtn.addEventListener("click",()=>{
    counterValue=parseInt(startInput.value)||0;
    streak=0;
    level=1;
    addHistory("Reset");
    playSound("reset");
    updateDisplay();
});

// ============ Input Events ============
startInput.addEventListener("change",e=>{
    startValue=parseInt(e.target.value)||0;
    counterValue=startValue;
    updateDisplay();
});

maxInput.addEventListener("change",e=>{
    maxValue=parseInt(e.target.value)||10;
    if(counterValue>maxValue) counterValue=maxValue;
    updateDisplay();
});

stepSelect.addEventListener("change",e=>{
    stepValue=parseInt(e.target.value)||1;
});

themeSelect.addEventListener("change",e=>{
    document.body.className=e.target.value;
    saveState();
});

// ============ History ============
clearHistoryBtn.addEventListener("click",()=>{
    history=[];
    renderHistory();
    saveState();
});

// ============ Keyboard Shortcuts ============
document.addEventListener("keydown",e=>{
    if(e.key==="ArrowUp") incrementBtn.click();
    if(e.key==="ArrowDown") decrementBtn.click();
    if(e.key.toLowerCase()==="r") resetBtn.click();
});
