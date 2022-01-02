#
# Copyright 2021 Steven Su
#
# All Rights Reserved.
#

name "ytdownloader"
maintainer "Steven Su"
homepage "https://stevensu.dev"

# Defaults to C:/ytdownloader on Windows
# and /opt/ytdownloader on all other platforms
install_dir "#{default_root}/#{name}"

build_version Omnibus::BuildVersion.semver
build_iteration 1

# Creates required build directories
dependency "preparation"

# ytdownloader dependencies/components
dependency "redis"
dependency "python3"
dependency "pipenv"
dependency "ytdownloader_app"
#dependency "ruby"
#dependency "chef-gem"
#dependency "omnibus-ctl"
#dependency "runit"
dependency "ytdownloader-ctl"

exclude "**/.git"
exclude "**/bundler/git"
