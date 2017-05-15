#
# Cookbook Name:: guardian
# Attributes:: source-github-master
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
package 'git'

##
# Install the Guardian source from the head of `master`
##

git 'guardian-source' do
  repository Guardian::Helpers.github_uri(node['guardian']['repo'])
  revision 'master'
  destination node['guardian']['path']
  depth 1

  user node['guardian']['user']
  group node['guardian']['group']

  notifies :run, 'execute[guardian-npm-install]', :immediately
end

execute 'guardian-npm-install' do
  action :nothing # will be notified when source is changed
  command "#{ node['guardian']['nodejs']['npm'] } install"
  cwd node['guardian']['path']
  user node['guardian']['user']
  group node['guardian']['group']
  environment 'HOME' => node['guardian']['home']
end
