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
