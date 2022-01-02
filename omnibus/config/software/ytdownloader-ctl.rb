name "ytdownloader-ctl"
default_version "1.0.0"

license :project_license

#dependency "chef-gem"
dependency "omnibus-ctl"
dependency "runit"

source path: "cookbooks/ytdownloader"

build do 
    env = with_standard_compiler_flags(with_embedded_path)

    bundle "config set --local without test", env: env
    bundle "install --binstubs", env: env

    block do
        erb source: "ytdownloader-ctl.erb",
            dest: "#{install_dir}/bin/ytdownloader-ctl",
            mode: 0755,
            vars: {
                embedded_bin: "#{install_dir}/embedded/bin",
                embedded_service: "#{install_dir}/embedded/service",
            }
    end

    sync "#{project_dir}/files/default/ctl-commands", "#{install_dir}/embedded/service/omnibus-ctl/"
end