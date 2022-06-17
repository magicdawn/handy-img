# cli

just type `himg` or `handy-img`

```txt
$ himg
himg <命令>

命令：
  himg compress <file>  compress file                               [aliases: c]
  himg info <file>      show info for file                          [aliases: i]

选项：
  --version  显示版本号                                                   [布尔]
  --help     显示帮助信息                                                 [布尔]

缺少 non-option 参数：传入了 0 个, 至少需要 1 个
```

## `compress`

### Examples

```sh
# compress all jpeg file to a directory `compressed` and keep the original name
# use mozjpeg, quality = 80
himg c -f './*.jpg' -o 'compressed/:name.:ext' --codec mozjpeg -q 80

# or without `--codec mozjpeg`, this will use sharp to compress img to webp
himg c -f './*.jpg' -o 'compressed/:name.:ext' -q 80
```

### flags

- `-f/--files` input glob
- `-o/--output` output filename template
- `-t` show available tokens that can be used in `-o`
- `-q/--quality` quality, default to `80`, will pass to `node-mozjpeg.encode({quality})` or `sharp.webp({quality})`
