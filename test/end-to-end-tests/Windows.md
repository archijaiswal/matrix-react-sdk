# Running the end-to-end tests on Windows

Windows is not the best platform to run the tests on, but if you have to, enable Windows Subsystem for Linux (WSL)
and start following these steps to get going:

1. Navigate to your working directory (`cd /mnt/c/users/travisr/whatever/matrix-react-sdk` for example).
2. Run `sudo apt-get install unzip python3 virtualenv dos2unix`
3. Run `dos2unix ./test/end-to-end-tests/*.sh ./test/end-to-end-tests/synapse/*.sh ./test/end-to-end-tests/element/*.sh`
4. Install NodeJS for ubuntu:
   ```bash
   curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get update
   sudo apt-get install nodejs
   ```
5. Run `yarn link` and `yarn install` for all layers from WSL if you haven't already. If you want to switch back to
   your Windows host after your tests then you'll need to re-run `yarn install` (and possibly `yarn link`) there too.
   Though, do note that you can access `http://localhost:8080` in your Windows-based browser when running webpack in
   the WSL environment (it does *not* work the other way around, annoyingly).
6. In WSL, run `yarn start` at the element-web layer to get things going.
7. While that builds... Run:
   ```bash
   sudo apt-get install x11-apps
   wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
   sudo dpkg -i google-chrome-stable_current_amd64.deb
   sudo apt -f install
   ```
8. Get the IP of your host machine out of WSL: `cat /etc/resolv.conf` - use the nameserver IP.
9. Run:
   ```bash
   cd ./test/end-to-end-tests
   ./synapse/install.sh
   ./install.sh
   ./run.sh --app-url http://localhost:8080 --log-directory ./logs
   ```

Note that using `yarn test:e2e` probably won't work for you. You might also have to use the config.json from the
`element/config-template` directory in order to actually succeed at the tests.

Also note that you'll have to use `--no-sandbox` otherwise Chrome will complain that there's no sandbox available. You
could probably fix this with enough effort, or you could run a headless Chrome in the WSL container without a sandbox.


Reference material that isn't fully represented in the steps above (but snippets have been borrowed):
* https://virtualizationreview.com/articles/2017/02/08/graphical-programs-on-windows-subsystem-on-linux.aspx
* https://gist.github.com/drexler/d70ab957f964dbef1153d46bd853c775
* https://docs.microsoft.com/en-us/windows/wsl/networking#accessing-windows-networking-apps-from-linux-host-ip
