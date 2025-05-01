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
const navBoxes = document.querySelectorAll(".box");
const skipIntroBtn = document.getElementById("skip-intro-btn");

// Photo shuffle configuration
const photoFiles = [
  "assets/images/photo0.jpg",
  "assets/images/photo1.jpg",
  "assets/images/photo2.jpg", 
  "assets/images/photo3.jpg",
  "assets/images/photo4.jpg",
  "assets/images/photo5.jpg",
  "assets/images/photo6.jpg",
  "assets/images/photo7.jpg",
  "assets/images/photo8.jpg",
  "assets/images/photo9.jpg",
  "assets/images/photo10.jpg",
  "assets/images/photo11.jpg",
  "assets/images/photo12.jpg",
  "assets/images/photo13.jpg",
  "assets/images/photo14.jpg"
];
let currentPhotoIndex = 0;
let shuffleInterval;

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
  
  // Don't proceed with animations if skip was already clicked
  if (skipIntro) return;
  
  // Reset any prior state
  document.body.style.overflow = "hidden";
  
  // Ensure the main content is properly hidden
  mainContent.style.visibility = "hidden";
  mainContent.style.display = "none";
  
  // Keep the password screen visible during the transition
  passwordScreen.style.position = "fixed";
  passwordScreen.style.zIndex = "10";
  passwordScreen.style.visibility = "visible";
  
  // Create and add the glitch curtain with absolute positioning
  const glitchCurtain = document.createElement("div");
  glitchCurtain.classList.add("glitch-curtain");
  document.body.appendChild(glitchCurtain);
  
  // Trigger glitch animation
  await sleep(50);
  glitchCurtain.classList.add("animate");
  
  // Wait for glitch animation
  await sleep(2000);
  
  // Add black curtain
  const blackCurtain = document.createElement("div");
  blackCurtain.classList.add("black-curtain");
  document.body.appendChild(blackCurtain);
  
  // Trigger black curtain animation
  await sleep(50);
  blackCurtain.classList.add("animate");
  
  // Wait for animation
  await sleep(2000);
  
  // Change background
  document.body.style.backgroundColor = "black";
  
  // Only now - hide password screen
  passwordScreen.style.visibility = "hidden";
  passwordScreen.style.display = "none";
  
  // Prepare main content
  mainContent.style.visibility = "visible";
  mainContent.style.display = "flex";
  mainContent.style.opacity = "0";  // Start invisible
  
  // Clear intro text
  introText.textContent = "";
  
  // Remove curtains (they've served their purpose)
  glitchCurtain.remove();
  blackCurtain.remove();
  
  // Fade in main content
  await sleep(100);
  mainContent.style.opacity = "1";
  
  // Wait for fade in
  await sleep(800);
  
  // Type the intro text
  await typeIntroTextAsync("Hi, my name is Andy.");
  
  // Wait before showing nav boxes one by one
  await sleep(800);
  
  // Show navigation boxes sequentially
  for (let i = 0; i < navBoxes.length; i++) {
    navBoxes[i].classList.add("show");
    await sleep(500); // delay between each box appearing
  }
  const photoStack = document.getElementById("photo-stack");
  photoStack.classList.add("show");
  
  // Initialize photo stack
  initPhotoStack();
  
  // Start photo shuffling
  startPhotoShuffle();
});

// Async function for typing intro text character by character
async function typeIntroTextAsync(text) {
  // Clear text first
  introText.textContent = "";
  
  // If skip was clicked during this function execution, exit early
  if (skipIntro) return;
  
  // Add cursor at the beginning before typing
  const cursor = document.createElement("span");
  cursor.classList.add("text-cursor");
  introText.appendChild(cursor);
  
  // Wait a moment before typing begins
  await sleep(800);
  
  // Type each character with precise timing
  for (let i = 0; i < text.length; i++) {
    // Check if skip was pressed during typing
    if (skipIntro) {
      return;
    }
    
    // Remove cursor and add it after the new text
    introText.removeChild(cursor);
    introText.textContent += text.charAt(i);
    introText.appendChild(cursor);
    
    // Different timing for different characters
    let delay = 150;
    if (text.charAt(i) === ' ') delay = 200;
    if (text.charAt(i) === ',') delay = 400;
    if (text.charAt(i) === '.') delay = 600;
    
    await sleep(delay + Math.random() * 50);
  }
  
  // Fade out skip button naturally when typing is done
  skipIntroBtn.classList.add("hidden");
  
  return Promise.resolve();
}

function finishIntro() {
  skipIntro = true;
  removeCaret();
  
  // Hide password screen
  passwordScreen.style.visibility = "hidden";
  passwordScreen.style.display = "none";
  
  // Hide skip button with fade
  skipIntroBtn.classList.add("hidden");
  
  // Set background
  document.body.style.backgroundColor = "black";
  
  // Clean up any remaining animations or elements
  if (document.querySelector('.glitch-curtain')) {
    document.querySelector('.glitch-curtain').remove();
  }
  
  if (document.querySelector('.black-curtain')) {
    document.querySelector('.black-curtain').remove();
  }
  
  // Prepare main content
  mainContent.style.visibility = "visible";
  mainContent.style.display = "flex";
  mainContent.style.opacity = "0";
  
  // Show everything at once with a fade in
  setTimeout(() => {
    // Set the intro text immediately
    introText.textContent = "Hi, my name is Andy.";
    
    // Add the blinking cursor
    const cursor = document.createElement("span");
    cursor.classList.add("text-cursor");
    introText.appendChild(cursor);
    
    // Show all navigation boxes immediately
    navBoxes.forEach(box => {
      box.classList.add("show");
    });
    
    // Initialize photo stack
    initPhotoStack();
    
    // Show the photo stack
    const photoStack = document.getElementById("photo-stack");
    photoStack.classList.add("show");
    
    // Start photo shuffling
    startPhotoShuffle();
    
    // Now fade in everything together
    mainContent.style.opacity = "1";
  }, 100);
}


// Initialize the photo stack
function initPhotoStack() {
  const photoStack = document.getElementById("photo-stack");
  
  // Clear any existing photos
  photoStack.innerHTML = "";
  
  // Create photo elements
  photoFiles.forEach((photoSrc, index) => {
    const photoDiv = document.createElement("div");
    photoDiv.classList.add("photo");
    photoDiv.style.backgroundImage = `url(${photoSrc})`;
    
    // Assign classes based on position
    if (index === 0) {
      photoDiv.classList.add("active");
    } else if (index === 1) {
      photoDiv.classList.add("next");
    } else if (index === photoFiles.length - 1) {
      photoDiv.classList.add("prev");
    }
    
    photoStack.appendChild(photoDiv);
  });
}

// Start the photo shuffle interval
// Start the photo shuffle interval
function startPhotoShuffle() {
  // Clear any existing interval
  if (shuffleInterval) {
    clearInterval(shuffleInterval);
  }
  
  // Set new interval to run every 3 seconds
  shuffleInterval = setInterval(() => {
    shufflePhotos();
  }, 3000);
}

// Shuffle the photos - send top photo to back
function shufflePhotos() {
  const photoStack = document.getElementById("photo-stack");
  const photos = photoStack.querySelectorAll(".photo");
  
  if (photos.length < 2) return; // Need at least 2 photos to shuffle
  
  // Find the currently active photo
  const activePhoto = photoStack.querySelector(".photo.active");
  const nextPhoto = photoStack.querySelector(".photo.next") || photos[1];
  
  // Add animation classes
  activePhoto.classList.add("shuffle-out");
  nextPhoto.classList.add("shuffle-in");
  
  // Remove existing position classes
  activePhoto.classList.remove("active");
  nextPhoto.classList.remove("next");
  
  // After animation completes, reset positions
  setTimeout(() => {
    // Update the order by moving the old active to the back
    photoStack.appendChild(activePhoto);
    
    // Remove animation classes
    activePhoto.classList.remove("shuffle-out");
    nextPhoto.classList.remove("shuffle-in");
    
    // Apply new position classes to all photos
    const updatedPhotos = photoStack.querySelectorAll(".photo");
    
    // Clear all position classes first
    updatedPhotos.forEach(photo => {
      photo.classList.remove("active", "prev", "next");
    });
    
    // Apply new position classes
    updatedPhotos[0].classList.add("active");
    updatedPhotos[1].classList.add("next");
    updatedPhotos[updatedPhotos.length - 1].classList.add("prev");
    
  }, 800); // Match this with the animation duration in CSS
}

window.addEventListener("DOMContentLoaded", () => {
  // Ensure proper initial state
  mainContent.style.visibility = "hidden";
  mainContent.style.display = "none";
  mainContent.style.opacity = "0";
  
  // Reset all boxes to hidden state initially
  navBoxes.forEach(box => {
    box.classList.remove("show");
  });
  
  // Add event listener for skip button
  skipIntroBtn.addEventListener("click", () => {
    skipIntro = true;
    finishIntro();
  });
  
  simulateTyping();
});

// Clean up interval when page is unloaded
window.addEventListener("beforeunload", () => {
  if (shuffleInterval) {
    clearInterval(shuffleInterval);
  }
});