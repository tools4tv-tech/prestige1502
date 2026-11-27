
(() => {
  'use strict';

  // ==========================================
  // 1. DOM ELEMENTS
  // ==========================================

  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.nav-links');

  const enquiryModal = document.querySelector('#enquiry-modal');
  const enquiryForm = document.querySelector('#enquiry-form');
  const modalTitle = document.querySelector('#modal-title');
  const enquiryType = document.querySelector('#enquiry-type');
  const formStatus = document.querySelector('#form-status');

  const submitButton = enquiryForm?.querySelector('[type="submit"]');
  const pageUrl = document.querySelector('#page-url');

  const galleryPreview = document.querySelector('#gallery-preview');
  const previewTitle = document.querySelector('#preview-title');
  const previewImage = document.querySelector('#preview-image');
  const previewNote = document.querySelector('#preview-note');

  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  let previouslyFocused = null;
  let lastScrollY = window.scrollY;

  // ==========================================
  // 2. SELL.DO CRM CONFIGURATION
  // ==========================================

  // IMPORTANT:
  // API key and SRD are stored in Vercel environment
  // variables. Never place them in this JavaScript file.

  const LEAD_ENDPOINT = '/api/lead';

  const PROJECT_NAME = 'Prestige Sector 150 Noida';

  const CRM_SOURCE = 'Prestige 150 Web 2';

  // Contact numbers with country code.
  const PHONE_NUMBER = '917417412100';
  const WHATSAPP_NUMBER = '917417412100';

  const WHATSAPP_MESSAGE =
    'Hi, I would like details about Prestige Sector 150, Noida.';

  // ==========================================
  // 3. ENQUIRY MODAL TITLES
  // ==========================================

  const titleByIntent = {
    'Enquire Now': 'Get Project Details',
    'Request Price': 'Get Price Details',
    'Download Brochure': 'Request Project Brochure',
    'Explore Floor Plans': 'Request Floor Plans',
    'Schedule Site Visit': 'Schedule a Site Visit',
    'Request Master Plan': 'Request Master Plan',
    'Explore Proposed Amenities': 'Request Amenity Details',
    'Explore Location': 'Get Location Details',
    'Request a Call Back': 'Request a Call Back',
    'Request Developer Information': 'Request Developer Information'
  };

  // ==========================================
  // 4. MODAL FUNCTIONS
  // ==========================================

  const setModalVisibility = (modal, isOpen) => {
    if (!modal) return;

    modal.classList.toggle('is-open', isOpen);

    modal.setAttribute(
      'aria-hidden',
      String(!isOpen)
    );

    document.body.classList.toggle(
      'modal-open',
      isOpen
    );
  };

  const openEnquiry = (intent = 'Enquire Now') => {
    if (!enquiryModal) return;

    previouslyFocused = document.activeElement;

    if (enquiryType) {
      enquiryType.value = intent;
    }

    if (modalTitle) {
      modalTitle.textContent =
        titleByIntent[intent] || 'Get Project Details';
    }

    if (formStatus) {
      formStatus.textContent = '';
      formStatus.className = 'form-status';
    }

    setModalVisibility(enquiryModal, true);

    window.setTimeout(() => {
      document.querySelector('#full-name')?.focus();
    }, 30);
  };

  const closeModal = (modal) => {
    if (!modal) return;

    setModalVisibility(modal, false);

    if (!document.querySelector('.modal-backdrop.is-open')) {
      document.body.classList.remove('modal-open');
    }

    if (
      previouslyFocused &&
      typeof previouslyFocused.focus === 'function'
    ) {
      previouslyFocused.focus();
    }
  };

  document.querySelectorAll('[data-enquiry]').forEach((button) => {
    button.addEventListener('click', () => {
      openEnquiry(button.dataset.enquiry);
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {

    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) {
        closeModal(backdrop);
      }
    });

    backdrop.querySelector('.modal-close')?.addEventListener(
      'click',
      () => closeModal(backdrop)
    );

  });

  document.addEventListener('keydown', (event) => {

    if (event.key === 'Escape') {
      const openModal = document.querySelector(
        '.modal-backdrop.is-open'
      );

      if (openModal) closeModal(openModal);
    }

    const activeModal = document.querySelector(
      '.modal-backdrop.is-open'
    );

    if (event.key === 'Tab' && activeModal) {

      const focusable = [
        ...activeModal.querySelectorAll(
          'button, input, select, a[href], [tabindex]:not([tabindex="-1"])'
        )
      ].filter((element) =>
        !element.disabled && element.offsetParent !== null
      );

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();

      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    }

  });

  // ==========================================
  // 5. RESPONSIVE NAVIGATION
  // ==========================================

  const setMenu = (open) => {

    if (!menuToggle || !navigation) return;

    menuToggle.setAttribute(
      'aria-expanded',
      String(open)
    );

    menuToggle.setAttribute(
      'aria-label',
      open ? 'Close navigation' : 'Open navigation'
    );

    navigation.classList.toggle('is-open', open);

    header?.classList.toggle('menu-open', open);

    document.body.classList.toggle('nav-open', open);
  };

  const isMenuOpen = () =>
    navigation?.classList.contains('is-open');

  menuToggle?.addEventListener('click', () => {
    setMenu(!isMenuOpen());
  });

  navigation?.querySelectorAll('a, button').forEach((item) => {
    item.addEventListener('click', () => {
      setMenu(false);
    });
  });

  document.addEventListener('keydown', (event) => {

    if (event.key === 'Escape' && isMenuOpen()) {
      setMenu(false);
      menuToggle?.focus();
    }

  });

  document.addEventListener('click', (event) => {

    if (
      isMenuOpen() &&
      header &&
      !header.contains(event.target)
    ) {
      setMenu(false);
    }

  });

  window.matchMedia('(min-width: 1041px)').addEventListener(
    'change',
    (event) => {
      if (event.matches) setMenu(false);
    }
  );

  // ==========================================
  // 6. STICKY HEADER
  // ==========================================

  const updateHeader = () => {

    const currentY = window.scrollY;

    header?.classList.toggle(
      'is-sticky',
      currentY > 35
    );

    lastScrollY = currentY;
  };

  window.addEventListener('scroll', updateHeader, {
    passive: true
  });

  updateHeader();

  // ==========================================
  // 7. PAGE URL AND COPYRIGHT YEAR
  // ==========================================

  if (pageUrl) {
    pageUrl.value = window.location.href;
  }

  const year = document.querySelector('#year');

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  // ==========================================
  // 8. FAQ ACCORDION
  // ==========================================

  document.querySelectorAll('.faq-question').forEach((question) => {

    question.addEventListener('click', () => {

      const item = question.closest('.faq-item');

      const isOpen = item.classList.toggle('is-open');

      question.setAttribute(
        'aria-expanded',
        String(isOpen)
      );

    });

  });

  // ==========================================
  // 9. GALLERY SLIDER
  // ==========================================

  const galleryTrack = document.querySelector('#gallery-track');

  const galleryItems = galleryTrack
    ? [...galleryTrack.querySelectorAll('.gallery-item')]
    : [];

  const galleryCount = document.querySelector(
    '#gallery-count strong'
  );

  const galleryButtons = [
    ...document.querySelectorAll('[data-gallery-direction]')
  ];

  const currentGalleryIndex = () => {

    if (!galleryTrack || !galleryItems.length) return 0;

    const start = galleryTrack.getBoundingClientRect().left;

    let best = 0;

    galleryItems.forEach((item, index) => {

      const distance = Math.abs(
        item.getBoundingClientRect().left - start
      );

      if (
        distance <
        Math.abs(
          galleryItems[best].getBoundingClientRect().left - start
        )
      ) {
        best = index;
      }

    });

    return best;
  };

  const updateGalleryState = () => {

    if (!galleryTrack) return;

    const atStart = galleryTrack.scrollLeft <= 2;

    const atEnd =
      galleryTrack.scrollLeft + galleryTrack.clientWidth >=
      galleryTrack.scrollWidth - 2;

    if (galleryCount) {
      galleryCount.textContent = String(
        atEnd
          ? galleryItems.length
          : currentGalleryIndex() + 1
      );
    }

    galleryButtons.forEach((button) => {

      button.disabled =
        Number(button.dataset.galleryDirection) < 0
          ? atStart
          : atEnd;

    });

  };

  galleryButtons.forEach((button) => {

    button.addEventListener('click', () => {

      const direction = Number(
        button.dataset.galleryDirection
      );

      const target = galleryItems[
        Math.min(
          galleryItems.length - 1,
          Math.max(0, currentGalleryIndex() + direction)
        )
      ];

      if (!target) return;

      galleryTrack.scrollBy({
        left:
          target.getBoundingClientRect().left -
          galleryTrack.getBoundingClientRect().left,

        behavior: reduceMotion ? 'auto' : 'smooth'
      });

    });

  });

  let galleryFrame = 0;

  galleryTrack?.addEventListener('scroll', () => {

    cancelAnimationFrame(galleryFrame);

    galleryFrame = requestAnimationFrame(
      updateGalleryState
    );

  }, { passive: true });

  window.addEventListener('resize', updateGalleryState);

  updateGalleryState();

  // ==========================================
  // 10. GALLERY IMAGE PREVIEW
  // ==========================================

  galleryTrack?.querySelectorAll('.gallery-item').forEach((item) => {

    item.addEventListener('click', () => {

      const caption =
        item.querySelector('.gallery-caption strong')?.textContent ||
        'Gallery image';

      const label =
        item.querySelector('.gallery-caption span')?.textContent || '';

      const image = item.querySelector('img');

      if (previewTitle) {
        previewTitle.textContent = caption;
      }

      if (previewImage && image) {

        previewImage.src =
          image.currentSrc || image.src;

        previewImage.alt = image.alt;
      }

      if (previewNote) {

        previewNote.textContent = /representative/i.test(label)
          ? 'Representative lifestyle image, not a view of this project.'
          : 'Indicative visual. The actual development may differ.';
      }

      previouslyFocused = document.activeElement;

      setModalVisibility(galleryPreview, true);

      galleryPreview?.querySelector('.modal-close')?.focus();

    });

  });

  // ==========================================
  // 11. FLOOR PLAN TABS
  // ==========================================

  const planTabs = [
    ...document.querySelectorAll('.plan-tab')
  ];

  const selectPlan = (tab, moveFocus = false) => {

    planTabs.forEach((other) => {

      const selected = other === tab;

      other.setAttribute(
        'aria-selected',
        String(selected)
      );

      other.tabIndex = selected ? 0 : -1;

      const panel = document.getElementById(
        other.getAttribute('aria-controls')
      );

      if (panel) {
        panel.hidden = !selected;
      }

    });

    if (moveFocus) tab.focus();
  };

  planTabs.forEach((tab, index) => {

    tab.addEventListener('click', () => {
      selectPlan(tab);
    });

    tab.addEventListener('keydown', (event) => {

      const step = {
        ArrowRight: 1,
        ArrowLeft: -1
      }[event.key];

      if (!step) return;

      event.preventDefault();

      selectPlan(
        planTabs[
          (index + step + planTabs.length) % planTabs.length
        ],
        true
      );

    });

  });

  document.querySelectorAll('[data-plan-target]').forEach((link) => {

    link.addEventListener('click', () => {

      const tab = planTabs.find((item) =>
        item.getAttribute('aria-controls') === link.dataset.planTarget
      );

      if (tab) selectPlan(tab);

    });

  });

  // ==========================================
  // 12. CALL AND WHATSAPP
  // ==========================================

  const digitsOnly = (value) =>
    value.replace(/\D/g, '');

  if (digitsOnly(PHONE_NUMBER)) {

    document.querySelectorAll('[data-call-button]').forEach((button) => {

      button.removeAttribute('data-enquiry');

      const replacement = button.cloneNode(true);

      button.replaceWith(replacement);

    });

    document.querySelectorAll('[data-call-button]').forEach((button) => {

      button.addEventListener('click', () => {

        window.location.href =
          `tel:+${digitsOnly(PHONE_NUMBER)}`;

      });

    });

  }

  const whatsappLink = document.querySelector('[data-whatsapp]');

  if (whatsappLink && digitsOnly(WHATSAPP_NUMBER)) {

    whatsappLink.href =
      `https://wa.me/${digitsOnly(WHATSAPP_NUMBER)}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

    whatsappLink.hidden = false;

  }

  // ==========================================
  // 13. LOCKED FLOOR PLANS
  // ==========================================

  const PLAN_LOCK_GROUPS = {

    floor: {
      intent: 'Explore Floor Plans',
      storageKey: 'prestige150-plans-unlocked'
    },

    master: {
      intent: 'Request Master Plan',
      storageKey: 'prestige150-masterplan-unlocked'
    }

  };

  const planLocks = [
    ...document.querySelectorAll('[data-plan-lock]')
  ];

  const unlockedGroups = new Set();

  const lockGroupOf = (button) =>
    button.dataset.planLock || 'floor';

  function unlockPlanGroup(group, remember) {

    unlockedGroups.add(group);

    planLocks
      .filter((button) => lockGroupOf(button) === group)
      .forEach((button) => {

        const image = button.querySelector('img');

        if (image && button.dataset.full) {

          image.src = button.dataset.full;

          image.alt = image.alt
            .replace(/^Blurred preview of the /, '')
            .replace(/^indicative/, 'Indicative');

        }

        button.classList.remove('plan-locked');

        button.classList.add('plan-unlocked');

        const label =
          button.querySelector('.plan-lock-overlay strong')
            ?.textContent.replace('Unlock the ', '') || 'plan';

        button.setAttribute(
          'aria-label',
          `Open the ${label} at full size in a new tab`
        );

      });

    if (remember) {

      try {

        window.localStorage.setItem(
          PLAN_LOCK_GROUPS[group].storageKey,
          '1'
        );

      } catch (error) {
        // Storage unavailable.
      }

    }

  }

  planLocks.forEach((button) => {

    button.addEventListener('click', () => {

      const group = lockGroupOf(button);

      if (unlockedGroups.has(group)) {

        window.open(
          button.dataset.fullSize || button.dataset.full,
          '_blank',
          'noopener'
        );

      } else {

        openEnquiry(
          PLAN_LOCK_GROUPS[group].intent
        );

      }

    });

  });

  Object.entries(PLAN_LOCK_GROUPS).forEach(([group, config]) => {

    try {

      if (
        window.localStorage.getItem(config.storageKey) === '1'
      ) {
        unlockPlanGroup(group, false);
      }

    } catch (error) {
      // Storage unavailable.
    }

  });

  // ==========================================
  // 14. SCROLL REVEAL ANIMATIONS
  // ==========================================

  const revealItems = document.querySelectorAll('.reveal');

  if (
    'IntersectionObserver' in window &&
    !reduceMotion
  ) {

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {

            entry.target.classList.add('is-visible');

            observer.unobserve(entry.target);

          }

        });

      },
      {
        threshold: 0.12
      }
    );

    revealItems.forEach((item) => {
      revealObserver.observe(item);
    });

  } else {

    revealItems.forEach((item) => {
      item.classList.add('is-visible');
    });

  }

  // ==========================================
  // 15. UTM TRACKING
  // ==========================================

  const getTrackingData = () => {

    const params = new URLSearchParams(
      window.location.search
    );

    return {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_term: params.get('utm_term') || '',
      utm_content: params.get('utm_content') || ''
    };

  };

  // ==========================================
  // 16. SELL.DO CRM FORM SUBMISSION
  // ==========================================

  enquiryForm?.addEventListener('submit', async (event) => {

    event.preventDefault();

    if (!formStatus || !submitButton) return;

    formStatus.textContent = '';
    formStatus.className = 'form-status';

    // Honeypot spam protection.
    if (
      enquiryForm.elements.companyWebsite &&
      enquiryForm.elements.companyWebsite.value.trim()
    ) {

      formStatus.textContent =
        'Unable to process this request. Please try again.';

      formStatus.classList.add('error');

      return;
    }

    // ------------------------------------------
    // Read customer information
    // ------------------------------------------

    const fullName =
      enquiryForm.elements.fullName.value.trim();

    const mobile =
      enquiryForm.elements.mobile.value.trim();

    const email =
      enquiryForm.elements.email.value.trim();

    const selectedInterest =
      enquiryType?.value || 'Enquire Now';

    // ------------------------------------------
    // Client-side validation
    // ------------------------------------------

    if (fullName.length < 2 || fullName.length > 80) {

      formStatus.textContent =
        'Please enter your full name.';

      formStatus.classList.add('error');

      enquiryForm.elements.fullName.focus();

      return;
    }

    // Any number is accepted (Indian or international); it only can't be empty.
    if (!mobile) {

      formStatus.textContent =
        'Please enter your mobile number.';

      formStatus.classList.add('error');

      enquiryForm.elements.mobile.focus();

      return;
    }

    if (
      email &&
      !enquiryForm.elements.email.validity.valid
    ) {

      formStatus.textContent =
        'Enter a valid email address or leave the field blank.';

      formStatus.classList.add('error');

      enquiryForm.elements.email.focus();

      return;
    }

    // ------------------------------------------
    // Disable button during submission
    // ------------------------------------------

    submitButton.disabled = true;

    submitButton.innerHTML = 'Submitting…';

    formStatus.textContent =
      'Please wait while we submit your enquiry.';

    // ------------------------------------------
    // Prepare CRM payload
    // ------------------------------------------

    const trackingData = getTrackingData();

    const payload = {

      // Customer details
      name: fullName,
      phone: mobile,
      email: email,

      // Enquiry information
      interest: selectedInterest,

      // Project information
      projectName: PROJECT_NAME,

      // Website attribution
      source: CRM_SOURCE,

      page_url: window.location.href,

      // Marketing attribution
      ...trackingData

    };

    try {

      // ----------------------------------------
      // Send enquiry to Vercel backend
      // ----------------------------------------

      const response = await fetch(LEAD_ENDPOINT, {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },

        body: JSON.stringify(payload),

        cache: 'no-store'

      });

      let result;

      try {

        result = await response.json();

      } catch (error) {

        throw new Error(
          'Invalid response from the enquiry service. Please try again.'
        );

      }

      // ----------------------------------------
      // Check backend response
      // ----------------------------------------

      if (!response.ok || !result.success) {

        throw new Error(
          result.message ||
          'Unable to submit your enquiry. Please try again.'
        );

      }

      // ----------------------------------------
      // Successful CRM submission
      // ----------------------------------------

      formStatus.textContent =
        'Thank you! Your enquiry has been submitted successfully. Our team will contact you shortly.';

      formStatus.classList.add('success');

      // ----------------------------------------
      // Unlock relevant plans
      // ----------------------------------------

      const unlockedGroup = Object.keys(PLAN_LOCK_GROUPS)
        .find((group) =>
          PLAN_LOCK_GROUPS[group].intent === selectedInterest
        );

      if (unlockedGroup) {

        unlockPlanGroup(unlockedGroup, true);

        formStatus.textContent +=
          unlockedGroup === 'master'
            ? ' The master plan is now unlocked.'
            : ' The floor plans are now unlocked below.';

      }

      // ----------------------------------------
      // Reset form after successful submission
      // ----------------------------------------

      enquiryForm.reset();

      if (enquiryType) {
        enquiryType.value = selectedInterest;
      }

      if (pageUrl) {
        pageUrl.value = window.location.href;
      }

      // Keep success message visible.

    } catch (error) {

      // ----------------------------------------
      // Handle submission errors
      // ----------------------------------------

      console.error(
        'Prestige1502 CRM submission failed:',
        error
      );

      formStatus.textContent =
        error.message ||
        'We could not submit your enquiry. Please try again later.';

      formStatus.classList.add('error');

    } finally {

      // ----------------------------------------
      // Restore submit button
      // ----------------------------------------

      submitButton.disabled = false;

      submitButton.innerHTML =
        'Submit enquiry <span aria-hidden="true">↗</span>';

    }

  });

})();
