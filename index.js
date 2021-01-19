const { inspect } = require('util')
const npt = require('normalplaytime')

// istanbul ignore next
const { isFinite = global.isFinite } = Number

/**
 * Constant to represent "now" in a NPT scheme.
 * @private
 */
const NOW = -1

/**
 * Internal cache for computed time values.
 * @private
 */
const cache = new Map()

/**
 * A container for a NPT integer time value represented in
 * seconds.
 * @see {@link https://www.ietf.org/rfc/rfc2326}
 * @example
 * const time = Time.from(305.5) // 5 minutes, 5 seconds, and half a second
 * // or
 * const time = Time.from('05:5.5')
 * // or
 * const time = Time.from({ minutes: 5, seconds: 5.5 })
 */
class Time {

  /**
   * A constant to represent "now" in a NPT scheme.
   * @static
   * @accessor
   * @type {Number}
   */
  static get NOW() {
    return NOW
  }

  /**
   * Creates a `Time` instance from input.
   * @static
   * @param {Number|String|Object|Time} arg
   * @return {Time}
   */
  static from(arg) {
    if ('number' === typeof arg && !Number.isNaN(arg)) {
      return new this(arg)
    } else if ('string' === typeof arg) {
      if ('now' === arg) {
        return new this(NOW)
      } else {
        const parsed = npt.parse(arg)
        if (parsed) {
          return new this(parsed/1000)
        }
      }
    } else if (arg && 'number' === typeof arg.value) {
      return new this(arg.value)
    } else if (arg && ('hours' in arg || 'minutes' in arg || 'seconds' in arg)) {
      return new this(getComputedSeconds(arg))
    }

    return new this(Number.NaN)
  }

  /**
   * Creates a "now" `Time` instance.
   * @static
   * @return {Time}
   */
  static now() {
    return this.from(NOW)
  }

  /**
   * `Time` class constructor.
   * @private
   * @param {Number} value
   */
  constructor(value) {
    this.value = value
  }

  /**
   * `true` if the time value is the "now" constant.
   * @accessor
   * @type {Boolean}
   */
  get isNow() {
    return NOW === this.value
  }

  /**
   * `true` if the time value is valid.
   * @accessor
   * @type {Boolean}
   */
  get isValid() {
    return false === Number.isNaN(this.value)
  }

  /**
   * Computed time values for this `Time` instance.
   * @accessor
   * @type {?Object}
   */
  get computed() {
    if (Number.isNaN(this.value) || null == this.value) {
      return null
    }

    const computed = cache.get(this.value) || getComputedTime(this.value)
    cache.set(this.value, computed)
    return computed
  }

  /**
   * Computed total number of hours this `Time` instance represents.
   * @accessor
   * @type {Number}
   */
  get totalHours() {
    return this.computed.totalHours
  }

  /**
   * Computed total number of minutes this `Time` instance represents.
   * @accessor
   * @type {Number}
   */
  get totalMinutes() {
    return this.computed.totalMinutes
  }

  /**
   * Computed total number of seconds this `Time` instance represents.
   * @accessor
   * @type {Number}
   */
  get totalSeconds() {
    return this.computed.totalSeconds
  }

  /**
   * Computed total number of milliseconds this `Time` instance represents.
   * @accessor
   * @type {Number}
   */
  get totalMilliseconds() {
    return this.computed.totalMilliseconds
  }

  /**
   * Computed number of hours this `Time` instance represents.
   * @accessor
   * @type {Number}
   */
  get hours() {
    return this.computed.hours
  }

  /**
   * Computed number of minutes this `Time` instance represents.
   * @accessor
   * @type {Number}
   */
  get minutes() {
    return this.computed.minutes
  }

  /**
   * Computed number of seconds this `Time` instance represents.
   * @accessor
   * @type {Number}
   */
  get seconds() {
    return this.computed.seconds
  }

  /**
   * Computed number of milliseconds this `Time` instance represents.
   * @accessor
   * @type {Number}
   */
  get milliseconds() {
    return this.computed.milliseconds
  }

  /**
   * Computed total number of milliseconds this `Time` instance represents.
   * @accessor
   * @type {Number}
   */
  get ms() {
    return this.milliseconds
  }

  /**
   * Set the time value for this instance.
   * @param {Number|String|Object|Time} arg
   */
  set(value) {
    if (false === Number.isNaN(value) && null != value) {
      const temp = this.constructor.from(value)
      this.value = temp.value
    }
  }

  /**
   * Resets the value of this `Time` instance to `Number.NaN`.
   */
  reset() {
    this.value = Number.NaN
  }

  /**
   * The integer value this `Time` instance represents.
   * @return {Number}
   */
  valueOf() {
    return this.value
  }

  /**
   * Converts this `Time` instance to an optionally formatted string.
   * @param {?String} format
   * @return {String}
   * @example
   * time.toString('hh:mm::ss') // default format, padded time
   * time.toString('hh') // padded hours
   * time.toString('mm') // padded minutes
   * time.toString('ss') // padded seconds
   * time.toString('H') // total hours, not padded
   * time.toString('M') // total minutes, not padded
   * time.toString('S') // total seconds, not padded
   */
  toString(format) {
    const { computed, value } = this
    format = format || 'hh:mm:ss'

    if (-1 === value) {
      return 'now'
    }

    if (Number.isNaN(value)) {
      return ''
    }

    return format
      .replace('S', computed.totalSeconds)
      .replace('M', computed.totalMinutes)
      .replace('H', computed.totalHours)

      .replace('hh', pad(2, computed.hours))
      .replace('mm', pad(2, computed.minutes))
      .replace('ss',
        pad(2, computed.seconds) + (computed.ms ? `.${String(computed.ms/1000).slice(2)}` : '')
      )

      .replace('h', computed.hours)
      .replace('m', computed.minutes)
      .replace('s',
        computed.seconds + (computed.ms ? `.${String(computed.ms/1000).slice(2)}` : '')
      )

      .replace(/(hh|mm|ss|H|M|S)(\:)?/g, '')
      .trim()

    function pad(n, s) {
      return String(s).padStart(n, 0)
    }
  }

  /**
   * Implements `util.inspect.custom` symbol for pretty output.
   * @private
   * @return {String}
   */
  /* istanbul ignore next */
  [inspect.custom]() {
    const formatted = this.toString('hh:mm:ss') || 'Invalid'
    const { value } = this
    const { name } = this.constructor
    return `${name} (${formatted}) ${inspect({ value }, { colors: true })}`
  }
}

/**
 * A container for a start `Time` and a stop `Time` that represents a range
 * for a NPT timecode.
 * @example
 * Range.from({ start: 0, stop: 30.5 }) // in seconds
 * Range.from({ start: 'now' })
 * Range.from({ start: '00:05:32.5', stop: '00:06:00' })
 * Range.from('now-')
 * Range.from('00:05:32.5-00:06:00')
 * Range.from('00:05:00', '00:06:00')
 */
class Range {

  /**
   * Creates a `Range` instance from input.
   * @static
   * @param {Array<String>|Range|Object|String} ...args
   * @return {Time}
   */
  static from(...args) {
    if (Array.isArray(args[0])) {
      return new this(args[0][0], args[0][1])
    } else if (args[0] && 'object' === typeof args[0]) {
      return new this(args[0].start, args[0].stop)
    } else if (1 === args.length) {
      if ('string' === typeof args[0]) {
        const [ start, stop ] = args[0].split('-')
        return new this(start, stop)
      } else {
        return new this(args[0], null)
      }
    } else {
      return new this(...args)
    }
  }

  /**
   * `Range` class constructor.
   * @private
   * @param {Time} start
   * @param {Time} stop
   */
  constructor(start, stop) {
    this.start = Time.from()
    this.stop = Time.from()
    this.set(start, stop)
  }

  /**
   * Converts this `Range` instance to an optionally formatted string.
   * @param {?String} format
   * @return {String}
   */
  toString(format) {
    const start = this.start.toString(format)
    const stop = this.stop.toString(format)

    if (start && stop && this.stop >= this.start) {
      return `${start}-${stop}`
    } else if (start) {
      return `${start}-`
    } else if (stop) {
      return `-${stop}`
    } else {
      return ''
    }
  }

  /**
   * Set the start and stop time values for this range.
   * @param {Number|String|Object|Time} start
   * @param {Number|String|Object|Time} stop
   */
  set(start, stop) {
    this.start.set(start)

    if (stop) {
      this.stop.set(stop)

      if (this.stop < this.start) {
        this.stop.set(Number.NaN)
      }
    }
  }

  /**
   * Resets the start and stop `Time` instance.
   */
  reset() {
    this.start.reset()
    this.stop.reset()
  }

  /**
   * Implements `util.inspect.custom` symbol for pretty output.
   * @private
   * @return {String}
   */
  /* istanbul ignore next */
  [inspect.custom]() {
    const { start, stop } = this
    const { value } = this
    const { name } = this.constructor
    return `${name} (${start}-${stop}) ${inspect({ start, stop }, { colors: true })}`
  }
}

/**
 * A container for an optionally ranged Normal Play Time (NPT) timecode.
 * @see {@link https://www.ietf.org/rfc/rfc2326}
 * @example
 * Timecode.from({ start: 0, stop: 30.5 }) // in seconds
 * Timecode.from({ start: 'now' })
 * Timecode.from({ start: '00:05:32.5', stop: '00:06:00' })
 * Timecode.from('now-')
 * Timecode.from('00:05:32.5-00:06:00')
 * Timecode.from('00:05:00', '00:06:00')
 */
class Timecode extends Range {

  /**
   * Converts this `Timecode` instance to an integer value. This function will
   * compute the difference in seconds between a start and stop timecode range
   * if both were give, otherwise the timecode value as seconds is returned.
   * @return {Number}
   */
  valueOf() {
    const { start, stop } = this

    if (start.isNow) {
      return Time.NOW
    }

    if (!start.value && stop.isNow) {
      return Time.NOW
    }

    if (start < stop) {
      return stop - start
    }

    return 0 + start
  }
}

/**
 * Computes hours, minutes, seconds, and milliseconds for a given
 * time value integer in seconds.
 * @param {Number} value
 * @return {Object}
 */
function getComputedTime(value) {
  const totalMilliseconds = value / 1000
  const totalSeconds = value
  const totalMinutes = totalSeconds / 60
  const totalHours = totalMinutes / 60

  const hours = Math.floor(totalHours)
  const minutes = Math.floor((totalHours - hours) * 60)
  const seconds = Math.floor(totalSeconds - (hours * 60 * 60) - (minutes * 60))
  const milliseconds = 1000 * parseFloat(((totalSeconds - (hours * 60 * 60) - (minutes * 60)) - seconds).toFixed(3))

  return {
    totalMilliseconds, totalSeconds, totalMinutes, totalHours,
    milliseconds, seconds, minutes, hours,
    ms: milliseconds
  }
}

/**
 * Computes the number of seconds for an object that specifies `hours`,
 * `minutes`, `seconds`, and `milliseconds` as number values.
 * @param {?Object} opts
 * @param {?Number} opts.hours
 * @param {?Number} opts.minutes
 * @param {?Number} opts.seconds
 * @param {?Number} opts.milliseconds
 * @return {Number}
 */
function getComputedSeconds(opts) {
  opts = { ...opts }
  const { hours, minutes, seconds, milliseconds, ms = milliseconds } = opts
  let total = 0
  // istanbul ignore next
  {
    total += 60 * 60 * (hours || 0)
    total += 60 * (minutes || 0)
    total += (seconds || 0)
    total += (ms || 0) / 1000
  }
  return total
}

/**
 * Module exports.
 */
module.exports = {
  getComputedTime,
  getComputedSeconds,
  Range,
  Time,
  Timecode
}
