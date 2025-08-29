/**
 * Professional eShop JavaScript
 * Enhanced functionality with smooth animations and user interactions
 */

// Global state management
const eShopApp = {
    cart: JSON.parse(localStorage.getItem('eShopCart')) || [],
    currentSlide: 0,
    isScrolling: false,

    // Initialize the application
    init() {
        this.setupEventListeners();
        this.initializeCarousel();
        this.updateCartDisplay();
        this.initializeAnimations();
        this.initializeFormValidation();
        this.initializeLazyLoading();
        this.initializeThemeToggle();
        this.initializePagination();
    },    // Set up all event listeners
    setupEventListeners() {
        // Scroll to top button
        this.initializeScrollToTop();

        // Navigation scroll effects
        this.initializeNavigation();

        // Product interactions
        this.initializeProductCards();

        // Form submissions
        this.initializeNewsletterForm();

        // Keyboard navigation
        this.initializeKeyboardNavigation();

        // Window resize handler
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    },

    // Smooth scroll to top functionality
    initializeScrollToTop() {
        const scrollToTopBtn = document.getElementById('scrollToTopBtn');

        if (scrollToTopBtn) {
            window.addEventListener('scroll', this.throttle(() => {
                if (window.scrollY > 300) {
                    scrollToTopBtn.classList.remove('hidden');
                    scrollToTopBtn.classList.add('show');
                } else {
                    scrollToTopBtn.classList.add('hidden');
                    scrollToTopBtn.classList.remove('show');
                }
            }, 100));

            scrollToTopBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.smoothScrollTo(0, 800);
            });
        }
    },

    // Navigation effects and mobile menu
    initializeNavigation() {
        const nav = document.querySelector('nav');

        if (nav) {
            window.addEventListener('scroll', this.throttle(() => {
                if (window.scrollY > 100) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }
            }, 100));
        }

        // Mobile menu toggle (if exists)
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');

        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
                mobileMenuToggle.setAttribute('aria-expanded',
                    mobileMenu.classList.contains('hidden') ? 'false' : 'true'
                );
            });
        }
    },

    // Enhanced carousel functionality
    initializeCarousel() {
        const carousel = document.querySelector('.carousel');
        const items = document.querySelectorAll('.carousel-item');
        const prevBtn = document.querySelector('.carousel-nav.prev');
        const nextBtn = document.querySelector('.carousel-nav.next');

        if (!carousel || items.length === 0) return;

        let autoSlideInterval;

        // Navigation button events
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.previousSlide();
                this.restartAutoSlide();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextSlide();
                this.restartAutoSlide();
            });
        }

        // Auto-slide functionality
        const startAutoSlide = () => {
            autoSlideInterval = setInterval(() => {
                this.nextSlide();
            }, 5000);
        };

        this.restartAutoSlide = () => {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        };

        // Pause on hover
        carousel.addEventListener('mouseenter', () => {
            clearInterval(autoSlideInterval);
        });

        carousel.addEventListener('mouseleave', () => {
            startAutoSlide();
        });

        // Touch/swipe support for mobile
        this.initializeCarouselTouch(carousel);

        // Start auto-slide
        startAutoSlide();

        // Keyboard navigation
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousSlide();
                this.restartAutoSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
                this.restartAutoSlide();
            }
        });
    },

    // Touch/swipe support for carousel
    initializeCarouselTouch(carousel) {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;

        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        carousel.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Prevent scrolling
        });

        carousel.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;

            const deltaX = endX - startX;
            const deltaY = endY - startY;

            // Check if horizontal swipe is more significant than vertical
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    this.previousSlide();
                } else {
                    this.nextSlide();
                }
                this.restartAutoSlide();
            }
        });
    },

    // Carousel navigation methods
    nextSlide() {
        const items = document.querySelectorAll('.carousel-item');
        if (items.length === 0) return;

        items[this.currentSlide].classList.remove('active');
        this.currentSlide = (this.currentSlide + 1) % items.length;
        items[this.currentSlide].classList.add('active');

        this.announceSlideChange();
    },

    previousSlide() {
        const items = document.querySelectorAll('.carousel-item');
        if (items.length === 0) return;

        items[this.currentSlide].classList.remove('active');
        this.currentSlide = this.currentSlide === 0 ? items.length - 1 : this.currentSlide - 1;
        items[this.currentSlide].classList.add('active');

        this.announceSlideChange();
    },

    // Accessibility: announce slide changes
    announceSlideChange() {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Slide ${this.currentSlide + 1} of ${document.querySelectorAll('.carousel-item').length}`;
        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    },

    // Enhanced product card interactions
    initializeProductCards() {
        const productCards = document.querySelectorAll('.product-card, [class*="bg-white"][class*="rounded-lg"]');

        productCards.forEach(card => {
            // Add enhanced hover effects
            card.addEventListener('mouseenter', () => {
                this.animateCardHover(card, true);
            });

            card.addEventListener('mouseleave', () => {
                this.animateCardHover(card, false);
            });

            // Add to cart functionality
            const addToCartBtn = card.querySelector('button');
            if (addToCartBtn && addToCartBtn.textContent.includes('Add to Cart')) {
                addToCartBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.addToCart(card);
                });
            }
        });
    },

    // Animate card hover effects
    animateCardHover(card, isHover) {
        const img = card.querySelector('img');
        const button = card.querySelector('button');

        if (isHover) {
            card.style.transform = 'translateY(-8px) scale(1.02)';
            if (img) img.style.transform = 'scale(1.05)';
            if (button) button.style.transform = 'scale(1.05)';
        } else {
            card.style.transform = 'translateY(0) scale(1)';
            if (img) img.style.transform = 'scale(1)';
            if (button) button.style.transform = 'scale(1)';
        }
    },

    // Add to cart functionality
    addToCart(productCard) {
        const productName = productCard.querySelector('h3')?.textContent || 'Unknown Product';
        const productPrice = productCard.querySelector('[class*="text-blue-500"]')?.textContent || '$0.00';
        const productImage = productCard.querySelector('img')?.src || '';

        const product = {
            id: Date.now(),
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        };

        // Check if product already exists in cart
        const existingProduct = this.cart.find(item => item.name === product.name);

        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            this.cart.push(product);
        }

        // Save to localStorage
        localStorage.setItem('eShopCart', JSON.stringify(this.cart));

        // Update cart display
        this.updateCartDisplay();

        // Show success animation
        this.showAddToCartAnimation(productCard);

        // Show notification
        this.showNotification(`${productName} added to cart!`, 'success');
    },

    // Update cart badge
    updateCartDisplay() {
        const cartBadge = document.querySelector('.fa-shopping-cart').parentElement.querySelector('span');
        if (cartBadge) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartBadge.textContent = totalItems;

            if (totalItems > 0) {
                cartBadge.classList.add('cart-badge');
            }
        }
    },

    // Add to cart animation
    showAddToCartAnimation(productCard) {
        const button = productCard.querySelector('button');
        if (!button) return;

        const originalText = button.textContent;
        const originalBg = button.style.background;

        button.innerHTML = '<span class="loading"></span> Adding...';
        button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        button.disabled = true;

        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-check"></i> Added!';

            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = originalBg;
                button.disabled = false;
            }, 1500);
        }, 800);
    },

    // Newsletter form functionality
    initializeNewsletterForm() {
        const form = document.querySelector('footer form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = form.querySelector('input[type="email"]');
            const button = form.querySelector('button');

            if (!this.validateEmail(email.value)) {
                this.showNotification('Please enter a valid email address.', 'error');
                email.focus();
                return;
            }

            // Simulate API call
            const originalText = button.textContent;
            button.innerHTML = '<span class="loading"></span> Subscribing...';
            button.disabled = true;

            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
                email.value = '';
                this.showNotification('Thank you for subscribing to our newsletter!', 'success');

                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 2000);
            }, 1500);
        });
    },

    // Form validation
    initializeFormValidation() {
        const inputs = document.querySelectorAll('input[type="email"]');

        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                if (input.value && !this.validateEmail(input.value)) {
                    input.style.borderColor = '#ef4444';
                    input.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                } else {
                    input.style.borderColor = '';
                    input.style.boxShadow = '';
                }
            });

            input.addEventListener('input', () => {
                if (input.style.borderColor === 'rgb(239, 68, 68)') {
                    input.style.borderColor = '';
                    input.style.boxShadow = '';
                }
            });
        });
    },

    // Email validation
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Lazy loading for images
    initializeLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    },

    // Theme toggle functionality
    initializeThemeToggle() {
        const themeToggle = document.querySelector('#themeToggle');
        if (!themeToggle) return;

        const currentTheme = localStorage.getItem('eShopTheme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);

        themeToggle.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('eShopTheme', newTheme);
        });
    },

    // Keyboard navigation
    initializeKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // ESC to close modals/menus
            if (e.key === 'Escape') {
                const mobileMenu = document.querySelector('.mobile-menu');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }

            // Ctrl/Cmd + K for search (if implemented)
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('input[type="search"]');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        });
    },

    // Initialize animations on scroll
    initializeAnimations() {
        const animatedElements = document.querySelectorAll('.feature-card, .product-card, [class*="bg-white"][class*="rounded-lg"]');

        if ('IntersectionObserver' in window) {
            const animationObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            animatedElements.forEach((el, index) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
                animationObserver.observe(el);
            });
        }
    },

    // Handle window resize
    handleResize() {
        // Recalculate any size-dependent elements
        const carousel = document.querySelector('.carousel');
        if (carousel) {
            // Reset carousel if needed
        }
    },

    // Smooth scroll function
    smoothScrollTo(target, duration = 800) {
        const start = window.pageYOffset;
        const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();

        const documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
        const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
        const destinationOffset = typeof target === 'number' ? target : target.offsetTop;
        const destinationOffsetToScroll = Math.round(documentHeight - destinationOffset < windowHeight ? documentHeight - windowHeight : destinationOffset);

        if ('requestAnimationFrame' in window === false) {
            window.scroll(0, destinationOffsetToScroll);
            return;
        }

        const scroll = () => {
            const now = 'now' in window.performance ? performance.now() : new Date().getTime();
            const time = Math.min(1, ((now - startTime) / duration));
            const timeFunction = this.easeInOutQuad(time);
            window.scroll(0, Math.ceil((timeFunction * (destinationOffsetToScroll - start)) + start));

            if (window.pageYOffset === destinationOffsetToScroll) {
                return;
            }

            requestAnimationFrame(scroll);
        };

        scroll();
    },

    // Easing function
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },

    // Notification system
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close" aria-label="Close notification">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

        // Add styles
        notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 1rem;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.closeNotification(notification);
        });

        // Auto close after 5 seconds
        setTimeout(() => {
            this.closeNotification(notification);
        }, 5000);
    },

    closeNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    },

    // Utility functions
    throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Professional Pagination System
    initializePagination() {
        this.pagination = {
            currentPage: 1,
            totalPages: 8,
            itemsPerPage: 10,
            totalItems: 75,
            startItem: 1,
            endItem: 10
        };

        this.setupPaginationEventListeners();
        this.updatePaginationDisplay();
    },

    setupPaginationEventListeners() {
        // Page number buttons
        const pageLinks = document.querySelectorAll('.pagination-link');
        pageLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(link.dataset.page);
                if (!isNaN(page)) {
                    this.goToPage(page);
                }
            });
        });

        // Navigation buttons
        const prevBtn = document.querySelector('.pagination-prev');
        const nextBtn = document.querySelector('.pagination-next');
        const firstBtn = document.querySelector('.pagination-first');
        const lastBtn = document.querySelector('.pagination-last');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.pagination.currentPage > 1) {
                    this.goToPage(this.pagination.currentPage - 1);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.pagination.currentPage < this.pagination.totalPages) {
                    this.goToPage(this.pagination.currentPage + 1);
                }
            });
        }

        if (firstBtn) {
            firstBtn.addEventListener('click', () => {
                this.goToPage(1);
            });
        }

        if (lastBtn) {
            lastBtn.addEventListener('click', () => {
                this.goToPage(this.pagination.totalPages);
            });
        }

        // Items per page select
        const itemsPerPageSelect = document.getElementById('items-per-page');
        if (itemsPerPageSelect) {
            itemsPerPageSelect.addEventListener('change', (e) => {
                this.changeItemsPerPage(parseInt(e.target.value));
            });
        }

        // Page jump functionality
        const pageJumpInput = document.getElementById('page-jump');
        const jumpBtn = document.getElementById('jump-btn');

        if (jumpBtn) {
            jumpBtn.addEventListener('click', () => {
                const page = parseInt(pageJumpInput.value);
                if (!isNaN(page) && page >= 1 && page <= this.pagination.totalPages) {
                    this.goToPage(page);
                    pageJumpInput.value = '';
                } else {
                    this.showNotification('Please enter a valid page number', 'error');
                    pageJumpInput.focus();
                }
            });
        }

        if (pageJumpInput) {
            pageJumpInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    jumpBtn.click();
                }
            });

            pageJumpInput.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value)) {
                    if (value < 1) e.target.value = 1;
                    if (value > this.pagination.totalPages) e.target.value = this.pagination.totalPages;
                }
            });
        }

        // Keyboard navigation for pagination
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.pagination-section')) {
                if (e.key === 'ArrowLeft' && this.pagination.currentPage > 1) {
                    e.preventDefault();
                    this.goToPage(this.pagination.currentPage - 1);
                } else if (e.key === 'ArrowRight' && this.pagination.currentPage < this.pagination.totalPages) {
                    e.preventDefault();
                    this.goToPage(this.pagination.currentPage + 1);
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    this.goToPage(1);
                } else if (e.key === 'End') {
                    e.preventDefault();
                    this.goToPage(this.pagination.totalPages);
                }
            }
        });
    },

    goToPage(page, showLoading = true) {
        if (page < 1 || page > this.pagination.totalPages || page === this.pagination.currentPage) {
            return;
        }

        // Show loading state
        if (showLoading) {
            this.showPaginationLoading();
        }

        // Update pagination state
        this.pagination.currentPage = page;
        this.calculatePaginationData();

        // Simulate API call delay
        setTimeout(() => {
            this.updatePaginationDisplay();
            this.loadPageData(page);
            this.hidePaginationLoading();

            // Scroll to top of results
            const catalogSection = document.querySelector('.table-container');
            if (catalogSection) {
                this.smoothScrollTo(catalogSection.offsetTop - 100, 500);
            }

            // Announce page change for accessibility
            this.announcePaginationChange(page);

            // Update URL without reload (if using modern browsers)
            if (history.pushState) {
                const url = new URL(window.location);
                url.searchParams.set('page', page);
                history.pushState({ page }, '', url);
            }
        }, 300);
    },

    changeItemsPerPage(newItemsPerPage) {
        this.pagination.itemsPerPage = newItemsPerPage;
        this.pagination.totalPages = Math.ceil(this.pagination.totalItems / newItemsPerPage);

        // Adjust current page if needed
        if (this.pagination.currentPage > this.pagination.totalPages) {
            this.pagination.currentPage = this.pagination.totalPages;
        }

        this.calculatePaginationData();
        this.updatePaginationDisplay();
        this.loadPageData(this.pagination.currentPage);

        this.showNotification(`Showing ${newItemsPerPage} items per page`, 'info');
    },

    calculatePaginationData() {
        const { currentPage, itemsPerPage, totalItems } = this.pagination;

        this.pagination.startItem = (currentPage - 1) * itemsPerPage + 1;
        this.pagination.endItem = Math.min(currentPage * itemsPerPage, totalItems);
    },

    updatePaginationDisplay() {
        this.updatePaginationInfo();
        this.updatePaginationButtons();
        this.updatePageNumbers();
    },

    updatePaginationInfo() {
        const startItemSpan = document.getElementById('start-item');
        const endItemSpan = document.getElementById('end-item');
        const totalItemsSpan = document.getElementById('total-items');

        if (startItemSpan) startItemSpan.textContent = this.pagination.startItem;
        if (endItemSpan) endItemSpan.textContent = this.pagination.endItem;
        if (totalItemsSpan) totalItemsSpan.textContent = this.pagination.totalItems;
    },

    updatePaginationButtons() {
        const { currentPage, totalPages } = this.pagination;

        const prevBtn = document.querySelector('.pagination-prev');
        const nextBtn = document.querySelector('.pagination-next');
        const firstBtn = document.querySelector('.pagination-first');
        const lastBtn = document.querySelector('.pagination-last');

        if (prevBtn) {
            prevBtn.disabled = currentPage <= 1;
            prevBtn.setAttribute('aria-disabled', currentPage <= 1);
        }

        if (nextBtn) {
            nextBtn.disabled = currentPage >= totalPages;
            nextBtn.setAttribute('aria-disabled', currentPage >= totalPages);
        }

        if (firstBtn) {
            firstBtn.disabled = currentPage <= 1;
            firstBtn.setAttribute('aria-disabled', currentPage <= 1);
        }

        if (lastBtn) {
            lastBtn.disabled = currentPage >= totalPages;
            lastBtn.setAttribute('aria-disabled', currentPage >= totalPages);
        }
    },

    updatePageNumbers() {
        const { currentPage, totalPages } = this.pagination;
        const paginationList = document.querySelector('.pagination-list');

        if (!paginationList) return;

        // Generate page numbers with smart ellipsis
        const pageNumbers = this.generatePageNumbers(currentPage, totalPages);

        // Update existing page links
        const pageLinks = paginationList.querySelectorAll('.pagination-link');
        pageLinks.forEach((link, index) => {
            if (pageNumbers[index] !== undefined) {
                link.textContent = pageNumbers[index];
                link.dataset.page = pageNumbers[index];
                link.classList.toggle('active', pageNumbers[index] === currentPage);
                link.setAttribute('aria-current', pageNumbers[index] === currentPage ? 'page' : 'false');
                link.setAttribute('aria-label', `${pageNumbers[index] === currentPage ? 'Current page, ' : 'Go to '}page ${pageNumbers[index]}`);
                link.style.display = 'inline-flex';
            } else {
                link.style.display = 'none';
            }
        });

        // Update ellipsis visibility
        const ellipsis = paginationList.querySelector('.pagination-ellipsis');
        if (ellipsis) {
            ellipsis.style.display = totalPages > 5 && currentPage < totalPages - 2 ? 'flex' : 'none';
        }
    },

    generatePageNumbers(currentPage, totalPages) {
        const pages = [];

        if (totalPages <= 7) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Smart pagination with ellipsis
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5);
            } else if (currentPage >= totalPages - 3) {
                pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
            }
        }

        return pages;
    },

    loadPageData(page) {
        // Simulate loading new data
        console.log(`Loading data for page ${page}`);

        // In a real application, this would make an API call
        // For demo purposes, we'll just update the table with new data
        this.updateTableData(page);
    },

    updateTableData(page) {
        const tableBody = document.querySelector('.table-container tbody');
        if (!tableBody) return;

        // Generate sample data based on page
        const startIndex = (page - 1) * this.pagination.itemsPerPage;
        const rows = [];

        for (let i = 0; i < this.pagination.itemsPerPage && startIndex + i < this.pagination.totalItems; i++) {
            const productNumber = startIndex + i + 1;
            rows.push(`
        <tr class="hover:bg-blue-50">
          <td class="py-2 px-4 border-b">Product ${productNumber}</td>
          <td class="py-2 px-4 border-b">Description for Product ${productNumber}</td>
          <td class="py-2 px-4 border-b">$${(Math.random() * 200 + 50).toFixed(2)}</td>
          <td class="py-2 px-4 border-b">
            <button class="btn-primary bg-blue-500 text-white px-4 py-2 rounded">Add to Cart</button>
          </td>
        </tr>
      `);
        }

        tableBody.innerHTML = rows.join('');

        // Re-initialize button functionality for new rows
        this.initializeProductCards();
    },

    showPaginationLoading() {
        const paginationSection = document.querySelector('.pagination-section');
        if (paginationSection) {
            paginationSection.classList.add('pagination-loading');
        }
    },

    hidePaginationLoading() {
        const paginationSection = document.querySelector('.pagination-section');
        if (paginationSection) {
            paginationSection.classList.remove('pagination-loading');
        }
    },

    announcePaginationChange(page) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Now showing page ${page} of ${this.pagination.totalPages}`;
        document.body.appendChild(announcement);

        setTimeout(() => {
            if (announcement.parentNode) {
                document.body.removeChild(announcement);
            }
        }, 1000);
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    eShopApp.init();

    // Handle browser back/forward for pagination
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.page) {
            eShopApp.goToPage(e.state.page, false);
        }
    });

    // Initialize pagination from URL
    const urlParams = new URLSearchParams(window.location.search);
    const pageFromUrl = parseInt(urlParams.get('page'));
    if (!isNaN(pageFromUrl) && pageFromUrl >= 1) {
        eShopApp.goToPage(pageFromUrl, false);
    }
});

// Handle page visibility changes (pause animations when tab is not active)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations and intervals
        console.log('Page hidden - pausing animations');
    } else {
        // Resume animations
        console.log('Page visible - resuming animations');
    }
});

// Service Worker registration for PWA functionality (if needed)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = eShopApp;
}
