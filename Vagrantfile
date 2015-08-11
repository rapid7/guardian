# -*- mode: ruby -*-
# vi: set ft=ruby :
require 'json'

Vagrant.configure('2') do |config|
  config.vm.hostname = 'guardian-dev'
  config.vm.box = 'ubuntu-14.04-provisionerless'
  config.vm.box_url = 'https://cloud-images.ubuntu.com/vagrant/trusty/'\
    'current/trusty-server-cloudimg-amd64-vagrant-disk1.box'

  config.vm.provider :virtualbox do |vb|
    vb.memory = 2048
  end

  (9001..9004).each do |port|
    config.vm.network :forwarded_port, :host => port, :guest => port
  end

  # config.vm.synced_folder './', '/home/vagrant/guardian'

  config.omnibus.chef_version = :latest
  config.berkshelf.enabled = true
  config.berkshelf.berksfile_path = './cookbook/Berksfile'

  config.vm.provision :chef_solo do |chef|
    chef.log_level = :info
    chef.json = {
      :vagrant => true,
      :guardian => {
        # :user => 'vagrant',
        # :group => 'vagrant',
        # :home => '/home/vagrant',
        #
        # :path => '/home/vagrant/guardian',
        # :conf => '/home/vagrant/guardian/conf',
        # :source => 'local', ## Don't try to fetch source
        :source => 'github-master',
        :enable => true,

        :session => (JSON.parse(IO.read('./conf/_session.json')) rescue {}),
        :authn => (JSON.parse(IO.read('./conf/_authn.json')) rescue {}),
        :authz => (JSON.parse(IO.read('./conf/_authz.json')) rescue {}),
        :router => (JSON.parse(IO.read('./conf/_router.json')) rescue {})
      }
    }

    chef.run_list = [
      'recipe[guardian::default]'
    ]
  end
end
