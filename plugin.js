const compiler = require("vue-template-compiler");
const { compileTemplate, compileStyleAsync } = require('@vue/component-compiler-utils');

function vue2Plugin(options = {}) {
  debugger
  return {
    name: "vite:vue2",
    
    handleHotUpdate(ctx) {
      debugger
    },

    config() {
      debugger
    },

    configResolved(config) {
      debugger
    },

    configServer(server) {
      debugger
    },

    resolveId(id, importer) {
      debugger
    },

    load(id) {
      debugger
    },

    transform(code, id) {
      debugger
    }
  }
}

export default vue2Plugin