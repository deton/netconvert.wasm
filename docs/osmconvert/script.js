const worker = new Worker('worker.js', {type: 'module'});

worker.onerror = e => {
  console.error(e);
  print(e.message);
};

worker.onmessage = ev => {
  if (typeof ev.data == 'string') {
    print(ev.data);
    return;
  }
  console.timeEnd('osmconvert');
  if (ev.data === undefined) {
    return;
  }
  print(`Downloading ${outputFileName} ...`);
  const file = new File([ev.data], outputFileName);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(a.href);
};

const fileInput = document.querySelector('[type=file]');
const optionsInput = document.querySelector('[name=options]');
const outfnameInput = document.querySelector('[name=outfname]');
const pre = document.querySelector('pre');
const outputTextarea = document.getElementById('output');
outputTextarea.value = ''; // clear browser cache

function print(text) {
  if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
  // These replacements are necessary if you render to raw HTML
  //text = text.replace(/&/g, "&amp;");
  //text = text.replace(/</g, "&lt;");
  //text = text.replace(/>/g, "&gt;");
  //text = text.replace('\n', '<br>', 'g');
  //console.log(text);
  outputTextarea.value += text + "\n";
  outputTextarea.scrollTop = outputTextarea.scrollHeight; // focus on bottom
}

var outputFileName = "output.osm";
fileInput.addEventListener('change', async () => {
  const files = Array.from(fileInput.files);
  const inputFileNames = files.map(f => `/work/${f.name}`); // mount on /work
  outputFileName = outfnameInput.value.split('/').at(-1);
  let options = [
    ...inputFileNames,
    `-o=${outputFileName}`,
  ];
  if (optionsInput.value) {
    options = options.concat(optionsInput.value.split(' '));
  }
  console.log('options', options);
  pre.textContent = `osmconvert ${options.join(' ')}`;
  outputTextarea.value = `osmconvert ${options.join(' ')}\n`;
  console.time('osmconvert');
  worker.postMessage([options, files, outputFileName]);
  fileInput.value = '';
});

