#
# Cookbook Name:: guardian
# Recipe:: base
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
include_recipe 'apt'
include_recipe 'libarchive'
include_recipe 'nodejs'
include_recipe 'nodejs::npm'

package 'build-essential'
package 'uuid-dev'

group node['guardian']['group'] { system true }
user node['guardian']['user'] do
  system true
  home node['guardian']['home']
  group node['guardian']['group']
end

[node['guardian']['home'],
 node['guardian']['conf'],
 node['guardian']['path'],
 node['guardian']['run']].each do |service_directory|
  directory service_directory do
    owner node['guardian']['user']
    group node['guardian']['group']
    mode '0755'
  end
end

## Fetch and unpack application
remote_file 'guardian-source' do
  source node.guardian_artifact_url
  path node.guardian_artifact_path
  action :create_if_missing
  not_if { node['vagrant'] }
end

libarchive_file 'guardian-source' do
  path node.guardian_artifact_path
  extract_to ::File.dirname(node['guardian']['path'])
  owner node['guardian']['user']
  group node['guardian']['group']
  notifies :install, 'nodejs_npm[guardian]'
  not_if { node['vagrant'] }
end

nodejs_npm 'guardian' do
  path node['guardian']['path']
  user node['guardian']['user']
  json true

  # notifies :restart, 'runit_service[guardian]'
end
