import './App.scss'
import 'bootstrap/dist/css/bootstrap.css'
import { useRef, useState } from 'react'

import * as Mousetrap from 'mousetrap'

function App () {

  const rows = 25
  const cols = 100

  let chars = decodeURIComponent(window.location.hash.substring(1)).split('')
  chars = chars.slice(0, 10)

  if (chars.length === 0) {
    const hash = '|_/\\:`´-\''
    window.location.hash = `#${encodeURIComponent(hash)}`
  }

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
        setActiveRow(activeRow + 1 < rows ? activeRow + 1 : rows - 1)
        break
      case 'ArrowLeft':
        setActiveCol(activeCol - 1 > 0 ? activeCol - 1 : 0)
        break
      case 'ArrowRight':
      default:
        setActiveCol(activeCol + 1 < cols ? activeCol + 1 : cols - 1)
        break
    }
  })

  Mousetrap.bind('tab', e => {
    e.preventDefault()
    setActiveCol(activeCol + 4 < cols ? activeCol + 4 : cols - 1)
  })

  Mousetrap.bind(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'], e => {
    e.preventDefault()
    let key = parseInt(e.key)
    if (key === 0) {
      key = 10
    }
    contents[activeRow][activeCol] = chars[key - 1]
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

        {chars.map((char, i) => {
          let key = i + 1
          if (key === 10) {
            key = 0
          }
          return <button key={i}>{char}<sub>{key}</sub></button>
        })}
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
            const oddCol = col % 4 === 0
            const oddRow = row % 3 === 0

            const classes = []
            if (active) {
              classes.push('active')
            }
            if (oddCol) {
              classes.push('odd-col')
            }
            if (oddRow) {
              classes.push('odd-row')
            }

            return <span
              ref={active ? currentSpan : null}
              className={classes.join(' ')}
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
