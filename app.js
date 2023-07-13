import child_process from 'child_process';
import util from 'util';
import cron from 'node-cron';
import 'dotenv/config';

console.log('Starting backup...');

const exec = util.promisify(child_process.exec);
const CONTAINER_NAME = process.env.CONTAINER_NAME || '';
const USERNAME = process.env.DB_USERNAME;
const PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

cron.schedule(process.env.CRON_TIME, () => {
  removeBackupOlds();
  backupDockerMariaDB();
});

async function backupDockerMariaDB() {
  const DATE = getDate();
  const { pathname: ARCHIVE_PATH } = new URL(
    `backups/${DB_NAME}-${DATE}.sql.gz`,
    import.meta.url
  );

  let command;

  if (!CONTAINER_NAME) command = `mysqldump -u ${USERNAME} -p${PASSWORD} --events --routines --triggers ${DB_NAME} | gzip -c > ${ARCHIVE_PATH}`;
  else  command = `sudo docker exec ${CONTAINER_NAME} mysqldump -u ${USERNAME} -p${PASSWORD} --events --routines --triggers ${DB_NAME} | gzip -c > ${ARCHIVE_PATH}`;

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

async function removeBackupOlds() {

  // Find permite buscar archivos en un directorio
  // -type f indica que solo busque archivos
  // -mtime +2 indica que busque archivos que hayan sido accedidos hace dos dias
  const command = `find ./backups/* -type f -mtime +2 -delete`;

  const { stderr } = await exec(command);

  if (stderr) return console.error('stderr:', Buffer.from(stderr).toString());

  console.log('Fueron eliminados los archivos antiguos');
}
