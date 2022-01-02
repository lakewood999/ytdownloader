name "ytdownloader_app"
default_version "1.0.0"

dependency "python3"
dependency "pipenv"

source path: File.expand_path("../ytdownloader",Omnibus::Config.project_root)

build do
    env = {}
    env["PIPENV_VENV_IN_PROJECT"] = "1"
    env["DIR"] = File.expand_path("../ytdownloader",Omnibus::Config.project_root)
    mkdir "#{install_dir}/embedded/bin/ytdownloader"
    #mkdir "#{install_dir}/embedded/bin/ytdownloader/.venv"
    copy "Pipfile", "#{install_dir}/embedded/bin/ytdownloader"
    copy "Pipfile.lock", "#{install_dir}/embedded/bin/ytdownloader"
    copy "main.py", "#{install_dir}/embedded/bin/ytdownloader"
    copy "tasks.py", "#{install_dir}/embedded/bin/ytdownloader"
    copy "static", "#{install_dir}/embedded/bin/ytdownloader"
    copy "templates", "#{install_dir}/embedded/bin/ytdownloader"
    command "#{install_dir}/embedded/bin/pipenv install", env: env
    copy ".venv", "#{install_dir}/embedded/bin/ytdownloader/.venv"
end