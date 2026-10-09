#!/bin/sh
# Lance les tests d'ElectroPlan (captures d'écran dans tests/out/). Usage : sh tests/run.sh [t_types t_search …]
set -e
cd "$(dirname "$0")"
mkdir -p out
cd out
T="$*"
[ -z "$T" ] && T="t_types t_search t_shop t_quiz t_web t_ui_parts t_ui_all t_mobile t_ui_shop t_live t_live2"
for t in $T; do echo "== $t"; node "../$t.js" 2>&1 | tail -6; done
