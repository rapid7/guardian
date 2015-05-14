#
# Cookbook Name:: guardian
# Recipe:: router
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
include_recipe "#{ cookbook_name }::base"

template ::File.join(node['guardian']['conf'], 'router.json') do
  helpers JSON
  source 'json.erb'
  variables :json => node['guardian']['router']
  owner node['guardian']['user']
  group node['guardian']['group']
  mode '0600'
  backup false

  # notifies :restart, 'service[guardian]'
end

## Service
template '/etc/init/guardian-router.conf' do
  source 'upstart.erb'
  variables :bin_path => 'bin/router'
  backup false
end

service 'guardian-router' do
  supports :restart => true, :status => true
  action node['guardian']['service']['action']
  provider Chef::Provider::Service::Upstart
end
