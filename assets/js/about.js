function initializeDynamicContent() {
    // Animate stats counting with improved performance
    const animateCount = (elementId, target, suffix = '') => {
      const element = document.getElementById(elementId);
      if (!element) return;
      
      const current = parseInt(element.textContent.replace(/\D/g, '')) || 0;
      const duration = 1500; // ms
      const startTime = performance.now();
      
      const updateCount = (timestamp) => {
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const value = Math.floor(current + (target - current) * progress);
        element.textContent = value + suffix;
        
        if (progress < 1) {
          requestAnimationFrame(updateCount);
        }
      };
      
      requestAnimationFrame(updateCount);
    };

    // Only animate when in viewport
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount('downloadsCount', 12500, '+');
          animateCount('contributorsCount', 57, '+');
          animateCount('releasesCount', 15);
          animateCount('countriesCount', 35, '+');
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) statsObserver.observe(statsSection);

    // General animation for cards
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'translateY(0)';
          entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.mission-card, .vision-card, .value-card, .team-member, .stat-card, .timeline-content').forEach(item => {
      item.style.opacity = 0;
      item.style.transform = 'translateY(20px)';
      cardObserver.observe(item);
    });

    // Lazy load images
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  document.addEventListener('DOMContentLoaded', initializeDynamicContent);