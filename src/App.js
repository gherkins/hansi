import './App.scss'
import 'bootstrap/dist/css/bootstrap.css'
import { useRef, useState } from 'react'

import * as Mousetrap from 'mousetrap'

function App () {

  const rows = 25
  const cols = 100

  const chars = [
    '|',
    '_',
    '/',
    '\\',
    ':',
    '`',
    '´',
    '-',
  ]

  const [activeRow, setActiveRow] = useState(8)
  const [activeCol, setActiveCol] = useState(24)
  const [contents] = useState((new Array(25)).fill(0).map(() => (new Array(100)).fill(0)))

  const currentSpan = useRef()

  Mousetrap.bind(['up', 'down', 'left', 'right'], e => {
    e.preventDefault()
    switch (e.key) {
      case 'ArrowUp':
        setActiveRow(activeRow - 1 > 0 ? activeRow - 1 : 0)
        break
      case 'ArrowDown':
        setActiveRow(activeRow + 1 < rows ? activeRow + 1 : rows)
        break
      case 'ArrowLeft':
        setActiveCol(activeCol - 1 > 0 ? activeCol - 1 : 0)
        break
      case 'ArrowRight':
      default:
        setActiveCol(activeCol + 1 < cols ? activeCol + 1 : cols)
        break
    }
  })

  Mousetrap.bind('tab', e => {
    e.preventDefault()
    setActiveCol(activeCol + 4 < cols ? activeCol + 4 : cols)
  })

  Mousetrap.bind(['1', '2', '3', '4', '5', '6', '7', '8', '9'], e => {
    e.preventDefault()
    contents[activeRow][activeCol] = chars[parseInt(e.key) - 1]
    setActiveCol(activeCol + 1 < cols ? activeCol + 1 : cols)
  })

  Mousetrap.bind('space', e => {
    e.preventDefault()
    contents[activeRow][activeCol] = ' '
    setActiveCol(activeCol + 1 < cols ? activeCol + 1 : cols)
  })

  return (
    <div className="container">
      <h3>

        {chars.map((char, i) => <button key={i}>{char}<sub>{i + 1}</sub></button>)}
        <button onClick={() => {
          let text = ''
          contents.forEach(row => {
            row.forEach(char => {
              text += char ? char : ' '
            })
            text += '\n'
          })

          navigator.clipboard.writeText(text)
        }}>copy
        </button>
      </h3>
      <div className="ansi">
        {(new Array(rows)).fill(0).map((i, row) => <div key={row}>
          {(new Array(cols)).fill(0).map((i, col) => {
            const active = activeRow === row && activeCol === col
            return <span
              ref={active ? currentSpan : null}
              className={active ? 'active' : ''}
              key={`${row}-${col}`}
            >
              {contents[row][col] || ' '}
            </span>
          })}
        </div>)}
      </div>
    </div>
  )
}

export default App
