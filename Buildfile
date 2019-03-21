build_name 'guardian'

autoversion.create_tags false
autoversion.search_tags false

cookbook.depends 'guardian' do |guardian|
  guardian.path './cookbook'
end

profile :default do |default|
  default.chef.run_list ['guardian::nodejs', 'guardian::default']
end