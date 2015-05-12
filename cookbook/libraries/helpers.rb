##
# Deployment Helpers
##
class Chef::Recipe::Guardian
  class << self
    def version(run_context)
      run_context.cookbook_collection['guardian'].version
    end
  end
end

class Chef
  class Node
    def guardian_artifact_url
      "https://github.com/#{ node['guardian']['repo'] }/releases/download/"\
        "#{ node['guardian']['version'] }/guardian-#{ node['guardian']['version'] }-source.tgz"
    end

    def guardian_artifact_path
      File.join(Chef::Config[:file_cache_path], "guardian-#{ node['guardian']['version'] }.tgz")
    end
  end
end
