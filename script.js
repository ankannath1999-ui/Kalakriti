'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Canvas Physics Grid ---
    const canvas = document.getElementById('hero-canvas');
    const ctx = canvas ? canvas.getContext('2d', { alpha: true }) : null;
    let width, height, points = [];

    // Cursor shared state
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    if (canvas && ctx) {
        const spacing = 45;
        const interactionRadius = 150;

        const initPoints = () => {
            points = [];
            for (let x = 0; x < width + spacing; x += spacing) {
                for (let y = 0; y < height + spacing; y += spacing) {
                    points.push({ x: x, y: y, originX: x, originY: y, vx: 0, vy: 0 });
                }
            }
        };

        const resizeCanvas = () => {
            width = window.innerWidth; height = window.innerHeight;
            canvas.width = width; canvas.height = height;
            initPoints();
        };

        const renderCanvas = () => {
            ctx.clearRect(0, 0, width, height);

            // Contrast adjusted
            ctx.fillStyle = 'rgba(242, 233, 225, 0.45)';

            points.forEach(p => {
                const dx = mouseX - p.x; const dy = mouseY - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < interactionRadius) {
                    const force = (interactionRadius - dist) / interactionRadius;
                    p.vx -= (dx / dist) * force * 1.5;
                    p.vy -= (dy / dist) * force * 1.5;
                }

                p.vx *= 0.85; p.vy *= 0.85;
                p.x += p.vx + (p.originX - p.x) * 0.05;
                p.y += p.vy + (p.originY - p.y) * 0.05;

                ctx.beginPath();
                ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
                ctx.fill();
            });
            requestAnimationFrame(renderCanvas);
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas(); renderCanvas();
        setTimeout(() => { canvas.style.opacity = '1'; }, 200);
    }

    // --- 2. Custom LERP Cursor ---
    const cursor = document.getElementById('custom-cursor');
    let cursorX = mouseX, cursorY = mouseY;

    if (cursor) {
        const lerp = (start, end, factor) => start + (end - start) * factor;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX; mouseY = e.clientY;
        });

        const renderCursor = () => {
            cursorX = lerp(cursorX, mouseX, 0.15); cursorY = lerp(cursorY, mouseY, 0.15);
            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
            requestAnimationFrame(renderCursor);
        };
        requestAnimationFrame(renderCursor);

        document.querySelectorAll('a, .hover-target').forEach(target => {
            target.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
            target.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
        });
    }

    // --- 3. Absolute Nav ---
    const nav = document.getElementById('main-nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            requestAnimationFrame(() => {
                if (window.scrollY > 50) nav.classList.add('nav--hidden');
                else nav.classList.remove('nav--hidden');
            });
        }, { passive: true });
    }

    // --- 4. Observers (Scroll Reveals) ---
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    // Force hero text to reveal immediately 
    setTimeout(() => {
        const hero = document.querySelector('.hero-content');
        if (hero) hero.classList.add('is-visible');
    }, 100);

    document.querySelectorAll('.reveal-fade, .reveal-slide, .service-item, .link-wrapper').forEach(el => {
        revealObserver.observe(el);
    });
});