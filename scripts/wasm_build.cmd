echo 'build wasm'

set wasm_var=-I../filter_coefficient_calculations/coef_calc/fir_chebyshev_window/program/c/src/ ^
../src/c/summation.c ^
-s EXPORTED_FUNCTIONS="['_kahan_sum']" ^
-o ../lib/summation.wasm ^
-s FILESYSTEM=0 ^
-s TOTAL_STACK=1048576

rem optimized version
call emcc %wasm_var% -O3