let activeIndex = 0;

//------------------------------------underline-navbar----------------------------------------
function ul(index) {
  const underlines = document.querySelectorAll(".underline");
  const links = document.querySelectorAll("nav a");
  const activeLink = links[index];

  underlines.forEach(underline => {
    underline.style.width = activeLink.offsetWidth + "px";
    underline.style.transform = `translateX(${activeLink.offsetLeft}px)`;
  });
}

const links = document.querySelectorAll('nav a');

links.forEach((link, index) => {
  link.addEventListener('mouseenter', () => ul(index));
  link.addEventListener('mouseleave', () => ul(activeIndex));
  link.addEventListener('click', () => {
    activeIndex = index;
    ul(activeIndex);
  });
});

ul(activeIndex);

//------------------------------------padding-video----------------------------------------
function adjustMainPadding() {
  const header = document.querySelector('header');
  const underheader = document.querySelector('.underheader');
  if (!header || !underheader) return;

  underheader.style.top = header.offsetHeight + 'px';
}

function debounce(fn, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

const debouncedResizeHandler = debounce(() => {
  adjustScrollMarginTop();
  adjustMainPadding();
  resizeText();
}, 150);

window.addEventListener('DOMContentLoaded', () => {
  adjustMainPadding();
  adjustScrollMarginTop();
});

window.addEventListener('resize', debouncedResizeHandler);

if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', debouncedResizeHandler);
}

//------------------------------------header/underheader-scroll----------------------------------------
let lastScrollY = window.scrollY;
const header = document.querySelector('header');
const underheader = document.querySelector('.underheader');

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;

  if (currentScroll > lastScrollY) {
    header.style.transform = 'translateY(-100%)';
    underheader.style.transform = 'translateY(-300%)';
  } else {
    header.style.transform = 'translateY(0)';
    underheader.style.transform = 'translateY(0)';
  }

  lastScrollY = currentScroll;
});

document.addEventListener('mousemove', (e) => {
  if (e.clientY < 50) {
    header.style.transform = 'translateY(0)';
    underheader.style.transform = 'translateY(0)';
  }
});

//------------------------------------resize----------------------------------------
function resizeText() {
  const toggleSwitch = document.querySelector('.toggle-switch');
  const langSelect = document.querySelector('.lang-select');
  const underheader = document.querySelector('.underheader');
  const minWidth = 1200;
  const maxWidth = 1920;

  const minFontSize = 6;
  const maxFontSize = 16;

  const minFontSizeTitle = 6;
  const maxFontSizeTitle = 50;

  const screenWidth = window.innerWidth;
  const clampedWidth = Math.max(minWidth, Math.min(screenWidth, maxWidth));
  const fontSize = minFontSize + (maxFontSize - minFontSize) * ((clampedWidth - minWidth) / (maxWidth - minWidth));
  const fontSizeTitle = minFontSizeTitle + (maxFontSizeTitle - minFontSizeTitle) * ((clampedWidth - minWidth) / (maxWidth - minWidth));

  const pictureOne = document.querySelector(".photo");

  document.body.style.fontSize = `${fontSize}px`;
  document.querySelector("header").style.fontSize = `${fontSize * 0.9}px`;

  document.querySelectorAll(".navbar a").forEach(a => {
    a.style.fontSize = `${fontSize}px`;
  });
  document.querySelectorAll(".title").forEach(a => {
    a.style.fontSize = `${fontSizeTitle}px`;
  });

  const zoomLevel = window.outerWidth / window.innerWidth;

  const logo = document.querySelector("header img");
  if (logo) {
    const baseMaxHeight = 80;
    logo.style.maxHeight = `${(fontSize / maxFontSize) * baseMaxHeight}px`;
    logo.style.display = zoomLevel >= 2 ? "none" : "inline";
  }
  if (pictureOne) {
    const baseMaxHeight = 400;
    pictureOne.style.maxHeight = `${(fontSize / maxFontSize) * baseMaxHeight}px`;
    pictureOne.style.maxWidth = `${(fontSize / maxFontSize) * baseMaxHeight * 3 / 4}px`;
    pictureOne.style.display = zoomLevel >= 2 ? "none" : "inline";
  }

  document.querySelectorAll(".underheader a svg").forEach(svg => {
    const baseSize = 28;
    const newSize = (fontSize / maxFontSize) * baseSize;
    svg.style.width = `${newSize}px`;
    svg.style.height = `${newSize}px`;
    svg.style.display = zoomLevel >= 2 ? "none" : "inline";
  });
  if (toggleSwitch) {
    toggleSwitch.style.display = zoomLevel > 1.5 ? "none" : "inline";
  }
  if (langSelect) {
    langSelect.style.display = zoomLevel > 1.5 ? "none" : "inline";
  }
  if (underheader) {
    underheader.style.display = zoomLevel >= 2 ? "none" : "flex";
  }
}

window.addEventListener("resize", debounce(resizeText, 150));
window.addEventListener("load", resizeText);

//------------------------------------dark-theme----------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector(".checkbox");
  if (toggle) {
    toggle.addEventListener("change", function () {
      document.body.classList.toggle("dark-theme", this.checked);
    });
  }
});

//------------------------------------video-ytb----------------------------------------
window.addEventListener('load', () => {
  fetch('http://localhost:3000/latest-video/UCTmq7IPbdGEWP-Q3wgl4f5g')
    .then(res => res.json())
    .then(data => {
      const videoId = data.videoId;
      if (!document.querySelector('#video-container iframe')) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?modestbranding=1&rel=0&cookie=0`;
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        document.getElementById('video-container').appendChild(iframe);
      }
    })
    .catch(err => {
      console.error("Erreur lors du chargement de la vidéo :", err);
      const videoContainer = document.getElementById('video-container');
      if (videoContainer) videoContainer.textContent = 'Impossible de charger la vidéo.';
    });
});

//------------------------------------scroll----------------------------------------
function adjustScrollMarginTop() {
  const header = document.querySelector('header');
  if (!header) return;

  const sections = document.querySelectorAll('section');
  const headerHeight = header.offsetHeight;
  const extraOffset = 100;

  sections.forEach(section => {
    section.style.scrollMarginTop = (headerHeight + extraOffset) + 'px';
  });
}

window.addEventListener('DOMContentLoaded', () => {
  adjustScrollMarginTop();
  adjustMainPadding();
});
window.addEventListener('resize', debouncedResizeHandler);

let progress = 0;
const fill = document.getElementById("progress-fill");

const simulateLoading = setInterval(() => {
  progress += Math.random() * 10;
  if (progress >= 100) progress = 100;
  if (fill) fill.style.width = progress + "%";
  if (progress === 100) clearInterval(simulateLoading);
}, 100);

window.addEventListener("load", () => {
  if (fill) fill.style.width = "100%";

  setTimeout(() => {
    const loader = document.getElementById("loader");
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.style.display = "none";
      }, 300);
    }
  }, 300);
});

//------------------------------------twitch----------------------------------------
let twitchPlayer = null;
let chatLoaded = false;
const twitchContainer = document.getElementById('twitch-embed');
const twitchChat = document.getElementById('twitch-chat');

if (twitchContainer && twitchChat) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!twitchPlayer) {
          twitchPlayer = new Twitch.Player("twitch-embed", {
            channel: "mordekdrums",
            width: "100%",
            height: "100%",
            parent: [location.hostname]
          });
        }
        if (!chatLoaded) {
          twitchChat.src = `https://www.twitch.tv/embed/mordekdrums/chat?parent=${location.hostname}`;
          chatLoaded = true;
        }
      } else {
        if (twitchPlayer) {
          twitchPlayer.destroy();
          twitchPlayer = null;
        }
        if (chatLoaded) {
          twitchChat.src = '';
          chatLoaded = false;
        }
      }
    });
  }, { threshold: 0.25 });

  observer.observe(twitchContainer);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    } else {
      entry.target.classList.remove('visible');
    }
  });
});

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

//------------------------------------select-lang----------------------------------------
function updateLanguage(lang) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = translations[lang][key] || key;
  });
  localStorage.setItem('lang', lang);
}

const defaultLang = 'fr';
document.getElementById('lang-select').value = defaultLang;
updateLanguage(defaultLang);

document.getElementById('lang-select').addEventListener('change', (e) => {
  updateLanguage(e.target.value);
});