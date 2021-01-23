import {compileStyleAsync} from "@vue/component-compiler-utils"

export default async function transformStyle(stylePart = {}, filename, scopeId) {
  const hasScoped = stylePart.attrs.scoped || false;

  const styleCode = await compileStyleAsync({
    filename: filename,
    source: stylePart.content,
    id:  hasScoped ? `data-v-${scopeId}` : "",
    scoped: stylePart.attrs.scoped,
    modules: stylePart.attrs.module != null,
    preprocessLang: stylePart.attrs.lang,
  });
  if (styleCode.errors && styleCode.errors.length > 0) {
    console.error(JSON.stringify(styleCode.errors));
  }
  const styleResult = hasScoped ? styleCode.code : styleCode.code.replace("[]", "");

  return {
    code: styleResult,
    map: styleResult.map
  }
}