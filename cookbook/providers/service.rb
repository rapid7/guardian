#
# Cookbook Name:: guardian
# Provider:: service
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
use_inline_resources

action :reload do
  service "guardian-#{ new_resource.name }" do
    supports :restart => true, :status => true
    action :restart
    provider Chef::Provider::Service::Upstart
    only_if { new_resource.enabled }
  end
end

action :create do
  template "/etc/init/guardian-#{ new_resource.name }.conf" do
    source 'upstart.conf.erb'
    cookbook new_resource.cookbook
    variables :service => new_resource

    ## Restart if the service is enabled
    notifies :restart,
             :service => "guardian-#{ new_resource.name }" if
               new_resource.enabled
  end

  template ::File.join(new_resource.confdir, "#{ new_resource.name }.json") do
    source 'json.erb'
    cookbook new_resource.cookbook
    variables :content => {
      new_resource.name => node['guardian'][new_resource.name]
    }

    ## Restart if the service is enabled
    notifies :restart,
             :service => "guardian-#{ new_resource.name }" if
               new_resource.enabled
  end

  service "guardian-#{ new_resource.name }" do
    supports :restart => true, :status => true
    action new_resource.service_actions
    provider Chef::Provider::Service::Upstart
  end
end
