   function initializeDynamicContent() {
      const observerOptions = {
        threshold: 0.1
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, observerOptions);
      
      document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
      });
    }

    document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('scrollDownBtn').addEventListener('click', function() {
      window.scrollToSection('.features-section');
    });
  });
