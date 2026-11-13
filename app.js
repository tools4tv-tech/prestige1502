(() => {
  'use strict';

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
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let previouslyFocused = null;
  let lastScrollY = window.scrollY;

  // Configure this URL only when a secure, server-side lead endpoint is available.
  // Never place API keys or CRM secrets in this browser-side file.
  const LEAD_ENDPOINT = '';

  // Contact numbers with country code, digits only (e.g. '919876543210').
  // When set, "Call now" dials the number and a WhatsApp chat button appears.
  // While empty, "Call now" opens the call-back form and WhatsApp stays hidden.
  const PHONE_NUMBER = '';
  const WHATSAPP_NUMBER = '';
  const WHATSAPP_MESSAGE = 'Hi, I would like details about Prestige Sector 150, Noida.';

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

  const setModalVisibility = (modal, isOpen) => {
    if (!modal) return;
    modal.classList.toggle('is-open', isOpen);
    modal.setAttribute('aria-hidden', String(!isOpen));
    document.body.classList.toggle('modal-open', isOpen);
  };

  const openEnquiry = (intent = 'Enquire Now') => {
    if (!enquiryModal) return;
    previouslyFocused = document.activeElement;
    enquiryType.value = intent;
    modalTitle.textContent = titleByIntent[intent] || 'Get Project Details';
    formStatus.textContent = '';
    formStatus.className = 'form-status';
    setModalVisibility(enquiryModal, true);
    window.setTimeout(() => document.querySelector('#full-name')?.focus(), 30);
  };

  const closeModal = (modal) => {
    if (!modal) return;
    setModalVisibility(modal, false);
    if (!document.querySelector('.modal-backdrop.is-open')) {
      document.body.classList.remove('modal-open');
    }
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus();
    }
  };

  document.querySelectorAll('[data-enquiry]').forEach((button) => {
    button.addEventListener('click', () => openEnquiry(button.dataset.enquiry));
  });

  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) closeModal(backdrop);
    });
    backdrop.querySelector('.modal-close')?.addEventListener('click', () => closeModal(backdrop));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const openModal = document.querySelector('.modal-backdrop.is-open');
      if (openModal) closeModal(openModal);
    }

    const activeModal = document.querySelector('.modal-backdrop.is-open');
    if (event.key === 'Tab' && activeModal) {
      const focusable = [...activeModal.querySelectorAll('button, input, select, a[href], [tabindex]:not([tabindex="-1"])')]
        .filter((element) => !element.disabled && element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    navigation?.classList.toggle('is-open', !isOpen);
  });

  navigation?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navigation.classList.remove('is-open');
      menuToggle?.setAttribute('aria-expanded', 'false');
      menuToggle?.setAttribute('aria-label', 'Open navigation');
    });
  });

  const updateHeader = () => {
    const currentY = window.scrollY;
    header?.classList.toggle('is-sticky', currentY > 35);
    lastScrollY = currentY;
  };
  window.addEventListener('scroll', updateHeader, {
    passive: true
  });
  updateHeader();

  if (pageUrl) pageUrl.value = window.location.href;
  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  document.querySelectorAll('.faq-question').forEach((question) => {
    question.addEventListener('click', () => {
      const item = question.closest('.faq-item');
      const isOpen = item.classList.toggle('is-open');
      question.setAttribute('aria-expanded', String(isOpen));
    });
  });

  const galleryTrack = document.querySelector('#gallery-track');
  const galleryItems = galleryTrack ? [...galleryTrack.querySelectorAll('.gallery-item')] : [];
  const galleryCount = document.querySelector('#gallery-count strong');
  const galleryButtons = [...document.querySelectorAll('[data-gallery-direction]')];

  // Index of the card whose left edge is closest to the track's left edge.
  const currentGalleryIndex = () => {
    if (!galleryTrack || !galleryItems.length) return 0;
    const start = galleryTrack.getBoundingClientRect().left;
    let best = 0;
    galleryItems.forEach((item, index) => {
      const distance = Math.abs(item.getBoundingClientRect().left - start);
      if (distance < Math.abs(galleryItems[best].getBoundingClientRect().left - start)) best = index;
    });
    return best;
  };

  const updateGalleryState = () => {
    if (!galleryTrack) return;
    const atStart = galleryTrack.scrollLeft <= 2;
    const atEnd = galleryTrack.scrollLeft + galleryTrack.clientWidth >= galleryTrack.scrollWidth - 2;
    if (galleryCount) galleryCount.textContent = String(atEnd ? galleryItems.length : currentGalleryIndex() + 1);
    galleryButtons.forEach((button) => {
      button.disabled = Number(button.dataset.galleryDirection) < 0 ? atStart : atEnd;
    });
  };

  galleryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const direction = Number(button.dataset.galleryDirection);
      const target = galleryItems[Math.min(galleryItems.length - 1, Math.max(0, currentGalleryIndex() + direction))];
      if (!target) return;
      galleryTrack.scrollBy({
        left: target.getBoundingClientRect().left - galleryTrack.getBoundingClientRect().left,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    });
  });

  let galleryFrame = 0;
  galleryTrack?.addEventListener('scroll', () => {
    cancelAnimationFrame(galleryFrame);
    galleryFrame = requestAnimationFrame(updateGalleryState);
  }, { passive: true });
  window.addEventListener('resize', updateGalleryState);
  updateGalleryState();

  galleryTrack?.querySelectorAll('.gallery-item').forEach((item) => {
    item.addEventListener('click', () => {
      const caption = item.querySelector('.gallery-caption strong')?.textContent || 'Gallery image';
      const label = item.querySelector('.gallery-caption span')?.textContent || '';
      const image = item.querySelector('img');
      previewTitle.textContent = caption;
      if (previewImage && image) {
        previewImage.src = image.currentSrc || image.src;
        previewImage.alt = image.alt;
      }
      if (previewNote) {
        previewNote.textContent = /representative/i.test(label)
          ? 'Representative lifestyle image, not a view of this project.'
          : "Artist's impression. Indicative only; the actual development may differ.";
      }
      previouslyFocused = document.activeElement;
      setModalVisibility(galleryPreview, true);
      galleryPreview.querySelector('.modal-close')?.focus();
    });
  });

  // Floor plan tabs
  const planTabs = [...document.querySelectorAll('.plan-tab')];
  const selectPlan = (tab, moveFocus = false) => {
    planTabs.forEach((other) => {
      const selected = other === tab;
      other.setAttribute('aria-selected', String(selected));
      other.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(other.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });
    if (moveFocus) tab.focus();
  };
  planTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectPlan(tab));
    tab.addEventListener('keydown', (event) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (!step) return;
      event.preventDefault();
      selectPlan(planTabs[(index + step + planTabs.length) % planTabs.length], true);
    });
  });
  document.querySelectorAll('[data-plan-target]').forEach((link) => {
    link.addEventListener('click', () => {
      const tab = planTabs.find((item) => item.getAttribute('aria-controls') === link.dataset.planTarget);
      if (tab) selectPlan(tab);
    });
  });

  // Direct call / WhatsApp, once numbers are configured above
  const digitsOnly = (value) => value.replace(/\D/g, '');
  if (digitsOnly(PHONE_NUMBER)) {
    document.querySelectorAll('[data-call-button]').forEach((button) => {
      button.removeAttribute('data-enquiry');
      button.replaceWith(button.cloneNode(true));
    });
    document.querySelectorAll('[data-call-button]').forEach((button) => {
      button.addEventListener('click', () => {
        window.location.href = `tel:+${digitsOnly(PHONE_NUMBER)}`;
      });
    });
  }
  const whatsappLink = document.querySelector('[data-whatsapp]');
  if (whatsappLink && digitsOnly(WHATSAPP_NUMBER)) {
    whatsappLink.href = `https://wa.me/${digitsOnly(WHATSAPP_NUMBER)}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    whatsappLink.hidden = false;
  }

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12
    });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const normalizeIndianMobile = (value) => value.replace(/[^0-9]/g, '').replace(/^91(?=\d{10}$)/, '').replace(/^0(?=\d{10}$)/, '');

  enquiryForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    formStatus.textContent = '';
    formStatus.className = 'form-status';

    if (enquiryForm.elements.companyWebsite.value.trim()) {
      formStatus.textContent = 'Unable to process this request. Please try again.';
      formStatus.classList.add('error');
      return;
    }

    const fullName = enquiryForm.elements.fullName.value.trim();
    const mobile = normalizeIndianMobile(enquiryForm.elements.mobile.value.trim());
    const email = enquiryForm.elements.email.value.trim();
    const consent = enquiryForm.elements.consent.checked;
    const indianMobilePattern = /^[6-9]\d{9}$/;

    if (fullName.length < 2) {
      formStatus.textContent = 'Please enter your full name.';
      formStatus.classList.add('error');
      enquiryForm.elements.fullName.focus();
      return;
    }
    if (!indianMobilePattern.test(mobile)) {
      formStatus.textContent = 'Enter a valid 10-digit Indian mobile number.';
      formStatus.classList.add('error');
      enquiryForm.elements.mobile.focus();
      return;
    }
    if (email && !enquiryForm.elements.email.validity.valid) {
      formStatus.textContent = 'Enter a valid email address or leave the field blank.';
      formStatus.classList.add('error');
      enquiryForm.elements.email.focus();
      return;
    }
    if (!consent) {
      formStatus.textContent = 'Please provide consent so we can respond to your enquiry.';
      formStatus.classList.add('error');
      enquiryForm.elements.consent.focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.innerHTML = 'Submitting…';
    formStatus.textContent = 'Please wait while your request is prepared.';

    const payload = {
      fullName,
      mobile,
      email,
      enquiryType: enquiryType.value,
      projectName: enquiryForm.elements.projectName.value,
      pageUrl: pageUrl.value,
      source: enquiryForm.elements.source.value,
      consent: true
    };

    try {
      if (LEAD_ENDPOINT) {
        const response = await fetch(LEAD_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('The enquiry service returned an error.');
        formStatus.textContent = 'Thank you. Your enquiry has been submitted successfully.';
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 650));
        formStatus.textContent = 'Thank you. This demo does not transmit or store your details. Connect a secure lead endpoint to receive enquiries.';
      }
      formStatus.classList.add('success');
      enquiryForm.reset();
      enquiryType.value = payload.enquiryType;
      if (pageUrl) pageUrl.value = window.location.href;
    } catch (error) {
      formStatus.textContent = error.message || 'We could not submit your enquiry. Please try again later.';
      formStatus.classList.add('error');
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Submit enquiry <span aria-hidden="true">↗</span>';
    }
  });
})();
