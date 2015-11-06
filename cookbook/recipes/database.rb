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

mysql_service 'guardian' do
  port node['guardian']['database']['port']
  version '5.5'
  initial_root_password node['guardian']['database']['password']
  action [:create, :start]
end

mysql2_chef_gem 'default' do
  action :install
end

mysql_database node['guardian']['database']['guardian_db_name'] do
  connection(
    :host     => node['guardian']['database']['host'],
    :port     => node['guardian']['database']['port'],
    :username => node['guardian']['database']['user'],
    :password => node['guardian']['database']['password']
  )
  action :create
end

mysql_database_user node['guardian']['database']['guardian_user'] do
  connection(
    :host     => node['guardian']['database']['host'],
    :port     => node['guardian']['database']['port'],
    :username => node['guardian']['database']['user'],
    :password => node['guardian']['database']['password']
  )
  password node['guardian']['database']['guardian_password']
  database_name node['guardian']['database']['guardian_db_name']
  action [:create, :grant]
end
