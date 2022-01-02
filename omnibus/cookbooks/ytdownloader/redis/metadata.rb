name 'redis'
maintainer 'stevensu.dev'
maintainer_email 'lakewood999@gmail.com'
license 'Apache-2.0'
description 'Installs/Configures redis instance for ytdownloader'
long_description 'Installs/Configures redis instance for ytdownloader'
version '0.1.0'
chef_version '>= 12.1' if respond_to?(:chef_version)

depends 'runit'