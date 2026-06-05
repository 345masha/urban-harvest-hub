// Location: urban-harvest-hub/src/libs/i18next.js
class I18next {
  constructor() {
    this.services = { resourceStore: { data: {} } };
    this.language = 'en';
    this.callbacks = [];
  }

  use(module) {
    // Fluent interface support
    return this;
  }

  init(options = {}, callback) {
    this.options = options;
    this.language = options.lng || localStorage.getItem('i18nextLng') || 'en';
    if (options.resources) {
      this.services.resourceStore.data = options.resources;
    }
    if (callback) callback(null, (key) => this.t(key));
    return Promise.resolve((key) => this.t(key));
  }

  changeLanguage(lng, callback) {
    this.language = lng;
    localStorage.setItem('i18nextLng', lng);
    this.callbacks.forEach(cb => cb(lng));
    if (callback) callback(null, (key) => this.t(key));
    return Promise.resolve((key) => this.t(key));
  }

  t(key, options) {
    const data = this.services.resourceStore.data;
    const translation = data[this.language]?.translation?.[key] || key;
    if (options && typeof options === 'object') {
      // Interpolate placeholders, e.g. {{name}} -> options.name
      return Object.keys(options).reduce((str, k) => {
        return str.replace(new RegExp(`{{${k}}}`, 'g'), options[k]);
      }, translation);
    }
    return translation;
  }

  on(event, callback) {
    if (event === 'languageChanged') {
      this.callbacks.push(callback);
    }
  }

  off(event, callback) {
    if (event === 'languageChanged') {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    }
  }
}

const i18n = new I18next();
export default i18n;
