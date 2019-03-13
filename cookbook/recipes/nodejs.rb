#
# Cookbook Name:: guardian
# Recipe:: nodejs
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

apt_repository 'node_0.12' do
  uri 'https://deb.nodesource.com/node_0.12'
  distribution 'xenial' #node['lsb']['codename']
  components %w(main)
  key 'https://deb.nodesource.com/gpgkey/nodesource.gpg.key'
end

package 'build-essential'
package 'nodejs' do
  version '0.12.18-1nodesource1~xenial1'
end
package 'uuid-dev'
