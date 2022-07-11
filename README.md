
# TEORIA: Para respaldo usando Docker y MariaDB/MySQL

## Ya debe estar ejecutando el contenedor de Docker

## Para respaldar BD comprimida

```sh
docker exec [mysql_container_name] /usr/bin/mysqldump -u [mysql_username] --password=[mysql_password] --events --routines --triggers [database_name] | gzip -c > [destination_path/backup_name].sql.gz
```
Nota: Otras opciones que puedo agregar al comando son
 - --opt: Opciones por defecto generalmente ya viene por default.
 - --add-drop-table: Añade la sentencia 'DROP TABLE' antes de cada sentencia 'CREATE TABLE'.
 - --events: Incluye los eventos.
 - --routines: Incluye en el respaldo rutinas almacenadas (procedimientos y funciones).
 - --triggers: Incluye triggers creados en el respaldo. 
 - --ignore-table=$DATABASE.table: Si no se desea respaldar una tabla en específico. 
 - --default-character-set=utf8: Establecer Encoding por defecto.


---


## Para restaurar BD comprimida

```sh
# Borrar la BD 
mysql -f -u [mysql_username] --password=[mysql_password] -e "DROP DATABASE IF EXISTS [database_name]" ; 

# Crear la BD
mysql -u [mysql_username] --password=[mysql_password] -e "CREATE DATABASE [database_name] CHARACTER SET utf8 COLLATE utf8_general_ci" && 

# Restaurar BD
gunzip -c [source_path/backup_name].sql.gz | mysql -u [mysql_username] --password=[mysql_password] [database_name]
```

Nota: Los comandos anteriores pueden ejecutarse juntos pero usando `;` y `&&` y quitando los comentarios

- `;` permite unir dos instrucciones una despues de otra sin importar si la primera fallo
- `&&` permite unir dos comando siempre y cuando el primero fue exitoso