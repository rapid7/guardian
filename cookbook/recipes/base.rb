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
# include_recipe 'libarchive'
# include_recipe 'nodejs'
# include_recipe 'nodejs::npm'

apt_repository 'node_0.10' do
  uri 'https://deb.nodesource.com/node_0.10'
  distribution node['lsb']['codename']
  components %w(main)
  key 'https://deb.nodesource.com/gpgkey/nodesource.gpg.key'
end

package 'build-essential'
package 'nodejs'
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

mysql_service 'guardian' do
  port '3306'
  version '5.5'
  initial_root_password 'change me'
  action [:create, :start]
end

mysql2_chef_gem 'default' do
  action :install
end

mysql_database 'guardian' do
  connection(
    :host     => '127.0.0.1',
    :username => 'root',
    :password => 'change me'
  )
  action :create
end

mysql_database_user 'guardian' do
  connection(
    :host     => '127.0.0.1',
    :username => 'root',
    :password => 'change me'
  )
  password 'guardian'
  database_name 'guardian'
  action [:create, :grant]
end

## Fetch and unpack application
# remote_file 'guardian-source' do
#   source node.guardian_artifact_url
#   path node.guardian_artifact_path
#   action :create_if_missing
#   not_if { node['vagrant'] }
# end
#
# libarchive_file 'guardian-source' do
#   path node.guardian_artifact_path
#   extract_to ::File.dirname(node['guardian']['path'])
#   owner node['guardian']['user']
#   group node['guardian']['group']
#   notifies :install, 'nodejs_npm[guardian]'
#   not_if { node['vagrant'] }
# end
#
# nodejs_npm 'guardian' do
#   path node['guardian']['path']
#   user node['guardian']['user']
#   json true
#
#   # notifies :restart, 'runit_service[guardian]'
# end
