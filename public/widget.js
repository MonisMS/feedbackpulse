/**
 * FeedbackPulse Widget
 * Standalone feedback collection widget (no dependencies)
 */
(function() {
  'use strict';

  // Get project key from script tag
  var currentScript = document.currentScript || document.querySelector('script[data-project-key]');
  var PROJECT_KEY = currentScript ? currentScript.getAttribute('data-project-key') : null;
  var API_URL = currentScript ? currentScript.getAttribute('data-api-url') || window.location.origin : window.location.origin;

  if (!PROJECT_KEY) {
    console.error('FeedbackPulse: No project key provided');
    return;
  }

  // Widget state
  var isOpen = false;
  var isSubmitting = false;

  // Create widget HTML
  function createWidget() {
    // Widget button (trigger)
    var button = document.createElement('div');
    button.id = 'feedbackpulse-btn';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span>Feedback</span>
    `;
    
    // Modal overlay
    var overlay = document.createElement('div');
    overlay.id = 'feedbackpulse-overlay';
    
    // Modal
    var modal = document.createElement('div');
    modal.id = 'feedbackpulse-modal';
    modal.innerHTML = `
      <div class="feedbackpulse-header">
        <h3>Send Feedback</h3>
        <button id="feedbackpulse-close" aria-label="Close">&times;</button>
      </div>
      <form id="feedbackpulse-form">
        <div class="feedbackpulse-field">
          <label for="feedback-type">Feedback Type *</label>
          <select id="feedback-type" required>
            <option value="">Select type</option>
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div class="feedbackpulse-field">
          <label for="feedback-message">Message *</label>
          <textarea id="feedback-message" rows="4" placeholder="Tell us what's on your mind..." required></textarea>
        </div>
        
        <div class="feedbackpulse-field">
          <label for="feedback-name">Name (optional)</label>
          <input type="text" id="feedback-name" placeholder="Your name">
        </div>
        
        <div class="feedbackpulse-field">
          <label for="feedback-email">Email (optional)</label>
          <input type="email" id="feedback-email" placeholder="your@email.com">
        </div>
        
        <div id="feedbackpulse-error" class="feedbackpulse-error" style="display: none;"></div>
        <div id="feedbackpulse-success" class="feedbackpulse-success" style="display: none;">
          Thank you! Your feedback has been submitted.
        </div>
        
        <button type="submit" id="feedbackpulse-submit">Send Feedback</button>
      </form>
    `;
    
    overlay.appendChild(modal);
    
    // Add styles
    var style = document.createElement('style');
    style.textContent = `
      #feedbackpulse-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #2563eb;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        z-index: 999998;
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
      }
      #feedbackpulse-btn:hover {
        background: #1d4ed8;
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.5);
        transform: translateY(-2px);
      }
      #feedbackpulse-btn svg {
        width: 20px;
        height: 20px;
      }
      
      #feedbackpulse-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999999;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      #feedbackpulse-overlay.active {
        display: flex;
      }
      
      #feedbackpulse-modal {
        background: white;
        border-radius: 12px;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: feedbackpulse-slideIn 0.3s ease-out;
      }
      
      @keyframes feedbackpulse-slideIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .feedbackpulse-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #e5e7eb;
      }
      .feedbackpulse-header h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #111827;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      #feedbackpulse-close {
        background: none;
        border: none;
        font-size: 28px;
        color: #6b7280;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s;
      }
      #feedbackpulse-close:hover {
        background: #f3f4f6;
        color: #111827;
      }
      
      #feedbackpulse-form {
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .feedbackpulse-field {
        margin-bottom: 16px;
      }
      .feedbackpulse-field label {
        display: block;
        margin-bottom: 6px;
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }
      .feedbackpulse-field input,
      .feedbackpulse-field textarea,
      .feedbackpulse-field select {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        font-family: inherit;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }
      .feedbackpulse-field input:focus,
      .feedbackpulse-field textarea:focus,
      .feedbackpulse-field select:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }
      .feedbackpulse-field textarea {
        resize: vertical;
        min-height: 80px;
      }
      
      #feedbackpulse-submit {
        width: 100%;
        background: #2563eb;
        color: white;
        border: none;
        padding: 12px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
        font-family: inherit;
      }
      #feedbackpulse-submit:hover:not(:disabled) {
        background: #1d4ed8;
      }
      #feedbackpulse-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .feedbackpulse-error {
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #dc2626;
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 16px;
        font-size: 14px;
      }
      .feedbackpulse-success {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        color: #16a34a;
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 16px;
        font-size: 14px;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(button);
    document.body.appendChild(overlay);
    
    // Event listeners
    button.addEventListener('click', openModal);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeModal();
    });
    document.getElementById('feedbackpulse-close').addEventListener('click', closeModal);
    document.getElementById('feedbackpulse-form').addEventListener('submit', handleSubmit);
  }

  function openModal() {
    isOpen = true;
    document.getElementById('feedbackpulse-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    isOpen = false;
    document.getElementById('feedbackpulse-overlay').classList.remove('active');
    document.body.style.overflow = '';
    resetForm();
  }

  function resetForm() {
    document.getElementById('feedbackpulse-form').reset();
    document.getElementById('feedbackpulse-error').style.display = 'none';
    document.getElementById('feedbackpulse-success').style.display = 'none';
  }

  function showError(message) {
    var errorEl = document.getElementById('feedbackpulse-error');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    document.getElementById('feedbackpulse-success').style.display = 'none';
  }

  function showSuccess() {
    document.getElementById('feedbackpulse-success').style.display = 'block';
    document.getElementById('feedbackpulse-error').style.display = 'none';
  }

  function validateForm(type, message, email) {
    // Validate type
    if (!type || type === '') {
      return { valid: false, error: 'Please select a feedback type' };
    }
    if (!['bug', 'feature', 'other'].includes(type)) {
      return { valid: false, error: 'Invalid feedback type' };
    }

    // Validate message
    if (!message || message.trim() === '') {
      return { valid: false, error: 'Message is required' };
    }
    if (message.trim().length < 10) {
      return { valid: false, error: 'Message must be at least 10 characters' };
    }
    if (message.trim().length > 1000) {
      return { valid: false, error: 'Message must be less than 1000 characters' };
    }

    // Validate email if provided
    if (email && email.trim() !== '') {
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return { valid: false, error: 'Please enter a valid email address' };
      }
    }

    return { valid: true };
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    var type = document.getElementById('feedback-type').value;
    var message = document.getElementById('feedback-message').value;
    var name = document.getElementById('feedback-name').value;
    var email = document.getElementById('feedback-email').value;
    
    // Validate form
    var validation = validateForm(type, message, email);
    if (!validation.valid) {
      showError(validation.error);
      return;
    }
    
    isSubmitting = true;
    var submitBtn = document.getElementById('feedbackpulse-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    // Submit feedback
    fetch(API_URL + '/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectKey: PROJECT_KEY,
        type: type,
        message: message,
        userName: name || null,
        userEmail: email || null,
      }),
    })
      .then(function(response) {
        return response.json().then(function(data) {
          return { ok: response.ok, data: data };
        });
      })
      .then(function(result) {
        if (result.ok) {
          showSuccess();
          document.getElementById('feedbackpulse-form').reset();
          setTimeout(function() {
            closeModal();
          }, 2000);
        } else {
          showError(result.data.error || 'Failed to submit feedback');
        }
      })
      .catch(function(error) {
        console.error('FeedbackPulse error:', error);
        showError('Network error. Please try again.');
      })
      .finally(function() {
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Feedback';
      });
  }

  // Initialize widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
