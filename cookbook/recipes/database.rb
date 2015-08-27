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

include_recipe 'redisio::install'

unless node['redisio']['package_install']
  include_recipe 'redisio::configure'
  include_recipe 'redisio::enable'
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
