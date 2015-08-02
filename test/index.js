
require('./redis');
require('./session');

require('repl').start({
  prompt: 'guardian > ',
  input: process.stdin,
  output: process.stdout,
});
