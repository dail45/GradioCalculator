async function openDatabase() {
  return new Promise((resolve, reject) => {
    let request = indexedDB.open('historyDB', 1);

    request.onerror = function(event) {
      console.error("Ошибка при открытии базы данных", event.target.error);
      reject(event.target.error);
    };

    request.onupgradeneeded = function(event) {
      let db = event.target.result;
      let objectStore = db.createObjectStore("history", { keyPath: "id", autoIncrement: true });
      objectStore.createIndex("input", "input", { unique: false });
      objectStore.createIndex("output", "output", { unique: false });
    };

    request.onsuccess = function(event) {
      let db = event.target.result;
      resolve(db);
    };
  });
}

async function addHistory(input, output) {
  try {
    let db = await openDatabase();
    let transaction = db.transaction(["history"], "readwrite");
    let objectStore = transaction.objectStore("history");
    let request = objectStore.add({ input: input, output: output });

    await new Promise((resolve, reject) => {
      request.onsuccess = function(event) {
        console.log("История успешно добавлена");
        resolve();
      };

      request.onerror = function(event) {
        console.error("Ошибка при добавлении истории", event.target.error);
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error("Ошибка при добавлении истории", error);
    throw error;
  }
}

async function getAllHistory() {
  try {
    let db = await openDatabase();
    let transaction = db.transaction(["history"], "readonly");
    let objectStore = transaction.objectStore("history");
    let request = objectStore.getAll();

    let history = await new Promise((resolve, reject) => {
      request.onsuccess = function(event) {
        let history = event.target.result;
        console.log("Вся история:", history);
        resolve(history);
      };

      request.onerror = function(event) {
        console.error("Ошибка при получении истории", event.target.error);
        reject(event.target.error);
      };
    });

    return [history];
  } catch (error) {
    console.error("Ошибка при получении истории", error);
    throw error;
  }
}

async function clearHistory() {
  try {
    let db = await openDatabase();
    let transaction = db.transaction(["history"], "readwrite");
    let objectStore = transaction.objectStore("history");
    let request = objectStore.clear();

    await new Promise((resolve, reject) => {
      request.onsuccess = function(event) {
        console.log("История успешно очищена");
        resolve();
      };

      request.onerror = function(event) {
        console.error("Ошибка при очистке истории", event.target.error);
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error("Ошибка при очистке истории", error);
    throw error;
  }
}
