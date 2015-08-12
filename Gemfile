source 'https://rubygems.org'
ruby '2.1.5'

# gem install bundler -v 1.7.15
gem 'builderator', :github => 'rapid7/builderator',
                   :tag => '0.3.9'

gem 'vagrant', :github => 'mitchellh/vagrant',
               :tag => 'v1.7.4',
               :group => :development

group :development, :plugins do
  gem 'vagrant-aws'
  gem 'vagrant-omnibus'
  gem 'vagrant-secret'
end
