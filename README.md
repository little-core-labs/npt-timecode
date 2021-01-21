npt-timecode
============

> Atomic classes for working with Normal Play Time (NPT) time codes from [RFC 2326](https://www.ietf.org/rfc/rfc2326).

## Status

![](https://github.com/little-core-labs/npt-timecode/workflows/tests/badge.svg)

## Installation

```sh
$ npm install npt-timecode
```

## Usage

```js
const { Timecode } = require('npt-timecode')
const timecode = Timecode.from('00:00:30.456-00:01:00.789')
console.log(timecode)
// Timecode (00:00:30.456-00:01:00.789) {
//   start: Time (00:00:30.456) { value: 30.456 },
//   stop: Time (00:01:00.789) { value: 60.789 }
// }
```

## API

### `Timecode`

A container for Normal Play Time (NPT) timecodes that support ranges.

#### `timecode = Timecode.from(input)`
Creates a `Timecode` instance from input.

```js
Timecode.from({ start: 0, stop: 30.5 }) // in seconds
Timecode.from({ start: 'now' })
Timecode.from({ start: '00:05:32.5', stop: '00:06:00' })
Timecode.from('now-')
Timecode.from('00:05:32.5-00:06:00')
Timecode.from('00:05:00', '00:06:00')
```

#### `timecode.start`

A `Time` instance that represents the start value of a timecode range.
If a range is not give, then it is the timecode value.

#### `timecode.stop`

A `Time` instance that represents the stop value of a timecode range.
This time value may not be set if the timecode is not a range.

#### `timecode.set(start[, stop])`

Set the start and optional stop time values for this range.

```js
timecode.set(30, 60) // 00:00:30-00:01:00
```

#### `timecode.reset()

Reset the timecode state.

### `Time`

A container for a NPT integer time value represented in seconds.

#### `Time.NOW`

A constant to represent "now" in a NPT scheme.

### `time = Time.from(input)`

Creates a `Time` instance from input.

```js
const time = Time.from(305.5) // 5 minutes, 5 seconds, and half a second
// or
const time = Time.from('5:5.5')
// or
const time = Time.from('00:05:5.5')
// or
const time = Time.from({ minutes: 5, seconds: 5.5 })
```

### `time = Time.now()`

Creates a "now" `Time` instance.

```js
const now =  Time.now()
```

#### `time.value`

The integer value of the `Time` instance.

#### `time.isNow`

`true` if the time value is the "now" constant.

#### `time.isValid`

`true` if the time value is valid. Meaning the time value is a valid
finite integer.

#### `time.totalHours`

Computed total number of hours this `Time` instance represents.

#### `time.totalMinutes`

Computed total number of minutes this `Time` instance represents.

#### `time.totalSeconds`

Computed total number of seconds this `Time` instance represents.

#### `time.totalMilliseconds`

Computed total number of milliseconds this `Time` instance represents.

#### `time.hours`

Computed number of hours this `Time` instance represents.

#### `time.minutes`

Computed number of minutes this `Time` instance represents.

#### `time.seconds`

Computed number of seconds this `Time` instance represents.

#### `time.milliseconds`

Computed number of milliseconds this `Time` instance represents.

#### `time.ms`

An alias for `time.milliseconds`.

#### `time.set(value)`

Set the time value for this instance.

#### `time.reset()`

Resets the value of this `Time` instance to `Number.NaN`.

#### `time.toString(format = 'hh:mm:ss')`

Converts this `Time` instance to an optionally formatted string.

```js
time.toString('hh:mm::ss') // default format, padded time
time.toString('hh') // padded hours
time.toString('mm') // padded minutes
time.toString('ss') // padded seconds
time.toString('H') // total hours, not padded
time.toString('M') // total minutes, not padded
time.toString('S') // total seconds, not padded
```

## License

MIT
