const { Timecode, Time, Range } = require('./')
const test = require('tape')

test('Timecode.from(\'now-\')', (t) => {
  const timecode = Timecode.from('now-')
  t.ok(timecode)
  t.ok(-1 === timecode.start.value)
  t.ok(Number.isNaN(timecode.stop.value))
  t.ok('now-' === timecode.toString())
  t.ok('now-' === timecode.toString())
  t.ok('now' === timecode.start.toString())
  t.end()
})

test('Timecode.from(\'-now\')', (t) => {
  const timecode = Timecode.from('-now')
  t.ok(timecode)
  t.ok(-1 === timecode.stop.value)
  t.ok(Time.NOW === timecode.stop.value)
  t.ok('-now' === timecode.toString())
  t.ok('-now' === timecode.toString())
  t.ok('now' === timecode.stop.toString())
  t.end()
})

test('Timecode#valueOf', (t) => {
  {
    const timecode = Timecode.from(30)
    t.ok(60.32 === (timecode + 30.32))
    t.ok(Time.NOW === Timecode.from(Time.NOW).valueOf())
    t.ok(Time.NOW === Timecode.from(0, Time.NOW).valueOf())
    t.ok((0 + Timecode.from(60)) === Timecode.from(30, 90).valueOf())
    t.ok((0 + Timecode.from(90)) === (Timecode.from(30) + Timecode.from(60)))
  }

  t.end()
})

test('Timecode', (t) => {
  {
    const timecode = Timecode.from('00:00:30.456-00:01:00.789')
    t.ok(30 === timecode.start.seconds)
    t.ok(456 === timecode.start.milliseconds)
  }

  t.end()
})

test('Time', (t) => {
  t.ok(-1 === Time.NOW)

  {
    const now = Time.from(Time.NOW)
    t.ok(now.isNow)
    t.ok(Time.NOW === now.value)
  }

  {
    t.ok(Time.NOW === Time.now().value)
  }

  {
    const time = Time.from()
    t.ok(null === time.computed)
    time.set(5)
    t.ok(5 === time.seconds)
    time.set('05:30')
    t.ok(30 === time.seconds)
    t.ok(5 === time.minutes)
  }

  {
    const time = Time.from(30)
    const other = Time.from(time)
    t.ok(30 === time.value)
    t.ok(30 === time.seconds)
    t.ok(time.value === other.value)
    t.ok(30 === other.value)
    t.ok(30 === other.seconds)
  }

  {
    const time = Time.from({
      hours: 3,
      minutes: 30,
      seconds: 45.32
    })

    t.ok(3 === time.hours)
    t.ok(30 === time.minutes)
    t.ok(45 === time.seconds)
    console.log(time.computed);
    t.ok(320 === time.milliseconds)
  }

  {
    const time = Time.from(1)
    t.ok(time)
    t.ok(1 === time.value)
    t.ok(Number(time) === time.value)

    t.ok(0 === time.hours)
    t.ok(0 === time.minutes)
    t.ok(1 === time.seconds)
    t.ok(0 === time.milliseconds)

    t.ok(0.0002777777777777778 === time.totalHours)
    t.ok(0.016666666666666666 === time.totalMinutes)
    t.ok(1 === time.totalSeconds)
    t.ok(0.001 === time.totalMilliseconds)

    t.ok('1' === time.toString('s'))
    t.ok('01' === time.toString('ss'))
    t.ok('00:01' === time.toString('mm:ss'))
    t.ok('00:00:01' === time.toString('hh:mm:ss'))
  }

  {
    const time = Time.from(1.23)
    t.ok(time)
    t.ok(1.23 === time.value)
    t.ok(Number(time) === time.value)

    t.ok(0 === time.hours)
    t.ok(0 === time.minutes)
    t.ok(1 === time.seconds)
    t.ok(230 === time.milliseconds)

    t.ok(0.00034166666666666666 === time.totalHours)
    t.ok(0.0205 === time.totalMinutes)
    t.ok(1.23 === time.totalSeconds)
    t.ok(0.00123 === time.totalMilliseconds)

    t.ok('1.23' === time.toString('s'))
    t.ok('01.23' === time.toString('ss'))
    t.ok('00:01.23' === time.toString('mm:ss'))
    t.ok('00:00:01.23' === time.toString('hh:mm:ss'))
  }

  {
    const time = Time.from(21930)
    t.ok(time)
    t.ok(21930 === time.value)
    t.ok(Number(time) === time.value)

    t.ok(6 === time.hours)
    t.ok(5 === time.minutes)
    t.ok(30 === time.seconds)
    t.ok(0 === time.milliseconds)

    t.ok(6.091666666666667 === time.totalHours)
    t.ok(365.5 === time.totalMinutes)
    t.ok(21930 === time.totalSeconds)
    t.ok(21.93 === time.totalMilliseconds)

    t.ok('30' === time.toString('ss'))
    t.ok('05:30' === time.toString('mm:ss'))
    t.ok('06:05:30' === time.toString('hh:mm:ss'))
  }

  {
    const time = Time.from(21930 + 360.23)
    t.ok(time)
    t.ok(Number(time) === time.value)
    t.ok(21930 + 360.23 === time.value)

    t.ok(6 === time.hours)
    t.ok(11 === time.minutes)
    t.ok(30 === time.seconds)
    t.ok(230 === time.milliseconds)

    t.ok(6.191730555555555 === time.totalHours)
    t.ok(371.5038333333333 === time.totalMinutes)
    t.ok(22290.23 === time.totalSeconds)
    t.ok(22.29023 === time.totalMilliseconds)

    t.ok('30.23' === time.toString('ss'))
    t.ok('11:30.23' === time.toString('mm:ss'))
    t.ok('06:11:30.23' === time.toString('hh:mm:ss'))
    t.ok('06:11' === time.toString('hh:mm'))
  }

  {
    const time = Time.from('05:5.5')
    t.ok(time.computed)
    t.ok(Number(time) === time.value)
    t.ok(305.5 === time.value)
    t.ok(0 === time.hours)
    t.ok(5 === time.minutes)
    t.ok(5 === time.seconds)
    t.ok(500 === time.milliseconds)
    t.ok(500 === time.ms)
  }

  t.end()
})

test('Range', (t) => {
  {
    const range = Range.from()
    t.ok(false === range.start.isValid)
    t.ok(false === range.stop.isValid)

    t.ok('' === range.toString())

    range.start.set(Time.NOW)
    t.ok('now-' === range.toString())

    range.reset()
    range.stop.set(Time.NOW)
    t.ok('-now' === range.toString())

    range.reset()
    range.start.set(30.456)
    range.stop.set(60.789)
    t.ok('00:00:30.456-00:01:00.789' === range.toString())

    range.set(30.423, 29.987)
    t.ok('00:00:30.423-' === range.toString())
  }

  {
    const range = Range.from(['00:30', '1:20'])
    t.ok(30 === range.start.seconds)
    t.ok(1 === range.stop.minutes)
    t.ok(20 === range.stop.seconds)
  }

  {
    const range = Range.from({
      start: { seconds: 30 },
      stop: { minutes: 1, seconds: 30 }
    })

    t.ok(30 === range.start.seconds)
    t.ok(1 === range.stop.minutes)
    t.ok(30 === range.stop.seconds)
  }

  t.end()
})
