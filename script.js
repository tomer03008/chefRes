/* ==========================================================================
   script.js — Application Logic & Motion System for נוריה (Nuria)
   Full Mobile Animation Engine: Signature Dish & Infinite Food Marquee
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------------
     1. M1: CURTAIN LOADER (sessionStorage)
     ------------------------------------------------------------------------ */
  const curtainLoader = document.getElementById('curtainLoader');
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (curtainLoader) {
    const isLoaded = sessionStorage.getItem('nuria_curtain_done');
    if (isLoaded || isReducedMotion) {
      curtainLoader.classList.add('is-done');
      document.body.classList.add('ready');
    } else {
      setTimeout(() => {
        curtainLoader.classList.add('is-done');
        document.body.classList.add('ready');
        sessionStorage.setItem('nuria_curtain_done', 'true');
      }, 700);
    }
  } else {
    document.body.classList.add('ready');
  }

  /* ------------------------------------------------------------------------
     2. M2 & 9.3: LIVE STATUS TEXT CALCULATOR
     ------------------------------------------------------------------------ */
  function updateLiveStatus() {
    const statusTextEl = document.getElementById('statusText');
    if (!statusTextEl) return;

    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hours = now.getHours();
    const mins = now.getMinutes();
    const timeInMins = hours * 60 + mins;

    let statusString = "הדלת נפתחת ב־18:00";

    if (day === 0 || day === 1) { // Sunday or Monday
      statusString = "סגור ראשון ושני · נפתח מחר ב־18:00";
    } else {
      if (timeInMins < 18 * 60) {
        statusString = "הדלת נפתחת ב־18:00";
      } else if (timeInMins >= 18 * 60 && timeInMins < 20 * 60 + 45) {
        statusString = "המשמרת הראשונה בעיצומה";
      } else if (timeInMins >= 20 * 60 + 45 && timeInMins < 24 * 60) {
        statusString = "המשמרת השנייה בעיצומה";
      } else {
        statusString = "סגור · מחר מ־18:00";
      }
    }

    statusTextEl.textContent = statusString;
  }
  updateLiveStatus();

  /* ------------------------------------------------------------------------
     3. UNIFIED 60FPS SCROLL ENGINE (DESKTOP & MOBILE ANIMATIONS)
     ------------------------------------------------------------------------ */
  const siteNav = document.getElementById('siteNav');
  const mobileStickyCta = document.getElementById('mobileStickyCta');
  const heroEl = document.getElementById('hero');

  const signatureSection = document.getElementById('signature');
  const stepLines = document.querySelectorAll('.step-line');
  const sigImgs = document.querySelectorAll('.sig-img');

  const marqueeTop = document.getElementById('marqueeTop');
  const marqueeBottom = document.getElementById('marqueeBottom');

  const menuSection = document.getElementById('menu-preview');
  const menuTrack = document.getElementById('menuTrack');
  const menuProgressFill = document.getElementById('menuProgressFill');

  let currentSigStep = 1;
  let isTicking = false;

  function setActiveSignatureStep(stepNumber) {
    if (currentSigStep === stepNumber) return;
    currentSigStep = stepNumber;

    stepLines.forEach((line) => {
      const step = parseInt(line.dataset.step, 10);
      if (step === stepNumber) {
        line.classList.add('active');
      } else {
        line.classList.remove('active');
      }
    });

    sigImgs.forEach((img, idx) => {
      if (idx + 1 === stepNumber) {
        img.classList.add('active');
      } else {
        img.classList.remove('active');
      }
    });
  }

  // Interactive Tap Listener on Step Lines (Mobile & Desktop)
  stepLines.forEach(line => {
    line.addEventListener('click', () => {
      const stepNum = parseInt(line.dataset.step, 10);
      setActiveSignatureStep(stepNum);
    });
  });

  // Mobile Auto-Cycle Timer for Signature Dish
  let sigAutoTimer = null;
  if ('IntersectionObserver' in window && signatureSection) {
    const sigObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && window.innerWidth <= 900) {
          if (!sigAutoTimer) {
            sigAutoTimer = setInterval(() => {
              let nextStep = currentSigStep + 1;
              if (nextStep > 3) nextStep = 1;
              setActiveSignatureStep(nextStep);
            }, 3200);
          }
        } else {
          if (sigAutoTimer) {
            clearInterval(sigAutoTimer);
            sigAutoTimer = null;
          }
        }
      });
    }, { threshold: 0.2 });

    sigObserver.observe(signatureSection);
  }

  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset;

    // A. Navigation Bar & Mobile Sticky CTA
    if (siteNav) {
      if (scrollY > 100) {
        siteNav.classList.add('is-solid');
      } else {
        siteNav.classList.remove('is-solid');
      }
    }

    if (mobileStickyCta && heroEl) {
      const heroHeight = heroEl.offsetHeight;
      if (scrollY > heroHeight * 0.5) {
        mobileStickyCta.classList.add('is-visible');
      } else {
        mobileStickyCta.classList.remove('is-visible');
      }
    }

    // B. M4: Signature Dish Sticky Progression (Desktop & Mobile)
    if (signatureSection) {
      const rect = signatureSection.getBoundingClientRect();
      const sectionHeight = signatureSection.offsetHeight - window.innerHeight;
      if (sectionHeight > 0) {
        const scrollProgress = Math.min(1, Math.max(0, -rect.top / sectionHeight));

        let activeStep = 1;
        if (scrollProgress > 0.66) {
          activeStep = 3;
        } else if (scrollProgress > 0.33) {
          activeStep = 2;
        }
        setActiveSignatureStep(activeStep);
      }
    }

    // C. M5: Opposite Moving Image Rows (Desktop & Mobile)
    if (marqueeTop && marqueeBottom) {
      const moveAmount = (scrollY * 0.14) % 600;
      marqueeTop.style.transform = `translateX(${moveAmount}px)`;
      marqueeBottom.style.transform = `translateX(${-moveAmount}px)`;
    }

    // D. M6: Horizontal Pinned Menu Track (Desktop & Mobile)
    if (menuSection && menuTrack) {
      const rect = menuSection.getBoundingClientRect();
      const totalScrollableHeight = menuSection.offsetHeight - window.innerHeight;
      if (totalScrollableHeight > 0) {
        const progress = Math.min(1, Math.max(0, -rect.top / totalScrollableHeight));

        const maxTranslate = menuTrack.scrollWidth - window.innerWidth + (window.innerWidth <= 900 ? 24 : 80);
        const translateX = progress * maxTranslate;

        menuTrack.style.transform = `translateX(${translateX}px)`;

        if (menuProgressFill) {
          menuProgressFill.style.width = `${progress * 100}%`;
        }
      }
    }

    isTicking = false;
  }

  // RequestAnimationFrame scroll listener
  window.addEventListener('scroll', () => {
    if (!isTicking) {
      requestAnimationFrame(onScroll);
      isTicking = true;
    }
  }, { passive: true });

  // Initial trigger
  onScroll();

  // Mobile Horizontal Menu Scroll Tracker
  if (menuTrack && window.innerWidth <= 900) {
    menuTrack.addEventListener('scroll', () => {
      if (menuProgressFill) {
        const maxScroll = menuTrack.scrollWidth - menuTrack.clientWidth;
        const currentScroll = menuTrack.scrollLeft;
        const progress = Math.abs(currentScroll) / maxScroll;
        menuProgressFill.style.width = `${progress * 100}%`;
      }
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     4. M7 & 9.6: 12 SEATS DIAGRAM DATA & INTERACTION
     ------------------------------------------------------------------------ */
  const seatsData = {
    1: { title: "הפינה של הגריל", desc: "הכי קרוב לאש. תרגישו את החום על הפנים כשעומרי הופך את הכתף, ותקבלו את הפירורים החרוכים מתחתית המחבת — לא בתפריט." },
    2: { title: "שני מהאש", desc: "מרחק זרוע מהגחלים, בלי החום הישיר. מכאן רואים את כל ההכנה של הבשר מההתחלה." },
    3: { title: "מול המחבתות", desc: "הכיסא שהצלמים בוחרים. כל הצלייה קורית מול העיניים." },
    4: { title: "קצה הגריל", desc: "עדיין באש, כבר בשקט. טוב לשיחה." },
    5: { title: "תחילת הפאס", desc: "כאן הצלחות מסתדרות לפני שהן יוצאות. תראו את המנה נבנית שכבה־שכבה." },
    6: { title: "מרכז הפאס", desc: "המקום שבו עומרי עומד רוב הערב. אם באתם לדבר עם השף — זה הכיסא." },
    7: { title: "מול הרטבים", desc: "כל ציר וכל שמן עשבים נמרחים כאן. הכיסא הכי ריחני בחדר." },
    8: { title: "סוף הפאס", desc: "נוף מלא למטבח, מעט יותר שקט מ־06." },
    9: { title: "מול הקינוחים", desc: "גלידה מוקצפת בשתי דקות מולכם. הכיסא של מי שבא בגלל הסוף." },
    10: { title: "ליד המחמצת", desc: "תנור הלחם נמצא כאן. הלחם יוצא כל ארבעים דקות ואתם מקבלים ראשונים." },
    11: { title: "הכיסא של החלון", desc: "חצי מהמטבח, חצי מרחוב שבזי. הטוב ביותר לזוגות." },
    12: { title: "הקצה השקט", desc: "הכי רחוק מהאש, הכי קרוב לתריס. בקיץ הוא פתוח." }
  };

  const seatItems = document.querySelectorAll('.seat-item');
  const seatTag = document.getElementById('seatTag');
  const seatTitle = document.getElementById('seatTitle');
  const seatDesc = document.getElementById('seatDesc');
  const preferredSeatInput = document.getElementById('rPreferredSeat');
  const seatChips = document.querySelectorAll('#seatChips .chip');

  function selectSeat(seatNumber) {
    const data = seatsData[seatNumber];
    if (!data) return;

    seatItems.forEach(item => {
      if (parseInt(item.dataset.seat, 10) === seatNumber) {
        item.classList.add('seat-item--active');
      } else {
        item.classList.remove('seat-item--active');
      }
    });

    if (seatTag) seatTag.textContent = `Seat ${seatNumber < 10 ? '0' + seatNumber : seatNumber} / 12`;
    if (seatTitle) seatTitle.textContent = data.title;
    if (seatDesc) seatDesc.textContent = data.desc;

    if (preferredSeatInput) {
      preferredSeatInput.value = data.title;
      seatChips.forEach(chip => {
        if (chip.dataset.seatChoice === data.title) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });
    }
  }

  seatItems.forEach(item => {
    item.addEventListener('click', () => {
      const num = parseInt(item.dataset.seat, 10);
      selectSeat(num);
    });

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const num = parseInt(item.dataset.seat, 10);
        selectSeat(num);
      }
    });
  });

  seatChips.forEach(chip => {
    chip.addEventListener('click', () => {
      seatChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      if (preferredSeatInput) {
        preferredSeatInput.value = chip.dataset.seatChoice;
      }
    });
  });

  /* ------------------------------------------------------------------------
     5. 9.12: RESERVATION FORM VALIDATION & CONFIRMATION
     ------------------------------------------------------------------------ */
  const reserveForm = document.getElementById('reserveForm');
  const formFeedback = document.getElementById('formFeedback');

  if (reserveForm && formFeedback) {
    reserveForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('rName').value.trim();
      const phone = document.getElementById('rPhone').value.trim();
      const date = document.getElementById('rDate').value;
      const shift = document.getElementById('rShift').value;
      const guests = document.getElementById('rGuests').value;

      formFeedback.hidden = false;

      if (!name || !phone || !date) {
        formFeedback.className = 'form-feedback is-error';
        formFeedback.textContent = 'חסרים שם, טלפון או תאריך.';
        return;
      }

      formFeedback.className = 'form-feedback is-success';
      formFeedback.textContent = `הבקשה נשלחה — ${guests} סועדים, ${date} במשמרת ${shift}. נחזור אליכם בוואטסאפ תוך שעה לאישור.`;

      reserveForm.reset();
    });
  }

  /* ------------------------------------------------------------------------
     6. REVEAL MASKS OBSERVER
     ------------------------------------------------------------------------ */
  const revealElements = document.querySelectorAll('.reveal-mask');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }

});
