// Deal with IndexedDB. Courtesy of ChatGPT

class DB {
    constructor(db_name, version, handler) {
        this.last_key = null;
        db_openDatabase(db_name, version, function (db) {
            // db_createObjectStore(db, 'assets', { keyPath: 'id', autoIncrement: true });
            db_createObjectStore(db, 'assets');
        }).then(function (db) {
            this.db = db;
            if (handler) handler(this);
        }.bind(this)).catch(function (error) {
            console.error('Error opening database:', error);
        });;
    }

    write(table, data, handler) {
        db_addData(this.db, table, data).then(function (key) {
            this.last_key = key;
            if (handler) handler(key);
        }.bind(this)).catch(function (error) {
            console.error('Error adding data:', error);
        });
    }

    write_with_key(table, key, data, handler) {
        db_setDataWithCustomKey(this.db, table, key, data).then(function () {
            this.last_key = key;
            if (handler) handler(key);
        }.bind(this)).catch(function (error) {
            console.error('Error adding data:', error);
        });
    }

    read(table, key, handler) {
        getData(this.db, table, key).then(function (data) {
            if (handler) handler(data);
        }).catch(function (error) {
            console.error('Error retrieving data:', error);
        });
    }

    delete(table, key, handler) {
        db_deleteData(this.db, table, key).then(function () {
            if (handler) handler();
        }).catch(function (error) {
            console.error('Error deleting data:', error);
        });
    }
}

function db_openDatabase(databaseName, version, upgradeCallback) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, version);

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            upgradeCallback(db);
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            resolve(db);
        };

        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
}

function db_createObjectStore(db, storeName, options = {}) {
    const { keyPath, autoIncrement } = options;

    if (!db.objectStoreNames.contains(storeName)) {
        const objectStore = db.createObjectStore(storeName, { keyPath, autoIncrement });
        return objectStore;
    }
}
function db_addData(db, storeName, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.add(data);

        request.onsuccess = function (event) {
            resolve(event.target.result);
        };

        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
}
function db_setDataWithCustomKey(db, storeName, key, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.put(data, key);

        request.onsuccess = function (event) {
            resolve();
        };

        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
}
function db_getData(db, storeName, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const objectStore = transaction.objectStore(storeName);
        const request = key === undefined ? objectStore.getAll() : objectStore.get(key);

        request.onsuccess = function (event) {
            const data = event.target.result;
            resolve(data);
        };

        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
}
function db_deleteData(db, storeName, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.delete(key);

        request.onsuccess = function () {
            resolve();
        };

        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
}