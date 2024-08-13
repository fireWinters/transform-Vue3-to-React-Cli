/*
 * @Author: Diana Tang
 * @Date: 2024-08-13 16:03:21
 * @LastEditors: Diana Tang
 * @Description: some description
 * @FilePath: /transform-Vue3-to-React-Cli/src/convert.js
 */
const { parseVE3, generateReactComponent } = require('./vue3ToReact');

function convertVE3ToReact(ve3Code) {
  // 解析 VE3 代码
  const parsedVE3 = parseVE3(ve3Code);

  // 生成 React 代码
  const reactCode = generateReactComponent(parsedVE3);

  return reactCode;
}

module.exports = { convertVE3ToReact };

