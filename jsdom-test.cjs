const { JSDOM, VirtualConsole } = require('jsdom');
const virtualConsole = new VirtualConsole();
virtualConsole.on("error", (e) => { console.log("JSDOM ERROR:", e); });
virtualConsole.on("warn", (w) => { console.log("JSDOM WARN:", w); });
virtualConsole.on("info", (i) => { console.log("JSDOM INFO:", i); });
virtualConsole.on("dir", (d) => { console.log("JSDOM DIR:", d); });
virtualConsole.on("log", (l) => { console.log("JSDOM LOG:", l); });

JSDOM.fromURL("http://localhost:3000/", {
  runScripts: "dangerously",
  resources: "usable",
  virtualConsole
}).then(dom => {
  setTimeout(() => {
    console.log("HTML length:", dom.window.document.body.innerHTML.length);
    console.log("HTML:", dom.window.document.body.innerHTML.substring(0, 1000));
  }, 4000);
}).catch(console.error);
