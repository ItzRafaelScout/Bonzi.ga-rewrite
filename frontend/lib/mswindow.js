"use strict";

/**
 * MSWindow - Windows XP styled window component
 * Creates draggable windows with XP styling for Bonzi.ga
 */
class MSWindow {
  /**
   * Create a new Windows XP styled window
   * @param {string} title - Window title
   * @param {string} html - HTML content for window body
   * @param {number} x - Initial X position (optional)
   * @param {number} y - Initial Y position (optional)
   * @param {number} width - Window width (optional)
   * @param {number} height - Window height (optional)
   * @param {Object} buttons - Custom buttons configuration (optional)
   */
  constructor(title, html, x, y, width, height, buttons) {
    // Default values
    this.title = title || "Window";
    this.content = html || "";
    this.x = x || 100;
    this.y = y || 100;
    this.width = width || 300;
    this.height = height || 200;
    this.id = "window_" + Math.floor(Math.random() * 10000000);
    this.zIndex = 1000;
    this.buttons = buttons || { close: true, minimize: true, maximize: true };
    
    // Create the window
    this.create();
    this.setupEvents();
  }
  
  /**
   * Create the window DOM structure
   */
  create() {
    // Create main window container
    const windowHTML = `
      <div id="${this.id}" class="mswindow" style="width:${this.width}px;height:${this.height}px;left:${this.x}px;top:${this.y}px;z-index:${this.zIndex};">
        <div class="mswindow-titlebar">
          <div class="mswindow-title">${this.title}</div>
          <div class="mswindow-buttons">
            ${this.buttons.minimize ? '<div class="mswindow-button mswindow-minimize"></div>' : ''}
            ${this.buttons.maximize ? '<div class="mswindow-button mswindow-maximize"></div>' : ''}
            ${this.buttons.close ? '<div class="mswindow-button mswindow-close"></div>' : ''}
          </div>
        </div>
        <div class="mswindow-content">${this.content}</div>
        <div class="mswindow-resize"></div>
      </div>
    `;
    
    // Append to body
    document.body.insertAdjacentHTML('beforeend', windowHTML);
    
    // Store references to DOM elements
    this.element = document.getElementById(this.id);
    this.titleBar = this.element.querySelector('.mswindow-titlebar');
    this.contentArea = this.element.querySelector('.mswindow-content');
    this.closeButton = this.element.querySelector('.mswindow-close');
    this.minimizeButton = this.element.querySelector('.mswindow-minimize');
    this.maximizeButton = this.element.querySelector('.mswindow-maximize');
    this.resizeHandle = this.element.querySelector('.mswindow-resize');
  }
  
  /**
   * Set up event listeners for window interactions
   */
  setupEvents() {
    // Make window draggable by title bar
    this.setupDragging();
    
    // Window buttons
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.close());
    }
    
    if (this.minimizeButton) {
      this.minimizeButton.addEventListener('click', () => this.minimize());
    }
    
    if (this.maximizeButton) {
      this.maximizeButton.addEventListener('click', () => this.maximize());
    }
    
    // Focus window on click
    this.element.addEventListener('mousedown', () => this.focus());
    
    // Resize functionality
    if (this.resizeHandle) {
      this.setupResize();
    }
  }
  
  /**
   * Set up dragging functionality
   */
  setupDragging() {
    let offsetX, offsetY, isDragging = false;
    
    this.titleBar.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - this.element.offsetLeft;
      offsetY = e.clientY - this.element.offsetTop;
      this.focus();
      
      // Prevent text selection during drag
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;
      
      this.element.style.left = `${newX}px`;
      this.element.style.top = `${newY}px`;
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }
  
  /**
   * Set up resize functionality
   */
  setupResize() {
    let startX, startY, startWidth, startHeight, isResizing = false;
    
    this.resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = this.element.offsetWidth;
      startHeight = this.element.offsetHeight;
      this.focus();
      
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      
      const newWidth = startWidth + (e.clientX - startX);
      const newHeight = startHeight + (e.clientY - startY);
      
      if (newWidth >= 200) {
        this.element.style.width = `${newWidth}px`;
      }
      
      if (newHeight >= 120) {
        this.element.style.height = `${newHeight}px`;
      }
    });
    
    document.addEventListener('mouseup', () => {
      isResizing = false;
    });
  }
  
  /**
   * Bring window to front
   */
  focus() {
    // Get all windows and set their z-index lower
    const windows = document.querySelectorAll('.mswindow');
    windows.forEach(win => {
      win.style.zIndex = 1000;
    });
    
    // Set this window's z-index higher
    this.element.style.zIndex = 1001;
    this.element.classList.add('mswindow-active');
    
    // Remove active class from other windows
    windows.forEach(win => {
      if (win.id !== this.id) {
        win.classList.remove('mswindow-active');
      }
    });
  }
  
  /**
   * Close the window
   */
  close() {
    this.element.remove();
  }
  
  /**
   * Minimize the window (just hides it for now)
   */
  minimize() {
    this.element.style.display = 'none';
  }
  
  /**
   * Maximize or restore the window
   */
  maximize() {
    if (!this.isMaximized) {
      // Store original dimensions for restore
      this.originalDimensions = {
        width: this.element.style.width,
        height: this.element.style.height,
        left: this.element.style.left,
        top: this.element.style.top
      };
      
      // Maximize
      this.element.style.width = '100%';
      this.element.style.height = 'calc(100% - 30px)'; // Account for taskbar
      this.element.style.left = '0';
      this.element.style.top = '0';
      this.isMaximized = true;
    } else {
      // Restore
      this.element.style.width = this.originalDimensions.width;
      this.element.style.height = this.originalDimensions.height;
      this.element.style.left = this.originalDimensions.left;
      this.element.style.top = this.originalDimensions.top;
      this.isMaximized = false;
    }
  }
  
  /**
   * Set window content
   * @param {string} html - New HTML content
   */
  setContent(html) {
    this.contentArea.innerHTML = html;
  }
  
  /**
   * Set window title
   * @param {string} title - New window title
   */
  setTitle(title) {
    this.title = title;
    this.titleBar.querySelector('.mswindow-title').textContent = title;
  }
}
