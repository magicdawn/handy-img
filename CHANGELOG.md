# CHANGELOG

## v0.4.2 2023-03-14

- feat: make log a bit nicer. (log-symbols, progress)
- feat: modify default concurrency, add tip for UV_THREADPOOL_SIZE

## v0.4.1 2023-03-13

- feat: ignore libvips warning, sharp fails when libvips error
- feat: use copy original when compressed size > original size

## v0.4.0 2023-03-09

- feat: add `_:codec_q:quality` to dir suffix, different args won't overwrite.
- feat: add `$PF` PathFinder support. only in macOS
- feat: sort file like finder, uses `@magicdawn/finder-sort` for `--dir` & `--files`

## v0.3.4 2022-09-26

- fix: fix dir mode filename mistake & change default quality to 80
- chore: add -c,--concurrency & duration report

## v0.3.3 2022-07-24

- tidy api export, export `SharpInput` type

## v0.3.2 2022-06-17

- add `-q` alias to `--quality`
- print mapped files count & list in compress command

## v0.3.1 2022-06-17

- upgrade node-mozjpeg@v1.0.1
- support ser `--quality` with `--codec mozjpeg`

## v0.3.0 2022-06-06

- use clipanion
- use magicdawn/x-args for glob input & output pattern

## v0.2.0 2020-11-16

- node-mozjpeg@0.4.0, sharp ensureAlpha

## v0.1.0 2020-10-24

- TypeScript
- use `node-mozjpeg` native addon

## v0.0.2 2020-10-21

- fix missing deps

## v0.0.1 2020-05-17

- first release
