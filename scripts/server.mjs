import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const cwd = fileURLToPath(new URL('../server/', import.meta.url))
const python = fileURLToPath(new URL(
  process.platform === 'win32'
    ? '../server/.venv/Scripts/python.exe'
    : '../server/.venv/bin/python',
  import.meta.url,
))

if (!existsSync(python)) {
  console.error('Server environment missing. Follow the setup steps in README.md.')
  process.exit(1)
}

const args = process.argv[2] === 'test' ? ['-m', 'pytest'] : ['-m', 'app']
const child = spawn(python, args, { cwd, stdio: 'inherit' })
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal))
}
child.on('error', (error) => {
  console.error(error)
  process.exit(1)
})
child.on('exit', (code) => { process.exitCode = code ?? 1 })
