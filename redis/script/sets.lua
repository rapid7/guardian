-- Implement compare-and-set for Redis
--
-- SETS key value [expire] -> {success, match}
-- Insert a new key. Return success flag and new CAS value

local key = KEYS[1]
local value = KEYS[2]
local expire = nil

assert(type(key) == 'string', 'Argument `key` must be a string')

if not ARGV[1] == nil then
  assert(type(ARGV[1]) == 'number', 'Argument `expire` must be a number')
  expire = ARGV[1]
end

local ckey = key .. ':cas'

-- CAS already exists. Fail.
if redis.call('EXISTS', ckey) == 1 then return {0} end

-- Calculate new CAS
local ncas = redis.sha1hex(value)

if expire == nil then
  -- Set without expire
  if redis.call('SET', ckey, ncas) == 0 then return {0} end
  if redis.call('SET', key, value) == 0 then return {0} end
else
  -- Set with expire
  if redis.call('SETEX', ckey, expire, ncas) == 0 then return {0} end
  if redis.call('SETEX', key, expire, value) == 0 then return {0} end
end

-- Return success and new CAS
return {1, ncas}
