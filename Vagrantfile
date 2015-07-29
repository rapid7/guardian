# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure('2') do |config|
  config.vm.hostname = 'guardian-dev'
  config.vm.box = 'ubuntu-14.04-provisionerless'
  config.vm.box_url = 'https://cloud-images.ubuntu.com/vagrant/trusty/'\
    'current/trusty-server-cloudimg-amd64-vagrant-disk1.box'

  # config.vm.provider :virtualbox do |vb|
    # vb.memory = 2048
  # end

  config.vm.network :forwarded_port, :host => 8443, :guest => 443
  config.vm.network :forwarded_port, :host => 8080, :guest => 8080
  config.vm.network :forwarded_port, :host => 2379, :guest => 2379
  config.vm.synced_folder './', '/home/vagrant/guardian'

  config.omnibus.chef_version = :latest
  config.berkshelf.enabled = true
  config.berkshelf.berksfile_path = './cookbook/Berksfile'

  config.vm.provision :chef_solo do |chef|
    chef.log_level = :info
    chef.json = {
      :vagrant => true,
      :guardian => {
        :user => 'vagrant',
        :group => 'vagrant',
        :home => '/home/vagrant',
        # :service => {
        #   :action => :nothing
        # },
        :config => {
          :proxy => {
            :frontend => {
              :port => 8443
            }
          }
        }
      }
    }

    chef.run_list = [
      # 'recipe[etcd-v2::node]',
      'recipe[guardian::default]',
      # 'recipe[guardian::snakeoil]'
    ]
  end
end
