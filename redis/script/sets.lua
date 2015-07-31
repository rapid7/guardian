-- Implement compare-and-set for Redis
--
-- SETS key value [expire] -> {success, match}
-- Insert a new key. Return success flag and new CAS value

local key = KEYS[1]
local value = KEYS[2]
local expire = tonumber(ARGV[1]) -- nil unless Numeric

assert(type(key) == 'string', 'Argument `key` must be a string')

local ckey = key .. ':cas'

-- CAS already exists. Fail.
if redis.call('EXISTS', ckey) == 1 then return {0} end

-- Calculate new CAS
local ncas = redis.sha1hex(value)

if expire == nil then
  -- Set without expire
  if (redis.call('SET', ckey, ncas) == 0) or
     redis.call('SET', key, value) == 0 then
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
return {1, ncas, expire}
