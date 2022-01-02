name "python3"
default_version "3.8.10"

license "Python-3.0"
license_file "LICENSE"
skip_transitive_dependency_licensing true

# Dependencies for python3 
dependency "ncurses"
dependency "zlib"
dependency "openssl"
dependency "bzip2"
dependency "liblzma"
dependency "libffi"
dependency "libuuid"

version("3.8.10") { source sha256: "b37ac74d2cbad2590e7cd0dd2b3826c29afe89a734090a87bf8c03c45066cb65" }

source url: "https://www.python.org/ftp/python/#{version}/Python-#{version}.tgz"

relative_path "Python-#{version}"

build do
    env = with_standard_compiler_flags(with_embedded_path)

    command "./configure" \
            " --prefix=#{install_dir}/embedded" \
            " --enable-shared" \
            " --with-dbmliborder=", env: env
    
    make "-j #{workers}", env: env
    make "install", env:env

    # Below is copied from omnibus-software

    # There exists no configure flag to tell Python to not compile readline
    delete "#{install_dir}/embedded/lib/python3.8/lib-dynload/readline.*"

    # Ditto for sqlite3
    delete "#{install_dir}/embedded/lib/python3.8/lib-dynload/_sqlite3.*"
    delete "#{install_dir}/embedded/lib/python3.8/sqlite3/"

    # Remove unused extension which is known to make healthchecks fail on CentOS 6
    delete "#{install_dir}/embedded/lib/python3.8/lib-dynload/_bsddb.*"

    # Remove sqlite3 libraries, if you want to include sqlite, create a new def
    # in your software project and build it explicitly. This removes the adapter
    # library from python, which links incorrectly to a system library. Adding
    # your own sqlite definition will fix this.
    delete "#{install_dir}/embedded/lib/python3.8/lib-dynload/_sqlite3.*"
end
