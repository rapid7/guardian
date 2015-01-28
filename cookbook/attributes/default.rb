default['guardian']['user'] = 'guardian'
default['guardian']['group'] = 'guardian'
default['guardian']['home'] = '/srv/guardian'
default['guardian']['repo'] = 'rapid7/guardian'
default['guardian']['path'] = '/usr/local/guardian'

default['guardian']['version'] = Chef::Recipe::Guardian.version(run_context)
default['guardian']['config'] = Mash.new
default['nodejs']['install_method'] = 'package'
