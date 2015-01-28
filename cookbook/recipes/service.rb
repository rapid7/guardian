#
# Cookbook Name:: guardian
# Recipe:: service
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
require 'json'

include_recipe 'apt'
include_recipe 'runit'
include_recipe 'nodejs'
include_recipe 'nodejs::npm'

package 'build-essential'

group node['guardian']['group'] do
  system true
  not_if { node['guardian']['version'] == 'development' }
end

user node['guardian']['user'] do
  system true
  home node['guardian']['home']
  group node['guardian']['group']
  supports :manage_home => true
  not_if { node['guardian']['version'] == 'development' }
end

directory node['guardian']['path'] do
  owner node['guardian']['user']
  group node['guardian']['group']
  mode 0755
  not_if { node['guardian']['version'] == 'development' }
end

directory ::File.join(node['guardian']['path'], 'config') do
  owner node['guardian']['user']
  group node['guardian']['group']
  mode 0755
  not_if { node['guardian']['version'] == 'development' }
end

## WTF is this? Watch https://www.youtube.com/watch?v=Dq_vGxd-jps
asset = github_asset "guardian-#{ node['guardian']['version'] }.tar.gz" do
  repo 'rapid7/guardian'
  release node['guardian']['version']
  not_if { node['guardian']['version'] == 'development' }
end

libarchive_file 'guardian-source.tar.gz' do
  path asset.asset_path
  extract_to node['guardian']['path']
  owner node['guardian']['user']
  group node['guardian']['group']
  notifies :install, 'nodejs_npm[guardian]'
  not_if { node['guardian']['version'] == 'development' }
end

## Development. Use shared folder
directory '/mnt/source/node_modules' do
  owner node['guardian']['user']
  group node['guardian']['group']
  only_if { node['guardian']['version'] == 'development' }
end

link node['guardian']['path'] do
  to '/mnt/source'
  only_if { node['guardian']['version'] == 'development' }
end

nodejs_npm 'guardian' do
  path node['guardian']['path']
  user node['guardian']['user']
  json true
  action node['guardian']['version'] == 'development' ? :install : :nothing
  notifies :restart, 'runit_service[guardian]'
end

template ::File.join(node['guardian']['path'], 'config', 'site.json') do
  source 'site.json.erb'
  owner node['guardian']['user']
  group node['guardian']['group']
  mode 0600
  helpers JSON
  notifies :restart, 'runit_service[guardian]'
  not_if { node['guardian']['version'] == 'development' }
end

runit_service 'guardian' do
  default_logger true
  options :user => node['guardian']['user'],
          :bindir => ::File.join(node['guardian']['path'], 'bin')
  action [:enable, :start]
end
