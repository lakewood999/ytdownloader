name "pipenv"
default_version "2021.11.23"

license "MIT"
license_file "https://raw.githubusercontent.com/pypa/pipenv/main/LICENSE"
skip_transitive_dependency_licensing true


dependency "python3"

build do 
    command "#{install_dir}/embedded/bin/pip3 install -I --src #{project_dir} --prefix=\"#{install_dir}/embedded\" #{name}==#{version}"
end