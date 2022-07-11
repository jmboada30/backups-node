const util = require('util');
const exec = util.promisify(require('child_process').exec);
const cron = require('node-cron');
require('dotenv').config();

const path = require('path');

console.log('Starting backup...');

const CONTAINER_NAME = process.env.CONTAINER_NAME;
const USERNAME = process.env.DB_USERNAME;
const PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

cron.schedule('*/1 * * * *', () => {
  console.log('running a task every minute');
  backupDockerMariaDB();
});

async function backupDockerMariaDB() {
  const DATE = getDate();
  const ARCHIVE_PATH = path.join(
    __dirname,
    'backups',
    `${DB_NAME}-${DATE}.sql.gz`
  );

  const command = `docker exec ${CONTAINER_NAME} mysqldump -u ${USERNAME} -p${PASSWORD} --events --routines --triggers ${DB_NAME} | gzip -c > ${ARCHIVE_PATH}`;

  const { stderr } = await exec(command);

  if (stderr) return console.error('stderr:', stderr);

  console.log('Backup created:', ARCHIVE_PATH);
}

function getDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  return `${year}-${month}-${day}_${hour}:${minute}`;
}
