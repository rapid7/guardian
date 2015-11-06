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
default['nodejs']['npm'] = '/usr/bin/npm'

include_attribute 'redisio'
default['redisio']['version'] = '2.8.4'
default['redisio']['package_name'] = 'redis-server' ## Fixed in master but not released
default['redisio']['package_install'] =
  Chef::VersionConstraint.new('>= 14.04').include?(node['platform_version'])

# Set to true if redis-server should be installed
default['guardian']['redis']['local'] = true

# Set to true if mysql-server should be installed
default['guardian']['database']['local'] = true

default['guardian']['user'] = 'guardian'
default['guardian']['group'] = 'guardian'
default['guardian']['home'] = '/etc/guardian'

default['guardian']['conf'] = '/etc/guardian'
default['guardian']['path'] = '/srv/guardian'
default['guardian']['source'] = 'github-tag'
default['guardian']['enable'] = true

default['guardian']['repo'] = 'rapid7/guardian'

## Configuration
default['guardian']['site'] = Mash.new # -> Global configurations

default['guardian']['session'] = Mash.new # -> Service-specific configurations
default['guardian']['authn'] = Mash.new
default['guardian']['authz'] = Mash.new
default['guardian']['router'] = Mash.new
