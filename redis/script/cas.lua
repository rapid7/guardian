-- Implement compare-and-set for Redis
--
-- CAS key value match [expire] -> {success, match, expire}
-- Update an existing key. Return success flag and new CAS value

local key = KEYS[1]
local value = KEYS[2]
local match = KEYS[3]
local expire = tonumber(ARGV[1]) -- nil unless Numeric

assert(type(key) == 'string', 'Argument `key` must be a string')
assert(type(match) == 'string', 'Argument `match` must be a string')

-- Get the current CAS
local ckey = key .. ':cas'
local ccas = redis.call('GET', ckey)

-- CAS does not match. Fail.
if not (match == ccas) then return {0} end

-- Calculate new CAS
local ncas = redis.sha1hex(value)

if expire == nil then
  -- Set without expire
  if (redis.call('SET', ckey, ncas) == 0) or
     (redis.call('SET', key, value) == 0) then
    return {0}
  end
else
  -- Set with expire
  if (redis.call('SETEX', ckey, expire, ncas) == 0) or
     (redis.call('SETEX', key, expire, value) == 0) then
    return {0}
  end
end

-- Return success and new CAS
return {1, ncas, redis.call('TTL', key)}
