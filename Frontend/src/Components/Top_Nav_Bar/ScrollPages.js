class ScrollPages {
  constructor(currentPageNumber, totalPageNumber, pages) {
    this.currentPageNumber = currentPageNumber;
    this.totalPageNumber = totalPageNumber;
    this.pages = pages;
    this.viewHeight = document.documentElement.clientHeight;
    this.isScrolling = false;
    this.touchStartY = 0;
    this.scrollThreshold = 50; // Minimum scroll distance for touch events
  }

  mouseScroll(event) {
    event.preventDefault();
    if (this.isScrolling) return;

    const delta = helper.getDelta(event);
    const absDelta = Math.abs(delta);
    
    // Only trigger scroll if the delta is significant enough
    if (absDelta > 20) {
      if (delta < 0) {
        this.scrollDown();
      } else {
        this.scrollUp();
      }
    }
  }

  scrollDown() {
    if (this.currentPageNumber < this.totalPageNumber && !this.isScrolling) {
      this.isScrolling = true;
      this.pages.style.top = -this.viewHeight * this.currentPageNumber + 'px';
      this.currentPageNumber++;
      this.updateNav();
      this.textFadeInOut();
      
      setTimeout(() => {
        this.isScrolling = false;
      }, 1000); // Lock scrolling for 1 second during transition
    }
  }

  scrollUp() {
    if (this.currentPageNumber > 1 && !this.isScrolling) {
      this.isScrolling = true;
      this.pages.style.top = -this.viewHeight * (this.currentPageNumber - 2) + 'px';
      this.currentPageNumber--;
      this.updateNav();
      this.textFadeInOut();
      
      setTimeout(() => {
        this.isScrolling = false;
      }, 1000); // Lock scrolling for 1 second during transition
    }
  }

  scrollTo(pageNumber) {
    if (this.isScrolling || pageNumber === this.currentPageNumber) return;
    
    this.isScrolling = true;
    this.pages.style.top = -this.viewHeight * (pageNumber - 1) + 'px';
    this.currentPageNumber = pageNumber;
    this.updateNav();
    this.textFadeInOut();
    
    setTimeout(() => {
      this.isScrolling = false;
    }, 1000);
  }

  createNav() {
    const pageNav = document.createElement('div');
    pageNav.className = 'nav-dot-container';
    this.pages.appendChild(pageNav);

    for (let i = 0; i < this.totalPageNumber; i++) {
      pageNav.innerHTML += '<p class="nav-dot"><span></span></p>';
    }

    const navDots = document.getElementsByClassName('nav-dot');
    this.navDots = Array.from(navDots);
    this.navDots[0].classList.add('dot-active');

    this.navDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        if (!this.isScrolling) {
          this.scrollTo(index + 1);
        }
      });
    });
  }

  updateNav() {
    this.navDots.forEach((dot) => dot.classList.remove('dot-active'));
    this.navDots[this.currentPageNumber - 1].classList.add('dot-active');
  }

  textFadeInOut() {
    const containers = document.getElementsByClassName('text-container');
    Array.from(containers).forEach((container) => container.classList.remove('in-sight'));
    containers[this.currentPageNumber - 1].classList.add('in-sight');
  }

  resize() {
    this.viewHeight = document.documentElement.clientHeight;
    this.pages.style.height = `${this.viewHeight}px`;
    this.pages.style.top = `-${this.viewHeight * (this.currentPageNumber - 1)}px`;
  }

  handleTouchStart(e) {
    this.touchStartY = e.touches[0].pageY;
  }

  handleTouchEnd(e) {
    if (this.isScrolling) return;
    
    const touchEndY = e.changedTouches[0].pageY;
    const deltaY = this.touchStartY - touchEndY;
    
    // Only trigger scroll if the touch movement is significant enough
    if (Math.abs(deltaY) > this.scrollThreshold) {
      if (deltaY > 0) {
        this.scrollDown();
      } else {
        this.scrollUp();
      }
    }
  }

  init() {
    const handleMouseWheel = helper.throttle(this.mouseScroll.bind(this), 100, this);
    const handleResize = helper.debounce(this.resize.bind(this), 500, this);

    this.pages.style.height = `${this.viewHeight}px`;
    this.createNav();
    this.textFadeInOut();

    if (navigator.userAgent.toLowerCase().includes('firefox')) {
      document.addEventListener('DOMMouseScroll', handleMouseWheel, { passive: false });
    } else {
      document.addEventListener('wheel', handleMouseWheel, { passive: false });
    }

    document.addEventListener('touchstart', this.handleTouchStart.bind(this));
    document.addEventListener('touchend', this.handleTouchEnd.bind(this));
    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    window.addEventListener('resize', handleResize);

    // Store event handlers for cleanup
    this.handlers = {
      mouseWheel: handleMouseWheel,
      resize: handleResize,
      touchStart: this.handleTouchStart.bind(this),
      touchEnd: this.handleTouchEnd.bind(this),
      touchMove: (e) => e.preventDefault()
    };
  }

  destroy() {
    if (this.handlers) {
      if (navigator.userAgent.toLowerCase().includes('firefox')) {
        document.removeEventListener('DOMMouseScroll', this.handlers.mouseWheel);
      } else {
        document.removeEventListener('wheel', this.handlers.mouseWheel);
      }
      document.removeEventListener('touchstart', this.handlers.touchStart);
      document.removeEventListener('touchend', this.handlers.touchEnd);
      document.removeEventListener('touchmove', this.handlers.touchMove);
      window.removeEventListener('resize', this.handlers.resize);
    }
  }
}

const helper = {
  getDelta(event) {
    return event.wheelDelta ? event.wheelDelta : -event.detail;
  },
  throttle(method, delay, context) {
    let inThrottle = false;
    return function (event) {
      if (!inThrottle) {
        inThrottle = true;
        method.apply(context, [event]);
        setTimeout(() => {
          inThrottle = false;
        }, delay);
      }
      event.preventDefault();
    };
  },
  debounce(method, delay, context) {
    let inDebounce;
    return function () {
      clearTimeout(inDebounce);
      inDebounce = setTimeout(() => method.apply(context, arguments), delay);
    };
  }
};

export default ScrollPages;