source 'https://rubygems.org'
ruby '2.1.5'

# gem install bundler -v 1.7.15
gem 'builderator'

gem 'vagrant', :github => 'mitchellh/vagrant',
               :tag => 'v1.7.4',
               :group => :development

## TODO Remove when berkshelf and celluloid stop being broken
gem 'berkshelf', :github => 'berkshelf/berkshelf',
                 :ref => '8155dedbf55fa12d4bf0e8cd36dde5e4d060da1d'


group :development, :plugins do
  gem 'vagrant-omnibus'
end
