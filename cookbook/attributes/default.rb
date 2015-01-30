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
default['guardian']['repo'] = 'rapid7/guardian'
default['guardian']['path'] = '/usr/local/guardian'
default['guardian']['run'] = '/var/run/guardian'

## Service Configuration
default['guardian']['config']['service']['domain']['protocol'] = 'https'
default['guardian']['config']['service']['domain']['port'] = '8443'
default['guardian']['config']['service']['socket'] = ::File.join(node['guardian']['run'], 'service.sock')

default['guardian']['version'] = Chef::Recipe::Guardian.version(run_context)
default['nodejs']['install_method'] = 'package'

default['guardian']['ssl_cert'] = '/etc/nginx/certs/guardian.cert.pem'
default['guardian']['ssl_key'] = '/etc/nginx/certs/guardian.key.pem'
