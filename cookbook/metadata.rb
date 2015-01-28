name 'guardian'
maintainer 'Rapid7, LLC'
maintainer_email 'engineringservices@rapid7.com'
description 'Installs/Configures guardian'

license IO.read('../LICENSE') rescue 'All rights reserved'
long_description IO.read('../README.md') rescue ''
version IO.read('../VERSION') rescue '0.0.1'

depends 'apt'
depends 'github', '~> 0.3.0'
depends 'nodejs'
depends 'runit'
