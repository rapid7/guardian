require 'openssl'
default['guardian']['config']['provider']['issuer']                 = 'http://localhost'
default['guardian']['config']['provider']['path']                   = '/login/callback'
default['guardian']['config']['provider']['entryPoint']             = '/'
default['guardian']['config']['provider']['identifierFormat']       = 'urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress'
default['guardian']['config']['service']['domain']                  = 'localhost'
default['guardian']['config']['service']['socket']                  = './guardian.sock'
default['guardian']['config']['service']['listen']                  = 'socket'
default['guardian']['config']['session']['name']                    = 'guardian.session'
default['guardian']['config']['session']['expire']                  = 3600
set_unless['guardian']['config']['session']['secret']               = ::OpenSSL::Random.random_bytes(2048).gsub(/\W/, '')
default['guardian']['config']['session']['cookie']['secure']        = true
set_unless['guardian']['config']['session']['cookie']['secret']     = ::OpenSSL::Random.random_bytes(2048).gsub(/\W/, '')
default['guardian']['config']['session']['cookie']['httpOnly']      = true
