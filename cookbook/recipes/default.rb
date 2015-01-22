#
# Cookbook Name:: guardian
# Recipe:: default
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

include_recipe 'guardian::nodejs'
include_recipe 'runit::default'

user node['guardian']['user'] do
  system true
  home node['guardian']['home']
  supports :manage_home => true
end


# Use working copy when running from test-kitchen.
if node.attribute?('test_kitchen')
 node.set['guardian']['path'] = node['test_kitchen']
  nodejs_npm 'guardian' do
    path node['test_kitchen']
    json true
  end
else
  ## WTF is this? Watch https://www.youtube.com/watch?v=Dq_vGxd-jps
  asset = github_asset "guardian-#{ node['status_alert']['version'] }.tar.gz" do
    repo 'rapid7/guardian'
    release node['github']['version']
    github_token node['guardian']['github']['token']
  end

  libarchive_file 'guardian-source.tar.gz' do
    path asset.asset_path
    extract_to node['guardian']['path']

    notifies :install, 'nodejs_npm[guardian]'
  end

  nodejs_npm 'guardian' do
    path node['guardian']['path']
    json true
    action :nothing
  end
end

directory ::File.join(node['guardian']['path'], 'config') do
  owner node['guardian']['user']
  mode 0600
end

template ::File.join(node['guardian']['path'], 'config', 'site.json') do
  source 'site.json.erb'
  owner node['guardian']['user']
  group node['guardian']['user']
  mode 0600
  variables :config => node['guardian']['config'].to_json
end

runit_service 'guardian' do
  default_logger true
  options({
    :user => node['guardian']['user'],
    :bindir => ::File.join(node['guardian']['path'], 'bin')

  })
  action [:enable, :start]
end
