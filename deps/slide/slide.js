/**
* Original Author. Isaac Z. Schlueter
* tweak array.isArray to constructor-check by mario scheliga
*/

function asyncMap (list, fn, cb_) {
  var n = list.length
    , results = []
    , errState = null
  function cb (er, data) {
    if (errState) return
    if (er) return cb(errState = er)
    results.push(data)
    if (-- n === 0)
      return cb_(null, results)
  }
  if (list.length === 0) return cb_(null, [])
  list.forEach(function (l) {
    fn(l, cb)
  })
}

function bindActor () {
  var args = 
        Array.prototype.slice.call
        (arguments) // jswtf.
    , obj = null
    , fn
  if (typeof args[0] === "object") {
    obj = args.shift()
    fn = args.shift()
    if (typeof fn === "string")
      fn = obj[ fn ]
  } else fn = args.shift()
  return function (cb) {
    fn.apply(obj, args.concat(cb)) }
}

chain.first = {} ; chain.last = {}
function chain (things, res, cb) {
  if (!cb) cb = res , res = []
  ;(function LOOP (i, len) {
    if (i >= len) return cb(null,res)
    if (things[i].constructor.toString().indexOf("Array") !== -1)
      things[i] = bindActor.apply(null,
        things[i].map(function(i){
          return (i===chain.first) ? res[0]
           : (i===chain.last)
             ? res[res.length - 1] : i }))
    if (!things[i]) return LOOP(i + 1, len)
    things[i](function (er, data) {
      res.push(er || data)
      if (er) return cb(er, res)
      LOOP(i + 1, len)
    })
  })(0, things.length) }