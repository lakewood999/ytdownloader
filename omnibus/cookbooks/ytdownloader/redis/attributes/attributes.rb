####
# Redis
####
default['redis']['enable'] = true
default['redis']['dir'] = '/var/opt/gitlab/redis'
default['redis']['log_directory'] = '/var/log/gitlab/redis'
default['redis']['username'] = 'root'
default['redis;']['group'] = 'root'