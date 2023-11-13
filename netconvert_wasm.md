## Build
* Prepare
```sh
export SUMO_HOME=/work/sumo/sumo
source "/work/sumo/emsdk/emsdk_env.sh"
```

* xerces-c
```sh
emconfigure ./configure --disable-threads --disable-shared --disable-network --prefix=/work/sumo/emenv
emmake make >& make.log
emmake make install
```

* zlib
```sh
emconfigure ./configure --static --prefix=/work/sumo/emenv
emmake make >& make.log
emmake make install
```

* sumo
python-devがrequiredになってるけど、とりあえず外す。
```diff
-    find_package(Python REQUIRED COMPONENTS Interpreter Development)
+    find_package(Python REQUIRED COMPONENTS Interpreter) # Development)
```

```sh
emcmake cmake -D CHECK_OPTIONAL_LIBS=OFF -D PROJ_LIBRARY= -D FOX_CONFIG= -D MVN_EXECUTABLE= -D FMI=OFF -D NETEDIT=OFF -D ENABLE_PYTHON_BINDINGS=OFF -D ENABLE_JAVA_BINDINGS=OFF -D SWIG_LIBRARY= -D Intl_LIBRARY= -D X11_LIBRARY= -D XercesC_INCLUDE_DIR=/work/sumo/emenv/include -D XercesC_LIBRARY=/work/sumo/emenv/lib/libxerces-c.a -D XercesC_VERSION=3.2.4 -D ZLIB_LIBRARY=/work/sumo/emenv/lib/libz.a -D ZLIB_INCLUDE_DIR=/work/sumo/emenv/include -B build .

cd build
emmake make netconvert>&make.log
```

## 試す
`emcc hello.c -o hello.html`
の出力を参考に、
https://github.com/emscripten-core/emscripten/blob/main/src/shell_minimal.html
の
`{{{ SCRIPT }}}`
を以下に置き換え。
```js
<script async type="text/javascript" src="netconvert.js"></script>
```
