#
# Cookbook Name:: guardian
# Attributes:: source-github-release
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
# Install Guardian from a released artifact
##

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
