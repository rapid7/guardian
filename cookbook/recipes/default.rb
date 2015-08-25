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
include_recipe "#{ cookbook_name }::base"
include_recipe "#{ cookbook_name }::database"
include_recipe "#{ cookbook_name }::install"
include_recipe "#{ cookbook_name }::service-session"
include_recipe "#{ cookbook_name }::service-authn"
# include_recipe "#{ cookbook_name }::service-authz"
include_recipe "#{ cookbook_name }::service-router"
if node.platform_version == "12.04"
  include_recipe "redisio::default"
  include_recipe "redisio::enable"
end