##
# Deployment Helpers
##
class Chef::Recipe
  def cookbook_version
    run_context.cookbook_collection[cookbook_name].version
  end
end

module Guardian
  module Helpers
    class << self
      def github_uri(repo)
        "https://github.com/#{ repo }.git"
      end

      def guardian_artifact_url
        "https://github.com/#{ node['guardian']['repo'] }/releases/download/"\
          "#{ node['guardian']['version'] }/guardian-#{ node['guardian']['version'] }-source.tgz"
      end

      def guardian_artifact_path
        File.join(Chef::Config[:file_cache_path], "guardian-#{ node['guardian']['version'] }.tgz")
      end
    end
  end
end

module MysqlCookbook
  class MysqlServiceManagerSystemd

    def configure_apparmor
    end

  end
end
