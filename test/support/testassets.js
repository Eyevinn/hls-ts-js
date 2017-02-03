function loadAsset(file) {
  return new Promise((resolve, reject) => {
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(event) {
      const xhr = event.currentTarget;
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status == 200) {
          data = xhr.response;
          const view = new Uint8Array(data);
          resolve(view);
        } else {
          reject("Unable to load fixture: " + file)
        }
      }
    };
    const url = "http://localhost:9876/base/test/support/testassets/" + file;
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.send();
  });
}

const TestAssets = function constructor() {
  this.assets = [];
};

TestAssets.prototype.init = function() {
  return new Promise((resolve, reject) => {
    loadAsset("seg-10s.ts").then((data) => {
      this.assets.push({ name: "seg-10s", data: data });
      resolve();
    }).catch((err) => {
      console.error(err);
      reject(err);
    })
  });
};

TestAssets.prototype.getAssetByName = function(name) {
  return this.assets.find((n) => {
    return n.name === name;
  });
};

module.exports = TestAssets;