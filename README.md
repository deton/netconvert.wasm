# SUMO netconvert WebAssembly
## Demo
https://deton.github.io/netconvert.wasm/index.html

## Build
### Prepare
```sh
export SUMO_HOME=/work/sumo/sumo
source "/work/sumo/emsdk/emsdk_env.sh"
```

### Xerces-C++
```sh
wget https://dlcdn.apache.org//xerces/c/3/sources/xerces-c-3.2.4.tar.xz
tar xf xerces-c-3.2.4.tar.xz
cd xerces-c-3.2.4
emconfigure ./configure --disable-threads --disable-shared --disable-network --prefix=/work/sumo/emenv
emmake make >& make.log
emmake make install
cd ..
```

### zlib
```sh
wget https://www.zlib.net/zlib-1.3.tar.xz
tar xf zlib-1.3.tar.xz
cd zlib-1.3
emconfigure ./configure --static --prefix=/work/sumo/emenv
emmake make >& make.log
emmake make install
cd ..
```

### SQLite3
(PROJが依存)
```sh
wget https://www.sqlite.org/2023/sqlite-autoconf-3440000.tar.gz
tar xf sqlite-autoconf-3440000.tar.gz
cd sqlite-autoconf-3440000
emconfigure ./configure --disable-readline --disable-threadsafe --disable-dynamic-extensions --disable-shared --prefix=/work/sumo/emenv
emmake make >& make.log
emmake make install
cd ..
```

### PROJ
```sh
wget https://download.osgeo.org/proj/proj-9.3.0.tar.gz
tar xf proj-9.3.0.tar.gz
cd proj-9.3.0
mkdir build
cd build
emcmake cmake -DENABLE_TIFF=OFF -DENABLE_CURL=OFF -DSQLITE3_INCLUDE_DIR=/work/sumo/emenv/include -DSQLITE3_LIBRARY=/work/sumo/emenv/lib/libsqlite3.a -DCMAKE_THREAD_LIBS_INIT=OFF -DBUILD_APPS=OFF -DBUILD_SHARED_LIBS=OFF -DBUILD_TESTING=OFF -DCMAKE_INSTALL_PREFIX=/work/sumo/emenv ..
emmake make >& make.log
emmake make install
cd ..
```

### SUMO netconvert
```sh
git clone --recursive --depth 1 https://github.com/eclipse-sumo/sumo
cd sumo
```

python-devがrequiredになってるけど、とりあえずCMakeLists.txtから外す。
```diff
-    find_package(Python REQUIRED COMPONENTS Interpreter Development)
+    find_package(Python REQUIRED COMPONENTS Interpreter) # Development)
```

[スレッド](https://emscripten.org/docs/porting/pthreads.html)を使わないようにCMakeLists.txtを変更。
(サーバ側でCross-Origin-Opener-PolicyとCross-Origin-Embedder-Policyヘッダを
付けないとSharedArrayBuffer is not definedエラーになるので)

```diff
-        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -pthread -Wall -pedantic -Wextra")
+        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -pedantic -Wextra")
```

libproj.aが依存するlibsqlite3.aを追加するため、無理やりIntl_LIBRARIESで指定。

```sh
CXXFLAGS='-sNO_DISABLE_EXCEPTION_CATCHING' emcmake cmake -D CHECK_OPTIONAL_LIBS=OFF -D FOX_CONFIG= -D MVN_EXECUTABLE= -D FMI=OFF -D NETEDIT=OFF -D ENABLE_PYTHON_BINDINGS=OFF -D ENABLE_JAVA_BINDINGS=OFF -D SWIG_LIBRARY= -D Intl_LIBRARY= -D X11_LIBRARY= -D XercesC_INCLUDE_DIR=/work/sumo/emenv/include -D XercesC_LIBRARY=/work/sumo/emenv/lib/libxerces-c.a -D XercesC_VERSION=3.2.4 -D ZLIB_INCLUDE_DIR=/work/sumo/emenv/include -D ZLIB_LIBRARY=/work/sumo/emenv/lib/libz.a -DPROJ_INCLUDE_DIR=/work/sumo/emenv/include -DPROJ_LIBRARY=/work/sumo/emenv/lib/libproj.a -DIntl_LIBRARIES=/work/sumo/emenv/lib/libsqlite3.a -DCMAKE_EXE_LINKER_FLAGS='-sFILESYSTEM=1 -sEXPORTED_RUNTIME_METHODS=FS,callMain -sMODULARIZE=1 -sEXPORT_ES6 -sINVOKE_RUN=0 -sENVIRONMENT=web,node -sALLOW_MEMORY_GROWTH=1 --embed-file /work/sumo/emenv/share/proj@.' -B build .

cd build
emmake make netconvert>&make.log
```

## 参考
* [mkbitmap を WebAssembly にコンパイルする](https://web.dev/articles/compiling-mkbitmap-to-webassembly?hl=ja)
