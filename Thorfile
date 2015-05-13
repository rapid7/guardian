# encoding: utf-8

require 'bundler'
require 'bundler/setup'
require 'chef_life'

project 'guardian'

cookbook 'cookbook'
artifact :node, 'source', :github => 'rapid7/guardian',
                          :version => IO.read('VERSION')
