function parseVE3(ve3Code) {
    // 假设 VE3 代码是 JSON 格式，或者类似 JSON 的结构
    try {
      const parsed = JSON.parse(ve3Code);
      return parsed;
    } catch (error) {
      console.error('Failed to parse VE3 code:', error);
      throw new Error('Invalid VE3 code format');
    }
  }
  
  function generateReactComponent(parsedVE3) {
    // 假设 parsedVE3 具有如下结构：
    // {
    //   "componentName": "MyComponent",
    //   "state": { "count": 0 },
    //   "methods": { "increment": "this.state.count += 1;" },
    //   "template": "<div>{{count}}</div>"
    // }
  
    const componentName = parsedVE3.componentName || 'MyComponent';
    const initialState = JSON.stringify(parsedVE3.state || {});
    const methods = parsedVE3.methods || {};
    const template = parsedVE3.template || '';
  
    let reactCode = `
      import React, { useState, useCallback } from 'react';
  
      const ${componentName} = () => {
        const [state, setState] = useState(${initialState});
  
    `;
  
    // 生成方法并用 useCallback 包裹
    Object.keys(methods).forEach(methodName => {
      reactCode += `
        const ${methodName} = useCallback(() => {
          ${methods[methodName].replace(/this\.state/g, 'state')}
          setState({ ...state });
        }, [state]);
      `;
    });
  
    // 将 VE3 模板转换为 JSX
    const jsxTemplate = convertTemplateToJSX(template);
  
    reactCode += `
        return (
          ${jsxTemplate}
        );
      };
  
      export default ${componentName};
    `;
  
    return reactCode;
  }
  
  // 简单的 VE3 模板到 JSX 的转换函数
  function convertTemplateToJSX(template) {
    // 这里只是一个非常简单的示例，将 {{变量}} 替换为 {变量}
    // 复杂的模板解析可能需要更高级的解析器
    return template.replace(/{{\s*(\w+)\s*}}/g, (match, p1) => `{state.${p1}}`);
  }
  
  module.exports = { parseVE3, generateReactComponent };
  