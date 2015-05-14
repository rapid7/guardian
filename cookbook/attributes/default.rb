#
# Cookbook Name:: guardian
# Attributes:: default
#
# Copyright (C) 2015, Rapid7, LLC.
# License:: Apache License, Version 2.0
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
default['guardian']['user'] = 'guardian'
default['guardian']['group'] = 'guardian'
default['guardian']['home'] = '/srv/guardian'
default['guardian']['conf'] = '/etc/guardian'
default['guardian']['path'] = '/usr/local/guardian'
default['guardian']['run'] = '/var/run/guardian'

default['guardian']['repo'] = 'rapid7/guardian'
default['guardian']['version'] = Chef::Recipe::Guardian.version(run_context)

default['guardian']['service']['action'] = [:start, :enable]

# default['guardian']['service']['listen'] = 9080
default['guardian']['service']['listen'] = ::File.join(node['guardian']['run'], 'listen.sock')
default['guardian']['frontend']['uri'] =
  "unix:#{ node['guardian']['service']['listen'] }:"

default['guardian']['service']['upstream'] =
  ::File.join(node['guardian']['run'], 'upstream.sock')

## Upstram Router
default['guardian']['router']['service']['listen'] =
  node['guardian']['service']['upstream']
default['guardian']['router']['service']['routes'] = Mash.new
default['guardian']['router']['service']['rewrites'] = Mash.new

## Front-end SSL termination. Connect on a UNIX socket
default['guardian']['frontend']['ssl'] = true
default['guardian']['frontend']['ssl_cert'] = '/etc/nginx/certs/guardian.cert.pem'
default['guardian']['frontend']['ssl_key'] = '/etc/nginx/certs/guardian.key.pem'
default['guardian']['frontend']['listen'] =
  node['guardian']['frontend']['ssl'] ? 443 : 80

## Service Configuration
default['guardian']['config']['proxy']['frontend']['protocol'] =
  node['guardian']['frontend']['ssl'] ? 'https:' : 'http:'

default['guardian']['config']['proxy']['frontend']['port'] =
  node['guardian']['frontend']['listen']

default['guardian']['config']['proxy']['upstream']['socketPath'] =
  node['guardian']['service']['upstream']

default['guardian']['config']['service']['listen'] =
  node['guardian']['service']['listen']

default['nodejs']['binpath'] = '/usr/bin/node'
default['nodejs']['install_method'] = 'package'
