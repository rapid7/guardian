#
# Cookbook Name:: guardian
# Recipe:: database
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
require 'chef/version_constraint'

##
# XXX: This configuration is currently for testing purposes only!
##

if node['redis']['local']
  include_recipe 'redisio::install'

  unless node['redisio']['package_install']
    include_recipe 'redisio::configure'
    include_recipe 'redisio::enable'
  end
end

if node['database']['local']
  mysql_service 'guardian' do
    port node['database']['port']
    version '5.5'
    initial_root_password node['database']['password']
    action [:create, :start]
  end
end

mysql2_chef_gem 'default' do
  action :install
end

mysql_database node['guardian']['database']['db_name'] do
  connection(
    :host     => node['database']['host'],
    :username => node['database']['user'],
    :password => node['database']['password']
  )
  action :create
end

mysql_database_user node['guardian']['database']['user'] do
  connection(
    :host     => node['database']['host'],
    :username => node['database']['user'],
    :password => node['database']['password']
  )
  password node['guardian']['database']['password']
  database_name node['guardian']['database']['db_name']
  action [:create, :grant]
end
