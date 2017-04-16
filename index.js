#!/usr/bin/env node
'use strict'
const fs = require('fs')
const path = require('path')
const template = require('es6-templater')
const minimist = require('minimist')
const argv = minimist(process.argv.slice(2))

function parse (argv, callback) {
  if (argv['h'] || argv['help']) help(0)

  var filename = argv['i'] || argv['in']
  var result = {
    out: argv['o'] || argv['out'],
    in: argv._[0]
  }

  if (result.out) result.out = path.resolve(process.cwd(), result.out)

  if (process.stdin.isTTY) {
    if (filename) {
      result.in = fs.readFileSync(path.resolve(process.cwd(), filename), 'utf8')
    }
    callback(result)
  } else {
    var pipe = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => { pipe += chunk })
    process.stdin.on('end', () => {
      result.in = pipe.trim()
      return callback(result)
    })
  }
}

parse(argv, (parsed) => {
  var result
  if (!parsed.in) {
    help(1)
  }
  try {
    result = template(parsed.in, process.env)
  } catch (e) {
    console.error('Error parsing test.json:', e.message)
  }
  console.log(result)
  if (parsed.out) {
    fs.writeFileSync(parsed.out, result, 'utf8')
    console.log('Output written to', parsed.out)
  }
})

function help (code) {
  console.log(fs.readFileSync(path.resolve(__dirname, './help.txt'), 'utf8'))
  process.exit(code)
}
