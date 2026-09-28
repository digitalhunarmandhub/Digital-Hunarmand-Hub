const nav = document.getElementById('nav');
const hbg = document.getElementById('hbg'), nul = document.getElementById('navUl'), nov = document.getElementById('navOverlay');

// Nav scroll shadow & scroll-direction auto-hide/unhide
let lastNavScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
let navScrollTicking = false;

window.addEventListener('scroll', () => {
  const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

  if (nav) {
    nav.classList.toggle('s', currentScrollY > 20);
  }

  if (!navScrollTicking) {
    window.requestAnimationFrame(() => {
      const isMenuOpen = (hbg && hbg.classList.contains('active')) || (nul && nul.classList.contains('open'));

      if (isMenuOpen || currentScrollY <= 25) {
        if (nav) nav.classList.remove('nav-hidden');
        lastNavScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
      } else {
        const diff = currentScrollY - lastNavScrollY;
        if (diff > 6 && currentScrollY > 60) {
          // User scrolling DOWN -> hide navbar
          if (nav) nav.classList.add('nav-hidden');
          lastNavScrollY = currentScrollY;
        } else if (diff < -6) {
          // User scrolling UP -> reveal navbar
          if (nav) nav.classList.remove('nav-hidden');
          lastNavScrollY = currentScrollY;
        }
      }

      navScrollTicking = false;
    });
    navScrollTicking = true;
  }
}, { passive: true });

function openNavMenu(){
  if(!nul||!hbg) return;
  nul.classList.add('open');
  hbg.classList.add('active');
  if(nav) nav.classList.add('menu-open');
  if(nov) nov.classList.add('open');
  hbg.setAttribute('aria-expanded','true');
  document.body.classList.add('nav-open-lock');
}

function closeNavMenu(){
  if(!nul||!hbg) return;
  nul.classList.remove('open');
  hbg.classList.remove('active');
  if(nav) nav.classList.remove('menu-open');
  if(nov) nov.classList.remove('open');
  hbg.setAttribute('aria-expanded','false');
  document.body.classList.remove('nav-open-lock');
}

function toggleNavMenu(e){
  if(e){
    e.preventDefault();
    e.stopPropagation();
  }
  if(nul.classList.contains('open')){
    closeNavMenu();
  } else {
    openNavMenu();
  }
}

if(hbg){
  hbg.addEventListener('click', toggleNavMenu);
}
if(nov){
  nov.addEventListener('click', closeNavMenu);
  nov.addEventListener('touchstart', function(e){
    e.preventDefault();
    closeNavMenu();
  }, {passive:false});
}

nul.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  closeNavMenu();
}));

document.addEventListener('click',e=>{
  if(nul&&nul.classList.contains('open')&&!nul.contains(e.target)&&hbg&&!hbg.contains(e.target)){
    closeNavMenu();
  }
});

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&nul&&nul.classList.contains('open')){
    closeNavMenu();
  }
});
const obs=new IntersectionObserver(e=>{e.forEach(x=>{if(x.isIntersecting)setTimeout(()=>x.target.classList.add('v'),0)})},{threshold:0.08});
document.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach((el,i)=>{el.style.transitionDelay=(i%5)*70+'ms';obs.observe(el);});

/* SCROLL PROGRESS BAR */
const sprog=document.getElementById('scrollProgress');
function updateProgress(){const h=document.documentElement;const sc=h.scrollTop||document.body.scrollTop;const hgt=h.scrollHeight-h.clientHeight;sprog.style.width=(hgt>0?(sc/hgt)*100:0)+'%';}
window.addEventListener('scroll',updateProgress,{passive:true});
updateProgress();

/* PARALLAX GLOW BANNER (skip on mobile/touch for perf) */
const pbBanner=document.querySelector('.photo-banner');
const isTouch=('ontouchstart' in window)||window.innerWidth<768;
if(pbBanner&&!isTouch){
  const glows=pbBanner.querySelectorAll('.pb-glow');
  window.addEventListener('scroll',()=>{
    const r=pbBanner.getBoundingClientRect();
    const offset=(r.top)*0.12;
    glows.forEach((g,i)=>{g.style.transform='translateY('+(offset*(i+1)*0.5)+'px)';});
  },{passive:true});
}

/* HERO TERMINAL TYPEWRITER */
function typeTerminal(el){
  if(!el)return;
  const lines=[
    {t:'prompt',text:'$ hunarmand deploy your-brand.com'},
    {t:'out',text:'Designing UI ...'},
    {t:'out',text:'Building components ...'},
    {t:'okline',text:'✓ Deployed in 1.2s'},
    {t:'prompt',text:'$ '}
  ];
  el.innerHTML='';
  let li=0;
  function nextLine(){
    if(li>=lines.length){el.querySelector('.term-cursor')?.remove();const c=document.createElement('span');c.className='term-cursor';el.lastElementChild.appendChild(c);return;}
    const line=lines[li];
    const div=document.createElement('div');
    div.className='term-line';
    if(line.t==='prompt'){div.innerHTML='<span class="term-prompt"></span>';}
    else if(line.t==='okline'){div.innerHTML='<span class="term-out ok"></span>';}
    else {div.innerHTML='<span class="term-out"></span>';}
    el.appendChild(div);
    const span=div.querySelector('span');
    let ci=0;
    function typeChar(){
      if(ci<=line.text.length){span.textContent=line.text.slice(0,ci);ci++;setTimeout(typeChar,line.t==='prompt'?38:16);}
      else{li++;setTimeout(nextLine,line.t==='prompt'?200:350);}
    }
    typeChar();
  }
  nextLine();
}
const termEls=[document.getElementById('termBody'),document.getElementById('termBodyMobile')];
const termObs=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){typeTerminal(entry.target);termObs.unobserve(entry.target);}
  });
},{threshold:0.3});
termEls.forEach(el=>{if(el)termObs.observe(el);});

/* ANIMATED COUNTERS */
const counters=document.querySelectorAll('.cnt');
const cObs=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const el=entry.target;
      const target=parseFloat(el.dataset.target);
      const suffix=el.dataset.suffix||'';
      const dur=1400;
      const start=performance.now();
      function tick(now){
        const p=Math.min((now-start)/dur,1);
        const eased=1-Math.pow(1-p,3);
        el.textContent=Math.round(target*eased)+suffix;
        if(p<1)requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      cObs.unobserve(el);
    }
  });
},{threshold:0.4});
counters.forEach(el=>cObs.observe(el));

/* TILT EFFECT ON SERVICE CARDS (desktop/mouse only) */
if(!isTouch){
  document.querySelectorAll('.svc-card').forEach(card=>{
    card.classList.add('tilt');
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=e.clientX-r.left,y=e.clientY-r.top;
      const rx=((y/r.height)-0.5)*-8;
      const ry=((x/r.width)-0.5)*8;
      card.style.transform='perspective(700px) rotateX('+rx+'deg) rotateY('+ry+'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave',()=>{card.style.transform='perspective(700px) rotateX(0) rotateY(0) translateY(0)';});
  });
}
/* ── STANDALONE GROUP B ROUTING & ISOLATION ── */
const groupASelectors = ['#home', '.mq', '#services', '.photo-banner', '#top-courses', '#mission', '#why', '#about', '#contact'];
const groupBIds = ['courses', 'all-courses', 'hiring', 'internship', 'mentorship', 'team', 'partnership', 'projects'];
const secs = document.querySelectorAll('section[id]');

/* ── OUR PROJECTS CATEGORY FILTER ── */
(function initProjectFilters(){
  const filterWrap = document.getElementById('projectFilters');
  const grid = document.getElementById('projectsGrid');
  if(!filterWrap || !grid) return;
  const filterBtns = filterWrap.querySelectorAll('.pfilter-btn');
  const cards = grid.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function(){
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const filter = this.dataset.filter || 'all';

      cards.forEach(card => {
        const cat = card.dataset.category || '';
        if(filter === 'all' || cat === filter){
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 180);
        }
      });
    });
  });
})();

/* ── DEDICATED COURSES SEARCH, AUTO-SUGGESTION & CATEGORY FILTER ── */
(function initCourseFiltersAndSearch(){
  const filterWrap = document.getElementById('dcCourseFilters');
  const grid = document.getElementById('dcCoursesGrid');
  const searchInput = document.getElementById('dcCourseSearch');
  const searchClear = document.getElementById('dcSearchClear');
  const suggDropdown = document.getElementById('dcSearchSuggestions');
  const noResults = document.getElementById('dcNoResults');
  if(!filterWrap || !grid) return;

  const filterBtns = filterWrap.querySelectorAll('.dc-filter-btn');
  const cards = grid.querySelectorAll('.dc-card');

  // Extract metadata from cards for fast search & auto-suggestion
  const coursesData = Array.from(cards).map(card => {
    const title = card.querySelector('.dc-card-title')?.innerText.trim() || '';
    const desc = card.querySelector('.dc-card-desc')?.innerText.trim() || '';
    const cat = card.dataset.category || '';
    const topics = Array.from(card.querySelectorAll('.dc-topic-item')).map(t => t.innerText.trim()).join(' ');
    const tag = card.querySelector('.dc-tag-cat')?.innerText.trim() || '';
    return { card, title, desc, cat, topics, tag, searchText: (title + ' ' + desc + ' ' + topics + ' ' + tag).toLowerCase() };
  });

  // ── Course Card Info Toggle (Expand / Collapse) ──
  cards.forEach(card => {
    const title = card.querySelector('.dc-card-title');
    const desc = card.querySelector('.dc-card-desc');
    const topics = card.querySelector('.dc-card-topics');
    if (!desc || !topics) return;

    // Create details drawer wrapper if not present
    let detailsWrap = card.querySelector('.dc-card-details');
    if (!detailsWrap) {
      detailsWrap = document.createElement('div');
      detailsWrap.className = 'dc-card-details';
      desc.parentNode.insertBefore(detailsWrap, desc);
      detailsWrap.appendChild(desc);
      detailsWrap.appendChild(topics);
    }

    // Create View Info toggle button if not present
    let toggleBtn = card.querySelector('.dc-btn-toggle-info');
    if (!toggleBtn) {
      toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'dc-btn-toggle-info';
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.innerHTML = `
        <span class="dc-toggle-text">View Info</span>
        <svg class="dc-toggle-arrow" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
      `;
      if (title && title.parentNode) {
        title.parentNode.insertBefore(toggleBtn, detailsWrap);
      }
    }

    function toggleCardInfo(e) {
      if (e) {
        if (e.target.closest('.dc-card-actions') || e.target.closest('a') || e.target.closest('.dc-card-details')) return;
        e.stopPropagation();
      }
      const isExpanded = card.classList.toggle('is-expanded');
      toggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      const textSpan = toggleBtn.querySelector('.dc-toggle-text');
      if (textSpan) {
        textSpan.textContent = isExpanded ? 'Hide Info' : 'View Info';
      }
    }

    toggleBtn.addEventListener('click', toggleCardInfo);

    // Clicking anywhere on card thumbnail, title, or track org also toggles info
    const thumb = card.querySelector('.dc-card-thumb');
    const org = card.querySelector('.dc-card-org');
    [thumb, title, org].forEach(el => {
      if (el) {
        el.addEventListener('click', toggleCardInfo);
      }
    });
  });

  function updateScrollableState(visibleCount, selectedCat) {
    if (!selectedCat) {
      const activeBtn = filterWrap ? filterWrap.querySelector('.dc-filter-btn.active') : null;
      selectedCat = activeBtn ? (activeBtn.dataset.filter || 'all') : 'all';
    }
    const query = (searchInput ? searchInput.value : '').trim();

    if (selectedCat !== 'all' && !query && visibleCount > 1) {
      grid.classList.add('dc-grid-scrollable');
      grid.classList.remove('dc-grid-vertical');
      grid.scrollLeft = 0;
    } else {
      grid.classList.remove('dc-grid-scrollable');
      grid.classList.add('dc-grid-vertical');
    }
  }

  function applyFilterAndSearch() {
    const activeBtn = filterWrap.querySelector('.dc-filter-btn.active');
    const selectedCat = activeBtn ? (activeBtn.dataset.filter || 'all') : 'all';
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();

    let visibleCount = 0;

    coursesData.forEach(item => {
      const matchCat = (selectedCat === 'all' || item.cat === selectedCat);
      const matchSearch = (!query || item.searchText.includes(query));

      if (matchCat && matchSearch) {
        item.card.style.display = 'flex';
        setTimeout(() => {
          item.card.style.opacity = '1';
          item.card.style.transform = 'translateY(0)';
        }, 20);
        visibleCount++;
      } else {
        item.card.style.opacity = '0';
        item.card.style.transform = 'translateY(12px)';
        setTimeout(() => {
          item.card.style.display = 'none';
        }, 160);
      }
    });

    if (noResults) {
      noResults.style.display = (visibleCount === 0) ? 'block' : 'none';
    }

    updateScrollableState(visibleCount, selectedCat);
  }

  // Filter Buttons Click
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function(){
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      this.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      applyFilterAndSearch();
    });
  });

  // Search Input & Suggestions
  if (searchInput && suggDropdown) {
    function highlightMatch(text, query) {
      if (!query) return text;
      const idx = text.toLowerCase().indexOf(query.toLowerCase());
      if (idx === -1) return text;
      return text.substring(0, idx) + '<mark>' + text.substring(idx, idx + query.length) + '</mark>' + text.substring(idx + query.length);
    }

    function renderSuggestions(query) {
      if (!query) {
        suggDropdown.style.display = 'none';
        suggDropdown.innerHTML = '';
        return;
      }
      const matches = coursesData.filter(item => item.searchText.includes(query));
      if (matches.length === 0) {
        suggDropdown.innerHTML = '<div style="padding:10px 14px;font-size:12.5px;color:#94a3b8;text-align:center">No matching courses found</div>';
        suggDropdown.style.display = 'block';
        return;
      }

      suggDropdown.innerHTML = matches.slice(0, 5).map(item => `
        <div class="dc-suggestion-item" data-title="${item.title.replace(/"/g, '&quot;')}">
          <div class="dc-sugg-left">
            <div class="dc-sugg-icon">🎓</div>
            <div class="dc-sugg-title">${highlightMatch(item.title, query)}</div>
          </div>
          <span class="dc-sugg-cat">${item.tag || 'Program'}</span>
        </div>
      `).join('');
      suggDropdown.style.display = 'block';

      suggDropdown.querySelectorAll('.dc-suggestion-item').forEach(suggEl => {
        suggEl.addEventListener('click', function(){
          const courseTitle = this.dataset.title;
          searchInput.value = courseTitle;
          if (searchClear) searchClear.style.display = 'inline-flex';
          suggDropdown.style.display = 'none';

          filterBtns.forEach(b => b.classList.remove('active'));
          const allBtn = filterWrap.querySelector('[data-filter="all"]');
          if (allBtn) allBtn.classList.add('active');

          applyFilterAndSearch();

          const targetItem = coursesData.find(c => c.title === courseTitle);
          if (targetItem && targetItem.card) {
            targetItem.card.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            targetItem.card.classList.remove('dc-card-highlighted');
            void targetItem.card.offsetWidth;
            targetItem.card.classList.add('dc-card-highlighted');
            setTimeout(() => targetItem.card.classList.remove('dc-card-highlighted'), 2500);
          }
        });
      });
    }

    searchInput.addEventListener('input', function(){
      const q = this.value.trim();
      if (searchClear) searchClear.style.display = q ? 'inline-flex' : 'none';
      renderSuggestions(q.toLowerCase());
      applyFilterAndSearch();
    });

    searchInput.addEventListener('focus', function(){
      const q = this.value.trim();
      if (q) renderSuggestions(q.toLowerCase());
    });

    document.addEventListener('click', function(e){
      if (!searchInput.contains(e.target) && !suggDropdown.contains(e.target)) {
        suggDropdown.style.display = 'none';
      }
    });

    searchInput.addEventListener('keydown', function(e){
      if (e.key === 'Escape') {
        suggDropdown.style.display = 'none';
      }
    });
  }

  if (searchClear && searchInput) {
    searchClear.addEventListener('click', function(){
      searchInput.value = '';
      this.style.display = 'none';
      if (suggDropdown) suggDropdown.style.display = 'none';
      applyFilterAndSearch();
      searchInput.focus();
    });
  }

  const resetBtn = document.getElementById('dcResetSearchBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function(){
      if (searchInput) searchInput.value = '';
      if (searchClear) searchClear.style.display = 'none';
      if (suggDropdown) suggDropdown.style.display = 'none';
      filterBtns.forEach(b => b.classList.remove('active'));
      const allBtn = filterWrap.querySelector('[data-filter="all"]');
      if (allBtn) allBtn.classList.add('active');
      applyFilterAndSearch();
    });
  }

  updateScrollableState(cards.length, 'all');
})();

/* ── COURSE ENROLLMENT MODAL CONTROLLER ── */
(function initEnrollmentModal(){
  const modal = document.getElementById('dcEnrollModal');
  const backdrop = document.getElementById('dcModalBackdrop');
  const closeBtn = document.getElementById('dcModalClose');
  const form = document.getElementById('dcEnrollForm');
  const successBox = document.getElementById('dcEnrollSuccess');
  const succCloseBtn = document.getElementById('succCloseBtn');
  const courseSelect = document.getElementById('enrollCourse');
  if (!modal || !form) return;

  // ── Gamified Interactive Selectors (Batch & Experience) ──
  function setupGamifiedSelector(containerId, hiddenInputId) {
    const container = document.getElementById(containerId);
    const hiddenInput = document.getElementById(hiddenInputId);
    if (!container || !hiddenInput) return;

    const chips = container.querySelectorAll('.dc-game-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        chips.forEach(c => c.classList.remove('is-active'));
        this.classList.add('is-active');
        const val = this.getAttribute('data-val') || '';
        hiddenInput.value = val;
      });
    });
  }

  setupGamifiedSelector('dcBatchSelector', 'enrollBatch');
  setupGamifiedSelector('dcLevelSelector', 'enrollLevel');
  resetGamifiedSelectors();

  function resetGamifiedSelectors() {
    [
      { boxId: 'dcBatchSelector', inputId: 'enrollBatch', defaultVal: 'Evening Batch (8:00 PM - 9:30 PM)' },
      { boxId: 'dcLevelSelector', inputId: 'enrollLevel', defaultVal: 'Beginner (Lvl 1 • Starter)' }
    ].forEach(cfg => {
      const box = document.getElementById(cfg.boxId);
      const input = document.getElementById(cfg.inputId);
      if (!box || !input) return;
      const chips = box.querySelectorAll('.dc-game-chip');
      chips.forEach((c, idx) => {
        if (idx === 0) {
          c.classList.add('is-active');
          input.value = c.getAttribute('data-val') || cfg.defaultVal;
        } else {
          c.classList.remove('is-active');
        }
      });
    });
  }

  function openModal(courseName) {
    // Reset view
    form.style.display = 'block';
    form.reset();
    successBox.style.display = 'none';

    // Clear validation errors
    form.querySelectorAll('.dc-error-msg').forEach(el => el.classList.remove('visible'));
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

    // Reset gamified chips to default active states
    resetGamifiedSelectors();

    // Pre-select course if provided (100% exact & robust matching)
    if (courseName && courseSelect) {
      const cleanNorm = str => (str || '')
        .toLowerCase()
        .replace(/&amp;/g, '&')
        .replace(/[^a-z0-9]/g, '');

      const targetNorm = cleanNorm(courseName);

      // 1. Exact or normalized full match
      let matchOpt = Array.from(courseSelect.options).find(opt => cleanNorm(opt.value) === targetNorm);

      // 2. Substring match fallback
      if (!matchOpt) {
        matchOpt = Array.from(courseSelect.options).find(opt => {
          const optNorm = cleanNorm(opt.value);
          return optNorm.includes(targetNorm) || targetNorm.includes(optNorm);
        });
      }

      // 3. Keyword match fallback (e.g. "graphic", "monetization", "autocad", "networking")
      if (!matchOpt) {
        const words = courseName.toLowerCase().split(/[\s,&/]+/).filter(w => w.length > 3);
        matchOpt = Array.from(courseSelect.options).find(opt => {
          const optVal = opt.value.toLowerCase();
          return words.some(w => optVal.includes(w));
        });
      }

      if (matchOpt) {
        courseSelect.value = matchOpt.value;
      }
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus first input
    const firstInput = form.querySelector('#enrollName');
    if (firstInput) setTimeout(() => firstInput.focus(), 150);
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Attach to all course card enroll buttons
  document.querySelectorAll('.dc-open-enroll').forEach(btn => {
    btn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      const card = this.closest('.dc-card');
      const title = card ? card.querySelector('.dc-card-title')?.innerText.trim() : '';
      openModal(title);
    });
  });

  // Close handlers
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);
  if (succCloseBtn) succCloseBtn.addEventListener('click', closeModal);
  window.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Form Submit Handler
  form.addEventListener('submit', async function(e){
    e.preventDefault();
    let hasError = false;

    const nameInput = document.getElementById('enrollName');
    const waInput = document.getElementById('enrollWhatsapp');
    const emailInput = document.getElementById('enrollEmail');
    const cityInput = document.getElementById('enrollCity');
    const batchInput = document.getElementById('enrollBatch');
    const levelInput = document.getElementById('enrollLevel');
    const notesInput = document.getElementById('enrollNotes');
    const submitBtn = document.getElementById('enrollSubmitBtn');

    const nameErr = document.getElementById('nameError');
    const waErr = document.getElementById('whatsappError');
    const emailErr = document.getElementById('emailError');
    const cityErr = document.getElementById('cityError');

    // Validation
    const nameVal = nameInput ? nameInput.value.trim() : '';
    const waVal = waInput ? waInput.value.trim() : '';
    const emailVal = emailInput ? emailInput.value.trim() : '';
    const cityVal = cityInput ? cityInput.value.trim() : '';
    const courseVal = courseSelect ? courseSelect.value : '';
    const batchVal = batchInput ? batchInput.value : '';
    const levelVal = levelInput ? levelInput.value : '';
    const notesVal = notesInput ? notesInput.value.trim() : '';

    if (!nameVal) {
      nameInput.classList.add('is-invalid');
      if (nameErr) nameErr.classList.add('visible');
      hasError = true;
    } else {
      nameInput.classList.remove('is-invalid');
      if (nameErr) nameErr.classList.remove('visible');
    }

    if (!waVal || waVal.replace(/\D/g, '').length < 8) {
      waInput.classList.add('is-invalid');
      if (waErr) waErr.classList.add('visible');
      hasError = true;
    } else {
      waInput.classList.remove('is-invalid');
      if (waErr) waErr.classList.remove('visible');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      emailInput.classList.add('is-invalid');
      if (emailErr) emailErr.classList.add('visible');
      hasError = true;
    } else {
      emailInput.classList.remove('is-invalid');
      if (emailErr) emailErr.classList.remove('visible');
    }

    if (!cityVal) {
      cityInput.classList.add('is-invalid');
      if (cityErr) cityErr.classList.add('visible');
      hasError = true;
    } else {
      cityInput.classList.remove('is-invalid');
      if (cityErr) cityErr.classList.remove('visible');
    }

    if (hasError) {
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          firstInvalid.focus();
        }, 250);
      }
      return;
    }

    // Generate unique Application ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const appId = 'DH-2026-' + randomNum;

    // Show loading state on button
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Submitting...</span>';
    }

    // Send complete application details directly to website Gmail (digitalhunarmand1@gmail.com)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);
      await fetch('https://formsubmit.co/ajax/digitalhunarmand1@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          "Application ID": appId,
          "Student Name": nameVal,
          "WhatsApp Number": waVal,
          "Email Address": emailVal,
          "City / Location": cityVal,
          "Selected Course Track": courseVal,
          "Batch Timing": batchVal,
          "Current Experience Level": levelVal,
          "Questions or Notes": notesVal || "None",
          "_subject": `New Course Admission: [${appId}] ${courseVal} - ${nameVal}`,
          "_template": "table",
          "_captcha": "false"
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch(err) {
      // Gracefully continue so user flow is never interrupted
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Submit</span>';
    }

    // Save record to localStorage
    const record = {
      appId,
      name: nameVal,
      whatsapp: waVal,
      email: emailVal,
      city: cityVal,
      course: courseVal,
      batch: batchVal,
      level: levelVal,
      notes: notesVal,
      timestamp: new Date().toISOString()
    };
    try {
      const existing = JSON.parse(localStorage.getItem('dh_enrollments') || '[]');
      existing.push(record);
      localStorage.setItem('dh_enrollments', JSON.stringify(existing));
    } catch(err){}

    // Update Success screen
    const succAppId = document.getElementById('succAppId');
    const succName = document.getElementById('succName');
    const succCourse = document.getElementById('succCourse');
    const succBatch = document.getElementById('succBatch');
    const succWaBtn = document.getElementById('succWaBtn');

    if (succAppId) succAppId.textContent = appId;
    if (succName) succName.textContent = nameVal;
    if (succCourse) succCourse.textContent = courseVal;
    if (succBatch) succBatch.textContent = batchVal;

    // Build pre-formatted WhatsApp message for instant 1-click confirmation
    let waMsg = `*Digital Hunarmand - Course Admission Application*\n\n` +
      `*Application ID:* ${appId}\n` +
      `*Student Name:* ${nameVal}\n` +
      `*Course:* ${courseVal}\n` +
      `*WhatsApp:* ${waVal}\n` +
      `*Email:* ${emailVal}\n` +
      `*City:* ${cityVal}\n` +
      `*Batch Timing:* ${batchVal}\n` +
      `*Skill Level:* ${levelVal}`;
    if (notesVal) {
      waMsg += `\n*Questions/Notes:* ${notesVal}`;
    }

    const waUrl = `https://wa.me/923485168409?text=${encodeURIComponent(waMsg)}`;
    if (succWaBtn) succWaBtn.href = waUrl;

    // Switch view to success
    form.style.display = 'none';
    successBox.style.display = 'block';
  });

  // ── Live clear validation error as user fills in field ──
  [
    document.getElementById('enrollName'),
    document.getElementById('enrollWhatsapp'),
    document.getElementById('enrollEmail'),
    document.getElementById('enrollCity')
  ].forEach(inp => {
    if (!inp) return;
    const clearErr = function(){
      if (this.classList.contains('is-invalid')) {
        this.classList.remove('is-invalid');
        const err = this.closest('.dc-form-group')?.querySelector('.dc-error-msg');
        if (err) err.classList.remove('visible');
      }
    };
    inp.addEventListener('input', clearErr);
    inp.addEventListener('change', clearErr);
  });

  // Make openEnrollModal globally available if needed
  window.openCourseEnrollModal = openModal;
})();

function handleGroupRouting() {
  let rawHash = (window.location.hash || '').replace('#', '').toLowerCase();
  if (rawHash === 'all-courses') rawHash = 'courses';

  if (groupBIds.includes(rawHash)) {
    // ── STANDALONE MODE (Only active Group B section + Footer visible) ──
    document.body.classList.add('standalone-mode');
    groupASelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.style.setProperty('display', 'none', 'important');
      });
    });

    document.querySelectorAll('.standalone-section').forEach(sec => {
      if (sec.id === rawHash) {
        sec.classList.add('active-standalone');
        sec.querySelectorAll('.reveal, .reveal-l, .reveal-r').forEach(r => r.classList.add('v'));
      } else {
        sec.classList.remove('active-standalone');
      }
    });

    nul.querySelectorAll('a').forEach(a => {
      a.classList.toggle('on', a.getAttribute('href') === '#' + rawHash);
    });

    window.scrollTo(0, 0);
  } else {
    // ── MAIN WEBSITE FLOW (Group A sections visible in sequence, Group B hidden) ──
    document.body.classList.remove('standalone-mode');
    groupASelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.style.removeProperty('display');
      });
    });

    document.querySelectorAll('.standalone-section').forEach(sec => {
      sec.classList.remove('active-standalone');
    });

    if (rawHash && rawHash !== 'home') {
      const targetEl = document.getElementById(rawHash);
      if (targetEl) {
        setTimeout(() => {
          const navH = nav.offsetHeight || 70;
          const topPos = targetEl.getBoundingClientRect().top + window.pageYOffset - navH;
          window.scrollTo({ top: topPos, behavior: 'smooth' });
        }, 60);
      }
    } else if (rawHash === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

window.addEventListener('hashchange', handleGroupRouting);
window.addEventListener('DOMContentLoaded', handleGroupRouting);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  handleGroupRouting();
}

// Click listener on all hash anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetHash = this.getAttribute('href').replace('#', '').toLowerCase();
    if (!targetHash) return;
    if (window.location.hash.replace('#', '').toLowerCase() === targetHash) {
      handleGroupRouting();
    }
  });
});

window.addEventListener('scroll', () => {
  const rawHash = (window.location.hash || '').replace('#', '').toLowerCase();
  if (groupBIds.includes(rawHash)) {
    const activeLinkHash = rawHash === 'all-courses' ? 'courses' : rawHash;
    nul.querySelectorAll('a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + activeLinkHash));
    return;
  }
  let c = '';
  secs.forEach(s => {
    if (s.offsetParent !== null && window.scrollY >= s.offsetTop - 120) {
      c = s.id;
    }
  });
  if (c === 'top-courses') c = 'home';
  if (c) {
    nul.querySelectorAll('a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + c));
  }
});
const cfab=document.getElementById('cfab'),cwin=document.getElementById('cwin'),chx=document.getElementById('chx'),chClear=document.getElementById('chClear'),cbody=document.getElementById('cbody'),cin=document.getElementById('cin');
const peeker=document.getElementById('aiPeeker');
const btt=document.getElementById('backToTop');
const TUCK_SCROLL_THRESHOLD = 200;
const BTT_SCROLL_THRESHOLD = 320;

function tuckAI() {
  if (!cfab || !peeker) return;
  cfab.classList.add('tucked');
  peeker.classList.add('show');
}

function untuckAI() {
  if (!cfab || !peeker) return;
  cfab.classList.remove('tucked');
  peeker.classList.remove('show');
}

function toggleChat(){
  if (!cwin || !cfab) return;
  const willOpen = !cwin.classList.contains('open');
  if (willOpen) {
    untuckAI();
    cwin.classList.add('open');
    cfab.classList.add('active');
    if(cin) { setTimeout(() => cin.focus(), 150); }
  } else {
    closeChat();
  }
}

function closeChat(){
  if (!cwin || !cfab) return;
  cwin.classList.remove('open');
  cfab.classList.remove('active');
  if (window.scrollY > TUCK_SCROLL_THRESHOLD) {
    tuckAI();
  }
}

let chatHistory = [];
const _chatCache = new Map();

function clearChat(){
  chatHistory = [];
  if(_chatCache) _chatCache.clear();
  cbody.innerHTML = `
    <div class="cm bot"><div class="cb">Hello! I'm <strong>Hunarmand AI</strong>, your digital smart assistant. How can I help you today?</div></div>
    <div class="cqr" id="cqr">
      <button onclick="qr('services')">Our Services</button>
      <button onclick="qr('courses')">Courses</button>
      <button onclick="qr('mission')">Our Mission</button>
      <button onclick="qr('why')">Why Us</button>
      <button onclick="qr('about')">About Us</button>
      <button onclick="qr('contact')">Contact</button>
      <button onclick="qr('hiring')">We're Hiring</button>
      <button onclick="qr('internship')">Internship</button>
      <button onclick="qr('mentorship')">Mentorship</button>
      <button onclick="qr('team')">Our Team</button>
      <button onclick="qr('partnership')">Partners</button>
      <button onclick="qr('projects')">Our Projects</button>
    </div>
  `;
}

cfab.addEventListener('click', function(e){
  e.stopPropagation();
  toggleChat();
});

if (peeker) {
  peeker.addEventListener('click', function(e){
    e.stopPropagation();
    toggleChat();
  });
}

chx.addEventListener('click', function(e){
  e.stopPropagation();
  closeChat();
});

if(chClear) chClear.addEventListener('click', clearChat);

let isSendingMessage = false;
let touchStartedInsideChat = false;

if (cwin) {
  cwin.addEventListener('click', function(e){
    e.stopPropagation();
  });
  cwin.addEventListener('touchstart', function(e){
    e.stopPropagation();
  }, {passive:true});
  cwin.addEventListener('touchend', function(e){
    e.stopPropagation();
  }, {passive:true});
}

document.addEventListener('touchstart', function(e){
  const path = e.composedPath ? e.composedPath() : [];
  touchStartedInsideChat = path.includes(cwin) || path.includes(cfab) || path.includes(peeker) ||
    (cwin && cwin.contains(e.target)) || (cfab && cfab.contains(e.target)) || (peeker && peeker.contains(e.target));
}, {passive:true});

function handleOutsideDismiss(e) {
  if (isSendingMessage) return;

  if (touchStartedInsideChat) {
    touchStartedInsideChat = false;
    return;
  }

  const path = e.composedPath ? e.composedPath() : [];
  const isInsideChat = path.includes(cwin) || (cwin && cwin.contains(e.target));
  const isInsideFab = path.includes(cfab) || (cfab && cfab.contains(e.target));
  const isInsidePeeker = path.includes(peeker) || (peeker && peeker.contains(e.target));

  if (cwin && cwin.classList.contains('open')) {
    if (!isInsideChat && !isInsideFab && !isInsidePeeker) {
      closeChat();
    }
  } else if (cfab && !cfab.classList.contains('tucked')) {
    // If FAB is expanded while scrolled, tapping outside dismisses/tucks it back
    if (window.scrollY > TUCK_SCROLL_THRESHOLD && !isInsideFab && !isInsidePeeker) {
      tuckAI();
    }
  }
}

document.addEventListener('click', handleOutsideDismiss);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && cwin.classList.contains('open')) {
    closeChat();
  }
});

/* ── BACK TO TOP & SMART AI SCROLL TUCK CONTROLLER ── */
(function(){
  if (!btt) return;

  function onScroll(){
    const y = window.scrollY;

    // 1. Back to Top Button visibility
    if (y > BTT_SCROLL_THRESHOLD) {
      btt.classList.add('show');
    } else {
      btt.classList.remove('show');
    }

    // 2. If chat window is open, keep it expanded
    if (cwin && cwin.classList.contains('open')) {
      untuckAI();
      return;
    }

    // 3. Near top of page: show normal round FAB
    if (y <= TUCK_SCROLL_THRESHOLD) {
      untuckAI();
      return;
    }

    // 4. In deeper page scroll: tuck AI into side peeker
    tuckAI();
  }

  // Back to Top click: Smooth scroll to top
  btt.addEventListener('click', function(){
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Passive RAF scroll listener
  let ticking = false;
  window.addEventListener('scroll', function(){
    if (!ticking) {
      requestAnimationFrame(function(){
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, {passive: true});

  // Initial call on page load
  onScroll();
})();

const GEMINI_API_KEY = 'AIzaSyCXfAJVpGDldTXLQepSZNkk3rzGmbSpekA';

const HUNARMAND_SYSTEM_INSTRUCTION = `You are "Hunarmand AI", the official intelligent AI career counselor and representative of "Digital Hunarmand Hub" (Swat, KPK, Pakistan).

==================== DIGITAL HUNARMAND HUB COMPLETE KNOWLEDGE BASE ====================

1. ORGANIZATION OVERVIEW:
- Name: Digital Hunarmand Hub (Digital Solution Hub)
- Taglines: "Learn, Grow and Earn" | "Digital Solutions That Grow Your Business" | "Learn — Create — Earn"
- Location: Fizagat, Mingora, Swat, Khyber Pakhtunkhwa (KPK), Pakistan. (We provide services and online training across Pakistan & worldwide).
- Mission: Empower Pakistan's youth and businesses with cutting-edge digital skills, AI tools, and remote freelancing careers.

2. LEADERSHIP & TEAM:
- Nidal Munir: Founder & CEO
- Geeto Shakeel: Co-Founder & Director
- Adil Rahman: Chief Technology & Creative Officer (AI / ML Engineer & Full-Stack Builder)
- Sayed Muhammad Arif Khan: Team Leader
- Muhammad Rizwan: Administrator
- Strategic Partner: Nojawan Awaz Foundation (President: Muhammad Islam)

3. 12 PROFESSIONAL DIGITAL SERVICES:
1. Website Design & Development (Custom responsive websites, MERN stack, WordPress, AI web apps)
2. Mobile App Development (iOS & Android apps, Flutter, React Native)
3. Graphic Design (Logos, banners, social media posts, brand identities)
4. UI/UX Design (Figma wireframes, UX research, high-fidelity prototypes)
5. Social Media Management (Content strategy, page handling, audience growth)
6. Video Editing & Motion Graphics (Reels, TikToks, YouTube long-form, ads)
7. Branding & Corporate Identity (Brand guidelines, stationery, visual systems)
8. Digital Marketing & SEO (Google ranking, Meta Ads, Google Ads, lead generation)
9. MS Office & Data Entry (Advanced Excel, spreadsheets, business documentation)
10. Website With AI (AI chatbots, workflow automations, custom AI integrations)
11. Python Data Analysis (Data science, analytics dashboards, automation scripts)
12. Amazon E-Commerce (FBA account management, product hunting, listing optimization)

4. COURSES (ADMISSIONS OPEN - BATCH 2026):
- Course 1: Professional Graphic Design (Design theory, Photoshop, Illustrator, Canva, client portfolio)
- Course 2: Digital Marketing & SEO (Meta Ads, Google Ads, SEO, client hunting, freelancing)
- Features: Live Google Meet interactive classes, real client projects, 3-Month Hands-on Internship included, verified Certificate.
- Course Registration Google Form: https://docs.google.com/forms/d/e/1FAIpQLSc_lNFmcS41MbQ1KkLuHW6YzI9menzCMv8iIj_dDWR-BKz7vg/viewform

5. PROGRAMS & OPPORTUNITIES:
- 3-Month Professional Internship Program 2026: Work on live real-world projects, build your portfolio, receive an official verified completion certificate. (Apply via WhatsApp: https://wa.me/923485168409)
- 1-on-1 Mentorship Program: Personalized career coaching with senior mentors, portfolio review, Upwork & Fiverr international client conversion secrets. (Book via WhatsApp: https://wa.me/923485168409)
- Hiring: We are hiring for Facebook Page Admin, WhatsApp Community Admin, Group Admin roles. (Apply via WhatsApp: https://wa.me/923485168409)

6. FEES & PAYMENT:
- Extremely affordable and student-friendly pricing with easy monthly installment options.
- Payment methods: EasyPaisa, JazzCash, and Bank Transfer.
- For fee details and discounts, users can message the admissions desk on WhatsApp.

7. OFFICIAL CONTACTS:
- WhatsApp / Phone: +92 348 5168409
- Email: digitalhunarmand1@gmail.com
- Response Time: Guaranteed reply within 60 minutes.

==================== CONVERSATIONAL & BEHAVIORAL RULES ====================
- LANGUAGE: Match the user's language. If the user speaks Roman Urdu / Urdu (e.g. "kaisai hon", "kia hal chaal", "konsa course best hai", "fees kitni hai"), reply in natural, polite, warm Roman Urdu. If the user writes in English, reply in clear, professional English.
- GREETINGS: If user says "hi", "hello", "salam", "kaisai hon", "kia hal chaal", greet them back warmly and ask how you can help them today. Do not repeat the same static introductory text every time.
- CONCISE & STRUCTURED: Keep answers crisp, helpful, and formatted with bullet points and bold highlights.
- LINKS: Whenever relevant, provide direct clickable markdown links like [Apply on WhatsApp](https://wa.me/923485168409) or [Register for Course](https://docs.google.com/forms/d/e/1FAIpQLSc_lNFmcS41MbQ1KkLuHW6YzI9menzCMv8iIj_dDWR-BKz7vg/viewform).`;

function formatMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;">$1</code>')
    .replace(/\[(.*?)\]\((https?:\/\/[^\s]+)\)/g, '<a href="$2" target="_blank" class="c-action-btn">$1 ↗</a>')
    .replace(/(\+92\s*348\s*5168409)/g, '<a href="https://wa.me/923485168409" target="_blank" class="c-action-btn">$1 ↗</a>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

function ab(h){
  const d=document.createElement('div');
  d.className='cm bot';
  d.innerHTML='<div class="cb">'+formatMarkdown(h)+'</div>';
  cbody.appendChild(d);
  cbody.scrollTop=cbody.scrollHeight;
}

function au(t){
  const d=document.createElement('div');
  d.className='cm usr';
  d.innerHTML='<div class="cb">'+t.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div>';
  cbody.appendChild(d);
  cbody.scrollTop=cbody.scrollHeight;
}

function showTypingIndicator() {
  hideTypingIndicator();
  const d=document.createElement('div');
  d.className='cm bot';
  d.id='cTyping';
  d.innerHTML='<div class="cb c-typing"><span></span><span></span><span></span></div>';
  cbody.appendChild(d);
  cbody.scrollTop=cbody.scrollHeight;
}

function hideTypingIndicator() {
  const d=document.getElementById('cTyping');
  if(d) d.remove();
}

function isEnglishInput(text) {
  const t = text.toLowerCase().trim();
  const urduPatterns = [
    /\b(kese|kaise|kaisai|kesay|kasay|kesi|kaisey)\b/,
    /\b(hon|hoon|hun|hn|ho|hu|hain|hai|hay)\b/,
    /\b(hal|haal|chal|chaal|ahwal)\b/,
    /\b(kya|kia|kiya|kuch|kch)\b/,
    /\b(konsa|konsi|konse|kon|koun)\b/,
    /\b(mujhe|mjhe|mjy|mujy|hume|humain|humen|hum|hm)\b/,
    /\b(karna|krna|seekhna|sekhna|chahiye|chaiye|chahye|chy)\b/,
    /\b(batao|btao|bataen|btaen|bataiye|btaiye|btaye)\b/,
    /\b(shukriya|shukria|meherbani|salam|slaam|assalam|walikum|walaikum)\b/,
    /\b(kahan|khan|kidhar|kdhr|kab|kb)\b/,
    /\b(kitni|kitna|kitne|ktna|ktni|ktne|paise|pesay|rupaye)\b/,
    /\b(hoga|hogi|honge|hoge)\b/,
    /\b(karo|kro|karein|krain|kren)\b/,
    /\b(ap|aap|tum|tm|tumhe|tmhe|apko|aapko)\b/,
    /\b(bhi|bh|mein|main|me|mn|nhi|nahi|nh|ni|na)\b/,
    /\b(ye|yeh|yh|wo|woh|acha|achha|theek|thik|thk|bhai|bhae|rabta|raabta)\b/,
    /\b(mera|meri|mere|mre|tera|teri|tere|tre|sunao|suno)\b/
  ];

  for (const regex of urduPatterns) {
    if (regex.test(t)) {
      return false; 
    }
  }

  return true; 
}

async function sendToGemini(userText) {
  showTypingIndicator();
  const isEng = isEnglishInput(userText);
  const cacheKey = userText.trim().toLowerCase();

  // Instant Cache for identical repeat questions
  if (_chatCache.has(cacheKey)) {
    setTimeout(() => {
      hideTypingIndicator();
      const cachedReply = _chatCache.get(cacheKey);
      chatHistory.push({ role: 'user', parts: [{ text: userText }] });
      chatHistory.push({ role: 'model', parts: [{ text: cachedReply }] });
      ab(cachedReply);
    }, 120);
    return;
  }

  // Ensure alternating history for LLMs
  const historyForGemini = [];
  let lastRole = null;
  for (const item of chatHistory) {
    if (item.role !== lastRole && item.parts && item.parts[0] && item.parts[0].text) {
      historyForGemini.push(item);
      lastRole = item.role;
    }
  }
  if (lastRole === 'user') historyForGemini.pop();
  historyForGemini.push({ role: 'user', parts: [{ text: userText }] });
  chatHistory = historyForGemini.slice(-10);

  const langInstruction = isEng
    ? "The user is communicating in English. Reply ONLY in fluent, professional, and friendly English."
    : "The user is communicating in Roman Urdu / Urdu (e.g. 'kaisai hon', 'kese ho', 'kia hal chaal', 'kya scene hai'). You MUST reply in warm, natural, and polite Roman Urdu.";

  let completed = false;
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    if (!completed) {
      completed = true;
      abortController.abort();
      hideTypingIndicator();
      smartFallback(userText, isEng);
    }
  }, 9000);

  // ── PROVIDER 1: Google Gemini API ──
  const geminiModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
  for (const model of geminiModels) {
    if (completed) break;
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const payload = {
        systemInstruction: {
          parts: [{ text: HUNARMAND_SYSTEM_INSTRUCTION + `\n\nLANGUAGE DIRECTIVE: ${langInstruction}` }]
        },
        contents: chatHistory,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 650,
          topP: 0.95
        }
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: abortController.signal
      });

      if (res.ok && !completed) {
        const data = await res.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
          completed = true;
          clearTimeout(timeoutId);
          hideTypingIndicator();
          const reply = data.candidates[0].content.parts[0].text;
          _chatCache.set(cacheKey, reply);
          chatHistory.push({ role: 'model', parts: [{ text: reply }] });
          ab(reply);
          return;
        }
      }
    } catch (e) {
      // Continue to next provider
    }
  }

  // ── PROVIDER 2: Live Neural AI Proxy (Pollinations Open Engine - 100% Reliable & Fast) ──
  if (!completed) {
    try {
      const promptMessages = [
        { role: 'system', content: HUNARMAND_SYSTEM_INSTRUCTION + `\n\nLANGUAGE DIRECTIVE: ${langInstruction}` }
      ];
      for (const h of chatHistory) {
        promptMessages.push({
          role: h.role === 'model' ? 'assistant' : 'user',
          content: h.parts[0].text
        });
      }

      const pollRes = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: promptMessages,
          model: 'openai',
          seed: Math.floor(Math.random() * 1000000)
        }),
        signal: abortController.signal
      });

      if (pollRes.ok && !completed) {
        const pollText = await pollRes.text();
        if (pollText && pollText.trim().length > 0 && !pollText.includes('<!DOCTYPE')) {
          completed = true;
          clearTimeout(timeoutId);
          hideTypingIndicator();
          _chatCache.set(cacheKey, pollText);
          chatHistory.push({ role: 'model', parts: [{ text: pollText }] });
          ab(pollText);
          return;
        }
      }
    } catch (err) {
      // Continue to offline fallback
    }
  }

  // ── PROVIDER 3: Dynamic Smart Fallback (Offline fallback) ──
  if (!completed) {
    completed = true;
    clearTimeout(timeoutId);
    hideTypingIndicator();
    smartFallback(userText, isEng);
  }
}

function smartFallback(t, isEng) {
  const l = t.toLowerCase().trim();
  let r = '';
  
  if (l.match(/how are you|how r u|how do you do/)) {
    r = "Hello! I am doing fantastic, thank you for asking! 😊\n\nHow is your day going? How can I assist you with Digital Hunarmand Hub's programs or services today?";
  }
  else if (l.match(/kese ho|kaise ho|kaisai|kesay|kya hal|kia hal|kese h|haal kaisa|kia chal rha/)) {
    const urduGreetings = [
      "Alhamdulillah! Main bilkul theek-thaak hoon, aap sunayein aap ka kya haal hai? 😊\n\nDigital Hunarmand Hub mein main aap ki kis skill ya career ke hawalay se madad kar sakta hoon?",
      "Walaikum Assalam! Main theek hoon, poochne ka bohot shukriya! ✨\n\nAap batayein, aaj kis course ya service ke baray mein information chahiye?",
      "Bilkul first class! 😊 Main aapki guidance ke liye 24/7 tayyar hoon. Aap hamare Online Courses, 3-Month Internship ya Digital Services ke baray mein jo chahein pooch sakte hain!"
    ];
    r = urduGreetings[Math.floor(Math.random() * urduGreetings.length)];
  }
  else if (l.match(/^(salam|assalam|slaam|aslam|aoa|walikum|walaikum)/)) {
    r = "Walaikum Assalam! 👋 **Digital Hunarmand Hub** mein khush-aamdeed!\n\nMain **Hunarmand AI** hoon, aapka smart career consultant. Aaj main aap ki kya madad kar sakta hoon? Aap hamare **Courses**, **3-Month Internship**, **12 Digital Services** ya **1-on-1 Mentorship** ke baray mein pooch sakte hain!";
  }
  else if (l.match(/^(hi|hello|hey|hie|helo|hola|howdy)\b/)) {
    r = isEng
      ? "Hello! 👋 Welcome to **Digital Hunarmand Hub**!\n\nI am **Hunarmand AI**, your smart digital career counselor. What would you like to explore today — **Online Courses**, **3-Month Internship**, or our **Digital Services**?"
      : "Hello! 👋 **Digital Hunarmand Hub** mein khush-aamdeed!\n\nMain **Hunarmand AI** hoon. Aaj main aap ki kya madad kar sakta hoon? Aap hamare **Online Courses**, **Internship Program**, ya **Digital Agency Services** ke baray mein pooch sakte hain!";
  }
  else if (l.match(/purpose|mission|vision|goal|goals|aim|aims|objective|about|what is digital hunarmand|what do you do|why digital hunarmand|maqsad/)) {
    r = isEng
      ? "🎯 **Digital Hunarmand Hub Vision & Mission:**\n\n• **Vision:** Building a future-ready digital ecosystem across Pakistan empowering youth with AI, Web, Design & Marketing skills.\n• **Mission:** Bridging academic education with high-income global remote careers via practical live training & certified internships.\n\n[Connect on WhatsApp](https://wa.me/923485168409)"
      : "🎯 **Digital Hunarmand Hub ka Maqsad (Vision & Mission):**\n\n• **Hamara Vision:** Pakistan ke naujawano ko modern digital skills (AI, Web, Design, Marketing) se aagay barhana.\n• **Hamara Mission:** Practical live training aur verified internships ke zariye youth ko independent aur earning-ready banana.\n\n[WhatsApp par Rabta Karein](https://wa.me/923485168409)";
  }
  else if (l.match(/who are you|what are you|ap kon ho|aap kaun ho|your name|naam kya hai/)) {
    r = isEng
      ? "I am **Hunarmand AI**, the official intelligent digital assistant and career counselor for **Digital Hunarmand Hub**! I am here 24/7 to guide you through courses, internships, project inquiries, and career roadmaps."
      : "Main **Hunarmand AI** hoon, **Digital Hunarmand Hub** ka official smart assistant! Main 24/7 hazir hoon aapko courses, internships, digital services aur freelancing mein guide karne ke liye.";
  }
  else if (l.match(/which course|konsa course|suggest|recommend|beginner|kya seekhu|kya karu|best course/)) {
    r = isEng
      ? "Here is how to choose the best track for you:\n\n🎨 **Graphic Design:** Perfect if you love visual creativity, branding, UI, and logo design (High demand on Fiverr/Upwork).\n📈 **Digital Marketing & SEO:** Master Facebook/Google Ads, SEO, and client acquisition for business growth.\n\n💡 *Both courses include Live Google Meet classes, 3-Month Internship, and verified certificate!*\n\n[Register for Course](https://docs.google.com/forms/d/e/1FAIpQLSc_lNFmcS41MbQ1KkLuHW6YzI9menzCMv8iIj_dDWR-BKz7vg/viewform)"
      : "Aap apne shoq ke mutabiq best course chun sakte hain:\n\n🎨 **Graphic Design:** Agar aap visual creativity, logos aur branding seekhna chahte hain.\n📈 **Digital Marketing & SEO:** Agar aap online ads, SEO aur client acquisition seekhna chahte hain.\n\n💡 *Dono courses mein Live Google Meet classes, 3-Month Internship aur certificate shamil hai!*\n\n[Course Form Fill Karein](https://docs.google.com/forms/d/e/1FAIpQLSc_lNFmcS41MbQ1KkLuHW6YzI9menzCMv8iIj_dDWR-BKz7vg/viewform)";
  }
  else if (l.match(/fee|fees|cost|price|pricing|kitne paise|kitni fees|charges|rate|payment|easypaisa|jazzcash|installment/)) {
    r = isEng
      ? "Our courses and internship programs are offered at highly affordable, student-friendly rates with easy installment options!\n\nFor exact fee breakdown, discount vouchers, and EasyPaisa/JazzCash details, contact our admissions desk:\n\n[Get Fee Structure on WhatsApp](https://wa.me/923485168409?text=Hi%2C%20please%20share%20the%20fee%20structure%20and%20payment%20details)"
      : "Hamare tamam courses bohot affordable aur student-friendly fees par dastiyab hain sath mein aasan installment sahulat bhi mojood hai!\n\nEasyPaisa, JazzCash ya Bank payment details aur discounts ke liye WhatsApp par admission desk se rabta karein:\n\n[WhatsApp par Fee Maloom Karein](https://wa.me/923485168409?text=Hi%2C%20please%20share%20the%20fee%20structure%20and%20payment%20details)";
  }
  else if (l.match(/course|class|admission|graphic design|digital marketing|classes|timing|duration|syllabus/)) {
    r = isEng
      ? "Admissions are currently **OPEN** for Batch 2026:\n\n1. **Graphic Design** (Theory, Practical Tools, Real Projects, Portfolio)\n2. **Digital Marketing & SEO** (SMM, Meta/Google Ads, SEO & Freelancing)\n\n✓ Live Google Meet Classes\n✓ 3-Month Hands-on Internship Included\n✓ Official Verified Certificate\n\n[Explore Dedicated Courses Page](#courses)\n[Register for Course](https://docs.google.com/forms/d/e/1FAIpQLSc_lNFmcS41MbQ1KkLuHW6YzI9menzCMv8iIj_dDWR-BKz7vg/viewform)"
      : "Hamare **2 Online Courses** ke admissions open hain:\n\n1. **Graphic Design** (Fundamentals, Hands-on practice, Real client projects, Portfolio)\n2. **Digital Marketing & SEO** (SMM, Ads campaigns, SEO, Freelancing roadmap)\n\n✓ Live Google Meet Classes\n✓ 3-Month Internship Shamil Hai\n✓ Verified Certificate\n\n[Mukammal Courses Section Dekhein](#courses)\n[Google Form par Apply Karein](https://docs.google.com/forms/d/e/1FAIpQLSc_lNFmcS41MbQ1KkLuHW6YzI9menzCMv8iIj_dDWR-BKz7vg/viewform)";
  }
  else if (l.match(/intern|internship|experience|training/)) {
    r = isEng
      ? "Our **3-Month Professional Internship Program 2026** helps learners build a solid career:\n\n✓ Real Client Live Projects\n✓ Professional Mentorship & Feedback\n✓ Strong Freelancing Portfolio\n✓ Verified Completion Certificate\n\n[Apply for Internship](https://wa.me/923485168409?text=Hi%2C%20I%20want%20to%20apply%20for%20the%203-Month%20Internship%20Program)"
      : "Hamara **3-Month Professional Internship Program 2026** students aur freshers ke liye practical career stepping stone hai:\n\n✓ Real client live projects par practical kaam\n✓ Professional portfolio aur CV building\n✓ Verified Internship Certificate\n✓ Mentorship & guidance\n\n[WhatsApp par Internship Apply Karein](https://wa.me/923485168409?text=Hi%2C%20I%20want%20to%20apply%20for%20the%203-Month%20Internship%20Program)";
  }
  else if (l.match(/mentor|mentorship|1-on-1|consultation|career guidance/)) {
    r = isEng
      ? "Accelerate your career with our **1-on-1 Mentorship Program**:\n\n✓ 1-on-1 personalized live coaching\n✓ Portfolio & Resume audit\n✓ Upwork & Fiverr client closing secrets\n\n[Book 1-on-1 Mentorship](https://wa.me/923485168409?text=Hi%2C%20I%20want%20to%20book%20a%201-on-1%20Mentorship%20Session)"
      : "Hamare **1-on-1 Mentorship Program** mein direct industry leader se one-on-one consultation milti hai:\n\n✓ Portfolio aur Resume review\n✓ Upwork aur Fiverr par international clients lene ka roadmap\n\n[Mentorship Session Book Karein](https://wa.me/923485168409?text=Hi%2C%20I%20want%20to%20book%20a%201-on-1%20Mentorship%20Session)";
  }
  else if (l.match(/service|services|website|app|development|ui|ux|seo|marketing|video|ecommerce|amazon|python|data|client/)) {
    r = isEng
      ? "We provide **12 Top-Tier Digital Solutions**:\n\n• **Web & App:** Custom Websites, Mobile Apps, AI Web Apps\n• **Design & Media:** UI/UX Design, Graphic Design, Video Editing\n• **Growth:** Digital Marketing, SEO, Social Media Ads\n• **Tech & Data:** Python Data Analytics, Amazon E-Commerce\n\n[Discuss Your Project on WhatsApp](https://wa.me/923485168409?text=Hi%2C%20I%20want%20to%20discuss%20a%20project%20for%20my%20business)"
      : "Hum businesses aur startups ke liye **12 Professional Services** provide karte hain:\n\n• **Web & App:** Custom Websites, Mobile Apps, AI Web Apps\n• **Design & Video:** UI/UX Design, Graphic Design, Video Editing\n• **Marketing & Growth:** Digital Marketing, SEO, Social Media Ads\n• **Tech:** Python Data Analysis, Amazon E-Commerce\n\n[WhatsApp par Project Discuss Karein](https://wa.me/923485168409?text=Hi%2C%20I%20want%20to%20discuss%20a%20project%20for%20my%20business)";
  }
  else if (l.match(/location|where|address|office|city|kahan|swat|mingora|kpk/)) {
    r = isEng
      ? "📍 **Location & Reach:**\n\nDigital Hunarmand Hub operates from **Swat, KPK, Pakistan (Fizagat, Mingora)** while providing live online training and digital agency services globally!\n\n[Chat on WhatsApp](https://wa.me/923485168409)"
      : "📍 **Hamari Location:**\n\nDigital Hunarmand Hub **Fizagat, Mingora, Swat (KPK, Pakistan)** mein waqia hai, aur hum poori dunya ke students aur clients ko live online services aur training provide karte hain!\n\n[WhatsApp par Rabta Karein](https://wa.me/923485168409)";
  }
  else if (l.match(/team|leadership|founder|ceo|director|cto|ctco|nidal|geeto|adil|arif|rizwan|owner/)) {
    r = isEng
      ? "Digital Hunarmand Hub leadership team:\n\n• **Nidal Munir** — Founder & CEO\n• **Geeto Shakeel** — Co-Founder & Director\n• **Adil Rahman** — Chief Technology & Creative Officer\n• **Sayed Muhammad Arif Khan** — Team Leader\n• **Muhammad Rizwan** — Administrator\n\n[Contact Leadership](https://wa.me/923485168409)"
      : "Digital Hunarmand Hub ki leadership team:\n\n• **Nidal Munir** — Founder & CEO\n• **Geeto Shakeel** — Co-Founder & Director\n• **Adil Rahman** — Chief Technology & Creative Officer\n• **Sayed Muhammad Arif Khan** — Team Leader\n• **Muhammad Rizwan** — Administrator\n\n[Leadership se Rabta Karein](https://wa.me/923485168409)";
  }
  else if (l.match(/hire|hiring|job|jobs|vacancy|admin|apply for job/)) {
    r = isEng
      ? "We are currently hiring for **Admin Roles**:\n• Facebook Page Admin\n• WhatsApp Community Admin\n• WhatsApp Group Admin\n• WhatsApp Channel Admin\n\n[Apply for Admin Role](https://wa.me/923485168409?text=Hi%2C%20I%20want%20to%20apply%20for%20an%20Admin%20position)"
      : "Hum **Admin Positions** ke liye hiring kar rahe hain:\n• Facebook Page Admin\n• WhatsApp Community Admin\n• WhatsApp Group Admin\n• WhatsApp Channel Admin\n\n[Job ke liye Apply Karein](https://wa.me/923485168409?text=Hi%2C%20I%20want%20to%20apply%20for%20an%20Admin%20position)";
  }
  else if (l.match(/contact|phone|whatsapp|email|number|call|rabta/)) {
    r = isEng
      ? "Connect with Digital Hunarmand Hub directly:\n\n📞 **WhatsApp / Phone:** +92 348 5168409\n📧 **Email:** digitalhunarmand1@gmail.com\n⚡ **Guaranteed Reply:** Within 60 minutes!\n\n[Chat on WhatsApp Now](https://wa.me/923485168409)"
      : "Direct rabtay ki details:\n\n📞 **WhatsApp / Phone:** +92 348 5168409\n📧 **Email:** digitalhunarmand1@gmail.com\n⚡ **Response Time:** 1 ghantay ke andar pakka jawab!\n\n[WhatsApp par Direct Rabta](https://wa.me/923485168409)";
  }
  else if (l.match(/project|projects|portfolio|case study|case studies/)) {
    r = isEng
      ? "🚀 **Digital Hunarmand Featured Projects & Portfolio:**\n\n• **Nexora AI:** Multi-model autonomous market intelligence & quantitative trading bot\n• **ApexFlow:** Cloud agency CRM & workflow automation platform\n• **Hunarmand Portal:** Next-gen LMS with QR-verified digital certificates\n• **ZenPulse:** Cross-platform AI wellness & micro-habit analytics mobile app\n• **Lumina Studio:** Luxury brand identity, typography & 3D packaging\n• **TrendVibe:** Automated multi-vendor e-commerce & Amazon FBA launch\n\n[Explore Our Projects Section](#projects)\n[Discuss Your Project on WhatsApp](https://wa.me/923485168409)"
      : "🚀 **Digital Hunarmand Featured Projects aur Portfolio:**\n\n• **Nexora AI:** Autonomous market intelligence aur quantitative algorithmic trading bot\n• **ApexFlow:** Modern agency CRM aur workflow automation suite\n• **Hunarmand Portal:** Online LMS platform aur verified QR certificates\n• **ZenPulse:** Cross-platform AI wellness mobile app (iOS & Android)\n• **Lumina Studio:** Complete brand identity aur 3D packaging design\n• **TrendVibe:** Automated multi-vendor E-commerce aur Amazon FBA store\n\n[Hamare Projects Dekhein](#projects)\n[WhatsApp par Project Discuss Karein](https://wa.me/923485168409)";
  }
  else if (l.match(/partner|partners|partnership|ogiss|skyn|jamia|nojawan/)) {
    r = isEng
      ? "🤝 **Our Strategic Alliance & Partners:**\n\n• **Nojawan Awaz Foundation:** Youth Empowerment & Community Welfare\n• **OGISS:** Olive Green International Schools System\n• **SKYN Digital:** The Digital Pro & Creative Media Partner\n• **Jamia Islamia Tafheem-ul-Quran:** Community & Islamic Education (Korthi Matiari, Sindh)\n\n[Explore Partnership Section](#partnership)\n[Partner with Us on WhatsApp](https://wa.me/923485168409?text=Hi%2C%20we%20want%20to%20partner%20with%20Digital%20Hunarmand)"
      : "🤝 **Hamare Strategic Partners aur Alliances:**\n\n• **Nojawan Awaz Foundation:** Youth Empowerment aur Samajee Khidmat\n• **OGISS:** Olive Green International Schools System\n• **SKYN Digital:** The Digital Pro aur Creative Media Partner\n• **Jamia Islamia Tafheem-ul-Quran:** Islamic aur Community Education (Korthi Matiari, Sindh)\n\n[Partnership Section Dekhein](#partnership)\n[WhatsApp par Rabta Karein](https://wa.me/923485168409?text=Hi%2C%20we%20want%20to%20partner%20with%20Digital%20Hunarmand)";
  }
  else {
    r = isEng
      ? "I'm here to help you with everything at Digital Hunarmand Hub! You can ask me about:\n• **Purpose & Mission** of Digital Hunarmand\n• **Our Featured Projects & Portfolio**\n• **12 Professional Services** (Web, App, SEO, AI, Design)\n• **Online Courses** (Graphic Design & Digital Marketing)\n• **3-Month Internship Program 2026**\n• **1-on-1 Mentorship & Career Guidance**\n\n[Chat on WhatsApp: +92 348 5168409](https://wa.me/923485168409)"
      : "Main Digital Hunarmand Hub par aapki mukammal rehnumai ke liye hazir hoon! Aap mujh se pooch sakte hain:\n• **Digital Hunarmand ka Maqsad aur Vision**\n• **Hamare Featured Projects aur Portfolio**\n• **12 Digital Services** (Web, App, Design, SEO, Video)\n• **Live Online Courses** (Graphic Design aur Digital Marketing)\n• **3-Month Internship Program 2026**\n• **1-on-1 Career Mentorship**\n\n[WhatsApp par Rabta: +92 348 5168409](https://wa.me/923485168409)";
  }
  
  _chatCache.set(l, r);
  ab(r);
}

function qr(k, e){
  if (e && e.preventDefault) e.preventDefault();
  if (e && e.stopPropagation) e.stopPropagation();
  isSendingMessage = true;
  const queries = {
    services: 'Tell me about all your 12 services',
    courses: 'Which online courses are open for admission right now?',
    mission: 'What is your Vision, Mission & Contribution?',
    why: 'Why should I choose Digital Hunarmand?',
    about: 'Tell me about Digital Hunarmand Hub',
    contact: 'How can I contact Digital Hunarmand?',
    hiring: 'What admin positions are you hiring for?',
    internship: 'Tell me about the 3-Month Internship Program 2026',
    mentorship: 'How does the 1-on-1 Mentorship Program work?',
    team: 'Who are your team members and leadership?',
    partnership: 'Who are your strategic partners?',
    projects: 'Show me your featured projects and portfolio'
  };
  const q = document.getElementById('cqr');
  if(q) q.remove();
  const text = queries[k] || k;
  au(text);
  sendToGemini(text);
  setTimeout(() => { isSendingMessage = false; }, 800);
}

function sc(e){
  if (e && e.preventDefault) e.preventDefault();
  if (e && e.stopPropagation) e.stopPropagation();
  isSendingMessage = true;
  const t = cin.value.trim();
  if(!t) {
    isSendingMessage = false;
    return;
  }
  cin.value = '';
  const q = document.getElementById('cqr');
  if(q) q.remove();
  au(t);
  sendToGemini(t);
  setTimeout(() => { isSendingMessage = false; }, 800);
}

cin.addEventListener('keydown', e => {
  if(e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation();
    sc(e);
  }
});
