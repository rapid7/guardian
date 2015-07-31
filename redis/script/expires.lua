-- Implement compare-and-set for Redis
--
-- SETS key value [expire] -> {success, match}
-- Insert a new key. Return success flag and new CAS value

local key = KEYS[1]
local expire = tonumber(KEYS[2]) -- nil unless Numeric

assert(type(key) == 'string', 'Argument `key` must be a string')
assert(type(expire) == 'number', 'Argument `expire` must be a number')

local ckey = key .. ':cas'

-- CAS does not exist. Fail.
if redis.call('EXISTS', ckey) == 0 then return {0} end
local ccas = redis.call('GET', ckey)

if expire == nil then
  -- Clear expire
  if (redis.call('SET', ckey, ccas) == 0) or
     (redis.call('SET', key, redis.call('GET', key)) == 0) then
    return {0}
  end
else
  -- Set with expire
  if (redis.call('EXPIRE', ckey, expire) == 0) or
     (redis.call('EXPIRE', key, expire) == 0) then
    return {0}
  end
end

-- Return success and new CAS
return {1, ccas, expire}
