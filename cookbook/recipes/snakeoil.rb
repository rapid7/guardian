#
# Cookbook Name:: guardian
# Recipe:: snakeoil
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
file 'guardian-key' do
  path node['guardian']['front_end']['ssl_key']
  content `openssl genrsa 4096 2>/dev/null`
  mode '0400'

  backup false
  action :create_if_missing
end

ruby_block 'generate-snakeoil-cert' do
  block do
    ## Generate certificate after key is converged, but before certificate file
    ## resource is converged
    resources('file[guardian-cert]').content(`openssl req -new\
      -key #{ node['guardian']['front_end']['ssl_key'] } -days 365 -nodes -x509\
      -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=www.example.com" 2>/dev/null`)
  end
end

file 'guardian-cert' do
  path node['guardian']['front_end']['ssl_cert']

  backup false
  action :create
end
