import { stdout } from "single-line-log"

class ProgressBar {
  description: string
  length: number

  constructor(description: string, length: number) {
    this.description = description || 'Progress'
    this.length = length || 25
  }

  render(opts: { completed: number, total: number }) {
    const percent = (opts.completed / opts.total)
    const cell_num = Math.floor(percent * this.length)

    let cell = ''
    for (let i = 0; i < cell_num; i++) {
      cell += '█'
    }

    let empty = ''
    for (let i = 0; i < this.length - cell_num; i++) {
      empty += '░'
    }

    const cmdText = `${this.description}: ${cell}${empty} ${(100 * percent).toFixed(2)}%\n`
    stdout(cmdText)
  }
}

export default ProgressBar