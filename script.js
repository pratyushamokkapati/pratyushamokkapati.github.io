const canvas = document.getElementById('revealCanvas');
const ctx = canvas.getContext('2d');
const maskedLayer = document.getElementById('maskedLayer');
const wrapper = document.querySelector('.quote-interactive-wrapper');

let width, height;

function resizeCanvas() {
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = rect.height;
}
window.addEventListener('resize', resizeCanvas);

let mouse = { x: 0, y: 0 };
let targetMouse = { x: 0, y: 0 };
let blobs = [];
const maxPoints = 45; 
let time = 0;

window.addEventListener('mousemove', (e) => {
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    
    // Relative positioning subtraction completely erases y-offset drift artifacts
    targetMouse.x = e.clientX - rect.left;
    targetMouse.y = e.clientY - rect.top;
});

// Setup fallback vector position on first touch entry
window.addEventListener('mousemove', function handleFirstMove(e) {
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    window.removeEventListener('mousemove', handleFirstMove);
});

window.addEventListener('mousemove', (e) => {
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    if (Math.abs(mouse.x - currentX) > 1 || Math.abs(mouse.y - currentY) > 1) {
        blobs.push({
            x: currentX,
            y: currentY,
            radius: Math.random() * 30 + 55,
            life: 40,
            maxLife: 40
        });
    }
});

function animate() {
    ctx.clearRect(0, 0, width, height);
    time += 0.06;

    for (let i = 0; i < blobs.length; i++) {
        blobs[i].life--;
        if (blobs[i].life <= 0) {
            blobs.splice(i, 1);
            i--;
        }
    }

    // High performance linear track interpolation
    mouse.x += (targetMouse.x - mouse.x) * 0.12;
    mouse.y += (targetMouse.y - mouse.y) * 0.12;

    // Keep everything in your script.js the same, just verify your canvas trail outputs solid white pixels for the CSS mask calculation:
ctx.fillStyle = '#ffffff';

    // Main pointer anchor
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2);
    ctx.fill();

    // Secondary trailing liquid elements
    for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        const pct = b.life / b.maxLife;
        let waveX = Math.sin(time + i * 0.3) * 6;
        let waveY = Math.cos(time + i * 0.3) * 6;

        ctx.beginPath();
        ctx.arc(b.x + waveX, b.y + waveY, b.radius * pct, 0, Math.PI * 2);
        ctx.fill();
    }

    // Export the canvas grid coordinates cleanly to act as a clip path mask
    if (maskedLayer) {
        const maskUrl = `url(${canvas.toDataURL()})`;
        maskedLayer.style.maskImage = maskUrl;
        maskedLayer.style.webkitMaskImage = maskUrl;
    }

    requestAnimationFrame(animate);
}

window.addEventListener('load', () => {
    resizeCanvas();
    animate();
});

// --- PASTE THIS CODE AT THE BOTTOM OF YOUR SCRIPT.JS ---

// --- REPLACE THE VIDEO HOVER CODE AT THE BOTTOM OF YOUR SCRIPT.JS WITH THIS ---

document.querySelectorAll('.project-card-wrapper').forEach((cardWrapper) => {
    const video = cardWrapper.querySelector('.card-video');
    const audioOverlay = cardWrapper.querySelector('.audio-control-overlay');
    const audioIcon = cardWrapper.querySelector('.audio-icon');

    if (video) {
        // Force initial mute programmatically to satisfy browser autoplay security barriers
        video.muted = true; 

        // Play silently on mouse entry
        cardWrapper.addEventListener('mouseenter', () => {
            video.currentTime = 0; 
            video.play().catch((err) => console.log("Autoplay blocked:", err));
        });

        // Pause when mouse leaves
        cardWrapper.addEventListener('mouseleave', () => {
            video.pause();
        });

        // UNMUTE CLICK HANDLER
        if (audioOverlay) {
            audioOverlay.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevents click anomalies with the parent 3D rotation tracks
                
                if (video.muted) {
                    video.muted = false;
                    audioIcon.innerHTML = "🔊 Mute Audio";
                    audioOverlay.style.borderColor = "#ffffff";
                } else {
                    video.muted = true;
                    audioIcon.innerHTML = "🔇 Click to Unmute";
                    audioOverlay.style.borderColor = "#c8b273";
                }
            });
        }
    }
});

// --- PASTE THIS CODE AT THE BOTTOM OF YOUR SCRIPT.JS ---

document.querySelectorAll('.experience-card').forEach((card) => {
    card.addEventListener('click', () => {
        // Toggle the active display flag cleanly on the container matrix
        card.classList.toggle('active');
        
        // Recalculate canvas coordinates if the page layout changes height dimensions
        setTimeout(() => {
            if (typeof resizeCanvas === "function") {
                resizeCanvas();
            }
        }, 500);
    });
});