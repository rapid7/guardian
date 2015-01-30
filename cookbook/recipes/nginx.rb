#
# Cookbook Name:: guardian
# Recipe:: nginx
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
package 'nginx'
package 'haveged'

link '/etc/nginx/sites-enabled/default' do
  action :delete
  notifies :restart, 'service[nginx]'
end

## Snakeoil SSL
directory '/etc/nginx/certs' do
  mode '0700'
end

ruby_block "generate-guardian-key" do
  block do
    resources('file[guardian-key]').content(%x(openssl genrsa 4096 2>/dev/null))
  end
end
file 'guardian-key' do
  path node['guardian']['ssl_key']
  mode '0400'
  action :create_if_missing
end

ruby_block "generate-guardian-cert" do
  block do
    resources('file[guardian-cert]').content(%x(openssl req -new\
      -key #{ node['guardian']['ssl_key'] } -days 365 -nodes -x509\
      -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=www.example.com" 2>/dev/null))
  end
end
file 'guardian-cert' do
  path node['guardian']['ssl_cert']
  action :create_if_missing
end

template '/etc/nginx/nginx.conf' do
  source 'nginx.erb'
  notifies :restart, 'service[nginx]'
end

template '/etc/nginx/sites-available/guardian-ssl' do
  source 'guardian-ssl.nginx.erb'
  notifies :restart, 'service[nginx]'
end
link '/etc/nginx/sites-enabled/00-guardian-ssl' do
  to '/etc/nginx/sites-available/guardian-ssl'
  notifies :restart, 'service[nginx]'
end

service 'nginx' do
  action [:start, :enable]
end
