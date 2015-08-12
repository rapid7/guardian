#
# Cookbook Name:: guardian
# Resource:: service
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
actions [:create, :reload]
default_action :create

attribute :name, :kind_of => String, :name_attribute => true
attribute :cookbook, :kind_of => [String, Symbol], :default => 'guardian'

def user(arg = nil)
  set_or_return(:user, arg, :kind_of => String, :default => node['guardian']['user'])
end

def group(arg = nil)
  set_or_return(:group, arg, :kind_of => String, :default => node['guardian']['group'])
end

def path(arg = nil)
  set_or_return(:path, arg, :kind_of => String, :default => node['guardian']['path'])
end

def confdir(arg = nil)
  set_or_return(:confdir, arg, :kind_of => String, :default => node['guardian']['conf'])
end

def enabled(arg = nil)
  set_or_return(:enabled, arg, :kind_of => [TrueClass, FalseClass], :default => node['guardian']['enable'])
end

def exec_string
  ::File.join(path, 'bin', "guardian-#{ name }") + ' -c ' + confdir
end

def service_actions
  enabled ? [:start, :enable] : [:stop, :disable]
end
