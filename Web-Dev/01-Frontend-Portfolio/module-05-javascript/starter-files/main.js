document.addEventListener('DOMContentLoaded', function () {
    var menuToggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var valid = true;

            var nameInput = document.getElementById('name');
            var nameError = document.querySelector('[data-error="name"]');
            if (nameInput && nameError) {
                if (!nameInput.value.trim()) {
                    nameError.textContent = 'Name is required.';
                    valid = false;
                } else {
                    nameError.textContent = '';
                }
            }

            var emailInput = document.getElementById('email');
            var emailError = document.querySelector('[data-error="email"]');
            if (emailInput && emailError) {
                var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailInput.value.trim()) {
                    emailError.textContent = 'Email is required.';
                    valid = false;
                } else if (!emailPattern.test(emailInput.value.trim())) {
                    emailError.textContent = 'Please enter a valid email address.';
                    valid = false;
                } else {
                    emailError.textContent = '';
                }
            }

            var messageInput = document.getElementById('message');
            var messageError = document.querySelector('[data-error="message"]');
            if (messageInput && messageError) {
                if (!messageInput.value.trim()) {
                    messageError.textContent = 'Message is required.';
                    valid = false;
                } else {
                    messageError.textContent = '';
                }
            }

            if (valid) {
                showToast('Message sent!');
                form.reset();
            }
        });
    }

    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-link');

    if (sections.length > 0 && navLinks.length > 0 && 'IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.getAttribute('id');
                    navLinks.forEach(function (link) {
                        link.style.fontWeight = '';
                        if (link.getAttribute('href') === '#' + id) {
                            link.style.fontWeight = 'bold';
                        }
                    });
                }
            });
        }, { rootMargin: '-50% 0px -50% 0px' });

        sections.forEach(function (section) {
            observer.observe(section);
        });
    }

    function showToast(message) {
        var toast = document.createElement('div');
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.bottom = '24px';
        toast.style.right = '24px';
        toast.style.backgroundColor = '#1e293b';
        toast.style.color = 'white';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '8px';
        toast.style.zIndex = '1000';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        document.body.appendChild(toast);

        requestAnimationFrame(function () {
            toast.style.opacity = '1';
        });

        setTimeout(function () {
            toast.style.opacity = '0';
            setTimeout(function () {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    var carousels = document.querySelectorAll('.carousel');

    carousels.forEach(function (carousel) {
        var track = carousel.querySelector('.carousel-track');
        var prevBtn = carousel.querySelector('.prev');
        var nextBtn = carousel.querySelector('.next');

        if (!track || !prevBtn || !nextBtn) return;

        prevBtn.addEventListener('click', function () {
            var imageWidth = track.querySelector('img').clientWidth;
            track.scrollBy({ left: -imageWidth, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', function () {
            var imageWidth = track.querySelector('img').clientWidth;
            track.scrollBy({ left: imageWidth, behavior: 'smooth' });
        });
    });

    var filterBtns = document.querySelectorAll('.filter-btn');
    var projectCards = document.querySelectorAll('.project-card');
    var emptyState = document.querySelector('[data-empty-state]');

    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            filterBtns.forEach(function (b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');

            var filter = btn.getAttribute('data-filter');
            var visibleCount = 0;

            projectCards.forEach(function (card) {
                var category = card.getAttribute('data-category');
                if (filter === 'all' || filter === category) {
                    card.style.display = '';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            if (emptyState) {
                if (visibleCount === 0) {
                    emptyState.classList.add('visible');
                } else {
                    emptyState.classList.remove('visible');
                }
            }
        });
    });

    var overlay = document.createElement('div');
    overlay.className = 'fullview-overlay';

    var overlayImg = document.createElement('img');

    var closeBtn = document.createElement('button');
    closeBtn.className = 'overlay-close';
    closeBtn.setAttribute('aria-label', 'Close full view');
    closeBtn.innerHTML = '&times;';

    var overlayPrev = document.createElement('button');
    overlayPrev.className = 'overlay-btn prev';
    overlayPrev.setAttribute('aria-label', 'Previous image');
    overlayPrev.innerHTML = '&#10094;';

    var overlayNext = document.createElement('button');
    overlayNext.className = 'overlay-btn next';
    overlayNext.setAttribute('aria-label', 'Next image');
    overlayNext.innerHTML = '&#10095;';

    overlay.appendChild(closeBtn);
    overlay.appendChild(overlayPrev);
    overlay.appendChild(overlayImg);
    overlay.appendChild(overlayNext);
    document.body.appendChild(overlay);

    var currentImages = [];
    var currentIndex = 0;

    function openLightbox(images, index) {
        currentImages = images;
        currentIndex = index;
        overlayImg.src = currentImages[currentIndex].src;
        overlayImg.alt = currentImages[currentIndex].alt;
        overlay.classList.add('active');
    }

    function closeLightbox() {
        overlay.classList.remove('active');
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % currentImages.length;
        overlayImg.src = currentImages[currentIndex].src;
        overlayImg.alt = currentImages[currentIndex].alt;
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        overlayImg.src = currentImages[currentIndex].src;
        overlayImg.alt = currentImages[currentIndex].alt;
    }

    document.querySelectorAll('.carousel-track').forEach(function (track) {
        var images = Array.prototype.slice.call(track.querySelectorAll('img'));

        images.forEach(function (img, index) {
            img.addEventListener('click', function () {
                openLightbox(images, index);
            });
        });
    });

    closeBtn.addEventListener('click', closeLightbox);
    overlayNext.addEventListener('click', showNext);
    overlayPrev.addEventListener('click', showPrev);

    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (!overlay.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
    });

});