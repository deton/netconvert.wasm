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
  console.timeEnd('netconvert');
  print('Downloading output.net.xml.gz ...');
  const file = new File([ev.data], 'output.net.xml.gz');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(a.href);
};

const fileInput = document.querySelector('[type=file]');
const optionsInput = document.querySelector('[name=options]');
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

fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  const inputFileName = `/work/${file.name}`;
  const outputFileName = 'output.net.xml.gz';
  const options = [
    '--osm', inputFileName,
    '-o', outputFileName,
    '--xml-validation', 'never', // suppress warning bacause of no data/xsd/*
    ...optionsInput.value.split(' ')
  ];
  pre.textContent = `netconvert ${options.join(' ')}`;
  outputTextarea.value = '';
  console.time('netconvert');
  worker.postMessage([options, file, outputFileName]);
  fileInput.value = '';
});

