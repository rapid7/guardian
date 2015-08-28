source 'https://rubygems.org'
ruby '2.1.5'

# gem 'berkshelf', '~> 3.3'
gem 'thor-scmversion', '1.7.0'

gem 'berkshelf', :github => 'berkshelf/berkshelf',
                 :ref => '8155dedbf55fa12d4bf0e8cd36dde5e4d060da1d'


# gem install bundler -v 1.7.15
gem 'vagrant', :github => 'mitchellh/vagrant',
               :tag => 'v1.7.4',
               :group => :development

group :development, :plugins do
  gem 'vagrant-aws'
  gem 'vagrant-berkshelf'
  gem 'vagrant-omnibus'
  gem 'vagrant-secret'
end
