-- Implement compare-and-set for Redis
--
-- GETS key -> {value, match}
-- Fetch a key and its CAS

local key = KEYS[1]
assert(type(key) == 'string', 'Argument `key` must be a string')

local ckey = key .. ':cas'

-- CAS does nto exist. Fail.
if redis.call('EXISTS', ckey) == 0 then return {0} end

-- Return valeu and CAS
return {
  redis.call('GET', key),
  redis.call('GET', ckey)
}
