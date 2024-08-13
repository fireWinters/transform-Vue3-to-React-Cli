const babelParser = require('@babel/parser');
const generate = require('@babel/generator').default;
const t = require('@babel/types');

// 解析 Vue 代码
function parseVE3(ve3Code) {
  // 使用 Babel 解析 Vue 代码为 AST（抽象语法树）
  return babelParser.parse(ve3Code, {
    sourceType: 'module',
    plugins: ['jsx']
  });
}

// 将 Vue AST 转换为 React AST
function transformVueToReact(vueAST) {
  // 初始 React 代码模板
  let reactCode = `
    import React, { useState, useEffect, useCallback } from 'react';
  `;

  // 处理 Vue 中的 `data`, `methods`, `created` 等
  vueAST.program.body.forEach(node => {
    if (t.isExportDefaultDeclaration(node)) {
      const properties = node.declaration.properties;

      properties.forEach(property => {
        if (t.isObjectProperty(property)) {
          switch (property.key.name) {
            case 'data':
              // 转换 data 为 useState
              reactCode += convertDataToUseState(property);
              break;
            case 'methods':
              // 转换 methods 为 useCallback
              reactCode += convertMethodsToUseCallback(property);
              break;
            case 'created':
              // 转换 created 为 useEffect
              reactCode += convertCreatedToUseEffect(property);
              break;
            // 处理其他可能的 Vue 生命周期钩子
          }
        }
      });
    }
  });

  // 处理 Vue 模板部分并生成 JSX
  const templateNode = vueAST.program.body.find(node => t.isExportDefaultDeclaration(node));
  const jsxTemplate = convertTemplateToJSX(templateNode);
  
  reactCode += `
    const MyComponent = () => {
      ${jsxTemplate}
      return (
        ${jsxTemplate}
      );
    };

    export default MyComponent;
  `;

  return reactCode;
}

// 转换 data 为 useState
function convertDataToUseState(property) {
  let useStateCode = '';
  const dataProperties = property.value.properties;

  dataProperties.forEach(prop => {
    const key = prop.key.name;
    const value = generate(prop.value).code;
    useStateCode += `const [${key}, set${capitalize(key)}] = useState(${value});\n`;
  });

  return useStateCode;
}

// 转换 methods 为 useCallback
function convertMethodsToUseCallback(property) {
  let useCallbackCode = '';
  const methods = property.value.properties;

  methods.forEach(method => {
    const methodName = method.key.name;
    const methodBody = generate(method.value.body).code;
    useCallbackCode += `
      const ${methodName} = useCallback(() => {
        ${methodBody}
      }, []);
    `;
  });

  return useCallbackCode;
}

// 转换 created 为 useEffect
function convertCreatedToUseEffect(property) {
  const effectBody = generate(property.value.body).code;
  return `
    useEffect(() => {
      ${effectBody}
    }, []);
  `;
}

// 将 Vue 模板转换为 JSX
function convertTemplateToJSX(templateNode) {
  // 假设 Vue 的模板已经转换为 JSX 并存储在 templateNode 中
  // 这里是一个简单的占位符示例
  const jsxTemplate = `
    <div className="pg-home">
      <div className="tab-conent">
        {/* 转换后的 JSX 代码 */}
      </div>
    </div>
  `;

  return jsxTemplate;
}

// Vue 代码转换为 React 代码
function generateReactComponent(ve3Code) {
  const vueAST = parseVE3(ve3Code);
  return transformVueToReact(vueAST);
}

module.exports = { parseVE3, generateReactComponent };
