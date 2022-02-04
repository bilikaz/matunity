const cron = require('node-cron')
const { exec } = require('child_process')
const errors = require('debug')('errors')
const logs = require('debug')('logs')


cron.schedule('* * * * *', () => {
    exec('php app/cli.php App\\\\Block\\\\Task\\\\Monitor scan', (error, stdout, stderr) => {
        if (error) {
            errors('error', error)
            return
        }
        if (stderr) {
            errors('stderr', stderr)
            return
        }
        logs('php app/cli.php App\\\\Block\\\\Task\\\\Monitor scan', stdout)
    })
})

cron.schedule('*/10 * * * * *', () => {
    exec('php app/cli.php App\\\\Block\\\\Task\\\\Monitor process', (error, stdout, stderr) => {
        if (error) {
            errors('error', error)
            return
        }
        if (stderr) {
            errors('stderr', stderr)
            return
        }
        logs('php app/cli.php App\\\\Block\\\\Task\\\\Monitor process', stdout)
    })
})

