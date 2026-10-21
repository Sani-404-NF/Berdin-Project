(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    /* ---------- Toast ---------- */

    var toast = qs('[data-toast]');
    var toastTimer;

    function showToast(message, isError) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.toggle('is-error', Boolean(isError));
        toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            toast.classList.remove('is-visible');
        }, 3200);
    }

    /* ---------- Mobile navigation ---------- */

    var menuToggle = qs('[data-menu-toggle]');
    var navPanel = qs('[data-nav-panel]');
    var header = qs('[data-header]');

    function setMenu(open) {
        if (!menuToggle || !navPanel) return;
        navPanel.classList.toggle('is-open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    }

    if (menuToggle && navPanel) {
        menuToggle.addEventListener('click', function () {
            var open = menuToggle.getAttribute('aria-expanded') === 'true';
            setMenu(!open);
            if (!open) {
                var firstLink = qs('.nav-link', navPanel);
                if (firstLink) firstLink.focus();
            } else {
                menuToggle.focus();
            }
        });

        qsa('.nav-link, .nav-cta', navPanel).forEach(function (link) {
            link.addEventListener('click', function () {
                setMenu(false);
            });
        });

        document.addEventListener('click', function (event) {
            if (!navPanel.contains(event.target) && !menuToggle.contains(event.target)) {
                setMenu(false);
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
                setMenu(false);
                menuToggle.focus();
            }
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 820) setMenu(false);
        });
    }

    /* ---------- Scroll progress, sticky header, back-to-top ---------- */

    var progressBar = qs('[data-scroll-progress] span');
    var floatToTop = qs('.to-top-float');
    var ticking = false;

    function onScroll() {
        var scrollTop = window.scrollY || document.documentElement.scrollTop;
        var scrollable = document.documentElement.scrollHeight - window.innerHeight;

        if (progressBar) {
            progressBar.style.width = (scrollable > 0 ? (scrollTop / scrollable) * 100 : 0) + '%';
        }

        if (header) {
            header.classList.toggle('is-stuck', scrollTop > 8);
        }

        if (floatToTop) {
            floatToTop.hidden = scrollTop < 600;
        }

        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(onScroll);
    }, { passive: true });

    onScroll();

    qsa('[data-to-top]').forEach(function (button) {
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
            var logoLink = qs('.nav-logo-link');
            if (logoLink) logoLink.focus({ preventScroll: true });
        });
    });

    /* ---------- Reveal on scroll ---------- */

    var revealTargets = qsa('.reveal');

    if (!('IntersectionObserver' in window) || reduceMotion) {
        revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

        revealTargets.forEach(function (el) { revealObserver.observe(el); });
    }

    /* ---------- Active section highlighting ---------- */

    var sections = qsa('section[id]');
    var navLinks = qsa('.nav-link');

    function setActiveLink(id) {
        navLinks.forEach(function (link) {
            if (link.getAttribute('href') === '#' + id) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
        var sectionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    setActiveLink(entry.target.id);
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        sections.forEach(function (section) { sectionObserver.observe(section); });
    }

    /* ---------- Carousels ---------- */

    qsa('[data-carousel]').forEach(function (carousel) {
        var track = qs('[data-carousel-track]', carousel);
        var prev = qs('.carousel-btn.prev', carousel);
        var next = qs('.carousel-btn.next', carousel);
        var status = qs('[data-carousel-status]', carousel);
        if (!track) return;

        var slides = qsa('img', track);

        function currentIndex() {
            var slideWidth = slides[0] ? slides[0].clientWidth : track.clientWidth;
            if (!slideWidth) return 0;
            return Math.round(track.scrollLeft / slideWidth);
        }

        function updateStatus() {
            if (status) status.textContent = (currentIndex() + 1) + ' / ' + slides.length;
        }

        function goTo(index) {
            var slideWidth = slides[0] ? slides[0].clientWidth : track.clientWidth;
            track.scrollTo({ left: index * slideWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                goTo(Math.max(0, currentIndex() - 1));
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                goTo(Math.min(slides.length - 1, currentIndex() + 1));
            });
        }

        track.addEventListener('scroll', function () {
            window.requestAnimationFrame(updateStatus);
        }, { passive: true });

        track.addEventListener('keydown', function (event) {
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                goTo(Math.min(slides.length - 1, currentIndex() + 1));
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                goTo(Math.max(0, currentIndex() - 1));
            }
        });

        updateStatus();
    });

    /* ---------- Lightbox ---------- */

    var lightbox = qs('[data-lightbox]');
    var lightboxImg = qs('[data-lightbox-img]');
    var lightboxStatus = qs('[data-lightbox-status]');
    var lightboxClose = qs('[data-lightbox-close]');
    var lightboxPrev = qs('[data-lightbox-prev]');
    var lightboxNext = qs('[data-lightbox-next]');

    var lightboxImages = [];
    var lightboxIndex = 0;
    var lastFocused = null;

    function renderLightbox() {
        if (!lightboxImg || !lightboxImages.length) return;
        var image = lightboxImages[lightboxIndex];
        lightboxImg.src = image.src;
        lightboxImg.alt = image.alt;
        if (lightboxStatus) {
            lightboxStatus.textContent = (lightboxIndex + 1) + ' / ' + lightboxImages.length;
        }
    }

    function openLightbox(images, index) {
        if (!lightbox) return;
        lightboxImages = images;
        lightboxIndex = index;
        lastFocused = document.activeElement;
        renderLightbox();
        lightbox.hidden = false;
        document.body.classList.add('is-locked');
        window.requestAnimationFrame(function () {
            lightbox.classList.add('is-open');
        });
        if (lightboxClose) lightboxClose.focus();
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('is-open');
        document.body.classList.remove('is-locked');
        var finish = function () { lightbox.hidden = true; };
        if (reduceMotion) {
            finish();
        } else {
            setTimeout(finish, 250);
        }
        if (lastFocused && typeof lastFocused.focus === 'function') {
            lastFocused.focus();
        }
    }

    function stepLightbox(step) {
        if (!lightboxImages.length) return;
        lightboxIndex = (lightboxIndex + step + lightboxImages.length) % lightboxImages.length;
        renderLightbox();
    }

    qsa('[data-carousel-track]').forEach(function (track) {
        var images = qsa('img', track);
        images.forEach(function (image, index) {
            image.addEventListener('click', function () {
                openLightbox(images, index);
            });
        });
    });

    if (lightbox) {
        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

        if (lightboxPrev) lightboxPrev.addEventListener('click', function () { stepLightbox(-1); });
        if (lightboxNext) lightboxNext.addEventListener('click', function () { stepLightbox(1); });

        lightbox.addEventListener('click', function (event) {
            if (event.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', function (event) {
            if (lightbox.hidden) return;

            if (event.key === 'Escape') {
                closeLightbox();
                return;
            }

            if (event.key === 'ArrowRight') stepLightbox(1);
            if (event.key === 'ArrowLeft') stepLightbox(-1);

            if (event.key === 'Tab') {
                var focusables = qsa('button, [href]', lightbox).filter(function (el) {
                    return !el.disabled && el.offsetParent !== null;
                });
                if (!focusables.length) return;
                var first = focusables[0];
                var last = focusables[focusables.length - 1];

                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });
    }

    /* ---------- Project filters ---------- */

    var filterButtons = qsa('.filter-btn');
    var projectCards = qsa('.project-card');
    var emptyState = qs('[data-empty-state]');

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            var filter = button.getAttribute('data-filter');

            filterButtons.forEach(function (other) {
                var isActive = other === button;
                other.classList.toggle('is-active', isActive);
                other.setAttribute('aria-pressed', String(isActive));
            });

            var visible = 0;
            projectCards.forEach(function (card) {
                var matches = filter === 'all' || card.getAttribute('data-category') === filter;
                card.hidden = !matches;
                if (matches) visible++;
            });

            if (emptyState) emptyState.hidden = visible !== 0;
        });
    });

    /* ---------- Contact form ---------- */

    var form = qs('#contact-form');

    if (form) {
        var validators = {
            name: function (value) {
                if (!value.trim()) return 'Name is required.';
                if (value.trim().length < 2) return 'Please enter at least 2 characters.';
                return '';
            },
            email: function (value) {
                if (!value.trim()) return 'Email is required.';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())) {
                    return 'Please enter a valid email address.';
                }
                return '';
            },
            message: function (value) {
                if (!value.trim()) return 'Message is required.';
                if (value.trim().length < 10) return 'Please write a little more (10+ characters).';
                return '';
            }
        };

        function validateField(field) {
            var input = qs('#' + field);
            var error = qs('[data-error="' + field + '"]');
            if (!input) return true;

            var message = validators[field](input.value);
            if (error) error.textContent = message;
            input.setAttribute('aria-invalid', message ? 'true' : 'false');
            return !message;
        }

        Object.keys(validators).forEach(function (field) {
            var input = qs('#' + field);
            if (!input) return;
            input.addEventListener('blur', function () { validateField(field); });
            input.addEventListener('input', function () {
                if (input.getAttribute('aria-invalid') === 'true') validateField(field);
            });
        });

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            var fields = Object.keys(validators);
            var firstInvalid = null;

            fields.forEach(function (field) {
                if (!validateField(field) && !firstInvalid) {
                    firstInvalid = qs('#' + field);
                }
            });

            if (firstInvalid) {
                showToast('Please fix the highlighted fields.', true);
                firstInvalid.focus();
                return;
            }

            form.reset();
            fields.forEach(function (field) {
                var input = qs('#' + field);
                if (input) input.setAttribute('aria-invalid', 'false');
            });
            showToast('Thanks! Your message is ready to send.');
        });
    }

    /* ---------- Small enhancements ---------- */

    var copyButton = qs('[data-copy-email]');

    if (copyButton) {
        copyButton.addEventListener('click', function () {
            var email = copyButton.getAttribute('data-email') || '';
            var hint = qs('.copy-email-hint', copyButton);

            function done() {
                if (hint) hint.textContent = 'Copied';
                showToast('Email address copied to clipboard.');
                setTimeout(function () {
                    if (hint) hint.textContent = 'Copy';
                }, 2000);
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(email).then(done, function () {
                    showToast('Copy failed — please select the email manually.', true);
                });
            } else {
                showToast('Copy not supported here — the address is above.', true);
            }
        });
    }

    qsa('[data-coming-soon]').forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            showToast('This link is coming soon — stay tuned!');
        });
    });

    qsa('[data-year]').forEach(function (el) {
        el.textContent = String(new Date().getFullYear());
    });
})();
