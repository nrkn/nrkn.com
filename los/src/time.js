import { $get, $set } from './settings.js'
import { keyValuePair } from './util.js'
import { wline } from './output.js'

const setTime = str => {
  const realTime = Date.now()
  const newTime = Date.parse(str)

  if (isNaN(newTime)) {
    wline('Invalid time')
  } else {
    $set('timeoffset', newTime - realTime)

    wline(`Time set to ${getTime()}`)
  }
}

export const currentTime = () => new Date(Date.now() + $get('timeoffset'))

const getTime = () => currentTime().toISOString()
const getLocalDate = () => currentTime().toLocaleDateString()
const getLocalTime = () => currentTime().toLocaleTimeString()

export const timeCommand = (...args) => {
  if (args.length > 0) {
    const arg = args.join(' ')

    if (arg === '/?') {
      wline(timeHelp().join('\n'))

      return
    }

    setTime(arg)

    return
  }

  wline(`${getTime()}  ${getLocalDate()}  ${getLocalTime()}`)
}

export const timeHelp = () => [
  'Displays or sets the system time and date.\n',
  'TIME [time]\n',
  keyValuePair('time', 'Specify a new time and date in ISO 8601 format.\n'),
  'Type TIME without parameters to display the current time and date.\n'
]
