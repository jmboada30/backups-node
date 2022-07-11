import child_process from 'child_process';
import util from 'util';
import cron from 'node-cron';
import 'dotenv/config';

console.log('Starting backup...');
console.log('running a task every minute');

const exec = util.promisify(child_process.exec);
const CONTAINER_NAME = process.env.CONTAINER_NAME;
const USERNAME = process.env.DB_USERNAME;
const PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

cron.schedule('*/1 * * * *', () => {
  backupDockerMariaDB();
});

async function backupDockerMariaDB() {
  const DATE = getDate();
  const { pathname: ARCHIVE_PATH } = new URL(
    `backups/${DB_NAME}-${DATE}.sql.gz`,
    import.meta.url
  );

  const command = `docker exec ${CONTAINER_NAME} mysqldump -u ${USERNAME} -p${PASSWORD} --events --routines --triggers ${DB_NAME} | gzip -c > ${ARCHIVE_PATH}`;

  const { stderr } = await exec(command);

  if (stderr) return console.error('stderr:', Buffer.from(stderr).toString());

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
