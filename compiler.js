/**
 * Created by showzyl on 16/8/1.
 */
'use strict';

// 转换为token
function tokenizer(input) {
  let current = 0;
  let tokens = [];
  while (current < input.length) {
    let char = input[current];

    if (char === '(') {
      tokens.push({
        type: 'paren',
        value: '('
      });
      current++;
      continue;
    }

    if (char === ')') {
      tokens.push({
        type: 'paren',
        value: ')'
      });
      current++;
      continue;
    }

    const WHITESPACE = /\s/;
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }

    const NUMBERS = /[0-9]/;
    if (NUMBERS.test(char)) {
      let value = '';
      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: 'number',
        value: value
      });
      continue;
    }

    const LETTERS = /[a-z]/i;
    if (LETTERS.test(char)) {
      let value = '';
      while (LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: 'name',
        value: value
      });
      continue;
    }
    throw new TypeError('I dont know what this character is: ' + char);
  }
  return tokens;
}

// 转换为ast
function parser(tokens) {
  let current = 0;
  function walk() {
    let token = tokens[current];
    if (token.type === 'number') {
      current++;
      return {
        type: 'NumberLiteral',
        value: token.value
      };
    }
    if (
      token.type === 'paren' &&
      token.value === '('
    ) {
      token = tokens[++current];
      let node = {
        type: 'CallExpression',
        name: token.value, // add or subtract, you get the idea
        params: []
      };
      token = tokens[++current];
      while (
      (token.type !== 'paren') ||
      (token.type === 'paren' && token.value !== ')')
        ) {
        node.params.push(walk());
        token = tokens[current];
      }
      current++;
      //return JSON.stringify(node);
      return node;
    }

    // 同样, 认不出 token 类型就报错
    throw new TypeError(token.type);
  }

  // 现在根据 token 数组创建 AST， AST 根节点类型是 "Program" 代表我们的整个程序
  let ast = {
    type: 'Program',
    body: []
  };
  // 现在我们要调用前面定义的 walk 函数, 把节点 push 到
  // 这里用 while 循环, 是因为我们的程序可以多个 CallExpressions 并排, 不一定要嵌套
  //   (add 2 2)(subtract 4 2)
  while (current < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
  // 最后返回 AST
}

function traverser(ast, visitor) {

  function traverseArray(array, parent) {
    array.forEach(function (child) {
      traverseNode(child, parent);
    });
  }

  function traverseNode(node, parent) {
    let method = visitor[node.type];
    if (method) {
      method(node, parent);
    }
    switch (node.type) {
      case 'Program':
        traverseArray(node.body, node);
        break;
      case 'CallExpression':
        traverseArray(node.params, node);
        break;
      case 'NumberLiteral':
        break;
      default:
        throw new TypeError(node.type);
    }
  }
  traverseNode(ast, null);
}

function transformer(ast) {
  let newAst = {
    type: 'Program',
    body: []
  };
  ast._context = newAst.body;
  traverser(ast, {
    NumberLiteral: function (node, parent) {
      parent._haha.push({
        type: 'NumberLiteral',
        value: node.value
      });
    },
    CallExpression: function (node, parent) {
      let expression = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: node.name
        },
        arguments: []
      };
      node._haha = expression.arguments;
      if (parent.type !== 'CallExpression') {
        expression = {
          type: 'ExpressionStatement',
          expression: expression
        };
        parent._context.push(expression); // 如果是 add 就会调用到这里
      } else {
        parent._haha.push(expression); // 如果是 subtract 就会调用到这里
      }
    }
  });

  return newAst;
}

function codeGenerator(node){
  switch (node.type) {
    case 'Program':
      return node.body.map(codeGenerator)
        .join('\n');
    case 'ExpressionStatement':
      return (
        codeGenerator(node.expression) +
        ';' // << (...because we like to code the *correct* way)
      );
    case 'CallExpression':
      return (
        codeGenerator(node.callee) +
        '(' +
        node.arguments.map(codeGenerator)
          .join(', ') +
        ')'
      );
    // 对于函数名就直接返回名字, 不然就永远递归下去了, 要有基础案例(base case)才行
    case 'Identifier':
      return node.name;
    // 对于数字节点就返回数字, 同理
    case 'NumberLiteral':
      return node.value;
    default:
      throw new TypeError(node.type);
  }
}


let tokens = tokenizer('(add 12 (t 3 4))');
//console.log(tokens);
let ast = parser(tokens);
//console.log(ast);
let newAst = transformer(ast);
console.log(newAst);
let code = codeGenerator(newAst)
console.log(code);


























