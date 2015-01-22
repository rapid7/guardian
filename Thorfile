# encoding: utf-8

require 'bundler'
require 'bundler/setup'
require 'berkshelf/thor'
require 'octokit'
require 'thor/scmversion'
require 'uri'

## A Class Description
class Helpers < Thor
  include Thor::Actions
  namespace 'task'

  desc 'push LOCATION', 'rsync the stuff to the location'
  def push(location)
    run "rsync -az --filter=':- .gitignore' ./ #{ location }"
    run "rsync -az config #{ location }"
  end
end

##
# ALL YOUR MOOSE
##
module Moose
  ##
  # Moose Tasks
  ##
  class Tasks < Thor
    include Thor::Actions
    namespace 'moose'

    desc 'release TYPE [PRERELEASE]', 'Create a GitHub release entity'
    option :token, :type => :string
    option :path, :type => :string, :default => './'
    option 'dry-run', :type => :boolean
    def release(type = nil, prerelease = nil)
      say_status :github, "Using token #{ options[:token] }" if options.include?('token')
      Moose.config(options[:token])

      repo = Octokit::Repository.from_url(remote)
      say_status :repository, "Using GitHub remote #{ repo.slug }"

      invoke :version, *[[type, prerelease], options]
      say_status :release, "Create #{ Moose.version }"

      sleep(10) ## Give GitHub a couple of seconds to process the new tag
      new_release = Octokit.create_release(repo, Moose.version,
                                           :body => Moose.release_notes) unless options['dry-run']

      invoke :package
      say_status :asset, 'Upload source bundle to release'
      Octokit.upload_asset(new_release.url, File.join(options[:path], 'source.tar.gz'),
                           :name => "#{ repo.name }-#{ Moose.version }.tar.gz",
                           :content_type => 'application/x-gzip') unless options['dry-run']

      say_status :asset, 'Upload cookbook bundle to release'
      Octokit.upload_asset(new_release.url, 'cookbooks.tar.gz',
                           :name => "#{ repo.name }-#{ Moose.version }-cookbooks.tar.gz",
                           :content_type => 'application/x-gzip')
      invoke :cleanup
    end

    desc 'remote [NAME]', 'Get the repository remote\'s URL'
    def remote(ref = 'origin')
      remote_url = run "git config --get remote.#{ ref }.url", :capture => true

      case remote_url
      when /^git@/
        capture = /^git@github.com:(.+?)\.git$/.match(remote_url)
        "/#{ capture[1] }"
      else
        URI.parse(remote_url).path
      end
    end

    desc 'version [TYPE] [PRERELEASE]', 'Increment the package version'
    option 'dry-run', :type => :boolean
    def version(type = nil, prerelease = nil)
      ## Push changes and tag next release
      unless type.nil?
        say_status :version, "Bumping #{ type } version"
        run 'git push'
        invoke 'version:bump', type, prerelease, :default => 'patch' unless options['dry-run']
      end

      invoke 'version:current', []
    end

    desc 'package', 'Generate asset packages for upload'
    option :path, :type => :string, :default => './'
    def package(*_)
      invoke :version
      inside 'cookbook' do
        say_status :berks, 'package'
        invoke 'berkshelf:package', ['../cookbooks.tar.gz']
      end

      ## Package source
      files = run('git ls-files', :capture => true).split("\n")
      run "tar -czf #{ File.join(options[:path], 'source.tar.gz') } "\
          "#{ files.join(' ') }"
    end

    desc 'cleanup', 'Remove temporary files'
    option :path, :type => :string, :default => './'
    def cleanup(*_)
      remove_file File.join(options[:path], 'cookbooks.tar.gz')
      remove_file File.join(options[:path], 'source.tar.gz')
    end
  end

  class << self
    def config(token)
      Octokit.configure do |c|
        c.access_token = token
      end
    end

    def version
      IO.read('VERSION') rescue '0.0.1'
    end

    def release_notes
      IO.read('RELEASE_NOTES') rescue "Releasing version #{ version }"
    end
  end
end
