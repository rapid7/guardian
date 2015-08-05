source 'https://rubygems.org'
ruby '2.2.2'

# gem install bundler -v 1.7.15
gem 'berkshelf'
# gem 'chef_life', :path => '../chef_life' # :github => 'jmanero/chef_life'

gem 'vagrant', :github => 'mitchellh/vagrant',
               :tag => 'v1.7.4',
               :group => :development

group :development, :plugins do
  gem 'vagrant-aws'
  gem 'vagrant-berkshelf'
  gem 'vagrant-omnibus'
  gem 'vagrant-secret'
end
