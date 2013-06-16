= nf =

If you've used perl oneliners before you're expecting when you pass `-pe` to
node that you'll evaluate the script once per input line


```
$ echo -e "foo\nbar" | perl -pe '"baz"'
foo
bar
```

However if you try it:

```
$ echo -e "foo\nbar" | node -pe '"baz"'
baz
```

`nf` is a small package that lets you perform arbitrary javascript/node actions
once per input line:

```
$ npm install -g nf
$ echo -e "foo\nbar" | nf -pe '"baz"'
baz
baz
```

Valid command line arguments:

 * `-e` -- evaluate the given script (TODO assume inline for now, still need to
support script files)
 * `-n` -- evaluate the given script once per input line, the current line is
available in the global `__line`
 * `-p` -- evaluate the given script once per input line with an implicit print
of the return value (implies `-n`)

Here's a small example interpreting the current line

```
$ echo -e "foo\nbaz\nfoobar" | nf -pe '__line.replace(/foo/, "bar")'
bar
baz
barbar
```
