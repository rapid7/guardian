default['guardian']['user'] = 'guardian'
default['guardian']['group'] = 'guardian'
default['guardian']['home'] = '/srv/guardian'
default['guardian']['repo'] = 'rapid7/guardian'
default['guardian']['path'] = '/usr/local/guardian'

default['guardian']['config']['cache'] = ['127.0.0.1']

default['guardian']['version'] = Chef::Recipe::Guardian.version(run_context)
default['nodejs']['install_method'] = 'package'
