#
# Cookbook Name:: guardian
# Attributes:: source_local
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

##
# Use the :local source as a NOOP for things like a Vagrant box with a sync'd folder
##
ruby_block 'guardian-source' do
  block do
    Chef::Log.info('Using source `local` to provision Guardian. Please ensure that the'\
      " Guardian source code is already deployed to #{ node['guardian']['path'] }.")

    Chef::Application.fatal!('Unable to find Guardian source at ' +
      node['guardian']['path']) unless ::File.exist?(::File.join(node['guardian']['path'], 'package.json'))
  end
end

execute 'npm-install' do
  command "#{ node['nodejs']['npm'] } install"
  cwd node['guardian']['path']
  user node['guardian']['user']
  group node['guardian']['group']
  environment 'HOME' => node['guardian']['home']
end
