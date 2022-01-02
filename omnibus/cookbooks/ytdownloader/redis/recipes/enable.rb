runit_service "redis" do
    options({
        log_directory: node['ytdownloader']['redis']['log_directory']
    }).merge(params)
end