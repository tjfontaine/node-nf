# nf

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

 * `-e` -- evaluate the given script (if not passed assumes last argument is
a javascript file to load)
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

Here is `apache.js` which transforms an apache log line to json:

```javascript
var pattern = /^(\S+)\s+(\S+)\s+(\S+)\s+\[(.+)\]\s+(.+)\s+(.+)\s+(HTTP\/\d+.\d+)\s+"(\d+)"\s+(\S+)\s+"(.*)"\s+"(.*)"\s+"(.*)"$/;

(function(line) {
  var m = line.match(pattern);

  if (!m) return JSON.stringify({});

  var obj = {
    host: m[1],
    a: m[2],
    user: m[3],
    date: m[4],
    method: m[5],
    url: m[6],
    version: m[7],
    statusCode: m[8],
    contentLength: m[9],
    refer: m[10],
    userAgent: m[11],
  };

  return JSON.stringify(obj);
})(__line);
```

then using [jsontool](http://npmjs.org/package/jsontool) you can find the `uniq` userAgents


```
cat access.log | nf -p ./apache.js | json -ga userAgent | sort -r | uniq | head 10
Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:21.0) Gecko/20100101 Firefox/21.0
Mozilla/5.0 (Windows NT 6.1; WOW64; rv:21.0) Gecko/20100101 Firefox/21.0
Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36
Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.64 Safari/537.31
Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.64 Safari/537.31
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_4) AppleWebKit/536.30.1 (KHTML, like Gecko) Version/6.0.5 Safari/536.30.1
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.37 Safari/537.36
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36
Mozilla/4.0 (compatible;)
```

## scripts

Scripts (either in string form or from a file) are not the same thing as a node
module; most but not all the globals you expect are there. You can `require` in
your script, but notably `exports` and `module` are missing as their utility
would be suspect.
