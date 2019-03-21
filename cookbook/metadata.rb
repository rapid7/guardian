name 'guardian'
maintainer 'Rapid7, LLC'
maintainer_email 'engineringservices@rapid7.com'
description 'Installs/Configures guardian'


license 'MIT'
long_description IO.read(File.expand_path('../../README.md', __FILE__)) rescue ''
version '0.3.24'

depends 'apt'
depends 'database', '~> 4.0'
depends 'mysql2_chef_gem', '~> 2.0'
depends 'mysql', '>= 8.2.0'
depends 'redisio', '= 2.3.0'
depends 'logrotate', '~> 1.9.2'

# depends 'libarchive', '>= 0.5.0'

supports 'ubuntu', '>= 16.04'
