(function() {
    'use strict';

    var header = document.getElementById('siteHeader');
    var menuToggle = document.getElementById('menuToggle');
    var mobileMenu = document.getElementById('mobileMenu');
    var navLinks = document.querySelectorAll('.nav__link, .mobile-menu__link');
    var traceNodes = document.querySelectorAll('.trace-node');
    var sections = document.querySelectorAll('main .section, .hero');

    var menuOpen = false;
    var lastFocusedEl = null;

    /* ===================================================
       Sticky header: scrolled state + scroll-direction hide/show
       =================================================== */
    var lastScrollY = window.scrollY;
    var ticking = false;
    var SCROLL_THRESHOLD = 40;
    var HIDE_OFFSET = 120;
    var MIN_SCROLL_DELTA = 8;

    function updateHeader() {
        var currentY = window.scrollY;

        if (currentY > SCROLL_THRESHOLD) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }

        var delta = currentY - lastScrollY;

        if (!menuOpen && Math.abs(delta) > MIN_SCROLL_DELTA) {
            if (delta > 0 && currentY > HIDE_OFFSET) {
                header.classList.add('is-hidden');
            } else if (delta < 0) {
                header.classList.remove('is-hidden');
            }
            lastScrollY = currentY;
        }

        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, {
        passive: true
    });

    /* ===================================================
       Mobile menu: open/close, focus trap, escape, click-outside,
       focus restoration
       =================================================== */
    function getFocusableElements(container) {
        return container.querySelectorAll(
            'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
    }

    function openMenu() {
        menuOpen = true;
        lastFocusedEl = document.activeElement;

        menuToggle.setAttribute('aria-expanded', 'true');
        mobileMenu.classList.add('is-open');
        mobileMenu.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        header.classList.remove('is-hidden');

        var focusable = getFocusableElements(mobileMenu);
        if (focusable.length) {
            window.setTimeout(function() {
                focusable[0].focus();
            }, 50);
        }
    }

    function closeMenu() {
        menuOpen = false;
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('is-open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        if (lastFocusedEl) {
            lastFocusedEl.focus();
        } else {
            menuToggle.focus();
        }
    }

    menuToggle.addEventListener('click', function() {
        if (menuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Escape key closes the menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && menuOpen) {
            closeMenu();
        }
    });

    // Focus trap inside the open mobile menu
    document.addEventListener('keydown', function(e) {
        if (!menuOpen || e.key !== 'Tab') return;

        var focusable = getFocusableElements(mobileMenu);
        if (!focusable.length) return;

        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });

    // Click outside the menu content (on the overlay background) closes it
    mobileMenu.addEventListener('click', function(e) {
        if (e.target === mobileMenu) {
            closeMenu();
        }
    });

    // Close mobile menu whenever a link inside it is used
    document.querySelectorAll('.mobile-menu__link').forEach(function(link) {
        link.addEventListener('click', closeMenu);
    });

    /* ===================================================
       Smooth scrolling with fixed-header offset
       =================================================== */
    function scrollToTarget(targetEl) {
        var headerHeight = header.offsetHeight;
        var targetY = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12;

        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: targetY,
                behavior: 'smooth'
            });
        } else {
            // Fallback easing scroll for browsers without native smooth scroll
            var startY = window.pageYOffset;
            var distance = targetY - startY;
            var duration = 650;
            var startTime = null;

            function easeInOutQuad(t) {
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            }

            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                var elapsed = timestamp - startTime;
                var progress = Math.min(elapsed / duration, 1);
                window.scrollTo(0, startY + distance * easeInOutQuad(progress));
                if (elapsed < duration) window.requestAnimationFrame(step);
            }
            window.requestAnimationFrame(step);
        }
    }

    document.querySelectorAll('a[href^="#"]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            var id = link.getAttribute('href').slice(1);
            var targetEl = document.getElementById(id);
            if (!targetEl) return;
            e.preventDefault();
            scrollToTarget(targetEl);
        });
    });

    /* ===================================================
       Active-state scroll spy via IntersectionObserver
       drives both the nav links and the trace rail nodes
       =================================================== */
    function setActiveSection(id) {
        navLinks.forEach(function(link) {
            var isActive = link.dataset.section === id;
            link.classList.toggle('is-active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });

        traceNodes.forEach(function(node) {
            node.classList.toggle('is-active', node.dataset.node === id);
        });
    }

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        });

        sections.forEach(function(section) {
            observer.observe(section);
        });
    } else {
        // Fallback: throttled scroll listener
        var spyTicking = false;

        function spyOnScroll() {
            var scrollPos = window.scrollY + window.innerHeight * 0.3;
            sections.forEach(function(section) {
                if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
                    setActiveSection(section.id);
                }
            });
            spyTicking = false;
        }
        window.addEventListener('scroll', function() {
            if (!spyTicking) {
                window.requestAnimationFrame(spyOnScroll);
                spyTicking = true;
            }
        }, {
            passive: true
        });
    }
})();