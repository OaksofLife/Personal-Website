const fullPassword = "<> I &lt3 coding </>";
const firstTry = "<> I <3 co";
const recovery = "<> I ";
const typedText = document.getElementById("typed-text");
const submitBtn = document.getElementById("submit-btn");
const passwordScreen = document.getElementById("password-screen");
const mainContent = document.getElementById("main-content");
const introText = document.getElementById("intro-text");
const fakeCursor = document.getElementById("fake-cursor");
const inputWrapper = document.getElementById("input-wrapper");
const passwordBox = document.getElementById("password-box");
const navBoxes = document.querySelector(".nav-boxes");

let skipIntro = false;
let caretElement;
let cursorPosition = { x: 0, y: 0 };

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createCaret() {
  caretElement = document.createElement("span");
  caretElement.classList.add("blinking-caret");
  passwordBox.appendChild(caretElement);
}

function removeCaret() {
  if (caretElement && caretElement.parentNode) caretElement.parentNode.removeChild(caretElement);
}

async function moveMouseHumanLike(targetX, targetY, duration = 600) {
    const startX = cursorPosition.x; 
    const startY = cursorPosition.y;
    const startTime = Date.now();
  
    // Clear previous animation state
    fakeCursor.style.transition = "none";
    fakeCursor.style.opacity = "1";
    fakeCursor.style.left = `${startX}px`;
    fakeCursor.style.top = `${startY}px`;
    
    // Define EXACTLY 3 intermediate points (plus start and end = 5 total points)
    const points = [
      { x: startX, y: startY }, // Starting point A
      { // Point B
        x: startX + (targetX - startX) * 0.3 + (Math.random() - 0.5) * 100,
        y: startY + (targetY - startY) * 0.2 + (Math.random() - 0.5) * 100
      },
      { // Point C
        x: startX + (targetX - startX) * 0.5 + (Math.random() - 0.5) * 150,
        y: startY + (targetY - startY) * 0.7 + (Math.random() - 0.5) * 150
      },
      { // Point D
        x: startX + (targetX - startX) * 0.8 + (Math.random() - 0.5) * 100,
        y: startY + (targetY - startY) * 0.6 + (Math.random() - 0.5) * 100
      },
      { x: targetX, y: targetY } // Final target (password field)
    ];
    
    let currentSegment = 0;
    const totalSegments = points.length - 1;
    const segmentDuration = duration / totalSegments;
    
    return new Promise(resolve => {
      function animate() {
        const elapsed = Date.now() - startTime;
        const overallProgress = Math.min(elapsed / duration, 1);
        
        if (overallProgress < 1) {
          // Determine which segment we're in
          currentSegment = Math.min(Math.floor(overallProgress * totalSegments), totalSegments - 1);
          
          // Calculate progress within the current segment
          const segmentStartTime = startTime + currentSegment * segmentDuration;
          const segmentElapsed = Date.now() - segmentStartTime;
          const segmentProgress = Math.min(segmentElapsed / segmentDuration, 1);
          
          // Get the current segment's start and end points
          const startPoint = points[currentSegment];
          const endPoint = points[currentSegment + 1];
          
          // Simple linear interpolation between points
          const newX = startPoint.x + (endPoint.x - startPoint.x) * segmentProgress;
          const newY = startPoint.y + (endPoint.y - startPoint.y) * segmentProgress;
          
          // Update cursor position with minimal transition
          fakeCursor.style.transition = "top 0.01s linear, left 0.01s linear";
          fakeCursor.style.left = `${newX}px`;
          fakeCursor.style.top = `${newY}px`;
          cursorPosition.x = newX;
          cursorPosition.y = newY;
          
          requestAnimationFrame(animate);
        } else {
          // Ensure we end exactly at the target position
          fakeCursor.style.left = `${targetX}px`;
          fakeCursor.style.top = `${targetY}px`;
          cursorPosition.x = targetX;
          cursorPosition.y = targetY;
          resolve();
        }
      }
      
      requestAnimationFrame(animate);
    });
}

async function clickWithCursor() {
  fakeCursor.classList.add("click");
  await sleep(150);
  fakeCursor.classList.remove("click");
  await sleep(150);
}

function simulateClick(element) {
    element.classList.add('click-animation');
    element.click();
  
    // Remove animation class after it ends so it can be re-triggered
    setTimeout(() => {
      element.classList.remove('click-animation');
    }, 250); // Matches animation duration
}

async function simulateTyping() {
  if (skipIntro) return finishIntro();

  // Initial cursor position (center of screen, but up a bit)
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  cursorPosition = {
    x: viewportWidth / 2,
    y: viewportHeight / 2 - 100
  };

  // Move to password box and click
  const boxRect = passwordBox.getBoundingClientRect();
  const passwordBoxX = boxRect.left + boxRect.width / 2;
  const passwordBoxY = boxRect.top + boxRect.height / 2;
  
  await moveMouseHumanLike(
    passwordBoxX, 
    passwordBoxY, 
    1000, 
    5
  );
  
  await clickWithCursor();
  
  // Focus field (visually)
  inputWrapper.classList.add("focused");
  typedText.classList.remove("placeholder"); // Remove placeholder
  createCaret();
  await sleep(700); // wait before typing

  // Type first attempt
  for (let i = 0; i < firstTry.length; i++) {
    if (skipIntro) return finishIntro();
    typedText.textContent += firstTry[i];
    await sleep(100 + Math.random() * 100);
  }

  // Show error character
  typedText.innerHTML = firstTry.slice(0, 7) + '<span id="error-char">' + firstTry[7] + '</span>' + firstTry.slice(8);
  await sleep(800);

  // Delete back to recovery slowly
  let current = typedText.textContent;
  while (current.length > recovery.length) {
    current = current.slice(0, -1);
    typedText.textContent = current;
    await sleep(80 + Math.random() * 60);
  }

  await sleep(500);

  // Type final password
  for (let i = recovery.length; i < fullPassword.length; i++) {
    if (skipIntro) return finishIntro();
    typedText.textContent += fullPassword[i];
    await sleep(80 + Math.random() * 70);
  }

  await sleep(800);

  // Move cursor to submit button and click
  const btnRect = submitBtn.getBoundingClientRect();
  const submitBtnX = btnRect.left + btnRect.width / 2;
  const submitBtnY = btnRect.top + btnRect.height / 2;
  
  await moveMouseHumanLike(submitBtnX, submitBtnY, 1000);
  await sleep(500); // wait a moment before clicking
  
  await clickWithCursor();
  fakeCursor.style.opacity = "0";
  submitBtn.click();
}

submitBtn.addEventListener("click", async () => {
  removeCaret();
  
  // First, make absolutely sure the main content is hidden (use both display and opacity)
  mainContent.classList.add("hidden");
  mainContent.style.opacity = "0";
  
  // Add glitch effect that comes down like a curtain
  const glitchCurtain = document.createElement("div");
  glitchCurtain.classList.add("glitch-curtain");
  document.body.appendChild(glitchCurtain);
  
  // Animate the curtain coming down
  await sleep(50);
  glitchCurtain.classList.add("animate");
  
  // CRITICAL: Wait for the full transition to complete
  await sleep(2000);
  
  // After glitch, add black curtain
  const blackCurtain = document.createElement("div");
  blackCurtain.classList.add("black-curtain");
  document.body.appendChild(blackCurtain);
  
  await sleep(50);
  blackCurtain.classList.add("animate");
  
  // CRITICAL: Wait for the full black curtain transition
  await sleep(2000);
  
  // Only now change background color
  document.body.style.backgroundColor = "black";
  
  // Hide password screen completely
  passwordScreen.style.display = "none";
  
  // Empty the intro text to prepare for typing
  introText.textContent = "";
  
  // Remove curtains after everything is hidden
  glitchCurtain.remove();
  blackCurtain.remove();
  
  // ONLY NOW make main content visible but with opacity 0
  mainContent.classList.remove("hidden");
  
  // Force browser to process this change before continuing
  await sleep(50);
  
  // Now make main content visible with transition
  mainContent.style.transition = "opacity 0.5s ease";
  mainContent.style.opacity = "1";
  
  // Wait for fade-in transition to complete
  await sleep(800);
  
  // Type intro text character by character
  await typeIntroTextAsync("Hi, my name is Andy.");
  
  // Wait before showing nav boxes
  await sleep(800);
  
  // Show nav boxes with fade-in
  navBoxes.classList.add("show");
});

// Async function for typing intro text character by character
async function typeIntroTextAsync(text) {
  // Clear text first
  introText.textContent = "";
  
  // Type each character with precise timing
  for (let i = 0; i < text.length; i++) {
    if (skipIntro) {
      introText.textContent = text;
      return;
    }
    
    introText.textContent += text.charAt(i);
    
    // Different timing for different characters
    let delay = 150;
    if (text.charAt(i) === ' ') delay = 200;
    if (text.charAt(i) === ',') delay = 400;
    if (text.charAt(i) === '.') delay = 600;
    
    await sleep(delay + Math.random() * 50);
  }
  
  // Add blinking cursor at the end
  const cursor = document.createElement("span");
  cursor.classList.add("text-cursor");
  introText.appendChild(cursor);
  
  return Promise.resolve();
}

function finishIntro() {
  skipIntro = true;
  removeCaret();
  passwordScreen.style.display = "none";
  document.body.style.backgroundColor = "black";
  
  // Force hidden state first
  mainContent.classList.add("hidden");
  mainContent.style.opacity = "0";
  
  // Force browser to process changes
  setTimeout(() => {
    mainContent.classList.remove("hidden");
    mainContent.style.opacity = "1";
    introText.textContent = "Hi, my name is Andy.";
    
    // Add the cursor at the end
    const cursor = document.createElement("span");
    cursor.classList.add("text-cursor");
    introText.appendChild(cursor);
    
    navBoxes.classList.add("show");
  }, 100);
}

window.addEventListener("DOMContentLoaded", () => {
  // Ensure main content is properly hidden at start
  mainContent.classList.add("hidden");
  mainContent.style.opacity = "0";
  
  simulateTyping();
});

document.body.addEventListener("click", () => {
  if (!skipIntro) finishIntro();
});