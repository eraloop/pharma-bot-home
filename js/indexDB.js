// 1
const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

if (!indexedDB) {
  console.log("IndexedDB could not be found in this browser.");
}

// checks if theres a database, if not, it creates one with the key medicatio, the number is the db version 
const request = indexedDB.open("medications", 1);

request.onerror = function (event) {
    console.error("An error occurred with IndexedDB");
    console.error(event);
};

request.onupgradeneeded = function () {
    const db = request.result;
    const store = db.createObjectStore("drugs", { keyPath: "id" });
};

request.onsuccess = function () {
    const db = request.result;
    
    // opens a transdaction on the drugs table 
    const transaction = db.transaction("drugs", "readwrite");
    const store = transaction.objectStore("drugs");
    const nameIndex = store.index("name");

    const result = nameIndex.getAll()
  
    result.onsuccess = function () {
      console.log('idQuery', idQuery.result);
    };

    transaction.oncomplete = function () {
      db.close();
    };
};
  
  