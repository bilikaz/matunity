to setup initialy:

    composer install
    npm install
    npm install -g flow
    npm install -g babel-cli
    --- openssh key generation..
    npm run build


to setup database:

    vendor/bin/phinx migrate
    vendor/bin/phinx seed:run


cli tasks

    php app/cli.php App\\Block\\Task\\Monitor scan   --return amount of events
    php app/cli.php App\\Block\\Task\\Monitor process    --returns amount of unprocessed events


cron tab registration and start

    we use www-data user that has id 33 for cron service
    ln -s /var/www/matunity-api/cron/matunity-api-cron.service /etc/systemd/system/matunity-api-cron.service
    systemctl enable matunity-api-cron
    systemctl start matunity-api-cron


cron tab execution manualy

    DEBUG=errors,logs node cron/lib/index.js
