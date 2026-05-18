// Sticky Navbar
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    header.classList.toggle('sticky', window.scrollY > 50);
});

// Menu Icon Toggle
const menuIcon = document.querySelector('#menu-icon');
const navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};

// Close Menu on Click
const navLinks = document.querySelectorAll('.navbar a');
navLinks.forEach(link => {
    link.onclick = () => {
        menuIcon.classList.remove('bx-x');
        navbar.classList.remove('active');
    };
});

// Active Link Scrollspy
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

// Real-time Code Typing Animation
const codeBlock = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Beshoy Atef | Portfolio</title>
</head>
<body>
    <section class="hero">
        <div class="container">
            <h1>Beshoy Atef</h1>
            <h2>Front-End Developer & Web Designer</h2>
            <p>Passionate about creating pixel-perfect, dynamic interfaces.</p>
            
            <div class="skills">
                <span data-lang="html">HTML5</span>
                <span data-lang="css">CSS3</span>
                <span data-lang="js">JavaScript</span>
                <span data-lang="react">React</span>
                <span data-lang="python">Python</span>
                <span data-lang="cpp">C++</span>
            </div>
            
            <a href="#contact" class="btn">Let's Work Together 🚀</a>
        </div>
    </section>
</body>
</html>`;

const typedCodeEl = document.getElementById('typed-code');
const codeWrapper = document.getElementById('code-wrapper');
const lineNumbersEl = document.getElementById('line-numbers');

let charIndex = 0;
let currentCodeSnippet = '';

function updateLineNumbers() {
    if (!currentCodeSnippet) return;
    const lines = currentCodeSnippet.split('\n').length;
    let numbersHtml = '';
    for (let i = 1; i <= lines; i++) {
        numbersHtml += `<div>${i}</div>`;
    }
    lineNumbersEl.innerHTML = numbersHtml;
}

function typeCode() {
    if (charIndex < codeBlock.length) {
        // Number of characters to type at once (creates natural pacing)
        const charsToAdd = Math.random() > 0.6 ? Math.floor(Math.random() * 3) + 1 : 1;
        
        currentCodeSnippet += codeBlock.substring(charIndex, charIndex + charsToAdd);
        charIndex += charsToAdd;
        
        typedCodeEl.textContent = currentCodeSnippet;
        
        // Let Prism.js apply syntax highlighting
        if (window.Prism) {
            Prism.highlightElement(typedCodeEl);
        }
        
        updateLineNumbers();
        
        // Auto scroll to latest line
        codeWrapper.scrollTop = codeWrapper.scrollHeight;
        
        // Variable typing speed
        let typeSpeed = Math.random() * 40 + 10;
        
        // Pause briefly at end of lines or html tags
        const lastChar = currentCodeSnippet.slice(-1);
        if (lastChar === '>' || lastChar === '\n') {
            typeSpeed += 150;
        }
        
        setTimeout(typeCode, typeSpeed);
    } else {
        // Animation end. Loop after 10 seconds.
        setTimeout(() => {
            currentCodeSnippet = '';
            charIndex = 0;
            typeCode();
        }, 10000);
    }
}

if (document.getElementById('typed-code')) {
    setTimeout(typeCode, 800);
}

// AOS Animation Initialization
AOS.init({
    once: false,
    offset: 100,
    duration: 800,
    easing: 'ease-in-out',
});
