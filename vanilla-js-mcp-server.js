#!/usr/bin/env node
// Vanilla JS MCP Server - Web Components & DOM Manipulation
// Provides tools for creating vanilla JavaScript components and utilities

const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

// Vanilla JS MCP Tools
const VANILLA_TOOLS = {
  // Generate Web Component
  generateWebComponent: async ({ name, template, styles, methods }) => {
    try {
      const className = name.charAt(0).toUpperCase() + name.slice(1) + 'Component';
      const tagName = name.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase();

      const code = `// ${className} - Vanilla JavaScript Web Component
class ${className} extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = {};
    this.render();
  }

  // Component lifecycle
  connectedCallback() {
    console.log('${className} connected to DOM');
    this.setupEventListeners();
  }

  disconnectedCallback() {
    console.log('${className} removed from DOM');
    this.cleanupEventListeners();
  }

  static get observedAttributes() {
    return ['data', 'theme', 'disabled'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(\`Attribute \${name} changed from \${oldValue} to \${newValue}\`);
    this.handleAttributeChange(name, newValue);
  }

  // State management
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  // Render method
  render() {
    this.shadowRoot.innerHTML = \`
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        ${styles || `
        .container {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: white;
        }
        h2 {
          margin-top: 0;
          color: #333;
        }
        button {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.3s;
        }
        button:hover {
          background: #0056b3;
        }
        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        `}
      </style>
      ${template || `
      <div class="container">
        <h2>\${this.getAttribute('title') || '${className}'}</h2>
        <p>\${this.state.message || 'Web Component is ready!'}</p>
        <button id="actionBtn">Click me</button>
        <div id="content"></div>
      </div>
      `}
    \`;
  }

  // Event handling
  setupEventListeners() {
    const button = this.shadowRoot.getElementById('actionBtn');
    if (button) {
      button.addEventListener('click', this.handleClick.bind(this));
    }
  }

  cleanupEventListeners() {
    const button = this.shadowRoot.getElementById('actionBtn');
    if (button) {
      button.removeEventListener('click', this.handleClick);
    }
  }

  handleClick(event) {
    console.log('Button clicked!', event);
    this.dispatchEvent(new CustomEvent('component-click', {
      detail: { component: '${className}', timestamp: Date.now() },
      bubbles: true,
      composed: true
    }));
  }

  handleAttributeChange(name, value) {
    if (name === 'data') {
      try {
        this.state.data = JSON.parse(value);
        this.render();
      } catch (e) {
        console.error('Invalid JSON data attribute');
      }
    }
  }

  // Public methods
  ${methods || `
  reset() {
    this.state = {};
    this.render();
  }

  updateContent(content) {
    const contentDiv = this.shadowRoot.getElementById('content');
    if (contentDiv) {
      contentDiv.innerHTML = content;
    }
  }
  `}
}

// Register the component
customElements.define('${tagName}', ${className});

// Usage example:
// <${tagName} title="My Component" data='{"key": "value"}'></${tagName}>
//
// Or programmatically:
// const component = document.createElement('${tagName}');
// component.setAttribute('title', 'Dynamic Component');
// document.body.appendChild(component);

export default ${className};
`;

      const outputPath = path.join(__dirname, 'vanilla-components', `${name}-component.js`);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, code);

      return { success: true, path: outputPath, className, tagName };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Generate DOM utilities library
  generateDOMUtils: async () => {
    try {
      const code = `// Vanilla JavaScript DOM Utilities Library
const DOM = {
  // Element selection
  $: (selector, context = document) => context.querySelector(selector),
  $$: (selector, context = document) => Array.from(context.querySelectorAll(selector)),

  // Element creation
  create: (tag, attributes = {}, children = []) => {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('on')) {
        element.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        element.setAttribute(key, value);
      }
    });
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
    return element;
  },

  // Class manipulation
  addClass: (element, className) => element.classList.add(className),
  removeClass: (element, className) => element.classList.remove(className),
  toggleClass: (element, className) => element.classList.toggle(className),
  hasClass: (element, className) => element.classList.contains(className),

  // Event handling
  on: (element, event, handler, options = {}) => {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
  },

  delegate: (element, selector, event, handler) => {
    element.addEventListener(event, e => {
      const target = e.target.closest(selector);
      if (target) handler.call(target, e);
    });
  },

  // Animation helpers
  fadeIn: (element, duration = 300) => {
    element.style.opacity = 0;
    element.style.display = 'block';
    const start = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = elapsed / duration;

      if (progress < 1) {
        element.style.opacity = progress;
        requestAnimationFrame(animate);
      } else {
        element.style.opacity = 1;
      }
    };

    requestAnimationFrame(animate);
  },

  fadeOut: (element, duration = 300) => {
    const start = performance.now();
    const initialOpacity = parseFloat(getComputedStyle(element).opacity);

    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = elapsed / duration;

      if (progress < 1) {
        element.style.opacity = initialOpacity * (1 - progress);
        requestAnimationFrame(animate);
      } else {
        element.style.opacity = 0;
        element.style.display = 'none';
      }
    };

    requestAnimationFrame(animate);
  },

  // AJAX helpers
  fetch: async (url, options = {}) => {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    return response.json();
  },

  // Storage helpers
  storage: {
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    get: (key) => {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch {
        return localStorage.getItem(key);
      }
    },
    remove: (key) => localStorage.removeItem(key),
    clear: () => localStorage.clear()
  },

  // Form helpers
  serialize: (form) => {
    const formData = new FormData(form);
    const object = {};
    formData.forEach((value, key) => {
      if (object[key]) {
        if (!Array.isArray(object[key])) {
          object[key] = [object[key]];
        }
        object[key].push(value);
      } else {
        object[key] = value;
      }
    });
    return object;
  },

  // Debounce & Throttle
  debounce: (func, wait) => {
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

  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Ready state
  ready: (callback) => {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DOM;
}

// Make available globally
window.DOM = DOM;
`;

      const outputPath = path.join(__dirname, 'vanilla-utils', 'dom-utils.js');
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, code);

      return { success: true, path: outputPath };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Generate router for SPA
  generateRouter: async () => {
    try {
      const code = `// Vanilla JavaScript Router for Single Page Applications
class VanillaRouter {
  constructor(options = {}) {
    this.routes = {};
    this.currentRoute = null;
    this.rootElement = options.root || document.getElementById('app');
    this.mode = options.mode || 'hash'; // 'hash' or 'history'
    this.beforeHooks = [];
    this.afterHooks = [];

    this.init();
  }

  init() {
    if (this.mode === 'history') {
      window.addEventListener('popstate', () => this.navigate(window.location.pathname));
      document.addEventListener('click', this.handleLinkClick.bind(this));
    } else {
      window.addEventListener('hashchange', () => this.navigate(window.location.hash.slice(1)));
    }
  }

  handleLinkClick(e) {
    if (e.target.matches('[data-router-link]')) {
      e.preventDefault();
      const path = e.target.getAttribute('href');
      this.push(path);
    }
  }

  // Register routes
  route(path, handler, meta = {}) {
    const regex = this.pathToRegex(path);
    this.routes[path] = { regex, handler, meta, path };
    return this;
  }

  // Convert path to regex with parameter support
  pathToRegex(path) {
    const pattern = path
      .replace(/\\//g, '\\\\/')
      .replace(/:([^\\/]+)/g, '(?<$1>[^\\\\/]+)')
      .replace(/\\*/g, '.*');
    return new RegExp(\`^\${pattern}$\`);
  }

  // Navigate to a route
  async navigate(path) {
    path = path || '/';

    // Run before hooks
    for (const hook of this.beforeHooks) {
      const result = await hook(path, this.currentRoute);
      if (result === false) return;
    }

    // Find matching route
    let matchedRoute = null;
    let params = {};

    for (const route of Object.values(this.routes)) {
      const match = path.match(route.regex);
      if (match) {
        matchedRoute = route;
        params = match.groups || {};
        break;
      }
    }

    if (!matchedRoute) {
      matchedRoute = this.routes['*'] || { handler: () => this.render404() };
    }

    // Execute route handler
    const context = {
      path,
      params,
      query: this.parseQuery(),
      meta: matchedRoute.meta
    };

    this.currentRoute = context;

    try {
      await matchedRoute.handler(context);
    } catch (error) {
      console.error('Route handler error:', error);
      this.renderError(error);
    }

    // Run after hooks
    for (const hook of this.afterHooks) {
      await hook(path, context);
    }
  }

  // Programmatic navigation
  push(path) {
    if (this.mode === 'history') {
      window.history.pushState(null, '', path);
      this.navigate(path);
    } else {
      window.location.hash = path;
    }
  }

  replace(path) {
    if (this.mode === 'history') {
      window.history.replaceState(null, '', path);
      this.navigate(path);
    } else {
      window.location.replace(\`#\${path}\`);
    }
  }

  back() {
    window.history.back();
  }

  forward() {
    window.history.forward();
  }

  // Hooks
  beforeEach(hook) {
    this.beforeHooks.push(hook);
    return this;
  }

  afterEach(hook) {
    this.afterHooks.push(hook);
    return this;
  }

  // Utilities
  parseQuery() {
    const query = {};
    const search = this.mode === 'history'
      ? window.location.search.slice(1)
      : window.location.hash.split('?')[1] || '';

    if (search) {
      search.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        query[decodeURIComponent(key)] = decodeURIComponent(value || '');
      });
    }

    return query;
  }

  render(html) {
    if (this.rootElement) {
      this.rootElement.innerHTML = html;
    }
  }

  render404() {
    this.render('<h1>404 - Page Not Found</h1>');
  }

  renderError(error) {
    this.render(\`<h1>Error</h1><p>\${error.message}</p>\`);
  }

  // Start the router
  start() {
    const path = this.mode === 'history'
      ? window.location.pathname
      : window.location.hash.slice(1) || '/';

    this.navigate(path);
    return this;
  }
}

// Usage example:
const router = new VanillaRouter({ mode: 'history' });

router
  .route('/', ({ params }) => {
    router.render('<h1>Home Page</h1>');
  })
  .route('/about', ({ params }) => {
    router.render('<h1>About Page</h1>');
  })
  .route('/user/:id', ({ params }) => {
    router.render(\`<h1>User Profile: \${params.id}</h1>\`);
  })
  .route('*', () => {
    router.render('<h1>404 - Not Found</h1>');
  })
  .beforeEach((to, from) => {
    console.log(\`Navigating from \${from?.path} to \${to}\`);
  })
  .start();

export default VanillaRouter;
`;

      const outputPath = path.join(__dirname, 'vanilla-utils', 'router.js');
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, code);

      return { success: true, path: outputPath };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Generate state management
  generateStateManager: async () => {
    try {
      const code = `// Vanilla JavaScript State Management (Redux-like)
class VanillaStore {
  constructor(reducer, initialState = {}) {
    this.state = initialState;
    this.reducer = reducer;
    this.listeners = [];
    this.middlewares = [];
  }

  // Get current state
  getState() {
    return { ...this.state };
  }

  // Dispatch actions
  dispatch(action) {
    // Run middlewares
    const chain = this.middlewares.map(middleware => middleware(this));
    const dispatch = chain.reduce(
      (next, middleware) => middleware(next),
      this.internalDispatch.bind(this)
    );

    return dispatch(action);
  }

  internalDispatch(action) {
    console.log('Dispatching:', action);

    // Update state through reducer
    this.state = this.reducer(this.state, action);

    // Notify listeners
    this.listeners.forEach(listener => listener(this.state, action));

    return action;
  }

  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Apply middleware
  applyMiddleware(...middlewares) {
    this.middlewares = middlewares;
    return this;
  }

  // Connect component to store
  connect(mapStateToProps, mapDispatchToProps) {
    return (component) => {
      const state = mapStateToProps ? mapStateToProps(this.getState()) : {};
      const dispatchers = mapDispatchToProps ? mapDispatchToProps(this.dispatch.bind(this)) : {};

      // Update component when state changes
      this.subscribe((newState) => {
        const mappedState = mapStateToProps ? mapStateToProps(newState) : {};
        if (component.update) {
          component.update(mappedState);
        }
      });

      // Return enhanced component
      return { ...component, ...state, ...dispatchers };
    };
  }
}

// Logger middleware
const logger = (store) => (next) => (action) => {
  console.group(action.type);
  console.info('dispatching', action);
  const result = next(action);
  console.log('next state', store.getState());
  console.groupEnd();
  return result;
};

// Thunk middleware for async actions
const thunk = (store) => (next) => (action) => {
  if (typeof action === 'function') {
    return action(store.dispatch, store.getState);
  }
  return next(action);
};

// Local storage persistence
const persist = (key) => (store) => (next) => (action) => {
  const result = next(action);
  localStorage.setItem(key, JSON.stringify(store.getState()));
  return result;
};

// Example usage:
const initialState = {
  count: 0,
  todos: [],
  user: null
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    case 'ADD_TODO':
      return { ...state, todos: [...state.todos, action.payload] };
    case 'REMOVE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };
    case 'SET_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

// Create store with middleware
const store = new VanillaStore(reducer, initialState)
  .applyMiddleware(logger, thunk, persist('app-state'));

// Subscribe to changes
store.subscribe((state, action) => {
  console.log('State changed:', state);
});

// Dispatch actions
store.dispatch({ type: 'INCREMENT' });
store.dispatch({
  type: 'ADD_TODO',
  payload: { id: 1, text: 'Learn Vanilla JS', completed: false }
});

// Async action with thunk
const fetchUser = (userId) => async (dispatch, getState) => {
  dispatch({ type: 'FETCH_USER_START' });
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    const user = await response.json();
    dispatch({ type: 'SET_USER', payload: user });
  } catch (error) {
    dispatch({ type: 'FETCH_USER_ERROR', payload: error.message });
  }
};

store.dispatch(fetchUser(1));

export { VanillaStore, logger, thunk, persist };
`;

      const outputPath = path.join(__dirname, 'vanilla-utils', 'state-manager.js');
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, code);

      return { success: true, path: outputPath };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Generate project scaffold
  generateProject: async ({ name, type = 'spa' }) => {
    try {
      const projectDir = path.join(__dirname, 'vanilla-projects', name);
      await fs.mkdir(projectDir, { recursive: true });

      // Create HTML file
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app">
    <header>
      <nav>
        <a href="/" data-router-link>Home</a>
        <a href="/about" data-router-link>About</a>
        <a href="/contact" data-router-link>Contact</a>
      </nav>
    </header>
    <main id="content"></main>
    <footer>
      <p>&copy; 2024 ${name}. Built with Vanilla JS.</p>
    </footer>
  </div>
  <script type="module" src="app.js"></script>
</body>
</html>`;

      // Create CSS file
      const css = `/* ${name} - Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  background: #f4f4f4;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background: #333;
  color: white;
  padding: 1rem;
}

nav a {
  color: white;
  text-decoration: none;
  padding: 0 1rem;
}

nav a:hover {
  text-decoration: underline;
}

main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
}

footer {
  background: #333;
  color: white;
  text-align: center;
  padding: 1rem;
}

.container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background: #0056b3;
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}`;

      // Create JavaScript file
      const js = `// ${name} - Main Application
import VanillaRouter from './modules/router.js';
import { VanillaStore } from './modules/state-manager.js';
import DOM from './modules/dom-utils.js';

// Initialize store
const store = new VanillaStore(
  (state = { count: 0 }, action) => {
    switch (action.type) {
      case 'INCREMENT':
        return { ...state, count: state.count + 1 };
      default:
        return state;
    }
  }
);

// Initialize router
const router = new VanillaRouter({
  root: document.getElementById('content'),
  mode: 'history'
});

// Define routes
router
  .route('/', () => {
    router.render(\`
      <div class="container fade-in">
        <h1>Welcome to ${name}</h1>
        <p>This is a Vanilla JavaScript application.</p>
        <p>Count: <span id="count">\${store.getState().count}</span></p>
        <button id="incrementBtn">Increment</button>
      </div>
    \`);

    // Add event listener
    DOM.on(DOM.$('#incrementBtn'), 'click', () => {
      store.dispatch({ type: 'INCREMENT' });
      DOM.$('#count').textContent = store.getState().count;
    });
  })
  .route('/about', () => {
    router.render(\`
      <div class="container fade-in">
        <h1>About</h1>
        <p>Built with pure Vanilla JavaScript - no frameworks needed!</p>
      </div>
    \`);
  })
  .route('/contact', () => {
    router.render(\`
      <div class="container fade-in">
        <h1>Contact</h1>
        <form id="contactForm">
          <input type="text" placeholder="Name" required>
          <input type="email" placeholder="Email" required>
          <textarea placeholder="Message" required></textarea>
          <button type="submit">Send</button>
        </form>
      </div>
    \`);

    // Handle form submission
    DOM.on(DOM.$('#contactForm'), 'submit', (e) => {
      e.preventDefault();
      alert('Form submitted!');
    });
  })
  .route('*', () => {
    router.render('<h1>404 - Page Not Found</h1>');
  });

// Start application
DOM.ready(() => {
  console.log('${name} application started');
  router.start();
});`;

      // Write files
      await fs.writeFile(path.join(projectDir, 'index.html'), html);
      await fs.writeFile(path.join(projectDir, 'styles.css'), css);
      await fs.writeFile(path.join(projectDir, 'app.js'), js);

      // Create modules directory with utilities
      const modulesDir = path.join(projectDir, 'modules');
      await fs.mkdir(modulesDir, { recursive: true });

      // Generate utility modules
      await VANILLA_TOOLS.generateDOMUtils();
      await VANILLA_TOOLS.generateRouter();
      await VANILLA_TOOLS.generateStateManager();

      return {
        success: true,
        projectPath: projectDir,
        files: ['index.html', 'styles.css', 'app.js', 'modules/']
      };
    } catch (error) {
      return { error: error.message };
    }
  }
};

// MCP endpoints
app.post('/call-tool', async (req, res) => {
  const { name, arguments: args } = req.body;

  if (VANILLA_TOOLS[name]) {
    const result = await VANILLA_TOOLS[name](args);
    res.json(result);
  } else {
    res.status(404).json({ error: 'Tool not found' });
  }
});

// Dashboard
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Vanilla JS MCP Server</title>
  <style>
    body { font-family: Arial; max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; border-radius: 12px; }
    .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .tool { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 6px; }
    code { background: #f0f0f0; padding: 2px 5px; border-radius: 3px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚀 Vanilla JS MCP Server</h1>
    <p>Web Components & Modern JavaScript Development</p>
  </div>

  <div class="card">
    <h2>Available Tools</h2>
    <div class="tool">
      <h3>generateWebComponent</h3>
      <p>Create custom Web Components with Shadow DOM</p>
    </div>
    <div class="tool">
      <h3>generateDOMUtils</h3>
      <p>Generate DOM manipulation utilities library</p>
    </div>
    <div class="tool">
      <h3>generateRouter</h3>
      <p>Create SPA router with history/hash support</p>
    </div>
    <div class="tool">
      <h3>generateStateManager</h3>
      <p>Redux-like state management for Vanilla JS</p>
    </div>
    <div class="tool">
      <h3>generateProject</h3>
      <p>Scaffold complete Vanilla JS project</p>
    </div>
  </div>

  <div class="card">
    <h2>Status</h2>
    <p><strong>Port:</strong> 3022</p>
    <p><strong>Status:</strong> 🟢 Running</p>
    <p><strong>No frameworks required!</strong> 💪</p>
  </div>
</body>
</html>
  `);
});

// Start server
const PORT = 3022;
app.listen(PORT, () => {
  console.log('🚀 Vanilla JS MCP Server');
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔧 API endpoint: http://localhost:${PORT}/call-tool`);
  console.log('✨ Ready to create pure JavaScript magic!');
});