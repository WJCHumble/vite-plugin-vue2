import parseVueRequest from "./utils/query";
import transformStyle from "./style";
import compiler from "vue-template-compiler";
import { compileTemplate, parse } from "@vue/component-compiler-utils";
import hashsum from "hash-sum";
import { createFilter } from "@rollup/pluginutils";

export default function vue2Plugin(rawOptions = {}) {

  const filter = createFilter(
    rawOptions.include || /\.vue$/,
    rawOptions.exclude
  );

  return {
    name: "vite:vue2",
    
    async transform(code, id) {
      const { filename, query } = parseVueRequest(id);
      if (!query.vue && !filter(filename)) {
        return;
      }
      const { errors, template, styles, script } = parse({
        source: code,
        filename, filename,
        needMap: true,
        compiler,
      });
      if (errors && errors.length > 0) {
        console.error(JSON.stringify(errors));
      }

      if (query.type === "style") {
        return transformStyle(styles[query.index], filename, hashsum(filename));
      }

      let jsCode = "";
      if (script) {
        jsCode += script.content.replace(
          "export default",
          "const defaultExport ="
        );
      }

      let styleCode = "";
      for (let i = 0; i < styles.length; i++) {
        const stylePart = styles[i]
        const src = stylePart.attrs.src || filename;
        // TODO: attrsQuery 待审核
        const attrsQuery = "&scoped=true&lang.css"
        const srcQuery = stylePart.attrs.src ? `&src` : ``
        const query = `?vue&type=style&index=${i}${srcQuery}`;
        const stylePartRequest = `${src}${query}${attrsQuery}`;

        styleCode += `import ${JSON.stringify(stylePartRequest)}`;
      }
      jsCode += `\n${styleCode}\n`;

      if (template) {
        const templateCode = compileTemplate({
          source: template.content,
          filename: filename,
          compiler,
        });
        if (templateCode.errors && templateCode.errors.length) {
          console.error(JSON.stringify(templateCode.errors));
        }

        jsCode += `\n${templateCode.code}\n`;
        jsCode += `\ndefaultExport.render = render\n`;
        jsCode += `\ndefaultExport.staticRenderFns = staticRenderFns\n`;
        
        const hasScoped = styles.some(s => s.attrs.scoped);
        if (hasScoped) {
          jsCode += `\ndefaultExport._scopeId = "data-v-${hashsum(filename)}"\n`;
        }
        jsCode += `\nexport default defaultExport\n`;

        return {
          code: jsCode,
          map: null
        };
      }
    }
  }
}