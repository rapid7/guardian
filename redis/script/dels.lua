-- Implement compare-and-set for Redis
--
-- DELS key -> {deleted}
-- Delete a key and its CAS

local key = KEYS[1]
assert(type(key) == 'string', 'Argument `key` must be a string')

return {redis.call('DEL', key, key .. ':cas')}
