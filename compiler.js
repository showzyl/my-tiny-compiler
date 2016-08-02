/**
 * Created by showzyl on 16/8/2.
 */
'use strict';

// 转换tokens
function tokenizer(input){
  input = trim(input);
  let current = 0;
  let tokens = [];
  while(current < input.length){
    let char = input[current];
    if(char === '('){
      tokens.push({
        type: 'paren',
        value: '('
      });
      current++;
      continue;
    }
    if(char === ')'){
      tokens.push({
        type: 'paren',
        value: ')'
      });
      current++;
      continue;
    }

    let WHITESPACE = /\s/;
    if(WHITESPACE.test(char)){
      current++;
      continue;
    }

    let NUMBER = /\d/;
    if(NUMBER.test(char)){
      let value = '';
      while (NUMBER.test(char)){
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: 'number',
        value: value
      });
      continue;
    }

    let LETTERS = /[a-z]/i;
    if(LETTERS.test(char)){
      let value = '';
      while (LETTERS.test(char)){
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
  //console.log(tokens);

  function trim(str){
    var reg = /^[\s\t ]+|[\s\t $]+$/ig;
    str = str.replace(reg, '');
    return str;
  }

  return tokens;
}

// 生成 AST
function parser(tokens){
  let current = 0;

  function _walk(){
    let token = tokens[current];

    if(token.type === 'number'){
      current++;
      return {
        type: 'numberLiteral',
        value: token.value
      }
    }
    if(token.type === 'paren' && token.value === '('){
      token = tokens[++current];
      let node = {
        type: 'CallExpression',
        name: token.value,
        params: []
      };
      // 跳过函数
      token = tokens[++current];

      while( token.type !== 'paren' ||
      (token.type === 'paren' && token.value !== ')')  ){
        node.params.push(_walk());
        token = tokens[current];
      }
      current++;
      return node;
      //return JSON.stringify(node);
    }
    throw new Error(token.type);
  }

  let ast = {
    type: 'Program',
    body: []
  };

  while(current < tokens.length){
    ast.body.push(_walk());
  }

  return ast;
}


let tokens = tokenizer('(add 12 (t 3 4))');
console.log(parser(tokens));